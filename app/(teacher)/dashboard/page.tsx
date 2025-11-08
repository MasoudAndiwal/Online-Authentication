"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  ModernDashboardLayout,
  PageContainer,
  PageHeader,
  GridLayout,
} from "@/components/layout/modern-dashboard-layout";
import { handleLogout } from "@/lib/auth/logout";
import { useAuth } from "@/hooks/use-auth";
import { AuthLoadingScreen } from "@/components/ui/auth-loading";
import { toast } from "sonner";
import {
  ModernCard,
  ModernCardHeader,
  ModernCardTitle,
  ModernCardContent,
  ModernMetricCard,
} from "@/components/ui/modern-card";
import { Modern3DIcons } from "@/components/ui/modern-3d-icons";
import { Button } from "@/components/ui/button";
import {
  Users,
  BookOpen,
  CheckCircle,
  AlertTriangle,
  Plus,
  Calendar,
  BarChart3,
  Sparkles,
} from "lucide-react";
import { motion } from "framer-motion";
import { useTeacherDashboardSelectors } from "@/lib/stores/teacher-dashboard-store";
import { useInitializeTeacherDashboard } from "@/lib/hooks/use-teacher-dashboard";

export default function TeacherDashboardPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth({ requiredRole: 'TEACHER' });
  const [currentPath, setCurrentPath] = React.useState("/teacher/dashboard");
  const [hasShownWelcome, setHasShownWelcome] = React.useState(false);

  // Initialize dashboard data with React Query and Zustand
  const { isLoading: loadingDashboard, error: dashboardError } = useInitializeTeacherDashboard();
  const { metrics, classes, isLoading: storeLoading } = useTeacherDashboardSelectors();

  const loadingMetrics = loadingDashboard || storeLoading;

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
    if (dashboardError) {
      toast.error('Failed to load dashboard data', {
        description: 'Please refresh the page to try again.'
      });
    }
  }, [dashboardError]);

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

  const loadDashboardData = async () => {
    try {
      setLoadingMetrics(true);
      
      // Mock data - will be replaced with actual API calls
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockMetrics: TeacherDashboardMetrics = {
        totalStudents: 247,
        totalClasses: 8,
        weeklyAttendanceRate: 94.2,
        studentsAtRisk: 12,
      };
      
      setMetrics(mockMetrics);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Failed to load dashboard data', {
        description: 'Please refresh the page to try again.'
      });
    } finally {
      setLoadingMetrics(false);
    }
  };

  const handleMarkAttendance = () => {
    toast.info('Mark Attendance feature coming soon!');
  };

  const handleViewReports = () => {
    toast.info('Reports feature coming soon!');
  };

  const handleStudentProgress = () => {
    toast.info('Student Progress feature coming soon!');
  };

  return (
    <ModernDashboardLayout
      user={displayUser}
      title="Teacher Dashboard"
      subtitle="University Attendance Management System"
      currentPath={currentPath}
      onNavigate={handleNavigation}
      onLogout={handleLogoutClick}
      onSearch={handleSearch}
    >
      <PageContainer>
        {/* Ultra Modern Welcome Section with Orange Theme */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
          className="relative mb-12 overflow-hidden rounded-3xl"
        >
          {/* Beautiful Background Gradient - Orange Theme */}
          <div className="absolute inset-0 bg-gradient-to-br from-orange-600/10 via-orange-500/5 to-orange-400/10" />

          {/* Floating Animated Elements - Orange Theme */}
          <div className="absolute top-4 right-8 w-20 h-20 bg-orange-400/20 rounded-full blur-xl animate-pulse" />
          <div className="absolute bottom-4 left-8 w-16 h-16 bg-orange-500/20 rounded-full blur-lg animate-pulse delay-1000" />
          <div className="absolute top-1/2 right-1/4 w-12 h-12 bg-orange-300/15 rounded-full blur-md animate-pulse delay-500" />

          <div className="relative p-4 sm:p-6 lg:p-12">
            <div className="flex flex-col gap-6">
              <div className="space-y-3 sm:space-y-4">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  className="flex items-start gap-3 sm:gap-4"
                >
                  <motion.div
                    className="p-3 sm:p-4 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl sm:rounded-3xl shadow-xl shadow-orange-500/25 flex-shrink-0"
                    whileHover={{ scale: 1.05, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  >
                    <Sparkles className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                  </motion.div>
                  <div className="flex-1 min-w-0">
                    <h1 className="text-2xl sm:text-3xl lg:text-5xl font-bold text-slate-900 tracking-tight leading-tight">
                      {getWelcomeMessage()}
                    </h1>
                    <p className="text-sm sm:text-base lg:text-xl text-slate-600 font-medium mt-1 sm:mt-2">
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
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex-1 sm:flex-none"
                >
                  <Button
                    size="lg"
                    onClick={handleMarkAttendance}
                    className="w-full sm:w-auto bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 shadow-xl shadow-orange-500/25 rounded-xl sm:rounded-2xl px-6 sm:px-10 py-4 sm:py-5 text-base sm:text-lg font-semibold transition-all duration-300 border-0"
                  >
                    <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 mr-2 sm:mr-3" />
                    Mark Attendance
                  </Button>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex-1 sm:flex-none"
                >
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={handleViewReports}
                    className="w-full sm:w-auto border-0 bg-white/60 backdrop-blur-sm hover:bg-white/80 shadow-lg hover:shadow-xl rounded-xl sm:rounded-2xl px-6 sm:px-10 py-4 sm:py-5 text-base sm:text-lg font-semibold transition-all duration-300"
                  >
                    <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6 mr-2 sm:mr-3" />
                    <span className="hidden xs:inline">View Reports</span>
                    <span className="xs:hidden">Reports</span>
                  </Button>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Ultra Modern Metrics Cards - Orange Theme */}
        <GridLayout cols={4} gap="xl">
          <ModernMetricCard
            title="Total Students"
            value={loadingMetrics ? '...' : metrics?.totalStudents.toLocaleString() || '0'}
            icon={<Modern3DIcons.Users3D size="lg" variant="primary" />}
            trend="+12"
            trendLabel="vs last month"
            color="orange"
            className="border-0 shadow-2xl shadow-orange-500/10 bg-gradient-to-br from-orange-50 to-orange-100/50 backdrop-blur-xl"
          />
          <ModernMetricCard
            title="Active Classes"
            value={loadingMetrics ? '...' : metrics?.totalClasses.toString() || '0'}
            icon={<Modern3DIcons.Calendar3D size="lg" variant="success" />}
            trend="+2"
            trendLabel="new this term"
            color="orange"
            className="border-0 shadow-2xl shadow-orange-500/10 bg-gradient-to-br from-orange-50 to-orange-100/50 backdrop-blur-xl"
          />
          <ModernMetricCard
            title="Attendance Rate"
            value={loadingMetrics ? '...' : `${metrics?.weeklyAttendanceRate}%` || '0%'}
            icon={<Modern3DIcons.Chart3D size="lg" variant="primary" />}
            trend="+2.1%"
            trendLabel="vs last week"
            color="orange"
            className="border-0 shadow-2xl shadow-orange-500/10 bg-gradient-to-br from-orange-50 to-orange-100/50 backdrop-blur-xl"
          />
          <ModernMetricCard
            title="At-Risk Students"
            value={loadingMetrics ? '...' : metrics?.studentsAtRisk.toString() || '0'}
            icon={<Modern3DIcons.Clipboard3D size="lg" variant="warning" />}
            trend="-3"
            trendLabel="need attention"
            color="orange"
            className="border-0 shadow-2xl shadow-orange-500/10 bg-gradient-to-br from-orange-50 to-orange-100/50 backdrop-blur-xl"
          />
        </GridLayout>

        {/* Quick Actions Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-gradient-to-br from-orange-50 to-orange-100/50 backdrop-blur-xl rounded-3xl p-6 shadow-2xl shadow-orange-500/10 border-0"
        >
          <div className="flex items-center gap-4 mb-6">
            <motion.div
              className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl shadow-xl shadow-orange-500/25"
              whileHover={{ scale: 1.05, rotate: 5 }}
            >
              <Plus className="h-6 w-6 text-white" />
            </motion.div>
            <h2 className="text-3xl font-bold text-slate-900">
              Quick Actions
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                onClick={handleMarkAttendance}
                className="w-full h-20 bg-orange-50 text-orange-700 hover:bg-orange-100 shadow-sm border-0 rounded-2xl text-lg font-semibold transition-all duration-300"
              >
                <CheckCircle className="h-6 w-6 mr-3" />
                Mark Attendance
              </Button>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                onClick={handleViewReports}
                className="w-full h-20 bg-orange-50 text-orange-700 hover:bg-orange-100 shadow-sm border-0 rounded-2xl text-lg font-semibold transition-all duration-300"
              >
                <BarChart3 className="h-6 w-6 mr-3" />
                View Reports
              </Button>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                onClick={handleStudentProgress}
                className="w-full h-20 bg-orange-50 text-orange-700 hover:bg-orange-100 shadow-sm border-0 rounded-2xl text-lg font-semibold transition-all duration-300"
              >
                <Users className="h-6 w-6 mr-3" />
                Student Progress
              </Button>
            </motion.div>
          </div>
        </motion.div>

        {/* My Classes Section - Placeholder */}
        <ModernCard
          variant="glass"
          className="border-0 shadow-2xl shadow-orange-200/20 bg-gradient-to-br from-orange-50 to-orange-100/50 backdrop-blur-xl"
        >
          <ModernCardHeader>
            <ModernCardTitle
              icon={<BookOpen className="h-7 w-7 text-orange-500" />}
              className="text-3xl font-bold"
            >
              My Classes
            </ModernCardTitle>
          </ModernCardHeader>
          <ModernCardContent>
            <div className="text-center py-12">
              <BookOpen className="h-16 w-16 text-orange-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-700 mb-2">
                Classes will appear here
              </h3>
              <p className="text-slate-500">
                Your assigned classes and student information will be displayed in this section.
              </p>
            </div>
          </ModernCardContent>
        </ModernCard>
      </PageContainer>
    </ModernDashboardLayout>
  );
}