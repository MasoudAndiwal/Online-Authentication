/**
 * MessageBubble Component
 * 
 * Individual message display with reactions, attachments, and actions.
 * Supports sent/received alignment, RTL/LTR layout, delivery status, and animations.
 * 
 * Requirements: 1.3, 2.3, 2.4, 3.4, 5.1, 5.2, 5.3, 5.4, 5.5, 18.4, 22.3, 22.4, 25.8, 25.10, 27.1, 27.2, 27.4, 28.1, 28.7, 28.10, 28.11
 */

'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/hooks/office/messaging';
import { useMessaging } from '@/hooks/office/messaging';
import type { Message, ReactionType } from '@/types/office/messaging';
import { AttachmentPreview } from './AttachmentPreview';
import { ReactionBar } from './ReactionBar';
import { 
  Check, 
  CheckCheck, 
  Clock, 
  AlertCircle, 
  Pin,
  MoreVertical,
  Reply,
  Forward,
  Copy
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { 
  getMessageBubbleAlignment, 
  getMessageBubbleBorderRadius,
  getPositionEnd,
  getPositionStart
} from '@/lib/utils/rtl-utils';

// ============================================================================
// Component Props
// ============================================================================

interface MessageBubbleProps {
  message: Message;
  isFirstInGroup?: boolean;
  searchQuery?: string;
}

// ============================================================================
// Component Implementation
// ============================================================================

export function MessageBubble({ 
  message, 
  isFirstInGroup = false,
  searchQuery = '' 
}: MessageBubbleProps) {
  const { t, direction } = useLanguage();
  const { pinMessage, addReaction } = useMessaging();
  const [showActions, setShowActions] = useState(false);
  const [showReactions, setShowReactions] = useState(false);

  // Determine if message is sent by current user (office user)
  const isSent = message.senderRole === 'office';

  // ============================================================================
  // Helper Functions
  // ============================================================================

  const getCategoryColor = (category: string) => {
    const colors = {
      administrative: 'bg-blue-100 text-blue-800',
      attendance_alert: 'bg-red-100 text-red-800',
      schedule_change: 'bg-amber-100 text-amber-800',
      announcement: 'bg-purple-100 text-purple-800',
      general: 'bg-gray-100 text-gray-800',
      urgent: 'bg-red-100 text-red-800',
    };
    return colors[category as keyof typeof colors] || colors.general;
  };

  const getPriorityIndicator = (priority: string) => {
    if (priority === 'urgent') {
      return <div className="absolute -left-1 top-0 bottom-0 w-1 bg-red-500 rounded-l-lg" />;
    }
    if (priority === 'important') {
      return <div className="absolute -left-1 top-0 bottom-0 w-1 bg-amber-500 rounded-l-lg" />;
    }
    return null;
  };

  const getDeliveryStatusIcon = () => {
    switch (message.status) {
      case 'sending':
        return <Clock className="w-3 h-3 text-gray-400" />;
      case 'sent':
        return <Check className="w-3 h-3 text-gray-400" />;
      case 'delivered':
        return <CheckCheck className="w-3 h-3 text-gray-400" />;
      case 'read':
        return <CheckCheck className="w-3 h-3 text-blue-600" />;
      case 'failed':
        return <AlertCircle className="w-3 h-3 text-red-600" />;
      default:
        return null;
    }
  };

  const highlightSearchQuery = (text: string) => {
    if (!searchQuery) return text;

    const parts = text.split(new RegExp(`(${searchQuery})`, 'gi'));
    return parts.map((part, index) =>
      part.toLowerCase() === searchQuery.toLowerCase() ? (
        <mark key={index} className="bg-yellow-200 text-gray-900">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  // ============================================================================
  // Event Handlers
  // ============================================================================

  const handlePinMessage = async () => {
    try {
      await pinMessage(message.id, message.conversationId);
    } catch (error) {
      console.error('Failed to pin message:', error);
    }
  };

  const handleAddReaction = async (reactionType: ReactionType) => {
    try {
      await addReaction(message.id, reactionType);
    } catch (error) {
      console.error('Failed to add reaction:', error);
    }
  };

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(message.content);
  };

  // ============================================================================
  // Animation Variants
  // ============================================================================

  const bubbleVariants = {
    initial: isSent 
      ? { opacity: 0, x: direction === 'rtl' ? -20 : 20, scale: 0.95 }
      : { opacity: 0, x: direction === 'rtl' ? 20 : -20, scale: 0.95 },
    animate: { 
      opacity: 1, 
      x: 0, 
      scale: 1,
      transition: { duration: 0.3, ease: 'easeOut' }
    },
  };

  // ============================================================================
  // RTL/LTR Styles
  // ============================================================================

  const bubbleAlignmentStyle = getMessageBubbleAlignment(direction, isSent);
  const bubbleBorderRadius = getMessageBubbleBorderRadius(direction, isSent);

  // ============================================================================
  // Render Component
  // ============================================================================

  const bubbleBackground = isSent
    ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white'
    : 'bg-white text-gray-900';

  const flexDirection = isSent
    ? direction === 'rtl' ? 'flex-row' : 'flex-row-reverse'
    : direction === 'rtl' ? 'flex-row-reverse' : 'flex-row';

  return (
    <motion.div
      id={`message-${message.id}`}
      variants={bubbleVariants}
      initial="initial"
      animate="animate"
      className={`flex gap-3 ${flexDirection} ${
        isFirstInGroup ? 'mt-4' : 'mt-1'
      }`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => {
        setShowActions(false);
        setShowReactions(false);
      }}
      role="article"
      aria-label={`${t('messaging.message.from', 'Message from')} ${message.senderName}`}
    >
      {/* Avatar (only for received messages and first in group) */}
      {!isSent && isFirstInGroup && (
        <div className="shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center text-white text-sm font-semibold">
          {message.senderName.charAt(0).toUpperCase()}
        </div>
      )}

      {/* Spacer for non-first messages */}
      {!isSent && !isFirstInGroup && <div className="w-8" />}

      {/* Message Content */}
      <div className="flex-1 max-w-[70%]" style={bubbleAlignmentStyle}>
        {/* Sender Name (only for received messages and first in group) */}
        {!isSent && isFirstInGroup && (
          <p className={`text-xs font-semibold text-gray-600 mb-1 px-1 ${direction === 'rtl' ? 'text-right' : 'text-left'}`}>
            {message.senderName}
          </p>
        )}

        {/* Message Bubble */}
        <div className="relative">
          {/* Priority Indicator */}
          {getPriorityIndicator(message.priority)}

          <div
            className={`relative ${bubbleBackground} px-4 py-3 shadow-sm ${
              !isSent && 'border border-gray-200'
            }`}
            style={bubbleBorderRadius}
          >
            {/* Category Badge */}
            {message.category !== 'general' && (
              <div className="mb-2">
                <span className={`inline-block text-xs px-2 py-0.5 rounded-full ${getCategoryColor(message.category)}`}>
                  {message.category.replace('_', ' ')}
                </span>
              </div>
            )}

            {/* Forwarded Indicator */}
            {message.isForwarded && message.forwardedFrom && (
              <p className={`text-xs italic mb-2 ${isSent ? 'text-blue-100' : 'text-gray-600'}`}>
                {t('messaging.message.forwarded', 'Forwarded from')} {message.forwardedFrom.senderName}
              </p>
            )}

            {/* Message Content */}
            <p className="text-sm whitespace-pre-wrap break-words">
              {highlightSearchQuery(message.content)}
            </p>

            {/* Attachments */}
            {message.attachments.length > 0 && (
              <div className="mt-3">
                <AttachmentPreview attachments={message.attachments} />
              </div>
            )}

            {/* Timestamp and Status */}
            <div className={`flex items-center gap-2 mt-2 text-xs ${
              isSent ? 'text-blue-100' : 'text-gray-500'
            }`}>
              <span>
                {formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}
              </span>
              {isSent && (
                <span className="flex items-center gap-1">
                  {getDeliveryStatusIcon()}
                </span>
              )}
              {message.isPinned && (
                <Pin className="w-3 h-3" />
              )}
            </div>
          </div>

          {/* Quick Actions (shown on hover) */}
          {showActions && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.15 }}
              className="absolute top-0 flex gap-1"
              style={
                isSent 
                  ? getPositionStart(direction, 'calc(100% + 0.5rem)')
                  : getPositionEnd(direction, 'calc(100% + 0.5rem)')
              }
            >
              <button
                onClick={() => setShowReactions(!showReactions)}
                className="p-1.5 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 transition-colors shadow-sm"
                aria-label={t('messaging.actions.react', 'Add reaction')}
              >
                <span className="text-sm">😊</span>
              </button>
              <button
                onClick={handlePinMessage}
                className="p-1.5 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 transition-colors shadow-sm"
                aria-label={t('messaging.actions.pin', 'Pin message')}
              >
                <Pin className="w-4 h-4 text-gray-600" />
              </button>
              <button
                onClick={handleCopyMessage}
                className="p-1.5 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 transition-colors shadow-sm"
                aria-label={t('messaging.actions.copy', 'Copy message')}
              >
                <Copy className="w-4 h-4 text-gray-600" />
              </button>
              <button
                className="p-1.5 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 transition-colors shadow-sm"
                aria-label={t('messaging.actions.more', 'More options')}
              >
                <MoreVertical className="w-4 h-4 text-gray-600" />
              </button>
            </motion.div>
          )}
        </div>

        {/* Reactions */}
        {(message.reactions.length > 0 || showReactions) && (
          <div className="mt-2">
            <ReactionBar
              reactions={message.reactions}
              onAddReaction={handleAddReaction}
              showPicker={showReactions}
            />
          </div>
        )}
      </div>
    </motion.div>
  );
}
