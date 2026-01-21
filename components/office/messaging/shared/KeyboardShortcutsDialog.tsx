/**
 * KeyboardShortcutsDialog Component
 * 
 * Displays a dialog with all available keyboard shortcuts.
 * Features categorized shortcuts, search functionality, platform-specific keys,
 * and 3D key cap visual representation.
 * 
 * Requirements: 26.10
 */

'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search } from 'lucide-react';
import {
  getModifierKey,
  getModifierSymbol,
  formatShortcut,
  groupShortcutsByCategory,
} from '@/hooks/office/messaging/use-keyboard-shortcuts';
import type { KeyboardShortcut } from '@/types/office/messaging';

// ============================================================================
// Props
// ============================================================================

interface KeyboardShortcutsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  shortcuts?: KeyboardShortcut[];
}

// ============================================================================
// Key Cap Component
// ============================================================================

interface KeyCapProps {
  label: string;
  size?: 'sm' | 'md' | 'lg';
}

function KeyCap({ label, size = 'md' }: KeyCapProps) {
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  return (
    <span
      className={`
        inline-flex items-center justify-center
        ${sizeClasses[size]}
        font-semibold
        bg-linear-to-b from-white to-gray-100
        border border-gray-300
        rounded-md
        shadow-[0_2px_0_0_rgba(0,0,0,0.1),0_4px_8px_rgba(0,0,0,0.05)]
        text-gray-700
        min-w-8
      `}
      style={{
        transform: 'translateY(-1px)',
      }}
    >
      {label}
    </span>
  );
}

// ============================================================================
// Shortcut Row Component
// ============================================================================

interface ShortcutRowProps {
  shortcut: KeyboardShortcut;
}

