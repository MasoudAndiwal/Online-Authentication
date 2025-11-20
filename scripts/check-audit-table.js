/**
 * Check if audit_logs table exists
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkAuditTable() {
  try {
    console.log('🔍 Checking audit_logs table...');
    
    // Try to query the audit_logs table
    const { data, error } = await supabase
      .from('audit_logs')
      .select('count')
      .limit(1);

    if (error) {
      console.error('❌ Audit logs table error:', error);
      console.log('📝 This might be why authentication is failing');
      return;
    }

    console.log('✅ Audit logs table exists and is accessible');
    console.log('📊 Query result:', data);

  } catch (error) {
    console.error('❌ Error checking audit table:', error);
  }
}

checkAuditTable();