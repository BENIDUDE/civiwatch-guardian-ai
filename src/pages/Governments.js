import React from 'react';
import { Button } from '../components';

const Governments = ({ lang }) => {
  const isEn = lang === 'EN';

  // Shared Styles
  const sectionStyle = {
    marginBottom: '80px',
  };

  const cardStyle = {
    flex: '1',
    minWidth: '300px',
    backgroundColor: '#161b22',
    border: '1px solid #30363d',
    borderRadius: '16px',
    padding: '40px 30px',
    textAlign: 'center',
    transition: 'transform 0.3s ease, border-color 0.3s',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  };

  const articleCardStyle = {
    ...cardStyle,
    alignItems: isEn ? 'flex-start' : 'flex-end',
    textAlign: isEn ? 'left' : 'right',
    padding: '30px',
    backgroundColor: 'rgba(255,255,255,0.02)',
  };

  const iconStyle = {
    fontSize: '3rem',
    marginBottom: '20px'
  };

  return (
    <div style={{ padding: '60px 3%', width: '100%', maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', flex: 1, direction: isEn ? 'ltr' : 'rtl' }}>
      
      {/* 1. HERO SECTION */}
      <section style={{ textAlign: 'center', marginBottom: '80px', marginTop: '40px' }}>
        <h1 style={{ fontSize: '3.5rem', color: '#ffffff', marginBottom: '15px', fontWeight: '800', lineHeight: '1.2' }}>
          {isEn ? 'Securing the ' : 'אבטחת '}
          <br /><span style={{ color: '#3498db' }}>{isEn ? 'Public Digital Square' : 'כיכר העיר הדיגיטלית'}</span>
        </h1>
        <p style={{ fontSize: '1.25rem', color: '#b2bec3', maxWidth: '800px', margin: '0 auto', lineHeight: '1.6' }}>
          {isEn 
            ? 'Providing municipalities and national governments with actionable intelligence and automated systems to monitor public sentiment, prevent radicalization, and maintain civil discourse.' 
            : 'מספקים לרשויות מקומיות וממשלות מודיעין מעשי ומערכות אוטומטיות לניטור הלכי רוח בציבור, מניעת הקצנה ושמירה על שיח אזרחי.'}
        </p>
      </section>

      {/* 2. CORE FEATURES (From Screenshot) */}
      <section style={sectionStyle}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '30px', justifyContent: 'center' }}>
          
          <div style={cardStyle} onMouseOver={(e) => e.currentTarget.style.borderColor = '#3498db'} onMouseOut={(e) => e.currentTarget.style.borderColor = '#30363d'}>
            <div style={iconStyle}>🏛️</div>
            <h3 style={{ color: '#ffffff', fontSize: '1.5rem', marginBottom: '15px', marginTop: 0 }}>
              {isEn ? 'Public Safety Intelligence' : 'מודיעין לביטחון הציבור'}
            </h3>
            <p style={{ color: '#8b949e', lineHeight: '1.6', margin: 0 }}>
              {isEn 
                ? 'Detect coordinated bot campaigns, targeted misinformation, and threats to public safety before they manifest in the physical world.' 
                : 'איתור קמפיינים מתואמים של בוטים, דיסאינפורמציה ממוקדת ואיומים על ביטחון הציבור לפני שהם באים לידי ביטוי בעולם הפיזי.'}
            </p>
          </div>

          <div style={cardStyle} onMouseOver={(e) => e.currentTarget.style.borderColor = '#2ecc71'} onMouseOut={(e) => e.currentTarget.style.borderColor = '#30363d'}>
            <div style={iconStyle}>📊</div>
            <h3 style={{ color: '#ffffff', fontSize: '1.5rem', marginBottom: '15px', marginTop: 0 }}>
              {isEn ? 'Sentiment Analytics' : 'ניתוח סנטימנט'}
            </h3>
            <p style={{ color: '#8b949e', lineHeight: '1.6', margin: 0 }}>
              {isEn 
                ? 'Access a centralized dashboard mapping localized digital trends, allowing civic leaders to respond proactively to community concerns and escalating tensions.' 
                : 'גישה ללוח בקרה מרכזי הממפה מגמות דיגיטליות מקומיות, ומאפשר למנהיגי ציבור להגיב באופן יזום לדאגות הקהילה ומתיחויות גוברות.'}
            </p>
          </div>

          <div style={cardStyle} onMouseOver={(e) => e.currentTarget.style.borderColor = '#e74c3c'} onMouseOut={(e) => e.currentTarget.style.borderColor = '#30363d'}>
            <div style={iconStyle}>⚖️</div>
            <h3 style={{ color: '#ffffff', fontSize: '1.5rem', marginBottom: '15px', marginTop: 0 }}>
              {isEn ? 'Regulatory Compliance' : 'ציות רגולטורי'}
            </h3>
            <p style={{ color: '#8b949e', lineHeight: '1.6', margin: 0 }}>
              {isEn 
                ? 'Built to assist governmental bodies in enforcing digital safety laws and preparing for the global implementation of standardized digital moderation protocols.' 
                : 'מערכת שנועדה לסייע לגופים ממשלתיים באכיפת חוקי בטיחות דיגיטלית ובהכנה ליישום עולמי של פרוטוקולי סינון דיגיטליים סטנדרטיים.'}
            </p>
          </div>

        </div>
      </section>

      {/* 3. STANDARDIZED REPORTING & SLA (New Expanded Content) */}
      <section style={{ ...sectionStyle, backgroundColor: 'rgba(52, 152, 219, 0.05)', padding: '50px 40px', borderRadius: '20px', border: '1px solid rgba(52, 152, 219, 0.2)' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '40px', alignItems: 'center' }}>
          <div style={{ flex: '1', minWidth: '300px' }}>
            <h2 style={{ fontSize: '2.2rem', color: '#ffffff', marginBottom: '20px', marginTop: 0 }}>
              {isEn ? 'Standardized Reporting & Enforceable SLAs' : 'דיווח סטנדרטי ואכיפת SLA'}
            </h2>
            <p style={{ color: '#b2bec3', fontSize: '1.1rem', lineHeight: '1.7', marginBottom: '20px' }}>
              {isEn 
                ? 'Historically, governments have struggled to communicate effectively with massive social networks, relying on ad-hoc emails or decentralized portals. CiviWatch changes this.' 
                : 'היסטורית, ממשלות התקשו לתקשר ביעילות עם הרשתות החברתיות הענקיות, תוך הסתמכות על אימיילים אקראיים או פורטלים מבוזרים. CiviWatch משנה את התמונה.'}
            </p>
            <ul style={{ color: '#b2bec3', fontSize: '1.05rem', lineHeight: '1.8', paddingInlineStart: '20px', marginBottom: '30px' }}>
              <li><strong style={{ color: '#3498db' }}>{isEn ? 'Unified Pipeline: ' : 'ערוץ דיווח אחיד: '}</strong> {isEn ? 'A single, ISO-aligned conduit to flag illegal content across all major platforms.' : 'צינור אחד, מיושר עם תקני ISO, לסימון תוכן לא חוקי בכל הפלטפורמות המובילות.'}</li>
              <li><strong style={{ color: '#3498db' }}>{isEn ? 'Guaranteed SLAs: ' : 'זמני תגובה מובטחים (SLA): '}</strong> {isEn ? 'Legally binding Service Level Agreements ensuring severe threats are reviewed and removed within hours, not days.' : 'הסכמי רמת שירות המחייבים משפטית שבוחנים ומסירים איומים חמורים תוך שעות, לא ימים.'}</li>
              <li><strong style={{ color: '#3498db' }}>{isEn ? 'Courtroom-Ready Evidence: ' : 'ראיות קבילות משפטית: '}</strong> {isEn ? 'Every flagged incident is packaged with its AI metadata and human-validation trail.' : 'כל תקרית מסומנת נארזת עם מטא-דאטה של ה-AI ונתיב אימות אנושי שקוף.'}</li>
            </ul>
            <Button label={isEn ? 'Request Demo for Agencies' : 'בקשת הדגמה לסוכנויות ממשל'} onClick={() => window.location.href='/#/contact'} />
          </div>
          <div style={{ flex: '1', minWidth: '300px', display: 'flex', justifyContent: 'center' }}>
            {/* Visual representation of the pipeline */}
            <div style={{ backgroundColor: '#0d1117', padding: '30px', borderRadius: '16px', border: '1px solid #30363d', width: '100%', textAlign: 'center' }}>
              <div style={{ color: '#ffffff', fontWeight: 'bold', marginBottom: '10px' }}>{isEn ? 'Government Agency' : 'סוכנות ממשלתית'}</div>
              <div style={{ color: '#3498db', fontSize: '2rem' }}>↓</div>
              <div style={{ backgroundColor: 'rgba(52, 152, 219, 0.1)', border: '1px solid #3498db', padding: '15px', borderRadius: '8px', color: '#3498db', fontWeight: 'bold', margin: '10px 0' }}>
                CiviWatch Guardian AI<br/>
                <span style={{ fontSize: '0.85rem', fontWeight: 'normal' }}>{isEn ? 'SLA Enforced Pipeline' : 'צינור עם SLA נאכף'}</span>
              </div>
              <div style={{ color: '#3498db', fontSize: '2rem' }}>↓</div>
              <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '10px', color: '#b2bec3', fontSize: '0.9rem' }}>
                <span>Platform A</span>
                <span>Platform B</span>
                <span>Platform C</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. RELEVANT RESEARCH & ARTICLES */}
      <section style={sectionStyle}>
        <h2 style={{ fontSize: '2.2rem', color: '#ffffff', marginBottom: '40px', textAlign: 'center', marginTop: 0 }}>
          {isEn ? 'Global Regulatory Research' : 'מחקר ורגולציה גלובלית'}
        </h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'center' }}>
          
          {/* WEF Report */}
          <div style={articleCardStyle} onMouseOver={(e) => e.currentTarget.style.borderColor = '#8b949e'} onMouseOut={(e) => e.currentTarget.style.borderColor = '#30363d'}>
            <div style={{ color: '#3498db', fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '10px' }}>WORLD ECONOMIC FORUM</div>
            <h3 style={{ color: '#ffffff', fontSize: '1.3rem', marginBottom: '15px', marginTop: 0 }}>Global Risks Report 2024</h3>
            <p style={{ color: '#8b949e', lineHeight: '1.5', marginBottom: '20px', flex: 1 }}>
              {isEn 
                ? 'The WEF ranks AI-generated misinformation and disinformation as the #1 severe global risk over the next two years, directly threatening democratic elections.' 
                : 'הפורום הכלכלי העולמי מדרג דיסאינפורמציה מבוססת AI כסיכון העולמי החמור ביותר לשנתיים הקרובות, המאיים ישירות על בחירות דמוקרטיות.'}
            </p>
            <a href="https://www.weforum.org/publications/global-risks-report-2024/" target="_blank" rel="noopener noreferrer" style={{ color: '#ffffff', textDecoration: 'underline', fontWeight: 'bold' }}>
              {isEn ? 'Read Report ↗' : 'קראו את הדו"ח ↗'}
            </a>
          </div>

          {/* EU DSA */}
          <div style={articleCardStyle} onMouseOver={(e) => e.currentTarget.style.borderColor = '#8b949e'} onMouseOut={(e) => e.currentTarget.style.borderColor = '#30363d'}>
            <div style={{ color: '#3498db', fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '10px' }}>EUROPEAN COMMISSION</div>
            <h3 style={{ color: '#ffffff', fontSize: '1.3rem', marginBottom: '15px', marginTop: 0 }}>Digital Services Act (DSA)</h3>
            <p style={{ color: '#8b949e', lineHeight: '1.5', marginBottom: '20px', flex: 1 }}>
              {isEn 
                ? 'A groundbreaking regulatory framework establishing strict accountability, transparency, and moderation standards for very large online platforms (VLOPs).' 
                : 'מסגרת רגולטורית פורצת דרך הקובעת תקני אחריותיות, שקיפות וסינון מחמירים עבור פלטפורמות מקוונות גדולות מאוד (VLOPs).'}
            </p>
            <a href="https://commission.europa.eu/strategy-and-policy/priorities-2019-2024/europe-fit-digital-age/digital-services-act_en" target="_blank" rel="noopener noreferrer" style={{ color: '#ffffff', textDecoration: 'underline', fontWeight: 'bold' }}>
              {isEn ? 'Explore DSA ↗' : 'גלו את חוק ה-DSA ↗'}
            </a>
          </div>

          {/* UNESCO */}
          <div style={articleCardStyle} onMouseOver={(e) => e.currentTarget.style.borderColor = '#8b949e'} onMouseOut={(e) => e.currentTarget.style.borderColor = '#30363d'}>
            <div style={{ color: '#3498db', fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '10px' }}>UNITED NATIONS (UNESCO)</div>
            <h3 style={{ color: '#ffffff', fontSize: '1.3rem', marginBottom: '15px', marginTop: 0 }}>Guidelines for Internet Trust</h3>
            <p style={{ color: '#8b949e', lineHeight: '1.5', marginBottom: '20px', flex: 1 }}>
              {isEn 
                ? 'A global action plan aimed at safeguarding freedom of expression while explicitly countering hate speech and the rapid spread of digital misinformation.' 
                : 'תוכנית פעולה עולמית שנועדה לשמור על חופש הביטוי תוך מאבק מפורש בשנאה והתפשטות מהירה של דיסאינפורמציה דיגיטלית.'}
            </p>
            <a href="https://www.unesco.org/en/internet-trust" target="_blank" rel="noopener noreferrer" style={{ color: '#ffffff', textDecoration: 'underline', fontWeight: 'bold' }}>
              {isEn ? 'View Guidelines ↗' : 'צפו בהנחיות ↗'}
            </a>
          </div>

        </div>
      </section>

    </div>
  );
};

export default Governments;