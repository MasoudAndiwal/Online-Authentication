/**
 * Office Messaging System Types
 * 
 * Complete type definitions for the office user messaging system
 * including conversations, messages, attachments, reactions, templates, and more.
 */

// ============================================================================
// User Types
// ============================================================================

export type UserRole = 'student' | 'teacher' | 'office';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  avatar?: string;
  department?: string; // for teachers
  class?: string; // for students
  session?: string; // for students
}

// ============================================================================
// Message Types
// ============================================================================

export type MessageCategory = 
  | 'administrative' 
  | 'attendance_alert' 
  | 'schedule_change' 
  | 'announcement' 
  | 'general' 
  | 'urgent';

export type PriorityLevel = 'normal' | 'important' | 'urgent';

export type DeliveryStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed';

export type ReactionType = 'acknowledge' | 'important' | 'agree' | 'question' | 'urgent';

export interface Reaction {
  type: ReactionType;
  userId: string;
  userName: string;
  timestamp: Date;
}

export interface Attachment {
  id: string;
  name: string;
  size: number;
  type: string; // MIME type
  url: string;
  thumbnailUrl?: string;
  uploadProgress?: number;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  content: string;
  category: MessageCategory;
  priority: PriorityLevel;
  status: DeliveryStatus;
  attachments: Attachment[];
  reactions: Reaction[];
  isPinned: boolean;
  isForwarded: boolean;
  forwardedFrom?: {
    senderId: string;
    senderName: string;
  };
  replyTo?: string; // message ID
  timestamp: Date;
  readAt?: Date;
  deliveredAt?: Date;
}

export interface MessageDraft {
  content: string;
  category: MessageCategory;
  priority: PriorityLevel;
  attachments: File[];
  scheduledFor?: Date;
  templateId?: string;
}

// ============================================================================
// Conversation Types
// ============================================================================

