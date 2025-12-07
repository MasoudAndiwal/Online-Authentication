"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";

// ============================================================================
// Type Definitions
// ============================================================================

export interface Conversation {
  id: string;
  recipientType: "teacher" | "office";
  recipientName: string;
  recipientAvatar?: string;
  lastMessage: string;
  lastMessageAt: Date;
  unreadCount: number;
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: "student" | "teacher" | "office";
  senderAvatar?: string;
  content: string;
  category: "attendance_inquiry" | "documentation" | "general" | "urgent";
  attachments: Attachment[];
  timestamp: Date;
  isRead: boolean;
}

export interface Attachment {
  id: string;
  filename: string;
  fileType: string;
  fileSize: number;
  url: string;
}

export interface SendMessageData {
  conversationId?: string;
  recipientId: string;
  recipientType: "teacher" | "office";
  content: string;
  category: string;
  attachments: File[];
}

// ============================================================================
// Conversation Hooks
// ============================================================================

/**
 * Hook for fetching student conversations
 * 
 * Requirements: 13.1, 13.2, 13.4, 13.5
 * 
 * @param studentId - The ID of the student
 * @returns Query result with conversations list
 */
export function useStudentConversations(studentId?: string) {
  return useQuery<Conversation[], Error>({
    queryKey: ["student-conversations", studentId],
    queryFn: async () => {
      if (!studentId) throw new Error("Student ID is required");

      const response = await fetch(`/api/students/${studentId}/conversations`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to fetch conversations");
      }

      const data = await response.json();
      
      // Transform dates
      return data.conversations.map((conv: any) => ({
        ...conv,
        lastMessageAt: new Date(conv.lastMessageAt),
      })) as Conversation[];
    },
    enabled: !!studentId,
    staleTime: 1000 * 30, // 30 seconds
    refetchInterval: 30000, // Refetch every 30 seconds for real-time feel
    refetchOnWindowFocus: true,
  });
}

/**
 * Alias for useStudentConversations for consistency with naming
 * 
 * Requirements: 13.1, 13.2
 */
export const useStudentMessages = useStudentConversations;

/**
 * Hook for fetching messages in a conversation
 * 
 * Requirements: 13.4, 13.5, 13.7
 * 
 * @param conversationId - The ID of the conversation
 * @returns Query result with messages list
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
      
      // Transform dates
      return data.messages.map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp),
      })) as Message[];
    },
    enabled: !!conversationId,
    staleTime: 1000 * 10, // 10 seconds
    refetchInterval: 10000, // Refetch every 10 seconds for real-time feel
    refetchOnWindowFocus: true,
  });
}

/**
 * Hook for sending messages
 * 
 * Requirements: 13.4, 13.5
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
      data.attachments.forEach((file, index) => {
        formData.append(`attachment_${index}`, file);
      });

      const response = await fetch("/api/messages/send", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to send message");
      }

      return response.json();
    },
    onSuccess: (data, variables) => {
      // Invalidate conversations to update last message
      queryClient.invalidateQueries({ queryKey: ["student-conversations"] });
      
      // Invalidate messages for this conversation
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
 * 
 * Requirements: 13.5
 */
export function useMarkMessagesRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (conversationId: string) => {
      const response = await fetch(`/api/conversations/${conversationId}/mark-read`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to mark messages as read");
      }

      return response.json();
    },
    onSuccess: (_, conversationId) => {
      // Update conversations to clear unread count
      queryClient.invalidateQueries({ queryKey: ["student-conversations"] });
      
      // Update messages to mark as read
      queryClient.invalidateQueries({ 
        queryKey: ["conversation-messages", conversationId] 
      });
    },
  });
}

/**
 * Hook for WebSocket real-time message updates
 * 
 * Requirements: 13.5
 */
export function useMessageWebSocket(studentId?: string) {
  const queryClient = useQueryClient();
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!studentId) return;

    // Create WebSocket connection
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const ws = new WebSocket(`${protocol}//${window.location.host}/api/ws/messages?studentId=${studentId}`);

    ws.onopen = () => {
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === "new_message") {
          // Invalidate queries to fetch new messages
          queryClient.invalidateQueries({ queryKey: ["student-conversations"] });
          queryClient.invalidateQueries({ 
            queryKey: ["conversation-messages", data.conversationId] 
          });
        } else if (data.type === "message_read") {
          // Update read status
          queryClient.invalidateQueries({ 
            queryKey: ["conversation-messages", data.conversationId] 
          });
        }
      } catch (error) {
        console.error("Failed to parse WebSocket message:", error);
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      setIsConnected(false);
    };

    ws.onclose = () => {
      setIsConnected(false);
    };

    // Cleanup on unmount
    return () => {
      ws.close();
    };
  }, [studentId, queryClient]);

  return { isConnected };
}

/**
 * Hook for uploading file attachments
 * 
 * Requirements: 13.3
 */
export function useUploadAttachment() {
  return useMutation({
    mutationFn: async (file: File) => {
      // Validate file type
      const allowedTypes = ["application/pdf", "image/jpeg", "image/jpg", "image/png"];
      if (!allowedTypes.includes(file.type)) {
        throw new Error("File type not allowed. Only PDF, JPG, and PNG files are accepted.");
      }

      // Validate file size (10MB max)
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        throw new Error("File size exceeds 10MB limit.");
      }

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/attachments/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to upload file");
      }

      return response.json();
    },
  });
}
