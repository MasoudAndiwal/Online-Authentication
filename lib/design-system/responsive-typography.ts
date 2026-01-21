/**
 * Responsive Typography System
 * 
 * Provides responsive font sizes and line heights that scale appropriately
 * for different device sizes while maintaining readability.
 * 
 * Requirements: 21.4
 */

import React from 'react';

// ============================================================================
// Type Definitions
// ============================================================================

export type TypographyScale = 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
export type DeviceSize = 'mobile' | 'tablet' | 'desktop';

// ============================================================================
// Typography Configuration
// ============================================================================

/**
 * Base font sizes for each scale level across different device sizes.
 * Values are in rem units for accessibility (respects user's browser font size).
 */
export const responsiveFontSizes: Record<TypographyScale, Record<DeviceSize, string>> = {
  xs: {
    mobile: '0.75rem',   // 12px
    tablet: '0.75rem',   // 12px
    desktop: '0.75rem',  // 12px
  },
  sm: {
    mobile: '0.813rem',  // 13px
    tablet: '0.875rem',  // 14px
    desktop: '0.875rem', // 14px
  },
  base: {
    mobile: '0.875rem',  // 14px
    tablet: '1rem',      // 16px
    desktop: '1rem',     // 16px
  },
  lg: {
    mobile: '1rem',      // 16px
    tablet: '1.125rem',  // 18px
    desktop: '1.125rem', // 18px
  },
  xl: {
    mobile: '1.125rem',  // 18px
    tablet: '1.25rem',   // 20px
    desktop: '1.25rem',  // 20px
  },
  '2xl': {
    mobile: '1.25rem',   // 20px
    tablet: '1.5rem',    // 24px
    desktop: '1.5rem',   // 24px
  },
  '3xl': {
    mobile: '1.5rem',    // 24px
    tablet: '1.875rem',  // 30px
    desktop: '1.875rem', // 30px
  },
  '4xl': {
    mobile: '1.875rem',  // 30px
    tablet: '2.25rem',   // 36px
    desktop: '2.25rem',  // 36px
  },
};

/**
 * Line heights for optimal readability at each scale.
 */
export const lineHeights: Record<TypographyScale, number> = {
  xs: 1.4,
  sm: 1.5,
  base: 1.5,
  lg: 1.5,
  xl: 1.4,
  '2xl': 1.3,
  '3xl': 1.2,
  '4xl': 1.2,
};

/**
 * Font weights for different text styles.
 */
export const fontWeights = {
  normal: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
} as const;

// ============================================================================
// CSS Classes
// ============================================================================

/**
 * Generates responsive typography CSS classes.
 * These can be used directly in Tailwind or as inline styles.
 */
export const typographyClasses: Record<TypographyScale, string> = {
  xs: 'text-xs md:text-xs',
  sm: 'text-[0.813rem] md:text-sm',
  base: 'text-sm md:text-base',
  lg: 'text-base md:text-lg',
  xl: 'text-lg md:text-xl',
  '2xl': 'text-xl md:text-2xl',
  '3xl': 'text-2xl md:text-3xl',
  '4xl': 'text-3xl md:text-4xl',
};

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Get font size for a specific scale and device size.
 */
export function getFontSize(scale: TypographyScale, deviceSize: DeviceSize): string {
  return responsiveFontSizes[scale][deviceSize];
}

/**
 * Get line height for a specific scale.
 */
export function getLineHeight(scale: TypographyScale): number {
  return lineHeights[scale];
}

/**
 * Generate inline style object for responsive typography.
 */
export function getTypographyStyle(
  scale: TypographyScale,
  deviceSize: DeviceSize,
  weight?: keyof typeof fontWeights
): React.CSSProperties {
  return {
    fontSize: getFontSize(scale, deviceSize),
    lineHeight: getLineHeight(scale),
    fontWeight: weight ? fontWeights[weight] : fontWeights.normal,
  };
}

