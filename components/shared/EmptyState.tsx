'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { 
  Users, 
  GraduationCap, 
  Search, 
  Plus, 
  FileX, 
  Database,
  AlertCircle,
  RefreshCw
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import type { ColorScheme } from './ListItemCard'

// Color schemes for empty states
const colorSchemes = {
  orange: {
    icon: 'text-orange-500',
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    button: 'bg-orange-600 hover:bg-orange-700'
  },
  green: {
    icon: 'text-green-500',
    bg: 'bg-green-50',
    border: 'border-green-200',
    button: 'bg-green-600 hover:bg-green-700'
  }
}

// Empty state types
export type EmptyStateType = 
  | 'no-data'
  | 'no-results'
  | 'no-teachers'
  | 'no-students'
  | 'error'
  | 'loading-failed'

// Empty state configuration
interface EmptyStateConfig {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
  actionLabel?: string
  secondaryActionLabel?: string
}

const emptyStateConfigs: Record<EmptyStateType, EmptyStateConfig> = {
  'no-data': {
    icon: Database,
    title: 'No Data Available',
    description: 'There is no data to display at the moment. Try refreshing the page or check back later.',
    actionLabel: 'Refresh Page',
    secondaryActionLabel: 'Go Back'
  },
  'no-results': {
    icon: Search,
    title: 'No Results Found',
    description: 'We couldn\'t find any items matching your search criteria. Try adjusting your filters or search terms.',
    actionLabel: 'Clear Filters',
    secondaryActionLabel: 'Reset Search'
  },
  'no-teachers': {
    icon: Users,
    title: 'No Teachers Found',
    description: 'There are no teachers in the system yet. Add the first teacher to get started.',
    actionLabel: 'Add Teacher',
    secondaryActionLabel: 'Import Teachers'
  },
  'no-students': {
    icon: GraduationCap,
    title: 'No Students Found',
    description: 'There are no students in the system yet. Add the first student to get started.',
    actionLabel: 'Add Student',
    secondaryActionLabel: 'Import Students'
  },
  'error': {
    icon: AlertCircle,
    title: 'Something Went Wrong',
    description: 'We encountered an error while loading the data. Please try again or contact support if the problem persists.',
    actionLabel: 'Try Again',
    secondaryActionLabel: 'Contact Support'
  },
  'loading-failed': {
    icon: RefreshCw,
    title: 'Failed to Load Data',
    description: 'Unable to load the requested data. Please check your connection and try again.',
    actionLabel: 'Retry',
    secondaryActionLabel: 'Go Back'
  }
}

// Action handler interface
export interface EmptyStateActions {
  onPrimaryAction?: () => void
  onSecondaryAction?: () => void
}

// Props interface
interface EmptyStateProps {
  type: EmptyStateType
  colorScheme?: ColorScheme
  actions?: EmptyStateActions
  className?: string
  size?: 'sm' | 'md' | 'lg'
  showAnimation?: boolean
  customConfig?: Partial<EmptyStateConfig>
}

// Animated icon component
function AnimatedIcon({ 
  icon: Icon, 
  colorScheme = 'orange',
  size = 'md' 
}: { 
  icon: React.ComponentType<{ className?: string }>
  colorScheme?: ColorScheme
  size?: 'sm' | 'md' | 'lg'
}) {
  const colors = colorSchemes[colorScheme]
  
  const sizeClasses = {
    sm: 'h-12 w-12',
    md: 'h-16 w-16',
    lg: 'h-20 w-20'
  }
  
  const containerSizes = {
    sm: 'h-20 w-20',
    md: 'h-24 w-24',
    lg: 'h-28 w-28'
  }

  return (
    <motion.div
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ 
        type: 'spring', 
        stiffness: 200, 
        damping: 20,
        delay: 0.1 
      }}
      className={cn(
        'relative mx-auto rounded-full flex items-center justify-center',
        colors.bg,
        colors.border,
        'border-2',
        containerSizes[size]
      )}
    >
      <motion.div
        animate={{ 
          scale: [1, 1.1, 1],
          rotate: [0, 5, -5, 0]
        }}
        transition={{ 
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      >
        <Icon className={cn(sizeClasses[size], colors.icon)} />
      </motion.div>
      
      {/* Subtle pulse effect */}
      <motion.div
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.1, 0.3]
        }}
        transition={{ 
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
        className={cn(
          'absolute inset-0 rounded-full',
          colors.bg,
          'opacity-30'
        )}
      />
    </motion.div>
  )
}

