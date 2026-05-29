/**
 * @file ComingSoon.js
 * @description A clean, unified "Under Construction" page for all upcoming features and policies.
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components';

const ComingSoon = ({ lang }) => {
  const isEn = lang === 'EN';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '70vh', padding: '20px', textAlign: 'center', animation: 'fadeIn 0.5s ease-out' }}>
      
      {/* Animated construction icon */}
      <div style={{ marginBottom: '30px', animation: 'pulse 2s infinite' }}>
        <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#3498db" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
          <path d="M2 17l10 5 10-5M2 12l10 5 10-5"></path>
        </svg>
      </div>

      <h1 style={{ color: '#fff', fontSize: '3rem', margin: '0 0 15px 0' }}>
        {isEn ? 'Under Construction' : 'העמוד בבנייה'}
      </h1>
      
      <p style={{ color: '#8b949e', fontSize: '1.2rem', maxWidth: '600px', lineHeight: '1.6', marginBottom: '40px' }}>
        {isEn 
          ? 'We are currently working hard to finalize this page. Please check back soon for updates to our compliance policies and legal documentation.' 
          : 'אנו עובדים במרץ כדי לסיים עמוד זה. אנא חזרו בקרוב לעדכונים בנושא מדיניות התאימות והמסמכים המשפטיים שלנו.'}
      </p>

      <Link to="/" style={{ textDecoration: 'none' }}>
        <Button label={isEn ? 'Return to Homepage' : 'חזרה לדף הבית'} />
      </Link>

      <style>{`
        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.05); opacity: 0.8; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default ComingSoon;