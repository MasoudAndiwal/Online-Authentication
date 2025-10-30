"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  ModernDashboardLayout,
  PageContainer,
} from "@/components/layout/modern-dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { CustomSelect } from "@/components/ui/custom-select";
import { useAuth } from "@/hooks/use-auth";
import { AuthLoadingScreen } from "@/components/ui/auth-loading";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
  Search,
  GraduationCap,
  Sun,
  Moon,
  Users,
  BookOpen,
  Plus,
  AlertCircle,
} from "lucide-react";

type ClassItem = {
  id: string;
  name: string;
  session: "MORNING" | "AFTERNOON";
  studentCount: number;
  major: string;
  semester: number;
};

export default function MarkAttendancePage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth({ requiredRole: "OFFICE" });
  const [currentPath] = React.useState("/dashboard/mark-attendance");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [sessionFilter, setSessionFilter] = React.useState<
    "ALL" | "MORNING" | "AFTERNOON"
  >("ALL");
  const [classes, setClasses] = React.useState<ClassItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Fetch classes on mount
  const loadClasses = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/classes");
      if (!response.ok) throw new Error("Failed to fetch classes");
      const data = await response.json();
      setClasses(data);
    } catch (error) {
      console.error("Error fetching classes:", error);
      setError("Failed to load classes");
      toast.error("Failed to load classes", {
        description: "Please try again later.",
        className: "bg-red-50 border-red-200 text-red-900",
        position: "top-center",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (user) {
      loadClasses();
    }
  }, [user, loadClasses]);

  // Filter classes based on search and session
  const filteredClasses = React.useMemo(() => {
    return classes.filter((classItem) => {
      const matchesSearch = classItem.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesSession =
        sessionFilter === "ALL" || classItem.session === sessionFilter;
      return matchesSearch && matchesSession;
    });
  }, [classes, searchQuery, sessionFilter]);

  // Calculate statistics
  const totalClasses = classes.length;
  const morningClasses = classes.filter((c) => c.session === "MORNING").length;
  const afternoonClasses = classes.filter(
    (c) => c.session === "AFTERNOON"
  ).length;

  // Handle class card click
  const handleClassClick = (classId: string) => {
    router.push(`/dashboard/mark-attendance/${classId}`);
  };

  // Navigation handler
  const handleNavigation = (path: string) => {
    router.push(path);
  };

  // Logout handler
  const handleLogout = async () => {
    const { handleLogout: performLogout } = await import("@/lib/auth/logout");
    await performLogout();
    router.push("/login");
  };

  // Search handler
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  // Create display user
  const displayUser = user
    ? {
      name: `${user.firstName} ${user.lastName}`,
      email: user.email || "",
      role: user.role,
    }
    : { name: "User", email: "", role: "OFFICE" as const };

  if (authLoading) {
    return <AuthLoadingScreen />;
  }

  if (!user) {
    return null;
  }

  return (
    <ModernDashboardLayout
      user={displayUser}
      title="Mark Attendance"
      subtitle="Select a class to mark student attendance"
      currentPath={currentPath}
      onNavigate={handleNavigation}
      onLogout={handleLogout}
      onSearch={handleSearch}
      hideSearch={true}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <PageContainer>
          {/* Statistics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
            {/* Total Classes */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0 }}
            >
              <Card className="rounded-2xl shadow-lg border-orange-200 bg-gradient-to-br from-orange-50 via-orange-100 to-amber-50">
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs md:text-sm font-semibold text-orange-600 mb-1 md:mb-2 uppercase tracking-wide truncate">
                        Total Classes
                      </p>
                      <p className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                        {totalClasses}
                      </p>
                    </div>
                    <div className="p-2.5 md:p-3.5 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl shadow-lg flex-shrink-0">
                      <GraduationCap className="h-5 w-5 md:h-7 md:w-7 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Morning Classes */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.05 }}
            >
              <Card className="rounded-2xl shadow-lg border-amber-200 bg-gradient-to-br from-amber-50 via-amber-100 to-yellow-50">
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs md:text-sm font-semibold text-amber-600 mb-1 md:mb-2 uppercase tracking-wide truncate">
                        Morning Classes
                      </p>
                      <p className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent">
                        {morningClasses}
                      </p>
                    </div>
                    <div className="p-2.5 md:p-3.5 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-xl shadow-lg flex-shrink-0">
                      <Sun className="h-5 w-5 md:h-7 md:w-7 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Afternoon Classes */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <Card className="rounded-2xl shadow-lg border-indigo-200 bg-gradient-to-br from-indigo-50 via-indigo-100 to-blue-50">
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs md:text-sm font-semibold text-indigo-600 mb-1 md:mb-2 uppercase tracking-wide truncate">
                        Afternoon Classes
                      </p>
                      <p className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
                        {afternoonClasses}
                      </p>
                    </div>
                    <div className="p-2.5 md:p-3.5 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-xl shadow-lg flex-shrink-0">
                      <Moon className="h-5 w-5 md:h-7 md:w-7 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Search and Filter Bar */}
          <Card className="rounded-2xl shadow-md border-slate-200 mb-6">
            <CardContent className="p-4 md:p-6">
              <div className="flex flex-col md:flex-row gap-3 md:gap-4">
                {/* Search Input */}
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <Input
                    placeholder="Search classes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-11 border-slate-300 focus:border-orange-500 focus:ring-orange-500 text-base"
                  />
                </div>

                {/* Session Filter */}
                <div className="w-full md:w-48">
                  <CustomSelect
                    value={sessionFilter}
                    onValueChange={(value) =>
                      setSessionFilter(value as "ALL" | "MORNING" | "AFTERNOON")
                    }
                    placeholder="Filter by session"
                    className="h-11 text-base"
                  >
                    <option value="ALL">All Sessions</option>
                    <option value="MORNING">Morning</option>
                    <option value="AFTERNOON">Afternoon</option>
                  </CustomSelect>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Class Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                >
                  <Card className="rounded-2xl shadow-lg border-slate-200">
                    <CardContent className="p-6">
                      <div className="animate-pulse">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="h-12 w-12 bg-gradient-to-br from-slate-200 to-slate-300 rounded-xl animate-shimmer" />
                            <div>
                              <div className="h-5 w-32 bg-gradient-to-r from-slate-200 to-slate-300 rounded mb-2 animate-shimmer" />
                              <div className="h-4 w-24 bg-gradient-to-r from-slate-200 to-slate-300 rounded animate-shimmer" />
                            </div>
                          </div>
                          <div className="h-6 w-20 bg-gradient-to-r from-slate-200 to-slate-300 rounded-full animate-shimmer" />
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="h-4 w-28 bg-gradient-to-r from-slate-200 to-slate-300 rounded animate-shimmer" />
                          <div className="h-4 w-32 bg-gradient-to-r from-slate-200 to-slate-300 rounded animate-shimmer" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : error ? (
            <Card className="rounded-2xl shadow-md border-red-200 bg-red-50">
              <CardContent className="p-12 text-center">
                <div className="p-4 bg-gradient-to-br from-red-100 to-rose-100 w-fit mx-auto rounded-2xl mb-4">
                  <AlertCircle className="h-16 w-16 text-red-600" />
                </div>
                <h3 className="text-2xl font-bold text-red-900 mb-2">
                  Failed to Load Classes
                </h3>
                <p className="text-red-700 mb-6 max-w-md mx-auto">{error}</p>
                <Button
                  onClick={loadClasses}
                  className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white shadow-lg"
                >
                  Try Again
                </Button>
              </CardContent>
            </Card>
          ) : filteredClasses.length === 0 ? (
            <Card className="rounded-2xl shadow-md border-slate-200">
              <CardContent className="p-12 text-center">
                <div className="p-4 bg-gradient-to-br from-orange-100 to-amber-100 w-fit mx-auto rounded-2xl mb-4">
                  <BookOpen className="h-16 w-16 text-orange-600" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">
                  No Classes Available
                </h3>
                <p className="text-slate-600 mb-6 max-w-md mx-auto">
                  {searchQuery || sessionFilter !== "ALL"
                    ? "No classes match your search criteria"
                    : "Create classes first to start marking attendance"}
                </p>
                <Button
                  onClick={() => router.push("/dashboard/all-classes")}
                  className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white shadow-lg"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Go to All Classes
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {filteredClasses.map((classItem, index) => (
                <motion.div
                  key={classItem.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Card
                    onClick={() => handleClassClick(classItem.id)}
                    className="rounded-2xl shadow-lg border-orange-200 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 cursor-pointer group"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="p-3 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-200">
                            <GraduationCap className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-slate-900">
                              {classItem.name}
                            </h3>
                            <p className="text-sm text-slate-600">
                              {classItem.major} • Semester {classItem.semester}
                            </p>
                          </div>
                        </div>
                        <div
                          className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${classItem.session === "MORNING"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-indigo-100 text-indigo-700"
                            }`}
                        >
                          {classItem.session === "MORNING" ? (
                            <Sun className="h-3 w-3" />
                          ) : (
                            <Moon className="h-3 w-3" />
                          )}
                          {classItem.session}
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 text-slate-600">
                          <Users className="h-4 w-4" />
                          <span>{classItem.studentCount} Students</span>
                        </div>
                        <span className="text-orange-600 font-medium group-hover:text-orange-700">
                          Mark Attendance →
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </PageContainer>
      </motion.div>
    </ModernDashboardLayout>
  );
}
