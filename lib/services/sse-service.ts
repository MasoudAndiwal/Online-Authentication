/**
 * SSEService
 * Server-Sent Events service for real-time attendance updates
 * Manages SSE connections, broadcasts, and cleanup with Redis tracking
 * 
 * Implements Requirements:
 * - 2.1: Push updates via SSE within 2 seconds
 * - 2.2: Establish SSE connections for real-time updates
 * - 2.3: Broadcast updates to all connected students in affected class
 * - 2.5: Clean up SSE resources within 30 seconds
 */

import { CacheService, getCacheService } from './cache-service';
import { CACHE_KEYS, CACHE_TTL } from '../config/cache-config';
import { supabase } from '../supabase';

// ============================================================================
// Type Definitions
// ============================================================================

export interface SSEConnection {
  id: string;
  studentId: string;
  classId: string;
  createdAt: Date;
  lastPing: Date;
  response: Response;
  controller: ReadableStreamDefaultController<Uint8Array>;
  send(event: SSEEvent): void;
  close(): void;
}

export interface SSEEvent {
  type: 'attendance_update' | 'metrics_update' | 'notification' | 'ping';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
  timestamp: Date;
  id?: string;
}

export interface AttendanceUpdateEvent extends SSEEvent {
  type: 'attendance_update';
  data: {
    studentId: string;
    date: string;
    period: number;
    status: 'PRESENT' | 'ABSENT' | 'SICK' | 'LEAVE';
    subject: string;
    markedBy: string;
    classId: string;
  };
}

export interface MetricsUpdateEvent extends SSEEvent {
  type: 'metrics_update';
  data: {
    studentId: string;
    attendanceRate: number;
    totalClasses: number;
    presentDays: number;
    ranking: number;
    classAverage: number;
    trend: 'improving' | 'declining' | 'stable';
  };
}

export interface NotificationEvent extends SSEEvent {
  type: 'notification';
  data: {
    id: string;
    title: string;
    message: string;
    severity: 'info' | 'warning' | 'error' | 'success';
    actionUrl?: string;
  };
}

export interface PingEvent extends SSEEvent {
  type: 'ping';
  data: {
    timestamp: number;
    connectionId: string;
  };
}

// Redis connection state structure
interface SSEConnectionState {
  connectionId: string;
  studentId: string;
  classId: string;
  createdAt: number;
  lastPing: number;
}

// ============================================================================
// SSEService Class
// ============================================================================

export class SSEService {
  private cache: CacheService;
  private connections: Map<string, SSEConnection> = new Map();
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(cacheService?: CacheService) {
    this.cache = cacheService || getCacheService();
    this.startHeartbeat();
    this.startCleanup();
  }

