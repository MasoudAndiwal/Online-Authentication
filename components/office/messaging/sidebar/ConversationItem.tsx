/**
 * ConversationItem Component
 * 
 * Individual conversation list item with preview and quick actions.
 * Features:
 * - Avatar with role indicator
 * - Message preview with truncation
 * - Unread count badge
 * - Typing indicator
 * - Priority and category indicators
 * - Quick action buttons (star, pin, archive, mark unread)
 * - Hover animations and selected state styling
 * - RTL/LTR layout support
 */

'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { useLanguage } from '@/hooks/office/messaging/use-language';
import type { Conversation } from '@/types/office/messaging';
import { TypingIndicator } from '../shared';
import { getTextAlign, getPositionEnd } from '@/lib/utils/rtl-utils';

import {
  Star,
  Pin,
  Archive,
  MailOpen,
  User,
  GraduationCap,
  AlertCircle,
  MessageSquare,
  Tag,
  Calendar,
  Bell,
} from 'lucide-react';

interface ConversationItemProps {
  conversation: Conversation;
  isSelected: boolean;
  isBulkSelected?: boolean;
  isTyping?: boolean;
  onClick: () => void;
  onBulkSelect?: () => void;
  onStar: () => void;
  onPin: () => void;
  onArchive: () => void;
  onMarkUnread: () => void;
}

