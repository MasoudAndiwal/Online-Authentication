/**
 * Broadcast Recipients Count API Route
 * 
 * POST /api/messages/broadcast/recipients-count - Get count of recipients for broadcast criteria
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth/server-session';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only teachers and office can access this
    if (session.role.toLowerCase() === 'student') {
      return NextResponse.json(
        { error: 'Students cannot send broadcast messages' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { type, className, session: classSession, department } = body;

    let count = 0;

    switch (type) {
      case 'all_students': {
        const { count: studentCount, error } = await supabase
          .from('students')
          .select('*', { count: 'exact', head: true });

        if (error) {
          console.error('Error counting students:', error);
          return NextResponse.json({ error: 'Failed to count students' }, { status: 500 });
        }

        count = studentCount || 0;
        break;
      }

      case 'specific_class': {
        if (!className || !classSession) {
          return NextResponse.json(
            { error: 'Class name and session required' },
            { status: 400 }
          );
        }

        const classSection = `${className} - ${classSession}`;
        const { count: studentCount, error } = await supabase
          .from('students')
          .select('*', { count: 'exact', head: true })
          .eq('class_section', classSection);

        if (error) {
          console.error('Error counting class students:', error);
          return NextResponse.json({ error: 'Failed to count class students' }, { status: 500 });
        }

        count = studentCount || 0;
        break;
      }

      case 'all_teachers': {
        const { count: teacherCount, error } = await supabase
          .from('teachers')
          .select('*', { count: 'exact', head: true });

        if (error) {
          console.error('Error counting teachers:', error);
          return NextResponse.json({ error: 'Failed to count teachers' }, { status: 500 });
        }

        count = teacherCount || 0;
        break;
      }

      case 'specific_department': {
        if (!department) {
          return NextResponse.json(
            { error: 'Department required' },
            { status: 400 }
          );
        }

        const { count: teacherCount, error } = await supabase
          .from('teachers')
          .select('*', { count: 'exact', head: true })
          .eq('department', department);

        if (error) {
          console.error('Error counting department teachers:', error);
          return NextResponse.json({ error: 'Failed to count department teachers' }, { status: 500 });
        }

        count = teacherCount || 0;
        break;
      }

      default:
        return NextResponse.json({ error: 'Invalid recipient type' }, { status: 400 });
    }

    return NextResponse.json({ count }, { status: 200 });
  } catch (error) {
    console.error('Error in recipients count API:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
