"use client";

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
import { Plus, GraduationCap, Sun, Moon, Sparkles } from "lucide-react";

interface CreateClassDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateClass: (data: { name: string; session: "MORNING" | "AFTERNOON" }) => void;
}

export function CreateClassDialog({ open, onOpenChange, onCreateClass }: CreateClassDialogProps) {
  const [className, setClassName] = React.useState("");
  const [session, setSession] = React.useState<"MORNING" | "AFTERNOON">("MORNING");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!className.trim()) return;

    onCreateClass({
      name: className.trim(),
      session,
    });

    // Reset form
    setClassName("");
    setSession("MORNING");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] border-orange-200">
        <form onSubmit={handleSubmit}>
          <DialogHeader className="pb-2">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 bg-gradient-to-br from-orange-100 to-amber-100 rounded-xl shadow-md">
                <GraduationCap className="h-6 w-6 text-orange-600" />
              </div>
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                Create New Class
              </DialogTitle>
            </div>
            <DialogDescription className="text-slate-600 text-base">
              Add a new class to the system. Students will be assigned to this class later.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 py-6">
            {/* Class Name Input */}
            <div className="grid gap-2">
              <Label htmlFor="className" className="text-slate-700 font-semibold flex items-center gap-2">
                <span>Class Name</span>
                <span className="text-red-500">*</span>
              </Label>
              <Input
                id="className"
                placeholder="e.g., Class A, Class B, Class 1, Class 2..."
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                className="h-12 border-slate-300 focus:border-orange-400 focus:ring-orange-400 text-base"
                required
                autoFocus
              />
              <p className="text-xs text-slate-500">
                Enter a unique name for this class (not the major or program name)
              </p>
            </div>

            {/* Session Selection */}
            <div className="grid gap-2">
              <Label htmlFor="session" className="text-slate-700 font-semibold flex items-center gap-2">
                <span>Time Session</span>
                <span className="text-red-500">*</span>
              </Label>
              <CustomSelect
                value={session}
                onValueChange={(value) => setSession(value as "MORNING" | "AFTERNOON")}
                className="h-12 border-slate-300 focus:border-orange-400 text-base"
              >
                <option value="MORNING" className="flex items-center">
                  ☀️ Morning (08:00 AM - 12:00 PM)
                </option>
                <option value="AFTERNOON">
                  🌙 Afternoon (01:00 PM - 05:00 PM)
                </option>
              </CustomSelect>
              <p className="text-xs text-slate-500">
                Choose the time session when this class will have lectures
              </p>
            </div>

            {/* Session Preview */}
            <div className={`p-4 rounded-xl border-2 ${
              session === "MORNING"
                ? "bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200"
                : "bg-gradient-to-r from-indigo-50 to-blue-50 border-indigo-200"
            }`}>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${
                  session === "MORNING"
                    ? "bg-gradient-to-br from-amber-100 to-orange-100"
                    : "bg-gradient-to-br from-indigo-100 to-blue-100"
                }`}>
                  {session === "MORNING" ? (
                    <Sun className="h-5 w-5 text-amber-600" />
                  ) : (
                    <Moon className="h-5 w-5 text-indigo-600" />
                  )}
                </div>
                <div>
                  <p className={`text-sm font-bold ${
                    session === "MORNING" ? "text-amber-900" : "text-indigo-900"
                  }`}>
                    {session === "MORNING" ? "Morning Session" : "Afternoon Session"}
                  </p>
                  <p className={`text-xs ${
                    session === "MORNING" ? "text-amber-700" : "text-indigo-700"
                  }`}>
                    {session === "MORNING" 
                      ? "Classes from 8:00 AM to 12:00 PM" 
                      : "Classes from 1:00 PM to 5:00 PM"}
                  </p>
                </div>
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-4 rounded-xl border border-orange-200 shadow-sm">
              <p className="text-sm text-orange-900 font-bold mb-2 flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                What happens next:
              </p>
              <ul className="text-xs text-orange-800 space-y-1.5 ml-1">
                <li className="flex items-start gap-2">
                  <span className="text-orange-500">•</span> 
                  <span>A new class will be created in the system</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-500">•</span> 
                  <span>You can assign students to this class</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-500">•</span> 
                  <span>You can create schedules and timetables for this class</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-500">•</span> 
                  <span>Teachers can mark attendance for this class</span>
                </li>
              </ul>
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
              className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 shadow-md hover:shadow-lg transition-all duration-200"
              disabled={!className.trim()}
            >
              <Plus className="h-4 w-4 mr-1.5" />
              Create Class
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
