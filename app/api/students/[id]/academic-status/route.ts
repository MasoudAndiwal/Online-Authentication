/**
 * Student Academic Status API Endpoint
 * 
 * Provides academic standing information for a student.
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/students/[id]/academic-status
 * 
 * Returns academic status for a student including attendance rate and standing.
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    const { id: studentId } = await params;

    if (!studentId) {
      return NextResponse.json(
        { error: 'Student ID is required' },
        { status: 400 }
      );
    }

    // Fetch student info
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('id, first_name, last_name, class_section, status')
      .eq('id', studentId)
      .single();

    if (studentError || !student) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }

    // Get the student's student_id (varchar) used in attendance_records_new
    const attendanceStudentId = student.id;
    
    // Also try to get the student_id field if the passed id is a UUID
    const { data: studentRecord } = await supabase
      .from('students')
      .select('student_id')
      .eq('id', studentId)
      .single();
    
    const lookupId = studentRecord?.student_id || attendanceStudentId;

    // Fetch attendance records from attendance_records_new
    const { data: attendanceRecords, error: attendanceError } = await supabase
      .from('attendance_records_new')
      .select('date, period_1_status, period_2_status, period_3_status, period_4_status, period_5_status, period_6_status')
      .eq('student_id', lookupId);

    if (attendanceError) {
      console.error('Error fetching attendance:', attendanceError);
    }

    // Flatten period statuses into individual records
    const records: Array<{ status: string; date: string }> = [];
    (attendanceRecords || []).forEach(record => {
      for (let p = 1; p <= 6; p++) {
        const status = record[`period_${p}_status` as keyof typeof record] as string;
        if (status && status !== 'NOT_MARKED') {
          records.push({ status, date: record.date });
        }
      }
    });

    const totalClasses = records.length;
    const presentDays = records.filter(r => r.status === 'PRESENT').length;
    const absentDays = records.filter(r => r.status === 'ABSENT').length;
    const sickDays = records.filter(r => r.status === 'SICK').length;
    const leaveDays = records.filter(r => r.status === 'LEAVE').length;

    const attendanceRate = totalClasses > 0 ? (presentDays / totalClasses) * 100 : 100;

    // Determine academic standing based on attendance rate
    let standing: 'good' | 'warning' | 'probation' | 'critical' = 'good';
    let message = 'Your attendance is excellent. Keep up the good work!';

    if (attendanceRate < 60) {
      standing = 'critical';
      message = 'Your attendance is critically low. Please contact your advisor immediately.';
    } else if (attendanceRate < 75) {
      standing = 'probation';
      message = 'Your attendance is below the required minimum. You are on academic probation.';
    } else if (attendanceRate < 85) {
      standing = 'warning';
      message = 'Your attendance needs improvement. Please attend classes regularly.';
    }

    const academicStatus = {
      studentId,
      studentName: `${student.first_name} ${student.last_name}`,
      classSection: student.class_section,
      attendanceRate: parseFloat(attendanceRate.toFixed(2)),
      totalClasses,
      presentDays,
      absentDays,
      sickDays,
      leaveDays,
      standing,
      message,
      lastUpdated: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: academicStatus,
    });

  } catch (error) {
    console.error('Academic status API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
