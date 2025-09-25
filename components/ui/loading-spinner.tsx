'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  text?: string
  variant?: '3d' | 'pulse' | 'bounce' | 'spin'
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
  xl: 'h-12 w-12',
}

export function LoadingSpinner({ 
  size = 'md', 
  className, 
  text, 
  variant = 'spin' 
}: LoadingSpinnerProps) {
  const spinnerClass = cn(sizeClasses[size], className)

  const renderSpinner = () => {
    switch (variant) {
      case '3d':
        return (
          <motion.div
            className={cn(spinnerClass, 'border-4 border-primary/20 border-t-primary rounded-full')}
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            style={{
              boxShadow: '0 0 20px rgba(59, 130, 246, 0.3)',
            }}
          />
        )
      
      case 'pulse':
        return (
          <motion.div
            className={cn(spinnerClass, 'bg-primary rounded-full')}
            animate={{ scale: [1, 1.2, 1], opacity: [1, 0.7, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        )
      
      case 'bounce':
        return (
          <div className="flex space-x-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className={cn('w-2 h-2 bg-primary rounded-full', size === 'sm' && 'w-1 h-1', size === 'lg' && 'w-3 h-3', size === 'xl' && 'w-4 h-4')}
                animate={{ y: [0, -10, 0] }}
                transition={{
                  duration: 0.6,
                  repeat: Infinity,
                  delay: i * 0.1,
                }}
              />
            ))}
          </div>
        )
      
      default:
        return <Loader2 className={cn(spinnerClass, 'animate-spin text-primary')} />
    }
  }

  return (
    <div className="flex flex-col items-center justify-center space-y-2">
      {renderSpinner()}
      {text && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm text-muted-foreground animate-pulse-soft"
        >
          {text}
        </motion.p>
      )}
    </div>
  )
}

export function LoadingSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('shimmer rounded-md bg-muted', className)} />
  )
}

export function LoadingPage() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <LoadingSpinner size="xl" variant="3d" text="Loading..." />
    </div>
  )
}