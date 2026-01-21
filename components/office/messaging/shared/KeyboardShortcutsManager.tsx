/**
 * KeyboardShortcutsManager Component
 * 
 * Registers and manages all keyboard shortcuts for the messaging system.
 * Handles global shortcuts, navigation shortcuts, action shortcuts, and message action shortcuts.
 * 
 * Requirements: 26.1, 26.2, 26.3, 26.4, 26.5, 26.6, 26.7, 26.8, 26.9
 */

'use client';

import { useEffect, useState, useCallback } from 'react';
import { useMessaging } from '@/hooks/office/messaging/use-messaging-context';
import { useKeyboardShortcuts, getCommonShortcuts } from '@/hooks/office/messaging/use-keyboard-shortcuts';
import type { KeyboardShortcut } from '@/types/office/messaging';

// ============================================================================
// Props
// ============================================================================

interface KeyboardShortcutsManagerProps {
  onShowHelp?: () => void;
  onNewConversation?: () => void;
  onCommandPalette?: () => void;
  focusedMessageId?: string | null;
  children?: React.ReactNode;
}

// ============================================================================
// Component
// ============================================================================

export function KeyboardShortcutsManager({
  onShowHelp,
  onNewConversation,
  onCommandPalette,
  focusedMessageId,
  children,
}: KeyboardShortcutsManagerProps) {
  const messaging = useMessaging();
  const [searchFocused, setSearchFocused] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // ============================================================================
  // Navigation Helpers
  // ============================================================================

  const navigateUp = useCallback(() => {
    if (messaging.conversations.length === 0) return;
    
    setSelectedIndex(prev => {
      const newIndex = Math.max(0, prev - 1);
      return newIndex;
    });
  }, [messaging.conversations.length]);

  const navigateDown = useCallback(() => {
    if (messaging.conversations.length === 0) return;
    
    setSelectedIndex(prev => {
      const newIndex = Math.min(messaging.conversations.length - 1, prev + 1);
      return newIndex;
    });
  }, [messaging.conversations.length]);

  const openSelectedConversation = useCallback(() => {
    if (messaging.conversations.length === 0) return;
    
    const conversation = messaging.conversations[selectedIndex];
    if (conversation) {
      messaging.selectConversation(conversation.id);
    }
  }, [messaging, selectedIndex]);

  // ============================================================================
  // Action Handlers
  // ============================================================================

  const handleNewConversation = useCallback(() => {
    if (onNewConversation) {
      onNewConversation();
    }
  }, [onNewConversation]);

  const handleSearch = useCallback(() => {
    // Focus search input
    const searchInput = document.querySelector('[data-search-input]') as HTMLInputElement;
    if (searchInput) {
      searchInput.focus();
      setSearchFocused(true);
    }
  }, []);

  const handleCommandPalette = useCallback(() => {
    if (onCommandPalette) {
      onCommandPalette();
    }
  }, [onCommandPalette]);

  const handleCloseDialog = useCallback(() => {
    // Close any open dialogs
    const closeButtons = document.querySelectorAll('[data-dialog-close]');
    if (closeButtons.length > 0) {
      (closeButtons[0] as HTMLElement).click();
    }
  }, []);

  const handleSendMessage = useCallback(() => {
    // Trigger send button click
    const sendButton = document.querySelector('[data-send-button]') as HTMLElement;
    if (sendButton) {
      sendButton.click();
    }
  }, []);

  const handleMarkAllRead = useCallback(async () => {
    // Mark all conversations as read
    const unreadConversations = messaging.conversations.filter(c => c.unreadCount > 0);
    
    for (const conversation of unreadConversations) {
      try {
        await messaging.markAsRead(conversation.id);
      } catch (error) {
        console.error('Failed to mark conversation as read:', error);
      }
    }
  }, [messaging]);

  const handlePinConversation = useCallback(async () => {
    if (!messaging.selectedConversationId) return;
    
    const conversation = messaging.conversations.find(
      c => c.id === messaging.selectedConversationId
    );
    
    if (!conversation) return;
    
    try {
      if (conversation.isPinned) {
        await messaging.unpinConversation(conversation.id);
      } else {
        await messaging.pinConversation(conversation.id);
      }
    } catch (error) {
      console.error('Failed to toggle pin:', error);
    }
  }, [messaging]);

  const handleStarConversation = useCallback(async () => {
    if (!messaging.selectedConversationId) return;
    
    const conversation = messaging.conversations.find(
      c => c.id === messaging.selectedConversationId
    );
    
    if (!conversation) return;
    
    try {
      if (conversation.isStarred) {
        await messaging.unstarConversation(conversation.id);
      } else {
        await messaging.starConversation(conversation.id);
      }
    } catch (error) {
      console.error('Failed to toggle star:', error);
    }
  }, [messaging]);

  const handleArchiveConversation = useCallback(async () => {
    if (!messaging.selectedConversationId) return;
    
    try {
      await messaging.archiveConversation(messaging.selectedConversationId);
    } catch (error) {
      console.error('Failed to archive conversation:', error);
    }
  }, [messaging]);

  const handleResolveConversation = useCallback(async () => {
    if (!messaging.selectedConversationId) return;
    
    const conversation = messaging.conversations.find(
      c => c.id === messaging.selectedConversationId
    );
    
    if (!conversation) return;
    
    try {
      if (conversation.isResolved) {
        await messaging.unresolveConversation(conversation.id);
      } else {
        await messaging.resolveConversation(conversation.id);
      }
    } catch (error) {
      console.error('Failed to toggle resolve:', error);
    }
  }, [messaging]);

  const handleShowHelp = useCallback(() => {
    if (onShowHelp) {
      onShowHelp();
    }
  }, [onShowHelp]);

  // ============================================================================
  // Message Action Handlers (when message is focused)
  // ============================================================================

  const handleReplyToMessage = useCallback(() => {
    if (!focusedMessageId) return;
    
    // Focus compose area and set reply context
    const composeArea = document.querySelector('[data-compose-area]') as HTMLElement;
    if (composeArea) {
      composeArea.focus();
      // Set reply context (implementation depends on compose area)
      composeArea.setAttribute('data-reply-to', focusedMessageId);
    }
  }, [focusedMessageId]);

  const handleForwardMessage = useCallback(() => {
    if (!focusedMessageId) return;
    
    // Trigger forward dialog
    const forwardButton = document.querySelector(
      `[data-forward-message="${focusedMessageId}"]`
    ) as HTMLElement;
    if (forwardButton) {
      forwardButton.click();
    }
  }, [focusedMessageId]);

  const handlePinMessage = useCallback(async () => {
    if (!focusedMessageId || !messaging.selectedConversationId) return;
    
    try {
      await messaging.pinMessage(focusedMessageId, messaging.selectedConversationId);
    } catch (error) {
      console.error('Failed to pin message:', error);
    }
  }, [focusedMessageId, messaging]);

  // ============================================================================
  // Register Shortcuts
  // ============================================================================

  // Get common shortcuts
  const shortcuts = getCommonShortcuts({
    newConversation: handleNewConversation,
    search: handleSearch,
    commandPalette: handleCommandPalette,
    closeDialog: handleCloseDialog,
    sendMessage: handleSendMessage,
    markAllRead: handleMarkAllRead,
    pinConversation: handlePinConversation,
    starConversation: handleStarConversation,
    archiveConversation: handleArchiveConversation,
    navigateUp,
    navigateDown,
    openConversation: openSelectedConversation,
    showHelp: handleShowHelp,
  });

  // Additional shortcuts for resolve conversation
  const additionalShortcuts = [
    {
      key: 'r',
      ctrl: true,
      shift: true,
      action: handleResolveConversation,
      description: 'Resolve conversation',
    },
  ];

  // Message action shortcuts (only when message is focused)
  const messageShortcuts = focusedMessageId
    ? [
        {
          key: 'r',
          action: handleReplyToMessage,
          description: 'Reply to message',
          enabled: true,
        },
        {
          key: 'f',
          action: handleForwardMessage,
          description: 'Forward message',
          enabled: true,
        },
        {
          key: 'p',
          action: handlePinMessage,
          description: 'Pin message',
          enabled: true,
        },
      ]
    : [];

  // Combine all shortcuts
  const allShortcuts = [...shortcuts, ...additionalShortcuts, ...messageShortcuts];

  // Register shortcuts
  useKeyboardShortcuts(allShortcuts, { enabled: true });

  // ============================================================================
  // Update selected index when selected conversation changes
  // ============================================================================

  useEffect(() => {
    if (messaging.selectedConversationId) {
      const index = messaging.conversations.findIndex(
        c => c.id === messaging.selectedConversationId
      );
      if (index !== -1) {
        setSelectedIndex(index);
      }
    }
  }, [messaging.selectedConversationId, messaging.conversations]);

  // ============================================================================
  // Render
  // ============================================================================

  // This component doesn't render anything visible
  // It just manages keyboard shortcuts
  return <>{children}</>;
}

