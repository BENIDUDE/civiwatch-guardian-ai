/**
 * @file HumanInTheLoop.js
 * @description Solutions page detailing the Human-in-the-Loop (HITL) and Data Annotation services.
 */
import React from 'react';
import { Button } from '../components';
import { Link } from 'react-router-dom';

const HumanInTheLoop = ({ lang }) => {
  const isEn = lang === 'EN';
  const isRtl = !isEn;

  return (
    <div style={{ padding: '120px 3% 60px 3%', width: '100%', maxWidth: '1200px', margin: '0 auto', direction: isRtl ? 'rtl' : 'ltr', animation: 'fadeIn 0.5s ease-out' }}>
      
      {/* 1. HERO SECTION */}
      <section style={{ textAlign: 'center', margin: '0 0 80px' }}>
        <div style={{ marginBottom: '15px', color: '#38bdf8', fontSize: '0.9rem', fontWeight: 'bold', letterSpacing: '1px', textTransform: 'uppercase' }}>
          {isEn ? 'Solutions / Services' : 'פתרונות / שירותים'}
        </div>
        <h1 style={{ fontSize: '3rem', color: '#ffffff', marginBottom: '20px', fontWeight: '800', lineHeight: '1.2' }}>
          {isEn ? 'Expert Human-in-the-Loop Validation' : 'שירותי אימות אדם-בלולאה מומחים'}
        </h1>
        <p style={{ fontSize: '1.25rem', color: '#3498db', fontWeight: 'bold', marginBottom: '20px' }}>
          {isEn ? 'Bridging the gap between complex AI data needs and actionable business outcomes.' : 'מגשרים על הפער בין צרכי נתונים מורכבים לתוצאות עסקיות מעשיות.'}
        </p>
        <p style={{ fontSize: '1.1rem', color: '#b2bec3', maxWidth: '800px', margin: '0 auto 30px', lineHeight: '1.6' }}>
          {isEn 
            ? "Even the most advanced AI models hallucinate, misinterpret cultural nuances, or struggle with edge-cases. We provide a dedicated, highly trained workforce to validate your data, annotate threats, and calibrate your AI with a detail-oriented, technician's perspective." 
            : "גם מודלי ה-AI המתקדמים ביותר הוזים, מפרשים לא נכון דקויות תרבותיות או מתקשים במקרי קצה. אנו מספקים כוח אדם ייעודי ומיומן לאימות נתונים, תיוג איומים וכיול המודלים שלך בגישה טכנית וממוקדת פרטים."}
        </p>
        <div style={{ maxWidth: '250px', margin: '0 auto' }}>
          <Link to="/contact" style={{ textDecoration: 'none' }}>
            <Button label={isEn ? 'Contact Our Team' : 'צור קשר עם הצוות'} />
          </Link>
        </div>
      </section>

      {/* 2. THE PROBLEM */}
      <section style={{ display: 'flex', flexWrap: 'wrap', gap: '30px', marginBottom: '80px', backgroundColor: 'rgba(255,255,255,0.02)', padding: '40px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ flex: '1', minWidth: '300px' }}>
          <h2 style={{ color: '#fff', fontSize: '2rem', marginBottom: '20px' }}>{isEn ? 'The AI Blindspot' : 'הנקודה העיוורת של ה-AI'}</h2>
          <p style={{ color: '#94a3b8', fontSize: '1rem', lineHeight: '1.7', marginBottom: '20px' }}>
            {isEn 
              ? "Pure AI moderation leads to dangerous outcomes: false positives that ban innocent users and ruin retention, or false negatives that miss actual threats and invite massive regulatory fines." 
              : "סינון מבוסס AI בלבד מוביל לתוצאות מסוכנות: חסימות שווא הפוגעות במשתמשים חפים מפשע, או פספוסי איומים החושפים אתכם לקנסות רגולטוריים כבדים."}
          </p>
          <p style={{ color: '#94a3b8', fontSize: '1rem', lineHeight: '1.7' }}>
            {isEn
              ? "However, building an in-house, 24/7 Trust & Safety operational team is expensive, legally complex, and incredibly difficult to scale alongside your platform's traffic."
              : "עם זאת, בניית צוות בטיחות פנימי הזמין 24/7 היא יקרה, מורכבת משפטית, וקשה מאוד להרחבה בהתאם לתעבורת הפלטפורמה."}
          </p>
        </div>
      </section>

      {/* 3. THE PROCESS PIPELINE */}
      <section style={{ marginBottom: '100px' }}>
        <h2 style={{ color: '#ffffff', textAlign: 'center', marginBottom: '50px', fontSize: '2.5rem' }}>
          {isEn ? 'The Integration Process' : 'תהליך האינטגרציה'}
        </h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'center' }}>
          
          <div style={{ flex: '1', minWidth: '250px', backgroundColor: '#0f172a', padding: '30px', borderRadius: '12px', border: '1px solid #334155', textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '15px' }}>🔗</div>
            <h3 style={{ color: '#38bdf8', marginBottom: '15px' }}>{isEn ? '1. API Handoff' : '1. מסירת API'}</h3>
            <p style={{ color: '#cbd5e1', fontSize: '0.95rem', lineHeight: '1.5' }}>
              {isEn ? "Your system flags ambiguous content or low-confidence AI predictions and securely routes them to the CiviWatch queue." : "המערכת שלכם מזהה תוכן גבולי ושולחת אותו באופן מאובטח לתור של CiviWatch."}
            </p>
          </div>

          <div style={{ flex: '1', minWidth: '250px', backgroundColor: '#0f172a', padding: '30px', borderRadius: '12px', border: '1px solid #334155', textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '15px' }}>🧑‍💻</div>
            <h3 style={{ color: '#a855f7', marginBottom: '15px' }}>{isEn ? '2. Expert Annotation' : '2. תיוג מומחים'}</h3>
            <p style={{ color: '#cbd5e1', fontSize: '0.95rem', lineHeight: '1.5' }}>
              {isEn ? "Our trained L1 Operators and L2 Moderators review the context and apply strict QA sampling to resolve the edge-case." : "המפעילים והמנהלים המיומנים שלנו בוחנים את ההקשר ומחילים בקרת איכות קפדנית לפתרון המקרה."}
            </p>
          </div>

          <div style={{ flex: '1', minWidth: '250px', backgroundColor: '#0f172a', padding: '30px', borderRadius: '12px', border: '1px solid #334155', textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '15px' }}>📈</div>
            <h3 style={{ color: '#10b981', marginBottom: '15px' }}>{isEn ? '3. Continuous Calibration' : '3. כיול מתמיד'}</h3>
            <p style={{ color: '#cbd5e1', fontSize: '0.95rem', lineHeight: '1.5' }}>
              {isEn ? "The final human decision is fed back into your AI model via API, actively making your algorithms smarter over time." : "ההחלטה הסופית מוזנת חזרה למודל ה-AI שלכם, והופכת את האלגוריתמים שלכם לחכמים יותר עם הזמן."}
            </p>
          </div>

        </div>
      </section>

      {/* 4. VALUE PROPOSITION */}
      <section style={{ marginBottom: '80px' }}>
        <h2 style={{ color: '#ffffff', textAlign: 'center', marginBottom: '40px', fontSize: '2.5rem' }}>
          {isEn ? 'Why Choose CiviWatch Services?' : 'למה לבחור בשירותי CiviWatch?'}
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          <div style={{ backgroundColor: 'rgba(52, 152, 219, 0.05)', padding: '25px', borderRadius: '12px', borderLeft: isRtl ? 'none' : '4px solid #3498db', borderRight: isRtl ? '4px solid #3498db' : 'none' }}>
            <h3 style={{ color: '#fff', marginBottom: '10px' }}>{isEn ? 'ISO-Grade Accuracy' : 'דיוק ברמת תקן ISO'}</h3>
            <p style={{ color: '#94a3b8', margin: 0, lineHeight: '1.5' }}>{isEn ? 'Our human review guarantees compliance with stringent regional regulations like the EU DSA.' : 'הבדיקה האנושית שלנו מבטיחה עמידה ברגולציות אזוריות מחמירות כגון ה-DSA האירופי.'}</p>
          </div>
          <div style={{ backgroundColor: 'rgba(46, 204, 113, 0.05)', padding: '25px', borderRadius: '12px', borderLeft: isRtl ? 'none' : '4px solid #2ecc71', borderRight: isRtl ? '4px solid #2ecc71' : 'none' }}>
            <h3 style={{ color: '#fff', marginBottom: '10px' }}>{isEn ? 'Scalable Operations' : 'תפעול מותאם אישית'}</h3>
            <p style={{ color: '#94a3b8', margin: 0, lineHeight: '1.5' }}>{isEn ? 'Access a managed workforce that scales instantly with your platform traffic spikes without the HR overhead.' : 'קבלו גישה לכוח אדם מנוהל המתרחב מיידית בהתאם לעומסי התעבורה שלכם, ללא כאב ראש ניהולי.'}</p>
          </div>
          <div style={{ backgroundColor: 'rgba(155, 89, 182, 0.05)', padding: '25px', borderRadius: '12px', borderLeft: isRtl ? 'none' : '4px solid #9b59b6', borderRight: isRtl ? '4px solid #9b59b6' : 'none' }}>
            <h3 style={{ color: '#fff', marginBottom: '10px' }}>{isEn ? 'Zero Bias' : 'אפס הטיה'}</h3>
            <p style={{ color: '#94a3b8', margin: 0, lineHeight: '1.5' }}>{isEn ? 'Multi-layered QA sampling and operator performance tracking ensures completely objective, standardized moderation.' : 'דגימות QA מרובות שכבות מבטיחות סינון אובייקטיבי וסטנדרטי לחלוטין.'}</p>
          </div>
        </div>
      </section>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};

export default HumanInTheLoop;