/**
 * SSE Client Utility with Automatic Reconnection
 * 
 * Implements Requirements:
 * - 2.4: Automatic reconnection with exponential backoff
 * 
 * Features:
 * - Exponential backoff (1s, 2s, 4s, 8s, max 30s)
 * - Event handling for different message types
 * - Connection state management
 * - Graceful error handling
 */

export interface SSEClientOptions {
  url: string;
  maxReconnectAttempts?: number;
  maxReconnectDelay?: number;
  onMessage?: (event: MessageEvent) => void;
  onError?: (error: Event) => void;
  onOpen?: (event: Event) => void;
  onClose?: (event: Event) => void;
  onReconnecting?: (attempt: number, delay: number) => void;
  onReconnected?: () => void;
  onMaxRetriesReached?: () => void;
}

export class SSEClient {
  private eventSource: EventSource | null = null;
  private options: Required<SSEClientOptions>;
  private reconnectAttempts = 0;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private isManuallyDisconnected = false;
  private connectionState: 'disconnected' | 'connecting' | 'connected' | 'reconnecting' = 'disconnected';

  constructor(options: SSEClientOptions) {
    this.options = {
      maxReconnectAttempts: 10,
      maxReconnectDelay: 30000, // 30 seconds
      onMessage: () => {},
      onError: () => {},
      onOpen: () => {},
      onClose: () => {},
      onReconnecting: () => {},
      onReconnected: () => {},
      onMaxRetriesReached: () => {},
      ...options,
    };
  }

  /**
   * Connect to SSE endpoint
   */
  connect(): void {
    if (this.eventSource && this.eventSource.readyState !== EventSource.CLOSED) {
      // SSE: Already connected or connecting
      return;
    }

    this.isManuallyDisconnected = false;
    this.connectionState = 'connecting';
    
    try {
      // SSE: Connecting to endpoint
      
      this.eventSource = new EventSource(this.options.url, {
        withCredentials: true,
      });

      this.setupEventListeners();
    } catch (error) {
      console.error('SSE: Failed to create EventSource:', error);
      this.handleReconnection();
    }
  }

  /**
   * Disconnect from SSE endpoint
   */
  disconnect(): void {
    this.isManuallyDisconnected = true;
    this.connectionState = 'disconnected';
    
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }

