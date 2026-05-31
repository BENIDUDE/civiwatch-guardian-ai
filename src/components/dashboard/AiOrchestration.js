/**
 * @file AiOrchestration.js
 * @description Standalone Component for AI Consensus and Model Routing.
 * Manages active verification models and dynamic confidence thresholds for automated triage.
 */
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../supabaseClient';

const Icons = {
  Cpu: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect><rect x="9" y="9" width="6" height="6"></rect><line x1="9" y1="1" x2="9" y2="4"></line><line x1="15" y1="1" x2="15" y2="4"></line><line x1="9" y1="20" x2="9" y2="23"></line><line x1="15" y1="20" x2="15" y2="23"></line><line x1="20" y1="9" x2="23" y2="9"></line><line x1="20" y1="14" x2="23" y2="14"></line><line x1="1" y1="9" x2="4" y2="9"></line><line x1="1" y1="14" x2="4" y2="14"></line></svg>
};

const DEFAULT_AI_SETTINGS = {
  active_models: {
    github_gpt4o: true,
    groq_llama3: true,
    openrouter_llama3: true,
    gemini_15_flash: true
  },
  thresholds: {
    'Antisemitism': 80,
    'Hate Speech': 70,
    'Harassment': 70,
    'Terrorism': 95,
    'Violence / Cruelty': 90,
    'Pornography': 85,
    'Nudity': 85,
    'Fake News': 75,
    'Troll': 70,
    'Other': 70,
    'Default': 70
  }
};

const MODEL_DISPLAY_NAMES = {
  github_gpt4o: 'GitHub Models (GPT-4o-mini)',
  groq_llama3: 'Groq Llama 3 Vision',
  openrouter_llama3: 'OpenRouter Llama 3 Vision',
  gemini_15_flash: 'Google Gemini 1.5 Flash'
};

