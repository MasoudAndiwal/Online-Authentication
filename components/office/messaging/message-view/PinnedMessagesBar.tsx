/**
 * PinnedMessagesBar Component
 * 
 * Displays pinned messages in a collapsible bar at the top of the conversation.
 * Allows clicking on pinned messages to jump to their location in the conversation.
 * 
 * Requirements: 28.1, 28.6
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/hooks/office/messaging';
import type { Message } from '@/types/office/messaging';
import { Pin, FileText, Image as ImageIcon } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

// ============================================================================
// Component Props
// ============================================================================

interface PinnedMessagesBarProps {
  messages: Message[];
  onMessageClick: (messageId: string) => void;
}

// ============================================================================
// Component Implementation
// ============================================================================

export function PinnedMessagesBar({
  messages,
  onMessageClick,
}: PinnedMessagesBarProps) {
  const { t, direction } = useLanguage();

  if (messages.length === 0) {
    return null;
  }

  // ============================================================================
  // Helper Functions
  // ============================================================================

  const truncateText = (text: string, maxLength: number = 60) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const getAttachmentIcon = (message: Message) => {
    if (message.attachments.length === 0) return null;
    
    const firstAttachment = message.attachments[0];
    const isImage = firstAttachment.type.startsWith('image/');
    
    return isImage ? (
      <ImageIcon className="w-3 h-3" />
    ) : (
      <FileText className="w-3 h-3" />
    );
  };

  // ============================================================================
  // Render Component
  // ============================================================================

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-3 overflow-x-auto"
      dir={direction}
    >
      <div className="flex gap-3">
        {messages.map((message) => (
          <motion.button
            key={message.id}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onMessageClick(message.id)}
            className="flex-shrink-0 max-w-xs bg-white rounded-lg px-4 py-3 shadow-sm hover:shadow-md transition-shadow border border-blue-100"
            style={{
              minWidth: '200px',
              maxWidth: '300px',
            }}
          >
            <div className="flex items-start gap-2">
              {/* Pin Icon */}
              <div className="flex-shrink-0 mt-0.5">
                <Pin className="w-4 h-4 text-blue-600" />
              </div>

              {/* Message Content */}
              <div className="flex-1 text-left">
                {/* Sender Name */}
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold text-gray-900">
                    {message.senderName}
                  </span>
                  {getAttachmentIcon(message) && (
                    <span className="text-gray-500">
                      {getAttachmentIcon(message)}
                    </span>
                  )}
                </div>

                {/* Message Text */}
                <p className="text-sm text-gray-700 mb-1">
                  {truncateText(message.content)}
                </p>

                {/* Timestamp */}
                <span className="text-xs text-gray-500">
                  {formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}
                </span>
              </div>
            </div>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
