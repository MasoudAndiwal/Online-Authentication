import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getSession } from '@/lib/auth/session';
import { validateStudentDataAccess } from '@/lib/auth/read-only-middleware';

/**
 * GET /api/students/dashboard
 * Fetch dashboard metrics for a specific student
 * Returns: totalClasses, attendanceRate, presentDays, absentDays, sickDays, leaveDays
 * 
 * Requirements: 10.2, 10.4 - Data privacy controls
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');

    if (!studentId) {
      return NextResponse.json(
        { error: 'Missing required parameter: studentId' },
        { status: 400 }
      );
    }

    // Validate data access - students can only view their own data
    const session = getSession();
    const accessCheck = validateStudentDataAccess(session, studentId);
    
    if (!accessCheck.allowed) {
      return NextResponse.json(
        { error: accessCheck.error || 'Access denied' },
        { status: 403 }
      );
    }

    console.log('[Student Dashboard API] Fetching metrics for student:', studentId);

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
        console.log('[Student Dashboard API] Using new table structure');
      }
    } catch (e) {
      console.log('[Student Dashboard API] Using old table structure');
    }

    // Fetch all attendance records for the student
    const { data: attendanceRecords, error: attendanceError } = await supabase
      .from(tableName)
      .select('*')
      .eq('student_id', studentId);

    if (attendanceError) {
      console.error('[Student Dashboard API] Error fetching attendance:', attendanceError);
      return NextResponse.json(
        { error: 'Failed to fetch attendance records', details: attendanceError.message },
        { status: 500 }
      );
    }

    // Calculate metrics
    let totalClasses = 0;
    let presentCount = 0;
    let absentCount = 0;
    let sickCount = 0;
    let leaveCount = 0;

    if (useNewStructure && attendanceRecords && attendanceRecords.length > 0) {
      // NEW STRUCTURE: Count each period separately
      attendanceRecords.forEach((record: any) => {
        for (let period = 1; period <= 6; period++) {
          const status = record[`period_${period}_status`];
          if (status && status !== 'NOT_MARKED') {
            totalClasses++;
            if (status === 'PRESENT') presentCount++;
            else if (status === 'ABSENT') absentCount++;
            else if (status === 'SICK') sickCount++;
            else if (status === 'LEAVE') leaveCount++;
          }
        }
      });
    } else {
      // OLD STRUCTURE: Count individual records
      attendanceRecords?.forEach((record: any) => {
        if (record.status && record.status !== 'NOT_MARKED') {
          totalClasses++;
          if (record.status === 'PRESENT') presentCount++;
          else if (record.status === 'ABSENT') absentCount++;
          else if (record.status === 'SICK') sickCount++;
          else if (record.status === 'LEAVE') leaveCount++;
        }
      });
    }

    // Calculate attendance rate
    const attendanceRate = totalClasses > 0 
      ? (presentCount / totalClasses) * 100 
      : 0;

    // Get student's class ID for class average calculation
    const { data: studentData, error: studentError } = await supabase
      .from('students')
      .select('class_id')
      .eq('id', studentId)
      .single();

    let classAverage = 0;
    let ranking = 0;

    if (!studentError && studentData?.class_id) {
      // Fetch all students in the same class
      const { data: classStudents, error: classError } = await supabase
        .from('students')
        .select('id')
        .eq('class_id', studentData.class_id);

      if (!classError && classStudents && classStudents.length > 0) {
        // Calculate attendance rate for each student in the class
        const studentRates: { id: string; rate: number }[] = [];

        for (const student of classStudents) {
          const { data: studentRecords } = await supabase
            .from(tableName)
            .select('*')
            .eq('student_id', student.id);

          let studentTotal = 0;
          let studentPresent = 0;

          if (useNewStructure && studentRecords && studentRecords.length > 0) {
            studentRecords.forEach((record: any) => {
              for (let period = 1; period <= 6; period++) {
                const status = record[`period_${period}_status`];
                if (status && status !== 'NOT_MARKED') {
                  studentTotal++;
                  if (status === 'PRESENT') studentPresent++;
                }
              }
            });
          } else if (studentRecords) {
            studentRecords.forEach((record: any) => {
              if (record.status && record.status !== 'NOT_MARKED') {
                studentTotal++;
                if (record.status === 'PRESENT') studentPresent++;
              }
            });
          }

          const rate = studentTotal > 0 ? (studentPresent / studentTotal) * 100 : 0;
          studentRates.push({ id: student.id, rate });
        }

        // Calculate class average
        const totalRate = studentRates.reduce((sum, s) => sum + s.rate, 0);
        classAverage = studentRates.length > 0 
          ? parseFloat((totalRate / studentRates.length).toFixed(1))
          : 0;

        // Calculate ranking (how many students have lower attendance)
        const studentsWithLowerRate = studentRates.filter(s => s.rate < attendanceRate).length;
        ranking = studentsWithLowerRate + 1;
      }
    }

    const metrics = {
      totalClasses,
      attendanceRate: parseFloat(attendanceRate.toFixed(1)),
      presentDays: presentCount,
      absentDays: absentCount,
      sickDays: sickCount,
      leaveDays: leaveCount,
      classAverage,
      ranking,
    };

    console.log('[Student Dashboard API] Calculated metrics:', metrics);

    return NextResponse.json({
      success: true,
      data: metrics,
    });

  } catch (error) {
    console.error('[Student Dashboard API] Unexpected error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch dashboard metrics',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
