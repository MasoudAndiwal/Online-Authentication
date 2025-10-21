import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabase } from '@/lib/supabase';
import crypto from 'crypto';

const verifyCodeSchema = z.object({
  email: z.string().email(),
  code: z.string().length(6, 'Code must be 6 digits').regex(/^\d+$/, 'Code must be numeric'),
});

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validationResult = verifyCodeSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid verification code',
          errors: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { email, code } = validationResult.data;

    // Find valid reset token
    const { data: resetToken, error } = await supabase
      .from('password_reset_tokens')
      .select('*')
      .eq('email', email)
      .eq('reset_code', code)
      .eq('used', false)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (error || !resetToken) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid or expired verification code. Please request a new one.',
        },
        { status: 401 }
      );
    }

    // Generate verification token for password reset
    const verificationToken = crypto.randomBytes(32).toString('hex');

    return NextResponse.json(
      {
        success: true,
        message: 'Code verified successfully',
        data: {
          verificationToken: verificationToken,
          email: email,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Verify code error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'An internal error occurred. Please try again.',
      },
      { status: 500 }
    );
  }
}
