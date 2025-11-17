// Design system constants for Student Dashboard

// Primary brand colors - use consistently throughout
export const BRAND_COLORS = {
  primary: {
    main: '#3B82F6',      // blue-500
    light: '#60A5FA',     // blue-400
    dark: '#2563EB',      // blue-600
    bg: '#EFF6FF'         // blue-50
  },
  secondary: {
    main: '#8B5CF6',      // violet-500
    light: '#A78BFA',     // violet-400
    dark: '#7C3AED',      // violet-600
    bg: '#F5F3FF'         // violet-50
  }
} as const;

// Status colors - semantic and accessible
export const STATUS_COLORS = {
  present: {
    main: '#10B981',      // emerald-500
    light: '#34D399',     // emerald-400
    bg: '#D1FAE5',        // emerald-100
    text: '#065F46',      // emerald-800
    shadow: 'shadow-emerald-500/20'
  },
  absent: {
    main: '#EF4444',      // red-500
    light: '#F87171',     // red-400
    bg: '#FEE2E2',        // red-100
    text: '#991B1B',      // red-800
    shadow: 'shadow-red-500/20'
  },
  sick: {
    main: '#F59E0B',      // amber-500
    light: '#FBBF24',     // amber-400
    bg: '#FEF3C7',        // amber-100
    text: '#92400E',      // amber-800
    shadow: 'shadow-amber-500/20'
  },
  leave: {
    main: '#06B6D4',      // cyan-500
    light: '#22D3EE',     // cyan-400
    bg: '#CFFAFE',        // cyan-100
    text: '#164E63',      // cyan-900
    shadow: 'shadow-cyan-500/20'
  }
} as const;

// Neutral colors for backgrounds and text
export const NEUTRAL_COLORS = {
  background: '#F8FAFC',  // slate-50
  surface: '#FFFFFF',     // white
  border: '#E2E8F0',      // slate-200 (use sparingly, prefer shadows)
  text: {
    primary: '#0F172A',   // slate-900
    secondary: '#475569', // slate-600
    tertiary: '#94A3B8'   // slate-400
  }
} as const;

// Use gradients sparingly - only for hero sections and key CTAs
export const GRADIENT_ACCENTS = {
  hero: 'bg-gradient-to-br from-blue-500 via-violet-500 to-purple-600',
  cta: 'bg-gradient-to-r from-blue-500 to-violet-500',
  subtle: 'bg-gradient-to-b from-white to-slate-50',
  present: 'bg-gradient-to-br from-emerald-400 to-emerald-600',
  absent: 'bg-gradient-to-br from-red-400 to-red-600',
  sick: 'bg-gradient-to-br from-amber-400 to-amber-600',
  leave: 'bg-gradient-to-br from-cyan-400 to-cyan-600',
  future: 'bg-gradient-to-br from-slate-300 to-slate-500'
} as const;

// Attendance thresholds
export const ATTENDANCE_THRESHOLDS = {
  disqualification: 18,      // محروم - pure absence hours
  certification: 36          // تصدیق طلب - combined absence hours
} as const;

// Animation durations (in milliseconds)
export const ANIMATION_DURATIONS = {
  fast: 200,
  normal: 300,
  slow: 400,
  countUp: 1200,
  progressRing: 1500,
  stagger: 100
} as const;

// Breakpoints (matches Tailwind defaults)
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536
} as const;
