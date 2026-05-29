/**
 * @file AdminArchive.js
 * @description The historical data view for Admins/Moderators. 
 * Features role-based hierarchy filtering, ID search, and CSV/PDF export.
 */
import React, { useState } from 'react';

const Icons = {
  CheckCircle: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>,
  FileText: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>,
  Download: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>,
  FilePdf: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
};

const inputStyle = { backgroundColor: '#0f172a', border: '1px solid #334155', color: '#cbd5e1', padding: '6px 10px', borderRadius: '8px', fontSize: '0.8rem', outline: 'none' };
const ghostBtn = (hex, rgb) => ({ backgroundColor: `rgba(${rgb}, 0.1)`, color: hex, border: `1px solid rgba(${rgb}, 0.3)`, padding: '8px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', width: '100%' });

const getCalculatedStatus = (report) => {
  let calcStatus = report.status || 'Pending';
  const aStatus = report.ai_vote_status || report.reports?.ai_vote_status;
  if (['New', 'Pending', 'In Progress'].includes(calcStatus) && aStatus && ['Changes Requested', 'Manual Review Required', 'AI Verified', 'AI Rejected'].includes(aStatus)) {
    calcStatus = aStatus;
  }
  return calcStatus;
};

const getStatusColor = (status) => {
  switch (status) {
    case 'New': case 'Pending': case 'Manual Review Required': case 'Pending Appeal': return '#f59e0b'; 
    case 'In Progress': case 'Pending Network Action': case 'Appeal in Progress': case 'Pending Mod Review': return '#38bdf8'; 
    case 'Pending Review': return '#a855f7'; 
    case 'Changes Requested': case 'Dismissed': case 'Network Rejected': case 'Appeal Rejected': return '#ef4444'; 
    case 'Verified': case 'Closed - Verified': case 'Takedown Successful': case 'Appeal Successful': case 'Closed': return '#10b981'; 
    default: return '#94a3b8'; 
  }
};

