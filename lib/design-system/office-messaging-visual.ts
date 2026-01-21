/**
 * Office Messaging Visual Design System
 * 
 * Centralized design tokens for the Office User Dashboard Messaging System
 * Includes: colors, gradients, shadows, glassmorphism, animations, typography
 */

// ============================================================================
// COLOR PALETTE
// ============================================================================

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

// ============================================================================
// GLASSMORPHISM EFFECTS
// ============================================================================

export const glassmorphism = {
  // Standard glass effect for sidebars and panels
  standard: {
    background: 'rgba(255, 255, 255, 0.7)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
  },

  // Strong glass effect for modals and dialogs
  strong: {
    background: 'rgba(255, 255, 255, 0.85)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.4)',
    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.1)',
  },

  // Subtle glass effect for compose area and inputs
  subtle: {
    background: 'rgba(255, 255, 255, 0.6)',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    boxShadow: '0 4px 16px 0 rgba(31, 38, 135, 0.05)',
  },

  // Dark glass effect for overlays
  dark: {
    background: 'rgba(0, 0, 0, 0.4)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
  },
} as const;

// ============================================================================
// BUTTON STYLES
// ============================================================================

export const buttonStyles = {
  // Primary Button (Gradient-filled)
  primary: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: '#FFFFFF',
    padding: '0.75rem 1.5rem',
    borderRadius: '0.5rem',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    border: 'none',
    transition: 'all 0.25s ease',
    hover: {
      transform: 'translateY(-2px)',
      boxShadow: '0 6px 12px rgba(0,0,0,0.15)',
    },
    active: {
      transform: 'translateY(0)',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    },
  },

  // Secondary Button (Solid color)
  secondary: {
    background: '#2196F3',
    color: '#FFFFFF',
    padding: '0.75rem 1.5rem',
    borderRadius: '0.5rem',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    border: 'none',
    transition: 'all 0.25s ease',
    hover: {
      background: '#1976D2',
      transform: 'translateY(-1px)',
      boxShadow: '0 4px 8px rgba(0,0,0,0.12)',
    },
    active: {
      background: '#1565C0',
      transform: 'translateY(0)',
    },
  },

  // Icon Button
  icon: {
    background: 'rgba(255, 255, 255, 0.7)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    padding: '0.5rem',
    borderRadius: '0.5rem',
    border: 'none',
    transition: 'all 0.25s ease',
    hover: {
      background: 'rgba(255, 255, 255, 0.9)',
      transform: 'scale(1.05)',
    },
    active: {
      transform: 'scale(0.95)',
    },
  },

  // Danger Button
  danger: {
    background: 'linear-gradient(135deg, #F44336 0%, #D32F2F 100%)',
    color: '#FFFFFF',
    padding: '0.75rem 1.5rem',
    borderRadius: '0.5rem',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    border: 'none',
    transition: 'all 0.25s ease',
    hover: {
      transform: 'translateY(-2px)',
      boxShadow: '0 6px 12px rgba(0,0,0,0.15)',
    },
  },

  // Success Button
  success: {
    background: 'linear-gradient(135deg, #4CAF50 0%, #388E3C 100%)',
    color: '#FFFFFF',
    padding: '0.75rem 1.5rem',
    borderRadius: '0.5rem',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    border: 'none',
    transition: 'all 0.25s ease',
    hover: {
      transform: 'translateY(-2px)',
      boxShadow: '0 6px 12px rgba(0,0,0,0.15)',
    },
  },
} as const;

// ============================================================================
// TYPOGRAPHY
// ============================================================================

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

// ============================================================================
// SPACING SYSTEM
// ============================================================================

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

