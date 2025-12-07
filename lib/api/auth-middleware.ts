/**
 * Authentication and Authorization Middleware for API Routes
 * Validates user sessions and ensures proper access control
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export interface AuthenticatedUser {
  id: string;
  username?: string;
  email?: string;
  firstName: string;
  lastName: string;
  role: 'OFFICE' | 'TEACHER' | 'STUDENT';
}

/**
 * Extract and validate user session from request
 * In a production app, this would validate JWT tokens
 * For now, we'll use a simple session-based approach
 */
export async function authenticateRequest(
  request: NextRequest
): Promise<{ user: AuthenticatedUser | null; error: NextResponse | null }> {
  try {
    // Get session from cookie or header
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('user_session');
    
    // Also check Authorization header as fallback
    const authHeader = request.headers.get('authorization');
    
    let sessionData: string | null = null;
    
    if (sessionCookie) {
      sessionData = sessionCookie.value;
    } else if (authHeader && authHeader.startsWith('Bearer ')) {
      sessionData = authHeader.substring(7);
    }
    
    if (!sessionData) {
      return {
        user: null,
        error: NextResponse.json(
          { error: 'Unauthorized', message: 'No authentication token provided' },
          { status: 401 }
        ),
      };
    }

    // Parse session data (decode URL encoding if present)
    let user: AuthenticatedUser;
    try {
      const decodedSessionData = decodeURIComponent(sessionData);
      user = JSON.parse(decodedSessionData) as AuthenticatedUser;
    } catch {
      return {
        user: null,
        error: NextResponse.json(
          { error: 'Unauthorized', message: 'Invalid authentication token' },
          { status: 401 }
        ),
      };
    }

    // Validate required fields
    if (!user.id || !user.role || !user.firstName || !user.lastName) {
      return {
        user: null,
        error: NextResponse.json(
          { error: 'Unauthorized', message: 'Invalid session data' },
          { status: 401 }
        ),
      };
    }

    return { user, error: null };
  } catch (error) {
    console.error('Authentication error:', error);
    return {
      user: null,
      error: NextResponse.json(
        { error: 'Internal Server Error', message: 'Authentication failed' },
        { status: 500 }
      ),
    };
  }
}

/**
 * Authorize user to access specific student data
 * Students can only access their own data
 * Office staff can access any student data
 */
export function authorizeStudentAccess(
  user: AuthenticatedUser,
  studentId: string
): { authorized: boolean; error: NextResponse | null } {
  // Office staff can access any student data
  if (user.role === 'OFFICE') {
    return { authorized: true, error: null };
  }

  // Students can only access their own data
  if (user.role === 'STUDENT' && user.id === studentId) {
    return { authorized: true, error: null };
  }

  // Teachers cannot access student dashboard data
  return {
    authorized: false,
    error: NextResponse.json(
      {
        error: 'Forbidden',
        message: 'You do not have permission to access this data',
      },
      { status: 403 }
    ),
  };
}

/**
 * Require specific role for access
 */
export function requireRole(
  user: AuthenticatedUser,
  allowedRoles: Array<'OFFICE' | 'TEACHER' | 'STUDENT'>
): { authorized: boolean; error: NextResponse | null } {
  if (allowedRoles.includes(user.role)) {
    return { authorized: true, error: null };
  }

  return {
    authorized: false,
    error: NextResponse.json(
      {
        error: 'Forbidden',
        message: `Access restricted to ${allowedRoles.join(', ')} only`,
      },
      { status: 403 }
    ),
  };
}
