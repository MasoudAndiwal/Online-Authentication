/**
 * Error Logging System Setup
 * 
 * Initializes and configures the contextual error logging system
 * for the enhanced student dashboard backend.
 * 
 * This setup implements requirement 9.5: "WHEN critical errors happen THEN 
 * the Student_Dashboard_System SHALL log errors with full context for debugging"
 */

import { setupGlobalErrorHandling, errorLogger } from '../middleware/error-logging-middleware';

/**
 * Environment-specific configuration
 */
interface ErrorLoggingEnvironmentConfig {
  // Sentry configuration (production)
  sentryDsn?: string;
  sentryEnvironment?: string;
  sentryRelease?: string;
  
  // Logging levels
  logLevel: 'error' | 'warn' | 'info' | 'debug';
  
  // Performance monitoring
  enablePerformanceMonitoring: boolean;
  slowRequestThreshold: number;
  
  // Error sampling (to avoid overwhelming error tracking services)
  errorSampleRate: number;
  
  // Context configuration
  includeRequestBodies: boolean;
  includeStackTraces: boolean;
  maxContextSize: number;
}

/**
 * Get environment-specific configuration
 */
function getEnvironmentConfig(): ErrorLoggingEnvironmentConfig {
  const env = process.env.NODE_ENV || 'development';
  
  const baseConfig: ErrorLoggingEnvironmentConfig = {
    logLevel: 'info',
    enablePerformanceMonitoring: true,
    slowRequestThreshold: 1000,
    errorSampleRate: 1.0,
    includeRequestBodies: false,
    includeStackTraces: true,
    maxContextSize: 10 * 1024 // 10KB
  };

  switch (env) {
    case 'production':
      return {
        ...baseConfig,
        sentryDsn: process.env.SENTRY_DSN,
        sentryEnvironment: 'production',
        sentryRelease: process.env.npm_package_version,
        logLevel: 'warn',
        includeStackTraces: false,
        errorSampleRate: 0.1, // Sample 10% of errors in production
        includeRequestBodies: false
      };
      
    case 'staging':
      return {
        ...baseConfig,
        sentryDsn: process.env.SENTRY_DSN,
        sentryEnvironment: 'staging',
        sentryRelease: process.env.npm_package_version,
        logLevel: 'info',
        errorSampleRate: 0.5, // Sample 50% of errors in staging
        includeRequestBodies: true
      };
      
    case 'development':
    default:
      return {
        ...baseConfig,
        logLevel: 'debug',
        includeRequestBodies: true,
        includeStackTraces: true,
        errorSampleRate: 1.0 // Log all errors in development
      };
  }
}

/**
 * Initialize Sentry error tracking (production)
 */
function initializeSentry(config: ErrorLoggingEnvironmentConfig): void {
  if (!config.sentryDsn) {
    console.log('Sentry DSN not configured, skipping Sentry initialization');
    return;
  }

  try {
    const Sentry = require('@sentry/node');
    
    Sentry.init({
      dsn: config.sentryDsn,
      environment: config.sentryEnvironment,
      release: config.sentryRelease,
      
      // Performance monitoring
      tracesSampleRate: config.enablePerformanceMonitoring ? 0.1 : 0,
      
      // Error sampling
      sampleRate: config.errorSampleRate,
      
      // Context configuration
      maxBreadcrumbs: 50,
      
      // Integration configuration
      integrations: [
        new Sentry.Integrations.Http({ tracing: true }),
        new Sentry.Integrations.Express({ app: undefined }),
      ],
      
      // Filter out sensitive data
      beforeSend(event) {
        // Remove sensitive headers
        if (event.request?.headers) {
          delete event.request.headers.authorization;
          delete event.request.headers.cookie;
          delete event.request.headers['x-api-key'];
        }
        
        // Remove sensitive query parameters
        if (event.request?.query_string) {
          const sensitiveParams = ['password', 'token', 'secret'];
          sensitiveParams.forEach(param => {
            if (event.request?.query_string?.includes(param)) {
              event.request.query_string = '[REDACTED]';
            }
          });
        }
        
        return event;
      }
    });
    
    console.log(`Sentry initialized for ${config.sentryEnvironment} environment`);
  } catch (error) {
    console.error('Failed to initialize Sentry:', error);
  }
}

/**
 * Configure global error logger settings
 */
