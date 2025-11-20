/**
 * File Storage Service
 * Handles secure file upload, storage, and retrieval for medical certificates using Supabase Storage
 * 
 * Requirements:
 * - 7.1: Store files in Supabase Storage with virus scanning
 * - 7.2: Generate signed URLs with 24-hour expiration
 * - 7.3: Reject uploads exceeding 10MB
 */

import { supabase } from '@/lib/supabase';
import { randomUUID } from 'crypto';

// File validation constants
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIME_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];
const ALLOWED_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png'];
const SIGNED_URL_EXPIRY = 24 * 60 * 60; // 24 hours in seconds
const STORAGE_BUCKET = 'medical-certificates';

// Magic numbers for file type validation
const FILE_SIGNATURES: Record<string, number[]> = {
  'application/pdf': [0x25, 0x50, 0x44, 0x46], // %PDF
  'image/jpeg': [0xff, 0xd8, 0xff],
  'image/png': [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],
};

// Type definitions
export interface FileMetadata {
  fileName: string;
  fileType: string;
  fileSize: number;
  description?: string;
}

export interface UploadResult {
  fileId: string;
  fileName: string;
  fileSize: number;
  uploadedAt: Date;
  status: 'pending' | 'scanning' | 'approved' | 'rejected';
  signedUrl: string;
}

export interface StoredFileMetadata extends FileMetadata {
  fileId: string;
  studentId: string;
  uploadedAt: Date;
  status: FileStatus;
  rejectionReason?: string;
  scanResult?: VirusScanResult;
}

export type FileStatus = 'pending' | 'scanning' | 'approved' | 'rejected' | 'quarantined';

export interface VirusScanResult {
  clean: boolean;
  threats: string[];
  scannedAt: Date;
}

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
 * Generate unique file path for storage
 */
function generateStoragePath(studentId: string, fileName: string): string {
  const ext = fileName.substring(fileName.lastIndexOf('.'));
  const uuid = randomUUID();
  return `${studentId}/${uuid}${ext}`;
}

/**
 * File Storage Service
 * Manages file uploads, storage, and retrieval using Supabase Storage
 */
export class FileStorageService {
  /**
   * Upload file with validation and virus scanning
   * 
   * Requirements: 7.1, 7.2, 7.3
   */
  async uploadFile(
    file: File,
    studentId: string,
    metadata: FileMetadata
  ): Promise<UploadResult> {
    // Validate file size (Requirement 7.3)
    if (file.size > MAX_FILE_SIZE) {
      throw new Error(`File size exceeds maximum limit of ${MAX_FILE_SIZE / 1024 / 1024}MB`);
    }

    // Validate minimum file size (prevent empty files)
    if (file.size < 100) {
      throw new Error('File is too small or empty');
    }

    // Validate file extension
    if (!validateFileExtension(metadata.fileName)) {
      throw new Error('Invalid file type. Only PDF, JPG, and PNG files are allowed');
    }

    // Validate MIME type
    if (!ALLOWED_MIME_TYPES.includes(metadata.fileType)) {
      throw new Error('Invalid file type. Only PDF, JPG, and PNG files are allowed');
    }

    // Read file buffer for magic number validation
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Validate file type using magic numbers (prevents file type spoofing)
    if (!validateFileType(buffer, metadata.fileType)) {
      throw new Error('File type validation failed. The file may be corrupted or not a valid PDF/JPG/PNG');
    }

    // Sanitize and generate unique file path
    const sanitizedName = sanitizeFileName(metadata.fileName);
    const storagePath = generateStoragePath(studentId, sanitizedName);

    // Upload to Supabase Storage (Requirement 7.1)
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(storagePath, buffer, {
        contentType: metadata.fileType,
        upsert: false,
      });

    if (uploadError) {
      throw new Error(`Failed to upload file: ${uploadError.message}`);
    }

    // Save metadata to database with scan status
    const { data: dbData, error: dbError } = await supabase
      .from('medical_certificates')
      .insert({
        student_id: studentId,
        file_name: sanitizedName,
        file_path: storagePath,
        file_size: metadata.fileSize,
        status: 'pending',
        scan_status: 'pending', // Will be updated by virus scanning
        quarantined: false,
        reason: metadata.description || 'Medical certificate',
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date().toISOString().split('T')[0],
      })
      .select('id, file_name, file_size, created_at, status')
      .single();

    if (dbError) {
      // Cleanup uploaded file if database insert fails
      await supabase.storage.from(STORAGE_BUCKET).remove([storagePath]);
      throw new Error(`Failed to save file metadata: ${dbError.message}`);
    }

    // Generate signed URL (Requirement 7.2)
    const signedUrl = await this.getSignedUrl(dbData.id, SIGNED_URL_EXPIRY);

    return {
      fileId: dbData.id,
      fileName: dbData.file_name,
      fileSize: dbData.file_size,
      uploadedAt: new Date(dbData.created_at),
      status: dbData.status as FileStatus,
      signedUrl,
    };
  }

