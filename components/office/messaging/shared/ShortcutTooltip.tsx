/**
 * ShortcutTooltip Component
 * 
 * A tooltip component that displays keyboard shortcut hints.
 * Shows the shortcut keys in a visually appealing format.
 * 
 * Requirements: 26.11
 */

'use client';

import { ReactNode } from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { getModifierSymbol } from '@/hooks/office/messaging/use-keyboard-shortcuts';

// ============================================================================
// Props
// ============================================================================

interface ShortcutTooltipProps {
  children: ReactNode;
  content: string;
  shortcut?: string | string[];
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
  delayDuration?: number;
}

// ============================================================================
// Component
// ============================================================================

export function ShortcutTooltip({
  children,
  content,
  shortcut,
  side = 'top',
  align = 'center',
  delayDuration = 300,
}: ShortcutTooltipProps) {
  const modifierSymbol = getModifierSymbol();

  // Format shortcut keys
  const formatShortcutKeys = (keys: string | string[]): string[] => {
    const keyArray = Array.isArray(keys) ? keys : [keys];
    return keyArray.map((key) => {
      // Replace Ctrl/Cmd with platform-specific symbol
      if (key === 'Ctrl' || key === 'Cmd') {
        return modifierSymbol;
      }
      return key;
    });
  };

  const shortcutKeys = shortcut ? formatShortcutKeys(shortcut) : [];

  return (
    <TooltipPrimitive.Provider delayDuration={delayDuration}>
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger asChild>
          {children}
        </TooltipPrimitive.Trigger>
        
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            side={side}
            align={align}
            sideOffset={5}
            className="z-50 overflow-hidden rounded-lg bg-gray-900 px-3 py-2 text-sm text-white shadow-lg animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95"
          >
            <div className="flex items-center gap-2">
              <span>{content}</span>
              
              {shortcutKeys.length > 0 && (
                <div className="flex items-center gap-1 ml-2 pl-2 border-l border-gray-700">
                  {shortcutKeys.map((key, index) => (
                    <div key={index} className="flex items-center gap-1">
                      <kbd className="inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-semibold bg-gray-800 border border-gray-700 rounded min-w-5">
                        {key}
                      </kbd>
                      {index < shortcutKeys.length - 1 && (
                        <span className="text-gray-500 text-xs">+</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <TooltipPrimitive.Arrow className="fill-gray-900" />
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
}

// ============================================================================
// Preset Shortcuts
// ============================================================================

interface ShortcutTooltipPresetProps {
  children: ReactNode;
  action: 'send' | 'search' | 'new' | 'pin' | 'star' | 'archive' | 'resolve' | 'close';
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
}

export function ShortcutTooltipPreset({
  children,
  action,
  side,
  align,
}: ShortcutTooltipPresetProps) {
  const modKey = getModifierSymbol();

  const presets: Record<string, { content: string; shortcut: string[] }> = {
    send: {
      content: 'Send message',
      shortcut: [modKey, 'Enter'],
    },
    search: {
      content: 'Search',
      shortcut: [modKey, 'F'],
    },
    new: {
      content: 'New conversation',
      shortcut: [modKey, 'N'],
    },
    pin: {
      content: 'Pin conversation',
      shortcut: [modKey, 'Shift', 'P'],
    },
    star: {
      content: 'Star conversation',
      shortcut: [modKey, 'Shift', 'S'],
    },
    archive: {
      content: 'Archive conversation',
      shortcut: [modKey, 'Shift', 'E'],
    },
    resolve: {
      content: 'Resolve conversation',
      shortcut: [modKey, 'Shift', 'R'],
    },
    close: {
      content: 'Close',
      shortcut: ['Escape'],
    },
  };

  const preset = presets[action];

  if (!preset) {
    return <>{children}</>;
  }

  return (
    <ShortcutTooltip
      content={preset.content}
      shortcut={preset.shortcut}
      side={side}
      align={align}
    >
      {children}
    </ShortcutTooltip>
  );
}

