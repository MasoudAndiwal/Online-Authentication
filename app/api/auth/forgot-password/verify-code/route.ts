import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabase } from '@/lib/supabase';
import crypto from 'crypto';

// Validation schema
const verifyCodeSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  code: z.string().length(6, 'Code must be 6 digits').regex(/^\d+$/, 'Code must contain only numbers'),
});

// Generate verification token for password reset step
function generateVerificationToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * POST /api/auth/forgot-password/verify-code
 * Verify the reset code sent to user's email
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validationResult = verifyCodeSchema.safeParse(body);
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

    const { email, code } = validationResult.data;

    // Check if the code exists and is valid
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
          message: 'Invalid or expired verification code. Please request a new one.',
        },
        { status: 400 }
      );
    }

    // Generate a verification token for the password reset step
    const verificationToken = generateVerificationToken();

    return NextResponse.json({
      success: true,
      message: 'Code verified successfully',
      data: {
        verificationToken: verificationToken,
        email: email,
      }
    });

  } catch (error) {
    console.error('[Verify Code API] Error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to verify code. Please try again.',
      },
      { status: 500 }
    );
  }
}
