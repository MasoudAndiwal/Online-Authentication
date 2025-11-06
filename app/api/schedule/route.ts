import { NextRequest, NextResponse } from 'next/server';
import { SAMPLE_CLASSES, type ScheduleEntry } from '@/lib/data/schedule-data';
import supabase from '@/lib/supabase';

/**
 * Generate a default schedule template for classes without specific schedule data
 * 
 * Schedule Structure:
 * - Morning: 8:30 AM - 12:30 PM (6 periods of 40 min each)
 * - Afternoon: 1:15 PM - 5:30 PM (6 periods of 40 min each)
 * - 15-minute break after every 3 periods
 */
function generateDefaultSchedule(dayOfWeek: string, session: string): Array<ScheduleEntry & { periodNumber: number }> {
  const isMorning = session === 'MORNING';
  const schedule = [];

  // Morning: 8:30 - 12:30 (4 hours = 240 minutes)
  // Afternoon: 1:15 - 5:30 (4 hours 15 minutes = 255 minutes)
  // 6 periods × 40 min = 240 min + 15 min break = 255 min total

  const morningTimes = [
    { start: '08:30', end: '09:10' }, // Period 1
    { start: '09:10', end: '09:50' }, // Period 2
    { start: '09:50', end: '10:30' }, // Period 3
    { start: '10:45', end: '11:25' }, // Period 4 (after 15-min break)
    { start: '11:25', end: '12:05' }, // Period 5
    { start: '12:05', end: '12:45' }, // Period 6
  ];

  const afternoonTimes = [
    { start: '13:15', end: '13:55' }, // Period 1
    { start: '13:55', end: '14:35' }, // Period 2
    { start: '14:35', end: '15:15' }, // Period 3
    { start: '15:30', end: '16:10' }, // Period 4 (after 15-min break)
    { start: '16:10', end: '16:50' }, // Period 5
    { start: '16:50', end: '17:30' }, // Period 6
  ];

  const times = isMorning ? morningTimes : afternoonTimes;

  for (let i = 0; i < 6; i++) {
    const teacherNumber = Math.floor(i / 2) + 1;

    schedule.push({
      id: `default-${i + 1}`,
      teacherName: `Teacher ${teacherNumber}`,
      subject: `Subject ${i + 1}`,
      hours: 1,
      dayOfWeek: dayOfWeek.toLowerCase(),
      startTime: times[i].start,
      endTime: times[i].end,
      periodNumber: i + 1,
    });
  }

  return schedule;
}

