# Office Messaging Hooks

This directory contains custom React hooks for the Office User Dashboard Messaging System. These hooks provide a clean, reusable interface for managing messaging functionality throughout the application.

## Overview

The hooks are organized to provide specific functionality while maintaining separation of concerns:

1. **useMessaging** - Main context hook for accessing messaging state and actions
2. **useConversation** - Single conversation management with pagination
3. **useRealTimeUpdates** - WebSocket connection and real-time updates
4. **useNotifications** - Notification management with browser API integration
5. **useLanguage** - Multi-language support with RTL/LTR handling
6. **useFileUpload** - File upload with progress tracking and validation
7. **useMessageTemplates** - Template management with variable substitution
8. **useVirtualScroll** - Performance optimization for large lists
9. **useKeyboardShortcuts** - Keyboard shortcut registration and handling

## Usage

### Basic Setup

First, wrap your application with the `MessagingProvider`:

```tsx
import { MessagingProvider } from '@/hooks/office/messaging';

function App() {
  const currentUser = {
    id: 'user-123',
    name: 'John Doe',
    role: 'office',
  };

  return (
    <MessagingProvider currentUser={currentUser}>
      <YourApp />
    </MessagingProvider>
  );
}
```

### Using Hooks

#### 1. useMessaging

Access the main messaging context:

```tsx
import { useMessaging } from '@/hooks/office/messaging';

function ConversationList() {
  const {
    conversations,
    isLoading,
    loadConversations,
    selectConversation,
  } = useMessaging();

  useEffect(() => {
    loadConversations();
  }, []);

  return (
    <div>
      {conversations.map(conv => (
        <div key={conv.id} onClick={() => selectConversation(conv.id)}>
          {conv.recipientName}
        </div>
      ))}
    </div>
  );
}
```

#### 2. useConversation

Manage a single conversation:

```tsx
import { useConversation } from '@/hooks/office/messaging';

function MessageView({ conversationId }: { conversationId: string }) {
  const {
    conversation,
    messages,
    sendMessage,
    loadMore,
    hasMore,
  } = useConversation(conversationId);

  const handleSend = async (content: string) => {
    await sendMessage({
      content,
      category: 'general',
      priority: 'normal',
      attachments: [],
    });
  };

  return (
    <div>
      {messages.map(msg => (
        <div key={msg.id}>{msg.content}</div>
      ))}
      {hasMore && <button onClick={loadMore}>Load More</button>}
    </div>
  );
}
```

#### 3. useRealTimeUpdates

Monitor WebSocket connection:

```tsx
import { useRealTimeUpdates } from '@/hooks/office/messaging';

function ConnectionStatus() {
  const { isConnected, isReconnecting, reconnect } = useRealTimeUpdates();

  if (!isConnected) {
    return (
      <div>
        {isReconnecting ? 'Reconnecting...' : 'Disconnected'}
        <button onClick={reconnect}>Reconnect</button>
      </div>
    );
  }

  return <div>Connected</div>;
}
```

#### 4. useNotifications

Manage notifications:

```tsx
import { useNotifications } from '@/hooks/office/messaging';

function NotificationCenter() {
  const {
    notifications,
    unreadCount,
    dismiss,
    markAsRead,
    requestPermission,
  } = useNotifications();

  useEffect(() => {
    requestPermission();
  }, []);

  return (
    <div>
      <h3>Notifications ({unreadCount})</h3>
      {notifications.map(notif => (
        <div key={notif.id}>
          {notif.message}
          <button onClick={() => markAsRead(notif.id)}>Mark Read</button>
          <button onClick={() => dismiss(notif.id)}>Dismiss</button>
        </div>
      ))}
    </div>
  );
}
```

#### 5. useLanguage

Handle multi-language support:

```tsx
import { useLanguage } from '@/hooks/office/messaging';

function LanguageSwitcher() {
  const { language, direction, setLanguage, t, isRTL } = useLanguage();

  return (
    <div dir={direction}>
      <h1>{t('messaging.title')}</h1>
      <select value={language} onChange={(e) => setLanguage(e.target.value as Language)}>
        <option value="en">English</option>
        <option value="fa">دری (Dari)</option>
        <option value="ps">پښتو (Pashto)</option>
      </select>
    </div>
  );
}
```

#### 6. useFileUpload

Upload files with progress:

