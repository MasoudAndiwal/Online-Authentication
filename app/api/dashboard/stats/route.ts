import { NextResponse } from 'next/server';
import { getDashboardStats } from '@/lib/database/dashboard-operations';
import { DatabaseError, handleApiError } from '@/lib/database/errors';

/**
 * GET /api/dashboard/stats
 * Fetches comprehensive dashboard statistics including:
 * - Total users count with trend
 * - Active classes count with trend
 * - Overall attendance rate with trend
 * - Pending reviews count
 */
export async function GET() {
  try {
    const stats = await getDashboardStats();
    return NextResponse.json(stats, { status: 200 });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);

    if (error instanceof DatabaseError) {
      const { response, status } = handleApiError(error);
      return NextResponse.json(response, { status });
    }

    return NextResponse.json(
      { error: 'Failed to fetch dashboard statistics' },
      { status: 500 }
    );
  }
}
