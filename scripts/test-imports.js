/**
 * Test if all imports are working correctly
 */

async function testImports() {
  console.log('🧪 TESTING IMPORTS');
  console.log('==================');

  try {
    console.log('📦 Testing supabase-simple import...');
    const { supabase } = require('../lib/supabase-simple.ts');
    console.log('✅ supabase-simple imported successfully');

    console.log('📦 Testing password utils import...');
    const { comparePassword, hashPassword } = require('../lib/utils/password.ts');
    console.log('✅ password utils imported successfully');

    console.log('📦 Testing database operations import...');
    const { findTeacherByUsername } = require('../lib/database/operations.ts');
    console.log('✅ database operations imported successfully');

    console.log('📦 Testing authentication import...');
    const { authenticateTeacher } = require('../lib/auth/authentication.ts');
    console.log('✅ authentication imported successfully');

    console.log('\n🎉 All imports successful!');

  } catch (error) {
    console.error('❌ Import error:', error.message);
    console.error('❌ Stack:', error.stack);
  }
}

testImports();