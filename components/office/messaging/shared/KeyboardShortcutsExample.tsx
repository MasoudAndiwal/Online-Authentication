/**
 * KeyboardShortcutsExample Component
 * 
 * Example component demonstrating how to integrate keyboard shortcuts
 * and shortcut hints into UI components.
 * 
 * This file serves as a reference for implementing keyboard shortcuts
 * in other components throughout the messaging system.
 * 
 * Requirements: 26.11
 */

'use client';

import { useState } from 'react';
import { Send, Search, Plus, Star, Archive, Pin } from 'lucide-react';
import { ShortcutTooltip, ShortcutTooltipPreset } from './ShortcutTooltip';
import { KeyboardShortcutsManager } from './KeyboardShortcutsManager';
import { KeyboardShortcutsDialog } from './KeyboardShortcutsDialog';

// ============================================================================
// Example Component
// ============================================================================

export function KeyboardShortcutsExample() {
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-2xl font-bold">Keyboard Shortcuts Integration Example</h1>

      {/* Register keyboard shortcuts globally */}
      <KeyboardShortcutsManager
        onShowHelp={() => setIsHelpOpen(true)}
        onNewConversation={() => console.log('New conversation')}
        onCommandPalette={() => console.log('Command palette')}
      />

      {/* Keyboard shortcuts help dialog */}
      <KeyboardShortcutsDialog
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />

      {/* Example 1: Using ShortcutTooltipPreset for common actions */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Example 1: Preset Tooltips</h2>
        <p className="text-gray-600">
          Use ShortcutTooltipPreset for common actions with predefined shortcuts.
        </p>
        
        <div className="flex gap-4">
          <ShortcutTooltipPreset action="send">
            <button
              data-send-button
              className="px-4 py-2 bg-linear-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:shadow-lg transition-shadow"
            >
              <Send className="w-4 h-4 inline mr-2" />
              Send Message
            </button>
          </ShortcutTooltipPreset>

          <ShortcutTooltipPreset action="search">
            <button
              data-search-input
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Search className="w-4 h-4 inline mr-2" />
              Search
            </button>
          </ShortcutTooltipPreset>

          <ShortcutTooltipPreset action="new">
            <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
              <Plus className="w-4 h-4 inline mr-2" />
              New Conversation
            </button>
          </ShortcutTooltipPreset>
        </div>
      </section>

      {/* Example 2: Using ShortcutTooltip for custom shortcuts */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Example 2: Custom Tooltips</h2>
        <p className="text-gray-600">
          Use ShortcutTooltip for custom actions with specific shortcuts.
        </p>
        
        <div className="flex gap-4">
          <ShortcutTooltip
            content="Star conversation"
            shortcut={['Ctrl', 'Shift', 'S']}
          >
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <Star className="w-5 h-5" />
            </button>
          </ShortcutTooltip>

          <ShortcutTooltip
            content="Archive conversation"
            shortcut={['Ctrl', 'Shift', 'E']}
          >
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <Archive className="w-5 h-5" />
            </button>
          </ShortcutTooltip>

          <ShortcutTooltip
            content="Pin conversation"
            shortcut={['Ctrl', 'Shift', 'P']}
          >
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <Pin className="w-5 h-5" />
            </button>
          </ShortcutTooltip>
        </div>
      </section>

      {/* Example 3: Tooltips without shortcuts */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Example 3: Tooltips Without Shortcuts</h2>
        <p className="text-gray-600">
          You can also use ShortcutTooltip without shortcuts for regular tooltips.
        </p>
        
        <div className="flex gap-4">
          <ShortcutTooltip content="This action has no keyboard shortcut">
            <button className="px-4 py-2 bg-gray-200 rounded-lg">
              No Shortcut
            </button>
          </ShortcutTooltip>
        </div>
      </section>

      {/* Example 4: Show help dialog */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Example 4: Help Dialog</h2>
        <p className="text-gray-600">
          Press <kbd className="px-2 py-1 bg-gray-200 rounded text-sm">?</kbd> or click the button below to show all keyboard shortcuts.
        </p>
        
        <button
          onClick={() => setIsHelpOpen(true)}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Show Keyboard Shortcuts
        </button>
      </section>

      {/* Integration Guide */}
      <section className="space-y-4 mt-8 p-6 bg-gray-50 rounded-lg">
        <h2 className="text-xl font-semibold">Integration Guide</h2>
        
        <div className="space-y-4 text-sm">
          <div>
            <h3 className="font-semibold mb-2">1. Add KeyboardShortcutsManager to your layout:</h3>
            <pre className="bg-gray-800 text-gray-100 p-4 rounded overflow-x-auto">
{`<KeyboardShortcutsManager
  onShowHelp={() => setIsHelpOpen(true)}
  onNewConversation={handleNewConversation}
  onCommandPalette={handleCommandPalette}
/>`}
            </pre>
          </div>

          <div>
            <h3 className="font-semibold mb-2">2. Add KeyboardShortcutsDialog:</h3>
            <pre className="bg-gray-800 text-gray-100 p-4 rounded overflow-x-auto">
{`<KeyboardShortcutsDialog
  isOpen={isHelpOpen}
  onClose={() => setIsHelpOpen(false)}
/>`}
            </pre>
          </div>

          <div>
            <h3 className="font-semibold mb-2">3. Wrap buttons with ShortcutTooltip:</h3>
            <pre className="bg-gray-800 text-gray-100 p-4 rounded overflow-x-auto">
{`<ShortcutTooltipPreset action="send">
  <button data-send-button>Send</button>
</ShortcutTooltipPreset>

// Or for custom shortcuts:
<ShortcutTooltip
  content="Custom action"
  shortcut={['Ctrl', 'K']}
>
  <button>Action</button>
</ShortcutTooltip>`}
            </pre>
          </div>

          <div>
            <h3 className="font-semibold mb-2">4. Add data attributes for keyboard shortcuts to work:</h3>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li><code>data-send-button</code> - Send message button</li>
              <li><code>data-search-input</code> - Search input field</li>
              <li><code>data-compose-area</code> - Message compose area</li>
              <li><code>data-dialog-close</code> - Dialog close button</li>
              <li><code>data-forward-message="[messageId]"</code> - Forward message button</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}

