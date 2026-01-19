/**
 * Office Messaging Context
 * 
 * Provides centralized state management for the office messaging system
 * including conversations, messages, UI state, search/filters, real-time updates,
 * notifications, and language settings.
 */

'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { officeMessagingService } from '@/lib/services/office/messaging/messaging-service';
import type {
  User,
  Message,
  MessageDraft,
  Conversation,
  BroadcastMessage,
  SearchFilters,
  SortOption,
  Notification,
  NotificationSettings,
  TypingIndicator,
  ScheduledMessage,
  Language,
  TextDirection,
  LanguageSettings,
  ReactionType,
  SendMessageRequest,
  SendBroadcastRequest,
  ScheduleMessageRequest,
  ForwardMessageRequest,
} from '@/types/office/messaging';

// ============================================================================
// Context State Interface
// ============================================================================

interface MessagingContextState {
  // Conversations
  conversations: Conversation[];
  selectedConversationId: string | null;
  
  // Messages
  messages: Record<string, Message[]>; // conversationId -> messages
  
  // UI State
  isLoading: boolean;
  error: string | null;
  
  // Search and Filters
  searchQuery: string;
  filters: SearchFilters;
  sortBy: SortOption;
  
  // Real-time
  typingIndicators: Record<string, TypingIndicator>; // conversationId -> indicator
  isConnected: boolean;
  
  // Notifications
  notifications: Notification[];
  unreadCount: number;
  notificationSettings: NotificationSettings;
  
  // Language
  languageSettings: LanguageSettings;
  
  // Scheduled Messages
  scheduledMessages: ScheduledMessage[];
  
  // Actions - Messaging
  sendMessage: (request: SendMessageRequest) => Promise<void>;
  sendBroadcast: (request: SendBroadcastRequest) => Promise<void>;
  loadConversations: () => Promise<void>;
  loadMessages: (conversationId: string, offset?: number) => Promise<void>;
  selectConversation: (id: string | null) => void;
  
  // Actions - Search and Filter
  searchConversations: (query: string) => void;
  applyFilters: (filters: SearchFilters) => void;
  setSortBy: (sort: SortOption) => void;
  clearFilters: () => void;
  
  // Actions - Conversation Management
  markAsRead: (conversationId: string) => Promise<void>;
  markAsUnread: (conversationId: string) => Promise<void>;
  pinConversation: (conversationId: string) => Promise<void>;
  unpinConversation: (conversationId: string) => Promise<void>;
  starConversation: (conversationId: string) => Promise<void>;
  unstarConversation: (conversationId: string) => Promise<void>;
  archiveConversation: (conversationId: string) => Promise<void>;
  unarchiveConversation: (conversationId: string) => Promise<void>;
  resolveConversation: (conversationId: string) => Promise<void>;
  unresolveConversation: (conversationId: string) => Promise<void>;
  muteConversation: (conversationId: string) => Promise<void>;
  unmuteConversation: (conversationId: string) => Promise<void>;
  
  // Actions - Message Management
  pinMessage: (messageId: string, conversationId: string) => Promise<void>;
  unpinMessage: (messageId: string) => Promise<void>;
  addReaction: (messageId: string, reaction: ReactionType) => Promise<void>;
  removeReaction: (messageId: string, reaction: ReactionType) => Promise<void>;
  forwardMessage: (request: ForwardMessageRequest) => Promise<void>;
  scheduleMessage: (request: ScheduleMessageRequest) => Promise<void>;
  cancelScheduledMessage: (messageId: string) => Promise<void>;
  loadScheduledMessages: () => Promise<void>;
  
  // Actions - Notifications
  updateNotificationSettings: (settings: NotificationSettings) => Promise<void>;
  dismissNotification: (id: string) => void;
  snoozeNotification: (id: string, duration: number) => void;
  markNotificationAsRead: (id: string) => void;
  
  // Actions - Language
  setLanguage: (language: Language) => void;
  
  // Actions - Real-time
  sendTypingIndicator: (conversationId: string) => void;
  
  // Utility
  refreshConversations: () => Promise<void>;
  clearError: () => void;
}

// ============================================================================
// Context Creation
// ============================================================================

const MessagingContext = createContext<MessagingContextState | undefined>(undefined);

// ============================================================================
// Provider Props
// ============================================================================

interface MessagingProviderProps {
  children: React.ReactNode;
  currentUser: User;
}

