"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { StudentGuard } from "@/components/auth/role-guard";
import { ModernDashboardLayout, PageContainer } from "@/components/layout/modern-dashboard-layout";
import { useCurrentUser } from "@/hooks/use-current-user";
import { handleLogout } from "@/lib/auth/logout";
import { NotificationBell } from "@/components/student/notification-bell";
import { NotificationPanel, type Notification } from "@/components/student/notification-panel";
import { ClassInformationSection } from "@/components/student/class-information-section";
import { AlertCircle } from "lucide-react";
import { useSystemMessages, useMarkSystemMessageRead, useDismissSystemMessage } from "@/hooks/use-student-messages";

/**
 * Class Information Page
 * Displays comprehensive class information including:
 * - Class overview with schedule
 * - Teacher information
 * - Attendance policy and thresholds
 * Protected by STUDENT role authentication guard
 */
export default function ClassInfoPage() {
  const router = useRouter();
  const { user, loading: userLoading } = useCurrentUser();
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = React.useState(false);
  
  // Fetch system messages for notifications
  const { data: systemMessages = [] } = useSystemMessages(true);
  const markSystemReadMutation = useMarkSystemMessageRead();
  const dismissSystemMutation = useDismissSystemMessage();
  
  // Convert system messages to notification format
  const notifications: Notification[] = systemMessages.map(msg => ({
    id: msg.id,
    type: msg.severity === 'warning' ? 'warning' : msg.severity === 'error' ? 'warning' : msg.severity === 'success' ? 'success' : 'info',
    title: msg.title,
    message: msg.content,
    timestamp: new Date(msg.createdAt),
    read: msg.isRead,
  }));

  const unreadCount = notifications.filter((n) => !n.read).length;

  // TODO: Fetch actual class data from API
  // For now, using mock data that matches the student's class
  const classData = {
    className: "Computer Science 101",
    classCode: "CS-101",
    semester: 1,
    academicYear: "2024-2025",
    credits: 3,
    room: "Room 204",
    building: "Engineering Building",
    major: "Computer Science",
    studentCount: 45,
    session: "MORNING",
    schedule: [
      {
        day: "Saturday",
        startTime: "08:00 AM",
        endTime: "10:00 AM",
        room: "Room 204",
        sessionType: "lecture" as const
      },
      {
        day: "Monday",
        startTime: "10:00 AM",
        endTime: "12:00 PM",
        room: "Lab 3",
        sessionType: "lab" as const
      },
      {
        day: "Wednesday",
        startTime: "02:00 PM",
        endTime: "04:00 PM",
        room: "Room 204",
        sessionType: "lecture" as const
      }
    ],
    teachers: [
      {
        id: "teacher-1",
        name: "Dr. Ahmad Hassan",
        title: "Associate Professor of Computer Science",
        avatar: undefined,
        sessions: [
          {
            day: "Saturday",
            time: "08:00 AM - 10:00 AM",
            type: "lecture"
          },
          {
            day: "Wednesday",
            time: "02:00 PM - 04:00 PM",
            type: "lecture"
          }
        ]
      },
      {
        id: "teacher-2",
        name: "Prof. Sarah Johnson",
        title: "Senior Lecturer",
        avatar: undefined,
        sessions: [
          {
            day: "Monday",
            time: "10:00 AM - 12:00 PM",
            type: "lab"
          }
        ]
      }
    ],
    maxAbsences: 10,
    mahroomThreshold: 75,
    tasdiqThreshold: 85
  };

  const handleNavigation = (href: string) => {
    router.push(href);
  };

  const onLogout = async () => {
    await handleLogout();
    router.push("/login");
  };

  const handleNotificationClick = () => {
    setIsNotificationPanelOpen(!isNotificationPanelOpen);
  };

  const handleMarkAsRead = (id: string) => {
    markSystemReadMutation.mutate(id);
  };

  const handleMarkAllAsRead = () => {
    notifications.filter(n => !n.read).forEach(n => {
      markSystemReadMutation.mutate(n.id);
    });
  };

  const handleClearAll = () => {
    notifications.forEach(n => {
      dismissSystemMutation.mutate(n.id);
    });
    setIsNotificationPanelOpen(false);
  };

  const handleContactTeacher = (teacherId: string) => {
    router.push(`/student/student-dashboard/messages?teacherId=${teacherId}`);
  };

  if (userLoading) {
    return (
      <StudentGuard>
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50/30 flex items-center justify-center">
          <div className="text-emerald-600">Loading...</div>
        </div>
      </StudentGuard>
    );
  }

  return (
    <StudentGuard>
      <ModernDashboardLayout
        user={user || undefined}
        title="Class Information"
        subtitle="View your class details, schedule, and policies"
        currentPath="/student/class-info"
        onNavigate={handleNavigation}
        onLogout={onLogout}
        hideSearch={true}
        notificationTrigger={
          <NotificationBell
            unreadCount={unreadCount}
            onClick={handleNotificationClick}
            isActive={isNotificationPanelOpen}
          />
        }
      >
        <PageContainer>
          <div className="space-y-6 sm:space-y-8">
            {/* Page Header */}
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-2xl p-6 sm:p-8 border border-emerald-200/50">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-emerald-700 mb-2">
                {classData.className}
              </h1>
              <p className="text-sm sm:text-base text-slate-600">
                Complete information about your enrolled class, including schedule, teacher details, and attendance policies.
              </p>
            </div>

            {/* Class Information Section */}
            <ClassInformationSection
              className={classData.className}
              classCode={classData.classCode}
              semester={classData.semester}
              academicYear={classData.academicYear}
              credits={classData.credits}
              room={classData.room}
              building={classData.building}
              schedule={classData.schedule}
              major={classData.major}
              studentCount={classData.studentCount}
              session={classData.session}
              teachers={classData.teachers}
              maxAbsences={classData.maxAbsences}
              mahroomThreshold={classData.mahroomThreshold}
              tasdiqThreshold={classData.tasdiqThreshold}
              onContactTeacher={handleContactTeacher}
            />

            {/* Help Note */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 border-0 shadow-sm rounded-xl p-4 sm:p-5">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/25">
                  <AlertCircle className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm sm:text-base font-bold text-blue-800 mb-2">
                    Need Help?
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                    If you have questions about your class, schedule, or attendance policy, 
                    use the &quot;Contact Teacher&quot; button above to send a message directly to your instructor.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </PageContainer>
      </ModernDashboardLayout>

      {/* Notification Panel */}
      <NotificationPanel
        isOpen={isNotificationPanelOpen}
        onClose={() => setIsNotificationPanelOpen(false)}
        notifications={notifications}
        onMarkAsRead={handleMarkAsRead}
        onMarkAllAsRead={handleMarkAllAsRead}
        onClearAll={handleClearAll}
        onReply={(notification) => {
          router.push("/student/student-dashboard/messages");
          setIsNotificationPanelOpen(false);
        }}
        onViewAllMessages={() => {
          router.push("/student/student-dashboard/messages");
          setIsNotificationPanelOpen(false);
        }}
      />
    </StudentGuard>
  );
}
