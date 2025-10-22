import { NextRequest, NextResponse } from 'next/server';
import { getRecentActivity } from '@/lib/database/dashboard-operations';
import { DatabaseError, handleApiError } from '@/lib/database/errors';

/**
 * GET /api/dashboard/activity
 * Fetches recent system activity for the dashboard
 * Optional query params:
 * - limit: number of activities to fetch (default: 10)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    const activities = await getRecentActivity(limit);
    return NextResponse.json(activities, { status: 200 });
  } catch (error) {
    console.error('Error fetching recent activity:', error);

    if (error instanceof DatabaseError) {
      const { response, status } = handleApiError(error);
      return NextResponse.json(response, { status });
    }

    return NextResponse.json(
      { error: 'Failed to fetch recent activity' },
      { status: 500 }
    );
  }
}
