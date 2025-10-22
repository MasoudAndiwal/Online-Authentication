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
        "w-full justify-start h-auto p-3 sm:p-4 hover:bg-gradient-to-r hover:from-orange-50 hover:to-amber-50 transition-all duration-200 rounded-lg sm:rounded-xl border-0",
        isSelected && "bg-gradient-to-r from-orange-100 to-amber-100 shadow-md hover:from-orange-100 hover:to-amber-100"
      )}
    >
      <div className="flex items-center gap-2 sm:gap-3 w-full min-w-0">
        <div className={cn(
          "p-2 sm:p-2.5 rounded-lg sm:rounded-xl shadow-sm flex-shrink-0",
          classData.session === "MORNING" 
            ? "bg-gradient-to-br from-amber-100 to-orange-100" 
            : "bg-gradient-to-br from-indigo-100 to-purple-100"
        )}>
          <GraduationCap className={cn(
            "h-4 w-4 sm:h-5 sm:w-5",
            classData.session === "MORNING" ? "text-amber-600" : "text-indigo-600"
          )} />
        </div>
        
        <div className="flex-1 text-left min-w-0">
          <div className="font-bold text-slate-900 text-sm sm:text-base truncate">{classData.name}</div>
          <div className="flex items-center gap-1.5 sm:gap-2 mt-1 sm:mt-1.5 flex-wrap">
            <Badge variant="outline" className={cn("text-xs font-semibold shadow-sm", sessionColor)}>
              <SessionIcon className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-0.5 sm:mr-1" />
              <span className="hidden xs:inline">{classData.session}</span>
              <span className="xs:hidden">{classData.session.substring(0, 3)}</span>
            </Badge>
            <span className="text-xs text-slate-600 font-medium whitespace-nowrap">
              {classData.schedule.length} {classData.schedule.length === 1 ? 'class' : 'classes'}
            </span>
          </div>
        </div>
      </div>
    </Button>
  );
}
