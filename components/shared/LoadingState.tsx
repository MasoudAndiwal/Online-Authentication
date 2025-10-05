'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { Loader2, Users, GraduationCap, Database, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ColorScheme } from './ListItemCard'

// Color schemes for loading states
const colorSchemes = {
  orange: {
    primary: 'text-orange-500',
    secondary: 'text-orange-400',
    bg: 'bg-orange-50',
    skeleton: 'bg-orange-100'
  },
  green: {
    primary: 'text-green-500',
    secondary: 'text-green-400',
    bg: 'bg-green-50',
    skeleton: 'bg-green-100'
  }
}

// Loading state types
export type LoadingStateType = 
  | 'page'
  | 'content'
  | 'list'
  | 'card'
  | 'skeleton'
  | 'inline'

// Props interfaces
interface BaseLoadingProps {
  colorScheme?: ColorScheme
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

interface LoadingStateProps extends BaseLoadingProps {
  type?: LoadingStateType
  message?: string
  showIcon?: boolean
  icon?: React.ComponentType<{ className?: string }>
}

// Animated spinner component
function AnimatedSpinner({ 
  colorScheme = 'orange', 
  size = 'md',
  className 
}: BaseLoadingProps) {
  const colors = colorSchemes[colorScheme]
  
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  }

  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      className={cn(sizeClasses[size], className)}
    >
      <Loader2 className={cn('h-full w-full', colors.primary)} />
    </motion.div>
  )
}

// Pulsing dots component
function PulsingDots({ colorScheme = 'orange' }: { colorScheme?: ColorScheme }) {
  const colors = colorSchemes[colorScheme]

  return (
    <div className="flex space-x-1">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            delay: i * 0.2,
            ease: 'easeInOut'
          }}
          className={cn('h-2 w-2 rounded-full', colors.primary)}
        />
      ))}
    </div>
  )
}

// Skeleton card component
interface SkeletonCardProps extends BaseLoadingProps {
  showAvatar?: boolean
  lines?: number
}

