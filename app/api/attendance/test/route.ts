import { NextResponse } from 'next/server';
import supabase from '@/lib/supabase';

/**
 * GET /api/attendance/test
 * Test endpoint to verify attendance_records table structure
 */
export async function GET() {
  try {
    console.log('[Attendance Test] Testing database connection...');

    // Test 1: Check if table exists by trying to query it
    const { data, error } = await supabase
      .from('attendance_records')
      .select('*')
      .limit(1);

    if (error) {
      console.error('[Attendance Test] Table query failed:', error);
      
      return NextResponse.json({
        success: false,
        test: 'attendance_records table',
        status: 'FAILED',
        error: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
        recommendation: 'Run scripts/fix_attendance_table_schema.sql in your Supabase SQL Editor'
      }, { status: 500 });
    }

    console.log('[Attendance Test] Table query successful');

    return NextResponse.json({
      success: true,
      test: 'attendance_records table',
      status: 'OK',
      message: 'Table exists and is accessible',
      recordCount: data?.length || 0,
      sampleRecord: data?.[0] || null,
      note: 'If you see this message, your table is working correctly!'
    });

  } catch (error) {
    console.error('[Attendance Test] Unexpected error:', error);
    
    return NextResponse.json({
      success: false,
      test: 'attendance_records table',
      status: 'ERROR',
      error: error instanceof Error ? error.message : 'Unknown error',
      recommendation: 'Check your Supabase connection and run scripts/fix_attendance_table_schema.sql'
    }, { status: 500 });
  }
}
