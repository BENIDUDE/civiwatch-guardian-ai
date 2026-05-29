import React, { useState } from 'react';
import { supabase } from '../../supabaseClient';

const ReviewModal = ({ report, onClose, isEn, triggerToast, onRefresh }) => {
  const [feedback, setFeedback] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Safety check
  if (!report) return null;

  const handleUpdateStatus = async (newStatus, actionLabel) => {
    setIsProcessing(true);

    try {
      const currentUser = await supabase.auth.getUser();
      const submitterName = currentUser.data?.user?.email?.split('@')[0] || 'Moderator';

      const actionNote = {
        timestamp: new Date().toISOString(),
        actor: submitterName,
        action: actionLabel,
        note: feedback ? `Feedback: ${feedback}` : 'No additional feedback provided.'
      };

      const updatedHistory = report.additional_info 
        ? [...report.additional_info, actionNote] 
        : [actionNote];

      const { error } = await supabase
        .from('reports')
        .update({ 
          status: newStatus,
          additional_info: updatedHistory,
          updated_at: new Date().toISOString()
        })
        .eq('id', report.id);

      if (error) throw error;

      triggerToast(isEn ? `Report updated to: ${newStatus}` : `הדיווח עודכן לסטטוס: ${newStatus}`, 'success');
      onRefresh(); 
      onClose(); 

    } catch (error) {
      console.error("Update Error:", error);
      triggerToast(isEn ? `Error updating report: ${error.message}` : `שגיאה בעדכון הדיווח: ${error.message}`, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const isRtl = !isEn;
  const isUrgent = report.priority_tag;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(8px)', direction: isRtl ? 'rtl' : 'ltr', padding: '16px' }}>
      
      <div style={{ width: '100%', maxWidth: '900px', backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', display: 'flex', flexDirection: 'column', maxHeight: '90vh' }}>
        
        {/* Header */}
        <div style={{ padding: '24px', borderBottom: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: isUrgent ? 'rgba(239, 68, 68, 0.1)' : 'transparent' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ffffff', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              {isEn ? 'Task Review' : 'בדיקת משימה'} 
              <span style={{ fontSize: '1rem', color: '#94a3b8', fontWeight: 'normal' }}>#{report.id.substring(0, 8)}</span>
            </h2>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ backgroundColor: 'rgba(59, 130, 246, 0.2)', color: '#93c5fd', padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'capitalize' }}>
                {report.platform}
              </span>
              <span style={{ backgroundColor: 'rgba(100, 116, 139, 0.2)', color: '#cbd5e1', padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                {report.status}
              </span>
              {isUrgent && (
                <span style={{ backgroundColor: '#ef4444', color: '#ffffff', padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                  {isEn ? 'CRITICAL THREAT' : 'סכנה מיידית'}
                </span>
              )}
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '1.5rem', cursor: 'pointer', padding: '8px' }}>✕</button>
        </div>

        {/* Content Body */}
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth > 768 ? '1fr 1.2fr' : '1fr', gap: '24px' }}>
            {/* Left Column: Data */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '0.875rem', color: '#94a3b8', fontWeight: 'bold', marginBottom: '4px', display: 'block' }}>URL</label>
                <a href={report.source_url} target="_blank" rel="noopener noreferrer" style={{ color: '#60a5fa', wordBreak: 'break-all', fontSize: '0.95rem' }}>{report.source_url}</a>
              </div>
              
              <div>
                <label style={{ fontSize: '0.875rem', color: '#94a3b8', fontWeight: 'bold', marginBottom: '4px', display: 'block' }}>{isEn ? 'Tags' : 'תגיות'}</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {report.tags && report.tags.length > 0 ? report.tags.map((tag, idx) => (
                    <span key={idx} style={{ backgroundColor: '#0f172a', border: '1px solid #334155', color: '#cbd5e1', padding: '4px 8px', borderRadius: '6px', fontSize: '0.875rem' }}>#{tag}</span>
                  )) : <span style={{ color: '#64748b', fontSize: '0.875rem' }}>{isEn ? 'None' : 'אין'}</span>}
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.875rem', color: '#94a3b8', fontWeight: 'bold', marginBottom: '4px', display: 'block' }}>{isEn ? 'Context' : 'הקשר'}</label>
                <p style={{ margin: 0, color: '#f8fafc', fontSize: '0.95rem', backgroundColor: '#0f172a', padding: '12px', borderRadius: '8px', border: '1px solid #334155', minHeight: '80px' }}>
                  {report.content}
                </p>
              </div>
            </div>

            {/* Right Column: Evidence & AI */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* --- NEW: Evidence Display Box --- */}
              <div>
                <label style={{ fontSize: '0.875rem', color: '#94a3b8', fontWeight: 'bold', marginBottom: '4px', display: 'block' }}>
                  {isEn ? 'Evidence / Screenshot' : 'ראיות / צילום מסך'}
                </label>
                <div style={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px', padding: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px', maxHeight: '350px', overflow: 'hidden' }}>
                  {report.image_url ? (
                    <img 
                      src={report.image_url} 
                      alt="Report Evidence" 
                      style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: '8px' }} 
                    />
                  ) : (
                    <div style={{ textAlign: 'center', color: '#64748b' }}>
                      <span style={{ fontSize: '2rem', display: 'block', marginBottom: '8px' }}>🖼️</span>
                      <span style={{ fontSize: '0.875rem' }}>
                        {isEn ? 'No screenshot provided with this report.' : 'לא צורף צילום מסך לדיווח זה.'}
                      </span>
                    </div>
                  )}
                </div>
              </div>

               <div style={{ backgroundColor: 'rgba(168, 85, 247, 0.1)', border: '1px solid rgba(168, 85, 247, 0.3)', borderRadius: '12px', padding: '16px' }}>
                 <h4 style={{ color: '#d8b4fe', margin: '0 0 8px 0', fontSize: '0.875rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
                   ✨ {isEn ? 'AI Council Assessment' : 'הערכת מועצת ה-AI'}
                 </h4>
                 <p style={{ color: '#f3e8ff', fontSize: '0.875rem', margin: 0 }}>
                   {isEn ? 'Awaiting API integration for specific model votes.' : 'ממתין לשילוב API להצגת הצבעות מודלים פרטניות.'}
                 </p>
               </div>
            </div>
          </div>

          {/* Feedback Section */}
          <div style={{ marginTop: 'auto' }}>
            <label style={{ fontSize: '0.875rem', color: '#94a3b8', fontWeight: 'bold', marginBottom: '8px', display: 'block' }}>
              {isEn ? 'Moderator Feedback (Required for Rejection/Revision)' : 'משוב מנהל (חובה לדחייה/תיקון)'}
            </label>
            <textarea 
              rows="3" 
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder={isEn ? "Explain why this needs fixing or is being rejected..." : "הסבר מדוע נדרש תיקון או מדוע הדיווח נדחה..."}
              style={{ width: '100%', padding: '12px 16px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px', color: '#ffffff', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box', resize: 'vertical' }}
            />
          </div>

        </div>

        {/* Footer Actions */}
        <div style={{ padding: '24px', borderTop: '1px solid #334155', backgroundColor: '#0f172a', display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          
          <button 
            disabled={isProcessing || !feedback.trim()} 
            onClick={() => handleUpdateStatus('Closed (Internal Reject)', 'Rejected Report')}
            style={{ padding: '12px 24px', backgroundColor: 'transparent', color: '#ef4444', border: '1px solid #ef4444', borderRadius: '8px', fontWeight: 'bold', cursor: (isProcessing || !feedback.trim()) ? 'not-allowed' : 'pointer', opacity: (isProcessing || !feedback.trim()) ? 0.5 : 1, transition: 'all 0.2s' }}
          >
            {isEn ? 'Reject & Close' : 'דחה וסגור'}
          </button>

          <button 
            disabled={isProcessing || !feedback.trim()} 
            onClick={() => handleUpdateStatus('Needs Revision', 'Requested Fix')}
            style={{ padding: '12px 24px', backgroundColor: 'transparent', color: '#f59e0b', border: '1px solid #f59e0b', borderRadius: '8px', fontWeight: 'bold', cursor: (isProcessing || !feedback.trim()) ? 'not-allowed' : 'pointer', opacity: (isProcessing || !feedback.trim()) ? 0.5 : 1, transition: 'all 0.2s' }}
          >
            {isEn ? 'Ask for Fix' : 'בקש תיקון'}
          </button>

          <button 
            disabled={isProcessing} 
            onClick={() => handleUpdateStatus('Escalated', 'Approved & Escalated')}
            style={{ padding: '12px 24px', backgroundColor: '#3b82f6', color: '#ffffff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: isProcessing ? 'not-allowed' : 'pointer', opacity: isProcessing ? 0.6 : 1, transition: 'all 0.2s', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
          >
            {isEn ? 'Approve & Escalate' : 'אשר והסלם'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default ReviewModal;