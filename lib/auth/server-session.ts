/**
 * Server-side session management
 * Handles session validation in API routes
 */

import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';

export interface ServerUserSession {
  id: string;
  username?: string;
  email?: string;
  firstName: string;
  lastName: string;
  role: 'OFFICE' | 'TEACHER' | 'STUDENT';
  loginTime: number;
  lastActivity: number;
}

/**
 * Get session from server-side request
 * This should be used in API routes instead of the client-side getSession()
 */
export async function getServerSession(request?: NextRequest): Promise<ServerUserSession | null> {
  try {
    // Try to get session from cookies or headers
    let sessionData: string | null = null;
    
    if (request) {
      // Get from request headers or cookies
      sessionData = request.headers.get('x-session-data') || 
                   request.cookies.get('user_session')?.value || null;
    } else {
      // Get from Next.js cookies (for App Router)
      const cookieStore = cookies();
      sessionData = (await cookieStore).get('user_session')?.value || null;
    }

    if (!sessionData) {
      return null;
    }

    // Decode URL-encoded cookie value before parsing
    const decodedSessionData = decodeURIComponent(sessionData);
    const session = JSON.parse(decodedSessionData) as ServerUserSession;
    
    // Basic validation
    if (!session.id || !session.role) {
      return null;
    }

    return session;
  } catch (error) {
    console.error('Error reading server session:', error);
    return null;
  }
}

/**
 * Validate student data access on server
 */
export function validateServerStudentAccess(
  session: ServerUserSession | null,
  requestedStudentId: string
): { allowed: boolean; error?: string } {
  if (!session) {
    return {
      allowed: false,
      error: 'Authentication required',
    };
  }

  // Students can only access their own data
  if (session.role === 'STUDENT' && session.id !== requestedStudentId) {
    return {
      allowed: false,
      error: 'Access denied. You can only view your own data.',
    };
  }

  // Other roles can access any student data
  return { allowed: true };
}