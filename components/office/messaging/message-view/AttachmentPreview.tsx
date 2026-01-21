/**
 * AttachmentPreview Component
 * 
 * Displays file attachments with preview, download, and lightbox functionality.
 * Supports images, documents, and PDFs with appropriate icons and layouts.
 * 
 * Requirements: 3.4
 */

'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/hooks/office/messaging';
import type { Attachment } from '@/types/office/messaging';
import { 
  FileText, 
  Image as ImageIcon, 
  File, 
  Download, 
  X,
  Loader2,
  FileType
} from 'lucide-react';

// ============================================================================
// Component Props
// ============================================================================

interface AttachmentPreviewProps {
  attachments: Attachment[];
}

// ============================================================================
// Component Implementation
// ============================================================================

export function AttachmentPreview({ attachments }: AttachmentPreviewProps) {
  const { t } = useLanguage();
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  // ============================================================================
  // Helper Functions
  // ============================================================================

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) {
      return <ImageIcon className="w-5 h-5" />;
    }
    if (type === 'application/pdf') {
      return <FileType className="w-5 h-5" />;
    }
    if (type.includes('document') || type.includes('word')) {
      return <FileText className="w-5 h-5" />;
    }
    return <File className="w-5 h-5" />;
  };

  const isImage = (type: string) => type.startsWith('image/');
  const isPDF = (type: string) => type === 'application/pdf';

  // ============================================================================
  // Event Handlers
  // ============================================================================

  const handleDownload = async (attachment: Attachment) => {
    try {
      setDownloadingId(attachment.id);
      
      // Create a temporary link and trigger download
      const link = document.createElement('a');
      link.href = attachment.url;
      link.download = attachment.name;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Failed to download attachment:', error);
    } finally {
      setDownloadingId(null);
    }
  };

  const openLightbox = (url: string) => {
    setLightboxImage(url);
  };

  const closeLightbox = () => {
    setLightboxImage(null);
  };

  // ============================================================================
  // Render Single Attachment
  // ============================================================================

  const renderAttachment = (attachment: Attachment) => {
    const isImg = isImage(attachment.type);
    const isPdf = isPDF(attachment.type);

    if (isImg) {
      return (
        <motion.div
          key={attachment.id}
          whileHover={{ scale: 1.02 }}
          className="relative group cursor-pointer"
          onClick={() => openLightbox(attachment.url)}
        >
          <img
            src={attachment.thumbnailUrl || attachment.url}
            alt={attachment.name}
            className="w-full h-48 object-cover rounded-lg"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-lg flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileHover={{ opacity: 1, scale: 1 }}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
                <ImageIcon className="w-6 h-6 text-gray-700" />
              </div>
            </motion.div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDownload(attachment);
            }}
            className="absolute top-2 right-2 p-2 rounded-lg bg-white/90 hover:bg-white shadow-sm transition-colors"
            aria-label={t('messaging.attachment.download', 'Download')}
          >
            {downloadingId === attachment.id ? (
              <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
            ) : (
              <Download className="w-4 h-4 text-gray-700" />
            )}
          </button>
        </motion.div>
      );
    }

    return (
      <motion.div
        key={attachment.id}
        whileHover={{ scale: 1.02, y: -2 }}
        className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 transition-colors"
      >
        {/* File Icon */}
        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center text-blue-600">
          {getFileIcon(attachment.type)}
        </div>

        {/* File Info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            {attachment.name}
          </p>
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <span>{formatFileSize(attachment.size)}</span>
            {isPdf && (
              <span className="px-1.5 py-0.5 bg-red-100 text-red-700 rounded">
                PDF
              </span>
            )}
          </div>
        </div>

        {/* Download Button */}
        <button
          onClick={() => handleDownload(attachment)}
          disabled={downloadingId === attachment.id}
          className="flex-shrink-0 p-2 rounded-lg bg-white hover:bg-gray-100 border border-gray-200 transition-colors disabled:opacity-50"
          aria-label={t('messaging.attachment.download', 'Download')}
        >
          {downloadingId === attachment.id ? (
            <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
          ) : (
            <Download className="w-4 h-4 text-gray-700" />
          )}
        </button>
      </motion.div>
    );
  };

  // ============================================================================
  // Render Component
  // ============================================================================

  if (attachments.length === 0) {
    return null;
  }

  const imageAttachments = attachments.filter(a => isImage(a.type));
  const otherAttachments = attachments.filter(a => !isImage(a.type));

  return (
    <>
      {/* Attachments Grid */}
      <div className="space-y-2">
        {/* Images Grid */}
        {imageAttachments.length > 0 && (
          <div className={`grid gap-2 ${
            imageAttachments.length === 1 
              ? 'grid-cols-1' 
              : imageAttachments.length === 2 
              ? 'grid-cols-2' 
              : 'grid-cols-2 md:grid-cols-3'
          }`}>
            {imageAttachments.map(renderAttachment)}
          </div>
        )}

        {/* Other Files */}
        {otherAttachments.length > 0 && (
          <div className="space-y-2">
            {otherAttachments.map(renderAttachment)}
          </div>
        )}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
            onClick={closeLightbox}
          >
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={closeLightbox}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              aria-label={t('messaging.lightbox.close', 'Close')}
            >
              <X className="w-6 h-6 text-white" />
            </motion.button>

            <motion.img
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              src={lightboxImage}
              alt="Full size preview"
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
