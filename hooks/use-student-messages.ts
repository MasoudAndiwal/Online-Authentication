"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";

// ============================================================================
// Type Definitions
// ============================================================================

export interface Conversation {
  id: string;
  recipientType: "teacher" | "office";
  recipientId: string;
  recipientName: string;
  recipientAvatar?: string;
  lastMessage: string;
  lastMessageAt: Date;
  unreadCount: number;
  isMuted: boolean;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderRole: "student" | "teacher" | "office" | "system";
  senderAvatar?: string;
  content: string;
  messageType: "user" | "system";
  category: "attendance_inquiry" | "documentation" | "general" | "urgent" | "system_alert" | "system_info";
  attachments: Attachment[];
  timestamp: Date;
  isRead: boolean;
  metadata?: Record<string, unknown>;
}

export interface Attachment {
  id: string;
  filename: string;
  originalFilename: string;
  fileType: string;
  fileSize: number;
  url: string;
  thumbnailUrl?: string;
}

export interface SendMessageData {
  conversationId?: string;
  recipientId: string;
  recipientType: "teacher" | "office";
  content: string;
  category: string;
  attachments: File[];
}

export interface SystemMessage {
  id: string;
  title: string;
  content: string;
  category: "attendance_alert" | "schedule_change" | "announcement" | "reminder" | "warning" | "info";
  severity: "info" | "warning" | "error" | "success";
  createdAt: Date;
  isRead: boolean;
  actionUrl?: string;
  actionLabel?: string;
}

export interface Recipient {
  id: string;
  type: "teacher" | "office";
  name: string;
  avatar?: string;
}

// ============================================================================
// Conversation Hooks
// ============================================================================

/**
 * Hook for fetching user conversations
 * Works for students, teachers, and office users
 */
export function useConversations() {
  return useQuery<Conversation[], Error>({
    queryKey: ["conversations"],
    queryFn: async () => {
      const response = await fetch("/api/conversations");
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to fetch conversations");
      }

      const data = await response.json();
      
      // Transform API response to match our interface
      return data.conversations.map((conv: Record<string, unknown>) => ({
        id: conv.id,
        recipientType: conv.otherParticipant ? (conv.otherParticipant as Record<string, unknown>).type : "teacher",
        recipientId: conv.otherParticipant ? (conv.otherParticipant as Record<string, unknown>).id : "",
        recipientName: conv.otherParticipant ? (conv.otherParticipant as Record<string, unknown>).name : "Unknown",
        recipientAvatar: conv.otherParticipant ? (conv.otherParticipant as Record<string, unknown>).avatar : undefined,
        lastMessage: conv.lastMessagePreview || "",
        lastMessageAt: conv.lastMessageAt ? new Date(conv.lastMessageAt as string) : new Date(),
        unreadCount: conv.unreadCount || 0,
        isMuted: conv.isMuted || false,
      })) as Conversation[];
    },
    staleTime: 1000 * 30,
    refetchInterval: 30000,
    refetchOnWindowFocus: true,
  });
}

// Alias for backward compatibility
export const useStudentConversations = (studentId?: string) => {
  const query = useConversations();
  return {
    ...query,
    // Only return data if studentId is provided (for backward compatibility)
    data: studentId ? query.data : undefined,
  };
};

export const useStudentMessages = useStudentConversations;

/**
 * Hook for fetching messages in a conversation
 */
export function useConversationMessages(conversationId?: string) {
  return useQuery<Message[], Error>({
    queryKey: ["conversation-messages", conversationId],
    queryFn: async () => {
      if (!conversationId) throw new Error("Conversation ID is required");

      const response = await fetch(`/api/conversations/${conversationId}/messages`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to fetch messages");
      }

      const data = await response.json();
      
      // Transform API response
      return data.messages.map((msg: Record<string, unknown>) => ({
        id: msg.id,
        conversationId: msg.conversationId,
        senderId: msg.senderId,
        senderName: msg.senderName,
        senderRole: msg.senderType,
        content: msg.content,
        messageType: msg.messageType,
        category: msg.category,
        attachments: (msg.attachments as Array<Record<string, unknown>> || []).map(att => ({
          id: att.id,
          filename: att.filename,
          originalFilename: att.originalFilename,
          fileType: att.fileType,
          fileSize: att.fileSize,
          url: att.fileUrl,
          thumbnailUrl: att.thumbnailUrl,
        })),
        timestamp: new Date(msg.createdAt as string),
        isRead: msg.isRead,
        metadata: msg.metadata,
      })) as Message[];
    },
    enabled: !!conversationId,
    staleTime: 1000 * 10,
    refetchInterval: 10000,
    refetchOnWindowFocus: true,
  });
}

/**
 * Hook for fetching available recipients
 */