const AdminArchive = ({ reports, isEn, safeMode, teamMembers, setImageModal, userProfile }) => {
  const isRtl = !isEn;
  const rowsPerPage = 50;

  // Permissions & Hierarchy
  const userRole = userProfile?.role?.toLowerCase()?.trim() || '';
  const isAdmin = ['ngo admin', 'global admin', 'super admin', 'admin', 'system admin'].includes(userRole);
  const isMod = userRole === 'moderator l2';
  const profileId = userProfile?.id;

  // Global Archive Filters
  const [searchId, setSearchId] = useState('');
  const [selectedMod, setSelectedMod] = useState('all');
  const [selectedOp, setSelectedOp] = useState('all');

  // Specific Table Filters
  const [archiveStart, setArchiveStart] = useState('');
  const [archiveEnd, setArchiveEnd] = useState('');
  const [archiveRes, setArchiveRes] = useState('all');
  const [archivePlatform, setArchivePlatform] = useState('all');
  const [archivePage, setArchivePage] = useState(1);

  const [archiveAssignStart, setArchiveAssignStart] = useState('');
  const [archiveAssignEnd, setArchiveAssignEnd] = useState('');

  // Team Logic
  const allModerators = (teamMembers || []).filter(m => m.role?.toLowerCase()?.trim() === 'moderator l2');
  let availableOperators = (teamMembers || []).filter(m => m.role?.toLowerCase()?.trim() === 'operator l1');

  if (isMod) {
    // If Moderator, only show operators assigned to them
    availableOperators = availableOperators.filter(m => m.manager_id === profileId || m.reports_to === profileId);
  } else if (isAdmin && selectedMod !== 'all') {
    // If Admin selects a specific Moderator, show only that Mod's team
    availableOperators = availableOperators.filter(m => m.manager_id === selectedMod || m.reports_to === selectedMod);
  }

  const applyFilters = (r, start, end) => {
    // 1. ID Search
    if (searchId && !r.id.toLowerCase().includes(searchId.toLowerCase())) return false;
    
    // 2. Date
    if (start && new Date(r.created_at) < new Date(start)) return false;
    if (end) {
      const e = new Date(end); e.setHours(23, 59, 59, 999);
      if (new Date(r.created_at) > e) return false;
    }

    // 3. Hierarchy 
    const assigned = r.assigned_to;
    if (isMod) {
      const myTeamIds = availableOperators.map(o => o.id);
      if (!myTeamIds.includes(assigned) && assigned !== profileId) return false;
      if (selectedOp !== 'all' && assigned !== selectedOp) return false;
    } else if (isAdmin) {
      if (selectedOp !== 'all') {
        if (assigned !== selectedOp) return false;
      } else if (selectedMod !== 'all') {
        const modTeamIds = availableOperators.map(o => o.id);
        if (!modTeamIds.includes(assigned) && assigned !== selectedMod) return false;
      }
    }

    return true;
  };

  const sortedReports = [...(reports || [])].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  const uniquePlatforms = [...new Set(sortedReports.map(r => r.platform || r.reports?.platform).filter(Boolean))];

  // 1. Threat Archive Data
  const archiveReportsData = sortedReports.filter(r => r._table !== 'assignments').filter(r => {
    const s = getCalculatedStatus(r);
    if (archiveRes !== 'all') {
      if (s !== archiveRes) return false;
    } else {
      if (!['Takedown Successful', 'Appeal Successful', 'Dismissed', 'Appeal Rejected', 'Verified', 'Closed - Verified'].includes(s)) return false;
    }
    if (archivePlatform !== 'all' && (r.platform || 'other').toLowerCase() !== archivePlatform.toLowerCase()) return false;
    return applyFilters(r, archiveStart, archiveEnd);
  });

  const totalArchivePages = Math.ceil(archiveReportsData.length / rowsPerPage);
  const currentArchiveData = archiveReportsData.slice((archivePage - 1) * rowsPerPage, archivePage * rowsPerPage);

  // 2. Assignment Archive Data
  const archiveAssignmentsData = sortedReports.filter(r => r._table === 'assignments').filter(r => {
    const s = getCalculatedStatus(r);
    if (!['Closed', 'Verified', 'Closed - Verified'].includes(s)) return false;
    return applyFilters(r, archiveAssignStart, archiveAssignEnd);
  });

  // Export Logic
  const handleExportArchiveCSV = () => {
    if (archiveReportsData.length === 0) return;
    const rows = [['ID', 'Date', 'Platform', 'Status', 'Evidence Link', 'Content/Details']];
    archiveReportsData.forEach(r => {
      rows.push([
        r.id, new Date(r.created_at).toLocaleDateString(), r.platform || 'N/A', r.status,
        r.image_url || r.drive_link || 'N/A', (r.content || '').replace(/"/g, '""') 
      ]);
    });
    const csvContent = rows.map(e => `"${e.join('","')}"`).join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a"); link.href = URL.createObjectURL(blob);
    link.download = `CiviWatch_Archive_Export_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
  };

  const handleExportArchivePDF = () => {
    if (archiveReportsData.length === 0) return;
    const printWindow = window.open('', '_blank');
    let htmlContent = `
      <html><head><title>CiviWatch Archive Export</title><style>
        body { font-family: Arial, sans-serif; padding: 20px; direction: ${isRtl ? 'rtl' : 'ltr'}; }
        h2 { color: #0f172a; } table { width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 20px; }
        th, td { border: 1px solid #cbd5e1; padding: 8px; text-align: left; }
        th { background-color: #f1f5f9; color: #0f172a; font-weight: bold; }
        tr:nth-child(even) { background-color: #f8fafc; } a { color: #38bdf8; text-decoration: none; }
      </style></head><body>
        <h2>CiviWatch Resolution Archive</h2>
        <p>Generated: ${new Date().toLocaleDateString()}</p>
        <p>Total Records: ${archiveReportsData.length}</p>
        <table><thead><tr><th>ID</th><th>Date</th><th>Platform</th><th>Status</th><th>Evidence</th><th>Content Details</th></tr></thead><tbody>
    `;

    archiveReportsData.forEach(r => {
      const linkHtml = (r.image_url || r.drive_link) ? `<a href="${r.image_url || r.drive_link}" target="_blank">View Evidence</a>` : 'N/A';
      htmlContent += `<tr><td>${r.id}</td><td>${new Date(r.created_at).toLocaleDateString()}</td><td>${r.platform || 'N/A'}</td><td style="color: ${getStatusColor(r.status)}; font-weight:bold;">${r.status}</td><td>${linkHtml}</td><td>${r.content || ''}</td></tr>`;
    });

    htmlContent += `</tbody></table></body></html>`;
    printWindow.document.write(htmlContent); printWindow.document.close(); printWindow.focus();
    setTimeout(() => { printWindow.print(); }, 500);
  };

  return (
    <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
      
      {/* GLOBAL ARCHIVE CONTROL BAR */}
      <div style={{ backgroundColor: 'rgba(30, 41, 59, 0.4)', borderRadius: '12px', padding: '15px', border: '1px solid #334155', marginBottom: '20px', display: 'flex', gap: '15px', flexWrap: 'wrap', alignItems: 'center' }}>
        <input 
          type="text" 
          placeholder={isEn ? "Search by Report ID..." : "חפש לפי מזהה דיווח..."} 
          value={searchId} 
          onChange={(e) => {setSearchId(e.target.value); setArchivePage(1);}} 
          style={{ ...inputStyle, width: '200px' }} 
        />
        
        {isAdmin && (
          <select value={selectedMod} onChange={(e) => {setSelectedMod(e.target.value); setSelectedOp('all'); setArchivePage(1);}} style={inputStyle}>
            <option value="all">{isEn ? 'All Moderators' : 'כל מנהלי הצוותים'}</option>
            {allModerators.map(m => <option key={m.id} value={m.id}>{m.display_name || m.email}</option>)}
          </select>
        )}

        <select value={selectedOp} onChange={(e) => {setSelectedOp(e.target.value); setArchivePage(1);}} style={inputStyle}>
          <option value="all">{isEn ? 'All Team Operators' : 'כל מפעילי הצוות'}</option>
          {availableOperators.map(o => <option key={o.id} value={o.id}>{o.display_name || o.email}</option>)}
        </select>

        {(searchId || selectedMod !== 'all' || selectedOp !== 'all') && (
          <button onClick={() => {setSearchId(''); setSelectedMod('all'); setSelectedOp('all');}} style={{ backgroundColor: 'transparent', color: '#ef4444', border: '1px solid #ef4444', padding: '4px 8px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' }}>
            {isEn ? 'Clear Team Filters' : 'נקה סינון צוות'}
          </button>
        )}
      </div>

      {/* THREATS ARCHIVE */}
      <div style={{ overflowX: 'auto', backgroundColor: 'rgba(15, 23, 42, 0.4)', borderRadius: '12px', border: '1px solid #334155', marginBottom: '40px' }}>
        <div style={{ padding: '15px 30px', borderBottom: '1px solid rgba(255,255,255,0.05)', backgroundColor: 'rgba(30, 41, 59, 0.5)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
          <h4 style={{ margin: 0, color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            {Icons.CheckCircle} {isEn ? 'Threat Resolution Archive' : 'ארכיון הסרות ודחיות'}
          </h4>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{color: '#94a3b8', fontSize: '0.8rem'}}>{isEn?'From:':'מ:'}</span>
            <input type="date" value={archiveStart} onChange={(e) => {setArchiveStart(e.target.value); setArchivePage(1);}} style={{...inputStyle, padding: '4px 8px'}} />
            <span style={{color: '#94a3b8', fontSize: '0.8rem'}}>{isEn?'To:':'עד:'}</span>
            <input type="date" value={archiveEnd} onChange={(e) => {setArchiveEnd(e.target.value); setArchivePage(1);}} style={{...inputStyle, padding: '4px 8px'}} />
            <select value={archiveRes} onChange={(e) => {setArchiveRes(e.target.value); setArchivePage(1);}} style={inputStyle}>
              <option value="all">{isEn ? 'All Resolutions' : 'כל הסטטוסים'}</option>
              <option value="Takedown Successful">Takedown Successful</option>
              <option value="Appeal Successful">Appeal Successful</option>
              <option value="Dismissed">Dismissed (Internal)</option>
              <option value="Appeal Rejected">Appeal Rejected</option>
            </select>
            <select value={archivePlatform} onChange={(e) => {setArchivePlatform(e.target.value); setArchivePage(1);}} style={inputStyle}>
              <option value="all">{isEn ? 'All Platforms' : 'כל הפלטפורמות'}</option>
              {uniquePlatforms.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            <button onClick={handleExportArchiveCSV} disabled={archiveReportsData.length === 0} style={{ ...ghostBtn('#38bdf8', '56, 189, 248'), width: 'auto', padding: '6px 10px' }}>{Icons.Download} CSV</button>
            <button onClick={handleExportArchivePDF} disabled={archiveReportsData.length === 0} style={{ ...ghostBtn('#f43f5e', '244, 63, 94'), width: 'auto', padding: '6px 10px' }}>{Icons.FilePdf} PDF</button>
            {(archiveStart || archiveEnd || archiveRes !== 'all' || archivePlatform !== 'all') && (
              <button onClick={() => {setArchiveStart(''); setArchiveEnd(''); setArchiveRes('all'); setArchivePlatform('all'); setArchivePage(1);}} style={{ backgroundColor: 'transparent', color: '#94a3b8', border: '1px solid #475569', padding: '4px 8px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' }}>
                {isEn ? 'Clear' : 'נקה'}
              </button>
            )}
          </div>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', color: '#e2e8f0', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #334155', backgroundColor: 'rgba(30, 41, 59, 0.8)', textAlign: isRtl ? 'right' : 'left' }}>
              <th style={{ padding: '12px 15px' }}>{isEn ? 'Report ID' : 'מזהה דיווח'}</th>
              <th style={{ padding: '12px 15px' }}>{isEn ? 'Date' : 'תאריך'}</th>
              <th style={{ padding: '12px 15px' }}>{isEn ? 'Evidence' : 'ראייה'}</th>
              <th style={{ padding: '12px 15px' }}>{isEn ? 'Platform' : 'רשת'}</th>
              <th style={{ padding: '12px 15px', maxWidth: '300px' }}>{isEn ? 'Content Snippet' : 'תוכן'}</th>
              <th style={{ padding: '12px 15px' }}>{isEn ? 'Status' : 'סטטוס'}</th>
            </tr>
          </thead>
          <tbody>
            {currentArchiveData.length === 0 ? (
              <tr><td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>{isEn ? 'No archived threats found.' : 'לא נמצאו דיווחים בארכיון.'}</td></tr>
            ) : currentArchiveData.map(report => {
              const platformData = report.platform || report.reports?.platform || 'Unknown';
              return (
                <tr key={report.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '12px 15px', color: '#94a3b8', fontFamily: 'monospace' }}>{report.id.split('-')[0]}</td>
                  <td style={{ padding: '12px 15px', whiteSpace: 'nowrap' }}>{new Date(report.created_at).toLocaleDateString()}</td>
                  <td style={{ padding: '12px 15px' }}>
                    {report.image_url ? (
                      <div onClick={() => setImageModal({ isOpen: true, src: report.image_url })} style={{ width: '30px', height: '30px', borderRadius: '4px', overflow: 'hidden', cursor: 'pointer' }}>
                        <img src={report.image_url} alt="Ev" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: safeMode ? 'blur(8px)' : 'none' }} />
                      </div>
                    ) : <span style={{ color: '#475569' }}>N/A</span>}
                  </td>
                  <td style={{ padding: '12px 15px', color: '#38bdf8' }}>{platformData}</td>
                  <td style={{ padding: '12px 15px', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{report.content}</td>
                  <td style={{ padding: '12px 15px' }}><span style={{ backgroundColor: getStatusColor(report.status) + '22', color: getStatusColor(report.status), padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold' }}>{report.status}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {totalArchivePages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '15px', gap: '15px', borderTop: '1px solid #334155' }}>
            <button onClick={() => setArchivePage(p => Math.max(1, p - 1))} disabled={archivePage === 1} style={{ backgroundColor: 'transparent', color: archivePage === 1 ? '#475569' : '#38bdf8', border: '1px solid #334155', padding: '6px 12px', borderRadius: '6px', cursor: archivePage === 1 ? 'not-allowed' : 'pointer' }}>{isEn ? 'Prev' : 'הקודם'}</button>
            <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>{archivePage} / {totalArchivePages}</span>
            <button onClick={() => setArchivePage(p => Math.min(totalArchivePages, p + 1))} disabled={archivePage === totalArchivePages} style={{ backgroundColor: 'transparent', color: archivePage === totalArchivePages ? '#475569' : '#38bdf8', border: '1px solid #334155', padding: '6px 12px', borderRadius: '6px', cursor: archivePage === totalArchivePages ? 'not-allowed' : 'pointer' }}>{isEn ? 'Next' : 'הבא'}</button>
          </div>
        )}
      </div>

      {/* COMPLETED ASSIGNMENTS ARCHIVE */}
      <div style={{ overflowX: 'auto', backgroundColor: 'rgba(15, 23, 42, 0.4)', borderRadius: '12px', border: '1px solid #334155' }}>
        <div style={{ padding: '15px 30px', borderBottom: '1px solid rgba(255,255,255,0.05)', backgroundColor: 'rgba(30, 41, 59, 0.5)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
          <h4 style={{ margin: 0, color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            {Icons.FileText} {isEn ? 'Completed Assignments Archive' : 'ארכיון משימות יזומות שהושלמו'}
          </h4>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <span style={{color: '#94a3b8', fontSize: '0.8rem'}}>{isEn?'From:':'מ:'}</span>
            <input type="date" value={archiveAssignStart} onChange={(e) => setArchiveAssignStart(e.target.value)} style={{...inputStyle, padding: '4px 8px'}} />
            <span style={{color: '#94a3b8', fontSize: '0.8rem'}}>{isEn?'To:':'עד:'}</span>
            <input type="date" value={archiveAssignEnd} onChange={(e) => setArchiveAssignEnd(e.target.value)} style={{...inputStyle, padding: '4px 8px'}} />
            {(archiveAssignStart || archiveAssignEnd) && (
              <button onClick={() => {setArchiveAssignStart(''); setArchiveAssignEnd('');}} style={{ backgroundColor: 'transparent', color: '#94a3b8', border: '1px solid #475569', padding: '4px 8px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' }}>
                {isEn ? 'Clear' : 'נקה'}
              </button>
            )}
          </div>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', color: '#e2e8f0', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #334155', backgroundColor: 'rgba(30, 41, 59, 0.8)', textAlign: isRtl ? 'right' : 'left' }}>
              <th style={{ padding: '12px 15px' }}>{isEn ? 'Assignment ID' : 'מזהה משימה'}</th>
              <th style={{ padding: '12px 15px' }}>{isEn ? 'Date' : 'תאריך'}</th>
              <th style={{ padding: '12px 15px' }}>{isEn ? 'Assigned To' : 'משויך ל'}</th>
              <th style={{ padding: '12px 15px', maxWidth: '400px' }}>{isEn ? 'Details' : 'פרטים'}</th>
              <th style={{ padding: '12px 15px' }}>{isEn ? 'Status' : 'סטטוס'}</th>
            </tr>
          </thead>
          <tbody>
            {archiveAssignmentsData.length === 0 ? (
              <tr><td colSpan="5" style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>{isEn ? 'No completed assignments found.' : 'לא נמצאו משימות יזומות שהושלמו.'}</td></tr>
            ) : archiveAssignmentsData.map(report => {
              const submitterObj = (teamMembers || []).find(m => m.id === report.assigned_to);
              return (
                <tr key={report.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '12px 15px', color: '#94a3b8', fontFamily: 'monospace' }}>{report.id.split('-')[0]}</td>
                  <td style={{ padding: '12px 15px', whiteSpace: 'nowrap' }}>{new Date(report.created_at).toLocaleDateString()}</td>
                  <td style={{ padding: '12px 15px', color: '#a855f7' }}>{submitterObj ? submitterObj.display_name || submitterObj.email.split('@')[0] : 'Unknown'}</td>
                  <td style={{ padding: '12px 15px', maxWidth: '400px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{report.description || report.content}</td>
                  <td style={{ padding: '12px 15px' }}><span style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold' }}>{report.status}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminArchive;