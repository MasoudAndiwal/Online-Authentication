"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MessageSquarePlus, Users, Clock, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMessaging } from "@/hooks/office/messaging/use-messaging-context";
import { OfficeConversationList } from "./OfficeConversationList";
import { OfficeMessageThread } from "./OfficeMessageThread";
import { OfficeComposeMessage } from "./OfficeComposeMessage";
import { OfficeNewConversationDialog } from "./OfficeNewConversationDialog";
import { BroadcastDialog } from "./broadcast/BroadcastDialog";
import { ScheduleMessageDialog } from "./schedule/ScheduleMessageDialog";
import { ExportDialog } from "./message-view/ExportDialog";
import { MessageBubble3D } from "@/components/ui/message-3d-icons";

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

export function OfficeMessagingInterface() {
  const isMobile = useIsMobile();
  const [showConversationList, setShowConversationList] = useState(true);
  const [showNewConversationDialog, setShowNewConversationDialog] = useState(false);
  const [showBroadcastDialog, setShowBroadcastDialog] = useState(false);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  
  const {
    conversations,
    selectedConversationId,
    messages,
    selectConversation,
    sendMessage,
    scheduleMessage,
    isLoading,
  } = useMessaging();

  React.useEffect(() => {
    if (isMobile && selectedConversationId) {
      setShowConversationList(false);
    }
  }, [isMobile, selectedConversationId]);

  const handleConversationSelect = (id: string) => {
    selectConversation(id);
    if (isMobile) {
      setShowConversationList(false);
    }
  };

  const handleBackToList = () => {
    setShowConversationList(true);
    selectConversation(null);
  };

  const handleNewConversation = () => {
    setShowNewConversationDialog(true);
  };

  const handleSelectRecipient = (recipient: { id: string; type: "student" | "teacher"; name: string }) => {
    console.log("Selected recipient:", recipient);
    setShowNewConversationDialog(false);
  };

  const handleSendMessage = async (data: {
    content: string;
    category: string;
    attachments: File[];
    conversationId?: string;
    isUrgent?: boolean;
  }) => {
    try {
      await sendMessage({
        conversationId: selectedConversationId || undefined,
        content: data.content,
        category: data.category as any,
        priority: data.isUrgent ? 'urgent' : 'normal',
        attachments: [],
      });
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const handleScheduleMessage = async (request: any) => {
    try {
      await scheduleMessage(request);
      setShowScheduleDialog(false);
    } catch (error) {
      console.error("Failed to schedule message:", error);
    }
  };

  const handleDownloadAttachment = (attachment: any) => {
    console.log("Download attachment:", attachment);
  };

  const activeConversation = conversations.find(c => c.id === selectedConversationId);
  const conversationMessages = selectedConversationId ? messages[selectedConversationId] || [] : [];

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
            <OfficeConversationList
              conversations={conversations}
              activeConversationId={selectedConversationId}
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
              {activeConversation ? (
                <motion.div
                  key="thread"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex flex-col h-full"
                >
                  <div className="flex-1 overflow-hidden">
                    <OfficeMessageThread
                      messages={conversationMessages}
                      recipientName={activeConversation.recipientName}
                      recipientType={activeConversation.recipientRole}
                      recipientAvatar={activeConversation.recipientAvatar}
                      onDownloadAttachment={handleDownloadAttachment}
                    />
                  </div>
                  <OfficeComposeMessage
                    recipientName={activeConversation.recipientName}
                    recipientType={activeConversation.recipientRole}
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
                      Choose a conversation from the sidebar to start messaging with students and teachers.
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
              <h3 className="text-lg font-semibold text-slate-800 mb-5">Quick Actions</h3>
              
              {/* Quick Action Buttons */}
              <div className="space-y-3 mb-6">
                <Button
                  onClick={() => setShowBroadcastDialog(true)}
                  className="w-full justify-start bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white border-0 shadow-md rounded-xl"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Broadcast Message
                </Button>
                
                {activeConversation && (
                  <>
                    <Button
                      onClick={() => setShowScheduleDialog(true)}
                      className="w-full justify-start bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-0 shadow-md rounded-xl"
                    >
                      <Clock className="h-4 w-4 mr-2" />
                      Schedule Message
                    </Button>
                    
                    <Button
                      onClick={() => setShowExportDialog(true)}
                      className="w-full justify-start bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white border-0 shadow-md rounded-xl"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export Conversation
                    </Button>
                  </>
                )}
              </div>

              {/* Conversation Details */}
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
                      activeConversation.recipientRole === "teacher"
                        ? "bg-gradient-to-br from-green-50 to-green-100/50"
                        : "bg-gradient-to-br from-blue-50 to-blue-100/50"
                    )}>
                      <p className={cn(
                        "text-xs font-medium mb-1 uppercase tracking-wide",
                        activeConversation.recipientRole === "teacher" ? "text-green-600" : "text-blue-600"
                      )}>
                        Recipient
                      </p>
                      <p className="text-sm font-semibold text-slate-800">
                        {activeConversation.recipientName}
                      </p>
                    </div>
                    <div className={cn(
                      "p-4 rounded-xl",
                      activeConversation.recipientRole === "teacher"
                        ? "bg-gradient-to-br from-green-50 to-green-100/50"
                        : "bg-gradient-to-br from-emerald-50 to-emerald-100/50"
                    )}>
                      <p className={cn(
                        "text-xs font-medium mb-1 uppercase tracking-wide",
                        activeConversation.recipientRole === "teacher" ? "text-green-600" : "text-emerald-600"
                      )}>
                        Type
                      </p>
                      <p className="text-sm font-semibold text-slate-800 capitalize">
                        {activeConversation.recipientRole}
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
              <OfficeConversationList
                conversations={conversations}
                activeConversationId={selectedConversationId}
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
                    <OfficeMessageThread
                      messages={conversationMessages}
                      recipientName={activeConversation.recipientName}
                      recipientType={activeConversation.recipientRole}
                      recipientAvatar={activeConversation.recipientAvatar}
                      onDownloadAttachment={handleDownloadAttachment}
                    />
                  </div>
                  <OfficeComposeMessage
                    recipientName={activeConversation.recipientName}
                    recipientType={activeConversation.recipientRole}
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
      {isMobile && showConversationList && (
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
              "min-h-[56px] min-w-[56px]"
            )}
            size="icon"
          >
            <MessageSquarePlus className="h-7 w-7 text-white" />
          </Button>
        </motion.div>
      )}

      {/* Dialogs */}
      <OfficeNewConversationDialog
        open={showNewConversationDialog}
        onOpenChange={setShowNewConversationDialog}
        onSelectRecipient={handleSelectRecipient}
      />

      <BroadcastDialog
        isOpen={showBroadcastDialog}
        onClose={() => setShowBroadcastDialog(false)}
      />

      {activeConversation && (
        <>
          <ScheduleMessageDialog
            isOpen={showScheduleDialog}
            onClose={() => setShowScheduleDialog(false)}
            onSchedule={handleScheduleMessage}
            conversationId={activeConversation.id}
            recipientId={activeConversation.recipientId}
            draft={{
              content: "",
              category: "general",
              priority: "normal",
              attachments: [],
            }}
          />

          <ExportDialog
            isOpen={showExportDialog}
            onClose={() => setShowExportDialog(false)}
            conversation={activeConversation}
            messages={conversationMessages}
          />
        </>
      )}
    </motion.div>
  );
}
