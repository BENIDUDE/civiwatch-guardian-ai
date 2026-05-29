/**
 * @file CiviWatchFAQ.js
 * @description The comprehensive Knowledge Base and FAQ page for CiviWatch Guardian AI.
 * Includes interactive search, smooth-scrolling Table of Contents, detailed operational tables,
 * and heavily expanded NGO operational guides.
 */
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Icons = {
  Search: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>,
  Shield: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>,
  Users: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>,
  Activity: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>,
  Send: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>,
  Settings: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>,
  ChevronRight: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>,
  Globe: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>,
  Building: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><path d="M9 22v-4h6v4"></path><path d="M8 6h.01"></path><path d="M16 6h.01"></path><path d="M12 6h.01"></path><path d="M12 10h.01"></path><path d="M12 14h.01"></path><path d="M16 10h.01"></path><path d="M16 14h.01"></path><path d="M8 10h.01"></path><path d="M8 14h.01"></path></svg>,
  Cpu: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect><rect x="9" y="9" width="6" height="6"></rect><line x1="9" y1="1" x2="9" y2="4"></line><line x1="15" y1="1" x2="15" y2="4"></line><line x1="9" y1="20" x2="9" y2="23"></line><line x1="15" y1="20" x2="15" y2="23"></line><line x1="20" y1="9" x2="23" y2="9"></line><line x1="20" y1="14" x2="23" y2="14"></line><line x1="1" y1="9" x2="4" y2="9"></line><line x1="1" y1="14" x2="4" y2="14"></line></svg>
};

