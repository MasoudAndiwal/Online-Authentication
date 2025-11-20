/**
 * File Listing API Endpoint
 * Handles listing and retrieving medical certificate files for students
 * 
 * Requirements:
 * - 7.1: List files for student
 */

import { NextRequest, NextResponse } from 'next/server';
import { getFileStorageService } from '@/lib/services/file-storage-service';
import { getServerSession } from '@/lib/auth/server-session';

/**
 * GET /api/students/files
 * List all files for the authenticated student
 */
export async function GET(request: NextRequest) {
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

    // 2. Get files from storage service
    const fileStorageService = getFileStorageService();
    const files = await fileStorageService.listStudentFiles(studentId);

    // 3. Return file list
    return NextResponse.json(
      {
        success: true,
        data: {
          files: files.map(file => ({
            fileId: file.fileId,
            fileName: file.fileName,
            fileType: file.fileType,
            fileSize: file.fileSize,
            uploadedAt: file.uploadedAt.toISOString(),
            status: file.status,
            rejectionReason: file.rejectionReason,
            scanResult: file.scanResult ? {
              clean: file.scanResult.clean,
              threats: file.scanResult.threats,
              scannedAt: file.scanResult.scannedAt.toISOString(),
            } : undefined,
          })),
          total: files.length,
        },
        requestId,
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('File listing error:', error);

    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: error instanceof Error ? error.message : 'Failed to list files',
          timestamp: new Date().toISOString(),
          requestId,
        },
      },
      { status: 500 }
    );
  }
}
