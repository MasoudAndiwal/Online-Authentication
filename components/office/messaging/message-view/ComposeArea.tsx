/**
 * ComposeArea Component
 * 
 * Message composition area with rich features including:
 * - Rich text input with auto-resize
 * - Template selector dropdown
 * - Category and priority selectors
 * - Attachment upload with drag-and-drop
 * - Schedule message button
 * - Character count indicator
 * - Typing indicator broadcast
 * - Keyboard shortcuts (Ctrl/Cmd + Enter to send)
 * 
 * Requirements: 1.2, 2.1, 2.2, 3.1, 4.1, 4.2, 13.1, 13.5, 15.1, 15.2, 22.1, 22.2, 26.7
 */

'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Paperclip, 
  Send, 
  Smile, 
  Calendar, 
  FileText,
  Tag,
  AlertCircle,
  X,
  Upload
} from 'lucide-react';
import { useFileUpload, formatFileSize } from '@/hooks/office/messaging/use-file-upload';
import { useMessageTemplates } from '@/hooks/office/messaging/use-message-templates';
import { useMessaging } from '@/hooks/office/messaging';
import { TemplateSelector } from './TemplateSelector';
import type { MessageDraft, UserRole, MessageCategory, PriorityLevel } from '@/types/office/messaging';

// ============================================================================
// Component Props
// ============================================================================

interface ComposeAreaProps {
  conversationId: string;
  recipientType: UserRole;
  recipientName?: string;
  onSend: (draft: MessageDraft) => Promise<void>;
}

// ============================================================================
// Constants
// ============================================================================

const CATEGORIES: { value: MessageCategory; label: string; icon: string }[] = [
  { value: 'general', label: 'General', icon: '💬' },
  { value: 'administrative', label: 'Administrative', icon: '📋' },
  { value: 'attendance_alert', label: 'Attendance Alert', icon: '⚠️' },
  { value: 'schedule_change', label: 'Schedule Change', icon: '📅' },
  { value: 'announcement', label: 'Announcement', icon: '📢' },
  { value: 'urgent', label: 'Urgent', icon: '🚨' },
];

const PRIORITIES: { value: PriorityLevel; label: string; color: string }[] = [
  { value: 'normal', label: 'Normal', color: 'text-gray-600' },
  { value: 'important', label: 'Important', color: 'text-amber-600' },
  { value: 'urgent', label: 'Urgent', color: 'text-red-600' },
];

const MAX_CHARACTERS = 5000;

// ============================================================================
// Component
// ============================================================================

