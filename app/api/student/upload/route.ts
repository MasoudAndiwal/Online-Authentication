/**
 * File Upload API Route
 * POST /api/student/upload
 * 
 * Handles medical certificate uploads for students
 * Validates file type, size, and stores securely
 */

import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, requireRole } from '@/lib/api/auth-middleware';
import { uploadMedicalCertificate, deleteMedicalCertificate } from '@/lib/services/file-upload-service';

/**
 * POST - Upload medical certificate
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate the request
    const { user, error: authError } = await authenticateRequest(request);
    
    if (authError || !user) {
      return authError || NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Only students can upload certificates
    const { authorized, error: roleError } = requireRole(user, ['STUDENT']);
    
    if (!authorized || roleError) {
      return roleError || NextResponse.json(
        { error: 'Forbidden', message: 'Only students can upload medical certificates' },
        { status: 403 }
      );
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    // Upload file
    const result = await uploadMedicalCertificate(user.id, file);

    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Error in file upload API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Delete uploaded certificate
 */
export async function DELETE(request: NextRequest) {
  try {
    // Authenticate the request
    const { user, error: authError } = await authenticateRequest(request);
    
    if (authError || !user) {
      return authError || NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Only students can delete their certificates
    const { authorized, error: roleError } = requireRole(user, ['STUDENT']);
    
    if (!authorized || roleError) {
      return roleError || NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Get file ID from query params
    const { searchParams } = new URL(request.url);
    const fileId = searchParams.get('fileId');

    if (!fileId) {
      return NextResponse.json(
        { success: false, error: 'File ID is required' },
        { status: 400 }
      );
    }

    // Delete file
    const result = await deleteMedicalCertificate(fileId, user.id);

    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Error in file delete API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
