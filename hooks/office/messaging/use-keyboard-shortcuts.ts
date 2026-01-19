/**
 * useKeyboardShortcuts Hook
 * 
 * Custom hook for registering and handling keyboard shortcuts.
 * Handles platform-specific keys (Ctrl vs Cmd) and provides shortcut management.
 * 
 * Requirements: 26.1, 26.2, 26.3, 26.4, 26.5, 26.6, 26.7, 26.8, 26.9
 */

'use client';

import { useEffect, useCallback, useRef } from 'react';
import type { KeyboardShortcut } from '@/types/office/messaging';

// ============================================================================
// Types
// ============================================================================

interface ShortcutConfig {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean; // Cmd on Mac
  action: () => void;
  description?: string;
  preventDefault?: boolean;
  enabled?: boolean;
}

interface UseKeyboardShortcutsOptions {
  enabled?: boolean;
  preventDefault?: boolean;
}

// ============================================================================
// Platform Detection
// ============================================================================

const isMac = typeof window !== 'undefined' && 
  /Mac|iPod|iPhone|iPad/.test(window.navigator.platform);

/**
 * Get the modifier key name for the current platform
 */
export function getModifierKey(): 'Ctrl' | 'Cmd' {
  return isMac ? 'Cmd' : 'Ctrl';
}

/**
 * Get the modifier key symbol for the current platform
 */
export function getModifierSymbol(): string {
  return isMac ? '⌘' : 'Ctrl';
}

// ============================================================================
// Hook Implementation
// ============================================================================

/**
 * Hook for keyboard shortcuts
 * 
 * @param shortcuts - Array of shortcut configurations
 * @param options - Hook options
 */
