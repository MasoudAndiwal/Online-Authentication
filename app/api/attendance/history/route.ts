import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Get query parameters
    const classId = searchParams.get('classId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const dateRange = searchParams.get('dateRange') || '30'; // Default 30 days
    
    if (!classId) {
      return NextResponse.json(
        { error: 'Class ID is required' },
        { status: 400 }
      );
    }

    // Calculate date range if not provided
    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate 
      ? new Date(startDate) 
      : new Date(end.getTime() - parseInt(dateRange) * 24 * 60 * 60 * 1000);

    // Format dates for SQL query
    const startDateStr = start.toISOString().split('T')[0];
    const endDateStr = end.toISOString().split('T')[0];

    // Check which table structure exists
    let useNewStructure = false;
    try {
      const { error: checkError } = await supabase
        .from('attendance_records_new')
        .select('period_1_status')
        .limit(1);
      
      if (!checkError) {
        useNewStructure = true;
      }
    } catch (_e) {
      // Using old table structure
    }

    let attendanceRecords: Array<{
      id: string;
      student_id: string;
      status: string;
      period_number: number;
      date: string;
      marked_at: string;
      marked_by: string | null;
      teacher_name: string | null;
      subject: string | null;
      notes: string | null;
    }> = [];

    if (useNewStructure) {
      // NEW STRUCTURE: Fetch from attendance_records_new
      const { data, error: attendanceError } = await supabase
        .from('attendance_records_new')
        .select('*')
        .eq('class_id', classId)
        .gte('date', startDateStr)
        .lte('date', endDateStr)
        .order('date', { ascending: false });

      if (attendanceError) {
        console.error('[Attendance History API] Error fetching from attendance_records_new:', attendanceError);
        return NextResponse.json(
          { error: 'Failed to fetch attendance records from new table', details: attendanceError.message },
          { status: 500 }
        );
      }

      // Transform new structure to flat records
      attendanceRecords = [];
      data?.forEach(record => {
        for (let period = 1; period <= 6; period++) {
          const status = record[`period_${period}_status`];
          if (status && status !== 'NOT_MARKED') {
            attendanceRecords.push({
              id: `${record.id}-p${period}`,
              student_id: record.student_id,
              status,
              period_number: period,
              date: record.date,
              marked_at: record.marked_at,
              marked_by: record.marked_by,
              teacher_name: record[`period_${period}_teacher`],
              subject: record[`period_${period}_subject`],
              notes: null,
            });
          }
        }
      });
    } else {
      // OLD STRUCTURE: Fetch from attendance_records
      const { data, error: attendanceError } = await supabase
        .from('attendance_records')
        .select('*')
        .eq('class_id', classId)
        .gte('date', startDateStr)
        .lte('date', endDateStr)
        .order('date', { ascending: false });

      if (attendanceError) {
        console.error('[Attendance History API] Error fetching from attendance_records:', attendanceError);
        return NextResponse.json(
          { error: 'Failed to fetch attendance records from old table', details: attendanceError.message },
          { status: 500 }
        );
      }

      // Transform old structure to flat records
      attendanceRecords = data?.map(record => ({
        id: record.id,
        student_id: record.student_id,
        status: record.status,
        period_number: record.period_number || 1,
        date: record.date,
        marked_at: record.marked_at,
        marked_by: record.marked_by,
        teacher_name: record.teacher_name,
        subject: record.subject,
        notes: record.notes,
      })) || [];
    }

    // Get unique student IDs
    const studentIds = [...new Set(attendanceRecords?.map(r => r.student_id) || [])];

    if (studentIds.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          records: [],
          dailyStats: [],
          overallStats: {
            totalRecords: 0,
            present: 0,
            absent: 0,
            sick: 0,
            leave: 0,
            notMarked: 0,
            dateRange: {
              start: startDateStr,
              end: endDateStr,
            },
          },
        },
      });
    }

    // Fetch student information
    let students: Array<{
      id: string;
      student_id: string;
      first_name: string;
      last_name: string;
      class_section: string;
      programs: string;
    }> = [];
    let studentsError: Error | null = null;

    try {
      const result = await supabase
        .from('students')
        .select('id, student_id, first_name, last_name, class_section, programs')
        .in('id', studentIds);
      
      students = result.data || [];
      studentsError = result.error as Error | null;
      
      // If no students found by id, try matching by student_id field
      if (students.length === 0 && !studentsError) {
        const result2 = await supabase
          .from('students')
          .select('id, student_id, first_name, last_name, class_section, programs')
          .in('student_id', studentIds);
        
        students = result2.data || [];
        studentsError = result2.error as Error | null;
      }
    } catch (e) {
      console.error('[Attendance History API] Exception fetching students:', e);
      studentsError = e as Error;
    }

    if (studentsError) {
      console.error('[Attendance History API] Error fetching students:', studentsError);
      // Don't fail the whole request, just return records without student details
      students = [];
    }

    // Create a map of student info for quick lookup
    const studentMap = new Map<string, {
      studentId: string;
      studentName: string;
      classSection: string;
      programs: string;
    }>();
    
    students?.forEach(s => {
      const studentInfo = {
        studentId: s.student_id,
        studentName: `${s.first_name} ${s.last_name}`,
        classSection: s.class_section,
        programs: s.programs,
      };
      // Map by both id and student_id
      studentMap.set(s.id, studentInfo);
      studentMap.set(s.student_id, studentInfo);
    });

    // Combine attendance records with student info
    const records = attendanceRecords?.map(record => ({
      id: record.id,
      date: record.date,
      studentId: studentMap.get(record.student_id)?.studentId || 'Unknown',
      studentName: studentMap.get(record.student_id)?.studentName || 'Unknown Student',
      status: record.status,
      periodNumber: record.period_number,
      markedAt: record.marked_at,
      markedBy: record.marked_by || record.teacher_name,
      subject: record.subject,
      notes: record.notes,
    })) || [];

    // Calculate daily statistics
    const dailyStatsMap = new Map<string, {
      date: string;
      total: number;
      present: number;
      absent: number;
      sick: number;
      leave: number;
      notMarked: number;
    }>();

    // Get unique dates
    const uniqueDates = [...new Set(attendanceRecords?.map(r => r.date) || [])];

    for (const date of uniqueDates) {
      const dateRecords = attendanceRecords?.filter(r => r.date === date) || [];
      
      // Get unique students for this date
      const uniqueStudents = new Map<string, string>();
      dateRecords.forEach(r => {
        if (!uniqueStudents.has(r.student_id)) {
          uniqueStudents.set(r.student_id, r.status);
        }
      });

      const statuses = Array.from(uniqueStudents.values());
      
      dailyStatsMap.set(date, {
        date,
        total: uniqueStudents.size,
        present: statuses.filter(s => s === 'PRESENT').length,
        absent: statuses.filter(s => s === 'ABSENT').length,
        sick: statuses.filter(s => s === 'SICK').length,
        leave: statuses.filter(s => s === 'LEAVE').length,
        notMarked: statuses.filter(s => s === 'NOT_MARKED').length,
      });
    }

    const dailyStats = Array.from(dailyStatsMap.values()).map(stat => ({
      ...stat,
      rate: stat.total > 0 ? Math.round((stat.present / stat.total) * 100) : 0,
    }));

    // Calculate overall statistics
    const overallStats = {
      totalRecords: records.length,
      present: records.filter(r => r.status === 'PRESENT').length,
      absent: records.filter(r => r.status === 'ABSENT').length,
      sick: records.filter(r => r.status === 'SICK').length,
      leave: records.filter(r => r.status === 'LEAVE').length,
      notMarked: records.filter(r => r.status === 'NOT_MARKED').length,
      dateRange: {
        start: startDateStr,
        end: endDateStr,
      },
    };

    return NextResponse.json({
      success: true,
      data: {
        records,
        dailyStats,
        overallStats,
      },
    });

  } catch (error) {
    console.error('[Attendance History API] Unexpected error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
