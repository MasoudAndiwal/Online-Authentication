/**
 * MessageView Component
 * 
 * Main message display area with conversation header, pinned messages bar, message list, and compose area.
 * Handles empty state when no conversation is selected.
 * 
 * Requirements: 1.1, 1.5, 18.1, 18.2, 18.3, 22.7, 24.2, 24.4, 28.1, 28.6
 */

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useConversation } from '@/hooks/office/messaging';
import { useLanguage } from '@/hooks/office/messaging';
import type { Conversation, MessageDraft } from '@/types/office/messaging';
import { MessageList } from './MessageList';
import { ComposeArea } from './ComposeArea';
import { PinnedMessagesBar } from './PinnedMessagesBar';
import { ExportDialog } from './ExportDialog';
import { 
  Search, 
  Pin, 
  Archive, 
  CheckCircle, 
  MoreVertical,
  ChevronDown,
  ChevronUp,
  User,
  Download
} from 'lucide-react';

// ============================================================================
// Component Props
// ============================================================================

interface MessageViewProps {
  conversationId: string | null;
  onPinConversation?: (conversationId: string) => void;
  onArchiveConversation?: (conversationId: string) => void;
  onResolveConversation?: (conversationId: string) => void;
}

// ============================================================================
// Component Implementation
// ============================================================================

