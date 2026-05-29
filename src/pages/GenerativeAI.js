import React from 'react';
import { Button } from '../components';

const GenerativeAI = ({ lang }) => {
  const isEn = lang === 'EN';

  return (
    <div style={{ padding: '60px 3%', width: '100%', maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', flex: 1, direction: isEn ? 'ltr' : 'rtl' }}>
      <section style={{ textAlign: 'center', marginBottom: '80px', marginTop: '20px' }}>
        <h1 style={{ fontSize: '3.5rem', color: '#ffffff', marginBottom: '15px', fontWeight: '800', lineHeight: '1.2' }}>
          {isEn ? 'Securing ' : 'אבטחת '}
          <span style={{ color: '#9b59b6' }}>{isEn ? 'Generative AI' : 'בינה מלאכותית יוצרת'}</span>
        </h1>
        <p style={{ fontSize: '1.25rem', color: '#b2bec3', maxWidth: '800px', margin: '0 auto', lineHeight: '1.6' }}>
          {isEn 
            ? 'Protecting Enterprise LLMs from prompt injection, and preventing the spread of synthetic deepfakes across digital networks.' 
            : 'הגנה על מודלי שפה ארגוניים מפני הזרקת הנחיות (Prompt Injection), ומניעת הפצה של דיפ-פייק ברשתות דיגיטליות.'}
        </p>
      </section>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', marginBottom: '80px' }}>
        <div style={{ backgroundColor: '#161b22', padding: '40px', borderRadius: '16px', border: '1px solid #30363d' }}>
          <div style={{ fontSize: '3rem', marginBottom: '20px' }}>🛡️</div>
          <h3 style={{ color: '#ffffff', fontSize: '1.5rem', marginBottom: '15px', marginTop: 0 }}>
            {isEn ? 'Prompt Injection Defense' : 'הגנה מפני הזרקת הנחיות'}
          </h3>
          <p style={{ color: '#8b949e', lineHeight: '1.6' }}>
            {isEn 
              ? 'A firewall for your LLM. We scan incoming user prompts to detect malicious jailbreak attempts, preventing your enterprise AI from generating harmful, off-brand, or illegal content.' 
              : 'חומת אש למודל השפה שלכם. אנו סורקים הנחיות משתמשים נכנסות כדי לזהות ניסיונות פריצה זדוניים (Jailbreaks), ומונעים מה-AI שלכם לייצר תוכן פוגעני או לא חוקי.'}
          </p>
        </div>

        <div style={{ backgroundColor: '#161b22', padding: '40px', borderRadius: '16px', border: '1px solid #30363d' }}>
          <div style={{ fontSize: '3rem', marginBottom: '20px' }}>🎭</div>
          <h3 style={{ color: '#ffffff', fontSize: '1.5rem', marginBottom: '15px', marginTop: 0 }}>
            {isEn ? 'Deepfake & Synthetic Detection' : 'זיהוי דיפ-פייק ותוכן סינתטי'}
          </h3>
          <p style={{ color: '#8b949e', lineHeight: '1.6' }}>
            {isEn 
              ? 'State-of-the-art visual and audio forensic models that analyze artifacts, lighting inconsistencies, and digital watermarks to flag AI-generated media disguised as reality.' 
              : 'מודלים פורנזיים מתקדמים לניתוח חזותי ואודיו הבודקים ארטיפקטים, חוסר עקביות בתאורה וסימני מים דיגיטליים, לסימון מדיה שנוצרה על ידי AI ומוצגת כאמיתית.'}
          </p>
        </div>
      </div>

      <section style={{ backgroundColor: 'rgba(155, 89, 182, 0.1)', border: '1px solid rgba(155, 89, 182, 0.3)', padding: '50px 20px', borderRadius: '16px', textAlign: 'center', marginBottom: '80px' }}>
        <h2 style={{ color: '#ffffff', margin: '0 0 15px 0', fontSize: '2.2rem' }}>
          {isEn ? 'Deploying an LLM?' : 'מטמיעים מודל שפה (LLM)?'}
        </h2>
        <p style={{ marginBottom: '30px', color: '#b2bec3', fontSize: '1.1rem' }}>
          {isEn ? 'Secure your AI application before it goes live.' : 'אבטחו את אפליקציית ה-AI שלכם לפני העלייה לאוויר.'}
        </p>
        <Button label={isEn ? 'Contact Us' : 'צור קשר'} onClick={() => window.location.href='/#/contact'} />
      </section>
    </div>
  );
};

export default GenerativeAI;