function configureErrorLogger(config: ErrorLoggingEnvironmentConfig): void {
  // Set global tags
  errorLogger.setTag('environment', process.env.NODE_ENV || 'development');
  errorLogger.setTag('service', 'student-dashboard-backend');
  errorLogger.setTag('version', process.env.npm_package_version || 'unknown');
  
  // Set global context
  errorLogger.setContext('system', {
    nodeVersion: process.version,
    platform: process.platform,
    arch: process.arch,
    pid: process.pid,
    uptime: process.uptime()
  });
  
  errorLogger.setContext('configuration', {
    logLevel: config.logLevel,
    performanceMonitoring: config.enablePerformanceMonitoring,
    slowRequestThreshold: config.slowRequestThreshold,
    errorSampleRate: config.errorSampleRate
  });
  
  console.log('Error logger configured with global context');
}

/**
 * Setup health monitoring for error logging system
 */
function setupHealthMonitoring(): void {
  // Monitor memory usage
  setInterval(() => {
    const memUsage = process.memoryUsage();
    const memUsageMB = {
      rss: Math.round(memUsage.rss / 1024 / 1024),
      heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
      heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
      external: Math.round(memUsage.external / 1024 / 1024)
    };
    
    // Log warning if memory usage is high
    if (memUsageMB.heapUsed > 500) { // 500MB threshold
      errorLogger.logWarning(
        'High memory usage detected',
        {
          requestId: `health_${Date.now()}`,
          timestamp: new Date()
        },
        {
          memoryUsage: memUsageMB,
          threshold: 500,
          component: 'health-monitor'
        }
      );
    }
  }, 60000); // Check every minute
  
  console.log('Health monitoring initialized');
}

/**
 * Main setup function
 * Call this during application startup
 */
export function setupErrorLogging(): void {
  console.log('Initializing error logging system...');
  
  try {
    // Get environment configuration
    const config = getEnvironmentConfig();
    console.log(`Error logging configuration:`, {
      environment: process.env.NODE_ENV,
      logLevel: config.logLevel,
      performanceMonitoring: config.enablePerformanceMonitoring,
      sentryEnabled: !!config.sentryDsn
    });
    
    // Initialize Sentry if configured
    initializeSentry(config);
    
    // Configure global error logger
    configureErrorLogger(config);
    
    // Setup global error handlers
    setupGlobalErrorHandling();
    
    // Setup health monitoring
    setupHealthMonitoring();
    
    console.log('Error logging system initialized successfully');
    
    // Log initialization success
    errorLogger.logInfo(
      'Error logging system initialized',
      {
        requestId: `init_${Date.now()}`,
        timestamp: new Date()
      },
      {
        environment: process.env.NODE_ENV,
        configuration: config,
        component: 'error-logging-setup'
      }
    );
    
  } catch (error) {
    console.error('Failed to initialize error logging system:', error);
    // Don't throw here - we don't want error logging setup to crash the app
  }
}

/**
 * Graceful shutdown handler
 * Call this during application shutdown
 */
export async function shutdownErrorLogging(): Promise<void> {
  console.log('Shutting down error logging system...');
  
  try {
    // Log shutdown
    await errorLogger.logInfo(
      'Error logging system shutting down',
      {
        requestId: `shutdown_${Date.now()}`,
        timestamp: new Date()
      },
      {
        uptime: process.uptime(),
        component: 'error-logging-setup'
      }
    );
    
    // Close Sentry if initialized
    if (process.env.NODE_ENV === 'production' && process.env.SENTRY_DSN) {
      try {
        const Sentry = require('@sentry/node');
        await Sentry.close(2000); // 2 second timeout
        console.log('Sentry client closed');
      } catch (error) {
        console.error('Error closing Sentry client:', error);
      }
    }
    
    console.log('Error logging system shutdown complete');
    
  } catch (error) {
    console.error('Error during error logging shutdown:', error);
  }
}

/**
 * Test error logging system
 * Useful for verifying the setup works correctly
 */
export async function testErrorLogging(): Promise<void> {
  console.log('Testing error logging system...');
  
  try {
    // Test info logging
    await errorLogger.logInfo(
      'Error logging test - info level',
      {
        requestId: `test_${Date.now()}`,
        timestamp: new Date()
      },
      {
        testType: 'info',
        component: 'error-logging-test'
      }
    );
    
    // Test warning logging
    await errorLogger.logWarning(
      'Error logging test - warning level',
      {
        requestId: `test_${Date.now()}`,
        timestamp: new Date()
      },
      {
        testType: 'warning',
        component: 'error-logging-test'
      }
    );
    
    // Test error logging
    const testError = new Error('Test error for logging system verification');
    await errorLogger.logError(
      testError,
      {
        requestId: `test_${Date.now()}`,
        timestamp: new Date(),
        endpoint: '/test/error-logging'
      },
      {
        testType: 'error',
        component: 'error-logging-test'
      },
      ['test', 'error-logging']
    );
    
    console.log('Error logging test completed successfully');
    
  } catch (error) {
    console.error('Error logging test failed:', error);
  }
}

export type { ErrorLoggingEnvironmentConfig };