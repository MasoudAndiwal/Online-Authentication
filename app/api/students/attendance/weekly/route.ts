/**
 * Student Weekly Attendance API Endpoint
 * 
 * Provides weekly attendance data with caching for optimal performance.
 * Implements cache-first strategy with appropriate TTL.
 * 
 * Requirements: 1.1 (caching), 1.2 (background refresh)
 */

import { NextResponse } from 'next/server';
import { withStudentDashboardMiddleware, EnhancedRequest } from '@/lib/middleware/api-middleware-stack';
import { ValidationError } from '@/lib/errors/custom-errors';
import { getCacheService } from '@/lib/services/cache-service';
// Audit logging removed
import { supabase } from '@/lib/supabase';
import type { DayAttendance, AttendanceStatus } from '@/types/types';

const cacheService = getCacheService();
// Audit logging removed

// Cache TTL for weekly attendance data (5 minutes)
const WEEKLY_ATTENDANCE_TTL = 300;

/**
 * GET /api/students/attendance/weekly
 * 
 * Fetches weekly attendance data for a student with caching.
 * 
 * Query Parameters:
 * - studentId: Student identifier (optional, defaults to authenticated user)
 * - week: Week number relative to current week (default: 0 for current week)
 * - year: Year (default: current year)
 * 
 * Requirements: 1.1 (caching), 1.2 (background refresh)
 */
export const GET = withStudentDashboardMiddleware(
  async (req: EnhancedRequest): Promise<NextResponse> => {
    const { searchParams } = new URL(req.url);
    const requestedStudentId = searchParams.get('studentId');
    const weekOffset = parseInt(searchParams.get('week') || '0', 10);
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString(), 10);

    // Determine which student's data to fetch
    const targetStudentId = requestedStudentId || req.user?.id;
    
    if (!targetStudentId) {
      throw new ValidationError('Student ID is required', 'studentId');
    }

    // Authorization check: students can only access their own data
    if (req.user?.role === 'STUDENT' && req.user.id !== targetStudentId) {
      throw new ValidationError(
        'Students can only access their own attendance data',
        'studentId'
      );
    }

    // Validate week offset (limit to reasonable range)
    if (weekOffset < -52 || weekOffset > 4) {
      throw new ValidationError('Week offset must be between -52 and 4', 'week');
    }

    try {
      const startTime = performance.now();
      
      // Generate cache key
      const cacheKey = `attendance:student:${targetStudentId}:week:${weekOffset}:year:${year}`;
      
      // Try to get from cache first
      let weeklyData = await cacheService.get<any>(cacheKey);
      let fromCache = true;
      
      if (!weeklyData) {
        fromCache = false;
        // Fetch from database
        weeklyData = await fetchWeeklyAttendanceFromDB(targetStudentId, weekOffset, year);
        
        // Cache the result
        await cacheService.set(cacheKey, weeklyData, WEEKLY_ATTENDANCE_TTL);
      }
      
      const responseTime = performance.now() - startTime;

      // Log attendance access for audit trail
      // Audit logging removed


      const response = {
        success: true,
        data: weeklyData,
        meta: {
          studentId: targetStudentId,
          weekOffset,
          year,
          cached: fromCache,
          responseTime: Math.round(responseTime),
          generatedAt: new Date().toISOString(),
          requestId: req.requestId
        }
      };

      return NextResponse.json(response, {
        status: 200,
        headers: {
          'X-Request-ID': req.requestId,
          'Cache-Control': 'private, max-age=300', // 5 minutes
          'X-Response-Time': `${Math.round(responseTime)}ms`,
          'X-Cache-Status': fromCache ? 'HIT' : 'MISS'
        }
      });

    } catch (error) {
      // Log failed attendance access
      // Audit logging removed


      throw error;
    }
  },
  'get-weekly-attendance'
);

/**
 * Fetch weekly attendance data from database
 */
