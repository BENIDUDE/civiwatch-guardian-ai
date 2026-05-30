/**
 * @file AiOrchestration.js
 * @description Standalone Command Center for AI Consensus and Model Routing.
 * Manages which models are active and the dynamic confidence thresholds for automated triage.
 */
import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { useNavigate } from 'react-router-dom';

const Icons = {
  Cpu: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect><rect x="9" y="9" width="6" height="6"></rect><line x1="9" y1="1" x2="9" y2="4"></line><line x1="15" y1="1" x2="15" y2="4"></line><line x1="9" y1="20" x2="9" y2="23"></line><line x1="15" y1="20" x2="15" y2="23"></line><line x1="20" y1="9" x2="23" y2="9"></line><line x1="20" y1="14" x2="23" y2="14"></line><line x1="1" y1="9" x2="4" y2="9"></line><line x1="1" y1="14" x2="4" y2="14"></line></svg>,
  ArrowLeft: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
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
  const navigate = useNavigate();
  const isRtl = !isEn;
  const [aiSettings, setAiSettings] = useState(DEFAULT_AI_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeOrgId, setActiveOrgId] = useState(null);

  // Self-Authenticating Fetch: Grabs profile from session if prop is missing
  useEffect(() => {
    const initializeCommandCenter = async () => {
      let orgId = currentUserProfile?.organization_id;

      try {
        // If App.js didn't pass the profile, fetch it securely from Supabase
        if (!orgId) {
          const { data: { session } } = await supabase.auth.getSession();
          if (!session) {
            navigate('/login');
            return;
          }
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

        // Fetch AI Settings for this organization
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
    };

    initializeCommandCenter();
  }, [currentUserProfile, navigate]);

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
    return <div style={{ minHeight: '100vh', backgroundColor: '#020617', color: '#a855f7', textAlign: 'center', paddingTop: '150px', fontSize: '1.2rem', fontWeight: 'bold' }}>Loading Orchestration Engine...</div>;
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#020617', padding: '40px 20px', color: '#f8fafc', fontFamily: 'system-ui, sans-serif', direction: isRtl ? 'rtl' : 'ltr' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', animation: 'fadeIn 0.4s ease-out' }}>
        
        {/* HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px', marginBottom: '40px' }}>
          <div>
            <button onClick={() => navigate('/dashboard')} style={{ background: 'transparent', border: 'none', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: 0, marginBottom: '15px', fontWeight: 'bold' }}>
              <span style={{ transform: isRtl ? 'rotate(180deg)' : 'none', display: 'inline-block' }}>{Icons.ArrowLeft}</span> 
              {isEn ? 'Back to Dashboard' : 'חזור ללוח הבקרה'}
            </button>
            <h1 style={{ margin: '0 0 10px 0', fontSize: '2.5rem', display: 'flex', alignItems: 'center', gap: '15px' }}>
              <span style={{ color: '#a855f7' }}>{Icons.Cpu}</span> {isEn ? 'AI Consensus Orchestrator' : 'ניהול קונצנזוס AI'}
            </h1>
            <p style={{ color: '#94a3b8', margin: 0, fontSize: '1.1rem', maxWidth: '600px' }}>
              {isEn ? 'Global command layer for routing verification models and setting algorithmic strictness thresholds.' : 'שכבת פיקוד גלובלית לניתוב מודלי אימות וקביעת ספי חומרה אלגוריתמיים.'}
            </p>
          </div>
          
          <button 
            onClick={saveAiSettings}
            disabled={isSaving}
            style={{ backgroundColor: '#a855f7', color: '#fff', border: 'none', padding: '14px 28px', borderRadius: '8px', fontWeight: 'bold', fontSize: '1.1rem', cursor: isSaving ? 'wait' : 'pointer', opacity: isSaving ? 0.7 : 1, transition: 'all 0.2s', boxShadow: '0 4px 20px 0 rgba(168, 85, 247, 0.4)' }}
          >
            {isSaving ? '...' : (isEn ? 'Deploy Configuration' : 'פרוס הגדרות מערכת')}
          </button>
        </div>

        {/* PANELS CONTAINER */}
        <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
          
          {/* PANEL A: MODEL ROUTING */}
          <div style={{ flex: '1 1 400px', backgroundColor: 'rgba(15, 23, 42, 0.8)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', padding: '30px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
            <h3 style={{ color: '#f8fafc', marginTop: 0, marginBottom: '25px', fontSize: '1.25rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '15px', textAlign: isRtl ? 'right' : 'left' }}>
              {isEn ? 'Active Routing Models' : 'מודלי ניתוב פעילים'}
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {Object.entries(MODEL_DISPLAY_NAMES).map(([key, name]) => {
                const isActive = aiSettings.active_models[key];
                return (
                  <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#0f172a', padding: '20px', borderRadius: '12px', border: `1px solid ${isActive ? 'rgba(168, 85, 247, 0.5)' : '#334155'}`, transition: 'all 0.2s' }}>
                    <span style={{ color: isActive ? '#f8fafc' : '#64748b', fontWeight: 'bold', fontSize: '1rem' }}>{name}</span>
                    <div 
                      onClick={() => handleModelToggle(key)}
                      style={{ width: '50px', height: '26px', backgroundColor: isActive ? '#a855f7' : '#334155', borderRadius: '13px', position: 'relative', cursor: 'pointer', transition: 'background-color 0.3s' }}
                    >
                      <div style={{ width: '22px', height: '22px', backgroundColor: '#fff', borderRadius: '50%', position: 'absolute', top: '2px', left: isActive ? '26px' : '2px', right: isActive ? '2px' : '26px', transition: 'all 0.3s', boxShadow: '0 2px 4px rgba(0,0,0,0.3)' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* PANEL B: CONFIDENCE THRESHOLDS */}
          <div style={{ flex: '2 1 600px', backgroundColor: 'rgba(15, 23, 42, 0.8)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', padding: '30px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '15px', marginBottom: '25px' }}>
              <h3 style={{ color: '#f8fafc', margin: 0, fontSize: '1.25rem' }}>
                {isEn ? 'Dynamic Confidence Thresholds' : 'ספי ביטחון דינמיים'}
              </h3>
              <span style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 'bold', backgroundColor: '#0f172a', padding: '4px 12px', borderRadius: '20px', border: '1px solid #334155' }}>
                {isEn ? 'Min: 50% | Max: 99%' : 'מינימום: 50% | מקסימום: 99%'}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
              {Object.keys(DEFAULT_AI_SETTINGS.thresholds).map(category => {
                const val = aiSettings.thresholds[category] || 70;
                const color = getThresholdColor(val);
                
                return (
                  <div key={category} style={{ backgroundColor: '#0f172a', padding: '20px', borderRadius: '12px', border: '1px solid #1e293b' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                      <span style={{ color: '#cbd5e1', fontWeight: 'bold', fontSize: '1rem' }}>{category}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', direction: 'ltr' }}>
                        <input 
                          type="number" 
                          min="50" max="99" 
                          value={val} 
                          onChange={(e) => handleThresholdChange(category, e.target.value)}
                          style={{ width: '55px', backgroundColor: 'rgba(255,255,255,0.05)', color: color, border: `1px solid ${color}40`, borderRadius: '6px', padding: '6px', textAlign: 'center', fontWeight: 'bold', fontSize: '1rem', outline: 'none' }}
                        />
                        <span style={{ color: color, fontWeight: 'bold', fontSize: '1rem' }}>%</span>
                      </div>
                    </div>
                    <input 
                      type="range" 
                      min="50" max="99" 
                      value={val} 
                      onChange={(e) => handleThresholdChange(category, e.target.value)}
                      style={{ width: '100%', accentColor: color, cursor: 'pointer', height: '6px', borderRadius: '3px', outline: 'none' }}
                    />
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AiOrchestration;