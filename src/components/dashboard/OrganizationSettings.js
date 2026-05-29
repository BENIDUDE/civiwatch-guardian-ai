import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../supabaseClient';

const OrganizationSettings = ({ userProfile, isEn, triggerToast }) => {
  const isRtl = !isEn;
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [settings, setSettings] = useState({
    auto_training_enabled: false,
    auto_training_threshold: 3,
    auto_training_increment: 2,
    auto_training_good_behavior_enabled: false,
    auto_training_good_behavior_threshold: 10,
    auto_training_good_behavior_decrement: 5,
    default_sampling_rate: 20
  });

  const fetchOrgSettings = useCallback(async () => {
    if (!userProfile?.organization_id) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('organizations')
        .select('auto_training_enabled, auto_training_threshold, auto_training_increment, auto_training_good_behavior_enabled, auto_training_good_behavior_threshold, auto_training_good_behavior_decrement, default_sampling_rate')
        .eq('id', userProfile.organization_id)
        .single();

      if (error) throw error;
      
      if (data) {
        setSettings({
          auto_training_enabled: data.auto_training_enabled || false,
          auto_training_threshold: data.auto_training_threshold || 3,
          auto_training_increment: data.auto_training_increment || 2,
          auto_training_good_behavior_enabled: data.auto_training_good_behavior_enabled || false,
          auto_training_good_behavior_threshold: data.auto_training_good_behavior_threshold || 10,
          auto_training_good_behavior_decrement: data.auto_training_good_behavior_decrement || 5,
          default_sampling_rate: data.default_sampling_rate || 20
        });
      }
    } catch (error) {
      console.error("Error fetching organization settings:", error);
      triggerToast(isEn ? "Failed to load settings." : "שגיאה בטעינת הגדרות.", "error");
    } finally {
      setIsLoading(false);
    }
  }, [userProfile, isEn, triggerToast]);

  useEffect(() => {
    fetchOrgSettings();
  }, [fetchOrgSettings]);

  const handleChange = (field, value) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!userProfile?.organization_id) return;
    
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('organizations')
        .update(settings)
        .eq('id', userProfile.organization_id);

      if (error) throw error;
      
      triggerToast(isEn ? "Organization settings updated successfully." : "הגדרות הארגון עודכנו בהצלחה.", "success");
    } catch (error) {
      console.error("Error saving settings:", error);
      triggerToast(isEn ? "Failed to save settings." : "שגיאה בשמירת הגדרות.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  // UI Helpers
  const inputBaseStyle = {
    width: '100%', padding: '10px 14px', backgroundColor: '#0f172a',
    border: '1px solid #334155', borderRadius: '8px', color: '#ffffff',
    fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box'
  };

  const labelStyle = { display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#cbd5e1', marginBottom: '8px' };

  const ToggleSwitch = ({ checked, onChange }) => (
    <div onClick={onChange} style={{ width: '44px', height: '24px', backgroundColor: checked ? '#10b981' : '#475569', borderRadius: '24px', position: 'relative', cursor: 'pointer', transition: 'background-color 0.2s', flexShrink: 0 }}>
      <div style={{ width: '18px', height: '18px', backgroundColor: '#ffffff', borderRadius: '50%', position: 'absolute', top: '3px', left: checked ? '23px' : '3px', transition: 'left 0.2s' }}></div>
    </div>
  );

  if (isLoading) {
    return <div style={{ color: '#38bdf8', textAlign: 'center', padding: '40px' }}>{isEn ? 'Loading settings...' : 'טוען הגדרות...'}</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', direction: isRtl ? 'rtl' : 'ltr', animation: 'fadeIn 0.4s ease-out', maxWidth: '800px', width: '100%', margin: '0 auto' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '20px' }}>
        <div>
          <h2 style={{ margin: 0, color: '#fff', fontSize: '1.8rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
            ⚙️ {isEn ? 'Organization Settings' : 'הגדרות ארגון'}
          </h2>
          <p style={{ margin: '5px 0 0 0', color: '#94a3b8', fontSize: '0.95rem' }}>
            {isEn ? 'Manage automated workflows and QA rules for your team.' : 'נהל תהליכי עבודה אוטומטיים וחוקי בקרת איכות לצוות שלך.'}
          </p>
        </div>
      </div>

      {/* Baseline Settings */}
      <div style={{ backgroundColor: 'rgba(22, 27, 34, 0.85)', borderRadius: '16px', border: '1px solid #30363d', padding: '30px' }}>
        <h3 style={{ color: '#ffffff', marginTop: 0, marginBottom: '20px', fontSize: '1.25rem' }}>{isEn ? 'Global Defaults' : 'הגדרות ברירת מחדל'}</h3>
        <div style={{ maxWidth: '300px' }}>
          <label style={labelStyle}>{isEn ? 'Default QA Sampling Rate (%)' : 'אחוז בקרת איכות (ברירת מחדל)'}</label>
          <input 
            type="number" min="0" max="100" 
            value={settings.default_sampling_rate} 
            onChange={(e) => handleChange('default_sampling_rate', parseInt(e.target.value) || 0)}
            style={inputBaseStyle} 
          />
          <p style={{ margin: '8px 0 0 0', fontSize: '0.75rem', color: '#64748b' }}>
            {isEn ? 'The baseline review rate for new operators.' : 'אחוז הבדיקה הבסיסי למפעילים חדשים.'}
          </p>
        </div>
      </div>

      {/* Penalty Engine */}
      <div style={{ backgroundColor: 'rgba(22, 27, 34, 0.85)', borderRadius: '16px', border: settings.auto_training_enabled ? '1px solid #ef4444' : '1px solid #30363d', padding: '30px', transition: 'border-color 0.3s' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h3 style={{ color: '#ffffff', margin: 0, fontSize: '1.25rem' }}>{isEn ? 'Penalty Engine (The Stick)' : 'מנגנון למידה (אכיפה)'}</h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#94a3b8' }}>
              {isEn ? 'Automatically increase QA rates when operators make consecutive errors.' : 'העלאה אוטומטית של אחוז הבקרה כאשר מפעיל מבצע שגיאות רצופות.'}
            </p>
          </div>
          <ToggleSwitch checked={settings.auto_training_enabled} onChange={() => handleChange('auto_training_enabled', !settings.auto_training_enabled)} />
        </div>

        {settings.auto_training_enabled && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px', padding: '20px', backgroundColor: 'rgba(15, 23, 42, 0.5)', borderRadius: '12px' }}>
            <div>
              <label style={labelStyle}>{isEn ? 'Errors Threshold' : 'סף שגיאות רצופות'}</label>
              <input 
                type="number" min="1" 
                value={settings.auto_training_threshold} 
                onChange={(e) => handleChange('auto_training_threshold', parseInt(e.target.value) || 1)}
                style={inputBaseStyle} 
              />
            </div>
            <div>
              <label style={labelStyle}>{isEn ? 'QA Rate Increment (%)' : 'תוספת לאחוז הבקרה (%)'}</label>
              <input 
                type="number" min="1" max="100" 
                value={settings.auto_training_increment} 
                onChange={(e) => handleChange('auto_training_increment', parseInt(e.target.value) || 1)}
                style={inputBaseStyle} 
              />
            </div>
          </div>
        )}
      </div>

      {/* Reward Engine */}
      <div style={{ backgroundColor: 'rgba(22, 27, 34, 0.85)', borderRadius: '16px', border: settings.auto_training_good_behavior_enabled ? '1px solid #10b981' : '1px solid #30363d', padding: '30px', transition: 'border-color 0.3s' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h3 style={{ color: '#ffffff', margin: 0, fontSize: '1.25rem' }}>{isEn ? 'Reward Engine (The Carrot)' : 'מנגנון תגמול (הטבה)'}</h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#94a3b8' }}>
              {isEn ? 'Automatically reduce QA rates when operators maintain high accuracy.' : 'הפחתה אוטומטית של אחוז הבקרה כאשר מפעיל שומר על רמת דיוק גבוהה.'}
            </p>
          </div>
          <ToggleSwitch checked={settings.auto_training_good_behavior_enabled} onChange={() => handleChange('auto_training_good_behavior_enabled', !settings.auto_training_good_behavior_enabled)} />
        </div>

        {settings.auto_training_good_behavior_enabled && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px', padding: '20px', backgroundColor: 'rgba(15, 23, 42, 0.5)', borderRadius: '12px' }}>
            <div>
              <label style={labelStyle}>{isEn ? 'Success Threshold' : 'סף הצלחות רצופות'}</label>
              <input 
                type="number" min="1" 
                value={settings.auto_training_good_behavior_threshold} 
                onChange={(e) => handleChange('auto_training_good_behavior_threshold', parseInt(e.target.value) || 1)}
                style={inputBaseStyle} 
              />
            </div>
            <div>
              <label style={labelStyle}>{isEn ? 'QA Rate Decrement (%)' : 'הפחתה באחוז הבקרה (%)'}</label>
              <input 
                type="number" min="1" max="100" 
                value={settings.auto_training_good_behavior_decrement} 
                onChange={(e) => handleChange('auto_training_good_behavior_decrement', parseInt(e.target.value) || 1)}
                style={inputBaseStyle} 
              />
            </div>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
        <button 
          onClick={handleSave} 
          disabled={isSaving}
          style={{ backgroundColor: '#1f6feb', color: '#ffffff', fontWeight: 'bold', padding: '12px 30px', borderRadius: '8px', border: 'none', cursor: isSaving ? 'not-allowed' : 'pointer', opacity: isSaving ? 0.7 : 1, transition: 'background-color 0.2s' }}
          onMouseOver={(e) => { if (!isSaving) e.target.style.backgroundColor = '#388bfd'; }}
          onMouseOut={(e) => { if (!isSaving) e.target.style.backgroundColor = '#1f6feb'; }}
        >
          {isSaving ? (isEn ? 'Saving...' : 'שומר...') : (isEn ? 'Save Configurations' : 'שמור הגדרות')}
        </button>
      </div>

    </div>
  );
};

export default OrganizationSettings;