"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { CustomSelect } from "@/components/ui/custom-select";
import { BookOpen, User, Clock, Calendar as CalendarIcon, Save, Plus, Trash2 } from "lucide-react";
import { ScheduleEntry, DAYS } from "@/lib/data/schedule-data";
import { getTimeSlotsBySession, formatTimeDisplay } from "@/lib/data/teaching-times";
import * as scheduleApi from "@/app/api/schedule/schedule-api";
import { toast } from "sonner";

interface Teacher {
  id: string;
  name: string;
  subjects: string[] | string;
}

interface AddScheduleEntryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (entry: Omit<ScheduleEntry, "id">) => void;
  editEntry?: ScheduleEntry | null;
  defaultDay?: string;
  classSession: "MORNING" | "AFTERNOON";
  classId?: string;
  existingEntries?: ScheduleEntry[];
}

export function AddScheduleEntryDialog({
  open,
  onOpenChange,
  onSave,
  editEntry,
  defaultDay,
  classSession,
  classId,
  existingEntries,
}: AddScheduleEntryDialogProps) {
  const [teachers, setTeachers] = React.useState<Teacher[]>([]);
  const [selectedTeacherId, setSelectedTeacherId] = React.useState("");
  const [subject, setSubject] = React.useState("");
  const [dayOfWeek, setDayOfWeek] = React.useState(defaultDay || "saturday");
  const [selectedPeriods, setSelectedPeriods] = React.useState<string[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [usedPeriodsForDay, setUsedPeriodsForDay] = React.useState<string[]>([]);

  // Get available time slots for the class session
  const availableTimeSlots = React.useMemo(() => {
    return getTimeSlotsBySession(classSession);
  }, [classSession]);

  // Calculate used periods for the selected day (from other entries)
  const calculateUsedPeriods = React.useCallback(() => {
    if (!existingEntries || !dayOfWeek) {
      return [];
    }

    // Get all periods used on this day by other entries
    return existingEntries
      .filter(entry => {
        // Exclude current entry being edited
        if (editEntry && entry.id === editEntry.id) return false;
        // Only same day
        return entry.dayOfWeek === dayOfWeek;
      })
      .map(entry => `${entry.startTime}-${entry.endTime}`);
  }, [existingEntries, dayOfWeek, editEntry]);

  React.useEffect(() => {
    setUsedPeriodsForDay(calculateUsedPeriods());
  }, [calculateUsedPeriods]);

  // Get available periods for selection (exclude already selected and used by other entries)
  const getAvailablePeriodsForSlot = React.useCallback((slotIndex: number) => {
    // Exclude all already selected periods except the current one being edited
    const alreadySelected = selectedPeriods.filter((_, i) => i !== slotIndex);
    
    return availableTimeSlots.filter(
      slot => {
        const periodKey = `${slot.startTime}-${slot.endTime}`;
        // Not already selected in this form
        if (alreadySelected.includes(periodKey)) return false;
        // Not used by other entries on this day
        if (usedPeriodsForDay.includes(periodKey)) return false;
        return true;
      }
    );
  }, [selectedPeriods, availableTimeSlots, usedPeriodsForDay]);

  // Calculate time range from selected periods
  const calculatedTimeRange = React.useMemo(() => {
    if (selectedPeriods.length === 0) return null;
    
    const sortedPeriods = selectedPeriods
      .map(periodKey => {
        const slot = availableTimeSlots.find(
          s => `${s.startTime}-${s.endTime}` === periodKey
        );
        return slot;
      })
      .filter(Boolean)
      .sort((a, b) => a!.startTime.localeCompare(b!.startTime));
    
    if (sortedPeriods.length === 0) return null;
    
    const firstPeriod = sortedPeriods[0]!;
    const lastPeriod = sortedPeriods[sortedPeriods.length - 1]!;
    
    return {
      startTime: firstPeriod.startTime,
      endTime: lastPeriod.endTime,
      hours: selectedPeriods.length,
      periods: sortedPeriods.map(p => p!.label.split(' (')[0]).join(', ')
    };
  }, [selectedPeriods, availableTimeSlots]);

  // Load teachers on mount
  React.useEffect(() => {
    if (open) {
      loadTeachers();
    }
  }, [open]);

  const loadTeachers = async () => {
    try {
      const data = await scheduleApi.fetchTeachers();
      setTeachers(data);
    } catch (error) {
      console.error("Error loading teachers:", error);
      toast.error("Failed to load teachers");
    }
  };

  // Get subjects for selected teacher
  const availableSubjects = React.useMemo<string[]>(() => {
    const teacher = teachers.find((t) => t.id === selectedTeacherId);
    if (!teacher) return [];

    // Handle both string and array format
    if (typeof teacher.subjects === 'string') {
      try {
        const parsed = JSON.parse(teacher.subjects) as string[];
        return Array.isArray(parsed) ? parsed : teacher.subjects.split(',').map((s) => s.trim());
      } catch {
        return teacher.subjects.split(',').map((s) => s.trim());
      }
    }
    return Array.isArray(teacher.subjects) ? teacher.subjects : [];
  }, [selectedTeacherId, teachers]);

  // Populate form when editing
  React.useEffect(() => {
    if (editEntry) {
      setSelectedTeacherId(editEntry.teacherId || "");
      setSubject(editEntry.subject);
      setDayOfWeek(editEntry.dayOfWeek);
      
      // For editing, try to find matching periods
      // This is a simplified approach - assumes consecutive periods
      const startSlot = availableTimeSlots.find(
        s => s.startTime === editEntry.startTime
      );
      
      if (startSlot && editEntry.hours) {
        const startIdx = availableTimeSlots.indexOf(startSlot);
        const periods: string[] = [];
        for (let i = 0; i < editEntry.hours && (startIdx + i) < availableTimeSlots.length; i++) {
          const slot = availableTimeSlots[startIdx + i];
          periods.push(`${slot.startTime}-${slot.endTime}`);
        }
        setSelectedPeriods(periods);
      }
    } else {
      // Reset form - start with one empty period
      setSelectedTeacherId("");
      setSubject("");
      setDayOfWeek(defaultDay || "saturday");
      setSelectedPeriods([]);
    }
  }, [editEntry, defaultDay, open, availableTimeSlots]);

  // Auto-select first subject when teacher changes
  React.useEffect(() => {
    if (selectedTeacherId && availableSubjects.length > 0 && !editEntry) {
      setSubject(availableSubjects[0]);
    }
  }, [selectedTeacherId, availableSubjects, editEntry]);

  const handleAddPeriod = () => {
    // Don't allow adding more than available periods
    if (selectedPeriods.length >= availableTimeSlots.length) {
      toast.error(`Maximum ${availableTimeSlots.length} periods allowed`);
      return;
    }
    
    // Check if there are any available periods left
    const availableCount = availableTimeSlots.filter(slot => {
      const periodKey = `${slot.startTime}-${slot.endTime}`;
      return !selectedPeriods.includes(periodKey) && !usedPeriodsForDay.includes(periodKey);
    }).length;
    
    if (availableCount === 0) {
      toast.error("All periods for this day are already assigned");
      return;
    }
    
    setSelectedPeriods([...selectedPeriods, ""]);
  };

  const handleRemovePeriod = (index: number) => {
    setSelectedPeriods(selectedPeriods.filter((_, i) => i !== index));
  };

  const handlePeriodChange = (index: number, value: string) => {
    const newPeriods = [...selectedPeriods];
    newPeriods[index] = value;
    setSelectedPeriods(newPeriods);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedTeacherId || !subject || selectedPeriods.length === 0) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Check for empty period selections
    if (selectedPeriods.some(p => !p)) {
      toast.error("Please select all periods or remove empty ones");
      return;
    }

    if (!calculatedTimeRange) {
      toast.error("Invalid time range selected");
      return;
    }

    // Check if total hours for this day exceeds 6 hours
    if (existingEntries && dayOfWeek) {
      const totalHoursOnDay = existingEntries
        .filter(entry => {
          // Exclude current entry if editing
          if (editEntry && entry.id === editEntry.id) return false;
          return entry.dayOfWeek === dayOfWeek;
        })
        .reduce((sum, entry) => sum + (entry.hours || 0), 0);
      
      const newTotalHours = totalHoursOnDay + calculatedTimeRange.hours;
      
      if (newTotalHours > 6) {
        toast.error("Cannot exceed 6 hours per day", {
          description: `This day already has ${totalHoursOnDay} hours scheduled. Adding ${calculatedTimeRange.hours} hours would exceed the 6-hour limit.`,
        });
        return;
      }
    }

    const selectedTeacher = teachers.find(t => t.id === selectedTeacherId);

    if (!selectedTeacher) {
      toast.error("Selected teacher not found");
      return;
    }

    setLoading(true);
    
    try {
      await onSave({
        teacherId: selectedTeacherId,
        teacherName: selectedTeacher.name,
        subject: subject.trim(),
        hours: calculatedTimeRange.hours,
        dayOfWeek,
        startTime: calculatedTimeRange.startTime,
        endTime: calculatedTimeRange.endTime,
      });

      onOpenChange(false);
    } catch (error: unknown) {
      console.error("Error saving schedule:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to save schedule entry";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-hidden p-0 gap-0">
        <form onSubmit={handleSubmit} className="flex flex-col max-h-[90vh] h-full">
          <DialogHeader className="pb-2 px-6 pt-6 flex-shrink-0">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-gradient-to-br from-orange-100 to-amber-100 rounded-lg">
                <BookOpen className="h-5 w-5 text-orange-600" />
              </div>
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                {editEntry ? "Edit Schedule Entry" : "Add Schedule Entry"}
              </DialogTitle>
            </div>
          </DialogHeader>

          <div className="grid gap-5 py-6 px-6 overflow-y-auto flex-1 min-h-0">
            <div className="grid grid-cols-2 gap-4">
              {/* Teacher Selection */}
              <div className="grid gap-2">
                <Label htmlFor="teacher" className="text-slate-700 font-semibold flex items-center gap-2">
                  <User className="h-3.5 w-3.5 text-orange-600" />
                  Teacher *
                </Label>
                <CustomSelect
                  id="teacher"
                  value={selectedTeacherId}
                  onValueChange={setSelectedTeacherId}
                  className="h-11 focus:border-orange-400 focus:ring-orange-400"
                  required
                >
                  <option value="">Select Teacher</option>
                  {teachers.map((teacher) => (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.name}
                    </option>
                  ))}
                </CustomSelect>
              </div>

              {/* Subject Selection */}
              <div className="grid gap-2">
                <Label htmlFor="subject" className="text-slate-700 font-semibold flex items-center gap-2">
                  <BookOpen className="h-3.5 w-3.5 text-orange-600" />
                  Subject *
                </Label>
                <CustomSelect
                  id="subject"
                  value={subject}
                  onValueChange={setSubject}
                  className="h-11 focus:border-orange-400 focus:ring-orange-400"
                  required
                  disabled={!selectedTeacherId || availableSubjects.length === 0}
                >
                  <option value="">Select Subject</option>
                  {availableSubjects.map((subj) => (
                    <option key={subj} value={subj}>
                      {subj}
                    </option>
                  ))}
                </CustomSelect>
              </div>
            </div>

            {/* Day of Week */}
            <div className="grid gap-2">
              <Label htmlFor="dayOfWeek" className="text-slate-700 font-semibold flex items-center gap-2">
                <CalendarIcon className="h-3.5 w-3.5 text-orange-600" />
                Day of Week *
              </Label>
              <CustomSelect
                id="dayOfWeek"
                value={dayOfWeek}
                onValueChange={setDayOfWeek}
                className="h-11 focus:border-orange-400 focus:ring-orange-400"
                required
              >
                {DAYS.map((day) => (
                  <option key={day.key} value={day.key}>
                    {day.label}
                  </option>
                ))}
              </CustomSelect>
            </div>

            {/* Dynamic Period Selection */}
            <div className="grid gap-3">
              <div className="flex items-center justify-between">
                <Label className="text-slate-700 font-semibold flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5 text-orange-600" />
                  Select Periods * ({selectedPeriods.filter(p => p).length}/{availableTimeSlots.length})
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddPeriod}
                  disabled={selectedPeriods.length >= availableTimeSlots.length}
                  className="h-8 px-3 text-xs border-0 bg-orange-50 hover:bg-orange-100 text-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  Add Period
                </Button>
              </div>

              {/* Period List */}
              <div className="space-y-2">
                {selectedPeriods.length === 0 && (
                  <div className="text-center py-6 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl shadow-sm">
                    <Clock className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-sm text-slate-600">Click &quot;Add Period&quot; to select teaching times</p>
                  </div>
                )}

                {selectedPeriods.map((period, index) => {
                  const availablePeriods = getAvailablePeriodsForSlot(index);
                  return (
                    <div key={index} className="flex items-center gap-2">
                      <div className="flex-1">
                        <CustomSelect
                          value={period}
                          onValueChange={(value) => handlePeriodChange(index, value)}
                          className="h-11 focus:border-orange-400 focus:ring-orange-400"
                          required
                        >
                          <option value="">Select Period {index + 1}</option>
                          {availablePeriods.map((slot) => (
                            <option key={`${slot.startTime}-${slot.endTime}`} value={`${slot.startTime}-${slot.endTime}`}>
                              {slot.label}
                            </option>
                          ))}
                        </CustomSelect>
                        {availablePeriods.length === 0 && period === "" && (
                          <p className="text-xs text-red-600 mt-1">No available periods left for this day</p>
                        )}
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemovePeriod(index)}
                        className="h-11 px-3 border-0 bg-red-50 hover:bg-red-100 text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  );
                })}
              </div>

              {/* Info about used periods and total hours */}
              {existingEntries && dayOfWeek && (() => {
                const totalHoursOnDay = existingEntries
                  .filter(entry => {
                    if (editEntry && entry.id === editEntry.id) return false;
                    return entry.dayOfWeek === dayOfWeek;
                  })
                  .reduce((sum, entry) => sum + (entry.hours || 0), 0);
                
                const remainingHours = 6 - totalHoursOnDay;
                const newTotalHours = totalHoursOnDay + (calculatedTimeRange?.hours || 0);
                
                return (
                  <div className="space-y-2">
                    {usedPeriodsForDay.length > 0 && (
                      <div className="bg-blue-50 p-3 rounded-lg shadow-sm">
                        <p className="text-xs text-blue-700">
                           {usedPeriodsForDay.length} {usedPeriodsForDay.length === 1 ? 'period is' : 'periods are'} already assigned to other entries on {dayOfWeek}.
                        </p>
                      </div>
                    )}
                    
                    {totalHoursOnDay > 0 && (
                      <div className={`p-3 rounded-lg shadow-sm ${
                        remainingHours === 0 ? 'bg-red-50' : 
                        remainingHours <= 2 ? 'bg-yellow-50' : 
                        'bg-green-50'
                      }`}>
                        <div className="flex items-center justify-between text-xs">
                          <span className={
                            remainingHours === 0 ? 'text-red-700 font-semibold' : 
                            remainingHours <= 2 ? 'text-yellow-700 font-semibold' : 
                            'text-green-700 font-semibold'
                          }>
                             Day Usage: {totalHoursOnDay}/6 hours used
                          </span>
                          <span className={
                            remainingHours === 0 ? 'text-red-600' : 
                            remainingHours <= 2 ? 'text-yellow-600' : 
                            'text-green-600'
                          }>
                            {remainingHours} hours remaining
                          </span>
                        </div>
                        {calculatedTimeRange && newTotalHours > 6 && (
                          <p className="text-xs text-red-700 mt-1 font-semibold">
                             Adding {calculatedTimeRange.hours} hours would exceed the 6-hour limit!
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>

            {/* Calculated Time Range Display */}
            {calculatedTimeRange && (
              <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-4 rounded-xl shadow-sm">
                <div className="flex items-center gap-2 text-sm mb-2">
                  <Clock className="h-4 w-4 text-orange-600" />
                  <span className="font-semibold text-orange-900">Selected Periods:</span>
                </div>
                <div className="text-sm text-orange-700 mb-2">
                  {calculatedTimeRange.periods}
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-semibold text-orange-900">Total Time:</span>
                  <span className="text-orange-700">{formatTimeDisplay(calculatedTimeRange.startTime)} - {formatTimeDisplay(calculatedTimeRange.endTime)}</span>
                  <span className="text-orange-600">({calculatedTimeRange.hours} {calculatedTimeRange.hours === 1 ? 'period' : 'periods'}, {calculatedTimeRange.hours * 40} minutes)</span>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 px-6 py-4 bg-slate-50 flex-shrink-0 rounded-b-2xl">
            <Button
              type="button"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl shadow-md"
              disabled={loading || !selectedTeacherId || !subject || selectedPeriods.length === 0 || !calculatedTimeRange}
            >
              <Save className="h-4 w-4 mr-1.5" />
              {loading ? "Saving..." : editEntry ? "Update Entry" : "Add Entry"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
