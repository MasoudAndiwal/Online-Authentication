"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  ModernDashboardLayout,
  PageContainer,
} from "@/components/layout/modern-dashboard-layout";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  User,
  Search,
  Plus,
  Phone,
  Edit,
  Trash2,
  Eye,
  GraduationCap,
  Calendar,
  Users,
  UserCheck,
  HeartPulse,
  Filter,
  AlertCircle,
} from "lucide-react";
import { CustomSelect } from "@/components/ui/custom-select";
import { ViewStudentDialog } from "@/components/shared/view-student-dialog";
import { handleLogout as performLogout } from "@/lib/auth/logout";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { AuthLoadingScreen } from "@/components/ui/auth-loading";

// Student interface
interface Student {
  id: string;
  firstName: string;
  lastName: string;
  studentId: string;
  phone: string;
  fatherPhone: string;
  programs: string;
  semester: string;
  classSection: string;
  status: string;
}

// Skeleton loading component
function StudentCardSkeleton() {
  return (
    <div className="p-5 rounded-xl bg-gradient-to-br from-slate-50 to-white shadow-sm border-0 animate-pulse">
      <div className="hidden lg:flex items-center justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-12 w-12 bg-slate-200 rounded-full" />
            <div>
              <div className="h-5 w-32 bg-slate-200 rounded mb-2" />
              <div className="h-4 w-24 bg-slate-200 rounded" />
            </div>
            <div className="h-6 w-16 bg-slate-200 rounded-full" />
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 bg-slate-200 rounded" />
              <div>
                <div className="h-3 w-14 bg-slate-200 rounded mb-1" />
                <div className="h-4 w-24 bg-slate-200 rounded" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 bg-slate-200 rounded" />
              <div>
                <div className="h-3 w-14 bg-slate-200 rounded mb-1" />
                <div className="h-4 w-20 bg-slate-200 rounded" />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4 mt-3">
            <div className="h-4 w-4 bg-slate-200 rounded" />
            <div className="h-4 w-28 bg-slate-200 rounded" />
          </div>
        </div>
        <div className="flex gap-2">
          <div className="h-9 w-20 bg-slate-200 rounded-xl" />
          <div className="h-9 w-20 bg-slate-200 rounded-xl" />
          <div className="h-9 w-20 bg-slate-200 rounded-xl" />
        </div>
      </div>
      {/* Mobile skeleton */}
      <div className="block lg:hidden">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 bg-slate-200 rounded-full" />
            <div>
              <div className="h-5 w-28 bg-slate-200 rounded mb-2" />
              <div className="h-4 w-20 bg-slate-200 rounded" />
            </div>
          </div>
          <div className="h-6 w-14 bg-slate-200 rounded-full" />
        </div>
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 bg-slate-200 rounded" />
            <div className="h-4 w-24 bg-slate-200 rounded" />
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 bg-slate-200 rounded" />
            <div className="h-4 w-20 bg-slate-200 rounded" />
          </div>
        </div>
        <div className="flex gap-2">
          <div className="flex-1 h-11 bg-slate-200 rounded-xl" />
          <div className="flex-1 h-11 bg-slate-200 rounded-xl" />
          <div className="flex-1 h-11 bg-slate-200 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export default function StudentListPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth({ requiredRole: 'OFFICE' });
  const [currentPath] = React.useState("/dashboard/students");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [programFilter, setProgramFilter] = React.useState("");
  const [classFilter, setClassFilter] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("");
  const [students, setStudents] = React.useState<Student[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [viewStudentId, setViewStudentId] = React.useState<string | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = React.useState(false);
  const [currentPage, setCurrentPage] = React.useState(1);
  const itemsPerPage = 10;

  const handleNavigation = (href: string) => {
    try {
      router.push(href);
    } catch (error) {
      console.error("Navigation failed:", error);
      window.location.href = href;
    }
  };

  const handleLogout = async () => {
    await performLogout();
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  // Fetch students from API
  const fetchStudents = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Build query parameters
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (programFilter) params.append('program', programFilter);
      if (classFilter) params.append('classSection', classFilter);
      if (statusFilter) params.append('status', statusFilter);

      const response = await fetch(`/api/students?${params.toString()}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `Failed to fetch students (Status: ${response.status})`);
      }

      const data = await response.json();
      setStudents(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching students:', err);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, programFilter, classFilter, statusFilter]);

  // Fetch students on component mount and when filters change
  React.useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  // Get unique programs and classes for filter options
  const programs = React.useMemo(() => {
    const progs = new Set<string>();
    students.forEach(student => {
      if (student.programs) {
        // Handle both array and string formats
        const progList = Array.isArray(student.programs)
          ? student.programs
          : student.programs.split(',');
        progList.forEach(p => progs.add(typeof p === 'string' ? p.trim() : p));
      }
    });
    return Array.from(progs);
  }, [students]);

  const classes = React.useMemo(() => {
    return [...new Set(students.map(student => student.classSection).filter(Boolean))];
  }, [students]);

  // Calculate statistics
  const totalStudents = students.length;
  const activeStudents = students.filter(student => student.status === "ACTIVE").length;
  const sickStudents = students.filter(student => student.status === "SICK").length;

  // Pagination calculations
  const totalPages = Math.ceil(students.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  // Reset to page 1 when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, programFilter, classFilter, statusFilter]);

  // Transform students for display
  const displayStudents = students.map(student => {
    // Handle programs - can be array or string
    const progStr = Array.isArray(student.programs)
      ? student.programs.join(', ')
      : student.programs || '';
    
    return {
      id: student.id, // Database UUID for API calls
      studentId: student.studentId, // Custom student ID for display
      name: `${student.firstName} ${student.lastName}`,
      program: progStr,
      phone: student.phone,
      semester: student.semester || '',
      status: student.status === 'ACTIVE' ? 'Active' : student.status === 'SICK' ? 'Sick' : 'Inactive',
      classSection: student.classSection || '',
    };
  });

  const handleView = (id: string) => {
    setViewStudentId(id);
    setViewDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    // Find the student to show confirmation
    const student = students.find(s => s.id === id);
    if (!student) return;

    // Show confirmation toast (destructive)
    toast.error(
      `Delete ${student.firstName} ${student.lastName}?`,
      {
        description: 'This action cannot be undone.',
        position: 'bottom-center',
        className: 'bg-red-100 border-red-200 text-red-900',
        action: {
          label: 'Delete',
          onClick: async () => {
            try {
              const response = await fetch(`/api/students/${id}`, {
                method: 'DELETE',
              });

              if (!response.ok) {
                throw new Error('Failed to delete student');
              }

              // Remove student from local state
              setStudents(students.filter(s => s.id !== id));
              
              // Show success message
              toast.success('Student deleted successfully', {
                description: `${student.firstName} ${student.lastName} has been removed.`,
                className: 'bg-green-50 border-green-200 text-green-900',
              });
            } catch (err) {
              console.error('Error deleting student:', err);
              toast.error('Failed to delete student', {
                description: 'Please try again later.',
                className: 'bg-red-50 border-red-200 text-red-900',
              });
            }
          },
        },
        cancel: {
          label: 'Cancel',
          onClick: () => {},
        },
      }
    );
  };

  // Create display user
  const displayUser = user ? {
    name: `${user.firstName} ${user.lastName}`,
    email: user.email || '',
    role: user.role,
  } : { name: 'User', email: '', role: 'OFFICE' as const };

  // Show loading screen while checking authentication
  if (authLoading) {
    return <AuthLoadingScreen />;
  }

  return (
    <ModernDashboardLayout
      user={displayUser}
      title="Student List"
      subtitle="Manage all student accounts"
      currentPath={currentPath}
      onNavigate={handleNavigation}
      onLogout={handleLogout}
      onSearch={handleSearch}
      hideSearch={true}
    >
      <PageContainer>
        {/* Statistics Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="rounded-2xl shadow-lg bg-gradient-to-br from-emerald-50 to-emerald-100/80 p-6 border-0">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-emerald-600 mb-1">
                  Total Students
                </p>
                <p className="text-3xl font-bold text-emerald-700">
                  {totalStudents}
                </p>
              </div>
              <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg shadow-emerald-500/30">
                <Users className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl shadow-lg bg-gradient-to-br from-blue-50 to-blue-100/80 p-6 border-0">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 mb-1">
                  Active Students
                </p>
                <p className="text-3xl font-bold text-blue-700">
                  {activeStudents}
                </p>
              </div>
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg shadow-blue-500/30">
                <UserCheck className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl shadow-lg bg-gradient-to-br from-rose-50 to-rose-100/80 p-6 border-0">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-rose-600 mb-1">
                  Sick Students
                </p>
                <p className="text-3xl font-bold text-rose-700">
                  {sickStudents}
                </p>
              </div>
              <div className="p-3 bg-gradient-to-br from-rose-500 to-rose-600 rounded-xl shadow-lg shadow-rose-500/30">
                <HeartPulse className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="mb-6">
          <div className="rounded-2xl shadow-lg bg-white/80 backdrop-blur-sm p-6 border-0">
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Search Bar */}
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search by name, program, or ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-12 border-slate-200 focus:border-green-500 focus:ring-2 focus:ring-green-100 rounded-xl"
                  />
                </div>

                {/* Filter Options */}
                <div className="flex flex-col sm:flex-row gap-3 lg:w-auto">
                  <div className="relative w-full sm:w-48">
                    <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none z-10" />
                    <CustomSelect
                      value={programFilter}
                      onValueChange={(value) => setProgramFilter(value)}
                      placeholder="Program"
                      className="pl-10 h-12 border-slate-200 focus:border-green-500 focus:ring-2 focus:ring-green-100 rounded-xl"
                    >
                      <option value="">All Programs</option>
                      {programs.map((program) => (
                        <option key={program} value={program}>
                          {program}
                        </option>
                      ))}
                    </CustomSelect>
                  </div>

                  <div className="relative w-full sm:w-48">
                    <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none z-10" />
                    <CustomSelect
                      value={classFilter}
                      onValueChange={(value) => setClassFilter(value)}
                      placeholder="Class"
                      className="pl-10 h-12 border-slate-200 focus:border-green-500 focus:ring-2 focus:ring-green-100 rounded-xl"
                    >
                      <option value="">All Classes</option>
                      {classes.map((cls) => (
                        <option key={cls} value={cls}>
                          {cls}
                        </option>
                      ))}
                    </CustomSelect>
                  </div>

                  <div className="relative w-full sm:w-48">
                    <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none z-10" />
                    <CustomSelect
                      value={statusFilter}
                      onValueChange={(value) => setStatusFilter(value)}
                      placeholder="Status"
                      className="pl-10 h-12 border-slate-200 focus:border-green-500 focus:ring-2 focus:ring-green-100 rounded-xl"
                    >
                      <option value="">All Status</option>
                      <option value="Active">Active</option>
                      <option value="Sick">Sick</option>
                    </CustomSelect>
                  </div>
                </div>
              </div>

              {/* Active Filters Display */}
              {(programFilter ||
                classFilter ||
                statusFilter ||
                searchQuery) && (
                <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-100">
                  <span className="text-sm text-slate-600 font-medium">
                    Active filters:
                  </span>
                  {searchQuery && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Search: &quot;{searchQuery}&rdquo;
                      <button
                        onClick={() => setSearchQuery("")}
                        className="ml-2 hover:text-green-900"
                      >
                        ×
                      </button>
                    </span>
                  )}
                  {programFilter && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Program: {programFilter}
                      <button
                        onClick={() => setProgramFilter("")}
                        className="ml-2 hover:text-blue-900"
                      >
                        ×
                      </button>
                    </span>
                  )}
                  {classFilter && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      Class: {classFilter}
                      <button
                        onClick={() => setClassFilter("")}
                        className="ml-2 hover:text-purple-900"
                      >
                        ×
                      </button>
                    </span>
                  )}
                  {statusFilter && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                      Status: {statusFilter}
                      <button
                        onClick={() => setStatusFilter("")}
                        className="ml-2 hover:text-orange-900"
                      >
                        ×
                      </button>
                    </span>
                  )}
                </div>
              )}

              {/* Add Student Button */}
              <div className="mt-4 pt-4 border-t border-slate-100">
                <Button
                  onClick={() =>
                    handleNavigation("/dashboard/add-student")
                  }
                  className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-emerald-500/25 hover:shadow-xl transition-all duration-300 w-full sm:w-auto border-0"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Student
                </Button>
              </div>
          </div>
        </div>

        {/* Students List */}
        <div>
          <div className="rounded-2xl shadow-lg bg-white/80 backdrop-blur-sm p-6 border-0">
              <div className="space-y-3">
                {loading && (
                  <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                      <StudentCardSkeleton key={i} />
                    ))}
                  </div>
                )}
                
                {error && (
                  <div className="text-center py-12">
                    <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">Error loading students</h3>
                    <p className="text-slate-600 mb-4">{error}</p>
                    <Button onClick={fetchStudents} className="bg-green-600 hover:bg-green-700">
                      Try Again
                    </Button>
                  </div>
                )}

                {!loading && !error && displayStudents.slice(startIndex, endIndex).map((student) => (
                  <div
                    key={student.id}
                    className="p-5 rounded-xl bg-gradient-to-br from-slate-50 to-white shadow-sm hover:shadow-md transition-all duration-300 border-0"
                  >
                    {/* Mobile Layout */}
                    <div className="block md:hidden">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
                            <User className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-slate-900">
                              {student.name}
                            </h3>
                            <p className="text-sm text-slate-500">
                              {student.studentId || student.id}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            student.status === "Active"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-rose-100 text-rose-700"
                          }`}
                        >
                          {student.status}
                        </span>
                      </div>

                      {/* Essential mobile info */}
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2">
                          <GraduationCap className="h-4 w-4 text-green-500" />
                          <span className="text-sm font-medium">
                            {student.program}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-green-500" />
                          <span className="text-sm">{student.semester}</span>
                        </div>
                      </div>

                      {/* Mobile actions */}
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleView(student.id)}
                          className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white min-h-[44px] transition-all duration-200 rounded-xl font-medium border-0"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button
                          size="sm"
                          onClick={() =>
                            handleNavigation(
                              `/dashboard/edit-student/${student.id}`
                            )
                          }
                          className="flex-1 bg-blue-500 hover:bg-blue-600 text-white min-h-[44px] transition-all duration-200 rounded-xl font-medium border-0"
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleDelete(student.id)}
                          className="flex-1 bg-rose-500 hover:bg-rose-600 text-white min-h-[44px] transition-all duration-200 rounded-xl font-medium border-0"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>

                    {/* Tablet Layout */}
                    <div className="hidden md:block lg:hidden">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
                            <User className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-slate-900">
                              {student.name}
                            </h3>
                            <p className="text-sm text-slate-500">
                              {student.studentId || student.id}
                            </p>
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              student.status === "Active"
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-rose-100 text-rose-700"
                            }`}
                          >
                            {student.status}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleView(student.id)}
                            className="bg-emerald-500 hover:bg-emerald-600 text-white transition-all duration-200 rounded-xl font-medium px-4 border-0"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            onClick={() =>
                              handleNavigation(
                                `/dashboard/edit-student/${student.id}`
                              )
                            }
                            className="bg-blue-500 hover:bg-blue-600 text-white transition-all duration-200 rounded-xl font-medium px-4 border-0"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleDelete(student.id)}
                            className="bg-rose-500 hover:bg-rose-600 text-white transition-all duration-200 rounded-xl font-medium px-4 border-0"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                        <div className="flex items-center gap-2">
                          <GraduationCap className="h-4 w-4 text-green-500" />
                          <div>
                            <span className="text-slate-500 text-xs">
                              Program
                            </span>
                            <p className="font-medium text-slate-900">
                              {student.program}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-green-500" />
                          <div>
                            <span className="text-slate-500 text-xs">
                              Semester
                            </span>
                            <p className="font-medium text-slate-900">
                              {student.semester}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-slate-600">
                        <div className="flex items-center gap-1">
                          <Phone className="h-4 w-4" />
                          <span>{student.phone}</span>
                        </div>
                      </div>
                    </div>

                    {/* Desktop Layout */}
                    <div className="hidden lg:block">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="h-12 w-12 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
                              <User className="h-6 w-6 text-white" />
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-slate-900">
                                {student.name}
                              </h3>
                              <p className="text-sm text-slate-500">
                                {student.studentId || student.id}
                              </p>
                            </div>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                student.status === "Active"
                                  ? "bg-emerald-100 text-emerald-700"
                                  : "bg-rose-100 text-rose-700"
                              }`}
                            >
                              {student.status}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <GraduationCap className="h-4 w-4 text-green-500" />
                              <div>
                                <span className="text-slate-500 text-xs">
                                  Program
                                </span>
                                <p className="font-medium text-slate-900">
                                  {student.program}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-green-500" />
                              <div>
                                <span className="text-slate-500 text-xs">
                                  Semester
                                </span>
                                <p className="font-medium text-slate-900">
                                  {student.semester}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 mt-3 text-sm text-slate-600">
                            <div className="flex items-center gap-1">
                              <Phone className="h-4 w-4" />
                              <span>{student.phone}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleView(student.id)}
                            className="bg-emerald-500 hover:bg-emerald-600 text-white transition-all duration-200 rounded-xl font-medium px-4 py-2 shadow-sm hover:shadow-md border-0"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Button>
                          <Button
                            size="sm"
                            onClick={() =>
                              handleNavigation(
                                `/dashboard/edit-student/${student.id}`
                              )
                            }
                            className="bg-blue-500 hover:bg-blue-600 text-white transition-all duration-200 rounded-xl font-medium px-4 py-2 shadow-sm hover:shadow-md border-0"
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleDelete(student.id)}
                            className="bg-rose-500 hover:bg-rose-600 text-white transition-all duration-200 rounded-xl font-medium px-4 py-2 shadow-sm hover:shadow-md border-0"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {!loading && !error && displayStudents.length === 0 && (
                  <div className="text-center py-12">
                    <User className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">
                      No students found
                    </h3>
                    <p className="text-slate-600 mb-4">
                      {searchQuery
                        ? "Try adjusting your search criteria"
                        : "No students have been added yet"}
                    </p>
                    <Button
                      onClick={() =>
                        handleNavigation("/dashboard/add-student")
                      }
                      className="bg-green-600 hover:bg-green-700 text-white focus:ring-2 focus:ring-green-100 transition-all duration-300"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add First Student
                    </Button>
                  </div>
                )}
              </div>

              {/* Pagination */}
              {!loading && !error && displayStudents.length > itemsPerPage && (
                <div className="mt-6 pt-6 border-t border-slate-100">
                  {/* Mobile Pagination */}
                  <div className="flex flex-col gap-4 sm:hidden">
                    <p className="text-sm text-slate-600 text-center">
                      Showing {startIndex + 1} to {Math.min(endIndex, displayStudents.length)} of {displayStudents.length} students
                    </p>
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-50 transition-all duration-200 px-4"
                      >
                        Previous
                      </Button>
                      <span className="px-3 py-1 text-sm font-medium text-slate-700">
                        {currentPage} / {totalPages}
                      </span>
                      <Button
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-50 transition-all duration-200 px-4"
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                  
                  {/* Desktop Pagination */}
                  <div className="hidden sm:flex items-center justify-between">
                    <p className="text-sm text-slate-600">
                      Showing {startIndex + 1} to {Math.min(endIndex, displayStudents.length)} of {displayStudents.length} students
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-50 transition-all duration-200"
                      >
                        Previous
                      </Button>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                          // Show limited pages on smaller screens
                          const showPage = totalPages <= 5 || 
                            page === 1 || 
                            page === totalPages || 
                            Math.abs(page - currentPage) <= 1;
                          
                          if (!showPage) {
                            // Show ellipsis
                            if (page === 2 && currentPage > 3) {
                              return <span key={page} className="px-1 text-slate-400">...</span>;
                            }
                            if (page === totalPages - 1 && currentPage < totalPages - 2) {
                              return <span key={page} className="px-1 text-slate-400">...</span>;
                            }
                            return null;
                          }
                          
                          return (
                            <button
                              key={page}
                              onClick={() => setCurrentPage(page)}
                              className={`w-8 h-8 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-110 active:scale-95 ${
                                currentPage === page
                                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                                  : 'text-slate-600 hover:bg-slate-100'
                              }`}
                            >
                              {page}
                            </button>
                          );
                        })}
                      </div>
                      <Button
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-50 transition-all duration-200"
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                </div>
              )}
          </div>
        </div>
      </PageContainer>

      {/* View Student Dialog */}
      {viewStudentId && (
        <ViewStudentDialog
          studentId={viewStudentId}
          open={viewDialogOpen}
          onOpenChange={setViewDialogOpen}
        />
      )}
    </ModernDashboardLayout>
  );
}
