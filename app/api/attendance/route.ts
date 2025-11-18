import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getSession } from '@/lib/auth/session';

/**
 * POST /api/attendance
 * Save attendance records for a class on a specific date
 * Backward compatible: Works with current table structure
 * 
 * Requirements: 10.3, 10.4 - Read-only access enforcement
 */
export async function POST(request: NextRequest) {
  try {
    // Enforce read-only access - students cannot mark attendance
    const session = getSession();
    if (session?.role === 'STUDENT') {
      return NextResponse.json(
        { 
          error: 'Access denied. Students have read-only access and cannot mark attendance.',
          code: 'READ_ONLY_ACCESS'
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { classId, date, records, markedBy } = body;

    if (!classId || !date || !records || !Array.isArray(records)) {
      return NextResponse.json(
        { error: 'Missing required fields: classId, date, records' },
        { status: 400 }
      );
    }

    console.log(`[Attendance API] Saving ${records.length} attendance records for class ${classId} on ${date}`);

    // Check if new table structure exists by trying to query the new table
    let useNewStructure = false;
    try {
      const { error: checkError } = await supabase
        .from('attendance_records_new')
        .select('period_1_status')
        .limit(1);
      
      if (!checkError) {
        useNewStructure = true;
        console.log('[Attendance API] Using new table structure (attendance_records_new)');
      }
    } catch (e) {
      console.log('[Attendance API] Using old table structure (attendance_records)');
    }

    if (useNewStructure) {
      // NEW STRUCTURE: Group records by student to create one record per student
      const studentRecords = new Map();
      
      records.forEach((record: {
        studentId: string;
        status: string;
        periodNumber?: number;
        teacherName?: string;
        subject?: string;
        notes?: string;
      }) => {
        const studentId = record.studentId;
        const periodNumber = record.periodNumber || 1;
        
        if (!studentRecords.has(studentId)) {
          studentRecords.set(studentId, {
            student_id: studentId,
            class_id: classId,
            date: date,
            period_1_status: 'NOT_MARKED',
            period_2_status: 'NOT_MARKED',
            period_3_status: 'NOT_MARKED',
            period_4_status: 'NOT_MARKED',
            period_5_status: 'NOT_MARKED',
            period_6_status: 'NOT_MARKED',
            period_1_teacher: null,
            period_2_teacher: null,
            period_3_teacher: null,
            period_4_teacher: null,
            period_5_teacher: null,
            period_6_teacher: null,
            period_1_subject: null,
            period_2_subject: null,
            period_3_subject: null,
            period_4_subject: null,
            period_5_subject: null,
            period_6_subject: null,
            marked_by: markedBy || null,
            marked_at: new Date().toISOString(),
          });
        }
        
        const studentRecord = studentRecords.get(studentId);
        
        // Set the status for the specific period
        if (periodNumber >= 1 && periodNumber <= 6) {
          studentRecord[`period_${periodNumber}_status`] = record.status;
          studentRecord[`period_${periodNumber}_teacher`] = record.teacherName || null;
          studentRecord[`period_${periodNumber}_subject`] = record.subject || null;
        }
      });

      const attendanceData = Array.from(studentRecords.values());

      // Use UPSERT to update existing records or insert new ones
      // This will only update the students sent in the request, not delete others
      const { data, error: upsertError } = await supabase
        .from('attendance_records_new')
        .upsert(attendanceData, {
          onConflict: 'student_id,class_id,date',
          ignoreDuplicates: false
        })
        .select();

      if (upsertError) {
        console.error('[Attendance API] Error upserting records:', upsertError);
        return NextResponse.json(
          { error: 'Failed to save attendance records', details: upsertError.message },
          { status: 500 }
        );
      }

      console.log(`[Attendance API] Successfully saved ${data?.length || 0} student records`);

      return NextResponse.json({
        success: true,
        saved: data?.length || 0,
        message: `Successfully saved attendance for ${data?.length || 0} students`,
      });

    } else {
      // OLD STRUCTURE: Save individual records as before
      const attendanceData = records.map((record: {
        studentId: string;
        status: string;
        periodNumber?: number;
        teacherName?: string;
        subject?: string;
        notes?: string;
      }) => ({
        student_id: record.studentId,
        class_id: classId,
        date: date,
        period_number: record.periodNumber || null,
        status: record.status,
        teacher_name: record.teacherName || null,
        subject: record.subject || null,
        notes: record.notes || null,
        marked_by: markedBy || null,
        marked_at: new Date().toISOString(),
      }));

      // Use UPSERT to update existing records or insert new ones
      // This will only update the records sent in the request, not delete others
      const { data, error: upsertError } = await supabase
        .from('attendance_records')
        .upsert(attendanceData, {
          onConflict: 'student_id,class_id,date,period_number',
          ignoreDuplicates: false
        })
        .select();

      if (upsertError) {
        console.error('[Attendance API] Error upserting records:', upsertError);
        return NextResponse.json(
          { error: 'Failed to save attendance records', details: upsertError.message },
          { status: 500 }
        );
      }

      console.log(`[Attendance API] Successfully saved ${data?.length || 0} records`);

      return NextResponse.json({
        success: true,
        saved: data?.length || 0,
        message: `Successfully saved attendance for ${data?.length || 0} student-period combinations`,
      });
    }

  } catch (error) {
    console.error('[Attendance API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to save attendance', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/attendance
 * Fetch attendance records for a class on a specific date
 * Backward compatible: Works with both old and new table structures
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const classId = searchParams.get('classId');
    const date = searchParams.get('date');

    console.log('[Attendance API GET] Request params:', { classId, date });

    if (!classId || !date) {
      return NextResponse.json(
        { error: 'Missing required parameters: classId, date' },
        { status: 400 }
      );
    }

    // Check if new table structure exists
    let useNewStructure = false;
    let tableName = 'attendance_records';
    try {
      const { error: checkError } = await supabase
        .from('attendance_records_new')
        .select('period_1_status')
        .limit(1);
      
      if (!checkError) {
        useNewStructure = true;
        tableName = 'attendance_records_new';
        console.log('[Attendance API GET] Using new table structure (attendance_records_new)');
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      console.log('[Attendance API GET] Using old table structure (attendance_records)');
    }

    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .eq('class_id', classId)
      .eq('date', date);

    if (error) {
      console.error('[Attendance API] Error fetching records:', error);
      console.error('[Attendance API] Error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      
      // Provide more specific error message
      let errorMessage = 'Failed to fetch attendance records';
      if (error.message.includes('relation') || error.message.includes('does not exist')) {
        errorMessage = 'Database table "attendance_records" not found or has incorrect schema. Please run the update script: scripts/update_attendance_table_schema.sql';
      } else if (error.message.includes('column')) {
        errorMessage = `Database column error: ${error.message}. The table schema may need to be updated.`;
      } else if (error.message.includes('invalid input syntax for type uuid')) {
        errorMessage = `Invalid class ID format. Expected UUID format, got: "${classId}". Please select a class from your dashboard.`;
      }
      
      return NextResponse.json(
        { 
          error: errorMessage,
          details: error.message,
          hint: 'Check server logs for more information'
        },
        { status: 500 }
      );
    }

    let expandedRecords: any[] = [];

    if (useNewStructure && data && data.length > 0 && data[0].period_1_status !== undefined) {
      // NEW STRUCTURE: Convert back to old format for compatibility
      data.forEach((record: any) => {
        // Create 6 separate records for each period (for compatibility with existing UI)
        for (let period = 1; period <= 6; period++) {
          const status = record[`period_${period}_status`] || 'NOT_MARKED';
          const teacher = record[`period_${period}_teacher`];
          const subject = record[`period_${period}_subject`];
          
          // Only include records that are actually marked (not NOT_MARKED)
          if (status !== 'NOT_MARKED') {
            expandedRecords.push({
              student_id: record.student_id,
              class_id: record.class_id,
              date: record.date,
              period_number: period,
              status: status,
              teacher_name: teacher,
              subject: subject,
              marked_by: record.marked_by,
              marked_at: record.marked_at,
            });
          }
        }
      });
      
      console.log('[Attendance API GET] Successfully fetched', data.length, 'student records, expanded to', expandedRecords.length, 'period records');
      console.log('[Attendance API GET] Sample expanded records:', expandedRecords.slice(0, 3));
    } else {
      // OLD STRUCTURE: Return data as is
      expandedRecords = data || [];
      console.log('[Attendance API GET] Successfully fetched', expandedRecords.length, 'period records');
      console.log('[Attendance API GET] Sample records:', expandedRecords.slice(0, 3));
    }

    return NextResponse.json({
      success: true,
      data: expandedRecords,
    });

  } catch (error) {
    console.error('[Attendance API] Unexpected error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch attendance',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
