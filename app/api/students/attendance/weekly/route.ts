import { NextRequest, NextResponse } from 'next/server';
import type { DayAttendance, AttendanceStatus } from '@/types/types';
import { getSession } from '@/lib/auth/session';
import { validateStudentDataAccess } from '@/lib/auth/read-only-middleware';

/**
 * GET /api/students/attendance/weekly
 * Fetches weekly attendance data for a student
 * Query params: studentId, week (week number)
 * 
 * Requirements: 10.2, 10.4 - Data privacy controls
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const studentId = searchParams.get('studentId');
    const weekNumber = parseInt(searchParams.get('week') || '1', 10);

    if (!studentId) {
      return NextResponse.json(
        { success: false, error: 'Student ID is required' },
        { status: 400 }
      );
    }

    // Validate data access - students can only view their own data
    const session = getSession();
    const accessCheck = validateStudentDataAccess(session, studentId);
    
    if (!accessCheck.allowed) {
      return NextResponse.json(
        { success: false, error: accessCheck.error || 'Access denied' },
        { status: 403 }
      );
    }

    // Mock data for demonstration
    // In production, this would fetch from the database
    const mockWeeklyData = generateMockWeeklyData(weekNumber);

    return NextResponse.json({
      success: true,
      data: mockWeeklyData,
    });
  } catch (error) {
    console.error('Error fetching weekly attendance:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch weekly attendance' },
      { status: 500 }
    );
  }
}

/**
 * Generate mock weekly attendance data
 * Saturday to Thursday (5 days)
 */
function generateMockWeeklyData(weekNumber: number) {
  const today = new Date();
  const currentDay = today.getDay(); // 0 = Sunday, 6 = Saturday
  
  // Calculate the start of the current week (Saturday)
  const daysToSaturday = currentDay === 6 ? 0 : currentDay === 0 ? -1 : -(currentDay + 1);
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() + daysToSaturday + (weekNumber - 1) * 7);

  const days: DayAttendance[] = [];
  const dayNames = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'];
  
  // Generate 5 days (Saturday to Wednesday, skipping Thursday for this example)
  for (let i = 0; i < 5; i++) {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + i);
    
    const dateString = date.toISOString().split('T')[0];
    const isPast = date < today;
    const isToday = date.toDateString() === today.toDateString();
    
    // Determine status based on whether it's past, present, or future
    let status: AttendanceStatus | 'future' = 'future';
    if (isPast || isToday) {
      // Mock some attendance patterns
      const rand = Math.random();
      if (rand > 0.8) {
        status = 'absent';
      } else if (rand > 0.7) {
        status = 'sick';
      } else if (rand > 0.65) {
        status = 'leave';
      } else {
        status = 'present';
      }
    }

    // Generate mock sessions
    const sessions = isPast || isToday ? [
      {
        period: 1,
        courseName: 'Computer Science 101',
        status: status as AttendanceStatus,
        time: '08:00 - 09:30',
        markedBy: 'Dr. Ahmed Hassan',
        markedAt: new Date(date.getTime() + 8 * 60 * 60 * 1000).toISOString(),
      },
      {
        period: 2,
        courseName: 'Mathematics 201',
        status: status as AttendanceStatus,
        time: '10:00 - 11:30',
        markedBy: 'Prof. Sarah Johnson',
        markedAt: new Date(date.getTime() + 10 * 60 * 60 * 1000).toISOString(),
      },
    ] : [];

    days.push({
      date: dateString,
      dayName: dayNames[i],
      status,
      sessions,
    });
  }

  const endDate = new Date(weekStart);
  endDate.setDate(weekStart.getDate() + 4);

  return {
    weekNumber,
    startDate: weekStart.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0],
    days,
  };
}
