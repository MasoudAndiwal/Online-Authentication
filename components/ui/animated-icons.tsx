'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { 
  Save, 
  Download, 
  LogIn, 
  Check, 
  X, 
  Users, 
  Calendar, 
  FileText,
  Settings,
  BookOpen,
  GraduationCap,
  Building2,
  ChevronRight,
  Plus,
  Edit,
  Trash2,
  Eye,
  Search,
  Filter,
  RefreshCw
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface AnimatedIconProps {
  icon: keyof typeof iconMap
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  animate?: boolean
  variant?: 'hover' | 'pulse' | 'bounce' | 'rotate' | 'scale'
  color?: 'default' | 'present' | 'absent' | 'office' | 'teacher' | 'student'
}

const iconMap = {
  save: Save,
  download: Download,
  login: LogIn,
  check: Check,
  x: X,
  users: Users,
  calendar: Calendar,
  fileText: FileText,
  settings: Settings,
  bookOpen: BookOpen,
  graduationCap: GraduationCap,
  building2: Building2,
  chevronRight: ChevronRight,
  plus: Plus,
  edit: Edit,
  trash2: Trash2,
  eye: Eye,
  search: Search,
  filter: Filter,
  refreshCw: RefreshCw,
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
  xl: 'h-8 w-8',
}

const colorClasses = {
  default: 'text-gray-700',
  present: 'text-green-600',
  absent: 'text-red-600',
  office: 'text-purple-600',
  teacher: 'text-orange-600',
  student: 'text-emerald-600',
}

const animations = {
  hover: {
    whileHover: { scale: 1.1, rotate: 5 },
    transition: { type: 'spring' as const, stiffness: 400, damping: 17 }
  },
  pulse: {
    animate: { scale: [1, 1.1, 1] },
    transition: { duration: 2, repeat: Infinity }
  },
  bounce: {
    animate: { y: [0, -5, 0] },
    transition: { duration: 1, repeat: Infinity }
  },
  rotate: {
    animate: { rotate: 360 },
    transition: { duration: 2, repeat: Infinity, ease: 'linear' as const }
  },
  scale: {
    whileHover: { scale: 1.2 },
    whileTap: { scale: 0.9 }
  }
}

export function AnimatedIcon({
  icon,
  size = 'md',
  className,
  animate = true,
  variant = 'hover',
  color = 'default'
}: AnimatedIconProps) {
  const IconComponent = iconMap[icon]
  const iconClass = cn(sizeClasses[size], colorClasses[color], className)

  if (!animate) {
    return <IconComponent className={iconClass} />
  }

  const animationProps = animations[variant]

  return (
    <motion.div className="inline-flex" {...animationProps}>
      <IconComponent className={iconClass} />
    </motion.div>
  )
}

// Specialized animated icons for attendance system
export function AttendanceToggleIcon({ 
  isPresent, 
  size = 'lg',
  animate = true 
}: { 
  isPresent: boolean
  size?: 'sm' | 'md' | 'lg' | 'xl'
  animate?: boolean 
}) {
  const iconClass = cn(
    sizeClasses[size],
    isPresent ? 'text-white' : 'text-white'
  )

  if (!animate) {
    return isPresent ? <Check className={iconClass} /> : <X className={iconClass} />
  }

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      exit={{ scale: 0 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
    >
      {isPresent ? <Check className={iconClass} /> : <X className={iconClass} />}
    </motion.div>
  )
}

export function FloatingActionIcon({ 
  icon, 
  onClick,
  className,
  size = 'lg'
}: {
  icon: keyof typeof iconMap
  onClick?: () => void
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
}) {
  const IconComponent = iconMap[icon]
  
  return (
    <motion.button
      className={cn(
        'fixed bottom-6 right-6 rounded-full bg-primary text-primary-foreground shadow-lg z-50',
        'flex items-center justify-center',
        size === 'sm' && 'h-12 w-12',
        size === 'md' && 'h-14 w-14',
        size === 'lg' && 'h-16 w-16',
        size === 'xl' && 'h-20 w-20',
        className
      )}
      whileHover={{ 
        scale: 1.1,
        boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.4)'
      }}
      whileTap={{ scale: 0.9 }}
      animate={{ 
        y: [0, -5, 0],
      }}
      transition={{ 
        y: { duration: 2, repeat: Infinity },
        scale: { type: 'spring', stiffness: 400, damping: 17 }
      }}
      onClick={onClick}
    >
      <IconComponent className={sizeClasses[size]} />
    </motion.button>
  )
}

export function StatusIndicator({ 
  status, 
  animate = true,
  size = 'md'
}: { 
  status: 'online' | 'offline' | 'busy' | 'away'
  animate?: boolean
  size?: 'sm' | 'md' | 'lg'
}) {
  const colors = {
    online: 'bg-green-500',
    offline: 'bg-gray-400',
    busy: 'bg-red-500',
    away: 'bg-yellow-500'
  }

  const sizes = {
    sm: 'h-2 w-2',
    md: 'h-3 w-3',
    lg: 'h-4 w-4'
  }

  const indicator = (
    <div className={cn('rounded-full', colors[status], sizes[size])} />
  )

  if (!animate) return indicator

  return (
    <motion.div
      animate={{ scale: [1, 1.2, 1] }}
      transition={{ duration: 2, repeat: Infinity }}
    >
      {indicator}
    </motion.div>
  )
}