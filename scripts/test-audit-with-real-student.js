/**
 * Test audit log insertion with real student ID
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testAuditWithRealStudent() {
  try {
    console.log('🔍 Getting real student ID...');
    
    // Get the actual student ID
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('id')
      .eq('username', 'student')
      .single();

    if (studentError || !student) {
      console.error('❌ Could not find student:', studentError);
      return;
    }

    console.log('✅ Found student ID:', student.id);

    // Test audit log insertion with real student ID
    const logEntry = {
      user_id: student.id,
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

    console.log('📝 Attempting to insert audit log...');

    const { data, error } = await supabase
      .from('audit_logs')
      .insert(logEntry)
      .select('id')
      .single();

    if (error) {
      console.error('❌ Audit log insertion failed:', error);
      return;
    }

    console.log('✅ Audit log inserted successfully:', data);

    // Clean up
    await supabase.from('audit_logs').delete().eq('id', data.id);
    console.log('🧹 Test entry cleaned up');

    console.log('\n🎯 CONCLUSION: Audit logging works with valid student IDs');
    console.log('💡 The authentication should succeed now!');

  } catch (error) {
    console.error('❌ Test error:', error);
  }
}

testAuditWithRealStudent();