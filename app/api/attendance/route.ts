import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/supabase';

/**
 * POST /api/attendance
 * Save attendance records for a class on a specific date
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { classId, date, records, markedBy } = body;

    if (!classId || !date || !records || !Array.isArray(records)) {
      return NextResponse.json(
        { error: 'Missing required fields: classId, date, records' },
        { status: 400 }
      );
    }

    console.log(`[Attendance API] Saving ${records.length} attendance records for class ${classId} on ${date}`);

    // Prepare attendance records for insertion
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

    // Delete existing attendance records for this class and date
    const { error: deleteError } = await supabase
      .from('attendance_records')
      .delete()
      .eq('class_id', classId)
      .eq('date', date);

    if (deleteError) {
      console.error('[Attendance API] Error deleting existing records:', deleteError);
      // Continue anyway - the upsert might still work
    }

    // Insert new attendance records
    const { data, error: insertError } = await supabase
      .from('attendance_records')
      .insert(attendanceData)
      .select();

    if (insertError) {
      console.error('[Attendance API] Error inserting records:', insertError);
      return NextResponse.json(
        { error: 'Failed to save attendance records', details: insertError.message },
        { status: 500 }
      );
    }

    console.log(`[Attendance API] Successfully saved ${data?.length || 0} records`);

    return NextResponse.json({
      success: true,
      saved: data?.length || 0,
      message: `Successfully saved attendance for ${data?.length || 0} student-period combinations`,
    });

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

    const { data, error } = await supabase
      .from('attendance_records')
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
        errorMessage = 'Database table "attendance_records" not found or has incorrect schema. Please run the fix script: scripts/fix_attendance_table_schema.sql';
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

    console.log('[Attendance API GET] Successfully fetched', data?.length || 0, 'records');

    return NextResponse.json({
      success: true,
      data: data || [],
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
