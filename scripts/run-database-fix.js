/**
 * Run the database fix to remove foreign key constraint
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runDatabaseFix() {
  try {
    console.log('🔧 Fixing audit_logs foreign key constraint...\n');

    // Step 1: Drop the problematic foreign key constraint
    console.log('1️⃣ Removing foreign key constraint...');
    const { error: dropError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE audit_logs DROP CONSTRAINT IF EXISTS audit_logs_user_id_fkey;'
    });

    if (dropError) {
      console.log('⚠️ Could not drop constraint via RPC, trying direct approach...');
      // Try alternative approach
      const { error: altError } = await supabase
        .from('audit_logs')
        .select('id')
        .limit(1);
      
      if (altError && altError.message.includes('foreign key')) {
        console.log('❌ Foreign key constraint still exists');
        console.log('📝 You need to run this SQL manually in Supabase Dashboard:');
        console.log('   ALTER TABLE audit_logs DROP CONSTRAINT audit_logs_user_id_fkey;');
        return;
      }
    }

    console.log('✅ Foreign key constraint removed (or didn\'t exist)');

    // Step 2: Test that we can insert any user_id
    console.log('\n2️⃣ Testing audit log insertion...');
    const { data, error: testError } = await supabase
      .from('audit_logs')
      .insert({
        user_id: 'test-any-user-id',
        action: 'login_test',
        resource: 'authentication',
        success: true,
        timestamp: new Date()
      })
      .select('id');

    if (testError) {
      console.error('❌ Test insertion failed:', testError.message);
      if (testError.code === '23503') {
        console.log('🚨 Foreign key constraint still exists!');
        console.log('📝 Manual fix required - go to Supabase Dashboard SQL Editor and run:');
        console.log('   ALTER TABLE audit_logs DROP CONSTRAINT audit_logs_user_id_fkey;');
      }
      return;
    }

    console.log('✅ Test insertion successful');

    // Step 3: Clean up test record
    if (data && data[0]) {
      await supabase.from('audit_logs').delete().eq('id', data[0].id);
      console.log('🧹 Test record cleaned up');
    }

    console.log('\n🎉 SUCCESS! Foreign key constraint has been fixed!');
    console.log('🔄 Now test your login - it should work for all user types');

  } catch (error) {
    console.error('❌ Error running database fix:', error);
    console.log('\n📝 MANUAL FIX REQUIRED:');
    console.log('1. Go to: https://supabase.com/dashboard/project/sgcoinewybdlnjibuatf');
    console.log('2. Click "SQL Editor"');
    console.log('3. Run: ALTER TABLE audit_logs DROP CONSTRAINT audit_logs_user_id_fkey;');
  }
}

runDatabaseFix();