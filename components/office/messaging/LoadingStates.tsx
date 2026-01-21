/**
 * LoadingStates Component
 * 
 * Various loading indicators for different operations in the messaging system.
 * 
 * Requirements: 19.1, 19.5
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Loader2, Send, Download, Upload } from 'lucide-react';

// ============================================================================
// Generic Loading Spinner
// ============================================================================

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  label?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  className = '',
  label 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      >
        <Loader2 className={`${sizeClasses[size]} text-blue-500`} />
      </motion.div>
      {label && <span className="text-sm text-gray-600">{label}</span>}
    </div>
  );
};

// ============================================================================
// Message Sending Indicator
// ============================================================================

export const SendingIndicator: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`flex items-center gap-2 text-blue-600 ${className}`}>
      <motion.div
        animate={{ x: [0, 5, 0] }}
        transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }}
      >
        <Send className="w-4 h-4" />
      </motion.div>
      <span className="text-sm">Sending...</span>
    </div>
  );
};

// ============================================================================
// File Upload Indicator
// ============================================================================

interface UploadIndicatorProps {
  progress?: number;
  fileName?: string;
  className?: string;
}

export const UploadIndicator: React.FC<UploadIndicatorProps> = ({ 
  progress = 0, 
  fileName,
  className = '' 
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center gap-2">
        <motion.div
          animate={{ y: [-2, 2, -2] }}
          transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Upload className="w-4 h-4 text-blue-500" />
        </motion.div>
        <span className="text-sm text-gray-700">
          {fileName ? `Uploading ${fileName}...` : 'Uploading...'}
        </span>
        <span className="text-sm text-gray-500">{progress}%</span>
      </div>
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-blue-500 to-blue-600"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
    </div>
  );
};

// ============================================================================
// File Download Indicator
// ============================================================================

interface DownloadIndicatorProps {
  progress?: number;
  fileName?: string;
  className?: string;
}

export const DownloadIndicator: React.FC<DownloadIndicatorProps> = ({ 
  progress = 0, 
  fileName,
  className = '' 
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center gap-2">
        <motion.div
          animate={{ y: [2, -2, 2] }}
          transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Download className="w-4 h-4 text-blue-500" />
        </motion.div>
        <span className="text-sm text-gray-700">
          {fileName ? `Downloading ${fileName}...` : 'Downloading...'}
        </span>
        <span className="text-sm text-gray-500">{progress}%</span>
      </div>
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-green-500 to-green-600"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
    </div>
  );
};

// ============================================================================
// Skeleton Loaders
// ============================================================================

export const ConversationSkeleton: React.FC = () => {
  return (
    <div className="p-4 space-y-3 animate-pulse">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gray-200 rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4" />
            <div className="h-3 bg-gray-200 rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
};

export const MessageSkeleton: React.FC = () => {
  return (
    <div className="p-4 space-y-4 animate-pulse">
      {[1, 2, 3].map((i) => (
        <div key={i} className={`flex gap-3 ${i % 2 === 0 ? 'flex-row-reverse' : ''}`}>
          <div className="w-10 h-10 bg-gray-200 rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-1/4" />
            <div className="h-16 bg-gray-200 rounded" />
            <div className="h-3 bg-gray-200 rounded w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
};

// ============================================================================
// Full Page Loading
// ============================================================================

export const FullPageLoading: React.FC<{ message?: string }> = ({ 
  message = 'Loading...' 
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      >
        <Loader2 className="w-12 h-12 text-blue-500" />
      </motion.div>
      <p className="mt-4 text-lg text-gray-600">{message}</p>
    </div>
  );
};

// ============================================================================
// Inline Loading
// ============================================================================

export const InlineLoading: React.FC<{ message?: string; className?: string }> = ({ 
  message = 'Loading...', 
  className = '' 
}) => {
  return (
    <div className={`flex items-center justify-center py-8 ${className}`}>
      <LoadingSpinner size="md" label={message} />
    </div>
  );
};
