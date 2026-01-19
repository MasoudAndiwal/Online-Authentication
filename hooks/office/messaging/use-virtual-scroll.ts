/**
 * useVirtualScroll Hook
 * 
 * Custom hook for implementing virtual scrolling to improve performance with large lists.
 * Calculates visible items based on scroll position and provides scroll-to-index functionality.
 * 
 * Requirements: 24.4
 */

'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';

// ============================================================================
// Hook Interface
// ============================================================================

interface UseVirtualScrollOptions {
  itemHeight: number; // Fixed height for each item (in pixels)
  overscan?: number; // Number of items to render above/below viewport (default: 3)
  estimatedItemHeight?: number; // For variable height items (optional)
}

interface UseVirtualScrollReturn<T> {
  visibleItems: Array<{ item: T; index: number; offsetTop: number }>;
  totalHeight: number;
  scrollToIndex: (index: number, behavior?: ScrollBehavior) => void;
  containerRef: React.RefObject<HTMLDivElement>;
  isScrolling: boolean;
}

// ============================================================================
// Hook Implementation
// ============================================================================

/**
 * Hook for virtual scrolling
 * 
 * @param items - Array of items to virtualize
 * @param options - Configuration options
 * @returns Virtual scroll state and controls
 */
export function useVirtualScroll<T>(
  items: T[],
  options: UseVirtualScrollOptions
): UseVirtualScrollReturn<T> {
  const {
    itemHeight,
    overscan = 3,
    estimatedItemHeight,
  } = options;

  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // State
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);

  // ============================================================================
  // Calculate Visible Range
  // ============================================================================

  const { startIndex, endIndex, totalHeight } = useMemo(() => {
    if (!containerHeight || items.length === 0) {
      return { startIndex: 0, endIndex: 0, totalHeight: 0 };
    }

    const effectiveItemHeight = estimatedItemHeight || itemHeight;

    // Calculate which items are visible
    const start = Math.floor(scrollTop / effectiveItemHeight);
    const visibleCount = Math.ceil(containerHeight / effectiveItemHeight);
    const end = start + visibleCount;

    // Apply overscan
    const startWithOverscan = Math.max(0, start - overscan);
    const endWithOverscan = Math.min(items.length, end + overscan);

    // Calculate total height
    const total = items.length * effectiveItemHeight;

    return {
      startIndex: startWithOverscan,
      endIndex: endWithOverscan,
      totalHeight: total,
    };
  }, [scrollTop, containerHeight, items.length, itemHeight, estimatedItemHeight, overscan]);

  // ============================================================================
  // Get Visible Items
  // ============================================================================

  const visibleItems = useMemo(() => {
    const effectiveItemHeight = estimatedItemHeight || itemHeight;

    return items.slice(startIndex, endIndex).map((item, i) => ({
      item,
      index: startIndex + i,
      offsetTop: (startIndex + i) * effectiveItemHeight,
    }));
  }, [items, startIndex, endIndex, itemHeight, estimatedItemHeight]);

  // ============================================================================
  // Handle Scroll
  // ============================================================================

  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;

    const newScrollTop = containerRef.current.scrollTop;
    setScrollTop(newScrollTop);

    // Set scrolling state
    setIsScrolling(true);

    // Clear existing timeout
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    // Set timeout to detect when scrolling stops
    scrollTimeoutRef.current = setTimeout(() => {
      setIsScrolling(false);
    }, 150);
  }, []);

  // ============================================================================
  // Measure Container
  // ============================================================================

  const measureContainer = useCallback(() => {
    if (!containerRef.current) return;

    const height = containerRef.current.clientHeight;
    setContainerHeight(height);
  }, []);

  // ============================================================================
  // Scroll to Index
  // ============================================================================

  const scrollToIndex = useCallback((index: number, behavior: ScrollBehavior = 'smooth') => {
    if (!containerRef.current) return;

    const effectiveItemHeight = estimatedItemHeight || itemHeight;
    const targetScrollTop = index * effectiveItemHeight;

    containerRef.current.scrollTo({
      top: targetScrollTop,
      behavior,
    });
  }, [itemHeight, estimatedItemHeight]);

  // ============================================================================
  // Setup Event Listeners
  // ============================================================================

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Measure container on mount
    measureContainer();

    // Add scroll listener
    container.addEventListener('scroll', handleScroll, { passive: true });

    // Add resize observer to handle container size changes
    const resizeObserver = new ResizeObserver(() => {
      measureContainer();
    });
    resizeObserver.observe(container);

    // Cleanup
    return () => {
      container.removeEventListener('scroll', handleScroll);
      resizeObserver.disconnect();

      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [handleScroll, measureContainer]);

  // ============================================================================
  // Reset scroll when items change significantly
  // ============================================================================

  useEffect(() => {
    // If items array changes significantly, reset scroll to top
    if (containerRef.current && items.length === 0) {
      containerRef.current.scrollTop = 0;
      setScrollTop(0);
    }
  }, [items.length]);

  // ============================================================================
  // Return hook interface
  // ============================================================================

  return {
    visibleItems,
    totalHeight,
    scrollToIndex,
    containerRef,
    isScrolling,
  };
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Calculate optimal item height based on content
 */
export function calculateItemHeight(
  sampleElement: HTMLElement | null
): number {
  if (!sampleElement) return 80; // Default height

  const height = sampleElement.getBoundingClientRect().height;
  return Math.ceil(height);
}

/**
 * Get scroll percentage
 */
export function getScrollPercentage(container: HTMLElement): number {
  const { scrollTop, scrollHeight, clientHeight } = container;
  const maxScroll = scrollHeight - clientHeight;

  if (maxScroll <= 0) return 0;

  return (scrollTop / maxScroll) * 100;
}

/**
 * Check if scrolled to bottom
 */
export function isScrolledToBottom(
  container: HTMLElement,
  threshold: number = 50
): boolean {
  const { scrollTop, scrollHeight, clientHeight } = container;
  const distanceFromBottom = scrollHeight - scrollTop - clientHeight;

  return distanceFromBottom <= threshold;
}

/**
 * Check if scrolled to top
 */
export function isScrolledToTop(
  container: HTMLElement,
  threshold: number = 50
): boolean {
  return container.scrollTop <= threshold;
}

/**
 * Smooth scroll to top
 */
export function scrollToTop(
  container: HTMLElement,
  behavior: ScrollBehavior = 'smooth'
): void {
  container.scrollTo({
    top: 0,
    behavior,
  });
}

/**
 * Smooth scroll to bottom
 */
export function scrollToBottom(
  container: HTMLElement,
  behavior: ScrollBehavior = 'smooth'
): void {
  container.scrollTo({
    top: container.scrollHeight,
    behavior,
  });
}