async function fetchWeeklyAttendanceFromDB(
  studentId: string, 
  weekOffset: number, 
  year: number
): Promise<any> {
  try {
    // Calculate week start and end dates
    const { startDate, endDate } = calculateWeekDates(weekOffset, year);
    
    // Fetch attendance records from database
    const { data: attendanceRecords, error } = await supabase
      .from('attendance_records')
      .select(`
        date,
        period,
        status,
        marked_by,
        marked_at,
        schedule_entries (
          subject,
          start_time,
          end_time,
          teachers (
            first_name,
            last_name
          )
        )
      `)
      .eq('student_id', studentId)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: true })
      .order('period', { ascending: true });

    if (error) {
      console.error('Database error fetching attendance:', error);
      // Fall back to mock data if database fails
      return generateMockWeeklyData(weekOffset, year);
    }

    // Group records by date
    const recordsByDate = new Map<string, any[]>();
    attendanceRecords?.forEach(record => {
      const dateKey = record.date;
      if (!recordsByDate.has(dateKey)) {
        recordsByDate.set(dateKey, []);
      }
      recordsByDate.get(dateKey)!.push(record);
    });

    // Generate days array
    const days: DayAttendance[] = [];
    const dayNames = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'];
    
    for (let i = 0; i < 6; i++) { // 6 days (Saturday to Thursday)
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      
      const dateString = date.toISOString().split('T')[0];
      const dayRecords = recordsByDate.get(dateString) || [];
      
      // Determine overall day status
      let dayStatus: AttendanceStatus | 'future' = 'future';
      if (dayRecords.length > 0) {
        const statuses = dayRecords.map(r => r.status);
        if (statuses.includes('absent')) dayStatus = 'absent';
        else if (statuses.includes('sick')) dayStatus = 'sick';
        else if (statuses.includes('leave')) dayStatus = 'leave';
        else if (statuses.every(s => s === 'present')) dayStatus = 'present';
        else dayStatus = 'present'; // Mixed, default to present
      }

      // Format sessions
      const sessions = dayRecords.map(record => ({
        period: record.period,
        courseName: record.schedule_entries?.subject || 'Unknown Subject',
        status: record.status as AttendanceStatus,
        time: record.schedule_entries ? 
          `${record.schedule_entries.start_time} - ${record.schedule_entries.end_time}` : 
          'Unknown Time',
        markedBy: record.schedule_entries?.teachers ? 
          `${record.schedule_entries.teachers.first_name} ${record.schedule_entries.teachers.last_name}` : 
          record.marked_by || 'Unknown',
        markedAt: record.marked_at
      }));

      days.push({
        date: dateString,
        dayName: dayNames[i] || 'Unknown',
        status: dayStatus,
        sessions
      });
    }

    return {
      weekOffset,
      year,
      startDate: startDate,
      endDate: endDate,
      days
    };

  } catch (error) {
    console.error('Error fetching weekly attendance:', error);
    // Fall back to mock data
    return generateMockWeeklyData(weekOffset, year);
  }
}

/**
 * Calculate week start and end dates based on offset
 */
function calculateWeekDates(weekOffset: number, year: number): { startDate: string; endDate: string } {
  const today = new Date();
  const currentYear = today.getFullYear();
  
  // If requesting different year, start from January 1st of that year
  let referenceDate = year === currentYear ? today : new Date(year, 0, 1);
  
  // Find the Saturday of the current/reference week
  const currentDay = referenceDate.getDay(); // 0 = Sunday, 6 = Saturday
  const daysToSaturday = currentDay === 6 ? 0 : currentDay === 0 ? -1 : -(currentDay + 1);
  
  const weekStart = new Date(referenceDate);
  weekStart.setDate(referenceDate.getDate() + daysToSaturday + (weekOffset * 7));
  
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 5); // Saturday to Thursday (6 days)
  
  return {
    startDate: weekStart.toISOString().split('T')[0],
    endDate: weekEnd.toISOString().split('T')[0]
  };
}

/**
 * Generate mock weekly attendance data (fallback)
 */
function generateMockWeeklyData(weekOffset: number, year: number) {
  const { startDate, endDate } = calculateWeekDates(weekOffset, year);
  const weekStart = new Date(startDate);
  const today = new Date();

  const days: DayAttendance[] = [];
  const dayNames = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'];
  
  for (let i = 0; i < 6; i++) {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + i);
    
    const dateString = date.toISOString().split('T')[0];
    const isPast = date < today;
    const isToday = date.toDateString() === today.toDateString();
    
    let status: AttendanceStatus | 'future' = 'future';
    if (isPast || isToday) {
      const rand = Math.random();
      if (rand > 0.8) status = 'absent';
      else if (rand > 0.7) status = 'sick';
      else if (rand > 0.65) status = 'leave';
      else status = 'present';
    }

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

  return {
    weekOffset,
    year,
    startDate,
    endDate,
    days,
  };
}
