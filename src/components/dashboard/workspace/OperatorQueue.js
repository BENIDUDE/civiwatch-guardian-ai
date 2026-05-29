/**
 * @file OperatorQueue.js
 * @description The dedicated view for Operators. Displays personal triage tasks and assignments.
 * FIX: Added openCorrectionModal to props and passed it down to TaskRow for HITL corrections.
 */
import React, { useState } from 'react';
import TaskRow from './TaskRow'; 

const Icons = {
  Alert: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>,
  FileText: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
};

const inputStyle = { backgroundColor: '#0f172a', border: '1px solid #334155', color: '#cbd5e1', padding: '6px 10px', borderRadius: '8px', fontSize: '0.8rem', outline: 'none' };
const triageGridLayout = '1fr 1.2fr 2.5fr 1fr 1fr';
const assignmentGridLayout = '1fr 1.5fr 3fr 1fr'; 

const getCalculatedStatus = (report) => {
  let calcStatus = report.status || 'Pending';
  const aStatus = report.ai_vote_status || report.reports?.ai_vote_status;
  if (['New', 'Pending', 'In Progress'].includes(calcStatus) && aStatus && ['Changes Requested', 'Manual Review Required', 'AI Verified', 'AI Rejected'].includes(aStatus)) {
    calcStatus = aStatus;
  }
  return calcStatus;
};

