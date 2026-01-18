"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus, UserCheck, UserX, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { Inbox3D } from "@/components/ui/message-3d-icons";

interface Conversation {
  id: string;
  recipientType: "student" | "teacher" | "office";
  recipientId?: string;
  recipientName: string;
  recipientAvatar?: string;
  lastMessage: string;
  lastMessageAt: Date;
  unreadCount: number;
}

interface TeacherConversationListProps {
  conversations: Conversation[];
  activeConversationId?: string;
  onConversationSelect: (id: string) => void;
  onNewConversation?: () => void;
}

const listVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 }
};

export function TeacherConversationList({
  conversations,
  activeConversationId,
  onConversationSelect,
  onNewConversation,
}: TeacherConversationListProps) {
  const [searchQuery, setSearchQuery] = useState("");

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

  // Mock function to get student attendance status (you'll replace this with real data)
  const getAttendanceStatus = (recipientType: string): "present" | "absent" | null => {
    if (recipientType !== "student" && recipientType !== "teacher") return null;
    // This should fetch real attendance data from your API
    // For now, returning random status for demo
    const random = Math.random();
    if (random > 0.7) return "absent";
    if (random > 0.3) return "present";
    return null;
  };

  const getRecipientTypeColor = (type: string) => {
    if (type === "office") return "purple";
    return "blue";
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Inbox3D size="lg" />
            <h2 className="text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
              Messages
            </h2>
            {conversations.filter(c => c.unreadCount > 0).length > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500 }}
              >
                <Badge className="bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30">
                  {conversations.reduce((acc, c) => acc + c.unreadCount, 0)} new
                </Badge>
              </motion.div>
            )}
          </div>
          
          {onNewConversation && (
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={onNewConversation}
                size="sm"
                className={cn(
                  "h-10 px-4 rounded-xl",
                  "bg-gradient-to-r from-blue-500 to-blue-600",
                  "hover:from-blue-600 hover:to-blue-700",
                  "text-white shadow-lg shadow-blue-500/30",
                  "transition-all duration-300"
                )}
              >
                <Plus className="h-4 w-4 mr-1.5" />
                New
              </Button>
            </motion.div>
          )}
        </div>
        
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={cn(
              "pl-10 pr-4 py-3 w-full rounded-xl",
              "bg-gradient-to-r from-slate-50 to-white",
              "focus:from-blue-50 focus:to-white",
              "focus:ring-2 focus:ring-blue-200",
              "shadow-sm transition-all duration-300"
            )}
          />
        </div>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto px-3 pb-3 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        <style jsx>{`
          div::-webkit-scrollbar {
            display: none;
          }
        `}</style>
        {filteredConversations.length === 0 ? (
          <motion.div 
            className="p-8 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="mb-4"
            >
              <Inbox3D size="xl" className="mx-auto opacity-30" />
            </motion.div>
            <p className="text-slate-400 text-sm">
              {searchQuery ? "No conversations found" : "No messages yet"}
            </p>
          </motion.div>
        ) : (
          <motion.div 
            className="space-y-2"
            variants={listVariants}
            initial="hidden"
            animate="visible"
          >
            <AnimatePresence>
              {filteredConversations.map((conversation) => {
                const isActive = conversation.id === activeConversationId;
                const attendanceStatus = getAttendanceStatus(conversation.recipientType);
                const typeColor = getRecipientTypeColor(conversation.recipientType);
                
                return (
                  <motion.button
                    key={conversation.id}
                    variants={itemVariants}
                    whileHover={{ scale: 1.02, x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onConversationSelect(conversation.id)}
                    className={cn(
                      "w-full p-4 text-left rounded-2xl transition-all duration-300",
                      "focus:outline-none focus:ring-2 focus:ring-blue-400",
                      isActive 
                        ? typeColor === "purple"
                          ? "bg-gradient-to-r from-purple-500 to-purple-600 shadow-lg shadow-purple-500/30"
                          : "bg-gradient-to-r from-blue-500 to-blue-600 shadow-lg shadow-blue-500/30"
                        : "bg-gradient-to-r from-white to-slate-50 hover:from-blue-50 hover:to-white shadow-sm hover:shadow-md"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      {/* Avatar */}
                      <div className="relative shrink-0">
                        <Avatar className={cn(
                          "h-12 w-12 ring-2 ring-offset-2 transition-all",
                          isActive 
                            ? "ring-white/50" 
                            : typeColor === "purple"
                              ? "ring-purple-200"
                              : "ring-blue-200"
                        )}>
                          <AvatarImage src={conversation.recipientAvatar} />
                          <AvatarFallback className={cn(
                            "text-sm font-bold",
                            isActive
                              ? "bg-white/20 text-white"
                              : typeColor === "purple"
                                ? "bg-gradient-to-br from-purple-100 to-purple-200 text-purple-700"
                                : "bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700"
                          )}>
                            {getInitials(conversation.recipientName)}
                          </AvatarFallback>
                        </Avatar>
                        
                        {/* Type Icon */}
                        <motion.div 
                          className={cn(
                            "absolute -bottom-1 -right-1",
                            "h-5 w-5 rounded-full flex items-center justify-center",
                            "shadow-md",
                            isActive
                              ? "bg-white"
                              : typeColor === "purple"
                                ? "bg-gradient-to-br from-purple-400 to-purple-500"
                                : "bg-gradient-to-br from-blue-400 to-blue-500"
                          )}
                          whileHover={{ scale: 1.2 }}
                        >
                          {conversation.recipientType === "office" ? (
                            <Building2 className={cn("h-3 w-3", isActive ? "text-purple-600" : "text-white")} />
                          ) : (
                            <div className={cn("h-2 w-2 rounded-full", isActive ? "bg-blue-600" : "bg-white")} />
                          )}
                        </motion.div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h3 className={cn(
                            "font-semibold text-sm truncate",
                            isActive ? "text-white" : "text-slate-800"
                          )}>
                            {conversation.recipientName}
                          </h3>
                          
                          <span className={cn(
                            "text-xs shrink-0",
                            isActive ? "text-white/80" : "text-slate-500"
                          )}>
                            {formatTimestamp(conversation.lastMessageAt)}
                          </span>
                        </div>

                        <div className="flex items-center justify-between gap-2 mb-2">
                          <p className={cn(
                            "text-sm truncate",
                            isActive 
                              ? "text-white/90"
                              : conversation.unreadCount > 0
                                ? "font-medium text-slate-700"
                                : "text-slate-500"
                          )}>
                            {conversation.lastMessage}
                          </p>

                          {conversation.unreadCount > 0 && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ type: "spring", stiffness: 500 }}
                            >
                              <Badge className={cn(
                                "min-w-[22px] h-[22px] px-1.5",
                                "text-xs font-bold",
                                "flex items-center justify-center",
                                "rounded-full shadow-md",
                                isActive
                                  ? "bg-white text-blue-600"
                                  : "bg-gradient-to-r from-blue-500 to-blue-600 text-white"
                              )}>
                                {conversation.unreadCount > 99 ? "99+" : conversation.unreadCount}
                              </Badge>
                            </motion.div>
                          )}
                        </div>

                        {/* Type Label and Attendance Badge */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={cn(
                            "text-xs px-2.5 py-1 rounded-full font-medium",
                            isActive
                              ? "bg-white/20 text-white"
                              : typeColor === "purple"
                                ? "bg-purple-100 text-purple-600"
                                : "bg-blue-100 text-blue-600"
                          )}>
                            {conversation.recipientType === "office" ? "Office" : "Student"}
                          </span>
                          
                          {/* Attendance Badge for Students */}
                          {attendanceStatus && (
                            <motion.span
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className={cn(
                                "text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1",
                                isActive
                                  ? "bg-white/20 text-white"
                                  : attendanceStatus === "present"
                                    ? "bg-emerald-100 text-emerald-700"
                                    : "bg-red-100 text-red-700"
                              )}
                            >
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
                            </motion.span>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
}
