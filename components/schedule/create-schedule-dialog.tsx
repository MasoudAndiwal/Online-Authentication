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
        <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 py-6">
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
          </DialogHeader>

          <div className="grid gap-6 py-6">
            <div className="grid gap-2">
              <Label htmlFor="className" className="text-slate-700 font-semibold">Class Name</Label>
              <Input
                id="className"
                placeholder="e.g., database semister 4"
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                className="h-11 border-slate-300 focus:border-purple-400 focus:ring-purple-400"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="session" className="text-slate-700 font-semibold">Time Session</Label>
              <CustomSelect
                value={session}
                onValueChange={(value) => setSession(value as TimeSession)}
                className="h-11 border-slate-300 focus:border-purple-400"
              >
                <option value="MORNING">
                   Morning (08:30 AM - 12:30 AM)
                </option>
                <option value="AFTERNOON">
                   Afternoon (1:15 PM - 5:30 PM)
                </option>
              </CustomSelect>
             
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
