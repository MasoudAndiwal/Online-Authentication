"use client";

import React, { useState, Suspense, lazy } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { StudentGuard } from "@/components/auth/role-guard";
import { ModernDashboardLayout, PageContainer } from "@/components/layout/modern-dashboard-layout";
import { useCurrentUser } from "@/hooks/use-current-user";
import { handleLogout } from "@/lib/auth/logout";
import {
  useConversations,
  useConversationMessages,
  useSendMessage,
  useMarkMessagesRead,
  useMessageWebSocket,
  useSystemMessages,
  useMarkSystemMessageRead,
  useDismissSystemMessage,
} from "@/hooks/use-student-messages";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Bell3D, Inbox3D } from "@/components/ui/message-3d-icons";
import { SystemMessagesPanel } from "@/components/student/system-messages-panel";

const MessagingInterface = lazy(() => 
  import("@/components/student/messaging-interface").then(mod => ({ default: mod.MessagingInterface }))
);

type ViewMode = "messages" | "system";

export default function StudentMessagesPage() {
  const router = useRouter();
  const { user, loading: userLoading } = useCurrentUser();
  const { toast } = useToast();
  const [activeConversationId, setActiveConversationId] = useState<string>("");
  const [viewMode, setViewMode] = useState<ViewMode>("messages");
  const [pendingRecipient, setPendingRecipient] = useState<{ id: string; type: "teacher" | "office"; name: string } | null>(null);

  const {
    data: conversations = [],
    isLoading: conversationsLoading,
    error: conversationsError,
  } = useConversations();

  const {
    data: messages = [],
    isLoading: messagesLoading,
  } = useConversationMessages(activeConversationId);

  const {
    data: systemMessages = [],
    isLoading: systemMessagesLoading,
  } = useSystemMessages(true);

  const sendMessageMutation = useSendMessage();
  const markReadMutation = useMarkMessagesRead();
  const markSystemReadMutation = useMarkSystemMessageRead();
  const dismissSystemMutation = useDismissSystemMessage();

  const { isConnected } = useMessageWebSocket(user?.id);

  React.useEffect(() => {
    if (activeConversationId) {
      markReadMutation.mutate(activeConversationId);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeConversationId]);

  const handleNavigation = (href: string) => router.push(href);
  const onLogout = async () => { await handleLogout(); router.push("/login"); };
  const handleConversationSelect = (id: string) => {
    setActiveConversationId(id);
    setPendingRecipient(null);
  };

  const handleSendMessage = async (data: { content: string; category: string; attachments: File[]; conversationId?: string }) => {
    // If we have a pending recipient (new conversation), use that
    if (pendingRecipient) {
      try {
        const result = await sendMessageMutation.mutateAsync({
          recipientId: pendingRecipient.id,
          recipientType: pendingRecipient.type,
          content: data.content,
          category: data.category,
          attachments: data.attachments,
        });
        toast({ title: "Message sent", description: `Your message to ${pendingRecipient.name} has been sent` });
        
        // Set the active conversation to the newly created one
        if (result?.message?.conversationId) {
          setActiveConversationId(result.message.conversationId);
        }
        setPendingRecipient(null);
      } catch (err) {
        toast({ title: "Failed to send message", description: err instanceof Error ? err.message : "An error occurred", variant: "destructive" });
      }
      return;
    }

    // Use conversationId from data if provided, otherwise fall back to activeConversationId
    const conversationId = data.conversationId || activeConversationId;
    
    if (!conversationId) {
      toast({ title: "Error", description: "Please select a conversation first", variant: "destructive" });
      return;
    }
    
    const activeConversation = conversations.find(c => c.id === conversationId);
    if (!activeConversation) {
      toast({ title: "Error", description: "Conversation not found", variant: "destructive" });
      return;
    }

    try {
      await sendMessageMutation.mutateAsync({
        conversationId: conversationId,
        recipientId: activeConversation.recipientId || activeConversation.recipientName,
        recipientType: activeConversation.recipientType,
        content: data.content,
        category: data.category,
        attachments: data.attachments,
      });
      toast({ title: "Message sent", description: "Your message has been sent successfully" });
    } catch (err) {
      toast({ title: "Failed to send message", description: err instanceof Error ? err.message : "An error occurred", variant: "destructive" });
    }
  };

  const handleDownloadAttachment = async (attachment: { url: string; filename: string }) => {
    try {
      const response = await fetch(attachment.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = attachment.filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast({ title: "Download started", description: `Downloading ${attachment.filename}` });
    } catch {
      toast({ title: "Download failed", description: "Failed to download attachment", variant: "destructive" });
    }
  };

  const handleStartNewConversation = async (recipientId: string, recipientType: "teacher" | "office", recipientName: string) => {
    // Check if conversation already exists with this recipient
    const existingConversation = conversations.find(
      c => c.recipientId === recipientId || c.recipientName === recipientName
    );
    
    if (existingConversation) {
      // Select existing conversation
      setActiveConversationId(existingConversation.id);
      setPendingRecipient(null);
      toast({ title: "Conversation found", description: `Opening chat with ${recipientName}` });
    } else {
      // For new conversation, clear active conversation and set pending recipient
      setActiveConversationId("");
      setPendingRecipient({ id: recipientId, type: recipientType, name: recipientName });
      toast({ 
        title: "New conversation", 
        description: `Start typing to send your first message to ${recipientName}` 
      });
    }
  };

  const handleMarkSystemAsRead = (id: string) => markSystemReadMutation.mutate(id);
  const handleDismissSystem = (id: string) => dismissSystemMutation.mutate(id);
  const handleSystemAction = (url: string) => router.push(url);

  const unreadSystemCount = systemMessages.filter(m => !m.isRead).length;
  const totalUnreadMessages = conversations.reduce((acc, c) => acc + c.unreadCount, 0);

  if (userLoading) {
    return (
      <StudentGuard>
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50/30 flex items-center justify-center">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
            <Loader2 className="h-10 w-10 text-emerald-600 animate-spin mx-auto mb-4" />
            <p className="text-slate-500">Loading...</p>
          </motion.div>
        </div>
      </StudentGuard>
    );
  }

  return (
    <StudentGuard>
      <ModernDashboardLayout
        user={user || undefined}
        title="Messages"
        subtitle="Communicate with teachers"
        currentPath="/student/student-dashboard/messages"
        onNavigate={handleNavigation}
        onLogout={onLogout}
        hideSearch={true}
      >
        <PageContainer>
          <div className="h-[calc(100vh-200px)] min-h-[600px]">
            <motion.div className="mb-4 flex items-center justify-between" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex items-center gap-2 p-1 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewMode("messages")}
                  className={cn(
                    "rounded-lg px-4 py-2 transition-all duration-300",
                    viewMode === "messages" ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-md" : "text-slate-600 hover:bg-slate-100"
                  )}
                >
                  <Inbox3D size="sm" className="mr-2" animated={false} />
                  Messages
                  {totalUnreadMessages > 0 && (
                    <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className={cn("ml-2 px-2 py-0.5 text-xs font-bold rounded-full", viewMode === "messages" ? "bg-white/20 text-white" : "bg-emerald-100 text-emerald-700")}>
                      {totalUnreadMessages}
                    </motion.span>
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewMode("system")}
                  className={cn(
                    "rounded-lg px-4 py-2 transition-all duration-300",
                    viewMode === "system" ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md" : "text-slate-600 hover:bg-slate-100"
                  )}
                >
                  <Bell3D size="sm" className="mr-2" animated={false} />
                  System
                  {unreadSystemCount > 0 && (
                    <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className={cn("ml-2 px-2 py-0.5 text-xs font-bold rounded-full", viewMode === "system" ? "bg-white/20 text-white" : "bg-amber-100 text-amber-700")}>
                      {unreadSystemCount}
                    </motion.span>
                  )}
                </Button>
              </div>
              {isConnected && (
                <motion.div className="flex items-center gap-2 text-sm text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                  <motion.div className="h-2 w-2 rounded-full bg-emerald-500" animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity }} />
                  <span className="font-medium">Live</span>
                </motion.div>
              )}
            </motion.div>

            <AnimatePresence>
              {conversationsError && (
                <motion.div className="rounded-2xl shadow-lg bg-gradient-to-r from-red-50 to-red-100/50 p-4 mb-4" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                      <Loader2 className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-red-800">Connection Error</div>
                      <div className="text-sm text-red-700">Failed to load messages. Please refresh the page.</div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
              {viewMode === "messages" ? (
                <motion.div key="messages" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="h-full">
                  {conversationsLoading ? (
                    <div className="h-full rounded-2xl shadow-xl bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-xl flex items-center justify-center">
                      <motion.div className="text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <Loader2 className="h-12 w-12 text-emerald-600 animate-spin mx-auto mb-4" />
                        <p className="text-slate-500">Loading conversations...</p>
                      </motion.div>
                    </div>
                  ) : (
                    <Suspense fallback={<div className="h-full rounded-2xl shadow-xl bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-xl flex items-center justify-center"><Loader2 className="h-12 w-12 text-emerald-600 animate-spin" /></div>}>
                      <MessagingInterface
                        conversations={conversations}
                        messages={messages}
                        activeConversationId={activeConversationId}
                        currentUserId={user?.id || ""}
                        onConversationSelect={handleConversationSelect}
                        onSendMessage={handleSendMessage}
                        onDownloadAttachment={handleDownloadAttachment}
                        onStartNewConversation={handleStartNewConversation}
                        pendingRecipient={pendingRecipient}
                        onClearPendingRecipient={() => setPendingRecipient(null)}
                        isLoading={sendMessageMutation.isPending || messagesLoading}
                      />
                    </Suspense>
                  )}
                </motion.div>
              ) : (
                <motion.div key="system" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="h-full">
                  <div className="h-full rounded-2xl shadow-xl bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-xl overflow-hidden">
                    <div className="h-full overflow-y-auto p-6 scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                      {systemMessagesLoading ? (
                        <div className="flex items-center justify-center h-full">
                          <Loader2 className="h-12 w-12 text-amber-600 animate-spin" />
                        </div>
                      ) : (
                        <SystemMessagesPanel
                          messages={systemMessages.map(msg => ({ ...msg, createdAt: new Date(msg.createdAt) }))}
                          onMarkAsRead={handleMarkSystemAsRead}
                          onDismiss={handleDismissSystem}
                          onAction={handleSystemAction}
                          isLoading={markSystemReadMutation.isPending || dismissSystemMutation.isPending}
                        />
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </PageContainer>
      </ModernDashboardLayout>
    </StudentGuard>
  );
}
