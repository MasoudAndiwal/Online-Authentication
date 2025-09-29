'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export type AttendanceStatus = 'present' | 'absent' | 'sick' | 'leave' | 'محروم' | 'تصدیق_طلب'

interface AnimatedStatusBadgeProps {
  status: AttendanceStatus
  animated?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
  showIcon?: boolean
  showLabel?: boolean
}

const statusConfig = {
  present: { 
    color: 'bg-green-500 text-white', 
    icon: '✅', 
    pulse: false,
    label: 'Present',
    hoverColor: 'hover:bg-green-600'
  },
  absent: { 
    color: 'bg-red-500 text-white', 
    icon: '❌', 
    pulse: true,
    label: 'Absent',
    hoverColor: 'hover:bg-red-600'
  },
  sick: { 
    color: 'bg-yellow-500 text-white', 
    icon: '🏥', 
    pulse: false,
    label: 'Sick',
    hoverColor: 'hover:bg-yellow-600'
  },
  leave: { 
    color: 'bg-blue-500 text-white', 
    icon: '📋', 
    pulse: false,
    label: 'Leave',
    hoverColor: 'hover:bg-blue-600'
  },
  محروم: { 
    color: 'bg-purple-500 text-white', 
    icon: '🚫', 
    pulse: true,
    label: 'محروم',
    hoverColor: 'hover:bg-purple-600'
  },
  تصدیق_طلب: { 
    color: 'bg-orange-500 text-white', 
    icon: '📋', 
    pulse: true,
    label: 'تصدیق طلب',
    hoverColor: 'hover:bg-orange-600'
  }
}

const sizeConfig = {
  sm: 'px-2 py-1 text-xs',
  md: 'px-3 py-1 text-sm',
  lg: 'px-4 py-2 text-base'
}

export function AnimatedStatusBadge({
  status,
  animated = true,
  size = 'md',
  className,
  showIcon = true,
  showLabel = true
}: AnimatedStatusBadgeProps) {
  const config = statusConfig[status]
  const sizeClass = sizeConfig[size]
  
  return (
    <motion.div
      initial={animated ? { scale: 0, opacity: 0 } : undefined}
      animate={animated ? { scale: 1, opacity: 1 } : undefined}
      transition={{ 
        type: "spring", 
        stiffness: 500, 
        damping: 30,
        delay: 0.1 
      }}
      className={cn(
        'inline-flex items-center rounded-full font-medium transition-all duration-200',
        config.color,
        config.hoverColor,
        sizeClass,
        animated && config.pulse && 'animate-pulse',
        className
      )}
    >
      {showIcon && (
        <motion.span 
          className="mr-1"
          initial={animated ? { rotate: -180, scale: 0 } : undefined}
          animate={animated ? { rotate: 0, scale: 1 } : undefined}
          transition={{ delay: 0.2, duration: 0.3 }}
        >
          {config.icon}
        </motion.span>
      )}
      {showLabel && (
        <motion.span
          initial={animated ? { opacity: 0, x: -10 } : undefined}
          animate={animated ? { opacity: 1, x: 0 } : undefined}
          transition={{ delay: 0.3 }}
        >
          {config.label}
        </motion.span>
      )}
    </motion.div>
  )
}

// Status button for attendance grid with cycling functionality
interface AttendanceStatusButtonProps {
  status: 'PRESENT' | 'ABSENT' | 'SICK' | 'LEAVE'
  onChange: (status: 'PRESENT' | 'ABSENT' | 'SICK' | 'LEAVE') => void
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export function AttendanceStatusButton({
  status,
  onChange,
  disabled = false,
  size = 'md'
}: AttendanceStatusButtonProps) {
  const statusCycle: Array<'PRESENT' | 'ABSENT' | 'SICK' | 'LEAVE'> = ['PRESENT', 'ABSENT', 'SICK', 'LEAVE']
  const statusMap = {
    PRESENT: 'present' as const,
    ABSENT: 'absent' as const,
    SICK: 'sick' as const,
    LEAVE: 'leave' as const
  }

  const config = statusConfig[statusMap[status]]
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base'
  }

  const handleClick = () => {
    if (disabled) return
    
    const currentIndex = statusCycle.indexOf(status)
    const nextIndex = (currentIndex + 1) % statusCycle.length
    onChange(statusCycle[nextIndex])
  }

  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.1 } : undefined}
      whileTap={!disabled ? { scale: 0.95 } : undefined}
      onClick={handleClick}
      disabled={disabled}
      className={cn(
        'rounded-full font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
        config.color,
        !disabled && config.hoverColor,
        disabled && 'opacity-50 cursor-not-allowed',
        sizeClasses[size]
      )}
    >
      {config.icon}
    </motion.button>
  )
}