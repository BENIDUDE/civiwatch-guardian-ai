/**
 * @file SettingsTab.js
 * @description The Settings hub for the dashboard.
 * Acts as a router for Team Management, SOP Manager (Operation Guides), QA, and Billing.
 * ENFORCES RBAC: Admins see all tabs. Moderators only see Team and Guides.
 */
import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import DynamicQAConfig from './DynamicQAConfig';
import Billing from './Billing';
import TeamManager from './TeamManager'; // Importer added

const Icons = {
  Users: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>,
  Zap: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>,
  CreditCard: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>,
  Book: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>,
  Trash: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>,
  Link: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
};

const PLATFORMS = ['X (Twitter)', 'Facebook', 'Instagram', 'TikTok', 'Telegram', 'YouTube', 'LinkedIn', 'Discord', 'Truth Social', 'VK', 'Other'];
const CATEGORIES = ['Antisemitism', 'Hate Speech', 'Harassment', 'Terrorism', 'Violence / Cruelty', 'Pornography', 'Nudity', 'Fake News', 'Troll', 'Other'];

const inputStyle = { width: '100%', backgroundColor: '#0f172a', border: '1px solid #334155', color: '#f8fafc', padding: '10px 15px', borderRadius: '8px', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' };

const SettingsTab = ({ teamMembers, currentUserProfile, isEn, triggerToast, refreshData }) => {
  const isRtl = !isEn;
  
  // --- RBAC LOGIC ---
  const userRole = currentUserProfile?.role?.toLowerCase()?.trim() || '';
  const canSeeAdminTabs = ['ngo admin', 'admin', 'super admin', 'global admin'].includes(userRole);
  
  // Tab State
  const [activeTab, setActiveTab] = useState('team');

  // --- GUIDELINES STATE (SOP) ---
  const [guidelines, setGuidelines] = useState([]);
  const [newGuide, setNewGuide] = useState({ network: '', category: '', drive_link: '' });
  const [isGuidesLoading, setIsGuidesLoading] = useState(false);

  // --- GUIDES LOGIC EFFECT ---
  useEffect(() => {
    if (activeTab === 'guides') {
      fetchGuidelines();
    }
  }, [activeTab]);

  const fetchGuidelines = async () => {
    try {
      const { data, error } = await supabase.from('platform_guidelines').select('*').order('network', { ascending: true });
      if (error) throw error;
      setGuidelines(data || []);
    } catch (error) {
      console.error('Error fetching guidelines:', error);
    }
  };

  const handleSaveGuideline = async () => {
    if (!newGuide.network || !newGuide.category || !newGuide.drive_link) {
      triggerToast(isEn ? 'Please fill out all fields.' : 'אנא מלא את כל השדות.', 'error');
      return;
    }
    if (!newGuide.drive_link.startsWith('http')) {
      triggerToast(isEn ? 'Please enter a valid URL (http/https).' : 'אנא הכנס כתובת אינטרנט חוקית.', 'error');
      return;
    }

    setIsGuidesLoading(true);
    try {
      const existingIndex = guidelines.findIndex(g => g.network === newGuide.network && g.category === newGuide.category);
      
      let query;
      if (existingIndex >= 0) {
        query = supabase.from('platform_guidelines').update({ drive_link: newGuide.drive_link }).eq('id', guidelines[existingIndex].id);
      } else {
        query = supabase.from('platform_guidelines').insert([newGuide]);
      }

      const { error } = await query;
      if (error) throw error;

      triggerToast(isEn ? 'Guideline saved successfully!' : 'ההנחיה נשמרה בהצלחה!', 'success');
      setNewGuide({ network: '', category: '', drive_link: '' });
      fetchGuidelines();
    } catch (error) {
      console.error('Error saving guideline:', error);
      triggerToast(isEn ? 'Failed to save guideline.' : 'שגיאה בשמירת ההנחיה.', 'error');
    } finally {
      setIsGuidesLoading(false);
    }
  };

  const handleDeleteGuideline = async (id) => {
    if (!window.confirm(isEn ? 'Are you sure you want to delete this guide?' : 'האם אתה בטוח שברצונך למחוק הנחיה זו?')) return;
    try {
      const { error } = await supabase.from('platform_guidelines').delete().eq('id', id);
      if (error) throw error;
      triggerToast(isEn ? 'Guideline deleted.' : 'ההנחיה נמחקה.', 'success');
      fetchGuidelines();
    } catch (error) {
      console.error('Error deleting guideline:', error);
      triggerToast(isEn ? 'Failed to delete.' : 'שגיאה במחיקה.', 'error');
    }
  };

  return (
    <div style={{ animation: 'fadeIn 0.4s ease-out', direction: isRtl ? 'rtl' : 'ltr' }}>
      
      {/* --- SUB-NAVIGATION --- */}
      <div style={{ display: 'flex', gap: '15px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '15px', marginBottom: '25px', flexWrap: 'wrap' }}>
        
        <button 
          onClick={() => setActiveTab('team')} 
          style={{ backgroundColor: activeTab === 'team' ? 'rgba(56, 189, 248, 0.1)' : 'transparent', color: activeTab === 'team' ? '#38bdf8' : '#94a3b8', border: activeTab === 'team' ? '1px solid rgba(56, 189, 248, 0.3)' : '1px solid transparent', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', transition: 'all 0.2s' }}
        >
          {Icons.Users} {isEn ? 'Team Management' : 'ניהול צוות'}
        </button>

        <button 
          onClick={() => setActiveTab('guides')} 
          style={{ backgroundColor: activeTab === 'guides' ? 'rgba(56, 189, 248, 0.1)' : 'transparent', color: activeTab === 'guides' ? '#38bdf8' : '#94a3b8', border: activeTab === 'guides' ? '1px solid rgba(56, 189, 248, 0.3)' : '1px solid transparent', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', transition: 'all 0.2s' }}
        >
          {Icons.Book} {isEn ? 'Operation Guides' : 'מדריכי הפעלה'}
        </button>

        {canSeeAdminTabs && (
          <>
            <button 
              onClick={() => setActiveTab('qa')} 
              style={{ backgroundColor: activeTab === 'qa' ? 'rgba(56, 189, 248, 0.1)' : 'transparent', color: activeTab === 'qa' ? '#38bdf8' : '#94a3b8', border: activeTab === 'qa' ? '1px solid rgba(56, 189, 248, 0.3)' : '1px solid transparent', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', transition: 'all 0.2s' }}
            >
              <span style={{ color: '#f59e0b' }}>{Icons.Zap}</span> {isEn ? 'QA Automation' : 'אוטומציית QA'}
            </button>
            <button 
              onClick={() => setActiveTab('billing')} 
              style={{ backgroundColor: activeTab === 'billing' ? 'rgba(56, 189, 248, 0.1)' : 'transparent', color: activeTab === 'billing' ? '#38bdf8' : '#94a3b8', border: activeTab === 'billing' ? '1px solid rgba(56, 189, 248, 0.3)' : '1px solid transparent', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', transition: 'all 0.2s' }}
            >
              {Icons.CreditCard} {isEn ? 'Billing & Subscription' : 'חיובים ומנויים'}
            </button>
          </>
        )}
      </div>

      {/* --- TAB CONTENT --- */}
      
      {activeTab === 'team' && (
        <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
          <TeamManager 
            teamMembers={teamMembers} 
            currentUserProfile={currentUserProfile} 
            isEn={isEn} 
            triggerToast={triggerToast} 
            refreshData={refreshData} 
          />
        </div>
      )}

      {activeTab === 'guides' && (
        <div style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', padding: '30px', maxWidth: '1000px', animation: 'fadeIn 0.4s ease-out' }}>
          
          <h2 style={{ color: '#fff', margin: '0 0 10px 0', fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
            {Icons.Book} {isEn ? 'Task Operation Guides (SOPs)' : 'מדריכי משימות (SOPs)'}
          </h2>
          <p style={{ color: '#94a3b8', margin: '0 0 30px 0', lineHeight: '1.5' }}>
            {isEn 
              ? 'Attach Google Drive links to specific networks and subjects. When a Moderator creates a manual task in the Task Allocation tab, the relevant guideline link will automatically be attached to the Operator\'s assignment.' 
              : 'צרף קישורי Google Drive לרשתות ונושאים ספציפיים. בעת הקצאת משימה יזומה, הקישור הרלוונטי יצורף אוטומטית למשימה של המפעיל.'}
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', backgroundColor: '#020617', padding: '20px', borderRadius: '12px', border: '1px solid #334155', marginBottom: '40px' }}>
            
            <div>
              <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '8px' }}>{isEn ? 'Platform (Network)' : 'פלטפורמה (רשת)'}</label>
              <select value={newGuide.network} onChange={(e) => setNewGuide({...newGuide, network: e.target.value})} style={inputStyle}>
                <option value="">{isEn ? 'Select Platform...' : 'בחר פלטפורמה...'}</option>
                {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '8px' }}>{isEn ? 'Subject (Category)' : 'נושא (קטגוריה)'}</label>
              <select value={newGuide.category} onChange={(e) => setNewGuide({...newGuide, category: e.target.value})} style={inputStyle}>
                <option value="">{isEn ? 'Select Subject...' : 'בחר נושא...'}</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '8px' }}>{isEn ? 'Google Drive Link' : 'קישור ל-Google Drive'}</label>
              <input 
                type="url" 
                placeholder="https://docs.google.com/..." 
                value={newGuide.drive_link} 
                onChange={(e) => setNewGuide({...newGuide, drive_link: e.target.value})} 
                style={inputStyle} 
              />
            </div>

            <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
              <button 
                onClick={handleSaveGuideline} 
                disabled={isGuidesLoading}
                style={{ backgroundColor: '#10b981', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: '8px', fontWeight: 'bold', cursor: isGuidesLoading ? 'not-allowed' : 'pointer', opacity: isGuidesLoading ? 0.7 : 1, transition: 'background-color 0.2s' }}
              >
                {isGuidesLoading ? '...' : (isEn ? 'Save Guideline' : 'שמור הנחיה')}
              </button>
            </div>
          </div>

          <h3 style={{ color: '#e2e8f0', margin: '0 0 15px 0', fontSize: '1.2rem' }}>{isEn ? 'Active Guidelines' : 'הנחיות פעילות'}</h3>
          
          {guidelines.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px', backgroundColor: '#020617', borderRadius: '12px', border: '1px dashed #334155', color: '#64748b' }}>
              {isEn ? 'No guidelines saved yet.' : 'אין הנחיות שמורות.'}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '15px' }}>
              {guidelines.map(guide => (
                <div key={guide.id} style={{ backgroundColor: '#020617', border: '1px solid #334155', borderRadius: '12px', padding: '15px', position: 'relative' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <div>
                      <span style={{ backgroundColor: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', padding: '4px 8px', borderRadius: '6px', fontSize: '0.75rem', border: '1px solid rgba(56, 189, 248, 0.2)', fontWeight: 'bold' }}>
                        {guide.network}
                      </span>
                      <h4 style={{ color: '#fff', margin: '10px 0 0 0', fontSize: '1.1rem' }}>{guide.category}</h4>
                    </div>
                    <button onClick={() => handleDeleteGuideline(guide.id)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px', opacity: 0.7, transition: 'opacity 0.2s' }} onMouseEnter={(e) => e.target.style.opacity = 1} onMouseLeave={(e) => e.target.style.opacity = 0.7} title={isEn ? "Delete" : "מחק"}>
                      {Icons.Trash}
                    </button>
                  </div>
                  <a href={guide.drive_link} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#10b981', fontSize: '0.85rem', textDecoration: 'none', wordBreak: 'break-all' }}>
                    {Icons.Link} {isEn ? 'Open Document' : 'פתח מסמך'}
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'qa' && canSeeAdminTabs && (
        <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
          <DynamicQAConfig organizationId={currentUserProfile?.organization_id} isEn={isEn} triggerToast={triggerToast} />
        </div>
      )}
      
      {activeTab === 'billing' && canSeeAdminTabs && (
        <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
          <Billing userProfile={currentUserProfile} isEn={isEn} />
        </div>
      )}

    </div>
  );
};

export default SettingsTab;