/**
 * @file OrganizationSwitcher.js
 * @description "God Mode" modal for Global Admins to search, filter, and seamlessly switch between client workspaces.
 */
import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';

const Icons = {
  Search: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>,
  Building: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><line x1="9" y1="22" x2="9" y2="2"></line><line x1="15" y1="22" x2="15" y2="2"></line><line x1="4" y1="12" x2="20" y2="12"></line><line x1="4" y1="7" x2="9" y2="7"></line><line x1="4" y1="17" x2="9" y2="17"></line><line x1="15" y1="7" x2="20" y2="7"></line><line x1="15" y1="17" x2="20" y2="17"></line></svg>,
  X: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>,
  CheckCircle: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>,
  AlertCircle: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>,
  ArrowRight: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
};

const inputStyle = { backgroundColor: '#020617', border: '1px solid #334155', color: '#f8fafc', padding: '10px 14px', borderRadius: '8px', fontSize: '0.9rem', outline: 'none', width: '100%' };

const OrganizationSwitcher = ({ isOpen, onClose, onSelectOrg, currentOrgId, isEn }) => {
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('alpha');

  useEffect(() => {
    if (!isOpen) return;

    const fetchOrgs = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('organizations')
          .select('id, name, domain, is_active, type, created_at')
          .order('name', { ascending: true });

        if (error) throw error;
        setOrganizations(data || []);
      } catch (error) {
        console.error("Error fetching organizations:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrgs();
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredOrgs = organizations.filter(org => {
    const matchesSearch = (org.name?.toLowerCase().includes(searchTerm.toLowerCase())) || 
                          (org.domain?.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' ? true : 
                          statusFilter === 'active' ? org.is_active === true : 
                          org.is_active === false;
                          
    return matchesSearch && matchesStatus;
  }).sort((a, b) => {
    if (sortOrder === 'alpha') return a.name?.localeCompare(b.name);
    return new Date(b.created_at) - new Date(a.created_at);
  });

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(2, 6, 23, 0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999, backdropFilter: 'blur(8px)' }}>
      <div style={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '16px', width: '90%', maxWidth: '900px', maxHeight: '85vh', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', overflow: 'hidden', animation: 'fadeIn 0.3s ease-out', direction: isEn ? 'ltr' : 'rtl' }}>
        
        {/* Header */}
        <div style={{ padding: '24px 30px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#1e293b' }}>
          <div>
            <h2 style={{ margin: 0, color: '#fff', fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
              {Icons.Building} {isEn ? 'Switch Organization' : 'החלף ארגון'}
            </h2>
            <p style={{ margin: '4px 0 0 0', color: '#94a3b8', fontSize: '0.9rem' }}>{isEn ? 'Global Admin Directory Access' : 'גישת מנהל גלובלי לספריית ארגונים'}</p>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', transition: 'color 0.2s' }} onMouseOver={(e) => e.target.style.color = '#fff'} onMouseOut={(e) => e.target.style.color = '#94a3b8'}>
            {Icons.X}
          </button>
        </div>

        {/* Filter Bar */}
        <div style={{ padding: '20px 30px', backgroundColor: 'rgba(30, 41, 59, 0.5)', borderBottom: '1px solid #334155', display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 300px', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: isEn ? '12px' : 'auto', right: isEn ? 'auto' : '12px', color: '#64748b' }}>{Icons.Search}</div>
            <input 
              type="text" 
              placeholder={isEn ? "Search by name or domain..." : "חפש לפי שם או דומיין..."} 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              style={{ ...inputStyle, paddingLeft: isEn ? '40px' : '14px', paddingRight: isEn ? '14px' : '40px' }} 
            />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ ...inputStyle, flex: '0 1 180px' }}>
            <option value="all">{isEn ? 'All Statuses' : 'כל הסטטוסים'}</option>
            <option value="active">{isEn ? 'Active Only' : 'פעילים בלבד'}</option>
            <option value="suspended">{isEn ? 'Suspended Only' : 'מושהים בלבד'}</option>
          </select>
          <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} style={{ ...inputStyle, flex: '0 1 180px' }}>
            <option value="alpha">{isEn ? 'Alphabetical (A-Z)' : 'לפי א״ב'}</option>
            <option value="newest">{isEn ? 'Newest Created' : 'הכי חדש תחילה'}</option>
          </select>
        </div>

        {/* Content Area */}
        <div style={{ padding: '20px 30px', overflowY: 'auto', flex: 1, backgroundColor: '#020617' }}>
          {loading ? (
            <div style={{ textAlign: 'center', color: '#38bdf8', padding: '40px 0' }}>{isEn ? 'Loading directory...' : 'טוען ספרייה...'}</div>
          ) : filteredOrgs.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#64748b', padding: '40px 0' }}>{isEn ? 'No organizations found matching your filters.' : 'לא נמצאו ארגונים התואמים לסינון.'}</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
              {filteredOrgs.map(org => {
                const isActive = org.is_active;
                const isCurrent = org.id === currentOrgId;

                return (
                  <div key={org.id} style={{ backgroundColor: isCurrent ? 'rgba(56, 189, 248, 0.05)' : '#0f172a', border: `1px solid ${isCurrent ? '#38bdf8' : '#334155'}`, borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px', transition: 'transform 0.2s, box-shadow 0.2s', boxShadow: isCurrent ? '0 0 0 1px #38bdf8' : 'none' }}>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <h3 style={{ margin: '0 0 4px 0', color: '#f8fafc', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {org.name} {isCurrent && <span style={{ fontSize: '0.7rem', backgroundColor: '#38bdf8', color: '#0f172a', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>{isEn ? 'CURRENT' : 'נוכחי'}</span>}
                        </h3>
                        <div style={{ color: '#94a3b8', fontSize: '0.85rem', fontFamily: 'monospace' }}>{org.domain || (isEn ? 'No domain linked' : 'ללא דומיין')}</div>
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 'bold', padding: '4px 8px', borderRadius: '6px', backgroundColor: isActive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: isActive ? '#10b981' : '#ef4444', border: `1px solid ${isActive ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}` }}>
                        {isActive ? Icons.CheckCircle : Icons.AlertCircle}
                        {isActive ? (isEn ? 'Active' : 'פעיל') : (isEn ? 'Suspended' : 'מושהה')}
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 'auto', paddingTop: '15px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                      <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                        {isEn ? 'Type:' : 'סוג:'} <span style={{ color: '#cbd5e1', textTransform: 'capitalize' }}>{org.type || 'Standard'}</span>
                      </div>
                      <button 
                        onClick={() => {
                          if (!isCurrent) onSelectOrg(org.id);
                        }}
                        disabled={isCurrent}
                        style={{ backgroundColor: isCurrent ? '#334155' : '#1f6feb', color: isCurrent ? '#94a3b8' : '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: 'bold', cursor: isCurrent ? 'default' : 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', transition: 'background-color 0.2s' }}
                      >
                        {isCurrent ? (isEn ? 'Active Workspace' : 'סביבה נוכחית') : <>{isEn ? 'Enter Workspace' : 'היכנס לסביבה'} {Icons.ArrowRight}</>}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrganizationSwitcher;