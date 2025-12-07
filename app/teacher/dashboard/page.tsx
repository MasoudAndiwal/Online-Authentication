"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {ModernDashboardLayout,PageContainer,
} from "@/components/layout/modern-dashboard-layout";
import { handleLogout } from "@/lib/auth/logout";
import { useAuth } from "@/hooks/use-auth";
import { AuthLoadingScreen } from "@/components/ui/auth-loading";
import {ModernCard,ModernCardHeader,ModernCardTitle,ModernCardContent,
} from "@/components/ui/modern-card";
import { EnhancedMetricCard } from "@/components/ui/enhanced-metric-card";
import { Modern3DIcons } from "@/components/ui/modern-3d-icons";

import {BookOpen,Sparkles,
} from "lucide-react";
import { motion } from "framer-motion";
import { useTeacherDashboardMetrics, useTeacherClasses, useTeacherNotifications } from "@/lib/hooks/use-teacher-dashboard";
import { TeacherClassGrid } from "@/components/classes/teacher-class-grid";
import { SkipLinks } from "@/components/ui/skip-link";
import { useScreenReaderAnnouncements } from "@/lib/hooks/use-screen-reader-announcements";
import { NotificationCenter, NotificationTrigger, NotificationSettings } from "@/components/teacher";
import { useNotifications } from "@/lib/hooks/use-notifications";
import { useResponsive } from "@/lib/hooks/use-responsive";
import { useHapticFeedback, useTouchGestures } from "@/lib/hooks/use-touch-gestures";

import { toast } from "sonner";

