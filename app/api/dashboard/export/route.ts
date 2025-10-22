import { NextRequest, NextResponse } from 'next/server';
import { exportDashboardData } from '@/lib/database/dashboard-operations';
import { DatabaseError, handleApiError } from '@/lib/database/errors';

/**
 * GET /api/dashboard/export
 * Exports dashboard data (students, teachers, classes)
 * Query params:
 * - format: 'json' | 'csv' (default: json)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') === 'csv' ? 'csv' : 'json';

    const data = await exportDashboardData(format);

    if (format === 'csv') {
      // Return CSV with appropriate headers
      return new NextResponse(JSON.stringify(data), {
        status: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="dashboard-export-${new Date().toISOString()}.csv"`,
        },
      });
    }

    // Return JSON
    return NextResponse.json(data, {
      status: 200,
      headers: {
        'Content-Disposition': `attachment; filename="dashboard-export-${new Date().toISOString()}.json"`,
      },
    });
  } catch (error) {
    console.error('Error exporting dashboard data:', error);

    if (error instanceof DatabaseError) {
      const { response, status } = handleApiError(error);
      return NextResponse.json(response, { status });
    }

    return NextResponse.json(
      { error: 'Failed to export dashboard data' },
      { status: 500 }
    );
  }
}
