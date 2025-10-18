import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, BookOpen, User, Edit, Trash2, Plus } from "lucide-react";
import { Class, ScheduleEntry, DAYS } from "@/lib/data/schedule-data";
import { cn } from "@/lib/utils";

interface ScheduleTableProps {
  classData: Class | null;
  onEdit?: (entry: ScheduleEntry) => void;
  onDelete?: (entryId: string) => void;
  onAddEntry?: (day?: string) => void;
  onEditClass?: () => void;
  onDeleteClass?: () => void;
}

// Modern subject colors with gradients
const SUBJECT_COLORS: Record<string, string> = {
  "Mathematics": "bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-300 text-blue-900 shadow-sm hover:shadow-md",
  "Physics": "bg-gradient-to-br from-purple-50 to-pink-50 border-purple-300 text-purple-900 shadow-sm hover:shadow-md",
  "Chemistry": "bg-gradient-to-br from-green-50 to-emerald-50 border-green-300 text-green-900 shadow-sm hover:shadow-md",
  "Biology": "bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-300 text-emerald-900 shadow-sm hover:shadow-md",
  "English": "bg-gradient-to-br from-pink-50 to-rose-50 border-pink-300 text-pink-900 shadow-sm hover:shadow-md",
  "Computer Science": "bg-gradient-to-br from-cyan-50 to-blue-50 border-cyan-300 text-cyan-900 shadow-sm hover:shadow-md",
  "History": "bg-gradient-to-br from-amber-50 to-orange-50 border-amber-300 text-amber-900 shadow-sm hover:shadow-md",
  "Dari": "bg-gradient-to-br from-orange-50 to-yellow-50 border-orange-300 text-orange-900 shadow-sm hover:shadow-md",
};

const getSubjectColor = (subject: string): string => {
  return SUBJECT_COLORS[subject] || "bg-gradient-to-br from-slate-50 to-gray-50 border-slate-300 text-slate-900 shadow-sm hover:shadow-md";
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
      <Card className="rounded-2xl shadow-sm border-slate-200">
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
    <Card className="rounded-2xl shadow-lg border-slate-200 bg-white overflow-hidden">
      <CardHeader className="border-b border-slate-200 bg-gradient-to-r from-purple-50 via-white to-blue-50">
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg">
              <Calendar className="h-5 w-5 text-white" />
            </div>
            {classData.name} Schedule
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={cn(
              "text-sm font-semibold px-3 py-1",
              classData.session === "MORNING" 
                ? "bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700 border-amber-300 shadow-sm"
                : "bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 border-indigo-300 shadow-sm"
            )}>
              {classData.session}
            </Badge>
            {onEditClass && (
              <Button
                variant="outline"
                size="sm"
                onClick={onEditClass}
                className="h-9 px-4 border-blue-300 text-blue-700 hover:bg-blue-50 hover:border-blue-400 shadow-sm transition-all duration-200"
              >
                <Edit className="h-3.5 w-3.5 mr-1.5" />
                Edit Class
              </Button>
            )}
            {onDeleteClass && (
              <Button
                variant="outline"
                size="sm"
                onClick={onDeleteClass}
                className="h-9 px-4 border-red-300 text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-400 shadow-sm transition-all duration-200"
              >
                <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                Delete Class
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {classData.schedule.length === 0 ? (
          <div className="text-center py-16 bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 rounded-xl border-2 border-dashed border-orange-200">
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
              className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white shadow-lg hover:shadow-xl px-6 py-2 h-11 rounded-xl transition-all duration-200"
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
                <div className="flex items-center gap-3">
                  <div className="h-10 w-1.5 bg-gradient-to-b from-orange-500 to-amber-500 rounded-full shadow-sm" />
                  <h3 className="font-bold text-lg text-slate-900">{day.label}</h3>
                  <Badge variant="secondary" className="ml-2 bg-gradient-to-r from-orange-100 to-amber-100 text-orange-700 font-semibold shadow-sm">
                    {daySchedule.length} {daySchedule.length === 1 ? 'class' : 'classes'}
                  </Badge>
                  {onAddEntry && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onAddEntry(day.key)}
                      className="ml-auto text-xs h-8 px-3 border-orange-300 text-orange-700 hover:bg-gradient-to-r hover:from-orange-50 hover:to-amber-50 hover:border-orange-400 shadow-sm transition-all duration-200"
                    >
                      <Plus className="h-3.5 w-3.5 mr-1" />
                      Add Class
                    </Button>
                  )}
                </div>

                {daySchedule.length > 0 ? (
                  <div className="grid gap-3 ml-5">
                    {daySchedule.map((entry) => (
                    <div
                      key={entry.id}
                      className={cn(
                        "p-4 sm:p-5 rounded-xl border-2 transition-all duration-200 hover:scale-[1.01]",
                        getSubjectColor(entry.subject)
                      )}
                    >
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex-1 space-y-2 w-full">
                          <div className="flex items-center gap-3 mb-1">
                            <div className="p-1.5 bg-white/80 rounded-lg">
                              <BookOpen className="h-4 w-4" />
                            </div>
                            <span className="font-bold text-base sm:text-lg">{entry.subject}</span>
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-sm mt-3">
                            <div className="flex items-center gap-2 bg-white/60 px-3 py-1.5 rounded-lg">
                              <User className="h-3.5 w-3.5" />
                              <span className="font-medium">{entry.teacherName}</span>
                            </div>
                            <div className="flex items-center gap-2 bg-white/60 px-3 py-1.5 rounded-lg">
                              <Clock className="h-3.5 w-3.5" />
                              <span className="font-medium text-xs sm:text-sm">{entry.startTime} - {entry.endTime}</span>
                            </div>
                            <Badge variant="outline" className="bg-white/70 font-semibold shadow-sm">
                              {entry.hours}h
                            </Badge>
                          </div>
                        </div>

                        <div className="flex gap-2 w-full sm:w-auto">
                          {onEdit && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onEdit(entry)}
                              className="h-9 px-3 sm:px-4 flex-1 sm:flex-none bg-white hover:bg-orange-50 border-orange-300 text-orange-700 hover:border-orange-400 shadow-sm transition-all duration-200"
                            >
                              <Edit className="h-3.5 w-3.5 mr-1.5" />
                              Edit
                            </Button>
                          )}
                          {onDelete && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onDelete(entry.id)}
                              className="h-9 px-3 sm:px-4 flex-1 sm:flex-none bg-white hover:bg-red-50 border-red-300 text-red-600 hover:text-red-700 hover:border-red-400 shadow-sm transition-all duration-200"
                            >
                              <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                              Delete
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  </div>
                ) : (
                  <div className="ml-5 p-8 rounded-xl border-2 border-dashed border-slate-300 bg-gradient-to-br from-slate-50 to-gray-50 text-center shadow-sm">
                    <p className="text-sm text-slate-600 font-medium">No classes scheduled for this day</p>
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
