/**
 * Add Correct Attendance Data
 * 
 * This script adds attendance records using the correct database structure
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

async function addCorrectAttendanceData() {
  const supabase = createClient(supabaseUrl, supabaseKey);
  const studentId = '074b0ea2-c8dc-4d68-a3f6-7135be022d24';
  const classSection = 'AI-401-A - AFTERNOON';
  
  console.log('🔧 Adding attendance data with correct structure...');
  console.log(`👤 Student: ${studentId}`);
  console.log(`🏫 Class: ${classSection}`);
  
  try {
    // First, let's check what the attendance_records table structure actually expects
    console.log('\n📊 Checking attendance_records table structure...');
    
    // Let's try to insert a simple record to see what columns are required
    const testRecord = {
      student_id: studentId,
      date: '2024-11-20',
      status: 'present',
      marked_by: 'System Test',
      marked_at: new Date().toISOString()
    };
    
    console.log('🧪 Testing with basic record structure...');
    
    const { data: testData, error: testError } = await supabase
      .from('attendance_records')
      .insert([testRecord])
      .select();
    
    if (testError) {
      console.log('❌ Test insert failed:', testError.message);
      console.log('🔍 This tells us about the required structure');
      
      // Let's try a different approach - check if there are any existing records to see structure
      const { data: existingRecords } = await supabase
        .from('attendance_records')
        .select('*')
        .limit(1);
      
      if (existingRecords && existingRecords.length > 0) {
        console.log('📋 Found existing record structure:', existingRecords[0]);
      } else {
        console.log('📋 No existing records to examine structure');
        
        // Try with minimal structure
        const minimalRecord = {
          student_id: studentId,
          date: '2024-11-20',
          status: 'present'
        };
        
        const { error: minimalError } = await supabase
          .from('attendance_records')
          .insert([minimalRecord]);
        
        if (minimalError) {
          console.log('❌ Minimal insert failed:', minimalError.message);
        } else {
          console.log('✅ Minimal insert succeeded!');
        }
      }
    } else {
      console.log('✅ Test insert succeeded!');
      console.log('📋 Inserted record:', testData);
      
      // Now add more comprehensive records
      console.log('\n📊 Adding comprehensive attendance records...');
      
      const attendanceRecords = [
        // Recent week
        {
          student_id: studentId,
          date: '2024-11-18',
          status: 'present',
          marked_by: 'Dr. Ahmed Hassan',
          marked_at: '2024-11-18T08:15:00Z'
        },
        {
          student_id: studentId,
          date: '2024-11-19',
          status: 'sick',
          marked_by: 'Prof. Sarah Johnson',
          marked_at: '2024-11-19T08:15:00Z'
        },
        {
          student_id: studentId,
          date: '2024-11-17',
          status: 'present',
          marked_by: 'Dr. Ahmed Hassan',
          marked_at: '2024-11-17T08:15:00Z'
        },
        {
          student_id: studentId,
          date: '2024-11-16',
          status: 'present',
          marked_by: 'Prof. Sarah Johnson',
          marked_at: '2024-11-16T08:15:00Z'
        },
        
        // Previous week
        {
          student_id: studentId,
          date: '2024-11-11',
          status: 'present',
          marked_by: 'Dr. Ahmed Hassan',
          marked_at: '2024-11-11T08:15:00Z'
        },
        {
          student_id: studentId,
          date: '2024-11-12',
          status: 'absent',
          marked_by: 'Prof. Sarah Johnson',
          marked_at: '2024-11-12T08:15:00Z'
        },
        {
          student_id: studentId,
          date: '2024-11-13',
          status: 'present',
          marked_by: 'Dr. Ahmed Hassan',
          marked_at: '2024-11-13T08:15:00Z'
        },
        {
          student_id: studentId,
          date: '2024-11-14',
          status: 'present',
          marked_by: 'Prof. Sarah Johnson',
          marked_at: '2024-11-14T08:15:00Z'
        }
      ];
      
      const { data: bulkData, error: bulkError } = await supabase
        .from('attendance_records')
        .insert(attendanceRecords)
        .select();
      
      if (bulkError) {
        console.error('❌ Bulk insert failed:', bulkError.message);
      } else {
        console.log(`✅ Successfully added ${bulkData.length} attendance records`);
      }
    }
    
    // Verify final data
    console.log('\n🔍 Verifying attendance data...');
    
    const { data: finalData, error: finalError } = await supabase
      .from('attendance_records')
      .select('*')
      .eq('student_id', studentId)
      .order('date', { ascending: false });
    
    if (finalError) {
      console.error('❌ Failed to verify data:', finalError.message);
    } else {
      console.log(`📊 Total attendance records for student: ${finalData.length}`);
      
      if (finalData.length > 0) {
        console.log('📋 Recent records:');
        finalData.slice(0, 5).forEach(record => {
          console.log(`  ${record.date}: ${record.status} (marked by: ${record.marked_by || 'Unknown'})`);
        });
        
        // Calculate basic stats
        const totalRecords = finalData.length;
        const presentCount = finalData.filter(r => r.status === 'present').length;
        const attendanceRate = totalRecords > 0 ? (presentCount / totalRecords * 100).toFixed(2) : 0;
        
        console.log(`\n📈 Basic Stats:`);
        console.log(`   Total Classes: ${totalRecords}`);
        console.log(`   Present: ${presentCount}`);
        console.log(`   Attendance Rate: ${attendanceRate}%`);
      }
    }
    
    return finalData && finalData.length > 0;
    
  } catch (error) {
    console.error('💥 Error adding attendance data:', error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Starting correct attendance data setup...\n');
  
  const success = await addCorrectAttendanceData();
  
  if (success) {
    console.log('\n🎉 SUCCESS! Attendance data has been added.');
    console.log('📡 Now test the APIs - they should work properly.');
    console.log('\n🔗 Test URLs:');
    console.log('   Dashboard: http://localhost:3000/api/students/dashboard?studentId=074b0ea2-c8dc-4d68-a3f6-7135be022d24');
    console.log('   Weekly: http://localhost:3000/api/students/attendance/weekly?studentId=074b0ea2-c8dc-4d68-a3f6-7135be022d24&week=0');
  } else {
    console.log('\n❌ FAILED! Could not add attendance data.');
    console.log('🔍 Check the error messages above for details.');
  }
}

main().catch(error => {
  console.error('💥 Script crashed:', error);
  process.exit(1);
});