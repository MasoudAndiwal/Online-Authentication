"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  ModernDashboardLayout,
  PageContainer,
} from "@/components/layout/modern-dashboard-layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GraduationCap, Plus, Search, Filter, Users, UserCheck, UserX } from "lucide-react";
import { Input } from "@/components/ui/input";
import { CustomSelect } from "@/components/ui/custom-select";
import { motion } from "framer-motion";
import { TeacherCard } from "@/components/shared/teacher-card";

// Sample user data
const sampleUser = {
  name: "Dr. Sarah Ahmed",
  email: "sarah.ahmed@university.edu",
  role: "OFFICE" as const,
  avatar: undefined,
};

// Sample teachers data
const sampleTeachers = [
  {
    id: "TCH-2024-001",
    name: "Dr. Mohammad Ali",
    department: "Computer Science",
    phone: "+1 (555) 123-4567",
    qualification: "PhD in Computer Science",
    experience: "8 years",
    status: "Active" as const,
    classes: 5,
    subjects: ["Data Structures", "Algorithms", "Programming"],
  },
  {
    id: "TCH-2024-002",
    name: "Prof. Fatima Khan",
    department: "Mathematics",
    phone: "+1 (555) 234-5678",
    qualification: "PhD in Mathematics",
    experience: "12 years",
    status: "Active" as const,
    classes: 4,
    subjects: ["Calculus", "Linear Algebra", "Statistics"],
  },
  {
    id: "TCH-2024-003",
    name: "Dr. Ahmed Hassan",
    department: "Physics",
    phone: "+1 (555) 345-6789",
    qualification: "PhD in Physics",
    experience: "6 years",
    status: "Active" as const,
    classes: 3,
    subjects: ["Quantum Physics", "Thermodynamics"],
  },
  {
    id: "TCH-2024-004",
    name: "Dr. Aisha Rahman",
    department: "Chemistry",
    phone: "+1 (555) 456-7890",
    qualification: "PhD in Chemistry",
    experience: "10 years",
    status: "Inactive" as const,
    classes: 0,
    subjects: ["Organic Chemistry", "Biochemistry"],
  },
  {
    id: "TCH-2024-005",
    name: "Dr. Omar Malik",
    department: "Engineering",
    phone: "+1 (555) 567-8901",
    qualification: "PhD in Engineering",
    experience: "5 years",
    status: "Active" as const,
    classes: 3,
    subjects: ["Circuit Design", "Electronics"],
  },
  {
    id: "TCH-2024-006",
    name: "Prof. Zara Ahmed",
    department: "Computer Science",
    phone: "+1 (555) 678-9012",
    qualification: "PhD in Computer Science",
    experience: "15 years",
    status: "Inactive" as const,
    classes: 0,
    subjects: ["Machine Learning", "AI"],
  },
];

export default function TeacherListPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [departmentFilter, setDepartmentFilter] = React.useState("");
  const [subjectFilter, setSubjectFilter] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("");
  const [currentPath] = React.useState("/dashboard/teachers");

  const handleNavigation = (href: string) => {
    try {
      router.push(href);
    } catch (error) {
      console.error("Navigation failed:", error);
      window.location.href = href;
    }
  };

  const handleLogout = () => {
    console.log("Logout clicked");
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  // Get unique departments and subjects for filter options
  const departments = [...new Set(sampleTeachers.map(teacher => teacher.department))];
  const subjects = [...new Set(sampleTeachers.flatMap(teacher => teacher.subjects))];

  const filteredTeachers = sampleTeachers.filter((teacher) => {
    const matchesSearch = 
      teacher.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      teacher.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      teacher.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      teacher.subjects.some(subject => subject.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesDepartment = !departmentFilter || teacher.department === departmentFilter;
    const matchesSubject = !subjectFilter || teacher.subjects.includes(subjectFilter);
    const matchesStatus = !statusFilter || teacher.status === statusFilter;

    return matchesSearch && matchesDepartment && matchesSubject && matchesStatus;
  });

  // Calculate statistics
  const totalTeachers = sampleTeachers.length;
  const activeTeachers = sampleTeachers.filter(teacher => teacher.status === "Active").length;
  const inactiveTeachers = sampleTeachers.filter(teacher => teacher.status === "Inactive").length;

  return (
    <ModernDashboardLayout
      user={sampleUser}
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
          <Card className="rounded-2xl shadow-md border-slate-200/60 bg-gradient-to-br from-orange-50 to-orange-100/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600 mb-1">Total Teachers</p>
                  <p className="text-3xl font-bold text-orange-700">{totalTeachers}</p>
                </div>
                <div className="p-3 bg-orange-600 rounded-xl">
                  <Users className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-md border-slate-200/60 bg-gradient-to-br from-green-50 to-green-100/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600 mb-1">Active Teachers</p>
                  <p className="text-3xl font-bold text-green-700">{activeTeachers}</p>
                </div>
                <div className="p-3 bg-green-600 rounded-xl">
                  <UserCheck className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-md border-slate-200/60 bg-gradient-to-br from-red-50 to-red-100/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-600 mb-1">Inactive Teachers</p>
                  <p className="text-3xl font-bold text-red-700">{inactiveTeachers}</p>
                </div>
                <div className="p-3 bg-red-600 rounded-xl">
                  <UserX className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Search and Filter Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="mb-6"
        >
          <Card className="rounded-2xl shadow-lg border-slate-200/60">
            <CardContent className="p-6">
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
                <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-200">
                  <span className="text-sm text-slate-600 font-medium">Active filters:</span>
                  {searchQuery && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                      Search: "{searchQuery}"
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
            </CardContent>
          </Card>
        </motion.div>

        {/* Teachers List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          <Card className="rounded-2xl shadow-lg border-slate-200/60">
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                  <GraduationCap className="h-6 w-6 text-orange-600" />
                </motion.div>
                Teachers ({filteredTeachers.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredTeachers.map((teacher, index) => (
                  <TeacherCard
                    key={teacher.id}
                    teacher={teacher}
                    index={index}
                    onEdit={(id) =>
                      handleNavigation(`/dashboard/edit-teacher/${id}`)
                    }
                    onDelete={(id) => console.log("Delete teacher:", id)}
                  />
                ))}

                {filteredTeachers.length === 0 && (
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
            </CardContent>
          </Card>
        </motion.div>
      </PageContainer>
    </ModernDashboardLayout>
  );
}
