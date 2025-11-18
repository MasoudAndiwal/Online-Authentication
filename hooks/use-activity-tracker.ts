/**
 * Activity Tracker Hook
 * Tracks user activity and handles auto-logout after inactivity
 */

'use client';

import { useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { updateActivity, isSessionExpired, getSession, clearSession } from '@/lib/auth/session';

const CHECK_INTERVAL = 60 * 1000; // Check every minute

/**
 * Hook to track user activity and auto-logout after inactivity
 * 
 * Features:
 * - Tracks mouse movements, keyboard events, and clicks
 * - Updates last activity timestamp
 * - Checks for session expiration periodically
 * - Auto-logout after 30 minutes of inactivity
 * 
 * Requirements: 10.4 - Auto-logout after inactivity
 */
export function useActivityTracker() {
  const router = useRouter();

  /**
   * Handle user activity
   */
  const handleActivity = useCallback(() => {
    updateActivity();
  }, []);

  /**
   * Check if session has expired
   */
  const checkSessionExpiration = useCallback(() => {
    const session = getSession();
    
    if (!session) {
      // Session doesn't exist, redirect to login
      router.push('/login');
      return;
    }

    if (isSessionExpired(session)) {
      // Session expired, clear and redirect
      clearSession();
      router.push('/login?reason=inactivity');
    }
  }, [router]);

  useEffect(() => {
    // Activity event listeners
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    
    events.forEach(event => {
      window.addEventListener(event, handleActivity);
    });

    // Check session expiration periodically
    const intervalId = setInterval(checkSessionExpiration, CHECK_INTERVAL);

    // Cleanup
    return () => {
      events.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
      clearInterval(intervalId);
    };
  }, [handleActivity, checkSessionExpiration]);
}