export function MessageView({
  conversationId,
  onPinConversation,
  onArchiveConversation,
  onResolveConversation,
}: MessageViewProps) {
  const { t, direction } = useLanguage();
  const [showPinnedMessages, setShowPinnedMessages] = useState(true);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showExportDialog, setShowExportDialog] = useState(false);
  const messageListRef = useRef<HTMLDivElement>(null);

  // Get conversation data
  const {
    conversation,
    messages,
    isLoading,
    error,
    hasMore,
    sendMessage,
    loadMore,
  } = useConversation(conversationId || '');

  // Reset search when conversation changes
  useEffect(() => {
    setSearchQuery('');
    setShowSearch(false);
  }, [conversationId]);

  // ============================================================================
  // Event Handlers
  // ============================================================================

  const handleSendMessage = async (draft: MessageDraft) => {
    try {
      await sendMessage(draft);
      // Scroll to bottom after sending
      if (messageListRef.current) {
        messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handlePinConversation = () => {
    if (conversation && onPinConversation) {
      onPinConversation(conversation.id);
    }
  };

  const handleArchiveConversation = () => {
    if (conversation && onArchiveConversation) {
      onArchiveConversation(conversation.id);
    }
  };

  const handleResolveConversation = () => {
    if (conversation && onResolveConversation) {
      onResolveConversation(conversation.id);
    }
  };

  const togglePinnedMessages = () => {
    setShowPinnedMessages(!showPinnedMessages);
  };

  // ============================================================================
  // Empty State
  // ============================================================================

  if (!conversationId || !conversation) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50 to-gray-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="text-center px-6 max-w-md"
        >
          <div className="w-32 h-32 mx-auto mb-8 rounded-3xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-2xl">
            <User className="w-16 h-16 text-white" />
          </div>
          <h3 className="text-3xl font-bold text-gray-900 mb-3">
            Select a conversation
          </h3>
          <p className="text-lg text-gray-600 leading-relaxed">
            Choose a conversation from the sidebar to start messaging with students and teachers.
          </p>
        </motion.div>
      </div>
    );
  }

  // ============================================================================
  // Render Component
  // ============================================================================

  const hasPinnedMessages = conversation.pinnedMessages && conversation.pinnedMessages.length > 0;

  return (
    <div className="flex-1 flex flex-col h-full bg-white" dir={direction}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center justify-between px-6 py-4 bg-white/70 backdrop-blur-md shadow-md"
      >
        {/* Recipient Info */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold shadow-lg">
            {conversation.recipientName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {conversation.recipientName}
            </h2>
            <p className="text-sm text-gray-600 capitalize">
              {conversation.recipientRole}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Search Toggle */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowSearch(!showSearch)}
            className={`p-2 rounded-xl transition-all shadow-md ${
              showSearch 
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white' 
                : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-600 hover:from-gray-200 hover:to-gray-300'
            }`}
            aria-label={t('messaging.actions.search')}
          >
            <Search className="w-5 h-5" />
          </motion.button>

          {/* Pin Conversation */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handlePinConversation}
            className={`p-2 rounded-xl transition-all shadow-md ${
              conversation.isPinned
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-600 hover:from-gray-200 hover:to-gray-300'
            }`}
            aria-label={t('messaging.actions.pin')}
          >
            <Pin className="w-5 h-5" />
          </motion.button>

          {/* Archive Conversation */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleArchiveConversation}
            className="p-2 rounded-xl bg-gradient-to-r from-gray-100 to-gray-200 text-gray-600 hover:from-gray-200 hover:to-gray-300 transition-all shadow-md"
            aria-label={t('messaging.actions.archive')}
          >
            <Archive className="w-5 h-5" />
          </motion.button>

          {/* Resolve Conversation */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleResolveConversation}
            className={`p-2 rounded-xl transition-all shadow-md ${
              conversation.isResolved
                ? 'bg-gradient-to-r from-green-500 to-green-600 text-white'
                : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-600 hover:from-gray-200 hover:to-gray-300'
            }`}
            aria-label={t('messaging.actions.resolve')}
          >
            <CheckCircle className="w-5 h-5" />
          </motion.button>

          {/* More Options */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 rounded-xl bg-gradient-to-r from-gray-100 to-gray-200 text-gray-600 hover:from-gray-200 hover:to-gray-300 transition-all shadow-md"
            aria-label={t('messaging.actions.more')}
          >
            <MoreVertical className="w-5 h-5" />
          </motion.button>

          {/* Export Conversation */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowExportDialog(true)}
            className="p-2 rounded-xl bg-gradient-to-r from-gray-100 to-gray-200 text-gray-600 hover:from-gray-200 hover:to-gray-300 transition-all shadow-md"
            aria-label={t('messaging.actions.export')}
          >
            <Download className="w-5 h-5" />
          </motion.button>
        </div>
      </motion.div>

      {/* Search Bar */}
      <AnimatePresence>
        {showSearch && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="px-6 py-3 bg-gradient-to-r from-blue-50 to-blue-100 shadow-sm"
          >
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('messaging.search.placeholder')}
              className="w-full px-4 py-2 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-md"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pinned Messages Bar */}
      {hasPinnedMessages && (
        <div className="shadow-sm">
          <div className="flex items-center justify-between px-6 py-2 bg-gradient-to-r from-blue-50 to-blue-100">
            <span className="text-sm font-semibold text-blue-900">
              {t('messaging.pinnedMessages.title')} ({conversation.pinnedMessages.length})
            </span>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={togglePinnedMessages}
              className="p-1.5 rounded-lg bg-white text-blue-600 hover:bg-blue-50 transition-all shadow-sm"
              aria-label={showPinnedMessages ? t('messaging.actions.collapse') : t('messaging.actions.expand')}
            >
              {showPinnedMessages ? (
                <ChevronUp className="w-4 h-4 text-blue-600" />
              ) : (
                <ChevronDown className="w-4 h-4 text-blue-600" />
              )}
            </motion.button>
          </div>
          <AnimatePresence>
            {showPinnedMessages && (
              <PinnedMessagesBar
                messages={conversation.pinnedMessages}
                onMessageClick={(messageId) => {
                  // Scroll to message in list
                  const messageElement = document.getElementById(`message-${messageId}`);
                  if (messageElement) {
                    messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }
                }}
              />
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Message List */}
      <div ref={messageListRef} className="flex-1 overflow-hidden">
        <MessageList
          conversationId={conversation.id}
          messages={messages}
          isLoading={isLoading}
          error={error}
          hasMore={hasMore}
          onLoadMore={loadMore}
          searchQuery={searchQuery}
        />
      </div>

      {/* Compose Area */}
      <ComposeArea
        conversationId={conversation.id}
        recipientType={conversation.recipientRole}
        onSend={handleSendMessage}
      />

      {/* Export Dialog */}
      <ExportDialog
        isOpen={showExportDialog}
        onClose={() => setShowExportDialog(false)}
        conversation={conversation}
        messages={messages}
      />
    </div>
  );
}
