import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom'; // <-- ADDED: For reading URL parameters

const Contact = ({ lang }) => {
  const isEn = lang === 'EN';
  const location = useLocation(); // <-- ADDED: Get current URL
  
  const [formStatus, setFormStatus] = useState('idle'); // idle, submitting, success, error
  const [inquiryType, setInquiryType] = useState(''); // <-- ADDED: Controlled state for the select dropdown

  // --- ADDED: Check URL for pre-selected subject on load ---
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const subjectParam = params.get('subject');
    if (subjectParam) {
      setInquiryType(subjectParam);
    }
  }, [location]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormStatus('submitting');
    
    // Simulate an API/Formspree submission delay
    setTimeout(() => {
      setFormStatus('success');
      e.target.reset();
      setInquiryType(''); // Reset dropdown
      // Reset success message after 5 seconds
      setTimeout(() => setFormStatus('idle'), 5000);
    }, 1500);
  };

  // Shared styles
  const inputStyle = {
    width: '100%',
    padding: '15px',
    backgroundColor: '#0d1117', 
    border: '1px solid #30363d',
    borderRadius: '8px',
    color: '#ffffff',
    fontSize: '1rem',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
    outline: 'none',
    transition: 'border-color 0.3s'
  };

  const rowStyle = {
    display: 'flex',
    gap: '20px',
    flexWrap: 'wrap',
    marginBottom: '20px'
  };

  const groupStyle = {
    flex: '1',
    minWidth: '250px'
  };

  const inquiryOptions = [
    { value: 'sales', en: 'Sales', he: 'מכירות' }, // <-- ADDED: Sales Option
    { value: 'ngo', en: 'NGO Access', he: 'גישה לעמותות' },
    { value: 'channel', en: 'Channel Distribution', he: 'שותפות הפצה' },
    { value: 'tech', en: 'Tech Integrator', he: 'ספק טכנולוגיה' },
    { value: 'investor', en: 'Investor', he: 'משקיע' },
    { value: 'join', en: 'Join the team', he: 'הצטרפות לצוות' },
    { value: 'support', en: 'Support', he: 'תמיכה' },
    { value: 'other', en: 'Other', he: 'אחר' }
  ];

  return (
    <div style={{ 
      padding: '140px 3% 60px 3%', 
      width: '100%', 
      maxWidth: '1200px', 
      margin: '0 auto', 
      display: 'flex', 
      flexDirection: 'column', 
      flex: 1, 
      direction: isEn ? 'ltr' : 'rtl' 
    }}>
      
      <section style={{ maxWidth: '750px', margin: '0 auto', width: '100%', backgroundColor: '#161b22', padding: '50px 40px', borderRadius: '16px', border: '1px solid #30363d', boxShadow: '0 10px 40px rgba(0,0,0,0.5)' }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ fontSize: '2.2rem', marginBottom: '10px', color: '#ffffff', marginTop: 0 }}>
            {isEn ? 'Contact for Partnership & Investment' : 'יצירת קשר לשותפות והשקעה'}
          </h1>
          <p style={{ color: '#8b949e', fontSize: '1.05rem', margin: 0, lineHeight: '1.6' }}>
            {isEn 
              ? 'We are open to dialogue with funds, NGOs, distributors, and strategic partners.' 
              : 'אנו פתוחים לדיאלוג עם קרנות, עמותות, מפיצים ושותפים אסטרטגיים.'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column' }}>
          
          {/* Row 1: Name & Company */}
          <div style={rowStyle}>
            <div style={groupStyle}>
              <input 
                type="text" 
                required 
                placeholder={isEn ? "Full Name" : "שם מלא"} 
                style={inputStyle}
                onFocus={(e) => e.target.style.borderColor = '#1f6feb'}
                onBlur={(e) => e.target.style.borderColor = '#30363d'}
              />
            </div>
            <div style={groupStyle}>
              <input 
                type="text" 
                placeholder={isEn ? "Organization or Company" : "ארגון או חברה"} 
                style={inputStyle}
                onFocus={(e) => e.target.style.borderColor = '#1f6feb'}
                onBlur={(e) => e.target.style.borderColor = '#30363d'}
              />
            </div>
          </div>

          {/* Row 2: Email & Phone */}
          <div style={rowStyle}>
            <div style={groupStyle}>
              <input 
                type="email" 
                required 
                placeholder={isEn ? "Email Address" : "כתובת דוא״ל"} 
                style={inputStyle}
                onFocus={(e) => e.target.style.borderColor = '#1f6feb'}
                onBlur={(e) => e.target.style.borderColor = '#30363d'}
              />
            </div>
            <div style={groupStyle}>
              <input 
                type="tel" 
                placeholder={isEn ? "Phone Number" : "מספר טלפון"} 
                style={inputStyle}
                onFocus={(e) => e.target.style.borderColor = '#1f6feb'}
                onBlur={(e) => e.target.style.borderColor = '#30363d'}
              />
            </div>
          </div>

          {/* Row 3: Inquiry Type Dropdown */}
          <div style={{ marginBottom: '20px' }}>
            <select 
              required 
              value={inquiryType} // <-- ADDED: Binds to state
              onChange={(e) => setInquiryType(e.target.value)} // <-- ADDED: Updates state
              style={{
                ...inputStyle, 
                appearance: 'none', 
                WebkitAppearance: 'none',
                backgroundImage: `url("data:image/svg+xml;utf8,<svg fill='white' height='24' viewBox='0 0 24 24' width='24' xmlns='http://www.w3.org/2000/svg'><path d='M7 10l5 5 5-5z'/></svg>")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: isEn ? 'right 15px center' : 'left 15px center',
                cursor: 'pointer'
              }}
              onFocus={(e) => e.target.style.borderColor = '#1f6feb'}
              onBlur={(e) => e.target.style.borderColor = '#30363d'}
            >
              <option value="" disabled hidden>
                {isEn ? "Inquiry Type" : "סוג פנייה"}
              </option>
              {inquiryOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {isEn ? opt.en : opt.he}
                </option>
              ))}
            </select>
          </div>

          {/* Row 4: Message */}
          <div style={{ marginBottom: '30px' }}>
            <textarea 
              rows="5" 
              placeholder={isEn ? "Message (Optional)" : "הודעה קצרה (אופציונלי)"} 
              style={{ ...inputStyle, resize: 'vertical' }}
              onFocus={(e) => e.target.style.borderColor = '#1f6feb'}
              onBlur={(e) => e.target.style.borderColor = '#30363d'}
            ></textarea>
          </div>

          {/* Submit Button & Status */}
          <button 
            type="submit" 
            disabled={formStatus === 'submitting'}
            style={{
              width: '100%',
              padding: '15px',
              backgroundColor: formStatus === 'submitting' ? '#30363d' : '#388bfd',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              cursor: formStatus === 'submitting' ? 'not-allowed' : 'pointer',
              transition: 'background 0.3s'
            }}
            onMouseOver={(e) => { if(formStatus !== 'submitting') e.target.style.backgroundColor = '#1f6feb' }}
            onMouseOut={(e) => { if(formStatus !== 'submitting') e.target.style.backgroundColor = '#388bfd' }}
          >
            {formStatus === 'submitting' 
              ? (isEn ? 'Processing...' : 'מעבד...') 
              : (isEn ? 'Submit Inquiry' : 'שליחת פנייה')}
          </button>

          {/* Success Message */}
          {formStatus === 'success' && (
            <p style={{ color: '#2ecc71', textAlign: 'center', marginTop: '20px', fontWeight: 'bold' }}>
              {isEn ? 'Inquiry Received. We will be in touch shortly.' : 'פנייתך התקבלה. ניצור קשר בהקדם.'}
            </p>
          )}

        </form>
      </section>
    </div>
  );
};

export default Contact;