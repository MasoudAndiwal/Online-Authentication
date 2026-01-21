/**
 * ErrorBoundary Component
 * 
 * React Error Boundary for catching and displaying component errors.
 * Provides retry functionality and logs errors for debugging.
 * 
 * Requirements: 19.1, 19.2, 19.3
 */

'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';

// ============================================================================
// Types
// ============================================================================

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showDetails?: boolean;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorCount: number;
}

// ============================================================================
// ErrorBoundary Component
// ============================================================================

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error to console
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // Update state with error details
    this.setState(prevState => ({
      errorInfo,
      errorCount: prevState.errorCount + 1,
    }));

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // In production, you would send this to an error reporting service
    this.logErrorToService(error, errorInfo);
  }

  /**
   * Log error to external service (e.g., Sentry, LogRocket)
   */
  private logErrorToService(error: Error, errorInfo: ErrorInfo): void {
    // In production, integrate with error tracking service
    // Example: Sentry.captureException(error, { extra: errorInfo });
    
    const errorData = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    console.log('Error logged:', errorData);
    
    // Store in localStorage for debugging
    try {
      const errors = JSON.parse(localStorage.getItem('app_errors') || '[]');
      errors.push(errorData);
      // Keep only last 10 errors
      if (errors.length > 10) {
        errors.shift();
      }
      localStorage.setItem('app_errors', JSON.stringify(errors));
    } catch (e) {
      console.error('Failed to store error in localStorage:', e);
    }
  }

  /**
   * Reset error boundary state
   */
  private handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  /**
   * Reload the page
   */
  private handleReload = (): void => {
    window.location.reload();
  };

  /**
   * Navigate to home
   */
  private handleGoHome = (): void => {
    window.location.href = '/';
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8"
          >
            {/* Error Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
            </div>

            {/* Error Title */}
            <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
              Something went wrong
            </h1>

            {/* Error Description */}
            <p className="text-gray-600 text-center mb-6">
              We're sorry, but something unexpected happened. Please try again or contact support if the problem persists.
            </p>

            {/* Error Details (if enabled) */}
            {this.props.showDetails && this.state.error && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                  <Bug className="w-4 h-4 text-gray-500" />
                  <h3 className="text-sm font-semibold text-gray-700">Error Details</h3>
                </div>
                <p className="text-sm text-red-600 font-mono mb-2">
                  {this.state.error.message}
                </p>
                {this.state.error.stack && (
                  <details className="text-xs text-gray-600 font-mono">
                    <summary className="cursor-pointer hover:text-gray-900">
                      Stack Trace
                    </summary>
                    <pre className="mt-2 p-2 bg-white rounded border border-gray-200 overflow-x-auto">
                      {this.state.error.stack}
                    </pre>
                  </details>
                )}
              </div>
            )}

            {/* Error Count Warning */}
            {this.state.errorCount > 2 && (
              <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-800">
                  <strong>Multiple errors detected.</strong> You may need to reload the page or clear your browser cache.
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={this.handleReset}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all hover:scale-105"
              >
                <RefreshCw className="w-5 h-5" />
                Try Again
              </button>

              <button
                onClick={this.handleReload}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <RefreshCw className="w-5 h-5" />
                Reload Page
              </button>

              <button
                onClick={this.handleGoHome}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Home className="w-5 h-5" />
                Go Home
              </button>
            </div>

            {/* Support Info */}
            <div className="mt-8 pt-6 border-t border-gray-200 text-center">
              <p className="text-sm text-gray-500">
                If this problem continues, please contact support with the error details above.
              </p>
            </div>
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}

// ============================================================================
// Inline Error Display
// ============================================================================

interface InlineErrorProps {
  error: Error | string;
  onRetry?: () => void;
  onDismiss?: () => void;
  className?: string;
}

export const InlineError: React.FC<InlineErrorProps> = ({
  error,
  onRetry,
  onDismiss,
  className = '',
}) => {
  const errorMessage = typeof error === 'string' ? error : error.message;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg ${className}`}
    >
      <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        <p className="text-sm font-medium text-red-900 mb-1">Error</p>
        <p className="text-sm text-red-700">{errorMessage}</p>
      </div>
      <div className="flex gap-2">
        {onRetry && (
          <button
            onClick={onRetry}
            className="p-1.5 text-red-700 hover:text-red-800 hover:bg-red-100 rounded transition-colors"
            title="Retry"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        )}
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="p-1.5 text-red-700 hover:text-red-800 hover:bg-red-100 rounded transition-colors"
            title="Dismiss"
          >
            ×
          </button>
        )}
      </div>
    </motion.div>
  );
};

// ============================================================================
// Compact Error Display
// ============================================================================

interface CompactErrorProps {
  message: string;
  onRetry?: () => void;
  className?: string;
}

export const CompactError: React.FC<CompactErrorProps> = ({
  message,
  onRetry,
  className = '',
}) => {
  return (
    <div className={`flex items-center justify-between gap-3 px-4 py-2 bg-red-50 border border-red-200 rounded-lg ${className}`}>
      <div className="flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 text-red-600" />
        <span className="text-sm text-red-700">{message}</span>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="text-sm font-medium text-red-700 hover:text-red-800 hover:underline"
        >
          Retry
        </button>
      )}
    </div>
  );
};

// ============================================================================
// Hook for Error Handling
// ============================================================================

export function useErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null);

  const handleError = React.useCallback((error: Error | string) => {
    const errorObj = typeof error === 'string' ? new Error(error) : error;
    setError(errorObj);
    console.error('Error handled:', errorObj);
  }, []);

  const clearError = React.useCallback(() => {
    setError(null);
  }, []);

  return {
    error,
    handleError,
    clearError,
    hasError: error !== null,
  };
}