```tsx
import { useFileUpload } from '@/hooks/office/messaging';

function FileUploader({ messageId }: { messageId: string }) {
  const { upload, progress, isUploading, error, validateFile } = useFileUpload();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateFile(file);
    if (!validation.valid) {
      alert(validation.error);
      return;
    }

    try {
      const attachment = await upload(file, messageId);
      console.log('Uploaded:', attachment);
    } catch (err) {
      console.error('Upload failed:', err);
    }
  };

  return (
    <div>
      <input type="file" onChange={handleFileSelect} disabled={isUploading} />
      {isUploading && <progress value={progress} max={100} />}
      {error && <div>{error}</div>}
    </div>
  );
}
```

#### 7. useMessageTemplates

Use message templates:

```tsx
import { useMessageTemplates } from '@/hooks/office/messaging';

function TemplateSelector() {
  const { templates, insertTemplate } = useMessageTemplates();

  const handleSelectTemplate = (templateId: string) => {
    const content = insertTemplate(templateId, {
      recipientName: 'John Doe',
      date: new Date().toLocaleDateString(),
    });
    console.log('Template content:', content);
  };

  return (
    <select onChange={(e) => handleSelectTemplate(e.target.value)}>
      <option value="">Select Template</option>
      {templates.map(template => (
        <option key={template.id} value={template.id}>
          {template.name}
        </option>
      ))}
    </select>
  );
}
```

#### 8. useVirtualScroll

Optimize large lists:

```tsx
import { useVirtualScroll } from '@/hooks/office/messaging';

function VirtualizedList({ items }: { items: any[] }) {
  const { visibleItems, totalHeight, containerRef } = useVirtualScroll(items, {
    itemHeight: 80,
    overscan: 3,
  });

  return (
    <div ref={containerRef} style={{ height: '500px', overflow: 'auto' }}>
      <div style={{ height: totalHeight, position: 'relative' }}>
        {visibleItems.map(({ item, index, offsetTop }) => (
          <div
            key={index}
            style={{
              position: 'absolute',
              top: offsetTop,
              height: 80,
              width: '100%',
            }}
          >
            {item.name}
          </div>
        ))}
      </div>
    </div>
  );
}
```

#### 9. useKeyboardShortcuts

Register keyboard shortcuts:

```tsx
import { useKeyboardShortcuts, getCommonShortcuts } from '@/hooks/office/messaging';

function MessagingApp() {
  const shortcuts = getCommonShortcuts({
    newConversation: () => console.log('New conversation'),
    search: () => console.log('Search'),
    sendMessage: () => console.log('Send message'),
  });

  useKeyboardShortcuts(shortcuts);

  return <div>Press Ctrl+N for new conversation</div>;
}
```

## Requirements Coverage

Each hook is designed to fulfill specific requirements from the design document:

- **useMessaging**: Requirements 7.1-7.5
- **useConversation**: Requirements 1.1-1.3, 18.1-18.3
- **useRealTimeUpdates**: Requirements 6.1-6.5
- **useNotifications**: Requirements 16.1-16.5, 29.1-29.12
- **useLanguage**: Requirements 25.1-25.5
- **useFileUpload**: Requirements 3.1-3.4, 19.4
- **useMessageTemplates**: Requirements 4.1-4.5
- **useVirtualScroll**: Requirement 24.4
- **useKeyboardShortcuts**: Requirements 26.1-26.9

## Best Practices

1. **Always use hooks inside React components or other hooks**
2. **Wrap your app with MessagingProvider before using any hooks**
3. **Handle loading and error states appropriately**
4. **Clean up resources in useEffect cleanup functions**
5. **Use TypeScript for type safety**
6. **Follow React Hooks rules (don't call conditionally)**

## Testing

Each hook can be tested using React Testing Library:

```tsx
import { renderHook } from '@testing-library/react';
import { useMessaging, MessagingProvider } from '@/hooks/office/messaging';

test('useMessaging provides messaging context', () => {
  const wrapper = ({ children }) => (
    <MessagingProvider currentUser={mockUser}>
      {children}
    </MessagingProvider>
  );

  const { result } = renderHook(() => useMessaging(), { wrapper });

  expect(result.current.conversations).toBeDefined();
  expect(result.current.loadConversations).toBeDefined();
});
```

## Contributing

When adding new hooks:

1. Follow the existing naming convention (`use-[feature-name].ts`)
2. Include comprehensive JSDoc comments
3. Export utility functions alongside the hook
4. Add the hook to `index.ts` for easy importing
5. Update this README with usage examples
6. Ensure TypeScript types are properly defined
7. Add requirements coverage in comments

## License

This code is part of the Office User Dashboard Messaging System.
