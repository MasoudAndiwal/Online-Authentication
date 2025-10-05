"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  ModernDashboardLayout,
  PageContainer,
} from "@/components/layout/modern-dashboard-layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GraduationCap, Plus } from "lucide-react";
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
    email: "mohammad.ali@university.edu",
    department: "Computer Science",
    phone: "+1 (555) 123-4567",
    qualification: "PhD in Computer Science",
    experience: "8 years",
    status: "Active" as const,
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
    status: "Active" as const,
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
    status: "Active" as const,
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
    status: "On Leave" as const,
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
      hideHeader={true}
    >
      <PageContainer>
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
                      handleNavigation(`/user-management/edit-teacher/${id}`)
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
                        handleNavigation("/user-management/add-teacher")
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
