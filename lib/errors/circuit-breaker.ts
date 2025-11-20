/**
 * Circuit breaker implementation for external services
 * 
 * Prevents cascading failures by monitoring service health and
 * temporarily blocking requests to failing services.
 */

import { ExternalServiceError } from './custom-errors';

/**
 * Circuit breaker states
 */
export enum CircuitBreakerState {
  CLOSED = 'CLOSED',     // Normal operation - requests pass through
  OPEN = 'OPEN',         // Service is failing - requests are blocked
  HALF_OPEN = 'HALF_OPEN' // Testing if service has recovered
}

/**
 * Configuration for circuit breaker behavior
 */
export interface CircuitBreakerConfig {
  failureThreshold: number;      // Open circuit after N failures
  successThreshold: number;      // Close circuit after N successes in half-open
  timeout: number;               // Milliseconds before attempting reset
  monitoringPeriod: number;      // Time window for failure counting (ms)
  name?: string;                 // Circuit breaker name for logging
}

/**
 * Circuit breaker statistics
 */
export interface CircuitBreakerStats {
  state: CircuitBreakerState;
  failures: number;
  successes: number;
  totalRequests: number;
  lastFailureTime?: Date;
  lastSuccessTime?: Date;
  nextAttemptTime?: Date;
}

/**
 * Circuit breaker implementation
 */
export class CircuitBreaker {
  private state: CircuitBreakerState = CircuitBreakerState.CLOSED;
  private failures: number = 0;
  private successes: number = 0;
  private totalRequests: number = 0;
  private lastFailureTime?: Date;
  private lastSuccessTime?: Date;
  private nextAttemptTime?: Date;
  private readonly config: CircuitBreakerConfig;

  constructor(config: CircuitBreakerConfig) {
    this.config = {
      name: 'CircuitBreaker',
      ...config
    };
  }

  /**
   * Execute a function with circuit breaker protection
   * 
   * @param fn - The function to execute
   * @returns Promise with the result
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    this.totalRequests++;

    // Check if circuit is open and if we should attempt a reset
    if (this.state === CircuitBreakerState.OPEN) {
      if (this.shouldAttemptReset()) {
        this.state = CircuitBreakerState.HALF_OPEN;
        this.log('Circuit breaker transitioning to HALF_OPEN state');
      } else {
        throw new ExternalServiceError(
          `Circuit breaker is OPEN for ${this.config.name}. Service is temporarily unavailable.`,
          this.config.name
        );
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  /**
   * Handle successful execution
   */
  private onSuccess(): void {
    this.successes++;
    this.lastSuccessTime = new Date();

    if (this.state === CircuitBreakerState.HALF_OPEN) {
      if (this.successes >= this.config.successThreshold) {
        this.reset();
        this.log('Circuit breaker reset to CLOSED state after successful recovery');
      }
    } else if (this.state === CircuitBreakerState.CLOSED) {
      // Reset failure count on success in closed state
      this.failures = 0;
    }
  }

  /**
   * Handle failed execution
   */
  private onFailure(): void {
    this.failures++;
    this.lastFailureTime = new Date();

    if (this.state === CircuitBreakerState.CLOSED || this.state === CircuitBreakerState.HALF_OPEN) {
      if (this.failures >= this.config.failureThreshold) {
        this.trip();
        this.log(`Circuit breaker tripped to OPEN state after ${this.failures} failures`);
      }
    }
  }

  /**
   * Trip the circuit breaker to OPEN state
   */
  private trip(): void {
    this.state = CircuitBreakerState.OPEN;
    this.nextAttemptTime = new Date(Date.now() + this.config.timeout);
  }

  /**
   * Reset the circuit breaker to CLOSED state
   */
  private reset(): void {
    this.state = CircuitBreakerState.CLOSED;
    this.failures = 0;
    this.successes = 0;
    this.nextAttemptTime = undefined;
  }

  /**
   * Check if we should attempt to reset the circuit breaker
   */
  private shouldAttemptReset(): boolean {
    return this.nextAttemptTime ? Date.now() >= this.nextAttemptTime.getTime() : false;
  }

  /**
   * Get current circuit breaker statistics
   */
  getStats(): CircuitBreakerStats {
    return {
      state: this.state,
      failures: this.failures,
      successes: this.successes,
      totalRequests: this.totalRequests,
      lastFailureTime: this.lastFailureTime,
      lastSuccessTime: this.lastSuccessTime,
      nextAttemptTime: this.nextAttemptTime
    };
  }

  /**
   * Check if the circuit breaker is currently allowing requests
   */
  isRequestAllowed(): boolean {
    if (this.state === CircuitBreakerState.CLOSED || this.state === CircuitBreakerState.HALF_OPEN) {
      return true;
    }

    if (this.state === CircuitBreakerState.OPEN) {
      return this.shouldAttemptReset();
    }

    return false;
  }

  /**
   * Manually reset the circuit breaker (admin function)
   */
  forceReset(): void {
    this.reset();
    this.log('Circuit breaker manually reset');
  }

  /**
   * Log circuit breaker events
   */
  private log(message: string): void {
    console.log(`[CircuitBreaker:${this.config.name}] ${message}`, {
      state: this.state,
      failures: this.failures,
      successes: this.successes,
      totalRequests: this.totalRequests
    });
  }
}

