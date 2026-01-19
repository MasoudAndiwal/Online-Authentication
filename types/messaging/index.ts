/**
 * Office User Dashboard Messaging System - Type Definitions
 * 
 * This file contains all TypeScript interfaces and types for the messaging system.
 * These types are based on the design document and cover all data models needed
 * for the comprehensive messaging interface.
 * 
 * Requirements covered: 1.1, 1.4, 1.5, 2.1, 2.2, 2.5, 3.1, 3.2, 5.1, 5.2, 5.3, 5.4, 5.5
 */

// ============================================================================
// User Types
// ============================================================================

/**
 * User role in the system
 * - student: University student
 * - teacher: University faculty member
 * - office: Administrative staff member
 */
export type UserRole = 'student' | 'teacher' | 'office';

/**
 * User entity representing any user in the system
 */
export interface User {
  /** Unique identifier for the user */
  id: string;
  /** Full name of the user */
  name: string;
  /** Role of the user in the system */
  role: UserRole;
  /** Optional avatar URL */
  avatar?: string;
  /** Department (for teachers) */
  department?: string;
  /** Class name (for students) */
  class?: string;
  /** Session/semester (for students) */
  session?: string;
}

// ============================================================================
// Message Types
// ============================================================================

/**
 * Message category classification
 * Requirement 2.1: Six categories for message classification
 */
export type MessageCategory = 
  | 'administrative'
  | 'attendance_alert'
  | 'schedule_change'
  | 'announcement'
  | 'general'
  | 'urgent';

/**
 * Priority level for messages
 * Requirement 2.2: Three priority levels
 */
export type PriorityLevel = 'normal' | 'important' | 'urgent';

/**
 * Delivery status of a message
 * Requirement 5.1, 5.2, 5.3, 5.4: Message delivery tracking
 */
export type DeliveryStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed';

/**
 * Reaction types for messages
 * Requirement 27.1: Professional reaction types (no emojis)
 */
export type ReactionType = 'acknowledge' | 'important' | 'agree' | 'question' | 'urgent';

/**
 * Reaction on a message
 */
export interface Reaction {
  /** Type of reaction */
  type: ReactionType;
  /** ID of user who reacted */
  userId: string;
  /** Name of user who reacted */
  userName: string;
  /** When the reaction was added */
  timestamp: Date;
}

/**
 * File attachment associated with a message
 * Requirement 3.1, 3.2: File attachment support
 */
export interface Attachment {
  /** Unique identifier for the attachment */
  id: string;
  /** Original filename */
  name: string;
  /** File size in bytes */
  size: number;
  /** MIME type of the file */
  type: string;
  /** URL to access the file */
  url: string;
  /** Optional thumbnail URL for images */
  thumbnailUrl?: string;
  /** Upload progress (0-100) during upload */
  uploadProgress?: number;
}

/**
 * Message entity
 * Requirement 1.1, 1.4, 1.5: Direct messaging with metadata
 */
export interface Message {
  /** Unique identifier for the message */
  id: string;
  /** ID of the conversation this message belongs to */
  conversationId: string;
  /** ID of the user who sent the message */
  senderId: string;
  /** Name of the sender */
  senderName: string;
  /** Role of the sender */
  senderRole: UserRole;
  /** Message content/text */
  content: string;
  /** Category of the message */
  category: MessageCategory;
  /** Priority level of the message */
  priority: PriorityLevel;
  /** Current delivery status */
  status: DeliveryStatus;
  /** Array of file attachments */
  attachments: Attachment[];
  /** Array of reactions to this message */
  reactions: Reaction[];
  /** Whether this message is pinned in the conversation */
  isPinned: boolean;
  /** Whether this message was forwarded */
  isForwarded: boolean;
  /** Original sender info if message was forwarded */
  forwardedFrom?: {
    senderId: string;
    senderName: string;
  };
  /** ID of message this is replying to */
  replyTo?: string;
  /** When the message was sent */
  timestamp: Date;
  /** When the message was read by recipient */
  readAt?: Date;
  /** When the message was delivered to recipient's device */
  deliveredAt?: Date;
}

/**
 * Draft message being composed
 */
export interface MessageDraft {
  /** Message content */
  content: string;
  /** Category of the message */
  category: MessageCategory;
  /** Priority level */
  priority: PriorityLevel;
  /** Files to attach */
  attachments: File[];
  /** Optional scheduled delivery time */
  scheduledFor?: Date;
  /** Optional template ID if using a template */
  templateId?: string;
}

