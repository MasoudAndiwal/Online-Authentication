'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  AlertTriangle,
  AlertCircle,
  WifiOff,
  Lock,
  RefreshCw,
  X,
  ChevronDown,
  ChevronUp,
  Mail,
  Home,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import {
  getStudentErrorMessage,
  getErrorActionSuggestions,
  classifyError,
} from '@/lib/utils/student-error-handling'

// ============================================================================
// Error Display Component
// ============================================================================

interface ErrorDisplayProps {
  error: Error | null
  onRetry?: () => void
  onDismiss?: () => void
  className?: string
  variant?: 'full' | 'compact' | 'inline'
  showDetails?: boolean
}

/**
 * Main error display component with green theme
 * Shows user-friendly error messages with action suggestions
 */
export function ErrorDisplay({
  error,
  onRetry,
  onDismiss,
  className,
  variant = 'full',
  showDetails = false,
}: ErrorDisplayProps) {
  const [isExpanded, setIsExpanded] = React.useState(false)

  if (!error) return null

  const classified = classifyError(error)
  const message = getStudentErrorMessage(error)
  const suggestions = getErrorActionSuggestions(error)

  const icon = getErrorIcon(classified.name)
  const colors = getErrorColors(classified.name)

  if (variant === 'inline') {
    return (
      <div
        className={cn(
          'flex items-start gap-3 p-4 rounded-xl border',
          colors.bg,
          colors.border,
          className
        )}
      >
        <div className={cn('p-2 rounded-lg flex-shrink-0', colors.iconBg)}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className={cn('text-sm font-medium', colors.text)}>{message}</p>
          {onRetry && (
            <Button
              onClick={onRetry}
              size="sm"
              className={cn('mt-2', colors.button)}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          )}
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className={cn('p-1 rounded hover:bg-black/5', colors.text)}
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    )
  }

  if (variant === 'compact') {
    return (
      <Card className={cn('rounded-2xl shadow-lg border-0', colors.cardBg, className)}>
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-start gap-3 sm:gap-4">
            <div className={cn('p-2 sm:p-3 rounded-xl flex-shrink-0', colors.iconBg)}>
              {icon}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-1">
                {getErrorTitle(classified.name)}
              </h3>
              <p className="text-sm text-slate-600 mb-3">{message}</p>
              <div className="flex flex-col sm:flex-row gap-2">
                {onRetry && (
                  <Button
                    onClick={onRetry}
                    size="sm"
                    className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-0 shadow-sm"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Retry
                  </Button>
                )}
                {onDismiss && (
                  <Button
                    onClick={onDismiss}
                    size="sm"
                    variant="outline"
                    className="border-0 bg-white/60 hover:bg-white/80"
                  >
                    Dismiss
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Full variant
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={cn('w-full', className)}
    >
      <Card className={cn('rounded-3xl shadow-2xl border-0', colors.cardBg)}>
        <CardContent className="p-6 sm:p-8">
          {/* Header */}
          <div className="flex items-start gap-4 mb-6">
            <div className={cn('p-3 sm:p-4 rounded-2xl flex-shrink-0', colors.iconBg)}>
              {icon}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">
                {getErrorTitle(classified.name)}
              </h2>
              <p className="text-sm sm:text-base text-slate-600">{message}</p>
            </div>
            {onDismiss && (
              <button
                onClick={onDismiss}
                className="p-2 rounded-lg hover:bg-black/5 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Action Suggestions */}
          {suggestions.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">
                What you can do:
              </h3>
              <ul className="space-y-2">
                {suggestions.map((suggestion, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-slate-600">
                    <span className="text-emerald-500 mt-0.5">•</span>
                    <span>{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            {onRetry && (
              <Button
                onClick={onRetry}
                className="flex-1 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 shadow-lg shadow-emerald-500/25 rounded-xl h-12 text-base font-semibold border-0"
              >
                <RefreshCw className="w-5 h-5 mr-2" />
                Try Again
              </Button>
            )}
            <Button
              onClick={() => (window.location.href = '/student/student-dashboard')}
              variant="outline"
              className="flex-1 border-0 bg-slate-50 hover:bg-slate-100 rounded-xl h-12 text-base font-semibold"
            >
              <Home className="w-5 h-5 mr-2" />
              Go to Dashboard
            </Button>
          </div>

          {/* Error Details (expandable) */}
          {showDetails && (
            <div>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 mb-2"
              >
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
                Technical Details
              </button>
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                      <p className="text-xs text-slate-700 font-mono break-all">
                        {error.message}
                      </p>
                      {process.env.NODE_ENV === 'development' && error.stack && (
                        <pre className="text-xs text-slate-600 font-mono mt-2 overflow-auto max-h-40">
                          {error.stack}
                        </pre>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Help Text */}
          <div className="mt-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
            <p className="text-sm text-emerald-800">
              <strong>Need help?</strong> If this error persists, please contact your teacher
              or technical support.
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// ============================================================================
// Network Error Display
// ============================================================================

interface NetworkErrorDisplayProps {
  onRetry?: () => void
  className?: string
}

export function NetworkErrorDisplay({ onRetry, className }: NetworkErrorDisplayProps) {
  return (
    <Card className={cn('rounded-2xl shadow-lg border-0 bg-gradient-to-br from-blue-50 to-blue-100/50', className)}>
      <CardContent className="p-6 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500 rounded-full mb-4">
          <WifiOff className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">
          No Internet Connection
        </h3>
        <p className="text-sm text-slate-600 mb-4">
          Please check your internet connection and try again.
        </p>
        {onRetry && (
          <Button
            onClick={onRetry}
            className="bg-blue-500 hover:bg-blue-600 text-white border-0"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

// ============================================================================
// Permission Error Display
// ============================================================================

interface PermissionErrorDisplayProps {
  message?: string
  className?: string
}

export function PermissionErrorDisplay({
  message = 'You do not have permission to view this content.',
  className,
}: PermissionErrorDisplayProps) {
  return (
    <Card className={cn('rounded-2xl shadow-lg border-0 bg-gradient-to-br from-orange-50 to-orange-100/50', className)}>
      <CardContent className="p-6 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-500 rounded-full mb-4">
          <Lock className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">
          Access Denied
        </h3>
        <p className="text-sm text-slate-600 mb-4">{message}</p>
        <Button
          onClick={() => (window.location.href = '/student/student-dashboard')}
          className="bg-orange-500 hover:bg-orange-600 text-white border-0"
        >
          <Home className="w-4 h-4 mr-2" />
          Go to Dashboard
        </Button>
      </CardContent>
    </Card>
  )
}

// ============================================================================
// Helper Functions
// ============================================================================

function getErrorIcon(errorName: string) {
  const iconClass = 'w-6 h-6 text-white'

  switch (errorName) {
    case 'NetworkError':
      return <WifiOff className={iconClass} />
    case 'PermissionError':
      return <Lock className={iconClass} />
    case 'AuthenticationError':
      return <Lock className={iconClass} />
    default:
      return <AlertTriangle className={iconClass} />
  }
}

function getErrorColors(errorName: string) {
  switch (errorName) {
    case 'NetworkError':
      return {
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        text: 'text-blue-800',
        iconBg: 'bg-blue-500',
        cardBg: 'bg-gradient-to-br from-blue-50 to-blue-100/50',
        button: 'bg-blue-50 text-blue-700 hover:bg-blue-100 border-0',
      }
    case 'PermissionError':
    case 'AuthenticationError':
      return {
        bg: 'bg-orange-50',
        border: 'border-orange-200',
        text: 'text-orange-800',
        iconBg: 'bg-orange-500',
        cardBg: 'bg-gradient-to-br from-orange-50 to-orange-100/50',
        button: 'bg-orange-50 text-orange-700 hover:bg-orange-100 border-0',
      }
    case 'ValidationError':
      return {
        bg: 'bg-yellow-50',
        border: 'border-yellow-200',
        text: 'text-yellow-800',
        iconBg: 'bg-yellow-500',
        cardBg: 'bg-gradient-to-br from-yellow-50 to-yellow-100/50',
        button: 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100 border-0',
      }
    default:
      return {
        bg: 'bg-red-50',
        border: 'border-red-200',
        text: 'text-red-800',
        iconBg: 'bg-red-500',
        cardBg: 'bg-gradient-to-br from-red-50 to-red-100/50',
        button: 'bg-red-50 text-red-700 hover:bg-red-100 border-0',
      }
  }
}

function getErrorTitle(errorName: string): string {
  switch (errorName) {
    case 'NetworkError':
      return 'Connection Problem'
    case 'PermissionError':
      return 'Access Denied'
    case 'AuthenticationError':
      return 'Authentication Required'
    case 'ValidationError':
      return 'Invalid Information'
    case 'DataNotFoundError':
      return 'Data Not Found'
    case 'ServerError':
      return 'Server Error'
    default:
      return 'Something Went Wrong'
  }
}
