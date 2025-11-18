/**
 * Read-Only Middleware
 * Prevents students from making modifications via API calls
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSession } from './session';

/**
 * Check if the request is a modification request (POST, PUT, PATCH, DELETE)
 */
function isModificationRequest(method: string): boolean {
  return ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method.toUpperCase());
}

/**
 * Middleware to enforce read-only access for students
 * 
 * Usage in API routes:
 * ```typescript
 * export async function POST(request: NextRequest) {
 *   const readOnlyCheck = enforceReadOnly(request);
 *   if (readOnlyCheck) return readOnlyCheck;
 *   
 *   // Continue with modification logic
 * }
 * ```
 * 
 * Requirements: 10.3, 10.4
 */
export function enforceReadOnly(request: NextRequest): NextResponse | null {
  // Only check modification requests
  if (!isModificationRequest(request.method)) {
    return null;
  }

  // Get session from request headers or cookies
  const session = getSession();

  // If no session, let the auth middleware handle it
  if (!session) {
    return null;
  }

  // Block modification attempts from students
  if (session.role === 'STUDENT') {
    return NextResponse.json(
      {
        success: false,
        error: 'Access denied. Students have read-only access and cannot modify data.',
        code: 'READ_ONLY_ACCESS',
      },
      { status: 403 }
    );
  }

  // Allow modification for other roles
  return null;
}

/**
 * Check if user can modify data
 */
export function canModifyData(userRole: string): boolean {
  return userRole !== 'STUDENT';
}

/**
 * Validate data access for students
 * Ensures students can only access their own data
 */
export function validateStudentDataAccess(
  session: { id: string; role: string } | null,
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
