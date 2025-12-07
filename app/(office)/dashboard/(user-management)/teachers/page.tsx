"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  ModernDashboardLayout,
  PageContainer,
} from "@/components/layout/modern-dashboard-layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GraduationCap, Plus, Search, Filter, Users, UserCheck, UserX, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { CustomSelect } from "@/components/ui/custom-select";
import { motion } from "framer-motion";
import { TeacherCard, TeacherCardSkeleton } from "@/components/shared/teacher-card";
import { ViewTeacherDialog } from "@/components/shared/view-teacher-dialog";
import { handleLogout as performLogout } from "@/lib/auth/logout";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { AuthLoadingScreen } from "@/components/ui/auth-loading";

// Teacher interface from API
interface Teacher {
  id: string;
  firstName: string;
  lastName: string;
  teacherId: string;
  phone: string;
  secondaryPhone?: string;
  departments: string;
  qualification: string;
  experience: string;
  specialization: string;
  subjects: string;
  classes: string;
  status: string;
  email?: string;
}

export default function TeacherListPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth({ requiredRole: 'OFFICE' });
  const [searchQuery, setSearchQuery] = React.useState("");
  const [departmentFilter, setDepartmentFilter] = React.useState("");
  const [subjectFilter, setSubjectFilter] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("");
  const [currentPath] = React.useState("/dashboard/teachers");
  const [teachers, setTeachers] = React.useState<Teacher[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [viewTeacherId, setViewTeacherId] = React.useState<string | null>(null);
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

  const handleView = (id: string) => {
    setViewTeacherId(id);
    setViewDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    // Find the teacher to show confirmation
    const teacher = teachers.find(t => t.id === id);
    if (!teacher) return;

    // Show confirmation toast (destructive)
    toast.error(
      `Delete ${teacher.firstName} ${teacher.lastName}?`,
      {
        description: 'This action cannot be undone.',
        position: 'bottom-center',
        className: 'bg-red-100 border-red-200 text-red-900',
        action: {
          label: 'Delete',
          onClick: async () => {
            try {
              const response = await fetch(`/api/teachers/${id}`, {
                method: 'DELETE',
              });

              if (!response.ok) {
                throw new Error('Failed to delete teacher');
              }

              // Remove teacher from local state
              setTeachers(teachers.filter(t => t.id !== id));
              
              // Show success message
              toast.success('Teacher deleted successfully', {
                description: `${teacher.firstName} ${teacher.lastName} has been removed.`,
                className: 'bg-green-50 border-green-200 text-green-900',
              });
            } catch (err) {
              console.error('Error deleting teacher:', err);
              toast.error('Failed to delete teacher', {
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

  // Fetch teachers from API
  const fetchTeachers = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Build query parameters
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (departmentFilter) params.append('department', departmentFilter);
      if (subjectFilter) params.append('subject', subjectFilter);
      if (statusFilter) params.append('status', statusFilter);

      const response = await fetch(`/api/teachers?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch teachers');
      }

      const data = await response.json();
      setTeachers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching teachers:', err);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, departmentFilter, subjectFilter, statusFilter]);

  // Fetch teachers on component mount and when filters change
  React.useEffect(() => {
    fetchTeachers();
  }, [fetchTeachers]);

  // Get unique departments and subjects for filter options
  const departments = React.useMemo(() => {
    const depts = new Set<string>();
    teachers.forEach(teacher => {
      if (teacher.departments) {
        // Handle both array and string formats
        const deptList = Array.isArray(teacher.departments) 
          ? teacher.departments 
          : teacher.departments.split(',');
        deptList.forEach(d => depts.add(typeof d === 'string' ? d.trim() : d));
      }
    });
    return Array.from(depts);
  }, [teachers]);

  const subjects = React.useMemo(() => {
    const subjs = new Set<string>();
    teachers.forEach(teacher => {
      if (teacher.subjects) {
        // Handle both array and string formats
        const subjList = Array.isArray(teacher.subjects)
          ? teacher.subjects
          : teacher.subjects.split(',');
        subjList.forEach(s => subjs.add(typeof s === 'string' ? s.trim() : s));
      }
    });
    return Array.from(subjs);
  }, [teachers]);

  // Calculate statistics
  const totalTeachers = teachers.length;
  const activeTeachers = teachers.filter(teacher => teacher.status === "ACTIVE").length;
  const inactiveTeachers = teachers.filter(teacher => teacher.status === "INACTIVE").length;

  // Pagination calculations
  const totalPages = Math.ceil(teachers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  // Reset to page 1 when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, departmentFilter, subjectFilter, statusFilter]);

  // Transform teachers for display
  const displayTeachers = teachers.map(teacher => {
    // Handle departments - can be array or string
    const deptStr = Array.isArray(teacher.departments)
      ? teacher.departments.join(', ')
      : teacher.departments || '';
    
    // Handle subjects - can be array or string
    const subjList = Array.isArray(teacher.subjects)
      ? teacher.subjects
      : teacher.subjects ? teacher.subjects.split(',').map(s => s.trim()) : [];
    
    // Handle classes - can be array or string
    const classCount = Array.isArray(teacher.classes)
      ? teacher.classes.length
      : teacher.classes ? teacher.classes.split(',').length : 0;
    
    return {
      id: teacher.id, // Database UUID for API calls
      teacherId: teacher.teacherId, // Custom teacher ID for display
      name: `${teacher.firstName} ${teacher.lastName}`,
      department: deptStr,
      phone: teacher.phone,
      qualification: teacher.qualification,
      experience: teacher.experience,
      status: (teacher.status === 'ACTIVE' ? 'Active' : 'Inactive') as 'Active' | 'Inactive' | 'On Leave',
      classes: classCount,
      subjects: subjList,
      email: teacher.email || '',
    };
  });

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
      title="Teacher List"
      subtitle="Manage all teacher accounts"
      currentPath={currentPath}
      onNavigate={handleNavigation}
      onLogout={handleLogout}
      onSearch={handleSearch}
      hideSearch={true}
    >
      <PageContainer>
        {/* Statistics Summary */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6"
        >
          <motion.div 
            whileHover={{ scale: 1.02, y: -2 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="rounded-2xl shadow-lg bg-gradient-to-br from-orange-50 to-orange-100/80 p-6 border-0"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600 mb-1">Total Teachers</p>
                <p className="text-3xl font-bold text-orange-700">{totalTeachers}</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg shadow-orange-500/30">
                <Users className="h-6 w-6 text-white" />
              </div>
            </div>
          </motion.div>

          <motion.div 
            whileHover={{ scale: 1.02, y: -2 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="rounded-2xl shadow-lg bg-gradient-to-br from-emerald-50 to-emerald-100/80 p-6 border-0"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-emerald-600 mb-1">Active Teachers</p>
                <p className="text-3xl font-bold text-emerald-700">{activeTeachers}</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg shadow-emerald-500/30">
                <UserCheck className="h-6 w-6 text-white" />
              </div>
            </div>
          </motion.div>

          <motion.div 
            whileHover={{ scale: 1.02, y: -2 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="rounded-2xl shadow-lg bg-gradient-to-br from-rose-50 to-rose-100/80 p-6 border-0"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-rose-600 mb-1">Inactive Teachers</p>
                <p className="text-3xl font-bold text-rose-700">{inactiveTeachers}</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-rose-500 to-rose-600 rounded-xl shadow-lg shadow-rose-500/30">
                <UserX className="h-6 w-6 text-white" />
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Search and Filter Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="mb-6"
        >
          <div className="rounded-2xl shadow-lg bg-white/80 backdrop-blur-sm p-6 border-0">
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Search Bar */}
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search by name, department, subject, or ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-12 border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 rounded-xl"
                  />
                </div>

                {/* Filter Options */}
                <div className="flex flex-col sm:flex-row gap-3 lg:w-auto">
                  <div className="relative w-full sm:w-48">
                    <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none z-10" />
                    <CustomSelect
                      value={departmentFilter}
                      onValueChange={(value) => setDepartmentFilter(value)}
                      placeholder="Department"
                      className="pl-10 h-12 border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 rounded-xl"
                    >
                      <option value="">All Departments</option>
                      {departments.map((dept) => (
                        <option key={dept} value={dept}>
                          {dept}
                        </option>
                      ))}
                    </CustomSelect>
                  </div>

                  <div className="relative w-full sm:w-48">
                    <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none z-10" />
                    <CustomSelect
                      value={subjectFilter}
                      onValueChange={(value) => setSubjectFilter(value)}
                      placeholder="Subject"
                      className="pl-10 h-12 border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 rounded-xl"
                    >
                      <option value="">All Subjects</option>
                      {subjects.map((subject) => (
                        <option key={subject} value={subject}>
                          {subject}
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
                      className="pl-10 h-12 border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 rounded-xl"
                    >
                      <option value="">All Status</option>
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </CustomSelect>
                  </div>
                </div>
              </div>
                <div className="mt-4 pt-4 border-t border-slate-200">
                <Button
                  onClick={() =>
                    handleNavigation("/dashboard/add-teacher")
                  }
                  className="bg-orange-500 hover:text-white hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 w-full sm:w-auto focus:ring-2 focus:ring-green-100"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Teacher
                </Button>
              </div>
              {/* Active Filters Display */}
              {(departmentFilter || subjectFilter || statusFilter || searchQuery) && (
                <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-100">
                  <span className="text-sm text-slate-600 font-medium">Active filters:</span>
                  {searchQuery && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                      Search: &quot;{searchQuery}&rdquo;
                      <button
                        onClick={() => setSearchQuery("")}
                        className="ml-2 hover:text-orange-900"
                      >
                        ×
                      </button>
                    </span>
                  )}
                  {departmentFilter && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Department: {departmentFilter}
                      <button
                        onClick={() => setDepartmentFilter("")}
                        className="ml-2 hover:text-blue-900"
                      >
                        ×
                      </button>
                    </span>
                  )}
                  {subjectFilter && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Subject: {subjectFilter}
                      <button
                        onClick={() => setSubjectFilter("")}
                        className="ml-2 hover:text-green-900"
                      >
                        ×
                      </button>
                    </span>
                  )}
                  {statusFilter && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      Status: {statusFilter}
                      <button
                        onClick={() => setStatusFilter("")}
                        className="ml-2 hover:text-purple-900"
                      >
                        ×
                      </button>
                    </span>
                  )}
                </div>
              )}
          </div>
        </motion.div>

        {/* Teachers List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          <div className="rounded-2xl shadow-lg bg-white/80 backdrop-blur-sm border-0">
            <div className="p-6 pb-4">
              <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                  <GraduationCap className="h-6 w-6 text-orange-600" />
                </motion.div>
                Teachers ({displayTeachers.length})
              </h2>
            </div>
            <div className="px-6 pb-6">
              <div className="space-y-3">
                {loading && (
                  <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                      <TeacherCardSkeleton key={i} />
                    ))}
                  </div>
                )}
                
                {error && (
                  <div className="text-center py-12">
                    <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">Error loading teachers</h3>
                    <p className="text-slate-600 mb-4">{error}</p>
                    <Button onClick={fetchTeachers} className="bg-orange-600 hover:bg-orange-700">
                      Try Again
                    </Button>
                  </div>
                )}

                {!loading && !error && displayTeachers.slice(startIndex, endIndex).map((teacher, index) => (
                  <TeacherCard
                    key={teacher.id}
                    teacher={teacher}
                    index={index}
                    onView={handleView}
                    onEdit={(id) =>
                      handleNavigation(`/dashboard/edit-teacher/${id}`)
                    }
                    onDelete={handleDelete}
                  />
                ))}

                {!loading && !error && displayTeachers.length === 0 && (
                  <div className="text-center py-12">
                    <GraduationCap className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">
                      No teachers found
                    </h3>
                    <p className="text-slate-600 mb-4">
                      {searchQuery
                        ? "Try adjusting your search criteria"
                        : "No teachers have been added yet"}
                    </p>
                    <Button
                      onClick={() =>
                        handleNavigation("/dashboard/add-teacher")
                      }
                      className="bg-orange-600 hover:bg-orange-700 text-white focus:ring-2 focus:ring-orange-100"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add First Teacher
                    </Button>
                  </div>
                )}
              </div>

              {/* Pagination */}
              {!loading && !error && displayTeachers.length > itemsPerPage && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="mt-6 pt-6 border-t border-slate-100"
                >
                  {/* Mobile Pagination */}
                  <div className="flex flex-col gap-4 sm:hidden">
                    <p className="text-sm text-slate-600 text-center">
                      Showing {startIndex + 1} to {Math.min(endIndex, displayTeachers.length)} of {displayTeachers.length} teachers
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
                      Showing {startIndex + 1} to {Math.min(endIndex, displayTeachers.length)} of {displayTeachers.length} teachers
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
                            <motion.button
                              key={page}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => setCurrentPage(page)}
                              className={`w-8 h-8 rounded-lg text-sm font-medium transition-all duration-200 ${
                                currentPage === page
                                  ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30'
                                  : 'text-slate-600 hover:bg-slate-100'
                              }`}
                            >
                              {page}
                            </motion.button>
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
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      </PageContainer>

      {/* View Teacher Dialog */}
      {viewTeacherId && (
        <ViewTeacherDialog
          teacherId={viewTeacherId}
          open={viewDialogOpen}
          onOpenChange={setViewDialogOpen}
        />
      )}
    </ModernDashboardLayout>
  );
}
