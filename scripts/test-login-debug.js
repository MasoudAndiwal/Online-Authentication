/**
 * Debug script to test login functionality
 */

const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function debugLogin() {
  try {
    console.log('🔍 Checking if student exists...');
    
    // Check if student exists
    const { data: student, error } = await supabase
      .from('students')
      .select('*')
      .eq('username', 'student')
      .single();

    if (error) {
      console.error('❌ Error finding student:', error);
      return;
    }

    if (!student) {
      console.log('❌ Student not found');
      return;
    }

    console.log('✅ Student found:');
    console.log('   ID:', student.id);
    console.log('   Username:', student.username);
    console.log('   Student ID:', student.student_id);
    console.log('   Student ID Ref:', student.student_id_ref);
    console.log('   Status:', student.status);
    console.log('   Password Hash:', student.password.substring(0, 20) + '...');

    // Test password comparison
    console.log('\n🔑 Testing password...');
    const isPasswordValid = await bcrypt.compare('password123', student.password);
    console.log('   Password valid:', isPasswordValid);

    // Test student ID matching
    console.log('\n🆔 Testing student ID matching...');
    const testStudentId = '888999';
    const studentIdMatches = student.student_id === testStudentId || student.student_id_ref === testStudentId;
    console.log('   Provided ID:', testStudentId);
    console.log('   DB student_id:', student.student_id);
    console.log('   DB student_id_ref:', student.student_id_ref);
    console.log('   ID matches:', studentIdMatches);

    // Test status
    console.log('\n📊 Testing status...');
    console.log('   Status is ACTIVE:', student.status === 'ACTIVE');

    console.log('\n🎯 Summary:');
    console.log('   Student exists:', !!student);
    console.log('   Password valid:', isPasswordValid);
    console.log('   Student ID matches:', studentIdMatches);
    console.log('   Status is active:', student.status === 'ACTIVE');
    
    const shouldLogin = !!student && isPasswordValid && studentIdMatches && student.status === 'ACTIVE';
    console.log('   Should login succeed:', shouldLogin);

  } catch (error) {
    console.error('❌ Debug error:', error);
  }
}

debugLogin();