export const ComposeArea: React.FC<ComposeAreaProps> = ({
  conversationId,
  recipientType,
  recipientName,
  onSend,
}) => {
  // State
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<MessageCategory>('general');
  const [priority, setPriority] = useState<PriorityLevel>('normal');
  const [showTemplates, setShowTemplates] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [failedDraft, setFailedDraft] = useState<MessageDraft | null>(null);
  
  // Refs
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounterRef = useRef(0);
  
  // Hooks
  const { sendTypingIndicator } = useMessaging();
  const { templates, insertTemplate } = useMessageTemplates();
  const { uploadFile, uploadProgress, isUploading, error: uploadError } = useFileUpload();
  
  // Attachments state
  const [attachments, setAttachments] = useState<Array<{ id: string; file: File; url?: string }>>([]);
  
  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [content]);
  
  // Typing indicator with throttle
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const handleContentChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    if (newContent.length <= MAX_CHARACTERS) {
      setContent(newContent);
      
      // Broadcast typing indicator (throttled to 1000ms)
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      sendTypingIndicator(conversationId, true);
      
      typingTimeoutRef.current = setTimeout(() => {
        sendTypingIndicator(conversationId, false);
      }, 1000);
    }
  }, [conversationId, sendTypingIndicator]);
  
  // Cleanup typing indicator on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      sendTypingIndicator(conversationId, false);
    };
  }, [conversationId, sendTypingIndicator]);
  
  // Handle template selection
  const handleTemplateSelect = useCallback((content: string, category: MessageCategory) => {
    setContent(content);
    setCategory(category);
    setShowTemplates(false);
    textareaRef.current?.focus();
  }, []);
  
  // Handle file upload
  const handleFileSelect = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    const file = files[0];
    
    // Validate file using the hook's validation
    const validation = useFileUpload().validateFile(file);
    if (!validation.valid) {
      alert(validation.error || 'File validation failed');
      return;
    }
    
    try {
      // Note: In production, virus scanning would happen on the server
      // This is a placeholder for the virus scanning requirement
      console.log('File passed validation, will be scanned on server during upload');
      
      const uploadedFile = await uploadFile(file);
      setAttachments(prev => [...prev, {
        id: uploadedFile.id,
        file,
        url: uploadedFile.url,
      }]);
    } catch (error) {
      console.error('File upload failed:', error);
      
      // Show specific error message
      if (error instanceof Error) {
        if (error.message.includes('size')) {
          alert(`File too large: ${error.message}`);
        } else if (error.message.includes('type')) {
          alert(`Invalid file type: ${error.message}`);
        } else if (error.message.includes('virus') || error.message.includes('scan')) {
          alert('File failed security scan. Please ensure the file is safe and try again.');
        } else {
          alert(`File upload failed: ${error.message}`);
        }
      } else {
        alert('File upload failed. Please try again.');
      }
    }
  }, [uploadFile]);
  
  // Handle drag and drop
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current++;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  }, []);
  
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current--;
    if (dragCounterRef.current === 0) {
      setIsDragging(false);
    }
  }, []);
  
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);
  
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounterRef.current = 0;
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files);
    }
  }, [handleFileSelect]);
  
  // Remove attachment
  const handleRemoveAttachment = useCallback((id: string) => {
    setAttachments(prev => prev.filter(a => a.id !== id));
  }, []);
  
  // Handle send
  const handleSend = useCallback(async () => {
    if (!content.trim() && attachments.length === 0) return;
    if (isSending) return;
    
    // Clear previous errors
    setSendError(null);
    setIsSending(true);
    
    const draft: MessageDraft = {
      content: content.trim(),
      category,
      priority,
      attachments: attachments.map(a => ({
        id: a.id,
        filename: a.file.name,
        fileSize: a.file.size,
        mimeType: a.file.type,
        url: a.url || '',
      })),
    };
    
    try {
      await onSend(draft);
      
      // Clear form on success
      setContent('');
      setCategory('general');
      setPriority('normal');
      setAttachments([]);
      setFailedDraft(null);
      sendTypingIndicator(conversationId, false);
    } catch (error) {
      console.error('Failed to send message:', error);
      
      // Store failed draft for retry
      setFailedDraft(draft);
      
      // Set user-friendly error message
      if (error instanceof Error) {
        if (error.message.includes('network') || error.message.includes('connection')) {
          setSendError('Network error. Please check your connection and try again.');
        } else if (error.message.includes('permission') || error.message.includes('unauthorized')) {
          setSendError('You do not have permission to send this message.');
        } else if (error.message.includes('rate limit')) {
          setSendError('Too many messages sent. Please wait a moment and try again.');
        } else {
          setSendError(error.message || 'Failed to send message. Please try again.');
        }
      } else {
        setSendError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsSending(false);
    }
  }, [content, category, priority, attachments, conversationId, isSending, onSend, sendTypingIndicator]);
  
  // Retry sending failed message
  const handleRetry = useCallback(async () => {
    if (!failedDraft) return;
    
    setSendError(null);
    setIsSending(true);
    
    try {
      await onSend(failedDraft);
      
      // Clear form on success
      setContent('');
      setCategory('general');
      setPriority('normal');
      setAttachments([]);
      setFailedDraft(null);
      sendTypingIndicator(conversationId, false);
    } catch (error) {
      console.error('Retry failed:', error);
      
      if (error instanceof Error) {
        setSendError(error.message || 'Failed to send message. Please try again.');
      } else {
        setSendError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsSending(false);
    }
  }, [failedDraft, onSend, conversationId, sendTypingIndicator]);
  
  // Keyboard shortcut: Ctrl/Cmd + Enter to send
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);
  
  // Character count
  const characterCount = content.length;
  const characterCountColor = characterCount > MAX_CHARACTERS * 0.9 
    ? 'text-red-500' 
    : characterCount > MAX_CHARACTERS * 0.75 
    ? 'text-amber-500' 
    : 'text-gray-400';
  
  return (
    <div 
      className="relative glass-compose p-4"
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* Drag overlay */}
      <AnimatePresence>
        {isDragging && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-blue-500/10 backdrop-blur-sm border-2 border-dashed border-blue-500 rounded-lg"
          >
            <div className="text-center">
              <Upload className="w-12 h-12 text-blue-500 mx-auto mb-2" />
              <p className="text-blue-600 font-medium">Drop file to upload</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Toolbar */}
      <div className="flex items-center gap-2 mb-3">
        {/* Template selector */}
        <button
          onClick={() => setShowTemplates(true)}
          className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 rounded-xl transition-all shadow-sm hover:shadow-md"
          title="Insert template"
        >
          <FileText className="w-5 h-5" />
        </button>
        
        {/* Category selector */}
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as MessageCategory)}
          className="px-3 py-1.5 text-sm rounded-xl bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 shadow-sm hover:shadow-md transition-all"
        >
          {CATEGORIES.map(cat => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>
        
        {/* Priority selector */}
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value as PriorityLevel)}
          className={`px-3 py-1.5 text-sm rounded-xl shadow-sm hover:shadow-md transition-all ${
            priority === 'urgent' ? 'bg-gradient-to-r from-red-500 to-red-600 text-white font-medium' :
            priority === 'important' ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white font-medium' :
            'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-600'
          }`}
        >
          {PRIORITIES.map(pri => (
            <option key={pri.value} value={pri.value} className={pri.color}>
              {pri.label}
            </option>
          ))}
        </select>
        
        <div className="flex-1" />
        
        {/* Attachment button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 rounded-xl transition-all shadow-sm hover:shadow-md disabled:opacity-50"
          title="Attach file"
        >
          <Paperclip className="w-5 h-5" />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={(e) => handleFileSelect(e.target.files)}
          accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
        />
        
        {/* Schedule button */}
        <button
          onClick={() => setShowSchedule(true)}
          className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 rounded-xl transition-all shadow-sm hover:shadow-md"
          title="Schedule message"
        >
          <Calendar className="w-5 h-5" />
        </button>
      </div>
      
      {/* Attachments preview */}
      <AnimatePresence>
        {attachments.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-3 flex flex-wrap gap-2"
          >
            {attachments.map(attachment => (
              <div
                key={attachment.id}
                className="relative flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-gray-100 to-gray-200 rounded-xl shadow-sm"
              >
                <Paperclip className="w-4 h-4 text-gray-600" />
                <span className="text-sm text-gray-700">{attachment.file.name}</span>
                <span className="text-xs text-gray-500">{formatFileSize(attachment.file.size)}</span>
                <button
                  onClick={() => handleRemoveAttachment(attachment.id)}
                  className="ml-2 p-1 bg-gradient-to-r from-red-400 to-red-500 text-white hover:from-red-500 hover:to-red-600 rounded-lg transition-all shadow-sm"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Upload progress */}
      <AnimatePresence>
        {isUploading && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-3"
          >
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-blue-500 to-blue-600"
                  initial={{ width: 0 }}
                  animate={{ width: `${uploadProgress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <span>{uploadProgress}%</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Upload error */}
      <AnimatePresence>
        {uploadError && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-3 flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg"
          >
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
            <span className="text-sm text-red-700">{uploadError}</span>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Send error with retry */}
      <AnimatePresence>
        {sendError && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-3 flex items-center justify-between gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg"
          >
            <div className="flex items-center gap-2 flex-1">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <span className="text-sm text-red-700">{sendError}</span>
            </div>
            {failedDraft && (
              <button
                onClick={handleRetry}
                disabled={isSending}
                className="px-3 py-1 text-sm font-medium text-red-700 hover:text-red-800 hover:bg-red-100 rounded transition-colors disabled:opacity-50"
              >
                Retry
              </button>
            )}
            <button
              onClick={() => {
                setSendError(null);
                setFailedDraft(null);
              }}
              className="p-1 hover:bg-red-100 rounded transition-colors"
              aria-label="Dismiss error"
            >
              <X className="w-4 h-4 text-red-500" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Text input */}
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleContentChange}
          onKeyDown={handleKeyDown}
          placeholder={`Message ${recipientName || recipientType}...`}
          className="w-full px-4 py-3 pr-24 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm hover:shadow-md transition-all min-h-[60px] max-h-[200px]"
          rows={1}
        />
        
        {/* Character count */}
        <div className={`absolute bottom-3 right-16 text-xs ${characterCountColor}`}>
          {characterCount}/{MAX_CHARACTERS}
        </div>
        
        {/* Send button */}
        <button
          onClick={handleSend}
          disabled={(!content.trim() && attachments.length === 0) || isSending}
          className="absolute bottom-3 right-3 p-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105"
          title={isSending ? "Sending..." : "Send message (Ctrl/Cmd + Enter)"}
          aria-label={isSending ? "Sending message" : "Send message"}
        >
          {isSending ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              aria-label="Sending"
            >
              <Send className="w-5 h-5" />
            </motion.div>
          ) : (
            <Send className="w-5 h-5" />
          )}
        </button>
      </div>
      
      {/* Keyboard shortcut hint */}
      <p className="mt-2 text-xs text-gray-400">
        Press <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs">Ctrl</kbd> + <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs">Enter</kbd> to send
      </p>
      
      {/* Template Selector Modal */}
      <TemplateSelector
        isOpen={showTemplates}
        onClose={() => setShowTemplates(false)}
        onSelectTemplate={handleTemplateSelect}
        recipientName={recipientName}
        currentDate={new Date()}
      />
    </div>
  );
};
