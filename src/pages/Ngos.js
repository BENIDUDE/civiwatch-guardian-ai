import React from 'react';
import { Card, Button } from '../components';

const Ngos = ({ lang }) => {
  const isEn = lang === 'EN';

  // Helper function for the expanded modal content layout
  const ExpandedLayout = ({ bulletsEn, bulletsHe, advantageEn, advantageHe }) => (
    <div style={{ textAlign: lang === 'HE' ? 'right' : 'left', direction: lang === 'HE' ? 'rtl' : 'ltr' }}>
      <ul style={{ paddingInlineStart: '20px', marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {lang === 'EN' ? bulletsEn.map((b, i) => <li key={i}>{b}</li>) : bulletsHe.map((b, i) => <li key={i}>{b}</li>)}
      </ul>
      <div style={{ backgroundColor: 'rgba(46, 204, 113, 0.1)', padding: '15px', borderRadius: '8px', borderLeft: lang === 'EN' ? '4px solid #2ecc71' : 'none', borderRight: lang === 'HE' ? '4px solid #2ecc71' : 'none' }}>
        <strong style={{ color: '#2ecc71' }}>{lang === 'EN' ? 'Advocacy Advantage: ' : 'יתרון הסברה: '}</strong>
        {lang === 'EN' ? advantageEn : advantageHe}
      </div>
    </div>
  );

  return (
    <div style={{ padding: '60px 3%', width: '100%', maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', flex: 1, direction: isEn ? 'ltr' : 'rtl' }}>
      
      {/* 1. HERO SECTION */}
      <section style={{ textAlign: 'center', marginBottom: '80px', marginTop: '20px' }}>
        <h1 style={{ fontSize: '3.5rem', color: '#ffffff', marginBottom: '15px', fontWeight: '800', lineHeight: '1.2' }}>
          {isEn ? 'Protecting ' : 'מגנים על '}
          <br /><span style={{ color: '#3498db' }}>{isEn ? 'Civil Society' : 'החברה האזרחית'}</span>
        </h1>
        <p style={{ fontSize: '1.25rem', color: '#b2bec3', maxWidth: '800px', margin: '0 auto', lineHeight: '1.6' }}>
          {isEn 
            ? 'Equipping non-profits and advocacy groups with enterprise-grade AI tools to track hate speech, protect vulnerable populations, and back their social agendas with hard data.' 
            : 'מציידים עמותות וארגוני חברה אזרחית בכלים של בינה מלאכותית ברמת תאגיד למעקב אחר שפת שטנה, הגנה על אוכלוסיות פגיעות וגיבוי המאבקים החברתיים שלהם בנתונים מוצקים.'}
        </p>
      </section>

      {/* 2. CORE CAPABILITIES (Interactive Cards) */}
      <section style={{ marginBottom: '80px' }}>
        <h2 style={{ color: '#ffffff', textAlign: 'center', marginBottom: '40px', fontSize: '2.5rem' }}>
          {isEn ? 'Tools for Modern Advocacy' : 'כלים למאבק חברתי מודרני'}
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '25px' }}>
          
          <Card 
            title={isEn ? "🤝 Safeguard Activists" : "🤝 הגנה על פעילים"} 
            content={isEn ? "Proactively identify and mitigate targeted harassment campaigns against your volunteers, leaders, and the communities you serve." : "זיהוי והפחתה אקטיבית של קמפיינים ממוקדים של הטרדה נגד המתנדבים, המנהיגים והקהילות שאתם משרתים."} 
            extendedTitle={isEn ? 'Anti-Harassment & Anti-Doxing' : 'מניעת הטרדות וחשיפת פרטים אישיים (Doxing)'}
            lang={lang}
            extendedContent={<ExpandedLayout 
              bulletsEn={[
                "Early warning alerts for coordinated cyberbullying and doxing attempts targeting NGO personnel.",
                "Automated mapping of antagonistic networks to identify the source of harassment.",
                "Real-time filtering to keep your organization's own comment sections and digital forums safe spaces."
              ]}
              bulletsHe={[
                "התראות מוקדמות על בריונות רשת מתואמת וניסיונות חשיפת פרטים אישיים (Doxing) של צוות העמותה.",
                "מיפוי אוטומטי של רשתות עוינות כדי לזהות את מקור ההטרדה.",
                "סינון בזמן אמת כדי לשמור על מדורי התגובות והפורומים הדיגיטליים של הארגון כמרחבים בטוחים."
              ]}
              advantageEn="Protects the mental health and physical safety of your frontline workers, ensuring your mission isn't derailed by bad actors."
              advantageHe="מגן על הבריאות הנפשית והבטיחות הפיזית של פעילי השטח שלכם, ומבטיח שהמשימה שלכם לא תשובש על ידי גורמים עוינים."
            />}
          />
          
          <Card 
            title={isEn ? "📊 Data-Driven Proof" : "📊 קידום מדיניות מבוסס נתונים"} 
            content={isEn ? "Utilize our dashboard to aggregate data, providing undeniable statistical proof of systemic discrimination to support your lobbying." : "השתמשו בלוח הבקרה שלנו לאיסוף נתונים, וקבלו הוכחות סטטיסטיות חד-משמעיות לאפליה מערכתית לתמיכה בקידום מדיניות."} 
            extendedTitle={isEn ? 'Legislative Evidence Generation' : 'הפקת ראיות לקידום חקיקה'}
            lang={lang}
            extendedContent={<ExpandedLayout 
              bulletsEn={[
                "Track specific dog-whistles, slurs, or narratives relevant to your NGO's specific cause.",
                "Export court-ready and legislative-ready statistical reports showing the exact velocity and volume of targeted hate.",
                "Monitor how quickly major platforms (X, Meta, TikTok) respond to your community's reports to hold them publicly accountable."
              ]}
              bulletsHe={[
                "מעקב אחר קודי-שנאה (Dog-whistles), השמצות או נרטיבים ספציפיים הרלוונטיים למטרה של העמותה שלכם.",
                "ייצוא דוחות סטטיסטיים הקבילים משפטית המראים את המהירות והנפח המדויקים של שנאה ממוקדת.",
                "ניטור מהירות התגובה של פלטפורמות מובילות לדיווחי הקהילה שלכם, כדי לדרוש מהן דין וחשבון ציבורי."
              ]}
              advantageEn="Turns anecdotal complaints from your community into undeniable, hard data that politicians and regulators cannot ignore."
              advantageHe="הופך תלונות אנקדוטליות מהקהילה שלכם לנתונים קשיחים ובלתי ניתנים להכחשה שפוליטיקאים ורגולטורים לא יכולים להתעלם מהם."
            />}
          />
          
          <Card 
            title={isEn ? "💡 Resource Efficient" : "💡 סינון יעיל וחסכוני"} 
            content={isEn ? "Enterprise-level AI structured specifically to act as a force-multiplier for the limited budgets and human resources of non-profits." : "בינה מלאכותית ברמת תאגיד המובנית במיוחד לשמש כמכפיל-כוח לתקציבים ולמשאבי האנוש המוגבלים של עמותות."} 
            extendedTitle={isEn ? 'Force-Multiplier for Small Teams' : 'מכפיל-כוח לצוותים קטנים'}
            lang={lang}
            extendedContent={<ExpandedLayout 
              bulletsEn={[
                "Replaces the need for large teams of manual community moderators.",
                "The AI automatically handles the 'toxic noise', so your human volunteers only spend time reviewing highly complex or critical edge-cases.",
                "No coding required: Plugs directly into your existing social channels and websites."
              ]}
              bulletsHe={[
                "מחליף את הצורך בצוותים גדולים של מנהלי קהילות ידניים.",
                "ה-AI מטפל אוטומטית ב'רעש הרעיל', כך שהמתנדבים האנושיים שלכם משקיעים זמן רק בבחינת מקרי קצה מורכבים או קריטיים.",
                "אין צורך בקידוד: מתחבר ישירות לערוצי המדיה החברתית והאתרים הקיימים שלכם."
              ]}
              advantageEn="Prevents severe moderator burnout—a major issue in the NGO sector—while maximizing your limited operational budget."
              advantageHe="מונע שחיקה נפשית חמורה בקרב מנהלי קהילות – בעיה מרכזית במגזר העמותות – תוך מיקסום התקציב התפעולי המוגבל."
            />}
          />
        </div>
      </section>

      {/* 3. NEW: NGO PARTNERSHIP PROGRAM (The Sales Pitch) */}
      <section style={{ marginBottom: '80px', backgroundColor: 'rgba(46, 204, 113, 0.05)', padding: '50px 40px', borderRadius: '20px', border: '1px solid rgba(46, 204, 113, 0.2)' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '40px', alignItems: 'center' }}>
          <div style={{ flex: '1', minWidth: '300px' }}>
            <div style={{ color: '#2ecc71', fontWeight: 'bold', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>
              {isEn ? 'Subsidized Access' : 'גישה מסובסדת'}
            </div>
            <h2 style={{ fontSize: '2.2rem', color: '#ffffff', marginBottom: '20px', marginTop: 0 }}>
              {isEn ? 'The Civil Society Partnership Program' : 'תוכנית השותפויות לחברה האזרחית'}
            </h2>
            <p style={{ color: '#b2bec3', fontSize: '1.1rem', lineHeight: '1.7', marginBottom: '20px' }}>
              {isEn 
                ? 'We view Non-Governmental Organizations as our most critical partners. NGOs are on the front lines, identifying the newest forms of radicalization and systemic abuse before anyone else.' 
                : 'אנו רואים בארגונים לא ממשלתיים את השותפים הקריטיים ביותר שלנו. עמותות נמצאות בחזית, ומזהות את הצורות החדשות ביותר של הקצנה והתעללות מערכתית לפני כולם.'}
            </p>
            <p style={{ color: '#b2bec3', fontSize: '1.1rem', lineHeight: '1.7', marginBottom: '20px' }}>
              {isEn 
                ? 'That is why we offer heavily discounted—and in qualifying cases, completely free—access to the full CiviWatch Guardian AI enterprise suite. You get the tools to protect your people and advance your agenda. In return, your verified reports help us continuously train our models against emerging global threats.' 
                : 'לכן אנו מציעים גישה מסובסדת מאוד – ובמקרים מתאימים, חינמית לחלוטין – למערכת המלאה של CiviWatch Guardian AI. אתם מקבלים את הכלים להגן על האנשים שלכם ולקדם את סדר היום שלכם. בתמורה, הדיווחים המאומתים שלכם עוזרים לנו לאמן באופן רציף את המודלים שלנו נגד איומים גלובליים מתעוררים.'}
            </p>
          </div>
          <div style={{ flex: '1', minWidth: '300px', display: 'flex', justifyContent: 'center' }}>
            <div style={{ backgroundColor: '#0d1117', padding: '30px', borderRadius: '16px', border: '1px solid #30363d', width: '100%', textAlign: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
              <div style={{ fontSize: '3rem', marginBottom: '15px' }}>🌍</div>
              <h3 style={{ color: '#ffffff', margin: '0 0 15px 0' }}>{isEn ? 'Apply for Partnership' : 'הגשת מועמדות לשותפות'}</h3>
              <p style={{ color: '#8b949e', fontSize: '0.9rem', marginBottom: '25px' }}>
                {isEn ? 'Available for registered 501(c)(3) / Amutot (עמותות) operating in civil rights, child safety, or anti-discrimination.' : 'זמין לעמותות רשומות הפועלות בתחומי זכויות אזרח, בטיחות ילדים או מאבק באפליה.'}
              </p>
              <Button label={isEn ? 'Submit Application' : 'הגשת בקשה'} onClick={() => window.location.href='/#/contact'} style={{ width: '100%' }} />
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Ngos;