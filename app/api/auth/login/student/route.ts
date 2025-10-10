import { NextRequest, NextResponse } from 'next/server';
import { authenticateStudent } from '@/lib/auth/authentication';
import { z } from 'zod';

// Validation schema for student login
const studentLoginSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  studentId: z
    .string()
    .min(6, 'Student ID must be at least 6 digits')
    .max(12, 'Student ID must be at most 12 digits')
    .regex(/^\d+$/, 'Student ID must contain only numbers'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();

    // Validate input
    const validationResult = studentLoginSchema.safeParse(body);
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

    const { username, studentId, password } = validationResult.data;

    // Authenticate student
    const authResult = await authenticateStudent(username, studentId, password);

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
    console.error('Student login API error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'An internal server error occurred. Please try again later.',
      },
      { status: 500 }
    );
  }
}
