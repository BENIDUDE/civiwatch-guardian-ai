/**
 * @file components.js
 * @description Core UI Library & Global Layout Components for CiviWatch.
 * This file houses the foundational, reusable visual elements used across the platform's 
 * public-facing pages. It ensures design consistency and centralizes global state listeners.
 * * --- COMPONENTS EXPORTED ---
 * @component Button
 * @description A standardized, reusable button with built-in hover states and variant styling.
 * * @component Card
 * @description An interactive, expandable content container. Clicking the card mounts a full-screen 
 * modal overlay with extended details. Automatically adapts text direction (LTR/RTL) based on locale.
 * * @component Navbar
 * @description The fixed global navigation header.
 * - Auth State: Actively subscribes to Supabase onAuthStateChange. Dynamically swaps the "Login" 
 * button for a "Dashboard" portal button if an active user session exists.
 * - Navigation: Features a hover-triggered dropdown mega-menu for "Solutions" routing.
 * - Localization: Contains the global Language toggler (EN/HE), updating the app-level state.
 * * @component Footer
 * @description The global site footer containing a newsletter subscription form, external social 
 * media links (utilizing the internal SocialIcon wrapper), and legal/compliance routing.
 */
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from './supabaseClient'; 

export const Button = ({ label, onClick, variant = 'primary', style = {} }) => {
  const isPrimary = variant === 'primary';
  const baseStyle = {
    padding: '10px 20px',
    borderRadius: '8px',
    fontWeight: 'bold',
    cursor: 'pointer',
    border: isPrimary ? 'none' : '1px solid #8b949e',
    backgroundColor: isPrimary ? '#1f6feb' : 'transparent',
    color: isPrimary ? '#ffffff' : '#c9d1d9',
    transition: 'all 0.3s',
    ...style
  };
  return (
    <button 
      onClick={onClick} 
      style={baseStyle}
      onMouseOver={(e) => {
        if (isPrimary) e.target.style.backgroundColor = '#388bfd';
        else { e.target.style.borderColor = '#ffffff'; e.target.style.color = '#ffffff'; }
      }}
      onMouseOut={(e) => {
        if (isPrimary) e.target.style.backgroundColor = '#1f6feb';
        else { e.target.style.borderColor = '#8b949e'; e.target.style.color = '#c9d1d9'; }
      }}
    >
      {label}
    </button>
  );
};

export const Card = ({ title, content, extendedTitle, extendedContent, lang }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const isEn = lang === 'EN';

  return (
    <>
      <div 
        onClick={() => setIsExpanded(true)}
        style={{ 
          backgroundColor: '#161b22', 
          border: '1px solid #30363d', 
          borderRadius: '12px', 
          padding: '30px', 
          textAlign: isEn ? 'left' : 'right', 
          direction: isEn ? 'ltr' : 'rtl',
          cursor: 'pointer',
          transition: 'transform 0.3s, borderColor 0.3s',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          boxSizing: 'border-box'
        }}
        onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.borderColor = '#3498db'; }}
        onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = '#30363d'; }}
      >
        <h3 style={{ color: '#ffffff', fontSize: '1.3rem', marginBottom: '15px', marginTop: 0 }}>{title}</h3>
        <p style={{ color: '#8b949e', lineHeight: '1.6', margin: 0, flex: 1 }}>{content}</p>
        
        <div style={{ marginTop: '20px', color: '#3498db', fontSize: '0.9rem', fontWeight: 'bold' }}>
          {isEn ? 'View Specs →' : '← צפה במפרט'}
        </div>
      </div>

      {isExpanded && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 3000, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }} onClick={() => setIsExpanded(false)}>
          <div style={{ backgroundColor: '#0d1117', border: '1px solid #30363d', borderRadius: '16px', padding: '40px', maxWidth: '600px', width: '100%', position: 'relative' }} onClick={e => e.stopPropagation()}>
            <button style={{ position: 'absolute', top: '15px', right: isEn ? '15px' : 'auto', left: isEn ? 'auto' : '15px', background: 'none', border: 'none', color: '#fff', fontSize: '1.5rem', cursor: 'pointer' }} onClick={() => setIsExpanded(false)}>✕</button>
            <h3 style={{ color: '#3498db', fontSize: '1.8rem', marginTop: 0, marginBottom: '20px', textAlign: isEn ? 'left' : 'right', direction: isEn ? 'ltr' : 'rtl' }}>{extendedTitle || title}</h3>
            {extendedContent}
          </div>
        </div>
      )}
    </>
  );
};

