/**
 * Office Messaging Services
 * 
 * Export all messaging-related services for office users
 */

export { 
  OfficeMessagingService, 
  officeMessagingService 
} from './messaging-service';

export { 
  WebSocketManager, 
  createWebSocketManager, 
  defaultWebSocketManager,
  type ConnectionState,
  type WebSocketConfig,
  type WebSocketEventHandlers,
} from './websocket-manager';

// Re-export types for convenience
export type {
  User,
  UserRole,
  Message,
  MessageDraft,
  Conversation,
  BroadcastMessage,
  BroadcastCriteria,
  MessageTemplate,
  SearchFilters,
  SortOption,
  Attachment,
  ReactionType,
  Reaction,
  ScheduledMessage,
  SendMessageRequest,
  SendBroadcastRequest,
  ScheduleMessageRequest,
  ForwardMessageRequest,
  MessageCategory,
  PriorityLevel,
  DeliveryStatus,
  Notification,
  NotificationSettings,
  TypingIndicator,
  Language,
  TextDirection,
  LanguageSettings,
  KeyboardShortcut,
} from '@/types/office/messaging';
