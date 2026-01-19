# Messaging System Custom Hooks

This directory contains all custom React hooks for the Office User Dashboard Messaging System.

## Available Hooks

### Core Hooks
- **useMessaging**: Main hook for accessing messaging context and actions
- **useConversation**: Hook for managing a single conversation
- **useRealTimeUpdates**: WebSocket connection management

### Feature Hooks
- **useNotifications**: Notification management and settings
- **useLanguage**: Language and text direction management
- **useFileUpload**: File upload with progress tracking
- **useMessageTemplates**: Template management and insertion
- **useVirtualScroll**: Virtual scrolling for performance
- **useKeyboardShortcuts**: Keyboard shortcut registration and handling

## File Organization

```
hooks/messaging/
├── useMessaging.ts              # Main messaging hook
├── useConversation.ts           # Single conversation management
├── useRealTimeUpdates.ts        # WebSocket connection
├── useNotifications.ts          # Notification management
├── useLanguage.ts               # Language and RTL/LTR
├── useFileUpload.ts             # File upload with progress
├── useMessageTemplates.ts       # Template management
├── useVirtualScroll.ts          # Virtual scrolling
├── useKeyboardShortcuts.ts      # Keyboard shortcuts
├── index.ts                     # Re-exports all hooks
└── README.md                    # This file
```

## Usage Example

```typescript
import { useMessaging, useConversation } from '@/hooks/messaging';

function MessageView({ conversationId }: { conversationId: string }) {
  const { conversations, selectedConversationId } = useMessaging();
  const { conversation, messages, sendMessage, loadMore } = useConversation(conversationId);
  
  // Use the hooks...
}
```

## Hook Patterns

All hooks follow these patterns:

1. **Return Objects**: Hooks return objects with named properties for clarity
2. **Loading States**: Include `isLoading` and `error` states where applicable
3. **Optimistic Updates**: Implement optimistic UI updates for better UX
4. **Error Handling**: Graceful error handling with user-friendly messages
5. **TypeScript**: Fully typed with strict mode enabled

## Related Documentation

- Design Document: `.kiro/specs/office-messaging-system/design.md`
- State Management: See MessagingContext in the design document
