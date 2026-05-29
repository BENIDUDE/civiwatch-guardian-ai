import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

const Login = ({ lang }) => {
  const isEn = lang === 'EN';
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          // Force Google to show the account picker every time
          queryParams: {
            prompt: 'select_account'
          },
          // Force Supabase to redirect directly to the dashboard
          redirectTo: window.location.origin
        }
      });
      if (error) throw error;
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  // REORDERED: NGOs first, and rows swapped as requested
  const topRow = [
    { label: isEn ? 'NGOs' : 'עמותות', icon: '🤝' },
    { label: isEn ? 'Governments' : 'ממשלות', icon: '🏛️' },
    { label: isEn ? 'Social Networks' : 'רשתות חברתיות', icon: '🌐' }
  ];

  const bottomRow = [
    { label: isEn ? 'AI Marketplaces' : 'זירות מסחר AI', icon: '🤖' },
    { label: isEn ? 'Virtual Reality' : 'מציאות מדומה', icon: '🥽' },
    { label: isEn ? 'Generative AI' : 'AI יוצר', icon: '✨' }
  ];

  return (
    <div style={{ 
      display: 'flex', 
      minHeight: '100vh', 
      width: '100vw', 
      backgroundColor: 'transparent',
      direction: isEn ? 'ltr' : 'rtl',
      overflow: 'hidden'
    }}>
      
      {/* LEFT SIDE: Expanded Brand & Solutions (75%) */}
      <div style={{ 
        flex: 3, 
        display: window.innerWidth < 1024 ? 'none' : 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center', 
        padding: '80px 100px',
        position: 'relative',
        zIndex: 10
      }}>
        <div style={{ maxWidth: '850px' }}>
          <div style={{ 
            display: 'inline-flex', 
            padding: '8px 16px', 
            borderRadius: '30px', 
            backgroundColor: 'rgba(56, 189, 248, 0.1)', 
            border: '1px solid rgba(56, 189, 248, 0.2)',
            color: '#38bdf8',
            fontSize: '12px',
            fontWeight: 'bold',
            marginBottom: '30px',
            textTransform: 'uppercase',
            letterSpacing: '1.5px'
          }}>
            {isEn ? 'Global Intelligence Network' : 'רשת מודיעין גלובלית'}
          </div>
          
          <h1 style={{ 
            fontSize: '72px', 
            fontWeight: '800', 
            lineHeight: '1.1', 
            margin: '0 0 24px 0', 
            color: '#fff' 
          }}>
            {isEn ? 'Protecting the ' : 'מגינים על ה-'}
            <span style={{ 
              background: 'linear-gradient(to right, #38bdf8, #818cf8)', 
              WebkitBackgroundClip: 'text', 
              WebkitTextFillColor: 'transparent' 
            }}>
              {isEn ? 'Digital Frontier' : 'חזית הדיגיטלית'}
            </span>
          </h1>
          
          <p style={{ 
            fontSize: '22px', 
            color: '#94a3b8', 
            lineHeight: '1.6', 
            margin: '0 0 50px 0',
            maxWidth: '650px'
          }}>
            {isEn 
              ? 'Unified threat detection and response across the entire technological landscape' 
              : 'זיהוי איומים ותגובה אחודה בכל רוחב הנוף הטכנולוגי'}
          </p>

          {/* Reordered Solution Grid */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxWidth: '750px' }}>
            {/* Top Row: Core Sectors */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' }}>
              {topRow.map((tag, i) => (
                <div key={i} style={solutionCardStyle}>
                  <span style={{ fontSize: '20px' }}>{tag.icon}</span>
                  <span style={{ color: '#fff', fontSize: '14px', fontWeight: '600' }}>{tag.label}</span>
                </div>
              ))}
            </div>

            {/* Bottom Row: Advanced Tech */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' }}>
              {bottomRow.map((tag, i) => (
                <div key={i} style={solutionCardStyle}>
                  <span style={{ fontSize: '20px' }}>{tag.icon}</span>
                  <span style={{ color: '#fff', fontSize: '14px', fontWeight: '600' }}>{tag.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: Compact Secure Portal (25%) */}
      <div style={{ 
        flex: 1, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        padding: '40px',
        backgroundColor: 'rgba(10, 15, 25, 0.85)', 
        backdropFilter: 'blur(30px)',
        borderLeft: isEn ? '1px solid rgba(255,255,255,0.08)' : 'none',
        borderRight: !isEn ? '1px solid rgba(255,255,255,0.08)' : 'none',
        position: 'relative',
        zIndex: 20
      }}>
        <div style={{ maxWidth: '300px', width: '100%', textAlign: 'center' }}>
          
          <div style={{ marginBottom: '40px' }}>
            <div style={logoContainerStyle}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="28" height="28">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              </svg>
            </div>
            <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#fff', margin: '0 0 8px 0' }}>
              {isEn ? 'Secure Gateway' : 'כניסה מאובטחת'}
            </h2>
            <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>
              {isEn ? 'Authenticate to access portal' : 'אנא הזדהה כדי להיכנס'}
            </p>
          </div>

          {error && <div style={errorStyle}>{error}</div>}

          <button 
            onClick={handleGoogleLogin}
            disabled={loading}
            style={loginButtonStyle(loading)}
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            {loading ? (isEn ? 'Verifying...' : 'מאמת...') : (isEn ? 'Continue with Google' : 'המשך עם גוגל')}
          </button>

          <div style={{ marginTop: '50px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
               <span style={{ fontSize: '10px', color: '#334155', fontWeight: 'bold', letterSpacing: '1px' }}>v2.4.0-STABLE</span>
               <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                  <span style={{ fontSize: '10px', color: '#475569', fontWeight: '600' }}>SSL SECURE</span>
               </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

const solutionCardStyle = {
  padding: '15px',
  borderRadius: '12px',
  backgroundColor: 'rgba(255, 255, 255, 0.03)',
  border: '1px solid rgba(255, 255, 255, 0.06)',
  display: 'flex',
  alignItems: 'center',
  gap: '12px'
};

const logoContainerStyle = {
  display: 'inline-flex',
  width: '56px',
  height: '56px',
  backgroundColor: 'rgba(56, 189, 248, 0.05)',
  borderRadius: '14px',
  marginBottom: '20px',
  alignItems: 'center',
  justifyContent: 'center',
  border: '1px solid rgba(56, 189, 248, 0.2)'
};

const loginButtonStyle = (loading) => ({
  width: '100%',
  backgroundColor: '#ffffff',
  color: '#0f172a',
  fontWeight: 'bold',
  padding: '14px',
  borderRadius: '12px',
  fontSize: '15px',
  border: 'none',
  cursor: loading ? 'not-allowed' : 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '10px',
  opacity: loading ? 0.7 : 1,
  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
});

const errorStyle = {
  backgroundColor: 'rgba(239, 68, 68, 0.1)',
  border: '1px solid rgba(239, 68, 68, 0.3)',
  color: '#ef4444',
  padding: '10px',
  borderRadius: '10px',
  marginBottom: '20px',
  fontSize: '13px'
};

export default Login;