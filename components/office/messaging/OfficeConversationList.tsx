"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, Plus, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Conversation } from "@/types/office/messaging";

interface OfficeConversationListProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  onConversationSelect: (id: string) => void;
  onNewConversation: () => void;
}

const sortOptions = [
  { value: "recent", label: "Most Recent" },
  { value: "unread", label: "Unread First" },
  { value: "priority", label: "By Priority" },
  { value: "alphabetical", label: "Alphabetical" },
];

export function OfficeConversationList({
  conversations,
  activeConversationId,
  onConversationSelect,
  onNewConversation,
}: OfficeConversationListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  const filteredConversations = conversations.filter((conv) =>
    conv.recipientName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full">
      {/* Header with Search */}
      <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100">
        <div className="flex items-center gap-2 mb-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white border-0 shadow-md focus-visible:ring-2 focus-visible:ring-blue-500 rounded-xl"
            />
          </div>
          <Button
            variant="outline"
            size="icon"
            className="shrink-0 bg-white border-0 shadow-md hover:bg-blue-50 rounded-xl"
          >
            <Filter className="h-4 w-4" />
          </Button>
        </div>

        {/* New Conversation Button */}
        <Button
          onClick={onNewConversation}
          className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all rounded-xl border-0"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Conversation
        </Button>
      </div>

      {/* Sort Dropdown */}
      <div className="px-4 py-3 bg-white">
        <div className="relative">
          <button
            onClick={() => setShowSortDropdown(!showSortDropdown)}
            className="flex items-center justify-between w-full px-4 py-2.5 text-sm text-white bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg border-0"
          >
            <span className="font-medium">
              Sort by: {sortOptions.find((opt) => opt.value === sortBy)?.label}
            </span>
            <ChevronDown
              className={cn(
                "w-4 h-4 transition-transform",
                showSortDropdown && "rotate-180"
              )}
            />
          </button>

          <AnimatePresence>
            {showSortDropdown && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute z-10 w-full mt-2 bg-white rounded-xl shadow-2xl overflow-hidden border-0"
              >
                {sortOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setSortBy(option.value);
                      setShowSortDropdown(false);
                    }}
                    className={cn(
                      "w-full px-4 py-3 text-left text-sm hover:bg-blue-50 transition-colors border-0",
                      sortBy === option.value
                        ? "bg-blue-50 text-blue-600 font-semibold"
                        : "text-gray-700"
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Conversation List - Hide scrollbar */}
      <div className="flex-1 overflow-y-auto bg-slate-50 scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center mb-4">
              <Search className="h-8 w-8 text-blue-500" />
            </div>
            <h3 className="text-lg font-semibold text-slate-700 mb-2">
              No conversations found
            </h3>
            <p className="text-sm text-slate-500 max-w-xs">
              {searchQuery
                ? "Try adjusting your search"
                : "Start a new conversation to get started"}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {filteredConversations.map((conversation) => (
              <motion.button
                key={conversation.id}
                onClick={() => onConversationSelect(conversation.id)}
                className={cn(
                  "w-full p-4 text-left transition-all hover:bg-white border-0",
                  activeConversationId === conversation.id
                    ? "bg-gradient-to-r from-blue-100 to-blue-50 border-l-4 border-l-blue-500"
                    : "bg-white hover:shadow-sm"
                )}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <div className="relative shrink-0">
                    <div
                      className={cn(
                        "w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold shadow-md",
                        conversation.recipientRole === "teacher"
                          ? "bg-gradient-to-br from-green-400 to-green-600"
                          : "bg-gradient-to-br from-blue-400 to-blue-600"
                      )}
                    >
                      {conversation.recipientAvatar ? (
                        <img
                          src={conversation.recipientAvatar}
                          alt={conversation.recipientName}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-lg">
                          {conversation.recipientName.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    {/* Hide unread badge when conversation is active (user is viewing it) */}
                    {conversation.unreadCount > 0 && activeConversationId !== conversation.id && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg">
                        {conversation.unreadCount > 9 ? "9+" : conversation.unreadCount}
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h4
                        className={cn(
                          "font-semibold truncate",
                          conversation.unreadCount > 0
                            ? "text-slate-900"
                            : "text-slate-700"
                        )}
                      >
                        {conversation.recipientName}
                      </h4>
                      <span className="text-xs text-slate-500 shrink-0">
                        {new Date(conversation.lastMessage.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    <p
                      className={cn(
                        "text-sm truncate",
                        conversation.unreadCount > 0
                          ? "text-slate-900 font-medium"
                          : "text-slate-600"
                      )}
                    >
                      {conversation.lastMessage.content}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge
                        variant="secondary"
                        className={cn(
                          "text-xs capitalize",
                          conversation.recipientRole === "teacher"
                            ? "bg-green-100 text-green-700"
                            : "bg-blue-100 text-blue-700"
                        )}
                      >
                        {conversation.recipientRole}
                      </Badge>
                      {conversation.lastMessage.priority === "urgent" && (
                        <Badge
                          variant="destructive"
                          className="text-xs bg-red-100 text-red-700"
                        >
                          Urgent
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