// ============================================================================
// Conversation Types
// ============================================================================

/**
 * Conversation entity representing a message thread
 * Requirement 1.1, 1.4, 1.5: Conversation management
 */
export interface Conversation {
  /** Unique identifier for the conversation */
  id: string;
  /** ID of the recipient (student or teacher) */
  recipientId: string;
  /** Name of the recipient */
  recipientName: string;
  /** Role of the recipient */
  recipientRole: UserRole;
  /** Optional avatar URL for recipient */
  recipientAvatar?: string;
  /** The most recent message in the conversation */
  lastMessage: Message;
  /** Number of unread messages */
  unreadCount: number;
  /** Whether conversation is pinned to top */
  isPinned: boolean;
  /** Whether conversation is starred */
  isStarred: boolean;
  /** Whether conversation is archived */
  isArchived: boolean;
  /** Whether conversation is marked as resolved */
  isResolved: boolean;
  /** Whether notifications are muted for this conversation */
  isMuted: boolean;
  /** Array of pinned messages in this conversation */
  pinnedMessages: Message[];
  /** When the conversation was created */
  createdAt: Date;
  /** When the conversation was last updated */
  updatedAt: Date;
}

// ============================================================================
// Broadcast Types
// ============================================================================

/**
 * Criteria for selecting broadcast recipients
 * Requirement 11.1, 11.2, 11.3: Broadcast message targeting
 */
export interface BroadcastCriteria {
  /** Type of broadcast */
  type: 'all_students' | 'specific_class' | 'all_teachers' | 'specific_department';
  /** Class name (for specific_class type) */
  className?: string;
  /** Session/semester (for specific_class type) */
  session?: string;
  /** Department name (for specific_department type) */
  department?: string;
  /** Subject name (for specific_department type) */
  subject?: string;
}

/**
 * Broadcast message sent to multiple recipients
 * Requirement 11.4, 11.5, 12.1, 12.2, 12.3, 12.4, 12.5: Broadcast messaging and tracking
 */
export interface BroadcastMessage {
  /** Unique identifier for the broadcast */
  id: string;
  /** ID of the office user who sent the broadcast */
  senderId: string;
  /** Message content */
  content: string;
  /** Category of the message */
  category: MessageCategory;
  /** Priority level */
  priority: PriorityLevel;
  /** Array of file attachments */
  attachments: Attachment[];
  /** Criteria used to select recipients */
  criteria: BroadcastCriteria;
  /** Total number of recipients */
  recipientCount: number;
  /** Number of successfully delivered messages */
  deliveredCount: number;
  /** Number of messages that have been read */
  readCount: number;
  /** Number of failed deliveries */
  failedCount: number;
  /** Array of recipient IDs where delivery failed */
  failedRecipients: string[];
  /** When the broadcast was sent */
  timestamp: Date;
}

// ============================================================================
// Template Types
// ============================================================================

/**
 * Pre-defined message template
 * Requirement 4.1, 4.2, 4.3, 4.4, 4.5: Message templates
 */
export interface MessageTemplate {
  /** Unique identifier for the template */
  id: string;
  /** Template name/title */
  name: string;
  /** Template content with variable placeholders */
  content: string;
  /** Default category for messages using this template */
  category: MessageCategory;
  /** Array of variable names used in the template (e.g., ['recipientName', 'date']) */
  variables: string[];
  /** Number of times this template has been used */
  usageCount: number;
}

// ============================================================================
// Search and Filter Types
// ============================================================================

/**
 * Filters for searching and filtering conversations
 * Requirement 8.1, 8.2, 8.3, 8.4, 8.5, 8.6: Search and filter capabilities
 */
export interface SearchFilters {
  /** Filter by user type */
  userType?: 'student' | 'teacher' | 'all';
  /** Filter by date range */
  dateRange?: {
    start: Date;
    end: Date;
  };
  /** Filter by message categories */
  categories?: MessageCategory[];
  /** Filter by conversation status */
  status?: 'all' | 'unread' | 'read' | 'resolved' | 'archived';
  /** Filter by priority level */
  priority?: PriorityLevel | 'all';
  /** Filter to show only starred conversations */
  starred?: boolean;
}

