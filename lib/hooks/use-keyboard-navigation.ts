/**
 * Custom hook for keyboard navigation in grids and lists
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { handleGridNavigation } from '@/lib/utils/accessibility';

interface UseKeyboardNavigationOptions {
  totalItems: number;
  columns?: number;
  enabled?: boolean;
  onSelect?: (index: number) => void;
  loop?: boolean;
}

export function useKeyboardNavigation({
  totalItems,
  columns = 1,
  enabled = true,
  onSelect,
  loop = false,
}: UseKeyboardNavigationOptions) {
  const [focusedIndex, setFocusedIndex] = useState(0);
  const itemRefs = useRef<(HTMLElement | null)[]>([]);

  // Initialize refs array
  useEffect(() => {
    itemRefs.current = itemRefs.current.slice(0, totalItems);
  }, [totalItems]);

  const setItemRef = useCallback((index: number) => {
    return (element: HTMLElement | null) => {
      itemRefs.current[index] = element;
    };
  }, []);

  const focusItem = useCallback((index: number) => {
    const item = itemRefs.current[index];
    if (item) {
      item.focus();
      setFocusedIndex(index);
    }
  }, []);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (!enabled) return;

      handleGridNavigation(
        event,
        focusedIndex,
        totalItems,
        columns,
        (newIndex) => {
          focusItem(newIndex);
        }
      );

      // Handle Enter/Space for selection
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        onSelect?.(focusedIndex);
      }
    },
    [enabled, focusedIndex, totalItems, columns, focusItem, onSelect]
  );

  return {
    focusedIndex,
    setFocusedIndex,
    setItemRef,
    focusItem,
    handleKeyDown,
    itemRefs,
  };
}