// ============================================================================
// Provider Component
// ============================================================================

export function MessagingProvider({ children, currentUser }: MessagingProviderProps) {
  // Initialize service with current user
  useEffect(() => {
    officeMessagingService.setCurrentUser(currentUser);
  }, [currentUser]);

  // ============================================================================
  // State
  // ============================================================================

  // Conversations
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  
  // Messages
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  
  // UI State
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Search and Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({});
  const [sortBy, setSortByState] = useState<SortOption>('recent');
  
  // Real-time
  const [typingIndicators, setTypingIndicators] = useState<Record<string, TypingIndicator>>({});
  const [isConnected, setIsConnected] = useState(true);
  
  // Notifications
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    enabled: true,
    sound: 'default',
    preview: 'full',
    grouping: true,
    browserNotifications: true,
  });
  
  // Language
  const [languageSettings, setLanguageSettings] = useState<LanguageSettings>({
    language: 'en',
    direction: 'ltr',
  });
  
  // Scheduled Messages
  const [scheduledMessages, setScheduledMessages] = useState<ScheduledMessage[]>([]);
  
  // Refs for debouncing
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // ============================================================================
  // Conversation Actions
  // ============================================================================

  const loadConversations = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const convs = await officeMessagingService.getConversations(filters, sortBy);
      setConversations(convs);
      
      // Calculate total unread count
      const total = convs.reduce((sum, conv) => sum + conv.unreadCount, 0);
      setUnreadCount(total);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load conversations';
      setError(errorMessage);
      console.error('Error loading conversations:', err);
    } finally {
      setIsLoading(false);
    }
  }, [filters, sortBy]);

  const loadMessages = useCallback(async (conversationId: string, offset = 0) => {
    try {
      setIsLoading(true);
      setError(null);
      const msgs = await officeMessagingService.getMessages(conversationId, 50, offset);
      
      setMessages(prev => ({
        ...prev,
        [conversationId]: offset === 0 ? msgs : [...(prev[conversationId] || []), ...msgs],
      }));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load messages';
      setError(errorMessage);
      console.error('Error loading messages:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const selectConversation = useCallback((id: string | null) => {
    setSelectedConversationId(id);
    if (id && !messages[id]) {
      loadMessages(id);
    }
  }, [messages, loadMessages]);

  const refreshConversations = useCallback(async () => {
    await loadConversations();
  }, [loadConversations]);

  // ============================================================================
  // Message Actions
  // ============================================================================

  const sendMessage = useCallback(async (request: SendMessageRequest) => {
    try {
      setError(null);
      
      // Optimistic update - add temporary message
      const tempMessage: Message = {
        id: `temp-${Date.now()}`,
        conversationId: request.conversationId || '',
        senderId: currentUser.id,
        senderName: currentUser.name,
        senderRole: currentUser.role,
        content: request.content,
        category: request.category,
        priority: request.priority,
        status: 'sending',
        attachments: [],
        reactions: [],
        isPinned: false,
        isForwarded: false,
        timestamp: new Date(),
      };

      // Add to UI immediately
      if (request.conversationId) {
        setMessages(prev => ({
          ...prev,
          [request.conversationId!]: [...(prev[request.conversationId!] || []), tempMessage],
        }));
      }

      // Send to server
      const sentMessage = await officeMessagingService.sendMessage(request);
      
      // Replace temp message with real message
      const conversationId = sentMessage.conversationId;
      setMessages(prev => ({
        ...prev,
        [conversationId]: (prev[conversationId] || []).map(msg =>
          msg.id === tempMessage.id ? sentMessage : msg
        ),
      }));

      // Refresh conversations to update last message
      await loadConversations();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send message';
      setError(errorMessage);
      
      // Mark temp message as failed
      if (request.conversationId) {
        setMessages(prev => ({
          ...prev,
          [request.conversationId!]: (prev[request.conversationId!] || []).map(msg =>
            msg.status === 'sending' ? { ...msg, status: 'failed' as const } : msg
          ),
        }));
      }
      
      throw err;
    }
  }, [currentUser, loadConversations]);

  const sendBroadcast = useCallback(async (request: SendBroadcastRequest) => {
    try {
      setIsLoading(true);
      setError(null);
      await officeMessagingService.sendBroadcast(request);
      
      // Show success notification
      const notification: Notification = {
        id: `notif-${Date.now()}`,
        type: 'broadcast_complete',
        message: 'Broadcast message sent successfully',
        timestamp: new Date(),
        isRead: false,
        priority: 'normal',
      };
      setNotifications(prev => [notification, ...prev]);
      
      // Refresh conversations
      await loadConversations();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send broadcast';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [loadConversations]);

  // ============================================================================
  // Search and Filter Actions
  // ============================================================================

  const searchConversations = useCallback((query: string) => {
    setSearchQuery(query);
    // Trigger reload with search query
    loadConversations();
  }, [loadConversations]);

  const applyFilters = useCallback((newFilters: SearchFilters) => {
    setFilters(newFilters);
    // Trigger reload with new filters
    loadConversations();
  }, [loadConversations]);

  const setSortBy = useCallback((sort: SortOption) => {
    setSortByState(sort);
    // Trigger reload with new sort
    loadConversations();
  }, [loadConversations]);

  const clearFilters = useCallback(() => {
    setFilters({});
    setSearchQuery('');
    loadConversations();
  }, [loadConversations]);

  // ============================================================================
  // Conversation Management Actions
  // ============================================================================

  const markAsRead = useCallback(async (conversationId: string) => {
    try {
      await officeMessagingService.markAsRead(conversationId);
      
      // Update local state
      setConversations(prev =>
        prev.map(conv =>
          conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv
        )
      );
      
      // Recalculate unread count
      setUnreadCount(prev => {
        const conv = conversations.find(c => c.id === conversationId);
        return prev - (conv?.unreadCount || 0);
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to mark as read';
      setError(errorMessage);
      throw err;
    }
  }, [conversations]);

  const markAsUnread = useCallback(async (conversationId: string) => {
    try {
      await officeMessagingService.markAsUnread(conversationId);
      
      // Update local state
      setConversations(prev =>
        prev.map(conv =>
          conv.id === conversationId ? { ...conv, unreadCount: 1 } : conv
        )
      );
      
      setUnreadCount(prev => prev + 1);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to mark as unread';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const pinConversation = useCallback(async (conversationId: string) => {
    try {
      await officeMessagingService.pinConversation(conversationId);
      
      setConversations(prev =>
        prev.map(conv =>
          conv.id === conversationId ? { ...conv, isPinned: true } : conv
        )
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to pin conversation';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const unpinConversation = useCallback(async (conversationId: string) => {
    try {
      await officeMessagingService.unpinConversation(conversationId);
      
      setConversations(prev =>
        prev.map(conv =>
          conv.id === conversationId ? { ...conv, isPinned: false } : conv
        )
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to unpin conversation';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const starConversation = useCallback(async (conversationId: string) => {
    try {
      await officeMessagingService.starConversation(conversationId);
      
      setConversations(prev =>
        prev.map(conv =>
          conv.id === conversationId ? { ...conv, isStarred: true } : conv
        )
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to star conversation';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const unstarConversation = useCallback(async (conversationId: string) => {
    try {
      await officeMessagingService.unstarConversation(conversationId);
      
      setConversations(prev =>
        prev.map(conv =>
          conv.id === conversationId ? { ...conv, isStarred: false } : conv
        )
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to unstar conversation';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const archiveConversation = useCallback(async (conversationId: string) => {
    try {
      await officeMessagingService.archiveConversation(conversationId);
      
      setConversations(prev =>
        prev.map(conv =>
          conv.id === conversationId ? { ...conv, isArchived: true } : conv
        )
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to archive conversation';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const unarchiveConversation = useCallback(async (conversationId: string) => {
    try {
      await officeMessagingService.unarchiveConversation(conversationId);
      
      setConversations(prev =>
        prev.map(conv =>
          conv.id === conversationId ? { ...conv, isArchived: false } : conv
        )
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to unarchive conversation';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const resolveConversation = useCallback(async (conversationId: string) => {
    try {
      await officeMessagingService.resolveConversation(conversationId);
      
      setConversations(prev =>
        prev.map(conv =>
          conv.id === conversationId ? { ...conv, isResolved: true } : conv
        )
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to resolve conversation';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const unresolveConversation = useCallback(async (conversationId: string) => {
    try {
      await officeMessagingService.unresolveConversation(conversationId);
      
      setConversations(prev =>
        prev.map(conv =>
          conv.id === conversationId ? { ...conv, isResolved: false } : conv
        )
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to unresolve conversation';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const muteConversation = useCallback(async (conversationId: string) => {
    try {
      await officeMessagingService.muteConversation(conversationId);
      
      setConversations(prev =>
        prev.map(conv =>
          conv.id === conversationId ? { ...conv, isMuted: true } : conv
        )
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to mute conversation';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const unmuteConversation = useCallback(async (conversationId: string) => {
    try {
      await officeMessagingService.unmuteConversation(conversationId);
      
      setConversations(prev =>
        prev.map(conv =>
          conv.id === conversationId ? { ...conv, isMuted: false } : conv
        )
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to unmute conversation';
      setError(errorMessage);
      throw err;
    }
  }, []);

  // ============================================================================
  // Message Management Actions
  // ============================================================================

  const pinMessage = useCallback(async (messageId: string, conversationId: string) => {
    try {
      await officeMessagingService.pinMessage(messageId, conversationId);
      
      // Update message in local state
      setMessages(prev => ({
        ...prev,
        [conversationId]: (prev[conversationId] || []).map(msg =>
          msg.id === messageId ? { ...msg, isPinned: true } : msg
        ),
      }));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to pin message';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const unpinMessage = useCallback(async (messageId: string) => {
    try {
      await officeMessagingService.unpinMessage(messageId);
      
      // Update message in all conversations
      setMessages(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(convId => {
          updated[convId] = updated[convId].map(msg =>
            msg.id === messageId ? { ...msg, isPinned: false } : msg
          );
        });
        return updated;
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to unpin message';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const addReaction = useCallback(async (messageId: string, reaction: ReactionType) => {
    try {
      // Optimistic update
      setMessages(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(convId => {
          updated[convId] = updated[convId].map(msg => {
            if (msg.id === messageId) {
              return {
                ...msg,
                reactions: [
                  ...msg.reactions,
                  {
                    type: reaction,
                    userId: currentUser.id,
                    userName: currentUser.name,
                    timestamp: new Date(),
                  },
                ],
              };
            }
            return msg;
          });
        });
        return updated;
      });

      await officeMessagingService.addReaction(messageId, reaction);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add reaction';
      setError(errorMessage);
      
      // Rollback optimistic update
      setMessages(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(convId => {
          updated[convId] = updated[convId].map(msg => {
            if (msg.id === messageId) {
              return {
                ...msg,
                reactions: msg.reactions.filter(
                  r => !(r.type === reaction && r.userId === currentUser.id)
                ),
              };
            }
            return msg;
          });
        });
        return updated;
      });
      
      throw err;
    }
  }, [currentUser]);

  const removeReaction = useCallback(async (messageId: string, reaction: ReactionType) => {
    try {
      // Optimistic update
      setMessages(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(convId => {
          updated[convId] = updated[convId].map(msg => {
            if (msg.id === messageId) {
              return {
                ...msg,
                reactions: msg.reactions.filter(
                  r => !(r.type === reaction && r.userId === currentUser.id)
                ),
              };
            }
            return msg;
          });
        });
        return updated;
      });

      await officeMessagingService.removeReaction(messageId, reaction);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove reaction';
      setError(errorMessage);
      throw err;
    }
  }, [currentUser]);

  const forwardMessage = useCallback(async (request: ForwardMessageRequest) => {
    try {
      setIsLoading(true);
      setError(null);
      await officeMessagingService.forwardMessage(request);
      
      // Refresh conversations
      await loadConversations();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to forward message';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [loadConversations]);

  const scheduleMessage = useCallback(async (request: ScheduleMessageRequest) => {
    try {
      setIsLoading(true);
      setError(null);
      const scheduled = await officeMessagingService.scheduleMessage(request);
      
      setScheduledMessages(prev => [...prev, scheduled]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to schedule message';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const cancelScheduledMessage = useCallback(async (messageId: string) => {
    try {
      await officeMessagingService.cancelScheduledMessage(messageId);
      
      setScheduledMessages(prev => prev.filter(msg => msg.id !== messageId));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to cancel scheduled message';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const loadScheduledMessages = useCallback(async () => {
    try {
      const scheduled = await officeMessagingService.getScheduledMessages();
      setScheduledMessages(scheduled);
    } catch (err) {
      console.error('Error loading scheduled messages:', err);
    }
  }, []);

  // ============================================================================
  // Notification Actions
  // ============================================================================

  const updateNotificationSettings = useCallback(async (settings: NotificationSettings) => {
    try {
      setNotificationSettings(settings);
      // Persist to localStorage or backend
      localStorage.setItem('notificationSettings', JSON.stringify(settings));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update notification settings';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const dismissNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  }, []);

  const snoozeNotification = useCallback((id: string, duration: number) => {
    // Remove notification temporarily
    setNotifications(prev => prev.filter(notif => notif.id !== id));
    
    // Re-add after duration
    setTimeout(() => {
      setNotifications(prev => {
        const notification = notifications.find(n => n.id === id);
        return notification ? [notification, ...prev] : prev;
      });
    }, duration);
  }, [notifications]);

  const markNotificationAsRead = useCallback((id: string) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === id ? { ...notif, isRead: true } : notif
      )
    );
  }, []);

  // ============================================================================
  // Language Actions
  // ============================================================================

  const setLanguage = useCallback((language: Language) => {
    const direction: TextDirection = language === 'en' ? 'ltr' : 'rtl';
    setLanguageSettings({ language, direction });
    
    // Persist to localStorage
    localStorage.setItem('language', language);
    
    // Update document direction
    document.documentElement.dir = direction;
    document.documentElement.lang = language;
  }, []);

  // ============================================================================
  // Real-time Actions
  // ============================================================================

  const sendTypingIndicator = useCallback((conversationId: string) => {
    // Throttle typing indicator to once per second
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Send typing indicator
    // In a real implementation, this would use WebSocket
    console.log('Typing indicator sent for conversation:', conversationId);

    // Clear after 3 seconds
    typingTimeoutRef.current = setTimeout(() => {
      setTypingIndicators(prev => {
        const updated = { ...prev };
        delete updated[conversationId];
        return updated;
      });
    }, 3000);
  }, []);

  // ============================================================================
  // Utility Actions
  // ============================================================================

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // ============================================================================
  // Load initial data
  // ============================================================================

  useEffect(() => {
    loadConversations();
    loadScheduledMessages();
    
    // Load notification settings from localStorage
    const savedSettings = localStorage.getItem('notificationSettings');
    if (savedSettings) {
      setNotificationSettings(JSON.parse(savedSettings));
    }
    
    // Load language from localStorage
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage) {
      setLanguage(savedLanguage);
    }
  }, [loadConversations, loadScheduledMessages, setLanguage]);

  // ============================================================================
  // Context Value
  // ============================================================================

  const value: MessagingContextState = {
    // State
    conversations,
    selectedConversationId,
    messages,
    isLoading,
    error,
    searchQuery,
    filters,
    sortBy,
    typingIndicators,
    isConnected,
    notifications,
    unreadCount,
    notificationSettings,
    languageSettings,
    scheduledMessages,
    
    // Actions - Messaging
    sendMessage,
    sendBroadcast,
    loadConversations,
    loadMessages,
    selectConversation,
    
    // Actions - Search and Filter
    searchConversations,
    applyFilters,
    setSortBy,
    clearFilters,
    
    // Actions - Conversation Management
    markAsRead,
    markAsUnread,
    pinConversation,
    unpinConversation,
    starConversation,
    unstarConversation,
    archiveConversation,
    unarchiveConversation,
    resolveConversation,
    unresolveConversation,
    muteConversation,
    unmuteConversation,
    
    // Actions - Message Management
    pinMessage,
    unpinMessage,
    addReaction,
    removeReaction,
    forwardMessage,
    scheduleMessage,
    cancelScheduledMessage,
    loadScheduledMessages,
    
    // Actions - Notifications
    updateNotificationSettings,
    dismissNotification,
    snoozeNotification,
    markNotificationAsRead,
    
    // Actions - Language
    setLanguage,
    
    // Actions - Real-time
    sendTypingIndicator,
    
    // Utility
    refreshConversations,
    clearError,
  };

  return (
    <MessagingContext.Provider value={value}>
      {children}
    </MessagingContext.Provider>
  );
}

// ============================================================================
// Hook to use the context
// ============================================================================

export function useMessaging(): MessagingContextState {
  const context = useContext(MessagingContext);
  if (!context) {
    throw new Error('useMessaging must be used within a MessagingProvider');
  }
  return context;
}
