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
import { Label } from "@/components/ui/label";
import { User, Mail, Phone, MapPin, Save, BookOpen, Calendar } from "lucide-react";
import { motion } from "framer-motion";

// Sample user data
const sampleUser = {
  name: "Dr. Sarah Ahmed",
  email: "sarah.ahmed@university.edu",
  role: "OFFICE" as const,
  avatar: undefined,
};

export default function AddStudentPage() {
  const router = useRouter();
  const [currentPath] = React.useState("/user-management/add-student");

  const handleNavigation = (href: string) => {
    try {
      router.push(href);
    } catch (error) {
      console.error("Navigation failed:", error);
      // Fallback navigation
      window.location.href = href;
    }
  };

  const handleLogout = () => {
    console.log("Logout clicked");
  };

  const handleSearch = (query: string) => {
    console.log("Search:", query);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Add Student form submitted");
  };

  return (
    <ModernDashboardLayout
      user={sampleUser}
      title="Add Student"
      subtitle="Create a new student account"
      currentPath={currentPath}
      onNavigate={handleNavigation}
      onLogout={handleLogout}
      onSearch={handleSearch}
    >
      <PageContainer>
        <PageHeader
          title="Add New Student"
          subtitle="Create a student account with access to attendance tracking and progress monitoring"
          breadcrumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "User Management", href: "/user-management" },
            { label: "Add User" },
            { label: "Add Student" },
          ]}
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <ModernCard className="max-w-2xl">
            <ModernCardHeader>
              <ModernCardTitle
                icon={<User className="h-6 w-6 text-purple-600" />}
                className="text-2xl"
              >
                Student Information
              </ModernCardTitle>
            </ModernCardHeader>
            <ModernCardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                    <User className="h-5 w-5 text-purple-600" />
                    Personal Information
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        placeholder="Enter first name"
                        className="border-slate-200 focus:border-purple-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        placeholder="Enter last name"
                        className="border-slate-200 focus:border-purple-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="studentId">Student ID</Label>
                    <Input
                      id="studentId"
                      placeholder="e.g., CS-2024-001"
                      className="border-slate-200 focus:border-purple-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth">Date of Birth</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      className="border-slate-200 focus:border-purple-500"
                    />
                  </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                    <Mail className="h-5 w-5 text-green-600" />
                    Contact Information
                  </h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="student@university.edu"
                      className="border-slate-200 focus:border-purple-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        placeholder="+1 (555) 123-4567"
                        className="border-slate-200 focus:border-purple-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="emergencyContact">Emergency Contact</Label>
                      <Input
                        id="emergencyContact"
                        placeholder="+1 (555) 987-6543"
                        className="border-slate-200 focus:border-purple-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      placeholder="Enter full address"
                      className="border-slate-200 focus:border-purple-500"
                    />
                  </div>
                </div>

                {/* Academic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-blue-600" />
                    Academic Information
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="program">Program/Major</Label>
                      <Input
                        id="program"
                        placeholder="e.g., Computer Science"
                        className="border-slate-200 focus:border-purple-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="year">Academic Year</Label>
                      <Input
                        id="year"
                        placeholder="e.g., 1st Year, 2nd Year"
                        className="border-slate-200 focus:border-purple-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="semester">Current Semester</Label>
                      <Input
                        id="semester"
                        placeholder="e.g., Fall 2024"
                        className="border-slate-200 focus:border-purple-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="enrollmentDate">Enrollment Date</Label>
                      <Input
                        id="enrollmentDate"
                        type="date"
                        className="border-slate-200 focus:border-purple-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="advisor">Academic Advisor</Label>
                    <Input
                      id="advisor"
                      placeholder="e.g., Dr. John Smith"
                      className="border-slate-200 focus:border-purple-500"
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-6 border-t border-slate-200">
                  <Button
                    type="submit"
                    className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <Save className="h-5 w-5 mr-2" />
                    Create Student Account
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="px-8 py-3 rounded-lg font-semibold border-slate-300 hover:bg-slate-50 transition-all duration-300"
                    onClick={() => handleNavigation("/user-management")}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </ModernCardContent>
          </ModernCard>
        </motion.div>

        {/* Success Message Placeholder */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.3 }}
          className="mt-6"
        >
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <h4 className="font-semibold text-purple-900">Ready to Enroll</h4>
                <p className="text-sm text-purple-700">
                  Fill out the form above to create a new student account with access to attendance tracking and academic progress.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </PageContainer>
    </ModernDashboardLayout>
  );
}