/**
 * @file Allocation.js
 * @description The Task Allocation "Blueprint" interface for Moderators and Admins.
 * Provides a drag-and-drop OR click-to-select UI to manually dispatch targeted assignments to specific 
 * operators. Automatically fetches and attaches relevant SOP Google Drive links from the DB,
 * and explicitly warns the user if no guide is available for the current selection.
 */

import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';

// --- UNIVERSAL SVG ICON MAPPING ---
const SVGIcons = {
  Users: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>,
  Globe: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>,
  Tag: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>,
  Clipboard: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg>,
  Send: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>,
  X: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>,
  Link: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>,
  AlertTriangle: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>,
  Plus: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>,
  Check: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
};

const Allocation = ({ teamMembers, isEn, triggerToast, userProfile }) => {
  // --- STATE MANAGEMENT: BLUEPRINT BUILDER ---
  const [selectedOperators, setSelectedOperators] = useState([]);
  const [selectedPlatform, setSelectedPlatform] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [hours, setHours] = useState(2);
  const [instructions, setInstructions] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- STATE MANAGEMENT: SOP LINKS ---
  const [orgSopLinks, setOrgSopLinks] = useState([]);

  // --- STATIC ASSETS ---
  const platforms = [
    'Facebook', 'Twitter/X', 'TikTok', 'Instagram', 'Telegram', 'YouTube', 
    'LinkedIn', 'Reddit', 'Discord', 'Truth Social', 'VK', 'Other Task'
  ];
  
  const categories = [
    'Antisemitism', 'Hate Speech', 'Incitement', 'Disinformation', 
    'Terrorism', 'Harassment', 'Other Task'
  ];

  // --- FETCH SOP LINKS ---
  useEffect(() => {
    const fetchSopLinks = async () => {
      if (!userProfile?.organization_id) return;
      try {
        const { data, error } = await supabase
          .from('organizations')
          .select('sop_links')
          .eq('id', userProfile.organization_id)
          .single();
          
        if (error) throw error;

        let fetchedLinks = data?.sop_links;
        if (typeof fetchedLinks === 'string') {
          try { fetchedLinks = JSON.parse(fetchedLinks); } 
          catch (e) { fetchedLinks = []; }
        }
        setOrgSopLinks(Array.isArray(fetchedLinks) ? fetchedLinks : []);
      } catch (err) {
        console.error('Failed to fetch SOP links:', err);
      }
    };

    fetchSopLinks();
  }, [userProfile]);

  const onDragStart = (e, type, value) => {
    e.dataTransfer.setData('type', type);
    e.dataTransfer.setData('value', value);
  };

  const onDrop = (e) => {
    const type = e.dataTransfer.getData('type');
    const value = e.dataTransfer.getData('value');

    if (type === 'operator') {
      const op = (teamMembers || []).find(m => m.id === value);
      if (op && !selectedOperators.find(o => o.id === op.id)) {
        setSelectedOperators([...selectedOperators, op]);
      }
    } else if (type === 'platform') {
      setSelectedPlatform(value);
      if (value === 'Other Task') setSelectedCategory('Other Task');
    } else if (type === 'category') {
      setSelectedCategory(value);
    }
  };

  // --- CLICK-TO-SELECT MULTI-SELECT LOGIC ---
  const handleOperatorClick = (op) => {
    if (!selectedOperators.find(o => o.id === op.id)) {
      setSelectedOperators([...selectedOperators, op]);
    }
  };

  const handleDispatch = async () => {
    if (selectedOperators.length === 0 || !selectedPlatform || !selectedCategory) {
      triggerToast(isEn ? 'Please fill all required fields' : 'נא למלא את כל שדות החובה', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      // Find matching SOP link from the fetched database array
      const matchedSop = orgSopLinks.find(sop => sop.network === selectedPlatform && sop.category === selectedCategory);
      const driveLinkToAttach = matchedSop ? matchedSop.drive_link : null;

      const assignments = selectedOperators.map(op => ({
        organization_id: userProfile.organization_id,
        created_by: userProfile.id,
        assigned_to: op.id,
        platform: selectedPlatform,
        category: selectedCategory,
        allocated_hours: hours,
        custom_instructions: instructions,
        drive_link: driveLinkToAttach, // Injects the dynamically matched link here (or null)
        status: 'Pending'
      }));

      const { error } = await supabase.from('assignments').insert(assignments);
      if (error) throw error;

      triggerToast(isEn ? 'Tasks Allocated Successfully!' : 'המשימות הוקצו בהצלחה!', 'success');
      
      // Reset Blueprint
      setSelectedOperators([]);
      setSelectedPlatform('');
      setSelectedCategory('');
      setHours(2);
      setInstructions('');
    } catch (err) {
      console.error(err);
      triggerToast(isEn ? 'Allocation failed' : 'הקצאת המשימות נכשלה', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeItem = (id, setter, currentList) => {
    setter(currentList.filter(item => (item.id || item) !== id));
  };

  // Check if a guide exists for current selections
  const activeGuideMatch = orgSopLinks.find(sop => sop.network === selectedPlatform && sop.category === selectedCategory);

  return (
    <div style={{ display: 'flex', gap: '30px', direction: isEn ? 'ltr' : 'rtl', flexWrap: 'wrap' }}>
      
      {/* --- LEFT PANEL: THE ARMORY --- */}
      <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <h3 style={{ color: '#fff', margin: 0 }}>{isEn ? 'Allocation Assets' : 'מרכיבי הקצאה'}</h3>
        
        {/* Operators Draggables & Clickables */}
        <div style={{ backgroundColor: 'rgba(30, 41, 59, 0.4)', padding: '15px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <p style={{ color: '#94a3b8', fontSize: '12px', marginBottom: '10px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px', textTransform: 'uppercase' }}>
            {SVGIcons.Users} {isEn ? 'Operators (Click to Select)' : 'מפעילים (לחץ לבחירה)'}
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {(teamMembers || [])
              .filter(m => 
                m.role?.toLowerCase()?.includes('operator') && 
                m.display_name !== 'Pending Invite' && 
                m.email // Strictly filters out ghost records without emails
              )
              .map(op => {
                const isSelected = selectedOperators.some(o => o.id === op.id);
                return (
                  <div 
                    key={op.id} 
                    draggable={!isSelected} 
                    onDragStart={(e) => !isSelected && onDragStart(e, 'operator', op.id)} 
                    onClick={() => !isSelected && handleOperatorClick(op)}
                    style={{ 
                      padding: '6px 12px', 
                      backgroundColor: isSelected ? 'rgba(30, 41, 59, 0.8)' : '#1e293b', 
                      border: isSelected ? '1px solid #334155' : '1px solid #38bdf8', 
                      borderRadius: '6px', 
                      color: isSelected ? '#64748b' : '#fff', 
                      fontSize: '13px', 
                      cursor: isSelected ? 'default' : 'pointer', 
                      transition: 'all 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    {isSelected ? <span style={{ color: '#10b981', display: 'flex' }}>{SVGIcons.Check}</span> : <span style={{ color: '#38bdf8', display: 'flex' }}>{SVGIcons.Plus}</span>}
                    {op.display_name || op.email?.split('@')[0]}
                  </div>
                );
              })}
          </div>
        </div>

        {/* Platforms Draggables */}
        <div style={{ backgroundColor: 'rgba(30, 41, 59, 0.4)', padding: '15px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <p style={{ color: '#94a3b8', fontSize: '12px', marginBottom: '10px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px', textTransform: 'uppercase' }}>
            {SVGIcons.Globe} {isEn ? 'Platforms' : 'פלטפורמות'}
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {platforms.map(p => (
              <div key={p} draggable onDragStart={(e) => onDragStart(e, 'platform', p)} onClick={() => setSelectedPlatform(p)} style={{ padding: '6px 12px', backgroundColor: selectedPlatform === p ? '#38bdf8' : 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.3)', color: selectedPlatform === p ? '#0f172a' : '#38bdf8', borderRadius: '6px', fontSize: '13px', cursor: 'pointer', transition: 'all 0.2s', fontWeight: selectedPlatform === p ? 'bold' : 'normal' }}>
                {isEn || p !== 'Other Task' ? p : 'משימה אחרת'}
              </div>
            ))}
          </div>
        </div>

        {/* Categories Draggables */}
        <div style={{ backgroundColor: 'rgba(30, 41, 59, 0.4)', padding: '15px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <p style={{ color: '#94a3b8', fontSize: '12px', marginBottom: '10px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px', textTransform: 'uppercase' }}>
            {SVGIcons.Tag} {isEn ? 'Subjects' : 'נושאים'}
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {categories.map(c => (
              <div key={c} draggable onDragStart={(e) => onDragStart(e, 'category', c)} onClick={() => setSelectedCategory(c)} style={{ padding: '6px 12px', backgroundColor: selectedCategory === c ? '#a855f7' : 'rgba(168, 85, 247, 0.1)', border: '1px solid rgba(168, 85, 247, 0.3)', color: selectedCategory === c ? '#fff' : '#a855f7', borderRadius: '6px', fontSize: '13px', cursor: 'pointer', transition: 'all 0.2s', fontWeight: selectedCategory === c ? 'bold' : 'normal' }}>
                {isEn || c !== 'Other Task' ? c : 'משימה אחרת'}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* --- RIGHT PANEL: THE BLUEPRINT DROP ZONE --- */}
      <div onDragOver={(e) => e.preventDefault()} onDrop={onDrop} style={{ flex: '2 1 500px', backgroundColor: 'rgba(15, 23, 42, 0.6)', border: '2px dashed rgba(56, 189, 248, 0.3)', borderRadius: '20px', padding: '30px', minHeight: '450px', position: 'relative' }}>
        <h3 style={{ color: '#fff', margin: '0 0 25px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
          {SVGIcons.Clipboard} {isEn ? 'Allocation Blueprint' : 'תכנית הקצאה'}
        </h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
          
          <div>
            <label style={{ color: '#94a3b8', fontSize: '13px', display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>{isEn ? 'Assigned To:' : 'יוקצה ל:'}</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', minHeight: '40px', padding: '10px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
              {selectedOperators.map(op => (
                <span key={op.id} style={{ backgroundColor: '#38bdf8', color: '#0f172a', padding: '5px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', animation: 'fadeIn 0.2s ease-out' }}>
                  {op.display_name || op.email?.split('@')[0]} 
                  <button onClick={() => removeItem(op.id, setSelectedOperators, selectedOperators)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#0f172a', display: 'flex', alignItems: 'center', padding: 0, opacity: 0.7, transition: 'opacity 0.2s' }} onMouseOver={(e) => e.currentTarget.style.opacity = 1} onMouseOut={(e) => e.currentTarget.style.opacity = 0.7}>
                    {SVGIcons.X}
                  </button>
                </span>
              ))}
              {selectedOperators.length === 0 && <span style={{ color: '#475569', fontSize: '13px', display: 'flex', alignItems: 'center' }}>{isEn ? 'Drag or click operators to add...' : 'גרור או לחץ על מפעילים להוספה...'}</span>}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <label style={{ color: '#94a3b8', fontSize: '13px', display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>{isEn ? 'Platform:' : 'פלטפורמה:'}</label>
              <div style={{ padding: '12px', backgroundColor: 'rgba(56, 189, 248, 0.05)', border: '1px solid rgba(56, 189, 248, 0.2)', borderRadius: '8px', textAlign: 'center', fontWeight: selectedPlatform ? 'bold' : 'normal', color: selectedPlatform ? '#38bdf8' : '#64748b', transition: 'all 0.2s' }}>
                {selectedPlatform ? (isEn || selectedPlatform !== 'Other Task' ? selectedPlatform : 'משימה אחרת') : (isEn ? 'Drag or Click Platform' : 'גרור או בחר פלטפורמה')}
              </div>
            </div>
            <div>
              <label style={{ color: '#94a3b8', fontSize: '13px', display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>{isEn ? 'Subject:' : 'נושא:'}</label>
              <div style={{ padding: '12px', backgroundColor: 'rgba(168, 85, 247, 0.05)', border: '1px solid rgba(168, 85, 247, 0.2)', borderRadius: '8px', textAlign: 'center', fontWeight: selectedCategory ? 'bold' : 'normal', color: selectedCategory ? '#a855f7' : '#64748b', transition: 'all 0.2s' }}>
                {selectedCategory ? (isEn || selectedCategory !== 'Other Task' ? selectedCategory : 'משימה אחרת') : (isEn ? 'Drag or Click Subject' : 'גרור או בחר נושא')}
              </div>
            </div>
          </div>

          {/* SOP Link Auto-Attach Visual Indicator */}
          {selectedPlatform && selectedCategory && (
            activeGuideMatch ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '10px 15px', borderRadius: '8px', color: '#10b981', fontSize: '0.85rem', animation: 'fadeIn 0.3s ease-out' }}>
                {SVGIcons.Link} 
                <span style={{ fontWeight: 'bold' }}>{isEn ? 'SOP Guide Found' : 'נמצא מדריך פעולה'}:</span>
                {isEn ? 'Will automatically attach to assignment.' : 'יצורף אוטומטית למשימה.'}
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '10px 15px', borderRadius: '8px', color: '#f59e0b', fontSize: '0.85rem', animation: 'fadeIn 0.3s ease-out' }}>
                <span style={{ display: 'flex', alignItems: 'center' }}>{SVGIcons.AlertTriangle}</span>
                <span style={{ fontWeight: 'bold' }}>{isEn ? 'No SOP Guide Available' : 'לא נמצא מדריך פעולה'}:</span>
                {isEn ? 'No document will be attached.' : 'לא יצורף מסמך למשימה.'}
              </div>
            )
          )}

          <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-end' }}>
            <div style={{ flex: 1 }}>
              <label style={{ color: '#94a3b8', fontSize: '13px', display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>{isEn ? 'Allocated Hours' : 'שעות מוקצות'}</label>
              <input type="number" value={hours} onChange={(e) => setHours(e.target.value)} style={{ width: '100%', padding: '12px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#fff', outline: 'none', boxSizing: 'border-box' }} />
            </div>
          </div>

          <div>
            <label style={{ color: '#94a3b8', fontSize: '13px', display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>{isEn ? 'Custom Instructions' : 'הנחיות מיוחדות'}</label>
            <textarea value={instructions} onChange={(e) => setInstructions(e.target.value)} placeholder={isEn ? "Describe specific target or search queries..." : "תאר יעד ספציפי או שאילתות חיפוש..."} style={{ width: '100%', padding: '12px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#fff', minHeight: '80px', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }} />
          </div>

          <button onClick={handleDispatch} disabled={isSubmitting} style={{ width: '100%', padding: '16px', backgroundColor: '#38bdf8', color: '#0f172a', border: 'none', borderRadius: '12px', fontWeight: 'bold', fontSize: '16px', cursor: isSubmitting ? 'not-allowed' : 'pointer', opacity: isSubmitting ? 0.7 : 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', transition: 'background-color 0.2s', boxShadow: '0 4px 14px 0 rgba(56, 189, 248, 0.2)' }}>
            {isSubmitting ? (isEn ? 'Allocating...' : 'מקצה...') : (
              <>{SVGIcons.Send} {isEn ? 'Deploy Allocations' : 'הקצה משימות'}</>
            )}
          </button>

        </div>
      </div>
    </div>
  );
};

export default Allocation;