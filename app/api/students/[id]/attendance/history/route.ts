import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * GET /api/students/[id]/attendance/history
 * 
 * Fetches attendance history for a specific student
 * Query Parameters:
 * - startDate: Start date for filtering (optional)
 * - endDate: End date for filtering (optional)
 * - days: Number of days to fetch (default: 60)
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const searchParams = request.nextUrl.searchParams;
    
    console.log('[Student Attendance History API] Fetching for student:', id);

    if (!id) {
      return NextResponse.json(
        { error: 'Student ID is required' },
        { status: 400 }
      );
    }

    // Get query parameters
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');
    const daysParam = searchParams.get('days') || '60';

    // Calculate date range
    const endDate = endDateParam ? new Date(endDateParam) : new Date();
    const startDate = startDateParam 
      ? new Date(startDateParam) 
      : new Date(endDate.getTime() - parseInt(daysParam) * 24 * 60 * 60 * 1000);

    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];

    console.log('[Student Attendance History API] Date range:', { startDateStr, endDateStr });

    // Fetch attendance records from attendance_records_new table
    const { data: attendanceRecords, error: attendanceError } = await supabase
      .from('attendance_records_new')
      .select('*')
      .eq('student_id', id)
      .gte('date', startDateStr)
      .lte('date', endDateStr)
      .order('date', { ascending: false });

    if (attendanceError) {
      console.error('[Student Attendance History API] Error fetching attendance:', attendanceError);
      return NextResponse.json(
        { error: 'Failed to fetch attendance records', details: attendanceError.message },
        { status: 500 }
      );
    }

    console.log('[Student Attendance History API] Found records:', attendanceRecords?.length || 0);

    // Collect all unique teacher IDs from the records
    const teacherIds = new Set<string>();
    attendanceRecords?.forEach(record => {
      for (let period = 1; period <= 6; period++) {
        const teacherId = record[`period_${period}_teacher`];
        if (teacherId && teacherId.length > 0) {
          teacherIds.add(teacherId);
        }
      }
    });

    // Fetch teacher names if we have teacher IDs
    const teacherMap = new Map<string, string>();
    if (teacherIds.size > 0) {
      const { data: teachers, error: teachersError } = await supabase
        .from('teachers')
        .select('id, first_name, last_name')
        .in('id', Array.from(teacherIds));

      if (!teachersError && teachers) {
        teachers.forEach(teacher => {
          const fullName = `${teacher.first_name} ${teacher.last_name}`;
          teacherMap.set(teacher.id, fullName);
        });
        console.log('[Student Attendance History API] Loaded teacher names:', teacherMap.size);
      }
    }

    // Transform records from database format to frontend format
    const records: Array<{
      id: string;
      date: string;
      dayOfWeek: string;
      status: 'present' | 'absent' | 'sick' | 'leave';
      courseName: string;
      period: number;
      notes?: string;
    }> = [];

    attendanceRecords?.forEach(record => {
      // Process each period (1-6)
      for (let period = 1; period <= 6; period++) {
        const status = record[`period_${period}_status`];
        const teacherId = record[`period_${period}_teacher`];
        const subject = record[`period_${period}_subject`];

        // Only include marked periods (not NOT_MARKED)
        if (status && status !== 'NOT_MARKED') {
          const recordDate = new Date(record.date);
          const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
          const dayOfWeek = dayNames[recordDate.getDay()];

          // Map database status to frontend format
          let frontendStatus: 'present' | 'absent' | 'sick' | 'leave' = 'absent';
          if (status === 'PRESENT') frontendStatus = 'present';
          else if (status === 'ABSENT') frontendStatus = 'absent';
          else if (status === 'SICK') frontendStatus = 'sick';
          else if (status === 'LEAVE') frontendStatus = 'leave';

          // Get teacher name from map, fallback to ID if not found
          const teacherName = teacherId ? (teacherMap.get(teacherId) || teacherId) : undefined;

          records.push({
            id: `${record.id}-p${period}`,
            date: record.date,
            dayOfWeek,
            status: frontendStatus,
            courseName: subject || 'Unknown Course',
            period,
            notes: teacherName ? `Marked by: ${teacherName}` : undefined,
          });
        }
      }
    });

    console.log('[Student Attendance History API] Transformed records:', records.length);

    return NextResponse.json({
      success: true,
      data: records,
      meta: {
        total: records.length,
        startDate: startDateStr,
        endDate: endDateStr,
      },
    });

  } catch (error) {
    console.error('[Student Attendance History API] Unexpected error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
