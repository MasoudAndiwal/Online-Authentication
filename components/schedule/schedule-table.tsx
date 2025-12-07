import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, BookOpen, User, Edit, Trash2, Plus } from "lucide-react";
import { Class, ScheduleEntry, DAYS } from "@/lib/data/schedule-data";
import { cn } from "@/lib/utils";

// Utility function to convert 24-hour time to 12-hour format
const formatTime12Hour = (time24: string): string => {
  try {
    // Handle different time formats (HH:MM:SS or HH:MM)
    const [hours, minutes] = time24.split(':').map(Number);
    
    if (isNaN(hours) || isNaN(minutes)) {
      return time24; // Return original if parsing fails
    }
    
    const period = hours >= 12 ? 'PM' : 'AM';
    const hours12 = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    
    return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
  } catch (error) {
    console.warn('Error formatting time:', time24, error);
    return time24; // Return original if error occurs
  }
};

interface ScheduleTableProps {
  classData: Class | null;
  onEdit?: (entry: ScheduleEntry) => void;
  onDelete?: (entryId: string) => void;
  onAddEntry?: (day?: string) => void;
  onEditClass?: () => void;
  onDeleteClass?: () => void;
}

// Modern subject colors with gradients - no borders, using shadows instead
const SUBJECT_COLORS: Record<string, string> = {
  "Mathematics": "bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-900 shadow-md hover:shadow-lg ring-1 ring-blue-100",
  "Physics": "bg-gradient-to-br from-purple-50 to-pink-50 text-purple-900 shadow-md hover:shadow-lg ring-1 ring-purple-100",
  "Chemistry": "bg-gradient-to-br from-green-50 to-emerald-50 text-green-900 shadow-md hover:shadow-lg ring-1 ring-green-100",
  "Biology": "bg-gradient-to-br from-emerald-50 to-teal-50 text-emerald-900 shadow-md hover:shadow-lg ring-1 ring-emerald-100",
  "English": "bg-gradient-to-br from-pink-50 to-rose-50 text-pink-900 shadow-md hover:shadow-lg ring-1 ring-pink-100",
  "Computer Science": "bg-gradient-to-br from-cyan-50 to-blue-50 text-cyan-900 shadow-md hover:shadow-lg ring-1 ring-cyan-100",
  "History": "bg-gradient-to-br from-amber-50 to-orange-50 text-amber-900 shadow-md hover:shadow-lg ring-1 ring-amber-100",
  "Dari": "bg-gradient-to-br from-orange-50 to-yellow-50 text-orange-900 shadow-md hover:shadow-lg ring-1 ring-orange-100",
};

const getSubjectColor = (subject: string): string => {
  return SUBJECT_COLORS[subject] || "bg-gradient-to-br from-slate-50 to-gray-50 text-slate-900 shadow-md hover:shadow-lg ring-1 ring-slate-100";
};