// ============================================================================
// ANIMATION SYSTEM
// ============================================================================

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

  // Framer Motion Variants
  variants: {
    // Message send animation
    messageSend: {
      initial: { opacity: 0, y: 20, scale: 0.95 },
      animate: { opacity: 1, y: 0, scale: 1 },
      transition: { duration: 0.25, ease: [0, 0, 0.2, 1] },
    },

    // Message receive animation
    messageReceive: {
      initial: { opacity: 0, x: -20 },
      animate: { opacity: 1, x: 0 },
      transition: { duration: 0.3, ease: [0, 0, 0.2, 1] },
    },

    // Typing indicator animation
    typingDots: {
      animate: {
        y: [0, -8, 0],
      },
      transition: {
        duration: 0.6,
        repeat: Infinity,
        ease: 'easeInOut',
        times: [0, 0.5, 1],
      },
    },

    // Button hover animation
    buttonHover: {
      whileHover: { scale: 1.05, y: -2 },
      whileTap: { scale: 0.95 },
      transition: { duration: 0.15 },
    },

    // Notification slide-in
    notificationSlide: {
      initial: { x: 300, opacity: 0 },
      animate: { x: 0, opacity: 1 },
      exit: { x: 300, opacity: 0 },
      transition: { duration: 0.3, ease: [0, 0, 0.2, 1] },
    },

    // Reaction animation
    reactionPop: {
      initial: { scale: 0 },
      animate: { scale: [0, 1.2, 1] },
      transition: { duration: 0.3, ease: [0, 0, 0.2, 1] },
    },

    // Unread badge pulse
    unreadPulse: {
      animate: {
        scale: [1, 1.1, 1],
        opacity: [1, 0.8, 1],
      },
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },

    // Modal backdrop
    modalBackdrop: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: { duration: 0.2 },
    },

    // Modal content
    modalContent: {
      initial: { scale: 0.9, opacity: 0 },
      animate: { scale: 1, opacity: 1 },
      exit: { scale: 0.9, opacity: 0 },
      transition: { duration: 0.25, ease: [0, 0, 0.2, 1] },
    },

    // Sidebar slide
    sidebarSlide: {
      initial: { x: -320 },
      animate: { x: 0 },
      exit: { x: -320 },
      transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
    },

    // Loading spinner
    spinner: {
      animate: { rotate: 360 },
      transition: { duration: 1, repeat: Infinity, ease: 'linear' },
    },

    // Fade in
    fadeIn: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: { duration: 0.2 },
    },

    // Scale in
    scaleIn: {
      initial: { scale: 0.95, opacity: 0 },
      animate: { scale: 1, opacity: 1 },
      exit: { scale: 0.95, opacity: 0 },
      transition: { duration: 0.2 },
    },
  },
} as const;

// ============================================================================
// SHADOW SYSTEM
// ============================================================================

export const shadows = {
  none: 'none',
  sm: '0 2px 4px rgba(0,0,0,0.05)',
  md: '0 4px 6px rgba(0,0,0,0.07)',
  lg: '0 10px 15px rgba(0,0,0,0.1)',
  xl: '0 20px 25px rgba(0,0,0,0.15)',
  '2xl': '0 25px 50px rgba(0,0,0,0.2)',
  glow: '0 0 20px rgba(33, 150, 243, 0.3)',
  glowStrong: '0 0 30px rgba(33, 150, 243, 0.5)',
  inner: 'inset 0 2px 4px rgba(0,0,0,0.06)',
} as const;

// ============================================================================
// BORDER RADIUS
// ============================================================================

export const borderRadius = {
  none: '0',
  sm: '0.25rem',   // 4px
  md: '0.5rem',    // 8px
  lg: '0.75rem',   // 12px
  xl: '1rem',      // 16px
  '2xl': '1.5rem', // 24px
  full: '9999px',
} as const;

// ============================================================================
// BREAKPOINTS
// ============================================================================

export const breakpoints = {
  mobile: '0px',      // 0 - 767px
  tablet: '768px',    // 768px - 1023px
  desktop: '1024px',  // 1024px+
  wide: '1440px',     // 1440px+
} as const;

// ============================================================================
// Z-INDEX SYSTEM
// ============================================================================

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

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Apply glassmorphism effect to an element
 */
export const applyGlassmorphism = (variant: keyof typeof glassmorphism = 'standard') => {
  return glassmorphism[variant];
};

/**
 * Apply button styles
 */
export const applyButtonStyle = (variant: keyof typeof buttonStyles = 'primary') => {
  return buttonStyles[variant];
};

/**
 * Get shadow by name
 */
export const getShadow = (name: keyof typeof shadows = 'md') => {
  return shadows[name];
};

/**
 * Get animation variant
 */
export const getAnimationVariant = (name: keyof typeof animations.variants) => {
  return animations.variants[name];
};
