# Office Messaging Service

Comprehensive messaging service for office users in the university attendance management system.

## Overview

This implementation provides a complete messaging infrastructure for office users with support for:

- **Direct Messaging**: Send messages to students and teachers
- **Broadcast Messaging**: Send messages to groups (all students, specific class, all teachers, specific department)
- **Message Templates**: Pre-defined templates for common communications
- **File Attachments**: Upload and download files (up to 100MB)
- **Message Reactions**: Add professional reactions to messages
- **Message Pinning**: Pin important messages in conversations
- **Conversation Management**: Pin, star, archive, resolve, and mute conversations
- **Message Scheduling**: Schedule messages for later delivery
- **Search and Filtering**: Search messages and filter conversations
- **Real-Time Updates**: WebSocket-based real-time communication
- **Auto-Reconnection**: Automatic reconnection with exponential backoff

## Architecture

### Components

1. **Types** (`types/office/messaging/index.ts`)
   - Complete TypeScript type definitions
   - User, Message, Conversation, Broadcast, Template types
   - Request/Response types for API calls
   - WebSocket event types

2. **Messaging Service** (`lib/services/office/messaging/messaging-service.ts`)
   - Core messaging functionality
   - Conversation and message management
   - File upload/download
   - Broadcast messaging
   - Template management

3. **WebSocket Manager** (`lib/services/office/messaging/websocket-manager.ts`)
   - Real-time communication
   - Auto-reconnection with exponential backoff
   - Typing indicators
   - Message status updates
   - Connection state management

## Usage

### Initialize the Service

```typescript
import { officeMessagingService } from '@/lib/services/office/messaging';

// Set the current office user
officeMessagingService.setCurrentUser({
  id: 'office-123',
  name: 'Admin User',
  role: 'office',
});
```

### Send a Message

```typescript
const message = await officeMessagingService.sendMessage({
  recipientId: 'student-456',
  recipientRole: 'student',
  content: 'Please submit your attendance documentation.',
  category: 'administrative',
  priority: 'important',
  attachments: [file], // Optional
});
```

### Get Conversations

```typescript
const conversations = await officeMessagingService.getConversations(
  {
    userType: 'student',
    status: 'unread',
  },
  'recent'
);
```

### Send Broadcast Message

```typescript
const broadcast = await officeMessagingService.sendBroadcast({
  criteria: {
    type: 'specific_class',
    className: 'CS-301-A',
    session: 'MORNING',
  },
  content: 'Class will be held in Room 205 today.',
  category: 'schedule_change',
  priority: 'urgent',
});
```

### WebSocket Connection

```typescript
import { defaultWebSocketManager } from '@/lib/services/office/messaging';

// Set current user
defaultWebSocketManager.setCurrentUser(user);

// Register event handlers
defaultWebSocketManager.on({
  onMessage: (event) => {
    console.log('New message:', event.message);
  },
  onTypingIndicator: (event) => {
    console.log('Typing:', event.userName);
  },
  onConnectionStateChange: (state) => {
    console.log('Connection state:', state);
  },
});

// Connect
defaultWebSocketManager.connect();

// Send typing indicator
defaultWebSocketManager.sendTypingIndicator(conversationId);
```

## API Reference

### OfficeMessagingService

#### Conversation Management

- `getConversations(filters?, sortBy?)` - Get all conversations
- `getConversation(conversationId)` - Get single conversation
- `createConversation(recipientId, recipientRole)` - Create or get conversation

#### Message Operations

- `getMessages(conversationId, limit?, offset?)` - Get messages
- `sendMessage(request)` - Send a message
- `searchMessages(query, filters?, limit?, offset?)` - Search messages

#### Message Actions

- `pinMessage(messageId, conversationId)` - Pin a message
- `unpinMessage(messageId)` - Unpin a message
- `addReaction(messageId, reactionType)` - Add reaction
- `removeReaction(messageId, reactionType)` - Remove reaction
- `forwardMessage(request)` - Forward a message
- `scheduleMessage(request)` - Schedule a message
- `getScheduledMessages()` - Get scheduled messages
- `cancelScheduledMessage(messageId)` - Cancel scheduled message

#### Conversation Actions

