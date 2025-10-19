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
import { Edit, Save } from "lucide-react";

interface EditClassDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentClassName: string;
  onSave: (newName: string) => void;
}

export function EditClassDialog({ 
  open, 
  onOpenChange, 
  currentClassName,
  onSave 
}: EditClassDialogProps) {
  const [className, setClassName] = React.useState(currentClassName);

  // Update local state when currentClassName prop changes
  React.useEffect(() => {
    setClassName(currentClassName);
  }, [currentClassName]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (className.trim() && className.trim() !== currentClassName) {
      onSave(className.trim());
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] border-orange-200">
        <form onSubmit={handleSubmit}>
          <DialogHeader className="pb-2">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-gradient-to-br from-orange-100 to-amber-100 rounded-lg">
                <Edit className="h-5 w-5 text-orange-600" />
              </div>
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                Edit Class Name
              </DialogTitle>
            </div>
            <DialogDescription className="text-slate-600">
              Update the name of this class. This will not affect the schedule entries.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-6">
            <div className="grid gap-2">
              <Label htmlFor="className" className="text-slate-700 font-semibold">
                Class Name
              </Label>
              <Input
                id="className"
                placeholder="e.g., Class A, Class B, Class C..."
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                className="h-11 border-slate-300 focus:border-orange-400 focus:ring-orange-400"
                required
                autoFocus
              />
              <p className="text-xs text-slate-500">
                Current name: <span className="font-semibold">{currentClassName}</span>
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
              className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 shadow-md"
              disabled={!className.trim() || className.trim() === currentClassName}
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
