/**
 * @file AdminQAQueue.js
 * @description The dedicated QA view for Moderators/Admins. Displays ONLY triage approvals.
 * FIX: Passed 'openReviewModal' through the component props to enable the Moderator's 
 * "Review Fix" HITL workflow in TaskRow.
 */
import React, { useState } from 'react';
import TaskRow from './TaskRow';

const Icons = {
  Alert: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>,
  Search: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
};

const inputStyle = { backgroundColor: '#0f172a', border: '1px solid #334155', color: '#cbd5e1', padding: '6px 10px', borderRadius: '8px', fontSize: '0.8rem', outline: 'none' };

// NEW 6-COLUMN LAYOUT: ID | Date & Time | Source | Submitter | Content | Actions
const triageGridLayout = '0.8fr 1.2fr 1.2fr 1.5fr 3fr 1.2fr';

const getCalculatedStatus = (report) => {
  let calcStatus = report.status || 'Pending';
  const aStatus = report.ai_vote_status || report.reports?.ai_vote_status;
  if (['New', 'Pending', 'In Progress'].includes(calcStatus) && aStatus && ['Changes Requested', 'Manual Review Required', 'AI Verified', 'AI Rejected'].includes(aStatus)) {
    calcStatus = aStatus;
  }
  return calcStatus;
};

// ADDED: 'openReviewModal' to destructured props list
const AdminQAQueue = ({ reports, isEn, safeMode, teamMembers, userProfile, expandedLogs, onToggleLog, setImageModal, onStatusUpdate, openModal, onAssignReport, openReviewModal }) => {
  
  const [triageStart, setTriageStart] = useState('');
  const [triageEnd, setTriageEnd] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // --- ROLE BASED ACCESS CONTROL (RBAC) ---
  const userRole = userProfile?.role?.toLowerCase()?.trim() || '';
  const isAdmin = ['super admin', 'global admin', 'admin'].includes(userRole);
  const isModerator = userRole.includes('moderator');

  const applyDateFilter = (r, start, end) => {
    if (start && new Date(r.created_at) < new Date(start)) return false;
    if (end) {
      const e = new Date(end); e.setHours(23, 59, 59, 999);
      if (new Date(r.created_at) > e) return false;
    }
    return true;
  };

  const applySearchFilter = (r, query) => {
    if (!query) return true;
    const q = query.toLowerCase();
    // Search by ID, Content string, or Tags
    if (String(r.id).toLowerCase().includes(q)) return true;
    if (String(r.content).toLowerCase().includes(q)) return true;
    if (r.tags && r.tags.some(tag => String(tag).toLowerCase().includes(q))) return true;
    return false;
  };

  const sortedReports = [...(reports || [])].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  // Apply filters: Type -> Role-Based Status -> Date -> Search Bar
  const modReviewTriage = sortedReports.filter(r => {
    if (r._table === 'assignments') return false;
    const s = getCalculatedStatus(r);
    
    // Moderators see standard QA
    if (isModerator && ['Pending Review', 'Manual Review Required'].includes(s)) return true;
    
    // Admins see Appeals/Rejections
    if (isAdmin && ['Network Rejected', 'Appeal Rejected'].includes(s)) return true;

    return false; // Filter everything else out
  })
  .filter(r => applyDateFilter(r, triageStart, triageEnd))
  .filter(r => applySearchFilter(r, searchQuery));

  return (
    <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
      
      <div style={{ overflowX: 'auto', marginBottom: '40px', backgroundColor: 'rgba(0,0,0,0.2)', padding: '15px', borderRadius: '12px', border: '1px solid #334155' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', paddingBottom: '10px', borderBottom: '1px solid #334155', flexWrap: 'wrap', gap: '10px' }}>
          <h4 style={{ margin: 0, color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            {Icons.Alert} {isEn ? 'Triage Approvals' : 'אישורי טריאז\''}
          </h4>
          
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
            
            {/* SEARCH BAR */}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <span style={{ position: 'absolute', left: '10px', color: '#64748b', pointerEvents: 'none' }}>{Icons.Search}</span>
              <input 
                type="text" 
                placeholder={isEn ? "Search ID, tag, or content..." : "חפש מזהה, תגית, או תוכן..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{...inputStyle, paddingLeft: '32px', minWidth: '200px'}}
              />
            </div>

            <div style={{ width: '1px', height: '24px', backgroundColor: '#334155', margin: '0 5px' }}></div>

            <span style={{color: '#94a3b8', fontSize: '0.8rem'}}>{isEn?'From:':'מ:'}</span>
            <input type="date" value={triageStart} onChange={(e) => setTriageStart(e.target.value)} style={{...inputStyle, padding: '4px 8px'}} />
            <span style={{color: '#94a3b8', fontSize: '0.8rem'}}>{isEn?'To:':'עד:'}</span>
            <input type="date" value={triageEnd} onChange={(e) => setTriageEnd(e.target.value)} style={{...inputStyle, padding: '4px 8px'}} />
            
            {(triageStart || triageEnd || searchQuery) && (
              <button onClick={() => {setTriageStart(''); setTriageEnd(''); setSearchQuery('');}} style={{ backgroundColor: 'transparent', color: '#94a3b8', border: '1px solid #475569', padding: '4px 8px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' }}>
                {isEn ? 'Clear' : 'נקה'}
              </button>
            )}
          </div>
        </div>
        
        {modReviewTriage.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#64748b', padding: '30px 0' }}>
             {searchQuery ? (isEn ? 'No reports match your search.' : 'אין דיווחים התואמים לחיפוש שלך.') : (isEn ? 'No reports in this queue.' : 'אין דיווחים בתור זה.')}
          </div>
        ) : (
          <div style={{ color: '#fff', minWidth: '950px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: triageGridLayout, color: '#94a3b8', borderBottom: '1px solid #334155', paddingBottom: '10px', marginBottom: '10px', fontSize: '0.85rem', textTransform: 'uppercase', alignItems: 'center' }}>
              <div>{isEn ? 'ID' : 'מזהה'}</div>
              <div>{isEn ? 'Date & Time' : 'תאריך ושעה'}</div>
              <div>{isEn ? 'Source / Type' : 'מקור / סוג'}</div>
              <div>{isEn ? 'Submitted By' : 'הוגש ע"י'}</div>
              <div>{isEn ? 'Evidence & Details' : 'ראיות ופרטים'}</div>
              <div>{isEn ? 'Actions' : 'פעולות'}</div>
            </div>
            {modReviewTriage.map(report => (
              <TaskRow 
                key={report.id} 
                report={report} 
                isEn={isEn} 
                isOperator={false} 
                modView="review" 
                safeMode={safeMode} 
                teamMembers={teamMembers} 
                userProfile={userProfile} 
                expandedLogs={expandedLogs} 
                onToggleLog={onToggleLog} 
                setImageModal={setImageModal} 
                onStatusUpdate={onStatusUpdate} 
                openModal={openModal} 
                onAssignReport={onAssignReport} 
                openReviewModal={openReviewModal} // <--- ADDED HERE
                gridLayout={triageGridLayout} 
                isSplitDateTime={true} 
              />
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default AdminQAQueue;