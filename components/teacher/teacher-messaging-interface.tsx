"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { TeacherConversationList } from "./teacher-conversation-list";
import { TeacherMessageThread } from "./teacher-message-thread";
import { TeacherComposeMessage } from "./teacher-compose-message";
import { TeacherNewConversationDialog } from "./teacher-new-conversation-dialog";
import { MessageBubble3D, NewMessage3D } from "@/components/ui/message-3d-icons";

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

interface MessageData {
  content: string;
  category: string;
  attachments: File[];
  conversationId?: string;
  isUrgent?: boolean;
}

interface PendingRecipient {
  id: string;
  type: "student" | "office";
  name: string;
}

interface TeacherMessagingInterfaceProps {
  conversations: Conversation[];
  messages: Message[];
  activeConversationId?: string;
  currentUserId: string;
  onConversationSelect: (id: string) => void;
  onSendMessage: (data: MessageData) => void;
  onDownloadAttachment: (attachment: Attachment) => void;
  onStartNewConversation?: (recipientId: string, recipientType: "student" | "office", recipientName: string) => void;
  pendingRecipient?: PendingRecipient | null;
  onClearPendingRecipient?: () => void;
  isLoading?: boolean;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export function TeacherMessagingInterface({
  conversations,
  messages,
  activeConversationId,
  currentUserId,
  onConversationSelect,
  onSendMessage,
  onDownloadAttachment,
  onStartNewConversation,
  pendingRecipient,
  onClearPendingRecipient,
  isLoading = false,
}: TeacherMessagingInterfaceProps) {
  const isMobile = useIsMobile();
  const [showConversationList, setShowConversationList] = useState(true);
  const [showNewConversationDialog, setShowNewConversationDialog] = useState(false);

  React.useEffect(() => {
    if (isMobile && activeConversationId) {
      setShowConversationList(false);
    }
  }, [isMobile, activeConversationId]);

  const handleConversationSelect = (id: string) => {
    onConversationSelect(id);
    if (isMobile) {
      setShowConversationList(false);
    }
  };

  const handleBackToList = () => {
    setShowConversationList(true);
    onConversationSelect("");
  };

  const handleNewConversation = () => {
    setShowNewConversationDialog(true);
  };

  const handleSelectRecipient = (recipient: { id: string; type: "student" | "office"; name: string }) => {
    if (onStartNewConversation) {
      onStartNewConversation(recipient.id, recipient.type, recipient.name);
    }
  };

  const handleSendMessage = (data: MessageData) => {
    const messageData = {
      ...data,
      conversationId: activeConversationId || undefined,
    };
    onSendMessage(messageData);
  };

  const activeConversation = conversations.find(c => c.id === activeConversationId);

  return (
    <motion.div 
      className="h-full flex flex-col"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Desktop & Tablet: Multi-column layout */}
      <div className="hidden md:flex h-full gap-4">
        {/* Conversation List */}
        <motion.div 
          className="w-full md:w-80 lg:w-96 shrink-0"
          variants={itemVariants}
        >
          <div className="h-full rounded-2xl shadow-xl bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-xl overflow-hidden">
            <TeacherConversationList
              conversations={conversations}
              activeConversationId={activeConversationId}
              onConversationSelect={handleConversationSelect}
              onNewConversation={handleNewConversation}
            />
          </div>
        </motion.div>

        {/* Message Thread */}
        <motion.div 
          className="flex-1 min-w-0"
          variants={itemVariants}
        >
          <div className="h-full rounded-2xl shadow-xl bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-xl overflow-hidden flex flex-col">
            <AnimatePresence mode="wait">
              {pendingRecipient ? (
                <motion.div
                  key="new-conversation"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex flex-col h-full overflow-hidden"
                >
                  {/* New Conversation Header */}
                  <div className="shrink-0 p-4 bg-gradient-to-r from-blue-50 to-white border-b border-blue-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "h-10 w-10 rounded-full flex items-center justify-center text-white font-bold",
                          pendingRecipient.type === "office"
                            ? "bg-gradient-to-br from-purple-400 to-purple-600"
                            : "bg-gradient-to-br from-blue-400 to-blue-600"
                        )}>
                          {pendingRecipient.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-800">{pendingRecipient.name}</h3>
                          <p className="text-xs text-blue-600 capitalize">
                            New conversation • {pendingRecipient.type}
                          </p>
                        </div>
                      </div>
                      {onClearPendingRecipient && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={onClearPendingRecipient}
                          className="text-slate-500 hover:text-slate-700"
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none]">
                    <div className="flex items-center justify-center p-6">
                      <div className="text-center">
                        <motion.div
                          animate={{ y: [0, -5, 0] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="mb-3"
                        >
                          <MessageBubble3D size="lg" className="mx-auto opacity-40" />
                        </motion.div>
                        <h3 className="text-base font-semibold text-slate-600 mb-1">
                          Start a conversation
                        </h3>
                        <p className="text-slate-400 text-sm">
                          Send your first message to {pendingRecipient.name}
                        </p>
                      </div>
                    </div>
                    
                    <TeacherComposeMessage
                      recipientName={pendingRecipient.name}
                      recipientType={pendingRecipient.type}
                      onSend={handleSendMessage}
                      isLoading={isLoading}
                    />
                  </div>
                </motion.div>
              ) : activeConversationId && activeConversation ? (
                <motion.div
                  key="thread"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex flex-col h-full"
                >
                  <div className="flex-1 overflow-hidden">
                    <TeacherMessageThread
                      messages={messages}
                      currentUserId={currentUserId}
                      recipientName={activeConversation.recipientName}
                      recipientType={activeConversation.recipientType}
                      recipientAvatar={activeConversation.recipientAvatar}
                      onDownloadAttachment={onDownloadAttachment}
                    />
                  </div>
                  <TeacherComposeMessage
                    recipientName={activeConversation.recipientName}
                    recipientType={activeConversation.recipientType}
                    onSend={handleSendMessage}
                    isLoading={isLoading}
                    compact={true}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="h-full flex items-center justify-center"
                >
                  <div className="text-center p-8">
                    <motion.div
                      animate={{ 
                        y: [0, -10, 0],
                        rotate: [0, 5, -5, 0]
                      }}
                      transition={{ 
                        duration: 3, 
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                      className="mb-6"
                    >
                      <MessageBubble3D size="xl" className="mx-auto opacity-40" />
                    </motion.div>
                    <h3 className="text-xl font-semibold text-slate-600 mb-2">
                      Select a conversation
                    </h3>
                    <p className="text-slate-400 text-sm max-w-xs mx-auto">
                      Choose from your conversations on the left to start messaging
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Details Panel - Desktop only */}
        <motion.div 
          className="hidden lg:block w-80 shrink-0"
          variants={itemVariants}
        >
          <div className="h-full rounded-2xl shadow-xl bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-xl overflow-hidden">
            <div className="p-5">
              <h3 className="text-lg font-semibold text-slate-800 mb-5">Details</h3>
              <AnimatePresence mode="wait">
                {activeConversation ? (
                  <motion.div
                    key="details"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-5"
                  >
                    <div className={cn(
                      "p-4 rounded-xl",
                      activeConversation.recipientType === "office"
                        ? "bg-gradient-to-br from-purple-50 to-purple-100/50"
                        : "bg-gradient-to-br from-blue-50 to-blue-100/50"
                    )}>
                      <p className={cn(
                        "text-xs font-medium mb-1 uppercase tracking-wide",
                        activeConversation.recipientType === "office" ? "text-purple-600" : "text-blue-600"
                      )}>
                        Recipient
                      </p>
                      <p className="text-sm font-semibold text-slate-800">
                        {activeConversation.recipientName}
                      </p>
                    </div>
                    <div className={cn(
                      "p-4 rounded-xl",
                      activeConversation.recipientType === "office"
                        ? "bg-gradient-to-br from-purple-50 to-purple-100/50"
                        : "bg-gradient-to-br from-emerald-50 to-emerald-100/50"
                    )}>
                      <p className={cn(
                        "text-xs font-medium mb-1 uppercase tracking-wide",
                        activeConversation.recipientType === "office" ? "text-purple-600" : "text-emerald-600"
                      )}>
                        Type
                      </p>
                      <p className="text-sm font-semibold text-slate-800 capitalize">
                        {activeConversation.recipientType === "teacher" ? "Student" : activeConversation.recipientType}
                      </p>
                    </div>
                    {activeConversation.unreadCount > 0 && (
                      <motion.div 
                        className="p-4 rounded-xl bg-gradient-to-br from-amber-50 to-amber-100/50"
                        initial={{ scale: 0.9 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <p className="text-xs font-medium text-amber-600 mb-1 uppercase tracking-wide">
                          Unread
                        </p>
                        <p className="text-2xl font-bold text-amber-700">
                          {activeConversation.unreadCount}
                        </p>
                      </motion.div>
                    )}
                  </motion.div>
                ) : (
                  <motion.p
                    key="no-details"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-sm text-slate-400"
                  >
                    Select a conversation to view details
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Mobile: Full-screen layout */}
      <div className="md:hidden h-full">
        <AnimatePresence mode="wait">
          {showConversationList ? (
            <motion.div
              key="list"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="h-full rounded-2xl shadow-xl bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-xl overflow-hidden"
            >
              <TeacherConversationList
                conversations={conversations}
                activeConversationId={activeConversationId}
                onConversationSelect={handleConversationSelect}
                onNewConversation={handleNewConversation}
              />
            </motion.div>
          ) : (
            <motion.div
              key="thread"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="h-full rounded-2xl shadow-xl bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-xl overflow-hidden flex flex-col"
            >
              <div className="p-3 bg-gradient-to-r from-blue-50/80 to-white/50">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBackToList}
                  className={cn(
                    "text-blue-600 hover:text-blue-700 hover:bg-blue-100/50",
                    "min-h-[44px] px-4 rounded-xl",
                    "transition-all duration-200"
                  )}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Messages
                </Button>
              </div>
              
              {activeConversation && (
                <>
                  <div className="flex-1 overflow-hidden">
                    <TeacherMessageThread
                      messages={messages}
                      currentUserId={currentUserId}
                      recipientName={activeConversation.recipientName}
                      recipientType={activeConversation.recipientType}
                      recipientAvatar={activeConversation.recipientAvatar}
                      onDownloadAttachment={onDownloadAttachment}
                    />
                  </div>
                  <TeacherComposeMessage
                    recipientName={activeConversation.recipientName}
                    recipientType={activeConversation.recipientType}
                    onSend={handleSendMessage}
                    isLoading={isLoading}
                    compact={true}
                  />
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Floating Action Button - Mobile only */}
      {isMobile && showConversationList && !pendingRecipient && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          className="fixed bottom-6 right-6 z-50"
        >
          <Button
            onClick={handleNewConversation}
            className={cn(
              "h-14 w-14 rounded-full shadow-2xl",
              "bg-gradient-to-br from-blue-500 to-blue-600",
              "hover:from-blue-600 hover:to-blue-700",
              "transition-all duration-300",
              "hover:scale-110 active:scale-95",
              "min-h-[56px] min-w-[56px]",
              "[&_svg]:size-7"
            )}
            size="icon"
          >
            <NewMessage3D />
          </Button>
        </motion.div>
      )}

      {/* New Conversation Dialog */}
      <TeacherNewConversationDialog
        open={showNewConversationDialog}
        onOpenChange={setShowNewConversationDialog}
        onSelectRecipient={handleSelectRecipient}
      />
    </motion.div>
  );
}
