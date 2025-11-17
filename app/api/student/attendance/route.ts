/**
 * Student Attendance API Route
 * GET /api/student/attendance
 * 
 * Fetches comprehensive attendance data for authenticated students
 * Includes stats, status, week data, recent records, and uploaded files
 */

import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, authorizeStudentAccess } from '@/lib/api/auth-middleware';
import { getStudentAttendanceData } from '@/lib/services/student-attendance-service';

export async function GET(request: NextRequest) {
  try {
    // Authenticate the request
    const { user, error: authError } = await authenticateRequest(request);
    
    if (authError || !user) {
      return authError || NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get student ID from query params or use authenticated user's ID
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId') || user.id;
    const weekOffset = parseInt(searchParams.get('weekOffset') || '0', 10);

    // Authorize access to student data
    const { authorized, error: authzError } = authorizeStudentAccess(user, studentId);
    
    if (!authorized || authzError) {
      return authzError || NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Fetch attendance data
    const attendanceData = await getStudentAttendanceData(studentId, weekOffset);

    if (!attendanceData) {
      return NextResponse.json(
        { error: 'Student not found or no attendance data available' },
        { status: 404 }
      );
    }

    return NextResponse.json(attendanceData, { status: 200 });
  } catch (error) {
    console.error('Error in student attendance API:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: 'Failed to fetch attendance data' },
      { status: 500 }
    );
  }
}
