import { NextRequest, NextResponse } from 'next/server';
import { periodAssignmentService } from '@/lib/services/period-assignment-service';
import type { TeacherPeriodAssignment, TeacherDailySchedule } from '@/lib/services/period-assignment-service';

/**
 * GET /api/teachers/schedule
 * 
 * Fetch teacher's assigned periods for specific class/day or daily schedule
 * 
 * Query Parameters:
 * - teacherId: Teacher's ID (required)
 * - classId: Class ID (optional, for specific class periods)
 * - dayOfWeek: Day of week (optional, defaults to current day)
 * - date: Specific date for daily schedule (optional, format: YYYY-MM-DD)
 * - type: Response type - 'periods' for class periods, 'daily' for full schedule (default: 'periods')
 * 
 * Examples:
 * - GET /api/teachers/schedule?teacherId=123&classId=456&dayOfWeek=monday
 * - GET /api/teachers/schedule?teacherId=123&type=daily&date=2024-01-15
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const teacherId = searchParams.get('teacherId');
    const classId = searchParams.get('classId');
    const dayOfWeek = searchParams.get('dayOfWeek');
    const dateParam = searchParams.get('date');
    const type = searchParams.get('type') || 'periods';

    console.log('[Teacher Schedule API] Request params:', {
      teacherId,
      classId,
      dayOfWeek,
      dateParam,
      type
    });

    // Validate required parameters
    if (!teacherId) {
      return NextResponse.json(
        { 
          error: 'Missing required parameter: teacherId',
          details: 'teacherId is required to fetch teacher schedule'
        },
        { status: 400 }
      );
    }

    // Handle daily schedule request
    if (type === 'daily') {
      const date = dateParam ? new Date(dateParam) : new Date();
      
      // Validate date
      if (isNaN(date.getTime())) {
        return NextResponse.json(
          { 
            error: 'Invalid date format',
            details: 'Date should be in YYYY-MM-DD format'
          },
          { status: 400 }
        );
      }

      console.log('[Teacher Schedule API] Fetching daily schedule for:', teacherId, 'date:', date.toISOString());

      const dailySchedule: TeacherDailySchedule = await periodAssignmentService.getTeacherDailySchedule(
        teacherId,
        date
      );

      return NextResponse.json({
        success: true,
        data: dailySchedule,
        meta: {
          type: 'daily',
          teacherId,
          date: date.toISOString(),
          totalPeriods: dailySchedule.totalPeriods,
          totalClasses: dailySchedule.classSummary.length
        }
      });
    }

    // Handle class periods request
    if (!classId) {
      return NextResponse.json(
        { 
          error: 'Missing required parameter: classId',
          details: 'classId is required when type is "periods"'
        },
        { status: 400 }
      );
    }

    // Determine day of week
    const targetDayOfWeek = dayOfWeek || getCurrentDayOfWeek();
    
    // Validate day of week
    const validDays = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    if (!validDays.includes(targetDayOfWeek.toLowerCase())) {
      return NextResponse.json(
        { 
          error: 'Invalid dayOfWeek',
          details: `dayOfWeek must be one of: ${validDays.join(', ')}`
        },
        { status: 400 }
      );
    }

    console.log('[Teacher Schedule API] Fetching periods for:', {
      teacherId,
      classId,
      dayOfWeek: targetDayOfWeek
    });

    // Fetch teacher's assigned periods
    const periods: TeacherPeriodAssignment[] = await periodAssignmentService.getTeacherPeriods(
      teacherId,
      classId,
      targetDayOfWeek
    );

    // Get additional context - all teachers for this class/day
    const allClassTeachers = await periodAssignmentService.getClassTeachers(
      classId,
      targetDayOfWeek
    );

    // Validate teacher has access to this class
    const hasAccess = periods.length > 0 || allClassTeachers.some(t => t.teacherId === teacherId);

    return NextResponse.json({
      success: true,
      data: {
        teacherId,
        classId,
        dayOfWeek: targetDayOfWeek,
        assignedPeriods: periods,
        hasAccess,
        totalAssignedPeriods: periods.length,
        assignedPeriodNumbers: periods.map(p => p.periodNumber).sort((a, b) => a - b),
        subjects: [...new Set(periods.map(p => p.subject))],
        timeRange: periods.length > 0 ? {
          earliest: periods.reduce((min, p) => p.startTime < min ? p.startTime : min, periods[0].startTime),
          latest: periods.reduce((max, p) => p.endTime > max ? p.endTime : max, periods[0].endTime)
        } : null
      },
      meta: {
        type: 'periods',
        requestedAt: new Date().toISOString(),
        allClassTeachers: allClassTeachers.map(t => ({
          teacherId: t.teacherId,
          teacherName: t.teacherName,
          periods: t.periods,
          subjects: t.subjects
        }))
      }
    });

  } catch (error) {
    console.error('[Teacher Schedule API] Error:', error);
    
    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes('Teacher not found')) {
        return NextResponse.json(
          { 
            error: 'Teacher not found',
            details: 'The specified teacher ID does not exist in the system'
          },
          { status: 404 }
        );
      }
      
      if (error.message.includes('Class not found')) {
        return NextResponse.json(
          { 
            error: 'Class not found',
            details: 'The specified class ID does not exist in the system'
          },
          { status: 404 }
        );
      }
    }

    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: 'An unexpected error occurred while fetching teacher schedule',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/teachers/schedule/validate
 * 
 * Validate teacher's access to mark attendance for specific period
 * 
 * Request Body:
 * {
 *   teacherId: string,
 *   classId: string,
 *   periodNumber: number,
 *   dayOfWeek?: string
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { teacherId, classId, periodNumber, dayOfWeek } = body;

    console.log('[Teacher Schedule API] Validation request:', {
      teacherId,
      classId,
      periodNumber,
      dayOfWeek
    });

    // Validate required parameters
    if (!teacherId || !classId || !periodNumber) {
      return NextResponse.json(
        { 
          error: 'Missing required parameters',
          details: 'teacherId, classId, and periodNumber are required'
        },
        { status: 400 }
      );
    }

    // Validate period number
    if (periodNumber < 1 || periodNumber > 6) {
      return NextResponse.json(
        { 
          error: 'Invalid period number',
          details: 'Period number must be between 1 and 6'
        },
        { status: 400 }
      );
    }

    const targetDayOfWeek = dayOfWeek || getCurrentDayOfWeek();

    // Validate teacher's access to this period
    const hasAccess = await periodAssignmentService.validateTeacherPeriodAccess(
      teacherId,
      classId,
      periodNumber,
      targetDayOfWeek
    );

    // Get the specific period details if access is granted
    let periodDetails = null;
    if (hasAccess) {
      const periods = await periodAssignmentService.getTeacherPeriods(
        teacherId,
        classId,
        targetDayOfWeek
      );
      periodDetails = periods.find(p => p.periodNumber === periodNumber) || null;
    }

    return NextResponse.json({
      success: true,
      data: {
        teacherId,
        classId,
        periodNumber,
        dayOfWeek: targetDayOfWeek,
        hasAccess,
        periodDetails,
        validatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('[Teacher Schedule API] Validation error:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: 'An unexpected error occurred during validation',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get current day of week as lowercase string
 */
function getCurrentDayOfWeek(): string {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  return days[new Date().getDay()];
}