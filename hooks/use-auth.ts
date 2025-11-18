/**
 * Authentication hook
 * Protects routes and manages authentication state
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSession, redirectToLogin, type UserSession } from '@/lib/auth/session';

interface UseAuthOptions {
  requiredRole?: 'OFFICE' | 'TEACHER' | 'STUDENT';
  redirectTo?: string;
}

interface UseAuthReturn {
  user: UserSession | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

export function useAuth(options: UseAuthOptions = {}): UseAuthReturn {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<UserSession | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      // Check authentication
      const session = getSession();

      if (!session) {
        // Not authenticated - redirect to login
        setError('Authentication required. Please log in.');
        redirectToLogin();
        return;
      }

      // Check role if required
      if (options.requiredRole && session.role !== options.requiredRole) {
        // Wrong role - redirect based on role
        const rolePaths = {
          OFFICE: '/dashboard',
          TEACHER: '/teacher/dashboard',
          STUDENT: '/student/student-dashboard',
        };
        
        setError(`Access denied. This page requires ${options.requiredRole} role.`);
        router.push(rolePaths[session.role] || '/login');
        return;
      }

      // Authentication successful
      setUser(session);
      setError(null);
      setIsLoading(false);
    } catch (err) {
      console.error('Authentication error:', err);
      setError('An error occurred during authentication. Please try again.');
      setIsLoading(false);
      redirectToLogin();
    }
  }, [router, options.requiredRole]);

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    error,
  };
}

/**
 * Hook for public routes (login, forgot password, etc.)
 * Redirects to dashboard if already authenticated
 */
export function usePublicRoute() {
  const router = useRouter();

  useEffect(() => {
    const session = getSession();
    
    if (session) {
      // Already authenticated - redirect to appropriate dashboard
      const rolePaths = {
        OFFICE: '/dashboard',
        TEACHER: '/teacher/dashboard',
        STUDENT: '/student/student-dashboard',
      };
      
      router.push(rolePaths[session.role] || '/dashboard');
    }
  }, [router]);
}
