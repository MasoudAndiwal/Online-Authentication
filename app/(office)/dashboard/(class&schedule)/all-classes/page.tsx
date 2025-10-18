"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  ModernDashboardLayout,
  PageContainer,
} from "@/components/layout/modern-dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CustomSelect } from "@/components/ui/custom-select";
import { CreateClassDialog } from "@/components/classes/create-class-dialog";
import { ClassCard } from "@/components/classes/class-card";
import { handleLogout as performLogout } from "@/lib/auth/logout";
import { 
  Search, 
  Plus, 
  GraduationCap, 
  Sun, 
  Moon, 
  Users,
  Filter,
  TrendingUp,
  Calendar,
  BookOpen
} from "lucide-react";

const sampleUser = {
  name: "Admin User",
  email: "admin@university.edu",
  role: "OFFICE" as const,
  avatar: undefined,
};

// Sample data - will be replaced with real data later
const sampleClasses = [
  {
    id: "1",
    name: "Class A",
    session: "MORNING" as const,
    studentCount: 45,
    scheduleCount: 12,
    major: "Computer Science",
    semester: 3,
  },
  {
    id: "2",
    name: "Class B",
    session: "AFTERNOON" as const,
    studentCount: 38,
    scheduleCount: 15,
    major: "Electronics",
    semester: 2,
  },
  {
    id: "3",
    name: "Class C",
    session: "MORNING" as const,
    studentCount: 42,
    scheduleCount: 10,
    major: "Computer Science",
    semester: 4,
  },
  {
    id: "4",
    name: "Class D",
    session: "AFTERNOON" as const,
    studentCount: 35,
    scheduleCount: 13,
    major: "Civil Engineering",
    semester: 1,
  },
];

export default function AllClassesPage() {
  const router = useRouter();
  const [currentPath] = React.useState("/dashboard/all-classes");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [sessionFilter, setSessionFilter] = React.useState<"ALL" | "MORNING" | "AFTERNOON">("ALL");
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false);
  const [classes, setClasses] = React.useState(sampleClasses);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  const handleLogout = async () => {
    await performLogout();
    router.push("/login");
  };

  const handleCreateClass = (data: { name: string; session: "MORNING" | "AFTERNOON" }) => {
    // TODO: Add backend logic later
    const newClass = {
      id: String(classes.length + 1),
      name: data.name,
      session: data.session,
      studentCount: 0,
      scheduleCount: 0,
      major: "Not Assigned",
      semester: 1,
    };
    setClasses([...classes, newClass]);
  };

  // Filter classes based on search and session
  const filteredClasses = classes.filter((cls) => {
    const matchesSearch = cls.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         cls.major.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSession = sessionFilter === "ALL" || cls.session === sessionFilter;
    return matchesSearch && matchesSession;
  });

  // Calculate statistics
  const totalClasses = classes.length;
  const morningClasses = classes.filter(c => c.session === "MORNING").length;
  const afternoonClasses = classes.filter(c => c.session === "AFTERNOON").length;
  const totalStudents = classes.reduce((sum, c) => sum + c.studentCount, 0);

  return (
    <ModernDashboardLayout
      user={sampleUser}
      title="All Classes"
      subtitle="Manage all classes in the system"
      currentPath={currentPath}
      onNavigate={handleNavigation}
      onLogout={handleLogout}
      onSearch={handleSearch}
      hideSearch={true}
    >
      <PageContainer>
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="rounded-2xl shadow-lg border-orange-200 bg-gradient-to-br from-orange-50 via-orange-100 to-amber-50 hover:shadow-xl transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-orange-600 mb-2 uppercase tracking-wide">
                    Total Classes
                  </p>
                  <p className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                    {totalClasses}
                  </p>
                </div>
                <div className="p-3.5 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl shadow-lg">
                  <GraduationCap className="h-7 w-7 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-lg border-amber-200 bg-gradient-to-br from-amber-50 via-amber-100 to-yellow-50 hover:shadow-xl transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-amber-700 mb-2 uppercase tracking-wide">
                    Morning Classes
                  </p>
                  <p className="text-4xl font-bold bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent">
                    {morningClasses}
                  </p>
                </div>
                <div className="p-3.5 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-xl shadow-lg">
                  <Sun className="h-7 w-7 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-lg border-indigo-200 bg-gradient-to-br from-indigo-50 via-indigo-100 to-blue-50 hover:shadow-xl transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-indigo-700 mb-2 uppercase tracking-wide">
                    Afternoon Classes
                  </p>
                  <p className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
                    {afternoonClasses}
                  </p>
                </div>
                <div className="p-3.5 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-xl shadow-lg">
                  <Moon className="h-7 w-7 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-lg border-green-200 bg-gradient-to-br from-green-50 via-green-100 to-emerald-50 hover:shadow-xl transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-green-700 mb-2 uppercase tracking-wide">
                    Total Students
                  </p>
                  <p className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    {totalStudents}
                  </p>
                </div>
                <div className="p-3.5 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl shadow-lg">
                  <Users className="h-7 w-7 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter Bar */}
        <Card className="rounded-2xl shadow-md border-slate-200 mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search Input */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input
                  placeholder="Search by class name or major..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12 border-slate-300 focus:border-orange-400 focus:ring-orange-400"
                />
              </div>

              {/* Session Filter */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-slate-600">
                  <Filter className="h-5 w-5" />
                  <span className="text-sm font-semibold">Session:</span>
                </div>
                <CustomSelect
                  value={sessionFilter}
                  onValueChange={(value) => setSessionFilter(value as "ALL" | "MORNING" | "AFTERNOON")}
                  className="h-12 w-40 border-slate-300 focus:border-orange-400"
                >
                  <option value="ALL">All Sessions</option>
                  <option value="MORNING">☀️ Morning</option>
                  <option value="AFTERNOON">🌙 Afternoon</option>
                </CustomSelect>
              </div>

              {/* Create Class Button */}
              <Button
                onClick={() => setCreateDialogOpen(true)}
                className="h-12 px-6 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Plus className="h-5 w-5 mr-2" />
                Create Class
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Classes Grid */}
        {filteredClasses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
            {filteredClasses.map((classData, index) => (
              <div
                key={classData.id}
                className="animate-in slide-in-from-bottom-4 duration-500"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <ClassCard classData={classData} />
              </div>
            ))}
          </div>
        ) : (
          <Card className="rounded-2xl shadow-md border-slate-200">
            <CardContent className="p-12 text-center">
              <div className="p-4 bg-gradient-to-br from-orange-100 to-amber-100 w-fit mx-auto rounded-2xl mb-4">
                <BookOpen className="h-16 w-16 text-orange-600" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">
                No classes found
              </h3>
              <p className="text-slate-600 mb-6 max-w-md mx-auto">
                {searchQuery || sessionFilter !== "ALL"
                  ? "Try adjusting your search or filters"
                  : "Get started by creating your first class"}
              </p>
              {!searchQuery && sessionFilter === "ALL" && (
                <Button
                  onClick={() => setCreateDialogOpen(true)}
                  className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Create Your First Class
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Create Class Dialog */}
        <CreateClassDialog
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
          onCreateClass={handleCreateClass}
        />
      </PageContainer>
    </ModernDashboardLayout>
  );
}
