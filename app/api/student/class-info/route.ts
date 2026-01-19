/**
 * Student Class Information API Route
 * 
 * GET /api/student/class-info - Get class information and schedule for the logged-in student
 */

import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth/server-session';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const session = await getServerSession();
    
    if (!session || session.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get student data including class_section
    const { data: studentData, error: studentError } = await supabase
      .from('students')
      .select('class_section, programs, semester')
      .eq('id', session.id)
      .single();

    if (studentError || !studentData) {
      console.error('Error fetching student data:', studentError);
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    const classSection = studentData.class_section; // e.g., "CS-301-A - MORNING"
    
    if (!classSection) {
      return NextResponse.json({ error: 'No class assigned to student' }, { status: 404 });
    }

    // Parse class_section to get class name and session
    const parts = classSection.split(' - ');
    const className = parts[0]?.trim(); // e.g., "CS-301-A"
    const sessionTime = parts[1]?.trim(); // e.g., "MORNING"

    if (!className) {
      return NextResponse.json({ error: 'Invalid class section format' }, { status: 400 });
    }

    // Get class details from classes table
    const { data: classData, error: classError } = await supabase
      .from('classes')
      .select('*')
      .eq('name', className)
      .eq('session', sessionTime)
      .single();

    if (classError || !classData) {
      console.error('Error fetching class data:', classError);
      return NextResponse.json({ error: 'Class not found' }, { status: 404 });
    }

    // Get schedule entries for this class
    const { data: scheduleData, error: scheduleError } = await supabase
      .from('schedule_entries')
      .select('*')
      .eq('class_id', classData.id)
      .order('start_time', { ascending: true });

    if (scheduleError) {
      console.error('Error fetching schedule:', scheduleError);
      return NextResponse.json({ error: 'Failed to fetch schedule' }, { status: 500 });
    }

    // Day order for sorting
    const dayOrder: { [key: string]: number } = {
      'sunday': 0,
      'monday': 1,
      'tuesday': 2,
      'wednesday': 3,
      'thursday': 4,
      'friday': 5,
      'saturday': 6,
    };

    // Sort schedule by day of week
    const sortedSchedule = (scheduleData || []).sort((a, b) => {
      const dayA = dayOrder[a.day_of_week?.toLowerCase()] ?? 7;
      const dayB = dayOrder[b.day_of_week?.toLowerCase()] ?? 7;
      return dayA - dayB;
    });
    
    // Transform schedule data
    const schedule = sortedSchedule.map(entry => {
      // Capitalize day name
      const dayName = entry.day_of_week 
        ? entry.day_of_week.charAt(0).toUpperCase() + entry.day_of_week.slice(1).toLowerCase()
        : 'Unknown';

      return {
        day: dayName,
        startTime: entry.start_time || '',
        endTime: entry.end_time || '',
        room: 'TBA', // No room column in schedule_entries
        sessionType: 'lecture' as const,
        teacherName: entry.teacher_name || 'TBA',
        teacherId: entry.teacher_id || null,
      };
    });

    // Get unique teachers for this class
    const teacherIds = [...new Set(sortedSchedule?.map(e => e.teacher_id).filter(Boolean))];
    const teachers = [];

    for (const teacherId of teacherIds) {
      const { data: teacherData } = await supabase
        .from('teachers')
        .select('id, first_name, last_name')
        .eq('id', teacherId)
        .single();

      if (teacherData) {
        // Get sessions for this teacher
        const teacherSessions = sortedSchedule
          ?.filter(e => e.teacher_id === teacherId)
          .map(e => {
            const dayName = e.day_of_week 
              ? e.day_of_week.charAt(0).toUpperCase() + e.day_of_week.slice(1).toLowerCase()
              : 'Unknown';
            
            return {
              day: dayName,
              time: `${e.start_time} - ${e.end_time}`,
              type: 'lecture',
            };
          }) || [];

        teachers.push({
          id: teacherData.id,
          name: `${teacherData.first_name} ${teacherData.last_name}`.trim(),
          title: 'Teacher',
          sessions: teacherSessions,
        });
      }
    }

    // Count students in this class
    const { count: studentCount } = await supabase
      .from('students')
      .select('*', { count: 'exact', head: true })
      .eq('class_section', classSection);

    // Return class information
    return NextResponse.json({
      success: true,
      data: {
        className: classData.name,
        classCode: classData.name, // Using name as code
        semester: studentData.semester || 1,
        academicYear: '2024-2025', // TODO: Get from system settings
        credits: 3, // TODO: Get from class data if available
        room: 'TBA', // Room info not in schedule_entries
        building: 'Main Building', // TODO: Get from class data if available
        major: studentData.programs || 'Unknown',
        studentCount: studentCount || 0,
        session: sessionTime,
        schedule,
        teachers,
        maxAbsences: 10, // TODO: Get from system settings
        mahroomThreshold: 75, // TODO: Get from system settings
        tasdiqThreshold: 85, // TODO: Get from system settings
      },
    });
  } catch (error) {
    console.error('Error in student class info API:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
