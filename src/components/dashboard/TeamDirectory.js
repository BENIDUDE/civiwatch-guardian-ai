/**
 * @file TeamDirectory.js
 * @description Organization Member Management & Provisioning Hub.
 */
import React, { useState, useRef } from 'react';
import { supabase } from '../../supabaseClient';
import Papa from 'papaparse';

const SVGIcons = {
  Users: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>,
  Download: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>,
  Upload: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>,
  Refresh: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>,
  Alert: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>,
  X: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>,
  Edit: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>,
  Check: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
};

const TeamDirectory = ({ teamMembers, isEn, triggerToast, refreshData, currentUserProfile }) => {
  const [isImporting, setIsImporting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [scanStatus, setScanStatus] = useState(''); 
  const [importErrors, setImportErrors] = useState([]); 
  const [searchTerm, setSearchTerm] = useState('');
  
  const [editingManagerFor, setEditingManagerFor] = useState(null);
  const [selectedManagerId, setSelectedManagerId] = useState('');
  const [isSavingManager, setIsSavingManager] = useState(false);

  const fileInputRef = useRef(null);

  const userRole = currentUserProfile?.role?.toLowerCase()?.trim() || '';
  const isSuperUser = ['admin', 'super admin', 'system admin', 'global admin'].includes(userRole);
  const canManageTeam = isSuperUser || userRole === 'ngo admin';

  const validRoles = ['operator l1', 'moderator l2', 'ngo admin', 'global admin', 'system admin', 'admin'];
  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const availableModerators = (teamMembers || []).filter(m => {
    const role = m.role?.toLowerCase()?.trim() || '';
    return ['moderator l2', 'ngo admin'].includes(role);
  });

  const getManagerName = (managerId) => {
    if (!managerId) return isEn ? 'Unassigned' : 'לא משויך';
    const mgr = (teamMembers || []).find(m => m.id === managerId || m.user_id === managerId);
    return mgr ? (mgr.display_name || mgr.email?.split('@')[0]) : (isEn ? 'Unknown' : 'לא ידוע');
  };

  const getDirectReportsCount = (modId) => {
    return (teamMembers || []).filter(m => m.manager_id === modId || m.manager_id === (teamMembers.find(t => t.id === modId)?.user_id)).length;
  };

  const handleAssignManager = async (operatorId) => {
    setIsSavingManager(true);
    try {
      const targetManager = selectedManagerId === 'unassigned' ? null : selectedManagerId;
      const { error } = await supabase
        .from('user_profiles')
        .update({ manager_id: targetManager })
        .eq('id', operatorId);

      if (error) throw error;
      triggerToast(isEn ? 'Team Lead updated successfully.' : 'ראש הצוות עודכן בהצלחה.', 'success');
      setEditingManagerFor(null);
      if (refreshData) refreshData();
    } catch (err) {
      console.error(err);
      triggerToast(isEn ? 'Failed to update Team Lead.' : 'שגיאה בעדכון ראש הצוות.', 'error');
    } finally {
      setIsSavingManager(false);
    }
  };

  const handleExportTeam = () => {
    setIsExporting(true);
    try {
      const exportList = (teamMembers || []).filter(m => {
        const r = m.role?.toLowerCase()?.trim() || '';
        return !['super admin', 'system admin', 'global admin'].includes(r);
      });

      if (exportList.length === 0) {
        triggerToast(isEn ? "No team members to export." : "אין חברי צוות לייצוא.", "error");
        setIsExporting(false);
        return;
      }

      const exportData = exportList.map(m => ({
        email: m.email,
        display_name: m.display_name || '',
        role: m.role || 'Operator L1',
        team_lead: getManagerName(m.manager_id)
      }));

      const csv = Papa.unparse(exportData);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `CiviWatch_Team_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      triggerToast(isEn ? "Team directory exported." : "ספריית חברי הצוות יוצאה.", "success");
    } catch (error) {
      console.error(error);
      triggerToast(isEn ? "Export failed." : "הייצוא נכשל.", "error");
    } finally {
      setIsExporting(false);
    }
  };

  const handleBulkImport = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsImporting(true);
    setImportErrors([]);
    
    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      setImportErrors([isEn ? 'Critical Error: File must be a valid .csv format.' : 'שגיאה קריטית: הקובץ חייב להיות בפורמט .csv תקין.']);
      resetImportState();
      return;
    }

    setScanStatus(isEn ? 'Running security scan...' : 'מבצע סריקת אבטחה...');
    await new Promise(resolve => setTimeout(resolve, 1500));

    setScanStatus(isEn ? 'Validating data structure...' : 'מאמת מבנה נתונים...');

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const rows = results.data;
          const headers = results.meta.fields || [];
          let errors = [];

          if (!headers.includes('email')) {
            errors.push(isEn ? 'Missing required column header: "email"' : 'חסרה עמודת חובה: "email"');
          }

          if (errors.length === 0) {
            const existingEmails = new Set((teamMembers || []).map(m => m.email?.toLowerCase().trim()));
            const csvEmails = new Set();

            rows.forEach((row, index) => {
              const rowNum = index + 2; 
              
              if (!row.email || row.email.trim() === '') {
                errors.push(isEn ? `Row ${rowNum}: Email is empty.` : `שורה ${rowNum}: כתובת דוא"ל ריקה.`);
              } else {
                const cleanEmail = row.email.toLowerCase().trim();
                
                if (!isValidEmail(cleanEmail)) {
                  errors.push(isEn ? `Row ${rowNum}: Invalid email format (${row.email}).` : `שורה ${rowNum}: פורמט דוא"ל לא תקין (${row.email}).`);
                } else if (existingEmails.has(cleanEmail)) {
                  errors.push(isEn ? `Row ${rowNum}: Email (${cleanEmail}) already exists in the system.` : `שורה ${rowNum}: כתובת דוא"ל (${cleanEmail}) כבר קיימת במערכת.`);
                } else if (csvEmails.has(cleanEmail)) {
                  errors.push(isEn ? `Row ${rowNum}: Duplicate email (${cleanEmail}) found inside the CSV.` : `שורה ${rowNum}: כתובת דוא"ל כפולה (${cleanEmail}) נמצאה בקובץ.`);
                }
                
                csvEmails.add(cleanEmail);
              }

              if (row.role && !validRoles.includes(row.role.toLowerCase().trim())) {
                errors.push(isEn ? `Row ${rowNum}: Unrecognized role "${row.role}". Must be Operator L1, Moderator L2, etc.` : `שורה ${rowNum}: תפקיד לא מוכר "${row.role}".`);
              }
            });
          }

          if (errors.length > 0) {
            setImportErrors(errors);
            triggerToast(isEn ? "Scan failed. Please fix the errors and try again." : "הסריקה נכשלה. אנא תקן את השגיאות ונסה שוב.", "error");
            resetImportState();
            return;
          }

          setScanStatus(isEn ? 'Importing data to server...' : 'מייבא נתונים לשרת...');

          const newUsers = rows.map(row => ({
            email: row.email.trim(),
            display_name: row.display_name || row.name || row.email.split('@')[0],
            role: row.role || 'Operator L1',
            organization_id: currentUserProfile.organization_id,
            current_sampling_rate: 100
          }));

          const { error } = await supabase.from('user_profiles').insert(newUsers);

          if (error) {
            if (error.code === '23505') { 
               setImportErrors([isEn ? 'Database Error: One or more emails already exist in the system.' : 'שגיאת מסד נתונים: כתובת דוא"ל אחת או יותר כבר קיימות במערכת.']);
            } else {
               setImportErrors([isEn ? `Database Error: ${error.message}` : `שגיאת מסד נתונים: ${error.message}`]);
            }
            triggerToast(isEn ? 'Import failed at database level.' : 'הייבוא נכשל ברמת מסד הנתונים.', 'error');
            resetImportState();
            return;
          }

          triggerToast(isEn ? `Successfully imported ${newUsers.length} team members!` : `יובאו בהצלחה ${newUsers.length} חברי צוות!`, 'success');
          if (refreshData) refreshData();

        } catch (error) {
          setImportErrors([error.message]);
          triggerToast(isEn ? `Import failed.` : `הייבוא נכשל.`, 'error');
        } finally {
          resetImportState();
        }
      },
      error: (error) => {
        setImportErrors([isEn ? `File read error: ${error.message}` : `שגיאת קריאת קובץ: ${error.message}`]);
        triggerToast(isEn ? "Failed to read the CSV file." : "שגיאה בקריאת קובץ ה-CSV.", 'error');
        resetImportState();
      }
    });
  };

  const resetImportState = () => {
    setIsImporting(false);
    setScanStatus('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const clearErrors = () => setImportErrors([]);

  const filteredTeam = (teamMembers || []).filter(member => 
    member.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.role?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ backgroundColor: 'rgba(15, 23, 42, 0.4)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', padding: '30px', direction: isEn ? 'ltr' : 'rtl' }}>
      
      {/* HEADER & ADMIN CONTROLS */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px', marginBottom: '30px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '20px' }}>
        <div>
          <h2 style={{ margin: 0, color: '#fff', fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
            {SVGIcons.Users} {isEn ? 'Team Directory' : 'ספריית חברי צוות'}
          </h2>
          <p style={{ margin: '5px 0 0 0', color: '#94a3b8', fontSize: '0.9rem' }}>
            {isEn ? 'Manage organization members and report routing hierarchies.' : 'ניהול חברי הארגון והיררכיות ניתוב דיווחים.'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
          <input 
            type="text" 
            placeholder={isEn ? "Search team..." : "חפש חבר צוות..."} 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ backgroundColor: '#020617', border: '1px solid #334155', color: '#fff', padding: '10px 15px', borderRadius: '8px', fontSize: '0.9rem', outline: 'none' }}
          />

          {canManageTeam && (
            <>
              <button 
                onClick={handleExportTeam}
                disabled={isExporting}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.3)', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: isExporting ? 'not-allowed' : 'pointer', opacity: isExporting ? 0.7 : 1, transition: 'all 0.2s' }}
              >
                {isExporting ? '...' : <>{SVGIcons.Download} {isEn ? 'Export Team' : 'ייצוא צוות'}</>}
              </button>

              <input 
                type="file" 
                accept=".csv" 
                ref={fileInputRef}
                onChange={handleBulkImport}
                style={{ display: 'none' }}
                id="csv-team-upload"
              />
              <label 
                htmlFor="csv-team-upload"
                style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: isImporting ? 'rgba(56, 189, 248, 0.2)' : 'rgba(16, 185, 129, 0.1)', color: isImporting ? '#38bdf8' : '#10b981', border: isImporting ? '1px solid rgba(56, 189, 248, 0.5)' : '1px solid rgba(16, 185, 129, 0.3)', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: isImporting ? 'not-allowed' : 'pointer', transition: 'all 0.2s' }}
              >
                {isImporting ? <>{SVGIcons.Refresh} <span style={{ animation: 'pulse 1.5s infinite' }}>{scanStatus}</span></> : <>{SVGIcons.Upload} {isEn ? 'Bulk Import' : 'ייבוא מרוכז'}</>}
              </label>
              <style>{`@keyframes pulse { 0% { opacity: 0.6; } 50% { opacity: 1; } 100% { opacity: 0.6; } }`}</style>
            </>
          )}
        </div>
      </div>

      {/* ERROR FEEDBACK UI */}
      {importErrors.length > 0 && (
        <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', borderRadius: '8px', padding: '20px', marginBottom: '25px', animation: 'fadeIn 0.3s ease-out' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <h4 style={{ margin: 0, color: '#ef4444', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem' }}>
              {SVGIcons.Alert} {isEn ? 'Scan Failed: Action Required' : 'הסריקה נכשלה: נדרשת פעולה'}
            </h4>
            <button onClick={clearErrors} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '4px' }}>
              {SVGIcons.X}
            </button>
          </div>
          <p style={{ color: '#f8fafc', fontSize: '0.9rem', marginBottom: '15px' }}>
            {isEn ? 'We could not import your file because the scanner detected formatting issues. Please fix the following errors in your spreadsheet and re-upload:' : 'לא הצלחנו לייבא את הקובץ משום שהסורק זיהה בעיות תקינות. אנא תקן את השגיאות הבאות בקובץ והעלה מחדש:'}
          </p>
          <ul style={{ color: '#fca5a5', fontSize: '0.85rem', paddingLeft: isEn ? '20px' : 0, paddingRight: isEn ? 0 : '20px', margin: 0, maxHeight: '150px', overflowY: 'auto' }}>
            {importErrors.map((err, idx) => (
              <li key={idx} style={{ marginBottom: '6px' }}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {/* TEAM LIST RENDER */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', direction: isEn ? 'ltr' : 'rtl' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #334155', color: '#94a3b8', fontSize: '0.85rem', textTransform: 'uppercase' }}>
              <th style={{ padding: '12px 15px', fontWeight: 'bold' }}>{isEn ? 'Member' : 'חבר צוות'}</th>
              <th style={{ padding: '12px 15px', fontWeight: 'bold' }}>{isEn ? 'Email' : 'דוא"ל'}</th>
              <th style={{ padding: '12px 15px', fontWeight: 'bold' }}>{isEn ? 'Role' : 'תפקיד'}</th>
              <th style={{ padding: '12px 15px', fontWeight: 'bold' }}>{isEn ? 'Team Lead' : 'ראש צוות'}</th>
            </tr>
          </thead>
          <tbody>
            {filteredTeam.length === 0 ? (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                  {isEn ? 'No team members found.' : 'לא נמצאו חברי צוות.'}
                </td>
              </tr>
            ) : (
              filteredTeam.map(member => {
                const roleLower = member.role?.toLowerCase()?.trim() || '';
                const isOperator = roleLower === 'operator l1';
                const isModerator = roleLower === 'moderator l2';
                const isAdmin = roleLower.includes('admin');
                
                return (
                  <tr key={member.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)', transition: 'background 0.2s' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                    
                    {/* MEMBER PROFILE */}
                    <td style={{ padding: '15px', color: '#e2e8f0', fontWeight: 'bold' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '30px', height: '30px', borderRadius: '50%', backgroundColor: '#1e293b', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '0.8rem', color: '#38bdf8', fontWeight: 'bold' }}>
                          {(member.display_name || member.email || '?')[0].toUpperCase()}
                        </div>
                        {member.display_name || 'N/A'}
                      </div>
                    </td>
                    
                    {/* EMAIL */}
                    <td style={{ padding: '15px', color: '#cbd5e1', fontSize: '0.9rem' }}>
                      {member.email}
                    </td>
                    
                    {/* ROLE BADGE */}
                    <td style={{ padding: '15px' }}>
                      <span style={{ 
                        backgroundColor: isAdmin ? 'rgba(168, 85, 247, 0.1)' : 'rgba(56, 189, 248, 0.1)', 
                        color: isAdmin ? '#a855f7' : '#38bdf8', 
                        padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold', 
                        border: isAdmin ? '1px solid rgba(168, 85, 247, 0.3)' : '1px solid rgba(56, 189, 248, 0.3)' 
                      }}>
                        {member.role || 'Operator L1'}
                      </span>
                    </td>

                    {/* HIERARCHY / TEAM LEAD COLUMN */}
                    <td style={{ padding: '15px' }}>
                      {isOperator ? (
                        editingManagerFor === member.id ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <select 
                              value={selectedManagerId} 
                              onChange={(e) => setSelectedManagerId(e.target.value)}
                              style={{ backgroundColor: '#020617', border: '1px solid #3b82f6', color: '#fff', padding: '6px 10px', borderRadius: '6px', fontSize: '0.8rem', outline: 'none' }}
                            >
                              <option value="unassigned">{isEn ? '-- Unassigned --' : '-- לא משויך --'}</option>
                              {availableModerators.map(mod => (
                                <option key={mod.id} value={mod.id || mod.user_id}>{mod.display_name || mod.email}</option>
                              ))}
                            </select>
                            <button 
                              onClick={() => handleAssignManager(member.id)} 
                              disabled={isSavingManager}
                              style={{ background: '#10b981', color: '#fff', border: 'none', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                            >
                              {SVGIcons.Check}
                            </button>
                            <button 
                              onClick={() => setEditingManagerFor(null)} 
                              style={{ background: 'transparent', color: '#94a3b8', border: '1px solid #334155', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                            >
                              {SVGIcons.X}
                            </button>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ color: member.manager_id ? '#e2e8f0' : '#64748b', fontSize: '0.85rem', fontWeight: member.manager_id ? 'bold' : 'normal' }}>
                              {getManagerName(member.manager_id)}
                            </span>
                            {canManageTeam && (
                              <button 
                                onClick={() => { setEditingManagerFor(member.id); setSelectedManagerId(member.manager_id || 'unassigned'); }}
                                style={{ background: 'transparent', border: 'none', color: '#38bdf8', cursor: 'pointer', opacity: 0.7, transition: 'opacity 0.2s', padding: '4px' }}
                                onMouseOver={(e) => e.currentTarget.style.opacity = 1}
                                onMouseOut={(e) => e.currentTarget.style.opacity = 0.7}
                                title={isEn ? "Assign Lead" : "שייך ראש צוות"}
                              >
                                {SVGIcons.Edit}
                              </button>
                            )}
                          </div>
                        )
                      ) : isModerator ? (
                        <span style={{ fontSize: '0.8rem', color: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: '4px 8px', borderRadius: '6px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                          {isEn ? `Leads ${getDirectReportsCount(member.id || member.user_id)} Operators` : `מנהל ${getDirectReportsCount(member.id || member.user_id)} מפעילים`}
                        </span>
                      ) : (
                        <span style={{ color: '#475569', fontSize: '0.85rem' }}>-</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
};

export default TeamDirectory;