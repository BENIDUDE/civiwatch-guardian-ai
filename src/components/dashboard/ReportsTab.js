/**
 * @file ReportsTab.js
 * @description The Command Center for CiviWatch Reporting.
 * FIX: Restored the missing 'qa_audits' query in the Promise.all array to prevent 
 * the TypeError crash, allowing the Performance Matrix to calculate correctly.
 */
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../../supabaseClient';

const SVGIcons = {
  FileText: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>,
  Refresh: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>,
  Users: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>,
  Alert: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>,
  Trash: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>,
  Search: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>,
  Chart: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>,
  Download: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>,
  Calendar: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>,
  Copy: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
};

const ReportsTab = ({ userProfile, teamMembers, isEn, triggerToast }) => {
  const isRtl = !isEn;
  
  const myId = userProfile?.user_id || userProfile?.id;
  const orgId = userProfile?.organization_id;
  const safeRole = userProfile?.role?.toLowerCase()?.trim() || '';
  
  const isGlobalAdmin = ['global admin', 'super admin'].includes(safeRole);
  const isAdmin = isGlobalAdmin || ['ngo admin', 'admin'].includes(safeRole);
  const isModerator = isAdmin || safeRole === 'moderator l2';

  const [activeReport, setActiveReport] = useState('personal_summary');
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [targetOperatorId, setTargetOperatorId] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [manualRefresh, setManualRefresh] = useState(0);

  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const isReadOnlyReport = activeReport === 'personal_summary' || activeReport === 'resolution_audit' || activeReport === 'personal_qa' || activeReport === 'shift_throughput' || activeReport === 'unassigned_operators';

  // We filter out moderators for specific operator-only views.
  const availableOperators = useMemo(() => {
    return (Array.isArray(teamMembers) ? teamMembers : []).filter(member => {
      const role = (member.role || '').toLowerCase();
      return role.includes('operator') || role.includes('moderator');
    });
  }, [teamMembers]);

  const menuSections = useMemo(() => [
    {
      title: isEn ? 'Personal' : 'אישי',
      show: true,
      reports: [
        { id: 'personal_summary', label: isEn ? 'Recent Work Items' : 'משימות אחרונות', icon: SVGIcons.FileText },
        { id: 'personal_qa', label: isEn ? 'QA Feedback History' : 'היסטוריית משוב QA', icon: SVGIcons.Search }
      ]
    },
    {
      title: isEn ? 'Team Management' : 'ניהול צוות',
      show: isModerator,
      reports: [
        { id: 'shift_throughput', label: isEn ? 'Load & QA Performance' : 'עומס מפעילים וביצועי QA', icon: SVGIcons.Chart },
        { id: 'team_sla_risk', label: isEn ? 'SLA Risk Queue' : 'תור סיכון SLA', icon: SVGIcons.Alert },
        { id: 'qa_disputes', label: isEn ? 'QA Dispute Log' : 'יומן מחלוקות QA', icon: SVGIcons.Users, isStub: true }
      ]
    },
    {
      title: isEn ? 'Compliance & Org' : 'ציות וארגון',
      show: isAdmin,
      reports: [
        { id: 'unassigned_operators', label: isEn ? 'Unassigned Operators' : 'מפעילים ללא צוות', icon: SVGIcons.Users },
        { id: 'unassigned_reports', label: isEn ? 'Triage Recovery' : 'שחזור דיווחי טריאז\'', icon: SVGIcons.Search },
        { id: 'unassigned_assignments', label: isEn ? 'Assignment Recovery' : 'שחזור משימות', icon: SVGIcons.Search },
        { id: 'resolution_audit', label: isEn ? 'Resolution Audit Log' : 'יומן החלטות סופי', icon: SVGIcons.FileText },
        { id: 'gdpr_purge', label: isEn ? 'GDPR 90-Day Purge' : 'מחיקת 90 יום (GDPR)', icon: SVGIcons.Trash },
        { id: 'algo_drift', label: isEn ? 'Algorithmic Drift' : 'סטיית אלגוריתם', icon: SVGIcons.Chart, isStub: true },
        { id: 'platform_heatmap', label: isEn ? 'Platform Heatmap' : 'מפת חום פלטפורמות', icon: SVGIcons.Chart, isStub: true }
      ]
    }
  ], [isEn, isAdmin, isModerator]);

  const fetchReportData = useCallback(async () => {
    if (!myId) return; 
    setLoading(true);
    setSelectedItems([]);
    
    const applyDates = (queryBuilder) => {
      if (startDate) queryBuilder = queryBuilder.gte('created_at', new Date(startDate).toISOString());
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        queryBuilder = queryBuilder.lte('created_at', end.toISOString());
      }
      return queryBuilder;
    };

    try {
      let fetchedData = [];

      if (activeReport === 'personal_summary') {
        const q1 = applyDates(supabase.from('reports').select('id, created_at, platform, status, content').eq('assigned_to', myId));
        const q2 = applyDates(supabase.from('assignments').select('id, created_at, status, custom_instructions, category').eq('assigned_to', myId));
        
        const [{ data: reports }, { data: assigns }] = await Promise.all([q1.order('created_at', { ascending: false }).limit(200), q2.order('created_at', { ascending: false }).limit(200)]);
        
        fetchedData = [
          ...(reports || []).map(r => ({ ...r, _type: 'Triage' })),
          ...(assigns || []).map(a => ({ ...a, content: a.custom_instructions || a.category, _type: 'Assignment' }))
        ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      } 
      else if (activeReport === 'personal_qa') {
        const q = applyDates(supabase.from('qa_audits').select('id, created_at, action_taken, reason_category, detailed_note').eq('operator_id', myId));
        const { data } = await q.order('created_at', { ascending: false }).limit(200);
        fetchedData = data || [];
      } 
      else if (activeReport === 'team_sla_risk' && isModerator) {
        const myTeamIdsStr = availableOperators.map(op => op.user_id || op.id).join(',');
        const idArray = myTeamIdsStr.split(',').filter(Boolean);
        if (idArray.length > 0) {
          const q = applyDates(supabase.from('reports').select('id, created_at, platform, status, assigned_to').in('assigned_to', idArray).in('status', ['Pending', 'In Progress', 'Changes Requested', 'Manual Review Required']));
          const { data } = await q.order('created_at', { ascending: true }).limit(200);
          fetchedData = data || [];
        }
      } 
      // OPERATOR LOAD & QA PERFORMANCE 
      else if (activeReport === 'shift_throughput' && isModerator) {
        const strictOperators = availableOperators.filter(op => op.role?.toLowerCase()?.trim() === 'operator l1');
        const idArray = strictOperators.flatMap(op => [op.id, op.user_id]).filter(Boolean);
        
        if (idArray.length > 0) {
          // FIX: Added the missing qa_audits query back to the Promise.all array
          const [{ data: reps }, { data: assigns }, { data: audits }] = await Promise.all([
            supabase.from('reports').select('id, assigned_to, submitted_by, status, additional_info').order('created_at', { ascending: false }).limit(3000),
            supabase.from('assignments').select('id, assigned_to, status').in('assigned_to', idArray),
            supabase.from('qa_audits').select('report_id, operator_id').in('operator_id', idArray)
          ]);
          
          fetchedData = strictOperators.map(op => {
            const opRefIds = [op.id, op.user_id].filter(Boolean);
            
            // ACTIVE QUEUE LOAD
            const activeReps = (reps || []).filter(r => {
              const isRelevantStatus = ['Pending', 'In Progress', 'Changes Requested'].includes(r.status);
              if (!isRelevantStatus) return false;
              if (r.assigned_to) return opRefIds.includes(r.assigned_to);
              return opRefIds.includes(r.submitted_by);
            });
            const activeAssigns = (assigns || []).filter(a => opRefIds.includes(a.assigned_to) && ['Pending', 'In Progress'].includes(a.status));
            
            const tCount = activeReps.length;
            const aCount = activeAssigns.length;
            
            // LIFETIME QA MISTAKES 
            const opAudits = (audits || []).filter(a => opRefIds.includes(a.operator_id));
            const totalMistakes = opAudits.length;
            
            const reportAuditCounts = {};
            opAudits.forEach(a => {
              reportAuditCounts[a.report_id] = (reportAuditCounts[a.report_id] || 0) + 1;
            });
            const repeatedFailures = Object.values(reportAuditCounts).filter(count => count > 1).length;

            return {
              id: op.id,
              created_at: op.created_at || new Date().toISOString(),
              operatorName: op.display_name || op.email,
              email: op.email,
              triageCount: tCount,
              assignCount: aCount,
              totalCount: tCount + aCount,
              totalMistakes,
              repeatedFailures,
              _type: 'throughput'
            };
          }).sort((a, b) => a.totalCount - b.totalCount); 
        }
      }
      else if (activeReport === 'unassigned_operators' && isAdmin) {
        let q = supabase.from('user_profiles').select('id, created_at, display_name, email, role').is('manager_id', null).ilike('role', '%operator%');
        if (!isGlobalAdmin) q = q.eq('organization_id', orgId);
        const { data } = await q.order('created_at', { ascending: false });
        fetchedData = (data || []).map(u => ({
          id: u.id,
          created_at: u.created_at,
          operatorName: u.display_name || u.email,
          email: u.email,
          role: u.role,
          _type: 'unassigned_op'
        }));
      }
      else if (activeReport === 'unassigned_reports' && isAdmin) {
        let q = supabase.from('reports').select('id, created_at, platform, status, content').is('assigned_to', null).not('status', 'in', '("Verified","Closed - Verified","Dismissed","Network Rejected","Appeal Rejected","Takedown Successful")');
        if (!isGlobalAdmin) q = q.eq('organization_id', orgId);
        const { data } = await applyDates(q).order('created_at', { ascending: false }).limit(200);
        fetchedData = data || [];
      } 
      else if (activeReport === 'unassigned_assignments' && isAdmin) {
        let q = supabase.from('assignments').select('id, created_at, platform, status, custom_instructions, category').is('assigned_to', null).neq('status', 'Completed');
        if (!isGlobalAdmin) q = q.eq('organization_id', orgId);
        const { data } = await applyDates(q).order('created_at', { ascending: false }).limit(200);
        fetchedData = (data || []).map(a => ({ ...a, content: a.custom_instructions || a.category }));
      } 
      else if (activeReport === 'resolution_audit' && isAdmin) {
        let q = supabase.from('reports').select('id, created_at, platform, status, content').in('status', ['Closed - Verified', 'Dismissed', 'Network Rejected', 'Takedown Successful', 'Appeal Successful', 'Appeal Rejected']);
        if (!isGlobalAdmin) q = q.eq('organization_id', orgId);
        const { data } = await applyDates(q).order('created_at', { ascending: false }).limit(200);
        fetchedData = data || [];
      }
      else if (activeReport === 'gdpr_purge' && isAdmin) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - 85);
        let q = supabase.from('reports').select('id, created_at, platform, status, content')
          .in('status', ['Closed - Verified', 'Dismissed', 'Network Rejected', 'Takedown Successful', 'Appeal Successful', 'Appeal Rejected'])
          .lte('created_at', cutoffDate.toISOString());
        if (!isGlobalAdmin) q = q.eq('organization_id', orgId);
        const { data } = await q.order('created_at', { ascending: true }); 
        fetchedData = data || [];
      }

      setReportData(fetchedData);
    } catch (err) {
      console.error("Report Fetch Error:", err);
      if (triggerToast) triggerToast(isEn ? "Failed to load report data." : "טעינת הדוח נכשלה.", 'error');
    } finally {
      setLoading(false);
    }
  }, [activeReport, myId, orgId, isAdmin, isGlobalAdmin, isModerator, startDate, endDate, isEn, triggerToast, availableOperators]);

  useEffect(() => {
    const flatMenu = menuSections.flatMap(s => s.reports);
    const selectedObj = flatMenu.find(r => r.id === activeReport);
    if (!selectedObj?.isStub) fetchReportData();
    else setReportData([]);
  }, [activeReport, manualRefresh, fetchReportData, menuSections]);

  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return reportData;
    const lowerQuery = searchQuery.toLowerCase();
    
    return reportData.filter(item => {
      const searchTarget = `
        ${item.content || ''} 
        ${item.status || ''} 
        ${item.platform || ''} 
        ${item._type || ''} 
        ${item.id || ''} 
        ${item.action_taken || ''} 
        ${item.reason_category || ''} 
        ${item.detailed_note || ''}
        ${item.operatorName || ''}
        ${item.email || ''}
      `.toLowerCase();
      
      return searchTarget.includes(lowerQuery);
    });
  }, [reportData, searchQuery]);

  const handleCopyId = (id) => {
    navigator.clipboard.writeText(id);
    if (triggerToast) triggerToast(isEn ? "ID copied to clipboard" : "מזהה הועתק ללוח", 'success');
  };

  const handleExportCSV = () => {
    if (filteredData.length === 0) return;
    
    let headers = [];
    if (activeReport === 'shift_throughput') {
      headers = isEn ? ['Operator Name', 'Email', 'Triage Load', 'Assignment Load', 'Total Load', 'QA Mistakes', 'Repeat Fails'] : ['שם מפעיל', 'אימייל', 'עומס טריאז', 'עומס משימות', 'סה"כ משימות', 'טעויות QA', 'כישלונות חוזרים'];
    } else if (activeReport === 'unassigned_operators') {
      headers = isEn ? ['Join Date', 'Operator Name', 'Email', 'Role'] : ['תאריך הצטרפות', 'שם מפעיל', 'אימייל', 'הרשאה'];
    } else if (activeReport === 'personal_qa') {
      headers = isEn ? ['Date', 'System ID', 'Action Taken', 'Category', 'Moderator Note'] : ['תאריך', 'מזהה מערכת', 'פעולה', 'קטגוריה', 'הערת מנהל'];
    } else {
      headers = isEn ? ['Date', 'System ID', 'Type/Platform', 'Status', 'Content/Details'] : ['תאריך', 'מזהה מערכת', 'פלטפורמה', 'סטטוס', 'תוכן/פרטים'];
    }
    
    const csvRows = [headers.join(',')];

    filteredData.forEach(row => {
      const date = new Date(row.created_at).toLocaleDateString(isEn ? 'en-US' : 'he-IL');
      
      if (activeReport === 'shift_throughput') {
        csvRows.push(`"${row.operatorName}","${row.email}","${row.triageCount}","${row.assignCount}","${row.totalCount}","${row.totalMistakes}","${row.repeatedFailures}"`);
      } else if (activeReport === 'unassigned_operators') {
        csvRows.push(`"${date}","${row.operatorName}","${row.email}","${row.role || 'Operator'}"`);
      } else if (activeReport === 'personal_qa') {
        const cleanNote = `"${String(row.detailed_note || '').replace(/"/g, '""').replace(/\n/g, ' ')}"`;
        csvRows.push(`"${date}","${row.id}","${row.action_taken}","${row.reason_category}",${cleanNote}`);
      } else {
        const id = row.id;
        const type = row.platform || row._type || 'N/A';
        const status = row.status || 'N/A';
        const rawContent = row.content || 'N/A';
        const cleanContent = `"${String(rawContent).replace(/"/g, '""').replace(/\n/g, ' ')}"`;
        csvRows.push(`"${date}","${id}","${type}","${status}",${cleanContent}`);
      }
    });

    const csvData = new Blob(['\uFEFF' + csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' }); 
    const link = document.createElement('a');
    link.href = URL.createObjectURL(csvData);
    link.download = `CiviWatch_Report_${activeReport}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) setSelectedItems(filteredData.map(t => t.id));
    else setSelectedItems([]);
  };

  const handleSelectItem = (id) => {
    setSelectedItems(prev => prev.includes(id) ? prev.filter(itemId => itemId !== id) : [...prev, id]);
  };

  const executeBulkReassignment = async () => {
    if (selectedItems.length === 0 || !targetOperatorId) return;
    setIsProcessing(true);
    try {
      const targetTable = activeReport === 'unassigned_reports' || activeReport === 'team_sla_risk' ? 'reports' : 'assignments';
      const { error } = await supabase.from(targetTable).update({ assigned_to: targetOperatorId, status: 'Pending' }).in('id', selectedItems);
      
      if (error) throw error;
      if (triggerToast) triggerToast(isEn ? `Successfully reassigned ${selectedItems.length} items.` : `הוקצו בהצלחה ${selectedItems.length} פריטים.`, 'success');
      setTargetOperatorId('');
      setManualRefresh(prev => prev + 1); 
    } catch (err) {
      if (triggerToast) triggerToast(isEn ? "Failed to reassign." : "ההקצאה נכשלה.", 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const executeGDPRPurge = async () => {
    if (selectedItems.length === 0) return;
    if (!window.confirm(isEn ? "CRITICAL: You are about to permanently anonymize/purge these records to comply with GDPR. This CANNOT be undone. Proceed?" : "קריטי: אתה עומד למחוק נתונים אלו לצמיתות כדי לעמוד בתקנות ה-GDPR. לא ניתן לבטל פעולה זו. להמשיך?")) return;
    
    setIsProcessing(true);
    try {
      const { error } = await supabase.from('reports').update({ status: 'Purged (GDPR)', content: '[REDACTED]', image_url: null, additional_info: null }).in('id', selectedItems);
      if (error) throw error;
      if (triggerToast) triggerToast(isEn ? `Successfully purged ${selectedItems.length} records.` : `נמחקו בהצלחה ${selectedItems.length} רשומות.`, 'success');
      setManualRefresh(prev => prev + 1);
    } catch(err) {
      if (triggerToast) triggerToast(isEn ? "Purge Failed." : "מחיקה נכשלה.", 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const renderActiveReport = () => {
    const flatMenu = menuSections.flatMap(s => s.reports);
    const selectedObj = flatMenu.find(r => r.id === activeReport);

    if (selectedObj?.isStub) {
      return (
        <div style={{ textAlign: 'center', color: '#64748b', padding: '100px 20px' }}>
          <div style={{ marginBottom: '20px', color: '#334155' }}>
             <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>
          </div>
          <h3 style={{ margin: '0 0 10px 0', color: '#94a3b8' }}>{isEn ? 'Advanced Reporting Module' : 'מודול דוחות מתקדם'}</h3>
          <p style={{ margin: 0 }}>{isEn ? 'This report requires significant historical data to generate accurate trends. It will unlock automatically once sufficient data is processed.' : 'דוח זה דורש נתונים היסטוריים משמעותיים כדי לייצר מגמות מדויקות. הוא ייפתח אוטומטית ברגע שיעובדו מספיק נתונים.'}</p>
        </div>
      );
    }

    if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px', color: '#38bdf8' }}>{isEn ? 'Compiling data...' : 'מעבד נתונים...'}</div>;

    if (filteredData.length === 0) {
      return (
        <div style={{ textAlign: 'center', color: '#64748b', padding: '100px 0' }}>
          {activeReport === 'personal_summary' 
            ? (isEn ? 'You have no recent assignments or reports in your queue.' : 'אין לך משימות או דיווחים אחרונים בתור שלך.') 
            : (isEn ? 'No records match your current filters.' : 'לא נמצאו רשומות התואמות לסינון הנוכחי.')}
        </div>
      );
    }

    // --- CUSTOM RENDER: OPERATOR LOAD & QA MATRIX ---
    if (activeReport === 'shift_throughput') {
      return (
        <div style={{ color: '#fff', minWidth: '950px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr 1.2fr 1fr 1fr', color: '#94a3b8', borderBottom: '1px solid #334155', paddingBottom: '10px', marginBottom: '10px', fontSize: '0.8rem', textTransform: 'uppercase' }}>
            <div>{isEn ? 'Operator' : 'מפעיל'}</div>
            <div>{isEn ? 'Triage Queue' : 'תור טריאז\''}</div>
            <div>{isEn ? 'Assignments' : 'משימות יזומות'}</div>
            <div>{isEn ? 'Total Load' : 'עומס כולל'}</div>
            <div>{isEn ? 'QA Mistakes' : 'טעויות QA'}</div>
            <div>{isEn ? 'Repeat Fails' : 'כישלונות חוזרים'}</div>
            <div>{isEn ? 'Status' : 'סטטוס'}</div>
          </div>
          {filteredData.map(item => (
            <div key={item.id} style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr 1.2fr 1fr 1fr', padding: '16px 0', borderBottom: '1px solid rgba(255,255,255,0.02)', alignItems: 'center', gap: '15px' }}>
              <div>
                <strong style={{ color: '#f8fafc', display: 'block' }}>{item.operatorName}</strong>
                <span style={{ color: '#64748b', fontSize: '0.8rem' }}>{item.email}</span>
              </div>
              <div style={{ color: '#f59e0b', fontWeight: 'bold', userSelect: 'none' }}>{item.triageCount}</div>
              <div style={{ color: '#a855f7', fontWeight: 'bold', userSelect: 'none' }}>{item.assignCount}</div>
              <div style={{ color: '#38bdf8', fontWeight: 'bold', fontSize: '1.1rem', userSelect: 'none' }}>{item.totalCount}</div>
              
              <div style={{ color: item.totalMistakes > 0 ? '#ef4444' : '#10b981', fontWeight: 'bold', userSelect: 'none' }}>
                {item.totalMistakes}
              </div>
              <div style={{ color: item.repeatedFailures > 0 ? '#fca5a5' : '#64748b', fontWeight: 'bold', userSelect: 'none' }}>
                {item.repeatedFailures > 0 ? `${item.repeatedFailures} ⚠️` : '0'}
              </div>

              <div>
                {item.totalCount === 0 ? (
                  <span style={{ backgroundColor: 'rgba(239,68,68,0.1)', color: '#ef4444', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>{isEn ? 'IDLE' : 'פנוי / בהמתנה'}</span>
                ) : (
                  <span style={{ backgroundColor: 'rgba(16,185,129,0.1)', color: '#10b981', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>{isEn ? 'ACTIVE' : 'פעיל'}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      );
    }

    // --- CUSTOM RENDER: UNASSIGNED OPERATORS ---
    if (activeReport === 'unassigned_operators') {
      return (
        <div style={{ color: '#fff', minWidth: '700px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 2fr 1.5fr', color: '#94a3b8', borderBottom: '1px solid #334155', paddingBottom: '10px', marginBottom: '10px', fontSize: '0.85rem', textTransform: 'uppercase' }}>
            <div>{isEn ? 'Joined Date' : 'תאריך הצטרפות'}</div>
            <div>{isEn ? 'Operator Name' : 'שם מפעיל'}</div>
            <div>{isEn ? 'Email' : 'אימייל'}</div>
            <div>{isEn ? 'Role' : 'הרשאה'}</div>
          </div>
          {filteredData.map(item => (
            <div key={item.id} style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 2fr 1.5fr', padding: '16px 0', borderBottom: '1px solid rgba(255,255,255,0.02)', alignItems: 'center', gap: '15px' }}>
              <div style={{ fontSize: '0.9rem', color: '#e2e8f0' }}>{new Date(item.created_at).toLocaleDateString(isEn ? 'en-US' : 'he-IL')}</div>
              <div style={{ color: '#f8fafc', fontWeight: 'bold' }}>{item.operatorName}</div>
              <div style={{ color: '#cbd5e1' }}>{item.email}</div>
              <div><span style={{ backgroundColor: 'rgba(56,189,248,0.1)', color: '#38bdf8', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', border: '1px solid rgba(56,189,248,0.2)' }}>{item.role || 'Operator L1'}</span></div>
            </div>
          ))}
        </div>
      );
    }

    // --- CUSTOM RENDER: QA AUDITS ---
    if (activeReport === 'personal_qa') {
      return (
        <div style={{ color: '#fff', minWidth: '700px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.5fr 1fr 1.5fr 3fr', color: '#94a3b8', borderBottom: '1px solid #334155', paddingBottom: '10px', marginBottom: '10px', fontSize: '0.85rem', textTransform: 'uppercase' }}>
            <div>{isEn ? 'Date' : 'תאריך'}</div>
            <div>{isEn ? 'System ID' : 'מזהה'}</div>
            <div>{isEn ? 'Action' : 'פעולה'}</div>
            <div>{isEn ? 'Category' : 'קטגוריה'}</div>
            <div>{isEn ? 'Moderator Note' : 'הערת מנהל'}</div>
          </div>
          {filteredData.map(item => (
            <div key={item.id} style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.5fr 1fr 1.5fr 3fr', padding: '16px 0', borderBottom: '1px solid rgba(255,255,255,0.02)', alignItems: 'center', gap: '15px' }}>
              <div style={{ fontSize: '0.9rem', color: '#e2e8f0' }}>{new Date(item.created_at).toLocaleString(isEn ? 'en-US' : 'he-IL')}</div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontFamily: 'monospace', color: '#64748b', fontSize: '0.8rem' }}>{item.id.substring(0,6)}...{item.id.substring(item.id.length-4)}</span>
                <button onClick={() => handleCopyId(item.id)} style={{ background: 'none', border: 'none', color: '#38bdf8', cursor: 'pointer', padding: 0 }} title="Copy ID">{SVGIcons.Copy}</button>
              </div>

              <div><span style={{ backgroundColor: item.action_taken === 'Changes Requested' ? 'rgba(239,68,68,0.1)' : 'rgba(168,85,247,0.1)', color: item.action_taken === 'Changes Requested' ? '#ef4444' : '#a855f7', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>{item.action_taken}</span></div>
              <div style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>{item.reason_category || 'N/A'}</div>
              <div style={{ fontSize: '0.9rem', color: '#f8fafc', fontStyle: 'italic', backgroundColor: 'rgba(15,23,42,0.5)', padding: '10px', borderRadius: '8px', borderLeft: '2px solid #38bdf8' }}>"{item.detailed_note || 'No notes provided.'}"</div>
            </div>
          ))}
        </div>
      );
    }

    // --- DEFAULT MULTI-PURPOSE GRID ---
    const gridColumns = isReadOnlyReport ? '1fr 1fr 1.2fr 1fr 2fr' : '40px 1fr 1fr 1.2fr 1fr 2fr';

    return (
      <div style={{ width: '100%', overflowX: 'auto' }}>
        <div style={{ color: '#fff', minWidth: '950px' }}>
          
          {/* Action Bar */}
          {!isReadOnlyReport && (
            <div style={{ padding: '15px 20px', marginBottom: '20px', backgroundColor: 'rgba(30, 41, 59, 0.5)', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#38bdf8', fontWeight: 'bold' }}>{selectedItems.length} {isEn ? 'Selected' : 'נבחרו'}</span>
              
              {activeReport === 'gdpr_purge' ? (
                <button onClick={executeGDPRPurge} disabled={selectedItems.length === 0 || isProcessing} style={{ backgroundColor: '#ef4444', color: 'white', padding: '8px 16px', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: selectedItems.length === 0 ? 'not-allowed' : 'pointer', display: 'flex', gap: '8px', opacity: selectedItems.length === 0 ? 0.5 : 1 }}>
                  {SVGIcons.Trash} {isProcessing ? 'Purging...' : (isEn ? 'Purge Data (GDPR)' : 'מחק נתונים לצמיתות')}
                </button>
              ) : (
                <div style={{ display: 'flex', gap: '10px' }}>
                  <select value={targetOperatorId} onChange={(e) => setTargetOperatorId(e.target.value)} disabled={selectedItems.length === 0} style={{ backgroundColor: '#0f172a', border: '1px solid #334155', color: '#cbd5e1', padding: '8px 12px', borderRadius: '8px', outline: 'none' }}>
                    <option value="">{isEn ? '-- Reassign To --' : '-- הקצה אל --'}</option>
                    {availableOperators.map(op => <option key={op.id} value={op.user_id || op.id}>{op.display_name || op.email}</option>)}
                  </select>
                  <button onClick={executeBulkReassignment} disabled={selectedItems.length === 0 || !targetOperatorId || isProcessing} style={{ backgroundColor: '#10b981', color: 'white', padding: '8px 16px', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: (selectedItems.length === 0 || !targetOperatorId) ? 'not-allowed' : 'pointer', opacity: (selectedItems.length === 0 || !targetOperatorId) ? 0.5 : 1 }}>
                    {isProcessing ? '...' : (isEn ? 'Bulk Assign' : 'הקצאה גורפת')}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Header */}
          <div style={{ display: 'grid', gridTemplateColumns: gridColumns, color: '#94a3b8', borderBottom: '1px solid #334155', paddingBottom: '10px', marginBottom: '10px', fontSize: '0.85rem', textTransform: 'uppercase', gap: '15px', alignItems: 'center' }}>
            {!isReadOnlyReport && <div><input type="checkbox" onChange={handleSelectAll} checked={filteredData.length > 0 && selectedItems.length === filteredData.length} style={{ cursor: 'pointer' }} /></div>}
            <div>{isEn ? 'Date / Age' : 'תאריך / גיל'}</div>
            <div>{isEn ? 'System ID' : 'מזהה'}</div>
            <div>{activeReport === 'team_sla_risk' ? (isEn ? 'Assigned To' : 'שויך אל') : (isEn ? 'Platform / Type' : 'פלטפורמה / סוג')}</div>
            <div>{isEn ? 'Status' : 'סטטוס'}</div>
            <div>{isEn ? 'Content Snippet' : 'תוכן'}</div>
          </div>
          
          {/* Rows */}
          {filteredData.map(item => {
            const isSelected = selectedItems.includes(item.id);
            const daysOld = Math.floor((new Date() - new Date(item.created_at)) / (1000 * 60 * 60 * 24));
            const isDanger = activeReport === 'gdpr_purge' && daysOld >= 88;
            
            let operatorName = 'Unknown';
            if (activeReport === 'team_sla_risk') {
               const op = availableOperators.find(o => o.user_id === item.assigned_to || o.id === item.assigned_to);
               if (op) operatorName = op.display_name || op.email;
            }
            
            return (
              <div key={item.id} style={{ display: 'grid', gridTemplateColumns: gridColumns, alignItems: 'center', padding: '16px 0', borderBottom: '1px solid rgba(255,255,255,0.02)', gap: '15px', backgroundColor: isSelected ? 'rgba(56, 189, 248, 0.05)' : 'transparent' }}>
                
                {!isReadOnlyReport && (
                  <div><input type="checkbox" checked={isSelected} onChange={() => handleSelectItem(item.id)} style={{ cursor: 'pointer' }} /></div>
                )}
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '0.9rem', color: isDanger ? '#ef4444' : '#e2e8f0', fontWeight: isDanger ? 'bold' : 'normal' }}>
                    {new Date(item.created_at).toLocaleDateString(isEn ? 'en-US' : 'he-IL')}
                  </span>
                  <span style={{ color: isDanger ? '#fca5a5' : '#64748b', fontSize: '0.75rem', fontWeight: 'bold' }}>
                    {daysOld > 0 ? (isEn ? `${daysOld} Days Old` : `לפני ${daysOld} ימים`) : (isEn ? 'Today' : 'היום')}
                  </span>
                </div>

                {/* ID Column with Copy Button */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontFamily: 'monospace', color: '#64748b', fontSize: '0.8rem' }}>{item.id.substring(0,6)}...{item.id.substring(item.id.length-4)}</span>
                  <button onClick={() => handleCopyId(item.id)} style={{ background: 'none', border: 'none', color: '#38bdf8', cursor: 'pointer', padding: 0 }} title="Copy ID">{SVGIcons.Copy}</button>
                </div>

                {activeReport === 'team_sla_risk' ? (
                  <div style={{ fontSize: '0.9rem', color: '#cbd5e1', fontWeight: 'bold' }}>{operatorName}</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-start' }}>
                    {item._type && <span style={{ backgroundColor: item._type === 'Assignment' ? 'rgba(168,85,247,0.1)' : 'rgba(56,189,248,0.1)', color: item._type === 'Assignment' ? '#a855f7' : '#38bdf8', padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem', border: `1px solid ${item._type === 'Assignment' ? 'rgba(168,85,247,0.2)' : 'rgba(56,189,248,0.2)'}`, fontWeight: 'bold' }}>{item._type}</span>}
                    {item.platform && <span style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: '#cbd5e1', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', border: '1px solid rgba(255,255,255,0.1)' }}>{item.platform}</span>}
                  </div>
                )}

                <div>
                  <span style={{ 
                    backgroundColor: ['Appeal Successful', 'Takedown Successful', 'Closed - Verified'].includes(item.status) ? 'rgba(16, 185, 129, 0.1)' : ['Appeal Rejected', 'Network Rejected', 'Dismissed'].includes(item.status) ? 'rgba(239, 68, 68, 0.1)' : 'transparent',
                    color: ['Appeal Successful', 'Takedown Successful', 'Closed - Verified'].includes(item.status) ? '#10b981' : ['Appeal Rejected', 'Network Rejected', 'Dismissed'].includes(item.status) ? '#ef4444' : '#94a3b8', 
                    padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 'bold' 
                  }}>
                    {item.status || 'Pending'}
                  </span>
                </div>

                <div style={{ fontSize: '0.85rem', color: '#cbd5e1', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {item.content || (isEn ? 'No text content.' : 'ללא טקסט.')}
                </div>

              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', direction: isRtl ? 'rtl' : 'ltr', animation: 'fadeIn 0.4s ease-out' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '20px' }}>
        <div>
          <h2 style={{ margin: 0, color: '#fff', fontSize: '1.8rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
            {SVGIcons.FileText} {isEn ? 'Command Center & Reports' : 'מרכז דוחות ובקרה'}
          </h2>
          <p style={{ margin: '5px 0 0 0', color: '#94a3b8', fontSize: '0.95rem' }}>
            {isEn ? 'Select a report from the sidebar to view metrics, compliance, or manage queues.' : 'בחר דוח מהתפריט הצדדי כדי לצפות במדדים, ציות, או לנהל תורים.'}
          </p>
        </div>
        <button onClick={() => setManualRefresh(prev => prev + 1)} disabled={loading} style={{ backgroundColor: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.3)', padding: '8px 16px', borderRadius: '8px', cursor: loading ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 'bold' }}>
          {SVGIcons.Refresh} {isEn ? 'Refresh' : 'רענן'}
        </button>
      </div>

      <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
        
        {/* LEFT: Sidebar Menu */}
        <div style={{ width: '280px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {menuSections.filter(s => s.show).map((section, idx) => (
            <div key={idx} style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)', borderRadius: '12px', border: '1px solid #1e293b', overflow: 'hidden' }}>
              <div style={{ padding: '12px 15px', backgroundColor: 'rgba(255,255,255,0.02)', borderBottom: '1px solid #1e293b', fontSize: '0.75rem', fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {section.title}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {section.reports.map(report => {
                  const isActive = activeReport === report.id;
                  return (
                    <button 
                      key={report.id}
                      onClick={() => setActiveReport(report.id)}
                      style={{ 
                        display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 15px', border: 'none', background: 'transparent', width: '100%', textAlign: isRtl ? 'right' : 'left', cursor: 'pointer', transition: 'all 0.2s',
                        backgroundColor: isActive ? 'rgba(56, 189, 248, 0.1)' : 'transparent',
                        color: isActive ? '#38bdf8' : '#cbd5e1',
                        borderLeft: !isRtl && isActive ? '3px solid #38bdf8' : '3px solid transparent',
                        borderRight: isRtl && isActive ? '3px solid #38bdf8' : '3px solid transparent',
                        fontWeight: isActive ? 'bold' : 'normal'
                      }}
                      onMouseOver={(e) => { if(!isActive) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)'; }}
                      onMouseOut={(e) => { if(!isActive) e.currentTarget.style.backgroundColor = 'transparent'; }}
                    >
                      <span style={{ color: isActive ? '#38bdf8' : '#64748b' }}>{report.icon}</span>
                      {report.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* RIGHT: Detail Viewer */}
        <div style={{ flex: 1, minWidth: '0', backgroundColor: 'rgba(15, 23, 42, 0.4)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
          
          <div style={{ padding: '20px 30px', borderBottom: '1px solid rgba(255,255,255,0.05)', backgroundColor: 'rgba(30, 41, 59, 0.3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
            <h3 style={{ margin: 0, color: '#f8fafc', fontSize: '1.2rem' }}>
              {menuSections.flatMap(s => s.reports).find(r => r.id === activeReport)?.label}
            </h3>

            {/* FILTER TOOLBELT */}
            {!menuSections.flatMap(s => s.reports).find(r => r.id === activeReport)?.isStub && (
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '4px 10px', gap: '8px' }}>
                  <span style={{ color: '#64748b' }}>{SVGIcons.Search}</span>
                  <input type="text" placeholder={isEn ? "Quick filter..." : "חיפוש מהיר..."} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ background: 'transparent', border: 'none', color: '#fff', outline: 'none', width: '130px', fontSize: '0.85rem' }} />
                </div>
                
                {activeReport !== 'gdpr_purge' && (
                  <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '4px 10px', gap: '8px' }}>
                    <span style={{ color: '#64748b' }}>{SVGIcons.Calendar}</span>
                    <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={{ background: 'transparent', border: 'none', color: '#cbd5e1', outline: 'none', fontSize: '0.8rem', cursor: 'pointer' }} />
                    <span style={{ color: '#64748b' }}>-</span>
                    <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} style={{ background: 'transparent', border: 'none', color: '#cbd5e1', outline: 'none', fontSize: '0.8rem', cursor: 'pointer' }} />
                  </div>
                )}

                <button onClick={handleExportCSV} disabled={filteredData.length === 0} style={{ backgroundColor: 'transparent', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.4)', padding: '6px 12px', borderRadius: '8px', cursor: filteredData.length === 0 ? 'not-allowed' : 'pointer', opacity: filteredData.length === 0 ? 0.5 : 1, display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 'bold' }}>
                  {SVGIcons.Download} {isEn ? 'Export CSV' : 'ייצא CSV'}
                </button>
              </div>
            )}
          </div>

          <div style={{ padding: '20px 30px' }}>
            {renderActiveReport()}
          </div>
        </div>

      </div>
    </div>
  );
};

export default ReportsTab;