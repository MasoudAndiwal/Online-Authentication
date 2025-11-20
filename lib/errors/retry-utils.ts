/**
 * Retry utilities with exponential backoff for handling transient failures
 * 
 * Implements retry logic for database operations, cache operations,
 * and external service calls with configurable retry strategies.
 */

import { 
  DatabaseError, 
  CacheError, 
  ExternalServiceError, 
  isRetryableError 
} from './custom-errors';

/**
 * Configuration for retry behavior
 */
export interface RetryConfig {
  maxAttempts: number;           // Maximum number of retry attempts
  baseDelay: number;             // Base delay in milliseconds
  maxDelay: number;              // Maximum delay in milliseconds
  backoffMultiplier: number;     // Multiplier for exponential backoff
  jitter: boolean;               // Add random jitter to prevent thundering herd
  shouldRetry?: (error: Error, attempt: number) => boolean;  // Custom retry condition
}

/**
 * Result of a retry operation
 */
export interface RetryResult<T> {
  success: boolean;
  result?: T;
  error?: Error;
  attempts: number;
  totalDuration: number;
}

/**
 * Default retry configurations for different operation types
 */
export const DEFAULT_RETRY_CONFIGS = {
  // Database operations - aggressive retry for transient failures
  DATABASE: {
    maxAttempts: 3,
    baseDelay: 1000,      // 1 second
    maxDelay: 8000,       // 8 seconds
    backoffMultiplier: 2,
    jitter: true,
    shouldRetry: (error: Error, attempt: number) => {
      return error instanceof DatabaseError && 
             attempt < 3 &&
             (error.message.includes('connection') || 
              error.message.includes('timeout') ||
              error.message.includes('ECONNREFUSED'));
    }
  } as RetryConfig,

  // Cache operations - quick retry for cache misses
  CACHE: {
    maxAttempts: 2,
    baseDelay: 100,       // 100ms
    maxDelay: 1000,       // 1 second
    backoffMultiplier: 2,
    jitter: false,
    shouldRetry: (error: Error, attempt: number) => {
      return error instanceof CacheError && 
             attempt < 2 &&
             (error.message.includes('connection') ||
              error.message.includes('timeout'));
    }
  } as RetryConfig,

  // External service calls - moderate retry with backoff
  EXTERNAL_SERVICE: {
    maxAttempts: 3,
    baseDelay: 2000,      // 2 seconds
    maxDelay: 16000,      // 16 seconds
    backoffMultiplier: 2,
    jitter: true,
    shouldRetry: (error: Error, attempt: number) => {
      return error instanceof ExternalServiceError && 
             attempt < 3 &&
             !error.message.includes('401') &&  // Don't retry auth errors
             !error.message.includes('403');    // Don't retry permission errors
    }
  } as RetryConfig,

  // General retryable errors
  GENERAL: {
    maxAttempts: 3,
    baseDelay: 1000,
    maxDelay: 8000,
    backoffMultiplier: 2,
    jitter: true,
    shouldRetry: (error: Error, attempt: number) => {
      return isRetryableError(error) && attempt < 3;
    }
  } as RetryConfig
};

/**
 * Execute a function with retry logic and exponential backoff
 * 
 * @param fn - The async function to execute
 * @param config - Retry configuration
 * @returns Promise with retry result
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  config: RetryConfig = DEFAULT_RETRY_CONFIGS.GENERAL
): Promise<RetryResult<T>> {
  const startTime = Date.now();
  let lastError: Error | undefined;
  let attempts = 0;

  for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
    attempts = attempt;
    
    try {
      const result = await fn();
      return {
        success: true,
        result,
        attempts,
        totalDuration: Date.now() - startTime
      };
    } catch (error) {
      lastError = error as Error;
      
      // Check if we should retry this error
      const shouldRetry = config.shouldRetry 
        ? config.shouldRetry(lastError, attempt)
        : isRetryableError(lastError);

      // If this is the last attempt or we shouldn't retry, break
      if (attempt === config.maxAttempts || !shouldRetry) {
        break;
      }

      // Calculate delay for next attempt
      const delay = calculateDelay(attempt, config);
      
      // Log retry attempt
      console.warn(`Retry attempt ${attempt}/${config.maxAttempts} after ${delay}ms delay:`, {
        error: lastError.message,
        attempt,
        delay
      });

      // Wait before next attempt
      await sleep(delay);
    }
  }

  return {
    success: false,
    error: lastError,
    attempts,
    totalDuration: Date.now() - startTime
  };
}

/**
 * Calculate delay for exponential backoff with optional jitter
 * 
 * @param attempt - Current attempt number (1-based)
 * @param config - Retry configuration
 * @returns Delay in milliseconds
 */
