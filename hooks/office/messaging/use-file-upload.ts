/**
 * useFileUpload Hook
 * 
 * Custom hook for handling file uploads with progress tracking and error handling.
 * Validates file size and type before upload.
 * 
 * Requirements: 3.1, 3.2, 3.3, 3.4, 19.4
 */

'use client';

import { useState, useCallback } from 'react';
import { officeMessagingService } from '@/lib/services/office/messaging/messaging-service';
import type { Attachment } from '@/types/office/messaging';

// ============================================================================
// Constants
// ============================================================================

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB for office users

const ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain',
  'text/csv',
];

const FILE_TYPE_LABELS: Record<string, string> = {
  'image/jpeg': 'JPEG Image',
  'image/jpg': 'JPG Image',
  'image/png': 'PNG Image',
  'image/gif': 'GIF Image',
  'application/pdf': 'PDF Document',
  'application/msword': 'Word Document',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Word Document',
  'application/vnd.ms-excel': 'Excel Spreadsheet',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'Excel Spreadsheet',
  'application/vnd.ms-powerpoint': 'PowerPoint Presentation',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'PowerPoint Presentation',
  'text/plain': 'Text File',
  'text/csv': 'CSV File',
};

// ============================================================================
// Hook Interface
// ============================================================================

interface UseFileUploadReturn {
  upload: (file: File, messageId: string) => Promise<Attachment>;
  uploadMultiple: (files: File[], messageId: string) => Promise<Attachment[]>;
  progress: number;
  isUploading: boolean;
  error: string | null;
  validateFile: (file: File) => { valid: boolean; error?: string };
  clearError: () => void;
  cancelUpload: () => void;
}

// ============================================================================
// Hook Implementation
// ============================================================================

/**
 * Hook for file upload with progress tracking
 * 
 * @returns Upload functions, progress, and error state
 */
export function useFileUpload(): UseFileUploadReturn {
  // State
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [abortController, setAbortController] = useState<AbortController | null>(null);

  // ============================================================================
  // File Validation
  // ============================================================================

  /**
   * Validate file size and type
   */
  const validateFile = useCallback((file: File): { valid: boolean; error?: string } => {
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return {
        valid: false,
        error: `File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit. File size: ${(file.size / 1024 / 1024).toFixed(2)}MB`,
      };
    }

    // Check file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      const allowedTypes = Object.values(FILE_TYPE_LABELS).join(', ');
      return {
        valid: false,
        error: `File type "${file.type}" is not allowed. Allowed types: ${allowedTypes}`,
      };
    }

    return { valid: true };
  }, []);

  // ============================================================================
  // Single File Upload
  // ============================================================================

  /**
   * Upload a single file
   */
  const upload = useCallback(async (file: File, messageId: string): Promise<Attachment> => {
    // Validate file
    const validation = validateFile(file);
    if (!validation.valid) {
      setError(validation.error || 'File validation failed');
      throw new Error(validation.error || 'File validation failed');
    }

    try {
      setIsUploading(true);
      setError(null);
      setProgress(0);

      // Create abort controller for cancellation
      const controller = new AbortController();
      setAbortController(controller);

      // Simulate progress (in real implementation, this would track actual upload progress)
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Upload file using the messaging service
      const attachment = await officeMessagingService.uploadAttachment(messageId, file);

      // Complete progress
      clearInterval(progressInterval);
      setProgress(100);

      // Reset after a short delay
      setTimeout(() => {
        setProgress(0);
        setIsUploading(false);
        setAbortController(null);
      }, 500);

      return attachment;
    } catch (err) {
      setProgress(0);
      setIsUploading(false);
      setAbortController(null);

      const errorMessage = err instanceof Error ? err.message : 'Failed to upload file';
      setError(errorMessage);
      throw err;
    }
  }, [validateFile]);

  // ============================================================================
  // Multiple File Upload
  // ============================================================================

  /**
   * Upload multiple files
   */
  const uploadMultiple = useCallback(async (files: File[], messageId: string): Promise<Attachment[]> => {
    // Validate all files first
    for (const file of files) {
      const validation = validateFile(file);
      if (!validation.valid) {
        setError(validation.error || 'File validation failed');
        throw new Error(validation.error || 'File validation failed');
      }
    }

    try {
      setIsUploading(true);
      setError(null);
      setProgress(0);

      const attachments: Attachment[] = [];
      const totalFiles = files.length;

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Update progress based on file index
        setProgress(Math.round((i / totalFiles) * 100));

        try {
          const attachment = await officeMessagingService.uploadAttachment(messageId, file);
          attachments.push(attachment);
        } catch (err) {
          console.error(`Failed to upload ${file.name}:`, err);
          // Continue with other files
        }
      }

      // Complete progress
      setProgress(100);

      // Reset after a short delay
      setTimeout(() => {
        setProgress(0);
        setIsUploading(false);
      }, 500);

      return attachments;
    } catch (err) {
      setProgress(0);
      setIsUploading(false);

      const errorMessage = err instanceof Error ? err.message : 'Failed to upload files';
      setError(errorMessage);
      throw err;
    }
  }, [validateFile]);

  // ============================================================================
  // Cancel Upload
  // ============================================================================

  /**
   * Cancel ongoing upload
   */
  const cancelUpload = useCallback(() => {
    if (abortController) {
      abortController.abort();
      setAbortController(null);
    }
    setIsUploading(false);
    setProgress(0);
    setError('Upload cancelled');
  }, [abortController]);

  // ============================================================================
  // Clear Error
  // ============================================================================

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // ============================================================================
  // Return hook interface
  // ============================================================================

  return {
    upload,
    uploadMultiple,
    progress,
    isUploading,
    error,
    validateFile,
    clearError,
    cancelUpload,
  };
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Get file type label
 */
export function getFileTypeLabel(mimeType: string): string {
  return FILE_TYPE_LABELS[mimeType] || 'Unknown File Type';
}

/**
 * Check if file is an image
 */
export function isImageFile(mimeType: string): boolean {
  return mimeType.startsWith('image/');
}

/**
 * Check if file is a document
 */
export function isDocumentFile(mimeType: string): boolean {
  return mimeType.includes('pdf') || 
         mimeType.includes('word') || 
         mimeType.includes('excel') || 
         mimeType.includes('powerpoint') ||
         mimeType.includes('text');
}
