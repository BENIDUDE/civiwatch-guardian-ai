import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// FIX: Accept `isEn` directly as a boolean to match what App.js is sending
const Pricing = ({ isEn }) => {
  const navigate = useNavigate();

  // Controls the billing cycle toggle (Monthly vs Annual)
  const [billingCycle, setBillingCycle] = useState('monthly'); 

  // Pricing data
  const starterPrice = billingCycle === 'monthly' ? 499 : 399;
  const proPrice = billingCycle === 'monthly' ? 1299 : 999;
  const enterprisePrice = isEn ? 'Custom' : 'מותאם אישית';

  const handlePaymentClick = (e) => {
    e.preventDefault();
    alert(isEn 
      ? "This payment option is currently under construction. Please contact sales." 
      : "אפשרות תשלום זו נמצאת כעת בבנייה. אנא צור קשר עם צוות המכירות."
    );
  };

  return (
    <div style={{ padding: '140px 3% 60px 3%', width: '100%', maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', flex: 1, direction: isEn ? 'ltr' : 'rtl' }}>
      
      {/* HEADER SECTION */}
      <div style={{ textAlign: 'center', marginBottom: '60px', animation: 'fadeIn 0.5s ease-out' }}>
        <h1 style={{ fontSize: '2.5rem', margin: '0 0 15px 0', color: '#fff', fontWeight: '900' }}>
          {isEn ? 'Transparent Pricing for Every Scale' : 'תמחור שקוף לכל קנה מידה'}
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
          {isEn ? 'Choose the plan that fits your intelligence and moderation needs. No hidden fees.' : 'בחר את התוכנית המתאימה לצרכי המודיעין והבקרה שלך. ללא עמלות נסתרות.'}
        </p>
      </div>

      {/* BILLING TOGGLE */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '50px' }}>
        <div style={{ backgroundColor: 'rgba(30, 41, 59, 0.6)', padding: '5px', borderRadius: '12px', display: 'flex', border: '1px solid rgba(255,255,255,0.05)' }}>
          <button 
            onClick={() => setBillingCycle('monthly')}
            style={{ backgroundColor: billingCycle === 'monthly' ? '#38bdf8' : 'transparent', color: billingCycle === 'monthly' ? '#0f172a' : '#cbd5e1', border: 'none', padding: '10px 24px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s' }}
          >
            {isEn ? 'Monthly' : 'חודשי'}
          </button>
          <button 
            onClick={() => setBillingCycle('annual')}
            style={{ backgroundColor: billingCycle === 'annual' ? '#38bdf8' : 'transparent', color: billingCycle === 'annual' ? '#0f172a' : '#cbd5e1', border: 'none', padding: '10px 24px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            {isEn ? 'Annual' : 'שנתי'}
            <span style={{ backgroundColor: billingCycle === 'annual' ? '#0f172a' : 'rgba(16, 185, 129, 0.2)', color: billingCycle === 'annual' ? '#38bdf8' : '#10b981', padding: '2px 8px', borderRadius: '12px', fontSize: '0.7rem', border: billingCycle === 'annual' ? 'none' : '1px solid rgba(16, 185, 129, 0.3)' }}>
              {isEn ? 'Save 20%' : 'חסוך 20%'}
            </span>
          </button>
        </div>
      </div>

      {/* PRICING CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px' }}>
        
        {/* STARTER PLAN */}
        <div style={{ backgroundColor: 'rgba(30, 41, 59, 0.4)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', padding: '40px', display: 'flex', flexDirection: 'column', transition: 'transform 0.2s', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }} onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
          <h3 style={{ margin: '0 0 10px 0', color: '#fff', fontSize: '1.5rem' }}>{isEn ? 'Starter' : 'התחלתי'}</h3>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', minHeight: '45px', margin: 0 }}>{isEn ? 'Perfect for small NGOs and local community teams.' : 'מושלם לעמותות קטנות וצוותי קהילה מקומיים.'}</p>
          
          <div style={{ margin: '30px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '30px' }}>
            <span style={{ fontSize: '3rem', fontWeight: '900', color: '#fff' }}>${starterPrice}</span>
            <span style={{ color: '#64748b', fontSize: '1rem' }}>/ {isEn ? 'mo' : 'חודש'}</span>
            {billingCycle === 'annual' && <div style={{ color: '#10b981', fontSize: '0.85rem', marginTop: '5px' }}>{isEn ? 'Billed $4,788 annually' : 'חיוב שנתי של $4,788'}</div>}
          </div>

          <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 40px 0', color: '#cbd5e1', display: 'flex', flexDirection: 'column', gap: '15px', flex: 1 }}>
            <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><span style={{ color: '#38bdf8' }}>✓</span> {isEn ? 'Up to 5 Operators' : 'עד 5 מפעילים'}</li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><span style={{ color: '#38bdf8' }}>✓</span> {isEn ? 'Basic AI Triage Engine' : 'מנוע טריאז\' AI בסיסי'}</li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><span style={{ color: '#38bdf8' }}>✓</span> {isEn ? 'Standard Threat Library' : 'מאגר איומים סטנדרטי'}</li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><span style={{ color: '#38bdf8' }}>✓</span> {isEn ? 'Community Knowledge Base' : 'גישה למאגר הידע'}</li>
          </ul>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button onClick={handlePaymentClick} style={{ backgroundColor: '#fff', color: '#0f172a', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s', width: '100%' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#fff'}>
              {isEn ? 'Pay with PayPal' : 'שלם באמצעות PayPal'}
            </button>
            <button onClick={handlePaymentClick} style={{ backgroundColor: 'transparent', color: '#94a3b8', border: '1px solid #334155', padding: '12px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s', width: '100%' }} onMouseOver={(e) => {e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = '#64748b'}} onMouseOut={(e) => {e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.borderColor = '#334155'}}>
              {isEn ? 'Pay with Debit/Credit' : 'שלם בכרטיס אשראי'}
            </button>
          </div>
        </div>

        {/* PRO PLAN (HIGHLIGHTED) */}
        <div style={{ backgroundColor: 'rgba(15, 23, 42, 0.8)', borderRadius: '16px', border: '2px solid #38bdf8', padding: '40px', display: 'flex', flexDirection: 'column', position: 'relative', transform: 'scale(1.02)', boxShadow: '0 20px 40px rgba(56, 189, 248, 0.15)', zIndex: 10 }}>
          <div style={{ position: 'absolute', top: '-15px', left: '50%', transform: 'translateX(-50%)', backgroundColor: '#38bdf8', color: '#0f172a', padding: '6px 16px', borderRadius: '20px', fontWeight: '900', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', whiteSpace: 'nowrap' }}>
            {isEn ? 'Most Popular' : 'הכי פופולרי'}
          </div>
          
          <h3 style={{ margin: '0 0 10px 0', color: '#fff', fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
            {isEn ? 'Professional' : 'מקצועי'} <span style={{ fontSize: '1.2rem' }}>⚡</span>
          </h3>
          <p style={{ color: '#cbd5e1', fontSize: '0.9rem', minHeight: '45px', margin: 0 }}>{isEn ? 'For dedicated moderation centers and mid-sized agencies.' : 'למרכזי בקרה ייעודיים וסוכנויות בינוניות.'}</p>
          
          <div style={{ margin: '30px 0', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '30px' }}>
            <span style={{ fontSize: '3.5rem', fontWeight: '900', color: '#fff' }}>${proPrice}</span>
            <span style={{ color: '#94a3b8', fontSize: '1rem' }}>/ {isEn ? 'mo' : 'חודש'}</span>
            {billingCycle === 'annual' && <div style={{ color: '#10b981', fontSize: '0.85rem', marginTop: '5px' }}>{isEn ? 'Billed $11,988 annually' : 'חיוב שנתי של $11,988'}</div>}
          </div>

          <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 40px 0', color: '#e2e8f0', display: 'flex', flexDirection: 'column', gap: '15px', flex: 1, fontWeight: '500' }}>
            <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><span style={{ color: '#38bdf8', fontSize: '1.2rem' }}>✓</span> {isEn ? 'Up to 25 Operators' : 'עד 25 מפעילים'}</li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><span style={{ color: '#38bdf8', fontSize: '1.2rem' }}>✓</span> {isEn ? 'Advanced AI Consensus (Multiple LLMs)' : 'הסכמת AI מתקדמת (מספר מודלים)'}</li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><span style={{ color: '#38bdf8', fontSize: '1.2rem' }}>✓</span> {isEn ? 'Priority 24/7 Support' : 'תמיכה בעדיפות 24/7'}</li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><span style={{ color: '#38bdf8', fontSize: '1.2rem' }}>✓</span> {isEn ? 'Custom QA Sampling Rates' : 'שיעורי דגימה מותאמים לבקרת איכות'}</li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><span style={{ color: '#38bdf8', fontSize: '1.2rem' }}>✓</span> {isEn ? 'Advanced Analytics & Exports' : 'אנליטיקה וייצוא דוחות מתקדם'}</li>
          </ul>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button onClick={handlePaymentClick} style={{ backgroundColor: '#38bdf8', color: '#0f172a', border: 'none', padding: '14px', borderRadius: '8px', fontWeight: 'bold', fontSize: '1.05rem', cursor: 'pointer', transition: 'all 0.2s', width: '100%', boxShadow: '0 4px 15px rgba(56, 189, 248, 0.3)' }} onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#0284c7'; e.currentTarget.style.color = '#fff' }} onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#38bdf8'; e.currentTarget.style.color = '#0f172a' }}>
              {isEn ? 'Pay with PayPal' : 'שלם באמצעות PayPal'}
            </button>
            <button onClick={handlePaymentClick} style={{ backgroundColor: 'transparent', color: '#38bdf8', border: '1px solid #38bdf8', padding: '12px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s', width: '100%' }} onMouseOver={(e) => {e.currentTarget.style.backgroundColor = 'rgba(56, 189, 248, 0.1)'}} onMouseOut={(e) => {e.currentTarget.style.backgroundColor = 'transparent'}}>
              {isEn ? 'Pay with Debit/Credit' : 'שלם בכרטיס אשראי'}
            </button>
          </div>
        </div>

        {/* ENTERPRISE PLAN */}
        <div style={{ backgroundColor: 'rgba(30, 41, 59, 0.4)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', padding: '40px', display: 'flex', flexDirection: 'column', transition: 'transform 0.2s', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }} onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
          <h3 style={{ margin: '0 0 10px 0', color: '#fff', fontSize: '1.5rem' }}>{isEn ? 'Enterprise' : 'ארגוני'}</h3>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', minHeight: '45px', margin: 0 }}>{isEn ? 'Unlimited scale and custom integrations for global platforms.' : 'קנה מידה בלתי מוגבל ושילובים מותאמים אישית לפלטפורמות עולמיות.'}</p>
          
          <div style={{ margin: '30px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '30px', height: '61px', display: 'flex', alignItems: 'center' }}>
            <span style={{ fontSize: '2.5rem', fontWeight: '900', color: '#fff' }}>{enterprisePrice}</span>
          </div>

          <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 40px 0', color: '#cbd5e1', display: 'flex', flexDirection: 'column', gap: '15px', flex: 1 }}>
            <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><span style={{ color: '#38bdf8' }}>✓</span> {isEn ? 'Custom Operator Limits' : 'מכסת מפעילים בהתאמה אישית'}</li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><span style={{ color: '#38bdf8' }}>✓</span> {isEn ? 'Dedicated Account Manager' : 'מנהל תיק לקוח ייעודי'}</li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><span style={{ color: '#38bdf8' }}>✓</span> {isEn ? 'Custom AI Model Training' : 'אימון מודל AI מותאם אישית'}</li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><span style={{ color: '#38bdf8' }}>✓</span> {isEn ? 'SSO & Enterprise Compliance' : 'SSO ותאימות ארגונית'}</li>
          </ul>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: 'auto' }}>
            <button onClick={() => navigate('/contact?subject=sales')} style={{ backgroundColor: 'transparent', color: '#fff', border: '1px solid #fff', padding: '14px', borderRadius: '8px', fontWeight: 'bold', fontSize: '1.05rem', cursor: 'pointer', transition: 'all 0.2s', width: '100%' }} onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#fff'; e.currentTarget.style.color = '#0f172a' }} onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#fff' }}>
              {isEn ? 'Contact Sales' : 'צור קשר עם מכירות'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Pricing;