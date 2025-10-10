/**
 * Session management utilities
 * Handles user authentication state in the browser
 */

export interface UserSession {
  id: string;
  username?: string;
  email?: string;
  firstName: string;
  lastName: string;
  role: 'OFFICE' | 'TEACHER' | 'STUDENT';
  loginTime: number;
}

const SESSION_KEY = 'user_session';

/**
 * Save user session after successful login
 */
export function saveSession(userData: Omit<UserSession, 'loginTime'>): void {
  const session: UserSession = {
    ...userData,
    loginTime: Date.now(),
  };
  
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

/**
 * Get current user session
 */
export function getSession(): UserSession | null {
  try {
    const sessionData = localStorage.getItem(SESSION_KEY);
    if (!sessionData) {
      return null;
    }
    
    return JSON.parse(sessionData) as UserSession;
  } catch (error) {
    console.error('Error reading session:', error);
    return null;
  }
}

/**
 * Clear user session (logout)
 */
export function clearSession(): void {
  localStorage.removeItem(SESSION_KEY);
  sessionStorage.clear();
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return getSession() !== null;
}

/**
 * Check if user has specific role
 */
export function hasRole(requiredRole: 'OFFICE' | 'TEACHER' | 'STUDENT'): boolean {
  const session = getSession();
  return session?.role === requiredRole;
}

/**
 * Redirect to login page
 */
export function redirectToLogin(): void {
  // Save current path to redirect back after login
  const currentPath = window.location.pathname;
  if (currentPath !== '/login') {
    sessionStorage.setItem('redirectAfterLogin', currentPath);
  }
  window.location.href = '/login';
}

/**
 * Get redirect path after login
 */
export function getRedirectPath(): string {
  return sessionStorage.getItem('redirectAfterLogin') || '/dashboard';
}

/**
 * Clear redirect path
 */
export function clearRedirectPath(): void {
  sessionStorage.removeItem('redirectAfterLogin');
}
