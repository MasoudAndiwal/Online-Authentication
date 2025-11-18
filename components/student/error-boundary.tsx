'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, RefreshCw, Home, ArrowLeft, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<ErrorFallbackProps>
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
  resetKeys?: Array<string | number>
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
}

export interface ErrorFallbackProps {
  error: Error | null
  errorInfo: React.ErrorInfo | null
  resetError: () => void
}

/**
 * Student Error Boundary Component
 * Catches JavaScript errors anywhere in the student dashboard
 * Uses green theme consistent with student interface
 */
export class StudentErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Student Error Boundary caught an error:', error, errorInfo)
    }

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo)

    this.setState({
      errorInfo
    })
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    // Reset error state if resetKeys change
    if (this.state.hasError && this.props.resetKeys) {
      const prevKeys = prevProps.resetKeys || []
      const currentKeys = this.props.resetKeys || []
      
      if (prevKeys.length !== currentKeys.length || 
          prevKeys.some((key, index) => key !== currentKeys[index])) {
        this.resetError()
      }
    }
  }

  resetError = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    })
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || StudentErrorFallback
      return (
        <FallbackComponent
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          resetError={this.resetError}
        />
      )
    }

    return this.props.children
  }
}

/**
 * Student Error Fallback UI with green theme
 */
export function StudentErrorFallback({ 
  error, 
  errorInfo, 
  resetError 
}: ErrorFallbackProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50/30 flex items-center justify-center p-4 sm:p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl"
      >
        <Card className="rounded-3xl shadow-2xl border-0 bg-white/80 backdrop-blur-xl overflow-hidden">
          {/* Error Icon Header with green theme */}
          <div className="relative bg-gradient-to-br from-emerald-500 to-emerald-600 p-6 sm:p-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-white/20 backdrop-blur-sm rounded-full mb-4"
            >
              <AlertTriangle className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            </motion.div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              Oops! Something went wrong
            </h1>
            <p className="text-sm sm:text-base text-emerald-100">
              We encountered an unexpected error. Don't worry, we're here to help.
            </p>
          </div>

          <CardContent className="p-6 sm:p-8">
            {/* Error Details */}
            {error && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-slate-700 mb-2">
                  Error Details:
                </h3>
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <p className="text-sm text-red-800 font-mono break-all">
                    {error.message || 'Unknown error occurred'}
                  </p>
                </div>
              </div>
            )}

            {/* Development Info */}
            {process.env.NODE_ENV === 'development' && errorInfo && (
              <details className="mb-6">
                <summary className="text-sm font-semibold text-slate-700 cursor-pointer hover:text-slate-900 mb-2">
                  Stack Trace (Development Only)
                </summary>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 overflow-auto max-h-64">
                  <pre className="text-xs text-slate-700 font-mono whitespace-pre-wrap">
                    {errorInfo.componentStack}
                  </pre>
                </div>
              </details>
            )}

            {/* Action Buttons with green theme */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={resetError}
                className="flex-1 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 shadow-lg shadow-emerald-500/25 rounded-xl h-12 text-base font-semibold border-0"
              >
                <RefreshCw className="w-5 h-5 mr-2" />
                Try Again
              </Button>
              <Button
                onClick={() => window.location.href = '/student/student-dashboard'}
                variant="outline"
                className="flex-1 border-0 bg-slate-50 hover:bg-slate-100 rounded-xl h-12 text-base font-semibold"
              >
                <Home className="w-5 h-5 mr-2" />
                Go to Dashboard
              </Button>
            </div>

            {/* Help Text */}
            <div className="mt-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
              <p className="text-sm text-emerald-800">
                <strong>Need help?</strong> If this error persists, please contact your teacher 
                or technical support with the error details above.
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

/**
 * Compact Error Fallback for smaller components with green theme
 */
export function CompactStudentErrorFallback({ 
  error, 
  resetError 
}: ErrorFallbackProps) {
  return (
    <Card className="rounded-2xl shadow-lg border-0 bg-gradient-to-br from-red-50 to-red-100/50">
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-start gap-3 sm:gap-4">
          <div className="p-2 sm:p-3 bg-red-500 rounded-xl flex-shrink-0">
            <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-1">
              Error Loading Content
            </h3>
            <p className="text-sm text-slate-600 mb-3">
              {error?.message || 'An unexpected error occurred'}
            </p>
            <Button
              onClick={resetError}
              size="sm"
              className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-0 shadow-sm"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Section Error Boundary - for wrapping dashboard sections with green theme
 */
interface SectionErrorBoundaryProps {
  children: React.ReactNode
  sectionName: string
  onError?: (error: Error) => void
}

export function StudentSectionErrorBoundary({ 
  children, 
  sectionName,
  onError 
}: SectionErrorBoundaryProps) {
  return (
    <StudentErrorBoundary
      fallback={({ error, resetError }) => (
        <Card className="rounded-2xl shadow-lg border-0 bg-gradient-to-br from-emerald-50 to-emerald-100/50">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="p-2 sm:p-3 bg-red-500 rounded-xl flex-shrink-0">
                <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-1">
                  Error in {sectionName}
                </h3>
                <p className="text-sm text-slate-600 mb-3 sm:mb-4">
                  We couldn't load this section. {error?.message}
                </p>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                  <Button
                    onClick={resetError}
                    size="sm"
                    className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-0 shadow-sm"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Retry
                  </Button>
                  <Button
                    onClick={() => window.location.reload()}
                    size="sm"
                    variant="outline"
                    className="border-0 bg-white/60 hover:bg-white/80"
                  >
                    Reload Page
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      onError={onError}
    >
      {children}
    </StudentErrorBoundary>
  )
}

/**
 * Hook for using error boundary imperatively
 */
export function useStudentErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null)

  React.useEffect(() => {
    if (error) {
      throw error
    }
  }, [error])

  return setError
}
