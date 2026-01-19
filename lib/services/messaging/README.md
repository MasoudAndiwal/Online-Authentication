# Messaging Service Layer

This directory contains the service layer implementation for the Office User Dashboard Messaging System.

## Service Architecture

The service layer acts as an abstraction between the UI components and the backend API/WebSocket infrastructure. It handles:

- API calls to backend endpoints
- WebSocket connection management
- Data transformation and validation
- Error handling and retry logic
- Caching and optimization

## Files

```
lib/services/messaging/
├── messaging-service.ts         # Main messaging service class
├── websocket-service.ts         # WebSocket connection management
├── file-service.ts              # File upload/download handling
├── template-service.ts          # Template management
├── broadcast-service.ts         # Broadcast messaging
├── index.ts                     # Re-exports all services
└── README.md                    # This file
```

## MessagingService

The main service class that provides methods for:

### Conversation Management
- `getConversations(filters?: SearchFilters): Promise<Conversation[]>`
- `getConversation(id: string): Promise<Conversation>`
- `createConversation(recipientId: string): Promise<Conversation>`

### Message Operations
- `getMessages(conversationId: string, offset: number, limit: number): Promise<Message[]>`
- `sendMessage(conversationId: string, draft: MessageDraft): Promise<Message>`
- `sendBroadcast(broadcast: BroadcastMessage): Promise<BroadcastMessage>`
- `scheduleMessage(message: ScheduledMessage): Promise<ScheduledMessage>`

### Message Actions
- `markAsRead(conversationId: string): Promise<void>`
- `pinMessage(messageId: string): Promise<void>`
- `addReaction(messageId: string, reaction: ReactionType): Promise<void>`
- `forwardMessage(messageId: string, recipientId: string): Promise<Message>`

### Conversation Actions
- `pinConversation(conversationId: string): Promise<void>`
- `starConversation(conversationId: string): Promise<void>`
- `archiveConversation(conversationId: string): Promise<void>`
- `resolveConversation(conversationId: string): Promise<void>`

### File Handling
- `uploadAttachment(file: File): Promise<Attachment>`
- `downloadAttachment(attachmentId: string): Promise<Blob>`

### Real-Time (WebSocket)
- `connect(): void`
- `disconnect(): void`
- `onMessage(callback: (message: Message) => void): void`
- `onTyping(callback: (indicator: TypingIndicator) => void): void`
- `sendTypingIndicator(conversationId: string): void`

## Integration

The service layer integrates with:

1. **Existing Messaging Service**: `lib/services/messaging-service.ts`
2. **Existing File Storage**: For attachment handling
3. **Existing Authentication**: For user identification
4. **WebSocket Infrastructure**: For real-time updates

## Usage Example

```typescript
import { messagingService } from '@/lib/services/messaging';

// Send a message
const message = await messagingService.sendMessage('conv-123', {
  content: 'Hello!',
  category: 'general',
  priority: 'normal',
  attachments: [],
});

// Connect to WebSocket
messagingService.connect();
messagingService.onMessage((message) => {
  console.log('New message:', message);
});
```

## Error Handling

All service methods implement proper error handling:

- Network errors are caught and transformed into user-friendly messages
- Failed requests include retry logic where appropriate
- Validation errors are clearly communicated
- Loading states are properly managed

## Related Documentation

- Design Document: `.kiro/specs/office-messaging-system/design.md`
- Requirements: `.kiro/specs/office-messaging-system/requirements.md`
- Integration Requirements: Requirement 23
