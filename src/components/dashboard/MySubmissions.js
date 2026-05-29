/**
 * @file MySubmissions.js
 * @description Operator History & Submission Log.
 * Features collapsible tables, targeted CSV exports, Report ID search, and Safe Mode evidence viewing.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../supabaseClient';
import AIAuditPanel from './AIAuditPanel';

// --- UNIVERSAL SVG ICON MAPPING ---
const SVGIcons = {
  AlertTriangle: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>,
  List: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>,
  Refresh: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>,
  FileText: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>,
  Bot: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="10" rx="2"></rect><circle cx="12" cy="5" r="2"></circle><path d="M12 7v4"></path><line x1="8" y1="16" x2="8" y2="16"></line><line x1="16" y1="16" x2="16" y2="16"></line></svg>,
  Download: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>,
  ChevronDown: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>,
  ChevronUp: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>,
  Clock: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>,
  Shield: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>,
  X: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
};

const inputStyle = { backgroundColor: '#0f172a', border: '1px solid #334155', color: '#cbd5e1', padding: '6px 12px', borderRadius: '8px', fontSize: '0.85rem', outline: 'none' };
const ghostBtn = (hex, rgb) => ({ backgroundColor: `rgba(${rgb}, 0.1)`, color: hex, border: `1px solid rgba(${rgb}, 0.3)`, padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' });

// UPDATED: Adjusted grid layout for combined ID/Date/Time column
const triageGridLayout = '1.8fr 0.8fr 1.2fr 3fr 1.2fr';
const assignGridLayout = '1.8fr 1.5fr 3.5fr 1fr';

const MySubmissions = ({ userProfile, isEn, triggerToast }) => {
  const isRtl = !isEn;
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedLogs, setExpandedLogs] = useState({});
  const [safeMode, setSafeMode] = useState(true);
  const [imageModal, setImageModal] = useState({ isOpen: false, src: '' });

  // Accordion Expand/Collapse States
  const [isTriageOpen, setIsTriageOpen] = useState(true);
  const [isAssignOpen, setIsAssignOpen] = useState(true);

  // Local Table Filters: Triage
  const [triageSearchId, setTriageSearchId] = useState('');
  const [triageStart, setTriageStart] = useState('');
  const [triageEnd, setTriageEnd] = useState('');
  const [triageStatus, setTriageStatus] = useState('all');
  const [triagePlatform, setTriagePlatform] = useState('all');

  // Local Table Filters: Assignments
  const [assignStart, setAssignStart] = useState('');
  const [assignEnd, setAssignEnd] = useState('');
  const [assignPlatform, setAssignPlatform] = useState('all');

  const profileId = userProfile?.id;

  const toggleLog = (id) => setExpandedLogs(prev => ({ ...prev, [id]: !prev[id] }));

  const fetchMyHistory = useCallback(async () => {
    if (!profileId) return;
    setLoading(true);

    try {
      const { data: reportsData, error: reportsError } = await supabase
        .from('reports')
        .select('*')
        .or(`submitted_by.eq.${profileId},assigned_to.eq.${profileId}`);

      if (reportsError) throw reportsError;

      const { data: assignData, error: assignError } = await supabase
        .from('assignments')
        .select('*')
        .eq('assigned_to', profileId);

      if (assignError) throw assignError;

      let combined = [
        ...(reportsData || []).map(r => ({ ...r, _table: 'reports' })),
        ...(assignData || []).map(a => ({ ...a, _table: 'assignments' }))
      ];

      setSubmissions(combined);
    } catch (error) {
      console.error("Error fetching submissions:", error.message);
      if (triggerToast) triggerToast((isEn ? "Failed to load history: " : "שגיאה בטעינת היסטוריה: ") + error.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [profileId, isEn, triggerToast]);

  useEffect(() => {
    fetchMyHistory();
  }, [fetchMyHistory]);

  const extractFeedback = (additionalInfo) => {
    if (!additionalInfo || !Array.isArray(additionalInfo) || additionalInfo.length === 0) return null;
    const lastNote = additionalInfo[additionalInfo.length - 1];
    if (!lastNote || !lastNote.note) return null;

    const match = lastNote.note.match(/^\[(.*?)\]\s*(.*)$/);
    if (match) {
      return { actor: lastNote.actor, category: match[1], message: match[2], timestamp: lastNote.timestamp };
    }
    return { actor: lastNote.actor, category: isEn ? 'Feedback' : 'הערה', message: lastNote.note, timestamp: lastNote.timestamp };
  };

  const getCalculatedStatus = (report) => {
    let calcStatus = report.status || 'Pending';
    const aStatus = report.ai_vote_status || report.reports?.ai_vote_status;
    if (['New', 'Pending', 'In Progress'].includes(calcStatus) && aStatus && ['Changes Requested', 'Manual Review Required', 'AI Verified', 'AI Rejected'].includes(aStatus)) {
      calcStatus = aStatus;
    }
    return calcStatus;
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'AI Verified': case 'Verified': case 'Closed - Verified': case 'Takedown Successful': case 'Appeal Successful': case 'Closed': return '#10b981'; 
      case 'AI Rejected': case 'Dismissed': return '#64748b'; 
      case 'Processing': case 'Pending AI': case 'Pending Mod Review': case 'Pending Network Action': return '#38bdf8'; 
      case 'Pending Review': return '#a855f7'; 
      case 'Changes Requested': case 'Network Rejected': case 'Appeal Rejected': return '#ef4444'; 
      case 'Pending': case 'New': case 'Manual Review Required': return '#f59e0b'; 
      default: return '#94a3b8';
    }
  };

  const applyDateFilter = (dateString, start, end) => {
    if (start && new Date(dateString) < new Date(start)) return false;
    if (end) {
      const e = new Date(end); e.setHours(23, 59, 59, 999);
      if (new Date(dateString) > e) return false;
    }
    return true;
  };

  // --- FILTER ENGINE ---
  const sortedData = [...submissions].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  const needsFix = sortedData.filter(s => getCalculatedStatus(s) === 'Changes Requested');
  
  let triageHistory = sortedData.filter(s => {
    if (s._table === 'assignments') return false;
    
    // ID Search Filter
    if (triageSearchId && (!s.id || !s.id.toLowerCase().includes(triageSearchId.toLowerCase()))) return false;

    const stat = getCalculatedStatus(s);
    if (stat === 'Changes Requested') return false; 
    if (triageStatus !== 'all' && stat !== triageStatus) return false;
    if (triagePlatform !== 'all' && (s.platform || 'other').toLowerCase() !== triagePlatform.toLowerCase()) return false;
    return applyDateFilter(s.created_at, triageStart, triageEnd);
  });

  let assignmentHistory = sortedData.filter(s => {
    if (s._table !== 'assignments') return false;
    const stat = getCalculatedStatus(s);
    if (stat === 'Changes Requested') return false; 
    // Strict whitelist: Only show finished items in History
    if (!['Pending Mod Review', 'Closed', 'Verified', 'Closed - Verified'].includes(stat)) return false; 
    if (assignPlatform !== 'all' && (s.platform || 'other').toLowerCase() !== assignPlatform.toLowerCase()) return false;
    return applyDateFilter(s.created_at, assignStart, assignEnd);
  });

  const uniquePlatforms = [...new Set(submissions.map(r => r.platform).filter(Boolean))];

  // --- CSV EXPORT LOGIC ---
  const generateCSV = (dataRows, filename) => {
    const csvContent = dataRows.map(row => `"${row.map(cell => String(cell).replace(/"/g, '""')).join('","')}"`).join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportTriage = (e) => {
    e.stopPropagation(); 
    if (triageHistory.length === 0) return;
    const rows = [[isEn ? 'ID' : 'מזהה', isEn ? 'Date & Time' : 'תאריך ושעה', isEn ? 'Evidence' : 'ראייה', isEn ? 'Platform' : 'פלטפורמה', isEn ? 'Content Details' : 'פרטי הדיווח', isEn ? 'Status' : 'סטטוס']];
    triageHistory.forEach(task => {
      rows.push([ 
        task.id, 
        new Date(task.created_at).toLocaleString(), 
        task.image_url || 'N/A',
        task.platform || 'N/A', 
        task.content || 'N/A', 
        getCalculatedStatus(task) 
      ]);
    });
    generateCSV(rows, `Triage_History_${new Date().toISOString().split('T')[0]}.csv`);
  };

  const handleExportAssignments = (e) => {
    e.stopPropagation(); 
    if (assignmentHistory.length === 0) return;
    const rows = [[isEn ? 'ID' : 'מזהה', isEn ? 'Date & Time' : 'תאריך ושעה', isEn ? 'Platform' : 'פלטפורמה', isEn ? 'Assignment Details' : 'פרטי משימה', isEn ? 'Hours Worked' : 'שעות עבודה']];
    assignmentHistory.forEach(task => {
      rows.push([ 
        task.id,
        new Date(task.created_at).toLocaleString(), 
        task.platform || 'N/A', 
        task.custom_instructions || task.description || task.content || 'N/A', 
        task.allocated_hours || 0 
      ]);
    });
    generateCSV(rows, `Assignment_History_${new Date().toISOString().split('T')[0]}.csv`);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px', color: '#38bdf8' }}>
        <div style={{ width: '30px', height: '30px', border: '3px solid rgba(56,189,248,0.3)', borderTopColor: '#38bdf8', borderRadius: '50%', animation: 'spin 1s linear infinite', marginRight: '10px' }}>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
        {isEn ? 'Loading your history...' : 'טוען היסטוריה...'}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', direction: isRtl ? 'rtl' : 'ltr', animation: 'fadeIn 0.4s ease-out' }}>
      
      {/* --- IMAGE MODAL --- */}
      {imageModal.isOpen && (
        <div 
          onClick={() => setImageModal({ isOpen: false, src: '' })}
          style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.9)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999, backdropFilter: 'blur(5px)', cursor: 'zoom-out' }}
        >
          <button style={{ position: 'absolute', top: '20px', right: '20px', background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}>{SVGIcons.X}</button>
          <img 
            src={imageModal.src} 
            alt="Full Evidence" 
            onClick={(e) => e.stopPropagation()} 
            style={{ maxWidth: '90%', maxHeight: '90%', borderRadius: '8px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)', filter: safeMode ? 'blur(15px)' : 'none', transition: 'filter 0.3s', cursor: 'default' }} 
          />
        </div>
      )}

      {/* 1. SPOTLIGHT: NEEDS FIX */}
      {needsFix.length > 0 && (
        <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.05)', borderRadius: '16px', border: '1px solid rgba(239, 68, 68, 0.3)', overflow: 'hidden' }}>
          <div style={{ padding: '20px 30px', borderBottom: '1px solid rgba(239, 68, 68, 0.2)', backgroundColor: 'rgba(239, 68, 68, 0.1)', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ color: '#ef4444' }}>{SVGIcons.AlertTriangle}</span>
            <h3 style={{ margin: 0, color: '#ef4444', fontSize: '1.3rem' }}>{isEn ? 'Action Required: Returned for Corrections' : 'נדרשת פעולה: הוחזר לתיקונים'}</h3>
          </div>
          
          <div style={{ padding: '20px 30px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {needsFix.map(task => {
              const feedback = extractFeedback(task.additional_info);
              const contentData = task._table === 'assignments' ? (task.custom_instructions || task.description || task.content) : task.content;

              return (
                <div key={task.id} style={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ backgroundColor: 'rgba(56,189,248,0.1)', color: '#38bdf8', padding: '4px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 'bold' }}>{task.platform || 'N/A'}</span>
                      <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>{new Date(task.created_at).toLocaleDateString()} • {task._table === 'assignments' ? (isEn ? 'Assignment' : 'משימה יזומה') : (isEn ? 'Manual Report' : 'דיווח יזום')}</span>
                    </div>
                  </div>
                  <div style={{ color: '#e2e8f0', fontSize: '0.95rem', lineHeight: '1.5' }}>{contentData || (isEn ? 'No text content provided.' : 'לא צורף טקסט.')}</div>

                  {feedback && (
                    <div style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', borderLeft: isEn ? '4px solid #f59e0b' : 'none', borderRight: !isEn ? '4px solid #f59e0b' : 'none', padding: '15px', borderRadius: '0 8px 8px 0' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <strong style={{ color: '#f59e0b', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '6px' }}>{SVGIcons.AlertTriangle} {feedback.category}</strong>
                        <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>{isEn ? 'Reviewed by' : 'נבדק ע"י'} {feedback.actor}</span>
                      </div>
                      <div style={{ color: '#cbd5e1', fontSize: '0.95rem' }}>{feedback.message}</div>
                    </div>
                  )}
                  <div style={{ textAlign: isRtl ? 'left' : 'right', marginTop: '5px' }}>
                    <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>{isEn ? '👉 Please go to the Workspace tab to update and mark as Done.' : '👉 אנא עבור לסביבת העבודה כדי לתקן ולסמן כבוצע.'}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '20px' }}>
        <div>
          <h2 style={{ margin: 0, color: '#fff', fontSize: '1.8rem', display: 'flex', alignItems: 'center', gap: '10px' }}>{SVGIcons.List} {isEn ? 'My Submissions' : 'היסטוריית הדיווחים שלי'}</h2>
          <p style={{ margin: '5px 0 0 0', color: '#94a3b8', fontSize: '0.95rem' }}>{isEn ? 'Track the historical status of your completed work.' : 'עקוב אחר הסטטוס ההיסטורי של המשימות שהשלמת.'}</p>
        </div>
        <button onClick={fetchMyHistory} style={{ backgroundColor: '#1f6feb', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
          {SVGIcons.Refresh} {isEn ? 'Refresh' : 'רענן'}
        </button>
      </div>

      {/* 3. COLLAPSIBLE TRIAGE HISTORY TABLE */}
      <div style={{ backgroundColor: 'rgba(15, 23, 42, 0.4)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
        
        {/* Accordion Header */}
        <div onClick={() => setIsTriageOpen(!isTriageOpen)} style={{ padding: '15px 30px', backgroundColor: 'rgba(30, 41, 59, 0.8)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', transition: 'background-color 0.2s' }}>
          <h4 style={{ margin: 0, color: '#e2e8f0', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            {SVGIcons.AlertTriangle} {isEn ? 'My Triage History' : 'היסטוריית הטריאז\' שלי'}
          </h4>
          <span style={{ color: '#94a3b8' }}>{isTriageOpen ? SVGIcons.ChevronUp : SVGIcons.ChevronDown}</span>
        </div>

        {isTriageOpen && (
          <div>
            {/* Filter Bar */}
            <div style={{ padding: '15px 30px', borderBottom: '1px solid rgba(255,255,255,0.05)', borderTop: '1px solid rgba(255,255,255,0.05)', backgroundColor: 'rgba(30, 41, 59, 0.3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                <input 
                  type="text" 
                  placeholder={isEn ? "Search ID..." : "חפש לפי מזהה..."} 
                  value={triageSearchId} 
                  onChange={(e) => setTriageSearchId(e.target.value)} 
                  style={{ ...inputStyle, width: '150px' }} 
                />
                <span style={{color: '#94a3b8', fontSize: '0.8rem'}}>{isEn?'From:':'מ:'}</span>
                <input type="date" value={triageStart} onChange={(e) => setTriageStart(e.target.value)} style={inputStyle} />
                <span style={{color: '#94a3b8', fontSize: '0.8rem'}}>{isEn?'To:':'עד:'}</span>
                <input type="date" value={triageEnd} onChange={(e) => setTriageEnd(e.target.value)} style={inputStyle} />
                <select value={triageStatus} onChange={(e) => setTriageStatus(e.target.value)} style={inputStyle}>
                  <option value="all">{isEn ? 'All Statuses' : 'כל הסטטוסים'}</option>
                  <option value="Verified">Verified</option>
                  <option value="Pending Review">Pending Review</option>
                  <option value="Dismissed">Dismissed</option>
                  <option value="Takedown Successful">Takedown Successful</option>
                </select>
                <select value={triagePlatform} onChange={(e) => setTriagePlatform(e.target.value)} style={inputStyle}>
                  <option value="all">{isEn ? 'All Platforms' : 'כל הפלטפורמות'}</option>
                  {uniquePlatforms.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
                {(triageSearchId || triageStart || triageEnd || triageStatus !== 'all' || triagePlatform !== 'all') && (
                  <button onClick={(e) => { e.stopPropagation(); setTriageSearchId(''); setTriageStart(''); setTriageEnd(''); setTriageStatus('all'); setTriagePlatform('all');}} style={{ backgroundColor: 'transparent', color: '#94a3b8', border: '1px solid #475569', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem' }}>{isEn ? 'Clear' : 'נקה'}</button>
                )}
              </div>
              
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <button onClick={(e) => { e.stopPropagation(); setSafeMode(!safeMode); }} style={{ backgroundColor: safeMode ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: safeMode ? '#10b981' : '#ef4444', border: `1px solid ${safeMode ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`, padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s' }}>
                  {safeMode ? <>{SVGIcons.Shield} Shield: ON</> : <>{SVGIcons.AlertTriangle} Shield: OFF</>}
                </button>
                <button onClick={handleExportTriage} disabled={triageHistory.length === 0} style={ghostBtn('#38bdf8', '56, 189, 248')}>{SVGIcons.Download} CSV</button>
              </div>
            </div>

            {/* Table Content */}
            <div style={{ padding: '20px 30px', minHeight: '100px', overflowX: 'auto' }}>
              {triageHistory.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#64748b', padding: '20px 0' }}>{isEn ? 'No triage reports found.' : 'לא נמצאו דיווחי טריאז\'.'}</div>
              ) : (
                <div style={{ color: '#fff', minWidth: '1000px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: triageGridLayout, color: '#94a3b8', borderBottom: '1px solid #334155', paddingBottom: '10px', marginBottom: '10px', fontSize: '0.85rem', textTransform: 'uppercase' }}>
                    <div>{isEn ? 'ID, Date & Time' : 'מזהה, תאריך ושעה'}</div>
                    <div>{isEn ? 'Evidence' : 'ראייה'}</div>
                    <div>{isEn ? 'Platform' : 'פלטפורמה'}</div>
                    <div>{isEn ? 'Content Details' : 'פרטי הדיווח'}</div>
                    <div>{isEn ? 'Status' : 'סטטוס'}</div>
                  </div>
                  
                  {triageHistory.map(task => {
                    const displayStatus = getCalculatedStatus(task);
                    const dateObj = new Date(task.created_at);
                    const dateStr = dateObj.toLocaleDateString(isEn ? 'en-US' : 'he-IL');
                    const timeStr = dateObj.toLocaleTimeString(isEn ? 'en-US' : 'he-IL', { hour: '2-digit', minute: '2-digit' });
                    const shortId = task.id ? task.id.substring(0, 8).toUpperCase() : 'N/A';

                    return (
                      <React.Fragment key={task.id}>
                        <div style={{ display: 'grid', gridTemplateColumns: triageGridLayout, alignItems: 'center', padding: '16px 0', borderBottom: expandedLogs[task.id] ? 'none' : '1px solid rgba(255,255,255,0.02)' }}>
                          
                          {/* ID, DATE & TIME COLUMN */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '6px' }}>
                            <span style={{ fontSize: '0.8rem', fontFamily: 'monospace', color: '#94a3b8', backgroundColor: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: '4px', width: 'fit-content', border: '1px solid rgba(255,255,255,0.05)' }}>
                              #{shortId}
                            </span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#cbd5e1', flexWrap: 'wrap' }}>
                              <span style={{ fontWeight: '500' }}>{dateStr}</span>
                              <span style={{ color: '#475569' }}>|</span>
                              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#94a3b8' }}>
                                {SVGIcons.Clock} {timeStr}
                              </span>
                            </div>
                          </div>
                          
                          {/* Evidence Thumbnail */}
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            {task.image_url ? (
                              <div
                                onClick={() => setImageModal({ isOpen: true, src: task.image_url })}
                                onMouseEnter={(e) => { if(safeMode) e.currentTarget.firstChild.style.filter = 'none'; }}
                                onMouseLeave={(e) => { if(safeMode) e.currentTarget.firstChild.style.filter = 'blur(10px)'; }}
                                style={{ width: '45px', height: '45px', borderRadius: '8px', border: '1px solid #334155', overflow: 'hidden', backgroundColor: '#020617', cursor: 'pointer', position: 'relative' }}
                                title={isEn ? "Hover to reveal / Click to expand" : "העבר עכבר כדי לראות / לחץ להגדלה"}
                              >
                                <img
                                  src={task.image_url}
                                  alt="Evidence"
                                  style={{ width: '100%', height: '100%', objectFit: 'cover', filter: safeMode ? 'blur(10px)' : 'none', transition: 'filter 0.2s ease-in-out' }}
                                />
                              </div>
                            ) : (
                              <span style={{ fontSize: '0.7rem', color: '#475569' }}>{isEn ? 'No Image' : 'אין תמונה'}</span>
                            )}
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            {task.platform ? <span style={{ backgroundColor: 'rgba(56,189,248,0.1)', color: '#38bdf8', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', border: '1px solid rgba(56,189,248,0.2)' }}>{task.platform}</span> : <span style={{color:'#64748b'}}>N/A</span>}
                          </div>
                          
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', paddingRight: '15px' }}>
                            <div style={{ fontSize: '0.85rem', color: '#e2e8f0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '350px' }}>{task.content || 'N/A'}</div>
                            {!!task.ai_reasoning && (
                              <button onClick={() => toggleLog(task.id)} style={{ alignSelf: 'flex-start', backgroundColor: expandedLogs[task.id] ? 'rgba(168, 85, 247, 0.2)' : 'rgba(30, 41, 59, 0.8)', color: expandedLogs[task.id] ? '#d946ef' : '#94a3b8', border: '1px solid #334155', padding: '2px 8px', borderRadius: '4px', fontSize: '0.70rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                {SVGIcons.Bot} {expandedLogs[task.id] ? (isEn ? 'Hide AI Audit' : 'הסתר AI') : (isEn ? 'View AI Audit' : 'צפה ב-AI')}
                              </button>
                            )}
                          </div>
                          
                          <div>
                            <span style={{ color: getStatusColor(displayStatus), fontWeight: 'bold', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: getStatusColor(displayStatus) }}></span>
                              {displayStatus === 'Closed - Verified' ? 'Verified' : displayStatus}
                            </span>
                          </div>
                        </div>
                        {expandedLogs[task.id] && !!task.ai_reasoning && <div style={{ marginBottom: '15px' }}><AIAuditPanel report={task} /></div>}
                      </React.Fragment>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 4. COLLAPSIBLE ASSIGNMENT HISTORY TABLE */}
      <div style={{ backgroundColor: 'rgba(15, 23, 42, 0.4)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
        
        {/* Accordion Header */}
        <div onClick={() => setIsAssignOpen(!isAssignOpen)} style={{ padding: '15px 30px', backgroundColor: 'rgba(30, 41, 59, 0.8)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', transition: 'background-color 0.2s' }}>
          <h4 style={{ margin: 0, color: '#e2e8f0', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            {SVGIcons.FileText} {isEn ? 'My Assignment History' : 'היסטוריית המשימות היזומות שלי'}
          </h4>
          <span style={{ color: '#94a3b8' }}>{isAssignOpen ? SVGIcons.ChevronUp : SVGIcons.ChevronDown}</span>
        </div>

        {isAssignOpen && (
          <div>
            {/* Filter Bar */}
            <div style={{ padding: '15px 30px', borderBottom: '1px solid rgba(255,255,255,0.05)', borderTop: '1px solid rgba(255,255,255,0.05)', backgroundColor: 'rgba(30, 41, 59, 0.3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={{color: '#94a3b8', fontSize: '0.8rem'}}>{isEn?'From:':'מ:'}</span>
                <input type="date" value={assignStart} onChange={(e) => setAssignStart(e.target.value)} style={inputStyle} />
                <span style={{color: '#94a3b8', fontSize: '0.8rem'}}>{isEn?'To:':'עד:'}</span>
                <input type="date" value={assignEnd} onChange={(e) => setAssignEnd(e.target.value)} style={inputStyle} />
                <select value={assignPlatform} onChange={(e) => setAssignPlatform(e.target.value)} style={inputStyle}>
                  <option value="all">{isEn ? 'All Platforms' : 'כל הפלטפורמות'}</option>
                  {uniquePlatforms.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
                {(assignStart || assignEnd || assignPlatform !== 'all') && (
                  <button onClick={(e) => { e.stopPropagation(); setAssignStart(''); setAssignEnd(''); setAssignPlatform('all');}} style={{ backgroundColor: 'transparent', color: '#94a3b8', border: '1px solid #475569', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem' }}>{isEn ? 'Clear' : 'נקה'}</button>
                )}
              </div>
              <button onClick={handleExportAssignments} disabled={assignmentHistory.length === 0} style={ghostBtn('#a855f7', '168, 85, 247')}>{SVGIcons.Download} CSV</button>
            </div>

            {/* Table Content */}
            <div style={{ padding: '20px 30px', minHeight: '100px', overflowX: 'auto' }}>
              {assignmentHistory.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#64748b', padding: '20px 0' }}>{isEn ? 'No completed assignments found.' : 'לא נמצאו משימות יזומות שהושלמו.'}</div>
              ) : (
                <div style={{ color: '#fff', minWidth: '900px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: assignGridLayout, color: '#94a3b8', borderBottom: '1px solid #334155', paddingBottom: '10px', marginBottom: '10px', fontSize: '0.85rem', textTransform: 'uppercase' }}>
                    <div>{isEn ? 'ID, Date & Time' : 'מזהה, תאריך ושעה'}</div>
                    <div>{isEn ? 'Platform' : 'פלטפורמה'}</div>
                    <div>{isEn ? 'Assignment Details' : 'פרטי משימה'}</div>
                    <div>{isEn ? 'Hours Worked' : 'שעות עבודה'}</div>
                  </div>
                  
                  {assignmentHistory.map(task => {
                    const dateObj = new Date(task.created_at);
                    const dateStr = dateObj.toLocaleDateString(isEn ? 'en-US' : 'he-IL');
                    const timeStr = dateObj.toLocaleTimeString(isEn ? 'en-US' : 'he-IL', { hour: '2-digit', minute: '2-digit' });
                    const shortId = task.id ? task.id.substring(0, 8).toUpperCase() : 'N/A';

                    return (
                      <div key={task.id} style={{ display: 'grid', gridTemplateColumns: assignGridLayout, alignItems: 'center', padding: '16px 0', borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                        {/* ID, DATE & TIME COLUMN */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '6px' }}>
                          <span style={{ fontSize: '0.8rem', fontFamily: 'monospace', color: '#94a3b8', backgroundColor: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: '4px', width: 'fit-content', border: '1px solid rgba(255,255,255,0.05)' }}>
                            #{shortId}
                          </span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#cbd5e1', flexWrap: 'wrap' }}>
                            <span style={{ fontWeight: '500' }}>{dateStr}</span>
                            <span style={{ color: '#475569' }}>|</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#94a3b8' }}>
                              {SVGIcons.Clock} {timeStr}
                            </span>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          {task.platform ? <span style={{ backgroundColor: 'rgba(168, 85, 247, 0.1)', color: '#a855f7', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', border: '1px solid rgba(168, 85, 247, 0.2)' }}>{task.platform}</span> : <span style={{color:'#64748b'}}>N/A</span>}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: '#e2e8f0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '400px', paddingRight: '15px' }}>
                          {task.custom_instructions || task.description || task.content || 'N/A'}
                        </div>
                        <div>
                          <span style={{ color: '#10b981', fontWeight: 'bold', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            {SVGIcons.Clock} {task.allocated_hours || 0} {isEn ? 'hrs' : 'שעות'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

export default MySubmissions;