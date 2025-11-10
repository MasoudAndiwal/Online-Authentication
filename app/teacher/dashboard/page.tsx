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
import { Button } from "@/components/ui/button";
import {Users,BookOpen,CheckCircle,Plus,BarChart3,Sparkles,
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
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { toast } from "sonner";

export default function TeacherDashboardPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth({ requiredRole: 'TEACHER' });
  const [currentPath, setCurrentPath] = React.useState("/teacher/dashboard");
  const [hasShownWelcome, setHasShownWelcome] = React.useState(false);
  const { announce } = useScreenReaderAnnouncements();
  
  // Responsive and touch support
  const { isMobile, isTouch } = useResponsive();
  const { lightTap, success: successHaptic } = useHapticFeedback();
  
  // Mobile quick actions bottom sheet
  const [showQuickActions, setShowQuickActions] = React.useState(false);
  
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
  
  console.log('Dashboard - classes from query:', classes);
  console.log('Dashboard - classes length:', classes?.length);
  console.log('Dashboard - isLoading:', loadingMetrics);

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

  const handleSearch = (query: string) => {
    console.log("Search:", query);
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

  const handleStudentProgress = () => {
    toast.info('Student Progress feature coming soon!');
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
          { href: '#quick-actions', label: 'Skip to quick actions' },
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
          onSave={(preferences) => {
            console.log('Saving notification preferences:', preferences);
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

              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4"
              >
                <motion.div
                  whileHover={!isMobile ? { scale: 1.05 } : {}}
                  whileTap={{ scale: 0.95 }}
                  className="flex-1 sm:flex-none"
                >
                  <Button
                    size={isMobile ? "default" : "lg"}
                    onClick={() => {
                      handleMarkAttendance();
                      announce('Navigating to attendance marking interface');
                      if (isTouch) successHaptic();
                    }}
                    className="w-full sm:w-auto min-h-[44px] bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-xl shadow-blue-500/25 rounded-xl sm:rounded-2xl px-5 sm:px-6 lg:px-10 py-3 sm:py-4 lg:py-5 text-sm sm:text-base lg:text-lg font-semibold transition-all duration-300 border-0 touch-manipulation"
                    aria-label="Mark attendance for your classes"
                  >
                    <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 mr-2 sm:mr-3" aria-hidden="true" />
                    Mark Attendance
                  </Button>
                </motion.div>
                <motion.div
                  whileHover={!isMobile ? { scale: 1.05 } : {}}
                  whileTap={{ scale: 0.95 }}
                  className="flex-1 sm:flex-none"
                >
                  <Button
                    variant="outline"
                    size={isMobile ? "default" : "lg"}
                    onClick={() => {
                      handleViewReports();
                      announce('Opening reports and analytics');
                      if (isTouch) lightTap();
                    }}
                    className="w-full sm:w-auto min-h-[44px] border-0 bg-white/60 backdrop-blur-sm hover:bg-white/80 shadow-lg hover:shadow-xl rounded-xl sm:rounded-2xl px-5 sm:px-6 lg:px-10 py-3 sm:py-4 lg:py-5 text-sm sm:text-base lg:text-lg font-semibold transition-all duration-300 touch-manipulation"
                    aria-label="View attendance reports and analytics"
                  >
                    <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 mr-2 sm:mr-3" aria-hidden="true" />
                    <span className="hidden sm:inline">View Reports</span>
                    <span className="sm:hidden">Reports</span>
                  </Button>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Enhanced Metrics Cards with Count-up Animations - Orange Theme - Mobile Optimized */}
        <div id="metrics" role="region" aria-label="Dashboard metrics" className="mb-6 sm:mb-8 lg:mb-12">
        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          <EnhancedMetricCard
            title="Total Students"
            value={loadingMetrics ? '...' : metrics?.totalStudents || 0}
            icon={<Modern3DIcons.Users3D size={isMobile ? "md" : "lg"} variant="primary" />}
            trend="+12"
            trendLabel="vs last month"
            color="blue"
            className="border-0 shadow-lg sm:shadow-2xl shadow-blue-500/10 bg-gradient-to-br from-blue-50 to-blue-100/50 backdrop-blur-xl touch-manipulation"
            animateValue={!loadingMetrics}
            delay={0}
          />
          <EnhancedMetricCard
            title="Active Classes"
            value={loadingMetrics ? '...' : metrics?.totalClasses || 0}
            icon={<Modern3DIcons.Calendar3D size={isMobile ? "md" : "lg"} variant="success" />}
            trend="+2"
            trendLabel="new this term"
            color="emerald"
            className="border-0 shadow-lg sm:shadow-2xl shadow-emerald-500/10 bg-gradient-to-br from-emerald-50 to-emerald-100/50 backdrop-blur-xl touch-manipulation"
            animateValue={!loadingMetrics}
            delay={0.2}
          />
          <EnhancedMetricCard
            title="Attendance Rate"
            value={loadingMetrics ? '...' : `${metrics?.weeklyAttendanceRate || 0}%`}
            icon={<Modern3DIcons.Chart3D size={isMobile ? "md" : "lg"} variant="primary" />}
            trend="+2.1%"
            trendLabel="vs last week"
            color="purple"
            className="border-0 shadow-lg sm:shadow-2xl shadow-purple-500/10 bg-gradient-to-br from-purple-50 to-purple-100/50 backdrop-blur-xl touch-manipulation"
            animateValue={!loadingMetrics}
            delay={0.4}
          />
          <EnhancedMetricCard
            title="At-Risk Students"
            value={loadingMetrics ? '...' : metrics?.studentsAtRisk || 0}
            icon={<Modern3DIcons.Clipboard3D size={isMobile ? "md" : "lg"} variant="warning" />}
            trend="-3"
            trendLabel="need attention"
            color="orange"
            className="border-0 shadow-lg sm:shadow-2xl shadow-orange-500/10 bg-gradient-to-br from-orange-50 to-orange-100/50 backdrop-blur-xl touch-manipulation"
            animateValue={!loadingMetrics}
            delay={0.6}
          />
        </div>
        </div>

        {/* Enhanced Floating Quick Actions Panel - Desktop / Bottom Sheet - Mobile */}
        {!isMobile ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, type: 'spring', stiffness: 300, damping: 25 }}
            className="relative mb-6 sm:mb-8 lg:mb-12"
            id="quick-actions"
            role="region"
            aria-label="Quick actions"
          >
            {/* Floating container with enhanced glass morphism */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-100/50 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xl sm:shadow-2xl shadow-blue-500/10 border-0 relative overflow-hidden">
              {/* Subtle background pattern */}
              <div className="absolute inset-0 opacity-5">
                <div className="absolute top-4 right-8 w-24 h-24 bg-blue-400/20 rounded-full blur-xl" />
                <div className="absolute bottom-4 left-8 w-20 h-20 bg-purple-500/20 rounded-full blur-lg" />
              </div>

              <div className="relative z-10">
                <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                  <motion.div
                    className="p-2 sm:p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl sm:rounded-2xl shadow-xl shadow-blue-500/25"
                    whileHover={{ scale: 1.05, rotate: 5 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  >
                    <Plus className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </motion.div>
                  <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900">
                    Quick Actions
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
                  <motion.div
                    whileHover={{ 
                      scale: 1.02, 
                      y: -2,
                      transition: { type: 'spring', stiffness: 400, damping: 25 }
                    }}
                    whileTap={{ scale: 0.98 }}
                    className="group"
                  >
                    <Button
                      onClick={() => {
                        handleMarkAttendance();
                        announce('Opening attendance marking interface');
                      }}
                      className="w-full min-h-[60px] sm:min-h-[80px] bg-blue-50 text-blue-700 hover:bg-blue-100 shadow-sm border-0 rounded-xl sm:rounded-2xl text-base sm:text-lg font-semibold transition-all duration-300 relative overflow-hidden group-hover:shadow-lg group-hover:shadow-blue-500/20 touch-manipulation"
                      aria-label="Quick action: Mark attendance for your classes"
                    >
                      {/* Button shine effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 translate-x-full group-hover:translate-x-[-200%] transition-transform duration-700" />
                      <div className="relative z-10 flex items-center justify-center">
                        <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 mr-2 sm:mr-3" aria-hidden="true" />
                        Mark Attendance
                      </div>
                    </Button>
                  </motion.div>
                  
                  <motion.div
                    whileHover={{ 
                      scale: 1.02, 
                      y: -2,
                      transition: { type: 'spring', stiffness: 400, damping: 25 }
                    }}
                    whileTap={{ scale: 0.98 }}
                    className="group"
                  >
                    <Button
                      onClick={() => {
                        handleViewReports();
                        announce('Opening reports and analytics');
                      }}
                      className="w-full min-h-[60px] sm:min-h-[80px] bg-purple-50 text-purple-700 hover:bg-purple-100 shadow-sm border-0 rounded-xl sm:rounded-2xl text-base sm:text-lg font-semibold transition-all duration-300 relative overflow-hidden group-hover:shadow-lg group-hover:shadow-purple-500/20 touch-manipulation"
                      aria-label="Quick action: View attendance reports and analytics"
                    >
                      {/* Button shine effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 translate-x-full group-hover:translate-x-[-200%] transition-transform duration-700" />
                      <div className="relative z-10 flex items-center justify-center">
                        <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6 mr-2 sm:mr-3" aria-hidden="true" />
                        View Reports
                      </div>
                    </Button>
                  </motion.div>
                  
                  <motion.div
                    whileHover={{ 
                      scale: 1.02, 
                      y: -2,
                      transition: { type: 'spring', stiffness: 400, damping: 25 }
                    }}
                    whileTap={{ scale: 0.98 }}
                    className="group"
                  >
                    <Button
                      onClick={() => {
                        handleStudentProgress();
                        announce('Opening student progress tracking');
                      }}
                      className="w-full min-h-[60px] sm:min-h-[80px] bg-emerald-50 text-emerald-700 hover:bg-emerald-100 shadow-sm border-0 rounded-xl sm:rounded-2xl text-base sm:text-lg font-semibold transition-all duration-300 relative overflow-hidden group-hover:shadow-lg group-hover:shadow-emerald-500/20 touch-manipulation"
                      aria-label="Quick action: View student progress and analytics"
                    >
                      {/* Button shine effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 translate-x-full group-hover:translate-x-[-200%] transition-transform duration-700" />
                      <div className="relative z-10 flex items-center justify-center">
                        <Users className="h-5 w-5 sm:h-6 sm:w-6 mr-2 sm:mr-3" aria-hidden="true" />
                        Student Progress
                      </div>
                    </Button>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <>
            {/* Mobile: Floating Action Button to open Bottom Sheet */}
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8, type: 'spring', stiffness: 300, damping: 25 }}
              className="fixed bottom-6 right-6 z-40"
            >
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  setShowQuickActions(true);
                  lightTap();
                  announce('Opening quick actions menu');
                }}
                className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full shadow-2xl shadow-blue-500/50 flex items-center justify-center text-white touch-manipulation"
                aria-label="Open quick actions menu"
              >
                <Plus className="h-6 w-6" />
              </motion.button>
            </motion.div>

            {/* Mobile: Bottom Sheet for Quick Actions */}
            <BottomSheet
              isOpen={showQuickActions}
              onClose={() => setShowQuickActions(false)}
              title="Quick Actions"
              description="Choose an action to perform"
              snapPoints={[60, 90]}
              defaultSnapPoint={0}
            >
              <div className="space-y-3 pb-6">
                <Button
                  onClick={() => {
                    handleMarkAttendance();
                    setShowQuickActions(false);
                    announce('Opening attendance marking interface');
                    successHaptic();
                  }}
                  className="w-full min-h-[56px] bg-blue-50 text-blue-700 hover:bg-blue-100 shadow-sm border-0 rounded-xl text-base font-semibold transition-all duration-300 touch-manipulation"
                  aria-label="Mark attendance for your classes"
                >
                  <CheckCircle className="h-5 w-5 mr-3" aria-hidden="true" />
                  Mark Attendance
                </Button>
                
                <Button
                  onClick={() => {
                    handleViewReports();
                    setShowQuickActions(false);
                    announce('Opening reports and analytics');
                    lightTap();
                  }}
                  className="w-full min-h-[56px] bg-purple-50 text-purple-700 hover:bg-purple-100 shadow-sm border-0 rounded-xl text-base font-semibold transition-all duration-300 touch-manipulation"
                  aria-label="View attendance reports and analytics"
                >
                  <BarChart3 className="h-5 w-5 mr-3" aria-hidden="true" />
                  View Reports
                </Button>
                
                <Button
                  onClick={() => {
                    handleStudentProgress();
                    setShowQuickActions(false);
                    announce('Opening student progress tracking');
                    lightTap();
                  }}
                  className="w-full min-h-[56px] bg-emerald-50 text-emerald-700 hover:bg-emerald-100 shadow-sm border-0 rounded-xl text-base font-semibold transition-all duration-300 touch-manipulation"
                  aria-label="View student progress and analytics"
                >
                  <Users className="h-5 w-5 mr-3" aria-hidden="true" />
                  Student Progress
                </Button>
              </div>
            </BottomSheet>
          </>
        )}

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