'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, RefreshCw, Home, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

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
 * Error Boundary Component
 * Catches JavaScript errors anywhere in the child component tree
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
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
      console.error('Error Boundary caught an error:', error, errorInfo)
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
      const FallbackComponent = this.props.fallback || DefaultErrorFallback
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
 * Default Error Fallback UI
 */
export function DefaultErrorFallback({ 
  error, 
  errorInfo, 
  resetError 
}: ErrorFallbackProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50/30 to-red-50/20 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl"
      >
        <Card className="rounded-3xl shadow-2xl border-0 bg-white/80 backdrop-blur-xl overflow-hidden">
          {/* Error Icon Header */}
          <div className="relative bg-gradient-to-br from-red-500 to-red-600 p-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full mb-4"
            >
              <AlertTriangle className="w-10 h-10 text-white" />
            </motion.div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Oops! Something went wrong
            </h1>
            <p className="text-red-100">
              We encountered an unexpected error. Don't worry, we're here to help.
            </p>
          </div>

          <CardContent className="p-8">
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

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={resetError}
                className="flex-1 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 shadow-lg shadow-orange-500/25 rounded-xl h-12 text-base font-semibold border-0"
              >
                <RefreshCw className="w-5 h-5 mr-2" />
                Try Again
              </Button>
              <Button
                onClick={() => window.location.href = '/teacher'}
                variant="outline"
                className="flex-1 border-0 bg-slate-50 hover:bg-slate-100 rounded-xl h-12 text-base font-semibold"
              >
                <Home className="w-5 h-5 mr-2" />
                Go to Dashboard
              </Button>
            </div>

            {/* Help Text */}
            <div className="mt-6 p-4 bg-orange-50 border border-orange-200 rounded-xl">
              <p className="text-sm text-orange-800">
                <strong>Need help?</strong> If this error persists, please contact technical support 
                with the error details above.
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

/**
 * Compact Error Fallback for smaller components
 */
export function CompactErrorFallback({ 
  error, 
  resetError 
}: ErrorFallbackProps) {
  return (
    <Card className="rounded-2xl shadow-lg border-0 bg-gradient-to-br from-red-50 to-red-100/50">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-red-500 rounded-xl flex-shrink-0">
            <AlertTriangle className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-slate-900 mb-1">
              Error Loading Content
            </h3>
            <p className="text-sm text-slate-600 mb-3">
              {error?.message || 'An unexpected error occurred'}
            </p>
            <Button
              onClick={resetError}
              size="sm"
              className="bg-red-50 text-red-700 hover:bg-red-100 border-0 shadow-sm"
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
 * Section Error Boundary - for wrapping dashboard sections
 */
interface SectionErrorBoundaryProps {
  children: React.ReactNode
  sectionName: string
  onError?: (error: Error) => void
}

export function SectionErrorBoundary({ 
  children, 
  sectionName,
  onError 
}: SectionErrorBoundaryProps) {
  return (
    <ErrorBoundary
      fallback={({ error, resetError }) => (
        <Card className="rounded-2xl shadow-lg border-0 bg-gradient-to-br from-orange-50 to-orange-100/50">
          <CardHeader className="p-6">
            <CardTitle className="flex items-center gap-3 text-slate-900">
              <div className="p-2 bg-red-500 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-white" />
              </div>
              Error in {sectionName}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <p className="text-sm text-slate-600 mb-4">
              We couldn't load this section. {error?.message}
            </p>
            <div className="flex gap-3">
              <Button
                onClick={resetError}
                size="sm"
                className="bg-orange-50 text-orange-700 hover:bg-orange-100 border-0 shadow-sm"
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
          </CardContent>
        </Card>
      )}
      onError={onError}
    >
      {children}
    </ErrorBoundary>
  )
}

/**
 * Hook for using error boundary imperatively
 */
export function useErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null)

  React.useEffect(() => {
    if (error) {
      throw error
    }
  }, [error])

  return setError
}