export function useAvailableRecipients() {
  return useQuery<Recipient[], Error>({
    queryKey: ["available-recipients"],
    queryFn: async () => {
      const response = await fetch("/api/messages/recipients");
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to fetch recipients");
      }

      const data = await response.json();
      return data.recipients as Recipient[];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook for sending messages
 */
export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: SendMessageData) => {
      const formData = new FormData();
      formData.append("recipientId", data.recipientId);
      formData.append("recipientType", data.recipientType);
      formData.append("content", data.content);
      formData.append("category", data.category);
      
      if (data.conversationId) {
        formData.append("conversationId", data.conversationId);
      }

      // Add attachments
      data.attachments.forEach((file) => {
        formData.append("attachments", file);
      });

      const response = await fetch("/api/messages", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to send message");
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      queryClient.invalidateQueries({ queryKey: ["student-conversations"] });
      
      if (variables.conversationId) {
        queryClient.invalidateQueries({ 
          queryKey: ["conversation-messages", variables.conversationId] 
        });
      }
    },
  });
}

/**
 * Hook for marking messages as read
 */
export function useMarkMessagesRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (conversationId: string) => {
      const response = await fetch(`/api/conversations/${conversationId}/read`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to mark messages as read");
      }

      return response.json();
    },
    onSuccess: (_, conversationId) => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      queryClient.invalidateQueries({ queryKey: ["student-conversations"] });
      queryClient.invalidateQueries({ 
        queryKey: ["conversation-messages", conversationId] 
      });
    },
  });
}

/**
 * Hook for fetching system messages
 */
export function useSystemMessages(includeRead = false) {
  return useQuery<SystemMessage[], Error>({
    queryKey: ["system-messages", includeRead],
    queryFn: async () => {
      const response = await fetch(`/api/messages/system?includeRead=${includeRead}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to fetch system messages");
      }

      const data = await response.json();
      
      return data.messages.map((msg: Record<string, unknown>) => ({
        id: msg.id,
        title: msg.title,
        content: msg.content,
        category: msg.category,
        severity: msg.severity,
        createdAt: new Date(msg.createdAt as string),
        isRead: msg.isRead,
        actionUrl: msg.actionUrl,
        actionLabel: msg.actionLabel,
      })) as SystemMessage[];
    },
    staleTime: 1000 * 30,
    refetchInterval: 60000, // Check every minute
  });
}

/**
 * Hook for marking system message as read
 */
export function useMarkSystemMessageRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (messageId: string) => {
      const response = await fetch(`/api/messages/system/${messageId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "read" }),
      });

      if (!response.ok) {
        throw new Error("Failed to mark system message as read");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["system-messages"] });
    },
  });
}

/**
 * Hook for dismissing system message
 */
export function useDismissSystemMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (messageId: string) => {
      const response = await fetch(`/api/messages/system/${messageId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "dismiss" }),
      });

      if (!response.ok) {
        throw new Error("Failed to dismiss system message");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["system-messages"] });
    },
  });
}

/**
 * Hook for WebSocket real-time message updates
 */
export function useMessageWebSocket(userId?: string) {
  const queryClient = useQueryClient();
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!userId) return;

    // Create WebSocket connection
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const ws = new WebSocket(`${protocol}//${window.location.host}/api/ws/messages?userId=${userId}`);

    ws.onopen = () => {
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === "new_message") {
          queryClient.invalidateQueries({ queryKey: ["conversations"] });
          queryClient.invalidateQueries({ queryKey: ["student-conversations"] });
          queryClient.invalidateQueries({ 
            queryKey: ["conversation-messages", data.conversationId] 
          });
        } else if (data.type === "message_read") {
          queryClient.invalidateQueries({ 
            queryKey: ["conversation-messages", data.conversationId] 
          });
        } else if (data.type === "system_message") {
          queryClient.invalidateQueries({ queryKey: ["system-messages"] });
        }
      } catch (error) {
        console.error("Failed to parse WebSocket message:", error);
      }
    };

    ws.onerror = () => {
      setIsConnected(false);
    };

    ws.onclose = () => {
      setIsConnected(false);
    };

    return () => {
      ws.close();
    };
  }, [userId, queryClient]);

  return { isConnected };
}

/**
 * Hook for uploading file attachments with validation
 * Students have restricted file types
 */
export function useUploadAttachment() {
  return useMutation({
    mutationFn: async ({ file, userType }: { file: File; userType: "student" | "teacher" | "office" }) => {
      // Student file type restrictions
      const studentAllowedTypes = [
        "text/plain",
        "image/jpeg",
        "image/jpg",
        "image/png",
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-powerpoint",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      ];

      if (userType === "student" && !studentAllowedTypes.includes(file.type)) {
        throw new Error("شاگردان فقط می‌توانند فایل‌های متنی، تصویر، PDF، Word، Excel و PowerPoint ارسال کنند");
      }

      // Size limits
      const maxSize = userType === "student" ? 20 * 1024 * 1024 : 100 * 1024 * 1024;
      if (file.size > maxSize) {
        throw new Error(`حجم فایل نباید بیشتر از ${maxSize / 1024 / 1024}MB باشد`);
      }

      return { file, valid: true };
    },
  });
}
