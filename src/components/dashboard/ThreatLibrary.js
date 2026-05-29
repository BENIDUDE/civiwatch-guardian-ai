/**
 * @file ThreatLibrary.js
 * @description The Global Intelligence Database for Administrators.
 * FIX: Implemented Smart UUID Search, Full ID display with Quick Copy, 
 * Bulk Actions (Export/Status Update), Filter Presets, and Inline Audit Trails.
 */

import React, { useState, useCallback, useEffect } from 'react';
import { supabase } from '../../supabaseClient';

// --- UNIVERSAL SVG ICON MAPPING ---
const SVGIcons = {
  Book: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>,
  Download: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>,
  Search: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>,
  Link: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>,
  User: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>,
  Bot: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="10" rx="2"></rect><circle cx="12" cy="5" r="2"></circle><path d="M12 7v4"></path><line x1="8" y1="16" x2="8" y2="16"></line><line x1="16" y1="16" x2="16" y2="16"></line></svg>,
  Lock: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>,
  Copy: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>,
  CheckList: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4"></path><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>,
  History: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
};

const ThreatLibrary = ({ userProfile, isEn, triggerToast }) => {
  const isRtl = !isEn;
  const isAdmin = ['ngo admin', 'moderator l2', 'global admin', 'super admin', 'admin'].includes(userProfile?.role?.toLowerCase()?.trim());

  // --- STATE MANAGEMENT ---
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedLogs, setExpandedLogs] = useState({});
  const [selectedReports, setSelectedReports] = useState([]);

  // Search & Filter Parameters
  const [searchQuery, setSearchQuery] = useState('');
  const [platformFilter, setPlatformFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [activePreset, setActivePreset] = useState(null);

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  const toggleLog = (id) => {
    setExpandedLogs(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedReports(results.map(r => r.id));
    } else {
      setSelectedReports([]);
    }
  };

  const handleSelectRow = (id) => {
    setSelectedReports(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    if (triggerToast) triggerToast(isEn ? 'ID Copied to clipboard!' : 'המזהה הועתק ללוח!', 'success');
  };

  /**
   * Executes a database query against the `reports` table using the provided filters.
   * Enforces RLS via Organization ID unless the user is a Global Admin.
   */
  const handleSearch = useCallback(async (e) => {
    if (e) e.preventDefault();
    if (!isAdmin) return;
    
    setLoading(true);
    setSelectedReports([]); // Clear selections on new search
    try {
      let query = supabase.from('reports').select('*, assigned_to_profile:user_profiles!assigned_to(display_name, email)');

      const isGlobal = ['global admin', 'super admin', 'system admin'].includes(userProfile?.role?.toLowerCase()?.trim());
      if (!isGlobal) {
        query = query.eq('organization_id', userProfile.organization_id);
      }

      // --- SMART SEARCH LOGIC ---
      const queryText = searchQuery.trim();
      if (queryText !== '') {
        if (uuidRegex.test(queryText)) {
          // It's a perfect UUID match
          query = query.eq('id', queryText);
        } else {
          // Standard text search
          query = query.ilike('content', `%${queryText}%`);
        }
      }

      if (platformFilter !== 'all') query = query.eq('platform', platformFilter);
      if (statusFilter !== 'all') {
        if (statusFilter === 'Verified') {
          query = query.in('status', ['Verified', 'Closed - Verified']);
        } else {
          query = query.eq('status', statusFilter);
        }
      }

      if (startDate) query = query.gte('created_at', new Date(startDate).toISOString());
      if (endDate) {
        const endOfDay = new Date(endDate);
        endOfDay.setHours(23, 59, 59, 999);
        query = query.lte('created_at', endOfDay.toISOString());
      }

      query = query.order('created_at', { ascending: false }).limit(200);

      const { data, error } = await query;
      if (error) throw error;
      
      setResults(data || []);
      if (data?.length === 0 && triggerToast) {
        triggerToast(isEn ? 'No threats found matching these criteria.' : 'לא נמצאו איומים תואמים לחיפוש.', 'success');
      }
    } catch (err) {
      console.error("Search Error:", err.message);
      if (triggerToast) triggerToast(isEn ? `Search failed: ${err.message}` : `החיפוש נכשל: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  }, [isAdmin, userProfile, searchQuery, platformFilter, statusFilter, startDate, endDate, isEn, triggerToast]);

  useEffect(() => {
    if (isAdmin) handleSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin]);

  const resetFilters = () => {
    setSearchQuery('');
    setPlatformFilter('all');
    setStatusFilter('all');
    setStartDate('');
    setEndDate('');
    setActivePreset(null);
    setTimeout(() => handleSearch(), 100);
  };

  // --- QUICK PRESETS ---
  const applyPreset = (preset) => {
    setActivePreset(preset);
    const today = new Date();
    
    if (preset === 'critical24h') {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      setStartDate(yesterday.toISOString().split('T')[0]);
      setEndDate(today.toISOString().split('T')[0]);
      setStatusFilter('Verified');
      setPlatformFilter('all');
      setSearchQuery('');
    } else if (preset === 'pendingReview') {
      setStatusFilter('Pending Review');
      setStartDate('');
      setEndDate('');
      setPlatformFilter('all');
      setSearchQuery('');
    } else if (preset === 'myRejections') {
      setStatusFilter('Changes Requested');
      setStartDate('');
      setEndDate('');
      setPlatformFilter('all');
      setSearchQuery('');
    }
    
    setTimeout(() => handleSearch(), 100);
  };

  // --- BULK ACTIONS ---
  const handleBulkStatusUpdate = async (newStatus) => {
    if (selectedReports.length === 0) return;
    
    if (!window.confirm(isEn ? `Are you sure you want to mark ${selectedReports.length} reports as ${newStatus}?` : `האם אתה בטוח שברצונך לסמן ${selectedReports.length} דיווחים כ-${newStatus}?`)) {
        return;
    }

    setLoading(true);
    try {
      // Create audit trail note
      const newNote = {
        timestamp: new Date().toISOString(),
        actor: userProfile.displayName,
        action: `Bulk Status Update: ${newStatus}`,
        note: 'Applied via Threat Library Bulk Actions'
      };

      // We need to fetch existing additional_info to append to it safely, 
      // but for a quick bulk update, Supabase RPC or looping is required.
      // To keep it clean, we'll do a parallel update map.
      const updatePromises = selectedReports.map(async (id) => {
        const report = results.find(r => r.id === id);
        const safeNotes = Array.isArray(report?.additional_info) ? report.additional_info : [];
        return supabase.from('reports').update({
          status: newStatus,
          additional_info: [...safeNotes, newNote]
        }).eq('id', id);
      });

      await Promise.all(updatePromises);
      
      triggerToast(isEn ? `Successfully updated ${selectedReports.length} reports.` : `עודכנו בהצלחה ${selectedReports.length} דיווחים.`, 'success');
      handleSearch(); // Refresh grid
    } catch (err) {
      console.error("Bulk Update Error:", err);
      triggerToast(isEn ? "Failed to perform bulk update." : "עדכון גורף נכשל.", 'error');
    } finally {
      setLoading(false);
    }
  };

  const downloadCSV = () => {
    const dataToExport = selectedReports.length > 0 
      ? results.filter(r => selectedReports.includes(r.id))
      : results;

    if (!dataToExport || dataToExport.length === 0) return;

    const headers = isEn 
      ? ['ID', 'Date', 'Platform', 'Content', 'Link', 'Status', 'Assigned To']
      : ['מזהה', 'תאריך', 'פלטפורמה', 'תוכן', 'קישור', 'סטטוס', 'משויך ל'];

    const rows = dataToExport.map(r => {
      const assigneeName = r.assigned_to_profile?.display_name || r.assigned_to_profile?.email || 'Unassigned';
      const safeContent = (r.content || '').replace(/"/g, '""'); 
      return [
        r.id,
        new Date(r.created_at).toLocaleDateString(isEn ? 'en-US' : 'he-IL'),
        r.platform || 'N/A',
        safeContent,
        r.source_url || 'N/A',
        r.status || 'Pending',
        assigneeName
      ];
    });

    const csvContent = [headers.join(','), ...rows.map(e => `"${e.join('","')}"`)].join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `CiviWatch_Threat_Intel_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'AI Verified':
      case 'Verified': 
      case 'Closed - Verified': return '#10b981'; 
      case 'Dismissed': return '#64748b'; 
      case 'Processing': return '#3b82f6'; 
      case 'Pending Review': return '#a855f7'; 
      case 'Changes Requested': return '#ef4444'; 
      case 'Pending': 
      case 'Manual Review Required': return '#f59e0b'; 
      default: return '#94a3b8';
    }
  };

  const parseAILog = (logString) => {
    if (!logString) return [];
    return logString.split('\n').map((line, index) => {
      if (line.startsWith('*(Note')) return { type: 'warning', text: line, id: index };
      const match = line.match(/^\[(.*?):\s(.*)\]$/);
      if (match) {
         const prefix = match[1];
         const content = match[2];
         if (prefix === 'SYSTEM OVERALL' || prefix === 'ROUTING OVERRIDE') return { type: 'routing', prefix, text: content, id: index };
         if (prefix === 'SYSTEM') return { type: 'tag', prefix, text: content, id: index };
         return { type: 'provider', provider: prefix, text: content, id: index };
      }
      return { type: 'raw', text: line, id: index };
    });
  };

  if (!isAdmin) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '100px 20px', color: '#ef4444', animation: 'fadeIn 0.3s ease' }}>
        <div style={{ marginBottom: '15px' }}>{SVGIcons.Lock}</div>
        <h3 style={{ margin: '0 0 10px 0', fontSize: '1.5rem', fontWeight: 'bold' }}>{isEn ? 'Access Denied' : 'גישה נדחתה'}</h3>
        <p style={{ margin: 0, color: '#fca5a5', maxWidth: '400px', lineHeight: '1.5' }}>
          {isEn ? 'The Global Threat Intelligence Library is highly restricted. You must have L2 Moderator clearance or higher to access this module.' : 'הגישה למאגר האיומים הגלובלי מוגבלת מאוד. עליך להיות בעל סיווג הרשאת מנהל גישה כדי לצפות במודול זה.'}
        </p>
      </div>
    );
  }

  const inputStyle = { backgroundColor: '#0f172a', border: '1px solid #334155', color: '#cbd5e1', padding: '10px 14px', borderRadius: '8px', fontSize: '0.9rem', outline: 'none' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', direction: isRtl ? 'rtl' : 'ltr', animation: 'fadeIn 0.4s ease-out' }}>
      
      {/* --- HEADER SECTION --- */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '20px' }}>
        <div>
          <h2 style={{ margin: 0, color: '#fff', fontSize: '1.8rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
            {SVGIcons.Book} {isEn ? 'Global Threat Library' : 'מאגר איומים גלובלי'}
          </h2>
          <p style={{ margin: '5px 0 0 0', color: '#94a3b8', fontSize: '0.95rem' }}>
            {isEn ? 'Search, filter, export, and execute bulk actions across the entire reporting database.' : 'חפש, סנן, ייצא ונהל פעולות גורפות על כל מאגר הנתונים של המערכת.'}
          </p>
        </div>
        
        {/* Bulk Action Controls */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {selectedReports.length > 0 && (
            <div style={{ display: 'flex', gap: '10px', backgroundColor: 'rgba(56, 189, 248, 0.1)', padding: '6px 12px', borderRadius: '8px', border: '1px solid rgba(56, 189, 248, 0.3)', alignItems: 'center' }}>
              <span style={{ color: '#38bdf8', fontWeight: 'bold', fontSize: '0.9rem' }}>{selectedReports.length} {isEn ? 'Selected' : 'נבחרו'}</span>
              <div style={{ width: '1px', height: '20px', backgroundColor: 'rgba(56, 189, 248, 0.3)' }}></div>
              <button onClick={() => handleBulkStatusUpdate('Verified')} style={{ background: 'none', border: 'none', color: '#10b981', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem' }}>{isEn ? 'Verify' : 'אמת'}</button>
              <button onClick={() => handleBulkStatusUpdate('Dismissed')} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem' }}>{isEn ? 'Dismiss' : 'דחה'}</button>
            </div>
          )}
          
          <button 
            onClick={downloadCSV}
            disabled={results.length === 0}
            style={{ backgroundColor: '#10b981', color: 'white', padding: '10px 16px', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: results.length === 0 ? 'not-allowed' : 'pointer', boxShadow: '0 4px 10px rgba(16, 185, 129, 0.3)', display: 'flex', alignItems: 'center', gap: '8px', opacity: results.length === 0 ? 0.5 : 1, transition: 'all 0.2s' }}
          >
            {SVGIcons.Download} {selectedReports.length > 0 ? (isEn ? `Export Selected (${selectedReports.length})` : `ייצוא נבחרים (${selectedReports.length})`) : (isEn ? 'Export All (CSV)' : 'ייצוא תוצאות')}
          </button>
        </div>
      </div>

      {/* --- SEARCH & FILTER BAR --- */}
      <div style={{ backgroundColor: 'rgba(30, 41, 59, 0.6)', borderRadius: '12px', border: '1px solid #334155', padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
        
        {/* Preset Pills */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <span style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', marginRight: '5px' }}>{isEn ? 'QUICK VIEWS:' : 'תצוגות מהירות:'}</span>
          <button onClick={() => applyPreset('critical24h')} style={{ backgroundColor: activePreset === 'critical24h' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(15, 23, 42, 0.5)', color: activePreset === 'critical24h' ? '#f87171' : '#94a3b8', border: `1px solid ${activePreset === 'critical24h' ? 'rgba(239, 68, 68, 0.4)' : '#334155'}`, padding: '4px 12px', borderRadius: '16px', fontSize: '0.8rem', cursor: 'pointer', transition: 'all 0.2s' }}>{isEn ? 'Verified (Last 24h)' : 'אומתו (24 שעות)'}</button>
          <button onClick={() => applyPreset('pendingReview')} style={{ backgroundColor: activePreset === 'pendingReview' ? 'rgba(168, 85, 247, 0.2)' : 'rgba(15, 23, 42, 0.5)', color: activePreset === 'pendingReview' ? '#d946ef' : '#94a3b8', border: `1px solid ${activePreset === 'pendingReview' ? 'rgba(168, 85, 247, 0.4)' : '#334155'}`, padding: '4px 12px', borderRadius: '16px', fontSize: '0.8rem', cursor: 'pointer', transition: 'all 0.2s' }}>{isEn ? 'Pending Review Queue' : 'ממתינים לבקרה'}</button>
          <button onClick={() => applyPreset('myRejections')} style={{ backgroundColor: activePreset === 'myRejections' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(15, 23, 42, 0.5)', color: activePreset === 'myRejections' ? '#fbbf24' : '#94a3b8', border: `1px solid ${activePreset === 'myRejections' ? 'rgba(245, 158, 11, 0.4)' : '#334155'}`, padding: '4px 12px', borderRadius: '16px', fontSize: '0.8rem', cursor: 'pointer', transition: 'all 0.2s' }}>{isEn ? 'Needs Fix / Rejections' : 'נדחים / נדרש תיקון'}</button>
        </div>

        <form onSubmit={handleSearch} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {/* Main Search Input */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <input 
              type="text" 
              placeholder={isEn ? "Search by EXACT Threat ID, keyword, slurs, or context..." : "חפש לפי מזהה דיווח מדוייק (ID), מילות מפתח, או תוכן..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ ...inputStyle, flex: 1, fontSize: '1rem', padding: '14px' }}
            />
            <button type="submit" disabled={loading} style={{ backgroundColor: '#1f6feb', color: '#fff', border: 'none', padding: '0 24px', borderRadius: '8px', fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer', transition: 'all 0.2s', opacity: loading ? 0.7 : 1 }}>
              {loading ? '...' : (isEn ? 'Search' : 'חפש')}
            </button>
          </div>

          {/* Dropdown Filters Row */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', alignItems: 'flex-end' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 'bold' }}>{isEn ? 'Platform' : 'פלטפורמה'}</label>
              <select value={platformFilter} onChange={(e) => setPlatformFilter(e.target.value)} style={inputStyle}>
                <option value="all">{isEn ? 'All Platforms' : 'כל הפלטפורמות'}</option>
                <option value="x">X (Twitter)</option>
                <option value="facebook">Facebook</option>
                <option value="instagram">Instagram</option>
                <option value="tiktok">TikTok</option>
                <option value="telegram">Telegram</option>
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 'bold' }}>{isEn ? 'Status' : 'סטטוס'}</label>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={inputStyle}>
                <option value="all">{isEn ? 'All Statuses' : 'כל הסטטוסים'}</option>
                <option value="Verified">{isEn ? 'Verified / Approved' : 'מאומת (Verified)'}</option>
                <option value="Pending Review">{isEn ? 'Pending Review' : 'ממתין לבקרה'}</option>
                <option value="Dismissed">{isEn ? 'Dismissed / Rejected' : 'נדחה (Dismissed)'}</option>
                <option value="Changes Requested">{isEn ? 'Needs Fix' : 'נדרש תיקון'}</option>
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 'bold' }}>{isEn ? 'From Date' : 'מתאריך'}</label>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={inputStyle} />
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 'bold' }}>{isEn ? 'To Date' : 'עד תאריך'}</label>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} style={inputStyle} />
            </div>

            {(searchQuery || startDate || endDate || platformFilter !== 'all' || statusFilter !== 'all') && (
              <button type="button" onClick={resetFilters} style={{ marginLeft: isEn ? 'auto' : 0, marginRight: isEn ? 0 : 'auto', backgroundColor: 'transparent', color: '#94a3b8', border: '1px solid #475569', padding: '10px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>
                {isEn ? 'Clear' : 'נקה'}
              </button>
            )}
          </div>
        </form>
      </div>

      {/* --- RESULTS DATA TABLE --- */}
      <div style={{ backgroundColor: 'rgba(15, 23, 42, 0.4)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
        <div style={{ padding: '20px 30px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: '#cbd5e1', fontWeight: 'bold' }}>{results.length} {isEn ? 'Results Found (Max 200)' : 'תוצאות נמצאו (מקסימום 200)'}</span>
        </div>
        
        <div style={{ padding: '20px 30px', minHeight: '300px', overflowX: 'auto' }}>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px', color: '#38bdf8' }}>
              {isEn ? 'Searching intelligence database...' : 'מבצע חיפוש במאגר...'}
            </div>
          ) : results.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#64748b', paddingTop: '60px' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '15px', color: '#334155' }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              </div>
              <div>{isEn ? 'Ready to search.' : 'מוכן לחיפוש.'}</div>
            </div>
          ) : (
            <div style={{ color: '#fff', minWidth: '1000px' }}>
              
              {/* ALIGNED GRID HEADERS - With Checkbox */}
              <div style={{ display: 'grid', gridTemplateColumns: '40px 1.5fr 1fr 3fr 1.5fr', color: '#94a3b8', borderBottom: '1px solid #334155', paddingBottom: '10px', marginBottom: '10px', fontSize: '0.85rem', textTransform: 'uppercase', gap: '15px', alignItems: 'center' }}>
                <div style={{ paddingLeft: '5px' }}>
                  <input 
                    type="checkbox" 
                    onChange={handleSelectAll} 
                    checked={results.length > 0 && selectedReports.length === results.length}
                    style={{ cursor: 'pointer' }}
                  />
                </div>
                <div>{isEn ? 'Date / ID' : 'תאריך / מזהה'}</div>
                <div>{isEn ? 'Evidence' : 'ראיות'}</div>
                <div>{isEn ? 'Content & Context' : 'תוכן והקשר'}</div>
                <div>{isEn ? 'Routing / Status' : 'ניתוב / סטטוס'}</div>
              </div>
              
              {results.map(report => {
                const hasAILog = !!report.ai_reasoning;
                const hasAuditTrail = Array.isArray(report.additional_info) && report.additional_info.length > 0;
                const assigneeName = report.assigned_to_profile?.display_name || report.assigned_to_profile?.email || (isEn ? 'Unassigned' : 'לא משויך');
                const isSelected = selectedReports.includes(report.id);

                return (
                  <React.Fragment key={report.id}>
                    {/* ALIGNED GRID ROW */}
                    <div style={{ display: 'grid', gridTemplateColumns: '40px 1.5fr 1fr 3fr 1.5fr', alignItems: 'flex-start', padding: '16px 0', borderBottom: expandedLogs[report.id] ? 'none' : '1px solid rgba(255,255,255,0.02)', gap: '15px', backgroundColor: isSelected ? 'rgba(56, 189, 248, 0.05)' : 'transparent' }}>
                      
                      {/* CHECKBOX */}
                      <div style={{ paddingTop: '5px', paddingLeft: '5px' }}>
                        <input 
                          type="checkbox" 
                          checked={isSelected}
                          onChange={() => handleSelectRow(report.id)}
                          style={{ cursor: 'pointer' }}
                        />
                      </div>

                      {/* DATE, PLATFORM & FULL ID */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingTop: '5px' }}>
                        <div style={{ fontSize: '0.9rem', color: '#e2e8f0', fontWeight: '500' }}>
                          {new Date(report.created_at).toLocaleDateString(isEn ? 'en-US' : 'he-IL')}
                        </div>
                        
                        <div>
                          {report.platform && (
                            <span style={{ backgroundColor: 'rgba(56,189,248,0.1)', color: '#38bdf8', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', border: '1px solid rgba(56,189,248,0.2)', display: 'inline-block' }}>
                              {report.platform}
                            </span>
                          )}
                          {report.source_url && (
                            <div style={{ marginTop: '8px' }}>
                              <a href={report.source_url} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#a855f7', fontSize: '0.75rem', textDecoration: 'none', padding: '2px 0' }}>
                                {SVGIcons.Link} {isEn ? 'Source Link' : 'קישור מקור'}
                              </a>
                            </div>
                          )}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#020617', padding: '4px 8px', borderRadius: '6px', border: '1px solid #1e293b', alignSelf: 'flex-start', maxWidth: '100%' }}>
                          <span style={{ color: '#64748b', fontSize: '0.65rem', fontFamily: 'monospace', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '140px' }} title={report.id}>
                            {report.id}
                          </span>
                          <button onClick={() => copyToClipboard(report.id)} style={{ background: 'none', border: 'none', color: '#38bdf8', cursor: 'pointer', padding: '0', display: 'flex', flexShrink: 0 }} title={isEn ? "Copy ID" : "העתק מזהה"}>
                            {SVGIcons.Copy}
                          </button>
                        </div>
                      </div>

                      {/* EVIDENCE THUMBNAIL WITH DIRECT DOWNLOAD */}
                      <div style={{ paddingTop: '5px' }}>
                        {report.image_url ? (
                          <div style={{ position: 'relative', width: '80px' }}>
                            <a href={report.image_url} target="_blank" rel="noopener noreferrer" style={{ cursor: 'zoom-in', display: 'block' }}>
                              <div style={{ width: '80px', height: '80px', borderRadius: '6px', border: '1px solid #334155', overflow: 'hidden', backgroundColor: '#020617', transition: 'transform 0.2s' }} onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'} onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}>
                                <img src={report.image_url} alt="Evidence" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              </div>
                            </a>
                            <a href={report.image_url} download={`Evidence_${report.id.slice(0,8)}.jpg`} target="_blank" rel="noopener noreferrer" style={{ position: 'absolute', bottom: '-8px', right: '-8px', backgroundColor: '#10b981', color: '#fff', padding: '4px', borderRadius: '50%', boxShadow: '0 2px 5px rgba(0,0,0,0.5)', display: 'flex', cursor: 'pointer' }} title={isEn ? "Download Original File" : "הורד קובץ מקורי"}>
                              {SVGIcons.Download}
                            </a>
                          </div>
                        ) : (
                          <div style={{ width: '80px', height: '80px', borderRadius: '6px', border: '1px dashed #334155', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(15, 23, 42, 0.5)' }}>
                            <span style={{ fontSize: '0.7rem', color: '#475569', textAlign: 'center', padding: '0 4px' }}>{isEn ? 'No image' : 'אין תמונה'}</span>
                          </div>
                        )}
                      </div>
                      
                      {/* CONTENT & CONTEXT TAGS */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingRight: isEn ? '15px' : '0', paddingLeft: isEn ? '0' : '15px', paddingTop: '5px' }}>
                        <div style={{ fontSize: '0.9rem', color: '#f8fafc', lineHeight: '1.5' }}>
                          {report.content || (isEn ? 'No text content provided.' : 'לא צורף טקסט.')}
                        </div>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '4px' }}>
                          {(report.tags || []).map((tag, idx) => (
                            <span key={idx} style={{ color: '#94a3b8', fontSize: '0.75rem', backgroundColor: 'rgba(148, 163, 184, 0.1)', padding: '2px 8px', borderRadius: '4px', border: '1px solid rgba(148, 163, 184, 0.2)' }}>#{tag}</span>
                          ))}
                        </div>
                      </div>
                      
                      {/* STATUS & ASSIGNMENT & CONTROLS */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '5px' }}>
                        <span style={{ color: getStatusColor(report.status), fontWeight: 'bold', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: getStatusColor(report.status), boxShadow: `0 0 5px ${getStatusColor(report.status)}` }}></span>
                          {report.status === 'Closed - Verified' ? 'Verified' : report.status}
                        </span>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#94a3b8', backgroundColor: 'rgba(15, 23, 42, 0.5)', padding: '4px 8px', borderRadius: '4px', alignSelf: 'flex-start' }}>
                          {SVGIcons.User} {assigneeName}
                        </div>
                        
                        <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                          {(hasAILog || hasAuditTrail) && (
                            <button 
                              onClick={() => toggleLog(report.id)}
                              style={{ backgroundColor: expandedLogs[report.id] ? 'rgba(56, 189, 248, 0.2)' : 'rgba(30, 41, 59, 0.8)', color: expandedLogs[report.id] ? '#38bdf8' : '#94a3b8', border: '1px solid', borderColor: expandedLogs[report.id] ? 'rgba(56, 189, 248, 0.5)' : '#334155', padding: '4px 10px', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s' }}
                            >
                              {SVGIcons.History} {expandedLogs[report.id] ? (isEn ? 'Hide Details' : 'הסתר פרטים') : (isEn ? 'View Audit / AI' : 'צפה בפרטים')}
                            </button>
                          )}
                        </div>
                      </div>

                    </div>

                    {/* EXPANDED ROW: AUDIT TRAIL & AI LOG */}
                    {expandedLogs[report.id] && (
                      <div style={{ backgroundColor: '#020617', border: '1px solid #1e293b', borderRadius: '8px', padding: '20px', margin: '0 0 15px 0', boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.5)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                        
                        {/* LEFT COLUMN: AUDIT TRAIL */}
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #1e293b', paddingBottom: '8px', marginBottom: '12px' }}>
                            {SVGIcons.CheckList} <strong style={{ color: '#38bdf8' }}>{isEn ? 'Status Audit Trail' : 'יומן שינויי סטטוס'}</strong>
                          </div>
                          {hasAuditTrail ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                              {report.additional_info.map((log, idx) => (
                                <div key={idx} style={{ borderLeft: '2px solid #334155', paddingLeft: '12px' }}>
                                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '2px' }}>
                                    {new Date(log.timestamp).toLocaleString(isEn ? 'en-US' : 'he-IL')} • <strong style={{ color: '#94a3b8' }}>{log.actor}</strong>
                                  </div>
                                  <div style={{ fontSize: '0.85rem', color: '#e2e8f0', fontWeight: 'bold' }}>{log.action}</div>
                                  {log.note && <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontStyle: 'italic', marginTop: '2px' }}>"{log.note}"</div>}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div style={{ color: '#64748b', fontSize: '0.85rem', fontStyle: 'italic' }}>{isEn ? 'No audit history available.' : 'אין היסטוריית שינויים.'}</div>
                          )}
                        </div>

                        {/* RIGHT COLUMN: AI REASONING */}
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #1e293b', paddingBottom: '8px', marginBottom: '12px' }}>
                            <strong style={{ color: '#a855f7', display: 'flex', alignItems: 'center', gap: '8px' }}>{SVGIcons.Bot} CiviWatch AI Matrix</strong>
                            {report.ai_confidence > 0 && <span style={{ color: '#cbd5e1', fontSize: '0.85rem' }}>Confidence: <strong style={{ color: '#a855f7' }}>{(report.ai_confidence * 100).toFixed(0)}%</strong></span>}
                          </div>
                          {hasAILog ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontFamily: 'monospace', fontSize: '0.8rem' }}>
                              {parseAILog(report.ai_reasoning).map((log) => {
                                if (log.type === 'routing') return <div key={log.id} style={{ display: 'flex', gap: '10px' }}><span style={{ color: '#d946ef', fontWeight: 'bold', whiteSpace: 'nowrap' }}>[{log.prefix}]</span><span style={{ color: '#fdf4ff' }}>{log.text}</span></div>;
                                if (log.type === 'tag') return <div key={log.id} style={{ display: 'flex', gap: '10px' }}><span style={{ color: '#2dd4bf', fontWeight: 'bold', whiteSpace: 'nowrap' }}>[{log.prefix}]</span><span style={{ color: '#ccfbf1' }}>{log.text}</span></div>;
                                if (log.type === 'provider') return <div key={log.id} style={{ display: 'flex', gap: '10px', paddingLeft: isRtl ? '0' : '20px', paddingRight: isRtl ? '20px' : '0' }}><span style={{ color: '#94a3b8', fontWeight: 'bold', whiteSpace: 'nowrap' }}>[{log.provider}]</span><span style={{ color: '#cbd5e1' }}>{log.text}</span></div>;
                                if (log.type === 'warning') return <div key={log.id} style={{ color: '#ef4444', fontStyle: 'italic', marginTop: '8px', borderTop: '1px solid #1e293b', paddingTop: '8px' }}>{log.text}</div>;
                                return <div key={log.id} style={{ color: '#94a3b8' }}>{log.text}</div>;
                              })}
                            </div>
                          ) : (
                            <div style={{ color: '#64748b', fontSize: '0.85rem', fontStyle: 'italic' }}>{isEn ? 'No AI analysis requested for this report.' : 'לא בוצעה בקרת AI לדיווח זה.'}</div>
                          )}
                        </div>

                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ThreatLibrary;