/**
 * Add Attendance Data with Class ID
 * 
 * This script adds attendance records with the required class_id field
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

async function addAttendanceWithClass() {
  const supabase = createClient(supabaseUrl, supabaseKey);
  const studentId = '074b0ea2-c8dc-4d68-a3f6-7135be022d24';
  
  console.log('🔧 Adding attendance data with class ID...');
  
  try {
    // First, get the student's class information
    console.log('👤 Getting student class information...');
    
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('class_section')
      .eq('id', studentId)
      .single();
    
    if (studentError) {
      console.error('❌ Failed to get student:', studentError.message);
      return false;
    }
    
    const classSection = student.class_section;
    console.log(`🏫 Student class section: ${classSection}`);
    
    // Find the class ID that matches this class section
    console.log('🔍 Finding matching class ID...');
    
    const { data: classes, error: classError } = await supabase
      .from('classes')
      .select('*');
    
    if (classError) {
      console.error('❌ Failed to get classes:', classError.message);
      return false;
    }
    
    console.log('📋 Available classes:');
    classes?.forEach(cls => {
      console.log(`   ${cls.id}: ${cls.name} (${cls.session})`);
    });
    
    // Try to find a matching class or use the first available one
    let targetClass = classes?.find(cls => 
      cls.name?.includes('AI-401') || 
      cls.name?.includes('401') ||
      cls.session?.includes('AFTERNOON')
    );
    
    if (!targetClass && classes && classes.length > 0) {
      targetClass = classes[0]; // Use first available class
      console.log('⚠️ No exact match found, using first available class');
    }
    
    if (!targetClass) {
      console.error('❌ No classes found in database');
      return false;
    }
    
    const classId = targetClass.id;
    console.log(`✅ Using class: ${targetClass.name} (ID: ${classId})`);
    
    // Now add attendance records with the class_id
    console.log('\n📊 Adding attendance records...');
    
    const attendanceRecords = [
      // Recent week
      {
        student_id: studentId,
        class_id: classId,
        date: '2024-11-20',
        status: 'present',
        marked_by: 'Dr. Ahmed Hassan',
        marked_at: '2024-11-20T08:15:00Z'
      },
      {
        student_id: studentId,
        class_id: classId,
        date: '2024-11-19',
        status: 'sick',
        marked_by: 'Prof. Sarah Johnson',
        marked_at: '2024-11-19T08:15:00Z'
      },
      {
        student_id: studentId,
        class_id: classId,
        date: '2024-11-18',
        status: 'present',
        marked_by: 'Dr. Ahmed Hassan',
        marked_at: '2024-11-18T08:15:00Z'
      },
      {
        student_id: studentId,
        class_id: classId,
        date: '2024-11-17',
        status: 'present',
        marked_by: 'Prof. Sarah Johnson',
        marked_at: '2024-11-17T08:15:00Z'
      },
      {
        student_id: studentId,
        class_id: classId,
        date: '2024-11-16',
        status: 'present',
        marked_by: 'Dr. Ahmed Hassan',
        marked_at: '2024-11-16T08:15:00Z'
      },
      
      // Previous week
      {
        student_id: studentId,
        class_id: classId,
        date: '2024-11-13',
        status: 'present',
        marked_by: 'Dr. Ahmed Hassan',
        marked_at: '2024-11-13T08:15:00Z'
      },
      {
        student_id: studentId,
        class_id: classId,
        date: '2024-11-12',
        status: 'absent',
        marked_by: 'Prof. Sarah Johnson',
        marked_at: '2024-11-12T08:15:00Z'
      },
      {
        student_id: studentId,
        class_id: classId,
        date: '2024-11-11',
        status: 'present',
        marked_by: 'Dr. Ahmed Hassan',
        marked_at: '2024-11-11T08:15:00Z'
      },
      {
        student_id: studentId,
        class_id: classId,
        date: '2024-11-10',
        status: 'present',
        marked_by: 'Prof. Sarah Johnson',
        marked_at: '2024-11-10T08:15:00Z'
      },
      {
        student_id: studentId,
        class_id: classId,
        date: '2024-11-09',
        status: 'present',
        marked_by: 'Dr. Ahmed Hassan',
        marked_at: '2024-11-09T08:15:00Z'
      },
      
      // Even older records for better statistics
      {
        student_id: studentId,
        class_id: classId,
        date: '2024-11-06',
        status: 'present',
        marked_by: 'Dr. Ahmed Hassan',
        marked_at: '2024-11-06T08:15:00Z'
      },
      {
        student_id: studentId,
        class_id: classId,
        date: '2024-11-05',
        status: 'leave',
        marked_by: 'Prof. Sarah Johnson',
        marked_at: '2024-11-05T08:15:00Z'
      },
      {
        student_id: studentId,
        class_id: classId,
        date: '2024-11-04',
        status: 'present',
        marked_by: 'Dr. Ahmed Hassan',
        marked_at: '2024-11-04T08:15:00Z'
      }
    ];
    
    const { data: insertedData, error: insertError } = await supabase
      .from('attendance_records')
      .insert(attendanceRecords)
      .select();
    
    if (insertError) {
      console.error('❌ Failed to insert attendance records:', insertError.message);
      return false;
    }
    
    console.log(`✅ Successfully added ${insertedData.length} attendance records`);
    
    // Verify the data
    console.log('\n🔍 Verifying attendance data...');
    
    const { data: verifyData, error: verifyError } = await supabase
      .from('attendance_records')
      .select('*')
      .eq('student_id', studentId)
      .order('date', { ascending: false });
    
    if (verifyError) {
      console.error('❌ Failed to verify data:', verifyError.message);
      return false;
    }
    
    console.log(`📊 Total attendance records: ${verifyData.length}`);
    
    if (verifyData.length > 0) {
      console.log('📋 Recent records:');
      verifyData.slice(0, 5).forEach(record => {
        console.log(`  ${record.date}: ${record.status} (${record.marked_by || 'Unknown'})`);
      });
      
      // Calculate stats
      const totalRecords = verifyData.length;
      const presentCount = verifyData.filter(r => r.status === 'present').length;
      const absentCount = verifyData.filter(r => r.status === 'absent').length;
      const sickCount = verifyData.filter(r => r.status === 'sick').length;
      const leaveCount = verifyData.filter(r => r.status === 'leave').length;
      const attendanceRate = totalRecords > 0 ? (presentCount / totalRecords * 100).toFixed(2) : 0;
      
      console.log(`\n📈 Attendance Statistics:`);
      console.log(`   Total Classes: ${totalRecords}`);
      console.log(`   Present: ${presentCount}`);
      console.log(`   Absent: ${absentCount}`);
      console.log(`   Sick: ${sickCount}`);
      console.log(`   Leave: ${leaveCount}`);
      console.log(`   Attendance Rate: ${attendanceRate}%`);
    }
    
    return true;
    
  } catch (error) {
    console.error('💥 Error:', error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Starting attendance data setup with class ID...\n');
  
  const success = await addAttendanceWithClass();
  
  if (success) {
    console.log('\n🎉 SUCCESS! Attendance data has been added with proper class ID.');
    console.log('📡 Now test the APIs - they should work properly.');
    console.log('\n🔗 Test the APIs:');
    console.log('   Dashboard API: http://localhost:3000/api/students/dashboard?studentId=074b0ea2-c8dc-4d68-a3f6-7135be022d24');
    console.log('   Weekly API: http://localhost:3000/api/students/attendance/weekly?studentId=074b0ea2-c8dc-4d68-a3f6-7135be022d24&week=0');
  } else {
    console.log('\n❌ FAILED! Could not add attendance data.');
  }
}

main().catch(error => {
  console.error('💥 Script crashed:', error);
  process.exit(1);
});