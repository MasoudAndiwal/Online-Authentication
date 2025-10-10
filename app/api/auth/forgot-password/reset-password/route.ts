import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabase } from '@/lib/supabase';
import { hashPassword } from '@/lib/utils/password';

const resetPasswordSchema = z.object({
  email: z.string().email(),
  verificationToken: z.string().min(32),
  code: z.string().length(6),
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validationResult = resetPasswordSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid request data',
          errors: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { email, code, newPassword } = validationResult.data;

    // Verify reset token is still valid
    const { data: resetToken, error: tokenError } = await supabase
      .from('password_reset_tokens')
      .select('*')
      .eq('email', email)
      .eq('reset_code', code)
      .eq('used', false)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (tokenError || !resetToken) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid or expired reset code. Please request a new one.',
        },
        { status: 401 }
      );
    }

    // Hash the new password
    const hashedPassword = await hashPassword(newPassword);

    // Update password in office_staff table
    const { error: updateError } = await supabase
      .from('office_staff')
      .update({
        password: hashedPassword,
        updated_at: new Date().toISOString(),
      })
      .eq('email', email);

    if (updateError) {
      console.error('Password update error:', updateError);
      return NextResponse.json(
        {
          success: false,
          message: 'Failed to update password. Please try again.',
        },
        { status: 500 }
      );
    }

    // Mark reset token as used
    await supabase
      .from('password_reset_tokens')
      .update({ used: true })
      .eq('id', resetToken.id);

    return NextResponse.json(
      {
        success: true,
        message: 'Password updated successfully. You can now login with your new password.',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'An internal error occurred. Please try again.',
      },
      { status: 500 }
    );
  }
}
