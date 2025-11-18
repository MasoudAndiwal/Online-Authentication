"use client";

import React, { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { MessageSquarePlus, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { ConversationList } from "./conversation-list";
import { MessageThread } from "./message-thread";
import { ComposeMessage } from "./compose-message";

interface Conversation {
  id: string;
  recipientType: "teacher" | "office";
  recipientName: string;
  recipientAvatar?: string;
  lastMessage: string;
  lastMessageAt: Date;
  unreadCount: number;
}

interface Message {
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

interface Attachment {
  id: string;
  filename: string;
  fileType: string;
  fileSize: number;
  url: string;
}

interface MessageData {
  content: string;
  category: string;
  attachments: File[];
}

interface MessagingInterfaceProps {
  conversations: Conversation[];
  messages: Message[];
  activeConversationId?: string;
  currentUserId: string;
  onConversationSelect: (id: string) => void;
  onSendMessage: (data: MessageData) => void;
  onDownloadAttachment: (attachment: Attachment) => void;
  isLoading?: boolean;
}

/**
 * MessagingInterface Component
 * 
 * Responsive messaging layout that adapts to different screen sizes:
 * - Desktop (1024px+): Three-column layout (conversations, thread, details)
 * - Tablet (768px-1023px): Two-column layout (conversations, thread)
 * - Mobile (<768px): Full-screen with bottom sheet for compose
 * 
 * Requirements: 13.1, 13.2, 7.1, 7.2
 */
export function MessagingInterface({
  conversations,
  messages,
  activeConversationId,
  currentUserId,
  onConversationSelect,
  onSendMessage,
  onDownloadAttachment,
  isLoading = false,
}: MessagingInterfaceProps) {
  const isMobile = useIsMobile();
  const [showConversationList, setShowConversationList] = useState(true);
  const [showComposeSheet, setShowComposeSheet] = useState(false);

  // On mobile, hide conversation list when a conversation is selected
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

  const handleNewMessage = () => {
    if (isMobile) {
      setShowComposeSheet(true);
    }
  };

  const handleSendMessage = (data: MessageData) => {
    onSendMessage(data);
    if (isMobile) {
      setShowComposeSheet(false);
    }
  };

  const activeConversation = conversations.find(c => c.id === activeConversationId);

  return (
    <div className="h-full flex flex-col">
      {/* Desktop & Tablet: Multi-column layout */}
      <div className="hidden md:flex h-full gap-4">
        {/* Conversation List - Always visible on desktop/tablet */}
        <div className="w-full md:w-80 lg:w-96 flex-shrink-0">
          <div className="h-full rounded-2xl shadow-xl bg-white/80 backdrop-blur-xl border-0 overflow-hidden">
            <ConversationList
              conversations={conversations}
              activeConversationId={activeConversationId}
              onConversationSelect={handleConversationSelect}
            />
          </div>
        </div>

        {/* Message Thread - Middle column */}
        <div className="flex-1 min-w-0">
          <div className="h-full rounded-2xl shadow-xl bg-white/80 backdrop-blur-xl border-0 overflow-hidden flex flex-col">
            {activeConversationId && activeConversation ? (
              <>
                <div className="flex-1 overflow-hidden">
                  <MessageThread
                    messages={messages}
                    currentUserId={currentUserId}
                    recipientName={activeConversation.recipientName}
                    recipientAvatar={activeConversation.recipientAvatar}
                    onDownloadAttachment={onDownloadAttachment}
                  />
                </div>
                <ComposeMessage
                  recipientName={activeConversation.recipientName}
                  onSend={handleSendMessage}
                  isLoading={isLoading}
                />
              </>
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <MessageSquarePlus className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500 text-lg">Select a conversation to start messaging</p>
                  <p className="text-slate-400 text-sm mt-2">Choose from your conversations on the left</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Details Panel - Right column (desktop only) */}
        <div className="hidden lg:block w-80 flex-shrink-0">
          <div className="h-full rounded-2xl shadow-xl bg-white/80 backdrop-blur-xl border-0 overflow-hidden">
            <div className="p-4">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Details</h3>
              {activeConversation ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-slate-700 mb-1">Recipient</p>
                    <p className="text-sm text-slate-600">{activeConversation.recipientName}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-700 mb-1">Type</p>
                    <p className="text-sm text-slate-600 capitalize">{activeConversation.recipientType}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-700 mb-1">Unread Messages</p>
                    <p className="text-sm text-slate-600">{activeConversation.unreadCount}</p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-slate-400">Select a conversation to view details</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile: Full-screen layout with conditional rendering */}
      <div className="md:hidden h-full">
        {showConversationList ? (
          <div className="h-full rounded-2xl shadow-xl bg-white/80 backdrop-blur-xl border-0 overflow-hidden">
            <ConversationList
              conversations={conversations}
              activeConversationId={activeConversationId}
              onConversationSelect={handleConversationSelect}
            />
          </div>
        ) : (
          <div className="h-full rounded-2xl shadow-xl bg-white/80 backdrop-blur-xl border-0 overflow-hidden flex flex-col">
            {/* Back button */}
            <div className="p-3 border-b border-slate-200 bg-white/50">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackToList}
                className={cn(
                  "text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50",
                  "min-h-[44px] px-3"
                )}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Messages
              </Button>
            </div>
            
            {activeConversation && (
              <>
                <div className="flex-1 overflow-hidden">
                  <MessageThread
                    messages={messages}
                    currentUserId={currentUserId}
                    recipientName={activeConversation.recipientName}
                    recipientAvatar={activeConversation.recipientAvatar}
                    onDownloadAttachment={onDownloadAttachment}
                  />
                </div>
                <ComposeMessage
                  recipientName={activeConversation.recipientName}
                  onSend={handleSendMessage}
                  isLoading={isLoading}
                />
              </>
            )}
          </div>
        )}
      </div>

      {/* Floating Action Button - Mobile only */}
      {isMobile && showConversationList && (
        <Button
          onClick={handleNewMessage}
          className={cn(
            "fixed bottom-6 right-6 z-50",
            "h-14 w-14 rounded-full shadow-2xl",
            "bg-gradient-to-r from-emerald-600 to-emerald-700",
            "hover:from-emerald-700 hover:to-emerald-800",
            "border-0 shadow-emerald-500/25",
            "transition-all duration-300",
            "hover:scale-110 active:scale-95",
            "min-h-[56px] min-w-[56px]"
          )}
          size="icon"
        >
          <MessageSquarePlus className="h-6 w-6 text-white" />
        </Button>
      )}

      {/* Mobile Compose Sheet */}
      <Sheet open={showComposeSheet} onOpenChange={setShowComposeSheet}>
        <SheetContent side="bottom" className="h-[90vh] p-0">
          <SheetHeader className="p-4 border-b border-slate-200">
            <SheetTitle>New Message</SheetTitle>
          </SheetHeader>
          <div className="h-[calc(100%-60px)] overflow-y-auto">
            <ComposeMessage
              onSend={handleSendMessage}
              onCancel={() => setShowComposeSheet(false)}
              isLoading={isLoading}
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
