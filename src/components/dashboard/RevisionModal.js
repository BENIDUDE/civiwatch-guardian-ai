import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';

const RevisionModal = ({ report, onClose, isEn, triggerToast, onRefresh }) => {
  // Pre-fill states with existing report data
  const [updatedLink, setUpdatedLink] = useState(report?.source_url || '');
  const [updatedContext, setUpdatedContext] = useState(report?.content || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [moderatorFeedback, setModeratorFeedback] = useState('');

  // Extract the latest Moderator feedback from the history log
  useEffect(() => {
    if (report?.additional_info && Array.isArray(report.additional_info)) {
      // Find the most recent "Requested Fix" action
      const fixRequests = report.additional_info.filter(info => info.action === 'Requested Fix' || info.action === 'בקש תיקון');
      if (fixRequests.length > 0) {
        const latestFix = fixRequests[fixRequests.length - 1];
        setModeratorFeedback(latestFix.note.replace('Feedback: ', ''));
      } else {
        setModeratorFeedback(isEn ? 'Please review and update the report details.' : 'אנא עיין ועדכן את פרטי הדיווח.');
      }
    }
  }, [report, isEn]);

  if (!report) return null;

  const handleResubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const currentUser = await supabase.auth.getUser();
      const submitterName = currentUser.data?.user?.email?.split('@')[0] || 'Operator';

      const actionNote = {
        timestamp: new Date().toISOString(),
        actor: submitterName,
        action: isEn ? 'Operator Revised' : 'תוקן על ידי מפעיל',
        note: isEn ? 'Report details updated and resubmitted for review.' : 'פרטי הדיווח עודכנו והוגשו לבדיקה מחדש.'
      };

      const updatedHistory = report.additional_info 
        ? [...report.additional_info, actionNote] 
        : [actionNote];

      const { error } = await supabase
        .from('reports')
        .update({ 
          source_url: updatedLink,
          content: updatedContext,
          status: 'Pending Review', // Pushes it back to the Moderator
          additional_info: updatedHistory,
          updated_at: new Date().toISOString()
        })
        .eq('id', report.id);

      if (error) throw error;

      triggerToast(isEn ? 'Report successfully revised and resubmitted.' : 'הדיווח תוקן ונשלח בהצלחה לבדיקה מחדש.', 'success');
      onRefresh(); 
      onClose(); 

    } catch (error) {
      console.error("Revision Error:", error);
      triggerToast(isEn ? `Error updating report: ${error.message}` : `שגיאה בעדכון הדיווח: ${error.message}`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isRtl = !isEn;
  const inputBaseStyle = {
    width: '100%', padding: '12px 16px', backgroundColor: '#0f172a',
    border: '1px solid #334155', borderRadius: '12px', color: '#ffffff',
    fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.3s'
  };
  const labelStyle = { display: 'block', fontSize: '0.875rem', fontWeight: 'bold', color: '#cbd5e1', marginBottom: '8px' };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(8px)', direction: isRtl ? 'rtl' : 'ltr', padding: '16px' }}>
      
      <div style={{ width: '100%', maxWidth: '600px', backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', display: 'flex', flexDirection: 'column', maxHeight: '90vh' }}>
        
        {/* Header */}
        <div style={{ padding: '24px', borderBottom: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(245, 158, 11, 0.1)' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ffffff', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              {isEn ? 'Revise Task' : 'תיקון משימה'} 
              <span style={{ fontSize: '1rem', color: '#94a3b8', fontWeight: 'normal' }}>#{report.id.substring(0, 8)}</span>
            </h2>
            <span style={{ backgroundColor: 'rgba(249, 115, 22, 0.2)', color: '#fdba74', padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold' }}>
              {report.status}
            </span>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '1.5rem', cursor: 'pointer', padding: '8px' }}>✕</button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleResubmit} style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', flex: 1 }}>
          <div style={{ padding: '24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Moderator Feedback Banner */}
            <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', borderLeft: isRtl ? 'none' : '4px solid #ef4444', borderRight: isRtl ? '4px solid #ef4444' : 'none', padding: '16px', borderRadius: '8px' }}>
              <h4 style={{ color: '#fca5a5', margin: '0 0 8px 0', fontSize: '0.875rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
                ⚠️ {isEn ? 'Moderator Notes:' : 'הערות מנהל לתיקון:'}
              </h4>
              <p style={{ color: '#fef2f2', fontSize: '0.95rem', margin: 0, lineHeight: '1.5' }}>
                {moderatorFeedback}
              </p>
            </div>

            {/* Editable Fields */}
            <div>
              <label style={labelStyle}>{isEn ? 'Update URL' : 'עדכון קישור'}</label>
              <input 
                type="url" 
                value={updatedLink} 
                onChange={(e) => setUpdatedLink(e.target.value)} 
                style={{ ...inputBaseStyle, direction: 'ltr', textAlign: 'left' }} 
                required
              />
            </div>

            <div>
              <label style={labelStyle}>{isEn ? 'Update Context / Explanation' : 'עדכון הקשר / הסבר'}</label>
              <textarea 
                rows="4" 
                value={updatedContext}
                onChange={(e) => setUpdatedContext(e.target.value)}
                style={{ ...inputBaseStyle, resize: 'vertical' }}
                required
              ></textarea>
            </div>

          </div>

          {/* Footer Actions */}
          <div style={{ padding: '24px', borderTop: '1px solid #334155', backgroundColor: '#0f172a', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button 
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              style={{ padding: '12px 24px', backgroundColor: 'transparent', color: '#cbd5e1', border: '1px solid #475569', borderRadius: '8px', fontWeight: 'bold', cursor: isSubmitting ? 'not-allowed' : 'pointer', transition: 'all 0.2s' }}
            >
              {isEn ? 'Cancel' : 'ביטול'}
            </button>

            <button 
              type="submit"
              disabled={isSubmitting || !updatedLink || !updatedContext} 
              style={{ padding: '12px 24px', backgroundColor: '#f59e0b', color: '#ffffff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: (isSubmitting || !updatedLink || !updatedContext) ? 'not-allowed' : 'pointer', opacity: (isSubmitting || !updatedLink || !updatedContext) ? 0.6 : 1, transition: 'all 0.2s', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
            >
              {isSubmitting ? (isEn ? 'Submitting...' : 'שולח...') : (isEn ? 'Resubmit to Queue' : 'הגש מחדש לבדיקה')}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

export default RevisionModal;