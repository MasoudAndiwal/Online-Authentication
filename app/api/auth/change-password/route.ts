import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/supabase';
import bcrypt from 'bcrypt';

/**
 * POST /api/auth/change-password
 * Change user's password
 * 
 * Body:
 * - userId: User's ID
 * - currentPassword: Current password for verification
 * - newPassword: New password to set
 * - role: User's role (OFFICE, TEACHER, STUDENT)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, currentPassword, newPassword, role } = body;

    // Validate required fields
    if (!userId || !currentPassword || !newPassword || !role) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Missing required fields',
          message: 'User ID, current password, new password, and role are required.'
        },
        { status: 400 }
      );
    }

    // Validate new password length
    if (newPassword.length < 6) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Password too short',
          message: 'New password must be at least 6 characters long.'
        },
        { status: 400 }
      );
    }

    // Determine which table to query based on role
    let tableName: string;
    switch (role) {
      case 'OFFICE':
        tableName = 'office_staff';
        break;
      case 'TEACHER':
        tableName = 'teachers';
        break;
      case 'STUDENT':
        tableName = 'students';
        break;
      default:
        return NextResponse.json(
          { 
            success: false,
            error: 'Invalid role',
            message: 'Invalid user role provided.'
          },
          { status: 400 }
        );
    }

    // Get user's current password hash
    const { data: users, error: queryError } = await supabase
      .from(tableName)
      .select('id, password')
      .eq('id', userId);

    if (queryError || !users || users.length === 0) {
      return NextResponse.json(
        { 
          success: false,
          error: 'User not found',
          message: 'User account not found.',
          debug: process.env.NODE_ENV === 'development' ? queryError?.message : undefined
        },
        { status: 404 }
      );
    }

    const user = users[0];

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    
    if (!isCurrentPasswordValid) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid current password',
          message: 'The current password you entered is incorrect.'
        },
        { status: 401 }
      );
    }

    // Hash the new password
    const saltRounds = 10;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update the password in the database
    const { error: updateError } = await supabase
      .from(tableName)
      .update({ password: hashedNewPassword })
      .eq('id', userId);

    if (updateError) {
      console.error('[Change Password] Update error:', updateError);
      return NextResponse.json(
        { 
          success: false,
          error: 'Failed to update password',
          message: 'Could not update password. Please try again.',
          debug: process.env.NODE_ENV === 'development' ? updateError.message : undefined
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('[Change Password] Error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to change password',
        message: error instanceof Error ? error.message : 'Unknown error',
        debug: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : String(error)) : undefined
      },
      { status: 500 }
    );
  }
}
