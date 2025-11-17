import * as React from "react";
import { cn } from "@/lib/utils";

interface IconProps {
  icon: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  withBackground?: boolean;
  backgroundColor?: string;
  interactive?: boolean;
  className?: string;
}

const Icon: React.FC<IconProps> = ({ 
  icon, 
  size = 'md', 
  color,
  withBackground = false,
  backgroundColor,
  interactive = false,
  className 
}) => {
  const sizeStyles = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6"
  };
  
  const containerSizeStyles = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12"
  };
  
  const interactiveStyles = interactive 
    ? "transition-transform duration-200 hover:scale-110 cursor-pointer" 
    : "";

  if (withBackground) {
    return (
      <div
        className={cn(
          "rounded-lg flex items-center justify-center",
          containerSizeStyles[size],
          backgroundColor || "bg-blue-100",
          interactiveStyles,
          className
        )}
      >
        <div className={cn(sizeStyles[size], color || "text-blue-600")}>
          {icon}
        </div>
      </div>
    );
  }

  return (
    <div 
      className={cn(
        sizeStyles[size], 
        color,
        interactiveStyles,
        className
      )}
    >
      {icon}
    </div>
  );
};

Icon.displayName = "Icon";

export { Icon };
export type { IconProps };