/**
 * GET /api/schedule
 * Fetch schedule entries for a specific class and day
 * 
 * Query parameters:
 * - classId: UUID of the class
 * - dayOfWeek: Day of the week (saturday, sunday, monday, etc.)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const classId = searchParams.get('classId');
    const dayOfWeek = searchParams.get('dayOfWeek');
    const className = searchParams.get('className');
    const session = searchParams.get('session');

    if (!classId && (!className || !session)) {
      return NextResponse.json(
        { error: 'Either classId or (className and session) is required' },
        { status: 400 }
      );
    }

    if (!dayOfWeek) {
      return NextResponse.json(
        { error: 'dayOfWeek is required' },
        { status: 400 }
      );
    }

    // First, try to fetch from the database
    let dbClassId = classId;

    console.log('[Schedule API] Request params:', { classId, className, session, dayOfWeek });

    // If we don't have classId but have className and session, look up the class
    if (!dbClassId && className && session) {
      console.log('[Schedule API] Looking up class by name and session...');
      const { data: classData, error: classError } = await supabase
        .from('classes')
        .select('id')
        .eq('name', className)
        .eq('session', session)
        .single();

      if (classError) {
        console.log('[Schedule API] Class lookup error:', classError);
      }

      if (!classError && classData) {
        dbClassId = classData.id;
        console.log('[Schedule API] Found class ID:', dbClassId);
      }
    }

    // Fetch schedule entries from database
    if (dbClassId) {
      console.log('[Schedule API] Fetching schedule entries for class:', dbClassId, 'day:', dayOfWeek);
      const { data: scheduleEntries, error: scheduleError } = await supabase
        .from('schedule_entries')
        .select('*')
        .eq('class_id', dbClassId)
        .eq('day_of_week', dayOfWeek.toLowerCase())
        .order('start_time', { ascending: true });

      if (scheduleError) {
        console.log('[Schedule API] Schedule fetch error:', scheduleError);
      }

      console.log('[Schedule API] Found schedule entries:', scheduleEntries?.length || 0);

      if (!scheduleError && scheduleEntries && scheduleEntries.length > 0) {
        // Map database entries to the expected format
        type DbScheduleEntry = {
          id: string;
          teacher_name: string;
          subject: string;
          hours: number;
          day_of_week: string;
          start_time: string;
          end_time: string;
        };

        // Define standard period times based on session
        const morningTimes = [
          { start: '08:30', end: '09:10' }, // Period 1
          { start: '09:10', end: '09:50' }, // Period 2
          { start: '09:50', end: '10:30' }, // Period 3
          { start: '10:45', end: '11:25' }, // Period 4
          { start: '11:25', end: '12:05' }, // Period 5
          { start: '12:05', end: '12:45' }, // Period 6
        ];

        const afternoonTimes = [
          { start: '13:15', end: '13:55' }, // Period 1
          { start: '13:55', end: '14:35' }, // Period 2
          { start: '14:35', end: '15:15' }, // Period 3
          { start: '15:30', end: '16:10' }, // Period 4
          { start: '16:10', end: '16:50' }, // Period 5
          { start: '16:50', end: '17:30' }, // Period 6
        ];

        const standardTimes = session === 'MORNING' ? morningTimes : afternoonTimes;

        // Expand entries that cover multiple periods (hours > 1) into individual period entries
        const expandedSchedule: any[] = [];
        
        scheduleEntries.forEach((entry: DbScheduleEntry) => {
          const hoursCount = entry.hours || 1;
          
          // If this entry covers multiple hours/periods, create separate entries for each
          for (let i = 0; i < hoursCount; i++) {
            const periodNumber = expandedSchedule.length + 1;
            
            // Use standard times for this period
            const periodTimes = standardTimes[periodNumber - 1] || standardTimes[0];
            
            expandedSchedule.push({
              id: `${entry.id}-period-${periodNumber}`,
              teacherName: entry.teacher_name,
              subject: entry.subject,
              hours: 1, // Each expanded entry represents 1 period
              dayOfWeek: entry.day_of_week,
              startTime: periodTimes.start,
              endTime: periodTimes.end,
              periodNumber: periodNumber,
            });
          }
        });

        console.log('[Schedule API] Expanded schedule entries:', expandedSchedule.length);
        console.log('[Schedule API] Returning database schedule with teachers:', expandedSchedule.map(s => s.teacherName));

        return NextResponse.json(
          {
            success: true,
            data: expandedSchedule,
            totalPeriods: expandedSchedule.length,
            source: 'database'
          },
          {
            headers: {
              'Cache-Control': 'no-store, no-cache, must-revalidate',
            }
          }
        );
      } else {
        console.log('[Schedule API] No schedule entries found in database for this day');
      }
    }

    // Fallback: Try sample data
    let classData;
    if (classId) {
      classData = SAMPLE_CLASSES.find(c => c.id === classId);
    }

    if (!classData && className && session) {
      classData = SAMPLE_CLASSES.find(
        c => c.name === className && c.session === session
      );
    }

    if (classData) {
      const daySchedule = classData.schedule.filter(
        entry => entry.dayOfWeek.toLowerCase() === dayOfWeek.toLowerCase()
      );

      const sortedSchedule = daySchedule
        .sort((a, b) => a.startTime.localeCompare(b.startTime))
        .map((entry, index) => ({
          ...entry,
          periodNumber: index + 1,
        }));

      return NextResponse.json({
        success: true,
        data: sortedSchedule,
        totalPeriods: sortedSchedule.length,
        source: 'sample_data'
      });
    }

    // Last resort: Generate default schedule
    console.log('No schedule found in database or sample data. Generating default schedule.');
    const defaultSchedule = generateDefaultSchedule(dayOfWeek, session || 'MORNING');

    return NextResponse.json({
      success: true,
      data: defaultSchedule,
      totalPeriods: defaultSchedule.length,
      source: 'default_template',
      message: 'Using default schedule template - please add schedule entries in Schedule Builder'
    });

  } catch (error) {
    console.error('Error fetching schedule:', error);
    return NextResponse.json(
      { error: 'Failed to fetch schedule' },
      { status: 500 }
    );
  }
}
