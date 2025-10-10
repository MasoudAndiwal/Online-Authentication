import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    console.log('Testing Supabase connection...');
    
    // Test 1: Check environment variables
    const hasSupabaseUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
    const hasSupabaseKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const hasResendKey = !!process.env.RESEND_API_KEY;
    
    console.log('Environment variables:', {
      SUPABASE_URL: hasSupabaseUrl,
      SUPABASE_KEY: hasSupabaseKey,
      RESEND_KEY: hasResendKey,
    });
    
    // Test 2: Check office_staff table
    const { data: officeTest, error: officeError } = await supabase
      .from('office_staff')
      .select('id, email, first_name')
      .limit(1);
    
    console.log('Office staff test:', officeTest, officeError);
    
    // Test 3: Check password_reset_tokens table
    const { data: tokenTest, error: tokenError } = await supabase
      .from('password_reset_tokens')
      .select('*')
      .limit(1);
    
    console.log('Password reset tokens test:', tokenTest, tokenError);
    
    return NextResponse.json({
      success: true,
      tests: {
        environment: {
          SUPABASE_URL: hasSupabaseUrl,
          SUPABASE_KEY: hasSupabaseKey,
          RESEND_KEY: hasResendKey,
        },
        office_staff_table: {
          exists: !officeError,
          error: officeError?.message || null,
          sample: officeTest,
        },
        password_reset_tokens_table: {
          exists: !tokenError,
          error: tokenError?.message || null,
          sample: tokenTest,
        },
      },
    });
  } catch (error) {
    console.error('Test error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
