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
import { Save, GraduationCap } from "lucide-react";

interface EditClassDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classData: {
    id: string;
    name: string;
    session: "MORNING" | "AFTERNOON";
    major: string;
    semester: number;
  } | null;
  onSaveClass: (data: {
    name: string;
    session: "MORNING" | "AFTERNOON";
    major: string;
    semester: number;
  }) => void;
}

export function EditClassDialog({ 
  open, 
  onOpenChange, 
  classData,
  onSaveClass 
}: EditClassDialogProps) {
  const [className, setClassName] = React.useState("");
  const [session, setSession] = React.useState<"MORNING" | "AFTERNOON">("MORNING");
  const [major, setMajor] = React.useState("");
  const [semester, setSemester] = React.useState<number>(1);

  // Update form when classData changes
  React.useEffect(() => {
    if (classData) {
      setClassName(classData.name);
      setSession(classData.session);
      setMajor(classData.major);
      setSemester(classData.semester);
    }
  }, [classData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!className.trim() || !major.trim()) return;

    onSaveClass({
      name: className.trim(),
      session,
      major: major.trim(),
      semester,
    });

    onOpenChange(false);
  };

  const handleCancel = () => {
    // Reset to original values
    if (classData) {
      setClassName(classData.name);
      setSession(classData.session);
      setMajor(classData.major);
      setSemester(classData.semester);
    }
    onOpenChange(false);
  };

  if (!classData) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-hidden p-0">
        <form onSubmit={handleSubmit} className="flex flex-col max-h-[90vh] h-full">
          <DialogHeader className="pb-2 px-6 pt-6 flex-shrink-0">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 bg-gradient-to-br from-orange-100 to-amber-100 rounded-xl shadow-md">
                <GraduationCap className="h-6 w-6 text-orange-600" />
              </div>
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                Edit Class
              </DialogTitle>
            </div>
            <DialogDescription className="text-slate-600 text-base">
              Update class information. Changes will be applied immediately.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-5 py-6 px-6 overflow-y-auto flex-1 min-h-0">
            {/* Class Name */}
            <div className="grid gap-2">
              <Label htmlFor="className" className="text-slate-700 font-semibold flex items-center gap-2">
                <span>Class Name</span>
                <span className="text-red-500">*</span>
              </Label>
              <Input
                id="className"
                placeholder="e.g., Class A, Class B..."
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                className="h-12 border-slate-300 focus:border-orange-400 focus:ring-orange-400 text-base"
                required
              />
            </div>

            {/* Major/Program */}
            <div className="grid gap-2">
              <Label htmlFor="major" className="text-slate-700 font-semibold flex items-center gap-2">
                <span>Program / Major</span>
                <span className="text-red-500">*</span>
              </Label>
              <Input
                id="major"
                placeholder="e.g., Computer Science, Electronics..."
                value={major}
                onChange={(e) => setMajor(e.target.value)}
                className="h-12 border-slate-300 focus:border-orange-400 focus:ring-orange-400 text-base"
                required
              />
            </div>

            {/* Semester */}
            <div className="grid gap-2">
              <Label htmlFor="semester" className="text-slate-700 font-semibold flex items-center gap-2">
                <span>Semester</span>
                <span className="text-red-500">*</span>
              </Label>
              <Input
                id="semester"
                type="test"
                placeholder="e.g.,Computer Science"
                value={semester}
                onChange={(e) => setSemester(parseInt(e.target.value) || 1)}
                className="h-12 border-slate-300 focus:border-orange-400 focus:ring-orange-400 text-base"
                required
              />
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
                 <option value="MORNING">
                   Morning (08:30 AM - 12:30 PM)
                </option>
                <option value="AFTERNOON">
                   Afternoon (01:15 PM - 05:30 PM)
                </option>
              </CustomSelect>
            </div>
          </div>

          <DialogFooter className="gap-2 px-6 py-4 border-t bg-white flex-shrink-0">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              className="border-slate-300 hover:bg-slate-50"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 shadow-md hover:shadow-lg transition-all duration-200"
              disabled={!className.trim() || !major.trim()}
            >
              <Save className="h-4 w-4 mr-1.5" />
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
