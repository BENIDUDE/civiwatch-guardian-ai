/**
 * @file App.js
 * @description The Root Application Component & Global Router.
 * This file serves as the main entry point for the CiviWatch Guardian AI platform.
 * It manages global state (Localization, Accessibility), structural layout (Navbar, Footer, 
 * Animated Background), and the primary React Router configuration.
 * * --- SECURITY & ROUTE PROTECTION ---
 * Features two critical high-order components (HOCs) for securing the platform:
 * 1. ProtectedRoute: Wraps the /dashboard route. Intercepts the navigation, verifies 
 * the Supabase session, checks the user's assigned organization status, and actively 
 * kicks out (logs out) users if their parent organization has been suspended by Global Command.
 * 2. SuperAdminRoute: Wraps highly sensitive pages (like the AI Simulator). Intercepts 
 * the navigation and does a real-time database lookup to ensure the user possesses the 
 * 'global admin' role. If they do not, it silently redirects them back to the standard dashboard.
 * * --- ACCESSIBILITY (A11Y) CORE ---
 * Contains the global accessibility state (accState) and dynamically injects a <style> 
 * block into the DOM to enforce high contrast, legible fonts, large text, and animation pausing 
 * across the entire application instantly without requiring a page reload.
 */
import React, { useState, useEffect, useRef } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { Navbar, Footer } from './components';
import { supabase } from './supabaseClient';
import Home from './pages/Home';
import ComingSoon from './pages/ComingSoon';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Company from './pages/Company';
import MarketStrategy from './pages/MarketStrategy';
import Partners from './pages/Partners';
import Contact from './pages/Contact';
import HumanInTheLoop from './pages/HumanInTheLoop';
import Governments from './pages/Governments';
import SocialNetworks from './pages/SocialNetworks';
import Ngos from './pages/Ngos';
import Marketplace from './pages/Marketplace';
import GenerativeAI from './pages/GenerativeAI';
import VirtualReality from './pages/VirtualReality';
import AccessibilityStatement from './pages/AccessibilityStatement';
import CiviWatchFAQ from './pages/CiviWatchFAQ';

import CouncilSimulatorDoc from './components/admin/CouncilSimulatorDoc';
import Pricing from './pages/Pricing'; 
import AiOrchestration from './components/dashboard/AiOrchestration'; // <-- NEW IMPORT

// --- ROUTE PROTECTION: GLOBAL ADMIN ONLY ---
const SuperAdminRoute = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const verifyAccess = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate('/login');
        return;
      }

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('user_id', session.user.id)
        .single();

      const safeRole = profile?.role?.toLowerCase()?.trim() || '';
      
      // Cleaned up legacy roles: Only Global Admin passes now
      const isSuperUser = safeRole === 'global admin';

      if (isSuperUser) {
        setIsAuthorized(true);
      } else {
        navigate('/dashboard'); 
      }
      setLoading(false);
    };

    verifyAccess();
  }, [navigate]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', color: '#fff' }}>
        <h2>Verifying Secure Access...</h2>
      </div>
    );
  }

  return isAuthorized ? children : null;
};

// --- ROUTE PROTECTION: SUSPENDED ORGANIZATION CHECK ---
const ProtectedRoute = ({ children }) => {
  const [isAuthorized, setIsAuthorized] = useState(null); 
  const navigate = useNavigate();

  useEffect(() => {
    const checkAccess = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setIsAuthorized(false);
        return;
      }

      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select(`
          role,
          organizations ( is_active )
        `)
        .eq('user_id', session.user.id)
        .single();

      if (error || !profile) {
        setIsAuthorized(false);
        return;
      }

      const isOrgActive = profile.organizations?.is_active !== false; 
      const safeRole = profile?.role?.toLowerCase()?.trim() || '';

      // Global Admins bypass the suspension lock
      if (!isOrgActive && safeRole !== 'global admin') {
        await supabase.auth.signOut();
        alert("Your organization's access has been suspended. Please contact CiviWatch Global Command.");
        setIsAuthorized(false);
        return;
      }

      setIsAuthorized(true);
    };

    checkAccess();
  }, [navigate]);

  if (isAuthorized === null) {
    return <div style={{ color: '#fff', textAlign: 'center', padding: '50px' }}>Authenticating Secure Connection...</div>;
  }

  if (isAuthorized === false) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// --- EXISTING BACKGROUND AND MODAL COMPONENTS ---
