/**
 * Office Messaging Theme Configuration
 * 
 * Centralized theme configuration for the messaging system
 * Requirements: 22.6, 22.7
 * 
 * Features:
 * - Professional blue color scheme
 * - Gradient overlays
 * - Clean white/light backgrounds
 * - Consistent color usage
 */

export const messagingTheme = {
  // ============================================================================
  // COLORS
  // ============================================================================
  
  colors: {
    // Primary brand colors
    primary: {
      main: '#2196F3',
      light: '#64B5F6',
      dark: '#1976D2',
      contrast: '#FFFFFF',
    },

    // Secondary colors
    secondary: {
      main: '#667eea',
      light: '#764ba2',
      dark: '#5568d3',
      contrast: '#FFFFFF',
    },

    // Background colors
    background: {
      default: '#FFFFFF',
      paper: '#F5F7FA',
      elevated: '#FFFFFF',
      glass: 'rgba(255, 255, 255, 0.7)',
    },

    // Text colors
    text: {
      primary: '#212121',
      secondary: '#757575',
      disabled: '#BDBDBD',
      hint: '#9E9E9E',
    },

    // Status colors
    status: {
      sent: '#90CAF9',
      delivered: '#64B5F6',
      read: '#2196F3',
      failed: '#F44336',
      sending: '#9E9E9E',
    },

    // Priority colors
    priority: {
      normal: '#9E9E9E',
      important: '#FF9800',
      urgent: '#F44336',
    },

    // Category colors
    category: {
      general: '#2196F3',
      administrative: '#9C27B0',
      attendance_alert: '#FF9800',
      schedule_change: '#4CAF50',
      announcement: '#2196F3',
      urgent: '#F44336',
    },

    // Semantic colors
    success: '#4CAF50',
    warning: '#FF9800',
    error: '#F44336',
    info: '#2196F3',
  },

  // ============================================================================
  // GRADIENTS
  // ============================================================================

  gradients: {
    primary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    blue: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)',
    success: 'linear-gradient(135deg, #4CAF50 0%, #388E3C 100%)',
    warning: 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)',
    danger: 'linear-gradient(135deg, #F44336 0%, #D32F2F 100%)',
    glass: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
    overlay: 'linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.8) 100%)',
  },

  // ============================================================================
  // SHADOWS
  // ============================================================================

  shadows: {
    none: 'none',
    sm: '0 2px 4px rgba(0,0,0,0.05)',
    md: '0 4px 6px rgba(0,0,0,0.07)',
    lg: '0 10px 15px rgba(0,0,0,0.1)',
    xl: '0 20px 25px rgba(0,0,0,0.15)',
    '2xl': '0 25px 50px rgba(0,0,0,0.2)',
    glow: '0 0 20px rgba(33, 150, 243, 0.3)',
    glowStrong: '0 0 30px rgba(33, 150, 243, 0.5)',
    inner: 'inset 0 2px 4px rgba(0,0,0,0.06)',
  },

  // ============================================================================
  // TYPOGRAPHY
  // ============================================================================

  typography: {
    fontFamily: {
      primary: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      rtl: "'Vazirmatn', 'Noto Sans Arabic', sans-serif",
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
  },

  // ============================================================================
  // SPACING
  // ============================================================================

  spacing: {
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
  },

  // ============================================================================
  // BORDER RADIUS
  // ============================================================================

  borderRadius: {
    none: '0',
    sm: '0.25rem',   // 4px
    md: '0.5rem',    // 8px
    lg: '0.75rem',   // 12px
    xl: '1rem',      // 16px
    '2xl': '1.5rem', // 24px
    full: '9999px',
  },

  // ============================================================================
  // BREAKPOINTS
  // ============================================================================

  breakpoints: {
    mobile: '0px',      // 0 - 767px
    tablet: '768px',    // 768px - 1023px
    desktop: '1024px',  // 1024px+
    wide: '1440px',     // 1440px+
  },

  // ============================================================================
  // Z-INDEX
  // ============================================================================

  zIndex: {
    base: 0,
    dropdown: 1000,
    sticky: 1100,
    fixed: 1200,
    modalBackdrop: 1300,
    modal: 1400,
    popover: 1500,
    tooltip: 1600,
  },

  // ============================================================================
  // TRANSITIONS
  // ============================================================================

  transitions: {
    duration: {
      fast: '150ms',
      normal: '250ms',
      slow: '350ms',
    },

    easing: {
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      spring: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    },
  },
} as const;

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get color by path
 */
export function getColor(path: string): string {
  const keys = path.split('.');
  let value: any = messagingTheme.colors;
  
  for (const key of keys) {
    value = value[key];
    if (value === undefined) {
      console.warn(`Color path "${path}" not found`);
      return '#000000';
    }
  }
  
  return value;
}

/**
 * Get gradient by name
 */
export function getGradient(name: keyof typeof messagingTheme.gradients): string {
  return messagingTheme.gradients[name];
}

/**
 * Get shadow by name
 */
export function getShadow(name: keyof typeof messagingTheme.shadows): string {
  return messagingTheme.shadows[name];
}

/**
 * Apply theme to CSS variables
 */
export function applyThemeToRoot() {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;

  // Apply colors
  root.style.setProperty('--color-primary', messagingTheme.colors.primary.main);
  root.style.setProperty('--color-primary-light', messagingTheme.colors.primary.light);
  root.style.setProperty('--color-primary-dark', messagingTheme.colors.primary.dark);
  
  root.style.setProperty('--color-background', messagingTheme.colors.background.default);
  root.style.setProperty('--color-background-paper', messagingTheme.colors.background.paper);
  
  root.style.setProperty('--color-text-primary', messagingTheme.colors.text.primary);
  root.style.setProperty('--color-text-secondary', messagingTheme.colors.text.secondary);

  // Apply gradients
  root.style.setProperty('--gradient-primary', messagingTheme.gradients.primary);
  root.style.setProperty('--gradient-blue', messagingTheme.gradients.blue);

  // Apply shadows
  root.style.setProperty('--shadow-sm', messagingTheme.shadows.sm);
  root.style.setProperty('--shadow-md', messagingTheme.shadows.md);
  root.style.setProperty('--shadow-lg', messagingTheme.shadows.lg);
}

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type MessagingTheme = typeof messagingTheme;
export type ThemeColor = keyof typeof messagingTheme.colors;
export type ThemeGradient = keyof typeof messagingTheme.gradients;
export type ThemeShadow = keyof typeof messagingTheme.shadows;
