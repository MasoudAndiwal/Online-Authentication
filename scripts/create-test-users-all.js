/**
 * Create test users for all portals with known passwords
 */

const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createTestUsers() {
  try {
    console.log('🔐 Hashing password...');
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    console.log('🧹 Cleaning up existing test users...');
    
    // Clean up existing test users
    await supabase.from('students').delete().eq('username', 'teststudent');
    await supabase.from('teachers').delete().eq('username', 'testteacher');
    await supabase.from('office_staff').delete().eq('username', 'testoffice');

    // Create test student
    console.log('👨‍🎓 Creating test student...');
    const { data: student, error: studentError } = await supabase
      .from('students')
      .insert({
        first_name: 'Test',
        last_name: 'Student',
        father_name: 'Test Father',
        grandfather_name: 'Test Grandfather',
        student_id: '999888',
        date_of_birth: '2003-01-01',
        phone: '0701111111',
        father_phone: '0701111112',
        address: 'Kabul, Afghanistan',
        programs: 'Computer Science',
        semester: '4',
        enrollment_year: '2021',
        class_section: 'AI-401-A - AFTERNOON',
        time_slot: 'AFTERNOON',
        username: 'teststudent',
        student_id_ref: '999888',
        password: hashedPassword,
        status: 'ACTIVE'
      })
      .select()
      .single();

    if (studentError) {
      console.error('❌ Error creating student:', studentError);
    } else {
      console.log('✅ Test student created');
    }

    // Create test teacher
    console.log('👨‍🏫 Creating test teacher...');
    const { data: teacher, error: teacherError } = await supabase
      .from('teachers')
      .insert({
        first_name: 'Test',
        last_name: 'Teacher',
        username: 'testteacher',
        password: hashedPassword,
        status: 'ACTIVE'
      })
      .select()
      .single();

    if (teacherError) {
      console.error('❌ Error creating teacher:', teacherError);
    } else {
      console.log('✅ Test teacher created');
    }

    // Create test office staff
    console.log('🏢 Creating test office staff...');
    const { data: office, error: officeError } = await supabase
      .from('office_staff')
      .insert({
        first_name: 'Test',
        last_name: 'Office',
        username: 'testoffice',
        password: hashedPassword,
        role: 'ADMIN',
        is_active: true
      })
      .select()
      .single();

    if (officeError) {
      console.error('❌ Error creating office staff:', officeError);
    } else {
      console.log('✅ Test office staff created');
    }

    console.log('\n🎉 All test users created successfully!');
    console.log('\n🔑 TEST CREDENTIALS:');
    console.log('=====================================');
    console.log('👨‍🎓 STUDENT LOGIN:');
    console.log('   Username: teststudent');
    console.log('   Student ID: 999888');
    console.log('   Password: password123');
    console.log('\n👨‍🏫 TEACHER LOGIN:');
    console.log('   Username: testteacher');
    console.log('   Password: password123');
    console.log('\n🏢 OFFICE LOGIN:');
    console.log('   Username: testoffice');
    console.log('   Password: password123');

  } catch (error) {
    console.error('❌ Error creating test users:', error);
  }
}

createTestUsers();