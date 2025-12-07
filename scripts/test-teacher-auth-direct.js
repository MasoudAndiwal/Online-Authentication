/**
 * Test teacher authentication directly
 */

const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcrypt');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function comparePassword(password, hash) {
  return bcrypt.compare(password, hash);
}

async function findTeacherByUsername(username) {
  const { data: teacher, error } = await supabase
    .from('teachers')
    .select('*')
    .eq('username', username)
    .single();

  if (error || !teacher) return null;

  return {
    id: teacher.id,
    firstName: teacher.first_name,
    lastName: teacher.last_name,
    fatherName: teacher.father_name,
    grandFatherName: teacher.grandfather_name,
    teacherId: teacher.teacher_id,
    dateOfBirth: teacher.date_of_birth ? new Date(teacher.date_of_birth) : null,
    phone: teacher.phone,
    secondaryPhone: teacher.secondary_phone,
    address: teacher.address,
    departments: teacher.departments,
    qualification: teacher.qualification,
    experience: teacher.experience,
    specialization: teacher.specialization,
    subjects: teacher.subjects,
    classes: teacher.classes,
    username: teacher.username,
    password: teacher.password,
    status: teacher.status,
    createdAt: new Date(teacher.created_at),
    updatedAt: new Date(teacher.updated_at)
  };
}

async function authenticateTeacher(username, password) {
  try {
    console.log('🔐 Teacher Authentication Attempt:', {
      username,
      passwordLength: password.length
    });

    // Find teacher by username
    const teacher = await findTeacherByUsername(username);

    if (!teacher) {
      console.log('❌ Teacher not found with username:', username);
      return {
        success: false,
        message: 'Invalid credentials. Please check your username and password.',
      };
    }

    console.log('✅ Teacher found:', {
      id: teacher.id,
      username: teacher.username,
      firstName: teacher.firstName,
      lastName: teacher.lastName,
      status: teacher.status
    });

    // Check if teacher is active
    if (teacher.status !== 'ACTIVE') {
      console.log('❌ Teacher account is not active:', teacher.status);
      return {
        success: false,
        message: 'Your account is inactive. Please contact administration.',
      };
    }

    // Compare password with stored hashed password
    console.log('🔑 Comparing passwords...');
    const isPasswordValid = await comparePassword(password, teacher.password);

    console.log('🔑 Password validation result:', isPasswordValid);

    if (!isPasswordValid) {
      console.log('❌ Password is invalid');
      return {
        success: false,
        message: 'Invalid credentials. Please check your username and password.',
      };
    }

    console.log('✅ Authentication successful for teacher:', teacher.username);

    return {
      success: true,
      message: 'Login successful',
      data: {
        id: teacher.id,
        username: teacher.username,
        firstName: teacher.firstName,
        lastName: teacher.lastName,
        role: 'teacher',
      },
    };
  } catch (error) {
    console.error('❌ Teacher authentication error:', error);
    return {
      success: false,
      message: 'An error occurred during authentication. Please try again.',
    };
  }
}

async function testTeacherAuth() {
  console.log('🧪 TESTING TEACHER AUTHENTICATION');
  console.log('=================================');

  // Test teacher login
  console.log('\n👨‍🏫 TESTING TEACHER LOGIN: MasoudA');
  const teacherResult = await authenticateTeacher('MasoudA', 'password123');
  
  console.log('\n📋 TEACHER LOGIN RESULT:');
  console.log('Success:', teacherResult.success ? '✅ YES' : '❌ NO');
  console.log('Message:', teacherResult.message);
  if (teacherResult.data) {
    console.log('User Data:', teacherResult.data);
  }

  console.log('\n🎯 FINAL VERDICT:');
  if (teacherResult.success) {
    console.log('🎉 TEACHER LOGIN SHOULD WORK! Try logging in with:');
    console.log('   Username: MasoudA');
    console.log('   Password: password123');
  } else {
    console.log('❌ Teacher login still has issues. Check the error above.');
  }
}

testTeacherAuth();