/**
 * Default circuit breaker configurations for different services
 */
export const DEFAULT_CIRCUIT_BREAKER_CONFIGS = {
  // Redis cache circuit breaker
  REDIS: {
    failureThreshold: 5,
    successThreshold: 2,
    timeout: 30000,        // 30 seconds
    monitoringPeriod: 60000, // 1 minute
    name: 'Redis'
  } as CircuitBreakerConfig,

  // Supabase Storage circuit breaker
  SUPABASE_STORAGE: {
    failureThreshold: 3,
    successThreshold: 2,
    timeout: 60000,        // 1 minute
    monitoringPeriod: 300000, // 5 minutes
    name: 'SupabaseStorage'
  } as CircuitBreakerConfig,

  // Database circuit breaker
  DATABASE: {
    failureThreshold: 3,
    successThreshold: 1,
    timeout: 15000,        // 15 seconds
    monitoringPeriod: 60000, // 1 minute
    name: 'Database'
  } as CircuitBreakerConfig,

  // External API circuit breaker
  EXTERNAL_API: {
    failureThreshold: 5,
    successThreshold: 3,
    timeout: 120000,       // 2 minutes
    monitoringPeriod: 600000, // 10 minutes
    name: 'ExternalAPI'
  } as CircuitBreakerConfig
};

/**
 * Circuit breaker registry to manage multiple circuit breakers
 */
export class CircuitBreakerRegistry {
  private circuitBreakers: Map<string, CircuitBreaker> = new Map();

  /**
   * Get or create a circuit breaker for a service
   * 
   * @param serviceName - Name of the service
   * @param config - Circuit breaker configuration
   * @returns Circuit breaker instance
   */
  getCircuitBreaker(serviceName: string, config?: CircuitBreakerConfig): CircuitBreaker {
    if (!this.circuitBreakers.has(serviceName)) {
      const defaultConfig = this.getDefaultConfig(serviceName);
      const finalConfig = config || defaultConfig;
      this.circuitBreakers.set(serviceName, new CircuitBreaker(finalConfig));
    }

    return this.circuitBreakers.get(serviceName)!;
  }

  /**
   * Execute a function with circuit breaker protection
   * 
   * @param serviceName - Name of the service
   * @param fn - Function to execute
   * @param config - Optional circuit breaker configuration
   * @returns Promise with the result
   */
  async execute<T>(
    serviceName: string,
    fn: () => Promise<T>,
    config?: CircuitBreakerConfig
  ): Promise<T> {
    const circuitBreaker = this.getCircuitBreaker(serviceName, config);
    return circuitBreaker.execute(fn);
  }

  /**
   * Get statistics for all circuit breakers
   */
  getAllStats(): Record<string, CircuitBreakerStats> {
    const stats: Record<string, CircuitBreakerStats> = {};
    
    for (const [serviceName, circuitBreaker] of this.circuitBreakers) {
      stats[serviceName] = circuitBreaker.getStats();
    }

    return stats;
  }

  /**
   * Reset all circuit breakers
   */
  resetAll(): void {
    for (const circuitBreaker of this.circuitBreakers.values()) {
      circuitBreaker.forceReset();
    }
  }

  /**
   * Get default configuration for a service
   */
  private getDefaultConfig(serviceName: string): CircuitBreakerConfig {
    const upperServiceName = serviceName.toUpperCase();
    
    if (upperServiceName.includes('REDIS')) {
      return DEFAULT_CIRCUIT_BREAKER_CONFIGS.REDIS;
    }
    
    if (upperServiceName.includes('SUPABASE') || upperServiceName.includes('STORAGE')) {
      return DEFAULT_CIRCUIT_BREAKER_CONFIGS.SUPABASE_STORAGE;
    }
    
    if (upperServiceName.includes('DATABASE') || upperServiceName.includes('DB')) {
      return DEFAULT_CIRCUIT_BREAKER_CONFIGS.DATABASE;
    }

    return DEFAULT_CIRCUIT_BREAKER_CONFIGS.EXTERNAL_API;
  }
}

/**
 * Global circuit breaker registry instance
 */
export const circuitBreakerRegistry = new CircuitBreakerRegistry();

/**
 * Convenience function to execute with circuit breaker protection
 * 
 * @param serviceName - Name of the service
 * @param fn - Function to execute
 * @param config - Optional circuit breaker configuration
 * @returns Promise with the result
 */
export async function withCircuitBreaker<T>(
  serviceName: string,
  fn: () => Promise<T>,
  config?: CircuitBreakerConfig
): Promise<T> {
  return circuitBreakerRegistry.execute(serviceName, fn, config);
}

/**
 * Create a circuit breaker protected version of any async function
 * 
 * @param serviceName - Name of the service
 * @param fn - The function to protect
 * @param config - Optional circuit breaker configuration
 * @returns Protected version of the function
 */
export function makeCircuitBreakerProtected<TArgs extends any[], TReturn>(
  serviceName: string,
  fn: (...args: TArgs) => Promise<TReturn>,
  config?: CircuitBreakerConfig
) {
  return async (...args: TArgs): Promise<TReturn> => {
    return withCircuitBreaker(serviceName, () => fn(...args), config);
  };
}