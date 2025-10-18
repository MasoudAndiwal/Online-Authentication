import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CustomSelect } from "@/components/ui/custom-select";
import { BookOpen, User, Clock, Calendar as CalendarIcon, Save } from "lucide-react";
import { ScheduleEntry, DAYS } from "@/lib/data/schedule-data";

interface AddScheduleEntryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (entry: Omit<ScheduleEntry, "id">) => void;
  editEntry?: ScheduleEntry | null;
  defaultDay?: string;
}

export function AddScheduleEntryDialog({
  open,
  onOpenChange,
  onSave,
  editEntry,
  defaultDay,
}: AddScheduleEntryDialogProps) {
  const [teacherName, setTeacherName] = React.useState("");
  const [subject, setSubject] = React.useState("");
  const [hours, setHours] = React.useState("2");
  const [dayOfWeek, setDayOfWeek] = React.useState(defaultDay || "saturday");
  const [startTime, setStartTime] = React.useState("08:00");
  const [endTime, setEndTime] = React.useState("10:00");

  // Populate form when editing
  React.useEffect(() => {
    if (editEntry) {
      setTeacherName(editEntry.teacherName);
      setSubject(editEntry.subject);
      setHours(editEntry.hours.toString());
      setDayOfWeek(editEntry.dayOfWeek);
      setStartTime(editEntry.startTime);
      setEndTime(editEntry.endTime);
    } else if (defaultDay) {
      setDayOfWeek(defaultDay);
    }
  }, [editEntry, defaultDay]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!teacherName.trim() || !subject.trim()) return;

    onSave({
      teacherName: teacherName.trim(),
      subject: subject.trim(),
      hours: parseInt(hours) || 1,
      dayOfWeek,
      startTime,
      endTime,
    });

    // Reset form
    setTeacherName("");
    setSubject("");
    setHours("2");
    setDayOfWeek(defaultDay || "saturday");
    setStartTime("08:00");
    setEndTime("10:00");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] border-purple-200">
        <form onSubmit={handleSubmit}>
          <DialogHeader className="pb-2">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg">
                <BookOpen className="h-5 w-5 text-purple-600" />
              </div>
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                {editEntry ? "Edit Schedule Entry" : "Add Schedule Entry"}
              </DialogTitle>
            </div>
            <DialogDescription className="text-slate-600">
              {editEntry ? "Update the teacher and subject information." : "Add a teacher and subject to this class schedule."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-5 py-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="teacherName" className="text-slate-700 font-semibold flex items-center gap-2">
                  <User className="h-3.5 w-3.5 text-purple-600" />
                  Teacher Name *
                </Label>
                <Input
                  id="teacherName"
                  placeholder="e.g., Prof. Ahmad"
                  value={teacherName}
                  onChange={(e) => setTeacherName(e.target.value)}
                  className="h-11 border-slate-300 focus:border-purple-400 focus:ring-purple-400"
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="subject" className="text-slate-700 font-semibold flex items-center gap-2">
                  <BookOpen className="h-3.5 w-3.5 text-purple-600" />
                  Subject *
                </Label>
                <Input
                  id="subject"
                  placeholder="e.g., Mathematics"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="h-11 border-slate-300 focus:border-purple-400 focus:ring-purple-400"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="dayOfWeek" className="text-slate-700 font-semibold flex items-center gap-2">
                  <CalendarIcon className="h-3.5 w-3.5 text-purple-600" />
                  Day of Week *
                </Label>
                <CustomSelect
                  value={dayOfWeek}
                  onValueChange={setDayOfWeek}
                  className="h-11 border-slate-300 focus:border-purple-400"
                >
                  {DAYS.map((day) => (
                    <option key={day.key} value={day.key}>
                      {day.label}
                    </option>
                  ))}
                </CustomSelect>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="startTime" className="text-slate-700 font-semibold flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5 text-purple-600" />
                  Start Time *
                </Label>
                <Input
                  id="startTime"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="h-11 border-slate-300 focus:border-purple-400 focus:ring-purple-400"
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="endTime" className="text-slate-700 font-semibold flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5 text-purple-600" />
                  End Time *
                </Label>
                <Input
                  id="endTime"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="h-11 border-slate-300 focus:border-purple-400 focus:ring-purple-400"
                  required
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="hours" className="text-slate-700 font-semibold">Teaching Hours *</Label>
              <Input
                id="hours"
                type="number"
                min="1"
                max="8"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                className="h-11 border-slate-300 focus:border-purple-400 focus:ring-purple-400"
                required
              />
              <p className="text-xs text-slate-500">
                Number of hours this teacher teaches (1-8 hours)
              </p>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-xl border border-blue-200 shadow-sm">
              <p className="text-sm text-blue-900 font-bold mb-1.5">
                💡 Tip: Multiple Teachers Per Day
              </p>
              <p className="text-xs text-blue-800">
                You can add multiple teachers for the same day with different time slots.
                Just make sure their times don&apos;t overlap.
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-slate-300 hover:bg-slate-50"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-md"
              disabled={!teacherName.trim() || !subject.trim()}
            >
              <Save className="h-4 w-4 mr-1.5" />
              {editEntry ? "Save Changes" : "Add Entry"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
