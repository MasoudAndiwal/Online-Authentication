"use client";

import * as React from "react";
import { Suspense } from "react";
import { useRouter } from "next/navigation";
import {
  ModernDashboardLayout,
  PageContainer,
} from "@/components/layout/modern-dashboard-layout";
import { useAuth } from "@/hooks/use-auth";
import { AuthLoadingScreen } from "@/components/ui/auth-loading";
import { handleLogout } from "@/lib/auth/logout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, ArrowRight, Info, Users } from "lucide-react";
import { motion } from "framer-motion";
import { SimpleClassGrid } from "@/components/classes/simple-class-grid";
import { useTeacherDashboardSelectors } from "@/lib/stores/teacher-dashboard-store";
import { useInitializeTeacherDashboard } from "@/lib/hooks/use-teacher-dashboard";
import {
  ModernCard,
  ModernCardHeader,
  ModernCardTitle,
  ModernCardContent,
} from "@/components/ui/modern-card";

// Disable static generation for this page
export const dynamic = 'force-dynamic';

function StudentProgressContent() {
  const { user, isLoading } = useAuth({ requiredRole: 'TEACHER' });
  const router = useRouter();
  const { classes, isLoading: loadingClasses } = useTeacherDashboardSelectors();
  const { isLoading: loadingDashboard } = useInitializeTeacherDashboard();

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
    window.location.href = href;
  };

  const handleLogoutClick = async () => {
    await handleLogout();
  };

  const handleSearch = (query: string) => {
    console.log("Search:", query);
  };

  const handleGoToClasses = () => {
    router.push('/teacher/dashboard/classes');
  };

  // Class action handler - navigate to class detail page
  const handleViewClassDetails = (classId: string) => {
    router.push(`/teacher/dashboard/${classId}`);
  };

  return (
    <ModernDashboardLayout
      user={displayUser}
      title="Student Progress"
      subtitle="Track and analyze student performance"
      currentPath="/teacher/dashboard/student-progress"
      onNavigate={handleNavigation}
      onLogout={handleLogoutClick}
      onSearch={handleSearch}
    >
      <PageContainer>
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-br from-blue-600/10 via-purple-600/5 to-emerald-600/10 backdrop-blur-xl rounded-3xl p-8 shadow-2xl shadow-blue-500/10 border-0 mb-8"
        >
          <div className="flex items-center gap-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl shadow-xl shadow-blue-500/25"
            >
              <Users className="h-12 w-12 text-white" />
            </motion.div>
            
            <div>
              <motion.h1 
                className="text-4xl font-bold text-slate-900 mb-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                Select a Class
              </motion.h1>
              <motion.p 
                className="text-lg text-slate-600"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                Choose a class to view detailed student progress and analytics
              </motion.p>
            </div>
          </div>
        </motion.div>

        {/* Classes Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <ModernCard
            variant="glass"
            className="border-0 shadow-2xl shadow-blue-200/20 bg-white backdrop-blur-xl"
          >
            <ModernCardHeader>
              <ModernCardTitle
                icon={<BookOpen className="h-7 w-7 text-blue-500" />}
                className="text-3xl font-bold"
              >
                Your Classes
              </ModernCardTitle>
            </ModernCardHeader>
            <ModernCardContent>
              <SimpleClassGrid
                classes={classes}
                isLoading={loadingClasses || loadingDashboard}
                error={null}
                onViewDetails={handleViewClassDetails}
              />
            </ModernCardContent>
          </ModernCard>
        </motion.div>
      </PageContainer>
    </ModernDashboardLayout>
  );
}

export default function StudentProgressPage() {
  return (
    <Suspense fallback={<AuthLoadingScreen />}>
      <StudentProgressContent />
    </Suspense>
  );
}