  /**
   * Create new SSE connection for a student
   * Implements Requirements 2.2: Establish SSE connections
   * 
   * @param studentId - ID of the student connecting
   * @param request - Incoming request object for authentication
   * @returns Response object with SSE stream
   */
  async createConnection(studentId: string, _request: Request): Promise<Response> {
    try {
      // Get student's class for connection tracking
      const { data: student, error } = await supabase
        .from('students')
        .select('class_section')
        .eq('id', studentId)
        .single();

      if (error || !student) {
        throw new Error(`Student not found: ${studentId}`);
      }

      const classId = student.class_section;
      const connectionId = this.generateConnectionId();

      // Create readable stream for SSE
      const stream = new ReadableStream({
        start: (controller) => {
          const connection: SSEConnection = {
            id: connectionId,
            studentId,
            classId,
            createdAt: new Date(),
            lastPing: new Date(),
            response: new Response(), // Will be replaced
            controller,
            send: (event: SSEEvent) => this.sendEvent(controller, event),
            close: () => this.closeConnection(connectionId),
          };

          // Store connection in memory
          this.connections.set(connectionId, connection);

          // Track connection in Redis
          this.trackConnectionInRedis(connectionId, studentId, classId);

          // Send initial connection event
          connection.send({
            type: 'ping',
            data: {
              timestamp: Date.now(),
              connectionId,
            },
            timestamp: new Date(),
            id: `ping-${Date.now()}`,
          });

          console.log(`SSE connection established: ${connectionId} for student ${studentId}`);
        },
        cancel: () => {
          this.closeConnection(connectionId);
        },
      });

      // Create SSE response
      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Cache-Control',
        },
      });
    } catch (error) {
      console.error('Failed to create SSE connection:', error);
      throw error;
    }
  }

  /**
   * Send update to specific student
   * Implements Requirements 2.1: Push updates within 2 seconds
   * 
   * @param studentId - ID of the target student
   * @param event - SSE event to send
   */
  async sendToStudent(studentId: string, event: SSEEvent): Promise<void> {
    try {
      // Find all connections for this student
      const studentConnections = Array.from(this.connections.values())
        .filter(conn => conn.studentId === studentId);

      if (studentConnections.length === 0) {
        console.log(`No active connections for student ${studentId}`);
        return;
      }

      // Send event to all student connections
      const sendPromises = studentConnections.map(async (connection) => {
        try {
          connection.send(event);
          
          // Update last ping time
          connection.lastPing = new Date();
          
          // Update Redis tracking
          await this.updateConnectionPing(connection.id);
          
          console.log(`Event sent to student ${studentId}, connection ${connection.id}`);
        } catch (error) {
          console.error(`Failed to send event to connection ${connection.id}:`, error);
          // Remove failed connection
          this.closeConnection(connection.id);
        }
      });

      await Promise.all(sendPromises);
    } catch (error) {
      console.error(`Failed to send event to student ${studentId}:`, error);
      throw error;
    }
  }

  /**
   * Broadcast update to all students in a class
   * Implements Requirements 2.3: Broadcast to all connected students in affected class
   * 
   * @param classId - ID of the target class
   * @param event - SSE event to broadcast
   */
  async broadcastToClass(classId: string, event: SSEEvent): Promise<void> {
    try {
      // Find all connections for this class
      const classConnections = Array.from(this.connections.values())
        .filter(conn => conn.classId === classId);

      if (classConnections.length === 0) {
        console.log(`No active connections for class ${classId}`);
        return;
      }

      console.log(`Broadcasting to ${classConnections.length} connections in class ${classId}`);

      // Send event to all class connections
      const sendPromises = classConnections.map(async (connection) => {
        try {
          connection.send(event);
          
          // Update last ping time
          connection.lastPing = new Date();
          
          // Update Redis tracking
          await this.updateConnectionPing(connection.id);
          
          console.log(`Event broadcast to student ${connection.studentId}, connection ${connection.id}`);
        } catch (error) {
          console.error(`Failed to broadcast to connection ${connection.id}:`, error);
          // Remove failed connection
          this.closeConnection(connection.id);
        }
      });

      await Promise.all(sendPromises);
    } catch (error) {
      console.error(`Failed to broadcast to class ${classId}:`, error);
      throw error;
    }
  }

  /**
   * Close connection and cleanup resources
   * Implements Requirements 2.5: Clean up resources within 30 seconds
   * 
   * @param connectionId - ID of the connection to close
   */
  async closeConnection(connectionId: string): Promise<void> {
    try {
      const connection = this.connections.get(connectionId);
      
      if (connection) {
        // Close the stream controller
        try {
          connection.controller.close();
        } catch {
          // Controller might already be closed
          console.log(`Controller already closed for connection ${connectionId}`);
        }

        // Remove from memory
        this.connections.delete(connectionId);

        console.log(`SSE connection closed: ${connectionId} for student ${connection.studentId}`);
      }

      // Remove from Redis tracking
      await this.removeConnectionFromRedis(connectionId);
    } catch (error) {
      console.error(`Failed to close connection ${connectionId}:`, error);
    }
  }

  /**
   * Get active connection count
   * 
   * @returns Number of active connections
   */
  async getActiveConnections(): Promise<number> {
    return this.connections.size;
  }

  /**
   * Get connections for a specific student
   * 
   * @param studentId - ID of the student
   * @returns Array of connection IDs
   */
  getStudentConnections(studentId: string): string[] {
    return Array.from(this.connections.values())
      .filter(conn => conn.studentId === studentId)
      .map(conn => conn.id);
  }

  /**
   * Get connections for a specific class
   * 
   * @param classId - ID of the class
   * @returns Array of connection IDs
   */
  getClassConnections(classId: string): string[] {
    return Array.from(this.connections.values())
      .filter(conn => conn.classId === classId)
      .map(conn => conn.id);
  }

  /**
   * Cleanup stale connections
   * Implements Requirements 2.5: Clean up stale connections (30-second timeout)
   * 
   * @returns Number of connections cleaned up
   */
  async cleanupStaleConnections(): Promise<number> {
    const now = new Date();
    const staleThreshold = 30 * 1000; // 30 seconds in milliseconds
    let cleanedCount = 0;

    const staleConnections = Array.from(this.connections.values())
      .filter(conn => {
        const timeSinceLastPing = now.getTime() - conn.lastPing.getTime();
        return timeSinceLastPing > staleThreshold;
      });

    for (const connection of staleConnections) {
      await this.closeConnection(connection.id);
      cleanedCount++;
    }

    if (cleanedCount > 0) {
      console.log(`Cleaned up ${cleanedCount} stale SSE connections`);
    }

    return cleanedCount;
  }

  // ============================================================================
  // Private Helper Methods
  // ============================================================================

  /**
   * Generate unique connection ID
   */
  private generateConnectionId(): string {
    return `sse_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Send SSE event through controller
   */
  private sendEvent(controller: ReadableStreamDefaultController<Uint8Array>, event: SSEEvent): void {
    try {
      const eventId = event.id || `${event.type}_${Date.now()}`;
      const eventData = JSON.stringify(event.data);
      
      const sseMessage = [
        `id: ${eventId}`,
        `event: ${event.type}`,
        `data: ${eventData}`,
        `retry: 3000`,
        '', // Empty line to end the event
      ].join('\n') + '\n';

      const encoder = new TextEncoder();
      controller.enqueue(encoder.encode(sseMessage));
    } catch (error) {
      console.error('Failed to send SSE event:', error);
      throw error;
    }
  }

  /**
   * Track connection in Redis for distributed management
   */
  private async trackConnectionInRedis(connectionId: string, studentId: string, classId: string): Promise<void> {
    try {
      const connectionState: SSEConnectionState = {
        connectionId,
        studentId,
        classId,
        createdAt: Date.now(),
        lastPing: Date.now(),
      };

      // Store connection state
      await this.cache.set(
        CACHE_KEYS.SSE_CONNECTION(connectionId),
        connectionState,
        CACHE_TTL.SSE_CONNECTION
      );

      // Add to student connections set
      const studentConnections = await this.cache.get<string[]>(
        CACHE_KEYS.SSE_STUDENT_CONNECTIONS(studentId)
      ) || [];
      
      if (!studentConnections.includes(connectionId)) {
        studentConnections.push(connectionId);
        await this.cache.set(
          CACHE_KEYS.SSE_STUDENT_CONNECTIONS(studentId),
          studentConnections,
          CACHE_TTL.SSE_STUDENT_CONNECTIONS
        );
      }

      // Add to class connections set
      const classConnections = await this.cache.get<string[]>(
        CACHE_KEYS.SSE_CLASS_CONNECTIONS(classId)
      ) || [];
      
      if (!classConnections.includes(connectionId)) {
        classConnections.push(connectionId);
        await this.cache.set(
          CACHE_KEYS.SSE_CLASS_CONNECTIONS(classId),
          classConnections,
          CACHE_TTL.SSE_CLASS_CONNECTIONS
        );
      }
    } catch (error) {
      console.error(`Failed to track connection in Redis: ${connectionId}`, error);
    }
  }

  /**
   * Update connection ping time in Redis
   */
  private async updateConnectionPing(connectionId: string): Promise<void> {
    try {
      const connectionState = await this.cache.get<SSEConnectionState>(
        CACHE_KEYS.SSE_CONNECTION(connectionId)
      );

      if (connectionState) {
        connectionState.lastPing = Date.now();
        await this.cache.set(
          CACHE_KEYS.SSE_CONNECTION(connectionId),
          connectionState,
          CACHE_TTL.SSE_CONNECTION
        );
      }
    } catch (error) {
      console.error(`Failed to update connection ping: ${connectionId}`, error);
    }
  }

  /**
   * Remove connection from Redis tracking
   */
  private async removeConnectionFromRedis(connectionId: string): Promise<void> {
    try {
      // Get connection state first
      const connectionState = await this.cache.get<SSEConnectionState>(
        CACHE_KEYS.SSE_CONNECTION(connectionId)
      );

      if (connectionState) {
        const { studentId, classId } = connectionState;

        // Remove from student connections
        const studentConnections = await this.cache.get<string[]>(
          CACHE_KEYS.SSE_STUDENT_CONNECTIONS(studentId)
        ) || [];
        
        const updatedStudentConnections = studentConnections.filter(id => id !== connectionId);
        await this.cache.set(
          CACHE_KEYS.SSE_STUDENT_CONNECTIONS(studentId),
          updatedStudentConnections,
          CACHE_TTL.SSE_STUDENT_CONNECTIONS
        );

        // Remove from class connections
        const classConnections = await this.cache.get<string[]>(
          CACHE_KEYS.SSE_CLASS_CONNECTIONS(classId)
        ) || [];
        
        const updatedClassConnections = classConnections.filter(id => id !== connectionId);
        await this.cache.set(
          CACHE_KEYS.SSE_CLASS_CONNECTIONS(classId),
          updatedClassConnections,
          CACHE_TTL.SSE_CLASS_CONNECTIONS
        );
      }

      // Remove connection state
      await this.cache.delete(CACHE_KEYS.SSE_CONNECTION(connectionId));
    } catch (error) {
      console.error(`Failed to remove connection from Redis: ${connectionId}`, error);
    }
  }

  /**
   * Start heartbeat mechanism to keep connections alive
   * Implements Requirements 2.5: Periodic ping events
   */
  private startHeartbeat(): void {
    // Send ping every 15 seconds
    this.heartbeatInterval = setInterval(async () => {
      const pingEvent: PingEvent = {
        type: 'ping',
        data: {
          timestamp: Date.now(),
          connectionId: 'heartbeat',
        },
        timestamp: new Date(),
        id: `heartbeat_${Date.now()}`,
      };

      // Send ping to all active connections
      const connections = Array.from(this.connections.values());
      
      for (const connection of connections) {
        try {
          connection.send(pingEvent);
          connection.lastPing = new Date();
          await this.updateConnectionPing(connection.id);
        } catch (error) {
          console.error(`Heartbeat failed for connection ${connection.id}:`, error);
          // Remove failed connection
          this.closeConnection(connection.id);
        }
      }

      if (connections.length > 0) {
        console.log(`Heartbeat sent to ${connections.length} SSE connections`);
      }
    }, 15000); // 15 seconds
  }

  /**
   * Start cleanup mechanism for stale connections
   * Implements Requirements 2.5: Cleanup stale connections
   */
  private startCleanup(): void {
    // Cleanup every 30 seconds
    this.cleanupInterval = setInterval(async () => {
      await this.cleanupStaleConnections();
    }, 30000); // 30 seconds
  }

  /**
   * Stop heartbeat and cleanup intervals (for testing/shutdown)
   */
  public stopIntervals(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }

    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }

  /**
   * Shutdown service and close all connections
   */
  public async shutdown(): Promise<void> {
    console.log('Shutting down SSE service...');

    // Stop intervals
    this.stopIntervals();

    // Close all connections
    const connectionIds = Array.from(this.connections.keys());
    await Promise.all(
      connectionIds.map(id => this.closeConnection(id))
    );

    console.log(`SSE service shutdown complete. Closed ${connectionIds.length} connections.`);
  }
}

// ============================================================================
// Singleton Export
// ============================================================================

let sseServiceInstance: SSEService | null = null;

export function getSSEService(): SSEService {
  if (!sseServiceInstance) {
    sseServiceInstance = new SSEService();
  }
  return sseServiceInstance;
}

export default SSEService;