const NetworkBackground = ({ stopAnimations }) => {
  const canvasRef = useRef(null);
  const stopRef = useRef(stopAnimations);

  useEffect(() => {
    stopRef.current = stopAnimations;
  }, [stopAnimations]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let particles = [];
    
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    for (let i = 0; i < 90; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 1.2,
        vy: (Math.random() - 0.5) * 1.2
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      if (stopRef.current) {
        ctx.fillStyle = 'rgba(52, 152, 219, 0.7)';
        ctx.strokeStyle = 'rgba(52, 152, 219, 0.15)';
        ctx.lineWidth = 1;
        for (let i = 0; i < particles.length; i++) {
          let p = particles[i];
          ctx.beginPath();
          ctx.arc(p.x, p.y, 2.5, 0, Math.PI * 2);
          ctx.fill();
          for (let j = i + 1; j < particles.length; j++) {
            let p2 = particles[j];
            let dist = Math.sqrt(Math.pow(p.x - p2.x, 2) + Math.pow(p.y - p2.y, 2));
            if (dist < 140) {
              ctx.beginPath();
              ctx.moveTo(p.x, p.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.stroke();
            }
          }
        }
        return; 
      }

      ctx.fillStyle = 'rgba(52, 152, 219, 0.7)';
      ctx.strokeStyle = 'rgba(52, 152, 219, 0.15)';
      ctx.lineWidth = 1;
      
      for (let i = 0; i < particles.length; i++) {
        let p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2.5, 0, Math.PI * 2);
        ctx.fill();
        
        for (let j = i + 1; j < particles.length; j++) {
          let p2 = particles[j];
          let dist = Math.sqrt(Math.pow(p.x - p2.x, 2) + Math.pow(p.y - p2.y, 2));
          if (dist < 140) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }
      animationFrameId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      window.removeEventListener('resize', resize);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [stopAnimations]);

  return <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }} />;
};

const VideoModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 3000, padding: '20px', backdropFilter: 'blur(5px)' }} onClick={onClose}>
      <div style={{ backgroundColor: '#0d1630', padding: '20px', borderRadius: '16px', maxWidth: '900px', width: '100%', boxShadow: '0 20px 50px rgba(0,0,0,0.7)', border: '1px solid rgba(52, 152, 219, 0.3)', position: 'relative' }} onClick={(e) => e.stopPropagation()}>
        <button style={{ position: 'absolute', top: '-40px', right: '0', background: 'none', border: 'none', color: '#ffffff', fontSize: '2rem', cursor: 'pointer' }} onClick={onClose}>&times;</button>
        <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
          <iframe 
            src="https://www.loom.com/embed/49254e6a6b0a4d7ea2380df72211fb3c?sid=7db7e945-8854-47b2-a4f6-efbdf42b2915" 
            frameBorder="0" 
            webkitallowfullscreen="true" 
            mozallowfullscreen="true" 
            allowFullScreen 
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', borderRadius: '8px' }}
            title="Video Guide"
          ></iframe>
        </div>
      </div>
    </div>
  );
};

