"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  ModernDashboardLayout,
  PageContainer,
} from "@/components/layout/modern-dashboard-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { CustomSelect } from "@/components/ui/custom-select";
import { ClassListItem } from "@/components/schedule/class-list-item";
import { ScheduleTable } from "@/components/schedule/schedule-table";
import { CreateScheduleDialog } from "@/components/schedule/create-schedule-dialog";
import { AddScheduleEntryDialog } from "@/components/schedule/add-schedule-entry-dialog";
import { EditClassDialog } from "@/components/schedule/edit-class-dialog";
import { handleLogout as performLogout } from "@/lib/auth/logout";
import { Class, ScheduleEntry, TimeSession } from "@/lib/data/schedule-data";
import { Search, Filter, Calendar, Sun, Moon, Loader2 } from "lucide-react";
import * as scheduleApi from "@/app/api/schedule/schedule-api";
import { toast } from "sonner";

const sampleUser = {
  name: "Admin User",
  email: "admin@university.edu",
  role: "OFFICE" as const,
  avatar: undefined,
};

export default function SchedulePage() {
  const router = useRouter();
  const [currentPath] = React.useState("/dashboard/schedule");
  const [classes, setClasses] = React.useState<Class[]>([]);
  const [selectedClassId, setSelectedClassId] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [sessionFilter, setSessionFilter] = React.useState<TimeSession>("ALL");
  const [addEntryDialogOpen, setAddEntryDialogOpen] = React.useState(false);
  const [editingEntry, setEditingEntry] = React.useState<ScheduleEntry | null>(null);
  const [defaultDay, setDefaultDay] = React.useState<string | undefined>();
  const [loading, setLoading] = React.useState(true);
  const [editClassDialogOpen, setEditClassDialogOpen] = React.useState(false);

  // Load classes from database on mount
  React.useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = async () => {
    try {
      setLoading(true);
      const data = await scheduleApi.fetchClasses();
      setClasses(data);
    } catch (error) {
      console.error("Error loading classes:", error);
      toast.error("Failed to load classes", {
        description: "Please check your connection and try again.",
      });
    } finally {
      setLoading(false);
    }
  };

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

  const handleCreateSchedule = async (data: { className: string; session: TimeSession }) => {
    try {
      // Filter out "ALL" since API only accepts MORNING or AFTERNOON
      if (data.session === "ALL") return;
      
      const newClass = await scheduleApi.createClass({
        name: data.className,
        session: data.session as "MORNING" | "AFTERNOON",
      });
      setClasses([...classes, newClass]);
      setSelectedClassId(newClass.id);
      toast.success(`Class "${data.className}" created successfully!`, {
        description: "You can now add schedule entries to this class.",
      });
    } catch (error) {
      console.error("Error creating class:", error);
      toast.error("Failed to create class", {
        description: "Please try again or contact support.",
      });
    }
  };

  const handleAddEntry = (day?: string) => {
    setDefaultDay(day);
    setEditingEntry(null);
    setAddEntryDialogOpen(true);
  };

  const handleEditEntry = (entry: ScheduleEntry) => {
    setEditingEntry(entry);
    setAddEntryDialogOpen(true);
  };

  const handleDeleteEntry = async (entryId: string) => {
    // Direct delete with toast notification
    try {
      if (!selectedClassId) return;
      
      await scheduleApi.deleteScheduleEntry(entryId);
      setClasses(classes.map(cls => {
        if (cls.id === selectedClassId) {
          return {
            ...cls,
            schedule: cls.schedule.filter(entry => entry.id !== entryId)
          };
        }
        return cls;
      }));
      toast.success("Schedule entry deleted", {
        description: "The entry has been removed from the schedule.",
      });
    } catch (error) {
      console.error("Error deleting entry:", error);
      toast.error("Failed to delete entry", {
        description: "Please try again.",
      });
    }
  };

  const handleSaveEntry = async (entry: Omit<ScheduleEntry, "id">) => {
    if (!selectedClassId) return;

    try {
      if (editingEntry) {
        // Edit existing entry
        await scheduleApi.updateScheduleEntry(editingEntry.id, entry);
        setClasses(classes.map(cls => {
          if (cls.id === selectedClassId) {
            return {
              ...cls,
              schedule: cls.schedule.map(e => 
                e.id === editingEntry.id ? { ...entry, id: e.id } : e
              )
            };
          }
          return cls;
        }));
        toast.success("Schedule entry updated", {
          description: "Changes have been saved successfully.",
        });
      } else {
        // Add new entry
        const newEntry = await scheduleApi.createScheduleEntry(selectedClassId, entry);
        setClasses(classes.map(cls => {
          if (cls.id === selectedClassId) {
            return {
              ...cls,
              schedule: [...cls.schedule, newEntry]
            };
          }
          return cls;
        }));
        toast.success("Schedule entry added", {
          description: "New entry has been added to the schedule.",
        });
      }
    } catch (error) {
      console.error("Error saving entry:", error);
      toast.error("Failed to save entry", {
        description: "Please check your input and try again.",
      });
    }
  };

  const handleEditClass = () => {
    if (!selectedClass) return;
    setEditClassDialogOpen(true);
  };

  const handleSaveClassName = async (newName: string) => {
    if (!selectedClass) return;
    
    try {
      await scheduleApi.updateClass(selectedClass.id, { name: newName });
      setClasses(classes.map(cls => 
        cls.id === selectedClassId ? { ...cls, name: newName } : cls
      ));
      toast.success("Class name updated", {
        description: `Class renamed to "${newName}".`,
      });
    } catch (error) {
      console.error("Error updating class:", error);
      toast.error("Failed to update class", {
        description: "Please try again.",
      });
    }
  };

  const handleDeleteClass = async () => {
    if (!selectedClass) return;
    
    // Direct delete with toast notification
    try {
      await scheduleApi.deleteClass(selectedClass.id);
      setClasses(classes.filter(cls => cls.id !== selectedClassId));
      setSelectedClassId(null);
      toast.success("Class deleted", {
        description: "The class and all its entries have been removed.",
      });
    } catch (error) {
      console.error("Error deleting class:", error);
      toast.error("Failed to delete class", {
        description: "Please try again.",
      });
    }
  };

  // Filter classes based on search and session filter
  const filteredClasses = React.useMemo(() => {
    return classes.filter(cls => {
      const matchesSearch = !searchQuery || 
        cls.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSession = sessionFilter === "ALL" || cls.session === sessionFilter;
      return matchesSearch && matchesSession;
    });
  }, [classes, searchQuery, sessionFilter]);

  // Get selected class
  const selectedClass = React.useMemo(() => {
    return classes.find(cls => cls.id === selectedClassId) || null;
  }, [classes, selectedClassId]);

  // Calculate statistics
  const morningClasses = classes.filter(c => c.session === "MORNING").length;
  const afternoonClasses = classes.filter(c => c.session === "AFTERNOON").length;
  const totalScheduleEntries = classes.reduce((sum, c) => sum + c.schedule.length, 0);

  return (
    <ModernDashboardLayout
      user={sampleUser}
      title="Class Schedule"
      subtitle="Manage class schedules and timetables"
      currentPath={currentPath}
      onNavigate={handleNavigation}
      onLogout={handleLogout}
      onSearch={handleSearch}
      hideSearch={true}
    >
      <PageContainer>
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="rounded-2xl shadow-lg border-purple-200 bg-gradient-to-br from-purple-50 via-purple-100 to-blue-50 hover:shadow-xl transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-purple-600 mb-2 uppercase tracking-wide">
                    Total Classes
                  </p>
                  <p className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                    {totalScheduleEntries}
                  </p>
                </div>
                <div className="p-3.5 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl shadow-lg">
                  <Calendar className="h-7 w-7 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-lg border-amber-200 bg-gradient-to-br from-amber-50 via-amber-100 to-orange-50 hover:shadow-xl transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-amber-700 mb-2 uppercase tracking-wide">
                    Morning Classes
                  </p>
                  <p className="text-4xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                    {morningClasses}
                  </p>
                </div>
                <div className="p-3.5 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl shadow-lg">
                  <Sun className="h-7 w-7 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-lg border-indigo-200 bg-gradient-to-br from-indigo-50 via-indigo-100 to-purple-50 hover:shadow-xl transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-indigo-700 mb-2 uppercase tracking-wide">
                    Afternoon Classes
                  </p>
                  <p className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    {afternoonClasses}
                  </p>
                </div>
                <div className="p-3.5 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl shadow-lg">
                  <Moon className="h-7 w-7 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Loading State */}
        {loading && (
          <Card className="rounded-2xl shadow-sm border-slate-200 mb-6">
            <CardContent className="p-12 text-center">
              <Loader2 className="h-12 w-12 text-purple-600 mx-auto mb-4 animate-spin" />
              <p className="text-slate-600">Loading classes...</p>
            </CardContent>
          </Card>
        )}

        {/* Search and Filter Bar */}
        {!loading && (
        <Card className="rounded-2xl shadow-sm border-slate-200 mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search classes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-11 border-slate-200"
                />
              </div>

              <div className="relative w-full sm:w-48">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none z-10" />
                <CustomSelect
                  value={sessionFilter}
                  onValueChange={(value) => setSessionFilter(value as TimeSession)}
                  className="pl-10 h-11 border-slate-200"
                >
                  <option value="ALL">All Sessions</option>
                  <option value="MORNING">Morning</option>
                  <option value="AFTERNOON">Afternoon</option>
                </CustomSelect>
              </div>

              <CreateScheduleDialog onCreateSchedule={handleCreateSchedule} />
            </div>
          </CardContent>
        </Card>
        )}

        {/* Main Content Grid */}
        {!loading && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Class List - Sidebar */}
          <div className="lg:col-span-1">
            <Card className="rounded-2xl shadow-sm border-slate-200">
              <CardContent className="p-4">
                <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Classes
                </h3>
                <div className="space-y-2">
                  {filteredClasses.length > 0 ? (
                    filteredClasses.map((cls) => (
                      <ClassListItem
                        key={cls.id}
                        classData={cls}
                        isSelected={selectedClassId === cls.id}
                        onClick={() => setSelectedClassId(cls.id)}
                      />
                    ))
                  ) : (
                    <div className="text-center py-8 text-slate-500">
                      <Calendar className="h-12 w-12 mx-auto mb-2 text-slate-300" />
                      <p className="text-sm">No classes found</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Schedule Table - Main Content */}
          <div className="lg:col-span-3">
            <ScheduleTable
              classData={selectedClass}
              onEdit={handleEditEntry}
              onDelete={handleDeleteEntry}
              onAddEntry={handleAddEntry}
              onEditClass={handleEditClass}
              onDeleteClass={handleDeleteClass}
            />
          </div>
        </div>
        )}

        {/* Add/Edit Schedule Entry Dialog */}
        <AddScheduleEntryDialog
          open={addEntryDialogOpen}
          onOpenChange={setAddEntryDialogOpen}
          onSave={handleSaveEntry}
          editEntry={editingEntry}
          defaultDay={defaultDay}
        />

        {/* Edit Class Name Dialog */}
        <EditClassDialog
          open={editClassDialogOpen}
          onOpenChange={setEditClassDialogOpen}
          currentClassName={selectedClass?.name || ""}
          onSave={handleSaveClassName}
        />
      </PageContainer>
    </ModernDashboardLayout>
  );
}
