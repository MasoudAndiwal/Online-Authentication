import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CustomSelect } from "@/components/ui/custom-select";
import { Plus, Sparkles } from "lucide-react";
import { TimeSession } from "@/lib/data/schedule-data";

interface CreateScheduleDialogProps {
  onCreateSchedule: (data: {
    className: string;
    session: TimeSession;
  }) => void;
}

export function CreateScheduleDialog({ onCreateSchedule }: CreateScheduleDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [className, setClassName] = React.useState("");
  const [session, setSession] = React.useState<TimeSession>("MORNING");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!className.trim()) return;

    onCreateSchedule({
      className: className.trim(),
      session,
    });

    // Reset form
    setClassName("");
    setSession("MORNING");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200">
          <Plus className="h-4 w-4 mr-2" />
          Create Schedule
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] border-purple-200">
        <form onSubmit={handleSubmit}>
          <DialogHeader className="pb-2">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg">
                <Sparkles className="h-5 w-5 text-purple-600" />
              </div>
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">Create New Class Schedule</DialogTitle>
            </div>
            <DialogDescription className="text-slate-600">
              Add a new class and create its schedule. Each class can have separate morning and afternoon sessions.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 py-6">
            <div className="grid gap-2">
              <Label htmlFor="className" className="text-slate-700 font-semibold">Class Name</Label>
              <Input
                id="className"
                placeholder="e.g., Class A, Class B, Class C..."
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                className="h-11 border-slate-300 focus:border-purple-400 focus:ring-purple-400"
                required
              />
              <p className="text-xs text-slate-500">
                Enter the name of the class (not the major name)
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="session" className="text-slate-700 font-semibold">Time Session</Label>
              <CustomSelect
                value={session}
                onValueChange={(value) => setSession(value as TimeSession)}
                className="h-11 border-slate-300 focus:border-purple-400"
              >
                <option value="MORNING">
                  ☀️ Morning (08:00 - 12:00)
                </option>
                <option value="AFTERNOON">
                  🌙 Afternoon (13:00 - 17:00)
                </option>
              </CustomSelect>
              <p className="text-xs text-slate-500">
                Select whether this is a morning or afternoon class
              </p>
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-xl border border-purple-200 shadow-sm">
              <p className="text-sm text-purple-900 font-bold mb-2 flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                What happens next:
              </p>
              <ul className="text-xs text-purple-800 space-y-1.5 ml-1">
                <li className="flex items-start gap-2"><span className="text-purple-500">•</span> <span>A new empty schedule will be created for this class</span></li>
                <li className="flex items-start gap-2"><span className="text-purple-500">•</span> <span>You can then add teachers and subjects to each day</span></li>
                <li className="flex items-start gap-2"><span className="text-purple-500">•</span> <span>Each class has its own unique schedule</span></li>
              </ul>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="border-slate-300 hover:bg-slate-50"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-md"
              disabled={!className.trim()}
            >
              <Plus className="h-4 w-4 mr-1.5" />
              Create Schedule
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
