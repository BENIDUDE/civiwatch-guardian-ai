import React from 'react';

const AccessibilityStatement = ({ lang }) => {
  const isEn = lang === 'EN';

  const containerStyle = {
    maxWidth: '896px',
    width: '100%',
    backgroundColor: '#161b22', 
    border: '1px solid #30363d',
    boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
    borderRadius: '24px',
    padding: window.innerWidth < 640 ? '32px' : '40px',
    position: 'relative',
    zIndex: 10,
    margin: '0 auto',
    textAlign: isEn ? 'left' : 'right',
    direction: isEn ? 'ltr' : 'rtl'
  };

  const h1Style = {
    fontSize: '2.25rem',
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: '8px',
    marginTop: 0
  };

  const dateStyle = {
    fontSize: '0.875rem',
    color: '#64748b',
    marginBottom: '32px',
    borderBottom: '1px solid #334155',
    paddingBottom: '16px'
  };

  const h2Style = {
    color: '#ffffff',
    fontSize: '1.5rem',
    marginTop: '32px',
    marginBottom: '16px',
    borderBottom: '1px solid #30363d',
    paddingBottom: '8px'
  };

  const pStyle = {
    color: '#8b949e',
    lineHeight: '1.8',
    marginBottom: '16px',
    marginTop: 0
  };

  const ulStyle = {
    color: '#8b949e',
    lineHeight: '1.8',
    marginBottom: '16px',
    paddingInlineStart: '24px',
    marginTop: 0
  };

  const liStyle = {
    marginBottom: '8px'
  };

  const contactBoxStyle = {
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    padding: '24px',
    borderRadius: '12px',
    marginTop: '24px',
    border: '1px solid #334155'
  };

  const linkStyle = {
    color: '#1f6feb',
    textDecoration: 'underline'
  };

  return (
    <div style={{ display: 'flex', flex: 1, justifyContent: 'center', alignItems: 'flex-start', paddingTop: '128px', paddingBottom: '64px', paddingLeft: '16px', paddingRight: '16px' }}>
      <div style={containerStyle}>
        
        {isEn ? (
          <div>
            <h1 style={h1Style}>Accessibility Statement</h1>
            <p style={dateStyle}>Last Updated: April 2026</p>

            <h2 style={h2Style}>Our Commitment</h2>
            <p style={pStyle}>CiviWatch Guardian AI is committed to ensuring digital accessibility for people with disabilities. As a company defining the global standard for digital safety, we believe that an inclusive, safe, and accessible web is a fundamental right. We are continually improving the user experience for everyone and applying the relevant accessibility standards.</p>

            <h2 style={h2Style}>Conformance Status</h2>
            <p style={pStyle}>We strive to conform to the <strong>Web Content Accessibility Guidelines (WCAG) 2.1 Level AA</strong> and the <strong>Israeli Standard IS 5568 (תקן ישראלי 5568)</strong> for web accessibility. These guidelines explain how to make web content more accessible for people with disabilities and more user-friendly for everyone.</p>

            <h2 style={h2Style}>Accessibility Features</h2>
            <p style={pStyle}>To assist our users, we have implemented an Accessibility Menu (located in the bottom corner of the screen) which provides the following controls:</p>
            <ul style={ulStyle}>
              <li style={liStyle}><strong>Text Sizing:</strong> Ability to safely increase or decrease the font size of the entire website.</li>
              <li style={liStyle}><strong>High Contrast Mode:</strong> Inverts colors and borders to highly distinct black and yellow for users with visual impairments.</li>
              <li style={liStyle}><strong>Dyslexia-Friendly Font:</strong> Swaps the site's font to highly legible, asymmetrical typefaces to assist with reading flow.</li>
              <li style={liStyle}><strong>Stop Animations:</strong> Immediately pauses all background animations (such as the node network) to prevent motion sickness and assist users with vestibular disorders.</li>
              <li style={liStyle}><strong>Highlight Links:</strong> Clearly underlines and recolors all clickable elements.</li>
              <li style={liStyle}><strong>Text Spacing:</strong> Increases line height and letter spacing to improve readability.</li>
            </ul>

            <h2 style={h2Style}>Feedback and Contact Information</h2>
            <p style={pStyle}>We welcome your feedback on the accessibility of the CiviWatch Guardian AI website. If you encounter any accessibility barriers, or require assistance, please contact our designated Accessibility Coordinator:</p>
            
            <div style={contactBoxStyle}>
              <h3 style={{ color: '#ffffff', fontWeight: 'bold', marginBottom: '12px', marginTop: 0 }}>Accessibility Coordinator (רכז נגישות)</h3>
              <p style={{ marginBottom: '4px', marginTop: 0, color: '#8b949e' }}><strong>Name:</strong> Benjamin Michaeli</p>
              <p style={{ marginBottom: '4px', marginTop: 0, color: '#8b949e' }}><strong>Email:</strong> <a href="mailto:michaeli.benjamin@gmail.com" style={linkStyle}>michaeli.benjamin@gmail.com</a></p>
              <p style={{ marginBottom: '4px', marginTop: 0, color: '#8b949e' }}><strong>Phone:</strong> 972-547673227</p>
              <p style={{ marginTop: '16px', marginBottom: 0, fontSize: '0.875rem', color: '#8b949e' }}>We aim to respond to accessibility feedback within 2 business days.</p>
            </div>
          </div>
        ) : (
          <div>
            <h1 style={h1Style}>הצהרת נגישות</h1>
            <p style={dateStyle}>עודכן לאחרונה: אפריל 2026</p>

            <h2 style={h2Style}>המחויבות שלנו</h2>
            <p style={pStyle}>חברת CiviWatch Guardian AI מחויבת לספק חווית גלישה נגישה לכלל המשתמשים, לרבות אנשים עם מוגבלויות. כחברה המובילה את תו התקן העולמי לבטיחות דיגיטלית, אנו מאמינים כי רשת בטוחה ונגישה היא זכות יסוד. אנו פועלים באופן שוטף לשיפור חווית המשתמש והחלת תקני הנגישות הרלוונטיים.</p>

            <h2 style={h2Style}>סטטוס עמידה בתקנים</h2>
            <p style={pStyle}>אנו פועלים להנגשת האתר בהתאם להנחיות הנגישות לתכני אינטרנט <strong>WCAG 2.1 ברמת AA</strong> ובהתאם ל<strong>תקן הישראלי ת"י 5568</strong> ("קווים מנחים לנגישות תכנים באינטרנט").</p>

            <h2 style={h2Style}>אמצעי הנגישות באתר</h2>
            <p style={pStyle}>באתר מוצב תפריט נגישות (בפינת המסך) המאפשר למשתמשים להתאים את התצוגה לצרכיהם:</p>
            <ul style={ulStyle}>
              <li style={liStyle}><strong>שינוי גודל טקסט:</strong> הגדלה והקטנה של הגופן באתר.</li>
              <li style={liStyle}><strong>ניגודיות גבוהה:</strong> הפיכת הצבעים לשחור וצהוב בולטים עבור לקויי ראייה.</li>
              <li style={liStyle}><strong>פונט קריא:</strong> החלפת הגופן באתר לפונט המסייע למתמודדים עם דיסלקציה.</li>
              <li style={liStyle}><strong>עצירת הנפשות:</strong> עצירה מיידית של רקעים זזים (כגון חלקיקי הרקע) כדי למנוע סחרחורות ולהקל על משתמשים עם הפרעות וסטיבולריות.</li>
              <li style={liStyle}><strong>הדגשת קישורים:</strong> סימון ברור של כל האלמנטים הלחיצים באתר.</li>
              <li style={liStyle}><strong>מרווח טקסט:</strong> הגדלת המרווחים בין שורות ואותיות לקריאה נוחה יותר.</li>
            </ul>

            <h2 style={h2Style}>פניות בנושא נגישות ופרטי רכז נגישות</h2>
            <p style={pStyle}>אנו מקבלים בברכה משוב על נגישות האתר. אם נתקלתם בבעיית נגישות כלשהי או שאתם זקוקים לעזרה, אנא פנו לרכז הנגישות של החברה:</p>
            
            <div style={contactBoxStyle}>
              <h3 style={{ color: '#ffffff', fontWeight: 'bold', marginBottom: '12px', marginTop: 0 }}>פרטי רכז הנגישות</h3>
              <p style={{ marginBottom: '4px', marginTop: 0, color: '#8b949e' }}><strong>שם:</strong> בנימין מיכאלי</p>
              <p style={{ marginBottom: '4px', marginTop: 0, color: '#8b949e' }}><strong>דוא"ל:</strong> <a href="mailto:michaeli.benjamin@gmail.com" style={{...linkStyle, display: 'inline-block', direction: 'ltr'}}>michaeli.benjamin@gmail.com</a></p>
              <p style={{ marginBottom: '4px', marginTop: 0, color: '#8b949e' }}><strong>טלפון:</strong> <span style={{direction: 'ltr', display: 'inline-block'}}>972-547673227</span></p>
              <p style={{ marginTop: '16px', marginBottom: 0, fontSize: '0.875rem', color: '#8b949e' }}>אנו מתחייבים לטפל בפניות בנושא נגישות בתוך 2 ימי עסקים.</p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AccessibilityStatement;