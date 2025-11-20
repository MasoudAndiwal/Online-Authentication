/**
 * SSE API Endpoint for Student Real-time Notifications
 * 
 * Implements Requirements:
 * - 2.2: Establish SSE connection for real-time updates
 * - 2.4: Automatic reconnection with exponential backoff
 * 
 * Endpoint: GET /api/students/notifications/sse
 * 
 * Features:
 * - JWT authentication
 * - Rate limiting (10 connections per minute)
 * - Automatic connection management
 * - Graceful error handling
 */

import { NextRequest } from 'next/server';
import { getSSEService } from '../../../../../lib/services/sse-service';
import { getRateLimiterService } from '../../../../../lib/services/rate-limiter-service';
import { supabase } from '../../../../../lib/supabase';
import { cookies } from 'next/headers';

/**
 * GET handler for SSE connections
 * Establishes Server-Sent Events connection for real-time updates
 */
export async function GET(request: NextRequest) {
  try {
    // ============================================================================
    // Authentication
    // ============================================================================
    
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session-token')?.value;
    
    if (!sessionToken) {
      return new Response('Unauthorized: No session token', {
        status: 401,
        headers: {
          'Content-Type': 'text/plain',
        },
      });
    }

    // Verify session and get student ID
    const { data: session, error: sessionError } = await supabase.auth.getUser(sessionToken);
    
    if (sessionError || !session.user) {
      return new Response('Unauthorized: Invalid session', {
        status: 401,
        headers: {
          'Content-Type': 'text/plain',
        },
      });
    }

    // Get student record
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('id, class_section')
      .eq('user_id', session.user.id)
      .single();

    if (studentError || !student) {
      return new Response('Forbidden: Student not found', {
        status: 403,
        headers: {
          'Content-Type': 'text/plain',
        },
      });
    }

    const studentId = student.id;

    // ============================================================================
    // Rate Limiting
    // ============================================================================
    
    const rateLimiter = getRateLimiterService();
    const clientIP = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'unknown';

    // Check rate limit (10 SSE connections per minute)
    const rateLimitResult = await rateLimiter.checkLimit(studentId, 'sse');
    
    if (!rateLimitResult.allowed) {
      return new Response('Too Many Requests: SSE connection limit exceeded', {
        status: 429,
        headers: {
          'Content-Type': 'text/plain',
          'Retry-After': rateLimitResult.retryAfter?.toString() || '60',
          'X-RateLimit-Limit': '10',
          'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
          'X-RateLimit-Reset': rateLimitResult.resetAt.toISOString(),
        },
      });
    }

    // Record the request
    await rateLimiter.recordRequest(studentId, 'sse');

    // ============================================================================
    // Create SSE Connection
    // ============================================================================
    
    const sseService = getSSEService();
    
    // Create SSE connection
    const sseResponse = await sseService.createConnection(studentId, request);
    
    // Log successful connection
    console.log(`SSE connection established for student ${studentId} from IP ${clientIP}`);
    
    return sseResponse;

  } catch (error) {
    console.error('SSE endpoint error:', error);
    
    return new Response('Internal Server Error: Failed to establish SSE connection', {
      status: 500,
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  }
}

/**
 * OPTIONS handler for CORS preflight
 */
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, Cookie',
      'Access-Control-Max-Age': '86400',
    },
  });
}