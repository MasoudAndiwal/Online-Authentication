/**
 * Accessibility Utilities for WCAG 2.1 AA Compliance
 * Provides utilities for keyboard navigation, focus management, and screen reader support
 */

/**
 * Manages focus trap within a container (e.g., modals, dialogs)
 */
export function createFocusTrap(container: HTMLElement) {
  const focusableElements = container.querySelectorAll<HTMLElement>(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  
  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return;

    if (e.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstElement) {
        e.preventDefault();
        lastElement?.focus();
      }
    } else {
      // Tab
      if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement?.focus();
      }
    }
  };

  container.addEventListener('keydown', handleKeyDown);

  // Return cleanup function
  return () => {
    container.removeEventListener('keydown', handleKeyDown);
  };
}

/**
 * Announces content to screen readers using ARIA live regions
 */
export function announceToScreenReader(
  message: string,
  priority: 'polite' | 'assertive' = 'polite'
) {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;

  document.body.appendChild(announcement);

  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

/**
 * Manages focus restoration when navigating between views
 */
export class FocusManager {
  private previousFocus: HTMLElement | null = null;

  saveFocus() {
    this.previousFocus = document.activeElement as HTMLElement;
  }

  restoreFocus() {
    if (this.previousFocus && typeof this.previousFocus.focus === 'function') {
      this.previousFocus.focus();
    }
  }

  setFocus(element: HTMLElement | null) {
    if (element && typeof element.focus === 'function') {
      // Use setTimeout to ensure DOM is ready
      setTimeout(() => {
        element.focus();
      }, 0);
    }
  }
}

/**
 * Generates unique IDs for ARIA relationships
 */
let idCounter = 0;
export function generateAriaId(prefix: string = 'aria'): string {
  return `${prefix}-${++idCounter}`;
}

/**
 * Keyboard navigation handler for grid/list patterns
 */
export function handleGridNavigation(
  event: React.KeyboardEvent,
  currentIndex: number,
  totalItems: number,
  columns: number,
  onNavigate: (newIndex: number) => void
) {
  const rows = Math.ceil(totalItems / columns);
  const currentRow = Math.floor(currentIndex / columns);
  const currentCol = currentIndex % columns;

  let newIndex = currentIndex;

  switch (event.key) {
    case 'ArrowRight':
      event.preventDefault();
      newIndex = Math.min(currentIndex + 1, totalItems - 1);
      break;
    case 'ArrowLeft':
      event.preventDefault();
      newIndex = Math.max(currentIndex - 1, 0);
      break;
    case 'ArrowDown':
      event.preventDefault();
      newIndex = Math.min(currentIndex + columns, totalItems - 1);
      break;
    case 'ArrowUp':
      event.preventDefault();
      newIndex = Math.max(currentIndex - columns, 0);
      break;
    case 'Home':
      event.preventDefault();
      newIndex = currentRow * columns; // First item in current row
      break;
    case 'End':
      event.preventDefault();
      newIndex = Math.min((currentRow + 1) * columns - 1, totalItems - 1); // Last item in current row
      break;
    case 'PageDown':
      event.preventDefault();
      newIndex = Math.min(currentIndex + columns * 3, totalItems - 1); // Move down 3 rows
      break;
    case 'PageUp':
      event.preventDefault();
      newIndex = Math.max(currentIndex - columns * 3, 0); // Move up 3 rows
      break;
  }

  if (newIndex !== currentIndex) {
    onNavigate(newIndex);
  }
}

/**
 * Checks if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Skip to content link for keyboard navigation
 */
export function createSkipLink(targetId: string, label: string = 'Skip to main content') {
  return {
    href: `#${targetId}`,
    label,
    className: 'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-orange-600 focus:text-white focus:rounded-lg focus:shadow-lg',
  };
}

/**
 * Validates color contrast for WCAG AA compliance
 */
export function getContrastRatio(foreground: string, background: string): number {
  // Simplified contrast calculation - in production, use a proper library
  // This is a placeholder for demonstration
  return 4.5; // WCAG AA requires 4.5:1 for normal text
}

/**
 * Keyboard shortcut manager
 */
export class KeyboardShortcutManager {
  private shortcuts: Map<string, () => void> = new Map();

  register(key: string, callback: () => void, modifiers?: {
    ctrl?: boolean;
    alt?: boolean;
    shift?: boolean;
  }) {
    const shortcutKey = this.createShortcutKey(key, modifiers);
    this.shortcuts.set(shortcutKey, callback);
  }

  unregister(key: string, modifiers?: {
    ctrl?: boolean;
    alt?: boolean;
    shift?: boolean;
  }) {
    const shortcutKey = this.createShortcutKey(key, modifiers);
    this.shortcuts.delete(shortcutKey);
  }

  handleKeyDown(event: KeyboardEvent) {
    const shortcutKey = this.createShortcutKey(event.key, {
      ctrl: event.ctrlKey,
      alt: event.altKey,
      shift: event.shiftKey,
    });

    const callback = this.shortcuts.get(shortcutKey);
    if (callback) {
      event.preventDefault();
      callback();
    }
  }

  private createShortcutKey(key: string, modifiers?: {
    ctrl?: boolean;
    alt?: boolean;
    shift?: boolean;
  }): string {
    const parts = [];
    if (modifiers?.ctrl) parts.push('ctrl');
    if (modifiers?.alt) parts.push('alt');
    if (modifiers?.shift) parts.push('shift');
    parts.push(key.toLowerCase());
    return parts.join('+');
  }
}

/**
 * ARIA live region announcer component helper
 */
export function createLiveRegion(priority: 'polite' | 'assertive' = 'polite') {
  const region = document.createElement('div');
  region.setAttribute('role', 'status');
  region.setAttribute('aria-live', priority);
  region.setAttribute('aria-atomic', 'true');
  region.className = 'sr-only';
  document.body.appendChild(region);

  return {
    announce: (message: string) => {
      region.textContent = message;
    },
    destroy: () => {
      document.body.removeChild(region);
    },
  };
}
