/**
 * List all users from Supabase database
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function listUsers() {
  console.log('📋 Fetching users from Supabase...\n');

  // Get students
  console.log('👨‍🎓 STUDENTS:');
  console.log('=====================================');
  const { data: students, error: studentError } = await supabase
    .from('students')
    .select('username, student_id, student_id_ref, first_name, last_name, status')
    .limit(10);

  if (studentError) {
    console.error('Error fetching students:', studentError.message);
  } else if (students && students.length > 0) {
    students.forEach(s => {
      console.log(`  Username: ${s.username}`);
      console.log(`  Student ID: ${s.student_id || s.student_id_ref}`);
      console.log(`  Name: ${s.first_name} ${s.last_name}`);
      console.log(`  Status: ${s.status}`);
      console.log('  ---');
    });
  } else {
    console.log('  No students found');
  }

  // Get teachers
  console.log('\n👨‍🏫 TEACHERS:');
  console.log('=====================================');
  const { data: teachers, error: teacherError } = await supabase
    .from('teachers')
    .select('username, first_name, last_name, status')
    .limit(10);

  if (teacherError) {
    console.error('Error fetching teachers:', teacherError.message);
  } else if (teachers && teachers.length > 0) {
    teachers.forEach(t => {
      console.log(`  Username: ${t.username}`);
      console.log(`  Name: ${t.first_name} ${t.last_name}`);
      console.log(`  Status: ${t.status}`);
      console.log('  ---');
    });
  } else {
    console.log('  No teachers found');
  }

  // Get office staff
  console.log('\n🏢 OFFICE STAFF:');
  console.log('=====================================');
  const { data: office, error: officeError } = await supabase
    .from('office_staff')
    .select('username, first_name, last_name, role, is_active')
    .limit(10);

  if (officeError) {
    console.error('Error fetching office staff:', officeError.message);
  } else if (office && office.length > 0) {
    office.forEach(o => {
      console.log(`  Username: ${o.username}`);
      console.log(`  Name: ${o.first_name} ${o.last_name}`);
      console.log(`  Role: ${o.role}`);
      console.log(`  Active: ${o.is_active}`);
      console.log('  ---');
    });
  } else {
    console.log('  No office staff found');
  }

  console.log('\n🔑 PASSWORD FOR ALL USERS: password123');
  console.log('(If login fails, run: node scripts/reset-user-passwords.js)');
}

listUsers();