export default function TeacherDashboardPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth({ requiredRole: 'TEACHER' });
  const [currentPath, setCurrentPath] = React.useState("/teacher/dashboard");
  const [hasShownWelcome, setHasShownWelcome] = React.useState(false);
  const { announce } = useScreenReaderAnnouncements();
  
  // Responsive and touch support
  const { isMobile, isTouch } = useResponsive();
  const { lightTap } = useHapticFeedback();
  

  
  // Notification settings state
  const [showNotificationSettings, setShowNotificationSettings] = React.useState(false);
  
  // Touch gesture handlers for mobile navigation (must be called unconditionally)
  const touchGestures = useTouchGestures({
    onSwipeRight: () => {
      if (isMobile) {
        // Could open sidebar or navigate back
        announce('Swipe right detected');
      }
    },
    onSwipeLeft: () => {
      if (isMobile) {
        // Could close sidebar or navigate forward
        announce('Swipe left detected');
      }
    },
    enabled: isMobile && isTouch,
  });
  
  // Notification state using custom hook
  const [isNotificationOpen, setIsNotificationOpen] = React.useState(false);
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification
  } = useNotifications();

  // Initialize dashboard data with React Query
  const metricsQuery = useTeacherDashboardMetrics();
  const classesQuery = useTeacherClasses();
  const notificationsQuery = useTeacherNotifications();
  
  // Get data directly from React Query (primary source)
  const metrics = metricsQuery.data || null;
  const classes = classesQuery.data || [];
  
  // Loading and error states
  const loadingMetrics = metricsQuery.isLoading || classesQuery.isLoading || notificationsQuery.isLoading;
  const classesError = metricsQuery.error || classesQuery.error || notificationsQuery.error;
  


  // Show welcome toast and handle errors
  React.useEffect(() => {
    if (!isLoading && user) {
      // Show welcome toast only once per session
      const welcomeShown = sessionStorage.getItem('teacherWelcomeToastShown');
      if (!welcomeShown && !hasShownWelcome) {
        const userName = user.firstName || 'there';
        const greeting = getGreeting();
        
        setTimeout(() => {
          toast.success(`${greeting}, ${userName}! `, {
            description: 'Welcome to your teacher dashboard. Ready to manage your classes!',
            duration: 4000,
          });
          setHasShownWelcome(true);
          sessionStorage.setItem('teacherWelcomeToastShown', 'true');
        }, 500);
      }
    }
  }, [isLoading, user, hasShownWelcome]);

  // Handle dashboard errors
  React.useEffect(() => {
    if (classesError) {
      toast.error('Failed to load dashboard data', {
        description: 'Please refresh the page to try again.'
      });
    }
  }, [classesError]);

  // Use authenticated user data
  const displayUser = user ? {
    name: `${user.firstName} ${user.lastName}`,
    email: user.email || '',
    role: user.role,
    avatar: undefined,
  } : {
    name: "Teacher",
    email: "",
    role: "TEACHER" as const,
    avatar: undefined,
  };

  // Show loading state while checking authentication
  if (isLoading) {
    return <AuthLoadingScreen />;
  }

  const handleNavigation = (href: string) => {
    setCurrentPath(href);
    router.push(href);
  };

  const handleLogoutClick = async () => {
    await handleLogout();
  };

  const handleSearch = (_query: string) => {
    // Search functionality
  };

  // Get appropriate greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  // Get dynamic welcome message
  const getWelcomeMessage = () => {
    if (!user) return 'Welcome back! ';
    const firstName = user.firstName || 'there';
    return `Welcome back, ${firstName}! `;
  };

  // Class action handlers with proper navigation
  const handleMarkAttendance = (classId?: string) => {
    if (isTouch) {
      lightTap();
    }
    if (classId) {
      router.push(`/teacher/dashboard/attendance?classId=${classId}`);
    } else {
      router.push('/teacher/dashboard/attendance');
    }
  };

  const handleViewClassDetails = (classId: string) => {
    if (isTouch) {
      lightTap();
    }
    router.push(`/teacher/dashboard/${classId}`);
  };

  const handleViewStudents = (classId: string) => {
    if (isTouch) {
      lightTap();
    }
    // Navigate to class details page which has student view functionality
    router.push(`/teacher/dashboard/${classId}?tab=students`);
  };

  const handleViewReports = (classId?: string) => {
    if (isTouch) {
      lightTap();
    }
    if (classId) {
      // Navigate to class details page with reports tab
      router.push(`/teacher/dashboard/${classId}?tab=reports`);
    } else {
      // Navigate to general reports page (student progress)
      router.push('/teacher/dashboard/student-progress');
    }
  };

  const handleViewSchedule = (classId: string) => {
    if (isTouch) {
      lightTap();
    }
    // Navigate to class details page with schedule tab
    router.push(`/teacher/dashboard/${classId}?tab=schedule`);
  };

  const handleManageClass = (classId: string) => {
    if (isTouch) {
      lightTap();
    }
    // Navigate to class details page with management tab
    router.push(`/teacher/dashboard/${classId}?tab=manage`);
  };



  return (
    <>
      {/* Skip Links for Keyboard Navigation */}
      <SkipLinks
        links={[
          { href: '#main-content', label: 'Skip to main content' },
          { href: '#metrics', label: 'Skip to metrics' },
          { href: '#my-classes', label: 'Skip to my classes' },
        ]}
      />
      
      <ModernDashboardLayout
        user={displayUser}
        title="Teacher Dashboard"
        subtitle="University Attendance Management System"
        currentPath={currentPath}
        onNavigate={handleNavigation}
        onLogout={handleLogoutClick}
        onSearch={handleSearch}
        notificationTrigger={
          <NotificationTrigger
            unreadCount={unreadCount}
            onClick={() => {
              setIsNotificationOpen(true);
              announce(`Opening notifications. You have ${unreadCount} unread notifications.`);
            }}
          />
        }
      >
        {/* Notification Center */}
        <NotificationCenter
          isOpen={isNotificationOpen}
          onClose={() => setIsNotificationOpen(false)}
          notifications={notifications}
          onMarkAsRead={markAsRead}
          onMarkAllAsRead={markAllAsRead}
          onDelete={deleteNotification}
          onOpenSettings={() => {
            setShowNotificationSettings(true);
            announce('Opening notification settings');
          }}
        />
        
        {/* Notification Settings */}
        <NotificationSettings
          isOpen={showNotificationSettings}
          onClose={() => setShowNotificationSettings(false)}
          preferences={{
            studentRiskAlerts: true,
            systemUpdates: true,
            scheduleChanges: true,
            inAppNotifications: true,
            emailNotifications: false,
            enableDigest: true,
            digestFrequency: 'daily',
            digestTime: '08:00',
            quietHours: {
              enabled: false,
              startTime: '22:00',
              endTime: '07:00'
            },
            notifyOnMahroom: true,
            notifyOnTasdiq: true,
            notifyOnAbsenceCount: true,
            absenceCountThreshold: 3
          }}
          onSave={(_preferences) => {
            setShowNotificationSettings(false);
            announce('Notification settings saved');
          }}
        />
        
        <PageContainer>
          <div id="main-content" role="main" aria-label="Teacher dashboard main content">
        {/* Ultra Modern Welcome Section with Orange Theme - Mobile Optimized */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
          className="relative mb-6 sm:mb-8 lg:mb-12 overflow-hidden rounded-2xl sm:rounded-3xl"
          {...(isMobile && isTouch ? touchGestures : {})}
        >
          {/* Beautiful Background Gradient - Blue Theme */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-purple-600/5 to-emerald-600/10" />

          {/* Floating Animated Elements - Blue Theme (hidden on mobile for performance) */}
          {!isMobile && (
            <>
              <div className="absolute top-4 right-8 w-20 h-20 bg-blue-400/20 rounded-full blur-xl animate-pulse" />
              <div className="absolute bottom-4 left-8 w-16 h-16 bg-purple-500/20 rounded-full blur-lg animate-pulse delay-1000" />
              <div className="absolute top-1/2 right-1/4 w-12 h-12 bg-emerald-300/15 rounded-full blur-md animate-pulse delay-500" />
            </>
          )}

          <div className="relative p-4 sm:p-6 lg:p-12">
            <div className="flex flex-col gap-4 sm:gap-6">
              <div className="space-y-2 sm:space-y-3 lg:space-y-4">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  className="flex items-start gap-3 sm:gap-4"
                >
                  <motion.div
                    className="p-2.5 sm:p-3 lg:p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl sm:rounded-2xl lg:rounded-3xl shadow-xl shadow-blue-500/25 flex-shrink-0"
                    whileHover={!isMobile ? { scale: 1.05, rotate: 5 } : {}}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  >
                    <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-white" />
                  </motion.div>
                  <div className="flex-1 min-w-0">
                    <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-5xl font-bold text-slate-900 tracking-tight leading-tight">
                      {getWelcomeMessage()}
                    </h1>
                    <p className="text-xs sm:text-sm md:text-base lg:text-xl text-slate-600 font-medium mt-1 sm:mt-2">
                      Ready to manage your classes and track student progress
                    </p>
                  </div>
                </motion.div>
              </div>


            </div>
          </div>
        </motion.div>

        {/* Enhanced Metrics Cards - Teacher Dashboard - Mobile Optimized */}
        <div id="metrics" role="region" aria-label="Dashboard metrics" className="mb-6 sm:mb-8 lg:mb-12">
        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          <EnhancedMetricCard
            title="Today's Classes"
            value={loadingMetrics ? '...' : metrics?.totalClasses || 0}
            icon={<Modern3DIcons.Calendar3D size={isMobile ? "md" : "lg"} variant="primary" />}
            trend=""
            trendLabel="scheduled today"
            color="blue"
            className="border-0 shadow-lg sm:shadow-2xl shadow-blue-500/10 bg-gradient-to-br from-blue-50 to-blue-100/50 backdrop-blur-xl touch-manipulation"
            animateValue={!loadingMetrics}
            delay={0}
          />
          <EnhancedMetricCard
            title="Class Students"
            value={loadingMetrics ? '...' : metrics?.totalStudents || 0}
            icon={<Modern3DIcons.Users3D size={isMobile ? "md" : "lg"} variant="success" />}
            trend=""
            trendLabel="in your classes"
            color="emerald"
            className="border-0 shadow-lg sm:shadow-2xl shadow-emerald-500/10 bg-gradient-to-br from-emerald-50 to-emerald-100/50 backdrop-blur-xl touch-manipulation"
            animateValue={!loadingMetrics}
            delay={0.2}
          />
          <EnhancedMetricCard
            title="Pending Attendance"
            value={loadingMetrics ? '...' : metrics?.totalClasses || 0}
            icon={<Modern3DIcons.Clipboard3D size={isMobile ? "md" : "lg"} variant="warning" />}
            trend=""
            trendLabel="not marked yet"
            color="orange"
            className="border-0 shadow-lg sm:shadow-2xl shadow-orange-500/10 bg-gradient-to-br from-orange-50 to-orange-100/50 backdrop-blur-xl touch-manipulation"
            animateValue={!loadingMetrics}
            delay={0.4}
          />
          <EnhancedMetricCard
            title="Next Class"
            value={loadingMetrics ? '...' : classes[0]?.name || 'No class'}
            icon={<Modern3DIcons.Chart3D size={isMobile ? "md" : "lg"} variant="primary" />}
            trend=""
            trendLabel={classes[0]?.session === 'MORNING' ? 'Morning session' : classes[0]?.session === 'AFTERNOON' ? 'Afternoon session' : 'upcoming'}
            color="purple"
            className="border-0 shadow-lg sm:shadow-2xl shadow-purple-500/10 bg-gradient-to-br from-purple-50 to-purple-100/50 backdrop-blur-xl touch-manipulation"
            animateValue={false}
            delay={0.6}
          />
        </div>
        </div>

        {/* My Classes Section - Mobile Optimized */}
        <div id="my-classes" role="region" aria-label="My classes section">
        <ModernCard
          variant="glass"
          className="border-0 shadow-lg sm:shadow-2xl shadow-blue-200/20 bg-gradient-to-br from-blue-50 to-purple-100/50 backdrop-blur-xl"
        >
          <ModernCardHeader className="p-4 sm:p-6">
            <ModernCardTitle
              icon={<BookOpen className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7 text-blue-500" />}
              className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold"
            >
              My Classes
            </ModernCardTitle>
          </ModernCardHeader>
          <ModernCardContent className="p-4 sm:p-6">
            <TeacherClassGrid
              classes={classes}
              isLoading={loadingMetrics}
              error={classesError instanceof Error ? classesError.message : classesError}
              onMarkAttendance={handleMarkAttendance}
              onViewDetails={handleViewClassDetails}
              onViewStudents={handleViewStudents}
              onViewReports={handleViewReports}
              onViewSchedule={handleViewSchedule}
              onManageClass={handleManageClass}
            />
          </ModernCardContent>
        </ModernCard>
        </div>
          </div>
      </PageContainer>
    </ModernDashboardLayout>
    </>
  );
}