/**
 * Custom hook for managing focus trap in modals and dialogs
 */

import { useEffect, useRef } from 'react';
import { createFocusTrap, FocusManager } from '@/lib/utils/accessibility';

interface UseFocusTrapOptions {
  enabled?: boolean;
  restoreFocus?: boolean;
  initialFocus?: HTMLElement | null;
}

export function useFocusTrap({
  enabled = true,
  restoreFocus = true,
  initialFocus = null,
}: UseFocusTrapOptions = {}) {
  const containerRef = useRef<HTMLElement | null>(null);
  const focusManagerRef = useRef(new FocusManager());

  useEffect(() => {
    if (!enabled || !containerRef.current) return;

    const focusManager = focusManagerRef.current;

    // Save current focus
    if (restoreFocus) {
      focusManager.saveFocus();
    }

    // Set initial focus
    if (initialFocus) {
      focusManager.setFocus(initialFocus);
    } else {
      // Focus first focusable element
      const firstFocusable = containerRef.current.querySelector<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (firstFocusable) {
        focusManager.setFocus(firstFocusable);
      }
    }

    // Create focus trap
    const cleanup = createFocusTrap(containerRef.current);

    return () => {
      cleanup();
      if (restoreFocus) {
        focusManager.restoreFocus();
      }
    };
  }, [enabled, restoreFocus, initialFocus]);

  return containerRef;
}
