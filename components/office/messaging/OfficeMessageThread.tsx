"use client";

import React, { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { Download, FileText, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Message } from "@/types/office/messaging";

interface OfficeMessageThreadProps {
  messages: Message[];
  recipientName: string;
  recipientType: string;
  recipientAvatar?: string;
  onDownloadAttachment: (attachment: any) => void;
}

export function OfficeMessageThread({
  messages,
  recipientName,
  recipientType,
  recipientAvatar,
  onDownloadAttachment,
}: OfficeMessageThreadProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const isCurrentUser = (message: Message) => {
    return message.senderRole === "office";
  };

  const getAttachmentIcon = (fileType: string) => {
    if (fileType.startsWith("image/")) {
      return <ImageIcon className="h-4 w-4" />;
    }
    return <FileText className="h-4 w-4" />;
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="shrink-0 p-4 bg-gradient-to-r from-blue-50 to-white">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold shadow-lg",
              recipientType === "teacher"
                ? "bg-gradient-to-br from-green-400 to-green-600"
                : "bg-gradient-to-br from-blue-400 to-blue-600"
            )}
          >
            {recipientAvatar ? (
              <img
                src={recipientAvatar}
                alt={recipientName}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <span>{recipientName.charAt(0).toUpperCase()}</span>
            )}
          </div>
          <div>
            <h3 className="font-semibold text-slate-800">{recipientName}</h3>
            <p className="text-xs text-slate-600 capitalize">{recipientType}</p>
          </div>
        </div>
      </div>

      {/* Messages - Hide scrollbar */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-br from-slate-50 to-blue-50/30 scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center mx-auto mb-4">
                <FileText className="h-8 w-8 text-blue-500" />
              </div>
              <h3 className="text-lg font-semibold text-slate-700 mb-2">
                No messages yet
              </h3>
              <p className="text-sm text-slate-500">
                Start the conversation by sending a message below
              </p>
            </div>
          </div>
        ) : (
          messages.map((message, index) => {
            const isSender = isCurrentUser(message);
            const showAvatar =
              index === 0 ||
              messages[index - 1].senderId !== message.senderId;

            return (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={cn(
                  "flex gap-3",
                  isSender ? "flex-row-reverse" : "flex-row"
                )}
              >
                {/* Avatar */}
                <div className="shrink-0">
                  {showAvatar ? (
                    <div
                      className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold shadow-md",
                        isSender
                          ? "bg-gradient-to-br from-purple-400 to-purple-600"
                          : recipientType === "teacher"
                          ? "bg-gradient-to-br from-green-400 to-green-600"
                          : "bg-gradient-to-br from-blue-400 to-blue-600"
                      )}
                    >
                      {message.senderAvatar ? (
                        <img
                          src={message.senderAvatar}
                          alt={message.senderName}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <span>{message.senderName.charAt(0).toUpperCase()}</span>
                      )}
                    </div>
                  ) : (
                    <div className="w-8 h-8" />
                  )}
                </div>

                {/* Message Content */}
                <div
                  className={cn(
                    "flex flex-col max-w-[70%]",
                    isSender ? "items-end" : "items-start"
                  )}
                >
                  {showAvatar && (
                    <span className="text-xs text-slate-600 mb-1 px-1">
                      {message.senderName}
                    </span>
                  )}
                  <div
                    className={cn(
                      "rounded-2xl px-4 py-2 shadow-md",
                      isSender
                        ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-tr-sm"
                        : "bg-white text-slate-800 rounded-tl-sm"
                    )}
                  >
                    {/* Priority Badge */}
                    {message.priority === "urgent" && (
                      <div className="mb-2">
                        <span className="inline-block px-2 py-0.5 bg-red-500 text-white text-xs font-semibold rounded-full">
                          Urgent
                        </span>
                      </div>
                    )}

                    {/* Message Text */}
                    <p className="text-sm whitespace-pre-wrap break-words">
                      {message.content}
                    </p>

                    {/* Attachments */}
                    {message.attachments && message.attachments.length > 0 && (
                      <div className="mt-2 space-y-2">
                        {message.attachments.map((attachment) => (
                          <button
                            key={attachment.id}
                            onClick={() => onDownloadAttachment(attachment)}
                            className={cn(
                              "flex items-center gap-2 px-3 py-2 rounded-lg transition-all w-full",
                              isSender
                                ? "bg-blue-600 hover:bg-blue-700"
                                : "bg-slate-100 hover:bg-slate-200"
                            )}
                          >
                            {getAttachmentIcon(attachment.fileType)}
                            <span className="text-xs truncate flex-1 text-left">
                              {attachment.filename}
                            </span>
                            <Download className="h-3 w-3 shrink-0" />
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Timestamp */}
                    <div
                      className={cn(
                        "text-xs mt-1",
                        isSender ? "text-blue-100" : "text-slate-500"
                      )}
                    >
                      {formatDistanceToNow(new Date(message.timestamp), {
                        addSuffix: true,
                      })}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}
