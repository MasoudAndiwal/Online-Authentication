# Office Messaging System - Project Structure

This directory contains the Office User Dashboard Messaging System components.

## Directory Structure

```
components/office/messaging/
├── layout/              # Layout components (MessagingLayout)
├── sidebar/             # Conversation sidebar components
├── message/             # Message display components
├── compose/             # Message composition components
├── broadcast/           # Broadcast messaging components
├── notifications/       # Notification components
├── search/              # Search and filter components
├── templates/           # Message template components
├── shared/              # Shared utility components
└── index.ts            # Main exports

hooks/office/messaging/
├── useMessaging.ts      # Main messaging hook
├── useConversation.ts   # Single conversation hook
├── useRealTimeUpdates.ts # WebSocket connection hook
├── useNotifications.ts  # Notification management hook
├── useLanguage.ts       # Language and RTL/LTR hook
├── useFileUpload.ts     # File upload hook
├── useMessageTemplates.ts # Template management hook
├── useVirtualScroll.ts  # Virtual scrolling hook
├── useKeyboardShortcuts.ts # Keyboard shortcuts hook
└── index.ts            # Main exports

lib/services/office/messaging/
├── MessagingService.ts  # Main messaging service class
├── WebSocketService.ts  # WebSocket connection management
└── index.ts            # Main exports

types/office/messaging/
├── user.ts             # User-related types
├── message.ts          # Message-related types
├── conversation.ts     # Conversation-related types
├── notification.ts     # Notification-related types
├── template.ts         # Template-related types
├── broadcast.ts        # Broadcast-related types
├── search.ts           # Search and filter types
├── language.ts         # Language and i18n types
└── index.ts            # Main exports

lib/utils/office/messaging/
├── formatters.ts       # Date, time, and text formatters
├── validators.ts       # Input validation utilities
├── helpers.ts          # General helper functions
└── index.ts            # Main exports

lib/design-system/
└── office-messaging.ts # Design system constants

lib/i18n/
├── office-messaging-config.ts # i18next configuration
└── locales/
    ├── en/messaging.json # English translations
    ├── fa/messaging.json # Dari translations
    └── ps/messaging.json # Pashto translations
```

## Design System

The design system is defined in `lib/design-system/office-messaging.ts` and includes:

- **Colors**: Professional blue palette, status colors, priority colors
- **Typography**: Font families (including RTL support), sizes, weights
- **Spacing**: Consistent spacing scale
- **Animations**: Durations, easing functions, keyframes
- **Glassmorphism**: Pre-defined glass effect styles
- **Breakpoints**: Responsive design breakpoints
- **Shadows**: Shadow scale for depth
- **Border Radius**: Consistent border radius scale

## Multi-Language Support

The system supports three languages with proper RTL/LTR handling:

- **English (en)**: Left-to-right (LTR)
- **Dari (fa)**: Right-to-left (RTL)
- **Pashto (ps)**: Right-to-left (RTL)

Translation files are located in `lib/i18n/locales/`.

## Getting Started

1. Import the design system:
```typescript
import { colors, typography, spacing } from '@/lib/design-system/office-messaging';
```

2. Use the messaging context:
```typescript
import { useMessaging } from '@/hooks/office/messaging';

const { conversations, sendMessage, loadConversations } = useMessaging();
```

3. Configure i18next:
```typescript
import '@/lib/i18n/office-messaging-config';
import { useTranslation } from 'react-i18next';

const { t, i18n } = useTranslation('messaging');
```

## Requirements Mapping

This structure supports the following requirements:
- 22.1: Gradient-filled buttons (design system)
- 22.2: Glassmorphism effects (design system)
- 22.3: 3D professional icons (component structure)
- 22.4: Smooth micro-animations (design system)
- 22.5: Glassmorphism effects (design system)
- 22.6: Professional blue color scheme (design system)
- 22.7: Clean backgrounds (design system)
- 25.1-25.10: Multi-language support (i18n configuration)
