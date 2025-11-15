import { NextRequest, NextResponse } from 'next/server';
import { generateAttendanceReport } from '@/lib/services/attendance-report-service';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { classId, dateRange, customStartDate, customEndDate } = body;

    // Validate required parameters
    if (!classId) {
      return NextResponse.json(
        { error: 'classId is required' },
        { status: 400 }
      );
    }

    if (!dateRange || !['current-week', 'last-week', 'custom'].includes(dateRange)) {
      return NextResponse.json(
        { error: 'dateRange must be one of: current-week, last-week, custom' },
        { status: 400 }
      );
    }

    if (dateRange === 'custom' && (!customStartDate || !customEndDate)) {
      return NextResponse.json(
        { error: 'customStartDate and customEndDate are required for custom date range' },
        { status: 400 }
      );
    }

    // Generate report
    const { excel, classInfo } = await generateAttendanceReport(
      classId,
      dateRange as 'current-week' | 'last-week' | 'custom',
      customStartDate ? new Date(customStartDate) : undefined,
      customEndDate ? new Date(customEndDate) : undefined
    );

    // Create filename with class name and date
    const now = new Date();
    const filename = `attendance_${classInfo.name}_${now.getTime()}.xlsx`;

    // Return Excel file
    return new NextResponse(excel, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Error generating attendance report:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate report' },
      { status: 500 }
    );
  }
}