const AiOrchestration = ({ currentUserProfile, isEn = true, triggerToast }) => {
  const isRtl = !isEn;
  const [aiSettings, setAiSettings] = useState(DEFAULT_AI_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeOrgId, setActiveOrgId] = useState(null);

  const initializeCommandCenter = useCallback(async () => {
    let orgId = currentUserProfile?.organization_id;

    try {
      if (!orgId) {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;
        
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('organization_id')
          .eq('user_id', session.user.id)
          .single();
          
        orgId = profile?.organization_id;
      }

      if (!orgId) {
        setIsLoading(false);
        return;
      }

      setActiveOrgId(orgId);

      const { data: orgData, error } = await supabase
        .from('organizations')
        .select('ai_settings')
        .eq('id', orgId)
        .single();
      
      if (error) throw error;
      
      if (orgData?.ai_settings && Object.keys(orgData.ai_settings).length > 0) {
        setAiSettings({
          active_models: { ...DEFAULT_AI_SETTINGS.active_models, ...orgData.ai_settings.active_models },
          thresholds: { ...DEFAULT_AI_SETTINGS.thresholds, ...orgData.ai_settings.thresholds }
        });
      }
    } catch (error) {
      console.error('Error initializing AI Center:', error);
    } finally {
      setIsLoading(false);
    }
  }, [currentUserProfile]);

  useEffect(() => {
    initializeCommandCenter();
  }, [initializeCommandCenter]);

  const handleModelToggle = (modelKey) => {
    setAiSettings(prev => {
      const currentActiveCount = Object.values(prev.active_models).filter(Boolean).length;
      const isCurrentlyOn = prev.active_models[modelKey];

      if (isCurrentlyOn && currentActiveCount === 1) {
        if (triggerToast) {
          triggerToast(isEn ? 'Critical: At least one AI model must remain active.' : 'שגיאה קריטית: לפחות מודל AI אחד חייב להיות פעיל.', 'error');
        } else {
          alert(isEn ? 'Critical: At least one AI model must remain active.' : 'שגיאה קריטית: לפחות מודל AI אחד חייב להיות פעיל.');
        }
        return prev;
      }

      return {
        ...prev,
        active_models: { ...prev.active_models, [modelKey]: !isCurrentlyOn }
      };
    });
  };

  const handleThresholdChange = (category, value) => {
    let numValue = parseInt(value, 10);
    if (isNaN(numValue)) numValue = 50;
    if (numValue < 50) numValue = 50;
    if (numValue > 99) numValue = 99;

    setAiSettings(prev => ({
      ...prev,
      thresholds: { ...prev.thresholds, [category]: numValue }
    }));
  };

  const saveAiSettings = async () => {
    if (!activeOrgId) return;
    
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('organizations')
        .update({ ai_settings: aiSettings })
        .eq('id', activeOrgId);

      if (error) throw error;
      
      if (triggerToast) {
        triggerToast(isEn ? 'AI Orchestration settings updated.' : 'הגדרות האורקסטרציה של ה-AI עודכנו.', 'success');
      } else {
        alert(isEn ? 'AI Orchestration settings updated.' : 'הגדרות האורקסטרציה של ה-AI עודכנו.');
      }
    } catch (error) {
      console.error('Save AI Settings error:', error);
      if (triggerToast) triggerToast(isEn ? 'Failed to save AI settings.' : 'שגיאה בשמירת הגדרות ה-AI.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const getThresholdColor = (val) => {
    if (val >= 90) return '#ef4444'; 
    if (val >= 80) return '#eab308'; 
    return '#10b981'; 
  };

  if (isLoading) {
    return <div style={{ color: '#a855f7', textAlign: 'center', padding: '40px', fontSize: '1.2rem', fontWeight: 'bold' }}>{isEn ? 'Loading AI Engine Configuration...' : 'טוען הגדרות מנוע AI...'}</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '1200px', animation: 'fadeIn 0.4s ease-out', direction: isRtl ? 'rtl' : 'ltr' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <h2 style={{ color: '#fff', margin: '0 0 5px 0', fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
            {Icons.Cpu} {isEn ? 'AI Consensus Orchestration' : 'אורקסטרציית קונצנזוס AI'}
          </h2>
          <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.95rem', maxWidth: '600px' }}>
            {isEn ? 'Manage active verification models and strictness thresholds for automated triaging.' : 'נהל את מודלי האימות הפעילים וספי החומרה לטריאז׳ אוטומטי.'}
          </p>
        </div>
        <button 
          onClick={saveAiSettings}
          disabled={isSaving}
          style={{ backgroundColor: '#a855f7', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: '8px', fontWeight: 'bold', cursor: isSaving ? 'wait' : 'pointer', opacity: isSaving ? 0.7 : 1, transition: 'all 0.2s', boxShadow: '0 4px 14px 0 rgba(168, 85, 247, 0.3)' }}
        >
          {isSaving ? '...' : (isEn ? 'Save AI Configuration' : 'שמור הגדרות AI')}
        </button>
      </div>

      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        
        {/* PANEL A: MODEL ROUTING */}
        <div style={{ flex: '1 1 350px', backgroundColor: 'rgba(15, 23, 42, 0.6)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', padding: '25px' }}>
          <h3 style={{ color: '#f8fafc', marginTop: 0, marginBottom: '20px', fontSize: '1.1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px', textAlign: isRtl ? 'right' : 'left' }}>
            {isEn ? 'Active Routing Models' : 'מודלי ניתוב פעילים'}
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {Object.entries(MODEL_DISPLAY_NAMES).map(([key, name]) => {
              const isActive = aiSettings.active_models[key];
              return (
                <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#020617', padding: '15px', borderRadius: '12px', border: `1px solid ${isActive ? 'rgba(168, 85, 247, 0.5)' : '#334155'}`, transition: 'all 0.2s' }}>
                  <span style={{ color: isActive ? '#f8fafc' : '#64748b', fontWeight: 'bold', fontSize: '0.9rem' }}>{name}</span>
                  <div 
                    onClick={() => handleModelToggle(key)}
                    style={{ width: '46px', height: '24px', backgroundColor: isActive ? '#a855f7' : '#334155', borderRadius: '12px', position: 'relative', cursor: 'pointer', transition: 'background-color 0.3s' }}
                  >
                    <div style={{ width: '20px', height: '20px', backgroundColor: '#fff', borderRadius: '50%', position: 'absolute', top: '2px', left: isActive ? '24px' : '2px', right: isActive ? '2px' : '24px', transition: 'all 0.3s', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* PANEL B: CONFIDENCE THRESHOLDS */}
        <div style={{ flex: '2 1 500px', backgroundColor: 'rgba(15, 23, 42, 0.6)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', padding: '25px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px', marginBottom: '20px' }}>
            <h3 style={{ color: '#f8fafc', margin: 0, fontSize: '1.1rem' }}>
              {isEn ? 'Dynamic Confidence Thresholds' : 'ספי ביטחון דינמיים'}
            </h3>
            <span style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: 'bold' }}>
              {isEn ? 'Min: 50% | Max: 99%' : 'מינימום: 50% | מקסימום: 99%'}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '15px' }}>
            {Object.keys(DEFAULT_AI_SETTINGS.thresholds).map(category => {
              const val = aiSettings.thresholds[category] || 70;
              const color = getThresholdColor(val);
              
              return (
                <div key={category} style={{ backgroundColor: '#020617', padding: '15px', borderRadius: '12px', border: '1px solid #1e293b' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ color: '#cbd5e1', fontWeight: 'bold', fontSize: '0.85rem' }}>{category}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', direction: 'ltr' }}>
                      <input 
                        type="number" 
                        min="50" max="99" 
                        value={val} 
                        onChange={(e) => handleThresholdChange(category, e.target.value)}
                        style={{ width: '45px', backgroundColor: 'rgba(255,255,255,0.05)', color: color, border: `1px solid ${color}40`, borderRadius: '4px', padding: '4px', textAlign: 'center', fontWeight: 'bold', outline: 'none' }}
                      />
                      <span style={{ color: color, fontWeight: 'bold', fontSize: '0.9rem' }}>%</span>
                    </div>
                  </div>
                  <input 
                    type="range" 
                    min="50" max="99" 
                    value={val} 
                    onChange={(e) => handleThresholdChange(category, e.target.value)}
                    style={{ width: '100%', accentColor: color, cursor: 'pointer', height: '4px', borderRadius: '2px', outline: 'none' }}
                  />
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};

export default AiOrchestration;