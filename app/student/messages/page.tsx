"use client";

import React, { useState, Suspense, lazy } from "react";
import { useRouter } from "next/navigation";
import { StudentGuard } from "@/components/auth/role-guard";
import { ModernDashboardLayout, PageContainer } from "@/components/layout/modern-dashboard-layout";
import { useCurrentUser } from "@/hooks/use-current-user";
import { handleLogout } from "@/lib/auth/logout";
import {
  useStudentConversations,
  useConversationMessages,
  useSendMessage,
  useMarkMessagesRead,
  useMessageWebSocket,
} from "@/hooks/use-student-messages";
import { AlertCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Lazy load the messaging interface for better initial load
const MessagingInterface = lazy(() => import("@/components/student/messaging-interface").then(mod => ({ default: mod.MessagingInterface })));

/**
 * Student Messages Page
 * 
 * Messaging interface for students to communicate with teachers and office.
 * Features:
 * - Conversation list with search
 * - Message thread with attachments
 * - Compose interface with file upload
 * - Real-time updates via WebSocket
 * - Fully responsive design
 * 
 * Requirements: 13.1, 13.2, 13.3, 13.4, 13.5, 13.6, 13.7, 7.1, 7.2
 */
export default function StudentMessagesPage() {
  const router = useRouter();
  const { user, loading: userLoading } = useCurrentUser();
  const { toast } = useToast();
  const [activeConversationId, setActiveConversationId] = useState<string>("");

  // Fetch conversations
  const {
    data: conversations = [],
    isLoading: conversationsLoading,
    error: conversationsError,
  } = useStudentConversations(user?.id);

  // Fetch messages for active conversation
  const {
    data: messages = [],
    isLoading: messagesLoading,
  } = useConversationMessages(activeConversationId);

  // Send message mutation
  const sendMessageMutation = useSendMessage();

  // Mark messages as read mutation
  const markReadMutation = useMarkMessagesRead();

  // WebSocket connection for real-time updates
  const { isConnected } = useMessageWebSocket(user?.id);

  // Mark messages as read when conversation is selected
  React.useEffect(() => {
    if (activeConversationId) {
      markReadMutation.mutate(activeConversationId);
    }
  }, [activeConversationId]);

  const handleNavigation = (href: string) => {
    router.push(href);
  };

  const onLogout = async () => {
    await handleLogout();
    router.push("/login");
  };

  const handleConversationSelect = (id: string) => {
    setActiveConversationId(id);
  };

  const handleSendMessage = async (data: { content: string; category: string; attachments: File[] }) => {
    if (!activeConversationId) {
      toast({
        title: "Error",
        description: "Please select a conversation first",
        variant: "destructive",
      });
      return;
    }

    const activeConversation = conversations.find(c => c.id === activeConversationId);
    if (!activeConversation) return;

    try {
      await sendMessageMutation.mutateAsync({
        conversationId: activeConversationId,
        recipientId: activeConversation.recipientName, // This should be recipientId from backend
        recipientType: activeConversation.recipientType,
        content: data.content,
        category: data.category,
        attachments: data.attachments,
      });

      toast({
        title: "Message sent",
        description: "Your message has been sent successfully",
      });
    } catch (error) {
      toast({
        title: "Failed to send message",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    }
  };

  const handleDownloadAttachment = async (attachment: any) => {
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
        description: `Downloading ${attachment.filename}`,
      });
    } catch (error) {
      toast({
        title: "Download failed",
        description: "Failed to download attachment",
        variant: "destructive",
      });
    }
  };

  if (userLoading) {
    return (
      <StudentGuard>
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50/30 flex items-center justify-center">
          <Loader2 className="h-8 w-8 text-emerald-600 animate-spin" />
        </div>
      </StudentGuard>
    );
  }

  return (
    <StudentGuard>
      <ModernDashboardLayout
        user={user || undefined}
        title="Messages"
        subtitle="Communicate with teachers and office"
        currentPath="/student/messages"
        onNavigate={handleNavigation}
        onLogout={onLogout}
        hideSearch={true}
      >
        <PageContainer>
          <div className="h-[calc(100vh-200px)] min-h-[600px]">
            {/* WebSocket Status Indicator */}
            {isConnected && (
              <div className="mb-4 flex items-center gap-2 text-sm text-emerald-600">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Connected - Real-time updates enabled</span>
              </div>
            )}

            {/* Error State */}
            {conversationsError && (
              <div className="rounded-2xl shadow-xl bg-red-50 border-2 border-red-200 p-4 mb-4">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <div>
                    <div className="font-semibold text-red-800">Error</div>
                    <div className="text-sm text-red-700">
                      Failed to load conversations. Please try refreshing the page.
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Loading State */}
            {conversationsLoading ? (
              <div className="h-full rounded-2xl shadow-xl bg-white/80 backdrop-blur-xl border-0 flex items-center justify-center">
                <div className="text-center">
                  <Loader2 className="h-12 w-12 text-emerald-600 animate-spin mx-auto mb-4" />
                  <p className="text-slate-500">Loading conversations...</p>
                </div>
              </div>
            ) : (
              <Suspense fallback={
                <div className="h-full rounded-2xl shadow-xl bg-white/80 backdrop-blur-xl border-0 flex items-center justify-center">
                  <div className="text-center">
                    <Loader2 className="h-12 w-12 text-emerald-600 animate-spin mx-auto mb-4" />
                    <p className="text-slate-500">Loading messaging interface...</p>
                  </div>
                </div>
              }>
                <MessagingInterface
                  conversations={conversations}
                  messages={messages}
                  activeConversationId={activeConversationId}
                  currentUserId={user?.id || ""}
                  onConversationSelect={handleConversationSelect}
                  onSendMessage={handleSendMessage}
                  onDownloadAttachment={handleDownloadAttachment}
                  isLoading={sendMessageMutation.isPending || messagesLoading}
                />
              </Suspense>
            )}
          </div>
        </PageContainer>
      </ModernDashboardLayout>
    </StudentGuard>
  );
}
