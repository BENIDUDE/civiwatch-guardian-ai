/**
 * @file BatchDispatch.js
 * @description The Network Dispatch & Reconciliation Engine.
 * Manages the asynchronous export/import workflow with external social networks.
 * Handles strict administrative workflows for first-time takedown requests and secondary appeals.
 * * --- SECURITY ---
 * Features strict client-side parsing (no file hosting) and input sanitization to prevent 
 * CSV Formula Injection and XSS attacks via external network comments.
 * * --- DATA INTEGRITY ---
 * Implements strict platform name normalization to prevent duplicate dropdown entries (e.g. "facebook" vs "Facebook").
 */
import React, { useState, useRef } from 'react';
import { supabase } from '../../supabaseClient';
import Papa from 'papaparse';

const SVGIcons = {
  Send: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>,
  Alert: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>,
  X: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>,
  Download: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>,
  Upload: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>,
  Refresh: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>,
  Activity: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>,
  CheckCircle: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
};

// --- SECURITY SANITIZER ---
const sanitizeInput = (text) => {
  if (!text) return '';
  let clean = text.toString().trim();
  if (/^[=+\-@]/.test(clean)) {
    clean = "'" + clean; 
  }
  return clean.replace(/</g, "&lt;").replace(/>/g, "&gt;");
};

// --- PLATFORM NORMALIZER (Fixes the duplicate dropdown issue) ---
const normalizePlatform = (platform) => {
  if (!platform) return 'Unknown';
  const p = platform.trim().toLowerCase();
  
  if (p === 'facebook') return 'Facebook';
  if (p === 'x' || p === 'twitter' || p === 'twitter/x') return 'Twitter/X';
  if (p === 'tiktok') return 'TikTok';
  if (p === 'instagram') return 'Instagram';
  if (p === 'telegram') return 'Telegram';
  if (p === 'youtube') return 'YouTube';
  if (p === 'linkedin') return 'LinkedIn';
  if (p === 'reddit') return 'Reddit';
  if (p === 'discord') return 'Discord';
  if (p === 'truth social') return 'Truth Social';
  if (p === 'vk') return 'VK';
  
  // Generic fallback: Capitalizes the first letter of each word
  return platform.trim().replace(/\b\w/g, l => l.toUpperCase());
};

// --- STATUS HELPER (Added to support AI states) ---
const getCalculatedStatus = (report) => {
  let calcStatus = report.status || 'Pending';
  const aStatus = report.ai_vote_status || report.reports?.ai_vote_status;
  if (['New', 'Pending', 'In Progress'].includes(calcStatus) && aStatus && ['Changes Requested', 'Manual Review Required', 'AI Verified', 'AI Rejected'].includes(aStatus)) {
    calcStatus = aStatus;
  }
  return calcStatus;
};

