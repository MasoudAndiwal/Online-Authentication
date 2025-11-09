'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Wifi, WifiOff, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

// ============================================================================
// Types
// ============================================================================

export type ConnectionStatus = 'connected' | 'disconnected' | 'connecting' | 'error'

interface WebSocketStatusProps {
  status: ConnectionStatus
  className?: string
  showLabel?: boolean
}

// ============================================================================
// Status Configuration
// ============================================================================

const statusConfig: Record<ConnectionStatus, {
  label: string
  icon: React.ReactNode
  color: string
  bgColor: string
  pulseColor: string
}> = {
  connected: {
    label: 'Connected',
    icon: <Wifi className="h-3 w-3" />,
    color: 'text-green-700',
    bgColor: 'bg-green-50',
    pulseColor: 'bg-green-500'
  },
  disconnected: {
    label: 'Disconnected',
    icon: <WifiOff className="h-3 w-3" />,
    color: 'text-slate-700',
    bgColor: 'bg-slate-50',
    pulseColor: 'bg-slate-500'
  },
  connecting: {
    label: 'Connecting...',
    icon: <Wifi className="h-3 w-3" />,
    color: 'text-orange-700',
    bgColor: 'bg-orange-50',
    pulseColor: 'bg-orange-500'
  },
  error: {
    label: 'Connection Error',
    icon: <AlertCircle className="h-3 w-3" />,
    color: 'text-red-700',
    bgColor: 'bg-red-50',
    pulseColor: 'bg-red-500'
  }
}

// ============================================================================
// WebSocket Status Component
// ============================================================================

export function WebSocketStatus({ 
  status, 
  className,
  showLabel = true 
}: WebSocketStatusProps) {
  const config = statusConfig[status]

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={status}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.2 }}
      >
        <Badge
          className={cn(
            'flex items-center gap-1.5 border-0 shadow-sm',
            config.bgColor,
            config.color,
            className
          )}
        >
          <div className="relative">
            {config.icon}
            {status === 'connected' && (
              <motion.div
                className={cn(
                  'absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full',
                  config.pulseColor
                )}
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [1, 0.5, 1]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
              />
            )}
            {status === 'connecting' && (
              <motion.div
                className={cn(
                  'absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full',
                  config.pulseColor
                )}
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [1, 0, 1]
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
              />
            )}
          </div>
          {showLabel && (
            <span className="text-xs font-semibold">
              {config.label}
            </span>
          )}
        </Badge>
      </motion.div>
    </AnimatePresence>
  )
}

// ============================================================================
// Hook for WebSocket Status
// ============================================================================

export function useWebSocketStatus() {
  const [status, setStatus] = React.useState<ConnectionStatus>('disconnected')

  React.useEffect(() => {
    // In production, this would monitor the actual WebSocket connection
    // For now, simulate connection status
    setStatus('connecting')
    
    const timer = setTimeout(() => {
      setStatus('connected')
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  return { status, setStatus }
}
