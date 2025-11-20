/**
 * Script to add a test student with specific ID 888999
 */

const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env' });

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createSpecificStudent() {
  try {
    console.log('🔐 Hashing password...');
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    console.log('🗑️  Removing existing test students...');
    await supabase.from('students').delete().eq('username', 'student');
    await supabase.from('students').delete().eq('student_id', '888999');
    
    console.log('➕ Adding test student with ID 888999...');
    const { data, error } = await supabase
      .from('students')
      .insert({
        first_name: 'Test',
        last_name: 'Student',
        father_name: 'Test Father',
        grandfather_name: 'Test Grandfather',
        student_id: '888999',
        date_of_birth: '2003-01-01',
        phone: '0701234567',
        father_phone: '0701234568',
        address: 'Kabul, Afghanistan',
        programs: 'Computer Science',
        semester: '4',
        enrollment_year: '2021',
        class_section: 'AI-401-A - AFTERNOON',
        time_slot: 'AFTERNOON',
        username: 'student',
        student_id_ref: '888999',
        password: hashedPassword,
        status: 'ACTIVE'
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Error:', error);
      process.exit(1);
    }

    console.log('✅ Student created successfully!');
    console.log('🔑 Login Credentials:');
    console.log('   Username: student');
    console.log('   Password: password123');
    console.log('   Student ID: 888999');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

createSpecificStudent();