const BatchDispatch = ({ reports, isEn, triggerToast, refreshData }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportPlatform, setExportPlatform] = useState('all');
  const [exportType, setExportType] = useState('initial'); 
  
  const [isImporting, setIsImporting] = useState(false);
  const [scanStatus, setScanStatus] = useState('');
  const [importErrors, setImportErrors] = useState([]);
  
  const fileInputRef = useRef(null);

  // Checks for both 'Verified' and 'AI Verified'
  const baseExportList = exportType === 'initial' 
    ? (reports || []).filter(r => ['Verified', 'AI Verified'].includes(getCalculatedStatus(r)) && r._table !== 'assignments')
    : (reports || []).filter(r => getCalculatedStatus(r) === 'Pending Appeal' && r._table !== 'assignments');

  // Filter uses the normalized platform
  const readyForDispatch = exportPlatform === 'all' 
    ? baseExportList 
    : baseExportList.filter(r => normalizePlatform(r.platform).toLowerCase() === exportPlatform.toLowerCase());

  // Aggregate pending items using calculated status and normalized platform
  const pendingNetwork = (reports || []).filter(r => ['Pending Network Action', 'Appeal in Progress'].includes(getCalculatedStatus(r)));
  const pendingByPlatform = pendingNetwork.reduce((acc, r) => {
    const plat = normalizePlatform(r.platform);
    acc[plat] = (acc[plat] || 0) + 1;
    return acc;
  }, {});

  // Aggregate successful takedowns using calculated status and normalized platform
  const recentSuccess = (reports || []).filter(r => ['Takedown Successful', 'Appeal Successful'].includes(getCalculatedStatus(r)));
  const successByPlatform = recentSuccess.reduce((acc, r) => {
    const plat = normalizePlatform(r.platform);
    acc[plat] = (acc[plat] || 0) + 1;
    return acc;
  }, {});

  // Extract unique normalized platforms for the dropdown
  const uniqueReadyPlatforms = [...new Set(baseExportList.map(r => normalizePlatform(r.platform)).filter(Boolean))].sort();

  const handleExport = async () => {
    if (readyForDispatch.length === 0) {
      triggerToast(isEn ? "No reports ready for dispatch." : "אין דיווחים המוכנים לשליחה.", 'error');
      return;
    }

    setIsExporting(true);
    try {
      const exportData = readyForDispatch.map(report => ({
        civiwatch_id: `CWID-${report.id}`,
        dispatch_type: exportType === 'appeals' ? 'APPEAL' : 'INITIAL',
        platform: normalizePlatform(report.platform), // Ensures exported CSV is also clean
        category: report.category,
        url: report.content, 
        evidence_link: report.image_url || report.drive_link || 'None',
        ai_confidence_score: report.ai_confidence ? (report.ai_confidence * 100).toFixed(0) + '%' : 'N/A',
        network_result: '',
        network_comment: ''
      }));

      const csv = Papa.unparse(exportData);
      const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' }); 
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `CiviWatch_Dispatch_${exportPlatform}_${exportType}_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      const reportIds = readyForDispatch.map(r => r.id);
      const newStatus = exportType === 'appeals' ? 'Appeal in Progress' : 'Pending Network Action';
      
      const { error } = await supabase
        .from('reports')
        .update({ status: newStatus })
        .in('id', reportIds);

      if (error) throw error;

      triggerToast(isEn ? `Successfully dispatched ${reportIds.length} reports.` : `נשלחו בהצלחה ${reportIds.length} דיווחים.`, 'success');
      if (refreshData) refreshData();
      setExportPlatform('all');

    } catch (error) {
      console.error("Export Error:", error);
      triggerToast(isEn ? "Export failed." : "הייצוא נכשל.", 'error');
    } finally {
      setIsExporting(false);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsImporting(true);
    setImportErrors([]);

    if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
      setImportErrors([
        isEn 
          ? 'File Format Error: You uploaded an Excel Workbook (.xlsx). Please open the file in Excel, click "File > Save As", select "CSV UTF-8 (Comma delimited) (*.csv)", and upload that new file.' 
          : 'שגיאת פורמט: העלית קובץ אקסל (.xlsx). אנא פתח את הקובץ באקסל, בחר "שמירה בשם", שמור אותו בפורמט "CSV", והעלה את הקובץ החדש.'
      ]);
      resetImportState();
      return;
    }

    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      setImportErrors([isEn ? 'Critical Error: File must be a valid .csv format.' : 'שגיאה קריטית: הקובץ חייב להיות בפורמט .csv תקין.']);
      resetImportState();
      return;
    }

    setScanStatus(isEn ? 'Cleaning file formatting...' : 'מנקה פורמט קובץ...');
    
    const reader = new FileReader();
    reader.onload = async (e) => {
      let csvText = e.target.result;
      
      csvText = csvText.replace(/^[\uFEFF\u200B\u200C\u200D]+/g, '');

      setScanStatus(isEn ? 'Running security scan...' : 'מבצע סריקת אבטחה...');
      
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header) => header.toLowerCase().trim().replace(/[^a-z0-9_]/g, ''),
        complete: async (results) => {
          try {
            const rows = results.data;
            const headers = results.meta.fields || [];
            let errors = [];

            if (!headers.includes('civiwatch_id') || !headers.includes('network_result')) {
              errors.push(isEn 
                ? `Missing columns. Found: [${headers.join(', ')}]. Make sure civiwatch_id and network_result exist.` 
                : `חסרות עמודות. נמצאו: [${headers.join(', ')}]. ודא ש-civiwatch_id ו-network_result קיימות.`);
            }

            if (errors.length > 0) {
              setImportErrors(errors);
              triggerToast(isEn ? "Scan failed. Fix errors and try again." : "הסריקה נכשלה. תקן שגיאות ונסה שוב.", "error");
              resetImportState();
              return;
            }

            setScanStatus(isEn ? 'Synchronizing with database...' : 'מסנכרן מול מסד הנתונים...');
            let successCount = 0; let failCount = 0;

            for (const row of rows) {
              const rawId = sanitizeInput(row.civiwatch_id).replace(/^cwid-/i, ''); 
              if (!rawId) { failCount++; continue; }

              const { data: existingReport, error: fetchErr } = await supabase
                .from('reports')
                .select('status, additional_info')
                .eq('id', rawId)
                .single();

              if (fetchErr || !existingReport) { failCount++; continue; }

              const safeNotes = Array.isArray(existingReport.additional_info) ? existingReport.additional_info : [];
              const isAppeal = existingReport.status === 'Appeal in Progress';
              
              let newStatus = existingReport.status;
              const result = sanitizeInput(row.network_result).toLowerCase();
              const networkComment = sanitizeInput(row.network_comment || row.comment || '');
              const timestamp = sanitizeInput(row.network_timestamp || row.timestamp || new Date().toISOString());
              
              if (result.includes('removed') || result.includes('deleted') || result.includes('success')) {
                newStatus = isAppeal ? 'Appeal Successful' : 'Takedown Successful';
              } else if (result.includes('rejected') || result.includes('kept') || result.includes('no violation')) {
                newStatus = isAppeal ? 'Appeal Rejected' : 'Network Rejected';
              } else if (result.trim() !== '') {
                newStatus = 'Manual Review Required';
              }

              if (newStatus !== existingReport.status) {
                const newNote = {
                  timestamp: timestamp,
                  actor: 'Network T&S',
                  action: `Resolution: ${newStatus}`,
                  note: networkComment ? `Network Reply: "${networkComment}"` : `Status updated via CSV import.`
                };

                const updatePayload = { 
                  status: newStatus,
                  additional_info: [...safeNotes, newNote]
                };

                const { error: updateErr } = await supabase.from('reports').update(updatePayload).eq('id', rawId);
                if (!updateErr) successCount++;
                else failCount++;
              }
            }

            triggerToast(isEn ? `Import complete: ${successCount} updated, ${failCount} failed.` : `ייבוא הושלם: ${successCount} עודכנו, ${failCount} נכשלו.`, 'success');
            if (refreshData) refreshData();
          } catch (error) {
            setImportErrors([error.message]);
            triggerToast(isEn ? "Failed to process import file." : "שגיאה בעיבוד קובץ הייבוא.", 'error');
          } finally {
            resetImportState();
          }
        },
        error: (error) => {
          setImportErrors([isEn ? `File read error: ${error.message}` : `שגיאת קריאת קובץ: ${error.message}`]);
          triggerToast(isEn ? "Failed to parse CSV." : "שגיאה בקריאת ה-CSV.", 'error');
          resetImportState();
        }
      });
    };

    reader.readAsText(file);
  };

  const resetImportState = () => {
    setIsImporting(false);
    setScanStatus('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };
  const clearErrors = () => setImportErrors([]);

  return (
    <div style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', padding: '30px', marginTop: '20px' }}>
      <h3 style={{ margin: '0 0 5px 0', color: '#fff', fontSize: '1.4rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
        {SVGIcons.Send} {isEn ? 'Network Dispatch & Reconciliation' : 'שילוח וסנכרון רשתות'}
      </h3>
      <p style={{ margin: '0 0 25px 0', color: '#94a3b8', fontSize: '0.9rem' }}>
        {isEn ? 'Manage first-time dispatches and secondary appeals with social networks.' : 'ניהול דיווחים ראשוניים וערעורים מול הרשתות החברתיות.'}
      </p>

      {importErrors.length > 0 && (
        <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', borderRadius: '8px', padding: '20px', marginBottom: '25px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <h4 style={{ margin: 0, color: '#ef4444', display: 'flex', alignItems: 'center', gap: '8px' }}>
              {SVGIcons.Alert} {isEn ? 'Network File Scan Failed' : 'סריקת קובץ רשת נכשלה'}
            </h4>
            <button onClick={clearErrors} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>{SVGIcons.X}</button>
          </div>
          <ul style={{ color: '#fca5a5', fontSize: '0.85rem', margin: 0, maxHeight: '150px', overflowY: 'auto' }}>
            {importErrors.map((err, idx) => <li key={idx} style={{ marginBottom: '6px' }}>{err}</li>)}
          </ul>
        </div>
      )}

      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '25px' }}>
        <div style={{ flex: 1, minWidth: '280px', backgroundColor: 'rgba(30, 41, 59, 0.5)', padding: '20px', borderRadius: '12px', border: '1px solid #334155' }}>
          <h4 style={{ color: '#38bdf8', margin: '0 0 15px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>{isEn ? 'Step 1: Batch Export' : 'שלב 1: ייצוא מרוכז'}</span>
            <span style={{ backgroundColor: 'rgba(56, 189, 248, 0.1)', padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold' }}>
              {readyForDispatch.length} {isEn ? 'Ready' : 'מוכנים'}
            </span>
          </h4>
          
          <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
            <select value={exportType} onChange={(e) => setExportType(e.target.value)} style={{ flex: 1, backgroundColor: '#020617', color: '#cbd5e1', border: '1px solid #334155', padding: '10px', borderRadius: '8px', fontSize: '0.85rem', outline: 'none' }}>
              <option value="initial">{isEn ? 'Initial Takedowns' : 'בקשות הסרה (ראשוני)'}</option>
              <option value="appeals">{isEn ? 'Secondary Appeals' : 'ערעורים'}</option>
            </select>
            <select value={exportPlatform} onChange={(e) => setExportPlatform(e.target.value)} style={{ flex: 1, backgroundColor: '#020617', color: '#cbd5e1', border: '1px solid #334155', padding: '10px', borderRadius: '8px', fontSize: '0.85rem', outline: 'none' }}>
              <option value="all">{isEn ? 'All Platforms' : 'כל הפלטפורמות'}</option>
              {uniqueReadyPlatforms.map(plat => <option key={plat} value={plat}>{plat}</option>)}
            </select>
          </div>

          <button onClick={handleExport} disabled={isExporting || readyForDispatch.length === 0} style={{ width: '100%', backgroundColor: '#38bdf8', color: '#0f172a', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 'bold', cursor: (isExporting || readyForDispatch.length === 0) ? 'not-allowed' : 'pointer', opacity: (isExporting || readyForDispatch.length === 0) ? 0.5 : 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
            {isExporting ? '...' : <>{SVGIcons.Download} {isEn ? `Export ${readyForDispatch.length} Reports` : `ייצא ${readyForDispatch.length} דיווחים`}</>}
          </button>
        </div>

        <div style={{ flex: 1, minWidth: '280px', backgroundColor: 'rgba(30, 41, 59, 0.5)', padding: '20px', borderRadius: '12px', border: '1px solid #334155', display: 'flex', flexDirection: 'column' }}>
          <h4 style={{ color: '#10b981', margin: '0 0 15px 0' }}>{isEn ? 'Step 2: Reconcile Import' : 'שלב 2: ייבוא סנכרון'}</h4>
          <p style={{ color: '#cbd5e1', fontSize: '0.85rem', marginBottom: '20px', flex: 1 }}>
            {isEn ? 'Upload return CSV. Required: "civiwatch_id", "network_result". Optional: "network_comment".' : 'העלה קובץ תשובה מהרשת. חובה: "civiwatch_id", "network_result". אופציונלי: "network_comment".'}
          </p>
          <input type="file" accept=".csv,.xlsx,.xls" ref={fileInputRef} onChange={handleFileUpload} style={{ display: 'none' }} id="csv-network-upload" />
          <label htmlFor="csv-network-upload" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', width: '100%', backgroundColor: isImporting ? 'rgba(56, 189, 248, 0.2)' : 'transparent', color: isImporting ? '#38bdf8' : '#10b981', border: isImporting ? '1px solid rgba(56, 189, 248, 0.5)' : '1px solid #10b981', padding: '11px', borderRadius: '8px', fontWeight: 'bold', cursor: isImporting ? 'not-allowed' : 'pointer', opacity: isImporting ? 0.7 : 1 }}>
            {isImporting ? <>{SVGIcons.Refresh} {scanStatus}</> : <>{SVGIcons.Upload} {isEn ? 'Upload Resolution CSV' : 'העלה קובץ טיפול (CSV)'}</>}
          </label>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        {/* PENDING DASHBOARD */}
        <div style={{ flex: 1, minWidth: '280px', backgroundColor: '#020617', border: '1px solid #334155', borderRadius: '12px', padding: '20px' }}>
          <h4 style={{ margin: '0 0 15px 0', color: '#94a3b8', fontSize: '0.9rem', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '8px' }}>
            {SVGIcons.Activity} {isEn ? 'Awaiting Network Resolution' : 'ממתינים לתשובת רשת'}
            <span style={{ backgroundColor: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold' }}>{pendingNetwork.length}</span>
          </h4>
          {pendingNetwork.length === 0 ? (
            <div style={{ color: '#475569', fontSize: '0.85rem' }}>{isEn ? 'All queues are clear.' : 'כל התורים נקיים.'}</div>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {Object.entries(pendingByPlatform).sort(([,a], [,b]) => b - a).map(([platform, count]) => (
                <div key={platform} style={{ display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: 'rgba(30, 41, 59, 0.8)', border: '1px solid #334155', padding: '8px 15px', borderRadius: '8px' }}>
                  <span style={{ color: '#cbd5e1', fontSize: '0.85rem', fontWeight: 'bold' }}>{platform}</span>
                  <span style={{ backgroundColor: '#1e293b', color: '#f8fafc', padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>{count}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SUCCESS DASHBOARD */}
        <div style={{ flex: 1, minWidth: '280px', backgroundColor: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '12px', padding: '20px' }}>
          <h4 style={{ margin: '0 0 15px 0', color: '#10b981', fontSize: '0.9rem', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '8px' }}>
            {SVGIcons.CheckCircle} {isEn ? 'Recently Resolved (Network Success)' : 'טופלו לאחרונה (הסרה מוצלחת)'}
            <span style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold' }}>{recentSuccess.length}</span>
          </h4>
          {recentSuccess.length === 0 ? (
            <div style={{ color: '#475569', fontSize: '0.85rem' }}>{isEn ? 'No successful takedowns recorded yet.' : 'לא נרשמו הסרות מוצלחות עדיין.'}</div>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {Object.entries(successByPlatform).sort(([,a], [,b]) => b - a).map(([platform, count]) => (
                <div key={platform} style={{ display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: 'rgba(30, 41, 59, 0.8)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '8px 15px', borderRadius: '8px' }}>
                  <span style={{ color: '#cbd5e1', fontSize: '0.85rem', fontWeight: 'bold' }}>{platform}</span>
                  <span style={{ backgroundColor: 'rgba(16, 185, 129, 0.2)', color: '#10b981', padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>{count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BatchDispatch;