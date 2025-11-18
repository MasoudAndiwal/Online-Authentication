/**
 * useFileUpload Hook
 * Manages file upload with validation, progress tracking, and state management
 */

'use client';

import { useState, useCallback } from 'react';
import { getSession } from '@/lib/auth/session';
import type { UploadedFile, UploadResponse } from '@/types/types';

// File validation constants
// Requirements: 13.3 - File upload security
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIME_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];
const ALLOWED_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png'];

type UploadState = 'idle' | 'uploading' | 'success' | 'error';

interface UseFileUploadReturn {
  uploadState: UploadState;
  uploadProgress: number;
  uploadedFile: UploadedFile | null;
  error: string | null;
  uploadFile: (file: File) => Promise<void>;
  reset: () => void;
  validateFile: (file: File) => { valid: boolean; error?: string };
}

/**
 * Validate file extension
 */
function validateFileExtension(fileName: string): boolean {
  const ext = fileName.toLowerCase().substring(fileName.lastIndexOf('.'));
  return ALLOWED_EXTENSIONS.includes(ext);
}

/**
 * Validate file MIME type
 */
function validateMimeType(mimeType: string): boolean {
  return ALLOWED_MIME_TYPES.includes(mimeType);
}

/**
 * Custom hook for file upload with client-side validation and progress tracking
 * 
 * Features:
 * - Client-side file validation (type, size)
 * - Upload progress tracking
 * - State management (idle, uploading, success, error)
 * - Error handling
 * - Secure file type validation
 * 
 * Security:
 * - File type validation (PDF, JPG, PNG only)
 * - File size limits (max 10MB)
 * - MIME type validation
 * 
 * Requirements: 13.3 - File upload security
 */
export function useFileUpload(): UseFileUploadReturn {
  const [uploadState, setUploadState] = useState<UploadState>('idle');
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [error, setError] = useState<string | null>(null);

  /**
   * Validate file before upload
   * Performs client-side validation for security
   */
  const validateFile = useCallback((file: File): { valid: boolean; error?: string } => {
    // Validate file size (max 10MB)
    if (file.size > MAX_FILE_SIZE) {
      return {
        valid: false,
        error: `File size exceeds maximum limit of ${MAX_FILE_SIZE / 1024 / 1024}MB`,
      };
    }

    // Validate minimum file size (prevent empty files)
    if (file.size < 100) {
      return {
        valid: false,
        error: 'File is too small or empty',
      };
    }

    // Validate file extension
    if (!validateFileExtension(file.name)) {
      return {
        valid: false,
        error: 'Invalid file type. Only PDF, JPG, and PNG files are allowed',
      };
    }

    // Validate MIME type
    if (!validateMimeType(file.type)) {
      return {
        valid: false,
        error: 'Invalid file type. Only PDF, JPG, and PNG files are allowed',
      };
    }

    return { valid: true };
  }, []);

  /**
   * Upload file with progress tracking
   */
  const uploadFile = useCallback(async (file: File): Promise<void> => {
    // Reset state
    setError(null);
    setUploadedFile(null);
    setUploadProgress(0);

    // Validate file
    const validation = validateFile(file);
    if (!validation.valid) {
      setError(validation.error || 'File validation failed');
      setUploadState('error');
      return;
    }

    // Check authentication
    const session = getSession();
    if (!session) {
      setError('You must be logged in to upload files');
      setUploadState('error');
      return;
    }

    setUploadState('uploading');

    try {
      // Create FormData
      const formData = new FormData();
      formData.append('file', file);
      formData.append('studentId', session.id);

      // Create XMLHttpRequest for progress tracking
      const xhr = new XMLHttpRequest();

      // Track upload progress
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(progress);
        }
      });

      // Handle completion
      const uploadPromise = new Promise<UploadResponse>((resolve, reject) => {
        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const response = JSON.parse(xhr.responseText) as UploadResponse;
              resolve(response);
            } catch (err) {
              reject(new Error('Failed to parse server response'));
            }
          } else {
            try {
              const errorResponse = JSON.parse(xhr.responseText);
              reject(new Error(errorResponse.error || `Upload failed with status ${xhr.status}`));
            } catch (err) {
              reject(new Error(`Upload failed with status ${xhr.status}`));
            }
          }
        });

        xhr.addEventListener('error', () => {
          reject(new Error('Network error occurred during upload'));
        });

        xhr.addEventListener('abort', () => {
          reject(new Error('Upload was cancelled'));
        });
      });

      // Send request
      xhr.open('POST', '/api/upload');
      xhr.send(formData);

      // Wait for completion
      const response = await uploadPromise;

      if (response.success && response.file) {
        setUploadedFile(response.file);
        setUploadProgress(100);
        setUploadState('success');
      } else {
        setError(response.error || 'Upload failed');
        setUploadState('error');
      }
    } catch (err: any) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload file';
      setError(errorMessage);
      setUploadState('error');
      setUploadProgress(0);
    }
  }, [validateFile]);

  /**
   * Reset upload state
   */
  const reset = useCallback(() => {
    setUploadState('idle');
    setUploadProgress(0);
    setUploadedFile(null);
    setError(null);
  }, []);

  return {
    uploadState,
    uploadProgress,
    uploadedFile,
    error,
    uploadFile,
    reset,
    validateFile,
  };
}
