/**
 * Teacher Dashboard Metrics API
 * Fetches real metrics for teacher dashboard from database
 */

import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const teacherId = searchParams.get('teacherId');

    if (!teacherId) {
      return NextResponse.json(
        { error: 'Teacher ID is required' },
        { status: 400 }
      );
    }

    // Get teacher's assigned classes from teachers table
    const { data: teacher, error: teacherError } = await supabase
      .from('teachers')
      .select('classes')
      .eq('id', teacherId)
      .single();

    if (teacherError) {
      console.error('Error fetching teacher:', teacherError);
    }

    const teacherClasses = teacher?.classes || [];
    const totalClasses = teacherClasses.length;

    // Get total students in teacher's classes
    let totalStudents = 0;
    let studentsAtRisk = 0;

    if (teacherClasses.length > 0) {
      // Teacher classes are stored as "ClassName - SESSION" format
      // Students class_section is also stored in same format
      const { data: students, error: studentsError } = await supabase
        .from('students')
        .select('id')
        .in('class_section', teacherClasses);

      if (studentsError) {
        console.error('Error fetching students:', studentsError);
      }

      totalStudents = students?.length || 0;
      const studentIds = students?.map(s => s.id) || [];

      // Calculate attendance rate and at-risk students
      if (studentIds.length > 0) {
        // Get attendance records for the last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const startDate = thirtyDaysAgo.toISOString().split('T')[0];

        const { data: attendanceRecords } = await supabase
          .from('attendance_records_new')
          .select('student_id, period_1_status, period_2_status, period_3_status, period_4_status, period_5_status, period_6_status')
          .in('student_id', studentIds)
          .gte('date', startDate);

        // Calculate per-student attendance rates
        const studentAttendance = new Map<string, { total: number; present: number }>();
        
        studentIds.forEach(id => studentAttendance.set(id, { total: 0, present: 0 }));

        (attendanceRecords || []).forEach(record => {
          const stats = studentAttendance.get(record.student_id);
          if (stats) {
            for (let p = 1; p <= 6; p++) {
              const status = record[`period_${p}_status` as keyof typeof record] as string;
              if (status && status !== 'NOT_MARKED') {
                stats.total++;
                if (status === 'PRESENT') stats.present++;
              }
            }
          }
        });

        // Calculate overall attendance rate and count at-risk students
        let totalPresent = 0;
        let totalPeriods = 0;

        studentAttendance.forEach((stats) => {
          totalPresent += stats.present;
          totalPeriods += stats.total;
          
          // Student is at-risk if attendance < 75%
          if (stats.total > 0) {
            const rate = (stats.present / stats.total) * 100;
            if (rate < 75) {
              studentsAtRisk++;
            }
          }
        });

        const weeklyAttendanceRate = totalPeriods > 0 
          ? parseFloat(((totalPresent / totalPeriods) * 100).toFixed(1))
          : 0;

        return NextResponse.json({
          totalStudents,
          totalClasses,
          weeklyAttendanceRate,
          studentsAtRisk,
        });
      }
    }

    // Return zeros if no data
    return NextResponse.json({
      totalStudents,
      totalClasses,
      weeklyAttendanceRate: 0,
      studentsAtRisk: 0,
    });

  } catch (error) {
    console.error('Error fetching teacher metrics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch teacher metrics' },
      { status: 500 }
    );
  }
}
