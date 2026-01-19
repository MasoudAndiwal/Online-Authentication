/**
 * WebSocket Manager for Office Messaging
 * 
 * Handles real-time communication with support for:
 * - Auto-reconnection with exponential backoff
 * - Message delivery status updates
 * - Typing indicators
 * - Reaction updates
 * - Connection state management
 */

import type {
  User,
  WebSocketMessage,
  NewMessageEvent,
  MessageStatusEvent,
  TypingIndicatorEvent,
  ReactionEvent,
  MessagePinnedEvent,
  DeliveryStatus,
  ConnectionError,
} from '@/types/office/messaging';

// ============================================================================
// Types
// ============================================================================

export type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'reconnecting';

export interface WebSocketConfig {
  url: string;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  heartbeatInterval?: number;
}

export interface WebSocketEventHandlers {
  onMessage?: (event: NewMessageEvent) => void;
  onMessageStatus?: (event: MessageStatusEvent) => void;
  onTypingIndicator?: (event: TypingIndicatorEvent) => void;
  onReaction?: (event: ReactionEvent) => void;
  onMessagePinned?: (event: MessagePinnedEvent) => void;
  onConnectionStateChange?: (state: ConnectionState) => void;
  onError?: (error: Error) => void;
}

// ============================================================================
// WebSocket Manager Class
// ============================================================================

export class WebSocketManager {
  private ws: WebSocket | null = null;
  private config: Required<WebSocketConfig>;
  private handlers: WebSocketEventHandlers = {};
  private connectionState: ConnectionState = 'disconnected';
  private reconnectAttempts = 0;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private currentUser: User | null = null;
  private isIntentionalDisconnect = false;

  constructor(config: WebSocketConfig) {
    this.config = {
      url: config.url,
      reconnectInterval: config.reconnectInterval || 3000,
      maxReconnectAttempts: config.maxReconnectAttempts || 10,
      heartbeatInterval: config.heartbeatInterval || 30000,
    };
  }
  /**
   * Set the current user
   */
  setCurrentUser(user: User): void {
    this.currentUser = user;
  }

  /**
   * Register event handlers
   */
  on(handlers: WebSocketEventHandlers): void {
    this.handlers = { ...this.handlers, ...handlers };
  }

  /**
   * Connect to WebSocket server
   */
  connect(): void {
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      console.log('WebSocket already connected or connecting');
      return;
    }

    if (!this.currentUser) {
      throw new Error('User not set. Call setCurrentUser() before connecting.');
    }

    this.isIntentionalDisconnect = false;
    this.setConnectionState('connecting');

