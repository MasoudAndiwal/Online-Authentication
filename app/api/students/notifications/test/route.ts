/**
 * SSE Test Endpoint
 * 
 * Test endpoint for verifying SSE functionality
 * Useful for debugging and development
 * 
 * Endpoint: POST /api/students/notifications/test
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAttendanceBroadcastService } from '../../../../../lib/services/attendance-broadcast-service';
import { getSSEService } from '../../../../../lib/services/sse-service';
import { supabase } from '../../../../../lib/supabase';
import { cookies } from 'next/headers';

/**
 * POST handler for testing SSE functionality
 */
export async function POST(request: NextRequest) {
  try {
    // ============================================================================
    // Authentication
    // ============================================================================
    
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session-token')?.value;
    
    if (!sessionToken) {
      return NextResponse.json(
        { error: 'Unauthorized: No session token' },
        { status: 401 }
      );
    }

    // Verify session and get student ID
    const { data: session, error: sessionError } = await supabase.auth.getUser(sessionToken);
    
    if (sessionError || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized: Invalid session' },
        { status: 401 }
      );
    }

    // Get student record
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('id, class_section')
      .eq('user_id', session.user.id)
      .single();

    if (studentError || !student) {
      return NextResponse.json(
        { error: 'Forbidden: Student not found' },
        { status: 403 }
      );
    }

    const studentId = student.id;
    const classId = student.class_section;

    // ============================================================================
    // Parse Request Body
    // ============================================================================
    
    const body = await request.json();
    const { testType = 'ping', targetStudentId, targetClassId } = body;

    const broadcastService = getAttendanceBroadcastService();
    const sseService = getSSEService();

    // ============================================================================
    // Execute Test Based on Type
    // ============================================================================
    
    switch (testType) {
      case 'ping':
        // Test basic connection
        const pingSuccess = await broadcastService.testConnection(targetStudentId || studentId);
        return NextResponse.json({
          success: pingSuccess,
          message: `Ping test ${pingSuccess ? 'successful' : 'failed'}`,
          targetStudent: targetStudentId || studentId,
        });

      case 'attendance_update':
        // Test attendance update broadcast
        await broadcastService.broadcastAttendanceUpdate({
          studentId: targetStudentId || studentId,
          classId: targetClassId || classId,
          date: new Date().toISOString().split('T')[0],
          period: 1,
          status: 'PRESENT',
          subject: 'Test Subject',
          markedBy: 'Test System',
        });
        
        return NextResponse.json({
          success: true,
          message: 'Attendance update test sent',
          targetStudent: targetStudentId || studentId,
        });

      case 'metrics_update':
        // Test metrics update (this will trigger actual calculation)
        const testEvent = {
          type: 'metrics_update' as const,
          data: {
            studentId: targetStudentId || studentId,
            attendanceRate: 85.5,
            totalClasses: 100,
            presentDays: 85,
            ranking: 15,
            classAverage: 82.3,
            trend: 'improving' as const,
            lastUpdated: new Date().toISOString(),
          },
          timestamp: new Date(),
          id: `test_metrics_${Date.now()}`,
        };

        await sseService.sendToStudent(targetStudentId || studentId, testEvent);
        
        return NextResponse.json({
          success: true,
          message: 'Metrics update test sent',
          targetStudent: targetStudentId || studentId,
        });

      case 'notification':
        // Test notification broadcast
        await broadcastService.broadcastNotification(targetStudentId || studentId, {
          id: `test_notification_${Date.now()}`,
          title: 'Test Notification',
          message: 'This is a test notification from the SSE system.',
          severity: 'info',
          actionUrl: '/student/student-dashboard',
          relatedTo: 'general',
        });
        
        return NextResponse.json({
          success: true,
          message: 'Notification test sent',
          targetStudent: targetStudentId || studentId,
        });

      case 'class_broadcast':
        // Test class-wide broadcast
        const classEvent = {
          type: 'attendance_update' as const,
          data: {
            type: 'test_broadcast',
            classId: targetClassId || classId,
            message: 'This is a test class-wide broadcast',
            timestamp: new Date().toISOString(),
          },
          timestamp: new Date(),
          id: `test_class_${Date.now()}`,
        };

        await sseService.broadcastToClass(targetClassId || classId, classEvent);
        
        return NextResponse.json({
          success: true,
          message: 'Class broadcast test sent',
          targetClass: targetClassId || classId,
        });

      case 'connection_info':
        // Get connection information
        const activeConnections = await sseService.getActiveConnections();
        const studentConnections = sseService.getStudentConnections(studentId);
        const classConnections = sseService.getClassConnections(classId);
        
        return NextResponse.json({
          success: true,
          connectionInfo: {
            totalActiveConnections: activeConnections,
            studentConnections: studentConnections.length,
            classConnections: classConnections.length,
            studentConnectionIds: studentConnections,
            classConnectionIds: classConnections,
          },
        });

      default:
        return NextResponse.json(
          { error: `Unknown test type: ${testType}` },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('SSE test endpoint error:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal Server Error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET handler for getting SSE connection status
 */
export async function GET(request: NextRequest) {
  try {
    // ============================================================================
    // Authentication
    // ============================================================================
    
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session-token')?.value;
    
    if (!sessionToken) {
      return NextResponse.json(
        { error: 'Unauthorized: No session token' },
        { status: 401 }
      );
    }

    // Verify session and get student ID
    const { data: session, error: sessionError } = await supabase.auth.getUser(sessionToken);
    
    if (sessionError || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized: Invalid session' },
        { status: 401 }
      );
    }

    // Get student record
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('id, class_section')
      .eq('user_id', session.user.id)
      .single();

    if (studentError || !student) {
      return NextResponse.json(
        { error: 'Forbidden: Student not found' },
        { status: 403 }
      );
    }

    const studentId = student.id;
    const classId = student.class_section;

    // ============================================================================
    // Get Connection Status
    // ============================================================================
    
    const sseService = getSSEService();
    
    const activeConnections = await sseService.getActiveConnections();
    const studentConnections = sseService.getStudentConnections(studentId);
    const classConnections = sseService.getClassConnections(classId);
    
    return NextResponse.json({
      success: true,
      status: {
        studentId,
        classId,
        totalActiveConnections: activeConnections,
        studentConnections: {
          count: studentConnections.length,
          connectionIds: studentConnections,
        },
        classConnections: {
          count: classConnections.length,
          connectionIds: classConnections,
        },
        hasActiveConnection: studentConnections.length > 0,
      },
    });

  } catch (error) {
    console.error('SSE status endpoint error:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal Server Error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}