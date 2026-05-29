import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components';

// Reusable component for the Tier Cards
const TierCard = ({ icon, titleNode, desc, linkText, borderColor, iconBg, iconBorder, linkColor, isHe }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      style={{
        background: '#161b22',
        border: `1px solid ${isHovered ? borderColor : '#30363d'}`,
        borderLeft: `4px solid ${borderColor}`,
        borderRadius: '16px',
        padding: '40px',
        display: 'flex',
        gap: '30px',
        alignItems: 'flex-start',
        transition: 'transform 0.3s ease, border-color 0.3s ease',
        transform: isHovered ? `translateX(${isHe ? '-10px' : '10px'})` : 'translateX(0)',
        flexDirection: window.innerWidth <= 768 ? 'column' : 'row',
        textAlign: window.innerWidth <= 768 ? 'center' : (isHe ? 'right' : 'left'),
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={{
        fontSize: '3.5rem',
        background: iconBg,
        width: '100px',
        height: '100px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '20px',
        border: `1px solid ${iconBorder}`,
        flexShrink: 0,
        margin: window.innerWidth <= 768 ? '0 auto' : '0'
      }}>
        {icon}
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
        <h3 style={{ 
          color: '#ffffff', 
          fontSize: '1.8rem', 
          marginBottom: '15px', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '15px',
          flexDirection: window.innerWidth <= 768 ? 'column' : 'row',
          justifyContent: window.innerWidth <= 768 ? 'center' : 'flex-start',
          marginTop: 0
        }}>
          {titleNode}
        </h3>
        <p style={{ color: '#8b949e', fontSize: '1.1rem', lineHeight: '1.6', marginBottom: '15px', marginTop: 0 }}>
          {desc}
        </p>
        <Link to="/contact" style={{ color: linkColor, fontWeight: 'bold', textDecoration: 'underline', transition: 'opacity 0.3s' }} onMouseOver={(e) => e.target.style.opacity = '0.8'} onMouseOut={(e) => e.target.style.opacity = '1'}>
          {linkText}
        </Link>
      </div>
    </div>
  );
};

const Partners = ({ lang }) => {
  const isEn = lang === 'EN';

  // Helper for the inline badges
  const Badge = ({ text, bg, color, border = 'none' }) => (
    <span style={{
      fontSize: '0.8rem',
      background: bg,
      color: color,
      padding: '4px 10px',
      borderRadius: '20px',
      fontWeight: 'bold',
      textTransform: 'uppercase',
      letterSpacing: '1px',
      border: border
    }}>
      {text}
    </span>
  );

  return (
    <div style={{ padding: '20px 3%', width: '100%', maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', flex: 1, direction: isEn ? 'ltr' : 'rtl' }}>
      
      {/* Hero Section */}
      <header style={{ paddingTop: '100px', paddingBottom: '60px', textAlign: 'center', maxWidth: '900px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '3.5rem', lineHeight: '1.2', marginBottom: '20px', color: '#ffffff', fontWeight: '800' }}>
          {isEn ? 'Join the CiviWatch ' : 'הצטרפו לאקוסיסטם של CiviWatch '}
          <br /><span style={{ color: '#1f6feb' }}>{isEn ? 'Ecosystem' : ''}</span>
        </h1>
        <p style={{ fontSize: '1.2rem', color: '#8b949e', marginBottom: '30px', lineHeight: '1.6' }}>
          {isEn 
            ? "We don't just build technology; we build the standard. Partner with us to deploy, distribute, or integrate the definitive global benchmark for digital safety." 
            : "אנחנו לא רק בונים טכנולוגיה, אנחנו בונים את תו התקן. שתפו איתנו פעולה כדי להטמיע, להפיץ או להשתלב בבנצ'מרק העולמי המוחלט לבטיחות דיגיטלית."}
        </p>
      </header>

      {/* Partner Tiers */}
      <section style={{ padding: '20px 0', width: '100%', marginBottom: '60px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          
          {/* NGO Tier */}
          <TierCard 
            isHe={!isEn}
            icon="🕊️"
            borderColor="#1f6feb"
            iconBg="rgba(31, 111, 235, 0.1)"
            iconBorder="rgba(31, 111, 235, 0.3)"
            linkColor="#1f6feb"
            titleNode={
              <>
                {isEn ? "NGOs & Civil Society" : "עמותות וחברה אזרחית"}
                <Badge text={isEn ? "Vanguard Partners" : "שותפי עוגן"} bg="#1f6feb" color="#ffffff" />
              </>
            }
            desc={isEn 
              ? "Our vital 'Foot in the Door' partners. We equip advocacy groups, human rights organizations, and civic institutions with enterprise-grade moderation tech. Use our platform to track systemic hate speech, protect vulnerable communities, and generate undeniable reports to push for local standard adoption."
              : "שותפי העוגן (Foot in the Door) החיוניים שלנו. אנו מציידים קבוצות הסברה, ארגוני זכויות אדם ומוסדות אזרחיים בטכנולוגיית ניטור ברמת אנטרפרייז. השתמשו בפלטפורמה שלנו כדי לעקוב אחר שפת שטנה מערכתית, להגן על קהילות פגיעות ולייצר דוחות חותכים לקידום אימוץ תקן הבטיחות ברמה המקומית."}
            linkText={isEn ? "Discuss NGO Subsidized Access →" : "לפרטים על גישה מסובסדת לעמותות ←"}
          />

          {/* Distributor Tier */}
          <TierCard 
            isHe={!isEn}
            icon="📈"
            borderColor="#2ed573"
            iconBg="rgba(46, 213, 115, 0.1)"
            iconBorder="rgba(46, 213, 115, 0.3)"
            linkColor="#2ed573"
            titleNode={
              <>
                {isEn ? "Channel & Distribution Partners" : "שותפי הפצה וערוצי מכירה"}
                <Badge text={isEn ? "Revenue-Share Model" : "מודל חלוקת הכנסות"} bg="#2ed573" color="#ffffff" />
              </>
            }
            desc={isEn 
              ? "Unlock lucrative new revenue streams by offering the CiviWatch Guardian AI platform to your existing client base. Ideal for cyber-security firms, risk management consultancies, and enterprise software providers looking to offer their government and corporate clients an immediate, out-of-the-box solution for brand safety and regulatory compliance."
              : "פתחו אפיקי הכנסה חדשים ורווחיים על ידי הצעת פלטפורמת CiviWatch Guardian AI לבסיס הלקוחות הקיים שלכם. אידיאלי לחברות אבטחת מידע, חברות ייעוץ סיכונים וספקי תוכנה ארגונית המחפשים להציע ללקוחותיהם הממשלתיים והתאגידיים פתרון מיידי ומוכן מראש לבטיחות המותג ולעמידה ברגולציה."}
            linkText={isEn ? "Explore the Reseller Program →" : "גלו את תוכנית המפיצים שלנו ←"}
          />

          {/* Tech Partners Tier */}
          <TierCard 
            isHe={!isEn}
            icon="🔌"
            borderColor="#8b949e"
            iconBg="rgba(139, 148, 158, 0.1)"
            iconBorder="rgba(139, 148, 158, 0.3)"
            linkColor="#8b949e"
            titleNode={
              <>
                {isEn ? "AI Technology Suppliers" : "ספקי טכנולוגיות AI"}
                <Badge text={isEn ? "Marketplace Integrations" : "אינטגרציה למרכז הטכנולוגי"} bg="#30363d" color="#8b949e" border="1px solid #8b949e" />
              </>
            }
            desc={isEn 
              ? "Have a world-class specialized AI model for NLP, deepfake detection, or spatial audio analysis? Plug your technology directly into our marketplace. CiviWatch provides the high-level orchestration and the essential Human-in-the-Loop validation, turning your raw technical capabilities into a certified component of the global safety standard."
              : "פיתחתם מודל AI ייעודי ברמה עולמית עבור NLP, זיהוי דיפ-פייק או ניתוח שמע מרחבי? חברו את הטכנולוגיה שלכם ישירות למרכז שלנו. CiviWatch מספקת את האורקסטרציה הכוללת ואת אימות ה-Human-in-the-Loop ההכרחי, והופכת את היכולות הטכניות הגולמיות שלכם לרכיב מוסמך בתקן הבטיחות העולמי."}
            linkText={isEn ? "Submit API Specs for Review →" : "הגשת מפרט טכני (API) לבחינה ←"}
          />

        </div>
      </section>

      {/* Button to GTM Strategy */}
      <section style={{ textAlign: 'center', marginBottom: '60px' }}>
        <Link to="/market-strategy" style={{ textDecoration: 'none' }}>
          <button style={{ 
            display: 'inline-block', 
            padding: '12px 30px', 
            fontSize: '1.1rem', 
            background: 'transparent', 
            border: '2px solid #1f6feb', 
            color: '#ffffff',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 'bold',
            transition: 'all 0.3s ease'
          }}
          onMouseOver={(e) => { e.target.style.backgroundColor = '#1f6feb'; }}
          onMouseOut={(e) => { e.target.style.backgroundColor = 'transparent'; }}
          >
            {isEn ? 'View Full Go-To-Market Strategy Document' : 'לצפייה במסמך אסטרטגיית החדירה המלא'}
          </button>
        </Link>
      </section>

      {/* Investor Pitch Deck Section */}
      <section style={{ marginBottom: '80px' }}>
        <h2 style={{ fontSize: '2.2rem', color: '#ffffff', marginBottom: '30px', textAlign: 'center' }}>
          {isEn ? 'Investor Pitch Deck' : 'מצגת משקיעים'}
        </h2>
        <div style={{ width: '100%', aspectRatio: '16/9', maxWidth: '1000px', margin: '0 auto', borderRadius: '12px', overflow: 'hidden', border: '1px solid #30363d', background: '#000' }}>
          <iframe src="https://drive.google.com/file/d/1YcPoHyCsAcPVLTFZMyrjv3hH2tUXMj1B/preview" style={{ width: '100%', height: '100%', border: 'none' }} title="Pitch Deck"></iframe>
        </div>
      </section>

      {/* Clean Contact Button Section (Replaced Form) */}
      <section style={{ textAlign: 'center', margin: '0 0 100px 0', padding: '60px 20px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
        <h2 style={{ color: '#ffffff', fontSize: '2.2rem', marginBottom: '15px', marginTop: 0 }}>
          {isEn ? 'Contact for Partnership & Investment' : 'יצירת קשר לשותפות והשקעה'}
        </h2>
        <p style={{ color: '#8b949e', fontSize: '1.1rem', marginBottom: '30px', maxWidth: '600px', margin: '0 auto 30px' }}>
          {isEn 
            ? 'We are open to dialogue with funds, NGOs, distributors, and strategic partners. Click below to reach out to our team.' 
            : 'אנו פתוחים לדיאלוג עם קרנות, עמותות, מפיצים ושותפים אסטרטגיים. לחצו למטה כדי ליצור קשר עם הצוות שלנו.'}
        </p>
        <div style={{ maxWidth: '250px', margin: '0 auto' }}>
          <Button label={isEn ? 'Partner With Us' : 'צרו קשר'} onClick={() => window.location.href='/#/contact'} />
        </div>
      </section>

    </div>
  );
};

export default Partners;