import React from 'react';
import { Card, Button } from '../components';

const SocialNetworks = ({ lang }) => {
  const isEn = lang === 'EN';

  // Helper function for clickable links inside the modal that won't close it
  const ModalLink = ({ href, children }) => (
    <a 
      href={href} 
      target="_blank" 
      rel="noopener noreferrer" 
      style={{ color: '#3498db', textDecoration: 'underline', fontWeight: 'bold' }}
      onClick={(e) => e.stopPropagation()}
    >
      {children}
    </a>
  );

  // Helper function for the expanded modal content layout
  const ExpandedLayout = ({ bulletsEn, bulletsHe, advantageEn, advantageHe }) => (
    <div style={{ textAlign: lang === 'HE' ? 'right' : 'left', direction: lang === 'HE' ? 'rtl' : 'ltr' }}>
      <ul style={{ paddingInlineStart: '20px', marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {lang === 'EN' ? bulletsEn.map((b, i) => <li key={i}>{b}</li>) : bulletsHe.map((b, i) => <li key={i}>{b}</li>)}
      </ul>
      <div style={{ backgroundColor: 'rgba(46, 204, 113, 0.1)', padding: '15px', borderRadius: '8px', borderLeft: lang === 'EN' ? '4px solid #2ecc71' : 'none', borderRight: lang === 'HE' ? '4px solid #2ecc71' : 'none' }}>
        <strong style={{ color: '#2ecc71' }}>{lang === 'EN' ? 'Advantage: ' : 'יתרון: '}</strong>
        {lang === 'EN' ? advantageEn : advantageHe}
      </div>
    </div>
  );

  return (
    <div style={{ padding: '60px 3%', width: '100%', maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', flex: 1, direction: isEn ? 'ltr' : 'rtl' }}>
      
      {/* 1. HERO SECTION */}
      <section style={{ textAlign: 'center', marginBottom: '80px', marginTop: '20px' }}>
        <h1 style={{ fontSize: '3.5rem', color: '#ffffff', marginBottom: '15px', fontWeight: '800', lineHeight: '1.2' }}>
          {isEn ? 'Securing the ' : 'אבטחת '}
          <br /><span style={{ color: '#3498db' }}>{isEn ? 'Social Sphere' : 'המרחב החברתי'}</span>
        </h1>
        <p style={{ fontSize: '1.25rem', color: '#b2bec3', maxWidth: '800px', margin: '0 auto', lineHeight: '1.6' }}>
          {isEn 
            ? <React.Fragment>Real-time monitoring and Human in the Loop orchestration for User-Generated Content (UGC).<br />We help platforms maintain compliance, protect their communities at scale, and reduce internal moderation costs.</React.Fragment>
            : <React.Fragment>ניטור בזמן אמת ותזמור אנשים-בלולאה (Human in the Loop) לתוכן גולשים.<br />אנו עוזרים לפלטפורמות לשמור על ציות לחוק, להגן על קהילות בקנה מידה נרחב, ולהפחית עלויות סינון פנימיות.</React.Fragment>}
        </p>
      </section>

      {/* 2. CORE CAPABILITIES (Interactive Cards) */}
      <section style={{ marginBottom: '80px' }}>
        <h2 style={{ color: '#ffffff', textAlign: 'center', marginBottom: '40px', fontSize: '2.5rem' }}>
          {isEn ? 'Core Capabilities' : 'יכולות ליבה'}
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '25px' }}>
          
          <Card 
            title={isEn ? "🛡️ Real-Time Audits & Spam Control" : "🛡️ ביקורת תוכן וספאם בזמן אמת"} 
            content={isEn ? "Continuous scanning of text, images, and video to flag toxic content and algorithmic spam before it goes viral." : "סריקה רציפה של טקסט, תמונות ווידאו לסימון תוכן רעיל וספאם אלגוריתמי לפני שהם הופכים לוויראליים."} 
            extendedTitle={isEn ? 'Dynamic Content Auditing' : 'ביקורת תוכן דינמית'}
            lang={lang}
            extendedContent={<ExpandedLayout 
              bulletsEn={[
                <React.Fragment>API-driven ingestion pipeline capable of processing millions of <ModalLink href="https://en.wikipedia.org/wiki/User-generated_content">UGC</ModalLink> items and spam links per hour.</React.Fragment>,
                "Multi-modal scanning: Text, Image, Audio, and Video frame analysis.",
                "Automated triage prioritizing severe threats for immediate human review."
              ]}
              bulletsHe={[
                <React.Fragment>צינור קליטת נתונים מבוסס API המסוגל לעבד מיליוני פריטי <ModalLink href="https://he.wikipedia.org/wiki/%D7%AA%D7%95%D7%9B%D7%9F_%D7%92%D7%95%D7%9C%D7%A9%D7%99%D7%9D">תוכן גולשים (UGC)</ModalLink> וקישורי ספאם בשעה.</React.Fragment>,
                "סריקה מרובת-אופנויות: ניתוח טקסט, תמונה, אודיו ומסגרות וידאו.",
                "מיון אוטומטי (Triage) המתעדף איומים חמורים לבדיקה אנושית מיידית."
              ]}
              advantageEn="Prevents PR disasters by neutralizing viral toxicity in its infancy, protecting brand reputation and advertiser trust."
              advantageHe="מונע משברי יחסי ציבור על ידי נטרול רעילות ויראלית בחיתוליה, ומגן על מוניטין המותג ואמון המפרסמים."
            />}
          />
          
          <Card 
            title={isEn ? "🛑 Hate Speech & Antisemitism" : "🛑 זיהוי דברי שטנה ואנטישמיות"} 
            content={isEn ? "Advanced NLP models tuned to recognize and contextualize hate speech, including antisemitism, across multiple languages and dialects." : "מודלים מתקדמים לזיהוי והבנת הקשר של דברי שטנה, כולל אנטישמיות, בשפות וניבים שונים."} 
            extendedTitle={isEn ? 'Contextual Hate Speech Analysis' : 'ניתוח הקשרי לדברי שטנה'}
            lang={lang}
            extendedContent={<ExpandedLayout 
              bulletsEn={[
                "Utilization of top-tier LLMs orchestrated to detect nuanced slang, dog-whistles, and targeted antisemitism.",
                "Cross-referencing flagged text with user behavior history to determine intent.",
                <React.Fragment>Granular categorization mapping to specific legal definitions (e.g., the <ModalLink href="https://commission.europa.eu/strategy-and-policy/priorities-2019-2024/europe-fit-digital-age/digital-services-act_en">EU DSA</ModalLink> definitions of illegal hate speech).</React.Fragment>
              ]}
              bulletsHe={[
                "שימוש במודלי שפה (LLMs) מובילים המתוזמרים לזיהוי סלנג, קודי-שנאה (Dog-whistles) ואנטישמיות ממוקדת.",
                "הצלבת טקסט מסומן עם היסטוריית ההתנהגות של המשתמש כדי לקבוע כוונת זדון.",
                <React.Fragment>סיווג פרטני המותאם להגדרות משפטיות ספציפיות (כגון הגדרות ה-<ModalLink href="https://commission.europa.eu/strategy-and-policy/priorities-2019-2024/europe-fit-digital-age/digital-services-act_en">DSA האירופי</ModalLink> לשנאה בלתי חוקית).</React.Fragment>
              ]}
              advantageEn="Significantly reduces false positives by understanding context, ensuring legitimate political discourse is not accidentally censored."
              advantageHe="מפחית משמעותית התראות שווא (False Positives) על ידי הבנת ההקשר, ומבטיח ששיח פוליטי לגיטימי לא יצונזר בטעות."
            />}
          />
          
          <Card 
            title={isEn ? "👶 Child Safety Protocols" : "👶 פרוטוקולי בטיחות ילדים"} 
            content={isEn ? "Strict enforcement algorithms designed to identify and remove exploitative or harmful material targeting minors." : "אלגוריתמי אכיפה נוקשים המיועדים לזהות ולהסיר חומרים פוגעניים המכוונים לקטינים."} 
            extendedTitle={isEn ? 'Zero-Tolerance Child Safety' : 'אפס סובלנות לבטיחות ילדים'}
            lang={lang}
            extendedContent={<ExpandedLayout 
              bulletsEn={[
                <React.Fragment>Integration with global databases (like <ModalLink href="https://www.missingkids.org/">NCMEC</ModalLink>) to instantly hash and block known exploitative material.</React.Fragment>,
                "Behavioral analysis to detect grooming patterns in direct messages and comments.",
                "Immediate escalation protocols to notify local law enforcement authorities when imminent harm is detected."
              ]}
              bulletsHe={[
                <React.Fragment>אינטגרציה עם מאגרי מידע גלובליים (כמו <ModalLink href="https://www.missingkids.org/">NCMEC</ModalLink>) לחסימה וגיבוב (Hashing) מיידי של חומר פוגעני מוכר.</React.Fragment>,
                "ניתוח התנהגותי לזיהוי דפוסי גרימינג (Grooming) בהודעות ישירות ובתגובות.",
                "פרוטוקולי הסלמה מיידיים ליידוע רשויות אכיפת החוק המקומיות כאשר מזוהה סכנה מיידית."
              ]}
              advantageEn="Ensures absolute compliance with the strictest international child protection laws, shielding the platform from severe legal liability."
              advantageHe="מבטיח ציות מוחלט לחוקי הגנת הילדים הבינלאומיים המחמירים ביותר, ומגן על הפלטפורמה מחשיפה משפטית חמורה."
            />}
          />
          
          <Card 
            title={isEn ? "📉 Misinformation Tracking" : "📉 מעקב אחר פייק ניוז"} 
            content={isEn ? "Identifying coordinated inauthentic behavior and mapping the spread of fake news across the network." : "זיהוי התנהגות לא אותנטית מתואמת ומיפוי הפצת פייק ניוז ברשת."} 
            extendedTitle={isEn ? 'Disinformation Network Mapping' : 'מיפוי רשתות דיסאינפורמציה'}
            lang={lang}
            extendedContent={<ExpandedLayout 
              bulletsEn={[
                "Detection of state-sponsored bot farms and coordinated troll networks.",
                "Velocity tracking to understand how fast specific false narratives are spreading.",
                "Automated labeling and friction-insertion (e.g., 'Read before sharing' prompts) for disputed content."
              ]}
              bulletsHe={[
                "זיהוי חוות בוטים במימון מדינתי ורשתות טרולים מתואמות.",
                "מעקב מהירות (Velocity) כדי להבין באיזה קצב מתפשטים נרטיבים שקריים ספציפיים.",
                "תיוג אוטומטי והוספת חיכוך (למשל, התראות 'קרא לפני שיתוף') עבור תוכן שנוי במחלוקת."
              ]}
              advantageEn="Protects the integrity of democratic discourse on the platform and prevents the network from being weaponized during elections."
              advantageHe="מגן על יושרת השיח הדמוקרטי בפלטפורמה ומונע את הפיכת הרשת לנשק במהלך תקופות בחירות."
            />}
          />
        </div>
      </section>

      {/* 3. NEW: AGE ASSURANCE SECTION */}
      <section style={{ marginBottom: '80px', backgroundColor: 'rgba(231, 76, 60, 0.05)', padding: '50px 40px', borderRadius: '20px', border: '1px solid rgba(231, 76, 60, 0.2)' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '40px', alignItems: 'center' }}>
          <div style={{ flex: '1', minWidth: '300px' }}>
            <div style={{ color: '#e74c3c', fontWeight: 'bold', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>
              {isEn ? 'Regulatory Imperative' : 'דרישה רגולטורית חיונית'}
            </div>
            <h2 style={{ fontSize: '2.2rem', color: '#ffffff', marginBottom: '20px', marginTop: 0 }}>
              {isEn ? 'Age Assurance Integration' : 'אימות ואכיפת גיל'}
            </h2>
            <p style={{ color: '#b2bec3', fontSize: '1.1rem', lineHeight: '1.7', marginBottom: '20px' }}>
              {isEn 
                ? <React.Fragment>Governments worldwide are passing sweeping legislation banning minors under 16 from accessing social networks without strict verification (e.g., <a href="https://www.theguardian.com/australia-news/2024/nov/21/australia-social-media-ban-under-16s" target="_blank" rel="noopener noreferrer" style={{ color: '#e74c3c', textDecoration: 'underline' }}>Australia's recent bans</a>). Failing to enforce this will result in platform blackouts.</React.Fragment>
                : <React.Fragment>ממשלות ברחבי העולם מעבירות חקיקה גורפת האוסרת על קטינים מתחת לגיל 16 לגשת לרשתות חברתיות ללא אימות קפדני (למשל, <a href="https://www.theguardian.com/australia-news/2024/nov/21/australia-social-media-ban-under-16s" target="_blank" rel="noopener noreferrer" style={{ color: '#e74c3c', textDecoration: 'underline' }}>החסימות האחרונות באוסטרליה</a>). כישלון באכיפה יוביל להחשכת הפלטפורמה.</React.Fragment>}
            </p>
            <ul style={{ color: '#b2bec3', fontSize: '1.05rem', lineHeight: '1.8', paddingInlineStart: '20px' }}>
              <li><span style={{ color: '#e74c3c' }}>▸</span> {isEn ? 'API integration with certified 3rd-party Age Estimation providers.' : 'אינטגרציה דרך API עם ספקי הערכת גיל מוסמכים מצד-שלישי.'}</li>
              <li><span style={{ color: '#e74c3c' }}>▸</span> {isEn ? 'Privacy-first verification processes (Zero-Knowledge Proofs).' : 'תהליכי אימות מוכווני-פרטיות (הוכחה באפס ידיעה).'}</li>
              <li><span style={{ color: '#e74c3c' }}>▸</span> {isEn ? 'Automated access restriction and auditing trails for regulators.' : 'הגבלת גישה אוטומטית ויצירת נתיבי ביקורת לרגולטורים.'}</li>
            </ul>
          </div>
          <div style={{ flex: '1', minWidth: '300px', display: 'flex', justifyContent: 'center' }}>
            <div style={{ fontSize: '6rem', opacity: 0.8 }}>🔞</div>
          </div>
        </div>
      </section>

      {/* 4. NEW: WHY CIVIWATCH? (The HitL Value Prop) */}
      <section style={{ marginBottom: '80px' }}>
        <h2 style={{ color: '#ffffff', textAlign: 'center', marginBottom: '40px', fontSize: '2.5rem' }}>
          {isEn ? 'Why Partner With CiviWatch?' : 'למה לעבוד עם CiviWatch?'}
        </h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '30px', justifyContent: 'center' }}>
          <div style={{ flex: '1', minWidth: '300px', backgroundColor: '#161b22', padding: '30px', borderRadius: '12px', border: '1px solid #30363d' }}>
            <h3 style={{ color: '#3498db', fontSize: '1.3rem', marginBottom: '15px', marginTop: 0 }}>
              {isEn ? '1. We Bring the Humans' : '1. אנחנו מביאים את האנשים'}
            </h3>
            <p style={{ color: '#8b949e', lineHeight: '1.6', margin: 0 }}>
              {isEn 
                ? 'AI alone cannot achieve full ISO compliance. Our global network of trained human moderators handles the complex edge-cases, providing the legally required "Human in the Loop" validation layer.' 
                : 'AI לבדו לא יכול להשיג תאימות מלאה ל-ISO. הרשת הגלובלית שלנו של מסננים אנושיים שעברו הכשרה מטפלת במקרי הקצה המורכבים, ומספקת את שכבת "האדם בלולאה" הנדרשת חוקית.'}
            </p>
          </div>
          <div style={{ flex: '1', minWidth: '300px', backgroundColor: '#161b22', padding: '30px', borderRadius: '12px', border: '1px solid #30363d' }}>
            <h3 style={{ color: '#2ecc71', fontSize: '1.3rem', marginBottom: '15px', marginTop: 0 }}>
              {isEn ? '2. Agnostic Orchestration' : '2. תזמור אובייקטיבי'}
            </h3>
            <p style={{ color: '#8b949e', lineHeight: '1.6', margin: 0 }}>
              {isEn 
                ? 'We don\'t lock you into a single AI engine. Our marketplace routes your content to the best available models on the market, ensuring you always have cutting-edge detection without constant internal R&D.' 
                : 'אנחנו לא נועלים אתכם למנוע AI בודד. הזירה שלנו מנתבת את התוכן שלכם למודלים הטובים ביותר הזמינים בשוק, ומבטיחה שתמיד תהיה לכם יכולת זיהוי חזיתית ללא צורך במחקר ופיתוח פנימי מתמיד.'}
            </p>
          </div>
        </div>
      </section>

      {/* 5. CALL TO ACTION */}
      <section style={{ backgroundColor: 'rgba(31, 111, 235, 0.1)', border: '1px solid rgba(31, 111, 235, 0.3)', padding: '50px 20px', borderRadius: '16px', textAlign: 'center', marginBottom: '80px' }}>
        <h2 style={{ color: '#ffffff', margin: '0 0 15px 0', fontSize: '2.2rem' }}>
          {isEn ? 'Ready to secure your platform?' : 'מוכנים לאבטח את הפלטפורמה שלכם?'}
        </h2>
        <p style={{ marginBottom: '30px', color: '#b2bec3', fontSize: '1.1rem' }}>
          {isEn 
            ? 'Contact our partnership team to schedule a comprehensive safety audit and SLA review.' 
            : 'צרו קשר עם צוות השותפויות שלנו לתיאום ביקורת בטיחות מקיפה ובחינת SLA.'}
        </p>
        <div style={{ maxWidth: '250px', margin: '0 auto' }}>
          <Button label={isEn ? 'Contact Partnerships' : 'צור קשר לשותפות'} onClick={() => window.location.href='/#/contact'} />
        </div>
      </section>

    </div>
  );
};

export default SocialNetworks;