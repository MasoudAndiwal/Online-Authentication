"use client";

import React, { useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, FileText, Image as ImageIcon, FileSpreadsheet, Presentation, UserCheck, UserX, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Check3D, DoubleCheck3D } from "@/components/ui/message-3d-icons";

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

interface TeacherMessageThreadProps {
  messages: Message[];
  currentUserId: string;
  recipientName: string;
  recipientType: "student" | "teacher" | "office";
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

export function TeacherMessageThread({
  messages,
  currentUserId,
  recipientName,
  recipientType,
  recipientAvatar,
  onDownloadAttachment,
}: TeacherMessageThreadProps) {
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

  // Mock function to get attendance status
  const getAttendanceStatus = (): "present" | "absent" | null => {
    if (recipientType !== "student") return null;
    return Math.random() > 0.5 ? "present" : "absent";
  };

  const attendanceStatus = getAttendanceStatus();
  const typeColor = recipientType === "office" ? "purple" : "blue";

  if (messages.length === 0) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="text-slate-400 text-sm">No messages yet</p>
          <p className="text-slate-300 text-xs mt-1">Start the conversation below</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Thread Header */}
      <div className={cn(
        "p-4 shadow-sm",
        typeColor === "purple"
          ? "bg-gradient-to-r from-purple-50/80 to-white/50"
          : "bg-gradient-to-r from-blue-50/80 to-white/50"
      )}>
        <div className="flex items-center gap-3">
          <Avatar className={cn(
            "h-11 w-11 ring-2 ring-offset-2",
            typeColor === "purple" ? "ring-purple-200" : "ring-blue-200"
          )}>
            <AvatarImage src={recipientAvatar} />
            <AvatarFallback className={cn(
              "text-sm font-bold",
              typeColor === "purple"
                ? "bg-gradient-to-br from-purple-100 to-purple-200 text-purple-700"
                : "bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700"
            )}>
              {getInitials(recipientName)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h3 className="font-semibold text-slate-800">{recipientName}</h3>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge className={cn(
                "text-xs",
                typeColor === "purple"
                  ? "bg-purple-100 text-purple-700"
                  : "bg-blue-100 text-blue-700"
              )}>
                {recipientType === "office" ? "Office Staff" : "Student"}
              </Badge>
              
              {attendanceStatus && (
                <Badge className={cn(
                  "text-xs flex items-center gap-1",
                  attendanceStatus === "present"
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-red-100 text-red-700"
                )}>
                  {attendanceStatus === "present" ? (
                    <>
                      <UserCheck className="h-3 w-3" />
                      Present Today
                    </>
                  ) : (
                    <>
                      <UserX className="h-3 w-3" />
                      Absent Today
                    </>
                  )}
                </Badge>
              )}
              
              {recipientType === "office" && (
                <Badge className="text-xs bg-purple-100 text-purple-700 flex items-center gap-1">
                  <Building2 className="h-3 w-3" />
                  Office
                </Badge>
              )}
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

                {isSystemMessage ? (
                  <motion.div
                    className="flex justify-center my-3"
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex items-start gap-3 max-w-md p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 shadow-md">
                      <div className="text-sm font-medium text-amber-800">{message.content}</div>
                    </div>
                  </motion.div>
                ) : (
                  <div className={cn(
                    "flex gap-2",
                    isCurrentUser ? "justify-end" : "justify-start"
                  )}>
                    {showAvatar && (
                      <Avatar className="h-8 w-8 shrink-0 ring-2 ring-slate-100">
                        <AvatarImage src={message.senderAvatar} />
                        <AvatarFallback className="bg-gradient-to-br from-slate-100 to-slate-200 text-slate-600 text-xs font-bold">
                          {getInitials(message.senderName)}
                        </AvatarFallback>
                      </Avatar>
                    )}

                    <div className={cn(
                      "max-w-[75%] sm:max-w-md",
                      isCurrentUser && "order-first"
                    )}>
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

                      <motion.div 
                        className={cn(
                          "rounded-2xl px-4 py-3 shadow-md",
                          isCurrentUser
                            ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-br-md"
                            : "bg-gradient-to-br from-white to-slate-50 text-slate-800 rounded-bl-md"
                        )}
                        whileHover={{ scale: 1.01 }}
                      >
                        <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">
                          {message.content}
                        </p>

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
