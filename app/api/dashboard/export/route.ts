import { NextRequest, NextResponse } from 'next/server';
import { exportDashboardData } from '@/lib/database/dashboard-operations';
import { DatabaseError, handleApiError } from '@/lib/database/errors';
import { getAuditLoggerService } from '@/lib/services/audit-logger-service';
import { getClientIp, getUserAgent } from '@/lib/middleware/audit-logging-middleware';

/**
 * GET /api/dashboard/export
 * Exports dashboard data (students, teachers, classes)
 * Query params:
 * - format: 'json' | 'csv' (default: json)
 * - userId: User ID performing the export (required for audit logging)
 */
export async function GET(request: NextRequest) {
  const auditLogger = getAuditLoggerService();
  
  try {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') === 'csv' ? 'csv' : 'json';
    const userId = searchParams.get('userId');

    const data = await exportDashboardData(format);

    // Log the export action if userId is provided
    if (userId) {
      const ipAddress = getClientIp(request);
      const userAgent = getUserAgent(request);
      
      await auditLogger.logDataExport(
        userId,
        format,
        {
          start: new Date(0), // Full export - no date range
          end: new Date(),
        },
        ipAddress,
        userAgent
      );
    }

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
