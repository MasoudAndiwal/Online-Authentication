import * as React from "react";
import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'card' | 'text' | 'circle' | 'button';
}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    const baseStyles = "animate-pulse bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 bg-[length:200%_100%]";
    
    const variantStyles = {
      default: "rounded-md",
      card: "rounded-xl h-32 w-full",
      text: "rounded h-4 w-full",
      circle: "rounded-full",
      button: "rounded-lg h-10 w-24"
    };

    return (
      <div
        ref={ref}
        className={cn(
          baseStyles,
          variantStyles[variant],
          className
        )}
        {...props}
      />
    );
  }
);

Skeleton.displayName = "Skeleton";

// Skeleton components for specific layouts
const SkeletonCard: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn("bg-white border-0 shadow-sm rounded-xl p-4 md:p-6 space-y-4", className)}>
    <div className="flex items-center space-x-4">
      <Skeleton variant="circle" className="w-12 h-12" />
      <div className="flex-1 space-y-2">
        <Skeleton variant="text" className="w-3/4" />
        <Skeleton variant="text" className="w-1/2 h-3" />
      </div>
    </div>
  </div>
);

const SkeletonStatsCard: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn("bg-white border-0 shadow-sm rounded-xl p-4 md:p-6", className)}>
    <div className="flex items-center justify-between">
      <div className="space-y-2 flex-1">
        <Skeleton variant="text" className="w-20 h-3" />
        <Skeleton variant="text" className="w-16 h-8" />
      </div>
      <Skeleton variant="circle" className="w-12 h-12" />
    </div>
  </div>
);

const SkeletonCalendarDay: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn("bg-white border-0 shadow-md rounded-xl p-4 space-y-2", className)}>
    <Skeleton variant="text" className="w-16 h-4" />
    <Skeleton variant="text" className="w-12 h-3" />
    <div className="flex gap-1 mt-2">
      <Skeleton variant="circle" className="w-2 h-2" />
      <Skeleton variant="circle" className="w-2 h-2" />
      <Skeleton variant="circle" className="w-2 h-2" />
    </div>
  </div>
);

const SkeletonActivityItem: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn("flex items-center space-x-4 p-3 rounded-lg", className)}>
    <Skeleton variant="circle" className="w-8 h-8" />
    <div className="flex-1 space-y-2">
      <Skeleton variant="text" className="w-3/4" />
      <Skeleton variant="text" className="w-1/2 h-3" />
    </div>
    <Skeleton variant="button" className="w-20 h-6" />
  </div>
);

export { 
  Skeleton, 
  SkeletonCard, 
  SkeletonStatsCard, 
  SkeletonCalendarDay, 
  SkeletonActivityItem 
};
export type { SkeletonProps };
