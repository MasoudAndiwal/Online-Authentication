"use client";

import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, User, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface Conversation {
  id: string;
  recipientType: "teacher" | "office";
  recipientName: string;
  recipientAvatar?: string;
  lastMessage: string;
  lastMessageAt: Date;
  unreadCount: number;
}

interface ConversationListProps {
  conversations: Conversation[];
  activeConversationId?: string;
  onConversationSelect: (id: string) => void;
}

/**
 * ConversationList Component
 * 
 * Displays all conversations with teachers and office administrators.
 * Features:
 * - Recipient avatar, name, and last message preview
 * - Timestamp and unread badge with green background
 * - Active conversation highlighted with green gradient
 * - Search/filter functionality
 * 
 * Requirements: 13.1, 13.2
 */
export function ConversationList({
  conversations,
  activeConversationId,
  onConversationSelect,
}: ConversationListProps) {
  const [searchQuery, setSearchQuery] = useState("");

  // Filter conversations based on search query
  const filteredConversations = conversations.filter((conv) =>
    conv.recipientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatTimestamp = (date: Date) => {
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true });
    } catch {
      return "Recently";
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-slate-200">
        <h2 className="text-lg font-semibold text-slate-800 mb-3">Messages</h2>
        
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={cn(
              "pl-10 pr-4 py-2 w-full",
              "bg-slate-50 border-slate-200",
              "focus:bg-white focus:border-emerald-300 focus:ring-emerald-200",
              "transition-all duration-200"
            )}
          />
        </div>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-slate-400 text-sm">
              {searchQuery ? "No conversations found" : "No messages yet"}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredConversations.map((conversation) => {
              const isActive = conversation.id === activeConversationId;
              
              return (
                <button
                  key={conversation.id}
                  onClick={() => onConversationSelect(conversation.id)}
                  className={cn(
                    "w-full p-4 text-left transition-all duration-200",
                    "hover:bg-slate-50 active:bg-slate-100",
                    "focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-inset",
                    isActive && [
                      "bg-gradient-to-r from-emerald-50 to-emerald-100/50",
                      "border-l-4 border-emerald-500",
                      "hover:from-emerald-100 hover:to-emerald-100/70"
                    ]
                  )}
                >
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      <Avatar className={cn(
                        "h-12 w-12",
                        isActive && "ring-2 ring-emerald-500 ring-offset-2"
                      )}>
                        <AvatarImage src={conversation.recipientAvatar} />
                        <AvatarFallback className={cn(
                          "text-sm font-semibold",
                          conversation.recipientType === "teacher" 
                            ? "bg-blue-100 text-blue-700"
                            : "bg-purple-100 text-purple-700"
                        )}>
                          {getInitials(conversation.recipientName)}
                        </AvatarFallback>
                      </Avatar>
                      
                      {/* Recipient Type Icon */}
                      <div className={cn(
                        "absolute -bottom-1 -right-1",
                        "h-5 w-5 rounded-full flex items-center justify-center",
                        "border-2 border-white shadow-sm",
                        conversation.recipientType === "teacher"
                          ? "bg-blue-500"
                          : "bg-purple-500"
                      )}>
                        {conversation.recipientType === "teacher" ? (
                          <User className="h-3 w-3 text-white" />
                        ) : (
                          <Building2 className="h-3 w-3 text-white" />
                        )}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className={cn(
                          "font-semibold text-sm truncate",
                          isActive ? "text-emerald-900" : "text-slate-800"
                        )}>
                          {conversation.recipientName}
                        </h3>
                        
                        {/* Timestamp */}
                        <span className={cn(
                          "text-xs flex-shrink-0",
                          isActive ? "text-emerald-600" : "text-slate-500"
                        )}>
                          {formatTimestamp(conversation.lastMessageAt)}
                        </span>
                      </div>

                      {/* Last Message Preview */}
                      <div className="flex items-center justify-between gap-2">
                        <p className={cn(
                          "text-sm truncate",
                          conversation.unreadCount > 0
                            ? "font-medium text-slate-700"
                            : "text-slate-500"
                        )}>
                          {conversation.lastMessage}
                        </p>

                        {/* Unread Badge */}
                        {conversation.unreadCount > 0 && (
                          <Badge className={cn(
                            "bg-emerald-500 text-white",
                            "hover:bg-emerald-600",
                            "min-w-[20px] h-5 px-1.5",
                            "text-xs font-semibold",
                            "flex items-center justify-center",
                            "rounded-full"
                          )}>
                            {conversation.unreadCount > 99 ? "99+" : conversation.unreadCount}
                          </Badge>
                        )}
                      </div>

                      {/* Recipient Type Label */}
                      <div className="mt-1">
                        <span className={cn(
                          "text-xs px-2 py-0.5 rounded-full",
                          conversation.recipientType === "teacher"
                            ? "bg-blue-50 text-blue-600"
                            : "bg-purple-50 text-purple-600"
                        )}>
                          {conversation.recipientType === "teacher" ? "Teacher" : "Office"}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