/**
 * Sort options for conversation list
 * Requirement 10.1, 10.2, 10.3, 10.4, 10.5: Conversation sorting
 */
export type SortOption = 'recent' | 'unread_first' | 'priority' | 'alphabetical';

// ============================================================================
// Notification Types
// ============================================================================

/**
 * Notification entity
 * Requirement 16.1, 16.2, 16.3, 16.4: Notification system
 */
export interface Notification {
  /** Unique identifier for the notification */
  id: string;
  /** Type of notification */
  type: 'new_message' | 'message_read' | 'broadcast_complete' | 'delivery_failed';
  /** ID of related conversation (if applicable) */
  conversationId?: string;
  /** ID of sender (if applicable) */
  senderId?: string;
  /** Name of sender (if applicable) */
  senderName?: string;
  /** Notification message/content */
  message?: string;
  /** When the notification was created */
  timestamp: Date;
  /** Whether the notification has been read */
  isRead: boolean;
  /** Priority level of the notification */
  priority: PriorityLevel;
}

/**
 * Notification settings for the user
 * Requirement 16.5, 29.1, 29.2, 29.3, 29.4, 29.5, 29.6, 29.7, 29.8: Smart notifications
 */
export interface NotificationSettings {
  /** Whether notifications are enabled */
  enabled: boolean;
  /** Sound preference for notifications */
  sound: 'default' | 'subtle' | 'silent';
  /** Preview level for notifications */
  preview: 'full' | 'sender_only' | 'count_only';
  /** Quiet hours configuration */
  quietHours?: {
    enabled: boolean;
    /** Start time in HH:mm format */
    start: string;
    /** End time in HH:mm format */
    end: string;
  };
  /** Whether to group multiple notifications */
  grouping: boolean;
  /** Whether to show browser notifications */
  browserNotifications: boolean;
}

// ============================================================================
// Real-time Types
// ============================================================================

/**
 * Typing indicator showing someone is composing a message
 * Requirement 13.1, 13.2, 13.3, 13.4, 13.5: Typing indicators
 */
export interface TypingIndicator {
  /** ID of the conversation */
  conversationId: string;
  /** ID of the user who is typing */
  userId: string;
  /** Name of the user who is typing */
  userName: string;
  /** When the typing started */
  timestamp: Date;
}

// ============================================================================
// Scheduled Message Types
// ============================================================================

/**
 * Message scheduled for future delivery
 * Requirement 15.1, 15.2, 15.3, 15.4, 15.5: Message scheduling
 */
export interface ScheduledMessage {
  /** Unique identifier for the scheduled message */
  id: string;
  /** The message draft to be sent */
  draft: MessageDraft;
  /** ID of the conversation to send to */
  conversationId: string;
  /** ID of the recipient */
  recipientId: string;
  /** When the message should be sent */
  scheduledFor: Date;
  /** Current status of the scheduled message */
  status: 'pending' | 'sent' | 'cancelled';
  /** When the scheduled message was created */
  createdAt: Date;
}

// ============================================================================
// Language and Internationalization Types
// ============================================================================

/**
 * Supported languages
 * Requirement 25.1: Multi-language support
 */
export type Language = 'en' | 'fa' | 'ps'; // English, Dari (Farsi), Pashto

/**
 * Text direction for language
 * Requirement 25.2, 25.3: RTL/LTR support
 */
export type TextDirection = 'ltr' | 'rtl';

/**
 * Language settings for the user
 * Requirement 25.4, 25.5: Language preferences
 */
export interface LanguageSettings {
  /** Selected language */
  language: Language;
  /** Text direction based on language */
  direction: TextDirection;
}

// ============================================================================
// Keyboard Shortcut Types
// ============================================================================

/**
 * Keyboard shortcut definition
 * Requirement 26.1-26.12: Keyboard shortcuts
 */
export interface KeyboardShortcut {
  /** Unique identifier for the shortcut */
  id: string;
  /** Name of the action */
  name: string;
  /** Description of what the shortcut does */
  description: string;
  /** Array of keys (e.g., ['Ctrl', 'N'] or ['Cmd', 'N']) */
  keys: string[];
  /** Category for grouping shortcuts */
  category: 'navigation' | 'actions' | 'composition';
  /** Function to execute when shortcut is triggered */
  action: () => void;
}

// ============================================================================
// UI State Types
// ============================================================================

