/**
 * @file Analytics.js
 * @description The Central Intelligence and Performance Hub for CiviWatch.
 * This component aggregates raw report data, shift logs, and QA audit records 
 * to generate real-time metrics with hierarchy-aware actionable counters and zero-filled trend charts.
 * FIX: Applied minWidth and 99% width to ResponsiveContainer to resolve Recharts calculation errors.
 */
import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { supabase } from '../../supabaseClient';
import ThreatLibrary from './ThreatLibrary'; 

const formatTurnaround = (ms, isEn) => {
  if (!ms || ms <= 0) return isEn ? 'N/A' : 'לא זמין';
  const totalMins = Math.floor(ms / 60000);
  const h = Math.floor(totalMins / 60);
  const m = totalMins % 60;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
};

// Calculate 30 days ago to prevent chart overcrowding on default load
const getThirtyDaysAgo = () => {
  const d = new Date();
  d.setDate(d.getDate() - 30);
  return d.toISOString().split('T')[0];
};

const Analytics = ({ reports, isEn, role, stats, userProfile, triggerToast }) => {
  const safeRole = role?.toLowerCase()?.trim() || '';
  const isAdmin = ['ngo admin', 'moderator l2', 'global admin', 'super admin', 'admin'].includes(safeRole);
  const isSuperUser = ['admin', 'super admin', 'system admin', 'global admin'].includes(safeRole);
  const isRtl = !isEn;

  const [activeSubTab, setActiveSubTab] = useState('overview'); 

  // Default to Last 30 Days for clean initial charts
  const [startDate, setStartDate] = useState(getThirtyDaysAgo());
  const [endDate, setEndDate] = useState('');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedTeamMember, setSelectedTeamMember] = useState('all'); 

  const [shiftLogs, setShiftLogs] = useState([]);
  const [qaAudits, setQaAudits] = useState([]);
  const [orgSettings, setOrgSettings] = useState(null); 
  const [orgUsers, setOrgUsers] = useState([]); 
  const [loadingShifts, setLoadingShifts] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);

  const getOperatorInfo = useCallback((userId) => {
    if (!userId) return { name: isEn ? 'Unknown' : 'לא ידוע', email: '', role: 'hidden', manager_id: null };
    
    const user = orgUsers.find(u => u.id === userId || u.user_id === userId);
    if (user) {
      return {
        name: user.display_name || user.email?.split('@')[0] || 'Operator',
        email: user.email || '',
        role: user.role?.toLowerCase()?.trim() || '',
        manager_id: user.manager_id
      };
    }
    return { name: 'Hidden', email: '', role: 'hidden', manager_id: null };
  }, [orgUsers, isEn]);

  const getCalculatedStatus = (report) => {
    let calcStatus = report.status || 'Pending';
    const aStatus = report.ai_vote_status || report.reports?.ai_vote_status;
    if (['New', 'Pending', 'In Progress'].includes(calcStatus) && aStatus && ['Changes Requested', 'Manual Review Required', 'AI Verified', 'AI Rejected'].includes(aStatus)) {
      calcStatus = aStatus;
    }
    return calcStatus;
  };

  const isActionable = useCallback((r, calcStatus) => {
    if (safeRole === 'operator l1') {
      const lastNote = r.additional_info?.length > 0 ? r.additional_info[r.additional_info.length - 1] : null;
      const isAcknowledged = lastNote?.note === 'Task acknowledged by operator';
      if (calcStatus === 'Dismissed' && isAcknowledged) return false;
      return ['Pending', 'In Progress', 'Changes Requested', 'Dismissed'].includes(calcStatus);
    } else if (safeRole === 'moderator l2') {
      if (r._table === 'assignments') return calcStatus === 'Pending Mod Review';
      return ['Pending Review', 'Manual Review Required', 'Network Rejected', 'Pending Appeal', 'Appeal Rejected'].includes(calcStatus);
    } else {
      if (r._table === 'assignments') return ['Pending', 'In Progress', 'Pending Mod Review'].includes(calcStatus);
      return ['New', 'Pending', 'In Progress', 'Changes Requested', 'Pending Review', 'Manual Review Required', 'Pending Network Action', 'Appeal in Progress'].includes(calcStatus);
    }
  }, [safeRole]);

  const metrics = useMemo(() => {
    const filteredForDisplay = (reports || []).filter(r => {
      const d = new Date(r.created_at);
      if (startDate && d < new Date(startDate)) return false;
      if (endDate) {
        const endOfDay = new Date(endDate);
        endOfDay.setHours(23, 59, 59, 999);
        if (d > endOfDay) return false;
      }

      if (safeRole === 'operator l1') {
        const myId = userProfile?.id;
        const isAssigned = r.assigned_to === myId;
        const isSubmitted = r.submitted_by === myId || r.reports?.submitted_by === myId;
        if (!isAssigned && !isSubmitted) return false;
      }
      return true;
    });

    const total = filteredForDisplay.length;
    const verified = filteredForDisplay.filter(r => ['Closed - Verified', 'Verified', 'Takedown Successful', 'Appeal Successful'].includes(r.status)).length;
    
    // Split and accurate actionable counting
    let pendingTriage = 0;
    let pendingAssignments = 0;
    let urgentTriage = 0;

    filteredForDisplay.forEach(r => {
      const calcStatus = getCalculatedStatus(r);
      if (isActionable(r, calcStatus)) {
        if (r._table === 'assignments') {
          pendingAssignments++;
        } else {
          pendingTriage++;
          if (r.priority_tag) urgentTriage++;
        }
      }
    });

    const resolved = filteredForDisplay.filter(r => 
      r.status.includes('Closed') || 
      r.status.includes('Verified') || 
      r.status.includes('Dismissed') || 
      r.status.includes('Rejected') ||
      r.status.includes('Successful')
    ).length;
    
    const actionRate = resolved > 0 ? Math.round((verified / resolved) * 100) : 0;

    const platforms = filteredForDisplay.reduce((acc, r) => {
      const p = r.platform || 'other';
      acc[p] = (acc[p] || 0) + 1;
      return acc;
    }, {});
    const topPlatforms = Object.entries(platforms).sort(([, a], [, b]) => b - a).slice(0, 5);

    const tags = filteredForDisplay.reduce((acc, r) => {
      let currentTags = [];
      if (r.category) currentTags.push(r.category);
      if (r.tags) {
        if (Array.isArray(r.tags)) currentTags = [...currentTags, ...r.tags];
        else if (typeof r.tags === 'string') currentTags = [...currentTags, ...r.tags.split(',').map(t => t.trim())];
      }
      currentTags.forEach(tag => {
        if (tag) acc[tag] = (acc[tag] || 0) + 1;
      });
      return acc;
    }, {});
    const topTags = Object.entries(tags).sort(([, a], [, b]) => b - a).slice(0, 5);

    // Trend Data with Zero-Filling for missing dates
    const trendDataRaw = {};
    filteredForDisplay.forEach(r => {
      const d = new Date(r.created_at);
      const sortKey = d.toISOString().split('T')[0]; 
      const displayKey = `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`;
      if (!trendDataRaw[sortKey]) trendDataRaw[sortKey] = { sortKey, displayDate: displayKey, incoming: 0 };
      trendDataRaw[sortKey].incoming += 1;
    });

    const sortedDates = Object.keys(trendDataRaw).sort();
    if (sortedDates.length > 0) {
      let curr = new Date(sortedDates[0]);
      const end = new Date(sortedDates[sortedDates.length - 1]);
      let failsafe = 0; // Prevent infinite loops if dataset spans years
      
      while (curr <= end && failsafe < 366) {
        const key = curr.toISOString().split('T')[0];
        if (!trendDataRaw[key]) {
          const displayKey = `${curr.getDate().toString().padStart(2, '0')}/${(curr.getMonth() + 1).toString().padStart(2, '0')}`;
          trendDataRaw[key] = { sortKey: key, displayDate: displayKey, incoming: 0 };
        }
        curr.setDate(curr.getDate() + 1);
        failsafe++;
      }
    }

    const trendData = Object.values(trendDataRaw).sort((a, b) => a.sortKey.localeCompare(b.sortKey));

    return { total, verified, pendingTriage, pendingAssignments, urgentTriage, actionRate, topPlatforms, topTags, trendData, filteredReports: filteredForDisplay };
  }, [reports, startDate, endDate, safeRole, userProfile, isActionable]);

  const qaMetrics = useMemo(() => {
    if (!isAdmin || !qaAudits) return { topMistakes: [], leaderboard: [], totalFlags: 0 };

    const filteredQA = qaAudits.filter(qa => {
      const d = new Date(qa.created_at);
      if (startDate && d < new Date(startDate)) return false;
      if (endDate) {
        const endOfDay = new Date(endDate);
        endOfDay.setHours(23, 59, 59, 999);
        if (d > endOfDay) return false;
      }
      return true;
    });

    const mistakeCounts = {};
    filteredQA.forEach(qa => {
      const cat = qa.reason_category || 'Uncategorized';
      mistakeCounts[cat] = (mistakeCounts[cat] || 0) + 1;
    });

    const opStats = {};
    metrics.filteredReports.forEach(r => {
      const targetOp = r.submitted_by;
      if (!targetOp) return;

      const { name, email, role } = getOperatorInfo(targetOp);
      if (role !== 'operator l1') return; 

      if (!opStats[targetOp]) {
        opStats[targetOp] = { id: targetOp, name, email, totalProcessed: 0, qaFlags: 0 };
      }
      if (['Verified', 'Changes Requested', 'Dismissed', 'Closed - Verified', 'Pending Review', 'Network Rejected', 'Appeal Rejected', 'Takedown Successful', 'Appeal Successful'].includes(r.status)) {
        opStats[targetOp].totalProcessed += 1;
      }

      if (['Network Rejected', 'Appeal Rejected'].includes(r.status)) {
        opStats[targetOp].qaFlags += 1;
        mistakeCounts['Network Rejected (External)'] = (mistakeCounts['Network Rejected (External)'] || 0) + 1;
      }
    });

    const topMistakes = Object.entries(mistakeCounts).sort(([, a], [, b]) => b - a).slice(0, 5);

    filteredQA.forEach(qa => {
      const opId = qa.operator_id;
      const { name, email, role } = getOperatorInfo(opId);
      if (role !== 'operator l1') return;

      if (opId && opStats[opId]) {
        opStats[opId].qaFlags += 1;
      } else if (opId) {
        opStats[opId] = { id: opId, name, email, totalProcessed: 0, qaFlags: 1 };
      }
    });

    const leaderboard = Object.values(opStats)
      .map(op => {
        const accuracy = op.totalProcessed > 0 ? Math.max(0, Math.round(((op.totalProcessed - op.qaFlags) / op.totalProcessed) * 100)) : 0;
        return { ...op, accuracy };
      })
      .filter(op => op.totalProcessed > 0 || op.qaFlags > 0)
      .sort((a, b) => b.accuracy - a.accuracy || b.totalProcessed - a.totalProcessed);

    return { topMistakes, leaderboard, totalFlags: filteredQA.length + metrics.filteredReports.filter(r => ['Network Rejected', 'Appeal Rejected'].includes(r.status)).length };
  }, [qaAudits, startDate, endDate, metrics.filteredReports, isAdmin, getOperatorInfo]);

  const modScorecard = useMemo(() => {
    if (safeRole !== 'moderator l2') return null;

    const myAudits = qaAudits.filter(qa => qa.moderator_id === currentUserId || qa.moderator_id === userProfile?.id);
    const totalReviews = myAudits.length;
    const rejections = myAudits.filter(qa => ['Changes Requested', 'Dismissed'].includes(qa.action_taken)).length;
    const rejectionRate = totalReviews > 0 ? Math.round((rejections / totalReviews) * 100) : 0;

    let totalTurnaroundMs = 0;
    let turnaroundCount = 0;

    myAudits.forEach(qa => {
      const report = metrics.filteredReports.find(r => r.id === qa.report_id);
      if (report && report.review_requested_at) {
        const reqTime = new Date(report.review_requested_at).getTime();
        const qaTime = new Date(qa.created_at).getTime();
        if (qaTime > reqTime) {
          totalTurnaroundMs += (qaTime - reqTime);
          turnaroundCount++;
        }
      }
    });

    const avgTurnaround = turnaroundCount > 0 ? (totalTurnaroundMs / turnaroundCount) : 0;

    return { totalReviews, rejectionRate, avgTurnaround };
  }, [qaAudits, currentUserId, userProfile, metrics.filteredReports, safeRole]);

  const teamLeaderboard = useMemo(() => {
    if (!['ngo admin', 'global admin', 'super admin', 'admin'].includes(safeRole)) return [];

    const teams = {};
    
    qaMetrics.leaderboard.forEach(op => {
      const userDef = orgUsers.find(u => u.id === op.id || u.user_id === op.id);
      const managerId = userDef?.manager_id || 'unassigned';

      if (!teams[managerId]) {
        const managerDef = orgUsers.find(u => u.id === managerId || u.user_id === managerId);
        teams[managerId] = {
          id: managerId,
          managerName: managerDef ? (managerDef.display_name || managerDef.email?.split('@')[0]) : (isEn ? 'Direct/Unassigned' : 'ללא מנהל'),
          operatorCount: 0,
          totalProcessed: 0,
          qaFlags: 0
        };
      }

      teams[managerId].operatorCount += 1;
      teams[managerId].totalProcessed += op.totalProcessed;
      teams[managerId].qaFlags += op.qaFlags;
    });

    return Object.values(teams).map(t => {
      const accuracy = t.totalProcessed > 0 ? Math.max(0, Math.round(((t.totalProcessed - t.qaFlags) / t.totalProcessed) * 100)) : 0;
      return { ...t, accuracy };
    }).sort((a, b) => b.accuracy - a.accuracy || b.totalProcessed - a.totalProcessed);

  }, [qaMetrics.leaderboard, orgUsers, safeRole, isEn]);

  const kpiMetrics = useMemo(() => {
    if (!isAdmin || !orgSettings?.kpi_mode_enabled) return [];
    
    const targetRate = orgSettings.kpi_target_per_hour || 10;
    const stats = {};

    shiftLogs.forEach(log => {
      const opId = log.user_id;
      const { name, email, role } = getOperatorInfo(opId);
      if (role !== 'operator l1') return; 

      if (!stats[opId]) stats[opId] = { id: opId, name, email, processed: 0, hours: 0 };
      
      const inTime = new Date(log.clock_in).getTime();
      const outTime = log.clock_out ? new Date(log.clock_out).getTime() : new Date().getTime(); 
      
      let diffHours = (outTime - inTime) / (1000 * 60 * 60);
      if (diffHours > 12) diffHours = 12; 
      
      stats[opId].hours += diffHours;
    });

    metrics.filteredReports.forEach(r => {
      const targetOpId = r.submitted_by;
      if (!targetOpId) return;
      if (r._table === 'assignments' || r.allocated_hours) return; 

      const { name, email, role } = getOperatorInfo(targetOpId);
      if (role !== 'operator l1') return; 

      if (!stats[targetOpId]) {
        stats[targetOpId] = { id: targetOpId, name, email, processed: 0, hours: 0 };
      }

      if (['Verified', 'Changes Requested', 'Dismissed', 'Closed - Verified', 'Pending Review', 'Network Rejected', 'Appeal Rejected', 'Takedown Successful', 'Appeal Successful'].includes(r.status)) {
        stats[targetOpId].processed += 1;
      }
    });

    return Object.values(stats).map(op => {
      const rate = op.hours > 0 ? (op.processed / op.hours) : 0;
      const isUnderperforming = op.hours >= 0.16 && rate < targetRate; 
      const hoursFormatted = `${Math.floor(op.hours)}h ${Math.floor((op.hours % 1) * 60)}m`;

      return {
        ...op,
        rate: rate.toFixed(1),
        target: targetRate,
        hoursFormatted,
        status: op.hours < 0.16 ? 'TBD' : (isUnderperforming ? 'Underperforming' : 'On Target')
      };
    }).filter(op => op.hours > 0 || op.processed > 0).sort((a, b) => b.rate - a.rate);

  }, [shiftLogs, metrics.filteredReports, isAdmin, orgSettings, getOperatorInfo]);

  const myShifts = useMemo(() => {
    if (!currentUserId) return [];
    return shiftLogs.filter(log => log.user_id === currentUserId);
  }, [shiftLogs, currentUserId]);

  const teamShifts = useMemo(() => {
    if (!isAdmin || !currentUserId) return [];
    return shiftLogs.filter(log => {
      if (log.user_id === currentUserId) return false; 
      
      const { role } = getOperatorInfo(log.user_id);
      if (role === 'hidden') return false; 
      
      if (selectedTeamMember !== 'all' && log.user_id !== selectedTeamMember) return false;
      return true;
    });
  }, [shiftLogs, isAdmin, currentUserId, selectedTeamMember, getOperatorInfo]);

  const fetchDashboardExtras = useCallback(async () => {
    if (activeSubTab === 'library') return; 
    
    setLoadingShifts(true);
    try {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError || !authData?.user?.id) {
        setLoadingShifts(false);
        return;
      }
      
      const trueUserId = authData.user.id;
      setCurrentUserId(trueUserId); 

      let orgData = null;
      let validUsers = [];
      let validUserIds = [trueUserId]; 

      if (userProfile?.organization_id) {
        const { data: orgRes } = await supabase.from('organizations').select('kpi_mode_enabled, kpi_target_per_hour').eq('id', userProfile.organization_id).single();
        orgData = orgRes;
      }

      if (isAdmin) {
        let usersQuery = supabase.from('user_profiles').select('id, user_id, display_name, email, role, manager_id');

        if (!isSuperUser && userProfile?.organization_id) {
          usersQuery = usersQuery.eq('organization_id', userProfile.organization_id);
        }

        if (safeRole === 'moderator l2') {
          const checkId = userProfile?.id || trueUserId;
          usersQuery = usersQuery.or(`manager_id.eq.${checkId},manager_id.eq.${trueUserId},user_id.eq.${trueUserId}`);
        }

        const { data: usersRes } = await usersQuery;
        if (usersRes) {
          validUsers = usersRes;
          validUserIds = usersRes.map(u => u.user_id).filter(Boolean);
          if (!validUserIds.includes(trueUserId)) validUserIds.push(trueUserId);
        }
      }

      setOrgSettings(orgData || { kpi_mode_enabled: isSuperUser, kpi_target_per_hour: 10 });
      setOrgUsers(validUsers);

      let shiftQuery = supabase.from('shift_logs').select('*').in('user_id', validUserIds);
      if (startDate) shiftQuery = shiftQuery.gte('clock_in', new Date(startDate).toISOString());
      if (endDate) {
        const endOfDay = new Date(endDate);
        endOfDay.setHours(23, 59, 59, 999);
        shiftQuery = shiftQuery.lte('clock_in', endOfDay.toISOString());
      }
      shiftQuery = shiftQuery.order('clock_in', { ascending: sortOrder === 'asc' }).limit(100); 

      let qaPromise = Promise.resolve({ data: [] });
      if (isAdmin) {
        qaPromise = supabase.from('qa_audits').select('*').in('operator_id', validUserIds);
      }

      const [shiftsRes, qaRes] = await Promise.all([shiftQuery, qaPromise]);
      
      if (!shiftsRes.error && shiftsRes.data) setShiftLogs(shiftsRes.data);
      if (!qaRes.error && qaRes.data) setQaAudits(qaRes.data);
      
    } catch (err) {
      console.error("Unexpected error fetching analytics data:", err);
    } finally {
      setLoadingShifts(false);
    }
  }, [isAdmin, isSuperUser, safeRole, startDate, endDate, sortOrder, activeSubTab, userProfile]);

  useEffect(() => {
    fetchDashboardExtras();
  }, [fetchDashboardExtras]);

  const resetFilters = () => {
    setStartDate('');
    setEndDate('');
    setSortOrder('desc');
    setSelectedTeamMember('all');
  };

  const calculateDuration = (inTime, outTime) => {
    const start = new Date(inTime);
    if (!outTime) {
      const diffHours = (new Date() - start) / (1000 * 60 * 60);
      if (diffHours >= 12) {
        return isEn ? '1h 0m (Auto)' : '1h 0m (אוטומטי)';
      }
      return isEn ? 'Active Shift' : 'משמרת פעילה';
    }
    
    const diff = new Date(outTime) - start;
    let hours = Math.floor(diff / (1000 * 60 * 60));
    let minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
  };

  const formatPunchOut = (punchIn, punchOut) => {
    if (!punchOut) {
      const diffHours = (new Date() - new Date(punchIn)) / (1000 * 60 * 60);
      if (diffHours >= 12) {
        const fakeOut = new Date(new Date(punchIn).getTime() + 60 * 60 * 1000);
        return (
          <span style={{ color: '#f59e0b' }}>
            {fakeOut.toLocaleTimeString(isEn ? 'en-US' : 'he-IL', { hour: '2-digit', minute: '2-digit' })} 
            <span style={{ fontSize: '10px', marginLeft: '4px' }}>(Auto)</span>
          </span>
        );
      }
      return <span style={{ color: '#38bdf8', fontWeight: 'bold' }}>{isEn ? 'Active' : 'פעיל'}</span>;
    }
    
    const inDate = new Date(punchIn).toDateString();
    const outDate = new Date(punchOut).toDateString();
    const outTime = new Date(punchOut).toLocaleTimeString(isEn ? 'en-US' : 'he-IL', { hour: '2-digit', minute: '2-digit' });

    if (inDate !== outDate) {
      return <span>{outTime} <span style={{ fontSize: '0.75rem', color: '#f59e0b', marginLeft: '4px' }}>(+1d)</span></span>;
    }
    
    return outTime;
  };

  const downloadReportsCSV = () => {
    if (!metrics.filteredReports || metrics.filteredReports.length === 0) return;
    const headers = isEn ? ['ID', 'Type', 'Platform', 'Status', 'Language', 'Urgent', 'Category/Tags', 'Created At'] : ['מזהה', 'סוג', 'פלטפורמה', 'סטטוס', 'שפה', 'דחוף', 'קטגוריה/תגיות', 'תאריך יצירה'];
    const rows = metrics.filteredReports.map(r => {
      let combinedTags = [];
      if (r.category) combinedTags.push(r.category);
      if (r.tags && Array.isArray(r.tags)) combinedTags = [...combinedTags, ...r.tags];
      return [
        r.id, r._table === 'assignments' ? 'Assignment' : 'Report', r.platform || 'N/A', r.status, r.language || 'N/A',
        r.priority_tag ? (isEn ? 'Yes' : 'כן') : (isEn ? 'No' : 'לא'), combinedTags.join(' | '), new Date(r.created_at).toLocaleDateString(isEn ? 'en-US' : 'he-IL')
      ];
    });
    const periodString = (startDate || endDate) ? `${startDate || 'Start'}_to_${endDate || 'End'}` : 'All_Time';
    const totalHours = stats?.monthlyHours || stats?.hoursThisWeek || '0.0'; 
    const summaryBlock = isEn ? [['Report Period:', periodString], ['Total Hours Worked:', totalHours], ['Total Tasks in Period:', metrics.filteredReports.length], [], headers] 
      : [['תקופת דוח:', periodString], ['סך שעות עבודה:', totalHours], ['סך משימות בתקופה:', metrics.filteredReports.length], [], headers];
    const csvContent = [...summaryBlock.map(e => e.join(',')), ...rows.map(e => `"${e.join('","')}"`)].join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = `CiviWatch_${isAdmin ? 'Global' : 'Personal'}_Reports_${periodString}.csv`;
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
  };

  const downloadShiftsCSV = (dataToExport, titlePrefix) => {
    if (!dataToExport || dataToExport.length === 0) return;
    const headers = isEn ? ['Operator Name', 'Email', 'Date', 'Punch In', 'Punch Out', 'Duration'] : ['שם מפעיל', 'דוא"ל', 'תאריך', 'שעת כניסה', 'שעת יציאה', 'משך משמרת'];
    const rows = dataToExport.map(log => {
      const { name, email } = getOperatorInfo(log.user_id);
      const date = new Date(log.clock_in).toLocaleDateString(isEn ? 'en-US' : 'he-IL');
      const timeIn = new Date(log.clock_in).toLocaleTimeString(isEn ? 'en-US' : 'he-IL', { hour: '2-digit', minute: '2-digit' });
      const timeOut = log.clock_out ? new Date(log.clock_out).toLocaleTimeString(isEn ? 'en-US' : 'he-IL', { hour: '2-digit', minute: '2-digit' }) : (isEn ? 'Active' : 'פעיל');
      const duration = calculateDuration(log.clock_in, log.clock_out);
      return [name, email, date, timeIn, timeOut, duration];
    });
    const periodString = (startDate || endDate) ? `${startDate || 'Start'}_to_${endDate || 'End'}` : 'All_Time';
    const csvContent = [headers.join(','), ...rows.map(e => `"${e.join('","')}"`)].join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = `CiviWatch_${titlePrefix}_Timecards_${periodString}.csv`;
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
  };

  const cardStyle = { backgroundColor: 'rgba(30, 41, 59, 0.7)', padding: '24px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', color: '#fff', display: 'flex', flexDirection: 'column', justifyContent: 'center' };
  const statTitleStyle = { margin: '0 0 10px 0', color: '#94a3b8', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' };
  const statValueStyle = { fontSize: '36px', fontWeight: 'bold', margin: 0, color: '#f8fafc' };
  const inputStyle = { backgroundColor: '#0f172a', border: '1px solid #334155', color: '#cbd5e1', padding: '8px 12px', borderRadius: '8px', fontSize: '0.85rem', outline: 'none' };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', padding: '12px', border: '1px solid #334155', borderRadius: '8px', color: '#fff', direction: isEn ? 'ltr' : 'rtl' }}>
          <p style={{ margin: '0 0 8px 0', fontWeight: 'bold', color: '#cbd5e1' }}>{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ margin: 0, color: entry.color, fontSize: '13px' }}>{entry.name}: {entry.value}</p>
          ))}
        </div>
      );
    }
    return null;
  };

  const renderBarChart = (dataEntries, totalCount, colorHex, emptyMessage) => {
    if (dataEntries.length === 0) return <div style={{ color: '#64748b', fontSize: '14px' }}>{emptyMessage}</div>;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {dataEntries.map(([label, count]) => {
          const percentage = totalCount > 0 ? Math.round((count / totalCount) * 100) : 0;
          return (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div style={{ width: '100px', fontSize: '13px', color: '#cbd5e1', textTransform: 'capitalize', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={label}>{label}</div>
              <div style={{ flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.5)', height: '12px', borderRadius: '6px', overflow: 'hidden' }}>
                <div style={{ width: `${percentage}%`, height: '100%', backgroundColor: colorHex, borderRadius: '6px', transition: 'width 1s ease-out' }}></div>
              </div>
              <div style={{ width: '40px', textAlign: 'right', fontSize: '14px', fontWeight: 'bold', color: colorHex }}>{count}</div>
            </div>
          );
        })}
      </div>
    );
  };

  const SubTabNav = () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', backgroundColor: 'rgba(15, 23, 42, 0.6)', borderRadius: '12px', padding: '6px', border: '1px solid #334155' }}>
      <button 
        onClick={() => setActiveSubTab('overview')}
        style={{ backgroundColor: activeSubTab === 'overview' ? '#1e293b' : 'transparent', color: activeSubTab === 'overview' ? '#38bdf8' : '#64748b', border: 'none', padding: '8px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s', fontSize: '0.9rem' }}
      >
        📊 {isEn ? 'Overview' : 'סקירה כללית'}
      </button>
      {isAdmin && (
        <button 
          onClick={() => setActiveSubTab('performance')}
          style={{ backgroundColor: activeSubTab === 'performance' ? '#1e293b' : 'transparent', color: activeSubTab === 'performance' ? '#10b981' : '#64748b', border: 'none', padding: '8px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s', fontSize: '0.9rem' }}
        >
          🎯 {isEn ? 'QA & Performance' : 'ביצועים ובקרת איכות'}
        </button>
      )}
      <button 
        onClick={() => setActiveSubTab('shifts')}
        style={{ backgroundColor: activeSubTab === 'shifts' ? '#1e293b' : 'transparent', color: activeSubTab === 'shifts' ? '#f59e0b' : '#64748b', border: 'none', padding: '8px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s', fontSize: '0.9rem' }}
      >
        🕒 {isEn ? 'Timecards' : 'נוכחות ומשמרות'}
      </button>
      {isAdmin && (
        <button 
          onClick={() => setActiveSubTab('library')}
          style={{ backgroundColor: activeSubTab === 'library' ? '#1e293b' : 'transparent', color: activeSubTab === 'library' ? '#a855f7' : '#64748b', border: 'none', padding: '8px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s', fontSize: '0.9rem' }}
        >
          📚 {isEn ? 'Threat Library' : 'מאגר איומים'}
        </button>
      )}
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', animation: 'fadeIn 0.4s ease-out', direction: isEn ? 'ltr' : 'rtl' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '20px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '24px', color: '#fff' }}>
            {isAdmin ? (isEn ? 'Global Intelligence' : 'מודיעין גלובלי') : (isEn ? 'My Performance' : 'הביצועים שלי')}
          </h2>
          <p style={{ margin: '5px 0 0 0', color: '#94a3b8', fontSize: '14px' }}>
            {isAdmin ? (isEn ? 'Organization-wide metrics and historical threat data.' : 'מדדים היסטוריים ומודיעין ברמת הארגון כולו.') : (isEn ? 'Metrics for your assigned reports' : 'מדדים עבור הדיווחים שהוקצו לך')}
          </p>
        </div>
        <SubTabNav />
      </div>

      {activeSubTab === 'library' && isAdmin && (
        <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
          <ThreatLibrary userProfile={userProfile} isEn={isEn} triggerToast={triggerToast} />
        </div>
      )}

      {activeSubTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', animation: 'fadeIn 0.3s ease-out' }}>
          <div style={{ backgroundColor: 'rgba(30, 41, 59, 0.6)', borderRadius: '12px', border: '1px solid #334155', padding: '16px', display: 'flex', flexWrap: 'wrap', gap: '15px', alignItems: 'flex-end' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 'bold' }}>{isEn ? 'From Date' : 'מתאריך'}</label>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={inputStyle} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 'bold' }}>{isEn ? 'To Date' : 'עד תאריך'}</label>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} style={inputStyle} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 'bold' }}>{isEn ? 'Order By' : 'סדר תצוגה'}</label>
              <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} style={inputStyle}>
                <option value="desc">{isEn ? 'Newest First' : 'הכי חדש תחילה'}</option>
                <option value="asc">{isEn ? 'Oldest First' : 'הכי ישן תחילה'}</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: '10px', marginLeft: isEn ? 'auto' : 0, marginRight: isEn ? 0 : 'auto' }}>
              {(startDate !== '' || endDate !== '' || sortOrder !== 'desc') && (
                <button onClick={resetFilters} style={{ backgroundColor: 'transparent', color: '#94a3b8', border: '1px solid #475569', padding: '10px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>
                  {isEn ? 'Reset Dates' : 'אפס סינונים'}
                </button>
              )}
              <button 
                onClick={downloadReportsCSV}
                disabled={metrics.filteredReports.length === 0}
                style={{ backgroundColor: '#10b981', color: 'white', padding: '10px 16px', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: metrics.filteredReports.length === 0 ? 'not-allowed' : 'pointer', boxShadow: '0 4px 10px rgba(16, 185, 129, 0.3)', display: 'flex', alignItems: 'center', gap: '8px', opacity: metrics.filteredReports.length === 0 ? 0.5 : 1 }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                {isEn ? 'Export Task Report' : 'ייצוא דוח משימות'}
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
            <div style={{ ...cardStyle, borderLeft: isEn ? '4px solid #38bdf8' : 'none', borderRight: !isEn ? '4px solid #38bdf8' : 'none' }}>
              <h4 style={statTitleStyle}>{isEn ? 'Pending Triage' : 'טריאז\' בהמתנה'}</h4>
              <div style={statValueStyle}>{metrics.pendingTriage}</div>
              <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '8px' }}><span style={{ color: '#ef4444' }}>{metrics.urgentTriage} {isEn ? 'Urgent' : 'דחופים'}</span></div>
            </div>
            <div style={{ ...cardStyle, borderLeft: isEn ? '4px solid #a855f7' : 'none', borderRight: !isEn ? '4px solid #a855f7' : 'none' }}>
              <h4 style={statTitleStyle}>{isEn ? 'Pending Assignments' : 'משימות בהמתנה'}</h4>
              <div style={statValueStyle}>{metrics.pendingAssignments}</div>
              <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '8px' }}>{isAdmin ? (isEn ? 'Active across team' : 'פעילות בצוות') : (isEn ? 'Assigned to you' : 'הוקצו לך')}</div>
            </div>
            <div style={{ ...cardStyle, borderLeft: isEn ? '4px solid #10b981' : 'none', borderRight: !isEn ? '4px solid #10b981' : 'none' }}>
              <h4 style={statTitleStyle}>{isEn ? 'Action Rate' : 'שיעור פעולה מוצלח'}</h4>
              <div style={statValueStyle}>{metrics.actionRate}%</div>
              <div style={{ fontSize: '12px', color: '#10b981', marginTop: '8px' }}>{isAdmin ? (isEn ? 'Across organization' : 'בכל רחבי הארגון') : (isEn ? 'Your accuracy' : 'הדיוק שלך')}</div>
            </div>
            <div style={{ ...cardStyle, borderLeft: isEn ? '4px solid #8b5cf6' : 'none', borderRight: !isEn ? '4px solid #8b5cf6' : 'none' }}>
              <h4 style={statTitleStyle}>{isAdmin ? (isEn ? 'Total Processed' : 'סך הכל טופלו') : (isEn ? 'Resolved by Me' : 'טופלו על ידי')}</h4>
              <div style={statValueStyle}>{metrics.verified}</div>
              <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '8px' }}>{isAdmin ? (isEn ? 'Across all operators' : 'על ידי כל המפעילים') : (isEn ? 'Total verified reports' : 'סך הדיווחים שאומתו')}</div>
            </div>
          </div>

          <div style={{ ...cardStyle, padding: '30px', minWidth: 0 }}>
            <h4 style={{ ...statTitleStyle, marginBottom: '20px' }}>{isEn ? 'Daily Ingestion Trend' : 'מגמת דיווחים יומית'}</h4>
            <div style={{ height: '300px', width: '100%', minWidth: 0, direction: 'ltr' }}>
              {metrics.trendData.length > 0 ? (
                <ResponsiveContainer width="99%" height="100%" minHeight={300}>
                  <LineChart data={metrics.trendData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                    <XAxis dataKey="displayDate" stroke="#64748b" fontSize={12} tickMargin={10} />
                    <YAxis stroke="#64748b" fontSize={12} allowDecimals={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                    <Line type="monotone" name={isEn ? 'Total Volume' : 'נפח כולל'} dataKey="incoming" stroke="#38bdf8" strokeWidth={3} dot={{ r: 4, fill: '#0f172a', strokeWidth: 2 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>{isEn ? 'Not enough data.' : 'אין מספיק נתונים.'}</div>
              )}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '20px' }}>
            <div style={{ ...cardStyle }}>
              <h4 style={{ ...statTitleStyle, marginBottom: '25px' }}>{isEn ? 'Volume by Platform' : 'נפח לפי פלטפורמה'}</h4>
              {renderBarChart(metrics.topPlatforms, metrics.total, '#1f6feb', isEn ? 'No platform data.' : 'אין נתוני פלטפורמה.')}
            </div>
            <div style={{ ...cardStyle }}>
              <h4 style={{ ...statTitleStyle, marginBottom: '25px' }}>{isEn ? 'Volume by Category' : 'נפח לפי קטגוריה'}</h4>
              {renderBarChart(metrics.topTags, metrics.total, '#8b5cf6', isEn ? 'No category data.' : 'אין נתוני קטגוריות.')}
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'performance' && isAdmin && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', animation: 'fadeIn 0.3s ease-out' }}>
          
          <div style={{ backgroundColor: 'rgba(30, 41, 59, 0.6)', borderRadius: '12px', border: '1px solid #334155', padding: '16px', display: 'flex', flexWrap: 'wrap', gap: '15px', alignItems: 'flex-end' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 'bold' }}>{isEn ? 'From Date' : 'מתאריך'}</label>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={inputStyle} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 'bold' }}>{isEn ? 'To Date' : 'עד תאריך'}</label>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} style={inputStyle} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 'bold' }}>{isEn ? 'Order By' : 'סדר תצוגה'}</label>
              <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} style={inputStyle}>
                <option value="desc">{isEn ? 'Newest First' : 'הכי חדש תחילה'}</option>
                <option value="asc">{isEn ? 'Oldest First' : 'הכי ישן תחילה'}</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: '10px', marginLeft: isEn ? 'auto' : 0, marginRight: isEn ? 0 : 'auto' }}>
              {(startDate !== '' || endDate !== '' || sortOrder !== 'desc') && (
                <button onClick={resetFilters} style={{ backgroundColor: 'transparent', color: '#94a3b8', border: '1px solid #475569', padding: '10px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>
                  {isEn ? 'Reset Dates' : 'אפס סינונים'}
                </button>
              )}
            </div>
          </div>

          {safeRole === 'moderator l2' && modScorecard && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
              <div style={{ ...cardStyle, borderLeft: isEn ? '4px solid #a855f7' : 'none', borderRight: !isEn ? '4px solid #a855f7' : 'none' }}>
                <h4 style={statTitleStyle}>{isEn ? 'My Total QA Reviews' : 'סך בדיקות QA שלי'}</h4>
                <div style={statValueStyle}>{modScorecard.totalReviews}</div>
                <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '8px' }}>{isEn ? 'Tasks reviewed this period' : 'משימות שנבדקו בתקופה זו'}</div>
              </div>
              <div style={{ ...cardStyle, borderLeft: isEn ? '4px solid #f43f5e' : 'none', borderRight: !isEn ? '4px solid #f43f5e' : 'none' }}>
                <h4 style={statTitleStyle}>{isEn ? 'My Rejection Rate' : 'אחוז דחיות שלי (QA)'}</h4>
                <div style={statValueStyle}>{modScorecard.rejectionRate}%</div>
                <div style={{ fontSize: '12px', color: '#f43f5e', marginTop: '8px' }}>{isEn ? 'Returned to operators for fixes' : 'הוחזרו למפעילים לתיקון'}</div>
              </div>
              <div style={{ ...cardStyle, borderLeft: isEn ? '4px solid #38bdf8' : 'none', borderRight: !isEn ? '4px solid #38bdf8' : 'none' }}>
                <h4 style={statTitleStyle}>{isEn ? 'Avg Turnaround Time' : 'זמן טיפול ממוצע'}</h4>
                <div style={statValueStyle}>{formatTurnaround(modScorecard.avgTurnaround, isEn)}</div>
                <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '8px' }}>{isEn ? 'From operator submission to QA decision' : 'מרגע הגשת המפעיל ועד החלטת מנהל'}</div>
              </div>
            </div>
          )}

          {['ngo admin', 'global admin', 'super admin', 'admin'].includes(safeRole) && teamLeaderboard && teamLeaderboard.length > 0 && (
            <div style={{ ...cardStyle, justifyContent: 'flex-start' }}>
              <h4 style={{ ...statTitleStyle, marginBottom: '20px' }}>{isEn ? 'Team vs. Team Performance' : 'ביצועים בין צוותים'}</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', borderBottom: '1px solid #334155', paddingBottom: '10px', marginBottom: '10px', color: '#94a3b8', fontSize: '0.75rem', textTransform: 'uppercase', gap: '10px' }}>
                <div>{isEn ? 'Team Leader' : 'ראש צוות'}</div>
                <div style={{ textAlign: 'center' }}>{isEn ? 'Operators' : 'מפעילים'}</div>
                <div style={{ textAlign: 'center' }}>{isEn ? 'Total Processed' : 'טופלו סה"כ'}</div>
                <div style={{ textAlign: 'center' }}>{isEn ? 'QA Flags' : 'הערות QA'}</div>
                <div style={{ textAlign: 'right' }}>{isEn ? 'Team Accuracy' : 'דיוק קבוצתי'}</div>
              </div>
              <div style={{ maxHeight: '250px', overflowY: 'auto', paddingRight: isRtl ? '0' : '10px', paddingLeft: isRtl ? '10px' : '0' }}>
                {teamLeaderboard.map(team => (
                  <div key={team.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.02)', gap: '10px' }}>
                    <div style={{ fontSize: '0.9rem', color: '#cbd5e1', fontWeight: 'bold' }}>{team.managerName}</div>
                    <div style={{ textAlign: 'center', color: '#64748b' }}>{team.operatorCount}</div>
                    <div style={{ textAlign: 'center', fontWeight: 'bold', color: '#38bdf8' }}>{team.totalProcessed}</div>
                    <div style={{ textAlign: 'center', color: team.qaFlags > 0 ? '#f43f5e' : '#10b981', fontWeight: 'bold' }}>{team.qaFlags}</div>
                    <div style={{ textAlign: 'right', color: team.accuracy >= 90 ? '#10b981' : team.accuracy >= 75 ? '#f59e0b' : '#f43f5e', fontWeight: 'bold' }}>{team.accuracy}%</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
            <div style={{ ...cardStyle }}>
              <h4 style={{ ...statTitleStyle, marginBottom: '25px', display: 'flex', justifyContent: 'space-between' }}>
                <span>{isEn ? 'Top Operator Mistakes' : 'השגיאות הנפוצות ביותר'}</span>
                <span style={{ color: '#ef4444', fontWeight: 'bold' }}>{qaMetrics.totalFlags} {isEn ? 'Total Flags' : 'סך הכל הערות'}</span>
              </h4>
              {renderBarChart(qaMetrics.topMistakes, qaMetrics.totalFlags, '#f43f5e', isEn ? 'No QA flags recorded for this period.' : 'לא נרשמו הערות בקרת איכות לתקופה זו.')}
            </div>

            <div style={{ ...cardStyle, justifyContent: 'flex-start' }}>
              <h4 style={{ ...statTitleStyle, marginBottom: '20px' }}>{isEn ? 'Operator Accuracy Leaderboard' : 'טבלת דיוק מפעילים'}</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '2.5fr 1fr 1fr 1fr', borderBottom: '1px solid #334155', paddingBottom: '10px', marginBottom: '10px', color: '#94a3b8', fontSize: '0.75rem', textTransform: 'uppercase', gap: '10px' }}>
                <div>{isEn ? 'Operator' : 'מפעיל'}</div>
                <div style={{ textAlign: 'center' }}>{isEn ? 'Processed' : 'טופלו'}</div>
                <div style={{ textAlign: 'center' }}>{isEn ? 'QA Flags' : 'הערות QA'}</div>
                <div style={{ textAlign: 'right' }}>{isEn ? 'Accuracy' : 'דיוק'}</div>
              </div>
              <div style={{ maxHeight: '250px', overflowY: 'auto', paddingRight: isRtl ? '0' : '10px', paddingLeft: isRtl ? '10px' : '0' }}>
                {qaMetrics.leaderboard.length === 0 ? (
                  <div style={{ color: '#64748b', fontSize: '14px', textAlign: 'center', padding: '40px 0' }}>{isEn ? 'No operator activity detected.' : 'אין נתוני פעילות מפעילים.'}</div>
                ) : (
                  qaMetrics.leaderboard.map(op => (
                    <div key={op.id} style={{ display: 'grid', gridTemplateColumns: '2.5fr 1fr 1fr 1fr', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.02)', gap: '10px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '0.85rem', color: '#cbd5e1', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={op.name}>{op.name}</span>
                        <span style={{ fontSize: '0.65rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={op.email}>{op.email || '—'}</span>
                      </div>
                      <div style={{ textAlign: 'center', fontWeight: 'bold', color: '#94a3b8' }}>{op.totalProcessed}</div>
                      <div style={{ textAlign: 'center', color: op.qaFlags > 0 ? '#f43f5e' : '#10b981', fontWeight: 'bold' }}>{op.qaFlags}</div>
                      <div style={{ textAlign: 'right', color: op.accuracy >= 90 ? '#10b981' : op.accuracy >= 75 ? '#f59e0b' : '#f43f5e', fontWeight: 'bold' }}>{op.accuracy}%</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {orgSettings?.kpi_mode_enabled && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
              <div style={{ ...cardStyle, flex: '2 1 600px' }}>
                <h4 style={{ ...statTitleStyle, marginBottom: '20px' }}>{isEn ? 'Operator Efficiency (KPI Tracker)' : 'מעקב יעילות מפעילים (KPI)'}</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr 1fr 1.5fr', borderBottom: '1px solid #334155', paddingBottom: '10px', marginBottom: '10px', color: '#94a3b8', fontSize: '0.75rem', textTransform: 'uppercase', gap: '10px' }}>
                  <div>{isEn ? 'Operator' : 'מפעיל'}</div>
                  <div style={{ textAlign: 'center' }}>{isEn ? 'Active Time' : 'זמן עבודה'}</div>
                  <div style={{ textAlign: 'center' }}>{isEn ? 'Triage Processed' : 'טופלו (טריאז\')'}</div>
                  <div style={{ textAlign: 'center' }}>{isEn ? 'Current Rate' : 'קצב נוכחי'}</div>
                  <div style={{ textAlign: 'center' }}>{isEn ? 'Target Rate' : 'קצב יעד'}</div>
                  <div style={{ textAlign: 'right' }}>{isEn ? 'Status' : 'סטטוס'}</div>
                </div>
                <div style={{ maxHeight: '250px', overflowY: 'auto', paddingRight: isRtl ? '0' : '10px', paddingLeft: isRtl ? '10px' : '0' }}>
                  {kpiMetrics.length === 0 ? (
                    <div style={{ color: '#64748b', fontSize: '14px', textAlign: 'center', padding: '40px 0' }}>{isEn ? 'No KPI data available for this period.' : 'אין נתוני KPI לתקופה זו.'}</div>
                  ) : (
                    kpiMetrics.map(op => (
                      <div key={op.id} style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr 1fr 1.5fr', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.02)', gap: '10px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontSize: '0.85rem', color: '#cbd5e1', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={op.name}>{op.name}</span>
                          <span style={{ fontSize: '0.65rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={op.email}>{op.email || '—'}</span>
                        </div>
                        <div style={{ textAlign: 'center', color: '#94a3b8', fontFamily: 'monospace' }}>{op.hoursFormatted}</div>
                        <div style={{ textAlign: 'center', fontWeight: 'bold', color: '#38bdf8' }}>{op.processed}</div>
                        <div style={{ textAlign: 'center', fontWeight: 'bold', color: op.status === 'Underperforming' ? '#f43f5e' : (op.status === 'On Target' ? '#10b981' : '#cbd5e1') }}>
                          {op.rate} <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 'normal' }}>/hr</span>
                        </div>
                        <div style={{ textAlign: 'center', color: '#94a3b8' }}>{op.target} <span style={{ fontSize: '10px' }}>/hr</span></div>
                        <div style={{ textAlign: 'right' }}>
                          {op.status === 'TBD' ? (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px', color: '#94a3b8', fontSize: '12px' }}>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                              {isEn ? 'Grace Period' : 'בהמתנה'}
                            </div>
                          ) : op.status === 'Underperforming' ? (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px', color: '#f43f5e', fontWeight: 'bold', fontSize: '12px' }}>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                              {isEn ? 'Under Target' : 'מתחת ליעד'}
                            </div>
                          ) : (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px', color: '#10b981', fontWeight: 'bold', fontSize: '12px' }}>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                              {isEn ? 'On Target' : 'עומד ביעד'}
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div style={{ ...cardStyle, flex: '1 1 300px', justifyContent: 'flex-start' }}>
                <h4 style={{ ...statTitleStyle, marginBottom: '25px', display: 'flex', justifyContent: 'space-between' }}>
                  <span>{isEn ? 'Top Performers (Reports/Hour)' : 'המבצעים המובילים (דיווחים/שעה)'}</span>
                  <span style={{ color: '#10b981', fontWeight: 'bold', textTransform: 'none' }}>{isEn ? 'Target:' : 'יעד:'} {orgSettings.kpi_target_per_hour}/hr</span>
                </h4>
                {renderBarChart(
                  kpiMetrics.slice(0, 5).map(op => [op.name, parseFloat(op.rate)]), 
                  kpiMetrics.length > 0 ? Math.max(...kpiMetrics.map(op => parseFloat(op.rate)), orgSettings.kpi_target_per_hour || 1) : 1, 
                  '#10b981', 
                  isEn ? 'No KPI data available for this period.' : 'אין נתוני KPI לתקופה זו.'
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {activeSubTab === 'shifts' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', animation: 'fadeIn 0.3s ease-out' }}>
          
          <div style={{ backgroundColor: 'rgba(30, 41, 59, 0.6)', borderRadius: '12px', border: '1px solid #334155', padding: '16px', display: 'flex', flexWrap: 'wrap', gap: '15px', alignItems: 'flex-end' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 'bold' }}>{isEn ? 'From Date' : 'מתאריך'}</label>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={inputStyle} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 'bold' }}>{isEn ? 'To Date' : 'עד תאריך'}</label>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} style={inputStyle} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 'bold' }}>{isEn ? 'Order By' : 'סדר תצוגה'}</label>
              <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} style={inputStyle}>
                <option value="desc">{isEn ? 'Newest First' : 'הכי חדש תחילה'}</option>
                <option value="asc">{isEn ? 'Oldest First' : 'הכי ישן תחילה'}</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: '10px', marginLeft: isEn ? 'auto' : 0, marginRight: isEn ? 0 : 'auto' }}>
              {(startDate !== '' || endDate !== '' || sortOrder !== 'desc') && (
                <button onClick={resetFilters} style={{ backgroundColor: 'transparent', color: '#94a3b8', border: '1px solid #475569', padding: '10px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>
                  {isEn ? 'Reset Dates' : 'אפס סינונים'}
                </button>
              )}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: isAdmin ? '1fr 1.5fr' : '1fr', gap: '20px', alignItems: 'flex-start' }}>
            <div style={{ backgroundColor: 'rgba(15, 23, 42, 0.4)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
              <div style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
                <h3 style={{ margin: 0, color: '#fff', fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  🕒 {isEn ? 'My Shift History' : 'היסטוריית המשמרות שלי'}
                </h3>
                <button 
                  onClick={() => downloadShiftsCSV(myShifts, 'Personal')}
                  disabled={myShifts.length === 0}
                  style={{ backgroundColor: 'transparent', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.3)', padding: '6px 12px', borderRadius: '6px', fontWeight: 'bold', cursor: myShifts.length === 0 ? 'not-allowed' : 'pointer', fontSize: '0.75rem', transition: 'all 0.2s', opacity: myShifts.length === 0 ? 0.5 : 1 }}
                >
                  {isEn ? 'Export Mine' : 'ייצוא יומן אישי'}
                </button>
              </div>

              <div style={{ padding: '20px', maxHeight: '500px', overflowY: 'auto' }}>
                {loadingShifts ? (
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100px', color: '#38bdf8' }}>{isEn ? 'Loading...' : 'טוען...'}</div>
                ) : myShifts.length === 0 ? (
                  <div style={{ textAlign: 'center', color: '#64748b', padding: '30px 0' }}>{isEn ? 'No shift logs found.' : 'לא נמצאו רישומי משמרות.'}</div>
                ) : (
                  <div style={{ color: '#fff', minWidth: '400px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', color: '#94a3b8', borderBottom: '1px solid #334155', paddingBottom: '10px', marginBottom: '10px', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                      <div>{isEn ? 'Date' : 'תאריך'}</div>
                      <div>{isEn ? 'Punch In' : 'כניסה'}</div>
                      <div>{isEn ? 'Punch Out' : 'יציאה'}</div>
                      <div style={{ textAlign: 'right' }}>{isEn ? 'Duration' : 'משך זמן'}</div>
                    </div>
                    {myShifts.map(log => (
                      <div key={log.id} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                        <div style={{ fontSize: '0.85rem' }}>{new Date(log.clock_in).toLocaleDateString(isEn ? 'en-US' : 'he-IL', { month: 'short', day: 'numeric' })}</div>
                        <div style={{ color: '#10b981', fontSize: '0.85rem' }}>{new Date(log.clock_in).toLocaleTimeString(isEn ? 'en-US' : 'he-IL', { hour: '2-digit', minute: '2-digit' })}</div>
                        <div style={{ color: log.clock_out ? '#94a3b8' : '#38bdf8', fontWeight: log.clock_out ? 'normal' : 'bold', fontSize: '0.85rem' }}>{formatPunchOut(log.clock_in, log.clock_out)}</div>
                        <div style={{ color: '#a855f7', fontFamily: 'monospace', fontSize: '0.9rem', textAlign: 'right' }}>{calculateDuration(log.clock_in, log.clock_out)}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {isAdmin && (
              <div style={{ backgroundColor: 'rgba(15, 23, 42, 0.4)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
                <div style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
                  <h3 style={{ margin: 0, color: '#fff', fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    👥 {isEn ? 'Team Timecards' : 'נוכחות צוות'}
                  </h3>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <select 
                      value={selectedTeamMember} 
                      onChange={(e) => setSelectedTeamMember(e.target.value)} 
                      style={{ backgroundColor: '#020617', border: '1px solid #334155', color: '#cbd5e1', padding: '6px 12px', borderRadius: '6px', fontSize: '0.8rem', outline: 'none', maxWidth: '200px' }}
                    >
                      <option value="all">{isEn ? 'All Team Members' : 'כל חברי הצוות'}</option>
                      {orgUsers.filter(u => u.user_id !== currentUserId).map(u => (
                        <option key={u.user_id} value={u.user_id}>{u.display_name || u.email?.split('@')[0]}</option>
                      ))}
                    </select>
                    <button 
                      onClick={() => downloadShiftsCSV(teamShifts, 'Team')}
                      disabled={teamShifts.length === 0}
                      style={{ backgroundColor: 'rgba(168, 85, 247, 0.1)', color: '#a855f7', border: '1px solid rgba(168, 85, 247, 0.3)', padding: '6px 12px', borderRadius: '6px', fontWeight: 'bold', cursor: teamShifts.length === 0 ? 'not-allowed' : 'pointer', fontSize: '0.75rem', transition: 'all 0.2s', opacity: teamShifts.length === 0 ? 0.5 : 1 }}
                    >
                      📤 {isEn ? 'Export Team' : 'ייצוא צוות'}
                    </button>
                  </div>
                </div>

                <div style={{ padding: '20px', maxHeight: '500px', overflowY: 'auto' }}>
                  {loadingShifts ? (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100px', color: '#38bdf8' }}>{isEn ? 'Loading...' : 'טוען...'}</div>
                  ) : teamShifts.length === 0 ? (
                    <div style={{ textAlign: 'center', color: '#64748b', padding: '30px 0' }}>{isEn ? 'No team shift logs found.' : 'לא נמצאו רישומי נוכחות לצוות.'}</div>
                  ) : (
                    <div style={{ color: '#fff', minWidth: '550px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr 1fr', color: '#94a3b8', borderBottom: '1px solid #334155', paddingBottom: '10px', marginBottom: '10px', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                        <div>{isEn ? 'Operator' : 'מפעיל'}</div>
                        <div>{isEn ? 'Date' : 'תאריך'}</div>
                        <div>{isEn ? 'Punch In' : 'כניסה'}</div>
                        <div>{isEn ? 'Punch Out' : 'יציאה'}</div>
                        <div style={{ textAlign: 'right' }}>{isEn ? 'Duration' : 'משך זמן'}</div>
                      </div>
                      {teamShifts.map(log => {
                        const { name, email } = getOperatorInfo(log.user_id);
                        return (
                          <div key={log.id} style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr 1fr', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                              <span style={{ fontSize: '0.85rem', color: '#cbd5e1', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={name}>{name}</span>
                              <span style={{ fontSize: '0.65rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={email}>{email || '—'}</span>
                            </div>
                            <div style={{ fontSize: '0.85rem' }}>{new Date(log.clock_in).toLocaleDateString(isEn ? 'en-US' : 'he-IL', { month: 'short', day: 'numeric' })}</div>
                            <div style={{ color: '#10b981', fontSize: '0.85rem' }}>{new Date(log.clock_in).toLocaleTimeString(isEn ? 'en-US' : 'he-IL', { hour: '2-digit', minute: '2-digit' })}</div>
                            <div style={{ color: log.clock_out ? '#94a3b8' : '#38bdf8', fontWeight: log.clock_out ? 'normal' : 'bold', fontSize: '0.85rem' }}>{formatPunchOut(log.clock_in, log.clock_out)}</div>
                            <div style={{ color: '#a855f7', fontFamily: 'monospace', fontSize: '0.9rem', textAlign: 'right' }}>{calculateDuration(log.clock_in, log.clock_out)}</div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;