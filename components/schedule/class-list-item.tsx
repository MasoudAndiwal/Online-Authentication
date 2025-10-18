import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, Sun, Moon } from "lucide-react";
import { Class } from "@/lib/data/schedule-data";
import { cn } from "@/lib/utils";

interface ClassListItemProps {
  classData: Class;
  isSelected: boolean;
  onClick: () => void;
}

export function ClassListItem({ classData, isSelected, onClick }: ClassListItemProps) {
  const SessionIcon = classData.session === "MORNING" ? Sun : Moon;
  const sessionColor = classData.session === "MORNING" 
    ? "bg-amber-50 text-amber-700 border-amber-200" 
    : "bg-indigo-50 text-indigo-700 border-indigo-200";

  return (
    <Button
      variant="ghost"
      onClick={onClick}
      className={cn(
        "w-full justify-start h-auto p-4 hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 transition-all duration-200 rounded-xl border-2 border-transparent",
        isSelected && "bg-gradient-to-r from-purple-100 to-blue-100 border-purple-400 shadow-md hover:from-purple-100 hover:to-blue-100"
      )}
    >
      <div className="flex items-center gap-3 w-full">
        <div className={cn(
          "p-2.5 rounded-xl shadow-sm",
          classData.session === "MORNING" 
            ? "bg-gradient-to-br from-amber-100 to-orange-100" 
            : "bg-gradient-to-br from-indigo-100 to-purple-100"
        )}>
          <GraduationCap className={cn(
            "h-5 w-5",
            classData.session === "MORNING" ? "text-amber-600" : "text-indigo-600"
          )} />
        </div>
        
        <div className="flex-1 text-left">
          <div className="font-bold text-slate-900 text-base">{classData.name}</div>
          <div className="flex items-center gap-2 mt-1.5">
            <Badge variant="outline" className={cn("text-xs font-semibold shadow-sm", sessionColor)}>
              <SessionIcon className="h-3 w-3 mr-1" />
              {classData.session}
            </Badge>
            <span className="text-xs text-slate-600 font-medium">
              {classData.schedule.length} {classData.schedule.length === 1 ? 'class' : 'classes'}
            </span>
          </div>
        </div>
      </div>
    </Button>
  );
}