export function useKeyboardShortcuts(
  shortcuts: ShortcutConfig[],
  options: UseKeyboardShortcutsOptions = {}
): void {
  const { enabled = true, preventDefault = true } = options;

  // Store shortcuts in ref to avoid re-registering on every render
  const shortcutsRef = useRef(shortcuts);
  shortcutsRef.current = shortcuts;

  // ============================================================================
  // Handle Keyboard Event
  // ============================================================================

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return;

    // Don't trigger shortcuts when typing in input fields
    const target = event.target as HTMLElement;
    const isInputField = 
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.isContentEditable;

    // Allow some shortcuts even in input fields (like Ctrl+Enter to send)
    const allowInInput = event.key === 'Enter' && (event.ctrlKey || event.metaKey);

    if (isInputField && !allowInInput) {
      return;
    }

    // Check each shortcut
    for (const shortcut of shortcutsRef.current) {
      if (shortcut.enabled === false) continue;

      const matches = matchesShortcut(event, shortcut);

      if (matches) {
        if (preventDefault || shortcut.preventDefault !== false) {
          event.preventDefault();
          event.stopPropagation();
        }

        shortcut.action();
        break; // Only trigger first matching shortcut
      }
    }
  }, [enabled, preventDefault]);

  // ============================================================================
  // Register Event Listener
  // ============================================================================

  useEffect(() => {
    if (!enabled) return;

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [enabled, handleKeyDown]);
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Check if keyboard event matches a shortcut configuration
 */
function matchesShortcut(event: KeyboardEvent, shortcut: ShortcutConfig): boolean {
  // Normalize key
  const eventKey = event.key.toLowerCase();
  const shortcutKey = shortcut.key.toLowerCase();

  // Check key match
  if (eventKey !== shortcutKey) return false;

  // Check modifiers
  const ctrlOrMeta = isMac ? event.metaKey : event.ctrlKey;

  if (shortcut.ctrl && !ctrlOrMeta) return false;
  if (!shortcut.ctrl && ctrlOrMeta) return false;

  if (shortcut.shift && !event.shiftKey) return false;
  if (!shortcut.shift && event.shiftKey) return false;

  if (shortcut.alt && !event.altKey) return false;
  if (!shortcut.alt && event.altKey) return false;

  return true;
}

/**
 * Format shortcut for display
 */
export function formatShortcut(shortcut: ShortcutConfig): string {
  const parts: string[] = [];

  if (shortcut.ctrl) {
    parts.push(getModifierSymbol());
  }

  if (shortcut.shift) {
    parts.push('Shift');
  }

  if (shortcut.alt) {
    parts.push('Alt');
  }

  // Capitalize key
  const key = shortcut.key.length === 1 
    ? shortcut.key.toUpperCase() 
    : shortcut.key.charAt(0).toUpperCase() + shortcut.key.slice(1);

  parts.push(key);

  return parts.join(' + ');
}

/**
 * Convert KeyboardShortcut type to ShortcutConfig
 */
export function convertToShortcutConfig(shortcut: KeyboardShortcut): ShortcutConfig {
  const config: ShortcutConfig = {
    key: shortcut.keys[shortcut.keys.length - 1].toLowerCase(),
    action: shortcut.action,
    description: shortcut.description,
  };

  // Parse modifier keys
  for (const key of shortcut.keys) {
    const lowerKey = key.toLowerCase();
    if (lowerKey === 'ctrl' || lowerKey === 'cmd') {
      config.ctrl = true;
    } else if (lowerKey === 'shift') {
      config.shift = true;
    } else if (lowerKey === 'alt') {
      config.alt = true;
    }
  }

  return config;
}

// ============================================================================
// Common Shortcuts
// ============================================================================

/**
 * Get common messaging shortcuts
 */
export function getCommonShortcuts(actions: {
  newConversation?: () => void;
  search?: () => void;
  commandPalette?: () => void;
  closeDialog?: () => void;
  sendMessage?: () => void;
  markAllRead?: () => void;
  pinConversation?: () => void;
  starConversation?: () => void;
  archiveConversation?: () => void;
  navigateUp?: () => void;
  navigateDown?: () => void;
  openConversation?: () => void;
  showHelp?: () => void;
}): ShortcutConfig[] {
  const shortcuts: ShortcutConfig[] = [];

  if (actions.newConversation) {
    shortcuts.push({
      key: 'n',
      ctrl: true,
      action: actions.newConversation,
      description: 'New conversation',
    });
  }

  if (actions.search) {
    shortcuts.push({
      key: 'f',
      ctrl: true,
      action: actions.search,
      description: 'Search',
    });
  }

  if (actions.commandPalette) {
    shortcuts.push({
      key: 'k',
      ctrl: true,
      action: actions.commandPalette,
      description: 'Command palette',
    });
  }

  if (actions.closeDialog) {
    shortcuts.push({
      key: 'escape',
      action: actions.closeDialog,
      description: 'Close dialog',
    });
  }

  if (actions.sendMessage) {
    shortcuts.push({
      key: 'enter',
      ctrl: true,
      action: actions.sendMessage,
      description: 'Send message',
    });
  }

  if (actions.markAllRead) {
    shortcuts.push({
      key: 'a',
      ctrl: true,
      shift: true,
      action: actions.markAllRead,
      description: 'Mark all as read',
    });
  }

  if (actions.pinConversation) {
    shortcuts.push({
      key: 'p',
      ctrl: true,
      shift: true,
      action: actions.pinConversation,
      description: 'Pin conversation',
    });
  }

  if (actions.starConversation) {
    shortcuts.push({
      key: 's',
      ctrl: true,
      shift: true,
      action: actions.starConversation,
      description: 'Star conversation',
    });
  }

  if (actions.archiveConversation) {
    shortcuts.push({
      key: 'e',
      ctrl: true,
      shift: true,
      action: actions.archiveConversation,
      description: 'Archive conversation',
    });
  }

  if (actions.navigateUp) {
    shortcuts.push({
      key: 'arrowup',
      action: actions.navigateUp,
      description: 'Navigate up',
    });
  }

  if (actions.navigateDown) {
    shortcuts.push({
      key: 'arrowdown',
      action: actions.navigateDown,
      description: 'Navigate down',
    });
  }

  if (actions.openConversation) {
    shortcuts.push({
      key: 'enter',
      action: actions.openConversation,
      description: 'Open conversation',
    });
  }

  if (actions.showHelp) {
    shortcuts.push({
      key: '?',
      shift: true,
      action: actions.showHelp,
      description: 'Show keyboard shortcuts',
    });
  }

  return shortcuts;
}

/**
 * Group shortcuts by category
 */
export function groupShortcutsByCategory(
  shortcuts: KeyboardShortcut[]
): Record<string, KeyboardShortcut[]> {
  const grouped: Record<string, KeyboardShortcut[]> = {
    navigation: [],
    actions: [],
    composition: [],
  };

  shortcuts.forEach(shortcut => {
    if (grouped[shortcut.category]) {
      grouped[shortcut.category].push(shortcut);
    }
  });

  return grouped;
}

/**
 * Check if a key combination is already registered
 */
export function isShortcutRegistered(
  shortcuts: ShortcutConfig[],
  newShortcut: ShortcutConfig
): boolean {
  return shortcuts.some(shortcut => 
    shortcut.key === newShortcut.key &&
    shortcut.ctrl === newShortcut.ctrl &&
    shortcut.shift === newShortcut.shift &&
    shortcut.alt === newShortcut.alt
  );
}
