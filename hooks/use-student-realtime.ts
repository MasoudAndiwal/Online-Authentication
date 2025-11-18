"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useStudentDashboardStore } from "@/lib/stores/student-dashboard-store";

// ============================================================================
// Type Definitions
// ============================================================================

export type RealtimeEventType =
  | "attendance_marked"
  | "message_received"
  | "status_changed"
  | "schedule_updated"
  | "notification";

export interface RealtimeEvent {
  type: RealtimeEventType;
  payload: any;
  timestamp: string;
}

export interface AttendanceMarkedEvent {
  studentId: string;
  date: string;
  sessionNumber: number;
  status: "present" | "absent" | "sick" | "leave";
  markedBy: string;
  markedAt: string;
}

export interface MessageReceivedEvent {
  conversationId: string;
  messageId: string;
  senderId: string;
  senderName: string;
  senderRole: "teacher" | "office";
  content: string;
  timestamp: string;
}

export interface StatusChangedEvent {
  studentId: string;
  oldStatus: string;
  newStatus: string;
  reason: string;
  timestamp: string;
}

export interface ScheduleUpdatedEvent {
  classId: string;
  changeType: "added" | "modified" | "cancelled";
  date: string;
  details: string;
}

// ============================================================================
// WebSocket Connection Hook
// ============================================================================

/**
 * Hook for managing WebSocket connection for real-time updates
 * 
 * Requirements: 11.1, 13.5
 * 
 * @param studentId - The ID of the student
 * @param options - Configuration options
 * @returns Connection state and utilities
 */
