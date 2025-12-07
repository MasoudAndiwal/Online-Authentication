/**
 * Test specific users that we reset passwords for
 */

const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcrypt');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testSpecificUsers() {
  console.log('🔍 TESTING SPECIFIC RESET USERS');
  console.log('===============================');

  const testPassword = 'password123';

  try {
    // Test student: teststudent
    console.log('\n👨‍🎓 TESTING STUDENT: teststudent');
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('*')
      .eq('username', 'teststudent')
      .single();

    if (studentError) {
      console.error('❌ Error fetching student:', studentError);
    } else if (student) {
      console.log(`✅ Student found: ${student.username} / ${student.student_id}`);
      const isValid = await bcrypt.compare(testPassword, student.password);
      console.log(`🔑 Password test: ${isValid ? '✅ VALID' : '❌ INVALID'}`);
    } else {
      console.log('❌ Student not found');
    }

    // Test teacher: MasoudA
    console.log('\n👨‍🏫 TESTING TEACHER: MasoudA');
    const { data: teacher, error: teacherError } = await supabase
      .from('teachers')
      .select('*')
      .eq('username', 'MasoudA')
      .single();

    if (teacherError) {
      console.error('❌ Error fetching teacher:', teacherError);
    } else if (teacher) {
      console.log(`✅ Teacher found: ${teacher.username}`);
      const isValid = await bcrypt.compare(testPassword, teacher.password);
      console.log(`🔑 Password test: ${isValid ? '✅ VALID' : '❌ INVALID'}`);
    } else {
      console.log('❌ Teacher not found');
    }

    // Test office: JamilShirzad
    console.log('\n🏢 TESTING OFFICE: JamilShirzad');
    const { data: office, error: officeError } = await supabase
      .from('office_staff')
      .select('*')
      .eq('username', 'JamilShirzad')
      .single();

    if (officeError) {
      console.error('❌ Error fetching office staff:', officeError);
    } else if (office) {
      console.log(`✅ Office staff found: ${office.username}`);
      const isValid = await bcrypt.compare(testPassword, office.password);
      console.log(`🔑 Password test: ${isValid ? '✅ VALID' : '❌ INVALID'}`);
    } else {
      console.log('❌ Office staff not found');
    }

    console.log('\n🎯 SUMMARY:');
    console.log('If all tests show ✅ VALID, then login should work!');
    console.log('=====================================');
    console.log('👨‍🎓 Student: teststudent / 999888 / password123');
    console.log('👨‍🏫 Teacher: MasoudA / password123');
    console.log('🏢 Office: JamilShirzad / password123');

  } catch (error) {
    console.error('❌ Test error:', error);
  }
}

testSpecificUsers();