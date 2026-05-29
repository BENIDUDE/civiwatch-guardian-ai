/**
 * @file DynamicQAConfig.js
 * @description Control panel for the Dynamic Quality Assurance engine.
 * Allows managers to set automated promotion/demotion thresholds for operator sampling rates.
 */

import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';

const inputStyle = { backgroundColor: '#020617', border: '1px solid #334155', color: '#f8fafc', padding: '10px 14px', borderRadius: '8px', fontSize: '0.9rem', outline: 'none', width: '100%', boxSizing: 'border-box' };
const labelStyle = { display: 'block', marginBottom: '8px', color: '#94a3b8', fontSize: '13px', fontWeight: 'bold' };

const DynamicQAConfig = ({ organizationId, isEn, triggerToast }) => {
  const [config, setConfig] = useState({
    auto_training_enabled: false,
    auto_training_threshold: 50, // Successes needed
    auto_training_increment: 10  // % to drop/raise
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!organizationId) return;

    const fetchConfig = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('organizations')
        .select('auto_training_enabled, auto_training_threshold, auto_training_increment, sampling_strategy')
        .eq('id', organizationId)
        .single();

      if (!error && data) {
        setConfig({
          auto_training_enabled: data.auto_training_enabled || false,
          auto_training_threshold: data.auto_training_threshold || 50,
          auto_training_increment: data.auto_training_increment || 10
        });
      }
      setLoading(false);
    };

    fetchConfig();
  }, [organizationId]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('organizations')
        .update({
          auto_training_enabled: config.auto_training_enabled,
          auto_training_threshold: parseInt(config.auto_training_threshold, 10),
          auto_training_increment: parseInt(config.auto_training_increment, 10),
          sampling_strategy: config.auto_training_enabled ? 'operator' : 'organization' // Force operator strategy if enabled
        })
        .eq('id', organizationId);

      if (error) throw error;
      triggerToast(isEn ? 'Dynamic QA rules updated.' : 'חוקי בקרת איכות דינמית עודכנו.', 'success');
    } catch (err) {
      console.error(err);
      triggerToast(isEn ? 'Failed to save rules.' : 'שגיאה בשמירת החוקים.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ color: '#64748b' }}>{isEn ? 'Loading engine...' : 'טוען מנוע...'}</div>;

  return (
    <div style={{ backgroundColor: 'rgba(30, 41, 59, 0.4)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', padding: '25px', direction: isEn ? 'ltr' : 'rtl' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '20px' }}>
        <div>
          <h3 style={{ margin: '0 0 5px 0', color: '#fff', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: config.auto_training_enabled ? '#10b981' : '#64748b' }}>⚡</span> 
            {isEn ? 'Dynamic QA Engine' : 'מנוע בקרת איכות דינמית'}
          </h3>
          <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.85rem' }}>
            {isEn ? 'Automatically adjust manual review rates based on operator accuracy.' : 'התאם אוטומטית את אחוזי הבקרה הידנית על סמך דיוק המפעיל.'}
          </p>
        </div>
        
        <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '10px' }}>
          <span style={{ color: config.auto_training_enabled ? '#10b981' : '#64748b', fontWeight: 'bold' }}>
            {config.auto_training_enabled ? (isEn ? 'ENGINE ON' : 'מנוע פעיל') : (isEn ? 'ENGINE OFF' : 'מנוע כבוי')}
          </span>
          <input 
            type="checkbox" 
            checked={config.auto_training_enabled} 
            onChange={(e) => setConfig({ ...config, auto_training_enabled: e.target.checked })} 
            style={{ width: '24px', height: '24px', accentColor: '#10b981', cursor: 'pointer' }} 
          />
        </label>
      </div>

      {config.auto_training_enabled && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', animation: 'fadeIn 0.3s ease' }}>
          
          <div style={{ backgroundColor: '#0f172a', padding: '15px', borderRadius: '12px', border: '1px solid #1e293b' }}>
            <label style={labelStyle}>{isEn ? 'Consecutive Successes Needed' : 'רצף הצלחות נדרש'}</label>
            <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '0 0 10px 0' }}>{isEn ? 'Perfect reports before a promotion.' : 'דיווחים ללא דופי לפני קידום.'}</p>
            <input 
              type="number" min="1" 
              value={config.auto_training_threshold} 
              onChange={(e) => setConfig({ ...config, auto_training_threshold: e.target.value })} 
              style={inputStyle} 
            />
          </div>

          <div style={{ backgroundColor: '#0f172a', padding: '15px', borderRadius: '12px', border: '1px solid #1e293b' }}>
            <label style={labelStyle}>{isEn ? 'Adjustment Rate (%)' : 'שיעור התאמה (%)'}</label>
            <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '0 0 10px 0' }}>{isEn ? 'How much the QA rate drops/rises.' : 'בכמה יורד/עולה אחוז הבקרה.'}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <input 
                type="number" min="1" max="100" 
                value={config.auto_training_increment} 
                onChange={(e) => setConfig({ ...config, auto_training_increment: e.target.value })} 
                style={inputStyle} 
              />
            </div>
          </div>
        </div>
      )}

      <div style={{ marginTop: '25px', textAlign: isEn ? 'right' : 'left' }}>
        <button 
          onClick={handleSave} 
          disabled={saving}
          style={{ backgroundColor: '#38bdf8', color: '#0f172a', border: 'none', padding: '10px 24px', borderRadius: '8px', fontWeight: 'bold', cursor: saving ? 'wait' : 'pointer', opacity: saving ? 0.7 : 1 }}
        >
          {saving ? (isEn ? 'Saving Engine Rules...' : 'שומר חוקי מנוע...') : (isEn ? 'Save Engine Rules' : 'שמור חוקי מנוע')}
        </button>
      </div>

    </div>
  );
};

export default DynamicQAConfig;