import { NextRequest, NextResponse } from 'next/server';
import { authenticateOffice } from '@/lib/auth/authentication';
import { z } from 'zod';

// Validation schema for office login
const officeLoginSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();

    // Validate input
    const validationResult = officeLoginSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid input',
          errors: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { username, password } = validationResult.data;

    // Authenticate office user
    const authResult = await authenticateOffice(username, password);

    if (!authResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: authResult.message,
        },
        { status: 401 }
      );
    }

    // Return success response
    return NextResponse.json(
      {
        success: true,
        message: authResult.message,
        data: authResult.data,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Office login API error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'An internal server error occurred. Please try again later.',
      },
      { status: 500 }
    );
  }
}
