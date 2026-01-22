/**
 * Office Messaging Context
 * 
 * Provides centralized state management for the office messaging system
 * including conversations, messages, UI state, search/filters, real-time updates,
 * notifications, and language settings.
 */

'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { mockMessagingService } from '@/lib/services/office/messaging/mock-messaging-service';
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
  createConversation: (recipientId: string, recipientRole: 'student' | 'teacher') => Promise<string>;
  
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
    mockMessagingService.setCurrentUser(currentUser);
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
      
      // Call real API instead of mock service
      const response = await fetch('/api/conversations', {
        credentials: 'include', // Include cookies for authentication
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('Failed to fetch conversations:', response.status, errorData);
        
        // Don't throw error, just set empty conversations
        // This allows the UI to work even if API fails
        setConversations([]);
        setUnreadCount(0);
        return;
      }
      
      const data = await response.json();
      
      // Transform API response to match component expectations
      const transformedConversations = (data.conversations || []).map((conv: any) => ({
        id: conv.id,
        recipientId: conv.otherParticipant?.id || '',
        recipientName: conv.otherParticipant?.name || 'Unknown User',
        recipientRole: conv.otherParticipant?.type || 'student',
        recipientAvatar: conv.otherParticipant?.avatar,
        lastMessage: {
          id: `msg-${Date.now()}`,
          conversationId: conv.id,
          senderId: '',
          senderName: '',
          senderRole: 'office' as const,
          content: conv.lastMessagePreview || '',
          category: 'general' as const,
          priority: 'normal' as const,
          status: 'sent' as const,
          attachments: [],
          reactions: [],
          isPinned: false,
          isForwarded: false,
          timestamp: conv.lastMessageAt ? new Date(conv.lastMessageAt) : new Date(),
        },
        unreadCount: conv.unreadCount || 0,
        isPinned: false,
        isStarred: false,
        isArchived: conv.isArchived || false,
        isResolved: false,
        isMuted: conv.isMuted || false,
        pinnedMessages: [],
        createdAt: new Date(),
        updatedAt: conv.lastMessageAt ? new Date(conv.lastMessageAt) : new Date(),
      }));
      
      setConversations(transformedConversations);
      
      // Calculate total unread count
      const total = transformedConversations.reduce((sum: number, conv: any) => sum + (conv.unreadCount || 0), 0);
      setUnreadCount(total);
      
      // Create notifications for conversations with unread messages
      // Only create notifications for new unread messages (not already in notifications)
      const existingNotificationConvIds = new Set(
        notifications.map(n => n.conversationId).filter(Boolean)
      );
      
      const newNotifications: Notification[] = [];
      transformedConversations.forEach((conv: any) => {
        if (conv.unreadCount > 0 && !existingNotificationConvIds.has(conv.id)) {
          // Create a notification for this conversation
          const notification: Notification = {
            id: `notif-${conv.id}-${Date.now()}`,
            type: 'new_message',
            conversationId: conv.id,
            senderId: conv.recipientId,
            senderName: conv.recipientName,
            message: conv.lastMessage.content || 'New message',
            timestamp: conv.lastMessage.timestamp,
            isRead: false,
            priority: 'normal',
          };
          newNotifications.push(notification);
        }
      });
      
      // Add new notifications to the beginning of the list
      if (newNotifications.length > 0) {
        setNotifications(prev => [...newNotifications, ...prev]);
      }
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
      
      // Call real API instead of mock service
      const response = await fetch(`/api/conversations/${conversationId}/messages?offset=${offset}&limit=50`, {
        credentials: 'include', // Include cookies for authentication
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('Failed to fetch messages:', response.status, errorData);
        throw new Error(errorData.error || `Failed to fetch messages (${response.status})`);
      }
      
      const data = await response.json();
      const apiMessages = data.messages || [];
      
      // Transform API messages to match component expectations
      const transformedMessages = apiMessages.map((msg: any) => ({
        id: msg.id,
        conversationId: msg.conversationId,
        senderId: msg.senderId,
        senderName: msg.senderName,
        senderRole: msg.senderType as 'student' | 'teacher' | 'office',
        content: msg.content,
        category: msg.category,
        priority: 'normal' as const,
        status: 'sent' as const,
        attachments: msg.attachments || [],
        reactions: [],
        isPinned: false,
        isForwarded: msg.isForwarded || false,
        timestamp: new Date(msg.createdAt),
      }));
      
      setMessages(prev => ({
        ...prev,
        [conversationId]: offset === 0 ? transformedMessages : [...(prev[conversationId] || []), ...transformedMessages],
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
    // Only load messages if:
    // 1. There's a conversation ID
    // 2. Messages haven't been loaded yet
    // 3. It's NOT a temporary conversation (starts with temp-conv-)
    if (id && !messages[id] && !id.startsWith('temp-conv-')) {
      loadMessages(id);
    }
    
    // Mark conversation as read when selected (call API directly to avoid circular dependency)
    if (id && !id.startsWith('temp-conv-')) {
      // Call API to mark as read
      fetch(`/api/conversations/${id}/read`, {
        method: 'POST',
        credentials: 'include',
      }).catch(err => console.error('Error marking as read:', err));
      
      // Update local state immediately
      setConversations(prev =>
        prev.map(conv =>
          conv.id === id ? { ...conv, unreadCount: 0 } : conv
        )
      );
      
      // Recalculate total unread count
      setUnreadCount(prev => {
        const conv = conversations.find(c => c.id === id);
        return Math.max(0, prev - (conv?.unreadCount || 0));
      });
    }
  }, [messages, loadMessages, conversations]);

  const createConversation = useCallback(async (recipientId: string, recipientRole: 'student' | 'teacher') => {
    try {
      setError(null);
      
      // Check if conversation already exists
      const existingConv = conversations.find(
        c => c.recipientId === recipientId && c.recipientRole === recipientRole
      );
      
      if (existingConv) {
        // Conversation already exists, just select it
        setSelectedConversationId(existingConv.id);
        return existingConv.id;
      }
      
      // Create a temporary conversation ID
      // The real conversation will be created when the first message is sent
      const tempConvId = `temp-conv-${Date.now()}`;
      
      // Fetch recipient name from database
      let recipientName = 'Unknown User';
      try {
        const params = new URLSearchParams({ page: '1', limit: '1000' });
        
        if (recipientRole === 'student') {
          const response = await fetch(`/api/students/list?${params}`, { credentials: 'include' });
          if (response.ok) {
            const data = await response.json();
            const foundStudent = (data.students || []).find((s: any) => s.id === recipientId);
            if (foundStudent) recipientName = foundStudent.name;
          }
        } else if (recipientRole === 'teacher') {
          const response = await fetch(`/api/teachers/list?${params}`, { credentials: 'include' });
          if (response.ok) {
            const data = await response.json();
            const foundTeacher = (data.teachers || []).find((t: any) => t.id === recipientId);
            if (foundTeacher) recipientName = foundTeacher.name;
          }
        }
      } catch (error) {
        console.error('Error fetching recipient name:', error);
      }
      
      // Add temporary conversation to state
      const tempConv = {
        id: tempConvId,
        recipientId,
        recipientName,
        recipientRole,
        recipientAvatar: undefined,
        lastMessage: {
          id: '',
          conversationId: tempConvId,
          senderId: '',
          senderName: '',
          senderRole: 'office' as const,
          content: '',
          category: 'general' as const,
          priority: 'normal' as const,
          status: 'sent' as const,
          attachments: [],
          reactions: [],
          isPinned: false,
          isForwarded: false,
          timestamp: new Date(),
        },
        unreadCount: 0,
        isPinned: false,
        isStarred: false,
        isArchived: false,
        isResolved: false,
        isMuted: false,
        pinnedMessages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      setConversations(prev => [tempConv, ...prev]);
      setSelectedConversationId(tempConvId);
      
      // Initialize empty messages array
      setMessages(prev => ({
        ...prev,
        [tempConvId]: [],
      }));
      
      return tempConvId;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create conversation';
      setError(errorMessage);
      console.error('Error creating conversation:', err);
      throw err;
    }
  }, [conversations]);

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

      // Send to server using real API
      const conversation = conversations.find(c => c.id === request.conversationId);
      if (!conversation) {
        throw new Error('Conversation not found');
      }
      
      // Check if this is a temporary conversation
      const isTempConversation = conversation.id.startsWith('temp-conv-');
      
      const formData = new FormData();
      formData.append('recipientId', conversation.recipientId);
      formData.append('recipientType', conversation.recipientRole);
      formData.append('content', request.content);
      formData.append('category', request.category);
      
      // Only include conversationId if it's not a temporary one
      if (!isTempConversation && request.conversationId) {
        formData.append('conversationId', request.conversationId);
      }
      
      // Add attachments if any
      if (request.attachments && request.attachments.length > 0) {
        request.attachments.forEach(file => {
          formData.append('attachments', file);
        });
      }
      
      const response = await fetch('/api/messages', {
        method: 'POST',
        body: formData,
        credentials: 'include', // Include cookies for authentication
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to send message');
      }
      
      const data = await response.json();
      const sentMessage = data.message;
      
      // If this was a temporary conversation, update it with the real conversation ID
      if (isTempConversation) {
        const realConversationId = sentMessage.conversationId;
        
        // Remove temporary conversation and messages
        setConversations(prev => prev.filter(c => c.id !== conversation.id));
        setMessages(prev => {
          const updated = { ...prev };
          delete updated[conversation.id];
          return updated;
        });
        
        // Refresh conversations to get the real one from database
        await loadConversations();
        
        // Select the real conversation
        setSelectedConversationId(realConversationId);
        
        // Load messages for the real conversation
        await loadMessages(realConversationId);
      } else {
        // Replace temp message with real message
        const conversationId = sentMessage.conversationId;
        setMessages(prev => ({
          ...prev,
          [conversationId]: (prev[conversationId] || []).map(msg =>
            msg.id === tempMessage.id ? {
              ...sentMessage,
              senderRole: sentMessage.senderType,
              timestamp: new Date(sentMessage.createdAt),
              priority: 'normal',
              status: 'sent',
              reactions: [],
              isPinned: false,
            } : msg
          ),
        }));

        // Refresh conversations to update last message
        await loadConversations();
      }
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
  }, [currentUser, loadConversations, conversations, loadMessages]);

  const sendBroadcast = useCallback(async (request: SendBroadcastRequest) => {
    try {
      setIsLoading(true);
      setError(null);
      await mockMessagingService.sendBroadcast(request);
      
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
      // Call real API to mark messages as read
      const response = await fetch(`/api/conversations/${conversationId}/read`, {
        method: 'POST',
        credentials: 'include',
      });
      
      if (!response.ok) {
        console.error('Failed to mark as read:', response.status);
        // Don't throw error, just log it
      }
      
      // Update local state immediately for better UX
      setConversations(prev =>
        prev.map(conv =>
          conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv
        )
      );
      
      // Recalculate total unread count
      setUnreadCount(prev => {
        const conv = conversations.find(c => c.id === conversationId);
        return Math.max(0, prev - (conv?.unreadCount || 0));
      });
      
      // Mark related notifications as read
      setNotifications(prev =>
        prev.map(notif =>
          notif.conversationId === conversationId
            ? { ...notif, isRead: true }
            : notif
        )
      );
    } catch (err) {
      console.error('Error marking as read:', err);
      // Don't throw error, just log it
    }
  }, [conversations]);

  const markAsUnread = useCallback(async (conversationId: string) => {
    try {
      await mockMessagingService.markAsUnread(conversationId);
      
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
      await mockMessagingService.pinConversation(conversationId);
      
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
      await mockMessagingService.unpinConversation(conversationId);
      
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
      await mockMessagingService.starConversation(conversationId);
      
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
      await mockMessagingService.unstarConversation(conversationId);
      
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
      await mockMessagingService.archiveConversation(conversationId);
      
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
      await mockMessagingService.unarchiveConversation(conversationId);
      
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
      await mockMessagingService.resolveConversation(conversationId);
      
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
      await mockMessagingService.unresolveConversation(conversationId);
      
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
      await mockMessagingService.muteConversation(conversationId);
      
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
      await mockMessagingService.unmuteConversation(conversationId);
      
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
      await mockMessagingService.pinMessage(messageId, conversationId);
      
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
      await mockMessagingService.unpinMessage(messageId);
      
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

      await mockMessagingService.addReaction(messageId, reaction);
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

      await mockMessagingService.removeReaction(messageId, reaction);
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
      await mockMessagingService.forwardMessage(request);
      
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
      
      // Call real API to schedule message
      const response = await fetch('/api/messages/schedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to schedule message');
      }

      const data = await response.json();
      const scheduled = data.scheduled;
      
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
      await mockMessagingService.cancelScheduledMessage(messageId);
      
      setScheduledMessages(prev => prev.filter(msg => msg.id !== messageId));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to cancel scheduled message';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const loadScheduledMessages = useCallback(async () => {
    try {
      const scheduled = await mockMessagingService.getScheduledMessages();
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
    createConversation,
    
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
