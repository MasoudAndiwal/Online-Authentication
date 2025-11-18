/**
 * Read-Only Access Hook
 * Enforces read-only access for student users
 * Prevents modification attempts and provides clear messaging
 */

'use client';

import { useCallback } from 'react';
import { useAuth } from './use-auth';
import { toast } from './use-toast';

interface UseReadOnlyReturn {
  isReadOnly: boolean;
  preventModification: (action: string) => void;
  showReadOnlyMessage: () => void;
  canModify: boolean;
}

/**
 * Hook to enforce read-only access for students
 * 
 * Features:
 * - Prevents all edit/delete actions
 * - Shows clear messaging for read-only data
 * - Provides helper functions to block modifications
 * 
 * Requirements: 10.3, 10.4
 */
export function useReadOnly(): UseReadOnlyReturn {
  const { user } = useAuth();

  // Students have read-only access
  const isReadOnly = user?.role === 'STUDENT';
  const canModify = !isReadOnly;

  /**
   * Prevent modification and show appropriate message
   */
  const preventModification = useCallback((action: string) => {
    if (isReadOnly) {
      toast({
        title: 'Action Not Allowed',
        description: `You cannot ${action}. Students have read-only access to attendance data.`,
        variant: 'destructive',
      });
      return;
    }
  }, [isReadOnly]);

  /**
   * Show general read-only message
   */
  const showReadOnlyMessage = useCallback(() => {
    if (isReadOnly) {
      toast({
        title: 'Read-Only Access',
        description: 'You can view your attendance records but cannot make changes. Contact your teacher or office for assistance.',
        variant: 'default',
      });
    }
  }, [isReadOnly]);

  return {
    isReadOnly,
    preventModification,
    showReadOnlyMessage,
    canModify,
  };
}
