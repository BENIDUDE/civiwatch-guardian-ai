/**
 * @file Dashboard.js
 * @description Root container for the CiviWatch Operations Center.
 * FEATURE: Context-Aware Help Modal. The Help icon dynamically swaps its content 
 * (explanations and interactive simulators) based on the currently active tab.
 * UPDATED: Integrated the OnboardingWelcome interceptor for new operators, 
 * and added a strict global filter to block "ghost" users without emails from entering the UI.
 */
import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

// Modular Logic (Hooks)
import { useShiftTimer } from '../hooks/useShiftTimer';
import { useIdleTracker } from '../hooks/useIdleTracker'; 

// Modular UI Components
import Workspace from '../components/dashboard/Workspace';
import Analytics from '../components/dashboard/Analytics';
import CiviHQ from '../components/dashboard/CiviHQ'; 
import SettingsTab from '../components/dashboard/SettingsTab';
import SubmitReportsTab from '../components/dashboard/SubmitReportsTab';
import ReportsTab from '../components/dashboard/ReportsTab';
import OnboardingWelcome from '../components/dashboard/OnboardingWelcome'; 

// --- INTERACTIVE ROLE SIMULATOR COMPONENT (For Workspace Help) ---
const RoleSimulator = ({ isEn }) => {
  const [viewRole, setViewRole] = useState('global');

  const isVisible = (nodeId) => {
    if (viewRole === 'global') return true; 
    if (viewRole === 'ngo') return ['ngoA', 'modA', 'op1', 'op2'].includes(nodeId); 
    if (viewRole === 'mod') return ['modA', 'op1', 'op2'].includes(nodeId); 
    if (viewRole === 'op') return ['op1'].includes(nodeId); 
    return false;
  };

  const getNodeStyle = (nodeId, baseColor) => {
    const visible = isVisible(nodeId);
    return {
      position: 'absolute', transform: 'translate(-50%, -50%)',
      backgroundColor: visible ? baseColor : 'rgba(30, 41, 59, 0.8)',
      color: visible ? '#fff' : '#475569',
      border: `2px solid ${visible ? baseColor : '#334155'}`,
      padding: '8px 16px', borderRadius: '8px', fontWeight: 'bold', fontSize: '12px',
      textAlign: 'center', whiteSpace: 'nowrap', transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      boxShadow: visible ? `0 0 15px ${baseColor}40` : 'none', zIndex: 10
    };
  };

  const getLineStyle = (targetId) => {
    const visible = isVisible(targetId);
    return { stroke: visible ? '#64748b' : '#1e293b', strokeWidth: 2, transition: 'all 0.4s ease' };
  };

  return (
    <div style={{ backgroundColor: 'rgba(15, 23, 42, 0.5)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h4 style={{ margin: '0 0 5px 0', color: '#fff', fontSize: '16px' }}>{isEn ? '🔐 Interactive Access Simulator' : '🔐 סימולטור הרשאות אינטראקטיבי'}</h4>
          <p style={{ margin: 0, color: '#94a3b8', fontSize: '13px' }}>{isEn ? 'Select a role to see how the system isolates data.' : 'בחר הרשאה כדי לראות כיצד המערכת מסננת נתונים.'}</p>
        </div>
        <select value={viewRole} onChange={(e) => setViewRole(e.target.value)} style={{ backgroundColor: '#1e293b', color: '#38bdf8', border: '1px solid #38bdf8', padding: '8px 16px', borderRadius: '8px', outline: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
          <option value="global">{isEn ? 'View as: Global Admin' : 'הצג כ: מנהל ראשי'}</option>
          <option value="ngo">{isEn ? 'View as: Org Admin (Org A)' : 'הצג כ: מנהל ארגון (ארגון א)'}</option>
          <option value="mod">{isEn ? 'View as: Moderator (Team A)' : 'הצג כ: מנהל צוות (צוות א)'}</option>
          <option value="op">{isEn ? 'View as: Operator 1' : 'הצג כ: מפעיל 1'}</option>
        </select>
      </div>

      <div style={{ position: 'relative', width: '100%', height: '300px', backgroundColor: '#020617', borderRadius: '12px', overflow: 'hidden' }}>
        <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }} viewBox="0 0 100 100" preserveAspectRatio="none">
          <line x1="50" y1="15" x2="30" y2="40" style={getLineStyle('ngoA')} />
          <line x1="50" y1="15" x2="70" y2="40" style={getLineStyle('ngoB')} />
          <line x1="30" y1="40" x2="30" y2="65" style={getLineStyle('modA')} />
          <line x1="30" y1="65" x2="15" y2="90" style={getLineStyle('op1')} />
          <line x1="30" y1="65" x2="45" y2="90" style={getLineStyle('op2')} />
        </svg>

        <div style={{ ...getNodeStyle('global', '#a855f7'), top: '15%', left: '50%' }}>{isEn ? 'Global Command' : 'מטה עולמי'} <br/><span style={{fontWeight:'normal', fontSize:'10px'}}>Super Admin</span></div>
        <div style={{ ...getNodeStyle('ngoA', '#38bdf8'), top: '40%', left: '30%' }}>{isEn ? 'Organization A' : 'ארגון א\''} <br/><span style={{fontWeight:'normal', fontSize:'10px'}}>NGO Admin</span></div>
        <div style={{ ...getNodeStyle('ngoB', '#38bdf8'), top: '40%', left: '70%' }}>{isEn ? 'Organization B' : 'ארגון ב\''} <br/><span style={{fontWeight:'normal', fontSize:'10px'}}>NGO Admin</span></div>
        <div style={{ ...getNodeStyle('modA', '#10b981'), top: '65%', left: '30%' }}>{isEn ? 'Team Alpha' : 'צוות אלפא'} <br/><span style={{fontWeight:'normal', fontSize:'10px'}}>Moderator L2</span></div>
        <div style={{ ...getNodeStyle('op1', '#cbd5e1'), top: '90%', left: '15%' }}>{isEn ? 'Operator 1' : 'מפעיל 1'}</div>
        <div style={{ ...getNodeStyle('op2', '#cbd5e1'), top: '90%', left: '45%' }}>{isEn ? 'Operator 2' : 'מפעיל 2'}</div>
      </div>
    </div>
  );
};

// --- INTERACTIVE REPORTS SIMULATOR COMPONENT (For Reports Help) ---
const ReportsSimulator = ({ isEn }) => {
  const [simState, setSimState] = useState('active'); // active, unassigned, gdpr

  return (
    <div style={{ backgroundColor: 'rgba(15, 23, 42, 0.5)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h4 style={{ margin: '0 0 5px 0', color: '#fff', fontSize: '16px' }}>{isEn ? '🔄 Recovery & GDPR Simulator' : '🔄 סימולטור שחזור ו-GDPR'}</h4>
          <p style={{ margin: 0, color: '#94a3b8', fontSize: '13px' }}>{isEn ? 'See how reports move through recovery states.' : 'ראה כיצד דיווחים עוברים במצבי שחזור.'}</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => setSimState('active')} style={{ backgroundColor: simState === 'active' ? '#38bdf8' : '#1e293b', color: simState === 'active' ? '#0f172a' : '#94a3b8', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', transition: 'all 0.2s' }}>{isEn ? 'Active' : 'פעיל'}</button>
          <button onClick={() => setSimState('unassigned')} style={{ backgroundColor: simState === 'unassigned' ? '#eab308' : '#1e293b', color: simState === 'unassigned' ? '#0f172a' : '#94a3b8', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', transition: 'all 0.2s' }}>{isEn ? 'Operator Leaves' : 'מפעיל עוזב'}</button>
          <button onClick={() => setSimState('gdpr')} style={{ backgroundColor: simState === 'gdpr' ? '#ef4444' : '#1e293b', color: simState === 'gdpr' ? '#fff' : '#94a3b8', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', transition: 'all 0.2s' }}>{isEn ? '85+ Days Old' : 'מעל 85 יום'}</button>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '15px', backgroundColor: '#020617', padding: '20px', borderRadius: '12px' }}>
        
        {/* Operator Queue Box */}
        <div style={{ flex: 1, height: '100px', border: `2px dashed ${simState === 'active' ? '#38bdf8' : '#334155'}`, borderRadius: '8px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', transition: 'all 0.3s' }}>
          <span style={{ color: simState === 'active' ? '#38bdf8' : '#64748b', fontWeight: 'bold', marginBottom: '10px' }}>{isEn ? "Operator's Queue" : 'תור מפעיל'}</span>
          {simState === 'active' && <div style={{ padding: '8px 16px', backgroundColor: '#0f172a', border: '1px solid #38bdf8', color: '#fff', borderRadius: '6px', fontSize: '12px', animation: 'fadeIn 0.3s' }}>{isEn ? 'Report #1234' : 'דיווח #1234'}</div>}
        </div>

        {/* Unassigned Pool Box */}
        <div style={{ flex: 1, height: '100px', border: `2px dashed ${simState === 'unassigned' ? '#eab308' : '#334155'}`, borderRadius: '8px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', transition: 'all 0.3s' }}>
          <span style={{ color: simState === 'unassigned' ? '#eab308' : '#64748b', fontWeight: 'bold', marginBottom: '10px' }}>{isEn ? "Triage Recovery" : 'שחזור דיווחים'}</span>
          {simState === 'unassigned' && <div style={{ padding: '8px 16px', backgroundColor: '#0f172a', border: '1px solid #eab308', color: '#fff', borderRadius: '6px', fontSize: '12px', animation: 'fadeIn 0.3s' }}>{isEn ? 'Report #1234 (Locked)' : 'דיווח #1234 (נעול)'}</div>}
        </div>

        {/* GDPR Purge Box */}
        <div style={{ flex: 1, height: '100px', border: `2px dashed ${simState === 'gdpr' ? '#ef4444' : '#334155'}`, borderRadius: '8px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', transition: 'all 0.3s' }}>
          <span style={{ color: simState === 'gdpr' ? '#ef4444' : '#64748b', fontWeight: 'bold', marginBottom: '10px' }}>{isEn ? "GDPR Purge List" : 'מחיקת GDPR'}</span>
          {simState === 'gdpr' && <div style={{ padding: '8px 16px', backgroundColor: 'rgba(239,68,68,0.2)', border: '1px solid #ef4444', color: '#ef4444', borderRadius: '6px', fontSize: '12px', animation: 'fadeIn 0.3s', textDecoration: 'line-through' }}>{isEn ? '[REDACTED]' : '[נמחק]'}</div>}
        </div>

      </div>
      <p style={{ marginTop: '15px', color: '#cbd5e1', fontSize: '13px', textAlign: 'center' }}>
        {simState === 'active' && (isEn ? "The report is actively being worked on by an Operator." : "הדיווח מטופל באופן פעיל על ידי מפעיל.")}
        {simState === 'unassigned' && (isEn ? "The Operator left or took leave. The report is automatically pulled to Triage Recovery for a Manager to Bulk Assign to someone else." : "המפעיל עזב או יצא לחופשה. הדיווח נמשך אוטומטית לשחזור כדי שמנהל יוכל להקצות אותו מחדש.")}
        {simState === 'gdpr' && (isEn ? "The report has sat in the database for 85+ days. Admins must purge it to comply with data privacy laws." : "הדיווח נשאר במסד הנתונים מעל 85 יום. מנהלים חייבים למחוק אותו כדי לעמוד בחוקי פרטיות המידע.")}
      </p>
    </div>
  );
};


// --- DYNAMIC CONTEXT-AWARE HELP MODAL COMPONENT ---
const DashboardHelpModal = ({ isOpen, onClose, isEn, activeTab }) => {
  if (!isOpen) return null;

  const renderContent = () => {
    switch (activeTab) {
      case 'reports':
        return (
          <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <div style={{ marginBottom: '30px' }}>
              <h3 style={{ color: '#fff', marginBottom: '15px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px' }}>
                {isEn ? '📄 Command Center Reports Guide' : '📄 מדריך דוחות מרכז הבקרה'}
              </h3>
              <p style={{ color: '#cbd5e1', lineHeight: '1.6', fontSize: '15px' }}>
                {isEn 
                  ? 'This tab provides real-time visibility into operations, compliance, and team performance. Select a report from the sidebar.' 
                  : 'לשונית זו מספקת נראות בזמן אמת על תפעול, ציות לרגולציה וביצועי הצוות. בחר דוח מהתפריט הצידי.'}
              </p>

              <div style={{ display: 'grid', gap: '15px', marginTop: '20px' }}>
                
                <div style={{ backgroundColor: 'rgba(30,41,59,0.5)', padding: '15px', borderRadius: '8px' }}>
                  <h4 style={{ color: '#38bdf8', margin: '0 0 10px 0' }}>{isEn ? '👤 Personal' : '👤 אישי'}</h4>
                  <ul style={{ color: '#94a3b8', margin: 0, paddingLeft: isEn ? '20px' : 0, paddingRight: isEn ? 0 : '20px', fontSize: '14px', lineHeight: '1.6' }}>
                    <li><strong style={{ color: '#cbd5e1' }}>{isEn ? 'Recent Work Items:' : 'משימות אחרונות:'}</strong> {isEn ? 'Your history of completed triage and assignments.' : 'היסטוריית דיווחי הטריאז׳ והמשימות שהשלמת.'}</li>
                    <li><strong style={{ color: '#cbd5e1' }}>{isEn ? 'QA Feedback History:' : 'היסטוריית משוב QA:'}</strong> {isEn ? 'Direct feedback and corrections from your managers.' : 'משוב ותיקונים ישירים מהמנהלים שלך.'}</li>
                  </ul>
                </div>

                <div style={{ backgroundColor: 'rgba(30,41,59,0.5)', padding: '15px', borderRadius: '8px' }}>
                  <h4 style={{ color: '#38bdf8', margin: '0 0 10px 0' }}>{isEn ? '👥 Team Management (Moderators)' : '👥 ניהול צוות (מנהלים)'}</h4>
                  <ul style={{ color: '#94a3b8', margin: 0, paddingLeft: isEn ? '20px' : 0, paddingRight: isEn ? 0 : '20px', fontSize: '14px', lineHeight: '1.6' }}>
                    <li><strong style={{ color: '#cbd5e1' }}>{isEn ? 'SLA Risk Queue:' : 'תור סיכון SLA:'}</strong> {isEn ? 'Active items assigned to your team that are pending resolution.' : 'פריטים פעילים שהוקצו לצוות שלך וממתינים לטיפול.'}</li>
                    <li><strong style={{ color: '#cbd5e1' }}>{isEn ? 'QA Dispute Log & Live Throughput:' : 'יומן מחלוקות QA והספק חי:'}</strong> {isEn ? 'Advanced metric modules (Unlocks with more data).' : 'מודולי מדדים מתקדמים (נפתחים כשיש מספיק נתונים).'}</li>
                  </ul>
                </div>

                <div style={{ backgroundColor: 'rgba(30,41,59,0.5)', padding: '15px', borderRadius: '8px' }}>
                  <h4 style={{ color: '#38bdf8', margin: '0 0 10px 0' }}>{isEn ? '🏛️ Compliance & Org (Admins)' : '🏛️ ציות וארגון (מנהלי מערכת)'}</h4>
                  <ul style={{ color: '#94a3b8', margin: 0, paddingLeft: isEn ? '20px' : 0, paddingRight: isEn ? 0 : '20px', fontSize: '14px', lineHeight: '1.6' }}>
                    <li><strong style={{ color: '#cbd5e1' }}>{isEn ? 'Triage & Assignment Recovery:' : 'שחזור דיווחים ומשימות:'}</strong> {isEn ? 'Bulk-reassign locked items from absent operators.' : 'הקצאה מחדש של פריטים נעולים ממפעילים שנעדרו.'}</li>
                    <li><strong style={{ color: '#cbd5e1' }}>{isEn ? 'Resolution Audit Log:' : 'יומן החלטות סופי:'}</strong> {isEn ? 'Immutable ledger of all approvals, rejections, and appeals.' : 'יומן בלתי ניתן לשינוי של כל האישורים, הדחיות והערעורים.'}</li>
                    <li><strong style={{ color: '#cbd5e1' }}>{isEn ? 'GDPR 90-Day Purge:' : 'מחיקת 90 יום (GDPR):'}</strong> {isEn ? 'Mass-anonymize records older than 85 days for legal compliance.' : 'אנונימיזציה המונית של רשומות מעל גיל 85 יום לעמידה בתקנות.'}</li>
                  </ul>
                </div>
              </div>
            </div>

            <h3 style={{ color: '#fff', marginBottom: '15px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px' }}>
              {isEn ? 'Recovery & Compliance Workflows' : 'תהליכי שחזור וציות'}
            </h3>
            <ReportsSimulator isEn={isEn} />
          </div>
        );

      case 'workspace':
      default:
        // Default Workspace Help
        return (
          <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <div style={{ marginBottom: '40px' }}>
              <h3 style={{ color: '#fff', marginBottom: '15px' }}>{isEn ? '1. Video Tutorial' : '1. מדריך וידאו'}</h3>
              <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                <iframe src="https://www.loom.com/embed/49254e6a6b0a4d7ea2380df72211fb3c?sid=7db7e945-8854-47b2-a4f6-efbdf42b2915" frameBorder="0" webkitallowfullscreen="true" mozallowfullscreen="true" allowFullScreen style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }} title="CiviWatch Dashboard Guide"></iframe>
              </div>
            </div>

            <div>
              <h3 style={{ color: '#fff', marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px' }}>{isEn ? '2. System Workflows & Roles' : '2. תהליכי עבודה והרשאות'}</h3>
              <RoleSimulator isEn={isEn} />

              <div style={{ display: 'grid', gap: '20px', marginTop: '20px' }}>
                <div style={{ backgroundColor: 'rgba(30,41,59,0.5)', padding: '20px', borderRadius: '12px' }}>
                  <h4 style={{ color: '#38bdf8', margin: '0 0 10px 0' }}>{isEn ? '⏱️ The Workspace & Shift Clock' : '⏱️ סביבת העבודה ושעון משמרת'}</h4>
                  <p style={{ color: '#cbd5e1', margin: 0, lineHeight: '1.6', fontSize: '15px' }}>{isEn ? "Before interacting with any reports, you must 'Clock In' via the Shift tab. This logs your activity for the shift. If you log out without clocking out, the system will automatically close your shift." : "לפני תחילת הטיפול בדיווחים, עליך 'להיכנס למשמרת' דרך הלשונית הראשונה. פעולה זו מתעדת את הפעילות שלך. אם תתנתק ללא יציאה מסודרת, המערכת תסגור את המשמרת אוטומטית."}</p>
                </div>

                <div style={{ backgroundColor: 'rgba(30,41,59,0.5)', padding: '20px', borderRadius: '12px' }}>
                  <h4 style={{ color: '#38bdf8', margin: '0 0 10px 0' }}>{isEn ? '📋 Managing the Queue' : '📋 ניהול תור העבודה'}</h4>
                  <p style={{ color: '#cbd5e1', margin: 0, lineHeight: '1.6', fontSize: '15px' }}>{isEn ? "The Queue contains all reports assigned to your organization. Level 1 Operators only see reports assigned directly to them. Review the AI Confidence Score and Evidence links before updating the status to 'Verified' or 'Dismissed'." : "תור העבודה מכיל את כל הדיווחים שהוקצו לארגון שלך. מפעילים רמה 1 רואים רק דיווחים שהוקצו להם ישירות. יש לבחון את ציון הביטחון של ה-AI ואת קישורי ההוכחות לפני שינוי סטטוס ל'מאומת' או 'נדחה'."}</p>
                </div>

                <div style={{ backgroundColor: 'rgba(30,41,59,0.5)', padding: '20px', borderRadius: '12px' }}>
                  <h4 style={{ color: '#38bdf8', margin: '0 0 10px 0' }}>{isEn ? '➕ Submitting Manual Reports' : '➕ הזנת דיווחים ידנית'}</h4>
                  <p style={{ color: '#cbd5e1', margin: 0, lineHeight: '1.6', fontSize: '15px' }}>{isEn ? "Use the 'New' tab to manually ingest threats into the system. As an authenticated operator, reports submitted here bypass the public verification queue and are immediately assigned to your organization's internal queue." : "השתמש בלשונית 'דיווח חדש' כדי להזין איומים ידנית למערכת. כמפעיל מזוהה, דיווחים שיוזנו כאן עוקפים את תור האימות הציבורי ומוקצים מיד לתור הפנימי של הארגון."}</p>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 5000, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px', backdropFilter: 'blur(5px)' }} onClick={onClose}>
      <div style={{ backgroundColor: '#0f172a', border: '1px solid #38bdf8', borderRadius: '16px', maxWidth: '900px', width: '100%', maxHeight: '90vh', overflowY: 'auto', position: 'relative', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', direction: isEn ? 'ltr' : 'rtl' }} onClick={e => e.stopPropagation()}>
        
        <div style={{ position: 'sticky', top: 0, backgroundColor: 'rgba(15,23,42,0.95)', padding: '20px 30px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10 }}>
          <h2 style={{ margin: 0, color: '#fff', fontSize: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ color: '#38bdf8' }}>❓</span> {isEn ? 'Operations Guide & Training' : 'מדריך תפעול והדרכה'}
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '28px', cursor: 'pointer', transition: 'color 0.2s' }} onMouseOver={e=>e.target.style.color='#fff'} onMouseOut={e=>e.target.style.color='#94a3b8'}>&times;</button>
        </div>

        <div style={{ padding: '30px' }}>
          {renderContent()}
        </div>

      </div>
    </div>
  );
};

const Dashboard = ({ lang }) => {
  const isEn = lang === 'EN';
  const navigate = useNavigate();

  // --- RESPONSIVE MOBILE STATE ---
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 850);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 850);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // --- CORE STATE WITH LOCAL STORAGE PERSISTENCE ---
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem('civiwatch_dashboard_tab') || 'workspace';
  });
  
  const [userProfile, setUserProfile] = useState(null);
  const [reports, setReports] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  // Sync tab changes to local storage so they survive refreshes
  useEffect(() => {
    localStorage.setItem('civiwatch_dashboard_tab', activeTab);
    setIsMobileMenuOpen(false); // Close mobile menu when navigating
  }, [activeTab]);

  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const triggerToast = useCallback((message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  }, []);

  useEffect(() => {
    const handleOpenHelp = () => setIsHelpOpen(true);
    window.addEventListener('openDashboardHelp', handleOpenHelp);
    return () => window.removeEventListener('openDashboardHelp', handleOpenHelp);
  }, []);

  const handleRoleSwitch = async (newRole) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('user_profiles')
        .update({ role: newRole })
        .eq('id', userProfile.id);

      if (error) throw error;

      setUserProfile(prev => ({ ...prev, role: newRole }));
      setIsMobileMenuOpen(false);
      
      const safeRole = newRole.toLowerCase().trim();
      const isNowSuperUser = ['admin', 'super admin', 'system admin', 'global admin'].includes(safeRole);
      
      if (safeRole === 'operator l1' && ['settings', 'hq'].includes(activeTab)) {
        setActiveTab('workspace');
      } else if (!isNowSuperUser && activeTab === 'hq') {
        setActiveTab('workspace');
      }

      triggerToast(isEn ? `Switched view to ${newRole}` : `עברת לתצוגת ${newRole}`, 'success');
    } catch (err) {
      console.error('Role switch error:', err.message);
      triggerToast(isEn ? 'Failed to switch role' : 'החלפת ההרשאה נכשלה', 'error');
    } finally {
      setLoading(false);
    }
  };

  const { 
    isClockedIn, 
    shiftDuration, 
    stats, 
    handleClockIn, 
    handleClockOut, 
    fetchUserStats 
  } = useShiftTimer(userProfile, isEn, triggerToast);

  // --- AUTO-LOGOUT HOOK WITH FAILSAFE ---
  const idleTimeoutMins = userProfile?.organizations?.idle_timeout_minutes || 60;
  
  const handleLogout = useCallback(async (isAutoLogout = false) => {
    try {
      localStorage.removeItem('civiwatch_dashboard_tab');

      if (isClockedIn) {
        await handleClockOut();
        const msg = isAutoLogout 
          ? (isEn ? 'Session expired due to inactivity. Logging out...' : 'החיבור פג עקב חוסר פעילות. מתנתק...')
          : (isEn ? 'Shift closed automatically. Logging out...' : 'המשמרת נסגרה אוטומטית. מתנתק...');
        triggerToast(msg, isAutoLogout ? 'error' : 'success');
        setTimeout(async () => { await supabase.auth.signOut(); navigate('/login'); }, 1500);
      } else {
        await supabase.auth.signOut();
        navigate('/login');
      }
    } catch (err) {
      console.error("Logout Error:", err);
      await supabase.auth.signOut();
      navigate('/login');
    }
  }, [isClockedIn, handleClockOut, triggerToast, isEn, navigate]);

  useIdleTracker(idleTimeoutMins, isClockedIn, handleLogout);

  // --- DATA FETCHING ---
  const fetchDashboardData = useCallback(async () => {
    if (!userProfile) return;
    
    try {
      const role = userProfile.role?.toLowerCase()?.trim() || '';
      const isSuperUser = ['admin', 'super admin', 'system admin', 'global admin'].includes(role);

      if (!isSuperUser && !userProfile.organization_id) {
        setReports([]);
        setTeamMembers([]);
        setLoading(false);
        return;
      }

      let reportQuery = supabase.from('reports').select('*, assigned_to_profile:user_profiles!assigned_to(*)');
      let assignQuery = supabase.from('assignments').select('*');
      
      if (userProfile.organization_id) {
        reportQuery = reportQuery.eq('organization_id', userProfile.organization_id);
        assignQuery = assignQuery.eq('organization_id', userProfile.organization_id);
      }

      if (!isSuperUser && role === 'operator l1') {
        const targetId = userProfile.id || userProfile.user_id || 'RESTRICTED';
        reportQuery = reportQuery.or(`assigned_to.eq.${targetId},submitted_by.eq.${targetId}`);
        assignQuery = assignQuery.eq('assigned_to', targetId);
      }
      
      const { data: reportData, error: reportError } = await reportQuery;
      if (reportError) console.error("Report Fetch Error:", reportError.message);

      const { data: assignData, error: assignError } = await assignQuery;
      if (assignError) console.error("Assignment Fetch Error:", assignError.message);

      const combined = [
        ...(reportData || []).map(r => ({ ...r, _table: 'reports' })),
        ...(assignData || []).map(a => ({ ...a, _table: 'assignments' }))
      ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      
      setReports(combined);

      if (isSuperUser || role !== 'operator l1') {
        let teamQuery = supabase.from('user_profiles').select('*');
        if (userProfile.organization_id) {
          teamQuery = teamQuery.eq('organization_id', userProfile.organization_id);
        }
        const { data: teamData, error: teamError } = await teamQuery;
        
        if (teamError) {
          console.error("Team Fetch Error:", teamError.message);
        } else if (teamData) {
          // STRICT GLOBAL FILTER: Remove any ghost records without an email
          const cleanTeam = teamData.filter(member => member.email && member.email.trim() !== '');
          setTeamMembers(cleanTeam);
        }
      }

    } catch (err) {
      console.error("Dashboard fetch error:", err.message);
    } finally {
      setLoading(false);
    }
  }, [userProfile]); 

  // --- SUPABASE REALTIME SUBSCRIPTIONS ---
  useEffect(() => {
    if (!userProfile) return;

    const reportSubscription = supabase
      .channel('public:reports')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reports' }, () => {
        fetchDashboardData();
      })
      .subscribe();

    const assignmentSubscription = supabase
      .channel('public:assignments')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'assignments' }, () => {
        fetchDashboardData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(reportSubscription);
      supabase.removeChannel(assignmentSubscription);
    };
  }, [userProfile, fetchDashboardData]);

  // --- AUTH & PROFILE LOADING ---
  const loadProfile = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return navigate('/login');

    const email = session.user.email;
    
    try {
      let { data: profile, error } = await supabase
        .from('user_profiles')
        .select('*, organizations(*)')
        .eq('user_id', session.user.id)
        .single();

      if (error && error.code === 'PGRST116') {
        const emailDomain = email.substring(email.lastIndexOf("@")).toLowerCase();

        const { data: orgData } = await supabase
          .from('organizations')
          .select('id, name')
          .eq('email_domain', emailDomain)
          .single();

        const newProfile = {
          user_id: session.user.id,
          email: email,
          display_name: null, // DELIBERATELY NULL SO THE WELCOME TRAP CATCHES THEM
          role: 'Operator L1', 
          organization_id: orgData ? orgData.id : null, 
          current_sampling_rate: 100 
        };

        const { data: insertedProfile, error: insertError } = await supabase
          .from('user_profiles')
          .insert([newProfile])
          .select('*, organizations(*)')
          .single();

        if (insertError) throw insertError;
        profile = insertedProfile;
        triggerToast(isEn ? `Welcome! Routed to ${orgData?.name || 'Pending Verification'}` : `ברוך הבא! נותבת אל ${orgData?.name || 'המתנה לאישור'}`, 'success');
      } else if (error) {
        throw error; 
      }

      // ENSURE EMAIL EXISTS IN DB WITHOUT OVERWRITING BLANK DISPLAY NAMES
      if (!profile.email) {
        try {
          await supabase.from('user_profiles').update({ email: email }).eq('id', profile.id);
          profile.email = email;
        } catch(e) {}
      }

      setUserProfile({ ...profile, displayName: profile.display_name });
      
      const pRole = profile.role?.toLowerCase()?.trim() || '';
      
      const savedTab = localStorage.getItem('civiwatch_dashboard_tab') || 'workspace';
      const isSuperUser = ['admin', 'super admin', 'system admin', 'global admin'].includes(pRole);

      if (savedTab === 'hq' && !isSuperUser) {
        setActiveTab('workspace');
      } else if (['settings'].includes(savedTab) && pRole === 'operator l1') {
        setActiveTab('workspace');
      } else {
        setActiveTab(savedTab);
      }

    } catch (err) {
      console.error("Profile load error:", err.message);
    }
  }, [navigate, isEn, triggerToast]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  useEffect(() => {
    const role = userProfile?.role?.toLowerCase()?.trim() || '';
    const isSuperUser = ['admin', 'super admin', 'system admin', 'global admin'].includes(role);

    if (userProfile?.organization_id || isSuperUser) {
      if (['workspace', 'submit', 'analytics', 'reports', 'settings', 'hq'].includes(activeTab)) {
        setLoading(true); 
        fetchDashboardData();
      }
      if (activeTab === 'workspace') fetchUserStats();
    }
  }, [userProfile, activeTab, fetchDashboardData, fetchUserStats]);

  // --- ASSIGNMENT LOGIC ---
  const handleAssignReport = async (reportId, operatorId, currentNotes, tableName = 'reports') => {
    const targetAssignee = operatorId === '' ? null : operatorId;
    const operator = teamMembers.find(m => m.id === targetAssignee || m.user_id === targetAssignee);
    const operatorName = operator?.display_name || operator?.email?.split('@')[0] || (isEn ? 'Unassigned' : 'לא משויך');
    
    const safeNotes = Array.isArray(currentNotes) ? currentNotes : [];

    const newNote = {
      timestamp: new Date().toISOString(),
      actor: userProfile.displayName,
      action: targetAssignee ? `Assigned to ${operatorName}` : 'Unassigned',
      note: 'Moderator dispatch'
    };

    const { error } = await supabase
      .from(tableName) 
      .update({ 
        assigned_to: targetAssignee, 
        status: targetAssignee ? 'In Progress' : 'Pending', 
        additional_info: [...safeNotes, newNote] 
      })
      .eq('id', reportId);

    if (!error) {
      triggerToast(isEn ? "Assignment updated" : "הקצאה עודכנה", 'success');
    } else {
      console.error("Assignment DB Error:", error);
      triggerToast((isEn ? "DB Error: " : "שגיאת מסד נתונים: ") + error.message, 'error');
    }
  };

  // --- STATUS UPDATES & QA AUDITS ---
  const handleStatusUpdate = async (reportId, newStatus, currentNotes, reason, tableName = 'reports', finalSubject = null, originalSubmitter = null) => {
    const safeNotes = Array.isArray(currentNotes) ? currentNotes : [];
    
    const newNote = {
      timestamp: new Date().toISOString(),
      actor: userProfile.displayName,
      action: `Status change: ${newStatus}`,
      note: reason || 'Verified'
    };

    const updatePayload = { 
      status: newStatus, 
      additional_info: [...safeNotes, newNote] 
    };

    if (newStatus === 'Pending Review') {
      updatePayload.review_requested_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from(tableName) 
      .update(updatePayload)
      .eq('id', reportId);

    if (!error) {
      if ((newStatus === 'Dismissed' || newStatus === 'Changes Requested') && finalSubject) {
        const authUserId = userProfile.user_id || userProfile.id;
        const { error: qaError } = await supabase.from('qa_audits').insert([{
          report_id: reportId,
          operator_id: originalSubmitter || null,
          moderator_id: authUserId,
          action_taken: newStatus,
          reason_category: finalSubject,
          detailed_note: reason
        }]);
        if (qaError) console.error("Failed to log QA Audit:", qaError.message);
      }

      triggerToast(isEn ? "Updated successfully" : "עודכן בהצלחה", 'success');
    } else {
      triggerToast((isEn ? "DB Error: " : "שגיאת מסד נתונים: ") + error.message, 'error');
    }
  };

  // --- SHRUNKEN 6-TAB NAVIGATION WITH STRICT LOCK LOGIC ---
  const renderTabs = () => {
    const role = userProfile?.role?.toLowerCase()?.trim() || '';
    const isSuperUser = ['admin', 'super admin', 'system admin', 'global admin'].includes(role);
    const isLocalManager = ['moderator l2', 'ngo admin'].includes(role);
    const isAdmin = isSuperUser || isLocalManager;

    const requiresShift = ['operator l1', 'moderator l2'].includes(role);
    const tabsLocked = requiresShift && !isClockedIn;

    const tabs = [
      { id: 'workspace', label: isEn ? 'Workspace' : 'סביבת עבודה', icon: '💻' },
      { id: 'submit', label: isEn ? 'My Reports' : 'הדיווחים שלי', icon: '📝' },
      { id: 'analytics', label: isEn ? 'Intelligence' : 'מודיעין', icon: '📊' },
      { id: 'reports', label: isEn ? 'Reports' : 'דוחות', icon: '📄' }
    ];

    if (isAdmin) {
      tabs.push({ id: 'settings', label: isEn ? 'Settings' : 'הגדרות', icon: '⚙️' });
    }
    
    if (isSuperUser) {
      tabs.push({ id: 'hq', label: isEn ? 'Civi HQ' : 'מטה ראשי', icon: '🌍' });
    }

    return (
      <div style={{ 
        marginBottom: '35px', 
        display: 'flex', 
        flexWrap: isMobile ? 'nowrap' : 'wrap', 
        overflowX: isMobile ? 'auto' : 'visible',
        WebkitOverflowScrolling: 'touch',
        gap: '5px', 
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        paddingBottom: isMobile ? '5px' : '0'
      }}>
        {tabs.map(t => {
          const isActive = activeTab === t.id;
          const activeColor = t.id === 'hq' ? '#a855f7' : '#38bdf8';
          const activeBg = t.id === 'hq' ? 'rgba(168, 85, 247, 0.15)' : 'rgba(56, 189, 248, 0.15)';
          
          const isDisabled = tabsLocked && t.id !== 'workspace';

          return (
            <button 
              key={t.id} 
              onClick={(e) => {
                if (isDisabled) {
                  e.preventDefault();
                  triggerToast(isEn ? 'Please Clock In first to access this tab.' : 'אנא היכנס למשמרת כדי לגשת ללשונית זו.', 'error');
                  return;
                }
                setActiveTab(t.id);
              }}
              style={{ 
                display: 'flex', alignItems: 'center', gap: '10px', padding: isMobile ? '12px 18px' : '14px 24px', border: 'none',
                backgroundColor: isActive ? activeBg : 'transparent', color: isActive ? '#fff' : '#94a3b8',
                borderBottom: isActive ? `3px solid ${activeColor}` : '3px solid transparent',
                borderRadius: '10px 10px 0 0', cursor: isDisabled ? 'not-allowed' : 'pointer', fontWeight: isActive ? '800' : '600',
                fontSize: isMobile ? '14px' : '15px', transition: 'all 0.2s ease', whiteSpace: 'nowrap',
                opacity: isDisabled ? 0.4 : 1,
                flexShrink: 0
              }}
              onMouseOver={(e) => { if(!isActive && !isDisabled) { e.currentTarget.style.color = '#fff'; e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)'; } }}
              onMouseOut={(e) => { if(!isActive && !isDisabled) { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.backgroundColor = 'transparent'; } }}
            >
              <span style={{ fontSize: '16px' }}>{isDisabled ? '🔒' : t.icon}</span>{t.label}
              
              {t.id === 'workspace' && (
                <div style={{ width: '6px', height: '6px', backgroundColor: '#10b981', borderRadius: '50%', marginLeft: '4px', boxShadow: '0 0 5px #10b981' }} title="Live Sync Active"></div>
              )}
            </button>
          );
        })}
      </div>
    );
  };

  if (!userProfile) return <div style={{ color: '#fff', textAlign: 'center', paddingTop: '150px' }}>{isEn ? 'Loading Workspace...' : 'טוען סביבת עבודה...'}</div>;

  // ============================================================================
  // THE NEW ONBOARDING TRAP (Catch blank names or "Pending Invite")
  // ============================================================================
  const needsOnboarding = !userProfile.display_name || userProfile.display_name.trim() === '' || userProfile.display_name === 'Pending Invite';

  if (needsOnboarding) {
    return <OnboardingWelcome currentUserProfile={userProfile} isEn={isEn} refreshProfile={loadProfile} />;
  }
  // ============================================================================

  const isSuperUser = ['admin', 'super admin', 'system admin', 'global admin'].includes(userProfile.role?.toLowerCase()?.trim());
  const roleDisplay = isSuperUser ? 'Super Admin' : userProfile.role;
  const orgNameDisplay = isSuperUser ? 'Global Command' : (userProfile.organizations?.name || 'CiviWatch AI');
  
  // --- BRANDING LOGIC & FALLBACKS ---
  const orgLogo = userProfile.organizations?.logo_url || null;
  const orgBanner = userProfile.organizations?.banner_url || null;
  const defaultBannerGradient = 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.85) 100%)';
  const orgInitial = orgNameDisplay.charAt(0).toUpperCase();

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'transparent', color: '#fff', direction: isEn ? 'ltr' : 'rtl', position: 'relative' }}>
      
      {/* RENDER THE HELP MODAL AND PASS THE CURRENT TAB */}
      <DashboardHelpModal 
        isOpen={isHelpOpen} 
        onClose={() => setIsHelpOpen(false)} 
        isEn={isEn} 
        activeTab={activeTab} 
      />

      {toast.show && (
        <div style={{ position: 'fixed', bottom: '20px', right: isEn ? '20px' : 'auto', left: isEn ? 'auto' : '20px', backgroundColor: toast.type === 'error' ? '#ef4444' : '#10b981', padding: '15px 25px', borderRadius: '8px', zIndex: 3000, fontWeight: 'bold', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}>
          {toast.message}
        </div>
      )}

      <div style={{ position: 'relative', zIndex: 10, paddingTop: '100px' }}> 
        
        {/* --- RESPONSIVE BRANDED TENANT HEADER --- */}
        <header style={{ 
          padding: isMobile ? '20px' : '25px 40px', 
          borderBottom: '1px solid rgba(255,255,255,0.1)', 
          backgroundColor: orgBanner ? '#0f172a' : 'rgba(15, 23, 42, 0.7)',
          backgroundImage: orgBanner ? `linear-gradient(to right, rgba(15, 23, 42, 0.98) 25%, rgba(15, 23, 42, 0.4) 100%), url(${orgBanner})` : defaultBannerGradient,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backdropFilter: orgBanner ? 'none' : 'blur(10px)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
        }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
            
            {/* LEFT: Organization Identity */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div style={{ 
                width: isMobile ? '40px' : '50px', height: isMobile ? '40px' : '50px', borderRadius: '12px', 
                backgroundColor: orgLogo ? 'transparent' : 'rgba(56, 189, 248, 0.1)',
                border: orgLogo ? 'none' : '2px solid rgba(56, 189, 248, 0.3)',
                display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden', flexShrink: 0
              }}>
                {orgLogo ? (
                  <img src={orgLogo} alt="Org Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                ) : (
                  <span style={{ fontSize: isMobile ? '20px' : '24px', fontWeight: 'bold', color: '#38bdf8' }}>{orgInitial}</span>
                )}
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ color: '#94a3b8', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 'bold' }}>
                    {isSuperUser ? (isEn ? 'Global Layer' : 'שכבה גלובלית') : (isEn ? 'Organization Profile' : 'פרופיל ארגון')}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '2px', flexWrap: 'wrap' }}>
                  <h1 style={{ margin: 0, fontSize: isMobile ? '20px' : '24px', color: '#f8fafc', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>{orgNameDisplay}</h1>
                  {isSuperUser && (
                    <span style={{ 
                      backgroundColor: 'rgba(168, 85, 247, 0.2)', 
                      color: '#e879f9', 
                      border: '1px solid rgba(168, 85, 247, 0.4)', 
                      padding: '2px 8px', 
                      borderRadius: '12px', 
                      fontSize: '0.65rem', 
                      fontWeight: 'bold',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                    }}>
                      {isEn ? 'Root Access' : 'גישת שורש'}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* HAMBURGER ICON (Visible only on mobile) */}
            {isMobile && (
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
                style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: '5px', display: 'flex', alignItems: 'center' }}
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  {isMobileMenuOpen ? (
                      <>
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </>
                  ) : (
                      <>
                        <line x1="3" y1="12" x2="21" y2="12"></line>
                        <line x1="3" y1="6" x2="21" y2="6"></line>
                        <line x1="3" y1="18" x2="21" y2="18"></line>
                      </>
                  )}
                </svg>
              </button>
            )}
            
            {/* RIGHT: User Controls */}
            {(!isMobile || isMobileMenuOpen) && (
              <div style={{ 
                display: 'flex', 
                alignItems: isMobile ? 'stretch' : 'center', 
                gap: '15px', 
                flexDirection: isMobile ? 'column' : 'row',
                width: isMobile ? '100%' : 'auto',
                marginTop: isMobile ? '15px' : '0',
                paddingTop: isMobile ? '15px' : '0',
                borderTop: isMobile ? '1px solid rgba(255,255,255,0.1)' : 'none',
                animation: isMobile ? 'fadeIn 0.2s ease-out' : 'none'
              }}>
                
                {/* EXISTING HELP BUTTON */}
                <button 
                  onClick={() => setIsHelpOpen(true)}
                  style={{ background: 'transparent', border: '1px solid #475569', borderRadius: '50%', width: '40px', height: '40px', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', transition: 'all 0.2s' }}
                  title={isEn ? "Help" : "עזרה"}
                  onMouseOver={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#fff'; }}
                  onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#94a3b8'; }}
                >
                  ?
                </button>

                <div style={{ textAlign: isEn || isMobile ? 'left' : 'right', backgroundColor: 'rgba(15, 23, 42, 0.6)', padding: '10px 20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(4px)' }}>
                  <strong style={{ color: '#38bdf8' }}>{userProfile.displayName || userProfile.display_name}</strong>
                  <span style={{ margin: '0 10px', color: '#475569' }}>|</span>
                  <span style={{ fontSize: '13px', color: '#cbd5e1' }}>{roleDisplay}</span>
                </div>
                
                <div style={{ position: 'relative' }}>
                  <select value={userProfile.role || ''} onChange={(e) => handleRoleSwitch(e.target.value)} style={{ width: '100%', backgroundColor: 'rgba(168, 85, 247, 0.15)', color: '#e879f9', border: '1px solid rgba(168, 85, 247, 0.3)', padding: '10px 15px', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold', outline: 'none', appearance: 'none', paddingRight: isEn ? '30px' : '15px', paddingLeft: isEn ? '15px' : '30px', backdropFilter: 'blur(4px)' }} title={isEn ? "Demo Mode Role Switcher" : "מחליף תפקידים למטרת הדגמה"}>
                    <option value="Global Admin">Global Admin</option>
                    <option value="NGO Admin">NGO Admin</option>
                    <option value="Moderator L2">Moderator L2</option>
                    <option value="Operator L1">Operator L1</option>
                  </select>
                  <div style={{ position: 'absolute', top: '50%', right: isEn ? '10px' : 'auto', left: isEn ? 'auto' : '10px', transform: 'translateY(-50%)', pointerEvents: 'none', fontSize: '10px', color: '#e879f9' }}>▼</div>
                </div>

                <button onClick={() => handleLogout(false)} style={{ justifyContent: 'center', backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '10px 15px', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s', backdropFilter: 'blur(4px)' }} onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#ef4444'; e.currentTarget.style.color = '#fff'; }} onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.15)'; e.currentTarget.style.color = '#f87171'; }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                  {isEn ? 'Log Out' : 'התנתק'}
                </button>
              </div>
            )}
          </div>
        </header>

        <main style={{ padding: isMobile ? '20px' : '40px', maxWidth: '1200px', margin: '0 auto' }}>
          {renderTabs()}

          {loading && ['workspace', 'submit', 'analytics', 'reports', 'settings', 'hq'].includes(activeTab) ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#38bdf8' }}>
              <div style={{ width: '20px', height: '20px', border: '2px solid rgba(56,189,248,0.3)', borderTopColor: '#38bdf8', borderRadius: '50%', animation: 'spin 1s linear infinite' }}>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              </div>
              {isEn ? 'Synchronizing Data...' : 'מסנכרן נתונים...'}
            </div>
          ) : (
            <>
              {activeTab === 'workspace' && <Workspace duration={shiftDuration} isClockedIn={isClockedIn} onClockIn={handleClockIn} onClockOut={handleClockOut} stats={stats} reports={reports} userProfile={userProfile} teamMembers={teamMembers} onStatusUpdate={handleStatusUpdate} onAssignReport={handleAssignReport} isEn={isEn} triggerToast={triggerToast} refreshData={fetchDashboardData} />}
              
              {activeTab === 'submit' && <SubmitReportsTab userProfile={userProfile} teamMembers={teamMembers} isEn={isEn} triggerToast={triggerToast} />}
              
              {activeTab === 'analytics' && <Analytics reports={reports} isEn={isEn} role={userProfile.role} stats={stats} userProfile={userProfile} triggerToast={triggerToast} />}
              
              {activeTab === 'reports' && (
                <ReportsTab 
                  userProfile={userProfile} 
                  teamMembers={teamMembers} 
                  isEn={isEn} 
                  triggerToast={triggerToast} 
                />
              )}
              
              {activeTab === 'settings' && (
                <SettingsTab 
                  teamMembers={teamMembers} 
                  isEn={isEn} 
                  triggerToast={triggerToast} 
                  refreshData={fetchDashboardData} 
                  currentUserProfile={userProfile} 
                />
              )}
              
              {activeTab === 'hq' && (
                <CiviHQ 
                  isEn={isEn} 
                  triggerToast={triggerToast} 
                  userProfile={userProfile}
                  setUserProfile={setUserProfile}
                  refreshData={fetchDashboardData}
                />
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;