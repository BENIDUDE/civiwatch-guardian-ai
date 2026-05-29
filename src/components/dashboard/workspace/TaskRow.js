/**
 * @file TaskRow.js
 * @description A shared, reusable component that renders a single task or assignment row.
 * FIX: Restored missing 'inputStyle' constant. Implemented HITL correction logic.
 */
import React from 'react';
import CaseFileExport from '../CaseFileExport';
import AIAuditPanel from '../AIAuditPanel';

// --- ICONS ---
const Icons = {
  CheckCircle: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>,
  User: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>,
  Link: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>,
  Clock: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>,
  Alert: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>,
  Bot: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="10" rx="2"></rect><circle cx="12" cy="5" r="2"></circle><path d="M12 7v4"></path><line x1="8" y1="16" x2="8" y2="16"></line><line x1="16" y1="16" x2="16" y2="16"></line></svg>,
  XCircle: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>,
  ArrowUp: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="16 12 12 8 8 12"></polyline><line x1="12" y1="16" x2="12" y2="8"></line></svg>,
  Eye: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>,
  CornerUp: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 14 4 9 9 4"></polyline><path d="M20 20v-7a4 4 0 0 0-4-4H4"></path></svg>,
  Trash: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>,
  FileText: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>,
  Activity: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>,
  Edit: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
};

