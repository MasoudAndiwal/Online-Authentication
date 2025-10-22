import { NextRequest, NextResponse } from 'next/server';
import { getWeeklyAttendanceTrends } from '@/lib/database/dashboard-operations';
import { DatabaseError, handleApiError } from '@/lib/database/errors';

/**
 * GET /api/dashboard/attendance
 * Fetches weekly attendance trends data for charts
 * Optional query params:
 * - weeks: number of weeks to fetch (default: 4)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const weeks = parseInt(searchParams.get('weeks') || '4', 10);

    const attendanceData = await getWeeklyAttendanceTrends(weeks);
    return NextResponse.json(attendanceData, { status: 200 });
  } catch (error) {
    console.error('Error fetching attendance trends:', error);

    if (error instanceof DatabaseError) {
      const { response, status } = handleApiError(error);
      return NextResponse.json(response, { status });
    }

    return NextResponse.json(
      { error: 'Failed to fetch attendance trends' },
      { status: 500 }
    );
  }
}
