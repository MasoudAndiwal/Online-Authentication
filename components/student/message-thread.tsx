"use client";

import React, { useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Download, FileText, Image as ImageIcon, FileSpreadsheet, Presentation } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Check3D, DoubleCheck3D, Teacher3D, SystemAlert3D } from "@/components/ui/message-3d-icons";

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

const messageVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { type: "spring" as const, stiffness: 300, damping: 25 }
  }
};

/**
 * MessageThread Component
 * 
 * Beautiful chat interface with animations and visual distinction for message types
 */
export function MessageThread({
  messages,
  currentUserId,
  recipientName,
  recipientAvatar,
  onDownloadAttachment,
}: MessageThreadProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
    if (fileType.startsWith("image/")) return <ImageIcon className="h-5 w-5" />;
    if (fileType.includes("pdf")) return <FileText className="h-5 w-5" />;
    if (fileType.includes("excel") || fileType.includes("spreadsheet")) return <FileSpreadsheet className="h-5 w-5" />;
    if (fileType.includes("powerpoint") || fileType.includes("presentation")) return <Presentation className="h-5 w-5" />;
    return <FileText className="h-5 w-5" />;
  };

  const getCategoryConfig = (category: string) => {
    const configs: Record<string, { label: string; color: string; bgColor: string }> = {
      attendance_inquiry: { label: "Attendance", color: "text-blue-700", bgColor: "bg-blue-100" },
      documentation: { label: "Documentation", color: "text-purple-700", bgColor: "bg-purple-100" },
      general: { label: "General", color: "text-slate-700", bgColor: "bg-slate-100" },
      urgent: { label: "Urgent", color: "text-red-700", bgColor: "bg-red-100" },
      system_alert: { label: "System Alert", color: "text-orange-700", bgColor: "bg-orange-100" },
      system_info: { label: "System Info", color: "text-cyan-700", bgColor: "bg-cyan-100" },
    };
    return configs[category] || configs.general;
  };

  if (messages.length === 0) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="mb-4"
          >
            <Teacher3D size="xl" className="mx-auto opacity-30" />
          </motion.div>
          <p className="text-slate-400 text-sm">No messages yet</p>
          <p className="text-slate-300 text-xs mt-1">Start the conversation below</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Thread Header */}
      <div className="p-4 bg-gradient-to-r from-emerald-50/80 to-white/50">
        <div className="flex items-center gap-3">
          <Avatar className="h-11 w-11 ring-2 ring-emerald-200 ring-offset-2">
            <AvatarImage src={recipientAvatar} />
            <AvatarFallback className="bg-gradient-to-br from-emerald-100 to-emerald-200 text-emerald-700 text-sm font-bold">
              {getInitials(recipientName)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold text-slate-800">{recipientName}</h3>
            <div className="flex items-center gap-1.5">
              <motion.div 
                className="h-2 w-2 rounded-full bg-emerald-500"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <p className="text-xs text-emerald-600 font-medium">Active now</p>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 pt-6 pb-6 space-y-4 scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none]">
        <AnimatePresence>
          {messages.map((message, index) => {
            const isCurrentUser = message.senderId === currentUserId;
            const isSystemMessage = message.senderRole === "system" || message.messageType === "system";
            const showAvatar = !isCurrentUser && !isSystemMessage;
            const prevMessage = index > 0 ? messages[index - 1] : null;
            const showTimestamp = !prevMessage || 
              new Date(message.timestamp).getTime() - new Date(prevMessage.timestamp).getTime() > 5 * 60 * 1000;
            const categoryConfig = getCategoryConfig(message.category);

            return (
              <motion.div 
                key={message.id}
                variants={messageVariants}
                initial="hidden"
                animate="visible"
                layout
              >
                {/* Timestamp Divider */}
                {showTimestamp && (
                  <motion.div 
                    className="flex items-center justify-center my-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <span className="text-xs text-slate-400 bg-gradient-to-r from-slate-100 to-slate-50 px-4 py-1.5 rounded-full shadow-sm">
                      {formatTimestamp(message.timestamp)}
                    </span>
                  </motion.div>
                )}

                {/* System Message - Special styling */}
                {isSystemMessage ? (
                  <motion.div
                    className="flex justify-center my-3"
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex items-start gap-3 max-w-md p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 shadow-md">
                      <SystemAlert3D size="md" animated={false} />
                      <div>
                        <p className="text-sm font-medium text-amber-800">{message.content}</p>
                        <span className="text-xs text-amber-600 mt-1 block">System Message</span>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  /* User Message */
                  <div className={cn(
                    "flex gap-2",
                    isCurrentUser ? "justify-end" : "justify-start"
                  )}>
                    {/* Avatar */}
                    {showAvatar && (
                      <Avatar className="h-8 w-8 shrink-0 ring-2 ring-slate-100">
                        <AvatarImage src={message.senderAvatar} />
                        <AvatarFallback className="bg-gradient-to-br from-slate-100 to-slate-200 text-slate-600 text-xs font-bold">
                          {getInitials(message.senderName)}
                        </AvatarFallback>
                      </Avatar>
                    )}

                    {/* Message Content */}
                    <div className={cn(
                      "max-w-[75%] sm:max-w-md",
                      isCurrentUser && "order-first"
                    )}>
                      {/* Category Badge */}
                      {message.category !== "general" && (
                        <motion.div 
                          className={cn(
                            "text-xs px-2.5 py-1 rounded-full inline-block mb-1.5 font-medium shadow-sm",
                            categoryConfig.bgColor,
                            categoryConfig.color
                          )}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                        >
                          {categoryConfig.label}
                        </motion.div>
                      )}

                      {/* Message Bubble */}
                      <motion.div 
                        className={cn(
                          "rounded-2xl px-4 py-3 shadow-md",
                          isCurrentUser
                            ? "bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-br-md"
                            : "bg-gradient-to-br from-white to-slate-50 text-slate-800 rounded-bl-md"
                        )}
                        whileHover={{ scale: 1.01 }}
                      >
                        <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">
                          {message.content}
                        </p>

                        {/* Attachments */}
                        {message.attachments.length > 0 && (
                          <div className="mt-3 space-y-2">
                            {message.attachments.map((attachment) => (
                              <motion.div
                                key={attachment.id}
                                className={cn(
                                  "flex items-center gap-3 p-3 rounded-xl",
                                  isCurrentUser
                                    ? "bg-white/20"
                                    : "bg-slate-100"
                                )}
                                whileHover={{ scale: 1.02 }}
                              >
                                <div className={cn(
                                  "shrink-0 p-2 rounded-lg",
                                  isCurrentUser ? "bg-white/20" : "bg-white shadow-sm"
                                )}>
                                  <div className={isCurrentUser ? "text-white" : "text-slate-600"}>
                                    {getFileIcon(attachment.fileType)}
                                  </div>
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
                                    isCurrentUser ? "text-white/70" : "text-slate-500"
                                  )}>
                                    {formatFileSize(attachment.fileSize)}
                                  </p>
                                </div>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => onDownloadAttachment(attachment)}
                                  className={cn(
                                    "h-9 w-9 p-0 shrink-0 rounded-xl",
                                    isCurrentUser
                                      ? "text-white hover:bg-white/20"
                                      : "text-slate-600 hover:bg-slate-200"
                                  )}
                                >
                                  <Download className="h-4 w-4" />
                                </Button>
                              </motion.div>
                            ))}
                          </div>
                        )}
                      </motion.div>

                      {/* Read Receipt */}
                      {isCurrentUser && (
                        <div className="flex items-center justify-end gap-1.5 mt-1.5 px-1">
                          {message.isRead ? (
                            <DoubleCheck3D size="sm" animated={false} />
                          ) : (
                            <Check3D size="sm" animated={false} className="opacity-50" />
                          )}
                          <span className="text-xs text-slate-400">
                            {message.isRead ? "Read" : "Sent"}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}
