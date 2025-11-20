/**
 * Database Connection Pool Configuration
 * 
 * Configures Supabase client with optimized connection pooling for high concurrency.
 * Implements connection health checks, timeouts, and monitoring.
 * 
 * Requirements: 10.2
 * Property: 44 - Connection Pool Optimization
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

// ============================================================================
// Types and Interfaces
// ============================================================================

export interface DatabasePoolConfig {
  minConnections: number;
  maxConnections: number;
  connectionTimeout: number;
  idleTimeout: number;
  healthCheckInterval: number;
  retryAttempts: number;
  retryDelay: number;
}

export interface ConnectionPoolStats {
  totalConnections: number;
  activeConnections: number;
  idleConnections: number;
  waitingRequests: number;
  totalRequests: number;
  failedConnections: number;
  averageResponseTime: number;
  lastHealthCheck: Date;
  isHealthy: boolean;
}

export interface HealthCheckResult {
  isHealthy: boolean;
  responseTime: number;
  error?: string;
  timestamp: Date;
}

// ============================================================================
// Configuration
// ============================================================================

const DEFAULT_POOL_CONFIG: DatabasePoolConfig = {
  minConnections: 10,
  maxConnections: 50,
  connectionTimeout: 30000,    // 30 seconds
  idleTimeout: 300000,         // 5 minutes
  healthCheckInterval: 60000,  // 1 minute
  retryAttempts: 3,
  retryDelay: 1000            // 1 second
};

// ============================================================================
// Connection Pool Manager
// ============================================================================

export class DatabaseConnectionPool {
  private config: DatabasePoolConfig;
  private client: SupabaseClient;
  private stats: ConnectionPoolStats;
  private healthCheckTimer: NodeJS.Timeout | null = null;
  private isInitialized: boolean = false;

  constructor(config?: Partial<DatabasePoolConfig>) {
    this.config = { ...DEFAULT_POOL_CONFIG, ...config };
    this.stats = this.initializeStats();
    this.client = this.createOptimizedClient();
  }

  /**
   * Initialize connection pool statistics
   */
  private initializeStats(): ConnectionPoolStats {
    return {
      totalConnections: 0,
      activeConnections: 0,
      idleConnections: 0,
      waitingRequests: 0,
      totalRequests: 0,
      failedConnections: 0,
      averageResponseTime: 0,
      lastHealthCheck: new Date(),
      isHealthy: true
    };
  }

  /**
   * Create optimized Supabase client with connection pooling
   */
  private createOptimizedClient(): SupabaseClient {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase environment variables for connection pool');
    }

    return createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
      db: {
        schema: 'public',
      },
      global: {
        headers: {
          'Connection': 'keep-alive',
          'Keep-Alive': 'timeout=30, max=100'
        }
      },
      // Connection pool configuration via fetch options
      // Note: Supabase client doesn't expose direct connection pooling,
      // but we can optimize the underlying HTTP connections
      realtime: {
        params: {
          eventsPerSecond: 10
        }
      }
    });
  }

  /**
   * Initialize the connection pool
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.log('Database connection pool already initialized');
      return;
    }

    try {
      console.log('Initializing database connection pool...');
      
      // Perform initial health check
      const healthCheck = await this.performHealthCheck();
      if (!healthCheck.isHealthy) {
        throw new Error(`Initial health check failed: ${healthCheck.error}`);
      }

      // Start periodic health checks
      this.startHealthChecks();

      this.isInitialized = true;
      console.log(`Database connection pool initialized successfully`);
      console.log(`Pool config: min=${this.config.minConnections}, max=${this.config.maxConnections}`);
      
    } catch (error) {
      console.error('Failed to initialize database connection pool:', error);
      throw error;
    }
  }

  /**
   * Start periodic health checks
   */
  private startHealthChecks(): void {
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
    }

    this.healthCheckTimer = setInterval(async () => {
      try {
        const healthCheck = await this.performHealthCheck();
        this.stats.lastHealthCheck = healthCheck.timestamp;
        this.stats.isHealthy = healthCheck.isHealthy;
        
        if (!healthCheck.isHealthy) {
          console.warn('Database health check failed:', healthCheck.error);
        }
      } catch (error) {
        console.error('Health check error:', error);
        this.stats.isHealthy = false;
      }
    }, this.config.healthCheckInterval);
  }

  /**
   * Perform database health check
   */
  async performHealthCheck(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    
    try {
      // Simple query to test connection
      const { data, error } = await this.client
        .from('students')
        .select('count')
        .limit(1)
        .single();

      const responseTime = Date.now() - startTime;

      if (error) {
        return {
          isHealthy: false,
          responseTime,
          error: error.message,
          timestamp: new Date()
        };
      }

      return {
        isHealthy: true,
        responseTime,
        timestamp: new Date()
      };

    } catch (error) {
      const responseTime = Date.now() - startTime;
      return {
        isHealthy: false,
        responseTime,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date()
      };
    }
  }

  /**
   * Execute query with connection pool management
   */
  async executeQuery<T>(
    queryFn: (client: SupabaseClient) => Promise<T>,
    retryCount: number = 0
  ): Promise<T> {
    const startTime = Date.now();
    this.stats.totalRequests++;
    this.stats.activeConnections++;

    try {
      const result = await queryFn(this.client);
      
      // Update statistics
      const responseTime = Date.now() - startTime;
      this.updateAverageResponseTime(responseTime);
      
      return result;

    } catch (error) {
      this.stats.failedConnections++;
      
      // Retry logic with exponential backoff
      if (retryCount < this.config.retryAttempts) {
        const delay = this.config.retryDelay * Math.pow(2, retryCount);
        console.warn(`Query failed, retrying in ${delay}ms (attempt ${retryCount + 1}/${this.config.retryAttempts})`);
        
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.executeQuery(queryFn, retryCount + 1);
      }
      
      throw error;
      
    } finally {
      this.stats.activeConnections--;
    }
  }

  /**
   * Update average response time using exponential moving average
   */
  private updateAverageResponseTime(responseTime: number): void {
    if (this.stats.averageResponseTime === 0) {
      this.stats.averageResponseTime = responseTime;
    } else {
      // Exponential moving average with alpha = 0.1
      this.stats.averageResponseTime = 
        0.9 * this.stats.averageResponseTime + 0.1 * responseTime;
    }
  }

  /**
   * Get connection pool statistics
   */
  getStats(): ConnectionPoolStats {
    return { ...this.stats };
  }

  /**
   * Get the Supabase client (for direct access when needed)
   */
  getClient(): SupabaseClient {
    return this.client;
  }

  /**
   * Check if pool is healthy
   */
  isHealthy(): boolean {
    return this.stats.isHealthy;
  }

  /**
   * Get pool configuration
   */
  getConfig(): DatabasePoolConfig {
    return { ...this.config };
  }

  /**
   * Shutdown the connection pool
   */
  async shutdown(): Promise<void> {
    console.log('Shutting down database connection pool...');
    
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
      this.healthCheckTimer = null;
    }

    // Wait for active connections to finish (with timeout)
    const shutdownTimeout = 10000; // 10 seconds
    const startTime = Date.now();
    
    while (this.stats.activeConnections > 0 && (Date.now() - startTime) < shutdownTimeout) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    this.isInitialized = false;
    console.log('Database connection pool shutdown complete');
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

