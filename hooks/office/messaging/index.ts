/**
 * Office Messaging Hooks
 * 
 * Central export file for all office messaging custom hooks.
 * Provides easy access to all messaging-related hooks.
 */

// Context and main hook
export { MessagingProvider, useMessaging } from './use-messaging-context';

// Conversation management
export { useConversation } from './use-conversation';

// Real-time updates
export { useRealTimeUpdates } from './use-real-time-updates';

// Notifications
export { useNotifications } from './use-notifications';

// Language and i18n
export { useLanguage } from './use-language';

// File upload
export {
  useFileUpload,
  formatFileSize,
  getFileTypeLabel,
  isImageFile,
  isDocumentFile,
} from './use-file-upload';

// Message templates
export {
  useMessageTemplates,
  extractVariables,
  validateVariables,
  getCommonVariables,
  previewTemplate,
} from './use-message-templates';

// Virtual scrolling
export {
  useVirtualScroll,
  calculateItemHeight,
  getScrollPercentage,
  isScrolledToBottom,
  isScrolledToTop,
  scrollToTop,
  scrollToBottom,
} from './use-virtual-scroll';

// Keyboard shortcuts
export {
  useKeyboardShortcuts,
  getModifierKey,
  getModifierSymbol,
  formatShortcut,
  convertToShortcutConfig,
  getCommonShortcuts,
  groupShortcutsByCategory,
  isShortcutRegistered,
} from './use-keyboard-shortcuts';