// Main EmptyState component
export function EmptyState({
  type,
  colorScheme = 'orange',
  actions,
  className,
  size = 'md',
  showAnimation = true,
  customConfig
}: EmptyStateProps) {
  const config = { ...emptyStateConfigs[type], ...customConfig }
  const colors = colorSchemes[colorScheme]
  
  const containerSizes = {
    sm: 'py-8 px-4',
    md: 'py-12 px-6',
    lg: 'py-16 px-8'
  }
  
  const textSizes = {
    sm: {
      title: 'text-lg',
      description: 'text-sm'
    },
    md: {
      title: 'text-xl',
      description: 'text-base'
    },
    lg: {
      title: 'text-2xl',
      description: 'text-lg'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn(
        'flex flex-col items-center justify-center text-center',
        containerSizes[size],
        className
      )}
      role="status"
      aria-live="polite"
    >
      {/* Icon */}
      {showAnimation ? (
        <AnimatedIcon 
          icon={config.icon} 
          colorScheme={colorScheme} 
          size={size}
        />
      ) : (
        <div className={cn(
          'mx-auto rounded-full flex items-center justify-center mb-6',
          colors.bg,
          colors.border,
          'border-2 h-24 w-24'
        )}>
          <config.icon className={cn('h-16 w-16', colors.icon)} />
        </div>
      )}

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="max-w-md mx-auto space-y-4"
      >
        <h3 className={cn(
          'font-semibold text-slate-900',
          textSizes[size].title
        )}>
          {config.title}
        </h3>
        
        <p className={cn(
          'text-slate-600 leading-relaxed',
          textSizes[size].description
        )}>
          {config.description}
        </p>
      </motion.div>

      {/* Actions */}
      {(config.actionLabel || config.secondaryActionLabel) && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="flex flex-col sm:flex-row gap-3 mt-6"
        >
          {config.actionLabel && actions?.onPrimaryAction && (
            <Button
              onClick={actions.onPrimaryAction}
              className={cn(
                'min-w-[120px]',
                colors.button
              )}
            >
              <Plus className="h-4 w-4 mr-2" />
              {config.actionLabel}
            </Button>
          )}
          
          {config.secondaryActionLabel && actions?.onSecondaryAction && (
            <Button
              variant="outline"
              onClick={actions.onSecondaryAction}
              className="min-w-[120px]"
            >
              {config.secondaryActionLabel}
            </Button>
          )}
        </motion.div>
      )}
    </motion.div>
  )
}

// Specialized empty state components
export function NoTeachersState({ 
  onAddTeacher, 
  onImportTeachers,
  className 
}: { 
  onAddTeacher?: () => void
  onImportTeachers?: () => void
  className?: string 
}) {
  return (
    <EmptyState
      type="no-teachers"
      colorScheme="orange"
      actions={{
        onPrimaryAction: onAddTeacher,
        onSecondaryAction: onImportTeachers
      }}
      className={className}
    />
  )
}

export function NoStudentsState({ 
  onAddStudent, 
  onImportStudents,
  className 
}: { 
  onAddStudent?: () => void
  onImportStudents?: () => void
  className?: string 
}) {
  return (
    <EmptyState
      type="no-students"
      colorScheme="green"
      actions={{
        onPrimaryAction: onAddStudent,
        onSecondaryAction: onImportStudents
      }}
      className={className}
    />
  )
}

export function NoSearchResultsState({ 
  onClearFilters, 
  onResetSearch,
  colorScheme = 'orange',
  className 
}: { 
  onClearFilters?: () => void
  onResetSearch?: () => void
  colorScheme?: ColorScheme
  className?: string 
}) {
  return (
    <EmptyState
      type="no-results"
      colorScheme={colorScheme}
      actions={{
        onPrimaryAction: onClearFilters,
        onSecondaryAction: onResetSearch
      }}
      className={className}
      size="sm"
    />
  )
}

export default EmptyState