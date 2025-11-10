import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/auth/forgot-password/verify-code
 * Verify the reset code sent to user's email
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, code } = body;

    if (!email || !code) {
      return NextResponse.json(
        { error: 'Email and verification code are required' },
        { status: 400 }
      );
    }

    // TODO: Implement actual code verification logic
    // For now, return success for demo purposes
    console.log(`[Verify Code API] Verifying code for email: ${email}`);

    // Mock verification - in real implementation, check against stored codes
    if (code === '123456') {
      return NextResponse.json({
        success: true,
        message: 'Code verified successfully',
        resetToken: 'mock-reset-token-' + Date.now()
      });
    }

    return NextResponse.json(
      { error: 'Invalid verification code' },
      { status: 400 }
    );

  } catch (error) {
    console.error('[Verify Code API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to verify code' },
      { status: 500 }
    );
  }
}