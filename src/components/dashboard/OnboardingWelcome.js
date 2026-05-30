/**
 * @file OnboardingWelcome.js
 * @description Mandatory 2-Step Onboarding Wizard for new operators.
 * Step 1: Technical Software Walkthrough Tutorial video.
 * Step 2: Critical Legal, Security, & Escalation Compliance video + Profile Setup.
 */
import React, { useState } from 'react';
import { supabase } from '../../supabaseClient';

const SVGIcons = {
  Shield: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>,
  Check: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>,
  ArrowRight: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>,
  ArrowLeft: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>,
  Video: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 7a2 2 0 0 0-2-2H3a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2V7z"></path><polyline points="16 5 23 8 23 16 16 19"></polyline></svg>
};

const OnboardingWelcome = ({ currentUserProfile, isEn = true, refreshProfile }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [displayName, setDisplayName] = useState('');
  const [hasConfirmedLegal, setHasConfirmedLegal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const isStep2Valid = displayName.trim().length > 0 && hasConfirmedLegal;

  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    
    if (!isStep2Valid) {
      setError(isEn ? 'Please fill out your display name and check the compliance box.' : 'אנא הזן שם תצוגה וסמן את תיבת האישור.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({ display_name: displayName.trim() })
        .eq('id', currentUserProfile.id);

      if (updateError) throw updateError;

      if (refreshProfile) {
        await refreshProfile();
      }
    } catch (err) {
      console.error('Onboarding update crash:', err);
      setError(isEn ? 'Database synchronization failed. Please retry.' : 'סנכרון הנתונים נכשל. אנא נסה שנית.');
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#020617', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', fontFamily: 'system-ui, -apple-system, sans-serif', direction: isEn ? 'ltr' : 'rtl' }}>
      
      <div style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', maxWidth: '650px', width: '100%', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', overflow: 'hidden' }}>
        
        {/* Step Indicator Badges */}
        <div style={{ display: 'flex', backgroundColor: '#020617', padding: '12px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {isEn ? 'System Orientation Wizard' : 'אשף אוריינטציה מפעיל'}
          </span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold', backgroundColor: currentStep === 1 ? '#38bdf8' : 'rgba(255,255,255,0.05)', color: currentStep === 1 ? '#0f172a' : '#94a3b8', border: currentStep === 1 ? 'none' : '1px solid #334155' }}>
              {isEn ? '1. Software Training' : '1. הדרכת תוכנה'}
            </span>
            <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold', backgroundColor: currentStep === 2 ? '#a855f7' : 'rgba(255,255,255,0.05)', color: currentStep === 2 ? '#fff' : '#94a3b8', border: currentStep === 2 ? 'none' : '1px solid #334155' }}>
              {isEn ? '2. Legal Compliance' : '2. תאימות משפטית'}
            </span>
          </div>
        </div>

        {/* Dynamic Header Switch */}
        <div style={{ padding: '30px 30px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '50px', height: '50px', backgroundColor: currentStep === 1 ? 'rgba(56, 189, 248, 0.1)' : 'rgba(168, 85, 247, 0.1)', borderRadius: '50%', marginBottom: '15px' }}>
            {currentStep === 1 ? SVGIcons.Video : SVGIcons.Shield}
          </div>
          
          {currentStep === 1 ? (
            <>
              <h1 style={{ margin: '0 0 10px 0', color: '#f8fafc', fontSize: '1.6rem' }}>
                {isEn ? 'Step 1: Interface & Queue Tutorial' : 'שלב 1: הדרכת ממשק ותורי עבודה'}
              </h1>
              <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.95rem', lineHeight: '1.5' }}>
                {isEn 
                  ? 'Review this video to understand your daily workspace, how shifts function, and how to verify or escalate inbound system logs.'
                  : 'צפו בסרטון זה כדי להבין את סביבת העבודה, ניהול שעון הנוכחות, וכיצד לאמת או להסלים דיווחים.'}
              </p>
            </>
          ) : (
            <>
              <h1 style={{ margin: '0 0 10px 0', color: '#f8fafc', fontSize: '1.6rem' }}>
                {isEn ? 'Step 2: Legal Boundaries & Security Briefing' : 'שלב 2: גבולות משפטיים ותדרוך אבטחה'}
              </h1>
              <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.95rem', lineHeight: '1.5' }}>
                {isEn 
                  ? 'This section outlines data protection laws, strict non-disclosure terms, objectivity standards, and emergency incident handling protocols.'
                  : 'שלב זה מפרט חוקי הגנת מידע, סודיות מוחלטת, דרישות אובייקטיביות, ונהלי חירום.'}
              </p>
            </>
          )}
        </div>

        {/* Dynamic Video Embed Switch */}
        <div style={{ padding: '0', backgroundColor: '#000', borderBottom: '1px solid rgba(255,255,255,0.05)', position: 'relative', width: '100%', paddingTop: '56.25%' }}>
          {currentStep === 1 ? (
            <iframe 
              src="https://www.loom.com/embed/49254e6a6b0a4d7ea2380df72211fb3c" 
              frameBorder="0" 
              allowFullScreen 
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
              title="CiviWatch Software Guide Tutorial"
            ></iframe>
          ) : (
            <iframe 
              src="https://www.loom.com/embed/YOUR_LEGAL_COMPLIANCE_VIDEO_ID" 
              frameBorder="0" 
              allowFullScreen 
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
              title="CiviWatch Legal & Security Compliance Briefing"
            ></iframe>
          )}
        </div>

        {/* Action Panel */}
        <div style={{ padding: '30px' }}>
          {currentStep === 1 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div style={{ textAlign: 'center', color: '#cbd5e1', fontSize: '0.9rem', backgroundColor: 'rgba(56, 189, 248, 0.03)', border: '1px dashed rgba(56, 189, 248, 0.2)', padding: '12px', borderRadius: '8px' }}>
                {isEn 
                  ? '💡 You must watch this walkthrough completely before moving to the legal protocols.' 
                  : '💡 יש לצפות במדריך הממשק במלואו לפני המעבר לנהלים המשפטיים.'}
              </div>
              <button 
                type="button"
                onClick={() => setCurrentStep(2)}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', width: '100%', backgroundColor: '#38bdf8', color: '#0f172a', border: 'none', padding: '14px', borderRadius: '8px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 14px 0 rgba(56, 189, 248, 0.2)' }}
              >
                {isEn ? 'Continue to Legal Briefing' : 'המשך לתדרוך המשפטי'} {SVGIcons.ArrowRight}
              </button>
            </div>
          ) : (
            <form onSubmit={handleFinalSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Display Name Input */}
              <div>
                <label style={{ display: 'block', color: '#e2e8f0', fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '8px' }}>
                  {isEn ? 'Operator Account Display Name' : 'שם תצוגה מזהה למפעיל'} <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input 
                  type="text" 
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder={isEn ? "Type your formal tracking name..." : "הזן שם זיהוי רשמי לפעילות..."}
                  required
                  style={{ width: '100%', boxSizing: 'border-box', backgroundColor: '#020617', border: '1px solid #334155', color: '#f8fafc', padding: '12px 15px', borderRadius: '8px', fontSize: '1rem', outline: 'none' }}
                />
                <p style={{ margin: '6px 0 0 0', color: '#64748b', fontSize: '0.8rem' }}>
                  {isEn ? '⚠️ Required Field. You cannot bypass onboarding without establishing an active operational name.' : '⚠️ שדה חובה. לא ניתן להתקדם ללא קביעת שם פעילות רשמי במערכת.'}
                </p>
              </div>

              {/* Compliance Acknowledgment Checkbox */}
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer', backgroundColor: hasConfirmedLegal ? 'rgba(16, 185, 129, 0.05)' : 'rgba(30, 41, 59, 0.3)', padding: '15px', borderRadius: '8px', border: `1px solid ${hasConfirmedLegal ? 'rgba(16, 185, 129, 0.3)' : '#334155'}`, transition: 'all 0.2s' }}>
                <div style={{ position: 'relative', width: '20px', height: '20px', marginTop: '2px', flexShrink: 0 }}>
                  <input 
                    type="checkbox" 
                    checked={hasConfirmedLegal}
                    onChange={(e) => setHasConfirmedLegal(e.target.checked)}
                    required
                    style={{ opacity: 0, position: 'absolute', cursor: 'pointer', width: '100%', height: '100%', zIndex: 2 }}
                  />
                  <div style={{ width: '100%', height: '100%', backgroundColor: hasConfirmedLegal ? '#10b981' : '#020617', border: `2px solid ${hasConfirmedLegal ? '#10b981' : '#64748b'}`, borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {hasConfirmedLegal && <span style={{ color: '#fff' }}>{SVGIcons.Check}</span>}
                  </div>
                </div>
                <div style={{ color: hasConfirmedLegal ? '#e2e8f0' : '#94a3b8', fontSize: '0.9rem', lineHeight: '1.4' }}>
                  <strong>{isEn ? 'Legal Attestation:' : 'הצהרה משפטית:'}</strong> {isEn ? 'I confirm I have watched the full legal and data security briefing. I agree to operate strictly inside our data separation frameworks, preserve metadata privacy, and use correct emergency escalation paths.' : 'אני מאשר כי צפיתי בתדרוך המשפטי והאבטחה המלא. אני מתחייב לפעול אך ורק על פי נהלי הגנת המידע והסודיות של הארגון.'} <span style={{ color: '#ef4444' }}>*</span>
                </div>
              </label>

              {error && (
                <div style={{ color: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '10px', borderRadius: '6px', fontSize: '0.85rem', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                  {error}
                </div>
              )}

              {/* Control Action Buttons */}
              <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                <button 
                  type="button"
                  onClick={() => { setCurrentStep(1); setError(''); }}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', backgroundColor: 'transparent', color: '#94a3b8', border: '1px solid #334155', padding: '14px 20px', borderRadius: '8px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  {SVGIcons.ArrowLeft} {isEn ? 'Review UI Training' : 'חזור להדרכת ממשק'}
                </button>
                <button 
                  type="submit" 
                  disabled={!isStep2Valid || isSubmitting}
                  style={{ flex: 1, backgroundColor: isStep2Valid ? '#a855f7' : '#334155', color: isStep2Valid ? '#fff' : '#64748b', border: 'none', padding: '14px', borderRadius: '8px', fontSize: '1rem', fontWeight: 'bold', cursor: isStep2Valid ? (isSubmitting ? 'wait' : 'pointer') : 'not-allowed', transition: 'all 0.2s', boxShadow: isStep2Valid ? '0 4px 14px 0 rgba(168, 85, 247, 0.3)' : 'none' }}
                >
                  {isSubmitting ? (isEn ? 'Synchronizing Profile...' : 'מסנכרן פרופיל...') : (isEn ? 'Initialize Workspace' : 'הפעל סביבת עבודה')}
                </button>
              </div>

            </form>
          )}
        </div>

      </div>
    </div>
  );
};

export default OnboardingWelcome;