/**
 * Detect current device size based on window width.
 */
export function getDeviceSize(): DeviceSize {
  if (typeof window === 'undefined') return 'desktop';
  
  const width = window.innerWidth;
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
}

// ============================================================================
// React Hook
// ============================================================================

/**
 * Hook to get current device size and responsive typography utilities.
 */
export function useResponsiveTypography() {
  const [deviceSize, setDeviceSize] = React.useState<DeviceSize>('desktop');

  React.useEffect(() => {
    const updateDeviceSize = () => {
      setDeviceSize(getDeviceSize());
    };

    updateDeviceSize();
    window.addEventListener('resize', updateDeviceSize);
    return () => window.removeEventListener('resize', updateDeviceSize);
  }, []);

  return {
    deviceSize,
    getFontSize: (scale: TypographyScale) => getFontSize(scale, deviceSize),
    getLineHeight,
    getTypographyStyle: (scale: TypographyScale, weight?: keyof typeof fontWeights) =>
      getTypographyStyle(scale, deviceSize, weight),
  };
}

// ============================================================================
// Tailwind CSS Configuration
// ============================================================================

/**
 * Configuration object for Tailwind CSS theme extension.
 * Add this to your tailwind.config.js:
 * 
 * theme: {
 *   extend: {
 *     fontSize: responsiveFontSizeConfig,
 *   }
 * }
 */
export const responsiveFontSizeConfig = {
  'xs': ['0.75rem', { lineHeight: '1.4' }],
  'sm': ['0.875rem', { lineHeight: '1.5' }],
  'base': ['1rem', { lineHeight: '1.5' }],
  'lg': ['1.125rem', { lineHeight: '1.5' }],
  'xl': ['1.25rem', { lineHeight: '1.4' }],
  '2xl': ['1.5rem', { lineHeight: '1.3' }],
  '3xl': ['1.875rem', { lineHeight: '1.2' }],
  '4xl': ['2.25rem', { lineHeight: '1.2' }],
};

// ============================================================================
// CSS-in-JS Styles
// ============================================================================

/**
 * Global CSS for responsive typography.
 * Can be injected into a <style> tag or used with CSS-in-JS libraries.
 */
export const responsiveTypographyCSS = `
  /* Mobile-first responsive typography */
  .text-responsive-xs { font-size: 0.75rem; line-height: 1.4; }
  .text-responsive-sm { font-size: 0.813rem; line-height: 1.5; }
  .text-responsive-base { font-size: 0.875rem; line-height: 1.5; }
  .text-responsive-lg { font-size: 1rem; line-height: 1.5; }
  .text-responsive-xl { font-size: 1.125rem; line-height: 1.4; }
  .text-responsive-2xl { font-size: 1.25rem; line-height: 1.3; }
  .text-responsive-3xl { font-size: 1.5rem; line-height: 1.2; }
  .text-responsive-4xl { font-size: 1.875rem; line-height: 1.2; }

  /* Tablet breakpoint (768px) */
  @media (min-width: 768px) {
    .text-responsive-sm { font-size: 0.875rem; }
    .text-responsive-base { font-size: 1rem; }
    .text-responsive-lg { font-size: 1.125rem; }
    .text-responsive-xl { font-size: 1.25rem; }
    .text-responsive-2xl { font-size: 1.5rem; }
    .text-responsive-3xl { font-size: 1.875rem; }
    .text-responsive-4xl { font-size: 2.25rem; }
  }

  /* Desktop breakpoint (1024px) */
  @media (min-width: 1024px) {
    /* Same as tablet for most scales */
  }
`;

// ============================================================================
// Export Everything
// ============================================================================

export default {
  responsiveFontSizes,
  lineHeights,
  fontWeights,
  typographyClasses,
  getFontSize,
  getLineHeight,
  getTypographyStyle,
  getDeviceSize,
  useResponsiveTypography,
  responsiveFontSizeConfig,
  responsiveTypographyCSS,
};
