/**
 * useAttendance Hook
 * Manages attendance data fetching with loading, error states, and retry logic
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { retryWithBackoff } from '@/lib/utils/retry';
import { getSession, redirectToLogin } from '@/lib/auth/session';
import type { AttendanceResponse } from '@/types/types';

interface UseAttendanceOptions {
  studentId?: string;
  autoFetch?: boolean;
}

interface UseAttendanceReturn {
  data: AttendanceResponse | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  retry: () => Promise<void>;
}

/**
 * Custom hook for fetching and managing student attendance data
 * 
 * Features:
 * - Automatic authentication check
 * - Loading and error states
 * - Exponential backoff retry logic
 * - Authorization validation
 * 
 * Requirements: 9.3, 10.1, 10.2
 */
export function useAttendance(options: UseAttendanceOptions = {}): UseAttendanceReturn {
  const { studentId, autoFetch = true } = options;
  const router = useRouter();
  
  const [data, setData] = useState<AttendanceResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Fetch attendance data with retry logic
   */
  const fetchAttendanceData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Check authentication
      const session = getSession();
      
      if (!session) {
        // Not authenticated - redirect to login
        redirectToLogin();
        return;
      }

      // Use studentId from options or session
      const targetStudentId = studentId || session.id;

      // Authorization check: students can only access their own data
      if (session.role === 'STUDENT' && targetStudentId !== session.id) {
        const authError = new Error('You do not have permission to access this data');
        authError.name = 'AuthorizationError';
        setError(authError);
        setIsLoading(false);
        return;
      }

      // Fetch data with exponential backoff retry
      const response = await retryWithBackoff(
        async () => {
          const res = await fetch(`/api/attendance?studentId=${targetStudentId}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
          });

          // Handle authentication errors
          if (res.status === 401) {
            const authError: any = new Error('Session expired. Please log in again.');
            authError.name = 'AuthenticationError';
            authError.status = 401;
            throw authError;
          }

          // Handle authorization errors
          if (res.status === 403) {
            const authError: any = new Error('You do not have permission to access this data');
            authError.name = 'AuthorizationError';
            authError.status = 403;
            throw authError;
          }

          // Handle other errors
          if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            const error: any = new Error(
              errorData.error || `Failed to fetch attendance data: ${res.statusText}`
            );
            error.status = res.status;
            throw error;
          }

          return res.json();
        },
        {
          maxAttempts: 3,
          initialDelay: 1000,
          maxDelay: 10000,
          backoffMultiplier: 2,
          shouldRetry: (error: any, attempt: number) => {
            // Don't retry authentication/authorization errors
            if (error.name === 'AuthenticationError' || error.name === 'AuthorizationError') {
              return false;
            }

            // Don't retry client errors (4xx except 401, 403)
            if (error.status >= 400 && error.status < 500) {
              return false;
            }

            // Retry network errors and server errors (5xx)
            return attempt < 3;
          },
          onRetry: (_error, _attempt, _delay) => {
            // Retry callback - can be used for debugging
          },
        }
      );

      setData(response);
      setIsLoading(false);
    } catch (err: any) {
      const error = err instanceof Error ? err : new Error(String(err));
      
      // Handle authentication errors with redirect
      if (error.name === 'AuthenticationError') {
        redirectToLogin();
        return;
      }

      setError(error);
      setIsLoading(false);
    }
  }, [studentId, router]);

  /**
   * Retry fetching data (alias for refetch)
   */
  const retry = useCallback(async () => {
    await fetchAttendanceData();
  }, [fetchAttendanceData]);

  /**
   * Refetch data
   */
  const refetch = useCallback(async () => {
    await fetchAttendanceData();
  }, [fetchAttendanceData]);

  // Auto-fetch on mount if enabled
  useEffect(() => {
    if (autoFetch) {
      fetchAttendanceData();
    }
  }, [autoFetch, fetchAttendanceData]);

  return {
    data,
    isLoading,
    error,
    refetch,
    retry,
  };
}
