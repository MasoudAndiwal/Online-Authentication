# Messaging Utility Functions

This directory contains utility functions for the Office User Dashboard Messaging System.

## Utility Categories

### Date and Time Utilities
- **formatMessageTime**: Format message timestamps in human-readable format
- **formatRelativeTime**: Format timestamps as relative time (e.g., "2 hours ago")
- **isToday**: Check if a date is today
- **isThisWeek**: Check if a date is within this week

### Text Utilities
- **truncateText**: Truncate text with ellipsis
- **highlightSearchText**: Highlight search matches in text
- **detectLanguage**: Detect text language (for mixed content)
- **sanitizeHtml**: Sanitize HTML content for security

### RTL/LTR Utilities
- **getTextDirection**: Get text direction based on language
- **flipIconForRTL**: Determine if an icon should flip for RTL
- **getAlignmentForDirection**: Get text alignment based on direction

### Validation Utilities
- **validateFileSize**: Validate file size (max 100MB)
- **validateFileType**: Validate file type (documents, images, PDFs)
- **validateScheduledTime**: Validate scheduled time is in future

### Formatting Utilities
- **formatFileSize**: Format file size in human-readable format (KB, MB, GB)
- **formatRecipientCount**: Format recipient count for broadcast messages
- **formatUnreadCount**: Format unread count (e.g., "99+" for > 99)

### Search and Filter Utilities
- **filterConversations**: Filter conversations based on search query and filters
- **sortConversations**: Sort conversations by different criteria
- **searchMessages**: Search messages within a conversation

### Performance Utilities
- **debounce**: Debounce function calls
- **throttle**: Throttle function calls
- **memoize**: Memoize expensive computations

### Accessibility Utilities
- **announceToScreenReader**: Announce messages to screen readers
- **trapFocus**: Trap focus within a modal
- **restoreFocus**: Restore focus after modal close

## File Organization

```
lib/utils/messaging/
├── date-time.ts         # Date and time utilities
├── text.ts              # Text manipulation utilities
├── rtl.ts               # RTL/LTR utilities
├── validation.ts        # Validation utilities
├── formatting.ts        # Formatting utilities
├── search.ts            # Search and filter utilities
├── performance.ts       # Performance utilities
├── accessibility.ts     # Accessibility utilities
├── index.ts             # Re-exports all utilities
└── README.md            # This file
```

## Usage Example

```typescript
import { 
  formatMessageTime, 
  truncateText, 
  getTextDirection,
  validateFileSize 
} from '@/lib/utils/messaging';

// Format timestamp
const timeStr = formatMessageTime(message.timestamp); // "2:30 PM"

// Truncate text
const preview = truncateText(message.content, 50); // "This is a long message that will be trun..."

// Get text direction
const direction = getTextDirection('fa'); // "rtl"

// Validate file
const isValid = validateFileSize(file); // true/false
```

## Best Practices

1. **Pure Functions**: All utilities are pure functions with no side effects
2. **Type Safety**: Fully typed with TypeScript strict mode
3. **Performance**: Optimized for performance with memoization where appropriate
4. **Testing**: All utilities have comprehensive unit tests
5. **Documentation**: Each function has JSDoc comments

## Related Documentation

- Design Document: `.kiro/specs/office-messaging-system/design.md`
- Design Tokens: `lib/design-system/messaging-tokens.ts`
