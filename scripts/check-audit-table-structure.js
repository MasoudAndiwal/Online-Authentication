/**
 * Check audit_logs table structure and constraints
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkAuditTableStructure() {
  try {
    console.log('🔍 Checking audit_logs table structure...\n');

    // Check if we can query the table structure
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .limit(1);

    if (error) {
      console.error('❌ Error accessing audit_logs:', error);
      return;
    }

    console.log('✅ Audit logs table is accessible');
    console.log('📊 Sample record structure:', data[0] || 'No records yet');

    // Try to insert a test record to see the exact constraint error
    console.log('\n🧪 Testing constraint behavior...');
    
    const testEntry = {
      user_id: 'non-existent-user-id',
      action: 'login_failure',
      resource: 'authentication',
      success: false,
      timestamp: new Date()
    };

    const { data: insertData, error: insertError } = await supabase
      .from('audit_logs')
      .insert(testEntry)
      .select('id');

    if (insertError) {
      console.log('❌ Expected constraint error:', insertError.message);
      console.log('🔍 Error code:', insertError.code);
      console.log('📋 Error details:', insertError.details);
      
      if (insertError.code === '23503') {
        console.log('\n🎯 CONFIRMED: Foreign key constraint violation');
        console.log('💡 The audit_logs.user_id has a foreign key constraint');
        console.log('🔧 This prevents logging for non-existent users');
      }
    } else {
      console.log('✅ Insert succeeded:', insertData);
      // Clean up
      await supabase.from('audit_logs').delete().eq('id', insertData[0].id);
    }

  } catch (error) {
    console.error('❌ Error checking audit table:', error);
  }
}

checkAuditTableStructure();