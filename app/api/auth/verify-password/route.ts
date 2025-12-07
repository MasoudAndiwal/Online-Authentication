import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/supabase';

/**
 * POST /api/auth/verify-password
 * Verify user's password for attendance submission authentication
 * 
 * This is a simplified version that checks if the password matches
 * the user's stored password in the custom users table.
 * 
 * Body:
 * - email: User's email
 * - password: Password to verify
 * - userId: Optional user ID
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, userId } = body;

    if ((!email && !userId) || !password) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Email/User ID and password are required',
          message: 'Please provide your credentials.'
        },
        { status: 400 }
      );
    }

    // Query the office_staff table to get the user's stored password
    let query = supabase
      .from('office_staff')
      .select('id, email, password, first_name, last_name, username');

    if (email) {
      query = query.eq('email', email);
    } else if (userId) {
      query = query.eq('id', userId);
    }

    const { data: users, error: queryError } = await query;

    if (queryError || !users || users.length === 0) {
      return NextResponse.json(
        { 
          success: false,
          error: 'User not found',
          message: 'User account not found. Please contact administrator.',
          debug: process.env.NODE_ENV === 'development' ? queryError?.message : undefined
        },
        { status: 404 }
      );
    }

    const user = users[0];

    // Import bcrypt for password comparison
    const bcrypt = require('bcrypt');
    
    // Check if the password matches using bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid password',
          message: 'The password you entered is incorrect. Please try again.'
        },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Password verified successfully',
      user: {
        id: user.id,
        email: user.email,
        name: `${user.first_name} ${user.last_name}`,
      }
    });

  } catch (error) {
    console.error('[Verify Password] Error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to verify password',
        message: error instanceof Error ? error.message : 'Unknown error',
        debug: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : String(error)) : undefined
      },
      { status: 500 }
    );
  }
}
