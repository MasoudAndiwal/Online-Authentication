'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface Icon3DProps {
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error'
  animated?: boolean
}

const sizeClasses = {
  sm: 'w-5 h-5',
  md: 'w-6 h-6', 
  lg: 'w-8 h-8',
  xl: 'w-12 h-12'
}

const variantClasses = {
  primary: 'text-blue-500',
  secondary: 'text-slate-500',
  success: 'text-emerald-500',
  warning: 'text-amber-500',
  error: 'text-red-500'
}

// Modern 3D Dashboard Icon
export function Dashboard3D({ className, size = 'md', variant = 'primary', animated = true }: Icon3DProps) {
  return (
    <motion.div
      className={cn(sizeClasses[size], variantClasses[variant], className)}
      whileHover={animated ? { scale: 1.1, rotateY: 5 } : undefined}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
        <defs>
          <linearGradient id="dashboard-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="currentColor" stopOpacity="1" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0.6" />
          </linearGradient>
          <filter id="dashboard-shadow">
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.2"/>
          </filter>
        </defs>
        
        {/* Main dashboard grid */}
        <rect x="3" y="3" width="8" height="8" rx="2" fill="url(#dashboard-gradient)" filter="url(#dashboard-shadow)" />
        <rect x="13" y="3" width="8" height="5" rx="2" fill="url(#dashboard-gradient)" filter="url(#dashboard-shadow)" opacity="0.8" />
        <rect x="13" y="10" width="8" height="5" rx="2" fill="url(#dashboard-gradient)" filter="url(#dashboard-shadow)" opacity="0.8" />
        <rect x="3" y="13" width="8" height="8" rx="2" fill="url(#dashboard-gradient)" filter="url(#dashboard-shadow)" opacity="0.9" />
        
        {/* Highlight dots */}
        <circle cx="7" cy="7" r="1" fill="white" opacity="0.8" />
        <circle cx="17" cy="6" r="0.5" fill="white" opacity="0.6" />
      </svg>
    </motion.div>
  )
}

// Modern 3D Users Icon
export function Users3D({ className, size = 'md', variant = 'primary', animated = true }: Icon3DProps) {
  return (
    <motion.div
      className={cn(sizeClasses[size], variantClasses[variant], className)}
      whileHover={animated ? { scale: 1.1, rotateX: 5 } : undefined}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
        <defs>
          <linearGradient id="users-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="currentColor" stopOpacity="1" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0.7" />
          </linearGradient>
          <filter id="users-shadow">
            <feDropShadow dx="0" dy="1" stdDeviation="1" floodOpacity="0.3"/>
          </filter>
        </defs>
        
        {/* User avatars with 3D effect */}
        <circle cx="9" cy="7" r="4" fill="url(#users-gradient)" filter="url(#users-shadow)" />
        <circle cx="15" cy="7" r="3" fill="url(#users-gradient)" filter="url(#users-shadow)" opacity="0.8" />
        
        {/* Bodies */}
        <path d="M3 20c0-3.5 2.5-6 6-6s6 2.5 6 6" stroke="url(#users-gradient)" strokeWidth="2" fill="none" filter="url(#users-shadow)" />
        <path d="M12 20c0-2.5 1.5-4 3-4s3 1.5 3 4" stroke="url(#users-gradient)" strokeWidth="2" fill="none" filter="url(#users-shadow)" opacity="0.8" />
        
        {/* Highlight */}
        <circle cx="7" cy="5" r="1" fill="white" opacity="0.6" />
      </svg>
    </motion.div>
  )
}

// Modern 3D Calendar Icon
export function Calendar3D({ className, size = 'md', variant = 'primary', animated = true }: Icon3DProps) {
  return (
    <motion.div
      className={cn(sizeClasses[size], variantClasses[variant], className)}
      whileHover={animated ? { scale: 1.1, rotateY: -5 } : undefined}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
        <defs>
          <linearGradient id="calendar-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="currentColor" stopOpacity="1" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0.6" />
          </linearGradient>
          <filter id="calendar-shadow">
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.2"/>
          </filter>
        </defs>
        
        {/* Calendar base */}
        <rect x="3" y="4" width="18" height="16" rx="3" fill="url(#calendar-gradient)" filter="url(#calendar-shadow)" />
        
        {/* Header */}
        <rect x="3" y="4" width="18" height="4" rx="3" fill="currentColor" opacity="0.9" />
        
        {/* Rings */}
        <rect x="7" y="2" width="2" height="4" rx="1" fill="currentColor" opacity="0.7" />
        <rect x="15" y="2" width="2" height="4" rx="1" fill="currentColor" opacity="0.7" />
        
        {/* Calendar dots */}
        <circle cx="8" cy="12" r="1" fill="white" opacity="0.8" />
        <circle cx="12" cy="12" r="1" fill="white" opacity="0.6" />
        <circle cx="16" cy="12" r="1" fill="white" opacity="0.8" />
        <circle cx="8" cy="16" r="1" fill="white" opacity="0.6" />
        <circle cx="12" cy="16" r="1" fill="white" opacity="0.8" />
      </svg>
    </motion.div>
  )
}

