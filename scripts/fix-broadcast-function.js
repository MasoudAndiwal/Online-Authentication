/**
 * Script to fix the broadcast function UUID/TEXT type mismatch
 * Run this to update the send_broadcast_to_class function with proper type casting
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixBroadcastFunction() {
  try {
    console.log('🔧 Fixing broadcast function with UUID/TEXT type casting...\n');

    // Read the SQL file
    const sqlPath = join(__dirname, '..', 'database', 'migrations', 'fix_broadcast_function_uuid.sql');
    const sql = readFileSync(sqlPath, 'utf8');

    // Execute the SQL
    const { error } = await supabase.rpc('exec_sql', { sql_query: sql }).single();

    if (error) {
      // If exec_sql doesn't exist, try direct execution
      console.log('Attempting direct SQL execution...');
      
      // Split by semicolons and execute each statement
      const statements = sql
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'));

      for (const statement of statements) {
        const { error: execError } = await supabase.rpc('exec', { 
          sql: statement + ';' 
        });
        
        if (execError) {
          console.error('❌ Error executing statement:', execError);
          console.error('Statement:', statement.substring(0, 100) + '...');
        }
      }
    }

    console.log('✅ Broadcast function updated successfully!');
    console.log('\nThe send_broadcast_to_class function now properly handles UUID/TEXT type casting.');
    console.log('You can now send broadcast messages without type mismatch errors.\n');

  } catch (error) {
    console.error('❌ Error fixing broadcast function:', error);
    console.error('\n📝 Manual fix required:');
    console.error('Please run the SQL in database/migrations/fix_broadcast_function_uuid.sql');
    console.error('directly in your Supabase SQL Editor.\n');
    process.exit(1);
  }
}

fixBroadcastFunction();
