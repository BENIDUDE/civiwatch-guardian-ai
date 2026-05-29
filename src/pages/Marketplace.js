import React from 'react';
import { Card, Button } from '../components';

const Marketplace = ({ lang }) => {
  const isEn = lang === 'EN';

  const ExpandedLayout = ({ bulletsEn, bulletsHe, advantageEn, advantageHe }) => (
    <div style={{ textAlign: lang === 'HE' ? 'right' : 'left', direction: lang === 'HE' ? 'rtl' : 'ltr' }}>
      <ul style={{ paddingInlineStart: '20px', marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {lang === 'EN' ? bulletsEn.map((b, i) => <li key={i}>{b}</li>) : bulletsHe.map((b, i) => <li key={i}>{b}</li>)}
      </ul>
      <div style={{ backgroundColor: 'rgba(46, 204, 113, 0.1)', padding: '15px', borderRadius: '8px', borderLeft: lang === 'EN' ? '4px solid #2ecc71' : 'none', borderRight: lang === 'HE' ? '4px solid #2ecc71' : 'none' }}>
        <strong style={{ color: '#2ecc71' }}>{lang === 'EN' ? 'Business Value: ' : 'ערך עסקי: '}</strong>
        {lang === 'EN' ? advantageEn : advantageHe}
      </div>
    </div>
  );

  return (
    <div style={{ padding: '60px 3%', width: '100%', maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', flex: 1, direction: isEn ? 'ltr' : 'rtl' }}>
      
      <section style={{ textAlign: 'center', marginBottom: '80px', marginTop: '20px' }}>
        <h1 style={{ fontSize: '3.5rem', color: '#ffffff', marginBottom: '15px', fontWeight: '800', lineHeight: '1.2' }}>
          {isEn ? 'The Guardian ' : 'זירת ה-'}
          <span style={{ color: '#3498db' }}>{isEn ? 'AI Marketplace' : 'AI המוסמכת'}</span>
        </h1>
        <p style={{ fontSize: '1.25rem', color: '#b2bec3', maxWidth: '800px', margin: '0 auto', lineHeight: '1.6' }}>
          {isEn 
            ? 'A centralized hub connecting global platforms with top-tier, certified AI detection models. We orchestrate the ecosystem, allowing developers to monetize their engines while giving platforms plug-and-play regulatory compliance.' 
            : 'מרכז המחבר בין פלטפורמות גלובליות למודלים מובילים ומוסמכים לזיהוי תוכן. אנו מנהלים את האקוסיסטם, מאפשרים למפתחים לייצר הכנסות מהמנועים שלהם, ומעניקים לפלטפורמות תאימות רגולטורית מיידית.'}
        </p>
      </section>

      <section style={{ marginBottom: '80px' }}>
        <h2 style={{ color: '#ffffff', textAlign: 'center', marginBottom: '40px', fontSize: '2.5rem' }}>
          {isEn ? 'Marketplace Architecture' : 'ארכיטקטורת הזירה'}
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '25px' }}>
          
          <Card 
            title={isEn ? "🔌 Agnostic API Routing" : "🔌 ניתוב API אובייקטיבי"} 
            content={isEn ? "Our core engine seamlessly routes specific types of toxic content to the third-party models best suited to detect them." : "מנוע הליבה שלנו מנתב באופן חלק סוגים ספציפיים של תוכן רעיל למודלי צד-שלישי המתאימים ביותר לזיהוי שלהם."} 
            extendedTitle={isEn ? 'Smart Model Routing' : 'ניתוב מודלים חכם'}
            lang={lang}
            extendedContent={<ExpandedLayout 
              bulletsEn={["Dynamic load balancing across multiple supplier models.", "Fall-back redundancy ensures zero downtime for end-clients.", "Unified billing: Clients pay one invoice, we distribute royalties."]}
              bulletsHe={["איזון עומסים דינמי על פני מספר מודלים של ספקים.", "יתירות גיבוי (Fall-back) המבטיחה אפס זמן השבתה ללקוחות הקצה.", "חיוב אחוד: הלקוחות משלמים חשבונית אחת, אנו מחלקים תמלוגים."]}
              advantageEn="Clients avoid vendor lock-in and constantly benefit from the newest algorithms without changing their API."
              advantageHe="לקוחות נמנעים מנעילת ספק ונהנים כל העת מהאלגוריתמים החדשים ביותר ללא שינוי ה-API שלהם."
            />}
          />
          
          <Card 
            title={isEn ? "📈 Monetization for Suppliers" : "📈 ייצור הכנסות לספקים"} 
            content={isEn ? "Boutique AI labs and developers can plug their specialized models into our network and generate revenue based on API call volume." : "מעבדות AI ומפתחי בוטיק יכולים לחבר את המודלים הייעודיים שלהם לרשת שלנו ולייצר הכנסות על בסיס נפח קריאות API."} 
            extendedTitle={isEn ? 'Supplier Revenue Streams' : 'אפיקי הכנסה לספקים'}
            lang={lang}
            extendedContent={<ExpandedLayout 
              bulletsEn={["Transparent, usage-based royalty payouts.", "Access to enterprise-level clients you wouldn't reach alone.", "Anonymized, safe feedback loops to help train your next iteration."]}
              bulletsHe={["תשלומי תמלוגים שקופים מבוססי-שימוש.", "גישה ללקוחות אנטרפרייז שלא הייתם מגיעים אליהם לבד.", "לולאות משוב אנונימיות ובטוחות שיעזרו לאמן את הגרסה הבאה שלכם."]}
              advantageEn="Turns specialized R&D (e.g., an AI that perfectly detects Arabic hate speech) into an immediate, scalable SaaS business."
              advantageHe="הופך מחקר ופיתוח ייעודי (למשל, AI שמזהה בצורה מושלמת שפת שטנה בערבית) לעסק SaaS מיידי וניתן להרחבה."
            />}
          />
        </div>
      </section>

      {/* SUPPLIER ONBOARDING (COST-BASED AUDIT) */}
      <section style={{ marginBottom: '80px', backgroundColor: 'rgba(243, 156, 18, 0.05)', padding: '50px 40px', borderRadius: '20px', border: '1px solid rgba(243, 156, 18, 0.2)' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '40px', alignItems: 'center' }}>
          <div style={{ flex: '1', minWidth: '300px' }}>
            <div style={{ color: '#f39c12', fontWeight: 'bold', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>
              {isEn ? 'Premium Verification' : 'אימות פרימיום'}
            </div>
            <h2 style={{ fontSize: '2.2rem', color: '#ffffff', marginBottom: '20px', marginTop: 0 }}>
              {isEn ? 'The Certification Audit' : 'מבדק הסמכת ספקים'}
            </h2>
            <p style={{ color: '#b2bec3', fontSize: '1.1rem', lineHeight: '1.7', marginBottom: '20px' }}>
              {isEn 
                ? 'To maintain the integrity and ISO-compliance of the Guardian network, all third-party models must pass our rigorous, paid Certification Audit before being listed.' 
                : 'כדי לשמור על יושרת הרשת ותאימות ל-ISO, כל מודל צד-שלישי חייב לעבור את מבדק ההסמכה הקפדני (בתשלום) שלנו לפני פרסומו בזירה.'}
            </p>
            <ul style={{ color: '#b2bec3', fontSize: '1.05rem', lineHeight: '1.8', paddingInlineStart: '20px' }}>
              <li><strong style={{ color: '#f39c12' }}>{isEn ? 'Bias & Accuracy Testing: ' : 'בדיקת הטיות ודיוק: '}</strong> {isEn ? 'Stress-testing your engine against our proprietary toxic datasets.' : 'מבחני מאמץ למנוע שלכם מול מאגרי הנתונים הרעילים הייחודיים שלנו.'}</li>
              <li><strong style={{ color: '#f39c12' }}>{isEn ? 'Latency & Scale: ' : 'זמני תגובה ויכולת הרחבה: '}</strong> {isEn ? 'Ensuring your architecture can handle enterprise-level API loads.' : 'וידוא שהארכיטקטורה שלכם יכולה לעמוד בעומסי API ברמת אנטרפרייז.'}</li>
              <li><strong style={{ color: '#f39c12' }}>{isEn ? 'Regulatory Compliance: ' : 'תאימות רגולטורית: '}</strong> {isEn ? 'Verifying your data handling complies with GDPR, CCPA, and AI Acts.' : 'אימות שניהול הנתונים שלכם עומד בתקנות GDPR, CCPA וחוקי AI.'}</li>
            </ul>
            <div style={{ marginTop: '30px' }}>
              <Button label={isEn ? 'Apply for Certification' : 'הגשת בקשה להסמכה'} onClick={() => window.location.href='/#/contact'} />
            </div>
          </div>
          <div style={{ flex: '1', minWidth: '300px', display: 'flex', justifyContent: 'center' }}>
            <div style={{ backgroundColor: '#0d1117', padding: '40px', borderRadius: '16px', border: '1px solid #f39c12', textAlign: 'center', boxShadow: '0 10px 40px rgba(243, 156, 18, 0.1)' }}>
              <div style={{ fontSize: '4rem', marginBottom: '10px' }}>🏅</div>
              <h3 style={{ color: '#f39c12', margin: '0 0 10px 0' }}>{isEn ? 'CiviWatch Certified' : 'מוסמך CiviWatch'}</h3>
              <p style={{ color: '#8b949e', fontSize: '0.9rem', margin: 0 }}>
                {isEn ? 'The gold standard for AI moderation models.' : 'תו התקן לחלוצי מודלים של סינון AI.'}
              </p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Marketplace;