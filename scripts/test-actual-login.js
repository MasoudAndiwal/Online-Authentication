/**
 * Test actual login process using the authentication functions
 */

const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Mock the authentication functions
const bcrypt = require('bcrypt');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function comparePassword(password, hash) {
  return bcrypt.compare(password, hash);
}

async function findStudentByUsername(username) {
  const { data: student, error } = await supabase
    .from('students')
    .select('*')
    .eq('username', username)
    .single();

  if (error || !student) return null;

  return {
    id: student.id,
    username: student.username,
    studentId: student.student_id,
    studentIdRef: student.student_id_ref,
    firstName: student.first_name,
    lastName: student.last_name,
    status: student.status,
    password: student.password
  };
}

async function authenticateStudent(username, studentId, password) {
  try {
    console.log('🔐 Student Authentication Attempt:', {
      username,
      studentId,
      passwordLength: password.length
    });

    const student = await findStudentByUsername(username);

    if (!student) {
      console.log('❌ Student not found with username:', username);
      return {
        success: false,
        message: 'Invalid credentials. Please check your username, student ID, and password.',
      };
    }

    console.log('✅ Student found:', {
      id: student.id,
      username: student.username,
      studentId: student.studentId,
      studentIdRef: student.studentIdRef,
      status: student.status
    });

    const studentIdMatches = student.studentId === studentId || student.studentIdRef === studentId;
    
    console.log('🔍 Student ID Check:', {
      providedStudentId: studentId,
      dbStudentId: student.studentId,
      dbStudentIdRef: student.studentIdRef,
      matches: studentIdMatches
    });
    
    if (!studentIdMatches) {
      console.log('❌ Student ID does not match');
      return {
        success: false,
        message: 'Invalid credentials. Please check your username, student ID, and password.',
      };
    }

    if (student.status !== 'ACTIVE') {
      console.log('❌ Student account is not active:', student.status);
      return {
        success: false,
        message: 'Your account is inactive. Please contact administration.',
      };
    }

    console.log('🔑 Comparing passwords...');
    const isPasswordValid = await comparePassword(password, student.password);

    console.log('🔑 Password validation result:', isPasswordValid);

    if (!isPasswordValid) {
      console.log('❌ Password is invalid');
      return {
        success: false,
        message: 'Invalid credentials. Please check your username, student ID, and password.',
      };
    }

    console.log('✅ Authentication successful for student:', student.username);

    return {
      success: true,
      message: 'Login successful',
      data: {
        id: student.id,
        username: student.username,
        firstName: student.firstName,
        lastName: student.lastName,
        role: 'student',
      },
    };
  } catch (error) {
    console.error('❌ Student authentication error:', error);
    return {
      success: false,
      message: 'An error occurred during authentication. Please try again.',
    };
  }
}

async function testLogin() {
  console.log('🧪 TESTING ACTUAL LOGIN PROCESS');
  console.log('================================');

  // Test student login
  console.log('\n👨‍🎓 TESTING STUDENT LOGIN');
  const studentResult = await authenticateStudent('teststudent', '999888', 'password123');
  
  console.log('\n📋 STUDENT LOGIN RESULT:');
  console.log('Success:', studentResult.success ? '✅ YES' : '❌ NO');
  console.log('Message:', studentResult.message);
  if (studentResult.data) {
    console.log('User Data:', studentResult.data);
  }

  console.log('\n🎯 FINAL VERDICT:');
  if (studentResult.success) {
    console.log('🎉 LOGIN SHOULD WORK! Try logging in with:');
    console.log('   Username: teststudent');
    console.log('   Student ID: 999888');
    console.log('   Password: password123');
  } else {
    console.log('❌ Login still has issues. Check the error above.');
  }
}

testLogin();