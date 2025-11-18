"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { StudentGuard } from "@/components/auth/role-guard";
import { ModernDashboardLayout, PageContainer } from "@/components/layout/modern-dashboard-layout";
import { useCurrentUser } from "@/hooks/use-current-user";
import { handleLogout } from "@/lib/auth/logout";
import { NotificationBell } from "@/components/student/notification-bell";
import { ClassInformationSection } from "@/components/student/class-information-section";
import { AlertCircle } from "lucide-react";

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
  const [unreadNotifications] = React.useState(0);

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
    teacherName: "Dr. Ahmad Hassan",
    teacherTitle: "Associate Professor of Computer Science",
    teacherEmail: "ahmad.hassan@university.edu",
    officeHours: "Sunday & Tuesday, 10:00 AM - 12:00 PM",
    officeLocation: "Office 305, Engineering Building",
    teacherAvatar: undefined,
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
    // TODO: Open notification panel in future tasks
    console.log("Notification bell clicked");
  };

  const handleContactTeacher = () => {
    // TODO: Navigate to messaging interface with teacher pre-selected
    router.push("/student/messages");
    console.log("Contact teacher clicked - navigating to messages");
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
            unreadCount={unreadNotifications}
            onClick={handleNotificationClick}
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
              teacherName={classData.teacherName}
              teacherTitle={classData.teacherTitle}
              teacherEmail={classData.teacherEmail}
              officeHours={classData.officeHours}
              officeLocation={classData.officeLocation}
              teacherAvatar={classData.teacherAvatar}
              maxAbsences={classData.maxAbsences}
              mahroomThreshold={classData.mahroomThreshold}
              tasdiqThreshold={classData.tasdiqThreshold}
              onContactTeacher={handleContactTeacher}
            />

            {/* Help Note */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 sm:p-5">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm sm:text-base font-semibold text-blue-800 mb-1">
                    Need Help?
                  </h3>
                  <p className="text-xs sm:text-sm text-blue-700">
                    If you have questions about your class, schedule, or attendance policy, 
                    use the "Contact Teacher" button above to send a message directly to your instructor.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </PageContainer>
      </ModernDashboardLayout>
    </StudentGuard>
  );
}
