 /**
 * Responsive Utilities Hook
 * Provides responsive breakpoint detection and utilities
 */

import * as React from 'react';

export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

export interface BreakpointValues {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  '2xl': number;
}

// Tailwind default breakpoints
export const breakpoints: BreakpointValues = {
  xs: 475,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
};

export interface ResponsiveState {
  width: number;
  height: number;
  breakpoint: Breakpoint;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isTouch: boolean;
  orientation: 'portrait' | 'landscape';
}

/**
 * Hook to get current responsive state
 */
export function useResponsive(): ResponsiveState {
  const [state, setState] = React.useState<ResponsiveState>(() => {
    if (typeof window === 'undefined') {
      return {
        width: 0,
        height: 0,
        breakpoint: 'lg',
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        isTouch: false,
        orientation: 'landscape',
      };
    }

    return getResponsiveState();
  });

  React.useEffect(() => {
    const handleResize = () => {
      setState(getResponsiveState());
    };

    const handleOrientationChange = () => {
      // Small delay to ensure dimensions are updated
      setTimeout(() => {
        setState(getResponsiveState());
      }, 100);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientationChange);

    // Initial check
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, []);

  return state;
}

/**
 * Get current responsive state
 */
function getResponsiveState(): ResponsiveState {
  const width = window.innerWidth;
  const height = window.innerHeight;

  const breakpoint = getCurrentBreakpoint(width);
  const isMobile = width < breakpoints.md;
  const isTablet = width >= breakpoints.md && width < breakpoints.lg;
  const isDesktop = width >= breakpoints.lg;
  const isTouch =
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    // @ts-expect-error - msMaxTouchPoints is not in TypeScript types
    navigator.msMaxTouchPoints > 0;
  const orientation = width > height ? 'landscape' : 'portrait';

  return {
    width,
    height,
    breakpoint,
    isMobile,
    isTablet,
    isDesktop,
    isTouch,
    orientation,
  };
}

/**
 * Get current breakpoint based on width
 */
function getCurrentBreakpoint(width: number): Breakpoint {
  if (width < breakpoints.xs) return 'xs';
  if (width < breakpoints.sm) return 'xs';
  if (width < breakpoints.md) return 'sm';
  if (width < breakpoints.lg) return 'md';
  if (width < breakpoints.xl) return 'lg';
  if (width < breakpoints['2xl']) return 'xl';
  return '2xl';
}

/**
 * Hook to check if current breakpoint matches
 */
export function useBreakpoint(breakpoint: Breakpoint): boolean {
  const { width } = useResponsive();
  return width >= breakpoints[breakpoint];
}

/**
 * Hook to get value based on current breakpoint
 */
export function useBreakpointValue<T>(values: Partial<Record<Breakpoint, T>>): T | undefined {
  const { breakpoint } = useResponsive();

  // Find the closest matching breakpoint value
  const breakpointOrder: Breakpoint[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'];
  const currentIndex = breakpointOrder.indexOf(breakpoint);

  // Look for value at current breakpoint or closest smaller breakpoint
  for (let i = currentIndex; i >= 0; i--) {
    const bp = breakpointOrder[i];
    if (values[bp] !== undefined) {
      return values[bp];
    }
  }

  return undefined;
}

/**
 * Hook for media query matching
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = React.useState(false);

  React.useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    setMatches(mediaQuery.matches);

    const handler = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [query]);

  return matches;
}

/**
 * Hook to detect if user prefers reduced motion
 */
export function usePrefersReducedMotion(): boolean {
  return useMediaQuery('(prefers-reduced-motion: reduce)');
}

/**
 * Hook to detect if device is in landscape mode
 */
export function useIsLandscape(): boolean {
  const { orientation } = useResponsive();
  return orientation === 'landscape';
}

/**
 * Hook to detect if device is in portrait mode
 */
export function useIsPortrait(): boolean {
  const { orientation } = useResponsive();
  return orientation === 'portrait';
}
