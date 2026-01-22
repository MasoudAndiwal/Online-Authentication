/**
 * Mock Messaging Service
 * 
 * Provides mock data for development and testing without requiring database setup.
 * This service simulates the real messaging service with in-memory data.
 */

import { supabase } from '@/lib/supabase-simple';
import type {
  Conversation,
  Message,
  MessageTemplate,
  ScheduledMessage,
  BroadcastMessage,
  SearchFilters,
  SortOption,
  SendMessageRequest,
  SendBroadcastRequest,
  ScheduleMessageRequest,
  ForwardMessageRequest,
  ReactionType,
  User,
} from '@/types/office/messaging';

// Mock data storage
let mockConversations: Conversation[] = [];
let mockMessages: Record<string, Message[]> = {};
let mockTemplates: MessageTemplate[] = [];
let mockScheduledMessages: ScheduledMessage[] = [];
let currentUser: User | null = null;

// Initialize mock data
function initializeMockData() {
  if (mockConversations.length > 0) return; // Already initialized

  // Create sample conversations
  mockConversations = [
    {
      id: 'conv-1',
      recipientId: 'student-1',
      recipientName: 'مسعود اندیوال',
      recipientRole: 'student',
      recipientAvatar: undefined,
      lastMessage: {
        id: 'msg-1',
        conversationId: 'conv-1',
        senderId: 'student-1',
        senderName: 'مسعود اندیوال',
        senderRole: 'student',
        content: "Hi Ser , I can't come today ...",
        category: 'general',
        priority: 'normal',
        status: 'read',
        attachments: [],
        reactions: [],
        isPinned: false,
        isForwarded: false,
        timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
      },
      unreadCount: 1,
      isPinned: false,
      isStarred: false,
      isArchived: false,
      isResolved: false,
      isMuted: false,
      pinnedMessages: [],
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    },
    {
      id: 'conv-2',
      recipientId: 'teacher-1',
      recipientName: 'Prof. Ahmad Khan',
      recipientRole: 'teacher',
      recipientAvatar: undefined,
      lastMessage: {
        id: 'msg-2',
        conversationId: 'conv-2',
        senderId: 'office-1',
        senderName: 'Office Admin',
        senderRole: 'office',
        content: 'Please submit the attendance report by Friday.',
        category: 'administrative',
        priority: 'important',
        status: 'delivered',
        attachments: [],
        reactions: [],
        isPinned: false,
        isForwarded: false,
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      },
      unreadCount: 0,
      isPinned: false,
      isStarred: true,
      isArchived: false,
      isResolved: false,
      isMuted: false,
      pinnedMessages: [],
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    },
    {
      id: 'conv-3',
      recipientId: 'student-2',
      recipientName: 'Fatima Ahmadi',
      recipientRole: 'student',
      recipientAvatar: undefined,
      lastMessage: {
        id: 'msg-3',
        conversationId: 'conv-3',
        senderId: 'student-2',
        senderName: 'Fatima Ahmadi',
        senderRole: 'student',
        content: 'Thank you for your help!',
        category: 'general',
        priority: 'normal',
        status: 'read',
        attachments: [],
        reactions: [],
        isPinned: false,
        isForwarded: false,
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      },
      unreadCount: 0,
      isPinned: false,
      isStarred: false,
      isArchived: false,
      isResolved: true,
      isMuted: false,
      pinnedMessages: [],
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    },
  ];

  // Create sample messages for each conversation
  mockMessages = {
    'conv-1': [
      {
        id: 'msg-1-1',
        conversationId: 'conv-1',
        senderId: 'office-1',
        senderName: 'Office Admin',
        senderRole: 'office',
        content: 'Hello! How can I help you today?',
        category: 'general',
        priority: 'normal',
        status: 'read',
        attachments: [],
        reactions: [],
        isPinned: false,
        isForwarded: false,
        timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
      {
        id: 'msg-1',
        conversationId: 'conv-1',
        senderId: 'student-1',
        senderName: 'مسعود اندیوال',
        senderRole: 'student',
        content: "Hi Ser , I can't come today ...",
        category: 'general',
        priority: 'normal',
        status: 'read',
        attachments: [],
        reactions: [],
        isPinned: false,
        isForwarded: false,
        timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      },
    ],
    'conv-2': [
      {
        id: 'msg-2-1',
        conversationId: 'conv-2',
        senderId: 'teacher-1',
        senderName: 'Prof. Ahmad Khan',
        senderRole: 'teacher',
        content: 'Good morning! I have a question about the schedule.',
        category: 'general',
        priority: 'normal',
        status: 'read',
        attachments: [],
        reactions: [],
        isPinned: false,
        isForwarded: false,
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
      },
      {
        id: 'msg-2',
        conversationId: 'conv-2',
        senderId: 'office-1',
        senderName: 'Office Admin',
        senderRole: 'office',
        content: 'Please submit the attendance report by Friday.',
        category: 'administrative',
        priority: 'important',
        status: 'delivered',
        attachments: [],
        reactions: [],
        isPinned: false,
        isForwarded: false,
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      },
    ],
    'conv-3': [
      {
        id: 'msg-3-1',
        conversationId: 'conv-3',
        senderId: 'office-1',
        senderName: 'Office Admin',
        senderRole: 'office',
        content: 'Your attendance has been updated.',
        category: 'attendance_alert',
        priority: 'normal',
        status: 'read',
        attachments: [],
        reactions: [],
        isPinned: false,
        isForwarded: false,
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        id: 'msg-3',
        conversationId: 'conv-3',
        senderId: 'student-2',
        senderName: 'Fatima Ahmadi',
        senderRole: 'student',
        content: 'Thank you for your help!',
        category: 'general',
        priority: 'normal',
        status: 'read',
        attachments: [],
        reactions: [],
        isPinned: false,
        isForwarded: false,
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
    ],
  };

  // Create sample templates
  mockTemplates = [
    {
      id: 'template-1',
      name: 'Welcome Message',
      content: 'Welcome to our university! We are glad to have you here.',
      category: 'general',
      variables: [],
      usageCount: 45,
    },
    {
      id: 'template-2',
      name: 'Attendance Alert',
      content: 'Your attendance is below the required threshold. Please contact the office.',
      category: 'attendance_alert',
      variables: [],
      usageCount: 32,
    },
    {
      id: 'template-3',
      name: 'Schedule Change',
      content: 'There has been a change in the class schedule. Please check the updated schedule.',
      category: 'schedule_change',
      variables: [],
      usageCount: 28,
    },
  ];
}

/**
 * Mock Messaging Service Class
 */
export class MockMessagingService {
  constructor() {
    initializeMockData();
  }

  setCurrentUser(user: User) {
    currentUser = user;
  }

  getCurrentUser(): User {
    if (!currentUser) {
      throw new Error('No user set. Call setCurrentUser first.');
    }
    return currentUser;
  }

  // Conversations
  async getConversations(filters?: SearchFilters, sortBy: SortOption = 'recent'): Promise<Conversation[]> {
    await this.simulateDelay();
    
    let filtered = [...mockConversations];

    // Apply filters
    if (filters?.userType && filters.userType !== 'all') {
      filtered = filtered.filter(conv => conv.recipientRole === filters.userType);
    }

    if (filters?.status) {
      if (filters.status === 'unread') {
        filtered = filtered.filter(conv => conv.unreadCount > 0);
      } else if (filters.status === 'read') {
        filtered = filtered.filter(conv => conv.unreadCount === 0);
      } else if (filters.status === 'archived') {
        filtered = filtered.filter(conv => conv.isArchived);
      } else if (filters.status === 'resolved') {
        filtered = filtered.filter(conv => conv.isResolved);
      }
    }

    if (filters?.starred) {
      filtered = filtered.filter(conv => conv.isStarred);
    }

    // Apply sorting
    switch (sortBy) {
      case 'recent':
        filtered.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
        break;
      case 'unread_first':
        filtered.sort((a, b) => b.unreadCount - a.unreadCount);
        break;
      case 'alphabetical':
        filtered.sort((a, b) => a.recipientName.localeCompare(b.recipientName));
        break;
    }

    return filtered;
  }

  async getConversation(conversationId: string): Promise<Conversation> {
    await this.simulateDelay();
    const conv = mockConversations.find(c => c.id === conversationId);
    if (!conv) {
      throw new Error('Conversation not found');
    }
    return conv;
  }

  async createConversation(recipientId: string, recipientRole: 'student' | 'teacher'): Promise<string> {
    await this.simulateDelay();
    
    // Fetch the recipient's actual name from the database
    let recipientName = `User ${recipientId}`;
    try {
      if (recipientRole === 'student') {
        const { data: student } = await supabase
          .from('students')
          .select('first_name, last_name')
          .eq('id', recipientId)
          .single();
        
        if (student) {
          recipientName = `${student.first_name} ${student.last_name}`;
        }
      } else if (recipientRole === 'teacher') {
        const { data: teacher } = await supabase
          .from('teachers')
          .select('first_name, last_name')
          .eq('id', recipientId)
          .single();
        
        if (teacher) {
          recipientName = `${teacher.first_name} ${teacher.last_name}`;
        }
      }
    } catch (error) {
      console.error('Error fetching recipient name:', error);
    }
    
    const newId = `conv-${Date.now()}`;
    const newConv: Conversation = {
      id: newId,
      recipientId,
      recipientName,
      recipientRole,
      recipientAvatar: undefined,
      lastMessage: {
        id: `msg-${Date.now()}`,
        conversationId: newId,
        senderId: currentUser!.id,
        senderName: currentUser!.name,
        senderRole: currentUser!.role,
        content: '',
        category: 'general',
        priority: 'normal',
        status: 'sent',
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
    mockConversations.unshift(newConv);
    mockMessages[newId] = [];
    return newId;
  }

  // Messages
  async getMessages(conversationId: string, limit: number = 50, offset: number = 0): Promise<Message[]> {
    await this.simulateDelay();
    const messages = mockMessages[conversationId] || [];
    return messages.slice(offset, offset + limit);
  }

  async sendMessage(request: SendMessageRequest): Promise<Message> {
    await this.simulateDelay();
    
    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      conversationId: request.conversationId || '',
      senderId: currentUser!.id,
      senderName: currentUser!.name,
      senderRole: currentUser!.role,
      content: request.content,
      category: request.category,
      priority: request.priority,
      status: 'sent',
      attachments: request.attachments || [],
      reactions: [],
      isPinned: false,
      isForwarded: false,
      timestamp: new Date(),
    };

    if (request.conversationId) {
      if (!mockMessages[request.conversationId]) {
        mockMessages[request.conversationId] = [];
      }
      mockMessages[request.conversationId].push(newMessage);

      // Update conversation
      const conv = mockConversations.find(c => c.id === request.conversationId);
      if (conv) {
        conv.lastMessage = newMessage;
        conv.updatedAt = new Date();
      }
    }

    return newMessage;
  }

  async sendBroadcast(request: SendBroadcastRequest): Promise<BroadcastMessage> {
    await this.simulateDelay();
    
    const broadcast: BroadcastMessage = {
      id: `broadcast-${Date.now()}`,
      senderId: currentUser!.id,
      content: request.content,
      category: request.category,
      priority: request.priority,
      attachments: request.attachments || [],
      criteria: request.criteria,
      recipientCount: 10, // Mock count
      deliveredCount: 8,
      readCount: 5,
      failedCount: 2,
      failedRecipients: [],
      timestamp: new Date(),
    };

    return broadcast;
  }

  // Conversation actions
  async markAsRead(conversationId: string): Promise<void> {
    await this.simulateDelay();
    const conv = mockConversations.find(c => c.id === conversationId);
    if (conv) {
      conv.unreadCount = 0;
    }
  }

  async markAsUnread(conversationId: string): Promise<void> {
    await this.simulateDelay();
    const conv = mockConversations.find(c => c.id === conversationId);
    if (conv) {
      conv.unreadCount = 1;
    }
  }

  async pinConversation(conversationId: string): Promise<void> {
    await this.simulateDelay();
    const conv = mockConversations.find(c => c.id === conversationId);
    if (conv) {
      conv.isPinned = true;
    }
  }

  async unpinConversation(conversationId: string): Promise<void> {
    await this.simulateDelay();
    const conv = mockConversations.find(c => c.id === conversationId);
    if (conv) {
      conv.isPinned = false;
    }
  }

  async starConversation(conversationId: string): Promise<void> {
    await this.simulateDelay();
    const conv = mockConversations.find(c => c.id === conversationId);
    if (conv) {
      conv.isStarred = true;
    }
  }

  async unstarConversation(conversationId: string): Promise<void> {
    await this.simulateDelay();
    const conv = mockConversations.find(c => c.id === conversationId);
    if (conv) {
      conv.isStarred = false;
    }
  }

  async archiveConversation(conversationId: string): Promise<void> {
    await this.simulateDelay();
    const conv = mockConversations.find(c => c.id === conversationId);
    if (conv) {
      conv.isArchived = true;
    }
  }

  async unarchiveConversation(conversationId: string): Promise<void> {
    await this.simulateDelay();
    const conv = mockConversations.find(c => c.id === conversationId);
    if (conv) {
      conv.isArchived = false;
    }
  }

  async resolveConversation(conversationId: string): Promise<void> {
    await this.simulateDelay();
    const conv = mockConversations.find(c => c.id === conversationId);
    if (conv) {
      conv.isResolved = true;
    }
  }

  async unresolveConversation(conversationId: string): Promise<void> {
    await this.simulateDelay();
    const conv = mockConversations.find(c => c.id === conversationId);
    if (conv) {
      conv.isResolved = false;
    }
  }

  async muteConversation(conversationId: string): Promise<void> {
    await this.simulateDelay();
    const conv = mockConversations.find(c => c.id === conversationId);
    if (conv) {
      conv.isMuted = true;
    }
  }

  async unmuteConversation(conversationId: string): Promise<void> {
    await this.simulateDelay();
    const conv = mockConversations.find(c => c.id === conversationId);
    if (conv) {
      conv.isMuted = false;
    }
  }

  // Message actions
  async pinMessage(messageId: string, conversationId: string): Promise<void> {
    await this.simulateDelay();
    const messages = mockMessages[conversationId];
    if (messages) {
      const msg = messages.find(m => m.id === messageId);
      if (msg) {
        msg.isPinned = true;
      }
    }
  }

  async unpinMessage(messageId: string): Promise<void> {
    await this.simulateDelay();
    Object.values(mockMessages).forEach(messages => {
      const msg = messages.find(m => m.id === messageId);
      if (msg) {
        msg.isPinned = false;
      }
    });
  }

  async addReaction(messageId: string, reaction: ReactionType): Promise<void> {
    await this.simulateDelay();
    // Implementation would add reaction to message
  }

  async removeReaction(messageId: string, reaction: ReactionType): Promise<void> {
    await this.simulateDelay();
    // Implementation would remove reaction from message
  }

  async forwardMessage(request: ForwardMessageRequest): Promise<void> {
    await this.simulateDelay();
    // Implementation would forward message
  }

  async scheduleMessage(request: ScheduleMessageRequest): Promise<ScheduledMessage> {
    await this.simulateDelay();
    const scheduled: ScheduledMessage = {
      id: `scheduled-${Date.now()}`,
      draft: {
        content: request.content,
        category: request.category,
        priority: request.priority,
        attachments: [],
      },
      conversationId: request.conversationId || '',
      recipientId: request.recipientId || '',
      scheduledFor: request.scheduledFor,
      status: 'pending',
      createdAt: new Date(),
    };
    mockScheduledMessages.push(scheduled);
    return scheduled;
  }

  async cancelScheduledMessage(messageId: string): Promise<void> {
    await this.simulateDelay();
    const index = mockScheduledMessages.findIndex(m => m.id === messageId);
    if (index !== -1) {
      mockScheduledMessages.splice(index, 1);
    }
  }

  async getScheduledMessages(): Promise<ScheduledMessage[]> {
    await this.simulateDelay();
    return mockScheduledMessages;
  }

  // Templates
  async getTemplates(): Promise<MessageTemplate[]> {
    await this.simulateDelay();
    return mockTemplates;
  }

  // Utility
  private async simulateDelay(ms: number = 300): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Export singleton instance
export const mockMessagingService = new MockMessagingService();
