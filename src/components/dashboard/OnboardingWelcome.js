/**
 * @file OnboardingWelcome.js
 * @description Forced onboarding screen for new operators.
 * Ensures users set their display name and explicitly confirm they have watched the training SOPs before accessing the dashboard.
 */
import React, { useState } from 'react';
import { supabase } from '../../supabaseClient';
import { useNavigate } from 'react-router-dom'; // Adjust if you use a different router

const SVGIcons = {
  Shield: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>,
  Check: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
};

const OnboardingWelcome = ({ currentUserProfile, isEn = true, refreshProfile }) => {
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState('');
  const [hasWatched, setHasWatched] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // The button is only enabled if BOTH fields are completed
  const isFormValid = displayName.trim().length > 0 && hasWatched;

  const handleInitialize = async (e) => {
    e.preventDefault();
    
    if (!isFormValid) {
      setError(isEn ? 'Please complete all required fields.' : 'אנא השלם את כל שדות החובה.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // Update the user's profile in Supabase
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({ display_name: displayName.trim() })
        .eq('id', currentUserProfile.id);

      if (updateError) throw updateError;

      // Refresh the global profile state so the app knows they have a name
      if (refreshProfile) {
        await refreshProfile();
      }

      // Route them into the main dashboard
      navigate('/dashboard');

    } catch (err) {
      console.error('Initialization Error:', err);
      setError(isEn ? 'Failed to save profile. Please try again.' : 'שגיאה בשמירת הפרופיל. אנא נסה שוב.');
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#020617', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', fontFamily: 'system-ui, -apple-system, sans-serif', direction: isEn ? 'ltr' : 'rtl' }}>
      
      <div style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', maxWidth: '650px', width: '100%', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', overflow: 'hidden', animation: 'fadeIn 0.5s ease-out' }}>
        
        {/* Header Section */}
        <div style={{ padding: '30px 30px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '50px', height: '50px', backgroundColor: 'rgba(56, 189, 248, 0.1)', borderRadius: '50%', marginBottom: '15px' }}>
            {SVGIcons.Shield}
          </div>
          <h1 style={{ margin: '0 0 10px 0', color: '#f8fafc', fontSize: '1.75rem' }}>
            {isEn ? 'Welcome to the Command Center' : 'ברוכים הבאים למרכז הבקרה'}
          </h1>
          <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.95rem', lineHeight: '1.5' }}>
            {isEn 
              ? 'You are now part of the CiviWatch Guardian human-in-the-loop workforce. Please review your operational briefing to initialize your workspace.'
              : 'אתם כעת חלק ממערך הבקרה האנושי של CiviWatch. אנא צפו בתדריך המבצעי כדי לאתחל את סביבת העבודה שלכם.'}
          </p>
        </div>

        {/* Video Embed Section */}
        <div style={{ padding: '0', backgroundColor: '#000', borderBottom: '1px solid rgba(255,255,255,0.05)', position: 'relative', width: '100%', paddingTop: '56.25%' /* 16:9 Aspect Ratio */ }}>
          {/* REPLACE THIS IFRAME SRC WITH YOUR LOOM SHARE LINK */}
          <iframe 
            src="https://www.loom.com/embed/YOUR_VIDEO_ID_HERE" 
            frameBorder="0" 
            allowFullScreen 
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
            title="Operator Briefing Video"
          ></iframe>
        </div>

        {/* Form Section */}
        <div style={{ padding: '30px' }}>
          <form onSubmit={handleInitialize} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Display Name Input */}
            <div>
              <label style={{ display: 'block', color: '#e2e8f0', fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '8px' }}>
                {isEn ? 'Operator Display Name' : 'שם תצוגה מפעיל'} <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input 
                type="text" 
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder={isEn ? "e.g., John S. (Operator)" : "לדוגמה: ישראל י. (מפעיל)"}
                required
                style={{ width: '100%', boxSizing: 'border-box', backgroundColor: '#020617', border: '1px solid #334155', color: '#f8fafc', padding: '12px 15px', borderRadius: '8px', fontSize: '1rem', outline: 'none', transition: 'border-color 0.2s' }}
                onFocus={(e) => e.target.style.borderColor = '#38bdf8'}
                onBlur={(e) => e.target.style.borderColor = '#334155'}
              />
              <p style={{ margin: '6px 0 0 0', color: '#64748b', fontSize: '0.8rem' }}>
                {isEn ? 'This name will be attached to your system logs and QA history.' : 'שם זה יופיע ברשומות המערכת ובהיסטוריית בקרת האיכות שלך.'}
              </p>
            </div>

            {/* Compliance Checkbox */}
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer', backgroundColor: hasWatched ? 'rgba(16, 185, 129, 0.05)' : 'rgba(30, 41, 59, 0.5)', padding: '15px', borderRadius: '8px', border: `1px solid ${hasWatched ? 'rgba(16, 185, 129, 0.3)' : '#334155'}`, transition: 'all 0.2s' }}>
              <div style={{ position: 'relative', width: '20px', height: '20px', marginTop: '2px', flexShrink: 0 }}>
                <input 
                  type="checkbox" 
                  checked={hasWatched}
                  onChange={(e) => setHasWatched(e.target.checked)}
                  required
                  style={{ opacity: 0, position: 'absolute', cursor: 'pointer', width: '100%', height: '100%', zIndex: 2 }}
                />
                <div style={{ width: '100%', height: '100%', backgroundColor: hasWatched ? '#10b981' : '#020617', border: `2px solid ${hasWatched ? '#10b981' : '#64748b'}`, borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
                  {hasWatched && <span style={{ color: '#fff' }}>{SVGIcons.Check}</span>}
                </div>
              </div>
              <div style={{ color: hasWatched ? '#e2e8f0' : '#94a3b8', fontSize: '0.9rem', lineHeight: '1.4' }}>
                <strong>{isEn ? 'I confirm' : 'אני מאשר'}</strong> {isEn ? 'that I have watched the operational briefing and understand my responsibilities regarding data privacy and strict SOP adherence.' : 'שצפיתי בתדריך המבצעי ואני מבין את אחריותי בנוגע לפרטיות מידע והיצמדות להוראות ההפעלה (SOP).'} <span style={{ color: '#ef4444' }}>*</span>
              </div>
            </label>

            {/* Error Message */}
            {error && (
              <div style={{ color: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '10px', borderRadius: '6px', fontSize: '0.85rem', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button 
              type="submit" 
              disabled={!isFormValid || isSubmitting}
              style={{ 
                marginTop: '10px',
                width: '100%', 
                backgroundColor: isFormValid ? '#38bdf8' : '#334155', 
                color: isFormValid ? '#0f172a' : '#94a3b8', 
                border: 'none', 
                padding: '14px', 
                borderRadius: '8px', 
                fontSize: '1.05rem', 
                fontWeight: 'bold', 
                cursor: isFormValid ? (isSubmitting ? 'wait' : 'pointer') : 'not-allowed', 
                transition: 'all 0.2s',
                boxShadow: isFormValid ? '0 4px 14px 0 rgba(56, 189, 248, 0.39)' : 'none'
              }}
            >
              {isSubmitting 
                ? (isEn ? 'Initializing Workspace...' : 'מאתחל סביבת עבודה...') 
                : (isEn ? 'Initialize Workspace' : 'היכנס למרכז הבקרה')
              }
            </button>
            
          </form>
        </div>

      </div>
    </div>
  );
};

export default OnboardingWelcome;