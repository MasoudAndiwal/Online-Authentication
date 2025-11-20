/**
 * Test audit log insertion to find the exact error
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testAuditInsert() {
  try {
    console.log('🔍 Testing audit log insertion...');
    
    // Test a simple audit log entry
    const logEntry = {
      user_id: 'test-user-id',
      action: 'login_success',
      resource: 'authentication',
      resource_id: null,
      metadata: null,
      ip_address: null,
      user_agent: null,
      timestamp: new Date(),
      success: true,
      error_message: null,
    };

    console.log('📝 Attempting to insert:', logEntry);

    const { data, error } = await supabase
      .from('audit_logs')
      .insert(logEntry)
      .select('id')
      .single();

    if (error) {
      console.error('❌ Audit log insertion failed:', error);
      console.log('📋 Error details:', JSON.stringify(error, null, 2));
      return;
    }

    console.log('✅ Audit log inserted successfully:', data);

    // Clean up the test entry
    await supabase.from('audit_logs').delete().eq('id', data.id);
    console.log('🧹 Test entry cleaned up');

  } catch (error) {
    console.error('❌ Test error:', error);
  }
}

testAuditInsert();