// --- STYLING HELPERS ---
const solidBtn = (color) => ({ backgroundColor: color, color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', width: '100%', boxShadow: '0 2px 4px rgba(0,0,0,0.15)' });
const ghostBtn = (hex, rgb) => ({ backgroundColor: `rgba(${rgb}, 0.1)`, color: hex, border: `1px solid rgba(${rgb}, 0.3)`, padding: '8px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', width: '100%' });
const inputStyle = { backgroundColor: '#0f172a', border: '1px solid #334155', color: '#cbd5e1', padding: '6px 10px', borderRadius: '8px', fontSize: '0.8rem', outline: 'none' };

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

const getCalculatedStatus = (report) => {
  let calcStatus = report.status || 'Pending';
  const aStatus = report.ai_vote_status || report.reports?.ai_vote_status;
  if (['New', 'Pending', 'In Progress'].includes(calcStatus) && aStatus && ['Changes Requested', 'Manual Review Required', 'AI Verified', 'AI Rejected'].includes(aStatus)) {
    calcStatus = aStatus;
  }
  return calcStatus;
};

const TaskRow = ({
  report,
  isEn,
  isOperator,
  modView,
  safeMode,
  teamMembers,
  userProfile,
  expandedLogs,
  onToggleLog,
  setImageModal,
  onStatusUpdate,
  openModal,
  onAssignReport,
  gridLayout,
  isSplitDateTime = false,
  openCorrectionModal = () => {}, // Safe Fallback
  openReviewModal = () => {}      // Safe Fallback
}) => {
  const isAssignment = report._table === 'assignments';
  
  // X-RAY FIX: Look for data in all possible nested locations
  const aiReasoningData = report.ai_reasoning || report.reports?.ai_reasoning || report.report?.ai_reasoning;
  const hasAILog = aiReasoningData !== null && aiReasoningData !== undefined && String(aiReasoningData).trim().length > 0;
  
  const platformData = report.platform || report.reports?.platform;
  const contentData = isAssignment ? (report.description || report.content) : (report.content || report.reports?.content);
  const categoryData = report.category || report.reports?.category;
  const imageData = report.image_url || report.reports?.image_url;
  const driveLink = report.drive_link || report.reports?.drive_link;
  const originalSubmitter = report.submitted_by || report.reports?.submitted_by;
  
  const allocatedHours = report.allocated_hours;
  const currentStatus = getCalculatedStatus(report);

  // --- ROLE BASED ACCESS CONTROL (RBAC) ---
  const userRole = userProfile?.role?.toLowerCase()?.trim() || '';
  const isAdmin = ['super admin', 'global admin', 'admin'].includes(userRole);
  const isModerator = userRole.includes('moderator');

  const submitterId = report.assigned_to || originalSubmitter;
  const submitterObj = (teamMembers || []).find(m => m.id === submitterId || m.email === submitterId);
  const submitterName = submitterObj ? (submitterObj.display_name || submitterObj.email.split('@')[0]) : (isEn ? 'System / Auto' : 'מערכת / אוטומטי');

  const operatorTeam = (teamMembers || []).filter(m => m.role?.toLowerCase()?.trim() === 'operator l1');

  const reversedNotes = [...(report.additional_info || [])].reverse();
  const rejectionLog = reversedNotes.find(n => n.note && n.note.match(/^\[(.*?)\]/));
  
  let feedbackCategory = null;
  let feedbackText = '';
  let feedbackActor = rejectionLog?.actor || '';

  if (rejectionLog) {
    const match = rejectionLog.note.match(/^\[(.*?)\] (.*)$/);
    if (match) {
      feedbackCategory = match[1];
      feedbackText = match[2];
    } else {
      feedbackText = rejectionLog.note;
    }
  }

  const networkReply = reversedNotes.find(n => n.actor === 'Network T&S');
  let networkNote = null;
  if (networkReply && (currentStatus === 'Network Rejected' || currentStatus === 'Appeal Rejected' || currentStatus === 'Manual Review Required' || modView === 'archive')) {
    networkNote = networkReply.note;
  }

  const isOperatorEscalation = reversedNotes.some(n => n.note && n.note.includes('Escalated to Mod'));
  const genericNote = reversedNotes.find(n => n.note && !n.note.includes('Escalated to Mod') && n.action !== 'Report Submitted' && n.note !== 'Verified' && n.note !== 'Task completed by operator' && !n.action?.startsWith('Status') && n.actor !== 'Network T&S');

  // --- TIME AND ID FORMATTING ---
  const dateObj = new Date(report.created_at);
  const dateStr = dateObj.toLocaleDateString(isEn ? 'en-US' : 'he-IL');
  const timeStr = dateObj.toLocaleTimeString(isEn ? 'en-US' : 'he-IL', { hour: '2-digit', minute: '2-digit' });
  const shortId = report.id ? report.id.substring(0, 8).toUpperCase() : 'N/A';

  // --- ROUTING REASON LOGIC ---
  let routingLabel = isEn ? 'Standard Triage' : 'טריאז\' רגיל';
  let routingColor = '#94a3b8';
  let routingIcon = Icons.Alert;

  if (hasAILog && String(aiReasoningData).includes('[QA SAMPLE')) {
    routingLabel = isEn ? 'QA Sample (AI Validated)' : 'דגימת בקרת איכות';
    routingColor = '#a855f7'; 
    routingIcon = Icons.Activity;
  } else if (currentStatus === 'Manual Review Required' || (hasAILog && String(aiReasoningData).includes('Escalated for Manual Review'))) {
    routingLabel = isEn ? 'AI Escalation (Ambiguous)' : 'הסלמת AI (לא ודאי)';
    routingColor = '#f59e0b';
    routingIcon = Icons.Bot;
  } else if (isOperatorEscalation) {
    routingLabel = isEn ? 'Operator Escalated' : 'הוסלם ע"י מפעיל';
    routingColor = '#ef4444';
    routingIcon = Icons.User;
  } else if (report.routing === 'human') {
    routingLabel = isEn ? 'Direct Human Routing' : 'ניתוב אנושי ישיר';
    routingColor = '#38bdf8';
    routingIcon = Icons.User;
  }

  return (
    <React.Fragment>
      <div style={{ display: 'grid', gridTemplateColumns: gridLayout, alignItems: 'flex-start', padding: '20px 0', borderBottom: expandedLogs[report.id] ? 'none' : '1px solid rgba(255,255,255,0.05)' }}>
        
        {/* DYNAMIC COLUMNS: 2 Separate columns (ID vs Date/Time) vs 1 Combined column */}
        {isSplitDateTime ? (
          <>
            {/* Col 1: ID */}
            <div style={{ paddingTop: '6px' }}>
              <span style={{ fontSize: '0.8rem', fontFamily: 'monospace', color: '#94a3b8', backgroundColor: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.05)' }}>
                #{shortId}
              </span>
            </div>
            {/* Col 2: Date & Time Stacked */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', paddingTop: '6px' }}>
              <span style={{ fontSize: '0.9rem', color: '#e2e8f0', fontWeight: '500' }}>{dateStr}</span>
              <span style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                {Icons.Clock} {timeStr}
              </span>
            </div>
          </>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '6px' }}>
            <span style={{ fontSize: '0.8rem', fontFamily: 'monospace', color: '#94a3b8', backgroundColor: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: '4px', width: 'fit-content', border: '1px solid rgba(255,255,255,0.05)' }}>
              #{shortId}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#cbd5e1', flexWrap: 'wrap' }}>
              <span style={{ fontWeight: '500' }}>{dateStr}</span>
              <span style={{ color: '#475569' }}>|</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#94a3b8' }}>
                {Icons.Clock} {timeStr}
              </span>
            </div>
          </div>
        )}

        {/* EVIDENCE / SOURCE COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-start' }}>
          {platformData && <span style={{ backgroundColor: 'rgba(56,189,248,0.1)', color: '#38bdf8', padding: '4px 8px', borderRadius: '6px', fontSize: '0.75rem', border: '1px solid rgba(56,189,248,0.2)' }}>{platformData}</span>}
          
          {/* ROUTING REASON BADGE */}
          {(!isOperator && !isAssignment && modView === 'review') && (
            <span style={{ backgroundColor: `rgba(${parseInt(routingColor.slice(1,3),16)}, ${parseInt(routingColor.slice(3,5),16)}, ${parseInt(routingColor.slice(5,7),16)}, 0.1)`, color: routingColor, border: `1px solid rgba(${parseInt(routingColor.slice(1,3),16)}, ${parseInt(routingColor.slice(3,5),16)}, ${parseInt(routingColor.slice(5,7),16)}, 0.3)`, padding: '3px 8px', borderRadius: '4px', fontSize: '0.7rem', display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 'bold' }}>
              {routingIcon} {routingLabel}
            </span>
          )}

          {isAssignment ? (
            <span style={{ fontSize: '0.75rem', color: '#a855f7', fontWeight: 'bold', marginTop: '4px' }}>{categoryData || (isEn ? 'Assignment' : 'משימה')}</span>
          ) : (
            imageData ? (
              <div
                onClick={() => setImageModal({ isOpen: true, src: imageData })}
                onMouseEnter={(e) => { if(safeMode) e.currentTarget.firstChild.style.filter = 'none'; }}
                onMouseLeave={(e) => { if(safeMode) e.currentTarget.firstChild.style.filter = 'blur(10px)'; }}
                style={{ width: '55px', height: '55px', borderRadius: '8px', border: '1px solid #334155', overflow: 'hidden', backgroundColor: '#020617', cursor: 'pointer', position: 'relative', marginTop: '4px' }}
                title={isEn ? "Hover to reveal / Click to expand" : "העבר עכבר כדי לראות / לחץ להגדלה"}
              >
                <img
                  src={imageData}
                  alt="Evidence Thumbnail"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', filter: safeMode ? 'blur(10px)' : 'none', transition: 'filter 0.2s ease-in-out' }}
                />
              </div>
            ) : (
              <span style={{ fontSize: '0.7rem', color: '#475569', marginTop: '4px' }}>{isEn ? 'No Image' : 'אין תמונה'}</span>
            )
          )}
        </div>

        {/* SUBMITTED BY COLUMN (Admin views only) */}
        {(!isOperator && modView === 'review' && !isAssignment) && (
          <div style={{ fontSize: '0.85rem', color: '#cbd5e1', paddingTop: '6px' }}>
            <span style={{ backgroundColor: 'rgba(168, 85, 247, 0.1)', color: '#a855f7', padding: '4px 8px', borderRadius: '4px', border: '1px solid rgba(168, 85, 247, 0.2)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              {Icons.User} {submitterName}
            </span>
          </div>
        )}

        {/* CONTENT & DETAILS COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingRight: '25px', paddingTop: '6px' }}>
          <div style={{ fontSize: '0.9rem', color: '#e2e8f0', lineHeight: '1.4' }}>
            {contentData || (isAssignment ? (isEn ? 'No description provided.' : 'לא סופק תיאור.') : (isEn ? 'No text content provided.' : 'לא צורף טקסט.'))}
          </div>
          
          {driveLink && (
            <div>
              <a href={driveLink} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#38bdf8', fontSize: '0.75rem', textDecoration: 'none', backgroundColor: 'rgba(56,189,248,0.1)', padding: '6px 10px', borderRadius: '6px', border: '1px solid rgba(56,189,248,0.3)', transition: 'all 0.2s' }}>
                {Icons.Link} {isEn ? 'Open Associated Document' : 'פתח מסמך מקושר'}
              </a>
            </div>
          )}

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center', marginTop: '4px' }}>
            {isAssignment ? (
              <span style={{ fontSize: '0.75rem', color: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: '4px 8px', borderRadius: '4px', border: '1px solid rgba(16, 185, 129, 0.3)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                {Icons.Clock} {isEn ? `Allocated: ${allocatedHours || 0}h` : `הוקצה: ${allocatedHours || 0} שעות`}
              </span>
            ) : (
              <>
                {/* X-RAY DIAGNOSTIC */}
                {hasAILog ? (
                  <button onClick={() => onToggleLog(report.id)} style={{ backgroundColor: expandedLogs[report.id] ? 'rgba(168, 85, 247, 0.2)' : 'rgba(30, 41, 59, 0.8)', color: expandedLogs[report.id] ? '#d946ef' : '#94a3b8', border: '1px solid', borderColor: expandedLogs[report.id] ? 'rgba(217, 70, 239, 0.5)' : '#334155', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {Icons.Bot} {expandedLogs[report.id] ? (isEn ? 'Hide AI Audit' : 'הסתר יומן AI') : (isEn ? 'View AI Audit' : 'צפה ביומן AI')}
                  </button>
                ) : (
                  <span style={{ fontSize: '0.75rem', color: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '4px 8px', borderRadius: '4px', border: '1px solid rgba(239, 68, 68, 0.3)', display: 'flex', alignItems: 'center', gap: '4px' }} title="Check your Supabase select query or database row">
                    {Icons.Alert} {isEn ? 'No AI Data in DB' : 'אין נתוני AI במסד'}
                  </span>
                )}
                
                {report.routing === 'human' && (
                  <span style={{ fontSize: '0.75rem', color: '#64748b', backgroundColor: 'rgba(100, 116, 139, 0.1)', padding: '4px 8px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {Icons.User} {isEn ? 'Human Submitted' : 'דיווח אנושי'}
                  </span>
                )}
              </>
            )}
          </div>

          {/* Feedback & Alert Blocks */}
          {networkNote && (
            <div style={{ marginTop: '8px', padding: '12px', backgroundColor: 'rgba(239, 68, 68, 0.1)', borderLeft: '3px solid #ef4444', borderRadius: '6px', fontSize: '0.85rem' }}>
              <strong style={{ color: '#f87171', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>{Icons.Alert} {isEn ? 'Network Response' : 'תשובת הרשת'}</strong>
              <span style={{ color: '#cbd5e1', lineHeight: '1.4', display: 'block' }}>{networkNote}</span>
            </div>
          )}

          {currentStatus === 'Dismissed' && rejectionLog && !isAssignment ? (
            <div style={{ marginTop: '8px', padding: '12px', backgroundColor: 'rgba(239, 68, 68, 0.1)', borderLeft: '3px solid #ef4444', borderRadius: '6px', fontSize: '0.85rem' }}>
              <strong style={{ color: '#f87171', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>{Icons.XCircle} {isEn ? 'Report Rejected' : 'הדיווח נדחה'}{feedbackCategory ? `: ${feedbackCategory}` : ''}</strong>
              <span style={{ color: '#cbd5e1', lineHeight: '1.4', display: 'block' }}><em>{feedbackActor}:</em> "{feedbackText}"</span>
            </div>
          ) : currentStatus === 'Changes Requested' && rejectionLog && !isAssignment ? (
            <div style={{ marginTop: '8px', padding: '12px', backgroundColor: 'rgba(239, 68, 68, 0.1)', borderLeft: '3px solid #ef4444', borderRadius: '6px', fontSize: '0.85rem' }}>
              <strong style={{ color: '#f87171', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>{Icons.Alert} {isEn ? 'Fix Required' : 'נדרש תיקון'}{feedbackCategory ? `: ${feedbackCategory}` : ''}</strong>
              <span style={{ color: '#cbd5e1', lineHeight: '1.4', display: 'block' }}><em>{feedbackActor}:</em> "{feedbackText}"</span>
            </div>
          ) : currentStatus === 'Pending Review' && isOperatorEscalation && !isAssignment ? (
            <div style={{ marginTop: '8px', padding: '12px', backgroundColor: 'rgba(245, 158, 11, 0.1)', borderLeft: '3px solid #f59e0b', borderRadius: '6px', fontSize: '0.85rem' }}>
              <strong style={{ color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>{Icons.ArrowUp} {isEn ? 'Escalated to Moderator' : 'הוסלם למנהל'}</strong>
              <span style={{ color: '#cbd5e1', lineHeight: '1.4', display: 'block' }}>{isEn ? 'Operator bypassed AI decision for manual review.' : 'המפעיל עקף את החלטת ה-AI וביקש בדיקה ידנית.'}</span>
            </div>
          ) : isAssignment && genericNote ? (
            <div style={{ marginTop: '8px', padding: '12px', backgroundColor: 'rgba(56, 189, 248, 0.1)', borderLeft: '3px solid #38bdf8', borderRadius: '6px', fontSize: '0.85rem' }}>
              <strong style={{ color: '#7dd3fc', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>{Icons.FileText} {isEn ? 'Assignment Notes' : 'הערות המנהל'}</strong>
              <span style={{ color: '#cbd5e1', lineHeight: '1.4', display: 'block' }}><em>{genericNote.actor}:</em> "{genericNote.note}"</span>
            </div>
          ) : genericNote ? (
            <div style={{ marginTop: '8px', fontSize: '0.8rem', color: '#f59e0b', backgroundColor: 'rgba(245,158,11,0.1)', padding: '8px 12px', borderRadius: '6px', borderLeft: '3px solid #f59e0b' }}>
              <strong>{genericNote.actor}:</strong> {genericNote.note}
            </div>
          ) : null}
        </div>

        {/* STATUS COLUMN */}
        {!isSplitDateTime && !isAssignment && (
          <div style={{ paddingTop: '6px' }}>
            <span style={{ color: getStatusColor(currentStatus), fontWeight: 'bold', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: getStatusColor(currentStatus) }}></span>
              {currentStatus === 'Closed - Verified' ? 'Verified' : currentStatus}
            </span>
          </div>
        )}

        {/* --- ACTION BUTTONS COLUMN --- */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', maxWidth: '160px', paddingTop: '6px' }}>
          {isOperator ? (
            isAssignment ? (
              <button onClick={() => onStatusUpdate(report.id, 'Pending Mod Review', report.additional_info || [], 'Assignment marked Done by operator', report._table)} style={solidBtn('#10b981')}>
                {Icons.CheckCircle} {isEn ? 'Mark Done' : 'סיום משימה'}
              </button>
            ) : currentStatus === 'Dismissed' ? (
              <button onClick={() => onStatusUpdate(report.id, 'Dismissed', report.additional_info || [], 'Task acknowledged by operator', report._table)} style={solidBtn('#3b82f6')}>
                {Icons.Eye} {isEn ? 'Acknowledge' : 'אישור קריאה'}
              </button>
            ) : currentStatus === 'Changes Requested' ? (
              // HITL OPERATOR EDGE CASE: Only show the Purple "Apply Fix" button
              <button onClick={() => openCorrectionModal(report)} style={solidBtn('#a855f7')}>
                {Icons.Edit} {isEn ? 'Apply Fix' : 'החל תיקונים'}
              </button>
            ) : (
              // Standard Pending/In Progress Actions
              <>
                <button onClick={() => onStatusUpdate(report.id, 'Pending Review', report.additional_info || [], 'Task completed by operator', report._table)} style={solidBtn('#10b981')}>{Icons.CheckCircle} {isEn ? 'Mark Done' : 'סיום משימה'}</button>
                {currentStatus === 'Manual Review Required' && (
                  <button onClick={() => openModal(report.id, 'Dismissed', submitterId, report.additional_info || [], report._table)} style={ghostBtn('#ef4444', '239, 68, 68')}>{Icons.Trash} {isEn ? 'Dismiss' : 'דחה דיווח'}</button>
                )}
              </>
            )
          ) : modView === 'review' ? (
            <>
              {/* QA Actions: Rendered ONLY for Moderators */}
              {['Pending Review', 'Manual Review Required'].includes(currentStatus) && isModerator && (
                <>
                  {/* HITL MODERATOR EDGE CASE: If reviewing a returned fix, show Blue Button */}
                  {currentStatus === 'Pending Review' && rejectionLog ? (
                    <button onClick={() => openReviewModal(report)} style={solidBtn('#38bdf8')}>
                      {Icons.Eye} {isEn ? 'Review Fix' : 'סקירת תיקונים'}
                    </button>
                  ) : (
                    /* Standard QA Buttons */
                    <>
                      <button onClick={() => onStatusUpdate(report.id, 'Verified', report.additional_info || [], 'Verified by Moderator', report._table)} style={solidBtn('#10b981')}>{Icons.CheckCircle} {isEn ? 'Approve' : 'אישור'}</button>
                      <button onClick={() => openModal(report.id, 'Changes Requested', submitterId, report.additional_info || [], report._table)} style={ghostBtn('#f59e0b', '245, 158, 11')}>{Icons.CornerUp} {isEn ? 'Needs Fix' : 'החזר לתיקון'}</button>
                      <button onClick={() => openModal(report.id, 'Dismissed', submitterId, report.additional_info || [], report._table)} style={ghostBtn('#ef4444', '239, 68, 68')}>{Icons.Trash} {isEn ? 'Reject' : 'דחייה'}</button>
                    </>
                  )}
                </>
              )}
              
              {/* Appeal Actions: Rendered ONLY for Admins */}
              {['Network Rejected', 'Appeal Rejected'].includes(currentStatus) && isAdmin && (
                <>
                  {currentStatus === 'Network Rejected' && (
                    <button onClick={() => onStatusUpdate(report.id, 'Pending Appeal', report.additional_info || [], 'Admin initiated secondary appeal process', report._table)} style={solidBtn('#f59e0b')}>
                      {Icons.ArrowUp} {isEn ? 'Initiate Appeal' : 'הגש ערעור'}
                    </button>
                  )}
                  <button onClick={() => openModal(report.id, 'Changes Requested', submitterId, report.additional_info || [], report._table)} style={ghostBtn('#ef4444', '239, 68, 68')}>
                    {Icons.CornerUp} {isEn ? 'Return for Coaching' : 'החזר להדרכה'}
                  </button>
                  <button onClick={() => openModal(report.id, 'Dismissed', submitterId, report.additional_info || [], report._table)} style={ghostBtn('#64748b', '100, 116, 139')}>
                    {Icons.Trash} {isEn ? 'Close & Archive' : 'סגור לארכיון'}
                  </button>
                </>
              )}

              {/* Everyone gets the Export button */}
              <div style={{ marginTop: '4px' }}>
                <CaseFileExport report={report} userProfile={userProfile} isEn={isEn} />
              </div>
            </>
          ) : modView === 'team' ? (
            isAssignment && currentStatus === 'Pending Mod Review' ? (
              <button onClick={() => onStatusUpdate(report.id, 'Closed', report.additional_info || [], 'Assignment acknowledged by Admin', report._table)} style={solidBtn('#10b981')}>
                {Icons.CheckCircle} {isEn ? 'Acknowledge & Close' : 'אשר וסגור'}
              </button>
            ) : (
              <select value={report.assigned_to || ''} onChange={(e) => onAssignReport(report.id, e.target.value, report.additional_info || [], report._table)} style={inputStyle}>
                <option value="">{isEn ? 'Unassigned' : 'לא משויך'}</option>
                {operatorTeam.map(member => <option key={member.id} value={member.id}>{member.display_name || member.email}</option>)}
              </select>
            )
          ) : null}
        </div>
      </div>

      {/* --- AI AUDIT PANEL --- */}
      {expandedLogs[report.id] && hasAILog && !isAssignment && (
        <div style={{ margin: '0 0 15px 0' }}>
          <AIAuditPanel report={report} />
        </div>
      )}
    </React.Fragment>
  );
};

export default TaskRow;