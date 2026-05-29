/**
 * @file AdminTeamQueue.js
 * @description The dedicated management view for Admins/Moderators to monitor the team's active tasks.
 */
import React, { useState } from 'react';
import TaskRow from './TaskRow';

const Icons = {
  Alert: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>,
  FileText: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>,
  CheckCircle: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
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

const AdminTeamQueue = ({ reports, isEn, safeMode, teamMembers, userProfile, expandedLogs, onToggleLog, setImageModal, onStatusUpdate, openModal, onAssignReport }) => {
  
  const [triageStart, setTriageStart] = useState('');
  const [triageEnd, setTriageEnd] = useState('');
  const [triageStatus, setTriageStatus] = useState('all');
  const [triagePlatform, setTriagePlatform] = useState('all');
  const [triageOperator, setTriageOperator] = useState('all');

  const [assignStart, setAssignStart] = useState('');
  const [assignEnd, setAssignEnd] = useState('');
  const [assignOperator, setAssignOperator] = useState('all');

  const applyDateFilter = (r, start, end) => {
    if (start && new Date(r.created_at) < new Date(start)) return false;
    if (end) {
      const e = new Date(end); e.setHours(23, 59, 59, 999);
      if (new Date(r.created_at) > e) return false;
    }
    return true;
  };

  const sortedReports = [...(reports || [])].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  const uniquePlatforms = [...new Set(sortedReports.map(r => r.platform || r.reports?.platform).filter(Boolean))];
  const operatorTeam = (teamMembers || []).filter(m => m.role?.toLowerCase()?.trim() === 'operator l1');

  const baseTriage = sortedReports.filter(r => r._table !== 'assignments');
  const baseAssign = sortedReports.filter(r => r._table === 'assignments');

  // 1. Team Triage Queue
  const modTeamTriage = baseTriage.filter(r => {
    const s = getCalculatedStatus(r);
    if (!['New', 'Pending', 'In Progress', 'Changes Requested'].includes(s)) return false;
    if (triageStatus !== 'all' && s !== triageStatus) return false;
    if (triagePlatform !== 'all' && (r.platform || 'other').toLowerCase() !== triagePlatform.toLowerCase()) return false;
    if (triageOperator !== 'all' && r.assigned_to !== triageOperator) return false;
    return true;
  }).filter(r => applyDateFilter(r, triageStart, triageEnd));

  // 2. Active Team Assignments
  const modTeamAssignments = baseAssign.filter(r => {
    const s = getCalculatedStatus(r);
    if (!['New', 'Pending', 'In Progress'].includes(s)) return false;
    if (assignOperator !== 'all' && r.assigned_to !== assignOperator) return false;
    return true;
  }).filter(r => applyDateFilter(r, assignStart, assignEnd));

  // 3. Assignments Awaiting Acknowledgment
  const modAwaitingAck = baseAssign.filter(r => getCalculatedStatus(r) === 'Pending Mod Review')
    .filter(r => applyDateFilter(r, assignStart, assignEnd));

  return (
    <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
      
      {/* --- ADMIN TRIAGE TABLE --- */}
      <div style={{ overflowX: 'auto', marginBottom: '40px', backgroundColor: 'rgba(0,0,0,0.2)', padding: '15px', borderRadius: '12px', border: '1px solid #334155' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', paddingBottom: '10px', borderBottom: '1px solid #334155', flexWrap: 'wrap', gap: '10px' }}>
          <h4 style={{ margin: 0, color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            {Icons.Alert} {isEn ? 'Team Triage Queue' : 'תור טריאז\' צוותי'}
          </h4>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{color: '#94a3b8', fontSize: '0.8rem'}}>{isEn?'From:':'מ:'}</span>
            <input type="date" value={triageStart} onChange={(e) => setTriageStart(e.target.value)} style={{...inputStyle, padding: '4px 8px'}} />
            <span style={{color: '#94a3b8', fontSize: '0.8rem'}}>{isEn?'To:':'עד:'}</span>
            <input type="date" value={triageEnd} onChange={(e) => setTriageEnd(e.target.value)} style={{...inputStyle, padding: '4px 8px'}} />
            
            <select value={triageStatus} onChange={(e) => setTriageStatus(e.target.value)} style={inputStyle}>
              <option value="all">{isEn ? 'All Statuses' : 'כל הסטטוסים'}</option>
              <option value="New">New</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Changes Requested">Changes Requested</option>
            </select>
            <select value={triagePlatform} onChange={(e) => setTriagePlatform(e.target.value)} style={inputStyle}>
              <option value="all">{isEn ? 'All Platforms' : 'כל הפלטפורמות'}</option>
              {uniquePlatforms.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            <select value={triageOperator} onChange={(e) => setTriageOperator(e.target.value)} style={inputStyle}>
              <option value="all">{isEn ? 'All Operators' : 'כל המפעילים'}</option>
              {operatorTeam.map(member => <option key={member.id} value={member.id}>{member.display_name || member.email}</option>)}
            </select>

            {(triageStart || triageEnd || triageStatus !== 'all' || triagePlatform !== 'all' || triageOperator !== 'all') && (
              <button onClick={() => {setTriageStart(''); setTriageEnd(''); setTriageStatus('all'); setTriagePlatform('all'); setTriageOperator('all');}} style={{ backgroundColor: 'transparent', color: '#94a3b8', border: '1px solid #475569', padding: '4px 8px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' }}>
                {isEn ? 'Clear' : 'נקה'}
              </button>
            )}
          </div>
        </div>
        
        {modTeamTriage.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#64748b', padding: '30px 0' }}>{isEn ? 'No reports matching filters.' : 'אין דיווחים התואמים לסינון.'}</div>
        ) : (
          <div style={{ color: '#fff', minWidth: '950px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: triageGridLayout, color: '#94a3b8', borderBottom: '1px solid #334155', paddingBottom: '10px', marginBottom: '10px', fontSize: '0.85rem', textTransform: 'uppercase' }}>
              <div>{isEn ? 'Date' : 'תאריך'}</div>
              <div>{isEn ? 'Source / Type' : 'מקור / סוג'}</div>
              <div>{isEn ? 'Submitted By' : 'הוגש ע"י'}</div>
              <div>{isEn ? 'Evidence & Details' : 'ראיות ופרטים'}</div>
              <div>{isEn ? 'Status' : 'סטטוס'}</div>
              <div>{isEn ? 'Assigned To' : 'משויך ל'}</div>
            </div>
            {modTeamTriage.map(report => (
              <TaskRow key={report.id} report={report} isEn={isEn} isOperator={false} modView="team" safeMode={safeMode} teamMembers={teamMembers} userProfile={userProfile} expandedLogs={expandedLogs} onToggleLog={onToggleLog} setImageModal={setImageModal} onStatusUpdate={onStatusUpdate} openModal={openModal} onAssignReport={onAssignReport} gridLayout={triageGridLayout} />
            ))}
          </div>
        )}
      </div>

      {/* --- ADMIN PENDING MOD REVIEW (Assignments Waiting Ack) --- */}
      {modAwaitingAck.length > 0 && (
        <div style={{ overflowX: 'auto', marginBottom: '40px', backgroundColor: 'rgba(16, 185, 129, 0.05)', padding: '15px', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', paddingBottom: '10px', borderBottom: '1px solid rgba(16, 185, 129, 0.3)' }}>
            <h4 style={{ margin: 0, color: '#10b981', display: 'flex', alignItems: 'center', gap: '8px' }}>
              {Icons.CheckCircle} {isEn ? 'Assignments Awaiting Acknowledgment' : 'משימות הממתינות לאישור סגירה'}
            </h4>
          </div>
          <div style={{ color: '#fff', minWidth: '950px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: assignmentGridLayout, color: '#94a3b8', borderBottom: '1px solid rgba(16, 185, 129, 0.3)', paddingBottom: '10px', marginBottom: '10px', fontSize: '0.85rem', textTransform: 'uppercase' }}>
              <div>{isEn ? 'Date' : 'תאריך'}</div>
              <div>{isEn ? 'Assigned Operator' : 'שם המפעיל'}</div>
              <div>{isEn ? 'Assignment Details' : 'פרטי משימה'}</div>
              <div>{isEn ? 'Action' : 'פעולה'}</div>
            </div>
            {modAwaitingAck.map(report => (
              <TaskRow key={report.id} report={report} isEn={isEn} isOperator={false} modView="team" safeMode={safeMode} teamMembers={teamMembers} userProfile={userProfile} expandedLogs={expandedLogs} onToggleLog={onToggleLog} setImageModal={setImageModal} onStatusUpdate={onStatusUpdate} openModal={openModal} onAssignReport={onAssignReport} gridLayout={assignmentGridLayout} />
            ))}
          </div>
        </div>
      )}

      {/* --- ADMIN ACTIVE ASSIGNMENT QUEUE --- */}
      <div style={{ overflowX: 'auto', backgroundColor: 'rgba(0,0,0,0.2)', padding: '15px', borderRadius: '12px', border: '1px solid #334155' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', paddingBottom: '10px', borderBottom: '1px solid #334155', flexWrap: 'wrap', gap: '10px' }}>
          <h4 style={{ margin: 0, color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            {Icons.FileText} {isEn ? 'Active Team Assignments' : 'משימות יזומות פעילות בצוות'}
          </h4>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{color: '#94a3b8', fontSize: '0.8rem'}}>{isEn?'From:':'מ:'}</span>
            <input type="date" value={assignStart} onChange={(e) => setAssignStart(e.target.value)} style={{...inputStyle, padding: '4px 8px'}} />
            <span style={{color: '#94a3b8', fontSize: '0.8rem'}}>{isEn?'To:':'עד:'}</span>
            <input type="date" value={assignEnd} onChange={(e) => setAssignEnd(e.target.value)} style={{...inputStyle, padding: '4px 8px'}} />
            <select value={assignOperator} onChange={(e) => setAssignOperator(e.target.value)} style={inputStyle}>
              <option value="all">{isEn ? 'All Operators' : 'כל המפעילים'}</option>
              {operatorTeam.map(member => <option key={member.id} value={member.id}>{member.display_name || member.email}</option>)}
            </select>
            {(assignStart || assignEnd || assignOperator !== 'all') && (
              <button onClick={() => {setAssignStart(''); setAssignEnd(''); setAssignOperator('all');}} style={{ backgroundColor: 'transparent', color: '#94a3b8', border: '1px solid #475569', padding: '4px 8px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' }}>
                {isEn ? 'Clear' : 'נקה'}
              </button>
            )}
          </div>
        </div>
        
        {modTeamAssignments.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#64748b', padding: '30px 0' }}>{isEn ? 'No active assignments in this view.' : 'אין משימות יזומות פעילות.'}</div>
        ) : (
          <div style={{ color: '#fff', minWidth: '950px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: assignmentGridLayout, color: '#94a3b8', borderBottom: '1px solid #334155', paddingBottom: '10px', marginBottom: '10px', fontSize: '0.85rem', textTransform: 'uppercase' }}>
              <div>{isEn ? 'Date' : 'תאריך'}</div>
              <div>{isEn ? 'Assigned Operator' : 'שם המפעיל'}</div>
              <div>{isEn ? 'Assignment Details' : 'פרטי משימה'}</div>
              <div>{isEn ? 'Assigned To / Action' : 'משויך ל / פעולה'}</div>
            </div>
            {modTeamAssignments.map(report => (
              <TaskRow key={report.id} report={report} isEn={isEn} isOperator={false} modView="team" safeMode={safeMode} teamMembers={teamMembers} userProfile={userProfile} expandedLogs={expandedLogs} onToggleLog={onToggleLog} setImageModal={setImageModal} onStatusUpdate={onStatusUpdate} openModal={openModal} onAssignReport={onAssignReport} gridLayout={assignmentGridLayout} />
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default AdminTeamQueue;