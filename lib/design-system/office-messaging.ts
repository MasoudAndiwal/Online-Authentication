/**
 * Office Messaging System Design System
 * 
 * This file contains all design tokens for the Office User Dashboard Messaging System
 * including colors, typography, spacing, shadows, and animation configurations.
 * 
 * Requirements: 22.1, 22.2, 22.3, 22.4, 22.5, 22.6, 22.7
 */

// Color Palette
export const colors = {
  // Primary Blues (Professional Theme)
  primary: {
    50: '#E3F2FD',
    100: '#BBDEFB',
    200: '#90CAF9',
    300: '#64B5F6',
    400: '#42A5F5',
    500: '#2196F3', // Main brand blue
    600: '#1E88E5',
    700: '#1976D2',
    800: '#1565C0',
    900: '#0D47A1',
  },
  
  // Gradients
  gradients: {
    primary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    blue: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)',
    success: 'linear-gradient(135deg, #4CAF50 0%, #388E3C 100%)',
    warning: 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)',
    danger: 'linear-gradient(135deg, #F44336 0%, #D32F2F 100%)',
    glass: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
  },
  
  // Status Colors
  status: {
    sent: '#90CAF9',
    delivered: '#64B5F6',
    read: '#2196F3',
    failed: '#F44336',
  },
  
  // Priority Colors
  priority: {
    normal: '#9E9E9E',
    important: '#FF9800',
    urgent: '#F44336',
  },
  
  // Backgrounds
  background: {
    primary: '#FFFFFF',
    secondary: '#F5F7FA',
    glass: 'rgba(255, 255, 255, 0.7)',
    glassDark: 'rgba(0, 0, 0, 0.05)',
  },
  
  // Text
  text: {
    primary: '#212121',
    secondary: '#757575',
    disabled: '#BDBDBD',
    inverse: '#FFFFFF',
  },
  
  // Shadows
  shadows: {
    sm: '0 2px 4px rgba(0,0,0,0.05)',
    md: '0 4px 6px rgba(0,0,0,0.07)',
    lg: '0 10px 15px rgba(0,0,0,0.1)',
    xl: '0 20px 25px rgba(0,0,0,0.15)',
    glow: '0 0 20px rgba(33, 150, 243, 0.3)',
  },
} as const;

// Typography System
export const typography = {
  fontFamily: {
    primary: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    rtl: "'Vazirmatn', 'Noto Sans Arabic', sans-serif", // For Dari/Pashto
  },
  
  fontSize: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem', // 30px
  },
  
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
} as const;

// Spacing System
export const spacing = {
  0: '0',
  1: '0.25rem',  // 4px
  2: '0.5rem',   // 8px
  3: '0.75rem',  // 12px
  4: '1rem',     // 16px
  5: '1.25rem',  // 20px
  6: '1.5rem',   // 24px
  8: '2rem',     // 32px
  10: '2.5rem',  // 40px
  12: '3rem',    // 48px
  16: '4rem',    // 64px
} as const;

// Animation System
export const animations = {
  // Durations
  duration: {
    fast: '150ms',
    normal: '250ms',
    slow: '350ms',
  },
  
  // Easing Functions
  easing: {
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    spring: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },
  
  // Keyframes
  keyframes: {
    fadeIn: {
      from: { opacity: 0 },
      to: { opacity: 1 },
    },
    slideInRight: {
      from: { transform: 'translateX(100%)' },
      to: { transform: 'translateX(0)' },
    },
    slideInLeft: {
      from: { transform: 'translateX(-100%)' },
      to: { transform: 'translateX(0)' },
    },
    scaleIn: {
      from: { transform: 'scale(0.95)', opacity: 0 },
      to: { transform: 'scale(1)', opacity: 1 },
    },
    pulse: {
      '0%, 100%': { opacity: 1 },
      '50%': { opacity: 0.5 },
    },
    bounce: {
      '0%, 100%': { transform: 'translateY(0)' },
      '50%': { transform: 'translateY(-10px)' },
    },
  },
} as const;

// Glassmorphism Effect Styles
export const glassmorphism = {
  light: {
    background: 'rgba(255, 255, 255, 0.7)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
  },
  medium: {
    background: 'rgba(255, 255, 255, 0.5)',
    backdropFilter: 'blur(15px)',
    WebkitBackdropFilter: 'blur(15px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
  },
  dark: {
    background: 'rgba(0, 0, 0, 0.05)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    border: '1px solid rgba(0, 0, 0, 0.1)',
  },
} as const;

// Breakpoints for Responsive Design
export const breakpoints = {
  mobile: '768px',
  tablet: '1024px',
  desktop: '1280px',
} as const;

// Z-Index Scale
export const zIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1100,
  fixed: 1200,
  modalBackdrop: 1300,
  modal: 1400,
  popover: 1500,
  tooltip: 1600,
} as const;

// Border Radius
export const borderRadius = {
  none: '0',
  sm: '0.25rem',   // 4px
  md: '0.5rem',    // 8px
  lg: '0.75rem',   // 12px
  xl: '1rem',      // 16px
  '2xl': '1.5rem', // 24px
  full: '9999px',
} as const;

// Transition Presets
export const transitions = {
  fast: `all ${animations.duration.fast} ${animations.easing.easeOut}`,
  normal: `all ${animations.duration.normal} ${animations.easing.easeInOut}`,
  slow: `all ${animations.duration.slow} ${animations.easing.easeOut}`,
} as const;

// Export all design tokens
export const designSystem = {
  colors,
  typography,
  spacing,
  animations,
  glassmorphism,
  breakpoints,
  zIndex,
  borderRadius,
  transitions,
} as const;

export default designSystem;
