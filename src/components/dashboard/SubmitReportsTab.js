/**
 * @file SubmitReportsTab.js
 * @description Container component for the "My Reports" workspace tab.
 * This file acts as a local sub-router, allowing operators and moderators to toggle 
 * between injecting new manual intelligence into the system (via ReportForm) and 
 * tracking the real-time status of their past submissions and current assignments (via MySubmissions).
 * * --- COMPONENT PROPS ---
 * @param {Object} userProfile - The authenticated user's profile data, passed down to child components for audit logging.
 * @param {boolean} isEn - Localization toggle (English/Hebrew).
 * @param {Function} triggerToast - Global UI notification dispatcher for success/error alerts.
 * * --- STATE ---
 * @state {string} activeSubTab - Determines which child component is currently rendered ('new' vs 'history').
 */
import React, { useState } from 'react';
import ReportForm from './ReportForm';
import MySubmissions from './MySubmissions';

// Universal SVG Icon Mapping
const SVGIcons = {
  Plus: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>,
  List: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
};

const SubmitReportsTab = ({ userProfile, isEn, triggerToast }) => {
  const isRtl = !isEn;
  const [activeSubTab, setActiveSubTab] = useState('new');

  return (
    <div style={{ animation: 'fadeIn 0.4s ease-out', direction: isRtl ? 'rtl' : 'ltr' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '20px', marginBottom: '30px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '24px', color: '#fff' }}>
            {isEn ? 'My Reports' : 'הדיווחים שלי'}
          </h2>
          <p style={{ margin: '5px 0 0 0', color: '#94a3b8', fontSize: '14px' }}>
            {isEn ? 'Submit new intelligence or track your past submissions.' : 'הזן מודיעין חדש או עקוב אחר הדיווחים הקודמים שלך.'}
          </p>
        </div>

        <div style={{ display: 'flex', backgroundColor: 'rgba(15, 23, 42, 0.6)', borderRadius: '12px', padding: '4px', border: '1px solid #334155', flexWrap: 'wrap' }}>
          <button 
            onClick={() => setActiveSubTab('new')}
            style={{ backgroundColor: activeSubTab === 'new' ? '#1e293b' : 'transparent', color: activeSubTab === 'new' ? '#38bdf8' : '#64748b', border: 'none', padding: '8px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            {SVGIcons.Plus} {isEn ? 'Submit New' : 'דיווח חדש'}
          </button>
          
          <button 
            onClick={() => setActiveSubTab('history')}
            style={{ backgroundColor: activeSubTab === 'history' ? '#1e293b' : 'transparent', color: activeSubTab === 'history' ? '#10b981' : '#64748b', border: 'none', padding: '8px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            {SVGIcons.List} {isEn ? 'My History' : 'היסטוריה שלי'}
          </button>
        </div>
      </div>

      {activeSubTab === 'new' && (
        <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
          <ReportForm userProfile={userProfile} isEn={isEn} triggerToast={triggerToast} />
        </div>
      )}
      
      {activeSubTab === 'history' && (
        <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
          <MySubmissions userProfile={userProfile} isEn={isEn} triggerToast={triggerToast} />
        </div>
      )}
    </div>
  );
};

export default SubmitReportsTab;