export function ConversationItem({
  conversation,
  isSelected,
  isBulkSelected = false,
  isTyping = false,
  onClick,
  onBulkSelect,
  onStar,
  onPin,
  onArchive,
  onMarkUnread,
}: ConversationItemProps) {
  const { direction } = useLanguage();
  const [showActions, setShowActions] = useState(false);

  // Get category icon
  const getCategoryIcon = () => {
    switch (conversation.lastMessage.category) {
      case 'administrative':
        return <Tag className="w-3 h-3" />;
      case 'attendance_alert':
        return <AlertCircle className="w-3 h-3" />;
      case 'schedule_change':
        return <Calendar className="w-3 h-3" />;
      case 'announcement':
        return <Bell className="w-3 h-3" />;
      case 'urgent':
        return <AlertCircle className="w-3 h-3" />;
      default:
        return <MessageSquare className="w-3 h-3" />;
    }
  };

  // Get priority color
  const getPriorityColor = () => {
    switch (conversation.lastMessage.priority) {
      case 'urgent':
        return 'text-red-500';
      case 'important':
        return 'text-amber-500';
      default:
        return 'text-gray-400';
    }
  };

  // Get priority glow
  const getPriorityGlow = () => {
    switch (conversation.lastMessage.priority) {
      case 'urgent':
        return 'shadow-red-500/20';
      case 'important':
        return 'shadow-amber-500/20';
      default:
        return '';
    }
  };

  // Format timestamp
  const formatTimestamp = (date: Date) => {
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true });
    } catch {
      return 'Recently';
    }
  };

  // Truncate message preview
  const truncateMessage = (text: string, maxLength = 60) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const handleQuickAction = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    action();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      whileHover={{ scale: 1.01 }}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      onClick={onClick}
      className={`relative px-4 py-3 cursor-pointer transition-all mb-1 ${
        isSelected
          ? direction === 'rtl'
            ? 'bg-gradient-to-l from-blue-100 to-blue-50 shadow-md border-r-4 border-blue-500'
            : 'bg-gradient-to-r from-blue-100 to-blue-50 shadow-md border-l-4 border-blue-500'
          : direction === 'rtl'
            ? 'hover:bg-gray-50 hover:shadow-sm'
            : 'hover:bg-gray-50 hover:shadow-sm'
      } ${conversation.unreadCount > 0 ? 'bg-blue-50/50' : 'bg-white'} ${getPriorityGlow()}`}
      role="button"
      tabIndex={0}
      aria-label={`Conversation with ${conversation.recipientName}, ${conversation.unreadCount} unread messages`}
      style={{ textAlign: getTextAlign(direction) }}
    >
      <div className="flex items-start gap-3">
        {/* Bulk Selection Checkbox */}
        {onBulkSelect && (
          <div className="flex items-center pt-1">
            <input
              type="checkbox"
              checked={isBulkSelected}
              onChange={(e) => {
                e.stopPropagation();
                onBulkSelect();
              }}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              aria-label="Select conversation"
            />
          </div>
        )}

        {/* Avatar with Role Indicator */}
        <div className="relative shrink-0">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold shadow-md">
            {conversation.recipientAvatar ? (
              <img
                src={conversation.recipientAvatar}
                alt={conversation.recipientName}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <span className="text-lg">
                {conversation.recipientName.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          {/* Role Badge */}
          <div 
            className="absolute -bottom-1 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-sm"
            style={direction === 'rtl' ? { left: '-0.25rem' } : { right: '-0.25rem' }}
          >
            {conversation.recipientRole === 'student' ? (
              <GraduationCap className="w-3 h-3 text-blue-600" />
            ) : (
              <User className="w-3 h-3 text-green-600" />
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header Row */}
          <div className="flex items-center justify-between gap-2 mb-1">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <h4
                className={`font-semibold truncate ${
                  conversation.unreadCount > 0 ? 'text-gray-900' : 'text-gray-700'
                }`}
              >
                {conversation.recipientName}
              </h4>
              {/* Pinned Indicator */}
              {conversation.isPinned && (
                <Pin className="w-3 h-3 text-blue-600 shrink-0" />
              )}
              {/* Starred Indicator */}
              {conversation.isStarred && (
                <Star className="w-3 h-3 text-amber-500 fill-amber-500 shrink-0" />
              )}
            </div>
            {/* Timestamp */}
            <span className="text-xs text-gray-500 shrink-0">
              {formatTimestamp(conversation.lastMessage.timestamp)}
            </span>
          </div>

          {/* Message Preview or Typing Indicator */}
          <div className="mb-1">
            {isTyping ? (
              <div className="flex items-center gap-2 text-blue-600">
                <TypingIndicator />
              </div>
            ) : (
              <p
                className={`text-sm truncate ${
                  conversation.unreadCount > 0 ? 'text-gray-900 font-medium' : 'text-gray-600'
                }`}
              >
                {truncateMessage(conversation.lastMessage.content)}
              </p>
            )}
          </div>

          {/* Footer Row */}
          <div className="flex items-center justify-between gap-2">
            {/* Category and Priority */}
            <div className="flex items-center gap-2">
              <div
                className={`flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-gray-100 to-gray-200 shadow-sm ${getPriorityColor()}`}
                title={conversation.lastMessage.category}
              >
                {getCategoryIcon()}
                <span className="text-xs capitalize">
                  {conversation.lastMessage.category.replace('_', ' ')}
                </span>
              </div>
            </div>

            {/* Unread Badge */}
            {conversation.unreadCount > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="shrink-0"
              >
                <div className="px-2 py-0.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-semibold rounded-full min-w-[20px] text-center shadow-sm">
                  {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions (shown on hover) */}
      {showActions && !isBulkSelected && (
        <motion.div
          initial={{ opacity: 0, x: direction === 'rtl' ? -10 : 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: direction === 'rtl' ? -10 : 10 }}
          className="absolute top-2 flex items-center gap-1 bg-white rounded-lg shadow-lg p-1"
          style={getPositionEnd(direction, '0.5rem')}
        >
          <button
            onClick={(e) => handleQuickAction(e, onStar)}
            className="p-1.5 bg-gradient-to-r from-amber-400 to-amber-500 text-white hover:from-amber-500 hover:to-amber-600 rounded-lg transition-all shadow-sm hover:shadow-md"
            title={conversation.isStarred ? 'Unstar' : 'Star'}
            aria-label={conversation.isStarred ? 'Unstar conversation' : 'Star conversation'}
          >
            <Star className={`w-4 h-4 ${conversation.isStarred ? 'fill-white' : ''}`} />
          </button>
          <button
            onClick={(e) => handleQuickAction(e, onPin)}
            className="p-1.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 rounded-lg transition-all shadow-sm hover:shadow-md"
            title={conversation.isPinned ? 'Unpin' : 'Pin'}
            aria-label={conversation.isPinned ? 'Unpin conversation' : 'Pin conversation'}
          >
            <Pin className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => handleQuickAction(e, onArchive)}
            className="p-1.5 bg-gradient-to-r from-gray-500 to-gray-600 text-white hover:from-gray-600 hover:to-gray-700 rounded-lg transition-all shadow-sm hover:shadow-md"
            title="Archive"
            aria-label="Archive conversation"
          >
            <Archive className="w-4 h-4" />
          </button>
          {conversation.unreadCount === 0 && (
            <button
              onClick={(e) => handleQuickAction(e, onMarkUnread)}
              className="p-1.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 rounded-lg transition-all shadow-sm hover:shadow-md"
              title="Mark as unread"
              aria-label="Mark conversation as unread"
            >
              <MailOpen className="w-4 h-4" />
            </button>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}