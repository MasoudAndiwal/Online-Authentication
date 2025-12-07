/**
 * File Upload Service
 * Handles medical certificate uploads with validation and storage
 */

import { supabase } from '@/lib/supabase';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { randomUUID } from 'crypto';
import type { UploadedFile, UploadResponse } from '@/types/types';
// Audit logging removed


// File validation constants
// Requirements: 13.3 - File upload security
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB (increased from 5MB)
const ALLOWED_MIME_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];
const ALLOWED_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png'];

// Magic numbers for file type validation
const FILE_SIGNATURES: Record<string, number[]> = {
  'application/pdf': [0x25, 0x50, 0x44, 0x46], // %PDF
  'image/jpeg': [0xff, 0xd8, 0xff],
  'image/png': [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],
};

/**
 * Validate file type using magic numbers (file signature)
 */
function validateFileType(buffer: Buffer, mimeType: string): boolean {
  const signature = FILE_SIGNATURES[mimeType];
  if (!signature) {
    return false;
  }

  // Check if buffer starts with the expected signature
  for (let i = 0; i < signature.length; i++) {
    if (buffer[i] !== signature[i]) {
      return false;
    }
  }

  return true;
}

/**
 * Validate file extension
 */
function validateFileExtension(fileName: string): boolean {
  const ext = fileName.toLowerCase().substring(fileName.lastIndexOf('.'));
  return ALLOWED_EXTENSIONS.includes(ext);
}

/**
 * Sanitize file name to prevent path traversal attacks
 */
function sanitizeFileName(fileName: string): string {
  // Remove any path components
  const baseName = fileName.replace(/^.*[\\\/]/, '');
  
  // Remove special characters except dots, dashes, and underscores
  const sanitized = baseName.replace(/[^a-zA-Z0-9._-]/g, '_');
  
  return sanitized;
}

/**
 * Generate unique file name
 */
function generateUniqueFileName(originalName: string): string {
  const ext = originalName.substring(originalName.lastIndexOf('.'));
  const uuid = randomUUID();
  return `${uuid}${ext}`;
}

/**
 * Ensure upload directory exists
 */
async function ensureUploadDirectory(): Promise<string> {
  // Store files outside public directory for security
  const uploadDir = join(process.cwd(), 'uploads', 'medical-certificates');
  
  try {
    await mkdir(uploadDir, { recursive: true });
  } catch (error) {
    console.error('Error creating upload directory:', error);
    throw new Error('Failed to create upload directory');
  }
  
  return uploadDir;
}

/**
 * Save file to disk
 */
async function saveFileToDisk(
  buffer: Buffer,
  fileName: string
): Promise<string> {
  const uploadDir = await ensureUploadDirectory();
  const filePath = join(uploadDir, fileName);
  
  try {
    await writeFile(filePath, buffer);
    return filePath;
  } catch (error) {
    console.error('Error saving file:', error);
    throw new Error('Failed to save file');
  }
}

/**
 * Save file metadata to database
 */
async function saveFileMetadata(
  studentId: string,
  fileName: string,
  filePath: string,
  fileSize: number
): Promise<UploadedFile | null> {
  const { data, error } = await supabase
    .from('medical_certificates')
    .insert({
      student_id: studentId,
      file_name: fileName,
      file_path: filePath,
      file_size: fileSize,
      status: 'pending',
    })
    .select('id, file_name, file_size, upload_date, status')
    .single();

  if (error) {
    console.error('Error saving file metadata:', error);
    return null;
  }

  return {
    id: data.id,
    fileName: data.file_name,
    fileSize: data.file_size,
    uploadDate: data.upload_date,
    status: data.status as 'pending' | 'approved' | 'rejected',
  };
}

/**
 * Upload medical certificate file
 * 
 * Security features:
 * - File type validation (PDF, JPG, PNG only)
 * - File size limits (max 10MB)
 * - Magic number validation to prevent file type spoofing
 * - Secure file naming to prevent path traversal
 * - Files stored outside public directory
 * 
 * Requirements: 13.3 - File upload security
 * 
 * @param studentId - ID of the student uploading the file
 * @param file - File to upload
 * @param ipAddress - Optional IP address for audit logging
 * @param userAgent - Optional user agent for audit logging
 */
export async function uploadMedicalCertificate(
  studentId: string,
  file: File,
  ipAddress?: string,
  userAgent?: string
): Promise<UploadResponse> {
  // Audit logging removed

  
  try {
    // Validate file size (max 10MB)
    if (file.size > MAX_FILE_SIZE) {
      // Log failed upload attempt
      // Audit logging removed

      
      return {
        success: false,
        error: `File size exceeds maximum limit of ${MAX_FILE_SIZE / 1024 / 1024}MB`,
      };
    }

    // Validate minimum file size (prevent empty files)
    if (file.size < 100) {
      // Log failed upload attempt
      // Audit logging removed

      
      return {
        success: false,
        error: 'File is too small or empty',
      };
    }

    // Validate file extension
    if (!validateFileExtension(file.name)) {
      // Log failed upload attempt
      // Audit logging removed

      
      return {
        success: false,
        error: 'Invalid file type. Only PDF, JPG, and PNG files are allowed',
      };
    }

    // Validate MIME type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      // Log failed upload attempt
      // Audit logging removed

      
      return {
        success: false,
        error: 'Invalid file type. Only PDF, JPG, and PNG files are allowed',
      };
    }

    // Read file buffer for magic number validation
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Validate file type using magic numbers (prevents file type spoofing)
    if (!validateFileType(buffer, file.type)) {
      // Log failed upload attempt
      // Audit logging removed

      
      return {
        success: false,
        error: 'File type validation failed. The file may be corrupted or not a valid PDF/JPG/PNG',
      };
    }

    // Sanitize and generate unique file name
    const sanitizedName = sanitizeFileName(file.name);
    const uniqueFileName = generateUniqueFileName(sanitizedName);

    // Save file to disk
    const filePath = await saveFileToDisk(buffer, uniqueFileName);

    // Save metadata to database
    const uploadedFile = await saveFileMetadata(
      studentId,
      sanitizedName,
      filePath,
      file.size
    );

    if (!uploadedFile) {
      // Log failed upload
      // Audit logging removed

      
      return {
        success: false,
        error: 'Failed to save file metadata',
      };
    }

    // Log successful upload
    // Audit logging removed


    return {
      success: true,
      file: uploadedFile,
    };
  } catch (error) {
    console.error('Error uploading file:', error);
    
    // Log failed upload
    // Audit logging removed

    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to upload file',
    };
  }
}

/**
 * Delete uploaded file
 */
export async function deleteMedicalCertificate(
  fileId: string,
  studentId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Verify file belongs to student
    const { data: file, error: fetchError } = await supabase
      .from('medical_certificates')
      .select('id, student_id, status')
      .eq('id', fileId)
      .eq('student_id', studentId)
      .single();

    if (fetchError || !file) {
      return {
        success: false,
        error: 'File not found or access denied',
      };
    }

    // Don't allow deletion of approved files
    if (file.status === 'approved') {
      return {
        success: false,
        error: 'Cannot delete approved certificates',
      };
    }

    // Delete from database
    const { error: deleteError } = await supabase
      .from('medical_certificates')
      .delete()
      .eq('id', fileId);

    if (deleteError) {
      return {
        success: false,
        error: 'Failed to delete file',
      };
    }

    return { success: true };
  } catch (error) {
    console.error('Error deleting file:', error);
    return {
      success: false,
      error: 'Failed to delete file',
    };
  }
}