function ShortcutRow({ shortcut }: ShortcutRowProps) {
  const modifierKey = getModifierSymbol();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex items-center justify-between py-3 px-4 hover:bg-gray-50 rounded-lg transition-colors"
    >
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-900">{shortcut.name}</p>
        <p className="text-xs text-gray-500 mt-0.5">{shortcut.description}</p>
      </div>
      
      <div className="flex items-center gap-1.5">
        {shortcut.keys.map((key, index) => {
          // Replace Ctrl/Cmd with platform-specific symbol
          const displayKey = key === 'Ctrl' || key === 'Cmd' ? modifierKey : key;
          
          return (
            <div key={index} className="flex items-center gap-1.5">
              <KeyCap label={displayKey} />
              {index < shortcut.keys.length - 1 && (
                <span className="text-gray-400 text-xs">+</span>
              )}
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

// ============================================================================
// Category Section Component
// ============================================================================

interface CategorySectionProps {
  title: string;
  shortcuts: KeyboardShortcut[];
}

function CategorySection({ title, shortcuts }: CategorySectionProps) {
  if (shortcuts.length === 0) return null;

  return (
    <div className="mb-6">
      <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3 px-4">
        {title}
      </h3>
      <div className="space-y-1">
        {shortcuts.map((shortcut) => (
          <ShortcutRow key={shortcut.id} shortcut={shortcut} />
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function KeyboardShortcutsDialog({
  isOpen,
  onClose,
  shortcuts = [],
}: KeyboardShortcutsDialogProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // ============================================================================
  // Get Default Shortcuts
  // ============================================================================

  const defaultShortcuts: KeyboardShortcut[] = useMemo(() => {
    const modKey = getModifierKey();
    
    return [
      // Navigation
      {
        id: 'nav-new',
        name: 'New Conversation',
        description: 'Start a new conversation',
        keys: [modKey, 'N'],
        category: 'navigation',
        action: () => {},
      },
      {
        id: 'nav-search',
        name: 'Search',
        description: 'Focus search input',
        keys: [modKey, 'F'],
        category: 'navigation',
        action: () => {},
      },
      {
        id: 'nav-command',
        name: 'Command Palette',
        description: 'Open command palette',
        keys: [modKey, 'K'],
        category: 'navigation',
        action: () => {},
      },
      {
        id: 'nav-close',
        name: 'Close Dialog',
        description: 'Close open dialog or modal',
        keys: ['Escape'],
        category: 'navigation',
        action: () => {},
      },
      {
        id: 'nav-up',
        name: 'Navigate Up',
        description: 'Move to previous conversation',
        keys: ['↑'],
        category: 'navigation',
        action: () => {},
      },
      {
        id: 'nav-down',
        name: 'Navigate Down',
        description: 'Move to next conversation',
        keys: ['↓'],
        category: 'navigation',
        action: () => {},
      },
      {
        id: 'nav-open',
        name: 'Open Conversation',
        description: 'Open selected conversation',
        keys: ['Enter'],
        category: 'navigation',
        action: () => {},
      },
      {
        id: 'nav-help',
        name: 'Show Help',
        description: 'Show this keyboard shortcuts dialog',
        keys: ['?'],
        category: 'navigation',
        action: () => {},
      },
      
      // Actions
      {
        id: 'action-mark-read',
        name: 'Mark All as Read',
        description: 'Mark all conversations as read',
        keys: [modKey, 'Shift', 'A'],
        category: 'actions',
        action: () => {},
      },
      {
        id: 'action-pin',
        name: 'Pin Conversation',
        description: 'Pin or unpin current conversation',
        keys: [modKey, 'Shift', 'P'],
        category: 'actions',
        action: () => {},
      },
      {
        id: 'action-star',
        name: 'Star Conversation',
        description: 'Star or unstar current conversation',
        keys: [modKey, 'Shift', 'S'],
        category: 'actions',
        action: () => {},
      },
      {
        id: 'action-archive',
        name: 'Archive Conversation',
        description: 'Archive current conversation',
        keys: [modKey, 'Shift', 'E'],
        category: 'actions',
        action: () => {},
      },
      {
        id: 'action-resolve',
        name: 'Resolve Conversation',
        description: 'Mark conversation as resolved',
        keys: [modKey, 'Shift', 'R'],
        category: 'actions',
        action: () => {},
      },
      
      // Composition
      {
        id: 'comp-send',
        name: 'Send Message',
        description: 'Send the current message',
        keys: [modKey, 'Enter'],
        category: 'composition',
        action: () => {},
      },
      {
        id: 'comp-reply',
        name: 'Reply to Message',
        description: 'Reply to focused message',
        keys: ['R'],
        category: 'composition',
        action: () => {},
      },
      {
        id: 'comp-forward',
        name: 'Forward Message',
        description: 'Forward focused message',
        keys: ['F'],
        category: 'composition',
        action: () => {},
      },
      {
        id: 'comp-pin-msg',
        name: 'Pin Message',
        description: 'Pin focused message',
        keys: ['P'],
        category: 'composition',
        action: () => {},
      },
    ];
  }, []);

  // Use provided shortcuts or default shortcuts
  const allShortcuts = shortcuts.length > 0 ? shortcuts : defaultShortcuts;

  // ============================================================================
  // Filter Shortcuts by Search Query
  // ============================================================================

  const filteredShortcuts = useMemo(() => {
    if (!searchQuery.trim()) return allShortcuts;

    const query = searchQuery.toLowerCase();
    return allShortcuts.filter(
      (shortcut) =>
        shortcut.name.toLowerCase().includes(query) ||
        shortcut.description.toLowerCase().includes(query) ||
        shortcut.keys.some((key) => key.toLowerCase().includes(query))
    );
  }, [allShortcuts, searchQuery]);

  // ============================================================================
  // Group Shortcuts by Category
  // ============================================================================

  const groupedShortcuts = useMemo(() => {
    return groupShortcutsByCategory(filteredShortcuts);
  }, [filteredShortcuts]);

  // ============================================================================
  // Category Titles
  // ============================================================================

  const categoryTitles: Record<string, string> = {
    navigation: 'Navigation',
    actions: 'Actions',
    composition: 'Composition',
  };

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Dialog */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[80vh] overflow-hidden">
              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-200 bg-linear-to-r from-blue-50 to-purple-50">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      Keyboard Shortcuts
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                      Use these shortcuts to navigate faster
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    data-dialog-close
                    className="p-2 hover:bg-white/50 rounded-lg transition-colors"
                    aria-label="Close dialog"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                {/* Search Bar */}
                <div className="mt-4 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search shortcuts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>
              </div>

              {/* Content */}
              <div className="overflow-y-auto max-h-[calc(80vh-180px)] p-6">
                {filteredShortcuts.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500">No shortcuts found</p>
                  </div>
                ) : (
                  <>
                    <CategorySection
                      title={categoryTitles.navigation}
                      shortcuts={groupedShortcuts.navigation || []}
                    />
                    <CategorySection
                      title={categoryTitles.actions}
                      shortcuts={groupedShortcuts.actions || []}
                    />
                    <CategorySection
                      title={categoryTitles.composition}
                      shortcuts={groupedShortcuts.composition || []}
                    />
                  </>
                )}
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                <p className="text-xs text-gray-600 text-center">
                  Press <KeyCap label="?" size="sm" /> to show this dialog anytime
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