function calculateDelay(attempt: number, config: RetryConfig): number {
  // Calculate exponential backoff: baseDelay * (backoffMultiplier ^ (attempt - 1))
  let delay = config.baseDelay * Math.pow(config.backoffMultiplier, attempt - 1);
  
  // Cap at maximum delay
  delay = Math.min(delay, config.maxDelay);
  
  // Add jitter to prevent thundering herd problem
  if (config.jitter) {
    // Add random jitter of ±25%
    const jitterRange = delay * 0.25;
    const jitter = (Math.random() - 0.5) * 2 * jitterRange;
    delay = Math.max(0, delay + jitter);
  }
  
  return Math.round(delay);
}

/**
 * Sleep for specified milliseconds
 * 
 * @param ms - Milliseconds to sleep
 * @returns Promise that resolves after delay
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Exponential backoff utility function
 * 
 * @param attempt - Current attempt number (1-based)
 * @param baseDelay - Base delay in milliseconds
 * @param maxDelay - Maximum delay in milliseconds
 * @param multiplier - Backoff multiplier
 * @returns Calculated delay in milliseconds
 */
export function exponentialBackoff(
  attempt: number,
  baseDelay: number = 1000,
  maxDelay: number = 30000,
  multiplier: number = 2
): number {
  const delay = baseDelay * Math.pow(multiplier, attempt - 1);
  return Math.min(delay, maxDelay);
}

/**
 * Retry wrapper specifically for database operations
 * 
 * @param fn - Database operation function
 * @param customConfig - Optional custom configuration
 * @returns Promise with retry result
 */
export async function withDatabaseRetry<T>(
  fn: () => Promise<T>,
  customConfig?: Partial<RetryConfig>
): Promise<T> {
  const config = { ...DEFAULT_RETRY_CONFIGS.DATABASE, ...customConfig };
  const result = await withRetry(fn, config);
  
  if (!result.success) {
    throw result.error || new DatabaseError('Database operation failed after retries');
  }
  
  return result.result!;
}

/**
 * Retry wrapper specifically for cache operations
 * 
 * @param fn - Cache operation function
 * @param customConfig - Optional custom configuration
 * @returns Promise with retry result
 */
export async function withCacheRetry<T>(
  fn: () => Promise<T>,
  customConfig?: Partial<RetryConfig>
): Promise<T> {
  const config = { ...DEFAULT_RETRY_CONFIGS.CACHE, ...customConfig };
  const result = await withRetry(fn, config);
  
  if (!result.success) {
    throw result.error || new CacheError('Cache operation failed after retries');
  }
  
  return result.result!;
}

/**
 * Retry wrapper specifically for external service calls
 * 
 * @param fn - External service call function
 * @param customConfig - Optional custom configuration
 * @returns Promise with retry result
 */
export async function withExternalServiceRetry<T>(
  fn: () => Promise<T>,
  customConfig?: Partial<RetryConfig>
): Promise<T> {
  const config = { ...DEFAULT_RETRY_CONFIGS.EXTERNAL_SERVICE, ...customConfig };
  const result = await withRetry(fn, config);
  
  if (!result.success) {
    throw result.error || new ExternalServiceError('External service call failed after retries');
  }
  
  return result.result!;
}

/**
 * Create a retryable version of any async function
 * 
 * @param fn - The function to make retryable
 * @param config - Retry configuration
 * @returns Retryable version of the function
 */
export function makeRetryable<TArgs extends any[], TReturn>(
  fn: (...args: TArgs) => Promise<TReturn>,
  config: RetryConfig = DEFAULT_RETRY_CONFIGS.GENERAL
) {
  return async (...args: TArgs): Promise<TReturn> => {
    const result = await withRetry(() => fn(...args), config);
    
    if (!result.success) {
      throw result.error || new Error('Operation failed after retries');
    }
    
    return result.result!;
  };
}

/**
 * Batch retry operations with different configurations
 * 
 * @param operations - Array of operations with their configs
 * @returns Promise with all results
 */
export async function batchRetry<T>(
  operations: Array<{
    fn: () => Promise<T>;
    config?: RetryConfig;
    name?: string;
  }>
): Promise<Array<RetryResult<T>>> {
  const promises = operations.map(async (op, index) => {
    const config = op.config || DEFAULT_RETRY_CONFIGS.GENERAL;
    const name = op.name || `Operation ${index + 1}`;
    
    try {
      return await withRetry(op.fn, config);
    } catch (error) {
      console.error(`Batch operation '${name}' failed:`, error);
      return {
        success: false,
        error: error as Error,
        attempts: config.maxAttempts,
        totalDuration: 0
      };
    }
  });

  return Promise.all(promises);
}