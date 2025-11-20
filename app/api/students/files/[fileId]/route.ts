/**
 * File Metadata API Endpoint
 * Handles retrieving individual file metadata and generating signed URLs
 * 
 * Requirements:
 * - 7.1: Get file metadata
 * - 7.2: Generate signed URLs with 24-hour expiration
 */

import { NextRequest, NextResponse } from 'next/server';
import { getFileStorageService } from '@/lib/services/file-storage-service';
import { getServerSession } from '@/lib/auth/server-session';

/**
 * GET /api/students/files/[fileId]
 * Get metadata and signed URL for a specific file
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { fileId: string } }
) {
  const requestId = crypto.randomUUID();
  const { fileId } = params;
  
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

    // 2. Get file metadata
    const fileStorageService = getFileStorageService();
    const fileMetadata = await fileStorageService.getFileMetadata(fileId);

    // 3. Verify file belongs to student
    if (fileMetadata.studentId !== studentId) {
      return NextResponse.json(
        {
          error: {
            code: 'PERMISSION_ERROR',
            message: 'Access denied',
            timestamp: new Date().toISOString(),
            requestId,
          },
        },
        { status: 403 }
      );
    }

    // 4. Generate signed URL (Requirement 7.2)
    const signedUrl = await fileStorageService.getSignedUrl(fileId);

    // 5. Return file metadata with signed URL
    return NextResponse.json(
      {
        success: true,
        data: {
          fileId: fileMetadata.fileId,
          fileName: fileMetadata.fileName,
          fileType: fileMetadata.fileType,
          fileSize: fileMetadata.fileSize,
          uploadedAt: fileMetadata.uploadedAt.toISOString(),
          status: fileMetadata.status,
          rejectionReason: fileMetadata.rejectionReason,
          scanResult: fileMetadata.scanResult ? {
            clean: fileMetadata.scanResult.clean,
            threats: fileMetadata.scanResult.threats,
            scannedAt: fileMetadata.scanResult.scannedAt.toISOString(),
          } : undefined,
          signedUrl,
        },
        requestId,
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('File metadata error:', error);

    // Handle not found errors
    if (error instanceof Error && error.message === 'File not found') {
      return NextResponse.json(
        {
          error: {
            code: 'NOT_FOUND',
            message: 'File not found',
            timestamp: new Date().toISOString(),
            requestId,
          },
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: error instanceof Error ? error.message : 'Failed to get file metadata',
          timestamp: new Date().toISOString(),
          requestId,
        },
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/students/files/[fileId]
 * Delete a file
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { fileId: string } }
) {
  const requestId = crypto.randomUUID();
  const { fileId } = params;
  
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

    // 2. Get file metadata to verify ownership
    const fileStorageService = getFileStorageService();
    const fileMetadata = await fileStorageService.getFileMetadata(fileId);

    // 3. Verify file belongs to student
    if (fileMetadata.studentId !== studentId) {
      return NextResponse.json(
        {
          error: {
            code: 'PERMISSION_ERROR',
            message: 'Access denied',
            timestamp: new Date().toISOString(),
            requestId,
          },
        },
        { status: 403 }
      );
    }

    // 4. Delete file
    await fileStorageService.deleteFile(fileId);

    // 5. Return success
    return NextResponse.json(
      {
        success: true,
        message: 'File deleted successfully',
        requestId,
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('File deletion error:', error);

    // Handle not found errors
    if (error instanceof Error && error.message === 'File not found') {
      return NextResponse.json(
        {
          error: {
            code: 'NOT_FOUND',
            message: 'File not found',
            timestamp: new Date().toISOString(),
            requestId,
          },
        },
        { status: 404 }
      );
    }

    // Handle cannot delete approved files
    if (error instanceof Error && error.message.includes('Cannot delete approved')) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: error.message,
            timestamp: new Date().toISOString(),
            requestId,
          },
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: error instanceof Error ? error.message : 'Failed to delete file',
          timestamp: new Date().toISOString(),
          requestId,
        },
      },
      { status: 500 }
    );
  }
}
