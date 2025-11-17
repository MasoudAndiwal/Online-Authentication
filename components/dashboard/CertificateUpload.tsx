'use client';

import { useState, useCallback, useRef } from 'react';
import { Upload, FileText, Image as ImageIcon, FileCheck, FileX, Trash2, Eye, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadedFile } from '@/types/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface CertificateUploadProps {
  files: UploadedFile[];
  onUpload: (file: File) => Promise<void>;
  onDelete: (fileId: string) => Promise<void>;
}

/**
 * CertificateUpload component for medical certificate management
 * Features:
 * - Drag-and-drop upload zone with dashed border (only exception to borderless rule)
 * - Client-side file validation (type and size)
 * - Upload progress indicator with animation
 * - Uploaded files list with borderless cards and shadow-md
 * - Status badges (Pending, Approved, Rejected)
 * - Preview and delete buttons with hover effects
 */
export function CertificateUpload({ files, onUpload, onDelete }: CertificateUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Allowed file types
  const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];
  const ALLOWED_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png'];
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

  /**
   * Validate file type and size
   */
  const validateFile = (file: File): { valid: boolean; error?: string } => {
    // Check file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return {
        valid: false,
        error: 'Invalid file type. Please upload PDF, JPG, or PNG files only.',
      };
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return {
        valid: false,
        error: 'File size exceeds 5MB limit. Please upload a smaller file.',
      };
    }

    return { valid: true };
  };

  /**
   * Handle file upload
   */
  const handleFileUpload = useCallback(
    async (file: File) => {
      // Reset error state
      setUploadError(null);

      // Validate file
      const validation = validateFile(file);
      if (!validation.valid) {
        setUploadError(validation.error!);
        return;
      }

      try {
        setIsUploading(true);
        setUploadProgress(0);

        // Simulate progress (in real implementation, this would come from upload API)
        const progressInterval = setInterval(() => {
          setUploadProgress((prev) => {
            if (prev === null) return 10;
            if (prev >= 90) {
              clearInterval(progressInterval);
              return 90;
            }
            return prev + 10;
          });
        }, 200);

        // Upload file
        await onUpload(file);

        // Complete progress
        clearInterval(progressInterval);
        setUploadProgress(100);

        // Reset after success
        setTimeout(() => {
          setUploadProgress(null);
          setIsUploading(false);
        }, 1000);
      } catch (error) {
        setUploadError(
          error instanceof Error ? error.message : 'Failed to upload file. Please try again.'
        );
        setUploadProgress(null);
        setIsUploading(false);
      }
    },
    [onUpload, validateFile]
  );

  /**
   * Handle drag events
   */
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const droppedFiles = Array.from(e.dataTransfer.files);
      if (droppedFiles.length > 0) {
        handleFileUpload(droppedFiles[0]);
      }
    },
    [handleFileUpload]
  );

  /**
   * Handle file input change
   */
  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = e.target.files;
      if (selectedFiles && selectedFiles.length > 0) {
        handleFileUpload(selectedFiles[0]);
      }
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    [handleFileUpload]
  );

  /**
   * Handle click on upload zone
   */
  const handleUploadZoneClick = useCallback(() => {
    if (!isUploading) {
      fileInputRef.current?.click();
    }
  }, [isUploading]);

  return (
    <div className="space-y-6">
      {/* Upload Zone */}
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleUploadZoneClick}
        className={cn(
          // Base styles - dashed border (only exception to borderless rule)
          'border-2 border-dashed rounded-2xl p-8',
          'transition-all duration-300 cursor-pointer',
          // Default state
          !isDragging && !isUploading && 'border-slate-300 bg-slate-50',
          // Dragging state - gradient background
          isDragging && 'border-blue-400 bg-gradient-to-br from-blue-50 to-violet-50',
          // Uploading state
          isUploading && 'border-blue-400 bg-blue-50 cursor-not-allowed'
        )}
        role="button"
        tabIndex={0}
        aria-label="Upload medical certificate"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleUploadZoneClick();
          }
        }}
      >
        <div className="flex flex-col items-center justify-center gap-4 text-center">
          {/* Upload icon in solid color container */}
          <motion.div
            animate={isDragging ? { scale: 1.1 } : { scale: 1 }}
            transition={{ duration: 0.2 }}
            className={cn(
              'w-16 h-16 rounded-lg flex items-center justify-center',
              isDragging ? 'bg-blue-100' : 'bg-slate-200'
            )}
          >
            <Upload
              className={cn('w-8 h-8', isDragging ? 'text-blue-600' : 'text-slate-600')}
            />
          </motion.div>

          {/* Upload text */}
          <div className="space-y-2">
            <p className="text-base font-semibold text-slate-900">
              {isUploading ? 'Uploading...' : 'Drop your file here or click to browse'}
            </p>
            <p className="text-sm text-slate-600">
              Supported formats: PDF, JPG, PNG (Max 5MB)
            </p>
          </div>

          {/* Upload progress */}
          {uploadProgress !== null && (
            <div className="w-full max-w-xs space-y-2">
              <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${uploadProgress}%` }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  className="h-full bg-gradient-to-r from-blue-500 to-violet-500 rounded-full"
                />
              </div>
              <p className="text-xs text-slate-600 text-center">{uploadProgress}%</p>
            </div>
          )}

          {/* Error message */}
          {uploadError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 text-sm text-red-600 bg-red-50 px-4 py-2 rounded-lg"
            >
              <X className="w-4 h-4" />
              <span>{uploadError}</span>
            </motion.div>
          )}
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept={ALLOWED_EXTENSIONS.join(',')}
          onChange={handleFileInputChange}
          className="hidden"
          aria-hidden="true"
        />
      </div>

      {/* Uploaded Files List */}
      {files.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-900">Uploaded Certificates</h3>
          <UploadedFilesList files={files} onDelete={onDelete} />
        </div>
      )}
    </div>
  );
}

interface UploadedFilesListProps {
  files: UploadedFile[];
  onDelete: (fileId: string) => Promise<void>;
}

/**
 * List of uploaded files with status badges and actions
 */
function UploadedFilesList({ files, onDelete }: UploadedFilesListProps) {
  return (
    <div className="space-y-3">
      <AnimatePresence mode="popLayout">
        {files.map((file, index) => (
          <UploadedFileItem key={file.id} file={file} onDelete={onDelete} index={index} />
        ))}
      </AnimatePresence>
    </div>
  );
}

interface UploadedFileItemProps {
  file: UploadedFile;
  onDelete: (fileId: string) => Promise<void>;
  index: number;
}

/**
 * Individual uploaded file item
 */
function UploadedFileItem({ file, onDelete, index }: UploadedFileItemProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this file?')) {
      setIsDeleting(true);
      try {
        await onDelete(file.id);
      } catch (error) {
        setIsDeleting(false);
        alert('Failed to delete file. Please try again.');
      }
    }
  };

  // Get file icon based on file name
  const getFileIcon = () => {
    const extension = file.fileName.split('.').pop()?.toLowerCase();
    if (extension === 'pdf') {
      return FileText;
    }
    return ImageIcon;
  };

  const FileIcon = getFileIcon();

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Format date
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className={cn(
        // Borderless card with shadow-md
        'bg-white border-0 shadow-md rounded-xl p-4',
        // Hover effect
        'transition-all duration-300 hover:shadow-lg',
        // Deleting state
        isDeleting && 'opacity-50 pointer-events-none'
      )}
    >
      <div className="flex items-center gap-4">
        {/* File icon */}
        <div className="flex-shrink-0">
          <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
            <FileIcon className="w-6 h-6 text-blue-600" />
          </div>
        </div>

        {/* File info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-900 truncate">{file.fileName}</p>
          <div className="flex items-center gap-3 mt-1 text-xs text-slate-600">
            <span>{formatFileSize(file.fileSize)}</span>
            <span>•</span>
            <span>{formatDate(file.uploadDate)}</span>
          </div>
        </div>

        {/* Status badge */}
        <StatusBadge status={file.status} />

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => {
              // Preview functionality (to be implemented)
              alert('Preview functionality coming soon');
            }}
            className="transition-transform duration-200 hover:scale-110"
            aria-label="Preview file"
          >
            <Eye className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={handleDelete}
            disabled={isDeleting}
            className="transition-transform duration-200 hover:scale-110 text-red-600 hover:text-red-700 hover:bg-red-50"
            aria-label="Delete file"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Rejection reason (if rejected) */}
      {file.status === 'rejected' && file.rejectionReason && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-3 pt-3 border-t border-slate-200"
        >
          <p className="text-xs text-red-600">
            <span className="font-semibold">Rejection reason:</span> {file.rejectionReason}
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}

interface StatusBadgeProps {
  status: 'pending' | 'approved' | 'rejected';
}

/**
 * Status badge component
 */
function StatusBadge({ status }: StatusBadgeProps) {
  const statusConfig = {
    pending: {
      label: 'Pending',
      icon: FileText,
      className: 'bg-amber-100 text-amber-700 border-amber-200',
    },
    approved: {
      label: 'Approved',
      icon: FileCheck,
      className: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    },
    rejected: {
      label: 'Rejected',
      icon: FileX,
      className: 'bg-red-100 text-red-700 border-red-200',
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        'flex items-center gap-1.5 px-3 py-1.5 rounded-lg border-0 shadow-sm',
        'text-xs font-semibold',
        config.className
      )}
    >
      <Icon className="w-3.5 h-3.5" />
      <span>{config.label}</span>
    </div>
  );
}
