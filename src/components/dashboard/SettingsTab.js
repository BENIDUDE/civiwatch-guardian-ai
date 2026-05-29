/**
 * @file SettingsTab.js
 * @description The Settings hub for the dashboard.
 * Merged Team Management (Role Elevation, Queue Evacuation) with the SOP Manager (Operation Guides).
 * ENFORCES RBAC: Admins see all tabs (Team, QA, Billing, Guides). Moderators only see Team and Guides.
 */
import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import DynamicQAConfig from './DynamicQAConfig';
import Billing from './Billing';

const Icons = {
  Users: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>,
  Zap: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>,
  CreditCard: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>,
  Book: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>,
  Trash: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>,
  Link: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>,
  UserPlus: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg>,
  SettingsIcon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>,
  ArrowUpCircle: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="16 12 12 8 8 12"></polyline><line x1="12" y1="16" x2="12" y2="8"></line></svg>,
  Mail: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
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

  // --- TEAM MANAGEMENT STATE ---
  const [localTeam, setLocalTeam] = useState([]);
  const [availablePool, setAvailablePool] = useState([]);
  const [isAddingFromPool, setIsAddingFromPool] = useState(false);
  const [selectedPoolUserId, setSelectedPoolUserId] = useState('');
  const [isInviting, setIsInviting] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [samplingRate, setSamplingRate] = useState(100);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [isClearingQueue, setIsClearingQueue] = useState(false);

  // Elevation State
  const [showElevationModal, setShowElevationModal] = useState(false);
  const [memberToElevate, setMemberToElevate] = useState(null);
  const [targetRole, setTargetRole] = useState('');
  const [isElevating, setIsElevating] = useState(false);

  const getRoleLevel = (roleStr) => {
    const role = (roleStr || '').toLowerCase().trim();
    if (['global admin', 'super admin', 'system admin'].includes(role)) return 5;
    if (['admin', 'ngo admin'].includes(role)) return 3;
    if (['moderator l2'].includes(role)) return 2;
    if (['operator l1'].includes(role)) return 1;
    return 0;
  };

  const myPowerLevel = getRoleLevel(currentUserProfile?.role);
  const isOrgAdmin = myPowerLevel >= 3;

  // --- TEAM LOGIC EFFECT ---
  useEffect(() => {
    if (!currentUserProfile) return;
    
    const safeTeamMembers = Array.isArray(teamMembers) ? teamMembers : [];
    const myProfileId = currentUserProfile.id;
    const myAuthId = currentUserProfile.user_id;

    const pool = safeTeamMembers.filter(user => {
      const role = (user.role || '').toLowerCase();
      return (role.includes('operator') || role === '') && !user.manager_id && user.id !== myProfileId;
    });
    setAvailablePool(pool);

    let roster = [];
    if (isOrgAdmin) {
      roster = safeTeamMembers.filter(user => {
        const userLevel = getRoleLevel(user.role);
        return myPowerLevel >= 5 ? true : userLevel < 5;
      });
    } else {
      roster = safeTeamMembers.filter(user => {
        const role = (user.role || '').toLowerCase().trim();
        return role === 'ngo admin' || user.id === myProfileId || user.user_id === myAuthId || user.manager_id === myProfileId || user.manager_id === myAuthId;
      });
    }

    const amIInRoster = roster.find(u => u.id === myProfileId || u.user_id === myAuthId);
    if (!amIInRoster && currentUserProfile) roster.push(currentUserProfile);
    setLocalTeam(roster);
  }, [teamMembers, currentUserProfile, isOrgAdmin, myPowerLevel]);

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

  // --- TEAM MANAGEMENT LOGIC ---
  const canManageMember = (targetMember) => {
    if (!currentUserProfile) return false;
    if (currentUserProfile.id === targetMember.id || currentUserProfile.user_id === targetMember.user_id) return false; 
    return myPowerLevel > getRoleLevel(targetMember.role);
  };

  const getNextRole = (currentRoleStr) => {
    const level = getRoleLevel(currentRoleStr);
    if (level === 1) return 'Moderator L2';
    if (level === 2) return 'NGO Admin';
    if (level === 3 && myPowerLevel >= 5) return 'Global Admin';
    return null;
  };

  const handleOpenElevation = (member) => {
    const nextRole = getNextRole(member.role);
    if (!nextRole) return;
    setMemberToElevate(member);
    setTargetRole(nextRole);
    setShowElevationModal(true);
  };

  const executeRoleElevation = async () => {
    if (!memberToElevate || !targetRole) return;
    setIsElevating(true);
    try {
      const { error } = await supabase.rpc('elevate_user_role', {
        p_target_profile_id: memberToElevate.id,
        p_new_role: targetRole,
        p_admin_profile_id: currentUserProfile.id
      });
      if (error) throw error;
      triggerToast(isEn ? `${memberToElevate.display_name || memberToElevate.email} elevated to ${targetRole}.` : `${memberToElevate.display_name || memberToElevate.email} קודם לתפקיד ${targetRole}.`, 'success');
      setShowElevationModal(false);
      setMemberToElevate(null);
      if (refreshData) refreshData();
    } catch (err) {
      console.error("Elevation Error:", err);
      triggerToast(isEn ? "Failed to elevate role." : "קידום ההרשאה נכשל.", 'error');
    } finally {
      setIsElevating(false);
    }
  };

  const handleClearQueue = async () => {
    if (!selectedMember) return;
    const targetUserId = selectedMember.user_id;
    if (!targetUserId) {
      triggerToast(isEn ? "Cannot clear queue: User ID missing." : "שגיאה: מזהה משתמש חסר.", 'error');
      return;
    }
    if (!window.confirm(isEn ? "Are you sure you want to evacuate all active work items from this queue? Items will be sent to the Unassigned Recovery center." : "האם אתה בטוח שברצונך לפנות את כל המשימות הפעילות של משתמש זה? הפריטים יועברו למרכז השחזור לתור הכללי.")) return;

    setIsClearingQueue(true);
    try {
      const { error } = await supabase.rpc('clear_user_queue', {
        p_target_user_id: targetUserId,
        p_admin_profile_id: currentUserProfile.id
      });
      if (error) throw error;
      triggerToast(isEn ? "Queue evacuated successfully. Items released for coverage." : "התור פונה בהצלחה והמשימות שוחררו לגיבוי.", 'success');
      setShowSettingsModal(false);
      if (refreshData) refreshData();
    } catch (err) {
      console.error("Clear Queue Error:", err);
      triggerToast(isEn ? "Failed to clear active items queue." : "פינוי התור נכשל.", 'error');
    } finally {
      setIsClearingQueue(false);
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (!window.confirm(isEn ? "Are you sure you want to release this operator back to the unassigned pool?" : "האם אתה בטוח שברצונך לשחרר מפעיל זה חזרה למאגר הפנוי?")) return;
    try {
      const member = localTeam.find(m => m.id === memberId);
      const { error } = await supabase.from('user_profiles').update({ manager_id: null }).eq('id', memberId);
      if (error) throw error;
      if (member?.user_id) {
        await supabase.from('reports').update({ assigned_to: null, status: 'Pending' }).eq('assigned_to', member.user_id).in('status', ['Pending', 'In Progress']);
        await supabase.from('assignments').update({ assigned_to: null, status: 'Pending' }).eq('assigned_to', member.user_id).in('status', ['Pending', 'In Progress']);
      }
      triggerToast(isEn ? "Operator released to available pool." : "המפעיל שוחרר למאגר הפנוי.", 'success');
      if (refreshData) refreshData(); 
    } catch (err) {
      console.error("Error removing member:", err);
      triggerToast(isEn ? "Failed to release operator." : "שחרור המפעיל נכשל.", 'error');
    }
  };

  const handleAddFromPool = async (e) => {
    e.preventDefault();
    if (!selectedPoolUserId) {
      triggerToast(isEn ? "Please select an operator." : "אנא בחר מפעיל.", 'error');
      return;
    }
    try {
      const { error } = await supabase.from('user_profiles').update({ manager_id: currentUserProfile.id }).eq('id', selectedPoolUserId);
      if (error) throw error;
      triggerToast(isEn ? `Operator successfully added to your team!` : `מפעיל צורף לצוות שלך בהצלחה!`, 'success');
      setSelectedPoolUserId('');
      setIsAddingFromPool(false);
      if (refreshData) refreshData(); 
    } catch (err) {
      console.error("Error adding from pool:", err);
      triggerToast(isEn ? "Failed to assign operator." : "שיוך המפעיל נכשל.", 'error');
    }
  };

  const handleInviteEmail = async (e) => {
    e.preventDefault();
    if (!inviteEmail) return;
    triggerToast(isEn ? `Invitation sent to ${inviteEmail}` : `הזמנה נשלחה אל ${inviteEmail}`, 'success');
    setInviteEmail('');
    setIsInviting(false);
  };

  const openSettingsModal = async (member) => {
    setSelectedMember(member);
    setSamplingRate(member.current_sampling_rate !== null ? member.current_sampling_rate : 100);
    setShowSettingsModal(true); 
  };

  const handleSaveSettings = async () => {
    if (!selectedMember) return;
    setIsSavingSettings(true);
    try {
      const { error } = await supabase.from('user_profiles').update({ current_sampling_rate: parseInt(samplingRate, 10) }).eq('id', selectedMember.id);
      if (error) throw error;
      triggerToast(isEn ? 'Settings updated successfully' : 'הגדרות עודכנו בהצלחה', 'success');
      setShowSettingsModal(false);
      if (refreshData) refreshData();
    } catch (error) {
      console.error("Update error:", error);
      triggerToast(isEn ? 'Failed to update Settings.' : 'עדכון ההגדרות נכשל.', 'error');
    } finally {
      setIsSavingSettings(false);
    }
  };

  const getRoleBadgeStyle = (role) => {
    const safeRole = (role || '').toLowerCase().trim();
    if (safeRole.includes('admin')) return { color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.3)', bg: 'rgba(56, 189, 248, 0.1)' };
    if (safeRole.includes('moderator')) return { color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)', bg: 'rgba(16, 185, 129, 0.1)' };
    return { color: '#a855f7', border: '1px solid rgba(168, 85, 247, 0.3)', bg: 'rgba(168, 85, 247, 0.1)' };
  };

  const sortedTeamMembers = [...localTeam].sort((a, b) => {
    const levelA = getRoleLevel(a.role);
    const levelB = getRoleLevel(b.role);
    if (levelA !== levelB) return levelB - levelA; 
    return (a.display_name || a.email || '').toLowerCase().localeCompare((b.display_name || b.email || '').toLowerCase());
  });

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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', animation: 'fadeIn 0.4s ease-out' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '15px' }}>
            <div>
              <h3 style={{ margin: 0, color: '#fff', fontSize: '1.5rem' }}>{isEn ? 'Team Roster & Roles' : 'מצבת צוות והרשאות'}</h3>
              <p style={{ margin: '5px 0 0 0', color: '#94a3b8', fontSize: '0.9rem' }}>{isEn ? 'View your organizational hierarchy and assign unassigned operators to your team.' : 'צפה בהיררכיית הארגון ושייך מפעילים פנויים לצוות שלך.'}</p>
            </div>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {isOrgAdmin && (
                <button onClick={() => { setIsInviting(!isInviting); setIsAddingFromPool(false); }} style={{ backgroundColor: 'transparent', color: '#38bdf8', border: '1px solid #38bdf8', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {isInviting ? (isEn ? 'Cancel Invite' : 'ביטול') : <>{Icons.Mail} {isEn ? 'Invite by Email' : 'הזמן במייל'}</>}
                </button>
              )}
              <button onClick={() => { setIsAddingFromPool(!isAddingFromPool); setIsInviting(false); }} style={{ backgroundColor: '#38bdf8', color: '#0f172a', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                {isAddingFromPool ? (isEn ? 'Cancel Assign' : 'ביטול') : <>{Icons.UserPlus} {isEn ? 'Assign Operator' : 'שייך מפעיל'}</>}
              </button>
            </div>
          </div>

          {isOrgAdmin && isInviting && (
            <form onSubmit={handleInviteEmail} style={{ backgroundColor: 'rgba(56, 189, 248, 0.05)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(56, 189, 248, 0.3)', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <input type="email" placeholder={isEn ? "Enter external email address..." : "הזן כתובת אימייל חיצונית..."} value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} style={{ flex: 1, minWidth: '250px', padding: '10px 15px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#fff', outline: 'none' }} required />
              <button type="submit" style={{ backgroundColor: '#38bdf8', color: '#0f172a', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>{isEn ? 'Send Invite' : 'שלח הזמנה'}</button>
            </form>
          )}

          {isAddingFromPool && (
            <form onSubmit={handleAddFromPool} style={{ backgroundColor: 'rgba(30, 41, 59, 0.5)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(56, 189, 248, 0.3)', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <select value={selectedPoolUserId} onChange={(e) => setSelectedPoolUserId(e.target.value)} style={{ flex: 1, minWidth: '250px', padding: '10px 15px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#fff', outline: 'none' }}>
                <option value="">{isEn ? '-- Select Unassigned Operator --' : '-- בחר מפעיל פנוי --'}</option>
                {availablePool.map(user => <option key={user.id} value={user.id}>{user.display_name || user.email}</option>)}
              </select>
              <button type="submit" style={{ backgroundColor: '#10b981', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }} disabled={availablePool.length === 0}>
                {isEn ? 'Claim for My Team' : 'שייך לצוות שלי'}
              </button>
            </form>
          )}

          <div style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', overflowX: 'auto' }}>
            <div style={{ minWidth: '850px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 2fr', padding: '15px 20px', borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', fontSize: '0.85rem', fontWeight: 'bold', textTransform: 'uppercase' }}>
                <div>{isEn ? 'User' : 'משתמש'}</div>
                <div>{isEn ? 'Current Role & QA' : 'הרשאה ובקרת איכות'}</div>
                <div>{isEn ? 'Joined' : 'הצטרף'}</div>
                <div>{isEn ? 'Actions' : 'פעולות'}</div>
              </div>
              {sortedTeamMembers.length === 0 ? (
                <div style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>{isEn ? 'No team members found.' : 'לא נמצאו חברי צוות.'}</div>
              ) : (
                sortedTeamMembers.map(member => {
                  const isMe = currentUserProfile?.id === member.id || currentUserProfile?.user_id === member.user_id;
                  const badgeStyle = getRoleBadgeStyle(member.role);
                  const displayName = member.display_name || member.email?.split('@')[0] || 'Unknown User';
                  const isOperator = getRoleLevel(member.role) <= 1; 
                  const nextRoleAvailable = getNextRole(member.role);
                  const currentQA = member.current_sampling_rate !== null ? member.current_sampling_rate : 100;
                  return (
                    <div key={member.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 2fr', padding: '15px 20px', borderBottom: '1px solid rgba(255,255,255,0.02)', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold', border: '1px solid rgba(255,255,255,0.1)', flexShrink: 0 }}>
                          {displayName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ color: '#fff', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {displayName} {isMe && <span style={{ backgroundColor: '#3b82f6', color: '#fff', fontSize: '0.65rem', padding: '2px 6px', borderRadius: '4px', fontWeight: '800' }}>YOU</span>}
                          </div>
                          <div style={{ color: '#64748b', fontSize: '0.8rem' }}>{member.email}</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '6px' }}>
                        <span style={{ backgroundColor: badgeStyle.bg, color: badgeStyle.color, border: badgeStyle.border, padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold' }}>{member.role || 'Unassigned'}</span>
                        {isOperator && (
                          <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                            {isEn ? 'QA Override:' : 'דגימת איכות:'} <strong style={{ color: currentQA < 5 ? '#ef4444' : '#38bdf8' }}>{currentQA}%</strong>
                          </div>
                        )}
                      </div>
                      <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>{member.created_at ? new Date(member.created_at).toLocaleDateString(isEn ? 'en-GB' : 'he-IL') : 'N/A'}</div>
                      <div>
                        {canManageMember(member) ? (
                          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            {nextRoleAvailable && (
                              <button onClick={() => handleOpenElevation(member)} style={{ backgroundColor: 'rgba(234, 179, 8, 0.1)', color: '#eab308', border: '1px solid rgba(234, 179, 8, 0.3)', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 'bold', transition: 'all 0.2s' }}>
                                {Icons.ArrowUpCircle} {isEn ? `Elevate Role` : `קדם הרשאה`}
                              </button>
                            )}
                            <button onClick={() => openSettingsModal(member)} style={{ backgroundColor: 'transparent', color: '#a855f7', border: '1px solid rgba(168, 85, 247, 0.3)', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              {Icons.SettingsIcon} {isEn ? 'Settings' : 'הגדרות'}
                            </button>
                            <button onClick={() => handleRemoveMember(member.id)} style={{ backgroundColor: 'transparent', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' }}>
                              {isEn ? 'Release' : 'שחרר'}
                            </button>
                          </div>
                        ) : (
                          <span style={{ color: '#475569', fontSize: '0.8rem', fontStyle: 'italic' }}>{isMe ? '' : (isEn ? 'Restricted' : 'מוגבל')}</span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {showElevationModal && memberToElevate && (
            <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 6000, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px', backdropFilter: 'blur(5px)' }} onClick={() => setShowElevationModal(false)}>
              <div style={{ backgroundColor: '#0f172a', border: '1px solid #eab308', borderRadius: '16px', maxWidth: '500px', width: '100%', boxShadow: '0 25px 50px -12px rgba(234, 179, 8, 0.2)', overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
                <div style={{ padding: '20px 30px', borderBottom: '1px solid rgba(234, 179, 8, 0.2)', backgroundColor: 'rgba(234, 179, 8, 0.1)', display: 'flex', gap: '15px', alignItems: 'center' }}>
                  <span style={{ color: '#eab308' }}>{Icons.AlertTriangle}</span>
                  <h3 style={{ margin: 0, color: '#f8fafc', fontSize: '1.25rem' }}>{isEn ? 'Permanent Role Elevation' : 'קידום הרשאה קבוע'}</h3>
                </div>
                <div style={{ padding: '30px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px', justifyContent: 'center', marginBottom: '25px', backgroundColor: '#020617', padding: '15px', borderRadius: '12px', border: '1px solid #1e293b' }}>
                    <span style={{ color: '#94a3b8', fontWeight: 'bold' }}>{memberToElevate.role || 'Operator'}</span>
                    <span style={{ color: '#eab308' }}>{Icons.ArrowUpCircle}</span>
                    <span style={{ color: '#10b981', fontWeight: 'bold', fontSize: '1.1rem' }}>{targetRole}</span>
                  </div>
                  <ul style={{ color: '#fca5a5', fontSize: '0.85rem', lineHeight: '1.5', margin: '0 0 25px 0' }}>
                    <li>{isEn ? 'This action is one-way. You cannot downgrade them later.' : 'פעולה זו היא חד-כיוונית.'}</li>
                    <li>{isEn ? 'Any active Reports OR Assignments currently assigned to them will be released back to the Unassigned Queues.' : 'כל הדיווחים והמשימות הפעילות המשויכות אליהם כרגע ישוחררו חזרה לתור הכללי.'}</li>
                  </ul>
                  <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                    <button onClick={() => setShowElevationModal(false)} style={{ padding: '10px 20px', backgroundColor: 'transparent', color: '#94a3b8', border: '1px solid #334155', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>{isEn ? 'Cancel' : 'ביטול'}</button>
                    <button onClick={executeRoleElevation} disabled={isElevating} style={{ backgroundColor: '#eab308', color: '#0f172a', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: isElevating ? 'wait' : 'pointer', fontWeight: 'bold' }}>
                      {isElevating ? (isEn ? 'Elevating...' : 'מבצע קידום...') : (isEn ? 'Confirm Elevation' : 'אשר קידום')}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {showSettingsModal && selectedMember && (
            <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 5000, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px', backdropFilter: 'blur(5px)' }} onClick={() => setShowSettingsModal(false)}>
              <div style={{ backgroundColor: '#0f172a', border: '1px solid #38bdf8', borderRadius: '16px', maxWidth: '600px', width: '100%', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
                <div style={{ padding: '20px 30px', borderBottom: '1px solid rgba(255,255,255,0.05)', backgroundColor: 'rgba(30, 41, 59, 0.3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ margin: 0, color: '#f8fafc', fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '10px' }}><span style={{ color: '#38bdf8', display: 'flex', alignItems: 'center' }}>{Icons.SettingsIcon}</span> {selectedMember.display_name || selectedMember.email}</h3>
                  <button onClick={() => setShowSettingsModal(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '24px', cursor: 'pointer' }}>&times;</button>
                </div>
                <div style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  
                  <div style={{ backgroundColor: '#020617', padding: '25px', borderRadius: '12px', border: '1px solid #1e293b' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                      <label style={{ color: '#94a3b8', fontWeight: 'bold', fontSize: '0.9rem', textTransform: 'uppercase' }}>{isEn ? 'Operator QA Rate' : 'שיעור דגימה למפעיל'}</label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <input type="number" min="0" max="100" value={samplingRate} onChange={(e) => { let val = parseInt(e.target.value, 10); if (isNaN(val)) val = 0; if (val > 100) val = 100; if (val < 0) val = 0; setSamplingRate(val); }} style={{ width: '60px', backgroundColor: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', padding: '6px 8px', borderRadius: '8px', fontWeight: 'bold', fontSize: '1.1rem', border: '1px solid rgba(56, 189, 248, 0.2)', outline: 'none', textAlign: 'center' }} />
                        <span style={{ color: '#38bdf8', fontWeight: 'bold', fontSize: '1.1rem' }}>%</span>
                      </div>
                    </div>
                    <input type="range" min="0" max="100" step="1" value={samplingRate} onChange={(e) => setSamplingRate(e.target.value)} style={{ width: '100%', accentColor: '#38bdf8', cursor: 'pointer', height: '6px', borderRadius: '3px', outline: 'none' }} />
                  </div>

                  <div style={{ backgroundColor: 'rgba(234, 179, 8, 0.05)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(234, 179, 8, 0.2)' }}>
                    <h4 style={{ margin: '0 0 8px 0', color: '#eab308', fontSize: '0.95rem', fontWeight: 'bold' }}>
                      {isEn ? 'Coverage & Shift Interruption' : 'ניהול זמינות וגיבוי תור'}
                    </h4>
                    <p style={{ margin: '0 0 15px 0', color: '#94a3b8', fontSize: '0.85rem', lineHeight: '1.4' }}>
                      {isEn 
                        ? "If this operator is going on leave, use this action to return all of their active work allocations to the general recovery pool so peers can handle coverage." 
                        : "אם מפעיל זה יוצא לחופשה או אינו זמין, השתמש בפעולה זו כדי להחזיר את כל המשימות הפעילות שלו למאגר הכללי, כך שחברי הצוות יוכלו לגבות אותו."}
                    </p>
                    <button 
                      onClick={handleClearQueue} 
                      disabled={isClearingQueue} 
                      style={{ width: '100%', backgroundColor: 'transparent', color: '#eab308', border: '1px solid #eab308', padding: '10px', borderRadius: '8px', fontWeight: 'bold', cursor: isClearingQueue ? 'wait' : 'pointer', fontSize: '0.85rem', transition: 'all 0.2s' }}
                      onMouseOver={(e) => { if(!isClearingQueue) { e.currentTarget.style.backgroundColor = 'rgba(234, 179, 8, 0.1)'; } }}
                      onMouseOut={(e) => { if(!isClearingQueue) { e.currentTarget.style.backgroundColor = 'transparent'; } }}
                    >
                      {isClearingQueue ? '...' : (isEn ? 'Activate Absence Mode (Clear Queue)' : 'הפעל מצב היעדרות (פינוי תור פעיל)')}
                    </button>
                  </div>

                  <div style={{ display: 'flex', gap: '10px', marginTop: '10px', justifyContent: 'flex-end' }}>
                    <button onClick={() => setShowSettingsModal(false)} style={{ padding: '10px 20px', backgroundColor: 'transparent', color: '#94a3b8', border: '1px solid #334155', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>{isEn ? 'Cancel' : 'ביטול'}</button>
                    <button onClick={handleSaveSettings} disabled={isSavingSettings} style={{ backgroundColor: '#38bdf8', color: '#0f172a', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: isSavingSettings ? 'wait' : 'pointer', fontWeight: 'bold' }}>
                      {isSavingSettings ? (isEn ? 'Saving...' : 'שומר...') : (isEn ? 'Save Target Rate' : 'שמור יעד דגימה')}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
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