const AppContent = () => {
  const [lang, setLang] = useState('EN');
  const isEn = lang === 'EN';
  const navigate = useNavigate();
  
  const [isAccMenuOpen, setIsAccMenuOpen] = useState(false);
  const [isHelpMenuOpen, setIsHelpMenuOpen] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        const currentHash = window.location.hash;
        if (
          currentHash.includes('/login') || 
          currentHash.includes('access_token') || 
          currentHash === '' || 
          currentHash === '#/'
        ) {
          navigate('/dashboard', { replace: true });
        }
      }
    });

    return () => {
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, [navigate]);

  const [accState, setAccState] = useState({
    fontSize: 1,
    highContrast: false,
    legibleFont: false,
    stopAnimations: false,
    highlightLinks: false,
    textSpacing: false
  });

  const location = useLocation();
  const isDashboard = location.pathname.includes('/dashboard');

  const toggleAcc = (key) => setAccState(prev => ({ ...prev, [key]: !prev[key] }));
  const resetAcc = () => setAccState({ fontSize: 1, highContrast: false, legibleFont: false, stopAnimations: false, highlightLinks: false, textSpacing: false });

  const getAccItemStyle = (isActive) => ({
    backgroundColor: isActive ? '#0f172a' : '#1e293b', 
    border: `1px solid ${isActive ? '#00a884' : '#334155'}`, 
    padding: '12px 15px', 
    color: isActive ? '#00a884' : '#f8fafc', 
    borderRadius: '6px', 
    display: 'flex', 
    alignItems: 'center', 
    gap: '15px', 
    cursor: 'pointer', 
    fontSize: '0.95rem',
    fontWeight: isActive ? 'bold' : 'normal',
    transition: 'all 0.2s'
  });
  
  const helpItemStyle = {
    padding: '16px 20px', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '15px', cursor: 'pointer', 
    fontSize: '1rem', borderBottom: '1px solid #334155', transition: 'background 0.2s'
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        ${accState.fontSize !== 1 ? `html { font-size: ${accState.fontSize * 100}% !important; }` : ''}
        ${accState.highContrast ? `body { filter: contrast(150%) saturate(120%) !important; }` : ''}
        ${accState.legibleFont ? `* { font-family: Arial, Helvetica, sans-serif !important; }` : ''}
        ${accState.stopAnimations ? `* { animation: none !important; transition: none !important; scroll-behavior: auto !important; }` : ''}
        ${accState.highlightLinks ? `a { background-color: #ffeb3b !important; color: #000 !important; text-decoration: underline !important; font-weight: bold !important; padding: 2px 4px !important; border-radius: 4px !important; }` : ''}
        ${accState.textSpacing ? `* { letter-spacing: 0.12em !important; word-spacing: 0.16em !important; line-height: 1.8 !important; }` : ''}
      `}} />

      <VideoModal isOpen={isVideoModalOpen} onClose={() => setIsVideoModalOpen(false)} />

      <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: -1, background: 'radial-gradient(circle, #0f172a 0%, #020617 100%)', overflow: 'hidden' }}>
        <NetworkBackground stopAnimations={accState.stopAnimations} />
        <img src="/your-logo-file.png" alt="CiviWatch Logo Background" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', opacity: 0.05, maxWidth: '80%', maxHeight: '80%', pointerEvents: 'none', zIndex: 1 }} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', position: 'relative', zIndex: 1, color: '#ffffff' }}>
        <Navbar lang={lang} setLang={setLang} />
        
        {/* ACCESSIBILITY MENU */}
        <div style={{ position: 'fixed', bottom: '25px', left: '25px', zIndex: 2000 }}>
          {isAccMenuOpen && (
            <div style={{ position: 'absolute', bottom: '80px', left: '0', width: '300px', backgroundColor: '#0f172a', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 10px 40px rgba(0,0,0,0.8)', border: '1px solid #334155', direction: isEn ? 'ltr' : 'rtl', textAlign: isEn ? 'left' : 'right' }}>
              <div style={{ backgroundColor: '#00a884', padding: '15px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#fff', fontWeight: 'bold', fontSize: '1.2rem' }}>{isEn ? 'Accessibility' : 'נגישות'}</span>
                <span onClick={() => setIsAccMenuOpen(false)} style={{ color: '#fff', cursor: 'pointer', fontWeight: 'bold', fontSize: '1.4rem' }}>✕</span>
              </div>
              <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={() => setAccState(p => ({...p, fontSize: Math.min(p.fontSize + 0.1, 1.5)}))} style={{ flex: 1, padding: '12px', backgroundColor: '#1e293b', border: '1px solid #334155', color: '#fff', borderRadius: '6px', cursor: 'pointer', fontSize: '1.1rem' }}>A+</button>
                  <button onClick={() => setAccState(p => ({...p, fontSize: Math.max(p.fontSize - 0.1, 0.8)}))} style={{ flex: 1, padding: '12px', backgroundColor: '#1e293b', border: '1px solid #334155', color: '#fff', borderRadius: '6px', cursor: 'pointer', fontSize: '1.1rem' }}>A-</button>
                </div>
                <div style={getAccItemStyle(accState.highContrast)} onClick={() => toggleAcc('highContrast')}><span style={{ minWidth: '24px' }}>◐</span> {isEn ? 'High Contrast' : 'ניגודיות גבוהה'}</div>
                <div style={getAccItemStyle(accState.legibleFont)} onClick={() => toggleAcc('legibleFont')}><span style={{ minWidth: '24px' }}>A</span> {isEn ? 'Legible Font' : 'פונט קריא'}</div>
                <div style={getAccItemStyle(accState.stopAnimations)} onClick={() => toggleAcc('stopAnimations')}><span style={{ minWidth: '24px' }}>⏸</span> {isEn ? 'Stop Animations' : 'עצירת הנפשות'}</div>
                <div style={getAccItemStyle(accState.highlightLinks)} onClick={() => toggleAcc('highlightLinks')}><span style={{ minWidth: '24px' }}>🔗</span> {isEn ? 'Highlight Links' : 'הדגשת קישורים'}</div>
                <div style={getAccItemStyle(accState.textSpacing)} onClick={() => toggleAcc('textSpacing')}><span style={{ minWidth: '24px' }}>＝</span> {isEn ? 'Text Spacing' : 'מרווח בין שורות'}</div>
                <button onClick={resetAcc} style={{ ...getAccItemStyle(false), border: '1px solid #ef4444', color: '#ef4444', justifyContent: 'center', marginTop: '10px', backgroundColor: 'transparent', width: '100%' }}>
                  {isEn ? 'Reset Settings' : 'איפוס הגדרות'}
                </button>
                <div style={{ textAlign: 'center', marginTop: '15px' }}>
                  <Link to="/accessibility" onClick={() => setIsAccMenuOpen(false)} style={{ color: '#00a884', textDecoration: 'underline', fontSize: '0.95rem', cursor: 'pointer' }}>
                    {isEn ? 'Accessibility Statement' : 'הצהרת נגישות'}
                  </Link>
                </div>
              </div>
            </div>
          )}
          <button onClick={() => { setIsAccMenuOpen(!isAccMenuOpen); setIsHelpMenuOpen(false); }} style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: '#00a884', color: '#ffffff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 15px rgba(0,0,0,0.4)' }} title="Accessibility">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" width="32px" height="32px">
              <path d="M12 2c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm9 7h-6v13h-2v-6h-2v6H9V9H3V7h18v2z"/>
            </svg>
          </button>
        </div>

        {/* HELP MENU */}
        <div style={{ position: 'fixed', bottom: '25px', right: '25px', zIndex: 2000 }}>
          {isHelpMenuOpen && (
            <div style={{ position: 'absolute', bottom: '80px', right: '0', width: '320px', backgroundColor: '#0f172a', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 10px 40px rgba(0,0,0,0.8)', border: '1px solid #334155', textAlign: isEn ? 'left' : 'right', direction: isEn ? 'ltr' : 'rtl' }}>
              <div style={{ padding: '20px 20px 10px 20px' }}>
                <h3 style={{ color: '#ffffff', margin: 0, fontSize: '1.3rem', fontWeight: 'bold' }}>
                  {isEn ? 'Help & Support' : 'תמיכה ועזרה'}
                </h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', paddingBottom: '10px' }}>

                {isDashboard && (
                  <div 
                    style={helpItemStyle} 
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1e293b'} 
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    onClick={() => { 
                      window.dispatchEvent(new Event('openDashboardHelp')); 
                      setIsHelpMenuOpen(false); 
                    }}
                  >
                    <span style={{ minWidth: '24px', textAlign: 'center' }}>📖</span> 
                    {isEn ? 'Dashboard Operations Guide' : 'מדריך תפעול למערכת'}
                  </div>
                )}

                <Link to="/partners" style={{ textDecoration: 'none' }} onClick={() => setIsHelpMenuOpen(false)}>
                  <div style={helpItemStyle} onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1e293b'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                    <span style={{ minWidth: '24px', textAlign: 'center' }}>🤝</span> 
                    {isEn ? 'Contact Partnerships' : 'יצירת קשר לשותפות'}
                  </div>
                </Link>

                <Link to="/faq" style={{ textDecoration: 'none' }} onClick={() => setIsHelpMenuOpen(false)}>
                  <div style={{ ...helpItemStyle, borderBottom: 'none' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1e293b'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                    <span style={{ minWidth: '24px', textAlign: 'center' }}>ℹ️</span> 
                    {isEn ? 'CiviWatch FAQ' : 'שאלות נפוצות (FAQ)'}
                  </div>
                </Link>

              </div>
            </div>
          )}
          <button onClick={() => { setIsHelpMenuOpen(!isHelpMenuOpen); setIsAccMenuOpen(false); }} style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: '#3b82f6', color: '#ffffff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 15px rgba(0,0,0,0.4)' }} title="Help & Security">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="28px" height="28px">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
          </button>
        </div>

        <main style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<Home lang={lang} />} />
            <Route path="/company" element={<Company lang={lang} />} />
            <Route path="/market-strategy" element={<MarketStrategy lang={lang} />} />
            <Route path="/partners" element={<Partners lang={lang} />} />
            <Route path="/contact" element={<Contact lang={lang} />} />
            <Route path="/accessibility" element={<AccessibilityStatement lang={lang} />} />
            <Route path="/faq" element={<CiviWatchFAQ isEn={isEn} />} />
            <Route path="/login" element={<Login lang={lang} />} />
            <Route path="/coming-soon" element={<ComingSoon lang={lang} />} />
            <Route path="/solutions/hitl" element={<HumanInTheLoop lang={lang} />} />
            
            {/* WRAPPED DASHBOARD WITH PROTECTED ROUTE */}
            <Route path="/dashboard/*" element={
              <ProtectedRoute>
                <Dashboard lang={lang} />
              </ProtectedRoute>
            } />
            
            {/* AI ORCHESTRATION COMMAND CENTER */}
            <Route path="/ai-orchestration" element={
              <ProtectedRoute>
                <AiOrchestration isEn={isEn} />
              </ProtectedRoute>
            } />

            <Route path="/pricing" element={<Pricing isEn={isEn} />} />
            
            <Route path="/solutions/governments" element={<Governments lang={lang} />} />
            <Route path="/solutions/social" element={<SocialNetworks lang={lang} />} />
            <Route path="/solutions/ngos" element={<Ngos lang={lang} />} />
            <Route path="/solutions/marketplace" element={<Marketplace lang={lang} />} />
            <Route path="/solutions/genai" element={<GenerativeAI lang={lang} />} />
            <Route path="/solutions/vr" element={<VirtualReality lang={lang} />} />
            
            <Route 
              path="/admin/ai-simulation" 
              element={
                <SuperAdminRoute>
                  <CouncilSimulatorDoc isEn={isEn} />
                </SuperAdminRoute>
              } 
            />
            
            <Route path="*" element={
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', color: '#fff' }}>
                <h2>Securely authenticating connection...</h2>
              </div>
            } />
          </Routes>
        </main>

        <Footer lang={lang} />
      </div>
    </>
  );
};

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;