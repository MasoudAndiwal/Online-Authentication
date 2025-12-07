/**
 * Reset passwords for existing users to 'password123'
 */

const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcrypt');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const SALT_ROUNDS = 10;
const NEW_PASSWORD = 'password123';

async function hashPassword(password) {
  return bcrypt.hash(password, SALT_ROUNDS);
}

async function resetUserPasswords() {
  try {
    console.log('🔐 Hashing new password...');
    const hashedPassword = await hashPassword(NEW_PASSWORD);

    // Reset teacher passwords
    console.log('👨‍🏫 Resetting teacher password...');
    const { error: teacherError } = await supabase
      .from('teachers')
      .update({ password: hashedPassword })
      .eq('username', 'MasoudA');

    if (teacherError) {
      console.error('❌ Teacher password reset failed:', teacherError);
    } else {
      console.log('✅ Teacher password reset');
    }

    // Reset office staff passwords
    console.log('🏢 Resetting office staff password...');
    const { error: officeError } = await supabase
      .from('office_staff')
      .update({ password: hashedPassword })
      .eq('username', 'JamilShirzad');

    if (officeError) {
      console.error('❌ Office staff password reset failed:', officeError);
    } else {
      console.log('✅ Office staff password reset');
    }

    // Reset student passwords
    console.log('👨‍🎓 Resetting student password...');
    const { error: studentError } = await supabase
      .from('students')
      .update({ password: hashedPassword })
      .eq('username', 'teststudent');

    if (studentError) {
      console.error('❌ Student password reset failed:', studentError);
    } else {
      console.log('✅ Student password reset');
    }

    console.log('🎉 Password reset complete!');
    console.log('🔑 ALL USERS NOW HAVE PASSWORD: ' + NEW_PASSWORD);
    console.log('=====================================');
    console.log('👨‍🎓 Student: teststudent / 999888 / ' + NEW_PASSWORD);
    console.log('👨‍🏫 Teacher: MasoudA / ' + NEW_PASSWORD);
    console.log('🏢 Office: JamilShirzad / ' + NEW_PASSWORD);

  } catch (error) {
    console.error('❌ Error resetting passwords:', error);
  }
}

resetUserPasswords();