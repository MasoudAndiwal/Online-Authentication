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
  lastActivity: number;
}

const SESSION_KEY = 'user_session';
const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes in milliseconds

/**
 * Save user session after successful login
 */
export function saveSession(userData: Omit<UserSession, 'loginTime' | 'lastActivity'>): void {
  const now = Date.now();
  const session: UserSession = {
    ...userData,
    loginTime: now,
    lastActivity: now,
  };
  
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

/**
 * Update last activity timestamp
 */
export function updateActivity(): void {
  try {
    const sessionData = localStorage.getItem(SESSION_KEY);
    if (sessionData) {
      const session = JSON.parse(sessionData) as UserSession;
      session.lastActivity = Date.now();
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    }
  } catch (error) {
    console.error('Error updating activity:', error);
  }
}

/**
 * Check if session has expired due to inactivity
 */
export function isSessionExpired(session: UserSession): boolean {
  const now = Date.now();
  const timeSinceLastActivity = now - session.lastActivity;
  return timeSinceLastActivity > INACTIVITY_TIMEOUT;
}

/**
 * Get current user session
 * Automatically clears session if expired
 */
export function getSession(): UserSession | null {
  try {
    const sessionData = localStorage.getItem(SESSION_KEY);
    if (!sessionData) {
      return null;
    }
    
    const session = JSON.parse(sessionData) as UserSession;
    
    // Check if session has expired
    if (isSessionExpired(session)) {
      console.log('Session expired due to inactivity');
      clearSession();
      return null;
    }
    
    return session;
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
