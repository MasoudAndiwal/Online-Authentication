/**
 * Script to add a test student with numeric-only ID
 * Run with: node scripts/add-test-student-numeric.js
 */

const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env' });

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in environment variables');
  console.error('Found NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl);
  console.error('Found SUPABASE_SERVICE_ROLE_KEY:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);
  console.error('Found NEXT_PUBLIC_SUPABASE_ANON_KEY:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function addTestStudent() {
  try {
    // Generate unique numeric student ID (6 digits)
    const uniqueId = Date.now().toString().slice(-6); // Last 6 digits of timestamp
    
    console.log('🔐 Hashing password...');
    const hashedPassword = await bcrypt.hash('password123', 10);
    console.log('✅ Password hashed successfully');

    console.log('\n🗑️  Removing existing test students...');
    
    // Delete any existing test students
    await supabase.from('students').delete().eq('username', 'student');
    await supabase.from('students').delete().eq('student_id', '99999');
    await supabase.from('students').delete().eq('student_id', '999999');
    
    console.log('✅ Cleanup completed');

    console.log('\n➕ Adding test student...');
    const { data, error } = await supabase
      .from('students')
      .insert({
        first_name: 'Test',
        last_name: 'Student',
        father_name: 'Test Father',
        grandfather_name: 'Test Grandfather',
        student_id: uniqueId,
        date_of_birth: '2003-01-01',
        phone: `070${uniqueId}`,
        father_phone: `071${uniqueId}`,
        address: 'Kabul, Afghanistan',
        programs: 'Computer Science',
        semester: '4',
        enrollment_year: '2021',
        class_section: 'AI-401-A - AFTERNOON',
        time_slot: 'AFTERNOON',
        username: 'student',
        student_id_ref: uniqueId,
        password: hashedPassword,
        status: 'ACTIVE',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Error adding test student:', error);
      process.exit(1);
    }

    console.log('\n✅ Test student added successfully!');
    console.log('\n📋 Student Details:');
    console.log('   ID:', data.id);
    console.log('   Name:', data.first_name, data.last_name);
    console.log('   Student ID:', data.student_id);
    console.log('   Username:', data.username);
    console.log('   Status:', data.status);

    console.log('\n🔑 Login Credentials:');
    console.log('   Username: student');
    console.log('   Password: password123');
    console.log('   Student ID:', data.student_id);

    console.log('\n🌐 Login URL:');
    console.log('   http://localhost:3000/login');

    console.log('\n✨ You can now log in with these credentials!');
    console.log('\n⚠️  IMPORTANT: Use Student ID:', data.student_id, '(numeric only)');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  }
}

// Run the script
addTestStudent();