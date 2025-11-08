"use client";

import * as React from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import {
  ModernDashboardLayout,
  PageContainer,
} from "@/components/layout/modern-dashboard-layout";
import { handleLogout } from "@/lib/auth/logout";
import { useAuth } from "@/hooks/use-auth";
import { AuthLoadingScreen } from "@/components/ui/auth-loading";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, 
  BookOpen, 
  Users, 
  Calendar,
  TrendingUp,
  Settings,
  CheckCircle,
  FileText
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  ModernCard,
  ModernCardHeader,
  ModernCardTitle,
  ModernCardContent,
} from "@/components/ui/modern-card";

export default function TeacherClassDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const classId = params.classId as string;
  const activeTab = searchParams.get('tab') || 'overview';
  const { user, isLoading } = useAuth({ requiredRole: 'TEACHER' });
  const [currentPath] = React.useState(`/teacher/classes/${classId}`);

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

  const handleNavigation = (href: string) => {
    router.push(href);
  };

  const handleLogoutClick = async () => {
    await handleLogout();
  };

  const handleSearch = (query: string) => {
    console.log("Search:", query);
  };

  const handleBackToDashboard = () => {
    router.push('/teacher/dashboard');
  };

  const handleMarkAttendance = () => {
    router.push(`/teacher/attendance?classId=${classId}`);
  };

  const handleViewStudents = () => {
    router.push(`/teacher/classes/${classId}?tab=students`);
  };

  const handleViewReports = () => {
    router.push(`/teacher/classes/${classId}?tab=reports`);
  };

  const handleViewSchedule = () => {
    router.push(`/teacher/classes/${classId}?tab=schedule`);
  };

  const handleManageClass = () => {
    router.push(`/teacher/classes/${classId}?tab=manage`);
  };

  // Show appropriate content based on active tab
  React.useEffect(() => {
    switch (activeTab) {
      case 'students':
        toast.info('Student list view coming soon!', {
          description: 'This will show detailed student information and progress.'
        });
        break;
      case 'reports':
        toast.info('Class reports coming soon!', {
          description: 'This will show attendance reports and analytics for this class.'
        });
        break;
      case 'schedule':
        toast.info('Class schedule view coming soon!', {
          description: 'This will show the detailed schedule for this class.'
        });
        break;
      case 'manage':
        toast.info('Class management coming soon!', {
          description: 'This will allow you to edit class settings and information.'
        });
        break;
    }
  }, [activeTab]);

  // Show loading state while checking authentication
  if (isLoading) {
    return <AuthLoadingScreen />;
  }

  return (
    <ModernDashboardLayout
      user={displayUser}
      title={`Class Details`}
      subtitle={`Detailed view and management for class ${classId}`}
      currentPath={currentPath}
      onNavigate={handleNavigation}
      onLogout={handleLogoutClick}
      onSearch={handleSearch}
    >
      <PageContainer>
        {/* Back Navigation */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-6"
        >
          <Button
            onClick={handleBackToDashboard}
            className="h-11 bg-white hover:bg-slate-50 text-slate-700 shadow-sm border-0 rounded-xl"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </motion.div>

        {/* Class Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-br from-orange-50 to-orange-100/50 backdrop-blur-xl rounded-3xl p-8 shadow-2xl shadow-orange-500/10 border-0 mb-8"
        >
          <div className="flex items-start gap-6">
            <motion.div
              className="p-4 bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl shadow-xl shadow-orange-500/25"
              whileHover={{ scale: 1.05, rotate: 5 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            >
              <BookOpen className="h-12 w-12 text-white" />
            </motion.div>
            
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-slate-900 mb-2">
                Class Details
              </h1>
              <p className="text-lg text-slate-600 mb-6">
                Comprehensive view and management for Class ID: {classId}
              </p>
              
              {/* Quick Actions */}
              <div className="flex flex-wrap gap-3">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    onClick={handleMarkAttendance}
                    className="bg-orange-50 text-orange-700 hover:bg-orange-100 shadow-sm border-0 rounded-xl"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Mark Attendance
                  </Button>
                </motion.div>
                
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    onClick={handleViewStudents}
                    className="bg-orange-50 text-orange-700 hover:bg-orange-100 shadow-sm border-0 rounded-xl"
                  >
                    <Users className="h-4 w-4 mr-2" />
                    View Students
                  </Button>
                </motion.div>
                
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    onClick={handleViewReports}
                    className="bg-orange-50 text-orange-700 hover:bg-orange-100 shadow-sm border-0 rounded-xl"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    View Reports
                  </Button>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-8"
        >
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-2 shadow-lg border-0">
            <div className="flex gap-2">
              {[
                { id: 'overview', label: 'Overview', icon: BookOpen },
                { id: 'students', label: 'Students', icon: Users },
                { id: 'schedule', label: 'Schedule', icon: Calendar },
                { id: 'reports', label: 'Reports', icon: TrendingUp },
                { id: 'manage', label: 'Manage', icon: Settings },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                
                return (
                  <motion.div
                    key={tab.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1"
                  >
                    <Button
                      onClick={() => router.push(`/teacher/classes/${classId}?tab=${tab.id}`)}
                      className={`w-full h-12 rounded-xl font-semibold transition-all duration-300 border-0 ${
                        isActive
                          ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/25'
                          : 'bg-transparent text-slate-600 hover:bg-orange-50 hover:text-orange-700'
                      }`}
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      {tab.label}
                    </Button>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Class Information Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Class Overview */}
          <ModernCard
            variant="glass"
            className="border-0 shadow-2xl shadow-orange-200/20 bg-gradient-to-br from-orange-50 to-orange-100/50 backdrop-blur-xl"
          >
            <ModernCardHeader>
              <ModernCardTitle
                icon={<BookOpen className="h-6 w-6 text-orange-500" />}
                className="text-2xl font-bold"
              >
                Class Overview
              </ModernCardTitle>
            </ModernCardHeader>
            <ModernCardContent>
              <div className="space-y-6">
                <div className="text-center py-8">
                  <motion.div
                    className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl shadow-xl shadow-orange-500/25 inline-block mb-4"
                    whileHover={{ scale: 1.05, rotate: 5 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  >
                    <BookOpen className="h-8 w-8 text-white" />
                  </motion.div>
                  
                  <h3 className="text-xl font-bold text-slate-900 mb-2">
                    Class Information
                  </h3>
                  
                  <p className="text-slate-600 mb-6">
                    Detailed class information will be loaded from the database in future tasks.
                  </p>
                  
                  <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4">
                    <p className="font-semibold text-slate-900">Class ID: {classId}</p>
                  </div>
                </div>
              </div>
            </ModernCardContent>
          </ModernCard>

          {/* Quick Actions */}
          <ModernCard
            variant="glass"
            className="border-0 shadow-2xl shadow-orange-200/20 bg-gradient-to-br from-orange-50 to-orange-100/50 backdrop-blur-xl"
          >
            <ModernCardHeader>
              <ModernCardTitle
                icon={<Settings className="h-6 w-6 text-orange-500" />}
                className="text-2xl font-bold"
              >
                Quick Actions
              </ModernCardTitle>
            </ModernCardHeader>
            <ModernCardContent>
              <div className="space-y-4">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    onClick={handleViewStudents}
                    className="w-full h-16 bg-white/60 hover:bg-white/80 text-slate-700 shadow-sm border-0 rounded-xl text-left justify-start"
                  >
                    <Users className="h-6 w-6 mr-4 text-orange-600" />
                    <div>
                      <p className="font-semibold">View Students</p>
                      <p className="text-sm text-slate-500">See enrolled students and their progress</p>
                    </div>
                  </Button>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    onClick={handleViewSchedule}
                    className="w-full h-16 bg-white/60 hover:bg-white/80 text-slate-700 shadow-sm border-0 rounded-xl text-left justify-start"
                  >
                    <Calendar className="h-6 w-6 mr-4 text-orange-600" />
                    <div>
                      <p className="font-semibold">View Schedule</p>
                      <p className="text-sm text-slate-500">Check class times and sessions</p>
                    </div>
                  </Button>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    onClick={handleViewReports}
                    className="w-full h-16 bg-white/60 hover:bg-white/80 text-slate-700 shadow-sm border-0 rounded-xl text-left justify-start"
                  >
                    <TrendingUp className="h-6 w-6 mr-4 text-orange-600" />
                    <div>
                      <p className="font-semibold">View Reports</p>
                      <p className="text-sm text-slate-500">Attendance analytics and insights</p>
                    </div>
                  </Button>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    onClick={handleManageClass}
                    className="w-full h-16 bg-white/60 hover:bg-white/80 text-slate-700 shadow-sm border-0 rounded-xl text-left justify-start"
                  >
                    <Settings className="h-6 w-6 mr-4 text-orange-600" />
                    <div>
                      <p className="font-semibold">Manage Class</p>
                      <p className="text-sm text-slate-500">Edit class settings and information</p>
                    </div>
                  </Button>
                </motion.div>
              </div>
            </ModernCardContent>
          </ModernCard>
        </div>

        {/* Implementation Note */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-8 bg-white/60 backdrop-blur-sm rounded-2xl p-6 border-0"
        >
          <div className="text-center">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              Implementation Progress
            </h3>
            <p className="text-slate-600 text-sm">
              This class details page provides navigation structure for future features. 
              Detailed class information, student lists, and reports will be implemented in subsequent tasks.
            </p>
          </div>
        </motion.div>
      </PageContainer>
    </ModernDashboardLayout>
  );
}