const CiviWatchFAQ = ({ isEn = true }) => {
  const isRtl = !isEn;
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('ngos'); // Defaults to NGOs

  // --- STYLING CONSTANTS ---
  const thStyle = { padding: '12px 15px', color: '#94a3b8', fontSize: '0.85rem', textTransform: 'uppercase', borderBottom: '1px solid #334155', textAlign: isRtl ? 'right' : 'left', backgroundColor: 'rgba(30, 41, 59, 0.5)' };
  const tdStyle = { padding: '15px', color: '#cbd5e1', fontSize: '0.9rem', borderBottom: '1px solid rgba(255,255,255,0.05)', verticalAlign: 'top', lineHeight: '1.4' };
  const codeStyle = { backgroundColor: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', padding: '2px 6px', borderRadius: '4px', fontFamily: 'monospace', fontSize: '0.85rem' };

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // --- SOLUTIONS CATEGORY DEFINITIONS ---
  const solutionTabs = [
    { id: 'general', label: isEn ? 'General Platform' : 'פלטפורמה כללית', icon: Icons.Shield },
    { id: 'ngos', label: isEn ? 'NGO Solutions' : 'פתרונות לעמותות', icon: Icons.Users },
    { id: 'governments', label: isEn ? 'Governments' : 'ממשלות', icon: Icons.Building },
    { id: 'social', label: isEn ? 'Social Networks' : 'רשתות חברתיות', icon: Icons.Globe }
  ];

  // --- FAQ DATA STRUCTURE WITH CATEGORY TAGS ---
  const faqSections = [
    // --- GENERAL PLATFORM ---
    {
      id: 'about',
      category: 'general',
      icon: Icons.Shield,
      title: isEn ? 'About CiviWatch Guardian AI' : 'אודות המערכת',
      keywords: 'about mission purpose what is system civiwatch',
      content: (
        <p style={{ color: '#cbd5e1', lineHeight: '1.6', fontSize: '0.95rem' }}>
          {isEn 
            ? "CiviWatch Guardian AI is an intelligence and operations platform designed to ingest, verify, and dispatch reports regarding online hate speech, antisemitism, incitement, and terrorism. We combine sophisticated AI triage with human operator verification to process thousands of threats quickly."
            : "מערכת CiviWatch היא פלטפורמת מודיעין ומבצעים. מטרתנו לאסוף, לאמת ולטפל בדיווחי רשת על הסתה, אנטישמיות וטרור. אנו משלבים סינון בינה מלאכותית מתקדם יחד עם בקרה אנושית."}
        </p>
      )
    },
    
    // --- NGO SOLUTIONS ---
    {
      id: 'ai-council',
      category: 'ngos',
      icon: Icons.Cpu,
      title: isEn ? 'The AI Council & Voting Consensus' : 'מועצת ה-AI ומנגנון ההצבעה',
      keywords: 'ai artificial intelligence council vote consensus confidence score ambiguity',
      content: (
        <>
          <p style={{ color: '#cbd5e1', lineHeight: '1.6', fontSize: '0.95rem', marginBottom: '15px' }}>
            {isEn 
              ? "To prevent bias and hallucinations, CiviWatch does not rely on a single AI model. Every report submitted to the system is evaluated by the 'AI Council'—a multi-agent system utilizing parallel models."
              : "כדי למנוע הטיות והזיות נתונים, CiviWatch אינה מסתמכת על מודל AI בודד. כל דיווח במערכת מוערך על ידי 'מועצת ה-AI' - מערכת מרובת סוכנים המריצה מודלים במקביל."}
          </p>
          <ul style={{ margin: 0, paddingLeft: isRtl ? 0 : '20px', paddingRight: isRtl ? '20px' : 0, color: '#cbd5e1', fontSize: '0.9rem', lineHeight: '1.6' }}>
            <li style={{ marginBottom: '8px' }}><strong>{isEn ? 'Consensus Voting:' : 'הצבעת קונצנזוס:'}</strong> {isEn ? "The models analyze the text, image, and platform source independently. If a strong majority votes 'Threat', the system generates a high Confidence Score." : "המודלים מנתחים את הטקסט, התמונה ומקור הדיווח באופן עצמאי. אם יש רוב מובהק לאיום, המערכת מייצרת ציון ביטחון גבוה."}</li>
            <li style={{ marginBottom: '8px' }}><strong>{isEn ? 'AI Verified / AI Rejected:' : 'אימות ודחייה אוטומטית:'}</strong> {isEn ? "If the confidence score crosses the certainty threshold, the AI automatically verifies or rejects the report without human intervention (unless intercepted by the QA Sampling rule)." : "אם ציון הביטחון חוצה את רף הוודאות, המערכת מאשרת או דוחה את הדיווח אוטומטית ללא מגע אדם (אלא אם נלכד במדגם ה-QA)."}</li>
            <li><strong>{isEn ? 'Ambiguity Routing:' : 'ניתוב במצבי אי-ודאות:'}</strong> {isEn ? "If the models disagree (e.g., struggling to understand deep sarcasm or complex geopolitical context), the AI flags the report as 'Manual Review Required' and routes it to a human Moderator." : "אם המודלים חלוקים בדעתם (למשל סרקזם או הקשר מורכב), המערכת מסמנת את הדיווח כדורש בדיקה ידנית ומעבירה אותו למנהל אנושי."}</li>
          </ul>
        </>
      )
    },
    {
      id: 'roles',
      category: 'ngos',
      icon: Icons.Users,
      title: isEn ? 'User Roles & Permissions (NGOs)' : 'תפקידים והרשאות (עמותות)',
      keywords: 'roles operator moderator admin super permissions who can do what access',
      content: (
        <div style={{ overflowX: 'auto', backgroundColor: '#020617', borderRadius: '12px', border: '1px solid #334155' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{...thStyle, width: '20%'}}>{isEn ? 'Role' : 'תפקיד'}</th>
                <th style={{...thStyle, width: '40%'}}>{isEn ? 'Responsibilities' : 'תחומי אחריות'}</th>
                <th style={{...thStyle, width: '40%'}}>{isEn ? 'System Access' : 'גישה למערכת'}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{...tdStyle, color: '#38bdf8', fontWeight: 'bold'}}>Operator L1</td>
                <td style={tdStyle}>{isEn ? 'Processes raw intelligence, acts on "Changes Requested" notes, and completes manual assignments (e.g. searching platforms).' : 'מעבד מודיעין גולמי, מתקן הערות "דרוש תיקון", ומבצע משימות סריקה יזומות.'}</td>
                <td style={tdStyle}>{isEn ? 'My Tasks Queue, Submit Reports, My Submissions.' : 'התור שלי, שליחת דיווחים, היסטוריה אישית.'}</td>
              </tr>
              <tr>
                <td style={{...tdStyle, color: '#a855f7', fontWeight: 'bold'}}>Moderator L2</td>
                <td style={tdStyle}>{isEn ? 'Performs Quality Assurance (QA) on AI decisions and Operator escalations. Allocates targeted manual tasks to clocked-in Operators.' : 'מבצע בקרת איכות (QA) להחלטות המערכת והסלמות. מקצה משימות למפעילים פעילים.'}</td>
                <td style={tdStyle}>{isEn ? 'QA Approvals, Task Allocation, Monitor Operators.' : 'אישורי QA, הקצאת משימות, מעקב מפעילים.'}</td>
              </tr>
              <tr>
                <td style={{...tdStyle, color: '#f59e0b', fontWeight: 'bold'}}>Admin / Super Admin</td>
                <td style={tdStyle}>{isEn ? 'Handles the final CSV Batch Dispatch to social networks, executes secondary appeals, and configures organization sampling rules.' : 'מבצע שילוח קבצי CSV לרשתות, מנהל ערעורים משניים, ומגדיר חוקי ניתוב לארגון.'}</td>
                <td style={tdStyle}>{isEn ? 'Network Dispatch, Resolution Archive, CiviHQ Settings.' : 'שילוח לרשתות, ארכיון סופי, הגדרות CiviHQ.'}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )
    },
    {
      id: 'flow',
      category: 'ngos',
      icon: Icons.Activity,
      title: isEn ? 'The End-to-End Operational Pipeline' : 'התהליך המבצעי המלא',
      keywords: 'flow routing triage ai pending review dismissed verified status lifecycle pipeline stages',
      content: (
        <>
          <p style={{ color: '#cbd5e1', lineHeight: '1.6', fontSize: '0.95rem', marginBottom: '20px' }}>
            {isEn ? "To maintain high throughput and accuracy, CiviWatch routes reports through a strict pipeline. Here are the core stages:" : "כדי לשמור על הספק ודיוק, CiviWatch מנתבת דיווחים דרך צינור קפדני. להלן השלבים המרכזיים:"}
          </p>
          <div style={{ overflowX: 'auto', backgroundColor: '#020617', borderRadius: '12px', border: '1px solid #334155' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{...thStyle, width: '25%'}}>{isEn ? 'Status / Stage' : 'סטטוס / שלב'}</th>
                  <th style={{...thStyle, width: '75%'}}>{isEn ? 'What is happening in the system' : 'מה קורה במערכת בשלב זה'}</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{...tdStyle, color: '#f59e0b'}}><strong>Pending Review / Manual Review</strong></td>
                  <td style={tdStyle}>{isEn ? 'The report requires human eyes. It sits in the "QA Approvals" queue for a Moderator. This happens if the AI was ambiguous, or if the report hit the Random QA Sampling check.' : 'הדיווח דורש עין אנושית. ממתין בתור ה-QA למנהל. קורה כשה-AI לא בטוח, או שהדיווח נלכד במדגם אקראי.'}</td>
                </tr>
                <tr>
                  <td style={{...tdStyle, color: '#ef4444'}}><strong>Changes Requested</strong></td>
                  <td style={tdStyle}>{isEn ? 'A Moderator (or the AI) found a flaw (e.g., broken URL, missing evidence). It is routed back down to the Operator\'s "My Tasks" queue with strict instructions on how to fix it.' : 'נמצאה שגיאה בדיווח (קישור שבור, חוסר הוכחות). נשלח חזרה לתור המפעיל עם הנחיות מדויקות לתיקון.'}</td>
                </tr>
                <tr>
                  <td style={{...tdStyle, color: '#10b981'}}><strong>Verified / AI Verified</strong></td>
                  <td style={tdStyle}>{isEn ? 'The threat is confirmed. It bypasses triage and waits in the "Network Dispatch" desk for an Admin to generate the outbound CSV export.' : 'האיום אומת בהצלחה. הדיווח ממתין בשולחן ה"שילוח רשתות" למנהל על מנת לייצא לקובץ CSV.'}</td>
                </tr>
                <tr>
                  <td style={{...tdStyle, color: '#a855f7'}}><strong>Pending Network Action</strong></td>
                  <td style={tdStyle}>{isEn ? 'The Admin exported the CSV and sent it to the platform. The system is waiting for the Admin to upload the reconciliation CSV response.' : 'הקובץ יוצא ונשלח לפלטפורמה. המערכת ממתינה למנהל שיעלה את קובץ התשובה מהרשת.'}</td>
                </tr>
                <tr>
                  <td style={{...tdStyle, color: '#f97316'}}><strong>Network Rejected / Appeal Loop</strong></td>
                  <td style={tdStyle}>{isEn ? 'The network refused the takedown. The ticket routes back to the Admin desk. The Admin can click "Initiate Appeal" to generate an Appeal CSV.' : 'הרשת סירבה להסיר את התוכן. הדיווח חוזר למנהל. המנהל יכול ללחוץ על "הגש ערעור" כדי לייצר קובץ ערעור.'}</td>
                </tr>
                <tr>
                  <td style={{...tdStyle, color: '#64748b'}}><strong>Closed / Dismissed</strong></td>
                  <td style={tdStyle}>{isEn ? 'Terminal state. The content was successfully removed, or ultimately dismissed as a false positive.' : 'מצב סופי. התוכן הוסר בהצלחה, או שנדחה סופית כזיהוי שווא.'}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </>
      )
    },
    {
      id: 'allocation',
      category: 'ngos',
      icon: Icons.Activity,
      title: isEn ? 'Shift Management & Task Allocation' : 'ניהול משמרות והקצאת משימות',
      keywords: 'allocate assign task shift clock load balance active operator manual assignment',
      content: (
        <>
          <p style={{ color: '#cbd5e1', lineHeight: '1.6', fontSize: '0.95rem', marginBottom: '15px' }}>
            {isEn 
              ? "CiviWatch acts as a live command center. To receive work, Operators must actively 'Clock In' to their shift via the dashboard banner."
              : "המערכת מתפקדת כחמ\"ל בזמן אמת. כדי לקבל עבודה, על המפעילים 'להיכנס למשמרת' אקטיבית דרך באנר הניהול."}
          </p>
          <ul style={{ margin: 0, paddingLeft: isRtl ? 0 : '20px', paddingRight: isRtl ? '20px' : 0, color: '#cbd5e1', fontSize: '0.9rem', lineHeight: '1.6' }}>
            <li style={{ marginBottom: '8px' }}><strong>{isEn ? 'Operator View:' : 'מבט המפעיל:'}</strong> {isEn ? "Once clocked in, the Operator gains access to the 'My Tasks' queue, which displays system bounce-backs (Changes Requested) and manual assignments." : "לאחר כניסה למשמרת, המפעיל מקבל גישה לתור 'המשימות שלי', המציג דיווחים שחזרו לתיקון ומשימות יזומות."}</li>
            <li style={{ marginBottom: '8px' }}><strong>{isEn ? 'Moderator View (Task Allocation):' : 'מבט מנהל (הקצאת משימות):'}</strong> {isEn ? "Moderators have a dedicated 'Task Allocation' tab. This shows a real-time list of all clocked-in Operators and their current active workload." : "למנהלים יש לשונית הקצאת משימות ייעודית, המציגה רשימה חיה של כל המפעילים המחוברים והעומס שלהם."}</li>
            <li><strong>{isEn ? 'Creating Manual Assignments:' : 'יצירת משימות יזומות:'}</strong> {isEn ? "Moderators can use the Allocation tab to create specific research tasks (e.g., 'Search Telegram for Hashtag X for 2 hours'). This is pushed directly to the chosen Operator's queue, and the Operator must mark it 'Done' to clear it." : "מנהלים יכולים ליצור משימות מחקר יזומות (למשל: 'סרוק בטלגרם האשטאג X למשך שעתיים'). המשימה נדחפת לתור המפעיל ועליו לסמן אותה כהושלמה."}</li>
          </ul>
        </>
      )
    },
    {
      id: 'settings',
      category: 'ngos',
      icon: Icons.Settings,
      title: isEn ? 'CiviHQ: Organization Settings & QA Sampling' : 'הגדרות CiviHQ ובקרת איכות (QA)',
      keywords: 'qa sample sampling rate tenant org organization hq settings default logic probability',
      content: (
        <>
          <p style={{ color: '#cbd5e1', lineHeight: '1.6', fontSize: '0.95rem', marginBottom: '15px' }}>
            {isEn 
              ? "Super Admins manage the platform's routing math via the 'CiviHQ' tab. By clicking 'Manage Settings' on a tenant organization, Admins dictate the QA Sampling Rate, which directly controls the AI-to-Human trust ratio."
              : "מנהלי על מנהלים את מתמטיקת הניתוב דרך לשונית CiviHQ. לחיצה על 'ניהול הגדרות' לארגון מאפשרת קביעת אחוז דגימת בקרת איכות (QA), השולט ביחס האמון בין ה-AI לאדם."}
          </p>
          <div style={{ backgroundColor: 'rgba(56, 189, 248, 0.05)', borderLeft: isRtl ? 'none' : '3px solid #38bdf8', borderRight: isRtl ? '3px solid #38bdf8' : 'none', padding: '15px', borderRadius: '0 8px 8px 0', marginBottom: '15px' }}>
            <strong style={{ color: '#38bdf8', display: 'block', marginBottom: '5px' }}>{isEn ? 'How the Math Works:' : 'איך המתמטיקה עובדת:'}</strong>
            <p style={{ margin: 0, color: '#cbd5e1', fontSize: '0.85rem', lineHeight: '1.5' }}>
              {isEn 
                ? "When the AI successfully verifies a report, the system rolls a mathematical die based on this percentage. If it hits, the report is artificially intercepted, stripped of its 'Verified' badge, and sent to the QA desk with a 'Direct Human Routing' tag to ensure Moderators are spot-checking the AI's accuracy."
                : "כאשר ה-AI מאמת דיווח בהצלחה, המערכת 'מטילה קובייה' מתמטית בהתאם לאחוז זה. אם התקבלה פגיעה, הדיווח יורט מלאכותית ויישלח לשולחן ה-QA תחת התווית 'ניתוב אנושי ישיר' כדי לוודא שמנהלים בודקים את דיוק המערכת."}
            </p>
          </div>
          <ul style={{ margin: 0, paddingLeft: isRtl ? 0 : '20px', paddingRight: isRtl ? '20px' : 0, color: '#e2e8f0', fontSize: '0.9rem', lineHeight: '1.6' }}>
            <li style={{ marginBottom: '8px' }}><strong>{isEn ? '100% QA Rate:' : '100% בקרת איכות:'}</strong> {isEn ? "Zero Trust Mode. EVERY report verified by the AI will be forced into the QA queue. The AI acts only as an advisor." : "מצב אפס אמון. כל דיווח יאולץ לעבור ל-QA. ה-AI מתפקד כיועץ בלבד."}</li>
            <li style={{ marginBottom: '8px' }}><strong>{isEn ? '0% QA Rate:' : '0% בקרת איכות:'}</strong> {isEn ? "Full Autonomy. AI decisions bypass the Moderator entirely and go straight to Network Dispatch. Only ambiguous threats go to humans." : "אוטונומיה מלאה. החלטות ה-AI עוקפות את המנהל לחלוטין ועוברות לשילוח. רק איומים לא ברורים מגיעים לבני אדם."}</li>
            <li><strong>{isEn ? 'Partial Rate (e.g., 20%):' : 'אחוז חלקי (לדוגמה 20%):'}</strong> {isEn ? "The system trusts the AI for 80% of verified reports, but intercepts a random 20% for mandatory human validation." : "המערכת סומכת על ה-AI ב-80% מהדיווחים, אך מיירטת אקראית 20% לאימות אנושי חובה."}</li>
          </ul>
        </>
      )
    },
    {
      id: 'csv',
      category: 'ngos',
      icon: Icons.Send,
      title: isEn ? 'Network Dispatch (CSV Import/Export)' : 'מדריך ייבוא וייצוא רשתות (CSV)',
      keywords: 'csv network dispatch export import upload batch reconciliation appeals sync spreadsheet',
      content: (
        <>
          <p style={{ color: '#cbd5e1', lineHeight: '1.6', fontSize: '0.95rem', marginBottom: '20px' }}>
            {isEn 
              ? 'When dispatching reports to social networks for takedown requests, the system generates a standard CSV file via the "Network Dispatch" tab. The network must return this file with their resolution decisions for the system to automatically synchronize and close the tickets.' 
              : 'בעת שילוח דיווחים לרשתות, המערכת מייצרת קובץ CSV סטנדרטי דרך לשונית "שילוח רשתות". על הרשת להחזיר את הקובץ עם החלטות הטיפול כדי שהמערכת תסתנכרן אוטומטית ותסגור את הקריאות.'}
          </p>

          <h4 style={{ color: '#38bdf8', fontSize: '1.1rem', margin: '0 0 10px 0' }}>{isEn ? '1. Outbound File (Exported to Network)' : '1. קובץ יוצא (נשלח לרשת)'}</h4>
          <div style={{ overflowX: 'auto', backgroundColor: '#020617', borderRadius: '12px', border: '1px solid #334155', marginBottom: '30px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{...thStyle, width: '25%'}}>{isEn ? 'Column Name' : 'שם עמודה'}</th>
                  <th style={{...thStyle, width: '50%'}}>{isEn ? 'Description' : 'תיאור'}</th>
                  <th style={{...thStyle, width: '25%'}}>{isEn ? 'Example' : 'דוגמה'}</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={tdStyle}><span style={codeStyle}>civiwatch_id</span></td>
                  <td style={tdStyle}>{isEn ? 'The unique tracking ID for the report.' : 'המזהה הייחודי של הדיווח.'}</td>
                  <td style={tdStyle}><span style={{ color: '#64748b' }}>CWID-9af6ec9d</span></td>
                </tr>
                <tr>
                  <td style={tdStyle}><span style={codeStyle}>dispatch_type</span></td>
                  <td style={tdStyle}>{isEn ? 'First-time request (INITIAL) or an APPEAL.' : 'בקשה ראשונית או ערעור.'}</td>
                  <td style={tdStyle}><span style={{ color: '#64748b' }}>INITIAL</span></td>
                </tr>
                <tr>
                  <td style={tdStyle}><span style={codeStyle}>network_result</span></td>
                  <td style={tdStyle}>{isEn ? 'Generated blank. The network must fill this in.' : 'מיוצר ריק. על הרשת למלא שדה זה.'}</td>
                  <td style={tdStyle}><em>{isEn ? '(Blank)' : '(ריק)'}</em></td>
                </tr>
              </tbody>
            </table>
          </div>

          <h4 style={{ color: '#10b981', fontSize: '1.1rem', margin: '0 0 10px 0' }}>{isEn ? '2. Inbound File (Received from Network)' : '2. קובץ נכנס (מתקבל מהרשת)'}</h4>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '15px' }}>
            {isEn 
              ? 'The network MUST use the exact strict action triggers below in the network_result column. The importer is case-insensitive (e.g., "REMOVED" or "removed" are both valid), but the spelling must be exact.' 
              : 'על הרשת להשתמש בדיוק במילות המפתח המפעילות מטה בעמודת התוצאה. המערכת אינה רגישה לאותיות רישיות/קטנות (REMOVED או removed תקינים באותה מידה).'}
          </p>
          <div style={{ overflowX: 'auto', backgroundColor: '#020617', borderRadius: '12px', border: '1px solid #334155' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{...thStyle, width: '25%'}}>{isEn ? 'Column Name' : 'שם עמודה'}</th>
                  <th style={{...thStyle, width: '45%'}}>{isEn ? 'Description' : 'תיאור'}</th>
                  <th style={{...thStyle, width: '30%'}}>{isEn ? 'Action Triggers (STRICT)' : 'מילות מפתח (חובה לחלוטין)'}</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={tdStyle}>
                    <span style={codeStyle}>civiwatch_id</span> <span style={{ color: '#ef4444', fontSize: '0.7rem', fontWeight: 'bold' }}>REQ</span>
                  </td>
                  <td style={tdStyle}>{isEn ? 'Must exactly match the outbound file.' : 'חייב להיות תואם למזהה שנשלח.'}</td>
                  <td style={tdStyle}><span style={{ color: '#64748b' }}>CWID-9af6ec9d</span></td>
                </tr>
                <tr>
                  <td style={tdStyle}>
                    <span style={codeStyle}>network_result</span> <span style={{ color: '#ef4444', fontSize: '0.7rem', fontWeight: 'bold' }}>REQ</span>
                  </td>
                  <td style={tdStyle}>{isEn ? 'The final decision made by the network.' : 'ההחלטה הסופית של הרשת.'}</td>
                  <td style={tdStyle}>
                    <ul style={{ margin: 0, paddingLeft: isRtl ? 0 : '15px', paddingRight: isRtl ? '15px' : 0, color: '#e2e8f0', fontSize: '0.85rem' }}>
                      <li style={{ marginBottom: '6px' }}><strong>Success:</strong> <span style={{ color: '#10b981', fontWeight: 'bold' }}>removed</span></li>
                      <li><strong>Rejected:</strong> <span style={{ color: '#ef4444', fontWeight: 'bold' }}>rejected</span></li>
                    </ul>
                  </td>
                </tr>
                <tr>
                  <td style={tdStyle}>
                    <span style={codeStyle}>network_comment</span> <span style={{ color: '#94a3b8', fontSize: '0.7rem', fontWeight: 'bold' }}>OPT</span>
                  </td>
                  <td style={tdStyle}>{isEn ? 'Optional text notes from the network moderator.' : 'הערות נוספות ממנהלי הרשת.'}</td>
                  <td style={tdStyle}><span style={{ color: '#64748b' }}>"Violates guidelines"</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </>
      )
    },

    // --- GOVERNMENTS ---
    {
      id: 'gov-integration',
      category: 'governments',
      icon: Icons.Building,
      title: isEn ? 'Government API Integrations' : 'אינטגרציות API לממשלות',
      keywords: 'api government integration data sharing secure',
      content: (
        <p style={{ color: '#cbd5e1', lineHeight: '1.6', fontSize: '0.95rem' }}>
          {isEn ? "Documentation for secure state-level API integration is currently restricted to verified government partners. Please contact your CiviWatch representative for deployment keys." : "תיעוד אינטגרציית ה-API פתוח לשותפים ממשלתיים מאומתים בלבד. אנא צור קשר עם הנציג שלך."}
        </p>
      )
    },

    // --- SOCIAL NETWORKS ---
    {
      id: 'social-compliance',
      category: 'social',
      icon: Icons.Globe,
      title: isEn ? 'Trust & Safety Compliance' : 'בטיחות ורגולציה (רשתות)',
      keywords: 'social network trust safety compliance policy',
      content: (
        <p style={{ color: '#cbd5e1', lineHeight: '1.6', fontSize: '0.95rem' }}>
          {isEn ? "Information regarding standardized reporting structures built specifically for internal Trust & Safety teams at major social networks." : "מידע על מבני דיווח סטנדרטיים שנבנו במיוחד עבור צוותי בטיחות ברשתות חברתיות גדולות."}
        </p>
      )
    }
  ];

  // --- FILTERING LOGIC ---
  const filteredSections = faqSections.filter(section => {
    // 1. Filter by Active Tab
    const matchesCategory = section.category === activeCategory;
    
    // 2. Filter by Search Query
    const query = searchQuery.toLowerCase();
    const matchesSearch = !searchQuery || section.title.toLowerCase().includes(query) || section.keywords.includes(query);
    
    return matchesCategory && matchesSearch;
  });

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '100px 20px 40px 20px', direction: isRtl ? 'rtl' : 'ltr', fontFamily: 'sans-serif' }}>
      
      {/* BREADCRUMBS */}
      <div style={{ textAlign: 'center', marginBottom: '40px', animation: 'fadeIn 0.4s ease-out' }}>
        <div style={{ marginBottom: '15px', color: '#38bdf8', fontSize: '0.85rem', fontWeight: 'bold', letterSpacing: '1px', textTransform: 'uppercase' }}>
          <Link to="/solutions" style={{ color: '#38bdf8', textDecoration: 'none' }}>
            {isEn ? 'Solutions' : 'פתרונות'}
          </Link>
          <span style={{ margin: '0 8px', color: '#475569' }}>{isRtl ? ' \u2022 ' : ' \u2022 '}</span>
          <span style={{ color: '#94a3b8' }}>{isEn ? 'Knowledge Base' : 'מרכז מידע'}</span>
        </div>

        <h1 style={{ color: '#fff', fontSize: '2.5rem', margin: '0 0 15px 0' }}>
          {isEn ? 'Knowledge Base & FAQ' : 'מרכז מידע ושאלות נפוצות'}
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '1.1rem', margin: '0 0 25px 0', maxWidth: '600px', marginLeft: 'auto', marginRight: 'auto' }}>
          {isEn ? 'Find operational flows, system role definitions, and technical guides.' : 'מצא תהליכי עבודה, הגדרות תפקידים במערכת ומדריכים טכניים.'}
        </p>

        {/* SEARCH BAR */}
        <div style={{ position: 'relative', maxWidth: '500px', margin: '0 auto 30px auto' }}>
          <span style={{ position: 'absolute', top: '14px', left: isRtl ? 'auto' : '15px', right: isRtl ? '15px' : 'auto', color: '#64748b' }}>
            {Icons.Search}
          </span>
          <input 
            type="text" 
            placeholder={isEn ? "Search for keywords (e.g., 'CSV', 'Triage')..." : "חפש מילות מפתח (למשל, 'CSV', 'טריאז')..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ 
              width: '100%', backgroundColor: '#0f172a', border: '1px solid #334155', color: '#f8fafc', 
              padding: '12px 20px', paddingLeft: isRtl ? '20px' : '45px', paddingRight: isRtl ? '45px' : '20px', 
              borderRadius: '30px', fontSize: '1rem', outline: 'none', transition: 'border-color 0.2s',
              boxSizing: 'border-box'
            }}
            onFocus={(e) => e.target.style.borderColor = '#38bdf8'}
            onBlur={(e) => e.target.style.borderColor = '#334155'}
          />
        </div>

        {/* SOLUTIONS CATEGORY TABS */}
        <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '10px' }}>
          {solutionTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => { setActiveCategory(tab.id); setSearchQuery(''); }}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '10px 20px', borderRadius: '30px', fontSize: '0.9rem', fontWeight: 'bold', cursor: 'pointer',
                transition: 'all 0.2s',
                backgroundColor: activeCategory === tab.id ? 'rgba(56, 189, 248, 0.1)' : 'transparent',
                color: activeCategory === tab.id ? '#38bdf8' : '#94a3b8',
                border: activeCategory === tab.id ? '1px solid rgba(56, 189, 248, 0.4)' : '1px solid #334155'
              }}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '40px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
        
        {/* TABLE OF CONTENTS (Hidden on mobile or if searching) */}
        {!searchQuery && (
          <div style={{ flex: '1', minWidth: '250px', position: 'sticky', top: '100px', backgroundColor: 'rgba(15, 23, 42, 0.4)', borderRadius: '16px', border: '1px solid #334155', padding: '20px', animation: 'fadeIn 0.6s ease-out' }}>
            <h3 style={{ margin: '0 0 15px 0', color: '#e2e8f0', fontSize: '1.1rem', paddingBottom: '10px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              {isEn ? 'Table of Contents' : 'תוכן עניינים'}
            </h3>
            {filteredSections.length === 0 ? (
               <p style={{ color: '#64748b', fontSize: '0.85rem' }}>{isEn ? 'No topics available.' : 'אין נושאים זמינים.'}</p>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {filteredSections.map(section => (
                  <li key={`toc-${section.id}`}>
                    <button 
                      onClick={() => scrollToSection(section.id)}
                      style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', padding: 0, transition: 'color 0.2s', textAlign: 'left' }}
                      onMouseEnter={(e) => e.currentTarget.style.color = '#38bdf8'}
                      onMouseLeave={(e) => e.currentTarget.style.color = '#94a3b8'}
                    >
                      <span style={{ color: '#475569' }}>{Icons.ChevronRight}</span> {section.title}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* MAIN CONTENT AREA */}
        <div style={{ flex: '3', minWidth: '300px', display: 'flex', flexDirection: 'column', gap: '30px' }}>
          {filteredSections.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '50px 20px', backgroundColor: 'rgba(15, 23, 42, 0.4)', borderRadius: '16px', border: '1px solid #334155', animation: 'fadeIn 0.4s ease-out' }}>
              <span style={{ color: '#475569', display: 'block', marginBottom: '10px' }}>{Icons.Search}</span>
              <h3 style={{ color: '#e2e8f0', margin: '0 0 5px 0' }}>{isEn ? 'No results found' : 'לא נמצאו תוצאות'}</h3>
              <p style={{ color: '#94a3b8', margin: 0 }}>{isEn ? 'Try adjusting your search terms or selecting a different solution tab.' : 'נסה לשנות את מילות החיפוש או לבחור לשונית פתרון אחרת.'}</p>
            </div>
          ) : (
            filteredSections.map((section, index) => (
              <div 
                key={section.id} 
                id={section.id} 
                style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', padding: '30px', animation: `fadeIn 0.${4 + index}s ease-out`, scrollMarginTop: '100px' }}
              >
                <h2 style={{ margin: '0 0 20px 0', color: '#fff', fontSize: '1.6rem', display: 'flex', alignItems: 'center', gap: '12px', paddingBottom: '15px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <span style={{ color: '#38bdf8', backgroundColor: 'rgba(56, 189, 248, 0.1)', padding: '8px', borderRadius: '8px', display: 'flex' }}>
                    {section.icon}
                  </span>
                  {section.title}
                </h2>
                <div>
                  {section.content}
                </div>
              </div>
            ))
          )}
        </div>

      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};

export default CiviWatchFAQ;