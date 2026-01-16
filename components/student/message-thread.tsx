"use client";

import React, { useRef, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Download, FileText, Image as ImageIcon, Check, CheckCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface Message {
  id: string;
  conversationId?: string;
  senderId: string;
  senderName: string;
  senderRole: "student" | "teacher" | "office" | "system";
  senderAvatar?: string;
  content: string;
  messageType?: "user" | "system";
  category: "attendance_inquiry" | "documentation" | "general" | "urgent" | "system_alert" | "system_info";
  attachments: Attachment[];
  timestamp: Date;
  isRead: boolean;
  metadata?: Record<string, unknown>;
}

interface Attachment {
  id: string;
  filename: string;
  originalFilename?: string;
  fileType: string;
  fileSize: number;
  url: string;
  thumbnailUrl?: string;
}

interface MessageThreadProps {
  messages: Message[];
  currentUserId: string;
  recipientName: string;
  recipientAvatar?: string;
  onDownloadAttachment: (attachment: Attachment) => void;
}

/**
 * MessageThread Component
 * 
 * Chat-style interface with message bubbles:
 * - Student messages: Right-aligned with green background
 * - Teacher/Office messages: Left-aligned with gray background
 * - Timestamps and read receipts
 * - Attachment previews with download buttons
 * 
 * Requirements: 13.4, 13.5, 13.7
 */
export function MessageThread({
  messages,
  currentUserId,
  recipientName,
  recipientAvatar,
  onDownloadAttachment,
}: MessageThreadProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatTimestamp = (date: Date) => {
    const messageDate = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (messageDate.toDateString() === today.toDateString()) {
      return format(messageDate, "h:mm a");
    } else if (messageDate.toDateString() === yesterday.toDateString()) {
      return `Yesterday ${format(messageDate, "h:mm a")}`;
    } else {
      return format(messageDate, "MMM d, h:mm a");
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith("image/")) {
      return <ImageIcon className="h-5 w-5" />;
    }
    return <FileText className="h-5 w-5" />;
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      attendance_inquiry: "Attendance Inquiry",
      documentation: "Documentation",
      general: "General",
      urgent: "Urgent",
      system_alert: "System Alert",
      system_info: "System Info",
    };
    return labels[category] || category;
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      attendance_inquiry: "bg-blue-100 text-blue-700",
      documentation: "bg-purple-100 text-purple-700",
      general: "bg-slate-100 text-slate-700",
      urgent: "bg-red-100 text-red-700",
      system_alert: "bg-orange-100 text-orange-700",
      system_info: "bg-cyan-100 text-cyan-700",
    };
    return colors[category] || "bg-slate-100 text-slate-700";
  };

  if (messages.length === 0) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <div className="text-center">
          <p className="text-slate-400 text-sm">No messages yet</p>
          <p className="text-slate-400 text-xs mt-1">Start the conversation below</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Thread Header */}
      <div className="p-4 border-b border-slate-200 bg-white/50">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={recipientAvatar} />
            <AvatarFallback className="bg-emerald-100 text-emerald-700 text-sm font-semibold">
              {getInitials(recipientName)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold text-slate-800">{recipientName}</h3>
            <p className="text-xs text-slate-500">Active now</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => {
          const isCurrentUser = message.senderId === currentUserId;
          const showAvatar = !isCurrentUser;
          const prevMessage = index > 0 ? messages[index - 1] : null;
          const showTimestamp = !prevMessage || 
            new Date(message.timestamp).getTime() - new Date(prevMessage.timestamp).getTime() > 5 * 60 * 1000;

          return (
            <div key={message.id}>
              {/* Timestamp Divider */}
              {showTimestamp && (
                <div className="flex items-center justify-center my-4">
                  <span className="text-xs text-slate-400 bg-slate-50 px-3 py-1 rounded-full">
                    {formatTimestamp(message.timestamp)}
                  </span>
                </div>
              )}

              {/* Message Bubble */}
              <div className={cn(
                "flex gap-2",
                isCurrentUser ? "justify-end" : "justify-start"
              )}>
                {/* Avatar (for received messages) */}
                {showAvatar && (
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarImage src={message.senderAvatar} />
                    <AvatarFallback className="bg-slate-200 text-slate-600 text-xs">
                      {getInitials(message.senderName)}
                    </AvatarFallback>
                  </Avatar>
                )}

                {/* Message Content */}
                <div className={cn(
                  "max-w-[70%] sm:max-w-md",
                  isCurrentUser && "order-first"
                )}>
                  {/* Category Badge */}
                  {message.category !== "general" && (
                    <div className={cn(
                      "text-xs px-2 py-0.5 rounded-full inline-block mb-1",
                      getCategoryColor(message.category)
                    )}>
                      {getCategoryLabel(message.category)}
                    </div>
                  )}

                  {/* Message Bubble */}
                  <div className={cn(
                    "rounded-2xl px-4 py-2.5 shadow-sm",
                    isCurrentUser
                      ? "bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-br-sm"
                      : "bg-slate-100 text-slate-800 rounded-bl-sm"
                  )}>
                    <p className="text-sm whitespace-pre-wrap break-words">
                      {message.content}
                    </p>

                    {/* Attachments */}
                    {message.attachments.length > 0 && (
                      <div className="mt-2 space-y-2">
                        {message.attachments.map((attachment) => (
                          <div
                            key={attachment.id}
                            className={cn(
                              "flex items-center gap-2 p-2 rounded-lg",
                              isCurrentUser
                                ? "bg-emerald-600/50"
                                : "bg-white"
                            )}
                          >
                            <div className={cn(
                              "flex-shrink-0",
                              isCurrentUser ? "text-white" : "text-slate-600"
                            )}>
                              {getFileIcon(attachment.fileType)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={cn(
                                "text-xs font-medium truncate",
                                isCurrentUser ? "text-white" : "text-slate-700"
                              )}>
                                {attachment.filename}
                              </p>
                              <p className={cn(
                                "text-xs",
                                isCurrentUser ? "text-emerald-100" : "text-slate-500"
                              )}>
                                {formatFileSize(attachment.fileSize)}
                              </p>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => onDownloadAttachment(attachment)}
                              className={cn(
                                "h-8 w-8 p-0 flex-shrink-0",
                                isCurrentUser
                                  ? "text-white hover:bg-emerald-700"
                                  : "text-slate-600 hover:bg-slate-100"
                              )}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Read Receipt (for sent messages) */}
                  {isCurrentUser && (
                    <div className="flex items-center justify-end gap-1 mt-1 px-1">
                      {message.isRead ? (
                        <CheckCheck className="h-3 w-3 text-emerald-600" />
                      ) : (
                        <Check className="h-3 w-3 text-slate-400" />
                      )}
                      <span className="text-xs text-slate-400">
                        {message.isRead ? "Read" : "Sent"}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}