  /**
   * Generate signed URL with 24-hour expiration
   * 
   * Requirements: 7.2
   */
  async getSignedUrl(fileId: string, expiresIn: number = SIGNED_URL_EXPIRY): Promise<string> {
    // Get file path from database
    const { data: fileData, error: fetchError } = await supabase
      .from('medical_certificates')
      .select('file_path')
      .eq('id', fileId)
      .single();

    if (fetchError || !fileData) {
      throw new Error('File not found');
    }

    // Generate signed URL
    const { data: signedData, error: signedError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .createSignedUrl(fileData.file_path, expiresIn);

    if (signedError || !signedData) {
      throw new Error(`Failed to generate signed URL: ${signedError?.message}`);
    }

    return signedData.signedUrl;
  }

  /**
   * Delete file from storage and database
   */
  async deleteFile(fileId: string): Promise<void> {
    // Get file path from database
    const { data: fileData, error: fetchError } = await supabase
      .from('medical_certificates')
      .select('file_path, status')
      .eq('id', fileId)
      .single();

    if (fetchError || !fileData) {
      throw new Error('File not found');
    }

    // Don't allow deletion of approved files
    if (fileData.status === 'approved') {
      throw new Error('Cannot delete approved certificates');
    }

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .remove([fileData.file_path]);

    if (storageError) {
      throw new Error(`Failed to delete file from storage: ${storageError.message}`);
    }

    // Delete from database
    const { error: dbError } = await supabase
      .from('medical_certificates')
      .delete()
      .eq('id', fileId);

    if (dbError) {
      throw new Error(`Failed to delete file metadata: ${dbError.message}`);
    }
  }

  /**
   * Get file metadata
   */
  async getFileMetadata(fileId: string): Promise<StoredFileMetadata> {
    const { data, error } = await supabase
      .from('medical_certificates')
      .select('id, student_id, file_name, file_size, created_at, status, review_notes, scan_status, scan_result, quarantined')
      .eq('id', fileId)
      .single();

    if (error || !data) {
      throw new Error('File not found');
    }

    return {
      fileId: data.id,
      studentId: data.student_id,
      fileName: data.file_name,
      fileType: this.getFileTypeFromName(data.file_name),
      fileSize: data.file_size,
      uploadedAt: new Date(data.created_at),
      status: data.status as FileStatus,
      rejectionReason: data.review_notes,
      scanResult: data.scan_result ? {
        clean: data.scan_result.clean,
        threats: data.scan_result.threats || [],
        scannedAt: new Date(data.scan_result.scannedAt),
      } : undefined,
    };
  }

  /**
   * List files for a student
   */
  async listStudentFiles(studentId: string): Promise<StoredFileMetadata[]> {
    const { data, error } = await supabase
      .from('medical_certificates')
      .select('id, student_id, file_name, file_size, created_at, status, review_notes, scan_status, scan_result, quarantined')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to list files: ${error.message}`);
    }

    return (data || []).map(file => ({
      fileId: file.id,
      studentId: file.student_id,
      fileName: file.file_name,
      fileType: this.getFileTypeFromName(file.file_name),
      fileSize: file.file_size,
      uploadedAt: new Date(file.created_at),
      status: file.status as FileStatus,
      rejectionReason: file.review_notes,
      scanResult: file.scan_result ? {
        clean: file.scan_result.clean,
        threats: file.scan_result.threats || [],
        scannedAt: new Date(file.scan_result.scannedAt),
      } : undefined,
    }));
  }

  /**
   * Update file status (after review or scanning)
   */
  async updateFileStatus(
    fileId: string,
    status: FileStatus,
    reason?: string
  ): Promise<void> {
    const updateData: any = {
      status,
      scan_status: status === 'scanning' ? 'scanning' : status === 'approved' ? 'clean' : 'pending',
    };

    if (reason) {
      updateData.review_notes = reason;
    }

    if (status === 'quarantined') {
      updateData.quarantined = true;
    }

    const { error } = await supabase
      .from('medical_certificates')
      .update(updateData)
      .eq('id', fileId);

    if (error) {
      throw new Error(`Failed to update file status: ${error.message}`);
    }
  }

  /**
   * Helper method to determine file type from file name
   */
  private getFileTypeFromName(fileName: string): string {
    const ext = fileName.toLowerCase().substring(fileName.lastIndexOf('.'));
    switch (ext) {
      case '.pdf':
        return 'application/pdf';
      case '.jpg':
      case '.jpeg':
        return 'image/jpeg';
      case '.png':
        return 'image/png';
      default:
        return 'application/octet-stream';
    }
  }
}

// Export singleton instance
let fileStorageServiceInstance: FileStorageService | null = null;

export function getFileStorageService(): FileStorageService {
  if (!fileStorageServiceInstance) {
    fileStorageServiceInstance = new FileStorageService();
  }
  return fileStorageServiceInstance;
}
