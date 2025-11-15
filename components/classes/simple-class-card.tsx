"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import type { Class } from "@/lib/stores/teacher-dashboard-store";

interface SimpleClassCardProps {
  classData: Class;
  onViewDetails?: (classId: string) => void;
  className?: string;
}

export const SimpleClassCard = React.forwardRef<HTMLDivElement, SimpleClassCardProps>(({ 
  classData, 
  onViewDetails,
  className
}, ref) => {
  // Beautiful color schemes for different classes
  const colorSchemes = [
    { bg: 'from-blue-50 to-blue-100/50', icon: 'from-blue-500 to-blue-600', hover: 'hover:shadow-blue-200/50' },
    { bg: 'from-purple-50 to-purple-100/50', icon: 'from-purple-500 to-purple-600', hover: 'hover:shadow-purple-200/50' },
    { bg: 'from-emerald-50 to-emerald-100/50', icon: 'from-emerald-500 to-emerald-600', hover: 'hover:shadow-emerald-200/50' },
    { bg: 'from-orange-50 to-orange-100/50', icon: 'from-orange-500 to-orange-600', hover: 'hover:shadow-orange-200/50' },
    { bg: 'from-pink-50 to-pink-100/50', icon: 'from-pink-500 to-pink-600', hover: 'hover:shadow-pink-200/50' },
    { bg: 'from-cyan-50 to-cyan-100/50', icon: 'from-cyan-500 to-cyan-600', hover: 'hover:shadow-cyan-200/50' },
  ];

  // Select color scheme based on class ID (consistent per class)
  const colorIndex = classData.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colorSchemes.length;
  const colorScheme = colorSchemes[colorIndex];

  const handleClick = () => {
    if (onViewDetails) {
      onViewDetails(classData.id);
    }
  };

  return (
    <motion.div
      ref={ref}
      className={cn("group cursor-pointer", className)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      onClick={handleClick}
    >
      <Card className={cn(
        "rounded-xl sm:rounded-2xl shadow-lg border-0 overflow-hidden relative touch-manipulation transition-all duration-300",
        colorScheme.hover,
        "bg-gradient-to-br",
        colorScheme.bg
      )}>
        <CardContent className="p-6 relative z-10">
          {/* Header with Icon and Class Name */}
          <div className="flex items-center gap-4 mb-6">
            <motion.div 
              className={cn(
                "p-3 bg-gradient-to-br rounded-2xl shadow-lg flex-shrink-0",
                colorScheme.icon
              )}
              whileHover={{ scale: 1.05, rotate: 5 }}
              transition={{ duration: 0.2 }}
            >
              <BookOpen className="h-6 w-6 text-white" />
            </motion.div>
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-bold text-slate-900 mb-1 truncate">
                {classData.name}
              </h3>
              {classData.major && (
                <p className="text-sm text-slate-600 truncate">
                  {classData.major}
                </p>
              )}
            </div>
          </div>

          {/* Simple Student Count */}
          <div className="flex items-center gap-2 text-slate-700">
            <Users className="h-5 w-5" />
            <span className="text-lg font-semibold">
              {classData.studentCount} {classData.studentCount === 1 ? 'Student' : 'Students'}
            </span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
});

SimpleClassCard.displayName = 'SimpleClassCard';