export function SkeletonCard({ 
  colorScheme = 'orange',
  className,
  showAvatar = true,
  lines = 3
}: SkeletonCardProps) {
  const colors = colorSchemes[colorScheme]

  return (
    <div className={cn(
      'bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-sm',
      className
    )}>
      <div className="animate-pulse">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            {showAvatar && (
              <div className={cn('h-10 w-10 rounded-full', colors.skeleton)} />
            )}
            <div className="space-y-2">
              <div className={cn('h-4 w-24 rounded', colors.skeleton)} />
              <div className={cn('h-3 w-32 rounded', colors.skeleton)} />
            </div>
          </div>
          <div className={cn('h-6 w-16 rounded-full', colors.skeleton)} />
        </div>
        
        {/* Content lines */}
        <div className="space-y-2">
          {Array.from({ length: lines }).map((_, i) => (
            <div 
              key={i}
              className={cn(
                'h-3 rounded',
                colors.skeleton,
                i === lines - 1 ? 'w-2/3' : 'w-full'
              )}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

// Skeleton grid component
interface SkeletonGridProps extends BaseLoadingProps {
  items?: number
  columns?: number
}

export function SkeletonGrid({ 
  colorScheme = 'orange',
  className,
  items = 6,
  columns = 3
}: SkeletonGridProps) {
  const gridClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
  }

  return (
    <div className={cn(
      'grid gap-4 sm:gap-6',
      gridClasses[columns as keyof typeof gridClasses] || gridClasses[3],
      className
    )}>
      {Array.from({ length: items }).map((_, i) => (
        <SkeletonCard key={i} colorScheme={colorScheme} />
      ))}
    </div>
  )
}

// Skeleton table component
interface SkeletonTableProps extends BaseLoadingProps {
  rows?: number
  columns?: number
}

export function SkeletonTable({ 
  colorScheme = 'orange',
  className,
  rows = 5,
  columns = 4
}: SkeletonTableProps) {
  const colors = colorSchemes[colorScheme]

  return (
    <div className={cn(
      'bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden',
      className
    )}>
      <div className="animate-pulse">
        {/* Header */}
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
          <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
            {Array.from({ length: columns }).map((_, i) => (
              <div key={i} className={cn('h-4 w-20 rounded', colors.skeleton)} />
            ))}
          </div>
        </div>
        
        {/* Rows */}
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="px-6 py-4 border-b border-slate-100 last:border-b-0">
            <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
              {Array.from({ length: columns }).map((_, colIndex) => (
                <div 
                  key={colIndex} 
                  className={cn(
                    'h-4 rounded',
                    colors.skeleton,
                    colIndex === 0 ? 'w-32' : 'w-16'
                  )}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Main loading state component
export function LoadingState({
  type = 'content',
  colorScheme = 'orange',
  message = 'Loading...',
  showIcon = true,
  icon: Icon,
  size = 'md',
  className
}: LoadingStateProps) {
  const colors = colorSchemes[colorScheme]
  
  const containerSizes = {
    sm: 'py-8',
    md: 'py-12',
    lg: 'py-16'
  }
  
  const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  }

  // Page loading (full screen)
  if (type === 'page') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-emerald-50/20 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className={cn(
              'w-16 h-16 border-4 border-slate-200 rounded-full mx-auto mb-4',
              `border-t-${colorScheme}-600`
            )}
          />
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl font-semibold text-slate-900 mb-2"
          >
            Loading Dashboard
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-slate-600"
          >
            Please wait while we prepare your data...
          </motion.p>
        </motion.div>
      </div>
    )
  }

  // Inline loading (small, for buttons etc.)
  if (type === 'inline') {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <AnimatedSpinner colorScheme={colorScheme} size={size} />
        {message && (
          <span className={cn('text-slate-600', textSizes[size])}>
            {message}
          </span>
        )}
      </div>
    )
  }

  // Content loading (centered in container)
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn(
        'flex flex-col items-center justify-center text-center',
        containerSizes[size],
        className
      )}
      role="status"
      aria-live="polite"
      aria-label={message}
    >
      {showIcon && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          className={cn(
            'rounded-full flex items-center justify-center mb-4',
            colors.bg,
            size === 'sm' ? 'h-16 w-16' : size === 'lg' ? 'h-24 w-24' : 'h-20 w-20'
          )}
        >
          {Icon ? (
            <Icon className={cn(
              colors.primary,
              size === 'sm' ? 'h-8 w-8' : size === 'lg' ? 'h-12 w-12' : 'h-10 w-10'
            )} />
          ) : (
            <AnimatedSpinner colorScheme={colorScheme} size={size} />
          )}
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-2"
      >
        <p className={cn('font-medium text-slate-900', textSizes[size])}>
          {message}
        </p>
        <PulsingDots colorScheme={colorScheme} />
      </motion.div>
    </motion.div>
  )
}

// Specialized loading components
export function TeacherListLoading({ className }: { className?: string }) {
  return (
    <LoadingState
      type="content"
      colorScheme="orange"
      message="Loading teachers..."
      icon={Users}
      className={className}
    />
  )
}

export function StudentListLoading({ className }: { className?: string }) {
  return (
    <LoadingState
      type="content"
      colorScheme="green"
      message="Loading students..."
      icon={GraduationCap}
      className={className}
    />
  )
}

export function DataLoading({ 
  message = "Loading data...", 
  colorScheme = 'orange',
  className 
}: { 
  message?: string
  colorScheme?: ColorScheme
  className?: string 
}) {
  return (
    <LoadingState
      type="content"
      colorScheme={colorScheme}
      message={message}
      icon={Database}
      size="sm"
      className={className}
    />
  )
}

export function RefreshLoading({ 
  message = "Refreshing...", 
  colorScheme = 'orange',
  className 
}: { 
  message?: string
  colorScheme?: ColorScheme
  className?: string 
}) {
  return (
    <LoadingState
      type="inline"
      colorScheme={colorScheme}
      message={message}
      icon={RefreshCw}
      size="sm"
      className={className}
    />
  )
}

export default LoadingState