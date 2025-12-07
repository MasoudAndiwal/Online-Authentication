/**
 * Student Attendance Trends API Endpoint
 * 
 * Provides weekly and monthly attendance trend data for charts.
 * Uses attendance_records_new table with period columns.
 */

import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

interface TrendDataPoint {
  label: string;
  value: number;
  present: number;
  absent: number;
  sick: number;
  leave: number;
}

/**
 * GET /api/students/attendance/trends
 * 
 * Query Parameters:
 * - studentId: Student UUID (required)
 * - type: 'weekly' | 'monthly' (default: 'weekly')
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');
    const type = searchParams.get('type') || 'weekly';

    if (!studentId) {
      return NextResponse.json(
        { success: false, error: 'Student ID is required' },
        { status: 400 }
      );
    }

    let trendData: TrendDataPoint[];

    if (type === 'monthly') {
      trendData = await getMonthlyTrends(studentId);
    } else {
      trendData = await getWeeklyTrends(studentId);
    }

    return NextResponse.json({
      success: true,
      data: trendData
    });

  } catch (error) {
    console.error('Error fetching attendance trends:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch attendance trends' },
      { status: 500 }
    );
  }
}

/**
 * Get weekly attendance trends (last 6 weeks)
 */
async function getWeeklyTrends(studentId: string): Promise<TrendDataPoint[]> {
  const trends: TrendDataPoint[] = [];
  const today = new Date();

  for (let weekOffset = 5; weekOffset >= 0; weekOffset--) {
    // Calculate week start (Saturday) and end (Thursday)
    const weekStart = new Date(today);
    const currentDay = today.getDay();
    const daysToSaturday = currentDay === 6 ? 0 : currentDay === 0 ? -1 : -(currentDay + 1);
    weekStart.setDate(today.getDate() + daysToSaturday - (weekOffset * 7));
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 5);

    const startDate = weekStart.toISOString().split('T')[0];
    const endDate = weekEnd.toISOString().split('T')[0];

    // Fetch attendance records for this week
    const { data: records } = await supabase
      .from('attendance_records_new')
      .select('period_1_status, period_2_status, period_3_status, period_4_status, period_5_status, period_6_status')
      .eq('student_id', studentId)
      .gte('date', startDate)
      .lte('date', endDate);

    // Count statuses
    let present = 0, absent = 0, sick = 0, leave = 0, total = 0;

    (records || []).forEach(record => {
      for (let p = 1; p <= 6; p++) {
        const status = record[`period_${p}_status` as keyof typeof record] as string;
        if (status && status !== 'NOT_MARKED') {
          total++;
          if (status === 'PRESENT') present++;
          else if (status === 'ABSENT') absent++;
          else if (status === 'SICK') sick++;
          else if (status === 'LEAVE') leave++;
        }
      }
    });

    const attendanceRate = total > 0 ? (present / total) * 100 : 0;

    trends.push({
      label: `Week ${6 - weekOffset}`,
      value: parseFloat(attendanceRate.toFixed(1)),
      present,
      absent,
      sick,
      leave
    });
  }

  return trends;
}

/**
 * Get monthly attendance trends (last 4 months)
 */
async function getMonthlyTrends(studentId: string): Promise<TrendDataPoint[]> {
  const trends: TrendDataPoint[] = [];
  const today = new Date();
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  for (let monthOffset = 3; monthOffset >= 0; monthOffset--) {
    const targetDate = new Date(today.getFullYear(), today.getMonth() - monthOffset, 1);
    const monthStart = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
    const monthEnd = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0);

    const startDate = monthStart.toISOString().split('T')[0];
    const endDate = monthEnd.toISOString().split('T')[0];

    // Fetch attendance records for this month
    const { data: records } = await supabase
      .from('attendance_records_new')
      .select('period_1_status, period_2_status, period_3_status, period_4_status, period_5_status, period_6_status')
      .eq('student_id', studentId)
      .gte('date', startDate)
      .lte('date', endDate);

    // Count statuses
    let present = 0, absent = 0, sick = 0, leave = 0, total = 0;

    (records || []).forEach(record => {
      for (let p = 1; p <= 6; p++) {
        const status = record[`period_${p}_status` as keyof typeof record] as string;
        if (status && status !== 'NOT_MARKED') {
          total++;
          if (status === 'PRESENT') present++;
          else if (status === 'ABSENT') absent++;
          else if (status === 'SICK') sick++;
          else if (status === 'LEAVE') leave++;
        }
      }
    });

    const attendanceRate = total > 0 ? (present / total) * 100 : 0;

    trends.push({
      label: monthNames[targetDate.getMonth()],
      value: parseFloat(attendanceRate.toFixed(1)),
      present,
      absent,
      sick,
      leave
    });
  }

  return trends;
}
