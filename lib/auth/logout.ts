/**
 * Logout utility function
 * Handles logout API call and cleanup
 */

import { clearSession } from './session';

export async function handleLogout(): Promise<void> {
  try {
    // Call logout API
    const response = await fetch('/api/auth/logout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    const result = await response.json();

    if (result.success) {
      // Clear session using session management
      clearSession();

      // Redirect to login page
      window.location.href = '/login';
    } else {
      console.error('Logout failed:', result.message);
      // Still clear session and redirect even if API fails
      clearSession();
      window.location.href = '/login';
    }
  } catch (error) {
    console.error('Logout error:', error);
    // Clear session and redirect even if API call fails
    clearSession();
    window.location.href = '/login';
  }
}