- `pinConversation(conversationId)` - Pin conversation
- `unpinConversation(conversationId)` - Unpin conversation
- `starConversation(conversationId)` - Star conversation
- `unstarConversation(conversationId)` - Unstar conversation
- `archiveConversation(conversationId)` - Archive conversation
- `unarchiveConversation(conversationId)` - Unarchive conversation
- `resolveConversation(conversationId)` - Resolve conversation
- `unresolveConversation(conversationId)` - Unresolve conversation
- `muteConversation(conversationId)` - Mute conversation
- `unmuteConversation(conversationId)` - Unmute conversation
- `markAsRead(conversationId)` - Mark as read
- `markAsUnread(conversationId)` - Mark as unread

#### File Handling

- `uploadAttachment(messageId, file)` - Upload attachment
- `downloadAttachment(attachmentId)` - Download attachment

#### Template Management

- `getTemplates()` - Get all templates

#### Broadcast Messaging

- `sendBroadcast(request)` - Send broadcast message
- `getBroadcastHistory()` - Get broadcast history
- `getBroadcastDetails(broadcastId)` - Get broadcast details
- `retryFailedBroadcast(broadcastId)` - Retry failed deliveries

### WebSocketManager

#### Connection Management

- `connect()` - Connect to WebSocket server
- `disconnect()` - Disconnect from server
- `reconnect()` - Reconnect to server
- `isConnected()` - Check if connected
- `getConnectionState()` - Get current state

#### Event Handling

- `on(handlers)` - Register event handlers
- `sendTypingIndicator(conversationId)` - Send typing indicator
- `stopTypingIndicator(conversationId)` - Stop typing indicator

## Requirements Mapping

This implementation satisfies the following requirements from the design document:

### Subtask 3.1 - MessagingService
- ✅ Requirement 1.1, 1.2, 1.3: Direct messaging
- ✅ Requirement 4.1, 4.2, 4.3: Message templates
- ✅ Requirement 5.1, 5.2: Read receipts and delivery status
- ✅ Requirement 9.1, 9.2, 9.3, 9.4: Conversation actions
- ✅ Requirement 11.1, 11.4: Broadcast messaging
- ✅ Requirement 15.1, 15.4: Message scheduling
- ✅ Requirement 17.1, 17.2, 17.3: Message forwarding
- ✅ Requirement 23.1, 23.2: Integration with existing services

### Subtask 3.2 - WebSocket Manager
- ✅ Requirement 6.1, 6.2, 6.3, 6.4, 6.5: Real-time updates
- ✅ Requirement 13.1, 13.2, 13.3, 13.5: Typing indicators

## Error Handling

The service includes custom error types:

- `MessageSendError` - Failed to send message
- `FileUploadError` - Failed to upload file
- `PermissionError` - Permission denied
- `ConnectionError` - WebSocket connection error

## File Restrictions

Office users can upload files up to 100MB with the following types:
- Images: JPEG, PNG, GIF
- Documents: PDF, Word, Excel, PowerPoint
- Text: Plain text, CSV

## Database Schema Requirements

The implementation expects the following database tables:

- `conversations` - Conversation records
- `conversation_participants` - Participant relationships
- `messages` - Message records
- `message_attachments` - File attachments
- `message_reactions` - Message reactions
- `pinned_messages` - Pinned messages
- `scheduled_messages` - Scheduled messages
- `broadcast_messages` - Broadcast records
- `message_templates` - Message templates
- `message_read_status` - Read status tracking
- `conversation_list_view` - View for conversation list

## Next Steps

To complete the messaging system implementation:

1. ✅ Task 3.1: Create MessagingService class with all API methods
2. ✅ Task 3.2: Implement WebSocket connection management
3. ⏳ Task 4: Create state management with Context API
4. ⏳ Task 5: Implement custom hooks
5. ⏳ Task 6: Checkpoint - Verify core infrastructure

## Testing

To test the implementation:

```typescript
// Test message sending
const message = await officeMessagingService.sendMessage({
  recipientId: 'test-user',
  recipientRole: 'student',
  content: 'Test message',
  category: 'general',
  priority: 'normal',
});

// Test WebSocket connection
defaultWebSocketManager.connect();
console.log('Connected:', defaultWebSocketManager.isConnected());
```

## License

Part of the University Attendance Management System.
