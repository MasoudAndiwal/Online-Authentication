"use client";

import React, { useState, Suspense, lazy } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ModernDashboardLayout, PageContainer } from "@/components/layout/modern-dashboard-layout";
import { useCurrentUser } from "@/hooks/use-current-user";
import { handleLogout } from "@/lib/auth/logout";
import {
  useConversations,
  useConversationMessages,
  useSendMessage,
  useMarkMessagesRead,
  useMessageWebSocket,
} from "@/hooks/use-student-messages";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Users, History } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Inbox3D, Bell3D } from "@/components/ui/message-3d-icons";

const TeacherMessagingInterface = lazy(() => 
  import("@/components/teacher/teacher-messaging-interface").then(mod => ({ default: mod.TeacherMessagingInterface }))
);

const BroadcastDialog = lazy(() =>
  import("@/components/teacher/broadcast-dialog").then(mod => ({ default: mod.BroadcastDialog }))
);

const BroadcastHistory = lazy(() =>
  import("@/components/teacher/broadcast-history").then(mod => ({ default: mod.BroadcastHistory }))
);

type ViewMode = "messages" | "broadcasts";
type MessageTab = "all" | "unread" | "students" | "office";

export default function TeacherMessagesPage() {
  const router = useRouter();
  const { user, loading: userLoading } = useCurrentUser();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeConversationId, setActiveConversationId] = useState<string>("");
  const [viewMode, setViewMode] = useState<ViewMode>("messages");
  const [activeTab, setActiveTab] = useState<MessageTab>("all");
  const [showBroadcastDialog, setShowBroadcastDialog] = useState(false);
  const [pendingRecipient, setPendingRecipient] = useState<{ 
    id: string; 
    type: "student" | "office"; 
    name: string;
  } | null>(null);

  const {
    data: conversations = [],
    isLoading: conversationsLoading,
    error: conversationsError,
  } = useConversations();

  const {
    data: messages = [],
    isLoading: messagesLoading,
  } = useConversationMessages(activeConversationId);

  const sendMessageMutation = useSendMessage();
  const markReadMutation = useMarkMessagesRead();

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

  const handleSendMessage = async (data: { 
    content: string; 
    category: string; 
    attachments: File[]; 
    conversationId?: string;
    isUrgent?: boolean;
  }) => {
    if (pendingRecipient) {
      try {
        const result = await sendMessageMutation.mutateAsync({
          recipientId: pendingRecipient.id,
          recipientType: pendingRecipient.type,
          content: data.content,
          category: data.category,
          attachments: data.attachments,
        });
        toast({ 
          title: "Message sent", 
          description: `Your message to ${pendingRecipient.name} has been sent` 
        });
        
        if (result?.message?.conversationId) {
          setActiveConversationId(result.message.conversationId);
        }
        setPendingRecipient(null);
      } catch (err) {
        toast({ 
          title: "Failed to send message", 
          description: err instanceof Error ? err.message : "An error occurred", 
          variant: "destructive" 
        });
      }
      return;
    }

    const conversationId = data.conversationId || activeConversationId;
    
    if (!conversationId) {
      toast({ 
        title: "Error", 
        description: "Please select a conversation first", 
        variant: "destructive" 
      });
      return;
    }
    
    const activeConversation = conversations.find(c => c.id === conversationId);
    if (!activeConversation) {
      toast({ 
        title: "Error", 
        description: "Conversation not found", 
        variant: "destructive" 
      });
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
      toast({ 
        title: "Message sent", 
        description: "Your message has been sent successfully" 
      });
    } catch (err) {
      toast({ 
        title: "Failed to send message", 
        description: err instanceof Error ? err.message : "An error occurred", 
        variant: "destructive" 
      });
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
      toast({ 
        title: "Download started", 
        description: `Downloading ${attachment.filename}` 
      });
    } catch {
      toast({ 
        title: "Download failed", 
        description: "Failed to download attachment", 
        variant: "destructive" 
      });
    }
  };

  const handleStartNewConversation = async (
    recipientId: string, 
    recipientType: "student" | "office", 
    recipientName: string
  ) => {
    const existingConversation = conversations.find(
      c => c.recipientId === recipientId || c.recipientName === recipientName
    );
    
    if (existingConversation) {
      setActiveConversationId(existingConversation.id);
      setPendingRecipient(null);
      toast({ 
        title: "Conversation found", 
        description: `Opening chat with ${recipientName}` 
      });
    } else {
      setActiveConversationId("");
      setPendingRecipient({ id: recipientId, type: recipientType, name: recipientName });
      toast({ 
        title: "New conversation", 
        description: `Start typing to send your first message to ${recipientName}` 
      });
    }
  };

  const handleBroadcast = async (data: {
    classId: string;
    className: string;
    content: string;
    category: string;
    attachments?: File[];
  }) => {
    try {
      const formData = new FormData();
      formData.append("classId", data.classId);
      formData.append("content", data.content);
      formData.append("category", data.category);
      
      // Add attachments if present
      if (data.attachments && data.attachments.length > 0) {
        data.attachments.forEach((file) => {
          formData.append("attachments", file);
        });
      }

      const response = await fetch("/api/messages/broadcast", {
        method: "POST",
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error("Failed to send broadcast");
      }

      const result = await response.json();
      
      toast({
        title: "Broadcast sent successfully",
        description: `Message delivered to ${result.deliveredCount} of ${result.totalRecipients} students`,
      });
      
      setShowBroadcastDialog(false);
      
      // Invalidate broadcast history to refresh the list
      queryClient.invalidateQueries({ queryKey: ["broadcast-history"] });
    } catch (err) {
      toast({
        title: "Broadcast failed",
        description: err instanceof Error ? err.message : "An error occurred",
        variant: "destructive",
      });
    }
  };

  // Filter conversations based on active tab
  const filteredConversations = React.useMemo(() => {
    let filtered = conversations;

    if (activeTab === "unread") {
      filtered = filtered.filter(c => c.unreadCount > 0);
    } else if (activeTab === "students") {
      filtered = filtered.filter(c => c.recipientType === "teacher");
    } else if (activeTab === "office") {
      filtered = filtered.filter(c => c.recipientType === "office");
    }

    return filtered;
  }, [conversations, activeTab]);

  const totalUnreadMessages = conversations.reduce((acc, c) => acc + c.unreadCount, 0);
  const unreadStudentMessages = conversations.filter(c => c.recipientType !== "office").reduce((acc, c) => acc + c.unreadCount, 0);
  const unreadOfficeMessages = conversations.filter(c => c.recipientType === "office").reduce((acc, c) => acc + c.unreadCount, 0);

  if (userLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50/30 flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }} 
          animate={{ opacity: 1, scale: 1 }} 
          className="text-center"
        >
          <Loader2 className="h-10 w-10 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-500">Loading...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <ModernDashboardLayout
      user={user || undefined}
      title="Messages"
      subtitle="Communicate with students and office"
      currentPath="/teacher/dashboard/messages"
      onNavigate={handleNavigation}
      onLogout={onLogout}
      hideSearch={true}
    >
      <PageContainer>
        <div className="h-[calc(100vh-200px)] min-h-[600px]">
          {/* Header with View Mode Toggle and Actions */}
          <motion.div 
            className="mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4" 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }}
          >
            {/* View Mode Toggle */}
            <div className="flex items-center gap-2 p-1 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode("messages")}
                className={cn(
                  "rounded-lg px-4 py-2 transition-all duration-300",
                  viewMode === "messages" 
                    ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md" 
                    : "text-slate-600 hover:bg-slate-100"
                )}
              >
                <Inbox3D size="sm" className="mr-2" animated={false} />
                Messages
                {totalUnreadMessages > 0 && (
                  <motion.span 
                    initial={{ scale: 0 }} 
                    animate={{ scale: 1 }} 
                    className={cn(
                      "ml-2 px-2 py-0.5 text-xs font-bold rounded-full",
                      viewMode === "messages" 
                        ? "bg-white/20 text-white" 
                        : "bg-blue-100 text-blue-700"
                    )}
                  >
                    {totalUnreadMessages}
                  </motion.span>
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode("broadcasts")}
                className={cn(
                  "rounded-lg px-4 py-2 transition-all duration-300",
                  viewMode === "broadcasts" 
                    ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md" 
                    : "text-slate-600 hover:bg-slate-100"
                )}
              >
                <History className="h-4 w-4 mr-2" />
                Broadcast History
              </Button>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              {isConnected && (
                <motion.div 
                  className="flex items-center gap-2 text-sm text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full" 
                  initial={{ opacity: 0, x: 20 }} 
                  animate={{ opacity: 1, x: 0 }}
                >
                  <motion.div 
                    className="h-2 w-2 rounded-full bg-emerald-500" 
                    animate={{ scale: [1, 1.2, 1] }} 
                    transition={{ duration: 2, repeat: Infinity }} 
                  />
                  <span className="font-medium">Live</span>
                </motion.div>
              )}
              
              {viewMode === "messages" && (
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    onClick={() => setShowBroadcastDialog(true)}
                    className={cn(
                      "rounded-xl px-4 py-2 shadow-lg",
                      "bg-gradient-to-r from-orange-500 to-orange-600",
                      "hover:from-orange-600 hover:to-orange-700",
                      "text-white font-semibold",
                      "transition-all duration-300"
                    )}
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Broadcast to Class
                  </Button>
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Tab Navigation (only in messages view) */}
          {viewMode === "messages" && (
            <motion.div 
              className="mb-4 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveTab("all")}
                className={cn(
                  "rounded-lg px-4 py-2 whitespace-nowrap transition-all duration-300",
                  activeTab === "all"
                    ? "bg-gradient-to-r from-slate-100 to-slate-200 text-slate-800 shadow-sm"
                    : "text-slate-600 hover:bg-slate-50"
                )}
              >
                All Messages
                <span className="ml-2 text-xs opacity-70">({conversations.length})</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveTab("unread")}
                className={cn(
                  "rounded-lg px-4 py-2 whitespace-nowrap transition-all duration-300",
                  activeTab === "unread"
                    ? "bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 shadow-sm"
                    : "text-slate-600 hover:bg-slate-50"
                )}
              >
                <Bell3D size="sm" className="mr-1.5" animated={false} />
                Unread
                {totalUnreadMessages > 0 && (
                  <span className="ml-2 px-2 py-0.5 text-xs font-bold rounded-full bg-blue-500 text-white">
                    {totalUnreadMessages}
                  </span>
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveTab("students")}
                className={cn(
                  "rounded-lg px-4 py-2 whitespace-nowrap transition-all duration-300",
                  activeTab === "students"
                    ? "bg-gradient-to-r from-emerald-100 to-emerald-200 text-emerald-800 shadow-sm"
                    : "text-slate-600 hover:bg-slate-50"
                )}
              >
                Students
                {unreadStudentMessages > 0 && (
                  <span className="ml-2 px-2 py-0.5 text-xs font-bold rounded-full bg-emerald-500 text-white">
                    {unreadStudentMessages}
                  </span>
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveTab("office")}
                className={cn(
                  "rounded-lg px-4 py-2 whitespace-nowrap transition-all duration-300",
                  activeTab === "office"
                    ? "bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 shadow-sm"
                    : "text-slate-600 hover:bg-slate-50"
                )}
              >
                Office
                {unreadOfficeMessages > 0 && (
                  <span className="ml-2 px-2 py-0.5 text-xs font-bold rounded-full bg-purple-500 text-white">
                    {unreadOfficeMessages}
                  </span>
                )}
              </Button>
            </motion.div>
          )}

          {/* Error Display */}
          <AnimatePresence>
            {conversationsError && (
              <motion.div 
                className="rounded-2xl shadow-lg bg-gradient-to-r from-red-50 to-red-100/50 p-4 mb-4" 
                initial={{ opacity: 0, y: -10 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -10 }}
              >
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

          {/* Main Content */}
          <AnimatePresence mode="wait">
            {viewMode === "messages" ? (
              <motion.div 
                key="messages" 
                initial={{ opacity: 0, x: -20 }} 
                animate={{ opacity: 1, x: 0 }} 
                exit={{ opacity: 0, x: -20 }} 
                className="h-full"
              >
                {conversationsLoading ? (
                  <div className="h-full rounded-2xl shadow-xl bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-xl flex items-center justify-center">
                    <motion.div className="text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
                      <p className="text-slate-500">Loading conversations...</p>
                    </motion.div>
                  </div>
                ) : (
                  <Suspense 
                    fallback={
                      <div className="h-full rounded-2xl shadow-xl bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-xl flex items-center justify-center">
                        <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
                      </div>
                    }
                  >
                    <TeacherMessagingInterface
                      conversations={filteredConversations}
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
              <motion.div 
                key="broadcasts" 
                initial={{ opacity: 0, x: 20 }} 
                animate={{ opacity: 1, x: 0 }} 
                exit={{ opacity: 0, x: 20 }} 
                className="h-full"
              >
                <div className="h-full rounded-2xl shadow-xl bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-xl overflow-hidden">
                  <Suspense 
                    fallback={
                      <div className="flex items-center justify-center h-full">
                        <Loader2 className="h-12 w-12 text-orange-600 animate-spin" />
                      </div>
                    }
                  >
                    <BroadcastHistory teacherId={user?.id || ""} />
                  </Suspense>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </PageContainer>

      {/* Broadcast Dialog */}
      <Suspense fallback={null}>
        <BroadcastDialog
          open={showBroadcastDialog}
          onOpenChange={setShowBroadcastDialog}
          onSend={handleBroadcast}
          teacherId={user?.id || ""}
        />
      </Suspense>
    </ModernDashboardLayout>
  );
}