    this.reconnectAttempts = 0;
    // SSE: Manually disconnected
  }

  /**
   * Get current connection state
   */
  getConnectionState(): string {
    return this.connectionState;
  }

  /**
   * Get current reconnect attempts
   */
  getReconnectAttempts(): number {
    return this.reconnectAttempts;
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.eventSource?.readyState === EventSource.OPEN;
  }

  /**
   * Setup event listeners for EventSource
   */
  private setupEventListeners(): void {
    if (!this.eventSource) return;

    // Connection opened
    this.eventSource.onopen = (event) => {
      // SSE: Connection opened
      this.connectionState = 'connected';
      this.reconnectAttempts = 0;
      
      if (this.reconnectAttempts > 0) {
        this.options.onReconnected();
      }
      
      this.options.onOpen(event);
    };

    // Message received
    this.eventSource.onmessage = (event) => {
      try {
        JSON.parse(event.data);
        this.options.onMessage(event);
      } catch (error) {
        console.error('SSE: Failed to parse message:', error);
      }
    };

    // Error occurred
    this.eventSource.onerror = (event) => {
      console.error('SSE: Connection error:', event);
      this.connectionState = 'disconnected';
      this.options.onError(event);
      
      // Handle reconnection if not manually disconnected
      if (!this.isManuallyDisconnected) {
        this.handleReconnection();
      }
    };

    // Handle specific event types
    this.setupCustomEventListeners();
  }

  /**
   * Setup listeners for custom event types
   */
  private setupCustomEventListeners(): void {
    if (!this.eventSource) return;

    // Attendance update events
    this.eventSource.addEventListener('attendance_update', (event) => {
      try {
        const data = JSON.parse(event.data);
        
        // Dispatch custom event for attendance updates
        window.dispatchEvent(new CustomEvent('sse-attendance-update', {
          detail: data,
        }));
      } catch (error) {
        console.error('SSE: Failed to parse attendance update:', error);
      }
    });

    // Metrics update events
    this.eventSource.addEventListener('metrics_update', (event) => {
      try {
        const data = JSON.parse(event.data);
        
        // Dispatch custom event for metrics updates
        window.dispatchEvent(new CustomEvent('sse-metrics-update', {
          detail: data,
        }));
      } catch (error) {
        console.error('SSE: Failed to parse metrics update:', error);
      }
    });

    // Notification events
    this.eventSource.addEventListener('notification', (event) => {
      try {
        const data = JSON.parse(event.data);
        
        // Dispatch custom event for notifications
        window.dispatchEvent(new CustomEvent('sse-notification', {
          detail: data,
        }));
      } catch (error) {
        console.error('SSE: Failed to parse notification:', error);
      }
    });

    // Ping events (heartbeat)
    this.eventSource.addEventListener('ping', (event) => {
      try {
        const data = JSON.parse(event.data);
        
        // Update last ping time for connection health monitoring
        window.dispatchEvent(new CustomEvent('sse-ping', {
          detail: { timestamp: data.timestamp },
        }));
      } catch (error) {
        console.error('SSE: Failed to parse ping:', error);
      }
    });
  }

  /**
   * Handle reconnection with exponential backoff
   * Implements Requirements 2.4: Exponential backoff (1s, 2s, 4s, 8s, max 30s)
   */
  private handleReconnection(): void {
    if (this.isManuallyDisconnected) {
      return;
    }

    if (this.reconnectAttempts >= this.options.maxReconnectAttempts) {
      console.error(`SSE: Max reconnection attempts (${this.options.maxReconnectAttempts}) reached`);
      this.connectionState = 'disconnected';
      this.options.onMaxRetriesReached();
      return;
    }

    this.reconnectAttempts++;
    this.connectionState = 'reconnecting';

    // Calculate exponential backoff delay
    // 1s, 2s, 4s, 8s, 16s, 30s (max)
    const baseDelay = 1000; // 1 second
    const exponentialDelay = baseDelay * Math.pow(2, this.reconnectAttempts - 1);
    const delay = Math.min(exponentialDelay, this.options.maxReconnectDelay);

    // SSE: Reconnecting with exponential backoff
    this.options.onReconnecting(this.reconnectAttempts, delay);

    // Close existing connection
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }

    // Schedule reconnection
    this.reconnectTimer = setTimeout(() => {
      if (!this.isManuallyDisconnected) {
        this.connect();
      }
    }, delay);
  }
}

/**
 * Create SSE client with default configuration for student dashboard
 */
export function createStudentSSEClient(options: Partial<SSEClientOptions> = {}): SSEClient {
  const defaultOptions: SSEClientOptions = {
    url: '/api/students/notifications/sse',
    maxReconnectAttempts: 10,
    maxReconnectDelay: 30000,
    onMessage: (_event) => {
      // SSE message received
    },
    onError: (error) => {
      console.error('SSE error:', error);
    },
    onOpen: () => {
      // SSE connected
    },
    onClose: () => {
      // SSE disconnected
    },
    onReconnecting: (_attempt, _delay) => {
      // SSE reconnecting
    },
    onReconnected: () => {
      // SSE reconnected successfully
    },
    onMaxRetriesReached: () => {
      console.error('SSE max retries reached, giving up');
    },
    ...options,
  };

  return new SSEClient(defaultOptions);
}

/**
 * Hook for React components to use SSE
 */
export function useSSE(options: Partial<SSEClientOptions> = {}) {
  const [client, setClient] = React.useState<SSEClient | null>(null);
  const [connectionState, setConnectionState] = React.useState<string>('disconnected');
  const [reconnectAttempts, setReconnectAttempts] = React.useState<number>(0);

  React.useEffect(() => {
    const sseClient = createStudentSSEClient({
      ...options,
      onOpen: (event) => {
        setConnectionState('connected');
        options.onOpen?.(event);
      },
      onClose: (event) => {
        setConnectionState('disconnected');
        options.onClose?.(event);
      },
      onReconnecting: (attempt, delay) => {
        setConnectionState('reconnecting');
        setReconnectAttempts(attempt);
        options.onReconnecting?.(attempt, delay);
      },
      onReconnected: () => {
        setConnectionState('connected');
        setReconnectAttempts(0);
        options.onReconnected?.();
      },
    });

    setClient(sseClient);
    sseClient.connect();

    return () => {
      sseClient.disconnect();
    };
  }, []);

  return {
    client,
    connectionState,
    reconnectAttempts,
    isConnected: client?.isConnected() || false,
  };
}

// Add React import for the hook
import React from 'react';