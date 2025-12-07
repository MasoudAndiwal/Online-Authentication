/**
 * Check Database Table Structure
 * 
 * This script examines the actual database schema to understand the table structure
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

async function checkTableStructure() {
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  console.log('🔍 Checking database table structure...\n');
  
  try {
    // Check what tables exist
    console.log('📋 Available tables:');
    
    const tables = [
      'students',
      'attendance_records',
      'attendance_records_new', 
      'schedule_entries',
      'classes',
      'teachers',
      'subjects'
    ];
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1);
        
        if (error) {
          console.log(`❌ ${table}: ${error.message}`);
        } else {
          console.log(`✅ ${table}: exists (${data?.length || 0} sample records)`);
          
          // Show sample structure
          if (data && data.length > 0) {
            const sampleRecord = data[0];
            const columns = Object.keys(sampleRecord);
            console.log(`   Columns: ${columns.join(', ')}`);
          }
        }
      } catch (err) {
        console.log(`❌ ${table}: ${err.message}`);
      }
    }
    
    console.log('\n📊 Detailed attendance_records structure:');
    
    // Try to get attendance records structure
    const { data: attendanceData, error: attendanceError } = await supabase
      .from('attendance_records')
      .select('*')
      .limit(1);
    
    if (attendanceError) {
      console.log('❌ Cannot access attendance_records:', attendanceError.message);
    } else {
      if (attendanceData && attendanceData.length > 0) {
        console.log('Sample record:', JSON.stringify(attendanceData[0], null, 2));
      } else {
        console.log('No records found, trying to get table info...');
        
        // Try a different approach - get all records to see structure
        const { data: allData } = await supabase
          .from('attendance_records')
          .select('*');
        
        console.log(`Total records: ${allData?.length || 0}`);
      }
    }
    
    console.log('\n📅 Detailed schedule_entries structure:');
    
    // Try to get schedule entries structure  
    const { data: scheduleData, error: scheduleError } = await supabase
      .from('schedule_entries')
      .select('*')
      .limit(1);
    
    if (scheduleError) {
      console.log('❌ Cannot access schedule_entries:', scheduleError.message);
    } else {
      if (scheduleData && scheduleData.length > 0) {
        console.log('Sample record:', JSON.stringify(scheduleData[0], null, 2));
      } else {
        console.log('No records found');
      }
    }
    
    console.log('\n👤 Student record structure:');
    
    // Check the specific student
    const studentId = '074b0ea2-c8dc-4d68-a3f6-7135be022d24';
    const { data: studentData, error: studentError } = await supabase
      .from('students')
      .select('*')
      .eq('id', studentId)
      .single();
    
    if (studentError) {
      console.log('❌ Cannot get student:', studentError.message);
    } else {
      console.log('Student record:', JSON.stringify(studentData, null, 2));
    }
    
  } catch (error) {
    console.error('💥 Error checking structure:', error.message);
  }
}

checkTableStructure();