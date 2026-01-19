/**
 * Design System Tokens for Office User Dashboard Messaging System
 * 
 * This file contains all design tokens including colors, typography, spacing,
 * animations, and other visual design constants for the messaging system.
 * 
 * Requirements: 22.1, 22.2, 22.3, 22.4, 22.5, 22.6, 22.7
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
      transition: { duration: 0.25, ease: 'easeOut' },
    },
    
    // Message receive animation
    messageReceive: {
      initial: { opacity: 0, x: -20 },
      animate: { opacity: 1, x: 0 },
      transition: { duration: 0.3, ease: 'easeOut' },
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
      transition: { duration: 0.3, ease: 'easeOut' },
    },
    
    // Reaction animation
    reactionPop: {
      initial: { scale: 0 },
      animate: { scale: [0, 1.2, 1] },
      transition: { duration: 0.3, ease: 'easeOut' },
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
      transition: { duration: 0.25, ease: 'easeOut' },
    },
    
    // Sidebar slide
    sidebarSlide: {
      initial: { x: -320 },
      animate: { x: 0 },
      exit: { x: -320 },
      transition: { duration: 0.3, ease: 'easeInOut' },
    },
    
    // Loading spinner
    spinner: {
      animate: { rotate: 360 },
      transition: { duration: 1, repeat: Infinity, ease: 'linear' },
    },
  },
} as const;

// ============================================================================
// GLASSMORPHISM EFFECT
// ============================================================================

export const glassmorphism = {
  background: 'rgba(255, 255, 255, 0.7)',
  backdropFilter: 'blur(10px)',
  WebkitBackdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.3)',
  boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
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
    transition: 'all 0.25s ease',
    hover: {
      transform: 'translateY(-2px)',
      boxShadow: '0 6px 12px rgba(0,0,0,0.15)',
    },
  },
  
  // Secondary Button (Solid color)
  secondary: {
    background: '#2196F3',
    color: '#FFFFFF',
    padding: '0.75rem 1.5rem',
    borderRadius: '0.5rem',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    transition: 'all 0.25s ease',
    hover: {
      background: '#1976D2',
      transform: 'translateY(-1px)',
    },
  },
  
  // Icon Button
  icon: {
    background: 'rgba(255, 255, 255, 0.7)',
    backdropFilter: 'blur(10px)',
    padding: '0.5rem',
    borderRadius: '0.5rem',
    transition: 'all 0.25s ease',
    hover: {
      background: 'rgba(255, 255, 255, 0.9)',
      transform: 'scale(1.05)',
    },
  },
} as const;

// ============================================================================
// RESPONSIVE BREAKPOINTS
// ============================================================================

export const breakpoints = {
  mobile: '0px',      // 0 - 767px
  tablet: '768px',    // 768px - 1023px
  desktop: '1024px',  // 1024px+
  wide: '1440px',     // 1440px+
} as const;

// ============================================================================
// TOUCH TARGET SIZES
// ============================================================================

export const touchTargets = {
  minimum: '44px', // WCAG 2.1 AAA standard
  comfortable: '48px', // Recommended for primary actions
  icon: '40px', // Minimum for icon buttons
} as const;

// ============================================================================
// LAYOUT DIMENSIONS
// ============================================================================

export const layout = {
  sidebar: {
    mobile: '100%',
    tablet: '280px',
    desktop: '320px',
  },
  header: {
    height: '60px',
  },
  composeArea: {
    minHeight: '80px',
    maxHeight: '200px',
  },
} as const;

// ============================================================================
// VIRTUAL SCROLL CONFIGURATION
// ============================================================================

export const virtualScrollConfig = {
  // Conversation list
  conversationList: {
    itemHeight: 80, // pixels
    overscan: 5, // render 5 extra items above/below viewport
    bufferSize: 20, // keep 20 items in memory
  },
  
  // Message list
  messageList: {
    estimatedItemHeight: 100, // variable height messages
    overscan: 3,
    bufferSize: 50,
  },
} as const;

// ============================================================================
// ACCESSIBILITY
// ============================================================================

export const accessibility = {
  // Focus indicators
  focusRing: {
    outline: '2px solid #2196F3',
    outlineOffset: '2px',
    borderRadius: '0.25rem',
  },
  
  // Color contrast ratios (WCAG 2.1 AA)
  contrastRatios: {
    primaryText: { color: '#212121', ratio: 16.1 }, // AAA
    secondaryText: { color: '#757575', ratio: 4.6 }, // AA
    whiteOnBlue: { color: '#FFFFFF', background: '#2196F3', ratio: 4.5 }, // AA
    successText: { color: '#2E7D32', ratio: 4.5 }, // AA
    warningText: { color: '#F57C00', ratio: 4.5 }, // AA
    errorText: { color: '#C62828', ratio: 4.5 }, // AA
  },
} as const;

// ============================================================================
// RTL/LTR ADJUSTMENTS
// ============================================================================

export const rtlAdjustments = {
  // Icons that should NOT flip
  noFlip: ['search', 'close', 'check', 'plus'],
  
  // Icons that SHOULD flip
  flip: ['arrow-left', 'arrow-right', 'chevron-left', 'chevron-right'],
} as const;

// ============================================================================
// PERFORMANCE THRESHOLDS
// ============================================================================

export const performanceThresholds = {
  inboxLoad: 1000, // ms
  conversationLoad: 500, // ms
  messageSend: 100, // ms (optimistic UI)
  realTimeUpdate: 2000, // ms
  typingIndicator: 1000, // ms
  searchDebounce: 300, // ms
  scrollThrottle: 100, // ms
} as const;

// ============================================================================
// Z-INDEX LAYERS
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

// Export all tokens as a single object for convenience
export const messagingTokens = {
  colors,
  typography,
  spacing,
  animations,
  glassmorphism,
  buttonStyles,
  breakpoints,
  touchTargets,
  layout,
  virtualScrollConfig,
  accessibility,
  rtlAdjustments,
  performanceThresholds,
  zIndex,
} as const;

export default messagingTokens;
