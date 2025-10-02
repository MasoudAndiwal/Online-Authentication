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
  GraduationCap,
  Search,
  Plus,
  Mail,
  Phone,
  Edit,
  Trash2,
} from "lucide-react";
import { motion } from "framer-motion";

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
    email: "mohammad.ali@university.edu",
    department: "Computer Science",
    phone: "+1 (555) 123-4567",
    qualification: "PhD in Computer Science",
    experience: "8 years",
    status: "Active",
    classes: 5,
  },
  {
    id: "TCH-2024-002",
    name: "Prof. Fatima Khan",
    email: "fatima.khan@university.edu",
    department: "Mathematics",
    phone: "+1 (555) 234-5678",
    qualification: "PhD in Mathematics",
    experience: "12 years",
    status: "Active",
    classes: 4,
  },
  {
    id: "TCH-2024-003",
    name: "Dr. Ahmed Hassan",
    email: "ahmed.hassan@university.edu",
    department: "Physics",
    phone: "+1 (555) 345-6789",
    qualification: "PhD in Physics",
    experience: "6 years",
    status: "Active",
    classes: 3,
  },
  {
    id: "TCH-2024-004",
    name: "Dr. Aisha Rahman",
    email: "aisha.rahman@university.edu",
    department: "Chemistry",
    phone: "+1 (555) 456-7890",
    qualification: "PhD in Chemistry",
    experience: "10 years",
    status: "On Leave",
    classes: 0,
  },
];

export default function TeacherListPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [currentPath] = React.useState("/user-management/teachers");

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

  const filteredTeachers = sampleTeachers.filter(
    (teacher) =>
      teacher.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      teacher.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      teacher.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <ModernDashboardLayout
      user={sampleUser}
      title="Teacher List"
      subtitle="Manage all teacher accounts"
      currentPath={currentPath}
      onNavigate={handleNavigation}
      onLogout={handleLogout}
      onSearch={handleSearch}
    >
      <PageContainer>
        <PageHeader
          title="All Teachers"
          subtitle="View and manage all teacher accounts in the system"
          breadcrumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "User Management", href: "/user-management" },
            { label: "All Users" },
            { label: "Teacher List" },
          ]}
          actions={
            <Button
              onClick={() => handleNavigation("/user-management/add-teacher")}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Teacher
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
                    placeholder="Search teachers by name, department, or ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 border-slate-200 focus:border-blue-500"
                  />
                </div>
                <div className="flex gap-2">
                  <Badge variant="outline" className="px-3 py-2">
                    Total: {sampleTeachers.length}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="px-3 py-2 bg-green-50 text-green-700 border-green-200"
                  >
                    Active:{" "}
                    {sampleTeachers.filter((t) => t.status === "Active").length}
                  </Badge>
                </div>
              </div>
            </ModernCardContent>
          </ModernCard>
        </motion.div>

        {/* Teachers List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          <ModernCard>
            <ModernCardHeader>
              <ModernCardTitle
                icon={<GraduationCap className="h-6 w-6 text-blue-600" />}
                className="text-2xl"
              >
                Teachers ({filteredTeachers.length})
              </ModernCardTitle>
            </ModernCardHeader>
            <ModernCardContent>
              <div className="space-y-4">
                {filteredTeachers.map((teacher, index) => (
                  <motion.div
                    key={teacher.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.3 }}
                    className="p-6 border border-slate-200 rounded-lg hover:shadow-md transition-all duration-300 hover:border-blue-300"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                            <GraduationCap className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-slate-900">
                              {teacher.name}
                            </h3>
                            <p className="text-sm text-slate-500">
                              {teacher.id}
                            </p>
                          </div>
                          <Badge
                            variant={
                              teacher.status === "Active"
                                ? "default"
                                : "secondary"
                            }
                            className={
                              teacher.status === "Active"
                                ? "bg-green-100 text-green-800 border-green-200"
                                : "bg-yellow-100 text-yellow-800 border-yellow-200"
                            }
                          >
                            {teacher.status}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-slate-500">Department:</span>
                            <p className="font-medium text-slate-900">
                              {teacher.department}
                            </p>
                          </div>
                          <div>
                            <span className="text-slate-500">
                              Qualification:
                            </span>
                            <p className="font-medium text-slate-900">
                              {teacher.qualification}
                            </p>
                          </div>
                          <div>
                            <span className="text-slate-500">Experience:</span>
                            <p className="font-medium text-slate-900">
                              {teacher.experience}
                            </p>
                          </div>
                          <div>
                            <span className="text-slate-500">
                              Active Classes:
                            </span>
                            <p className="font-medium text-slate-900">
                              {teacher.classes}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 mt-3 text-sm text-slate-600">
                          <div className="flex items-center gap-1">
                            <Mail className="h-4 w-4" />
                            <span>{teacher.email}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Phone className="h-4 w-4" />
                            <span>{teacher.phone}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2">
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
                        handleNavigation("/user-management/add-teacher")
                      }
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add First Teacher
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
