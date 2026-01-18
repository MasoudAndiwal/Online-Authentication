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

    console.log('[Teacher Classes API] Request received with teacherId:', teacherId);

    // Step 1: Get teacher's assigned classes
    let teacherClasses: string[] = [];
    
    if (teacherId) {
      const { data: teacher, error: teacherError } = await supabase
        .from('teachers')
        .select('id, username, first_name, last_name, classes')
        .eq('id', teacherId)
        .single();

      if (teacherError) {
        console.error('[Teacher Classes API] Error fetching teacher:', teacherError);
        // If teacher not found, return empty array
        return NextResponse.json([]);
      }

      console.log('[Teacher Classes API] Teacher found:', {
        id: teacher?.id,
        username: teacher?.username,
        name: `${teacher?.first_name} ${teacher?.last_name}`,
        classes: teacher?.classes
      });

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

    console.log('[Teacher Classes API] Total classes in database:', allClasses?.length || 0);

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
        const isMatch = teacherClasses.includes(classKey);
        
        if (isMatch) {
          console.log('[Teacher Classes API] Matched class:', classKey);
        }
        
        return isMatch;
      });
      
      console.log('[Teacher Classes API] Filtered classes count:', filteredClasses.length);
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

    // Transform classes to match frontend interface
    const transformedClasses = filteredClasses.map((cls) => {
      const session = cls.session || 'MORNING';
      // Database stores class_section as "AI-401-A - AFTERNOON" (uppercase session)
      const classKey = `${cls.name} - ${session.toUpperCase()}`;
      
      // Also try lowercase session format
      const classKeyLower = `${cls.name} - ${session}`;
      const count = studentCountByClass[classKey] || studentCountByClass[classKeyLower] || 0;
      
      return {
        id: cls.id,
        name: cls.name,
        session: session,
        major: cls.major || '',
        semester: Number(cls.semester || 1),
        studentCount: count,
        scheduleCount: scheduleCountByClass[cls.id] || 0,
        // Additional fields for teacher dashboard
        schedule: [], // TODO: Fetch actual schedule
        attendanceRate: 94.2, // TODO: Calculate from attendance records
      };
    });

    console.log('[Teacher Classes API] Transformed classes:', transformedClasses.length);
    console.log('[Teacher Classes API] Returning classes:', JSON.stringify(transformedClasses, null, 2));

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