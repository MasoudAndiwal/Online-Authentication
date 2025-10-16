import { NextResponse } from 'next/server';
import { testSupabaseConnection } from '@/lib/supabase';

export async function GET() {
  console.log('=== Testing Supabase Connection ===');
  
  try {
    // Check environment variables
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;
    
    console.log('Environment check:');
    console.log('- SUPABASE_URL:', supabaseUrl ? '✓ Set' : '✗ Missing');
    console.log('- SUPABASE_ANON_KEY:', supabaseKey ? '✓ Set' : '✗ Missing');
    
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({
        success: false,
        error: 'Missing Supabase environment variables',
        details: {
          SUPABASE_URL: !!supabaseUrl,
          SUPABASE_ANON_KEY: !!supabaseKey,
        }
      }, { status: 500 });
    }
    
    // Test connection
    const isConnected = await testSupabaseConnection();
    
    if (isConnected) {
      return NextResponse.json({
        success: true,
        message: 'Supabase connection successful',
        config: {
          url: supabaseUrl.substring(0, 30) + '...',
          hasKey: !!supabaseKey,
        }
      });
    } else {
      return NextResponse.json({
        success: false,
        error: 'Supabase connection failed',
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('Connection test error:', error);
    return NextResponse.json({
      success: false,
      error: 'Connection test failed',
      details: (error as Error).message,
    }, { status: 500 });
  }
}
