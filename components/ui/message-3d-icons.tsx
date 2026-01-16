'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface Icon3DProps {
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  animated?: boolean
}

const sizeClasses = {
  sm: 'w-5 h-5',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
  xl: 'w-12 h-12'
}

// 3D Message Bubble Icon
export function MessageBubble3D({ className, size = 'md', animated = true }: Icon3DProps) {
  const id = React.useId()
  return (
    <motion.div
      className={cn(sizeClasses[size], className)}
      whileHover={animated ? { scale: 1.1, rotateY: 10 } : undefined}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
        <defs>
          <linearGradient id={`msg-gradient-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
          <filter id={`msg-shadow-${id}`}>
            <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#10b981" floodOpacity="0.3"/>
          </filter>
        </defs>
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" 
              fill={`url(#msg-gradient-${id})`} filter={`url(#msg-shadow-${id})`} />
        <circle cx="8" cy="12" r="1" fill="white" opacity="0.9" />
        <circle cx="12" cy="12" r="1" fill="white" opacity="0.9" />
        <circle cx="16" cy="12" r="1" fill="white" opacity="0.9" />
      </svg>
    </motion.div>
  )
}

// 3D Send Icon
export function Send3D({ className, size = 'md', animated = true }: Icon3DProps) {
  const id = React.useId()
  return (
    <motion.div
      className={cn(sizeClasses[size], className)}
      whileHover={animated ? { scale: 1.15, x: 3 } : undefined}
      whileTap={animated ? { scale: 0.95 } : undefined}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
    >
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
        <defs>
          <linearGradient id={`send-gradient-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#e2e8f0" />
          </linearGradient>
        </defs>
        <path d="M22 2L11 13" stroke={`url(#send-gradient-${id})`} strokeWidth="2" strokeLinecap="round" />
        <path d="M22 2L15 22L11 13L2 9L22 2Z" fill={`url(#send-gradient-${id})`} />
      </svg>
    </motion.div>
  )
}

// 3D Inbox Icon
export function Inbox3D({ className, size = 'md', animated = true }: Icon3DProps) {
  const id = React.useId()
  return (
    <motion.div
      className={cn(sizeClasses[size], className)}
      whileHover={animated ? { scale: 1.1, rotateX: 10 } : undefined}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
        <defs>
          <linearGradient id={`inbox-gradient-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#4f46e5" />
          </linearGradient>
          <filter id={`inbox-shadow-${id}`}>
            <feDropShadow dx="0" dy="3" stdDeviation="2" floodColor="#6366f1" floodOpacity="0.3"/>
          </filter>
        </defs>
        <rect x="3" y="4" width="18" height="16" rx="3" fill={`url(#inbox-gradient-${id})`} filter={`url(#inbox-shadow-${id})`} />
        <path d="M3 10h6l2 3h2l2-3h6" stroke="white" strokeWidth="1.5" fill="none" opacity="0.8" />
        <rect x="7" y="14" width="10" height="2" rx="1" fill="white" opacity="0.5" />
      </svg>
    </motion.div>
  )
}

// 3D Bell/Notification Icon
export function Bell3D({ className, size = 'md', animated = true }: Icon3DProps) {
  const id = React.useId()
  return (
    <motion.div
      className={cn(sizeClasses[size], className)}
      whileHover={animated ? { scale: 1.1 } : undefined}
      animate={animated ? { rotate: [0, -10, 10, -10, 0] } : undefined}
      transition={{ 
        rotate: { duration: 0.5, repeat: Infinity, repeatDelay: 3 },
        scale: { type: 'spring', stiffness: 300, damping: 20 }
      }}
    >
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
        <defs>
          <linearGradient id={`bell-gradient-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#d97706" />
          </linearGradient>
          <filter id={`bell-shadow-${id}`}>
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#f59e0b" floodOpacity="0.4"/>
          </filter>
        </defs>
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" fill={`url(#bell-gradient-${id})`} filter={`url(#bell-shadow-${id})`} />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke={`url(#bell-gradient-${id})`} strokeWidth="2" strokeLinecap="round" />
        <circle cx="18" cy="5" r="3" fill="#ef4444" />
        <circle cx="18" cy="5" r="1.5" fill="white" opacity="0.5" />
      </svg>
    </motion.div>
  )
}

// 3D Attachment/Paperclip Icon
export function Attachment3D({ className, size = 'md', animated = true }: Icon3DProps) {
  const id = React.useId()
  return (
    <motion.div
      className={cn(sizeClasses[size], className)}
      whileHover={animated ? { scale: 1.1, rotate: 15 } : undefined}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
        <defs>
          <linearGradient id={`attach-gradient-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#7c3aed" />
          </linearGradient>
          <filter id={`attach-shadow-${id}`}>
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#8b5cf6" floodOpacity="0.3"/>
          </filter>
        </defs>
        <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" 
              stroke={`url(#attach-gradient-${id})`} strokeWidth="2.5" strokeLinecap="round" fill="none" filter={`url(#attach-shadow-${id})`} />
      </svg>
    </motion.div>
  )
}

// 3D System Alert Icon
export function SystemAlert3D({ className, size = 'md', animated = true }: Icon3DProps) {
  const id = React.useId()
  return (
    <motion.div
      className={cn(sizeClasses[size], className)}
      whileHover={animated ? { scale: 1.1 } : undefined}
      animate={animated ? { scale: [1, 1.05, 1] } : undefined}
      transition={{ 
        scale: { duration: 2, repeat: Infinity },
      }}
    >
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
        <defs>
          <linearGradient id={`alert-gradient-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#ea580c" />
          </linearGradient>
          <filter id={`alert-shadow-${id}`}>
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#f97316" floodOpacity="0.4"/>
          </filter>
        </defs>
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" 
              fill={`url(#alert-gradient-${id})`} filter={`url(#alert-shadow-${id})`} />
        <line x1="12" y1="9" x2="12" y2="13" stroke="white" strokeWidth="2" strokeLinecap="round" />
        <circle cx="12" cy="17" r="1" fill="white" />
      </svg>
    </motion.div>
  )
}

// 3D Teacher Icon
export function Teacher3D({ className, size = 'md', animated = true }: Icon3DProps) {
  const id = React.useId()
  return (
    <motion.div
      className={cn(sizeClasses[size], className)}
      whileHover={animated ? { scale: 1.1, rotateY: 10 } : undefined}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
        <defs>
          <linearGradient id={`teacher-gradient-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#2563eb" />
          </linearGradient>
          <filter id={`teacher-shadow-${id}`}>
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#3b82f6" floodOpacity="0.3"/>
          </filter>
        </defs>
        <circle cx="12" cy="8" r="5" fill={`url(#teacher-gradient-${id})`} filter={`url(#teacher-shadow-${id})`} />
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" fill={`url(#teacher-gradient-${id})`} filter={`url(#teacher-shadow-${id})`} />
        <rect x="9" y="2" width="6" height="3" rx="1" fill="#fbbf24" />
        <circle cx="10" cy="7" r="0.5" fill="white" opacity="0.8" />
      </svg>
    </motion.div>
  )
}

// 3D Checkmark Icon
export function Check3D({ className, size = 'md', animated = true }: Icon3DProps) {
  const id = React.useId()
  return (
    <motion.div
      className={cn(sizeClasses[size], className)}
      initial={animated ? { scale: 0 } : undefined}
      animate={animated ? { scale: 1 } : undefined}
      whileHover={animated ? { scale: 1.2 } : undefined}
      transition={{ type: 'spring', stiffness: 500, damping: 25 }}
    >
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
        <defs>
          <linearGradient id={`check-gradient-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
          <filter id={`check-shadow-${id}`}>
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#10b981" floodOpacity="0.4"/>
          </filter>
        </defs>
        <circle cx="12" cy="12" r="10" fill={`url(#check-gradient-${id})`} filter={`url(#check-shadow-${id})`} />
        <path d="M9 12l2 2 4-4" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </motion.div>
  )
}

// 3D Double Check (Read) Icon
export function DoubleCheck3D({ className, size = 'md', animated = true }: Icon3DProps) {
  const id = React.useId()
  return (
    <motion.div
      className={cn(sizeClasses[size], className)}
      initial={animated ? { scale: 0 } : undefined}
      animate={animated ? { scale: 1 } : undefined}
      transition={{ type: 'spring', stiffness: 500, damping: 25 }}
    >
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
        <defs>
          <linearGradient id={`dcheck-gradient-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
        </defs>
        <path d="M2 12l5 5L17 7" stroke={`url(#dcheck-gradient-${id})`} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M7 12l5 5L22 7" stroke={`url(#dcheck-gradient-${id})`} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </motion.div>
  )
}

// 3D New Message Icon (for floating action buttons - no wrapper div)
export function NewMessage3D({ className }: { className?: string }) {
  const id = React.useId()
  return (
    <svg viewBox="0 0 24 24" fill="none" className={cn("w-full h-full", className)}>
      <defs>
        <linearGradient id={`newmsg-gradient-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#e2e8f0" />
        </linearGradient>
        <filter id={`newmsg-shadow-${id}`}>
          <feDropShadow dx="0" dy="1" stdDeviation="1" floodColor="#000000" floodOpacity="0.2"/>
        </filter>
      </defs>
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" 
            fill={`url(#newmsg-gradient-${id})`} filter={`url(#newmsg-shadow-${id})`} />
      <line x1="12" y1="8" x2="12" y2="16" stroke="#10b981" strokeWidth="2" strokeLinecap="round" />
      <line x1="8" y1="12" x2="16" y2="12" stroke="#10b981" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

// Export all icons
export const Message3DIcons = {
  MessageBubble3D,
  Send3D,
  Inbox3D,
  Bell3D,
  Attachment3D,
  SystemAlert3D,
  Teacher3D,
  Check3D,
  DoubleCheck3D,
  NewMessage3D
}
