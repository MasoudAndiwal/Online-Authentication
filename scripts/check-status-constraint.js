/**
 * Check Status Constraint
 * 
 * This script checks what status values are allowed in attendance_records
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

async function checkStatusConstraint() {
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  console.log('🔍 Checking what status values are allowed...\n');
  
  // Try different common status values to see which ones work
  const statusesToTest = [
    'PRESENT',
    'ABSENT', 
    'SICK',
    'LEAVE',
    'present',
    'absent',
    'sick',
    'leave',
    'Present',
    'Absent',
    'Sick',
    'Leave',
    'P',
    'A',
    'S',
    'L',
    'EXCUSED',
    'UNEXCUSED',
    'TARDY',
    'LATE'
  ];
  
  const studentId = '074b0ea2-c8dc-4d68-a3f6-7135be022d24';
  const classId = '675e3916-c726-4837-a83f-21895d8f2986'; // From previous output
  
  console.log('🧪 Testing different status values...\n');
  
  const workingStatuses = [];
  const failedStatuses = [];
  
  for (const status of statusesToTest) {
    try {
      const testRecord = {
        student_id: studentId,
        class_id: classId,
        date: '2024-11-21', // Use a unique date for each test
        status: status,
        marked_by: 'Test System',
        marked_at: new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from('attendance_records_new')
        .insert([testRecord])
        .select();
      
      if (error) {
        failedStatuses.push({ status, error: error.message });
        console.log(`❌ "${status}": ${error.message}`);
      } else {
        workingStatuses.push(status);
        console.log(`✅ "${status}": SUCCESS`);
        
        // Clean up the test record
        await supabase
          .from('attendance_records_new')
          .delete()
          .eq('id', data[0].id);
      }
      
    } catch (err) {
      failedStatuses.push({ status, error: err.message });
      console.log(`💥 "${status}": ${err.message}`);
    }
  }
  
  console.log('\n📋 SUMMARY:');
  console.log('==========');
  
  if (workingStatuses.length > 0) {
    console.log(`✅ WORKING STATUS VALUES (${workingStatuses.length}):`);
    workingStatuses.forEach(status => {
      console.log(`   - "${status}"`);
    });
  } else {
    console.log('❌ NO WORKING STATUS VALUES FOUND');
  }
  
  if (failedStatuses.length > 0) {
    console.log(`\n❌ FAILED STATUS VALUES (${failedStatuses.length}):`);
    failedStatuses.forEach(({ status, error }) => {
      console.log(`   - "${status}": ${error}`);
    });
  }
  
  return workingStatuses;
}

async function main() {
  console.log('🚀 Checking attendance status constraints...\n');
  
  const workingStatuses = await checkStatusConstraint();
  
  if (workingStatuses.length > 0) {
    console.log('\n🎉 Found working status values!');
    console.log('💡 Use these values when creating attendance records.');
  } else {
    console.log('\n😞 No working status values found.');
    console.log('🔍 You may need to check the database schema or constraints.');
  }
}

main().catch(error => {
  console.error('💥 Script crashed:', error);
  process.exit(1);
});