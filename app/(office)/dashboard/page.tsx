/* eslint-disable @typescript-eslint/no-unused-vars */
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
import { fetchDashboardStats, fetchRecentActivity, exportDashboardData } from "@/lib/api/dashboard-api";
import type { DashboardStats, ActivityItem } from "@/lib/database/dashboard-operations";
import { toast } from "sonner";
import {
  ModernCard,
  ModernCardHeader,
  ModernCardTitle,
  ModernCardContent,
  ModernMetricCard,
  ModernAlertCard,
} from "@/components/ui/modern-card";
import { Modern3DIcons } from "@/components/ui/modern-3d-icons";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  BookOpen,
  CheckCircle,
  AlertTriangle,
  FileText,
  TrendingUp,
  Calendar,
  Settings,
  Plus,
  Download,
  Clock,
  BarChart3,
  Sparkles,
  Zap,
  Star,
  Activity,
} from "lucide-react";
import { motion } from "framer-motion";

export default function OfficeDashboardPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth({ requiredRole: 'OFFICE' });
  const [currentPath, setCurrentPath] = React.useState("/dashboard");
  const [stats, setStats] = React.useState<DashboardStats | null>(null);
  const [activities, setActivities] = React.useState<ActivityItem[]>([]);
  const [loadingStats, setLoadingStats] = React.useState(true);
  const [exporting, setExporting] = React.useState(false);
  const [hasShownWelcome, setHasShownWelcome] = React.useState(false);

  // Fetch dashboard data on mount - must be before conditional return
  React.useEffect(() => {
    if (!isLoading && user) {
      loadDashboardData();
      
      // Show welcome toast only once per session
      const welcomeShown = sessionStorage.getItem('welcomeToastShown');
      if (!welcomeShown && !hasShownWelcome) {
        const userName = user.firstName || 'there';
        const greeting = getGreeting();
        
        setTimeout(() => {
          toast.success(`${greeting}, ${userName}! `, {
            description: 'Welcome to your dashboard. Have a productive day!',
            duration: 4000,
          });
          setHasShownWelcome(true);
          sessionStorage.setItem('welcomeToastShown', 'true');
        }, 500);
      }
    }
  }, [isLoading, user, hasShownWelcome]);

  // Use authenticated user data
  const displayUser = user ? {
    name: `${user.firstName} ${user.lastName}`,
    email: user.email || '',
    role: user.role,
    avatar: undefined,
  } : {
    name: "Office Staff",
    email: "",
    role: "OFFICE" as const,
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
      setLoadingStats(true);
      const [statsData, activityData] = await Promise.all([
        fetchDashboardStats(),
        fetchRecentActivity(10)
      ]);
      setStats(statsData);
      setActivities(activityData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Failed to load dashboard data', {
        description: 'Please refresh the page to try again.'
      });
    } finally {
      setLoadingStats(false);
    }
  };

  const handleExportData = async () => {
    try {
      setExporting(true);
      await exportDashboardData('json');
      toast.success('Data exported successfully!', {
        description: 'The export file has been downloaded.'
      });
    } catch (error) {
      console.error('Error exporting data:', error);
      toast.error('Failed to export data', {
        description: 'Please try again later.'
      });
    } finally {
      setExporting(false);
    }
  };

  return (
    <ModernDashboardLayout
      user={displayUser}
      title="Office Dashboard"
      subtitle="University Attendance Management System"
      currentPath={currentPath}
      onNavigate={handleNavigation}
      onLogout={handleLogoutClick}
      onSearch={handleSearch}
    >
      <PageContainer>
        {/* Ultra Modern Welcome Section - NO BORDERS */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
          className="relative mb-12 overflow-hidden rounded-3xl"
        >
          {/* Beautiful Background Gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-purple-600/5 to-emerald-600/10" />

          {/* Floating Animated Elements */}
          <div className="absolute top-4 right-8 w-20 h-20 bg-blue-400/20 rounded-full blur-xl animate-pulse" />
          <div className="absolute bottom-4 left-8 w-16 h-16 bg-purple-400/20 rounded-full blur-lg animate-pulse delay-1000" />
          <div className="absolute top-1/2 right-1/4 w-12 h-12 bg-emerald-400/15 rounded-full blur-md animate-pulse delay-500" />

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
                    className="p-3 sm:p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl sm:rounded-3xl shadow-xl shadow-blue-500/25 flex-shrink-0"
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
                      Here&apos;s what&apos;s happening at your university today
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
                    className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-xl shadow-blue-500/25 rounded-xl sm:rounded-2xl px-6 sm:px-10 py-4 sm:py-5 text-base sm:text-lg font-semibold transition-all duration-300 border-0"
                  >
                    <Plus className="h-5 w-5 sm:h-6 sm:w-6 mr-2 sm:mr-3" />
                    Quick Add User
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
                    onClick={handleExportData}
                    disabled={exporting}
                    className="w-full sm:w-auto border-0 bg-white/60 backdrop-blur-sm hover:bg-white/80 shadow-lg hover:shadow-xl rounded-xl sm:rounded-2xl px-6 sm:px-10 py-4 sm:py-5 text-base sm:text-lg font-semibold transition-all duration-300"
                  >
                    <Download className="h-5 w-5 sm:h-6 sm:w-6 mr-2 sm:mr-3" />
                    <span className="hidden xs:inline">{exporting ? 'Exporting...' : 'Export Data'}</span>
                    <span className="xs:hidden">{exporting ? '...' : 'Export'}</span>
                  </Button>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Ultra Modern Metrics Cards - NO BORDERS */}
        <GridLayout cols={4} gap="xl">
          <ModernMetricCard
            title="Total Users"
            value={loadingStats ? '...' : stats?.totalUsers.count.toLocaleString() || '0'}
            icon={<Modern3DIcons.Users3D size="lg" variant="primary" />}
            trend={loadingStats ? '...' : `+${stats?.totalUsers.change}%`}
            trendLabel={stats?.totalUsers.changeLabel || 'vs last month'}
            color="blue"
            className="border-0 shadow-2xl shadow-blue-500/10 bg-white/70 backdrop-blur-xl"
          />
          <ModernMetricCard
            title="Active Classes"
            value={loadingStats ? '...' : stats?.activeClasses.count.toString() || '0'}
            icon={<Modern3DIcons.Calendar3D size="lg" variant="success" />}
            trend={loadingStats ? '...' : `+${stats?.activeClasses.change}`}
            trendLabel={stats?.activeClasses.changeLabel || 'new this term'}
            color="emerald"
            className="border-0 shadow-2xl shadow-emerald-500/10 bg-white/70 backdrop-blur-xl"
          />
          <ModernMetricCard
            title="Attendance Rate"
            value={loadingStats ? '...' : `${stats?.attendanceRate.rate}%` || '0%'}
            icon={<Modern3DIcons.Chart3D size="lg" variant="primary" />}
            trend={loadingStats ? '...' : `+${stats?.attendanceRate.change}%`}
            trendLabel={stats?.attendanceRate.changeLabel || 'vs last week'}
            color="purple"
            className="border-0 shadow-2xl shadow-purple-500/10 bg-white/70 backdrop-blur-xl"
          />
          <ModernMetricCard
            title="Pending Reviews"
            value={loadingStats ? '...' : stats?.pendingReviews.count.toString() || '0'}
            icon={<Modern3DIcons.Clipboard3D size="lg" variant="warning" />}
            trend={loadingStats ? '...' : `+${stats?.pendingReviews.change}`}
            trendLabel={stats?.pendingReviews.changeLabel || 'need attention'}
            color="amber"
            className="border-0 shadow-2xl shadow-amber-500/10 bg-white/70 backdrop-blur-xl"
          />
        </GridLayout>

        {/* Ultra Modern Alerts - NO BORDERS */}
        <div className="space-y-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="flex items-center gap-4"
          >
            <motion.div
              className="p-3 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl shadow-xl shadow-amber-500/25"
              whileHover={{ scale: 1.05, rotate: 5 }}
            >
              <AlertTriangle className="h-6 w-6 text-white" />
            </motion.div>
            <h2 className="text-3xl font-bold text-slate-900">
              Critical Alerts
            </h2>
          </motion.div>

          <div className="grid gap-6">
            {[
              {
                title: "3 students approaching محروم threshold",
                message:
                  "Computer Science - Fall 2024 requires immediate attention for academic standing",
                type: "error" as const,
                action: "Review Students",
              },
              {
                title: "5 medical certificates pending review",
                message:
                  "New submissions from the last 24 hours awaiting administrative approval",
                type: "info" as const,
                action: "Review Certificates",
              },
              {
                title: "2 teachers haven't submitted attendance this week",
                message:
                  "Mathematics and Physics departments need follow-up for weekly reporting",
                type: "warning" as const,
                action: "Send Reminder",
              },
            ].map((alert, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
              >
                <ModernAlertCard
                  title={alert.title}
                  message={alert.message}
                  type={alert.type}
                  className="border-0 shadow-xl backdrop-blur-xl"
                  action={
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-2xl border-0 bg-white/90 hover:bg-white shadow-lg hover:shadow-xl transition-all duration-300 font-semibold"
                      >
                        {alert.action}
                      </Button>
                    </motion.div>
                  }
                />
              </motion.div>
            ))}
          </div>
        </div>

        {/* Ultra Modern Activity Feed - NO BORDERS */}
        <ModernCard
          variant="glass"
          className="border-0 shadow-2xl shadow-slate-200/20 bg-white/70 backdrop-blur-xl"
        >
          <ModernCardHeader>
            <ModernCardTitle
              icon={<Activity className="h-7 w-7 text-emerald-500" />}
              className="text-3xl font-bold"
            >
              Recent Activity
            </ModernCardTitle>
          </ModernCardHeader>
          <ModernCardContent>
            <div className="space-y-6">
              {[
                {
                  action: "New user created",
                  details: "Ahmad Hassan (Student) - CS-2024-156",
                  time: "5 minutes ago",
                  type: "success",
                  icon: <Users className="h-5 w-5" />,
                },
                {
                  action: "Attendance marked",
                  details: "Computer Science - Fall 2024 (28/30 present)",
                  time: "15 minutes ago",
                  type: "info",
                  icon: <CheckCircle className="h-5 w-5" />,
                },
                {
                  action: "Medical certificate approved",
                  details: "Sara Khan - 3 days sick leave approved",
                  time: "1 hour ago",
                  type: "success",
                  icon: <FileText className="h-5 w-5" />,
                },
                {
                  action: "Schedule updated",
                  details: "Mathematics - Spring 2024 timetable modified",
                  time: "2 hours ago",
                  type: "info",
                  icon: <Calendar className="h-5 w-5" />,
                },
              ].map((activity, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 + index * 0.05 }}
                  whileHover={{ scale: 1.02, x: 12 }}
                  className="group flex items-center gap-6 p-6 rounded-3xl hover:bg-gradient-to-r hover:from-slate-50/60 hover:to-blue-50/40 transition-all duration-300 cursor-pointer border-0 shadow-sm hover:shadow-lg"
                >
                  <motion.div
                    className={`p-4 rounded-3xl shadow-lg transition-all duration-300 group-hover:scale-110 ${
                      activity.type === "success"
                        ? "bg-emerald-100 text-emerald-600 group-hover:shadow-emerald-500/20"
                        : "bg-blue-100 text-blue-600 group-hover:shadow-blue-500/20"
                    }`}
                    whileHover={{ rotate: 5 }}
                  >
                    {activity.icon}
                  </motion.div>
                  <div className="flex-1 min-w-0">
                    <p className="text-lg font-bold text-slate-900 group-hover:text-slate-800 transition-colors">
                      {activity.action}
                    </p>
                    <p className="text-base text-slate-600 group-hover:text-slate-700 transition-colors truncate">
                      {activity.details}
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className="text-sm bg-white/90 border-0 shadow-sm group-hover:bg-white group-hover:shadow-md transition-all duration-300 rounded-2xl px-4 py-2 font-semibold"
                  >
                    {activity.time}
                  </Badge>
                </motion.div>
              ))}
            </div>
          </ModernCardContent>
        </ModernCard>
      </PageContainer>
    </ModernDashboardLayout>
  );
}