/**
 * Loading state for async operations
 */
export interface LoadingState {
  /** Whether an operation is in progress */
  isLoading: boolean;
  /** Error message if operation failed */
  error: string | null;
}

/**
 * Pagination state for message history
 */
export interface PaginationState {
  /** Current offset/page */
  offset: number;
  /** Number of items per page */
  limit: number;
  /** Whether there are more items to load */
  hasMore: boolean;
}

/**
 * Connection state for real-time updates
 */
export interface ConnectionState {
  /** Whether WebSocket is connected */
  isConnected: boolean;
  /** Whether currently attempting to reconnect */
  isReconnecting: boolean;
  /** Last connection error */
  lastError?: string;
}

// ============================================================================
// Context State Types
// ============================================================================

/**
 * Main messaging context state
 * This represents the complete state managed by the MessagingContext
 */
export interface MessagingContextState {
  // Conversations
  /** Array of all conversations */
  conversations: Conversation[];
  /** ID of currently selected conversation */
  selectedConversationId: string | null;
  
  // Messages
  /** Map of conversation ID to array of messages */
  messages: Record<string, Message[]>;
  
  // UI State
  /** Whether data is being loaded */
  isLoading: boolean;
  /** Current error message if any */
  error: string | null;
  
  // Search and Filters
  /** Current search query */
  searchQuery: string;
  /** Active filters */
  filters: SearchFilters;
  /** Current sort option */
  sortBy: SortOption;
  
  // Real-time
  /** Map of conversation ID to typing indicator */
  typingIndicators: Record<string, TypingIndicator>;
  
  // Notifications
  /** Array of notifications */
  notifications: Notification[];
  /** Total unread message count */
  unreadCount: number;
  /** Notification settings */
  notificationSettings: NotificationSettings;
  
  // Language
  /** Language settings */
  languageSettings: LanguageSettings;
  
  // Actions
  /** Send a message in a conversation */
  sendMessage: (conversationId: string, draft: MessageDraft) => Promise<void>;
  /** Send a broadcast message */
  sendBroadcast: (broadcast: BroadcastMessage) => Promise<void>;
  /** Load all conversations */
  loadConversations: () => Promise<void>;
  /** Load messages for a specific conversation */
  loadMessages: (conversationId: string) => Promise<void>;
  /** Select a conversation */
  selectConversation: (id: string) => void;
  /** Search conversations */
  searchConversations: (query: string) => void;
  /** Apply filters to conversation list */
  applyFilters: (filters: SearchFilters) => void;
  /** Set sort option */
  setSortBy: (sort: SortOption) => void;
  /** Mark conversation as read */
  markAsRead: (conversationId: string) => Promise<void>;
  /** Mark conversation as unread */
  markAsUnread: (conversationId: string) => Promise<void>;
  /** Pin/unpin a conversation */
  pinConversation: (conversationId: string) => Promise<void>;
  /** Star/unstar a conversation */
  starConversation: (conversationId: string) => Promise<void>;
  /** Archive a conversation */
  archiveConversation: (conversationId: string) => Promise<void>;
  /** Resolve a conversation */
  resolveConversation: (conversationId: string) => Promise<void>;
  /** Pin/unpin a message */
  pinMessage: (messageId: string) => Promise<void>;
  /** Add a reaction to a message */
  addReaction: (messageId: string, reaction: ReactionType) => Promise<void>;
  /** Forward a message to another conversation */
  forwardMessage: (messageId: string, recipientId: string) => Promise<void>;
  /** Schedule a message for later delivery */
  scheduleMessage: (conversationId: string, draft: MessageDraft, scheduledFor: Date) => Promise<void>;
  /** Update notification settings */
  updateNotificationSettings: (settings: NotificationSettings) => Promise<void>;
  /** Change language */
  setLanguage: (language: Language) => void;
}

// ============================================================================
// Export all types
// ============================================================================

export type {
  // Re-export all types for convenience
  User,
  Message,
  MessageDraft,
  Conversation,
  Attachment,
  Reaction,
  BroadcastMessage,
  BroadcastCriteria,
  MessageTemplate,
  SearchFilters,
  Notification,
  NotificationSettings,
  TypingIndicator,
  ScheduledMessage,
  LanguageSettings,
  KeyboardShortcut,
  LoadingState,
  PaginationState,
  ConnectionState,
  MessagingContextState,
};