// Added openCorrectionModal to the destructured props
const OperatorQueue = ({ reports, isEn, safeMode, teamMembers, userProfile, expandedLogs, onToggleLog, setImageModal, onStatusUpdate, openModal, openCorrectionModal }) => {
  const profileId = userProfile?.id;
  const uniquePlatforms = [...new Set((reports || []).map(r => r.platform || r.reports?.platform).filter(Boolean))];

  const [triageStart, setTriageStart] = useState('');
  const [triageEnd, setTriageEnd] = useState('');
  const [triageStatus, setTriageStatus] = useState('all');
  const [triagePlatform, setTriagePlatform] = useState('all');

  const [assignStart, setAssignStart] = useState('');
  const [assignEnd, setAssignEnd] = useState('');

  const applyDateFilter = (r, start, end) => {
    if (start && new Date(r.created_at) < new Date(start)) return false;
    if (end) {
      const e = new Date(end); e.setHours(23, 59, 59, 999);
      if (new Date(r.created_at) > e) return false;
    }
    return true;
  };

  const sortedReports = [...(reports || [])].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  
  const opTriageTasks = sortedReports.filter(r => {
    if (r._table === 'assignments') return false;
    const s = getCalculatedStatus(r);
    
    const completedStatuses = [
      'Takedown Successful', 'Appeal Successful', 'Pending Appeal', 'Appeal in Progress', 
      'Network Rejected', 'Appeal Rejected', 'Pending Network Action', 
      'Pending Review', 'Verified', 'Closed - Verified', 'AI Verified', 'AI Rejected'
    ];
    
    if (completedStatuses.includes(s)) return false;
    
    const isMySubmission = r.submitted_by === profileId || r.reports?.submitted_by === profileId;
    if (r.assigned_to && r.assigned_to !== profileId) return false;
    if (!r.assigned_to && !isMySubmission) return false;

    const lastNote = r.additional_info?.length > 0 ? r.additional_info[r.additional_info.length - 1] : null;
    if (s === 'Dismissed' && lastNote?.note === 'Task acknowledged by operator') return false;

    if (triageStatus !== 'all' && s !== triageStatus) return false;
    if (triagePlatform !== 'all' && (r.platform || 'other').toLowerCase() !== triagePlatform.toLowerCase()) return false;
    return applyDateFilter(r, triageStart, triageEnd);
  });

  const opAssignments = sortedReports.filter(r => {
    if (r._table !== 'assignments') return false;
    const s = getCalculatedStatus(r);
    if (['Pending Mod Review', 'Closed', 'Verified', 'Closed - Verified'].includes(s)) return false;
    if (r.assigned_to !== profileId) return false;
    return applyDateFilter(r, assignStart, assignEnd);
  });

  return (
    <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
      {/* --- OPERATOR TRIAGE TABLE --- */}
      <div style={{ overflowX: 'auto', marginBottom: '40px', backgroundColor: 'rgba(0,0,0,0.2)', padding: '15px', borderRadius: '12px', border: '1px solid #334155' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', paddingBottom: '10px', borderBottom: '1px solid #334155', flexWrap: 'wrap', gap: '10px' }}>
          <h4 style={{ margin: 0, color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: '8px' }}>{Icons.Alert} {isEn ? 'Triage Queue' : 'תור טריאז\''}</h4>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{color: '#94a3b8', fontSize: '0.8rem'}}>{isEn ? 'From:' : 'מ:'}</span>
            <input type="date" value={triageStart} onChange={(e) => setTriageStart(e.target.value)} style={{...inputStyle, padding: '4px 8px'}} />
            <span style={{color: '#94a3b8', fontSize: '0.8rem'}}>{isEn ? 'To:' : 'עד:'}</span>
            <input type="date" value={triageEnd} onChange={(e) => setTriageEnd(e.target.value)} style={{...inputStyle, padding: '4px 8px'}} />
            <select value={triageStatus} onChange={(e) => setTriageStatus(e.target.value)} style={inputStyle}>
              <option value="all">{isEn ? 'All Statuses' : 'כל הסטטוסים'}</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Changes Requested">Changes Requested</option>
            </select>
            <select value={triagePlatform} onChange={(e) => setTriagePlatform(e.target.value)} style={inputStyle}>
              <option value="all">{isEn ? 'All Platforms' : 'כל הפלטפורמות'}</option>
              {uniquePlatforms.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            {(triageStart || triageEnd || triageStatus !== 'all' || triagePlatform !== 'all') && (
              <button onClick={() => {setTriageStart(''); setTriageEnd(''); setTriageStatus('all'); setTriagePlatform('all');}} style={{ backgroundColor: 'transparent', color: '#94a3b8', border: '1px solid #475569', padding: '4px 8px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' }}>
                {isEn ? 'Clear' : 'נקה'}
              </button>
            )}
          </div>
        </div>
        
        {opTriageTasks.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#64748b', padding: '30px 0' }}>{isEn ? 'No Triage Tasks matching criteria.' : 'אין דיווחי טריאז התואמים לסינון.'}</div>
        ) : (
          <div style={{ color: '#fff', minWidth: '950px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: triageGridLayout, color: '#94a3b8', borderBottom: '1px solid #334155', paddingBottom: '10px', marginBottom: '10px', fontSize: '0.85rem', textTransform: 'uppercase' }}>
              <div>{isEn ? 'Date' : 'תאריך'}</div>
              <div>{isEn ? 'Source / Type' : 'מקור / סוג'}</div>
              <div>{isEn ? 'Evidence & Details' : 'ראיות ופרטים'}</div>
              <div>{isEn ? 'Status' : 'סטטוס'}</div>
              <div>{isEn ? 'Action' : 'פעולה'}</div>
            </div>
            {opTriageTasks.map(report => (
              <TaskRow 
                key={report.id} 
                report={report} 
                isEn={isEn} 
                isOperator={true} 
                modView="review" 
                safeMode={safeMode} 
                teamMembers={teamMembers} 
                userProfile={userProfile} 
                expandedLogs={expandedLogs} 
                onToggleLog={onToggleLog} 
                setImageModal={setImageModal} 
                onStatusUpdate={onStatusUpdate} 
                openModal={openModal} 
                openCorrectionModal={openCorrectionModal} 
                gridLayout={triageGridLayout} 
              />
            ))}
          </div>
        )}
      </div>

      {/* --- OPERATOR ASSIGNMENT TABLE --- */}
      <div style={{ overflowX: 'auto', backgroundColor: 'rgba(0,0,0,0.2)', padding: '15px', borderRadius: '12px', border: '1px solid #334155' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', paddingBottom: '10px', borderBottom: '1px solid #334155', flexWrap: 'wrap', gap: '10px' }}>
          <h4 style={{ margin: 0, color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: '8px' }}>{Icons.FileText} {isEn ? 'My Direct Assignments' : 'המשימות היזומות שלי'}</h4>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{color: '#94a3b8', fontSize: '0.8rem'}}>{isEn ? 'From:' : 'מ:'}</span>
            <input type="date" value={assignStart} onChange={(e) => setAssignStart(e.target.value)} style={{...inputStyle, padding: '4px 8px'}} />
            <span style={{color: '#94a3b8', fontSize: '0.8rem'}}>{isEn ? 'To:' : 'עד:'}</span>
            <input type="date" value={assignEnd} onChange={(e) => setAssignEnd(e.target.value)} style={{...inputStyle, padding: '4px 8px'}} />
            {(assignStart || assignEnd) && (
              <button onClick={() => {setAssignStart(''); setAssignEnd('');}} style={{ backgroundColor: 'transparent', color: '#94a3b8', border: '1px solid #475569', padding: '4px 8px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' }}>
                {isEn ? 'Clear' : 'נקה'}
              </button>
            )}
          </div>
        </div>
        
        {opAssignments.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#64748b', padding: '30px 0' }}>{isEn ? 'No pending assignments.' : 'אין משימות יזומות כרגע.'}</div>
        ) : (
          <div style={{ color: '#fff', minWidth: '950px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: assignmentGridLayout, color: '#94a3b8', borderBottom: '1px solid #334155', paddingBottom: '10px', marginBottom: '10px', fontSize: '0.85rem', textTransform: 'uppercase' }}>
              <div>{isEn ? 'Date' : 'תאריך'}</div>
              <div>{isEn ? 'Type' : 'סוג'}</div>
              <div>{isEn ? 'Assignment Details' : 'פרטי משימה'}</div>
              <div>{isEn ? 'Action' : 'פעולה'}</div>
            </div>
            {opAssignments.map(report => (
              <TaskRow 
                key={report.id} 
                report={report} 
                isEn={isEn} 
                isOperator={true} 
                modView="review" 
                safeMode={safeMode} 
                teamMembers={teamMembers} 
                userProfile={userProfile} 
                expandedLogs={expandedLogs} 
                onToggleLog={onToggleLog} 
                setImageModal={setImageModal} 
                onStatusUpdate={onStatusUpdate} 
                openModal={openModal} 
                openCorrectionModal={openCorrectionModal} 
                gridLayout={assignmentGridLayout} 
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OperatorQueue;