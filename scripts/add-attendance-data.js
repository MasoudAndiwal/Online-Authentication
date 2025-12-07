/**
 * Add Test Attendance Data
 * 
 * This script adds test attendance records for the student to fix API errors
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

async function addTestAttendanceData() {
  const supabase = createClient(supabaseUrl, supabaseKey);
  const studentId = '074b0ea2-c8dc-4d68-a3f6-7135be022d24';
  
  console.log('🔧 Adding test attendance data...');
  
  try {
    // First, check if we have any schedule entries
    const { data: scheduleCheck } = await supabase
      .from('schedule_entries')
      .select('*')
      .eq('student_id', studentId)
      .limit(1);
    
    console.log('📅 Existing schedule entries:', scheduleCheck?.length || 0);
    
    // Add some basic schedule entries if they don't exist
    if (!scheduleCheck || scheduleCheck.length === 0) {
      console.log('📝 Creating schedule entries...');
      
      const scheduleEntries = [
        {
          id: 'sched-cs-mon',
          student_id: studentId,
          subject: 'Computer Science 101',
          start_time: '08:00',
          end_time: '09:30',
          day_of_week: 'MONDAY'
        },
        {
          id: 'sched-math-mon',
          student_id: studentId,
          subject: 'Mathematics 201',
          start_time: '10:00',
          end_time: '11:30',
          day_of_week: 'MONDAY'
        },
        {
          id: 'sched-cs-tue',
          student_id: studentId,
          subject: 'Computer Science 101',
          start_time: '08:00',
          end_time: '09:30',
          day_of_week: 'TUESDAY'
        },
        {
          id: 'sched-math-tue',
          student_id: studentId,
          subject: 'Mathematics 201',
          start_time: '10:00',
          end_time: '11:30',
          day_of_week: 'TUESDAY'
        }
      ];
      
      const { error: scheduleError } = await supabase
        .from('schedule_entries')
        .upsert(scheduleEntries);
      
      if (scheduleError) {
        console.error('❌ Failed to create schedule entries:', scheduleError.message);
      } else {
        console.log('✅ Schedule entries created');
      }
    }
    
    // Now add attendance records
    console.log('📊 Adding attendance records...');
    
    const attendanceRecords = [
      // Week 1 - Recent data
      {
        id: 'att-cs-mon-1',
        student_id: studentId,
        date: '2024-11-18',
        period: 1,
        status: 'present',
        marked_by: 'Dr. Ahmed Hassan',
        marked_at: '2024-11-18T08:15:00Z',
        schedule_entry_id: 'sched-cs-mon'
      },
      {
        id: 'att-math-mon-1',
        student_id: studentId,
        date: '2024-11-18',
        period: 2,
        status: 'present',
        marked_by: 'Prof. Sarah Johnson',
        marked_at: '2024-11-18T10:15:00Z',
        schedule_entry_id: 'sched-math-mon'
      },
      {
        id: 'att-cs-tue-1',
        student_id: studentId,
        date: '2024-11-19',
        period: 1,
        status: 'sick',
        marked_by: 'Dr. Ahmed Hassan',
        marked_at: '2024-11-19T08:15:00Z',
        schedule_entry_id: 'sched-cs-tue'
      },
      {
        id: 'att-math-tue-1',
        student_id: studentId,
        date: '2024-11-19',
        period: 2,
        status: 'sick',
        marked_by: 'Prof. Sarah Johnson',
        marked_at: '2024-11-19T10:15:00Z',
        schedule_entry_id: 'sched-math-tue'
      },
      {
        id: 'att-cs-wed-1',
        student_id: studentId,
        date: '2024-11-20',
        period: 1,
        status: 'present',
        marked_by: 'Dr. Ahmed Hassan',
        marked_at: '2024-11-20T08:15:00Z',
        schedule_entry_id: 'sched-cs-mon'
      },
      {
        id: 'att-math-wed-1',
        student_id: studentId,
        date: '2024-11-20',
        period: 2,
        status: 'present',
        marked_by: 'Prof. Sarah Johnson',
        marked_at: '2024-11-20T10:15:00Z',
        schedule_entry_id: 'sched-math-mon'
      },
      
      // Week 2 - Older data
      {
        id: 'att-cs-mon-2',
        student_id: studentId,
        date: '2024-11-11',
        period: 1,
        status: 'present',
        marked_by: 'Dr. Ahmed Hassan',
        marked_at: '2024-11-11T08:15:00Z',
        schedule_entry_id: 'sched-cs-mon'
      },
      {
        id: 'att-math-mon-2',
        student_id: studentId,
        date: '2024-11-11',
        period: 2,
        status: 'present',
        marked_by: 'Prof. Sarah Johnson',
        marked_at: '2024-11-11T10:15:00Z',
        schedule_entry_id: 'sched-math-mon'
      },
      {
        id: 'att-cs-tue-2',
        student_id: studentId,
        date: '2024-11-12',
        period: 1,
        status: 'present',
        marked_by: 'Dr. Ahmed Hassan',
        marked_at: '2024-11-12T08:15:00Z',
        schedule_entry_id: 'sched-cs-tue'
      },
      {
        id: 'att-math-tue-2',
        student_id: studentId,
        date: '2024-11-12',
        period: 2,
        status: 'absent',
        marked_by: 'Prof. Sarah Johnson',
        marked_at: '2024-11-12T10:15:00Z',
        schedule_entry_id: 'sched-math-tue'
      }
    ];
    
    const { error: attendanceError } = await supabase
      .from('attendance_records')
      .upsert(attendanceRecords);
    
    if (attendanceError) {
      console.error('❌ Failed to create attendance records:', attendanceError.message);
      return false;
    }
    
    console.log('✅ Attendance records created');
    
    // Verify the data
    const { data: verifyData, error: verifyError } = await supabase
      .from('attendance_records')
      .select(`
        date,
        period,
        status,
        marked_by,
        schedule_entries (
          subject
        )
      `)
      .eq('student_id', studentId)
      .order('date', { ascending: false })
      .limit(5);
    
    if (verifyError) {
      console.error('❌ Failed to verify data:', verifyError.message);
      return false;
    }
    
    console.log('📋 Sample attendance records:');
    verifyData?.forEach(record => {
      console.log(`  ${record.date} P${record.period}: ${record.status} (${record.schedule_entries?.subject || 'Unknown'})`);
    });
    
    return true;
    
  } catch (error) {
    console.error('💥 Error adding test data:', error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Starting attendance data setup...\n');
  
  const success = await addTestAttendanceData();
  
  if (success) {
    console.log('\n🎉 SUCCESS! Test attendance data has been added.');
    console.log('📡 Now test the APIs - they should work properly.');
  } else {
    console.log('\n❌ FAILED! Could not add test attendance data.');
    console.log('🔍 Check the error messages above for details.');
  }
}

main().catch(error => {
  console.error('💥 Script crashed:', error);
  process.exit(1);
});