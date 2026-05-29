import React, { useMemo, useState } from 'react';

const OrgChart = ({ teamMembers, isEn }) => {
  const isRtl = !isEn;

  // --- DATA TRANSFORMATION ENGINE ---
  const { admins, squads, unassignedOperators } = useMemo(() => {
    const data = teamMembers || [];
    
    // 1. Extract Leadership (Admins)
    const admins = data.filter(m => m.role?.toLowerCase().includes('admin') || m.role?.toLowerCase() === 'super admin');
    
    // 2. Extract Squad Leaders (Moderators)
    const moderators = data.filter(m => m.role?.toLowerCase().includes('moderator'));
    
    // 3. Extract Frontline (Operators)
    const operators = data.filter(m => m.role?.toLowerCase().includes('operator') || (!m.role?.toLowerCase().includes('admin') && !m.role?.toLowerCase().includes('moderator')));

    // 4. Map Operators into Squads under their Moderator
    const squads = moderators.map(mod => {
      return {
        ...mod,
        team: operators.filter(op => op.manager_id === mod.id)
      };
    });

    // 5. Catch any Operators who don't have a manager assigned yet
    const assignedOperatorIds = squads.flatMap(s => s.team.map(op => op.id));
    const unassignedOperators = operators.filter(op => !assignedOperatorIds.includes(op.id));

    return { admins, squads, unassignedOperators };
  }, [teamMembers]);

  // --- REUSABLE UI COMPONENTS ---
  const UserBadge = ({ user, type }) => {
    const initials = (user.display_name || user.email || 'U').substring(0, 2).toUpperCase();
    const isLeader = type === 'admin' || type === 'mod';
    
    const colors = {
      admin: { bg: 'rgba(168, 85, 247, 0.1)', border: '#a855f7', text: '#d8b4fe' },
      mod: { bg: 'rgba(56, 189, 248, 0.1)', border: '#38bdf8', text: '#bae6fd' },
      op: { bg: 'rgba(15, 23, 42, 0.6)', border: '#334155', text: '#cbd5e1' }
    };
    
    const theme = colors[type] || colors.op;

    return (
      <div style={{ 
        display: 'flex', alignItems: 'center', gap: '12px', 
        padding: isLeader ? '12px 16px' : '8px 12px', 
        backgroundColor: theme.bg, 
        border: `1px solid ${theme.border}`, 
        borderRadius: '12px',
        width: isLeader ? 'auto' : '100%',
        minWidth: isLeader ? '240px' : 'auto'
      }}>
        <div style={{ 
          width: isLeader ? '40px' : '32px', height: isLeader ? '40px' : '32px', 
          borderRadius: '8px', backgroundColor: '#0f172a', border: `1px solid ${theme.border}`, 
          display: 'flex', justifyContent: 'center', alignItems: 'center', 
          color: theme.text, fontWeight: 'bold', fontSize: isLeader ? '14px' : '12px', flexShrink: 0
        }}>
          {initials}
        </div>
        <div style={{ overflow: 'hidden', textAlign: isRtl ? 'right' : 'left' }}>
          <div style={{ fontWeight: 'bold', color: '#f8fafc', fontSize: isLeader ? '14px' : '13px', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
            {user.display_name || user.email?.split('@')[0]}
          </div>
          <div style={{ fontSize: '11px', color: theme.text, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {user.role || 'Operator'}
          </div>
        </div>
      </div>
    );
  };

  // --- COLLAPSIBLE SQUAD CARD COMPONENT ---
  const SquadCard = ({ squad }) => {
    // Default to closed for scalability
    const [isExpanded, setIsExpanded] = useState(false);

    return (
      <div style={{ backgroundColor: '#1e293b', border: isExpanded ? '1px solid #38bdf8' : '1px solid #334155', borderRadius: '16px', overflow: 'hidden', display: 'flex', flexDirection: 'column', transition: 'all 0.2s ease' }}>
        
        {/* Squad Header (Clickable) */}
        <div 
          onClick={() => setIsExpanded(!isExpanded)}
          style={{ 
            padding: '16px 20px', 
            borderBottom: isExpanded ? '1px solid #334155' : 'none', 
            backgroundColor: isExpanded ? '#0f172a' : '#1e293b', 
            cursor: 'pointer', 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            transition: 'background-color 0.2s ease'
          }}
          onMouseOver={e => { if(!isExpanded) e.currentTarget.style.backgroundColor = 'rgba(56, 189, 248, 0.05)'; }}
          onMouseOut={e => { if(!isExpanded) e.currentTarget.style.backgroundColor = '#1e293b'; }}
        >
          <div style={{ flex: 1, pointerEvents: 'none' }}>
            <UserBadge user={squad} type="mod" />
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', paddingLeft: isRtl ? '0' : '16px', paddingRight: isRtl ? '16px' : '0' }}>
            {/* Quick Summary Badge */}
            <div style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)', border: '1px solid #334155', padding: '6px 12px', borderRadius: '20px', fontSize: '0.75rem', color: '#cbd5e1', fontWeight: 'bold' }}>
              {squad.team.length} {isEn ? 'Operators' : 'מפעילים'}
            </div>
            {/* Animated Chevron */}
            <div style={{ color: '#64748b', fontSize: '0.875rem', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s ease' }}>
              ▼
            </div>
          </div>
        </div>
        
        {/* Squad Body (Operators) - Only renders when expanded */}
        {isExpanded && (
          <div style={{ padding: '20px', backgroundColor: 'rgba(15, 23, 42, 0.3)', flex: 1, animation: 'slideDown 0.3s ease-out', transformOrigin: 'top' }}>
            {squad.team.length === 0 ? (
              <div style={{ color: '#475569', fontSize: '0.875rem', textAlign: 'center', padding: '20px 0' }}>
                {isEn ? 'No operators assigned.' : 'אין מפעילים מוקצים.'}
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px' }}>
                {squad.team.map(op => <UserBadge key={op.id} user={op} type="op" />)}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  if (!teamMembers || teamMembers.length === 0) {
    return <div style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>{isEn ? 'No team data available.' : 'אין נתוני צוות זמינים.'}</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '40px', direction: isRtl ? 'rtl' : 'ltr', animation: 'fadeIn 0.4s ease-out' }}>
      
      {/* Header */}
      <div>
        <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#ffffff', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
          🗂️ {isEn ? 'Organizational Structure' : 'מבנה ארגוני'}
        </h2>
        <p style={{ color: '#94a3b8', fontSize: '0.95rem', margin: 0 }}>
          {isEn ? 'Scaled view of leadership and operational squads.' : 'תצוגה רחבה של ההנהלה וצוותי התפעול.'}
        </p>
      </div>

      {/* TIER 1: LEADERSHIP (ADMINS) */}
      {admins.length > 0 && (
        <div>
          <h3 style={{ color: '#d8b4fe', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#a855f7' }}></span>
            {isEn ? 'Global Leadership' : 'הנהלה עולמית'}
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', backgroundColor: 'rgba(168, 85, 247, 0.05)', padding: '24px', borderRadius: '16px', border: '1px solid rgba(168, 85, 247, 0.2)' }}>
            {admins.map(admin => <UserBadge key={admin.id} user={admin} type="admin" />)}
          </div>
        </div>
      )}

      {/* TIER 2 & 3: SQUADS (MODERATORS + OPERATORS) */}
      <div>
        <h3 style={{ color: '#bae6fd', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#38bdf8' }}></span>
          {isEn ? 'Operational Squads' : 'צוותי תפעול'}
        </h3>
        
        {/* Accordion Container */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {squads.map(squad => (
            <SquadCard key={squad.id} squad={squad} />
          ))}
        </div>
      </div>

      {/* UNASSIGNED POOL */}
      {unassignedOperators.length > 0 && (
        <div>
          <h3 style={{ color: '#cbd5e1', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#64748b' }}></span>
            {isEn ? 'Unassigned Pool' : 'מפעילים ללא שיוך מנהל'}
          </h3>
          <div style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)', border: '1px dashed #334155', borderRadius: '16px', padding: '24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px' }}>
              {unassignedOperators.map(op => <UserBadge key={op.id} user={op} type="op" />)}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: scaleY(0.95); }
          to { opacity: 1; transform: scaleY(1); }
        }
      `}</style>
    </div>
  );
};

export default OrgChart;