export function useStudentRealtime(
  studentId: string | undefined,
  options: {
    enabled?: boolean;
    onAttendanceMarked?: (event: AttendanceMarkedEvent) => void;
    onMessageReceived?: (event: MessageReceivedEvent) => void;
    onStatusChanged?: (event: StatusChangedEvent) => void;
    onScheduleUpdated?: (event: ScheduleUpdatedEvent) => void;
  } = {}
) {
  const { enabled = true } = options;
  const queryClient = useQueryClient();
  const addNotification = useStudentDashboardStore((state) => state.addNotification);
  
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [lastEvent, setLastEvent] = useState<RealtimeEvent | null>(null);
  
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;

  /**
   * Handle incoming WebSocket messages
   */
  const handleMessage = useCallback(
    (event: MessageEvent) => {
      try {
        const data: RealtimeEvent = JSON.parse(event.data);
        setLastEvent(data);

        console.log("[Student Realtime] Received event:", data.type);

        switch (data.type) {
          case "attendance_marked": {
            const payload = data.payload as AttendanceMarkedEvent;
            
            // Invalidate attendance queries to refetch data
            queryClient.invalidateQueries({
              queryKey: ["student-dashboard-metrics", studentId],
            });
            queryClient.invalidateQueries({
              queryKey: ["student-attendance", studentId],
            });
            queryClient.invalidateQueries({
              queryKey: ["attendance-history", studentId],
            });
            queryClient.invalidateQueries({
              queryKey: ["academic-status", studentId],
            });

            // Add notification
            addNotification({
              type: "attendance_marked",
              title: "Attendance Marked",
              message: `Your attendance has been marked as ${payload.status} for session ${payload.sessionNumber}`,
              isRead: false,
            });

            // Call custom handler if provided
            options.onAttendanceMarked?.(payload);
            break;
          }

          case "message_received": {
            const payload = data.payload as MessageReceivedEvent;
            
            // Invalidate message queries
            queryClient.invalidateQueries({
              queryKey: ["student-conversations", studentId],
            });
            queryClient.invalidateQueries({
              queryKey: ["conversation-messages", payload.conversationId],
            });

            // Add notification
            addNotification({
              type: "message_received",
              title: "New Message",
              message: `${payload.senderName} sent you a message`,
              isRead: false,
              actionUrl: `/student/student-dashboard/messages?conversation=${payload.conversationId}`,
            });

            // Call custom handler if provided
            options.onMessageReceived?.(payload);
            break;
          }

          case "status_changed": {
            const payload = data.payload as StatusChangedEvent;
            
            // Invalidate all student data
            queryClient.invalidateQueries({
              queryKey: ["student-dashboard-metrics", studentId],
            });
            queryClient.invalidateQueries({
              queryKey: ["academic-status", studentId],
            });

            // Add notification with appropriate severity
            const isCritical = payload.newStatus === "mahroom" || payload.newStatus === "tasdiq";
            addNotification({
              type: "status_change",
              title: isCritical ? "⚠️ Academic Status Alert" : "Status Update",
              message: payload.reason,
              isRead: false,
            });

            // Call custom handler if provided
            options.onStatusChanged?.(payload);
            break;
          }

          case "schedule_updated": {
            const payload = data.payload as ScheduleUpdatedEvent;
            
            // Invalidate class info
            queryClient.invalidateQueries({
              queryKey: ["student-class", studentId],
            });

            // Add notification
            addNotification({
              type: "schedule_change",
              title: "Schedule Update",
              message: payload.details,
              isRead: false,
            });

            // Call custom handler if provided
            options.onScheduleUpdated?.(payload);
            break;
          }

          case "notification": {
            // Generic notification
            const { title, message, actionUrl } = data.payload;
            addNotification({
              type: "attendance_marked", // Default type
              title,
              message,
              isRead: false,
              actionUrl,
            });
            break;
          }

          default:
            console.warn("[Student Realtime] Unknown event type:", data.type);
        }
      } catch (error) {
        console.error("[Student Realtime] Failed to parse message:", error);
      }
    },
    [studentId, queryClient, addNotification, options]
  );

  /**
   * Connect to WebSocket server
   */
  const connect = useCallback(() => {
    if (!studentId || !enabled) return;

    // Don't reconnect if already connected
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      console.log("[Student Realtime] Already connected");
      return;
    }

    try {
      console.log("[Student Realtime] Connecting...");
      
      // Determine protocol based on current page protocol
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/api/ws/student?studentId=${studentId}`;
      
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("[Student Realtime] Connected");
        setIsConnected(true);
        setConnectionError(null);
        reconnectAttemptsRef.current = 0;
      };

      ws.onmessage = handleMessage;

      ws.onerror = (error) => {
        console.error("[Student Realtime] WebSocket error:", error);
        setConnectionError("Connection error occurred");
      };

      ws.onclose = (event) => {
        console.log("[Student Realtime] Disconnected:", event.code, event.reason);
        setIsConnected(false);
        wsRef.current = null;

        // Attempt to reconnect with exponential backoff
        if (enabled && reconnectAttemptsRef.current < maxReconnectAttempts) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
          console.log(
            `[Student Realtime] Reconnecting in ${delay}ms (attempt ${reconnectAttemptsRef.current + 1}/${maxReconnectAttempts})`
          );
          
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttemptsRef.current++;
            connect();
          }, delay);
        } else if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
          setConnectionError("Failed to connect after multiple attempts");
        }
      };
    } catch (error) {
      console.error("[Student Realtime] Failed to create WebSocket:", error);
      setConnectionError("Failed to establish connection");
    }
  }, [studentId, enabled, handleMessage]);

  /**
   * Disconnect from WebSocket server
   */
  const disconnect = useCallback(() => {
    console.log("[Student Realtime] Disconnecting...");
    
    // Clear reconnect timeout
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    // Close WebSocket connection
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    setIsConnected(false);
  }, []);

  /**
   * Manually trigger reconnection
   */
  const reconnect = useCallback(() => {
    disconnect();
    reconnectAttemptsRef.current = 0;
    connect();
  }, [connect, disconnect]);

  /**
   * Send a message through WebSocket (for future use)
   */
  const send = useCallback((data: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
    } else {
      console.warn("[Student Realtime] Cannot send message: not connected");
    }
  }, []);

  // Connect on mount and when studentId changes
  useEffect(() => {
    if (enabled && studentId) {
      connect();
    }

    // Cleanup on unmount
    return () => {
      disconnect();
    };
  }, [studentId, enabled, connect, disconnect]);

  // Handle visibility change (reconnect when tab becomes visible)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && enabled && studentId) {
        // Reconnect if disconnected
        if (!isConnected && wsRef.current?.readyState !== WebSocket.OPEN) {
          console.log("[Student Realtime] Tab visible, reconnecting...");
          reconnect();
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [enabled, studentId, isConnected, reconnect]);

  return {
    isConnected,
    connectionError,
    lastEvent,
    reconnect,
    disconnect,
    send,
  };
}

// ============================================================================
// Optimistic Updates Hook
// ============================================================================

/**
 * Hook for optimistic UI updates
 * Updates UI immediately while waiting for server confirmation
 * 
 * Requirements: 11.1, 13.5
 * 
 * @returns Utilities for optimistic updates
 */
export function useOptimisticUpdates() {
  const queryClient = useQueryClient();

  /**
   * Optimistically update attendance data
   */
  const updateAttendanceOptimistically = useCallback(
    (studentId: string, update: Partial<AttendanceMarkedEvent>) => {
      // Update dashboard metrics optimistically
      queryClient.setQueryData(
        ["student-dashboard-metrics", studentId],
        (old: any) => {
          if (!old) return old;
          
          // Adjust counts based on status
          const adjustments: any = {};
          if (update.status === "present") {
            adjustments.presentDays = (old.presentDays || 0) + 1;
          } else if (update.status === "absent") {
            adjustments.absentDays = (old.absentDays || 0) + 1;
          } else if (update.status === "sick") {
            adjustments.sickDays = (old.sickDays || 0) + 1;
          } else if (update.status === "leave") {
            adjustments.leaveDays = (old.leaveDays || 0) + 1;
          }

          return { ...old, ...adjustments };
        }
      );

      // Invalidate to refetch actual data
      setTimeout(() => {
        queryClient.invalidateQueries({
          queryKey: ["student-dashboard-metrics", studentId],
        });
      }, 100);
    },
    [queryClient]
  );

  /**
   * Optimistically mark message as read
   */
  const markMessageReadOptimistically = useCallback(
    (conversationId: string, messageId: string) => {
      // Update messages optimistically
      queryClient.setQueryData(
        ["conversation-messages", conversationId],
        (old: any[]) => {
          if (!old) return old;
          return old.map((msg) =>
            msg.id === messageId ? { ...msg, isRead: true } : msg
          );
        }
      );

      // Update conversation unread count
      queryClient.setQueryData(["student-conversations"], (old: any[]) => {
        if (!old) return old;
        return old.map((conv) =>
          conv.id === conversationId
            ? { ...conv, unreadCount: Math.max(0, conv.unreadCount - 1) }
            : conv
        );
      });
    },
    [queryClient]
  );

  return {
    updateAttendanceOptimistically,
    markMessageReadOptimistically,
  };
}

// ============================================================================
// Connection Status Hook
// ============================================================================

/**
 * Hook to monitor overall connection status
 * Useful for displaying connection indicators in UI
 * 
 * Requirements: 11.1
 * 
 * @param studentId - The ID of the student
 * @returns Connection status information
 */
export function useConnectionStatus(studentId: string | undefined) {
  const { isConnected, connectionError } = useStudentRealtime(studentId, {
    enabled: !!studentId,
  });

  const [isOnline, setIsOnline] = useState(
    typeof window !== "undefined" ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return {
    isOnline,
    isConnected,
    hasError: !!connectionError,
    errorMessage: connectionError,
    status: !isOnline
      ? "offline"
      : isConnected
      ? "connected"
      : connectionError
      ? "error"
      : "connecting",
  };
}
