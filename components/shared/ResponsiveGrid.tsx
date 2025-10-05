'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

// Breakpoint definitions
export const breakpoints = {
  mobile: '0px - 767px',
  tablet: '768px - 1023px',
  desktop: '1024px+'
} as const

// Grid configuration interface
export interface GridConfig {
  mobile?: number
  tablet?: number
  desktop?: number
  gap?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

// Default grid configurations
export const gridConfigs = {
  // List layouts
  list: {
    mobile: 1,
    tablet: 1,
    desktop: 1,
    gap: 'md'
  },
  // Card layouts
  cards: {
    mobile: 1,
    tablet: 2,
    desktop: 3,
    gap: 'md'
  },
  // Dense card layouts
  dense: {
    mobile: 1,
    tablet: 2,
    desktop: 4,
    gap: 'sm'
  },
  // Wide layouts
  wide: {
    mobile: 1,
    tablet: 1,
    desktop: 2,
    gap: 'lg'
  }
} as const

// Gap size classes
const gapClasses = {
  sm: 'gap-3 sm:gap-4',
  md: 'gap-4 sm:gap-6',
  lg: 'gap-6 sm:gap-8',
  xl: 'gap-8 sm:gap-10'
}

// Generate grid column classes
function getGridClasses(config: GridConfig): string {
  const { mobile = 1, tablet = 2, desktop = 3, gap = 'md' } = config
  
  const classes = [
    'grid',
    gapClasses[gap],
    `grid-cols-${mobile}`,
    tablet && `md:grid-cols-${tablet}`,
    desktop && `lg:grid-cols-${desktop}`
  ].filter(Boolean)
  
  return classes.join(' ')
}

// Responsive Grid Component
interface ResponsiveGridProps {
  children: React.ReactNode
  config?: GridConfig | keyof typeof gridConfigs
  className?: string
}

export function ResponsiveGrid({ 
  children, 
  config = 'cards', 
  className 
}: ResponsiveGridProps) {
  // Resolve config
  const gridConfig = typeof config === 'string' ? gridConfigs[config] : config
  
  return (
    <div className={cn(
      getGridClasses(gridConfig),
      typeof config === 'object' && 'className' in config ? config.className : undefined,
      className
    )}>
      {children}
    </div>
  )
}

// Responsive Container Component
interface ResponsiveContainerProps {
  children: React.ReactNode
  className?: string
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
  padding?: boolean
}

const maxWidthClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  full: 'max-w-full'
}

export function ResponsiveContainer({ 
  children, 
  className,
  maxWidth = 'full',
  padding = true
}: ResponsiveContainerProps) {
  return (
    <div className={cn(
      'w-full mx-auto',
      maxWidthClasses[maxWidth],
      padding && 'px-4 sm:px-6 lg:px-8',
      className
    )}>
      {children}
    </div>
  )
}

// Breakpoint utilities
export const responsiveClasses = {
  // Container classes
  container: 'px-4 sm:px-6 lg:px-8',
  
  // Grid classes
  grid: {
    single: 'grid grid-cols-1 gap-4 sm:gap-6',
    double: 'grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6',
    triple: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6',
    quad: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6'
  },
  
  // Card classes
  card: 'p-4 sm:p-6',
  cardCompact: 'p-3 sm:p-4',
  cardLarge: 'p-6 sm:p-8',
  
  // Text classes
  text: {
    header: 'text-lg sm:text-xl lg:text-2xl',
    subheader: 'text-base sm:text-lg lg:text-xl',
    body: 'text-sm sm:text-base',
    caption: 'text-xs sm:text-sm'
  },
  
  // Button classes
  button: 'text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2',
  buttonLarge: 'text-sm sm:text-base px-3 sm:px-4 py-2 sm:py-3',
  
  // Spacing classes
  spacing: {
    section: 'space-y-6 sm:space-y-8 lg:space-y-10',
    items: 'space-y-3 sm:space-y-4',
    tight: 'space-y-2 sm:space-y-3'
  }
}

// Mobile-first optimization classes
export const mobileOptimizations = {
  // Touch targets (minimum 44px for accessibility)
  touchTarget: 'min-h-[44px] min-w-[44px]',
  
  // Touch-friendly spacing
  touchSpacing: 'space-y-3 sm:space-y-4',
  
  // Typography scaling
  typography: {
    hero: 'text-2xl sm:text-3xl lg:text-4xl xl:text-5xl',
    title: 'text-xl sm:text-2xl lg:text-3xl',
    heading: 'text-lg sm:text-xl lg:text-2xl',
    subheading: 'text-base sm:text-lg',
    body: 'text-sm sm:text-base',
    small: 'text-xs sm:text-sm'
  },
  
  // Layout helpers
  layout: {
    stack: 'flex flex-col space-y-4 sm:space-y-6',
    stackTight: 'flex flex-col space-y-2 sm:space-y-3',
    row: 'flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-2 sm:space-y-0',
    center: 'flex flex-col items-center text-center'
  }
}

// Breakpoint hook for JavaScript usage
export function useBreakpoint() {
  const [breakpoint, setBreakpoint] = React.useState<'mobile' | 'tablet' | 'desktop'>('mobile')
  
  React.useEffect(() => {
    const checkBreakpoint = () => {
      const width = window.innerWidth
      if (width < 768) {
        setBreakpoint('mobile')
      } else if (width < 1024) {
        setBreakpoint('tablet')
      } else {
        setBreakpoint('desktop')
      }
    }
    
    checkBreakpoint()
    window.addEventListener('resize', checkBreakpoint)
    
    return () => window.removeEventListener('resize', checkBreakpoint)
  }, [])
  
  return breakpoint
}

// Media query helpers
export const mediaQueries = {
  mobile: '(max-width: 767px)',
  tablet: '(min-width: 768px) and (max-width: 1023px)',
  desktop: '(min-width: 1024px)',
  tabletAndUp: '(min-width: 768px)',
  desktopAndUp: '(min-width: 1024px)'
}

export default ResponsiveGrid