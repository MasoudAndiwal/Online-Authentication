"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  ModernDashboardLayout,
  PageContainer,
  PageHeader,
} from "@/components/layout/modern-dashboard-layout";
import {
  ModernCard,
  ModernCardHeader,
  ModernCardTitle,
  ModernCardContent,
} from "@/components/ui/modern-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  Search, 
  Plus, 
  Mail, 
  Phone, 
  Edit, 
  Trash2, 
  BookOpen
} from "lucide-react";
import { motion } from "framer-motion";

// Sample user data
const sampleUser = {
  name: "Dr. Sarah Ahmed",
  email: "sarah.ahmed@university.edu",
  role: "OFFICE" as const,
  avatar: undefined,
};

// Sample students data
const sampleStudents = [
  {
    id: "CS-2024-001",
    name: "Ahmad Hassan",
    email: "ahmad.hassan@student.university.edu",
    program: "Computer Science",
    year: "2nd Year",
    phone: "+1 (555) 111-2222",
    semester: "Fall 2024",
    gpa: "3.8",
    status: "Active",
    attendance: "92%",
  },
  {
    id: "CS-2024-002",
    name: "Sara Khan",
    email: "sara.khan@student.university.edu",
    program: "Computer Science",
    year: "1st Year",
    phone: "+1 (555) 222-3333",
    semester: "Fall 2024",
    gpa: "3.9",
    status: "Active",
    attendance: "95%",
  },
  {
    id: "MATH-2024-001",
    name: "Omar Ali",
    email: "omar.ali@student.university.edu",
    program: "Mathematics",
    year: "3rd Year",
    phone: "+1 (555) 333-4444",
    semester: "Fall 2024",
    gpa: "3.6",
    status: "Active",
    attendance: "88%",
  },
  {
    id: "PHY-2024-001",
    name: "Layla Ahmed",
    email: "layla.ahmed@student.university.edu",
    program: "Physics",
    year: "2nd Year",
    phone: "+1 (555) 444-5555",
    semester: "Fall 2024",
    gpa: "3.7",
    status: "On Leave",
    attendance: "0%",
  },
  {
    id: "CS-2024-003",
    name: "Yusuf Rahman",
    email: "yusuf.rahman@student.university.edu",
    program: "Computer Science",
    year: "4th Year",
    phone: "+1 (555) 555-6666",
    semester: "Fall 2024",
    gpa: "3.5",
    status: "Active",
    attendance: "85%",
  },
];

export default function StudentListPage() {
  const router = useRouter();
  const [currentPath] = React.useState("/user-management/students");
  const [searchQuery, setSearchQuery] = React.useState("");

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

  const filteredStudents = sampleStudents.filter(student =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.program.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getAttendanceColor = (attendance: string) => {
    const percent = parseInt(attendance);
    if (percent >= 90) return "text-green-600 bg-green-50 border-green-200";
    if (percent >= 75) return "text-yellow-600 bg-yellow-50 border-yellow-200";
    return "text-red-600 bg-red-50 border-red-200";
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
    >
      <PageContainer>
        <PageHeader
          title="All Students"
          subtitle="View and manage all student accounts in the system"
          breadcrumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "User Management", href: "/user-management" },
            { label: "All Users" },
            { label: "Student List" },
          ]}
          actions={
            <Button
              onClick={() => handleNavigation("/user-management/add-student")}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Student
            </Button>
          }
        />

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <ModernCard className="mb-6">
            <ModernCardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search students by name, program, or ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 border-slate-200 focus:border-purple-500"
                  />
                </div>
                <div className="flex gap-2">
                  <Badge variant="outline" className="px-3 py-2">
                    Total: {sampleStudents.length}
                  </Badge>
                  <Badge variant="outline" className="px-3 py-2 bg-green-50 text-green-700 border-green-200">
                    Active: {sampleStudents.filter(s => s.status === "Active").length}
                  </Badge>
                </div>
              </div>
            </ModernCardContent>
          </ModernCard>
        </motion.div>

        {/* Students List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          <ModernCard>
            <ModernCardHeader>
              <ModernCardTitle
                icon={<User className="h-6 w-6 text-purple-600" />}
                className="text-2xl"
              >
                Students ({filteredStudents.length})
              </ModernCardTitle>
            </ModernCardHeader>
            <ModernCardContent>
              <div className="space-y-4">
                {filteredStudents.map((student, index) => (
                  <motion.div
                    key={student.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.3 }}
                    className="p-6 border border-slate-200 rounded-lg hover:shadow-md transition-all duration-300 hover:border-purple-300"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="h-12 w-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
                            <User className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-slate-900">{student.name}</h3>
                            <p className="text-sm text-slate-500">{student.id}</p>
                          </div>
                          <Badge
                            variant={student.status === "Active" ? "default" : "secondary"}
                            className={
                              student.status === "Active"
                                ? "bg-green-100 text-green-800 border-green-200"
                                : "bg-yellow-100 text-yellow-800 border-yellow-200"
                            }
                          >
                            {student.status}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 text-sm">
                          <div>
                            <span className="text-slate-500">Program:</span>
                            <p className="font-medium text-slate-900">{student.program}</p>
                          </div>
                          <div>
                            <span className="text-slate-500">Year:</span>
                            <p className="font-medium text-slate-900">{student.year}</p>
                          </div>
                          <div>
                            <span className="text-slate-500">GPA:</span>
                            <p className="font-medium text-slate-900">{student.gpa}</p>
                          </div>
                          <div>
                            <span className="text-slate-500">Semester:</span>
                            <p className="font-medium text-slate-900">{student.semester}</p>
                          </div>
                          <div>
                            <span className="text-slate-500">Attendance:</span>
                            <Badge
                              variant="outline"
                              className={`font-medium ${getAttendanceColor(student.attendance)}`}
                            >
                              {student.attendance}
                            </Badge>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 mt-3 text-sm text-slate-600">
                          <div className="flex items-center gap-1">
                            <Mail className="h-4 w-4" />
                            <span>{student.email}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Phone className="h-4 w-4" />
                            <span>{student.phone}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-purple-200 text-purple-700 hover:bg-purple-50"
                        >
                          <BookOpen className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-blue-200 text-blue-700 hover:bg-blue-50"
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-red-200 text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}

                {filteredStudents.length === 0 && (
                  <div className="text-center py-12">
                    <User className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">No students found</h3>
                    <p className="text-slate-600 mb-4">
                      {searchQuery ? "Try adjusting your search criteria" : "No students have been added yet"}
                    </p>
                    <Button
                      onClick={() => handleNavigation("/user-management/add-student")}
                      className="bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add First Student
                    </Button>
                  </div>
                )}
              </div>
            </ModernCardContent>
          </ModernCard>
        </motion.div>
      </PageContainer>
    </ModernDashboardLayout>
  );
}