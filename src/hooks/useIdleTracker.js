import { useEffect, useRef } from 'react';

export const useIdleTracker = (idleTimeoutMinutes, isClockedIn, handleLogout) => {
  const timeoutRef = useRef(null);

  useEffect(() => {
    // If they aren't clocked in, we don't need to strictly monitor them for shift-capping
    if (!isClockedIn) return;

    const handleAutoLogout = async () => {
      console.log(`User idle for ${idleTimeoutMinutes} minutes. Auto-logging out.`);
      // This calls the Dashboard's logout function, which safely clocks them out and kills the session
      await handleLogout(true); 
    };

    const resetTimer = () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      // Default to 60 minutes if the org setting is missing
      const timeoutMs = (idleTimeoutMinutes || 60) * 60 * 1000; 
      timeoutRef.current = setTimeout(handleAutoLogout, timeoutMs);
    };

    // Listen for human interaction
    const events = ['mousemove', 'keydown', 'mousedown', 'scroll', 'touchstart'];
    events.forEach(event => window.addEventListener(event, resetTimer));
    
    resetTimer(); // Start the clock

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      events.forEach(event => window.removeEventListener(event, resetTimer));
    };
  }, [idleTimeoutMinutes, isClockedIn, handleLogout]);

  return null;
};