export const Navbar = ({ lang, setLang }) => {
  const [showSolutions, setShowSolutions] = useState(false);
  const [session, setSession] = useState(null); 
  const isEn = lang === 'EN';

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const navStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '15px 5%',
    backgroundColor: 'rgba(13, 17, 23, 0.85)',
    borderBottom: '1px solid #30363d',
    position: 'fixed',
    width: '100%',
    top: 0,
    zIndex: 1500,
    backdropFilter: 'blur(10px)',
    direction: isEn ? 'ltr' : 'rtl',
    boxSizing: 'border-box'
  };

  const linkStyle = { color: '#8b949e', textDecoration: 'none', padding: '10px', display: 'block', fontWeight: '500', transition: 'color 0.3s' };

  return (
    <nav style={navStyle}>
      <Link to="/" style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#fff', textDecoration: 'none' }}>
        CiviWatch <span style={{ color: '#1f6feb' }}>Guardian AI</span>
      </Link>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }} className="nav-container">
        <ul style={{ display: 'flex', listStyle: 'none', margin: 0, padding: 0, gap: '15px', alignItems: 'center' }} className="desktop-menu">
          <li 
            onMouseEnter={() => setShowSolutions(true)} 
            onMouseLeave={() => setShowSolutions(false)}
            style={{ position: 'relative' }}
          >
            <span style={{ ...linkStyle, cursor: 'pointer' }}>{isEn ? 'Solutions ▾' : 'פתרונות ▾'}</span>
            {showSolutions && (
              <div style={{ position: 'absolute', top: '100%', [isEn ? 'left' : 'right']: 0, backgroundColor: '#161b22', border: '1px solid #30363d', borderRadius: '8px', minWidth: '220px', display: 'flex', flexDirection: 'column', boxShadow: '0 8px 16px rgba(0,0,0,0.5)', overflow: 'hidden' }}>
                <Link to="/solutions/social" style={{...linkStyle, padding: '12px 15px', borderBottom: '1px solid #30363d'}} onMouseOver={e=>e.target.style.backgroundColor='#30363d'} onMouseOut={e=>e.target.style.backgroundColor='transparent'}>{isEn ? 'Social Networks' : 'רשתות חברתיות'}</Link>
                <Link to="/solutions/marketplace" style={{...linkStyle, padding: '12px 15px', borderBottom: '1px solid #30363d'}} onMouseOver={e=>e.target.style.backgroundColor='#30363d'} onMouseOut={e=>e.target.style.backgroundColor='transparent'}>{isEn ? 'AI Marketplace' : 'זירת AI'}</Link>
                <Link to="/solutions/governments" style={{...linkStyle, padding: '12px 15px', borderBottom: '1px solid #30363d'}} onMouseOver={e=>e.target.style.backgroundColor='#30363d'} onMouseOut={e=>e.target.style.backgroundColor='transparent'}>{isEn ? 'Governments' : 'ממשלות'}</Link>
                <Link to="/solutions/ngos" style={{...linkStyle, padding: '12px 15px', borderBottom: '1px solid #30363d'}} onMouseOver={e=>e.target.style.backgroundColor='#30363d'} onMouseOut={e=>e.target.style.backgroundColor='transparent'}>{isEn ? 'NGOs' : 'עמותות'}</Link>
                <Link to="/solutions/genai" style={{...linkStyle, padding: '12px 15px', borderBottom: '1px solid #30363d'}} onMouseOver={e=>e.target.style.backgroundColor='#30363d'} onMouseOut={e=>e.target.style.backgroundColor='transparent'}>{isEn ? 'Generative AI' : 'בינה מלאכותית יוצרת'}</Link>
                <Link to="/solutions/vr" style={{...linkStyle, padding: '12px 15px', borderBottom: '1px solid #30363d'}} onMouseOver={e=>e.target.style.backgroundColor='#30363d'} onMouseOut={e=>e.target.style.backgroundColor='transparent'}>{isEn ? 'Virtual Reality' : 'מציאות מדומה'}</Link>
                <Link to="/solutions/hitl" style={{...linkStyle, padding: '12px 15px'}} onMouseOver={e=>e.target.style.backgroundColor='#30363d'} onMouseOut={e=>e.target.style.backgroundColor='transparent'}>{isEn ? 'Human-in-the-Loop' : 'בקרת מומחים אנושית'}</Link>
              </div>
            )}
          </li>
          <li><Link to="/company" style={linkStyle} onMouseOver={e=>e.target.style.color='#fff'} onMouseOut={e=>e.target.style.color='#8b949e'}>{isEn ? 'Company' : 'החברה'}</Link></li>
          <li><Link to="/partners" style={linkStyle} onMouseOver={e=>e.target.style.color='#fff'} onMouseOut={e=>e.target.style.color='#8b949e'}>{isEn ? 'Partners' : 'שותפים'}</Link></li>
          <li><Link to="/market-strategy" style={linkStyle} onMouseOver={e=>e.target.style.color='#fff'} onMouseOut={e=>e.target.style.color='#8b949e'}>{isEn ? 'Strategy' : 'אסטרטגיה'}</Link></li>
          <li><Link to="/pricing" style={linkStyle} onMouseOver={e=>e.target.style.color='#fff'} onMouseOut={e=>e.target.style.color='#8b949e'}>{isEn ? 'Pricing' : 'תמחור'}</Link></li>
          <li><Link to="/contact" style={linkStyle} onMouseOver={e=>e.target.style.color='#fff'} onMouseOut={e=>e.target.style.color='#8b949e'}>{isEn ? 'Contact Us' : 'צור קשר'}</Link></li>
        </ul>

        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <div 
            onClick={() => setLang(isEn ? 'HE' : 'EN')} 
            style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#8b949e', fontWeight: 'bold', cursor: 'pointer' }}
          >
            <svg viewBox="0 0 24 24" style={{ width: '20px', height: '20px', fill: 'currentColor' }}>
              <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm6.93 6h-2.95c-.32-1.25-.78-2.45-1.38-3.56 1.84.63 3.37 1.91 4.33 3.56zM12 4.04c.83 1.2 1.48 2.53 1.91 3.96h-3.82c.43-1.43 1.08-2.76 1.91-3.96zM4.26 14C4.1 13.36 4 12.69 4 12s.1-1.36.26-2h3.38c-.08.66-.14 1.32-.14 2 0 .68.06 1.34.14 2H4.26zm.82 2h2.95c.32 1.25.78 2.45 1.38 3.56-1.84-.63-3.37-1.9-4.33-3.56zm2.95-8H5.08c.96-1.66 2.49-2.93 4.33-3.56C8.81 5.55 8.35 6.75 8.03 8zM12 19.96c-.83-1.2-1.48-2.53-1.91-3.96h3.82c-.43 1.43-1.08 2.76-1.91 3.96zM14.34 14H9.66c-.09-.66-.16-1.32-.16-2 0-.68.07-1.35.16-2h4.68c.09.65.16 1.32.16 2 0 .68-.07 1.34-.16 2zm.25 5.56c.6-1.11 1.06-2.31 1.38-3.56h2.95c-.96 1.65-2.49 2.93-4.33 3.56zM16.36 14c.08-.66.14-1.32.14-2 0-.68-.06-1.34-.14-2h3.38c.16.64.26 1.31.26 2s-.1 1.36-.26 2h-3.38z"/>
            </svg>
            {lang}
          </div>
          
          {session ? (
            <Link to="/dashboard" style={{ textDecoration: 'none' }}>
              <Button label={isEn ? 'Dashboard' : 'לוח בקרה'} style={{ backgroundColor: '#10b981', color: '#022c22' }} />
            </Link>
          ) : (
            <Link to="/login" style={{ textDecoration: 'none' }}>
              <Button label={isEn ? 'Platform Login' : 'כניסה למערכת'} />
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

// Social Icon Component for Footer
const SocialIcon = ({ href, children }) => (
  <a 
    href={href} 
    target="_blank" 
    rel="noopener noreferrer" 
    style={{ 
      display: 'flex', alignItems: 'center', justifyContent: 'center', 
      width: '36px', height: '36px', backgroundColor: '#1f6feb', color: '#ffffff', 
      borderRadius: '50%', textDecoration: 'none', transition: 'background-color 0.2s' 
    }}
    onMouseOver={e => e.currentTarget.style.backgroundColor = '#388bfd'}
    onMouseOut={e => e.currentTarget.style.backgroundColor = '#1f6feb'}
  >
    {children}
  </a>
);

export const Footer = ({ lang }) => {
  const isEn = lang === 'EN';
  
  return (
    <footer style={{ backgroundColor: '#0d1117', padding: '40px 5% 20px', borderTop: '1px solid #30363d', color: '#8b949e', zIndex: 10, position: 'relative', marginTop: 'auto', direction: isEn ? 'ltr' : 'rtl', fontSize: '0.85rem' }}>
      
      {/* NEWSLETTER & SOCIALS SECTION */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', gap: '30px' }}>
        
        {/* Newsletter Signup */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div style={{ display: 'inline-block' }}>
            <h4 style={{ color: '#fff', margin: '0 0 8px 0', fontSize: '1.1rem', fontWeight: 'bold' }}>
              {isEn ? 'Sign up for news & updates' : 'הרשם לחדשות ועדכונים'}
            </h4>
            <div style={{ height: '2px', backgroundColor: '#1f6feb', width: '50px' }}></div>
          </div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <input 
              type="email" 
              placeholder="yourmail@domain.com" 
              style={{ backgroundColor: 'transparent', border: '1px solid #30363d', color: '#c9d1d9', padding: '10px 20px', borderRadius: '25px', outline: 'none', minWidth: '260px' }}
            />
            <button 
              style={{ backgroundColor: '#1f6feb', color: '#fff', border: 'none', padding: '10px 25px', borderRadius: '25px', fontWeight: 'bold', cursor: 'pointer', transition: 'background-color 0.2s' }} 
              onMouseOver={e => e.target.style.backgroundColor = '#388bfd'} 
              onMouseOut={e => e.target.style.backgroundColor = '#1f6feb'}
            >
              {isEn ? 'Subscribe' : 'הרשם'}
            </button>
          </div>
        </div>

        {/* Connect with us (Social Links) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <span style={{ color: '#1f6feb', fontWeight: 'bold', fontSize: '1rem' }}>
            {isEn ? 'Connect with us' : 'התחבר אלינו'}
          </span>
          <div style={{ display: 'flex', gap: '12px' }}>
            <SocialIcon href="#">
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
            </SocialIcon>
            <SocialIcon href="https://www.linkedin.com/in/benjaminmichaeli/">
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
            </SocialIcon>
            <SocialIcon href="#">
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path></svg>
            </SocialIcon>
            <SocialIcon href="mailto:michaeli.benjamin@gmail.com">
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
            </SocialIcon>
          </div>
        </div>
      </div>

      {/* ORIGINAL BOTTOM LINKS - ROUTED TO COMING SOON */}
      <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '10px', textAlign: 'center', borderTop: '1px solid #30363d', paddingTop: '20px' }}>
        <Link to="/coming-soon" style={{ color: '#8b949e', textDecoration: 'none' }} onMouseOver={e=>e.target.style.color='#fff'} onMouseOut={e=>e.target.style.color='#8b949e'}>{isEn ? 'Privacy Policy' : 'מדיניות פרטיות'}</Link> |
        <Link to="/coming-soon" style={{ color: '#8b949e', textDecoration: 'none' }} onMouseOver={e=>e.target.style.color='#fff'} onMouseOut={e=>e.target.style.color='#8b949e'}>{isEn ? 'CCPA Policy' : 'מדיניות CCPA'}</Link> |
        <Link to="/coming-soon" style={{ color: '#8b949e', textDecoration: 'none' }} onMouseOver={e=>e.target.style.color='#fff'} onMouseOut={e=>e.target.style.color='#8b949e'}>{isEn ? 'Security Policy' : 'מדיניות אבטחה'}</Link> |
        <Link to="/coming-soon" style={{ color: '#8b949e', textDecoration: 'none' }} onMouseOver={e=>e.target.style.color='#fff'} onMouseOut={e=>e.target.style.color='#8b949e'}>{isEn ? 'Data Policy' : 'מדיניות נתונים'}</Link> |
        <Link to="/coming-soon" style={{ color: '#8b949e', textDecoration: 'none' }} onMouseOver={e=>e.target.style.color='#fff'} onMouseOut={e=>e.target.style.color='#8b949e'}>{isEn ? 'Terms of Use' : 'תנאי שימוש'}</Link> |
        <Link to="/coming-soon" style={{ color: '#8b949e', textDecoration: 'none' }} onMouseOver={e=>e.target.style.color='#fff'} onMouseOut={e=>e.target.style.color='#8b949e'}>{isEn ? 'Service Level Agreement' : 'אמנת שירות (SLA)'}</Link> |
        <span>Copyright CiviWatch Guardian AI 2026. All Right Reserved.</span> |
        <span>By Benjamin Michaeli</span>
      </div>
    </footer>
  );
};