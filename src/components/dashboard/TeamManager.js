/**
 * @file TeamManager.js
 * @description Team Member Management & QA Configuration.
 * Fully integrated the rich UI (Badges, Settings, Elevation) with secure 
 * Supabase Edge Functions for invites and Vercel Serverless Functions for CSV Bulk Actions.
 * UPDATED: Added Magic Link support (no passwords), 50-user max upload, role typo fallback, and CSV template generator.
 */
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../supabaseClient';
import Papa from 'papaparse';

const SVGIcons = {
  UserPlus: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg>,
  Settings: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>,
  AlertTriangle: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>,
  Mail: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>,
  ArrowUpCircle: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="16 12 12 8 8 12"></polyline><line x1="12" y1="16" x2="12" y2="8"></line></svg>,
  Database: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path></svg>,
  Download: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
};

const TeamManager = ({ teamMembers, currentUserProfile, isEn, triggerToast, refreshData }) => {
  const [localTeam, setLocalTeam] = useState([]);
  const [availablePool, setAvailablePool] = useState([]);
  const [isAddingFromPool, setIsAddingFromPool] = useState(false);
  const [selectedPoolUserId, setSelectedPoolUserId] = useState('');
  
  // Invite State
  const [isInviting, setIsInviting] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Settings State
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

  // Bulk Upload State
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [isBulkLoading, setIsBulkLoading] = useState(false);
  const [bulkLogs, setBulkLogs] = useState(null);
  const fileInputAddRef = useRef(null);
  const fileInputRemoveRef = useRef(null);

  const getRoleLevel = (roleStr) => {
    const role = (roleStr || '').toLowerCase().trim();
    if (['global admin', 'super admin', 'system admin'].includes(role)) return 5;
    if (['admin', 'ngo admin'].includes(role)) return 3;
    if (['moderator l2'].includes(role)) return 2;
    if (['operator l1', 'operator'].includes(role)) return 1;
    return 0;
  };

  // Typo Safety Net: Maps any unrecognized string directly to Operator L1
  const getSafeRole = (roleStr) => {
    const safeRole = (roleStr || '').toLowerCase().trim();
    if (safeRole.includes('global') || safeRole.includes('super') || safeRole.includes('system')) return 'Global Admin';
    if (safeRole.includes('ngo') || safeRole === 'admin') return 'NGO Admin';
    if (safeRole.includes('moderator') || safeRole.includes('l2')) return 'Moderator L2';
    return 'Operator L1'; 
  };

  const myPowerLevel = getRoleLevel(currentUserProfile?.role);
  const isOrgAdmin = myPowerLevel >= 3;

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

  // --- ACTIONS ---

  const handleSupabaseInvite = async (e) => {
    e.preventDefault();
    if (!inviteEmail) return;
    setIsSubmitting(true);
    
    const targetEmail = inviteEmail.toLowerCase();

    try {
      const { error: dbError } = await supabase.from('user_profiles').insert([{
        email: targetEmail,
        organization_id: currentUserProfile.organization_id,
        manager_id: currentUserProfile.id,
        role: 'Operator L1', 
        display_name: 'Pending Invite'
      }]);

      if (dbError && dbError.code !== '23505') throw dbError;

      const { error: funcError } = await supabase.functions.invoke('invite-user', {
        body: { email: targetEmail }
      });

      if (funcError) throw funcError;

      triggerToast(isEn ? "Invite sent successfully." : "ההזמנה נשלחה בהצלחה.", 'success');
      setInviteEmail('');
      setIsInviting(false);
      if (refreshData) refreshData();

    } catch (err) {
      console.error("Invite Process Error:", err);
      triggerToast(isEn ? `Failed to send invite.` : `שליחת ההזמנה נכשלה.`, 'error');
    } finally {
      setIsSubmitting(false);
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

  // --- BULK OPERATIONS ---
  
  const handleDownloadTemplate = () => {
    const csvContent = "data:text/csv;charset=utf-8,email,displayName,role\njakobmi57@gmail.com,Jakob,Operator L1\nmanager@example.org,Org Manager,NGO Admin";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "CiviWatch_Bulk_Upload_Template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const executeBulkAdminAction = async (action, usersArray) => {
    setIsBulkLoading(true);
    setBulkLogs(null);
    try {
      const response = await fetch('/api/manage-users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: action,
          users: usersArray,
          requestingUserRole: currentUserProfile.role,
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Server request failed');
      
      setBulkLogs(data);
      triggerToast(isEn ? `Processed ${usersArray.length} records.` : `עובדו ${usersArray.length} רשומות.`, data.failed.length > 0 ? 'error' : 'success');
      if (refreshData) refreshData();
    } catch (err) {
      console.error(err);
      triggerToast(err.message, 'error');
    } finally {
      setIsBulkLoading(false);
    }
  };

  const handleFileUpload = (e, actionType) => {
    const file = e.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        // 50-User Hard Limit Circuit Breaker
        if (results.data.length > 50) {
          triggerToast(isEn ? 'Upload limit exceeded. Maximum 50 users per file.' : 'חריגה ממגבלת ההעלאה. עד 50 משתמשים בקובץ.', 'error');
          if (fileInputAddRef.current) fileInputAddRef.current.value = ''; 
          if (fileInputRemoveRef.current) fileInputRemoveRef.current.value = ''; 
          return;
        }

        const parsedUsers = results.data.map(row => ({
          email: row.email?.trim(),
          displayName: row.displayName?.trim() || '',
          role: getSafeRole(row.role), 
          organizationId: currentUserProfile.organization_id
        })).filter(u => u.email); 

        if (parsedUsers.length === 0) {
          triggerToast(isEn ? 'No valid emails found in CSV.' : 'לא נמצאו כתובות דוא"ל תקינות בקובץ.', 'error');
          return;
        }

        if (window.confirm(isEn ? `Are you sure you want to ${actionType} ${parsedUsers.length} users?` : `האם אתה בטוח שברצונך ל${actionType === 'add' ? 'הוסיף' : 'הסיר'} ${parsedUsers.length} משתמשים?`)) {
          executeBulkAdminAction(actionType, parsedUsers);
        }
        
        if (fileInputAddRef.current) fileInputAddRef.current.value = ''; 
        if (fileInputRemoveRef.current) fileInputRemoveRef.current.value = ''; 
      },
      error: (error) => {
        triggerToast(`CSV Error: ${error.message}`, 'error');
      }
    });
  };

  // --- MODALS ---

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

      triggerToast(
        isEn 
          ? `${memberToElevate.display_name || memberToElevate.email} elevated to ${targetRole}.` 
          : `${memberToElevate.display_name || memberToElevate.email} קודם לתפקיד ${targetRole}.`, 
        'success'
      );
      
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', animation: 'fadeIn 0.4s ease-out', direction: isEn ? 'ltr' : 'rtl' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <h3 style={{ margin: 0, color: '#fff', fontSize: '1.5rem' }}>{isEn ? 'Team Roster & Roles' : 'מצבת צוות והרשאות'}</h3>
          <p style={{ margin: '5px 0 0 0', color: '#94a3b8', fontSize: '0.9rem' }}>{isEn ? 'Manage operators and roles within your organization.' : 'נהל מפעילים והרשאות בארגון שלך.'}</p>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {isOrgAdmin && (
            <>
              <button onClick={() => { setShowBulkActions(!showBulkActions); setIsInviting(false); setIsAddingFromPool(false); }} style={{ backgroundColor: showBulkActions ? 'rgba(168, 85, 247, 0.2)' : 'transparent', color: '#a855f7', border: '1px solid #a855f7', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s' }}>
                {SVGIcons.Database} {isEn ? 'Bulk Actions' : 'פעולות גורפות'}
              </button>
              <button onClick={() => { setIsInviting(!isInviting); setIsAddingFromPool(false); setShowBulkActions(false); }} style={{ backgroundColor: 'transparent', color: '#38bdf8', border: '1px solid #38bdf8', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                {isInviting ? (isEn ? 'Cancel Invite' : 'ביטול') : <>{SVGIcons.Mail} {isEn ? 'Invite by Email' : 'הזמן במייל'}</>}
              </button>
            </>
          )}
          <button onClick={() => { setIsAddingFromPool(!isAddingFromPool); setIsInviting(false); setShowBulkActions(false); }} style={{ backgroundColor: '#38bdf8', color: '#0f172a', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
            {isAddingFromPool ? (isEn ? 'Cancel Assign' : 'ביטול') : <>{SVGIcons.UserPlus} {isEn ? 'Assign Operator' : 'שייך מפעיל'}</>}
          </button>
        </div>
      </div>

      {/* Forms Area */}
      
      {/* 1. Invite Form */}
      {isOrgAdmin && isInviting && (
        <form onSubmit={handleSupabaseInvite} style={{ backgroundColor: 'rgba(56, 189, 248, 0.05)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(56, 189, 248, 0.3)', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <input 
            type="email" 
            placeholder={isEn ? "Enter external email address..." : "הזן כתובת אימייל חיצונית..."} 
            value={inviteEmail} 
            onChange={(e) => setInviteEmail(e.target.value)} 
            style={{ flex: 1, minWidth: '250px', padding: '10px 15px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#fff', outline: 'none' }} 
            required 
          />
          <button type="submit" disabled={isSubmitting} style={{ backgroundColor: '#38bdf8', color: '#0f172a', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: isSubmitting ? 'wait' : 'pointer', opacity: isSubmitting ? 0.7 : 1 }}>
            {isSubmitting ? '...' : (isEn ? 'Send Invite' : 'שלח הזמנה')}
          </button>
        </form>
      )}

      {/* 2. Existing Pool Form */}
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

      {/* 3. Bulk Upload Panel */}
      {isOrgAdmin && showBulkActions && (
        <div style={{ backgroundColor: 'rgba(168, 85, 247, 0.05)', padding: '25px', borderRadius: '12px', border: '1px solid rgba(168, 85, 247, 0.3)', animation: 'fadeIn 0.3s' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '15px' }}>
            <div>
              <h4 style={{ color: '#a855f7', marginTop: 0, marginBottom: '10px' }}>{isEn ? 'CSV Bulk Operations' : 'פעולות גורפות באמצעות CSV'}</h4>
              <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '5px' }}>
                {isEn ? 'Upload a CSV file containing headers: email, displayName, role.' : 'העלה קובץ CSV הכולל עמודות: email, displayName, role.'}
              </p>
              <p style={{ color: '#ef4444', fontSize: '0.85rem', marginBottom: '20px', fontWeight: 'bold' }}>
                {isEn ? '⚠️ Maximum 50 users per upload. Magic Links will be used for login.' : '⚠️ מקסימום 50 משתמשים להעלאה. החיבור יתבצע באמצעות קישורי קסם (Magic Links).'}
              </p>
            </div>
            <button onClick={handleDownloadTemplate} style={{ backgroundColor: 'rgba(168, 85, 247, 0.1)', color: '#a855f7', border: '1px solid rgba(168, 85, 247, 0.3)', padding: '8px 16px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
              {SVGIcons.Download} {isEn ? 'Download Template' : 'הורד תבנית CSV'}
            </button>
          </div>

          <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
            <input type="file" accept=".csv" ref={fileInputAddRef} style={{ display: 'none' }} onChange={(e) => handleFileUpload(e, 'add')} id="csvAddUpload" />
            <label htmlFor="csvAddUpload" style={{ padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', backgroundColor: '#3b82f6', color: '#fff', cursor: isBulkLoading ? 'wait' : 'pointer', opacity: isBulkLoading ? 0.5 : 1 }}>
              {isEn ? '📥 Bulk Add Users' : '📥 הוספה גורפת'}
            </label>

            <input type="file" accept=".csv" ref={fileInputRemoveRef} style={{ display: 'none' }} onChange={(e) => handleFileUpload(e, 'remove')} id="csvRemoveUpload" />
            <label htmlFor="csvRemoveUpload" style={{ padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', backgroundColor: 'transparent', border: '1px solid #ef4444', color: '#ef4444', cursor: isBulkLoading ? 'wait' : 'pointer', opacity: isBulkLoading ? 0.5 : 1 }}>
              {isEn ? '🗑️ Bulk Remove Users' : '🗑️ הסרה גורפת'}
            </label>
          </div>
          
          {/* Bulk Logs Render */}
          {bulkLogs && (
            <div style={{ marginTop: '20px', backgroundColor: '#020617', padding: '15px', borderRadius: '8px', border: '1px solid #1e293b' }}>
              <h5 style={{ color: '#fff', margin: '0 0 10px 0' }}>{isEn ? 'Execution Logs' : 'יומן ביצוע'}</h5>
              {bulkLogs.successful.length > 0 && (
                <div style={{ color: '#10b981', fontSize: '0.85rem', marginBottom: '10px' }}>
                  <strong>{bulkLogs.successful.length} {isEn ? 'Successful:' : 'הצלחות:'}</strong>
                  <ul style={{ margin: '5px 0', paddingLeft: isEn ? '20px' : 0, paddingRight: isEn ? 0 : '20px' }}>
                    {bulkLogs.successful.map((log, idx) => <li key={idx}>{log.email} - {log.status}</li>)}
                  </ul>
                </div>
              )}
              {bulkLogs.failed.length > 0 && (
                <div style={{ color: '#ef4444', fontSize: '0.85rem' }}>
                  <strong>{bulkLogs.failed.length} {isEn ? 'Failed:' : 'נכשלו:'}</strong>
                  <ul style={{ margin: '5px 0', paddingLeft: isEn ? '20px' : 0, paddingRight: isEn ? 0 : '20px' }}>
                    {bulkLogs.failed.map((log, idx) => <li key={idx}>{log.email} - {log.error}</li>)}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Roster Table */}
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
                            {SVGIcons.ArrowUpCircle} {isEn ? `Elevate Role` : `קדם הרשאה`}
                          </button>
                        )}
                        <button onClick={() => openSettingsModal(member)} style={{ backgroundColor: 'transparent', color: '#a855f7', border: '1px solid rgba(168, 85, 247, 0.3)', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          {SVGIcons.Settings} {isEn ? 'Settings' : 'הגדרות'}
                        </button>
                        <button onClick={() => handleRemoveMember(member.id)} style={{ backgroundColor: 'transparent', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' }}>
                          {isEn ? 'Release' : 'שחרר'}
                        </button>
                      </div>
                    ) : (
                      <span style={{ color: '#475569', fontSize: '0.8rem', fontStyle: 'italic' }}>
                        {isMe ? '' : (member.display_name === 'Pending Invite' ? (isEn ? 'Pending...' : 'ממתין...') : (isEn ? 'Restricted' : 'מוגבל'))}
                      </span>
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
              <span style={{ color: '#eab308' }}>{SVGIcons.AlertTriangle}</span>
              <h3 style={{ margin: 0, color: '#f8fafc', fontSize: '1.25rem' }}>{isEn ? 'Permanent Role Elevation' : 'קידום הרשאה קבוע'}</h3>
            </div>
            <div style={{ padding: '30px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', justifyContent: 'center', marginBottom: '25px', backgroundColor: '#020617', padding: '15px', borderRadius: '12px', border: '1px solid #1e293b' }}>
                <span style={{ color: '#94a3b8', fontWeight: 'bold' }}>{memberToElevate.role || 'Operator'}</span>
                <span style={{ color: '#eab308' }}>{SVGIcons.ArrowUpCircle}</span>
                <span style={{ color: '#10b981', fontWeight: 'bold', fontSize: '1.1rem' }}>{targetRole}</span>
              </div>
              <ul style={{ color: '#fca5a5', fontSize: '0.85rem', lineHeight: '1.5', margin: '0 0 25px 0' }}>
                <li>{isEn ? 'This action is one-way. You cannot downgrade them later.' : 'פעולה זו היא חד-כיוונית.'}</li>
                <li>{isEn ? 'Any active Reports OR Assignments currently assigned to them will be released back to the Unassigned Queues.' : 'כל הדיווחים והמשימות הפעילות המשויכות אליהם כרגע ישוחררו חזרה לתור הכללי.'}</li>
              </ul>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button onClick={() => setShowElevationModal(false)} style={{ padding: '10px 20px', backgroundColor: 'transparent', color: '#94a3b8', border: '1px solid #334155', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>{isEn ? 'Cancel' : 'ביטול'}</button>
                <button onClick={executeRoleElevation} disabled={isElevating} style={{ backgroundColor: '#eab308', color: '#0f172a', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: isElevating ? 'wait' : 'fontWeight' }}>
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
              <h3 style={{ margin: 0, color: '#f8fafc', fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '10px' }}><span style={{ color: '#38bdf8', display: 'flex', alignItems: 'center' }}>{SVGIcons.Settings}</span> {selectedMember.display_name || selectedMember.email}</h3>
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
  );
};

export default TeamManager;