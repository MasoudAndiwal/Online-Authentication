/**
 * Attendance History API Route
 * 
 * GET /api/attendance/history - Get attendance history for a class
 * Supports filtering by date range
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth/server-session';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const classId = searchParams.get('classId');
    const dateRange = parseInt(searchParams.get('dateRange') || '30');

    if (!classId) {
      return NextResponse.json({ error: 'classId is required' }, { status: 400 });
    }

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - dateRange);

    // Fetch attendance records for the class within date range
    const { data: attendanceData, error: attendanceError } = await supabase
      .from('attendance_records_new')
      .select('*')
      .eq('class_id', classId)
      .gte('date', startDate.toISOString().split('T')[0])
      .lte('date', endDate.toISOString().split('T')[0])
      .order('date', { ascending: false });

    if (attendanceError) {
      console.error('Error fetching attendance records:', attendanceError);
      return NextResponse.json(
        { error: 'Failed to fetch attendance records' },
        { status: 500 }
      );
    }

    // Transform the data into individual records
    const records: Array<{
      id: string;
      date: string;
      studentId: string;
      studentName: string;
      status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
      markedAt: string;
      markedBy: string;
    }> = [];

    const dailyStatsMap = new Map<string, {
      date: string;
      total: number;
      present: number;
      absent: number;
      late: number;
      excused: number;
    }>();

    for (const record of attendanceData || []) {
      const date = record.date;
      
      // Initialize daily stats if not exists
      if (!dailyStatsMap.has(date)) {
        dailyStatsMap.set(date, {
          date,
          total: 0,
          present: 0,
          absent: 0,
          late: 0,
          excused: 0,
        });
      }

      const stats = dailyStatsMap.get(date)!;

      // Process each period (1-8)
      for (let period = 1; period <= 8; period++) {
        const statusKey = `period_${period}_status` as keyof typeof record;
        const studentIdKey = `period_${period}_student_id` as keyof typeof record;
        const studentNameKey = `period_${period}_student_name` as keyof typeof record;
        
        const status = record[statusKey];
        const studentId = record[studentIdKey];
        const studentName = record[studentNameKey];

        if (status && studentId) {
          // Add to records
          records.push({
            id: `${record.id}-${period}`,
            date,
            studentId: studentId as string,
            studentName: (studentName as string) || 'Unknown Student',
            status: status as 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED',
            markedAt: record.created_at || date,
            markedBy: record.marked_by || 'System',
          });

          // Update daily stats
          stats.total++;
          switch (status) {
            case 'PRESENT':
              stats.present++;
              break;
            case 'ABSENT':
              stats.absent++;
              break;
            case 'LATE':
              stats.late++;
              break;
            case 'EXCUSED':
              stats.excused++;
              break;
          }
        }
      }
    }

    // Convert daily stats to array and calculate rates
    const dailyStats = Array.from(dailyStatsMap.values()).map(stat => ({
      ...stat,
      rate: stat.total > 0 ? Math.round((stat.present / stat.total) * 100) : 0,
    }));

    return NextResponse.json({
      success: true,
      data: {
        records,
        dailyStats,
      },
    });
  } catch (error) {
    console.error('Error in attendance history API:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
