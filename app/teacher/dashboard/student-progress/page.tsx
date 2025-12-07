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
import { BookOpen, Users, Search, Filter, X } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Disable static generation for this page
export const dynamic = 'force-dynamic';

function StudentProgressContent() {
  const { user, isLoading } = useAuth({ requiredRole: 'TEACHER' });
  const router = useRouter();
  const { classes, isLoading: loadingClasses } = useTeacherDashboardSelectors();
  const { isLoading: loadingDashboard } = useInitializeTeacherDashboard();
  
  // Filter states
  const [searchQuery, setSearchQuery] = React.useState('');
  const [minStudents, setMinStudents] = React.useState<number | ''>('');
  const [maxStudents, setMaxStudents] = React.useState<number | ''>('');

  // Filter classes based on search and student count
  const filteredClasses = React.useMemo(() => {
    return classes.filter((classData) => {
      // Search filter
      const matchesSearch = searchQuery === '' || 
        classData.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (classData.major && classData.major.toLowerCase().includes(searchQuery.toLowerCase()));

      // Min students filter
      const matchesMin = minStudents === '' || classData.studentCount >= minStudents;

      // Max students filter
      const matchesMax = maxStudents === '' || classData.studentCount <= maxStudents;

      return matchesSearch && matchesMin && matchesMax;
    });
  }, [classes, searchQuery, minStudents, maxStudents]);

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

  const handleSearch = (_query: string) => {
    // Search functionality
  };

  // Class action handler - navigate to class detail page
  const handleViewClassDetails = (classId: string) => {
    router.push(`/teacher/dashboard/${classId}`);
  };

  // Clear all filters
  const handleClearFilters = () => {
    setSearchQuery('');
    setMinStudents('');
    setMaxStudents('');
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

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="mb-6"
        >
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Search */}
                <div className="flex-1">
                  <Label htmlFor="search" className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                    <Search className="h-4 w-4" />
                    Search Classes
                  </Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      id="search"
                      type="text"
                      placeholder="Search by class name or subject..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 pr-10 h-11 border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Min Students Filter */}
                <div className="w-full lg:w-48">
                  <Label htmlFor="minStudents" className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    Min Students
                  </Label>
                  <Input
                    id="minStudents"
                    type="number"
                    placeholder="Min"
                    min="0"
                    value={minStudents}
                    onChange={(e) => setMinStudents(e.target.value === '' ? '' : parseInt(e.target.value))}
                    className="h-11 border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                {/* Max Students Filter */}
                <div className="w-full lg:w-48">
                  <Label htmlFor="maxStudents" className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    Max Students
                  </Label>
                  <Input
                    id="maxStudents"
                    type="number"
                    placeholder="Max"
                    min="0"
                    value={maxStudents}
                    onChange={(e) => setMaxStudents(e.target.value === '' ? '' : parseInt(e.target.value))}
                    className="h-11 border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                {/* Clear Filters Button */}
                {(searchQuery || minStudents !== '' || maxStudents !== '') && (
                  <div className="flex items-end">
                    <Button
                      onClick={handleClearFilters}
                      variant="outline"
                      className="h-11 px-4 border-slate-200 hover:bg-slate-50"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Clear
                    </Button>
                  </div>
                )}
              </div>

              {/* Results count */}
              <div className="mt-4 text-sm text-slate-600">
                Showing <span className="font-semibold text-slate-900">{filteredClasses.length}</span> of <span className="font-semibold text-slate-900">{classes.length}</span> classes
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Classes Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
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
                classes={filteredClasses}
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
