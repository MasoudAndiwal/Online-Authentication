import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabase } from '@/lib/supabase';
import { sendPasswordResetEmail } from '@/lib/email/email-service';
import crypto from 'crypto';

// Validation schema
const requestResetSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

// Generate 6-digit reset code
function generateResetCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Hash token for secure storage
function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validationResult = requestResetSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid email address',
          errors: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { email } = validationResult.data;

    // Check if email exists in office_staff table
    const { data: officeUser, error: userError } = await supabase
      .from('office_staff')
      .select('id, first_name, last_name, email, is_active')
      .eq('email', email)
      .single();

    if (userError || !officeUser) {
      // For security, don't reveal if email exists or not
      return NextResponse.json(
        {
          success: true,
          message: 'If an account with that email exists, a password reset code has been sent.',
        },
        { status: 200 }
      );
    }

    // Check if account is active
    if (!officeUser.is_active) {
      return NextResponse.json(
        {
          success: false,
          message: 'Your account is inactive. Please contact administration.',
        },
        { status: 403 }
      );
    }

    // Generate reset code and token
    const resetCode = generateResetCode();
    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = hashToken(token);
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Invalidate any existing reset tokens for this email
    await supabase
      .from('password_reset_tokens')
      .update({ used: true })
      .eq('email', email)
      .eq('used', false);

    // Store new reset token
    const { error: insertError } = await supabase
      .from('password_reset_tokens')
      .insert({
        email: email,
        reset_code: resetCode,
        token_hash: tokenHash,
        expires_at: expiresAt.toISOString(),
        used: false,
      });

    if (insertError) {
      console.error('Error storing reset token:', insertError);
      return NextResponse.json(
        {
          success: false,
          message: 'Failed to process password reset request. Please try again.',
        },
        { status: 500 }
      );
    }

    // Send reset code via email
    const emailResult = await sendPasswordResetEmail(
      email,
      resetCode,
      officeUser.first_name
    );

    if (!emailResult.success) {
      // Delete the token since we couldn't send the email
      await supabase
        .from('password_reset_tokens')
        .delete()
        .eq('token_hash', tokenHash);

      return NextResponse.json(
        {
          success: false,
          message: 'Failed to send reset code. Please try again later.',
          error: emailResult.error, // Include error details for debugging
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Password reset code sent to your email. Please check your inbox.',
        data: {
          email: email,
          expiresIn: 900, // 15 minutes in seconds
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Request reset error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'An internal error occurred. Please try again later.',
      },
      { status: 500 }
    );
  }
}
