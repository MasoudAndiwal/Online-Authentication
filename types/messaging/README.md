# Messaging System Type Definitions

This directory contains all TypeScript type definitions for the Office User Dashboard Messaging System.

## Type Categories

### Core Types
- **User Types**: User, UserRole
- **Message Types**: Message, MessageDraft, MessageCategory, PriorityLevel, DeliveryStatus
- **Conversation Types**: Conversation
- **Attachment Types**: Attachment
- **Reaction Types**: Reaction, ReactionType

### Feature Types
- **Broadcast Types**: BroadcastMessage, BroadcastCriteria
- **Template Types**: MessageTemplate
- **Notification Types**: Notification, NotificationSettings
- **Scheduled Message Types**: ScheduledMessage
- **Typing Indicator Types**: TypingIndicator

### UI Types
- **Search and Filter Types**: SearchFilters, SortOption
- **Language Types**: Language, TextDirection, LanguageSettings
- **Keyboard Shortcut Types**: KeyboardShortcut

## File Organization

```
types/messaging/
├── core.ts              # Core data types (User, Message, Conversation)
├── features.ts          # Feature-specific types (Broadcast, Templates, etc.)
├── ui.ts                # UI-related types (Search, Filters, Language)
├── index.ts             # Re-exports all types
└── README.md            # This file
```

## Type Safety

All types are strictly typed with TypeScript's strict mode enabled. This ensures:

- No implicit `any` types
- Strict null checks
- Strict function types
- Strict property initialization

## Usage Example

```typescript
import { Message, Conversation, MessageCategory, PriorityLevel } from '@/types/messaging';

const message: Message = {
  id: '123',
  conversationId: 'conv-456',
  senderId: 'user-789',
  senderName: 'John Doe',
  senderRole: 'office',
  content: 'Hello, this is a test message',
  category: 'general',
  priority: 'normal',
  status: 'sent',
  attachments: [],
  reactions: [],
  isPinned: false,
  isForwarded: false,
  timestamp: new Date(),
};
```

## Related Documentation

- Design Document: `.kiro/specs/office-messaging-system/design.md`
- Requirements: `.kiro/specs/office-messaging-system/requirements.md`