// Modern 3D Chart Icon
export function Chart3D({ className, size = 'md', variant = 'primary', animated = true }: Icon3DProps) {
  return (
    <motion.div
      className={cn(sizeClasses[size], variantClasses[variant], className)}
      whileHover={animated ? { scale: 1.1, rotateZ: 2 } : undefined}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
        <defs>
          <linearGradient id="chart-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="currentColor" stopOpacity="1" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0.5" />
          </linearGradient>
          <filter id="chart-shadow">
            <feDropShadow dx="0" dy="1" stdDeviation="1" floodOpacity="0.3"/>
          </filter>
        </defs>
        
        {/* Chart bars with 3D effect */}
        <rect x="4" y="12" width="3" height="8" rx="1.5" fill="url(#chart-gradient)" filter="url(#chart-shadow)" />
        <rect x="8.5" y="8" width="3" height="12" rx="1.5" fill="url(#chart-gradient)" filter="url(#chart-shadow)" />
        <rect x="13" y="6" width="3" height="14" rx="1.5" fill="url(#chart-gradient)" filter="url(#chart-shadow)" />
        <rect x="17.5" y="10" width="3" height="10" rx="1.5" fill="url(#chart-gradient)" filter="url(#chart-shadow)" />
        
        {/* Trend line */}
        <path d="M5.5 15 L10 10 L14.5 8 L19 12" stroke="white" strokeWidth="2" opacity="0.6" fill="none" />
        
        {/* Highlight dots */}
        <circle cx="5.5" cy="14" r="0.5" fill="white" opacity="0.8" />
        <circle cx="14.5" cy="8" r="0.5" fill="white" opacity="0.8" />
      </svg>
    </motion.div>
  )
}

// Modern 3D Settings Icon
export function Settings3D({ className, size = 'md', variant = 'primary', animated = true }: Icon3DProps) {
  return (
    <motion.div
      className={cn(sizeClasses[size], variantClasses[variant], className)}
      whileHover={animated ? { scale: 1.1, rotate: 15 } : undefined}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
        <defs>
          <linearGradient id="settings-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="currentColor" stopOpacity="1" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0.6" />
          </linearGradient>
          <filter id="settings-shadow">
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.2"/>
          </filter>
        </defs>
        
        {/* Gear outer */}
        <path d="M12 2L13.5 6.5L18 5L16.5 9.5L21 11L16.5 14.5L18 19L13.5 17.5L12 22L10.5 17.5L6 19L7.5 14.5L3 11L7.5 9.5L6 5L10.5 6.5L12 2Z" 
              fill="url(#settings-gradient)" filter="url(#settings-shadow)" />
        
        {/* Inner circle */}
        <circle cx="12" cy="12" r="4" fill="url(#settings-gradient)" opacity="0.8" />
        <circle cx="12" cy="12" r="2" fill="white" opacity="0.9" />
        
        {/* Highlight */}
        <circle cx="10" cy="10" r="1" fill="white" opacity="0.6" />
      </svg>
    </motion.div>
  )
}

// Modern 3D Clipboard Icon
export function Clipboard3D({ className, size = 'md', variant = 'primary', animated = true }: Icon3DProps) {
  return (
    <motion.div
      className={cn(sizeClasses[size], variantClasses[variant], className)}
      whileHover={animated ? { scale: 1.1, rotateY: 5 } : undefined}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
        <defs>
          <linearGradient id="clipboard-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="currentColor" stopOpacity="1" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0.7" />
          </linearGradient>
          <filter id="clipboard-shadow">
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.2"/>
          </filter>
        </defs>
        
        {/* Clipboard base */}
        <rect x="5" y="4" width="14" height="16" rx="2" fill="url(#clipboard-gradient)" filter="url(#clipboard-shadow)" />
        
        {/* Clip */}
        <rect x="8" y="2" width="8" height="4" rx="2" fill="currentColor" opacity="0.9" />
        
        {/* Lines */}
        <rect x="8" y="9" width="8" height="1" rx="0.5" fill="white" opacity="0.7" />
        <rect x="8" y="12" width="6" height="1" rx="0.5" fill="white" opacity="0.5" />
        <rect x="8" y="15" width="7" height="1" rx="0.5" fill="white" opacity="0.6" />
        
        {/* Checkmark */}
        <path d="M9 13L11 15L15 11" stroke="white" strokeWidth="1.5" fill="none" opacity="0.8" />
      </svg>
    </motion.div>
  )
}

// Export all icons
export const Modern3DIcons = {
  Dashboard3D,
  Users3D,
  Calendar3D,
  Chart3D,
  Settings3D,
  Clipboard3D
}