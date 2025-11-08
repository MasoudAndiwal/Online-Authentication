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
import { CreateClassDialog } from "@/components/classes/create-class-dialog";
import { EditClassDialog } from "@/components/classes/edit-class-dialog";
import { ClassCard } from "@/components/classes/class-card";
import { handleLogout as performLogout } from "@/lib/auth/logout";
import { useAuth } from "@/hooks/use-auth";
import { AuthLoadingScreen } from "@/components/ui/auth-loading";
import { toast } from "sonner";
import { 
  Search, 
  Plus, 
  GraduationCap, 
  Sun, 
  Moon, 
  Users,
  Filter,
  BookOpen,
  Loader2
} from "lucide-react";

type ClassItem = {
  id: string;
  name: string;
  session: "MORNING" | "AFTERNOON";
  studentCount: number;
  teacherCount: number;
  scheduleCount: number;
  major: string;
  semester: number;
};

export default function AllClassesPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth({ requiredRole: 'OFFICE' });
  const [currentPath] = React.useState("/dashboard/all-classes");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [sessionFilter, setSessionFilter] = React.useState<"ALL" | "MORNING" | "AFTERNOON">("ALL");
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false);
  const [editDialogOpen, setEditDialogOpen] = React.useState(false);
  const [selectedClass, setSelectedClass] = React.useState<ClassItem | null>(null);
  const [classes, setClasses] = React.useState<ClassItem[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const loadClasses = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/classes');
      if (!res.ok) throw new Error('Failed to fetch classes');
      const data: ClassItem[] = await res.json();
      setClasses(data);
    } catch (e) {
      console.error(e);
      setError('Failed to load classes');
      toast.error('Failed to load classes', {
        description: 'Please try again later.',
        className: 'bg-red-50 border-red-200 text-red-900',
        position: 'bottom-center',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadClasses();
  }, [loadClasses]);

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

  const handleCreateClass = async (data: { 
    name: string; 
    session: "MORNING" | "AFTERNOON";
    major: string;
    semester: number;
  }) => {
    try {
      const res = await fetch('/api/classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to create class');
      const created: ClassItem = await res.json();
      setClasses((prev) => [...prev, created]);
      toast.success("Class created successfully!", {
        description: `${data.name} has been added to the system.`,
        className: "bg-green-50 border-green-200 text-green-900",
        position: 'bottom-center',
      });
    } catch (e) {
      console.error(e);
      toast.error('Failed to create class', {
        description: 'Please try again later.',
        className: 'bg-red-50 border-red-200 text-red-900',
        position: 'bottom-center',
      });
    }
  };

  const handleEditClass = (id: string) => {
    const classToEdit = classes.find(c => c.id === id);
    if (classToEdit) {
      setSelectedClass(classToEdit);
      setEditDialogOpen(true);
    }
  };

  const handleSaveClass = async (data: {
    name: string;
    session: "MORNING" | "AFTERNOON";
    major: string;
    semester: number;
  }) => {
    if (!selectedClass) return;
    try {
      const res = await fetch(`/api/classes/${selectedClass.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to update class');
      const updated: ClassItem = await res.json();
      setClasses((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      toast.success("Class updated successfully!", {
        description: `Changes to ${data.name} have been saved.`,
        className: "bg-green-50 border-green-200 text-green-900",
        position: 'bottom-center',
      });
    } catch (e) {
      console.error(e);
      toast.error('Failed to update class', {
        description: 'Please try again later.',
        className: 'bg-red-50 border-red-200 text-red-900',
        position: 'bottom-center',
      });
    }
  };

  const handleDeleteClass = (id: string) => {
    const classToDelete = classes.find(c => c.id === id);
    if (!classToDelete) return;
    
    toast.error(`Delete ${classToDelete.name}?`, {
      description: 'This action cannot be undone.',
      position: 'bottom-center',
      className: 'bg-red-100 border-red-200 text-red-900',
      action: {
        label: 'Delete',
        onClick: async () => {
          try {
            const res = await fetch(`/api/classes/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Failed to delete class');
            setClasses((prev) => prev.filter((cls) => cls.id !== id));
            toast.success('Class deleted', {
              description: `${classToDelete.name} has been removed from the system.`,
              className: 'bg-green-50 border-green-200 text-green-900',
              position: 'bottom-center',
            });
          } catch (e) {
            console.error(e);
            toast.error('Failed to delete class', {
              description: 'Please try again later.',
              className: 'bg-red-50 border-red-200 text-red-900',
              position: 'bottom-center',
            });
          }
        }
      },
      cancel: {
        label: 'Cancel',
        onClick: () => {}
      }
    });
  };

  // Filter classes based on search and session
  const filteredClasses = classes.filter((cls) => {
    const matchesSearch = cls.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         cls.major.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSession = sessionFilter === "ALL" || cls.session === sessionFilter;
    return matchesSearch && matchesSession;
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

  // Calculate statistics
  const totalClasses = classes.length;
  const morningClasses = classes.filter(c => c.session === "MORNING").length;
  const afternoonClasses = classes.filter(c => c.session === "AFTERNOON").length;
  const totalStudents = classes.reduce((sum, c) => sum + c.studentCount, 0);

  return (
    <ModernDashboardLayout
      user={displayUser}
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
          <Card className="rounded-2xl shadow-lg border-0 bg-gradient-to-br from-orange-50 via-orange-100 to-amber-50 hover:shadow-xl transition-all duration-200">
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

          <Card className="rounded-2xl shadow-lg border-0 bg-gradient-to-br from-amber-50 via-amber-100 to-yellow-50 hover:shadow-xl transition-all duration-200">
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

          <Card className="rounded-2xl shadow-lg border-0 bg-gradient-to-br from-indigo-50 via-indigo-100 to-blue-50 hover:shadow-xl transition-all duration-200">
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

          <Card className="rounded-2xl shadow-lg border-0 bg-gradient-to-br from-green-50 via-green-100 to-emerald-50 hover:shadow-xl transition-all duration-200">
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
        <Card className="rounded-2xl shadow-md border-0 mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search Input */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input
                  placeholder="Search by class name or major..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12 border border-slate-200 focus:border-orange-400 focus:ring-orange-400"
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
                  className="h-12 w-40 border border-slate-200 focus:border-orange-400"
                >
                  <option value="ALL">All Sessions</option>
                  <option value="MORNING">Morning</option>
                  <option value="AFTERNOON">Afternoon</option>
                </CustomSelect>
              </div>

              {/* Create Class Button */}
              <Button
                onClick={() => setCreateDialogOpen(true)}
                className="h-12 px-6 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 border-0"
              >
                <Plus className="h-5 w-5 mr-2" />
                Create Class
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Classes Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="rounded-2xl shadow-sm border-0 bg-white">
                <CardContent className="p-5">
                  <div className="animate-pulse">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="h-11 w-11 bg-gradient-to-br from-slate-200 to-slate-300 rounded-xl animate-shimmer" />
                        <div>
                          <div className="h-5 w-32 bg-gradient-to-r from-slate-200 to-slate-300 rounded mb-2 animate-shimmer" />
                          <div className="h-4 w-24 bg-gradient-to-r from-slate-200 to-slate-300 rounded animate-shimmer" />
                        </div>
                      </div>
                      <div className="h-6 w-20 bg-gradient-to-r from-slate-200 to-slate-300 rounded-full animate-shimmer" />
                    </div>
                    
                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="bg-slate-50 rounded-xl p-4">
                        <div className="h-4 w-16 bg-gradient-to-r from-slate-200 to-slate-300 rounded mb-2 animate-shimmer" />
                        <div className="h-8 w-12 bg-gradient-to-r from-slate-200 to-slate-300 rounded animate-shimmer" />
                      </div>
                      <div className="bg-slate-50 rounded-xl p-4">
                        <div className="h-4 w-16 bg-gradient-to-r from-slate-200 to-slate-300 rounded mb-2 animate-shimmer" />
                        <div className="h-8 w-12 bg-gradient-to-r from-slate-200 to-slate-300 rounded animate-shimmer" />
                      </div>
                    </div>
                    
                    {/* Semester */}
                    <div className="h-4 w-28 bg-gradient-to-r from-slate-200 to-slate-300 rounded mb-4 animate-shimmer" />
                    
                    {/* Buttons */}
                    <div className="flex gap-2 pt-4">
                      <div className="flex-1 h-9 bg-gradient-to-r from-slate-200 to-slate-300 rounded-lg animate-shimmer" />
                      <div className="flex-1 h-9 bg-gradient-to-r from-slate-200 to-slate-300 rounded-lg animate-shimmer" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : error ? (
          <Card className="rounded-2xl shadow-md border-0 bg-red-50">
            <CardContent className="p-8 text-center">
              <h3 className="text-xl font-semibold text-red-700 mb-2">Failed to load classes</h3>
              <p className="text-red-700/80 mb-4">Please try again later.</p>
              <Button onClick={loadClasses} variant="outline" className="border-0 bg-white text-red-700 hover:bg-red-100">Retry</Button>
            </CardContent>
          </Card>
        ) : filteredClasses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
            {filteredClasses.map((classData, index) => (
              <div
                key={classData.id}
                className="animate-in slide-in-from-bottom-4 duration-500"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <ClassCard 
                  classData={classData}
                  onEdit={handleEditClass}
                  onDelete={handleDeleteClass}
                />
              </div>
            ))}
          </div>
        ) : (
          <Card className="rounded-2xl shadow-md border-0">
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
                  className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 border-0"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Create Your First Class
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Dialogs */}
        <CreateClassDialog
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
          onCreateClass={handleCreateClass}
        />
        
        <EditClassDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          classData={selectedClass}
          onSaveClass={handleSaveClass}
        />
      </PageContainer>
    </ModernDashboardLayout>
  );
}
