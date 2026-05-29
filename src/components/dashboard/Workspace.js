/**
 * @file Workspace.js
 * @description The primary Operations Hub and routing engine for the CiviWatch platform.
 * FIX: Improved Full-Screen Image UX. Clicking the image itself now closes the modal, 
 * and the cursor updates to 'zoom-out' to make this intuitive for operators.
 */
import React, { useState } from 'react';
import Allocation from './Allocation';
import BatchDispatch from './BatchDispatch';
import { supabase } from '../../supabaseClient';

// Import our new compartment files
import OperatorQueue from './workspace/OperatorQueue';
import AdminQAQueue from './workspace/AdminQAQueue';
import AdminTeamQueue from './workspace/AdminTeamQueue';
import AdminArchive from './workspace/AdminArchive';

const Icons = {
  Inbox: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>,
  Branch: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="6" y1="3" x2="6" y2="15"></line><circle cx="18" cy="6" r="3"></circle><circle cx="6" cy="18" r="3"></circle><path d="M18 9a9 9 0 0 1-9 9"></path></svg>,
  Send: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>,
  CheckCircle: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>,
  Users: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>,
  Shield: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>,
  Alert: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>,
  Clock: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>,
  Archive: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="21 8 21 21 3 21 3 8"></polyline><rect x="1" y="3" width="22" height="5"></rect><line x1="10" y1="12" x2="14" y2="12"></line></svg>,
  X: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>,
  Image: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>,
  Eye: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>,
  EyeOff: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>,
  ExternalLink: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
};

const PLATFORMS = ['X (Twitter)', 'Facebook', 'Instagram', 'TikTok', 'Telegram', 'YouTube', 'LinkedIn', 'Discord', 'Truth Social', 'VK', 'Other'];
const LANGUAGES = ['English', 'Hebrew', 'Arabic', 'Russian', 'French', 'Spanish', 'Other'];
const CATEGORIES = ['Antisemitism', 'Hate Speech', 'Harassment', 'Terrorism', 'Violence / Cruelty', 'Pornography', 'Nudity', 'Fake News', 'Troll', 'Other'];

