import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * GET /api/attendance/test-structure
 * Test endpoint to verify table structure and data
 */
export async function GET() {
  try {
    const results: any = {
      timestamp: new Date().toISOString(),
      tests: {},
    };

    // Test 1: Check if attendance_records_new exists
    console.log('[Test] Checking attendance_records_new table...');
    try {
      const { data, error } = await supabase
        .from('attendance_records_new')
        .select('*')
        .limit(1);
      
      results.tests.attendance_records_new = {
        exists: !error,
        error: error?.message,
        sampleRecord: data?.[0] || null,
        recordCount: data?.length || 0,
      };
    } catch (e) {
      results.tests.attendance_records_new = {
        exists: false,
        error: e instanceof Error ? e.message : 'Unknown error',
      };
    }

    // Test 2: Check if attendance_records exists
    console.log('[Test] Checking attendance_records table...');
    try {
      const { data, error } = await supabase
        .from('attendance_records')
        .select('*')
        .limit(1);
      
      results.tests.attendance_records = {
        exists: !error,
        error: error?.message,
        sampleRecord: data?.[0] || null,
        recordCount: data?.length || 0,
      };
    } catch (e) {
      results.tests.attendance_records = {
        exists: false,
        error: e instanceof Error ? e.message : 'Unknown error',
      };
    }

    // Test 3: Check students table
    console.log('[Test] Checking students table...');
    try {
      const { data, error } = await supabase
        .from('students')
        .select('id, student_id, first_name, last_name')
        .limit(3);
      
      results.tests.students = {
        exists: !error,
        error: error?.message,
        sampleRecords: data || [],
        recordCount: data?.length || 0,
      };
    } catch (e) {
      results.tests.students = {
        exists: false,
        error: e instanceof Error ? e.message : 'Unknown error',
      };
    }

    // Test 4: Try to fetch attendance with a specific class_id
    console.log('[Test] Testing attendance query with class_id...');
    const testClassId = '788a970f-a79b-49cd-ab97-8cabf6f3f752';
    try {
      const { data, error } = await supabase
        .from('attendance_records_new')
        .select('*')
        .eq('class_id', testClassId)
        .limit(5);
      
      results.tests.attendance_query = {
        success: !error,
        error: error?.message,
        classId: testClassId,
        recordsFound: data?.length || 0,
        sampleRecords: data || [],
      };
    } catch (e) {
      results.tests.attendance_query = {
        success: false,
        error: e instanceof Error ? e.message : 'Unknown error',
      };
    }

    return NextResponse.json({
      success: true,
      results,
    });

  } catch (error) {
    console.error('[Test] Error:', error);
    return NextResponse.json(
      { 
        error: 'Test failed', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
