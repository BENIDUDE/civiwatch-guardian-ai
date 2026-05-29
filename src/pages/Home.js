/**
 * @file Home.js
 * @description The main landing page for CiviWatch Guardian AI.
 * UPDATED: Enhanced Hero section to emphasize cross-platform ecosystem monitoring, 
 * the combination of AI + Human verification, and ISO standardization.
 */
import React from 'react';
import { Card, Button } from '../components';

const Home = ({ lang }) => {
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

  // Helper function for the expanded content layout
  const ExpandedLayout = ({ bulletsEn, bulletsHe, advantageEn, advantageHe }) => (
    <div style={{ textAlign: isEn ? 'left' : 'right', direction: isEn ? 'ltr' : 'rtl' }}>
      <ul style={{ paddingInlineStart: '20px', marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {isEn ? bulletsEn.map((b, i) => <li key={i}>{b}</li>) : bulletsHe.map((b, i) => <li key={i}>{b}</li>)}
      </ul>
      <div style={{ backgroundColor: 'rgba(46, 204, 113, 0.1)', padding: '15px', borderRadius: '8px', borderLeft: isEn ? '4px solid #2ecc71' : 'none', borderRight: !isEn ? '4px solid #2ecc71' : 'none' }}>
        <strong style={{ color: '#2ecc71' }}>{isEn ? 'Advantage: ' : 'יתרון: '}</strong>
        {isEn ? advantageEn : advantageHe}
      </div>
    </div>
  );

  return (
    <div style={{ padding: '120px 3% 20px 3%', width: '100%', maxWidth: 'none', margin: '0 auto', backgroundColor: 'transparent' }}>
      
      {/* 1. HERO SECTION - ECOSYSTEM & ISO FOCUS */}
      <section style={{ textAlign: 'center', margin: '40px 0 60px' }}>
        <h1 style={{ fontSize: '3.2rem', color: '#ffffff', marginBottom: '15px', fontWeight: '800' }}>
          {isEn 
            ? 'Setting the ISO Standard for the Social Ecosystem' 
            : <>קובעים את תקן ה-<span dir="ltr" style={{display: 'inline-block'}}>ISO</span> לאקו-סיסטם החברתי</>}
        </h1>
        <p style={{ fontSize: '1.25rem', color: '#3498db', fontWeight: 'bold', marginBottom: '15px' }}>
          {isEn ? 'Cross-Platform Threat Intelligence Powered by AI & Human Experts' : 'מודיעין חוצה-פלטפורמות המופעל ע"י AI ומומחים אנושיים'}
        </p>
        
        {/* Ecosystem Hook Paragraph */}
        <p style={{ fontSize: '1.1rem', color: '#b2bec3', maxWidth: '900px', margin: '0 auto 25px', lineHeight: '1.6' }}>
          {isEn 
            ? "CiviWatch Guardian AI provides a unified monitoring solution for the entire social media ecosystem. By combining orchestrated AI models with a dedicated human verification workforce, we share global threat awareness across all networks—empowering platforms to achieve ISO-grade compliance and effortlessly scale their Trust & Safety operations." 
            : <><span dir="ltr" style={{display: 'inline-block'}}>CiviWatch Guardian AI</span> מספקת פתרון ניטור אחוד עבור כלל האקו-סיסטם של הרשתות החברתיות. באמצעות שילוב של מודלי AI מתקדמים עם כוח אדם אנושי לאימות, אנו משתפים מודעות לאיומים גלובליים חוצי-רשתות—ומאפשרים לפלטפורמות להשיג תאימות לתקן ISO ולהרחיב את מערכי הבטיחות שלהן ללא מאמץ.</>}
        </p>

        {/* 3 Quick Bullet Points */}
        <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: '30px', marginBottom: '35px', color: '#ffffff', fontSize: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: '#2ecc71', fontWeight: 'bold' }}>✓</span> 
            {isEn ? 'Cross-Network Threat Overview' : 'סקירת איומים חוצת-רשתות'}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: '#2ecc71', fontWeight: 'bold' }}>✓</span> 
            {isEn ? 'AI + Human-in-the-Loop Engine' : 'שילוב AI עם בקרת מומחים אנושית'}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: '#2ecc71', fontWeight: 'bold' }}>✓</span> 
            {isEn ? 'ISO-Grade Regulatory Compliance' : 'ציות לתקני בטיחות ורגולציה גלובלית'}
          </div>
        </div>

        <div style={{ maxWidth: '350px', margin: '0 auto' }}>
          <Button label={isEn ? 'Explore the Solution' : 'גלו את הפתרון'} onClick={() => window.location.href='/#/market-strategy'} />
        </div>
      </section>

      {/* 2. REGULATORY LANDSCAPE & RESEARCH */}
      <section style={{ margin: '80px 0', padding: '50px 4%', backgroundColor: 'rgba(52, 152, 219, 0.03)', borderRadius: '20px', border: '1px solid rgba(52, 152, 219, 0.1)' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 style={{ color: '#ffffff', fontSize: '2.5rem', marginBottom: '10px' }}>
            {isEn ? 'The Imperative of Digital Order' : 'הצורך החיוני בסדר דיגיטלי'}
          </h2>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '30px', justifyContent: 'center', alignItems: 'stretch' }}>
          <div style={{ flex: '1', minWidth: '320px', display: 'flex', flexDirection: 'column', backgroundColor: 'rgba(255,255,255,0.02)', padding: '25px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <h3 style={{ color: '#ffffff', borderBottom: '2px solid #3498db', paddingBottom: '10px', marginTop: 0 }}>
              {isEn ? 'The Cost of Chaos' : 'מחיר הכאוס'}
            </h3>
            <p style={{ color: '#b2bec3', flex: 1, lineHeight: '1.7' }}>
              {isEn 
                ? 'Lack of order drives users away and alienates advertisers. Research shows toxic environments directly correlate to lower user retention.' 
                : 'חוסר סדר מבריח משתמשים ומרחיק מפרסמים. מחקרים מראים שסביבות רעילות נמצאות בקורלציה ישירה לשימור משתמשים נמוך יותר.'}
            </p>
            <a href="https://www.adl.org/resources/report/online-hate-and-harassment-american-experience-2024" target="_blank" rel="noopener noreferrer" style={{ color: '#3498db', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 'bold', marginTop: '15px' }}>
              🔗 {isEn ? 'ADL Study 2024' : 'מחקר ADL 2024'}
            </a>
          </div>

          <div style={{ flex: '1', minWidth: '320px', display: 'flex', flexDirection: 'column', backgroundColor: 'rgba(255,255,255,0.02)', padding: '25px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <h3 style={{ color: '#ffffff', borderBottom: '2px solid #e74c3c', paddingBottom: '10px', marginTop: 0 }}>
              {isEn ? 'Regulatory Shift' : 'השינוי הרגולטורי'}
            </h3>
            <p style={{ color: '#b2bec3', flex: 1, lineHeight: '1.7' }}>
              {isEn 
                ? 'Countries are enacting laws to restrict users under 16 from accessing social networks without verification.' 
                : 'מדינות מחוקקות חוקים המגבילים משתמשים מתחת לגיל 16 מגישה לרשתות ללא אימות.'}
            </p>
            <a href="https://www.theguardian.com/australia-news/2026/mar/31/meta-tiktok-snapchat-google-under-investigation-australia-social-media-ban" target="_blank" rel="noopener noreferrer" style={{ color: '#e74c3c', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 'bold', marginTop: '15px' }}>
              🔗 {isEn ? 'Guardian: Age Ban' : 'גארדיאן: איסור גיל'}
            </a>
          </div>

          <div style={{ flex: '1', minWidth: '320px', display: 'flex', flexDirection: 'column', backgroundColor: 'rgba(52, 152, 219, 0.05)', padding: '25px', borderRadius: '12px', border: '1px solid rgba(52, 152, 219, 0.2)' }}>
            <h3 style={{ color: '#ffffff', borderBottom: '2px solid #2ecc71', paddingBottom: '10px', marginTop: 0 }}>
              {isEn ? 'The CiviWatch Solution' : 'הפתרון של CiviWatch'}
            </h3>
            <p style={{ color: '#b2bec3', flex: 1, lineHeight: '1.7', fontWeight: 'bold' }}>
              {isEn 
                ? 'A centralized command center that ingests threat reports, uses AI to filter out noise, routes edge-cases to human moderators, and automatically dispatches formatted takedown requests directly to social networks.' 
                : 'מרכז שליטה המרכז דיווחים, מסנן רעשי רקע בעזרת בינה מלאכותית, מנתב מקרי קצה לבקרה אנושית, ומשגר אוטומטית בקשות הסרה מדויקות לרשתות החברתיות.'}
            </p>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS PIPELINE */}
      <section style={{ margin: '80px 0', padding: '0 4%' }}>
        <h2 style={{ color: '#ffffff', textAlign: 'center', marginBottom: '50px', fontSize: '2.5rem' }}>
          {isEn ? 'How The Platform Works' : 'איך המערכת עובדת'}
        </h2>
        
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'center', position: 'relative' }}>
          {/* Connector Line (Desktop Only) */}
          <div style={{ position: 'absolute', top: '40px', left: '10%', right: '10%', height: '2px', backgroundColor: '#334155', zIndex: 0, display: window.innerWidth > 900 ? 'block' : 'none' }}></div>

          <div style={{ flex: '1', minWidth: '220px', textAlign: 'center', zIndex: 1 }}>
            <div style={{ width: '80px', height: '80px', backgroundColor: '#0f172a', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 auto 20px', border: '2px solid #38bdf8', boxShadow: '0 0 15px rgba(56, 189, 248, 0.3)' }}>
              <span style={{ fontSize: '2rem' }}>📥</span>
            </div>
            <h3 style={{ color: '#fff', marginBottom: '10px' }}>{isEn ? '1. Threat Ingestion' : '1. קליטת איומים'}</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: '1.5' }}>{isEn ? 'Raw reports are submitted via users or API.' : 'קליטת דיווחים גולמיים ממשתמשים או חיבורי API.'}</p>
          </div>

          <div style={{ flex: '1', minWidth: '220px', textAlign: 'center', zIndex: 1 }}>
            <div style={{ width: '80px', height: '80px', backgroundColor: '#0f172a', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 auto 20px', border: '2px solid #a855f7', boxShadow: '0 0 15px rgba(168, 85, 247, 0.3)' }}>
              <span style={{ fontSize: '2rem' }}>🤖</span>
            </div>
            <h3 style={{ color: '#fff', marginBottom: '10px' }}>{isEn ? '2. AI Triage' : '2. סינון בינה מלאכותית'}</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: '1.5' }}>{isEn ? 'Multiple models vote to verify or discard the threat instantly.' : 'מספר מודלים מצביעים לאימות או דחיית האיום באופן מיידי.'}</p>
          </div>

          <div style={{ flex: '1', minWidth: '220px', textAlign: 'center', zIndex: 1 }}>
            <div style={{ width: '80px', height: '80px', backgroundColor: '#0f172a', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 auto 20px', border: '2px solid #f59e0b', boxShadow: '0 0 15px rgba(245, 158, 11, 0.3)' }}>
              <span style={{ fontSize: '2rem' }}>🧑‍💻</span>
            </div>
            <h3 style={{ color: '#fff', marginBottom: '10px' }}>{isEn ? '3. Human QA' : '3. בקרת מנהל'}</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: '1.5' }}>{isEn ? 'Ambiguous edge-cases are routed to Moderators for final approval.' : 'מקרי קצה מורכבים מנותבים למנהלים אנושיים לאישור סופי.'}</p>
          </div>

          <div style={{ flex: '1', minWidth: '220px', textAlign: 'center', zIndex: 1 }}>
            <div style={{ width: '80px', height: '80px', backgroundColor: '#0f172a', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 auto 20px', border: '2px solid #10b981', boxShadow: '0 0 15px rgba(16, 185, 129, 0.3)' }}>
              <span style={{ fontSize: '2rem' }}>📤</span>
            </div>
            <h3 style={{ color: '#fff', marginBottom: '10px' }}>{isEn ? '4. Automated Dispatch' : '4. שילוח לרשתות'}</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: '1.5' }}>{isEn ? 'Standardized takedown requests are sent directly to the social network.' : 'בקשות הסרה מנוסחות נשלחות ישירות לרשתות החברתיות.'}</p>
          </div>
        </div>
      </section>

      {/* 3. VALIDATION ECOSYSTEM */}
      <section style={{ margin: '100px 0' }}>
        <h2 style={{ color: '#ffffff', textAlign: 'center', marginBottom: '40px', fontSize: '2.5rem' }}>
          {isEn ? 'The Validation Ecosystem' : 'סביבת האימות'}
        </h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'center', alignItems: 'stretch' }}>
          
          <div style={{ flex: '1 1 22%', minWidth: '280px', display: 'flex' }}>
            <Card 
              title={isEn ? '⚖️ ISO Standard' : '⚖️ תקן ISO'} 
              content={isEn ? "Legal framework for regional regulation." : "מסגרת חוקית לרגולציה אזורית."}
              extendedTitle={isEn ? 'Translating Regulation into Enforceable Guardrails' : 'תרגום רגולציה לחוקי אכיפה'}
              lang={lang}
              extendedContent={<ExpandedLayout 
                bulletsEn={[
                  <React.Fragment key="1">In-depth analysis of state laws and regional regulations (such as the <ModalLink href="https://digital-strategy.ec.europa.eu/en/policies/digital-services-act-package">EU DSA</ModalLink> or Australian safety laws) by an expert legal-technical team.</React.Fragment>,
                  "Translating legal requirements into technical guardrails applicable in code.",
                  "Defining clear benchmarks to determine the platform's compliance level with the established ISO standard."
                ]}
                bulletsHe={[
                  <React.Fragment key="2">ניתוח עומק של חוקי מדינה ורגולציה אזורית (כגון ה-<ModalLink href="https://digital-strategy.ec.europa.eu/en/policies/digital-services-act-package">EU DSA</ModalLink> או חוקי המגן באוסטרליה) על ידי צוות משפטי-טכני מומחה.</React.Fragment>,
                  "תרגום הדרישות המשפטיות למעקות בטיחות (Guardrails) טכניים הניתנים ליישום בקוד.",
                  "הגדרת בנצ'מרקים (מדדים) ברורים לקביעת רמת הציות (Compliance) של הפלטפורמה לתקן ה-ISO שנקבע."
                ]}
                advantageEn="Enables platforms to receive a globally recognized ISO certification for digital safety, providing assurance to regulators and users."
                advantageHe="מאפשר לפלטפורמות לקבל תו תקן ISO לבטיחות דיגיטלית, המוכר באופן גלובלי ומעניק ביטחון לרגולטורים ולמשתמשים."
              />}
            />
          </div>

          <div style={{ flex: '1 1 22%', minWidth: '280px', display: 'flex' }}>
            <Card 
              title={isEn ? '🧑‍💻 Human-in-the-Loop' : '🧑‍💻 אדם בלולאה'} 
              content={isEn ? "Human validation for final approval." : "אימות אנושי לאישור סופי."}
              extendedTitle={isEn ? 'Expert Validation & Calibration' : 'אימות סופי וכיול מודלים על ידי מומחים'}
              lang={lang}
              extendedContent={<ExpandedLayout 
                bulletsEn={[
                  "Deploying a fleet of human experts to verify edge-cases where AI models detect uncertainty.",
                  "Providing a human 'Seal of Approval' for content, required for full standard compliance.",
                  "Using data collected from human validation for continuous calibration and training of AI models, increasing future accuracy."
                ]}
                bulletsHe={[
                  "הפעלת צי מומחים אנושיים לאימות מקרי קצה (Edge-cases) שבהם מודלי ה-AI זיהו ספק.",
                  "מתן 'חותמת אישור' (Seal of Approval) אנושית לתוכן, הנדרשת עבור ציות מלא לתקן.",
                  "שימוש בנתונים הנאספים מהאימות האנושי לצורך כיול ואימון מתמיד של מודלי ה-AI במערכת, להגברת הדיוק העתידי."
                ]}
                advantageEn="Eliminates the 'black boxes' of AI decision-making, providing a reliable, cost-effective solution with full accountability."
                advantageHe="מבטל את ה'חורים השחורים' של קבלת החלטות ב-AI ומספק פתרון אמין, חסכוני ובעל אחריותיות (Accountability) מלאה."
              />}
            />
          </div>

          <div style={{ flex: '1 1 22%', minWidth: '280px', display: 'flex' }}>
            <Card 
              title={isEn ? '🔌 AI Marketplace' : '🔌 זירת AI'} 
              content={isEn ? "Orchestrating best-in-class AI tools." : "תזמור כלי AI מובילים."}
              extendedTitle={isEn ? 'Orchestrating Leading AI Tools' : 'תזמור של כלי AI מובילים'}
              lang={lang}
              extendedContent={<ExpandedLayout 
                bulletsEn={[
                  "Full API integration with top LLMs (like GPT-4, Claude) and computer vision models for text and video analysis.",
                  "Smart orchestration algorithm that routes each content item to the most accurate and fastest AI model for that specific type.",
                  "Aggregation of various analysis results into a unified safety score."
                ]}
                bulletsHe={[
                  "אינטגרציה מלאה דרך API עם מיטב מודלי ה-LLM (כגון GPT-4, Claude) ומודלי ראייה ממוחשבת לניתוח טקסט ווידאו.",
                  "אלגוריתם תזמור חכם השולח כל פריט תוכן למודל ה-AI המדויק והמהיר ביותר עבור אותו סוג תוכן.",
                  "איחוד (Aggregation) של תוצאות הניתוח השונות לכדי ציון בטיחות אחיד."
                ]}
                advantageEn="Access to the world's most advanced AI technologies without internal development, ensuring speed, precision, and massive cost savings."
                advantageHe="גישה לטכנולוגיות ה-AI המתקדמות בעולם ללא צורך בפיתוח פנימי, מה שמבטיח מהירות, דיוק וחסכון עצום בעלויות."
              />}
            />
          </div>

          <div style={{ flex: '1 1 22%', minWidth: '280px', display: 'flex' }}>
            <Card 
              title={isEn ? '🔍 Strategic Auditing' : '🔍 ביקורת אסטרטגית'} 
              content={isEn ? "Compliance audits for global safety." : "ביקורות תאימות לבטיחות גלובלית."}
              extendedTitle={isEn ? 'Compliance & Penetration Testing' : 'ביקורת ציות ומבדקי חדירה'}
              lang={lang}
              extendedContent={<ExpandedLayout 
                bulletsEn={[
                  "Conducting Red Teaming tests to identify safety vulnerabilities and hidden biases in platform systems.",
                  "Generating detailed periodic audit reports proving compliance with global digital safety laws.",
                  "Providing concrete recommendations to improve safety infrastructure and reduce regulatory risks."
                ]}
                bulletsHe={[
                  "ביצוע מבדקי 'צוות אדום' (Red Teaming) לזיהוי פרצות בטיחות והטיות חבויות במערכות הפלטפורמה.",
                  "הפקת דוחות ביקורת תקופתיים מפורטים המעידים על עמידה בחוקי בטיחות דיגיטליים גלובליים.",
                  "מתן המלצות קונקרטיות לשיפור תשתיות הבטיחות והפחתת סיכונים רגולטוריים."
                ]}
                advantageEn="Protects the platform from massive fines, lawsuits, and reputational damage, ensuring it stays one step ahead of regulation."
                advantageHe="מגן על הפלטפורמה מפני קנסות עתק, תביעות משפטיות ונזק תדמיתי, ומבטיח שהיא נשארת צעד אחד לפני הרגולציה."
              />}
            />
          </div>
        </div>
      </section>

      {/* 4. THE 3 FRONTIERS OF SAFETY */}
      <section style={{ margin: '100px 0' }}>
        <h2 style={{ color: '#ffffff', textAlign: 'center', marginBottom: '40px', fontSize: '2.5rem' }}>
          {isEn ? 'The 3 Frontiers of Safety' : '3 חזיתות הבטיחות'}
        </h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '30px', justifyContent: 'center', alignItems: 'stretch' }}>
          
          <div style={{ flex: '1 1 30%', minWidth: '320px', display: 'flex' }}>
            <Card 
              title={isEn ? '📱 Social Networks' : '📱 רשתות חברתיות'} 
              content={isEn ? "Real-time monitoring and age limits." : "ניטור בזמן אמת והגבלות גיל."}
              extendedTitle={isEn ? 'Contextual Monitoring & Age Assurance' : 'ניטור הקשרי ואכיפת הגבלות גיל בזמן אמת'}
              lang={lang}
              extendedContent={<ExpandedLayout 
                bulletsEn={[
                  "Real-time monitoring of User-Generated Content (UGC) - text, image, and video - via orchestrated AI models.",
                  "Contextual Analysis to detect nuances of harassment, toxic content, or grooming attempts.",
                  "Integrating advanced Age Assurance tools to verify user age and enforce access restrictions for users under 16."
                ]}
                bulletsHe={[
                  "ניטור בזמן אמת של תוכן גולשים (UGC) - טקסט, תמונה ווידאו - באמצעות מודלי ה-AI המתוזמרים.",
                  "שימוש בניתוח הקשרי (Contextual Analysis) לזיהוי דקויות של הטרדה, שנאה רעילה (Toxic Content) או ניסיונות גרימינג.",
                  "שילוב כלי Age Assurance מתקדמים לאימות גיל המשתמש ואכיפת מגבלות גישה מתחת לגיל 16."
                ]}
                advantageEn="Enables networks to operate in a cleaner, safer environment, retain users, and meet strict child safety laws."
                advantageHe="מאפשר לרשתות לפעול בסביבה נקייה ובטוחה יותר, לשמר משתמשים ולעמוד בדרישות הקשיחות של חוקי בטיחות ילדים."
              />}
            />
          </div>

          <div style={{ flex: '1 1 30%', minWidth: '320px', display: 'flex' }}>
            <Card 
              title={isEn ? '🤖 Generative AI' : '🤖 בינה מלאכותית יוצרת'} 
              content={isEn ? "Auditing model outputs to prevent bias." : "ביקורת פלטי מודלים למניעת הטיות."}
              extendedTitle={isEn ? 'GenAI Safety & Alignment' : 'מבדקי בטיחות וכיול למודלי GenAI'}
              lang={lang}
              extendedContent={<ExpandedLayout 
                bulletsEn={[
                  "Comprehensive safety audits on the outputs of Large Language Models (LLMs) and image generators.",
                  "Detection and prevention of bias, severe hallucinations, and fake news.",
                  "Alignment of orchestrated models to ensure they generate only safe, ethical, and standard-compliant content."
                ]}
                bulletsHe={[
                  "ביצוע מבדקי בטיחות (Audits) מקיפים על הפלטים (Outputs) של מודלי שפה (LLMs) ומחוללי תמונות.",
                  "זיהוי ומניעה של הטיות (Bias), 'הזיות' (Hallucinations) חמורות ופייק ניוז.",
                  "כיול (Alignment) של המודלים המתוזמרים כדי להבטיח שהם מייצרים רק תוכן בטוח, אתי ועומד בתקן."
                ]}
                advantageEn="Ensures responsible and reliable use of Generative AI, prevents the spread of harmful or misleading content, and strengthens trust in the technology."
                advantageHe="מבטיח שימוש אחראי ומהימן בבינה מלאכותית יוצרת, מונע הפצת תוכן פוגעני או מטעה, ומחזק את האמון בטכנולוגיה."
              />}
            />
          </div>

          <div style={{ flex: '1 1 30%', minWidth: '320px', display: 'flex' }}>
            <Card 
              title={isEn ? '👓 Virtual Reality' : '👓 מציאות מדומה'} 
              content={isEn ? "Monitoring spatial interactions for safety." : "ניטור אינטראקציות מרחביות לבטיחות."}
              extendedTitle={isEn ? 'Spatial Computing Safety' : 'ניטור התנהגות מרחבית ב-VR'}
              lang={lang}
              extendedContent={<ExpandedLayout 
                bulletsEn={[
                  "Monitoring spatial interactions between users within VR environments to detect physical-virtual harassment.",
                  "Identifying toxic behavior patterns, threats, or grooming unique to virtual reality communication.",
                  "Defining specific behavioral benchmarks for social safety in VR and spatial computing (Metaverse)."
                ]}
                bulletsHe={[
                  "ניטור אינטראקציות מרחביות (Spatial Interaction) בין משתמשים בתוך סביבות VR, לזיהוי הטרדות פיזיות-וירטואליות.",
                  "זיהוי דפוסי התנהגות רעילה, איומים או גרימינג הייחודיים לתקשורת במציאות מדומה.",
                  "הגדרת מדדי התנהגות (Benchmarks) ייעודיים לבטיחות חברתית ב-VR ובמחשוב מרחבי (Metaverse)."
                ]}
                advantageEn="Makes the Metaverse a safe place for exploration and interaction, prevents harmful behavior in virtual spaces, and paves the way for mass adoption."
                advantageHe="הופך את המטאברס למקום בטוח לחקירה ואינטראקציה, מונע התנהגות פוגענית במרחבים וירטואליים וסולל את הדרך לאימוץ המוני."
              />}
            />
          </div>
        </div>
      </section>

      {/* 5. PROJECT MEDIA */}
      <section style={{ margin: '100px 0' }}>
        <h2 style={{ color: '#ffffff', textAlign: 'center', marginBottom: '40px', fontSize: '2.5rem' }}>
          {isEn ? 'Project Media' : 'מדיה'}
        </h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '30px', justifyContent: 'center' }}>
          <div style={{ flex: '1', minWidth: '320px' }}>
            <h3 style={{ textAlign: 'center', color: '#3498db', marginBottom: '15px' }}>Demo</h3>
            <div style={{ aspectRatio: '16/9', backgroundColor: '#000', borderRadius: '12px', overflow: 'hidden' }}>
              <video width="100%" height="100%" controls poster="/videos/demo-poster.png"><source src="/videos/demo.mp4" type="video/mp4" /></video>
            </div>
          </div>
          <div style={{ flex: '1', minWidth: '320px' }}>
            <h3 style={{ textAlign: 'center', color: '#3498db', marginBottom: '15px' }}>Pitch</h3>
            <div style={{ aspectRatio: '16/9', backgroundColor: '#000', borderRadius: '12px', overflow: 'hidden' }}>
              <video width="100%" height="100%" controls poster="/videos/pitch-poster.png"><source src="/videos/pitch.mp4" type="video/mp4" /></video>
            </div>
          </div>
          <div style={{ flex: '1', minWidth: '320px' }}>
            <h3 style={{ textAlign: 'center', color: '#3498db', marginBottom: '15px' }}>Deck</h3>
            <div style={{ aspectRatio: '16/9', backgroundColor: '#000', borderRadius: '12px', overflow: 'hidden' }}>
              <iframe src="/documents/pitch-deck.pdf" width="100%" height="100%" style={{ border: 'none' }} title="Pitch Deck"></iframe>
            </div>
          </div>
        </div>
      </section>

      {/* 6. CALL TO ACTION */}
      <section style={{ textAlign: 'center', margin: '100px 0', padding: '60px 20px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
        <h2 style={{ color: '#3498db', fontSize: '2.5rem' }}>{isEn ? 'Ready to Partner?' : 'מוכנים לשיתוף פעולה?'}</h2>
        <div style={{ maxWidth: '300px', margin: '30px auto 0' }}>
          <Button label={isEn ? 'Contact Us' : 'צרו קשר'} onClick={() => window.location.href='/#/contact'} />
        </div>
      </section>

    </div>
  );
};

export default Home;