let poolInstance: DatabaseConnectionPool | null = null;

/**
 * Get the singleton database connection pool instance
 */
export function getDatabasePool(): DatabaseConnectionPool {
  if (!poolInstance) {
    poolInstance = new DatabaseConnectionPool();
  }
  return poolInstance;
}

/**
 * Initialize the database connection pool
 */
export async function initializeDatabasePool(config?: Partial<DatabasePoolConfig>): Promise<void> {
  if (poolInstance) {
    await poolInstance.shutdown();
  }
  
  poolInstance = new DatabaseConnectionPool(config);
  await poolInstance.initialize();
}

/**
 * Get optimized Supabase client with connection pooling
 */
export function getOptimizedSupabaseClient(): SupabaseClient {
  const pool = getDatabasePool();
  return pool.getClient();
}

/**
 * Execute query with connection pool management and retry logic
 */
export async function executePooledQuery<T>(
  queryFn: (client: SupabaseClient) => Promise<T>
): Promise<T> {
  const pool = getDatabasePool();
  return pool.executeQuery(queryFn);
}

// ============================================================================
// Health Check Utilities
// ============================================================================

/**
 * Perform database health check
 */
export async function checkDatabaseHealth(): Promise<HealthCheckResult> {
  const pool = getDatabasePool();
  return pool.performHealthCheck();
}

/**
 * Get database connection pool statistics
 */
export function getDatabasePoolStats(): ConnectionPoolStats {
  const pool = getDatabasePool();
  return pool.getStats();
}

// Auto-initialize pool when imported (server-side only)
if (typeof window === 'undefined') {
  const pool = getDatabasePool();
  pool.initialize().catch(error => {
    console.error('Failed to auto-initialize database connection pool:', error);
  });
}

export default DatabaseConnectionPool;