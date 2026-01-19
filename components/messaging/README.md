# Office User Dashboard Messaging System

This directory contains all components for the Office User Dashboard Messaging System, a comprehensive real-time messaging interface for administrative staff in a university attendance management system.

## Directory Structure

```
components/messaging/
├── layout/              # Layout components (MessagingLayout)
├── sidebar/             # Conversation sidebar components
│   ├── ConversationSidebar.tsx
│   ├── ConversationItem.tsx
│   ├── SearchBar.tsx
│   └── FilterPanel.tsx
├── messages/            # Message display components
│   ├── MessageView.tsx
│   ├── MessageBubble.tsx
│   ├── MessageList.tsx
│   ├── AttachmentPreview.tsx
│   └── ReactionBar.tsx
├── compose/             # Message composition components
│   ├── ComposeArea.tsx
│   ├── TemplateSelector.tsx
│   └── AttachmentUpload.tsx
├── broadcast/           # Broadcast messaging components
│   ├── BroadcastDialog.tsx
│   └── BroadcastHistory.tsx
├── notifications/       # Notification components
│   └── NotificationCenter.tsx
├── scheduling/          # Message scheduling components
│   ├── ScheduleMessageDialog.tsx
│   └── ScheduledMessagesList.tsx
├── dialogs/             # Various dialog components
│   ├── ForwardMessageDialog.tsx
│   ├── ExportDialog.tsx
│   └── KeyboardShortcutsDialog.tsx
├── shared/              # Shared utility components
│   ├── TypingIndicator.tsx
│   ├── LoadingSpinner.tsx
│   ├── EmptyState.tsx
│   └── ErrorBoundary.tsx
└── README.md            # This file
```

## Key Features

- **Real-Time Communication**: WebSocket-based real-time updates for messages, typing indicators, and status changes
- **Multi-Language Support**: Full RTL/LTR support for Dari, Pashto, and English
- **Professional Visual Design**: Modern glassmorphism effects, gradient-filled buttons, shadow-based separation, 3D professional icons
- **Accessibility First**: WCAG 2.1 AA compliance with keyboard navigation and screen reader support
- **Performance Optimized**: Virtual scrolling, optimistic UI updates, efficient state management
- **Responsive Design**: Mobile-first approach with adaptive layouts for all device sizes

## Technology Stack

- **React** with TypeScript
- **Framer Motion** for smooth micro-animations
- **Tailwind CSS** with custom design system
- **i18next** for internationalization
- **date-fns** for date formatting
- **WebSocket** for real-time communication

## Design Principles

1. **No Outline Buttons**: All buttons use filled styles with solid colors or gradients
2. **Shadow-Based Separation**: Visual separation achieved through shadows, not borders
3. **Professional 3D Icons**: No emojis, only professional 3D icons
4. **Smooth Micro-Animations**: All interactions have smooth animations
5. **Glassmorphism Effects**: Modern visual appeal with backdrop blur effects
6. **Professional Blue Color Scheme**: Consistent blue color palette throughout
7. **Clean White Backgrounds**: Main content areas use clean white or light backgrounds

## Requirements Coverage

This messaging system implements requirements 1-29 from the requirements document, including:

- Direct messaging (Req 1)
- Message categorization and priority (Req 2)
- File attachment support (Req 3)
- Message templates (Req 4)
- Read receipts and delivery status (Req 5)
- Real-time updates (Req 6)
- Unified inbox management (Req 7)
- Search and filter capabilities (Req 8)
- Conversation actions (Req 9)
- Conversation sorting (Req 10)
- Broadcast messaging (Req 11-12)
- Typing indicators (Req 13)
- Message search (Req 14)
- Message scheduling (Req 15)
- Notification system (Req 16)
- Message forwarding (Req 17)
- Conversation history (Req 18)
- Error handling (Req 19)
- Accessibility compliance (Req 20)
- Responsive design (Req 21)
- Visual design standards (Req 22)
- Integration with existing services (Req 23)
- Performance requirements (Req 24)
- Multi-language support with RTL/LTR (Req 25)
- Keyboard shortcuts (Req 26)
- Message reactions (Req 27)
- Message pinning and starring (Req 28)
- Smart notifications (Req 29)

## Getting Started

See the main implementation plan in `.kiro/specs/office-messaging-system/tasks.md` for the complete development roadmap.

## Related Documentation

- Requirements: `.kiro/specs/office-messaging-system/requirements.md`
- Design Document: `.kiro/specs/office-messaging-system/design.md`
- Tasks: `.kiro/specs/office-messaging-system/tasks.md`
- Design Tokens: `lib/design-system/messaging-tokens.ts`
