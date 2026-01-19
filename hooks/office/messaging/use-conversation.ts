/**
 * useConversation Hook
 * 
 * Custom hook for managing a single conversation with pagination and message sending.
 * Provides conversation data, messages, loading state, and actions for a specific conversation.
 * 
 * Requirements: 1.1, 1.2, 1.3, 18.1, 18.2, 18.3
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useMessaging } from './use-messaging-context';
import type { Conversation, Message, MessageDraft } from '@/types/office/messaging';

// ============================================================================
// Hook Interface
// ============================================================================

interface UseConversationReturn {
  conversation: Conversation | null;
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
  sendMessage: (draft: MessageDraft) => Promise<void>;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
}

// ============================================================================
// Hook Implementation
// ============================================================================

/**
 * Hook for managing a single conversation
 * 
 * @param conversationId - The ID of the conversation to manage
 * @returns Conversation data, messages, and actions
 */
export function useConversation(conversationId: string): UseConversationReturn {
  const {
    conversations,
    messages: allMessages,
    loadMessages,
    sendMessage: sendMessageAction,
    isLoading: globalLoading,
    error: globalError,
  } = useMessaging();

  // Local state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);

  // Get conversation from context
  const conversation = conversations.find(c => c.id === conversationId) || null;

  // Get messages for this conversation
  const messages = allMessages[conversationId] || [];

  // ============================================================================
  // Load initial messages
  // ============================================================================

  useEffect(() => {
    if (conversationId && messages.length === 0) {
      loadInitialMessages();
    }
  }, [conversationId]);

  const loadInitialMessages = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      setOffset(0);
      await loadMessages(conversationId, 0);
      setHasMore(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load messages';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [conversationId, loadMessages]);

  // ============================================================================
  // Load more messages (pagination)
  // ============================================================================

  const loadMore = useCallback(async () => {
    if (!hasMore || isLoading) return;

    try {
      setIsLoading(true);
      setError(null);

      const newOffset = offset + 50;
      const previousLength = messages.length;

      await loadMessages(conversationId, newOffset);

      // Check if we got new messages
      const currentLength = allMessages[conversationId]?.length || 0;
      if (currentLength === previousLength) {
        // No new messages loaded, we've reached the end
        setHasMore(false);
      } else {
        setOffset(newOffset);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load more messages';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [conversationId, offset, hasMore, isLoading, messages.length, loadMessages, allMessages]);

  // ============================================================================
  // Send message for this conversation
  // ============================================================================

  const sendMessage = useCallback(async (draft: MessageDraft) => {
    if (!conversation) {
      throw new Error('Conversation not found');
    }

    try {
      setError(null);
      await sendMessageAction({
        conversationId: conversation.id,
        recipientId: conversation.recipientId,
        recipientRole: conversation.recipientRole,
        content: draft.content,
        category: draft.category,
        priority: draft.priority,
        attachments: draft.attachments,
        replyToId: draft.templateId, // Using templateId as replyToId if needed
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send message';
      setError(errorMessage);
      throw err;
    }
  }, [conversation, sendMessageAction]);

  // ============================================================================
  // Refresh conversation
  // ============================================================================

  const refresh = useCallback(async () => {
    await loadInitialMessages();
  }, [loadInitialMessages]);

  // ============================================================================
  // Return hook interface
  // ============================================================================

  return {
    conversation,
    messages,
    isLoading: isLoading || globalLoading,
    error: error || globalError,
    hasMore,
    sendMessage,
    loadMore,
    refresh,
  };
}
