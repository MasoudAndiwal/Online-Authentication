/**
 * Test authentication function without audit logging
 */

const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Simplified authentication function without audit logging
async function authenticateStudentSimple(username, studentId, password) {
  try {
    console.log('🔐 Simple Student Authentication:', { username, studentId });

    // Find student by username
    const { data: student, error } = await supabase
      .from('students')
      .select('*')
      .eq('username', username)
      .single();

    if (error || !student) {
      console.log('❌ Student not found');
      return { success: false, message: 'Invalid credentials' };
    }

    console.log('✅ Student found:', {
      id: student.id,
      username: student.username,
      studentId: student.student_id,
      status: student.status
    });

    // Verify student ID
    const studentIdMatches = student.student_id === studentId || student.student_id_ref === studentId;
    if (!studentIdMatches) {
      console.log('❌ Student ID mismatch');
      return { success: false, message: 'Invalid credentials' };
    }

    // Check status
    if (student.status !== 'ACTIVE') {
      console.log('❌ Student not active');
      return { success: false, message: 'Account inactive' };
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, student.password);
    if (!isPasswordValid) {
      console.log('❌ Invalid password');
      return { success: false, message: 'Invalid credentials' };
    }

    console.log('✅ Authentication successful');
    return {
      success: true,
      message: 'Login successful',
      data: {
        id: student.id,
        username: student.username,
        firstName: student.first_name,
        lastName: student.last_name,
        role: 'student'
      }
    };

  } catch (error) {
    console.error('❌ Authentication error:', error);
    return { success: false, message: 'Authentication error' };
  }
}

async function testSimpleAuth() {
  console.log('🧪 Testing simplified authentication...');
  
  const result = await authenticateStudentSimple('student', '888999', 'password123');
  
  console.log('📊 Result:', JSON.stringify(result, null, 2));
  
  if (result.success) {
    console.log('✅ Simple authentication works!');
    console.log('🔍 The issue is likely in the audit logging system');
  } else {
    console.log('❌ Even simple authentication fails');
  }
}

testSimpleAuth();