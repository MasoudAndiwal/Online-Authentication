/**
 * Check if teachers and office staff exist in the database
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkAllUsers() {
  try {
    console.log('🔍 Checking all user types...\n');

    // Check students
    console.log('👨‍🎓 STUDENTS:');
    const { data: students, error: studentsError } = await supabase
      .from('students')
      .select('id, username, first_name, last_name, status')
      .limit(5);

    if (studentsError) {
      console.error('❌ Error checking students:', studentsError);
    } else {
      console.log(`   Found ${students.length} students:`);
      students.forEach(s => console.log(`   - ${s.username} (${s.first_name} ${s.last_name}) - ${s.status}`));
    }

    // Check teachers
    console.log('\n👨‍🏫 TEACHERS:');
    const { data: teachers, error: teachersError } = await supabase
      .from('teachers')
      .select('id, username, first_name, last_name, status')
      .limit(5);

    if (teachersError) {
      console.error('❌ Error checking teachers:', teachersError);
      console.log('   Teachers table might not exist or be accessible');
    } else {
      console.log(`   Found ${teachers.length} teachers:`);
      teachers.forEach(t => console.log(`   - ${t.username} (${t.first_name} ${t.last_name}) - ${t.status}`));
    }

    // Check office staff
    console.log('\n🏢 OFFICE STAFF:');
    const { data: office, error: officeError } = await supabase
      .from('office_staff')
      .select('id, username, first_name, last_name, role, is_active')
      .limit(5);

    if (officeError) {
      console.error('❌ Error checking office staff:', officeError);
      console.log('   Office staff table might not exist or be accessible');
    } else {
      console.log(`   Found ${office.length} office staff:`);
      office.forEach(o => console.log(`   - ${o.username} (${o.first_name} ${o.last_name}) - ${o.role} - Active: ${o.is_active}`));
    }

    console.log('\n📋 SUMMARY:');
    console.log(`   Students: ${students?.length || 0}`);
    console.log(`   Teachers: ${teachers?.length || 0}`);
    console.log(`   Office Staff: ${office?.length || 0}`);

  } catch (error) {
    console.error('❌ Error checking users:', error);
  }
}

checkAllUsers();