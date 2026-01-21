/**
 * MessageList Component
 * 
 * Displays a list of messages with virtual scrolling for performance.
 * Handles loading states, infinite scroll, and search highlighting.
 * 
 * Requirements: 18.1, 18.2, 18.3, 24.2, 24.4
 */

'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useVirtualScroll } from '@/hooks/office/messaging';
import { useLanguage } from '@/hooks/office/messaging';
import type { Message } from '@/types/office/messaging';
import { MessageBubble } from './MessageBubble';
import { Loader2 } from 'lucide-react';

// ============================================================================
// Component Props
// ============================================================================

interface MessageListProps {
  conversationId: string;
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
  onLoadMore: () => Promise<void>;
  searchQuery?: string;
}

// ============================================================================
// Component Implementation
// ============================================================================

export function MessageList({
  conversationId,
  messages,
  isLoading,
  error,
  hasMore,
  onLoadMore,
  searchQuery = '',
}: MessageListProps) {
  const { t } = useLanguage();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [shouldScrollToBottom, setShouldScrollToBottom] = useState(true);

  // ============================================================================
  // Scroll to bottom on new messages
  // ============================================================================

  useEffect(() => {
    if (shouldScrollToBottom && containerRef.current && messages.length > 0) {
      const container = containerRef.current;
      container.scrollTop = container.scrollHeight;
      setShouldScrollToBottom(false);
    }
  }, [messages.length, shouldScrollToBottom]);

  // Reset scroll flag when conversation changes
  useEffect(() => {
    setShouldScrollToBottom(true);
  }, [conversationId]);

  // ============================================================================
  // Infinite scroll handler
  // ============================================================================

  const handleScroll = useCallback(async () => {
    if (!containerRef.current || isLoadingMore || !hasMore) return;

    const container = containerRef.current;
    const scrollTop = container.scrollTop;

    // Load more when scrolled to top (within 100px)
    if (scrollTop < 100) {
      setIsLoadingMore(true);
      const previousScrollHeight = container.scrollHeight;
      
      try {
        await onLoadMore();
        
        // Maintain scroll position after loading
        requestAnimationFrame(() => {
          if (containerRef.current) {
            const newScrollHeight = containerRef.current.scrollHeight;
            containerRef.current.scrollTop = newScrollHeight - previousScrollHeight;
          }
        });
      } catch (error) {
        console.error('Failed to load more messages:', error);
      } finally {
        setIsLoadingMore(false);
      }
    }
  }, [isLoadingMore, hasMore, onLoadMore]);

  // Throttle scroll events
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let timeoutId: NodeJS.Timeout;
    const throttledScroll = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleScroll, 100);
    };

    container.addEventListener('scroll', throttledScroll);
    return () => {
      container.removeEventListener('scroll', throttledScroll);
      clearTimeout(timeoutId);
    };
  }, [handleScroll]);

  // ============================================================================
  // Filter messages by search query
  // ============================================================================

  const filteredMessages = searchQuery
    ? messages.filter(msg => 
        msg.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        msg.senderName.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : messages;

  // ============================================================================
  // Render loading state
  // ============================================================================

  if (isLoading && messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-3"
        >
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-sm text-gray-600">
            {t('messaging.loading', 'Loading messages...')}
          </p>
        </motion.div>
      </div>
    );
  }

  // ============================================================================
  // Render error state
  // ============================================================================

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center px-6"
        >
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
            <span className="text-2xl">⚠️</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {t('messaging.error.title', 'Failed to load messages')}
          </h3>
          <p className="text-sm text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:shadow-lg transition-shadow"
          >
            {t('messaging.error.retry', 'Retry')}
          </button>
        </motion.div>
      </div>
    );
  }

  // ============================================================================
  // Render empty state
  // ============================================================================

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center px-6"
        >
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-100 flex items-center justify-center">
            <span className="text-2xl">💬</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {t('messaging.noMessages.title', 'No messages yet')}
          </h3>
          <p className="text-sm text-gray-600">
            {t('messaging.noMessages.description', 'Start the conversation by sending a message below.')}
          </p>
        </motion.div>
      </div>
    );
  }

  // ============================================================================
  // Render message list
  // ============================================================================

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto px-6 py-4 space-y-4"
      role="log"
      aria-live="polite"
      aria-label={t('messaging.messageList.label', 'Messages')}
    >
      {/* Load more indicator at top */}
      {isLoadingMore && (
        <div className="flex justify-center py-2">
          <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
        </div>
      )}

      {/* Has more indicator */}
      {hasMore && !isLoadingMore && messages.length > 0 && (
        <div className="flex justify-center py-2">
          <p className="text-xs text-gray-500">
            {t('messaging.scrollToLoadMore', 'Scroll up to load more messages')}
          </p>
        </div>
      )}

      {/* Messages */}
      {filteredMessages.map((message, index) => {
        const isFirstInGroup = 
          index === 0 || 
          filteredMessages[index - 1].senderId !== message.senderId ||
          (new Date(message.timestamp).getTime() - new Date(filteredMessages[index - 1].timestamp).getTime()) > 300000; // 5 minutes

        return (
          <MessageBubble
            key={message.id}
            message={message}
            isFirstInGroup={isFirstInGroup}
            searchQuery={searchQuery}
          />
        );
      })}

      {/* Search results indicator */}
      {searchQuery && filteredMessages.length === 0 && (
        <div className="flex justify-center py-8">
          <p className="text-sm text-gray-600">
            {t('messaging.search.noResults', 'No messages found matching your search.')}
          </p>
        </div>
      )}
    </div>
  );
}
