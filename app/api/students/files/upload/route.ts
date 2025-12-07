/**
 * File Upload API Endpoint
 * Handles medical certificate uploads for students
 * 
 * Requirements:
 * - 7.1: Store files in Supabase Storage with virus scanning
 * - 7.2: Generate signed URLs with 24-hour expiration
 * - 7.3: Reject uploads exceeding 10MB
 * - 4.2: Rate limiting for uploads (10 per hour)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getFileStorageService } from '@/lib/services/file-storage-service';
import { getVirusScanningService } from '@/lib/services/virus-scanning-service';
// Audit logging removed
import { getRateLimiterService } from '@/lib/services/rate-limiter-service';
import { getServerSession } from '@/lib/auth/server-session';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

/**
 * POST /api/students/files/upload
 * Upload a medical certificate file
 */
export async function POST(request: NextRequest) {
  const requestId = crypto.randomUUID();
  
  try {
    // 1. Authentication
    const session = await getServerSession();
    if (!session || session.role !== 'student') {
      return NextResponse.json(
        {
          error: {
            code: 'AUTHENTICATION_ERROR',
            message: 'Authentication required',
            timestamp: new Date().toISOString(),
            requestId,
          },
        },
        { status: 401 }
      );
    }

    const studentId = session.userId;

    // 2. Rate Limiting (Requirement 4.2)
    const rateLimiter = getRateLimiterService();
    const rateLimitResult = await rateLimiter.checkLimit(studentId, 'upload');
    
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: 'Too many upload requests. Please try again later.',
            retryAfter: rateLimitResult.retryAfter,
            timestamp: new Date().toISOString(),
            requestId,
          },
        },
        {
          status: 429,
          headers: {
            'Retry-After': rateLimitResult.retryAfter?.toString() || '3600',
            'X-RateLimit-Limit': '10',
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'X-RateLimit-Reset': rateLimitResult.resetAt.toISOString(),
          },
        }
      );
    }

    // Record the request
    await rateLimiter.recordRequest(studentId, 'upload');

    // 3. Parse multipart form data
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const description = formData.get('description') as string | null;

    if (!file) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'No file provided',
            field: 'file',
            timestamp: new Date().toISOString(),
            requestId,
          },
        },
        { status: 400 }
      );
    }

    // 4. Validate file size (Requirement 7.3)
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: `File size exceeds maximum limit of ${MAX_FILE_SIZE / 1024 / 1024}MB`,
            field: 'file',
            timestamp: new Date().toISOString(),
            requestId,
          },
        },
        { status: 400 }
      );
    }

    // 5. Upload file (Requirements 7.1, 7.2)
    const fileStorageService = getFileStorageService();
    const uploadResult = await fileStorageService.uploadFile(file, studentId, {
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      description: description || undefined,
    });

    // 6. Trigger virus scanning asynchronously (Requirement 7.1)
    const virusScanningService = getVirusScanningService();
    // Don't await - let it run in background
    virusScanningService.scanFile(uploadResult.fileId).catch(error => {
      console.error('Virus scanning failed:', error);
    });

    // 7. Audit logging removed

    // 8. Return success response with signed URL (Requirement 7.2)
    return NextResponse.json(
      {
        success: true,
        data: {
          fileId: uploadResult.fileId,
          fileName: uploadResult.fileName,
          fileSize: uploadResult.fileSize,
          uploadedAt: uploadResult.uploadedAt.toISOString(),
          status: uploadResult.status,
          signedUrl: uploadResult.signedUrl,
        },
        requestId,
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('File upload error:', error);

    // Audit log the failure
    try {
      // Audit logging removed

    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: error instanceof Error ? error.message : 'Failed to upload file',
          timestamp: new Date().toISOString(),
          requestId,
        },
      },
      { status: 500 }
    );
  }
}