export function ScheduleTable({ classData, onEdit, onDelete, onAddEntry, onEditClass, onDeleteClass }: ScheduleTableProps) {
  // Group schedule entries by day - must be before early return
  const scheduleByDay = React.useMemo(() => {
    if (!classData) return {};
    const grouped: Record<string, ScheduleEntry[]> = {};
    DAYS.forEach(day => {
      grouped[day.key] = classData.schedule
        .filter(entry => entry.dayOfWeek === day.key)
        .sort((a, b) => a.startTime.localeCompare(b.startTime));
    });
    return grouped;
  }, [classData]);

  if (!classData) {
    return (
      <Card className="rounded-2xl shadow-sm border-0">
        <CardContent className="p-12 text-center">
          <Calendar className="h-16 w-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            No Class Selected
          </h3>
          <p className="text-slate-600">
            Select a class from the list to view its schedule
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl shadow-lg border-0 bg-white overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-orange-50 via-white to-amber-50">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 bg-gradient-to-br from-orange-500 to-amber-500 rounded-lg flex-shrink-0">
              <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </div>
            <span className="truncate">{classData.name} Schedule</span>
          </CardTitle>
          <div className="flex flex-wrap items-center gap-2">
            <Badge className={cn(
              "text-xs sm:text-sm font-semibold px-2 sm:px-3 py-1 border-0",
              classData.session === "MORNING" 
                ? "bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700 shadow-sm"
                : "bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 shadow-sm"
            )}>
              {classData.session}
            </Badge>
            {onEditClass && (
              <Button
                variant="outline"
                size="sm"
                onClick={onEditClass}
                className="h-8 sm:h-9 px-3 sm:px-4 text-xs sm:text-sm border-0 bg-orange-50 text-orange-700 hover:bg-orange-100 shadow-sm transition-all duration-200"
              >
                <Edit className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1 sm:mr-1.5" />
                <span className="hidden xs:inline">Edit Class</span>
                <span className="xs:hidden">Edit</span>
              </Button>
            )}
            {onDeleteClass && (
              <Button
                variant="outline"
                size="sm"
                onClick={onDeleteClass}
                className="h-8 sm:h-9 px-3 sm:px-4 text-xs sm:text-sm border-0 bg-red-50 text-red-600 hover:text-red-700 hover:bg-red-100 shadow-sm transition-all duration-200"
              >
                <Trash2 className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1 sm:mr-1.5" />
                <span className="hidden xs:inline">Delete</span>
                <span className="xs:hidden">Del</span>
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {classData.schedule.length === 0 ? (
          <div className="text-center py-16 bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 rounded-2xl shadow-lg">
            <div className="p-4 bg-gradient-to-br from-orange-100 to-amber-100 w-fit mx-auto rounded-2xl mb-5 shadow-md">
              <Calendar className="h-16 w-16 text-orange-600" />
            </div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent mb-2">
              No schedule entries yet
            </h3>
            <p className="text-slate-700 mb-6 text-base max-w-md mx-auto">
              Start building this class schedule by adding teachers and subjects
            </p>
            <Button
              onClick={() => onAddEntry ? onAddEntry() : null}
              size="default"
              className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-lg hover:shadow-xl px-6 py-2 h-11 rounded-xl transition-all duration-200"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Schedule Entry
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {DAYS.map(day => {
            const daySchedule = scheduleByDay[day.key];

            return (
              <div key={day.key} className="space-y-3">
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  <div className="h-8 sm:h-10 w-1 sm:w-1.5 bg-gradient-to-b from-orange-500 to-amber-500 rounded-full shadow-sm flex-shrink-0" />
                  <h3 className="font-bold text-base sm:text-lg text-slate-900">{day.label}</h3>
                  <Badge variant="secondary" className="bg-gradient-to-r from-orange-100 to-amber-100 text-orange-700 font-semibold shadow-sm text-xs sm:text-sm">
                    {daySchedule.length} {daySchedule.length === 1 ? 'class' : 'classes'}
                  </Badge>
                  {onAddEntry && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onAddEntry(day.key)}
                      className="ml-auto text-xs h-7 sm:h-8 px-2 sm:px-3 border-0 bg-orange-50 text-orange-700 hover:bg-gradient-to-r hover:from-orange-100 hover:to-amber-100 shadow-sm transition-all duration-200"
                    >
                      <Plus className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1" />
                      <span className="hidden sm:inline">Add Class</span>
                      <span className="sm:hidden">Add</span>
                    </Button>
                  )}
                </div>

                {daySchedule.length > 0 ? (
                  <div className="grid gap-3 ml-2 sm:ml-5">
                    {daySchedule.map((entry) => (
                    <div
                      key={entry.id}
                      className={cn(
                        "p-3 sm:p-4 md:p-5 rounded-xl transition-all duration-200 hover:scale-[1.01]",
                        getSubjectColor(entry.subject)
                      )}
                    >
                      <div className="flex flex-col gap-3">
                        <div className="flex-1 space-y-2 w-full">
                          <div className="flex items-center gap-2 sm:gap-3 mb-1">
                            <div className="p-1.5 bg-white/80 rounded-lg flex-shrink-0">
                              <BookOpen className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            </div>
                            <span className="font-bold text-sm sm:text-base md:text-lg break-words">{entry.subject}</span>
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm mt-2">
                            <div className="flex items-center gap-1.5 sm:gap-2 bg-white/60 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg">
                              <User className="h-3 w-3 sm:h-3.5 sm:w-3.5 flex-shrink-0" />
                              <span className="font-medium break-words">{entry.teacherName}</span>
                            </div>
                            <div className="flex items-center gap-1.5 sm:gap-2 bg-white/60 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg flex-shrink-0">
                              <Clock className="h-3 w-3 sm:h-3.5 sm:w-3.5 flex-shrink-0" />
                              <span className="font-medium text-xs whitespace-nowrap">
                                {formatTime12Hour(entry.startTime)} - {formatTime12Hour(entry.endTime)}
                              </span>
                            </div>
                            <Badge className="bg-white/80 font-semibold shadow-sm text-xs flex-shrink-0 border-0">
                              {entry.hours}h
                            </Badge>
                          </div>
                        </div>

                        <div className="flex gap-2 w-full">
                          {onEdit && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onEdit(entry)}
                              className="h-8 sm:h-9 px-3 sm:px-4 flex-1 text-xs sm:text-sm border-0 bg-orange-50 hover:bg-orange-100 text-orange-700 shadow-sm transition-all duration-200"
                            >
                              <Edit className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1 sm:mr-1.5" />
                              Edit
                            </Button>
                          )}
                          {onDelete && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onDelete(entry.id)}
                              className="h-8 sm:h-9 px-3 sm:px-4 flex-1 text-xs sm:text-sm border-0 bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 shadow-sm transition-all duration-200"
                            >
                              <Trash2 className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1 sm:mr-1.5" />
                              Delete
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  </div>
                ) : (
                  <div className="ml-2 sm:ml-5 p-6 sm:p-8 rounded-xl bg-gradient-to-br from-slate-50 to-gray-100 text-center shadow-sm">
                    <p className="text-sm text-slate-500 font-medium">No classes scheduled for this day</p>
                  </div>
                )}
              </div>
            );
          })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
