/**
 * Debug API Errors Script
 * 
 * This script helps identify the exact cause of 500 errors in the APIs
 */

const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config();

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔍 Debugging API Errors...');
console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key:', supabaseKey ? 'Present' : 'Missing');

async function testDatabaseConnection() {
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    console.log('\n📊 Testing database connection...');
    
    // Test basic connection
    const { data, error } = await supabase
      .from('students')
      .select('id, first_name, last_name')
      .limit(1);
    
    if (error) {
      console.error('❌ Database connection failed:', error.message);
      return false;
    }
    
    console.log('✅ Database connection successful');
    console.log('Sample student:', data?.[0] || 'No students found');
    return true;
    
  } catch (error) {
    console.error('❌ Database test failed:', error.message);
    return false;
  }
}

async function testAttendanceTable() {
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    console.log('\n📋 Testing attendance_records table...');
    
    const { data, error } = await supabase
      .from('attendance_records')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('❌ Attendance table query failed:', error.message);
      return false;
    }
    
    console.log('✅ Attendance table accessible');
    console.log('Sample record:', data?.[0] || 'No records found');
    return true;
    
  } catch (error) {
    console.error('❌ Attendance table test failed:', error.message);
    return false;
  }
}

async function testSpecificStudent() {
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const studentId = '074b0ea2-c8dc-4d68-a3f6-7135be022d24';
    
    console.log(`\n👤 Testing specific student: ${studentId}...`);
    
    // Check if student exists
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('*')
      .eq('id', studentId)
      .single();
    
    if (studentError) {
      console.error('❌ Student lookup failed:', studentError.message);
      return false;
    }
    
    console.log('✅ Student found:', {
      id: student.id,
      name: `${student.first_name} ${student.last_name}`,
      class: student.class_section
    });
    
    // Check attendance records for this student
    const { data: attendance, error: attendanceError } = await supabase
      .from('attendance_records')
      .select('*')
      .eq('student_id', studentId)
      .limit(5);
    
    if (attendanceError) {
      console.error('❌ Student attendance lookup failed:', attendanceError.message);
      return false;
    }
    
    console.log('✅ Student attendance records:', attendance?.length || 0);
    if (attendance && attendance.length > 0) {
      console.log('Sample record:', attendance[0]);
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ Student test failed:', error.message);
    return false;
  }
}

async function testCacheService() {
  try {
    console.log('\n🗄️ Testing cache service...');
    
    // Check if cache service file exists
    const fs = require('fs');
    const path = require('path');
    const cacheServicePath = path.join(__dirname, '../lib/services/cache-service.ts');
    
    if (!fs.existsSync(cacheServicePath)) {
      console.error('❌ Cache service file not found at:', cacheServicePath);
      return false;
    }
    
    console.log('✅ Cache service file exists');
    
    // For now, just check if the file exists since we can't easily test TypeScript modules in Node.js
    return true;
    
  } catch (error) {
    console.error('❌ Cache service test failed:', error.message);
    return false;
  }
}

async function testDashboardService() {
  try {
    console.log('\n📊 Testing dashboard service...');
    
    // Check if dashboard service file exists
    const fs = require('fs');
    const path = require('path');
    const dashboardServicePath = path.join(__dirname, '../lib/services/dashboard-service.ts');
    
    if (!fs.existsSync(dashboardServicePath)) {
      console.error('❌ Dashboard service file not found at:', dashboardServicePath);
      return false;
    }
    
    console.log('✅ Dashboard service file exists');
    
    // For now, just check if the file exists since we can't easily test TypeScript modules in Node.js
    return true;
    
  } catch (error) {
    console.error('❌ Dashboard service test failed:', error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Starting API Error Debug Session\n');
  
  const tests = [
    { name: 'Database Connection', fn: testDatabaseConnection },
    { name: 'Attendance Table', fn: testAttendanceTable },
    { name: 'Specific Student', fn: testSpecificStudent },
    { name: 'Cache Service', fn: testCacheService },
    { name: 'Dashboard Service', fn: testDashboardService }
  ];
  
  const results = [];
  
  for (const test of tests) {
    try {
      const result = await test.fn();
      results.push({ name: test.name, success: result });
    } catch (error) {
      console.error(`❌ ${test.name} crashed:`, error.message);
      results.push({ name: test.name, success: false, error: error.message });
    }
  }
  
  console.log('\n📋 Test Results Summary:');
  console.log('========================');
  
  results.forEach(result => {
    const status = result.success ? '✅ PASS' : '❌ FAIL';
    console.log(`${status} ${result.name}`);
    if (result.error) {
      console.log(`    Error: ${result.error}`);
    }
  });
  
  const failedTests = results.filter(r => !r.success);
  
  if (failedTests.length === 0) {
    console.log('\n🎉 All tests passed! The APIs should be working.');
  } else {
    console.log(`\n⚠️  ${failedTests.length} test(s) failed. These need to be fixed:`);
    failedTests.forEach(test => {
      console.log(`   - ${test.name}`);
    });
  }
}

// Run the debug session
main().catch(error => {
  console.error('💥 Debug session crashed:', error);
  process.exit(1);
});