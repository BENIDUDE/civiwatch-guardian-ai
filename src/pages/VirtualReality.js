import React from 'react';
import { Button } from '../components';

const VirtualReality = ({ lang }) => {
  const isEn = lang === 'EN';

  return (
    <div style={{ padding: '60px 3%', width: '100%', maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', flex: 1, direction: isEn ? 'ltr' : 'rtl' }}>
      <section style={{ textAlign: 'center', marginBottom: '80px', marginTop: '20px' }}>
        <h1 style={{ fontSize: '3.5rem', color: '#ffffff', marginBottom: '15px', fontWeight: '800', lineHeight: '1.2' }}>
          {isEn ? 'Safety in ' : 'בטיחות ב-'}
          <span style={{ color: '#1abc9c' }}>{isEn ? 'Spatial Computing' : 'מחשוב מרחבי'}</span>
        </h1>
        <p style={{ fontSize: '1.25rem', color: '#b2bec3', maxWidth: '800px', margin: '0 auto', lineHeight: '1.6' }}>
          {isEn 
            ? 'Preparing for the next frontier of human interaction. Moderating 3D environments, virtual reality spaces, and real-time gaming lobbies.' 
            : 'הכנה לחזית הבאה של אינטראקציה אנושית. סינון סביבות תלת-ממדיות, מרחבי מציאות מדומה (VR) ולובי גיימינג בזמן אמת.'}
        </p>
      </section>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '30px', marginBottom: '80px' }}>
        <div style={{ backgroundColor: '#161b22', padding: '30px', borderRadius: '16px', border: '1px solid #30363d', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '15px' }}>🎙️</div>
          <h3 style={{ color: '#ffffff', fontSize: '1.3rem', marginBottom: '15px' }}>{isEn ? 'Real-Time Audio Moderation' : 'סינון אודיו בזמן אמת'}</h3>
          <p style={{ color: '#8b949e', fontSize: '0.95rem' }}>{isEn ? 'Transcribing and analyzing live proximity voice chat to detect severe bullying or coordinated harassment in virtual lobbies.' : 'תמלול וניתוח צ\'אט קולי חי כדי לזהות בריונות חמורה או הטרדה מתואמת בלובי וירטואלי.'}</p>
        </div>
        
        <div style={{ backgroundColor: '#161b22', padding: '30px', borderRadius: '16px', border: '1px solid #30363d', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '15px' }}>🚶</div>
          <h3 style={{ color: '#ffffff', fontSize: '1.3rem', marginBottom: '15px' }}>{isEn ? 'Spatial Behavior Tracking' : 'מעקב התנהגות מרחבי'}</h3>
          <p style={{ color: '#8b949e', fontSize: '0.95rem' }}>{isEn ? 'Identifying antagonistic kinematic patterns—such as virtual crowding or unwanted avatar proximity—that violate community guidelines.' : 'זיהוי דפוסים תנועתיים עוינים – כגון התקהלות וירטואלית סביב משתמש או קרבה לא רצויה – המפרים את כללי הקהילה.'}</p>
        </div>

        <div style={{ backgroundColor: '#161b22', padding: '30px', borderRadius: '16px', border: '1px solid #30363d', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '15px' }}>👕</div>
          <h3 style={{ color: '#ffffff', fontSize: '1.3rem', marginBottom: '15px' }}>{isEn ? 'Visual Asset Filtering' : 'סינון נכסים חזותיים'}</h3>
          <p style={{ color: '#8b949e', fontSize: '0.95rem' }}>{isEn ? 'Scanning user-uploaded textures, skins, and 3D models to prevent the introduction of hate symbols into the metaverse.' : 'סריקת טקסטורות, סקינים ומודלים תלת-ממדיים שמשתמשים מעלים, כדי למנוע החדרת סמלי שנאה למטאוורס.'}</p>
        </div>
      </div>
      
      <div style={{ textAlign: 'center', marginTop: '40px' }}>
         <Button label={isEn ? 'Explore Integration' : 'גלו אפשרויות אינטגרציה'} onClick={() => window.location.href='/#/contact'} />
      </div>
    </div>
  );
};

export default VirtualReality;