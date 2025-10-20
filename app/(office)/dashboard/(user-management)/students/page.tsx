"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  ModernDashboardLayout,
  PageContainer,
} from "@/components/layout/modern-dashboard-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  Loader2,
} from "lucide-react";
import { CustomSelect } from "@/components/ui/custom-select";
import { ViewStudentDialog } from "@/components/shared/view-student-dialog";
import { handleLogout as performLogout } from "@/lib/auth/logout";
import { toast } from "sonner";

// Sample user data
const sampleUser = {
  name: "Dr. Sarah Ahmed",
  email: "sarah.ahmed@university.edu",
  role: "OFFICE" as const,
  avatar: undefined,
};

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

export default function StudentListPage() {
  const router = useRouter();
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

  return (
    <ModernDashboardLayout
      user={sampleUser}
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
          <Card className="rounded-2xl shadow-md border-slate-200/60 bg-gradient-to-br from-green-50 to-green-100/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600 mb-1">
                    Total Students
                  </p>
                  <p className="text-3xl font-bold text-green-700">
                    {totalStudents}
                  </p>
                </div>
                <div className="p-3 bg-green-600 rounded-xl">
                  <Users className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-md border-slate-200/60 bg-gradient-to-br from-blue-50 to-blue-100/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600 mb-1">
                    Active Students
                  </p>
                  <p className="text-3xl font-bold text-blue-700">
                    {activeStudents}
                  </p>
                </div>
                <div className="p-3 bg-blue-600 rounded-xl">
                  <UserCheck className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-md border-slate-200/60 bg-gradient-to-br from-red-50 to-red-100/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-600 mb-1">
                    Sick Students
                  </p>
                  <p className="text-3xl font-bold text-red-700">
                    {sickStudents}
                  </p>
                </div>
                <div className="p-3 bg-red-600 rounded-xl">
                  <HeartPulse className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter Section */}
        <div className="mb-6">
          <Card className="rounded-2xl shadow-lg border-slate-200/60">
            <CardContent className="p-6">
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
                <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-200">
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
              <div className="mt-4 pt-4 border-t border-slate-200">
                <Button
                  onClick={() =>
                    handleNavigation("/dashboard/add-student")
                  }
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 w-full sm:w-auto focus:ring-2 focus:ring-green-100"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Student
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Students List */}
        <div>
          <Card className="rounded-2xl shadow-lg border-slate-200/60">
            <CardContent className="p-6">
              <div className="space-y-4">
                {loading && (
                  <div className="text-center py-12">
                    <Loader2 className="h-12 w-12 text-green-600 mx-auto mb-4 animate-spin" />
                    <p className="text-slate-600">Loading students...</p>
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

                {!loading && !error && displayStudents.map((student) => (
                  <div
                    key={student.id}
                    className="p-6 border border-slate-200 rounded-xl hover:shadow-md transition-shadow duration-200 bg-white"
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
                        <Badge
                          variant="outline"
                          className={
                            student.status === "Active"
                              ? "bg-green-100 text-green-800 border-green-200"
                              : "bg-red-100 text-red-800 border-red-200"
                          }
                        >
                          {student.status}
                        </Badge>
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
                          variant="outline"
                          size="sm"
                          onClick={() => handleView(student.id)}
                          className="flex-1 border-green-200 text-green-700 hover:bg-green-50 hover:border-green-300 focus:ring-2 focus:ring-green-100 min-h-[44px] transition-all duration-200 rounded-xl font-medium"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleNavigation(
                              `/dashboard/edit-student/${student.id}`
                            )
                          }
                          className="flex-1 border-green-200 text-green-600 hover:bg-green-50 hover:border-green-300 focus:ring-2 focus:ring-green-100 min-h-[44px] transition-all duration-200 rounded-xl font-medium"
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(student.id)}
                          className="flex-1 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 focus:ring-2 focus:ring-red-100 min-h-[44px] transition-all duration-200 rounded-xl font-medium"
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
                          <Badge
                            variant="outline"
                            className={
                              student.status === "Active"
                                ? "bg-green-100 text-green-800 border-green-200"
                                : "bg-red-100 text-red-800 border-red-200"
                            }
                          >
                            {student.status}
                          </Badge>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleView(student.id)}
                            className="border-green-200 text-green-700 hover:bg-green-50 hover:border-green-300 focus:ring-2 focus:ring-green-100 transition-all duration-200 rounded-xl font-medium px-4"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleNavigation(
                                `/dashboard/edit-student/${student.id}`
                              )
                            }
                            className="border-green-200 text-green-600 hover:bg-green-50 hover:border-green-300 focus:ring-2 focus:ring-green-100 transition-all duration-200 rounded-xl font-medium px-4"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(student.id)}
                            className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 focus:ring-2 focus:ring-red-100 transition-all duration-200 rounded-xl font-medium px-4"
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
                            <Badge
                              variant="outline"
                              className={
                                student.status === "Active"
                                  ? "bg-green-100 text-green-800 border-green-200"
                                  : "bg-red-100 text-red-800 border-red-200"
                              }
                            >
                              {student.status}
                            </Badge>
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

                        <div className="flex gap-3">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleView(student.id)}
                            className="border-green-200 text-green-700 hover:bg-green-50 hover:border-green-300 focus:ring-2 focus:ring-green-100 transition-all duration-200 rounded-xl font-medium px-4 py-2 shadow-sm hover:shadow-md"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleNavigation(
                                `/dashboard/edit-student/${student.id}`
                              )
                            }
                            className="border-green-200 text-green-600 hover:bg-green-50 hover:border-green-300 focus:ring-2 focus:ring-green-100 transition-all duration-200 rounded-xl font-medium px-4 py-2 shadow-sm hover:shadow-md"
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(student.id)}
                            className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 focus:ring-2 focus:ring-red-100 transition-all duration-200 rounded-xl font-medium px-4 py-2 shadow-sm hover:shadow-md"
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
            </CardContent>
          </Card>
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
