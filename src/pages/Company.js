import React, { useState } from 'react';

// Reusable component for the team members to handle the hover state cleanly
const TeamCard = ({ name, role, desc, imgSrc }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      style={{
        background: '#161b22', 
        border: `1px solid ${isHovered ? '#1f6feb' : '#30363d'}`, 
        borderRadius: '12px', 
        padding: '40px 30px', 
        textAlign: 'center', 
        transition: 'transform 0.3s ease, border-color 0.3s ease',
        transform: isHovered ? 'translateY(-5px)' : 'translateY(0)'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <img 
        src={imgSrc} 
        alt={name} 
        onError={(e) => {
          e.target.onerror = null; // Prevent infinite loops
          e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=141e3c&color=00a8ff&size=150`;
        }}
        style={{ 
          width: '150px', 
          height: '150px', 
          borderRadius: '50%', 
          objectFit: 'cover', 
          marginBottom: '20px', 
          border: '3px solid #30363d' 
        }} 
      />
      <h3 style={{ color: '#ffffff', marginBottom: '5px', fontSize: '1.5rem', marginTop: 0 }}>{name}</h3>
      <p style={{ color: '#1f6feb', fontWeight: 'bold', marginBottom: '15px', fontSize: '1.1rem', marginTop: 0 }}>{role}</p>
      <p style={{ color: '#8b949e', lineHeight: '1.6', margin: 0 }}>{desc}</p>
    </div>
  );
};

const Company = ({ lang }) => {
  const isEn = lang === 'EN';

  return (
    <div style={{ padding: '20px 3%', width: '100%', maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', flex: 1 }}>
      
      {/* Hero Section */}
      <section style={{ paddingTop: '80px', paddingBottom: '40px', textAlign: 'center' }}>
        <h1 style={{ color: '#ffffff', fontSize: '3.5rem', marginBottom: '15px', fontWeight: '800' }}>
          {isEn ? 'Guarding the ' : 'שומרים על '}
          <span style={{ color: '#1f6feb' }}>{isEn ? 'Digital Frontier.' : 'החזית הדיגיטלית.'}</span>
        </h1>
        <p style={{ color: '#8b949e', fontSize: '1.3rem', maxWidth: '800px', margin: '0 auto', lineHeight: '1.6' }}>
          {isEn 
            ? 'We combine advanced AI with human expertise to create secure, compliant, and scalable moderation ecosystems.' 
            : 'אנו משלבים בינה מלאכותית מתקדמת עם מומחיות אנושית ליצירת מערכות ניטור בטוחות ותואמות תקן.'}
        </p>
      </section>

      {/* Leadership Team Section */}
      <section style={{ padding: '50px 0', width: '100%', marginBottom: '60px' }}>
        <h2 style={{ fontSize: '2.5rem', color: '#ffffff', marginBottom: '40px', textAlign: 'center', borderBottom: '1px solid #30363d', paddingBottom: '15px' }}>
          {isEn ? 'Leadership Team' : 'צוות הנהלה'}
        </h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px', marginTop: '40px' }}>
          <TeamCard 
            name={isEn ? "Benjamin Michaeli" : "בנימין מיכאלי"}
            role={isEn ? "Chief Executive Officer" : "מנכ״ל"}
            desc={isEn 
              ? "Driving the strategic vision and capital realization of CiviWatch. Benjamin leverages deep expertise in project leadership and AI-driven business solutions to build scalable trust and safety ecosystems."
              : "מוביל את החזון האסטרטגי וההון למימוש החזון של CiviWatch. בנימין רותם מומחיות עמוקה בהובלת פרויקטים ופתרונות עסקיים מבוססי AI לבניית מערכות בטיחות ואמון."}
            imgSrc="/benjamin.jpg"
          />
          <TeamCard 
            name={isEn ? "Daniel Siman Tov" : "דניאל סימן טוב"}
            role={isEn ? "Chief Product Officer" : "CPO"}
            desc={isEn 
              ? "Leading the product vision and ensuring the platform accurately meets market needs. Highly experienced in guiding projects from concept to Product-Market Fit, with a strong focus on user experience and seamless enterprise integration."
              : "מוביל את חזון המוצר ומבטיח שהפלטפורמה תענה במדויק על צרכי השוק. בעל ניסיון עשיר בהובלת פרויקטים משלב הרעיון ועד ל-Market Fit, תוך התמקדות בחוויית משתמש והטמעה חלקה בארגונים."}
            imgSrc="/daniel.jpg"
          />
          <TeamCard 
            name={isEn ? "Evgeny Hahammer" : "יבגני חמרמר"}
            role={isEn ? "Chief Technology Officer" : "CTO"}
            desc={isEn 
              ? "The technological brain and chief architect of the system. An expert in developing AI and Machine Learning models, leading the creation of autonomous algorithms that detect abusive content in real-time."
              : "המוח הטכנולוגי והארכיטקט הראשי של המערכת. מומחה בפיתוח מודלים של בינה מלאכותית ולמידת מכונה (Machine Learning), המוביל את יצירת האלגוריתמים האוטונומיים שמזהים תוכן פוגעני בזמן אמת."}
            imgSrc="/evgeny.jpg"
          />
        </div>
      </section>

    </div>
  );
};

export default Company;