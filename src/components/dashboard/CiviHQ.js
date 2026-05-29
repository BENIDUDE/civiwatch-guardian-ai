/**
 * @file CiviHQ.js
 * @description Global Command Center for Global Admins. 
 * This component manages multi-tenant (organization) creation, global settings, 
 * organization suspension, system-wide KPI limits, and workspace switching.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../supabaseClient';
import { useNavigate } from 'react-router-dom';
import OrganizationSwitcher from '../admin/OrganizationSwitcher';

// --- UNIVERSAL SVG ICON MAPPING ---
const SVGIcons = {
  Flask: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 2v7.31"></path><path d="M14 9.3V1.99"></path><path d="M8.5 2h7"></path><path d="M14 9.3a6.5 6.5 0 1 1-4 0"></path><path d="M5.52 16h12.96"></path></svg>,
  Plus: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>,
  Settings: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>,
  Building: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><path d="M9 22v-4h6v4"></path><path d="M8 6h.01"></path><path d="M16 6h.01"></path><path d="M12 6h.01"></path><path d="M12 10h.01"></path><path d="M12 14h.01"></path><path d="M16 10h.01"></path><path d="M16 14h.01"></path><path d="M8 10h.01"></path><path d="M8 14h.01"></path></svg>,
  X: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
};

const CiviHQ = ({ isEn, triggerToast, userProfile, setUserProfile, refreshData }) => {
  const isRtl = !isEn;
  const navigate = useNavigate(); 
  
  /**
   * Intelligently detects user timezone to format dates appropriately.
   * Defaults to en-GB (DD/MM/YYYY) for most of the world to prevent US format confusion.
   */
  const getSmartLocale = () => {
    if (!isEn) return 'he-IL';
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
      if (tz.startsWith('America/')) {
        return 'en-US';
      }
      return 'en-GB'; 
    } catch (e) {
      return navigator.language; 
    }
  };

  const userLocale = getSmartLocale();

  // --- STATE MANAGEMENT ---
  const [organizations, setOrganizations] = useState([]);
  const [globalStats, setGlobalStats] = useState({ operators: 0, threats24h: 0 });
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Organization Switcher State
  const [isOrgSwitcherOpen, setIsOrgSwitcherOpen] = useState(false);

  // Organization Creation Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    org_type: 'NGO',
    email_domain: '',
    extension_mode: false,
    banner_url: '',
    sampling_strategy: 'organization',
    kpi_mode_enabled: false,
    kpi_target_per_hour: 10,
    idle_timeout_minutes: 15
  });

  // Organization Settings Modal State
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [samplingRate, setSamplingRate] = useState(100);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // Individual Settings State (populated when clicking 'Manage Settings')
  const [extMode, setExtMode] = useState(false);
  const [banner, setBanner] = useState('');
  const [strategy, setStrategy] = useState('organization');
  const [kpiMode, setKpiMode] = useState(false);
  const [kpiTarget, setKpiTarget] = useState(10);
  const [idleTimeout, setIdleTimeout] = useState(15);

  // Live Clock Tick
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  /**
   * Fetches the global overview for the HQ. 
   * Pulls all tenant organizations, total platform user count, and 24h report ingestion.
   */
  const fetchHQData = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Fetch Organizations
      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .select('*')
        .order('created_at', { ascending: false });

      if (orgError) throw orgError;
      if (orgData) setOrganizations(orgData);

      // 2. Fetch Global Operator Count
      const { count: opCount, error: opError } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true });
      
      if (opError) console.error("Error fetching operator count", opError);

      // 3. Fetch Global 24h Threat Volume
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const { count: threatCount, error: threatError } = await supabase
        .from('reports')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', yesterday);

      if (threatError) console.error("Error fetching threat count", threatError);

      setGlobalStats({
        operators: opCount || 0,
        threats24h: threatCount || 0
      });

    } catch (error) {
      console.error("Error fetching orgs:", error.message);
      triggerToast(isEn ? 'Failed to load HQ data' : 'שגיאה בטעינת נתוני מטה', 'error');
    } finally {
      setLoading(false);
    }
  }, [isEn, triggerToast]);

  useEffect(() => {
    fetchHQData();
  }, [fetchHQData]);

  /**
   * Triggers the context swap to a new organization.
   */
  const handleOrgSwitch = (newOrgId) => {
    if (setUserProfile) {
      setUserProfile(prevProfile => ({
        ...prevProfile,
        organization_id: newOrgId
      }));
    }
    
    setIsOrgSwitcherOpen(false);
    
    if (typeof refreshData === 'function') {
      refreshData();
    }
    
    triggerToast(isEn ? 'Workspace context switched successfully.' : 'סביבת העבודה הוחלפה בהצלחה.', 'success');
  };

  /**
   * Submits a new Tenant Organization to the database.
   * Auto-formats email domains to ensure routing catches correctly.
   */
  const handleCreateOrg = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let cleanDomain = formData.email_domain.trim();
      if (cleanDomain && !cleanDomain.startsWith('@')) {
        cleanDomain = '@' + cleanDomain;
      }

      const { error } = await supabase
        .from('organizations')
        .insert([{
          name: formData.name,
          type: formData.org_type,
          email_domain: cleanDomain || null,
          is_active: true,
          extension_mode: formData.extension_mode,
          banner_url: formData.banner_url || null,
          sampling_strategy: formData.sampling_strategy,
          kpi_mode_enabled: formData.kpi_mode_enabled,
          kpi_target_per_hour: formData.kpi_target_per_hour,
          idle_timeout_minutes: formData.idle_timeout_minutes
        }]);

      if (error) throw error;

      triggerToast(isEn ? 'Organization created successfully' : 'הארגון נוצר בהצלחה', 'success');
      setShowCreateModal(false);
      setFormData({ 
        name: '', org_type: 'NGO', email_domain: '', extension_mode: false, 
        banner_url: '', sampling_strategy: 'organization', kpi_mode_enabled: false, 
        kpi_target_per_hour: 10, idle_timeout_minutes: 15 
      });
      fetchHQData();
    } catch (error) {
      console.error("Creation error:", error.message);
      triggerToast(isEn ? 'Failed to create organization' : 'יצירת הארגון נכשלה', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Suspends or reactivates a tenant organization. 
   * Suspension immediately blocks operators from seeing assignments.
   */
  const handleToggleOrgStatus = async (orgId, currentStatus) => {
    const actionWord = currentStatus ? (isEn ? 'suspend' : 'להשהות') : (isEn ? 'reactivate' : 'להפעיל מחדש');
    const confirmMessage = isEn 
      ? `Are you sure you want to ${actionWord} this organization? Users will be immediately ${currentStatus ? 'locked out' : 'granted access'}.`
      : `האם אתה בטוח שברצונך ${actionWord} ארגון זה? הגישה למשתמשים ${currentStatus ? 'תיחסם' : 'תחודש'} באופן מיידי.`;

    if (!window.confirm(confirmMessage)) return;

    try {
      const { error } = await supabase
        .from('organizations')
        .update({ is_active: !currentStatus })
        .eq('id', orgId);

      if (error) throw error;
      
      triggerToast(
        isEn ? `Organization successfully ${!currentStatus ? 'reactivated' : 'suspended'}.` : `הארגון ${!currentStatus ? 'הופעל מחדש' : 'הושהה'} בהצלחה.`, 
        'success'
      );
      fetchHQData();
    } catch (err) {
      console.error("Toggle error:", err.message);
      triggerToast(isEn ? 'Failed to update status' : 'שגיאה בעדכון הסטטוס', 'error');
    }
  };

  /**
   * Saves updates to the organization's settings.
   * Affects KPI requirements and QA sampling logic for the entire tenant.
   */
  const handleSaveSettings = async () => {
    if (!selectedOrg) return;
    setIsSavingSettings(true);

    try {
      const { data, error } = await supabase
        .from('organizations')
        .update({ 
          default_sampling_rate: parseInt(samplingRate, 10),
          extension_mode: extMode,
          banner_url: banner || null,
          sampling_strategy: strategy,
          kpi_mode_enabled: kpiMode,
          kpi_target_per_hour: parseInt(kpiTarget, 10),
          idle_timeout_minutes: parseInt(idleTimeout, 10)
        })
        .eq('id', selectedOrg.id)
        .select(); 

      if (error) throw error;

      if (!data || data.length === 0) {
        throw new Error("RLS blocked the update (0 rows affected).");
      }

      triggerToast(isEn ? 'Settings updated successfully' : 'ההגדרות עודכנו בהצלחה', 'success');
      setShowSettingsModal(false);
      fetchHQData(); 
    } catch (error) {
      console.error("Update error:", error.message);
      triggerToast(isEn ? `Failed: Check database permissions` : 'עדכון ההגדרות נכשל', 'error');
    } finally {
      setIsSavingSettings(false);
    }
  };

  const openSettingsModal = (org) => {
    setSelectedOrg(org);
    setSamplingRate(org.default_sampling_rate !== null ? org.default_sampling_rate : 100);
    setExtMode(org.extension_mode || false);
    setBanner(org.banner_url || '');
    setStrategy(org.sampling_strategy || 'organization');
    setKpiMode(org.kpi_mode_enabled || false);
    setKpiTarget(org.kpi_target_per_hour || 10);
    setIdleTimeout(org.idle_timeout_minutes || 15);
    setShowSettingsModal(true);
  };

  const getOrgTypeBadge = (type) => {
    switch(type?.toUpperCase()) {
      case 'NGO': return { bg: 'rgba(16, 185, 129, 0.1)', color: '#10b981' };
      case 'GOVERNMENT': return { bg: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8' };
      case 'SOCIAL NETWORK': return { bg: 'rgba(168, 85, 247, 0.1)', color: '#a855f7' };
      case 'AI VENDOR': return { bg: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' };
      default: return { bg: 'rgba(100, 116, 139, 0.1)', color: '#94a3b8' };
    }
  };

  // --- REUSABLE UI COMPONENTS ---
  const KpiCard = ({ title, value, sub, color }) => (
    <div style={{ backgroundColor: 'rgba(30, 41, 59, 0.6)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', padding: '24px', flex: '1 1 200px', position: 'relative', overflow: 'hidden', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', backgroundColor: color }}></div>
      <h3 style={{ color: '#94a3b8', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 12px 0' }}>{title}</h3>
      <div style={{ color: '#f8fafc', fontSize: '2.5rem', fontWeight: '900', margin: '0 0 8px 0', fontFamily: 'monospace' }}>
        {typeof value === 'number' ? value.toLocaleString() : value}
      </div>
      <div style={{ color: color, fontSize: '0.875rem', fontWeight: 'bold' }}>{sub}</div>
    </div>
  );

  const modalInputBase = { width: '100%', padding: '12px', backgroundColor: '#020617', border: '1px solid #1e293b', borderRadius: '8px', color: '#fff', outline: 'none', boxSizing: 'border-box' };
  const labelBase = { display: 'block', marginBottom: '8px', color: '#94a3b8', fontSize: '13px', fontWeight: 'bold' };

  if (loading && organizations.length === 0) {
    return <div style={{ color: '#fff', textAlign: 'center', padding: '40px' }}>{isEn ? 'Loading HQ Data...' : 'טוען נתוני מטה...'}</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', direction: isRtl ? 'rtl' : 'ltr', animation: 'fadeIn 0.5s ease-out' }}>
      
      {/* --- HEADER SECTION --- */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '20px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#10b981', boxShadow: '0 0 10px #10b981', animation: 'pulse 2s infinite' }}></div>
            <h2 style={{ fontSize: '2rem', fontWeight: '900', color: '#ffffff', margin: 0, letterSpacing: '-0.5px' }}>
              CiviHQ <span style={{ color: '#a855f7', fontWeight: '300' }}>Global Command</span>
            </h2>
          </div>
          <p style={{ color: '#94a3b8', fontSize: '1rem', margin: 0 }}>
            {isEn ? 'Manage global organizations, routing rules, and platform settings.' : 'ניהול ארגונים גלובליים, חוקי ניתוב והגדרות פלטפורמה.'}
          </p>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: isRtl ? 'flex-start' : 'flex-end', gap: '15px' }}>
          
          <div style={{ display: 'flex', gap: '10px' }}>
            {userProfile?.role?.toLowerCase()?.trim() === 'global admin' && (
              <button 
                onClick={() => setIsOrgSwitcherOpen(true)}
                style={{ 
                  backgroundColor: 'rgba(168, 85, 247, 0.1)', color: '#a855f7', border: '1px solid rgba(168, 85, 247, 0.3)', 
                  padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#a855f7'; e.currentTarget.style.color = '#0f172a'; }}
                onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'rgba(168, 85, 247, 0.1)'; e.currentTarget.style.color = '#a855f7'; }}
              >
                🏢 {isEn ? 'Switch Organization' : 'החלף ארגון'}
              </button>
            )}

            <button 
              onClick={() => navigate('/admin/ai-simulation')}
              style={{ 
                backgroundColor: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.3)', 
                padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#38bdf8'; e.currentTarget.style.color = '#0f172a'; }}
              onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'rgba(56, 189, 248, 0.1)'; e.currentTarget.style.color = '#38bdf8'; }}
            >
              {SVGIcons.Flask} {isEn ? 'Launch AI Simulator' : 'הפעל סימולטור AI'}
            </button>
          </div>
          
          <div style={{ textAlign: isRtl ? 'left' : 'right' }}>
            <div style={{ color: '#a855f7', fontFamily: 'monospace', fontSize: '1.25rem', fontWeight: 'bold' }}>
              {currentTime.toLocaleTimeString(userLocale, { timeZoneName: 'short' })}
            </div>
            <div style={{ color: '#64748b', fontSize: '0.875rem' }}>
              {currentTime.toLocaleDateString(userLocale)}
            </div>
          </div>
        </div>
      </div>

      {/* --- GLOBAL KPI CARDS --- */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
        <KpiCard title={isEn ? "Active Tenants" : "ארגונים פעילים"} value={organizations.filter(o => o.is_active !== false).length} sub={isEn ? "Registered in Database" : "רשומים במסד הנתונים"} color="#a855f7" />
        <KpiCard title={isEn ? "Global Operators" : "משתמשים רשומים"} value={globalStats.operators} sub={isEn ? "Accounts Across Orgs" : "משתמשים בכל הארגונים"} color="#38bdf8" />
        <KpiCard title={isEn ? "24h Threat Volume" : "נפח איומים (24 ש')" } value={globalStats.threats24h} sub={isEn ? "Live intelligence ingested" : "דיווחים חיים שהוזנו"} color="#f43f5e" />
        <KpiCard title={isEn ? "Infrastructure" : "סטטוס שרתים"} value="99.98%" sub={isEn ? "All nodes operational" : "כל השרתים תקינים"} color="#10b981" />
      </div>

      {/* --- TENANT ORGANIZATIONS LIST --- */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '1.25rem', margin: 0, color: '#fff' }}>
            {isEn ? 'Tenant Organizations' : 'ארגוני לקוחות'}
          </h3>
          <button 
            onClick={() => setShowCreateModal(true)}
            style={{
              backgroundColor: '#a855f7', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', 
              fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
              boxShadow: '0 4px 15px rgba(168, 85, 247, 0.3)', transition: 'transform 0.2s, backgroundColor 0.2s'
            }}
            onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.backgroundColor = '#9333ea'; }}
            onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.backgroundColor = '#a855f7'; }}
          >
            {SVGIcons.Plus} {isEn ? 'New Organization' : 'ארגון חדש'}
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {organizations.map((org) => {
            const badge = getOrgTypeBadge(org.type || org.org_type);
            const isActive = org.is_active !== false; 
            
            return (
              <div 
                key={org.id} 
                style={{ 
                  backgroundColor: 'rgba(30, 41, 59, 0.6)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)',
                  padding: '25px', display: 'flex', flexDirection: 'column', gap: '15px', transition: 'border-color 0.2s',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)', opacity: isActive ? 1 : 0.6
                }}
                onMouseOver={(e) => e.currentTarget.style.borderColor = 'rgba(168, 85, 247, 0.3)'}
                onMouseOut={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <h3 style={{ margin: 0, color: isActive ? '#fff' : '#94a3b8', fontSize: '18px', textDecoration: isActive ? 'none' : 'line-through' }}>
                      {org.name}
                    </h3>
                    {!isActive && (
                      <span style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold' }}>
                        {isEn ? 'SUSPENDED' : 'מושהה'}
                      </span>
                    )}
                  </div>
                  <span style={{ 
                    backgroundColor: badge.bg, color: badge.color, padding: '4px 10px', borderRadius: '6px', 
                    fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', whiteSpace: 'nowrap', marginLeft: '10px'
                  }}>
                    {org.type || org.org_type || 'Unknown'}
                  </span>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '15px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                    <span style={{ color: '#64748b' }}>{isEn ? 'Routing Domain:' : 'דומיין ניתוב:'}</span>
                    <span style={{ color: '#cbd5e1', fontFamily: 'monospace' }}>{org.email_domain || 'N/A'}</span>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                    <span style={{ color: '#64748b' }}>{isEn ? 'Extension Mode:' : 'מצב תוסף:'}</span>
                    <span style={{ color: org.extension_mode ? '#10b981' : '#ef4444', fontWeight: 'bold' }}>
                      {org.extension_mode ? (isEn ? 'ENABLED' : 'פעיל') : (isEn ? 'DISABLED' : 'מושבת')}
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                    <span style={{ color: '#64748b' }}>{isEn ? 'KPI Action Time:' : 'מעקב ביצועים:'}</span>
                    <span style={{ color: org.kpi_mode_enabled ? '#38bdf8' : '#64748b', fontWeight: 'bold' }}>
                      {org.kpi_mode_enabled ? (isEn ? 'ON' : 'פעיל') : (isEn ? 'OFF' : 'מושבת')}
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                    <span style={{ color: '#64748b' }}>{isEn ? 'QA Strategy:' : 'אסטרטגיית דגימה:'}</span>
                    <span style={{ color: '#cbd5e1' }}>
                      {org.sampling_strategy === 'operator' ? (isEn ? 'Per Operator' : 'לפי מנחה') : (isEn ? 'Global Org' : 'גלובלי לארגון')}
                    </span>
                  </div>

                  {org.sampling_strategy !== 'operator' && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                      <span style={{ color: '#64748b' }}>{isEn ? 'QA Sample Rate:' : 'בקרת איכות:'}</span>
                      <span style={{ color: (org.default_sampling_rate < 5) ? '#ef4444' : '#38bdf8', fontWeight: 'bold' }}>
                        {org.default_sampling_rate !== null ? `${org.default_sampling_rate}%` : '100%'}
                      </span>
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                    <span style={{ color: '#64748b' }}>{isEn ? 'Created:' : 'נוצר ב:'}</span>
                    <span style={{ color: '#cbd5e1' }}>
                      {new Date(org.created_at).toLocaleDateString(userLocale)}
                    </span>
                  </div>
                </div>

                <div style={{ marginTop: 'auto', paddingTop: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <button 
                    onClick={() => handleToggleOrgStatus(org.id, isActive)}
                    style={{ background: 'none', border: 'none', color: isActive ? '#ef4444' : '#10b981', fontSize: '12px', cursor: 'pointer', fontWeight: 'bold', padding: 0, textDecoration: 'underline' }}
                  >
                    {isActive ? (isEn ? 'Suspend Org' : 'השהה ארגון') : (isEn ? 'Reactivate Org' : 'הפעל מחדש')}
                  </button>
                  <button 
                    onClick={() => openSettingsModal(org)}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', borderRadius: '6px', padding: '6px 12px', fontSize: '12px', cursor: 'pointer', transition: 'all 0.2s' }} 
                    onMouseOver={(e) => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'; }} 
                    onMouseOut={(e) => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
                  >
                    {SVGIcons.Settings} {isEn ? 'Manage Settings' : 'ניהול הגדרות'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* --- ORGANIZATION SETTINGS MODAL --- */}
      {showSettingsModal && selectedOrg && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 5000, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px', backdropFilter: 'blur(5px)' }} onClick={() => setShowSettingsModal(false)}>
          <div style={{ backgroundColor: '#0f172a', border: '1px solid #38bdf8', borderRadius: '16px', maxWidth: '600px', width: '100%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '20px 30px', borderBottom: '1px solid rgba(255,255,255,0.05)', backgroundColor: 'rgba(30, 41, 59, 0.3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 10 }}>
              <h3 style={{ margin: 0, color: '#f8fafc', fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ color: '#38bdf8', display: 'flex', alignItems: 'center' }}>{SVGIcons.Settings}</span> {selectedOrg.name} {isEn ? 'Settings' : 'הגדרות'}
              </h3>
              <button onClick={() => setShowSettingsModal(false)} style={{ display: 'flex', alignItems: 'center', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>{SVGIcons.X}</button>
            </div>
            
            <div style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '25px' }}>
              
              {/* UI & EXTENSION SETTINGS */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#020617', padding: '15px', borderRadius: '8px', border: '1px solid #1e293b' }}>
                  <div>
                    <h4 style={{ margin: '0 0 5px 0', color: '#f8fafc', fontSize: '1rem' }}>{isEn ? 'Extension Mode' : 'מצב תוסף'}</h4>
                    <p style={{ margin: 0, color: '#64748b', fontSize: '0.85rem' }}>{isEn ? 'Allow operators to utilize the browser extension' : 'אפשר למנחים להשתמש בתוסף הדפדפן'}</p>
                  </div>
                  <input type="checkbox" checked={extMode} onChange={(e) => setExtMode(e.target.checked)} style={{ width: '24px', height: '24px', accentColor: '#38bdf8', cursor: 'pointer' }} />
                </div>

                <div>
                  <label style={labelBase}>{isEn ? 'Organization Banner URL' : 'כתובת תמונת באנר לארגון'}</label>
                  <input type="url" value={banner} onChange={(e) => setBanner(e.target.value)} placeholder="https://..." style={{...modalInputBase, direction: 'ltr'}} />
                </div>
              </div>

              {/* ACTION TIME (KPI) SETTINGS */}
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '20px' }}>
                <h4 style={{ color: '#fff', margin: '0 0 15px 0', fontSize: '1.1rem' }}>{isEn ? 'Action Time Mode (KPIs)' : 'מעקב ביצועים וזמנים'}</h4>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: kpiMode ? 'rgba(56, 189, 248, 0.1)' : '#020617', padding: '15px', borderRadius: '8px', border: kpiMode ? '1px solid #38bdf8' : '1px solid #1e293b', marginBottom: '15px', transition: 'all 0.3s' }}>
                  <div>
                    <h4 style={{ margin: '0 0 5px 0', color: '#f8fafc', fontSize: '1rem' }}>{isEn ? 'Enable Action Tracking' : 'הפעל מעקב ביצועים'}</h4>
                    <p style={{ margin: 0, color: '#64748b', fontSize: '0.85rem' }}>{isEn ? 'Track operator efficiency (Reports Per Hour)' : 'מעקב אחר קצב עבודה (דיווחים לשעה)'}</p>
                  </div>
                  <input type="checkbox" checked={kpiMode} onChange={(e) => setKpiMode(e.target.checked)} style={{ width: '24px', height: '24px', accentColor: '#38bdf8', cursor: 'pointer' }} />
                </div>

                {kpiMode && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', animation: 'fadeIn 0.3s' }}>
                    <div>
                      <label style={labelBase}>{isEn ? 'Target (Reports/Hour)' : 'יעד (דיווחים/שעה)'}</label>
                      <input type="number" min="1" value={kpiTarget} onChange={(e) => setKpiTarget(e.target.value)} style={modalInputBase} />
                    </div>
                    <div>
                      <label style={labelBase}>{isEn ? 'Idle Timeout (Minutes)' : 'ניתוק אוטומטי (דקות)'}</label>
                      <input type="number" min="1" value={idleTimeout} onChange={(e) => setIdleTimeout(e.target.value)} style={modalInputBase} />
                    </div>
                  </div>
                )}
              </div>

              {/* SAMPLING SETTINGS */}
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '20px' }}>
                <label style={labelBase}>{isEn ? 'Sampling Enforcement Strategy' : 'אסטרטגיית אכיפת דגימה'}</label>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                  <button onClick={() => setStrategy('organization')} style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #38bdf8', backgroundColor: strategy === 'organization' ? '#38bdf8' : 'transparent', color: strategy === 'organization' ? '#0f172a' : '#38bdf8', cursor: 'pointer', fontWeight: 'bold', transition: 'all 0.2s' }}>
                    {isEn ? 'Global (Org-Wide)' : 'גלובלי (כל הארגון)'}
                  </button>
                  <button onClick={() => setStrategy('operator')} style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #38bdf8', backgroundColor: strategy === 'operator' ? '#38bdf8' : 'transparent', color: strategy === 'operator' ? '#0f172a' : '#38bdf8', cursor: 'pointer', fontWeight: 'bold', transition: 'all 0.2s' }}>
                    {isEn ? 'Per Operator' : 'לפי מנחה'}
                  </button>
                </div>

                {strategy === 'organization' && (
                  <div style={{ backgroundColor: '#020617', padding: '25px', borderRadius: '12px', border: '1px solid #1e293b' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                      <label style={{ color: '#94a3b8', fontWeight: 'bold', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        {isEn ? 'Baseline QA Sampling Rate' : 'שיעור דגימה בסיסי לבקרת איכות'}
                      </label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <input type="number" min="0" max="100" value={samplingRate} onChange={(e) => {
                            let val = parseInt(e.target.value, 10);
                            if (isNaN(val)) val = 0;
                            if (val > 100) val = 100;
                            if (val < 0) val = 0;
                            setSamplingRate(val);
                          }}
                          style={{ width: '60px', backgroundColor: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', padding: '6px 8px', borderRadius: '8px', fontWeight: 'bold', fontSize: '1.1rem', border: '1px solid rgba(56, 189, 248, 0.2)', outline: 'none', textAlign: 'center' }}
                        />
                        <span style={{ color: '#38bdf8', fontWeight: 'bold', fontSize: '1.1rem' }}>%</span>
                      </div>
                    </div>

                    <input type="range" min="0" max="100" step="1" value={samplingRate} onChange={(e) => setSamplingRate(e.target.value)} style={{ width: '100%', accentColor: '#38bdf8', cursor: 'pointer', height: '6px', borderRadius: '3px', outline: 'none' }} />
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569', fontSize: '0.8rem', marginTop: '10px' }}>
                      <span>0% ({isEn ? 'Total Automation' : 'אוטומציה מלאה'})</span>
                      <span>100% ({isEn ? 'Total Human Review' : 'בדיקה אנושית מלאה'})</span>
                    </div>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '15px', justifyContent: 'flex-end' }}>
                <button onClick={() => setShowSettingsModal(false)} style={{ padding: '10px 20px', backgroundColor: 'transparent', color: '#94a3b8', border: '1px solid #334155', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                  {isEn ? 'Cancel' : 'ביטול'}
                </button>
                <button onClick={handleSaveSettings} disabled={isSavingSettings} style={{ backgroundColor: '#38bdf8', color: '#0f172a', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: isSavingSettings ? 'wait' : 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {isSavingSettings ? (isEn ? 'Saving...' : 'שומר...') : (isEn ? 'Save Settings' : 'שמור הגדרות')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- CREATE ORGANIZATION MODAL --- */}
      {showCreateModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 4000, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px', backdropFilter: 'blur(5px)' }} onClick={() => setShowCreateModal(false)}>
          <div style={{ backgroundColor: '#0f172a', border: '1px solid #a855f7', borderRadius: '20px', padding: '30px', maxWidth: '450px', width: '100%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 20px 0', color: '#fff', fontSize: '22px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ color: '#a855f7', display: 'flex', alignItems: 'center' }}>{SVGIcons.Building}</span> {isEn ? 'Register Organization' : 'רישום ארגון חדש'}
            </h3>
            
            <form onSubmit={handleCreateOrg} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label style={labelBase}>{isEn ? 'Organization Name' : 'שם הארגון'}</label>
                <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder={isEn ? "e.g., Global Safety Initiative" : "לדוגמה: יוזמת הבטיחות העולמית"} style={modalInputBase} />
              </div>

              <div>
                <label style={labelBase}>{isEn ? 'Organization Type' : 'סוג הארגון'}</label>
                <select value={formData.org_type} onChange={(e) => setFormData({...formData, org_type: e.target.value})} style={modalInputBase}>
                  <option value="NGO">NGO / Non-Profit</option>
                  <option value="Government">Government / Regulatory Body</option>
                  <option value="Social Network">Social Network / Platform</option>
                  <option value="AI Vendor">AI Marketplace / Vendor</option>
                  <option value="Enterprise">Enterprise Business</option>
                </select>
              </div>

              <div>
                <label style={labelBase}>{isEn ? 'Auto-Routing Email Domain (Optional)' : 'דומיין דוא"ל לניתוב אוטומטי (רשות)'}</label>
                <input type="text" value={formData.email_domain} onChange={(e) => setFormData({...formData, email_domain: e.target.value})} placeholder="@organization.org" style={{...modalInputBase, direction: 'ltr'}} />
              </div>

              <div>
                <label style={labelBase}>{isEn ? 'Banner URL (Optional)' : 'כתובת באנר לארגון (רשות)'}</label>
                <input type="url" value={formData.banner_url} onChange={(e) => setFormData({...formData, banner_url: e.target.value})} placeholder="https://..." style={{...modalInputBase, direction: 'ltr'}} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(30, 41, 59, 0.5)', padding: '12px', borderRadius: '8px', border: '1px solid #334155' }}>
                <span style={{ color: '#94a3b8', fontSize: '13px', fontWeight: 'bold' }}>{isEn ? 'Enable Extension Mode' : 'הפעל מצב תוסף'}</span>
                <input type="checkbox" checked={formData.extension_mode} onChange={(e) => setFormData({...formData, extension_mode: e.target.checked})} style={{ width: '20px', height: '20px', accentColor: '#a855f7', cursor: 'pointer' }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(30, 41, 59, 0.5)', padding: '12px', borderRadius: '8px', border: '1px solid #334155' }}>
                <span style={{ color: '#94a3b8', fontSize: '13px', fontWeight: 'bold' }}>{isEn ? 'Enable Action Time (KPI)' : 'מעקב ביצועים (KPI)'}</span>
                <input type="checkbox" checked={formData.kpi_mode_enabled} onChange={(e) => setFormData({...formData, kpi_mode_enabled: e.target.checked})} style={{ width: '20px', height: '20px', accentColor: '#a855f7', cursor: 'pointer' }} />
              </div>

              {formData.kpi_mode_enabled && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', animation: 'fadeIn 0.3s' }}>
                  <div>
                    <label style={{...labelBase, fontSize: '11px'}}>{isEn ? 'Target (Rep/Hr)' : 'יעד (לשעה)'}</label>
                    <input type="number" min="1" value={formData.kpi_target_per_hour} onChange={(e) => setFormData({...formData, kpi_target_per_hour: e.target.value})} style={modalInputBase} />
                  </div>
                  <div>
                    <label style={{...labelBase, fontSize: '11px'}}>{isEn ? 'Idle Out (Min)' : 'ניתוק ממושך (דקות)'}</label>
                    <input type="number" min="1" value={formData.idle_timeout_minutes} onChange={(e) => setFormData({...formData, idle_timeout_minutes: e.target.value})} style={modalInputBase} />
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                <button type="button" onClick={() => setShowCreateModal(false)} style={{ flex: 1, padding: '12px', backgroundColor: 'transparent', color: '#94a3b8', border: '1px solid #334155', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                  {isEn ? 'Cancel' : 'ביטול'}
                </button>
                <button type="submit" disabled={isSubmitting} style={{ flex: 1, padding: '12px', backgroundColor: '#a855f7', color: '#fff', border: 'none', borderRadius: '8px', cursor: isSubmitting ? 'not-allowed' : 'pointer', fontWeight: 'bold', opacity: isSubmitting ? 0.7 : 1 }}>
                  {isSubmitting ? (isEn ? 'Creating...' : 'יוצר...') : (isEn ? 'Create Organization' : 'צור ארגון')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RENDER THE ORGANIZATION SWITCHER MODAL */}
      <OrganizationSwitcher 
        isOpen={isOrgSwitcherOpen}
        onClose={() => setIsOrgSwitcherOpen(false)}
        onSelectOrg={handleOrgSwitch}
        currentOrgId={userProfile?.organization_id}
        isEn={isEn}
      />

      <style>{`
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
          70% { box-shadow: 0 0 0 10px rgba(16, 185, 129, 0); }
          100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default CiviHQ;