export interface Conversation {
  id: string;
  recipientId: string;
  recipientName: string;
  recipientRole: UserRole;
  recipientAvatar?: string;
  lastMessage: Message;
  unreadCount: number;
  isPinned: boolean;
  isStarred: boolean;
  isArchived: boolean;
  isResolved: boolean;
  isMuted: boolean;
  pinnedMessages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// Broadcast Types
// ============================================================================

export interface BroadcastCriteria {
  type: 'all_students' | 'specific_class' | 'all_teachers' | 'specific_department';
  className?: string;
  session?: string;
  department?: string;
  subject?: string;
}

export interface BroadcastMessage {
  id: string;
  senderId: string;
  content: string;
  category: MessageCategory;
  priority: PriorityLevel;
  attachments: Attachment[];
  criteria: BroadcastCriteria;
  recipientCount: number;
  deliveredCount: number;
  readCount: number;
  failedCount: number;
  failedRecipients: string[];
  timestamp: Date;
}

// ============================================================================
// Template Types
// ============================================================================

export interface MessageTemplate {
  id: string;
  name: string;
  content: string;
  category: MessageCategory;
  variables: string[]; // e.g., ['recipientName', 'date']
  usageCount: number;
}

// ============================================================================
// Search and Filter Types
// ============================================================================

export interface SearchFilters {
  userType?: 'student' | 'teacher' | 'all';
  dateRange?: {
    start: Date;
    end: Date;
  };
  categories?: MessageCategory[];
  status?: 'all' | 'unread' | 'read' | 'resolved' | 'archived';
  priority?: PriorityLevel | 'all';
  starred?: boolean;
}

export type SortOption = 'recent' | 'unread_first' | 'priority' | 'alphabetical';

// ============================================================================
// Notification Types
// ============================================================================

export interface Notification {
  id: string;
  type: 'new_message' | 'message_read' | 'broadcast_complete' | 'delivery_failed';
  conversationId?: string;
  senderId?: string;
  senderName?: string;
  message?: string;
  timestamp: Date;
  isRead: boolean;
  priority: PriorityLevel;
}

export interface NotificationSettings {
  enabled: boolean;
  sound: 'default' | 'subtle' | 'silent';
  preview: 'full' | 'sender_only' | 'count_only';
  quietHours?: {
    enabled: boolean;
    start: string; // HH:mm format
    end: string;
  };
  grouping: boolean;
  browserNotifications: boolean;
}

// ============================================================================
// Typing Indicator Types
// ============================================================================

export interface TypingIndicator {
  conversationId: string;
  userId: string;
  userName: string;
  timestamp: Date;
}

// ============================================================================
// Scheduled Message Types
// ============================================================================

export interface ScheduledMessage {
  id: string;
  draft: MessageDraft;
  conversationId: string;
  recipientId: string;
  scheduledFor: Date;
  status: 'pending' | 'sent' | 'cancelled';
  createdAt: Date;
}

// ============================================================================
// Language and Direction Types
// ============================================================================

export type Language = 'en' | 'fa' | 'ps'; // English, Dari (Farsi), Pashto
export type TextDirection = 'ltr' | 'rtl';

export interface LanguageSettings {
  language: Language;
  direction: TextDirection;
}

// ============================================================================
// Keyboard Shortcut Types
// ============================================================================

export interface KeyboardShortcut {
  id: string;
  name: string;
  description: string;
  keys: string[]; // e.g., ['Ctrl', 'N'] or ['Cmd', 'N']
  category: 'navigation' | 'actions' | 'composition';
  action: () => void;
}

// ============================================================================
// API Request/Response Types
// ============================================================================

export interface SendMessageRequest {
  conversationId?: string;
  recipientId: string;
  recipientRole: UserRole;
  content: string;
  category: MessageCategory;
  priority: PriorityLevel;
  attachments?: File[];
  replyToId?: string;
}

export interface SendBroadcastRequest {
  criteria: BroadcastCriteria;
  content: string;
  category: MessageCategory;
  priority: PriorityLevel;
  attachments?: File[];
}

export interface ScheduleMessageRequest {
  conversationId: string;
  recipientId: string;
  draft: MessageDraft;
  scheduledFor: Date;
}

export interface ForwardMessageRequest {
  messageId: string;
  recipientId: string;
  recipientRole: UserRole;
  additionalContext?: string;
}

export interface PinMessageRequest {
  messageId: string;
  conversationId: string;
}

export interface AddReactionRequest {
  messageId: string;
  reactionType: ReactionType;
}

export interface ConversationActionRequest {
  conversationId: string;
  action: 'pin' | 'star' | 'archive' | 'resolve' | 'mute' | 'unpin' | 'unstar' | 'unarchive' | 'unresolve' | 'unmute';
}

export interface MarkAsReadRequest {
  conversationId: string;
}

export interface MarkAsUnreadRequest {
  conversationId: string;
}

export interface SearchMessagesRequest {
  query: string;
  filters?: SearchFilters;
  limit?: number;
  offset?: number;
}

export interface GetMessagesRequest {
  conversationId: string;
  limit?: number;
  offset?: number;
}

export interface GetConversationsRequest {
  filters?: SearchFilters;
  sortBy?: SortOption;
}

// ============================================================================
// WebSocket Event Types
// ============================================================================

export interface WebSocketMessage {
  type: 'new_message' | 'message_status' | 'typing_indicator' | 'reaction_added' | 'reaction_removed' | 'message_pinned' | 'message_unpinned';
  payload: unknown;
}

export interface NewMessageEvent {
  message: Message;
}

export interface MessageStatusEvent {
  messageId: string;
  status: DeliveryStatus;
  timestamp: Date;
}

export interface TypingIndicatorEvent {
  conversationId: string;
  userId: string;
  userName: string;
  isTyping: boolean;
}

export interface ReactionEvent {
  messageId: string;
  reaction: Reaction;
  action: 'added' | 'removed';
}

export interface MessagePinnedEvent {
  messageId: string;
  conversationId: string;
  isPinned: boolean;
}

// ============================================================================
// Error Types
// ============================================================================

export interface MessagingError {
  code: string;
  message: string;
  details?: unknown;
}

export class MessageSendError extends Error {
  constructor(message: string, public details?: unknown) {
    super(message);
    this.name = 'MessageSendError';
  }
}

export class FileUploadError extends Error {
  constructor(message: string, public details?: unknown) {
    super(message);
    this.name = 'FileUploadError';
  }
}

export class PermissionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PermissionError';
  }
}

export class ConnectionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConnectionError';
  }
}
