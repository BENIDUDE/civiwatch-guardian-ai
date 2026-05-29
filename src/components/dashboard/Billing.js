/**
 * @file Billing.js
 * @description Organization Subscription & Invoice portal.
 * Handles the display of current plan limits, payment methods, and historical invoices.
 * * SECURITY NOTE: This component silently hides itself from Moderators (L2) and Operators (L1).
 * It will only render for Organization Admins (NGO Admin) or Global Admins.
 */

import React, { useState } from 'react';

// --- UNIVERSAL SVG ICON MAPPING ---
const SVGIcons = {
  CreditCard: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>,
  Sparkles: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"></path></svg>,
  Receipt: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2-1Z"></path><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"></path><path d="M12 17V7"></path></svg>
};

const Billing = ({ userProfile, isEn }) => {
  const isRtl = !isEn;
  const role = userProfile?.role?.toLowerCase()?.trim() || '';
  
  // Strict check: Only higher-tier admins can view billing. 
  // Moderators (L2) and Operators (L1) are intentionally excluded.
  const isAdmin = ['ngo admin', 'global admin', 'super admin', 'admin'].includes(role);

  /**
   * Mock data representing past billing cycles. 
   * In a future update, this should be hooked up to a Stripe/PayPal API endpoint.
   */
  const [invoices] = useState([
    { id: 'INV-2026-0542', date: '2026-05-01', amount: '$499.00', plan: 'Starter Plan - Monthly', status: 'Paid' },
    { id: 'INV-2026-0411', date: '2026-04-01', amount: '$499.00', plan: 'Starter Plan - Monthly', status: 'Paid' },
    { id: 'INV-2026-0305', date: '2026-03-01', amount: '$499.00', plan: 'Starter Plan - Monthly', status: 'Paid' },
  ]);

  // If the user is a Moderator, silently hide this component so they are unaware of its existence.
  if (!isAdmin) {
    return null; 
  }

  const cardStyle = { backgroundColor: 'rgba(30, 41, 59, 0.7)', padding: '30px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', color: '#fff' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', direction: isRtl ? 'rtl' : 'ltr', animation: 'fadeIn 0.4s ease-out' }}>
      
      {/* --- HEADER SECTION --- */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '20px' }}>
        <div>
          <h2 style={{ margin: 0, color: '#fff', fontSize: '1.8rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
            {SVGIcons.CreditCard} {isEn ? 'Billing & Subscription' : 'חיוב ומנויים'}
          </h2>
          <p style={{ margin: '5px 0 0 0', color: '#94a3b8', fontSize: '0.95rem' }}>
            {isEn ? 'Manage your organization\'s plan, payment methods, and invoice history.' : 'ניהול תוכנית הארגון, אמצעי תשלום והיסטוריית חשבוניות.'}
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '30px' }}>
        
        {/* --- CURRENT PLAN CARD --- */}
        <div style={{ ...cardStyle, borderTop: '4px solid #38bdf8' }}>
          <h3 style={{ margin: '0 0 20px 0', fontSize: '1.2rem', color: '#cbd5e1' }}>{isEn ? 'Current Plan' : 'תוכנית נוכחית'}</h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '20px' }}>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#fff', marginBottom: '5px' }}>
                {isEn ? 'Starter Plan' : 'תוכנית התחלתית'}
              </div>
              <div style={{ color: '#10b981', fontSize: '0.9rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block' }}></span>
                {isEn ? 'Active' : 'פעיל'}
              </div>
            </div>
            <div style={{ textAlign: isRtl ? 'left' : 'right' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#fff' }}>$499<span style={{ fontSize: '1rem', color: '#64748b' }}>/mo</span></div>
            </div>
          </div>

          <button style={{ width: '100%', backgroundColor: '#38bdf8', color: '#0f172a', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
            {SVGIcons.Sparkles} {isEn ? 'Upgrade to Professional' : 'שדרוג לתוכנית מקצועית'}
          </button>
        </div>

        {/* --- PAYMENT METHOD CARD --- */}
        <div style={{ ...cardStyle }}>
          <h3 style={{ margin: '0 0 20px 0', fontSize: '1.2rem', color: '#cbd5e1' }}>{isEn ? 'Payment Method' : 'אמצעי תשלום'}</h3>
          
          <div style={{ border: '1px solid #334155', borderRadius: '12px', padding: '20px', display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px', backgroundColor: 'rgba(15, 23, 42, 0.4)' }}>
            <div style={{ backgroundColor: '#fff', padding: '5px 10px', borderRadius: '6px', fontWeight: 'bold', color: '#003087', fontStyle: 'italic' }}>
              PayPal
            </div>
            <div>
              <div style={{ color: '#fff', fontWeight: 'bold', fontSize: '1rem' }}>{userProfile.email}</div>
              <div style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '4px' }}>{isEn ? 'Next billing date: June 1, 2026' : 'תאריך חיוב הבא: 1 ביוני 2026'}</div>
            </div>
          </div>

          <button style={{ width: '100%', backgroundColor: 'transparent', color: '#38bdf8', border: '1px solid #38bdf8', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s' }}>
            {isEn ? 'Update Payment Method' : 'עדכון אמצעי תשלום'}
          </button>
        </div>
      </div>

      {/* --- INVOICE HISTORY TABLE --- */}
      <div style={{ backgroundColor: 'rgba(15, 23, 42, 0.4)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden', marginTop: '10px' }}>
        <div style={{ padding: '20px 30px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ color: '#94a3b8' }}>{SVGIcons.Receipt}</span>
          <h3 style={{ margin: 0, color: '#fff', fontSize: '1.3rem' }}>{isEn ? 'Billing History' : 'היסטוריית חשבוניות'}</h3>
        </div>
        
        <div style={{ padding: '20px 30px', overflowX: 'auto' }}>
          <div style={{ minWidth: '700px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr 2fr 1fr 1fr', color: '#94a3b8', borderBottom: '1px solid #334155', paddingBottom: '10px', marginBottom: '10px', fontSize: '0.85rem', textTransform: 'uppercase', fontWeight: 'bold' }}>
              <div>{isEn ? 'Date' : 'תאריך'}</div>
              <div>{isEn ? 'Invoice ID' : 'מזהה חשבונית'}</div>
              <div>{isEn ? 'Plan Details' : 'פרטי תוכנית'}</div>
              <div>{isEn ? 'Amount' : 'סכום'}</div>
              <div style={{ textAlign: isRtl ? 'left' : 'right' }}>{isEn ? 'Status' : 'סטטוס'}</div>
            </div>
            
            {invoices.map((inv, idx) => (
              <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr 2fr 1fr 1fr', alignItems: 'center', padding: '16px 0', borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                <div style={{ color: '#cbd5e1' }}>{inv.date}</div>
                <div style={{ color: '#38bdf8', fontFamily: 'monospace' }}>{inv.id}</div>
                <div style={{ color: '#e2e8f0' }}>{inv.plan}</div>
                <div style={{ color: '#fff', fontWeight: 'bold' }}>{inv.amount}</div>
                <div style={{ textAlign: isRtl ? 'left' : 'right' }}>
                  <span style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '4px 10px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 'bold', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                    {inv.status === 'Paid' ? (isEn ? 'Paid' : 'שולם') : inv.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
};

export default Billing;