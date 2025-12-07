/**
 * Check what credentials actually exist in the database
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkCredentials() {
  try {
    console.log('🔍 Checking actual credentials in database...\n');

    // Check students
    console.log('👨‍🎓 STUDENTS:');
    const { data: students } = await supabase
      .from('students')
      .select('username, student_id, first_name, last_name')
      .limit(10);

    students?.forEach(s => {
      console.log(`   Username: "${s.username}" | Student ID: "${s.student_id}" | Name: ${s.first_name} ${s.last_name}`);
    });

    // Check teachers  
    console.log('\n👨‍🏫 TEACHERS:');
    const { data: teachers } = await supabase
      .from('teachers')
      .select('username, first_name, last_name')
      .limit(10);

    teachers?.forEach(t => {
      console.log(`   Username: "${t.username}" | Name: ${t.first_name} ${t.last_name}`);
    });

    // Check office staff
    console.log('\n🏢 OFFICE STAFF:');
    const { data: office } = await supabase
      .from('office_staff')
      .select('username, first_name, last_name, role')
      .limit(10);

    office?.forEach(o => {
      console.log(`   Username: "${o.username}" | Name: ${o.first_name} ${o.last_name} | Role: ${o.role}`);
    });

    console.log('\n📋 RECOMMENDED CREDENTIALS TO TRY:');
    console.log('=====================================');
    
    if (students?.length > 0) {
      const student = students[0];
      console.log(`🎓 STUDENT LOGIN:`);
      console.log(`   Username: ${student.username}`);
      console.log(`   Student ID: ${student.student_id}`);
      console.log(`   Password: password123 (try this common password)`);
    }

    if (teachers?.length > 0) {
      const teacher = teachers[0];
      console.log(`\n👨‍🏫 TEACHER LOGIN:`);
      console.log(`   Username: ${teacher.username}`);
      console.log(`   Password: password123 (try this common password)`);
    }

    if (office?.length > 0) {
      const officeUser = office[0];
      console.log(`\n🏢 OFFICE LOGIN:`);
      console.log(`   Username: ${officeUser.username}`);
      console.log(`   Password: password123 (try this common password)`);
    }

  } catch (error) {
    console.error('❌ Error checking credentials:', error);
  }
}

checkCredentials();