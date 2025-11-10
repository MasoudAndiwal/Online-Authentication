import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/supabase';

/**
 * GET /api/teachers/classes
 * Fetch classes assigned to a specific teacher
 * Query params:
 * - teacherId: The teacher's ID (optional, will use from auth in future)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const teacherId = searchParams.get('teacherId');

    console.log('[Teacher Classes API] Fetching classes for teacher:', teacherId);

    // Step 1: Get teacher's assigned classes
    let teacherClasses: string[] = [];
    
    if (teacherId) {
      const { data: teacher, error: teacherError } = await supabase
        .from('teachers')
        .select('classes')
        .eq('id', teacherId)
        .single();

      if (teacherError) {
        console.error('[Teacher Classes API] Error fetching teacher:', teacherError);
        // If teacher not found, return empty array
        return NextResponse.json([]);
      }

      teacherClasses = teacher?.classes || [];
      console.log('[Teacher Classes API] Teacher assigned classes:', teacherClasses);
    }

    // Step 2: Get all classes from database
    const { data: allClasses, error: classError } = await supabase
      .from('classes')
      .select('*')
      .order('name', { ascending: true });

    if (classError) {
      console.error('[Teacher Classes API] Error fetching classes:', classError);
      throw classError;
    }

    if (!allClasses || allClasses.length === 0) {
      console.log('[Teacher Classes API] No classes found in database');
      return NextResponse.json([]);
    }

    // Step 3: Filter classes based on teacher assignment
    let filteredClasses = allClasses;
    
    if (teacherId && teacherClasses.length > 0) {
      // Filter classes that match teacher's assigned classes
      // Teacher classes are stored as "ClassName - Session" format
      filteredClasses = allClasses.filter(cls => {
        const classKey = `${cls.name} - ${cls.session || 'MORNING'}`;
        return teacherClasses.includes(classKey);
      });
      
      console.log('[Teacher Classes API] Filtered to', filteredClasses.length, 'assigned classes');
    } else {
      // If no teacherId provided or no classes assigned, return all classes for now
      // This allows the system to work even without proper teacher assignment
      console.log('[Teacher Classes API] No teacher filter applied, returning all classes');
    }

    // Get class IDs for additional data
    const classIds = filteredClasses.map((c) => c.id);

    // Fetch schedule entries count
    let scheduleCountByClass: Record<string, number> = {};
    if (classIds.length > 0) {
      const { data: entries, error: entriesError } = await supabase
        .from('schedule_entries')
        .select('class_id')
        .in('class_id', classIds);

      if (!entriesError && entries) {
        scheduleCountByClass = entries.reduce((acc, e) => {
          acc[e.class_id] = (acc[e.class_id] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
      }
    }

    // Fetch students and count by class_section
    let studentCountByClass: Record<string, number> = {};
    const { data: students, error: studentsError } = await supabase
      .from('students')
      .select('class_section');

    if (!studentsError && students) {
      studentCountByClass = students.reduce((acc, s) => {
        const key = s.class_section || '';
        if (key) {
          acc[key] = (acc[key] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>);
    }

    // Helper function to capitalize first letter
    const capitalizeFirst = (str: string) => {
      return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    };

    // Transform classes to match frontend interface
    const transformedClasses = filteredClasses.map((cls) => {
      const session = cls.session || 'MORNING';
      // Database stores as "AI-401-A - Morning" (capitalized first letter)
      const classKey = `${cls.name} - ${capitalizeFirst(session)}`;
      
      console.log('[Teacher Classes API] Looking for students with classKey:', classKey);
      
      return {
        id: cls.id,
        name: cls.name,
        session: session,
        major: cls.major || '',
        semester: Number(cls.semester || 1),
        studentCount: studentCountByClass[classKey] || 0,
        scheduleCount: scheduleCountByClass[cls.id] || 0,
        // Additional fields for teacher dashboard
        schedule: [], // TODO: Fetch actual schedule
        attendanceRate: 94.2, // TODO: Calculate from attendance records
        nextSession: new Date(Date.now() + 24 * 60 * 60 * 1000), // TODO: Calculate from schedule
      };
    });

    console.log('[Teacher Classes API] Successfully fetched', transformedClasses.length, 'classes');

    return NextResponse.json(transformedClasses);

  } catch (error) {
    console.error('[Teacher Classes API] Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch teacher classes',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}