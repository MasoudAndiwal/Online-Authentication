/**
 * Comprehensive login debugging script
 */

const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcrypt');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function debugLogin() {
  console.log('🔍 COMPREHENSIVE LOGIN DEBUG');
  console.log('============================');

  try {
    // Check students table
    console.log('\n👨‍🎓 CHECKING STUDENTS TABLE:');
    const { data: students, error: studentsError } = await supabase
      .from('students')
      .select('*');

    if (studentsError) {
      console.error('❌ Error fetching students:', studentsError);
    } else {
      console.log(`✅ Found ${students.length} students:`);
      students.forEach(student => {
        console.log(`  - ID: ${student.id}`);
        console.log(`    Username: ${student.username}`);
        console.log(`    Student ID: ${student.student_id || student.studentId}`);
        console.log(`    Student ID Ref: ${student.student_id_ref || student.studentIdRef}`);
        console.log(`    Status: ${student.status}`);
        console.log(`    Password Hash: ${student.password ? 'EXISTS' : 'MISSING'}`);
        console.log(`    Password Length: ${student.password ? student.password.length : 0}`);
        console.log('    ---');
      });
    }

    // Check teachers table
    console.log('\n👨‍🏫 CHECKING TEACHERS TABLE:');
    const { data: teachers, error: teachersError } = await supabase
      .from('teachers')
      .select('*');

    if (teachersError) {
      console.error('❌ Error fetching teachers:', teachersError);
    } else {
      console.log(`✅ Found ${teachers.length} teachers:`);
      teachers.forEach(teacher => {
        console.log(`  - ID: ${teacher.id}`);
        console.log(`    Username: ${teacher.username}`);
        console.log(`    Status: ${teacher.status}`);
        console.log(`    Password Hash: ${teacher.password ? 'EXISTS' : 'MISSING'}`);
        console.log(`    Password Length: ${teacher.password ? teacher.password.length : 0}`);
        console.log('    ---');
      });
    }

    // Check office_staff table
    console.log('\n🏢 CHECKING OFFICE_STAFF TABLE:');
    const { data: office, error: officeError } = await supabase
      .from('office_staff')
      .select('*');

    if (officeError) {
      console.error('❌ Error fetching office staff:', officeError);
    } else {
      console.log(`✅ Found ${office.length} office staff:`);
      office.forEach(staff => {
        console.log(`  - ID: ${staff.id}`);
        console.log(`    Username: ${staff.username}`);
        console.log(`    Active: ${staff.is_active}`);
        console.log(`    Password Hash: ${staff.password ? 'EXISTS' : 'MISSING'}`);
        console.log(`    Password Length: ${staff.password ? staff.password.length : 0}`);
        console.log('    ---');
      });
    }

    // Test password comparison
    console.log('\n🔑 TESTING PASSWORD COMPARISON:');
    const testPassword = 'password123';
    
    // Test with student
    if (students && students.length > 0) {
      const student = students[0];
      if (student.password) {
        const isValid = await bcrypt.compare(testPassword, student.password);
        console.log(`👨‍🎓 Student "${student.username}" password test: ${isValid ? '✅ VALID' : '❌ INVALID'}`);
      }
    }

    // Test with teacher
    if (teachers && teachers.length > 0) {
      const teacher = teachers[0];
      if (teacher.password) {
        const isValid = await bcrypt.compare(testPassword, teacher.password);
        console.log(`👨‍🏫 Teacher "${teacher.username}" password test: ${isValid ? '✅ VALID' : '❌ INVALID'}`);
      }
    }

    // Test with office
    if (office && office.length > 0) {
      const staff = office[0];
      if (staff.password) {
        const isValid = await bcrypt.compare(testPassword, staff.password);
        console.log(`🏢 Office "${staff.username}" password test: ${isValid ? '✅ VALID' : '❌ INVALID'}`);
      }
    }

  } catch (error) {
    console.error('❌ Debug error:', error);
  }
}

debugLogin();