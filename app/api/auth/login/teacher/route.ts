import { NextRequest, NextResponse } from 'next/server';
import { authenticateTeacher } from '@/lib/auth/authentication';
import { z } from 'zod';

// Validation schema for teacher login
const teacherLoginSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export async function POST(request: NextRequest) {
  try {
    console.log('🔥 Teacher login API called');
    
    // Parse request body
    const body = await request.json();
    console.log('📦 Request body:', body);

    // Validate input
    const validationResult = teacherLoginSchema.safeParse(body);
    if (!validationResult.success) {
      console.log('❌ Validation failed:', validationResult.error.flatten().fieldErrors);
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid input',
          errors: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    console.log('✅ Validation passed');
    const { username, password } = validationResult.data;

    // Authenticate teacher
    console.log('🔐 Calling authenticateTeacher...');
    const authResult = await authenticateTeacher(username, password);
    console.log('🔐 Auth result:', { success: authResult.success, message: authResult.message });

    if (!authResult.success) {
      console.log('❌ Authentication failed');
      return NextResponse.json(
        {
          success: false,
          message: authResult.message,
        },
        { status: 401 }
      );
    }

    console.log('✅ Authentication successful');
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
    console.error('❌ Teacher login API error:', error);
    console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json(
      {
        success: false,
        message: 'An internal server error occurred. Please try again later.',
      },
      { status: 500 }
    );
  }
}