    try {
      // Add user info to WebSocket URL
      const url = `${this.config.url}?userId=${this.currentUser.id}&userType=${this.currentUser.role}`;
      this.ws = new WebSocket(url);

      this.ws.onopen = this.handleOpen.bind(this);
      this.ws.onmessage = this.handleMessage.bind(this);
      this.ws.onerror = this.handleError.bind(this);
      this.ws.onclose = this.handleClose.bind(this);
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      this.handleError(error as Event);
    }
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    this.isIntentionalDisconnect = true;
    this.cleanup();
    this.setConnectionState('disconnected');
  }

  /**
   * Reconnect to WebSocket server
   */
  reconnect(): void {
    this.disconnect();
    this.reconnectAttempts = 0;
    this.connect();
  }
  /**
   * Get current connection state
   */
  getConnectionState(): ConnectionState {
    return this.connectionState;
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.connectionState === 'connected' && this.ws?.readyState === WebSocket.OPEN;
  }

  /**
   * Send typing indicator
   */
  sendTypingIndicator(conversationId: string): void {
    if (!this.isConnected() || !this.currentUser) {
      return;
    }

    this.send({
      type: 'typing_indicator',
      payload: {
        conversationId,
        userId: this.currentUser.id,
        userName: this.currentUser.name,
        isTyping: true,
      },
    });
  }

  /**
   * Stop typing indicator
   */
  stopTypingIndicator(conversationId: string): void {
    if (!this.isConnected() || !this.currentUser) {
      return;
    }

    this.send({
      type: 'typing_indicator',
      payload: {
        conversationId,
        userId: this.currentUser.id,
        userName: this.currentUser.name,
        isTyping: false,
      },
    });
  }

  /**
   * Send a message through WebSocket
   */
  private send(message: WebSocketMessage): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn('WebSocket not connected, cannot send message');
      return;
    }

    try {
      this.ws.send(JSON.stringify(message));
    } catch (error) {
      console.error('Failed to send WebSocket message:', error);
    }
  }
  // ============================================================================
  // Event Handlers
  // ============================================================================

  /**
   * Handle WebSocket open event
   */
  private handleOpen(): void {
    console.log('WebSocket connected');
    this.reconnectAttempts = 0;
    this.setConnectionState('connected');
    this.startHeartbeat();
  }

  /**
   * Handle incoming WebSocket messages
   */
  private handleMessage(event: MessageEvent): void {
    try {
      const message: WebSocketMessage = JSON.parse(event.data);

      switch (message.type) {
        case 'new_message':
          this.handlers.onMessage?.(message.payload as NewMessageEvent);
          break;

        case 'message_status':
          this.handlers.onMessageStatus?.(message.payload as MessageStatusEvent);
          break;

        case 'typing_indicator':
          this.handlers.onTypingIndicator?.(message.payload as TypingIndicatorEvent);
          break;

        case 'reaction_added':
        case 'reaction_removed':
          this.handlers.onReaction?.(message.payload as ReactionEvent);
          break;

        case 'message_pinned':
        case 'message_unpinned':
          this.handlers.onMessagePinned?.(message.payload as MessagePinnedEvent);
          break;

        default:
          console.warn('Unknown WebSocket message type:', message.type);
      }
    } catch (error) {
      console.error('Failed to parse WebSocket message:', error);
    }
  }

  /**
   * Handle WebSocket error event
   */
  private handleError(event: Event): void {
    console.error('WebSocket error:', event);
    const error = new Error('WebSocket connection error') as ConnectionError;
    this.handlers.onError?.(error);
  }
  /**
   * Handle WebSocket close event
   */
  private handleClose(event: CloseEvent): void {
    console.log('WebSocket closed:', event.code, event.reason);
    this.stopHeartbeat();

    if (this.isIntentionalDisconnect) {
      this.setConnectionState('disconnected');
      return;
    }

    // Attempt to reconnect
    if (this.reconnectAttempts < this.config.maxReconnectAttempts) {
      this.attemptReconnect();
    } else {
      console.error('Max reconnection attempts reached');
      this.setConnectionState('disconnected');
      this.handlers.onError?.(new Error('Failed to reconnect after maximum attempts') as ConnectionError);
    }
  }

  // ============================================================================
  // Reconnection Logic
  // ============================================================================

  /**
   * Attempt to reconnect with exponential backoff
   */
  private attemptReconnect(): void {
    this.setConnectionState('reconnecting');
    this.reconnectAttempts++;

    // Exponential backoff: 3s, 6s, 12s, 24s, etc.
    const delay = Math.min(
      this.config.reconnectInterval * Math.pow(2, this.reconnectAttempts - 1),
      30000 // Max 30 seconds
    );

    console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts}/${this.config.maxReconnectAttempts})`);

    this.reconnectTimeout = setTimeout(() => {
      this.connect();
    }, delay);
  }

  // ============================================================================
  // Heartbeat
  // ============================================================================

  /**
   * Start heartbeat to keep connection alive
   */
  private startHeartbeat(): void {
    this.stopHeartbeat();

    this.heartbeatInterval = setInterval(() => {
      if (this.isConnected()) {
        this.send({
          type: 'ping' as any,
          payload: { timestamp: Date.now() },
        });
      }
    }, this.config.heartbeatInterval);
  }

  /**
   * Stop heartbeat
   */
  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }
  // ============================================================================
  // Utility Methods
  // ============================================================================

  /**
   * Set connection state and notify handlers
   */
  private setConnectionState(state: ConnectionState): void {
    if (this.connectionState !== state) {
      this.connectionState = state;
      this.handlers.onConnectionStateChange?.(state);
    }
  }

  /**
   * Cleanup resources
   */
  private cleanup(): void {
    this.stopHeartbeat();

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.ws) {
      this.ws.onopen = null;
      this.ws.onmessage = null;
      this.ws.onerror = null;
      this.ws.onclose = null;

      if (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING) {
        this.ws.close();
      }

      this.ws = null;
    }
  }
}

// ============================================================================
// Factory Function
// ============================================================================

/**
 * Create a WebSocket manager instance
 */
export function createWebSocketManager(config: WebSocketConfig): WebSocketManager {
  return new WebSocketManager(config);
}

// ============================================================================
// Default Export
// ============================================================================

// Create default instance (URL should be configured from environment)
const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3000/ws';

export const defaultWebSocketManager = createWebSocketManager({
  url: WS_URL,
  reconnectInterval: 3000,
  maxReconnectAttempts: 10,
  heartbeatInterval: 30000,
});