const Workspace = ({
  duration, isClockedIn, onClockIn, onClockOut, stats,
  reports, userProfile, teamMembers, onStatusUpdate, onAssignReport,
  isEn, triggerToast, refreshData
}) => {
  const isRtl = !isEn;

  const userRole = userProfile?.role?.toLowerCase()?.trim() || '';
  const isOperator = userRole === 'operator l1';
  const isModerator = userRole.includes('moderator');
  const isAdmin = userRole.includes('admin');
  
  const canAssignTasks = isAdmin || isModerator;
  const canDispatchNetwork = isAdmin;

  const requiresShift = ['operator l1', 'moderator l2'].includes(userRole);
  const isLocked = requiresShift && !isClockedIn;

  const [activeSubTab, setActiveSubTab] = useState('queue');
  const [modView, setModView] = useState('review'); 

  const [expandedLogs, setExpandedLogs] = useState({});
  const [safeMode, setSafeMode] = useState(true);
  const [localUnblur, setLocalUnblur] = useState(false);
  const [isProcessingShift, setIsProcessingShift] = useState(false);

  // --- MODALS ---
  const [imageModal, setImageModal] = useState({ isOpen: false, src: '' });
  const [feedbackModal, setFeedbackModal] = useState({
    isOpen: false, reportId: null, actionType: '', category: '', customSubject: '', note: '', originalSubmitter: null, table: '', additionalInfo: []
  });

  const [correctionModal, setCorrectionModal] = useState({ 
    isOpen: false, report: null, content: '', platform: '', url: '', 
    language: 'English', priority: false, category: [], image_url: ''
  });
  const [reviewModal, setReviewModal] = useState({ isOpen: false, report: null });

  const handleShiftToggle = async () => {
    if (isProcessingShift) return;
    setIsProcessingShift(true);
    try {
      if (isClockedIn) { if (onClockOut) await onClockOut(); } 
      else { if (onClockIn) await onClockIn(); }
    } finally { setIsProcessingShift(false); }
  };

  const toggleLog = (id) => setExpandedLogs(prev => ({ ...prev, [id]: !prev[id] }));

  const openModal = (reportId, actionType, originalSubmitter, additionalInfo, table) => {
    setFeedbackModal({ isOpen: true, reportId, actionType, category: '', customSubject: '', note: '', originalSubmitter, table, additionalInfo });
  };
  const closeFeedbackModal = () => {
    setFeedbackModal({ isOpen: false, reportId: null, actionType: '', category: '', customSubject: '', note: '', originalSubmitter: null, table: '', additionalInfo: [] });
  };

  const submitFeedback = () => {
    if (!feedbackModal.category) { alert(isEn ? "Please select a reason category." : "אנא בחר את סיבת ההערה מהרשימה."); return; }
    if (feedbackModal.category === 'Other' && !feedbackModal.customSubject.trim()) { alert(isEn ? "Please specify the custom reason." : "אנא פרט את הסיבה בשדה הטקסט."); return; }
    if (!feedbackModal.note.trim()) { alert(isEn ? "Detailed notes are mandatory." : "פירוט ההערה הוא שדה חובה."); return; }

    const finalSubject = feedbackModal.category === 'Other' ? feedbackModal.customSubject : feedbackModal.category;
    const combinedNote = `[${finalSubject.toUpperCase()}] ${feedbackModal.note}`;

    onStatusUpdate(
      feedbackModal.reportId, feedbackModal.actionType, feedbackModal.additionalInfo, 
      combinedNote, feedbackModal.table, finalSubject, feedbackModal.originalSubmitter
    );
    closeFeedbackModal();
  };

  const handleOpenCorrection = (report) => {
    setLocalUnblur(false); 
    let parsedCategories = [];
    const tagsData = report.tags || report.category || [];
    
    if (Array.isArray(tagsData)) {
      parsedCategories = tagsData;
    } else if (typeof tagsData === 'string') {
      parsedCategories = tagsData.split(',').map(c => c.trim()).filter(Boolean);
    }

    setCorrectionModal({
      isOpen: true,
      report,
      content: report.content || '',
      platform: report.platform || '',
      evidence_url: report.source_url || report.evidence_url || report.url || '', 
      language: report.language || 'English',
      priority: report.priority_tag || report.priority || false, 
      category: parsedCategories, 
      image_url: report.image_url || report.reports?.image_url || '' 
    });
  };

  const toggleCategoryTag = (tag) => {
    setCorrectionModal(prev => {
      const currentTags = prev.category;
      if (currentTags.includes(tag)) {
        return { ...prev, category: currentTags.filter(t => t !== tag) };
      } else {
        return { ...prev, category: [...currentTags, tag] };
      }
    });
  };

  const submitCorrectionFix = async () => {
    if (!correctionModal.report) return;
    if (!correctionModal.platform) {
      triggerToast(isEn ? 'Platform is required.' : 'פלטפורמה היא שדה חובה.', 'error');
      return;
    }

    const reportId = correctionModal.report.id;
    const targetTable = correctionModal.report._table || 'reports';
    
    const newNote = {
      timestamp: new Date().toISOString(),
      actor: userProfile.displayName || userProfile.email,
      action: 'Operator Fix Applied',
      note: 'Resubmitted for QA review with updated data.'
    };
    
    const safeNotes = Array.isArray(correctionModal.report.additional_info) ? correctionModal.report.additional_info : [];
    
    try {
      const updatePayload = {
        content: correctionModal.content,
        platform: correctionModal.platform,
        source_url: correctionModal.evidence_url, 
        language: correctionModal.language,
        tags: correctionModal.category, 
        priority_tag: correctionModal.priority, 
        status: 'Pending Review', 
        additional_info: [...safeNotes, newNote]
      };

      if ('priority' in correctionModal.report) {
        updatePayload.priority = correctionModal.priority;
      } else if ('is_priority' in correctionModal.report) {
        updatePayload.is_priority = correctionModal.priority;
      }

      const { error } = await supabase.from(targetTable).update(updatePayload).eq('id', reportId);
      
      if (error) throw error;
      
      triggerToast(isEn ? 'Fixes submitted successfully!' : 'התיקונים נשלחו בהצלחה!', 'success');
      setCorrectionModal({ isOpen: false, report: null, content: '', platform: '', evidence_url: '', language: 'English', priority: false, category: [], image_url: '' });
      if (refreshData) refreshData();
      
    } catch(err) {
      console.error("Supabase Error Details:", err);
      const exactError = err.details || err.message || 'Check browser console';
      triggerToast(isEn ? `Failed: ${exactError}` : `נכשל: ${exactError}`, 'error');
    }
  };

  const handleOpenReview = (report) => {
    setLocalUnblur(false); 
    setReviewModal({ isOpen: true, report });
  };

  // --- CATEGORIES ---
  const rejectCategories = [
    { value: '', label: isEn ? 'Select Reason...' : 'בחר סיבה...' },
    { value: 'Not a Threat', label: isEn ? 'Not a Threat / False Positive' : 'לא איום / זיהוי שגוי' },
    { value: 'Out of Scope', label: isEn ? 'Out of Scope' : 'מחוץ לתחום' },
    { value: 'Duplicate', label: isEn ? 'Duplicate Report' : 'דיווח כפול' },
    { value: 'Unverifiable', label: isEn ? 'Unverifiable Information' : 'מידע שאינו ניתן לאימות' },
    { value: 'Network Policy', label: isEn ? 'Network Deemed Permissible' : 'הרשת קבעה כתקין' },
    { value: 'Other', label: isEn ? 'Other (Specify)' : 'אחר (פרט)' }
  ];

  const fixCategories = [
    { value: '', label: isEn ? 'Select Reason...' : 'בחר סיבה...' },
    { value: 'Incorrect Tag', label: isEn ? 'Incorrect Tagging' : 'תיוג שגוי' },
    { value: 'Missing Evidence', label: isEn ? 'Missing Evidence / Network Logo' : 'חסרה הוכחה / לוגו רשת' },
    { value: 'Missing Link', label: isEn ? 'Missing Platform Link' : 'חסר קישור לפלטפורמה' },
    { value: 'Incomplete Context', label: isEn ? 'Incomplete Context' : 'הקשר חסר' },
    { value: 'Network Feedback', label: isEn ? 'Network Demands More Info' : 'הרשת דורשת מידע נוסף' },
    { value: 'Other', label: isEn ? 'Other (Specify)' : 'אחר (פרט)' }
  ];

  const modalInputStyle = { width: '100%', backgroundColor: '#0f172a', border: '1px solid #334155', color: '#f8fafc', padding: '12px', borderRadius: '8px', fontSize: '0.95rem', outline: 'none', marginBottom: '15px', boxSizing: 'border-box' };
  const overlayStyle = { position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 3000, backdropFilter: 'blur(5px)' };

  const getCalculatedStatus = (report) => {
    let calcStatus = report.status || 'Pending';
    const aStatus = report.ai_vote_status || report.reports?.ai_vote_status;
    if (['New', 'Pending', 'In Progress'].includes(calcStatus) && aStatus && ['Changes Requested', 'Manual Review Required', 'AI Verified', 'AI Rejected'].includes(aStatus)) {
      calcStatus = aStatus;
    }
    return calcStatus;
  };

  const getActionableCounts = () => {
    let triageCount = 0;
    let assignCount = 0;

    const completedStatuses = [
      'Takedown Successful', 'Appeal Successful', 'Pending Appeal', 'Appeal in Progress', 
      'Network Rejected', 'Appeal Rejected', 'Pending Network Action', 
      'Pending Review', 'Pending Mod Review', 'Verified', 'Closed - Verified', 'Closed',
      'AI Verified', 'AI Rejected'
    ];

    if (isOperator) {
      const actionable = (reports || []).filter(r => {
        const s = getCalculatedStatus(r);
        if (completedStatuses.includes(s)) return false;
        const isMySub = r.submitted_by === userProfile?.id || r.reports?.submitted_by === userProfile?.id;
        if (r.assigned_to && r.assigned_to !== userProfile?.id) return false;
        if (!r.assigned_to && !isMySub) return false;
        const lastNote = r.additional_info?.length > 0 ? r.additional_info[r.additional_info.length - 1] : null;
        if (s === 'Dismissed' && lastNote?.note === 'Task acknowledged by operator') return false;
        return true;
      });
      triageCount = actionable.filter(r => r._table !== 'assignments').length;
      assignCount = actionable.filter(r => r._table === 'assignments').length;
    } else {
      triageCount = (reports || []).filter(r => {
        if (r._table === 'assignments') return false;
        const status = getCalculatedStatus(r);
        if (isModerator && ['Pending Review', 'Manual Review Required'].includes(status)) return true;
        if (isAdmin && ['Network Rejected', 'Appeal Rejected'].includes(status)) return true;
        return false;
      }).length;

      if (canAssignTasks) {
        assignCount = (reports || []).filter(r => r._table === 'assignments' && getCalculatedStatus(r) === 'Pending Mod Review').length;
      }
    }
    return { triage: triageCount, assign: assignCount };
  };

  const actionableCounts = getActionableCounts();

  const filteredOperatorReports = (reports || []).filter(r => {
    const s = getCalculatedStatus(r);
    const completedStatuses = [
      'Takedown Successful', 'Appeal Successful', 'Pending Appeal', 'Appeal in Progress', 
      'Network Rejected', 'Appeal Rejected', 'Pending Network Action', 
      'Pending Review', 'Pending Mod Review', 'Verified', 'Closed - Verified', 'Closed',
      'AI Verified', 'AI Rejected'
    ];
    return !completedStatuses.includes(s);
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', direction: isRtl ? 'rtl' : 'ltr', animation: 'fadeIn 0.4s ease-out', position: 'relative' }}>

      {/* --- FULL SCREEN IMAGE MODAL (MAXIMIZED VIEW WITH CONTROLS) --- */}
      {imageModal.isOpen && (
        <div 
          onClick={() => setImageModal({ isOpen: false, src: '' })}
          style={{ ...overlayStyle, zIndex: 9999, cursor: 'zoom-out', padding: '20px' }}
        >
          {/* Top Right Controls */}
          <div style={{ position: 'absolute', top: '20px', right: '20px', display: 'flex', gap: '15px', zIndex: 10001 }}>
            
            {/* External Tab Button (Forensic View) */}
            <button 
              onClick={(e) => { e.stopPropagation(); window.open(imageModal.src, '_blank'); }}
              style={{ backgroundColor: 'rgba(56, 189, 248, 0.8)', border: '1px solid #38bdf8', borderRadius: '50%', color: '#fff', cursor: 'pointer', width: '40px', height: '40px', display: 'flex', justifyContent: 'center', alignItems: 'center', backdropFilter: 'blur(4px)', transition: 'background-color 0.2s' }}
              title={isEn ? "Open in new tab" : "פתח בכרטיסייה חדשה"}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#38bdf8'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'rgba(56, 189, 248, 0.8)'}
            >
              {Icons.ExternalLink}
            </button>

            {/* Close Button */}
            <button 
              onClick={(e) => { e.stopPropagation(); setImageModal({ isOpen: false, src: '' }); }}
              style={{ backgroundColor: 'rgba(239, 68, 68, 0.8)', border: '1px solid #ef4444', borderRadius: '50%', color: '#fff', cursor: 'pointer', width: '40px', height: '40px', display: 'flex', justifyContent: 'center', alignItems: 'center', backdropFilter: 'blur(4px)', transition: 'background-color 0.2s' }}
              title={isEn ? "Close" : "סגור"}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#ef4444'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.8)'}
            >
              {Icons.X}
            </button>
          </div>

          {/* FIX: Removed e.stopPropagation() from the image click handler. 
            Now, clicking the image itself will also close the modal.
          */}
          <img 
            src={imageModal.src} 
            alt="Full Evidence" 
            onClick={() => setImageModal({ isOpen: false, src: '' })}
            style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '8px', filter: (safeMode && !localUnblur) ? 'blur(15px)' : 'none', transition: 'filter 0.3s', cursor: 'zoom-out' }} 
          />
        </div>
      )}

      {/* --- HITL MODAL: OPERATOR CORRECTION FORM WITH EMBEDDED IMAGE --- */}
      {correctionModal.isOpen && correctionModal.report && (
        <div style={overlayStyle}>
          <div style={{ backgroundColor: '#0f172a', border: '1px solid #a855f7', borderRadius: '16px', padding: '30px', width: '90%', maxWidth: '850px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)', direction: isEn ? 'ltr' : 'rtl' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, color: '#a855f7', fontSize: '1.4rem' }}>{isEn ? 'Apply Fixes' : 'החל תיקונים'}</h3>
              <button onClick={() => setCorrectionModal({ isOpen: false, report: null, content: '', platform: '', evidence_url: '', language: 'English', priority: false, category: [], image_url: '' })} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '24px', cursor: 'pointer' }}>&times;</button>
            </div>
            
            <div style={{ backgroundColor: 'rgba(239,68,68,0.1)', borderLeft: isEn ? '4px solid #ef4444' : 'none', borderRight: isRtl ? '4px solid #ef4444' : 'none', padding: '15px', borderRadius: '4px', marginBottom: '25px' }}>
              <strong style={{ color: '#ef4444', display: 'block', marginBottom: '5px' }}>{isEn ? 'Moderator Feedback:' : 'משוב המנהל:'}</strong>
              <span style={{ color: '#fca5a5', fontStyle: 'italic' }}>
                {(() => {
                  const history = correctionModal.report.additional_info || [];
                  const lastReject = history.slice().reverse().find(n => n.action.includes('Changes Requested'));
                  return lastReject ? `"${lastReject.note}"` : (isEn ? 'Please review and correct the report.' : 'אנא עיין ותקן את הדיווח.');
                })()}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: correctionModal.image_url ? '1fr 1fr' : '1fr', gap: '25px' }}>
              
              {/* LEFT SIDE: Image Viewer */}
              {correctionModal.image_url && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <label style={{ color: '#cbd5e1', fontSize: '0.85rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {Icons.Image} {isEn ? 'Reference Evidence' : 'הוכחה מצורפת'}
                  </label>
                  <div style={{ position: 'relative', width: '100%', height: '350px', borderRadius: '12px', border: '1px solid #334155', overflow: 'hidden', backgroundColor: '#020617' }}>
                    <img
                      src={correctionModal.image_url}
                      alt="Reference Evidence"
                      onClick={() => setImageModal({ isOpen: true, src: correctionModal.image_url })}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', filter: (safeMode && !localUnblur) ? 'blur(15px)' : 'none', transition: 'filter 0.2s ease-in-out', cursor: 'zoom-in' }}
                      title={isEn ? "Click to expand full screen" : "לחץ להגדלה למסך מלא"}
                    />
                    {safeMode && (
                      <button
                        onClick={(e) => { e.stopPropagation(); setLocalUnblur(!localUnblur); }}
                        style={{ position: 'absolute', top: '10px', right: '10px', backgroundColor: 'rgba(15, 23, 42, 0.8)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 'bold', backdropFilter: 'blur(4px)' }}
                      >
                        {localUnblur ? Icons.EyeOff : Icons.Eye} {localUnblur ? (isEn ? 'Hide Image' : 'הסתר תמונה') : (isEn ? 'Reveal Image' : 'הצג תמונה')}
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* RIGHT SIDE: Form */}
              <div>
                <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', marginBottom: '15px' }}>
                  <div style={{ flex: '1 1 150px' }}>
                    <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '8px' }}>{isEn ? 'Platform (Required)' : 'פלטפורמה (חובה)'}</label>
                    <select value={correctionModal.platform} onChange={(e) => setCorrectionModal({ ...correctionModal, platform: e.target.value })} style={modalInputStyle}>
                      <option value="">{isEn ? 'Select Platform' : 'בחר פלטפורמה'}</option>
                      {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                  <div style={{ flex: '1 1 120px' }}>
                    <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '8px' }}>{isEn ? 'Language' : 'שפה'}</label>
                    <select value={correctionModal.language} onChange={(e) => setCorrectionModal({ ...correctionModal, language: e.target.value })} style={modalInputStyle}>
                      {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                  </div>
                </div>

                <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '8px' }}>{isEn ? 'URL / Evidence Link' : 'קישור להוכחה'}</label>
                <input type="text" value={correctionModal.evidence_url} onChange={(e) => setCorrectionModal({ ...correctionModal, evidence_url: e.target.value })} style={modalInputStyle} placeholder="https://..." />

                <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '8px' }}>{isEn ? 'Issue Category (Tags)' : 'קטגוריית דיווח (תגיות)'}</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '10px', minHeight: '34px', padding: '8px', backgroundColor: '#020617', border: '1px solid #334155', borderRadius: '8px' }}>
                  {correctionModal.category.length === 0 && <span style={{ color: '#475569', fontSize: '0.85rem', padding: '4px' }}>{isEn ? 'No tags selected' : 'לא נבחרו תגיות'}</span>}
                  {correctionModal.category.map((tag, idx) => (
                    <span key={idx} style={{ backgroundColor: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', padding: '4px 10px', borderRadius: '16px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
                      {tag}
                      <button onClick={() => toggleCategoryTag(tag)} style={{ background: 'none', border: 'none', color: '#38bdf8', cursor: 'pointer', padding: 0, fontSize: '1rem', lineHeight: '1' }}>&times;</button>
                    </span>
                  ))}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '15px' }}>
                  {CATEGORIES.map(cat => (
                    <button 
                      key={cat} 
                      onClick={() => toggleCategoryTag(cat)} 
                      style={{ backgroundColor: correctionModal.category.includes(cat) ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255,255,255,0.05)', border: correctionModal.category.includes(cat) ? '1px solid #38bdf8' : '1px solid rgba(255,255,255,0.1)', color: correctionModal.category.includes(cat) ? '#38bdf8' : '#cbd5e1', padding: '6px 12px', borderRadius: '16px', fontSize: '0.8rem', cursor: 'pointer', transition: 'all 0.2s' }}>
                      {correctionModal.category.includes(cat) ? '✓ ' : '+ '}{cat}
                    </button>
                  ))}
                </div>

                <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '15px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <div>
                    <strong style={{ color: '#ef4444', display: 'block' }}>{isEn ? 'Immediate Threat / High Priority' : 'איום מיידי / עדיפות גבוהה'}</strong>
                    <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>{isEn ? 'Tag as critical for immediate SLA response.' : 'סמן כקריטי לתגובת SLA מיידית.'}</span>
                  </div>
                  <label style={{ position: 'relative', display: 'inline-block', width: '44px', height: '24px' }}>
                    <input type="checkbox" checked={correctionModal.priority} onChange={(e) => setCorrectionModal({ ...correctionModal, priority: e.target.checked })} style={{ opacity: 0, width: 0, height: 0 }} />
                    <span style={{ position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: correctionModal.priority ? '#ef4444' : '#334155', borderRadius: '24px', transition: '0.3s' }}>
                      <span style={{ position: 'absolute', content: '""', height: '18px', width: '18px', left: correctionModal.priority ? '22px' : '3px', bottom: '3px', backgroundColor: 'white', borderRadius: '50%', transition: '0.3s' }}></span>
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Content Snippet */}
            <div style={{ marginTop: '10px' }}>
              <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '8px' }}>{isEn ? 'Additional Context / Content Snippet' : 'תוכן רלוונטי / הקשר נוסף'}</label>
              <textarea rows="4" value={correctionModal.content} onChange={(e) => setCorrectionModal({ ...correctionModal, content: e.target.value })} style={{ ...modalInputStyle, resize: 'vertical' }} />
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '15px', marginTop: '15px', paddingTop: '15px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              <button onClick={() => setCorrectionModal({ isOpen: false, report: null, content: '', platform: '', evidence_url: '', language: 'English', priority: false, category: [], image_url: '' })} style={{ backgroundColor: 'transparent', color: '#94a3b8', border: '1px solid #475569', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>{isEn ? 'Cancel' : 'ביטול'}</button>
              <button onClick={submitCorrectionFix} style={{ backgroundColor: '#a855f7', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>{isEn ? 'Submit Fix' : 'שליחת תיקונים'}</button>
            </div>
          </div>
        </div>
      )}

      {/* --- HITL MODAL: MODERATOR REVIEW (UPGRADED UI) --- */}
      {reviewModal.isOpen && reviewModal.report && (
        <div style={overlayStyle}>
          <div style={{ backgroundColor: '#0f172a', border: '1px solid #38bdf8', borderRadius: '16px', padding: '30px', width: '90%', maxWidth: '850px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)', direction: isEn ? 'ltr' : 'rtl' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, color: '#38bdf8', fontSize: '1.4rem' }}>{isEn ? 'Review Operator Fixes' : 'סקירת תיקוני המפעיל'}</h3>
              <button onClick={() => setReviewModal({ isOpen: false, report: null })} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '24px', cursor: 'pointer' }}>&times;</button>
            </div>
            
            <div style={{ backgroundColor: 'rgba(239,68,68,0.1)', borderLeft: isEn ? '4px solid #ef4444' : 'none', borderRight: isRtl ? '4px solid #ef4444' : 'none', padding: '15px', borderRadius: '4px', marginBottom: '25px' }}>
              <strong style={{ color: '#ef4444', display: 'block', marginBottom: '5px' }}>{isEn ? 'Your Previous Request:' : 'הבקשה הקודמת שלך:'}</strong>
              <span style={{ color: '#fca5a5', fontStyle: 'italic' }}>
                {(() => {
                  const history = reviewModal.report.additional_info || [];
                  const lastReject = history.slice().reverse().find(n => n.action.includes('Changes Requested'));
                  return lastReject ? `"${lastReject.note}"` : 'N/A';
                })()}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: (reviewModal.report.image_url || reviewModal.report.reports?.image_url) ? '1fr 1fr' : '1fr', gap: '25px' }}>
              
              {/* LEFT SIDE: Image Viewer */}
              {(reviewModal.report.image_url || reviewModal.report.reports?.image_url) && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <label style={{ color: '#cbd5e1', fontSize: '0.85rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {Icons.Image} {isEn ? 'Reference Evidence' : 'הוכחה מצורפת'}
                  </label>
                  <div style={{ position: 'relative', width: '100%', height: '350px', borderRadius: '12px', border: '1px solid #334155', overflow: 'hidden', backgroundColor: '#020617' }}>
                    <img
                      src={reviewModal.report.image_url || reviewModal.report.reports?.image_url}
                      alt="Reference Evidence"
                      onClick={() => setImageModal({ isOpen: true, src: reviewModal.report.image_url || reviewModal.report.reports?.image_url })}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', filter: (safeMode && !localUnblur) ? 'blur(15px)' : 'none', transition: 'filter 0.2s ease-in-out', cursor: 'zoom-in' }}
                      title={isEn ? "Click to expand full screen" : "לחץ להגדלה למסך מלא"}
                    />
                    {safeMode && (
                      <button
                        onClick={(e) => { e.stopPropagation(); setLocalUnblur(!localUnblur); }}
                        style={{ position: 'absolute', top: '10px', right: '10px', backgroundColor: 'rgba(15, 23, 42, 0.8)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 'bold', backdropFilter: 'blur(4px)' }}
                      >
                        {localUnblur ? Icons.EyeOff : Icons.Eye} {localUnblur ? (isEn ? 'Hide Image' : 'הסתר תמונה') : (isEn ? 'Reveal Image' : 'הצג תמונה')}
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* RIGHT SIDE: Read-Only Updated Data */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div style={{ backgroundColor: 'rgba(16,185,129,0.05)', padding: '20px', borderRadius: '8px', border: '1px solid rgba(16,185,129,0.2)' }}>
                  <h4 style={{ color: '#10b981', margin: '0 0 15px 0', fontSize: '0.9rem', textTransform: 'uppercase' }}>{isEn ? 'Operator Updates' : 'עדכוני המפעיל'}</h4>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                    <div>
                      <strong style={{ color: '#94a3b8', fontSize: '0.8rem', display: 'block', marginBottom: '4px' }}>{isEn ? 'Platform' : 'פלטפורמה'}</strong>
                      <span style={{ color: '#f8fafc', fontSize: '1rem', fontWeight: 'bold' }}>{reviewModal.report.platform || 'N/A'}</span>
                    </div>
                    <div>
                      <strong style={{ color: '#94a3b8', fontSize: '0.8rem', display: 'block', marginBottom: '4px' }}>{isEn ? 'Language' : 'שפה'}</strong>
                      <span style={{ color: '#f8fafc', fontSize: '1rem', fontWeight: 'bold' }}>{reviewModal.report.language || 'N/A'}</span>
                    </div>
                  </div>

                  <div style={{ marginBottom: '15px' }}>
                    <strong style={{ color: '#94a3b8', fontSize: '0.8rem', display: 'block', marginBottom: '4px' }}>{isEn ? 'URL / Evidence Link' : 'קישור להוכחה'}</strong>
                    {reviewModal.report.source_url || reviewModal.report.url ? (
                      <a href={reviewModal.report.source_url || reviewModal.report.url} target="_blank" rel="noopener noreferrer" style={{ color: '#38bdf8', textDecoration: 'none', wordBreak: 'break-all', fontSize: '0.9rem', padding: '6px 10px', backgroundColor: 'rgba(56,189,248,0.1)', borderRadius: '6px', border: '1px solid rgba(56,189,248,0.2)', display: 'inline-block' }}>
                        {reviewModal.report.source_url || reviewModal.report.url}
                      </a>
                    ) : <span style={{ color: '#475569' }}>N/A</span>}
                  </div>

                  <div style={{ marginBottom: '15px' }}>
                    <strong style={{ color: '#94a3b8', fontSize: '0.8rem', display: 'block', marginBottom: '6px' }}>{isEn ? 'Tags / Category' : 'תגיות / קטגוריה'}</strong>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {(() => {
                        const tags = reviewModal.report.tags || (typeof reviewModal.report.category === 'string' ? reviewModal.report.category.split(',') : reviewModal.report.category) || [];
                        if (tags.length === 0) return <span style={{ color: '#475569', fontSize: '0.85rem' }}>None</span>;
                        return tags.map((tag, i) => <span key={i} style={{ backgroundColor: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem', border: '1px solid rgba(56, 189, 248, 0.3)', fontWeight: 'bold' }}>{String(tag).trim()}</span>);
                      })()}
                    </div>
                  </div>

                  {(reviewModal.report.priority_tag || reviewModal.report.priority || reviewModal.report.is_priority) && (
                     <div>
                       <span style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '6px 12px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 'bold', border: '1px solid rgba(239, 68, 68, 0.3)', display: 'inline-block' }}>
                         {isEn ? 'Immediate Threat / High Priority' : 'איום מיידי / עדיפות גבוהה'}
                       </span>
                     </div>
                  )}
                </div>
              </div>
            </div>

            {/* Content Snippet - Full Width below the grid */}
            <div style={{ marginTop: '20px', padding: '20px', backgroundColor: '#020617', border: '1px solid #334155', borderRadius: '8px' }}>
              <strong style={{ color: '#cbd5e1', fontSize: '0.85rem', display: 'block', marginBottom: '8px' }}>{isEn ? 'Content Snippet' : 'תוכן רלוונטי'}</strong>
              <p style={{ color: '#f8fafc', fontSize: '0.95rem', margin: 0, whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>{reviewModal.report.content || 'N/A'}</p>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '15px', marginTop: '25px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              <button onClick={() => setReviewModal({ isOpen: false, report: null })} style={{ backgroundColor: 'transparent', color: '#94a3b8', border: '1px solid #475569', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>{isEn ? 'Cancel' : 'ביטול'}</button>
              <button 
                onClick={() => {
                  setReviewModal({ isOpen: false, report: null });
                  openModal(reviewModal.report.id, 'Changes Requested', reviewModal.report.submitted_by || reviewModal.report.assigned_to, reviewModal.report.additional_info, reviewModal.report._table || 'reports');
                }} 
                style={{ backgroundColor: '#ef4444', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                {isEn ? 'Request Changes Again' : 'בקש תיקונים שוב'}
              </button>
              <button 
                onClick={() => {
                  onStatusUpdate(reviewModal.report.id, 'Verified', reviewModal.report.additional_info, 'Approved post-fix', reviewModal.report._table || 'reports');
                  setReviewModal({ isOpen: false, report: null });
                }} 
                style={{ backgroundColor: '#10b981', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                {Icons.CheckCircle} {isEn ? 'Approve & Verify' : 'אשר ואמת'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- FEEDBACK/REJECT MODAL --- */}
      {feedbackModal.isOpen && (
        <div style={overlayStyle}>
          <div style={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '16px', padding: '30px', width: '90%', maxWidth: '500px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)' }}>
            <h3 style={{ margin: '0 0 5px 0', color: '#fff', fontSize: '1.4rem' }}>{feedbackModal.actionType === 'Dismissed' ? (isEn ? 'Reject Threat' : 'דחיית דיווח') : (isEn ? 'Request Fix' : 'החזר לתיקון')}</h3>
            <p style={{ margin: '0 0 20px 0', color: '#94a3b8', fontSize: '0.9rem' }}>{isEn ? 'Please categorize the issue for analytics tracking.' : 'אנא סווג את ההערה לצורכי בקרה וניתוח.'}</p>
            <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '8px' }}>{isEn ? 'Reason Category' : 'קטגוריית סיבה'} <span style={{ color: '#ef4444' }}>*</span></label>
            <select value={feedbackModal.category} onChange={(e) => setFeedbackModal({ ...feedbackModal, category: e.target.value })} style={modalInputStyle}>
              {(feedbackModal.actionType === 'Dismissed' ? rejectCategories : fixCategories).map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
            {feedbackModal.category === 'Other' && (
              <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
                <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '8px' }}>{isEn ? 'Specify Reason' : 'פרט סיבה ספציפית'} <span style={{ color: '#ef4444' }}>*</span></label>
                <input type="text" placeholder={isEn ? "Enter specific reason..." : "הכנס סיבה ספציפית..."} value={feedbackModal.customSubject} onChange={(e) => setFeedbackModal({ ...feedbackModal, customSubject: e.target.value })} style={modalInputStyle} />
              </div>
            )}
            <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '8px' }}>{isEn ? 'Detailed Notes' : 'פירוט ההערה'} <span style={{ color: '#ef4444' }}>*</span></label>
            <textarea rows="4" placeholder={isEn ? "Explain what needs to be fixed..." : "הסבר למפעיל מה עליו לתקן..."} value={feedbackModal.note} onChange={(e) => setFeedbackModal({ ...feedbackModal, note: e.target.value })} style={{ ...modalInputStyle, resize: 'vertical' }} />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '15px', marginTop: '10px' }}>
              <button onClick={closeFeedbackModal} style={{ backgroundColor: 'transparent', color: '#94a3b8', border: '1px solid #475569', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>{isEn ? 'Cancel' : 'ביטול'}</button>
              <button onClick={submitFeedback} style={{ backgroundColor: feedbackModal.actionType === 'Dismissed' ? '#ef4444' : '#f59e0b', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>{isEn ? 'Submit Feedback' : 'שליחת הערות'}</button>
            </div>
          </div>
        </div>
      )}

      {/* --- HEADER --- */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '20px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '24px', color: '#fff' }}>{isEn ? 'Operations Workspace' : 'סביבת המבצעים'}</h2>
          <p style={{ margin: '5px 0 0 0', color: '#94a3b8', fontSize: '14px' }}>{isEn ? 'Manage live triage and active shift dispatching.' : 'ניהול תור משימות והקצאות למשמרת פעילה.'}</p>
        </div>
      </div>

      {/* --- SHIFT ACTIVE BANNER --- */}
      <div style={{ backgroundColor: 'rgba(30, 41, 59, 0.6)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', padding: '20px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ position: 'relative' }}>
            <div style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: isClockedIn ? '#10b981' : '#64748b', boxShadow: isClockedIn ? '0 0 12px #10b981' : 'none', transition: 'all 0.3s' }}></div>
            {isClockedIn && <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', borderRadius: '50%', border: '2px solid #10b981', animation: 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite' }}></div>}
          </div>
          <div>
            <h2 style={{ margin: 0, color: '#fff', fontSize: '1.25rem', fontWeight: 'bold' }}>{isClockedIn ? (isEn ? 'Shift Active' : 'משמרת פעילה') : (isEn ? 'Off Duty' : 'מחוץ למשמרת')}</h2>
            <div style={{ color: '#38bdf8', fontFamily: 'monospace', fontSize: '1.1rem', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>{Icons.Clock} {duration || '00:00:00'}</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <div style={{ textAlign: isRtl ? 'left' : 'right', borderRight: isRtl ? 'none' : '1px solid #334155', borderLeft: isRtl ? '1px solid #334155' : 'none', paddingRight: isRtl ? 0 : '20px', paddingLeft: isRtl ? '20px' : 0 }}>
            <div style={{ color: '#94a3b8', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '4px' }}>
              {isOperator ? (isEn ? 'My Pending Tasks' : 'משימות בהמתנה') : (isEn ? 'Action Required' : 'ממתין לפעולה')}
            </div>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', color: '#fff', fontSize: '1.1rem', fontWeight: 'bold', justifyContent: isRtl ? 'flex-start' : 'flex-end' }}>
              <div><span style={{color: '#f59e0b'}}>{actionableCounts.triage}</span> {isEn ? 'Triage' : 'טריאז\''}</div>
              <div style={{ width: '2px', height: '16px', backgroundColor: '#334155' }}></div>
              <div><span style={{color: '#a855f7'}}>{actionableCounts.assign}</span> {isEn ? 'Assignments' : 'משימות'}</div>
            </div>
          </div>
          <button onClick={handleShiftToggle} disabled={isProcessingShift} style={{ backgroundColor: isClockedIn ? 'rgba(239, 68, 68, 0.1)' : '#10b981', color: isClockedIn ? '#ef4444' : '#fff', border: isClockedIn ? '1px solid rgba(239, 68, 68, 0.3)' : 'none', padding: '12px 24px', borderRadius: '8px', fontWeight: 'bold', cursor: isProcessingShift ? 'not-allowed' : 'pointer', opacity: isProcessingShift ? 0.7 : 1, transition: 'all 0.2s' }}>
            {isProcessingShift ? '...' : (isClockedIn ? (isEn ? 'Clock Out' : 'סיום משמרת') : (isEn ? 'Clock In' : 'כניסה למשמרת'))}
          </button>
        </div>
      </div>

      {/* --- MAIN NAVIGATION (Admins Only) --- */}
      {canAssignTasks && (
        <div style={{ display: 'flex', backgroundColor: 'rgba(15, 23, 42, 0.6)', borderRadius: '12px', padding: '4px', border: '1px solid #334155', width: 'fit-content', filter: isLocked ? 'grayscale(0.8) opacity(0.5)' : 'none', pointerEvents: isLocked ? 'none' : 'auto', transition: 'all 0.3s' }}>
          <button onClick={() => setActiveSubTab('queue')} style={{ backgroundColor: activeSubTab === 'queue' ? '#1e293b' : 'transparent', color: activeSubTab === 'queue' ? '#38bdf8' : '#64748b', border: 'none', padding: '8px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            {Icons.Inbox} {isEn ? 'My Queue' : 'התור שלי'}
          </button>
          <button onClick={() => setActiveSubTab('allocation')} style={{ backgroundColor: activeSubTab === 'allocation' ? '#1e293b' : 'transparent', color: activeSubTab === 'allocation' ? '#a855f7' : '#64748b', border: 'none', padding: '8px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            {Icons.Branch} {isEn ? 'Task Allocation' : 'הקצאת משימות'}
          </button>
          {canDispatchNetwork && (
            <button onClick={() => setActiveSubTab('dispatch')} style={{ backgroundColor: activeSubTab === 'dispatch' ? '#1e293b' : 'transparent', color: activeSubTab === 'dispatch' ? '#10b981' : '#64748b', border: 'none', padding: '8px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              {Icons.Send} {isEn ? 'Network Dispatch' : 'שילוח לרשתות'}
            </button>
          )}
        </div>
      )}

      {/* --- CONTENT ROUTER --- */}
      <div style={{ filter: isLocked ? 'grayscale(0.8) blur(2px)' : 'none', pointerEvents: isLocked ? 'none' : 'auto', opacity: isLocked ? 0.6 : 1, transition: 'all 0.3s' }}>
        
        {activeSubTab === 'allocation' && canAssignTasks ? (
          <Allocation teamMembers={teamMembers} isEn={isEn} triggerToast={triggerToast} userProfile={userProfile} />
        ) : activeSubTab === 'dispatch' && canDispatchNetwork ? (
          <BatchDispatch reports={reports} isEn={isEn} triggerToast={triggerToast} refreshData={refreshData} />
        ) : (
          <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
            <div style={{ backgroundColor: 'rgba(15, 23, 42, 0.4)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>

              {/* QA / Mod View Toggles */}
              {!isOperator && (
                <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.05)', backgroundColor: 'rgba(30, 41, 59, 0.5)' }}>
                  <button onClick={() => setModView('review')} style={{ flex: 1, padding: '12px 15px', border: 'none', backgroundColor: modView === 'review' ? 'rgba(56, 189, 248, 0.1)' : 'transparent', color: modView === 'review' ? '#38bdf8' : '#94a3b8', borderBottom: modView === 'review' ? '2px solid #38bdf8' : '2px solid transparent', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                    <span style={{ fontSize: '1rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>{Icons.CheckCircle} {isEn ? 'QA Approvals' : 'אישורי QA'}</span>
                  </button>
                  <button onClick={() => setModView('team')} style={{ flex: 1, padding: '12px 15px', border: 'none', backgroundColor: modView === 'team' ? 'rgba(168, 85, 247, 0.1)' : 'transparent', color: modView === 'team' ? '#a855f7' : '#94a3b8', borderBottom: modView === 'team' ? '2px solid #a855f7' : '2px solid transparent', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                    <span style={{ fontSize: '1rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>{Icons.Users} {isEn ? 'Monitor Operators' : 'מעקב מפעילים'}</span>
                  </button>
                  <button onClick={() => setModView('archive')} style={{ flex: 1, padding: '12px 15px', border: 'none', backgroundColor: modView === 'archive' ? 'rgba(16, 185, 129, 0.1)' : 'transparent', color: modView === 'archive' ? '#10b981' : '#94a3b8', borderBottom: modView === 'archive' ? '2px solid #10b981' : '2px solid transparent', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                    <span style={{ fontSize: '1rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>{Icons.Archive} {isEn ? 'Network Archive' : 'ארכיון רשתות'}</span>
                  </button>
                </div>
              )}

              {/* Shared Queue Header (Global Safe Mode Button) */}
              <div style={{ padding: '20px 30px', minHeight: '300px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                  <h3 style={{ margin: 0, color: '#fff', fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {isOperator ? <>{Icons.Inbox} {isEn ? 'My Tasks' : 'המשימות שלי'}</> 
                     : modView === 'review' ? <>{Icons.CheckCircle} {isEn ? 'QA Approvals' : 'אישורי QA'}</> 
                     : modView === 'archive' ? <>{Icons.Archive} {isEn ? 'Resolution Archive' : 'ארכיון דיווחים'}</> 
                     : <>{Icons.Users} {isEn ? 'Team Traffic' : 'מעקב מפעילים'}</>}
                  </h3>

                  <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                    <button onClick={() => setSafeMode(!safeMode)} style={{ backgroundColor: safeMode ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: safeMode ? '#10b981' : '#ef4444', border: `1px solid ${safeMode ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`, padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s' }}>
                      {safeMode ? <>{Icons.Shield} Shield: ON</> : <>{Icons.Alert} Shield: OFF</>}
                    </button>
                  </div>
                </div>

                {/* --- RENDER SUB-COMPONENTS --- */}
                {isOperator ? (
                  <OperatorQueue reports={filteredOperatorReports} isEn={isEn} safeMode={safeMode} teamMembers={teamMembers} userProfile={userProfile} expandedLogs={expandedLogs} onToggleLog={toggleLog} setImageModal={setImageModal} onStatusUpdate={onStatusUpdate} openModal={openModal} openCorrectionModal={handleOpenCorrection} />
                ) : modView === 'review' ? (
                  <AdminQAQueue reports={reports} isEn={isEn} safeMode={safeMode} teamMembers={teamMembers} userProfile={userProfile} expandedLogs={expandedLogs} onToggleLog={toggleLog} setImageModal={setImageModal} onStatusUpdate={onStatusUpdate} openModal={openModal} onAssignReport={onAssignReport} openReviewModal={handleOpenReview} />
                ) : modView === 'team' ? (
                  <AdminTeamQueue reports={reports} isEn={isEn} safeMode={safeMode} teamMembers={teamMembers} userProfile={userProfile} expandedLogs={expandedLogs} onToggleLog={toggleLog} setImageModal={setImageModal} onStatusUpdate={onStatusUpdate} openModal={openModal} onAssignReport={onAssignReport} />
                ) : (
                  <AdminArchive reports={reports} isEn={isEn} safeMode={safeMode} teamMembers={teamMembers} setImageModal={setImageModal} userProfile={userProfile} />
                )}

              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Workspace;