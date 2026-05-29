import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';

export const useShiftTimer = (userProfile, isEn, triggerToast) => {
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [shiftSeconds, setShiftSeconds] = useState(0); 
  const [sessionDBId, setSessionDBId] = useState(null);
  const [shiftStartTime, setShiftStartTime] = useState(null); 
  const [stats, setStats] = useState({ actionsToday: 0, hoursThisWeek: 0 });

  // 1. RECOVERY LOGIC: Check for existing active shift on refresh
  useEffect(() => {
    const recoverActiveShift = async () => {
      if (!userProfile?.user_id) return;
      
      try {
        const { data } = await supabase
          .from('shift_logs')
          .select('*')
          .eq('user_id', userProfile.user_id)
          .is('clock_out', null)
          .order('clock_in', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (data && data.id) {
          const startTime = new Date(data.clock_in).getTime();
          const now = new Date().getTime();
          const diffSeconds = Math.floor((now - startTime) / 1000);

          // 12-HOUR AUTO-CAP LOGIC (Frontend failsafe)
          if (diffSeconds > 12 * 3600) {
            const fakeClockOut = new Date(startTime + 3600 * 1000).toISOString();
            
            await supabase.from('shift_logs').update({ 
              clock_out: fakeClockOut,
              duration_minutes: 60 // Save exactly 60 minutes to the DB
            }).eq('id', data.id);
            
            console.log("Stale shift detected and auto-capped at 1 hour.");
            setIsClockedIn(false);
            
          } else {
            // Resume valid active shift smoothly
            setSessionDBId(data.id);
            setShiftStartTime(startTime);
            setShiftSeconds(diffSeconds);
            setIsClockedIn(true);
          }
        }
      } catch (err) {
        console.error("Shift recovery error:", err);
      }
    };
    
    recoverActiveShift();
  }, [userProfile]);

  // 2. THE TICKER
  useEffect(() => {
    let timer = null;
    if (isClockedIn) {
      timer = setInterval(() => setShiftSeconds((prev) => prev + 1), 1000);
    } else {
      clearInterval(timer);
    }
    return () => clearInterval(timer);
  }, [isClockedIn]);

  // 3. STATS MATRICES
  const fetchUserStats = useCallback(async () => {
    if (!userProfile) return;
    try {
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);

      const { data: actionsData } = await supabase
        .from('reports')
        .select('id')
        .eq('submitted_by', userProfile.id)
        .gte('created_at', startOfToday.toISOString());

      const lastWeek = new Date();
      lastWeek.setDate(lastWeek.getDate() - 7);
      
      const { data: sessions } = await supabase
        .from('shift_logs')
        .select('clock_in, clock_out, duration_minutes')
        .eq('user_id', userProfile.user_id)
        .gte('clock_in', lastWeek.toISOString())
        .not('clock_out', 'is', null);

      let totalHours = 0;
      if (sessions) {
        sessions.forEach(s => {
          // Use the clean DB duration if it exists, otherwise fallback to timestamp math
          if (s.duration_minutes) {
            totalHours += (s.duration_minutes / 60);
          } else {
            totalHours += (new Date(s.clock_out) - new Date(s.clock_in)) / (1000 * 60 * 60);
          }
        });
      }

      setStats({
        actionsToday: actionsData?.length || 0,
        hoursThisWeek: totalHours.toFixed(1)
      });
    } catch (err) {
      console.error("Stats error:", err);
    }
  }, [userProfile]);

  // 4. MANUAL TRIGGER CONTROLS
  const handleClockIn = async () => {
    try {
      const startTime = new Date();
      
      const { data, error } = await supabase
        .from('shift_logs') 
        .insert([{ 
          user_id: userProfile.user_id, 
          clock_in: startTime.toISOString()
        }])
        .select().single();
      
      if (error) throw error;
      
      setSessionDBId(data.id);
      setShiftStartTime(startTime.getTime());
      setShiftSeconds(0);
      setIsClockedIn(true);
      if (triggerToast) triggerToast(isEn ? 'Clocked In' : 'כניסה למשמרת');
    } catch (error) {
      if (triggerToast) triggerToast(error.message, 'error');
    }
  };

  const handleClockOut = async () => {
    if (!sessionDBId || !shiftStartTime) return;
    try {
      const now = new Date();
      // Calculate exact duration in minutes for the database
      const durationMinutes = Math.round((now.getTime() - shiftStartTime) / 60000);

      await supabase.from('shift_logs')
        .update({ 
          clock_out: now.toISOString(),
          duration_minutes: durationMinutes 
        })
        .eq('id', sessionDBId);
      
      setIsClockedIn(false);
      setShiftSeconds(0);
      setSessionDBId(null);
      setShiftStartTime(null);
      fetchUserStats();
      if (triggerToast) triggerToast(isEn ? 'Clocked Out' : 'יציאה ממשמרת');
    } catch (error) {
      if (triggerToast) triggerToast('Error clocking out', 'error');
    }
  };

  const formatTime = (totalSeconds) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const shiftDuration = formatTime(shiftSeconds);

  return { isClockedIn, shiftDuration, stats, handleClockIn, handleClockOut, fetchUserStats };
};