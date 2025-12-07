import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/supabase';

/**
 * GET /api/schedule/class
 * Fetch all schedule entries for a specific class (all days of the week)
 * 
 * Query parameters:
 * - classId: UUID of the class (required)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const classId = searchParams.get('classId');

    if (!classId) {
      return NextResponse.json(
        { error: 'classId is required' },
        { status: 400 }
      );
    }

    // Fetch all schedule entries for this class from database
    const { data: scheduleEntries, error: scheduleError } = await supabase
      .from('schedule_entries')
      .select('*')
      .eq('class_id', classId)
      .order('day_of_week', { ascending: true })
      .order('start_time', { ascending: true });

    if (scheduleError) {
      console.error('[Schedule Class API] Error fetching schedule:', scheduleError);
      return NextResponse.json(
        { 
          error: 'Failed to fetch schedule entries',
          details: scheduleError.message 
        },
        { status: 500 }
      );
    }

    // Map database entries to the expected format
    const mappedEntries = (scheduleEntries || []).map((entry: any) => ({
      id: entry.id,
      classId: entry.class_id,
      teacherName: entry.teacher_name,
      teacherId: entry.teacher_id,
      subject: entry.subject,
      hours: entry.hours,
      dayOfWeek: entry.day_of_week,
      startTime: entry.start_time,
      endTime: entry.end_time,
      createdAt: entry.created_at,
      updatedAt: entry.updated_at,
    }));

    return NextResponse.json({
      success: true,
      data: mappedEntries,
      total: mappedEntries.length,
    });

  } catch (error) {
    console.error('[Schedule Class API] Unexpected error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
