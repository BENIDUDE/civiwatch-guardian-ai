import React from 'react';
import { Button } from '../components';

const MarketStrategy = ({ lang }) => {
  // Styles for the Phase Cards to match your screenshot
  const phaseCardStyle = {
    flex: '1',
    minWidth: '320px',
    backgroundColor: 'rgba(13, 22, 48, 0.7)',
    padding: '40px',
    borderRadius: '30px',
    border: '2px solid',
    display: 'flex',
    flexDirection: 'column',
    textAlign: lang === 'HE' ? 'right' : 'left',
  };

  const badgeStyle = {
    display: 'inline-block',
    padding: '8px 20px',
    borderRadius: '20px',
    fontSize: '0.9rem',
    fontWeight: 'bold',
    marginBottom: '20px',
    border: '1px solid',
  };

  const listStyle = {
    listStyleType: 'none',
    padding: 0,
    marginTop: '20px',
    lineHeight: '1.8',
    color: '#b2bec3',
  };

  return (
    <div style={{ padding: '20px 3%', width: '100%', maxWidth: 'none', margin: '0 auto' }}>
      
      {/* Hero Section */}
      <section style={{ textAlign: 'center', margin: '60px 0 80px' }}>
        <h1 style={{ fontSize: '3.8rem', color: '#ffffff', marginBottom: '20px', fontWeight: '800' }}>
          {lang === 'EN' ? 'Go-To-Market Strategy' : 'אסטרטגיית חדירה לשוק'}
        </h1>
        <p style={{ fontSize: '1.4rem', color: '#3498db', fontWeight: 'bold', marginBottom: '10px' }}>
          {lang === 'EN' ? 'Lean, Scalable, & High-Impact' : 'רזה, מדורג ובעל השפעה מקסימלית'}
        </p>
        <p style={{ fontSize: '1.25rem', color: '#b2bec3', maxWidth: '900px', margin: '0 auto', lineHeight: '1.6' }}>
          {lang === 'EN' 
            ? 'CiviWatch Guardian AI operates on a lean, scalable hybrid model. We do not burn capital building redundant AI engines; instead, we orchestrate existing, world-class 3rd-party AI and provide the essential layer of Human-in-the-Loop validation.' 
            : 'המערכת פועלת במודל היברידי, רזה וניתן להרחבה (Scalable). אנחנו לא שורפים הון על פיתוח מנועי AI כפולים; במקום זאת, אנו מתזמרים כלי AI צד-שלישי קיימים ומובילים, ומספקים את השכבה הקריטית של אימות אנושי.'}
        </p>
      </section>

      {/* Revenue Model Section */}
      <section style={{ margin: '80px 0', padding: '40px', backgroundColor: 'rgba(52, 152, 219, 0.05)', borderRadius: '16px', border: '1px solid rgba(52, 152, 219, 0.2)' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 style={{ color: '#ffffff', fontSize: '2.5rem', marginBottom: '15px' }}>
            {lang === 'EN' ? 'Revenue Model' : 'מודל הכנסות'}
          </h2>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '30px', justifyContent: 'center' }}>
          <div style={{ flex: '1', minWidth: '300px', backgroundColor: 'rgba(255,255,255,0.02)', padding: '30px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '15px' }}>📅</div>
            <h3 style={{ color: '#3498db', fontSize: '1.5rem', marginBottom: '15px' }}>
              {lang === 'EN' ? 'Annual Subscription (SaaS)' : 'מנוי שנתי (SaaS)'}
            </h3>
            <p style={{ color: '#b2bec3', lineHeight: '1.6' }}>
              {lang === 'EN' 
                ? 'Platforms and social networks subscribe to our orchestration and human-in-the-loop ecosystem through a fixed annual licensing fee.' 
                : 'רשתות חברתיות ופלטפורמות נרשמות לאקו-סיסטם שלנו בתשלום רישוי שנתי קבוע.'}
            </p>
          </div>
          <div style={{ flex: '1', minWidth: '300px', backgroundColor: 'rgba(255,255,255,0.02)', padding: '30px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '15px' }}>🤝</div>
            <h3 style={{ color: '#2ecc71', fontSize: '1.5rem', marginBottom: '15px' }}>
              {lang === 'EN' ? 'Partner Revenue-Share' : 'תוכנית חלוקת רווחים'}
            </h3>
            <p style={{ color: '#b2bec3', lineHeight: '1.6' }}>
              {lang === 'EN' 
                ? 'Strategic partners who successfully refer relevant clients that close a deal receive a percentage of the contract value.' 
                : 'גורמים וארגונים שיפנו לקוחות רלוונטיים שייסגרו בעסקה, יקבלו אחוזים מתוך שווי החוזה כעמלת הפניה.'}
            </p>
          </div>
        </div>
      </section>

      {/* The Two-Phase Rollout - Restored Visual Style */}
      <section style={{ margin: '80px 0' }}>
        <h2 style={{ color: '#ffffff', textAlign: 'center', marginBottom: '50px', fontSize: '2.5rem' }}>
          {lang === 'EN' ? 'The Two-Phase Rollout' : 'תוכנית ההשקה הדו-שלבית'}
        </h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '30px', justifyContent: 'center', alignItems: 'stretch' }}>
          
          {/* Phase 1 Card */}
          <div style={{ ...phaseCardStyle, borderColor: '#3498db' }}>
            <div style={{ ...badgeStyle, borderColor: '#3498db', color: '#3498db', backgroundColor: 'rgba(52, 152, 219, 0.1)' }}>
              {lang === 'EN' ? "Phase 1: The 'Lighthouse' Strategy" : "שלב 1: אסטרטגיית 'המגדלור'"}
            </div>
            <h2 style={{ color: '#ffffff', fontSize: '2.2rem', marginBottom: '20px', marginTop: 0 }}>
              {lang === 'EN' ? 'NGOs & Civil Society' : 'ארגוני מגזר שלישי'}
            </h2>
            <p style={{ color: '#b2bec3', fontSize: '1.1rem', lineHeight: '1.7' }}>
              {lang === 'EN' 
                ? 'We establish market authority by providing our platform to NGOs and advocacy groups. By empowering them to identify and flag systemic hate speech, we generate undeniable reports on platform toxicity.' 
                : 'אנו מבססים סמכות שוק על ידי אספקת הפלטפורמה לארגוני מגזר שלישי. על ידי העצמתם בזיהוי וסימון דברי שטנה מערכתיים, אנו מייצרים דוחות מגובים בנתונים על רעילות בפלטפורמות.'}
            </p>
            <ul style={listStyle}>
              <li><span style={{ color: '#3498db', margin: '0 10px' }}>▸</span> {lang === 'EN' ? 'Establishes CiviWatch as an objective authority.' : 'מבסס את CiviWatch כסמכות אובייקטיבית.'}</li>
              <li><span style={{ color: '#3498db', margin: '0 10px' }}>▸</span> {lang === 'EN' ? 'Creates regulatory pressure on social networks.' : 'מייצר לחץ רגולטורי על הרשתות.'}</li>
              <li><span style={{ color: '#3498db', margin: '0 10px' }}>▸</span> {lang === 'EN' ? 'Perfects the Human-in-the-loop (HITL) workflows.' : 'משכלל את תהליכי האימות האנושי.'}</li>
            </ul>
          </div>

          {/* Phase 2 Card */}
          <div style={{ ...phaseCardStyle, borderColor: '#2ecc71' }}>
            <div style={{ ...badgeStyle, borderColor: '#2ecc71', color: '#2ecc71', backgroundColor: 'rgba(46, 204, 113, 0.1)' }}>
              {lang === 'EN' ? "Phase 2: B2B Integration" : "שלב 2: אינטגרציית B2B"}
            </div>
            <h2 style={{ color: '#ffffff', fontSize: '2.2rem', marginBottom: '20px', marginTop: 0 }}>
              {lang === 'EN' ? 'Social Networks & Platforms' : 'רשתות חברתיות ופלטפורמות'}
            </h2>
            <p style={{ color: '#b2bec3', fontSize: '1.1rem', lineHeight: '1.7' }}>
              {lang === 'EN' 
                ? 'Facing mounting fines and pressure, platforms are offered CiviWatch as the ultimate B2B solution. We provide dedicated HITL services as an outsourced benchmark, cutting costs and bridging the trust gap.' 
                : 'מול קנסות רגולטוריים ולחץ ציבורי, הרשתות מקבלות את CiviWatch כפתרון B2B האולטימטיבי. אנו מספקים שירותי "אדם בלולאה" כסמן חיצוני, חוסכים בעלויות ומגשרים על פער האמון.'}
            </p>
            <ul style={listStyle}>
              <li><span style={{ color: '#2ecc71', margin: '0 10px' }}>▸</span> {lang === 'EN' ? 'Direct API integration for automated orchestration.' : 'שילוב API ישיר לתזמור אוטומטי.'}</li>
              <li><span style={{ color: '#2ecc71', margin: '0 10px' }}>▸</span> {lang === 'EN' ? 'Saves networks internal AI and moderation OPEX.' : 'חוסך בעלויות תפעול על AI וסינון פנימי.'}</li>
              <li><span style={{ color: '#2ecc71', margin: '0 10px' }}>▸</span> {lang === 'EN' ? "Grants platforms the 'ISO Digital Safety' mark." : "מעניק לפלטפורמות את תו תקן הבטיחות הדיגיטלית."}</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Roadmap Section - Updated Dates */}
      <section style={{ margin: '100px 0' }}>
        <h2 style={{ color: '#ffffff', textAlign: 'center', marginBottom: '40px', fontSize: '2.5rem' }}>
          {lang === 'EN' ? 'Strategic Roadmap' : 'מפת דרכים אסטרטגית'}
        </h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'center' }}>
          {[
            { date: 'Q3 2026', title: lang === 'EN' ? 'NGO Pilot' : 'פיילוט NGO', color: '#3498db' },
            { date: 'Q3 2027', title: lang === 'EN' ? 'B2B Launch' : 'השקה מסחרית', color: '#2ecc71' },
            { date: 'Q1 2028', title: lang === 'EN' ? 'Expansion' : 'התרחבות', color: '#e74c3c' }
          ].map((item, index) => (
            <div key={index} style={{ flex: '1', minWidth: '200px', padding: '30px', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '20px', borderTop: `4px solid ${item.color}`, textAlign: 'center' }}>
              <div style={{ color: item.color, fontWeight: 'bold', marginBottom: '10px' }}>{item.date}</div>
              <div style={{ color: '#ffffff', fontSize: '1.2rem' }}>{item.title}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Future Pivots */}
      <section style={{ margin: '80px 0' }}>
        <h2 style={{ color: '#ffffff', textAlign: 'center', marginBottom: '40px', fontSize: '2.5rem' }}>
          {lang === 'EN' ? 'Future Expansion Pivots' : 'צירי התרחבות עתידיים'}
        </h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '30px', justifyContent: 'center' }}>
          <div style={{ flex: '1', minWidth: '300px', backgroundColor: 'rgba(255,255,255,0.02)', padding: '30px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <h3 style={{ color: '#ffffff' }}>{lang === 'EN' ? '🤖 GenAI Auditing' : '🤖 ביקורת GenAI'}</h3>
            <p style={{ color: '#b2bec3' }}>{lang === 'EN' ? 'Providing safety benchmarks and bias testing for LLMs and image generation models.' : 'מתן מדדי בטיחות ובדיקות הטיות למודלי שפה ומחוללי תמונות.'}</p>
          </div>
          <div style={{ flex: '1', minWidth: '300px', backgroundColor: 'rgba(255,255,255,0.02)', padding: '30px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <h3 style={{ color: '#ffffff' }}>{lang === 'EN' ? '👓 VR Safety' : '👓 בטיחות VR'}</h3>
            <p style={{ color: '#b2bec3' }}>{lang === 'EN' ? 'Creating behavioral benchmarks and spatial harassment detection for Metaverse platforms.' : 'יצירת מדדי התנהגות וזיהוי הטרדה מרחבית עבור פלטפורמות מטאברס.'}</p>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section style={{ textAlign: 'center', margin: '100px 0', padding: '60px 20px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
        <h2 style={{ color: '#3498db', marginTop: 0, fontSize: '2.5rem' }}>{lang === 'EN' ? 'Ready to explore more?' : 'מוכנים לגלות עוד?'}</h2>
        <div style={{ maxWidth: '300px', margin: '0 auto' }}>
          <Button label={lang === 'EN' ? 'Schedule a Meeting' : 'קבע פגישה'} onClick={() => window.location.href='/#/contact'} />
        </div>
      </section>
      
    </div>
  );
};

export default MarketStrategy;