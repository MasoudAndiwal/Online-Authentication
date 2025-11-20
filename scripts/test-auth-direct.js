/**
 * Test authentication directly without audit logging
 */

const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testAuthDirect() {
  try {
    console.log('🔐 Testing authentication directly...');
    
    const username = 'student';
    const studentId = '888999';
    const password = 'password123';

    console.log('1️⃣ Finding student by username...');
    const { data: student, error: findError } = await supabase
      .from('students')
      .select('*')
      .eq('username', username)
      .single();

    if (findError) {
      console.error('❌ Error finding student:', findError);
      return;
    }

    if (!student) {
      console.log('❌ Student not found');
      return;
    }

    console.log('✅ Student found:', student.username);

    console.log('2️⃣ Checking student ID...');
    const studentIdMatches = student.student_id === studentId || student.student_id_ref === studentId;
    console.log('   Student ID matches:', studentIdMatches);

    if (!studentIdMatches) {
      console.log('❌ Student ID does not match');
      return;
    }

    console.log('3️⃣ Checking status...');
    if (student.status !== 'ACTIVE') {
      console.log('❌ Student is not active:', student.status);
      return;
    }

    console.log('4️⃣ Checking password...');
    const isPasswordValid = await bcrypt.compare(password, student.password);
    console.log('   Password valid:', isPasswordValid);

    if (!isPasswordValid) {
      console.log('❌ Password is invalid');
      return;
    }

    console.log('✅ All checks passed - authentication should succeed!');

    // Test the actual API endpoint
    console.log('\n🌐 Testing API endpoint...');
    const response = await fetch('http://localhost:3000/api/auth/login/student', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username,
        studentId,
        password
      })
    });

    console.log('📊 API Response status:', response.status);
    const responseText = await response.text();
    console.log('📄 API Response body:', responseText);

  } catch (error) {
    console.error('❌ Test error:', error);
  }
}

// Add fetch polyfill for Node.js
const { default: fetch } = require('node-fetch');
global.fetch = fetch;

testAuthDirect();