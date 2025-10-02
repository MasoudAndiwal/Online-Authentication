"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { 
  NavigationIcon, 
  AnimatedChevron, 
  HoverIndicator, 
  StatusBadge 
} from "./NavigationIcon";

// Enhanced navigation item interface with animation support
export interface StandaloneNavigationItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  description?: string;
  children?: StandaloneNavigationItem[];
  isDropdown?: boolean;
  animationDelay?: number;
  hoverEffects?: {
    scale?: number;
    glow?: boolean;
    shadowElevation?: number;
    iconRotation?: number;
  };
}

export interface StandaloneDropdownNavigationProps {
  item: StandaloneNavigationItem;
  isExpanded: boolean;
  isHovered: boolean;
  onToggle: () => void;
  onHover: (isHovered: boolean) => void;
  onNavigate: (href: string) => void;
  level?: number;
}

// Animation configurations
const animationConfig = {
  dropdown: {
    expand: { duration: 0.3, ease: "easeOut" as const },
    collapse: { duration: 0.2, ease: "easeIn" as const },
  },
  hover: {
    scale: { duration: 0.2, ease: "easeOut" as const },
    glow: { duration: 0.3, ease: "easeOut" as const },
  },
  stagger: {
    delayChildren: 0.05,
    staggerChildren: 0.05,
  },
};

export const StandaloneDropdownNavigation: React.FC<StandaloneDropdownNavigationProps> = ({
  item,
  isExpanded,
  isHovered,
  onToggle,
  onHover,
  onNavigate,
  level = 0,
}) => {
  const Icon = item.icon;
  const hasChildren = item.children && item.children.length > 0;
  const [childrenHovered, setChildrenHovered] = React.useState<string | null>(null);
  const [expandedSubItems, setExpandedSubItems] = React.useState<string[]>([]);

  const toggleSubItem = (href: string) => {
    setExpandedSubItems(prev => 
      prev.includes(href) 
        ? prev.filter(item => item !== href)
        : [...prev, href]
    );
  };

  // Default hover effects
  const hoverEffects = {
    scale: 1.02,
    glow: true,
    shadowElevation: 8,
    iconRotation: 5,
    ...item.hoverEffects,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.3, 
        ease: "easeOut",
        delay: item.animationDelay ? item.animationDelay / 1000 : 0,
      }}
    >
      <div className="mb-1">
        <motion.div
          whileHover={{ 
            scale: hoverEffects.scale,
            transition: animationConfig.hover.scale,
          }}
          whileTap={{ scale: 0.98 }}
          onHoverStart={() => onHover(true)}
          onHoverEnd={() => onHover(false)}
          className="relative"
        >
          <button
            onClick={() => {
              if (hasChildren) {
                onToggle();
              } else {
                onNavigate(item.href);
              }
            }}
            className={cn(
              "w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 relative overflow-hidden",
              "hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50",
              isHovered && "bg-gradient-to-r from-blue-50 to-purple-50",
              isExpanded && "bg-gradient-to-r from-blue-100 to-purple-100",
              level > 0 && "ml-4"
            )}
          >
            {/* Enhanced 3D Icon */}
            <NavigationIcon
              icon={Icon}
              isHovered={isHovered}
              isActive={false}
              variant="3d"
              size="md"
            />
            
            {/* Label and description */}
            <div className="flex-1 text-left">
              <span className="font-medium text-slate-900">{item.label}</span>
              {item.description && (
                <div className="text-xs text-slate-500 mt-0.5">
                  {item.description}
                </div>
              )}
            </div>

            {/* Enhanced Badge */}
            {item.badge && (
              <StatusBadge
                count={item.badge}
                variant="primary"
                pulse={false}
              />
            )}
            
            {/* Animated Chevron for dropdown items */}
            {hasChildren && (
              <div className="ml-auto relative z-10">
                <AnimatedChevron
                  isExpanded={isExpanded}
                  size="md"
                  className={cn(
                    isHovered ? "text-blue-600" : "text-slate-500"
                  )}
                />
              </div>
            )}

            {/* Hover glow effect */}
            <AnimatePresence>
              {isHovered && hoverEffects.glow && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={animationConfig.hover.glow}
                  className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg pointer-events-none"
                />
              )}
            </AnimatePresence>

            {/* Enhanced Hover Indicator */}
            <HoverIndicator
              isVisible={isHovered}
              variant="left"
            />
          </button>
        </motion.div>

        {/* Dropdown children with staggered animations */}
        <AnimatePresence>
          {hasChildren && isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={animationConfig.dropdown.expand}
              className="overflow-hidden"
            >
              <motion.div
                variants={{
                  hidden: { opacity: 0 },
                  visible: {
                    opacity: 1,
                    transition: animationConfig.stagger,
                  },
                }}
                initial="hidden"
                animate="visible"
                className="ml-4 mt-2 space-y-1"
              >
                <div className="space-y-1">
                  {item.children?.map((child, index) => (
                    <StandaloneDropdownSubItem
                      key={child.href}
                      item={child}
                      index={index}
                      isHovered={childrenHovered === child.href}
                      onHover={(isHovered) => 
                        setChildrenHovered(isHovered ? child.href : null)
                      }
                      onNavigate={onNavigate}
                      level={level + 1}
                      expandedItems={expandedSubItems}
                      onToggleExpanded={toggleSubItem}
                    />
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

// Sub-item component with nested support
interface StandaloneDropdownSubItemProps {
  item: StandaloneNavigationItem;
  index: number;
  isHovered: boolean;
  onHover: (isHovered: boolean) => void;
  onNavigate: (href: string) => void;
  level?: number;
  expandedItems?: string[];
  onToggleExpanded?: (href: string) => void;
}

const StandaloneDropdownSubItem: React.FC<StandaloneDropdownSubItemProps> = ({
  item,
  index,
  isHovered,
  onHover,
  onNavigate,
  level = 1,
  expandedItems = [],
  onToggleExpanded,
}) => {
  const Icon = item.icon;
  const hasChildren = item.children && item.children.length > 0;
  const isExpanded = expandedItems.includes(item.href);

  const handleToggle = () => {
    if (hasChildren && onToggleExpanded) {
      onToggleExpanded(item.href);
    } else if (!hasChildren) {
      onNavigate(item.href);
    }
  };

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, x: -20 },
        visible: { 
          opacity: 1, 
          x: 0,
          transition: { 
            duration: 0.3, 
            delay: item.animationDelay ? item.animationDelay / 1000 : index * 0.05,
            ease: "easeOut" 
          }
        },
      }}
    >
      <div className="mb-1">
        <motion.div
          whileHover={{ scale: 1.02, x: 4 }}
          whileTap={{ scale: 0.98 }}
          onHoverStart={() => onHover(true)}
          onHoverEnd={() => onHover(false)}
          className="relative"
        >
          <button
            onClick={handleToggle}
            className={cn(
              "w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 relative",
              "hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:shadow-sm",
              isHovered && "bg-gradient-to-r from-blue-50 to-purple-50 shadow-sm",
              level > 1 && "ml-4"
            )}
          >
            {/* Enhanced Sub-item Icon */}
            <NavigationIcon
              icon={Icon}
              isHovered={isHovered}
              isActive={false}
              variant="glow"
              size="sm"
            />
            
            {/* Content */}
            <div className="flex-1 text-left">
              <div className="font-medium text-sm text-slate-900">{item.label}</div>
              {item.description && (
                <div className="text-xs text-slate-500">{item.description}</div>
              )}
            </div>

            {/* Enhanced Sub-item Badge */}
            {item.badge && (
              <StatusBadge
                count={item.badge}
                variant="primary"
                pulse={false}
                className="text-xs"
              />
            )}

            {/* Animated Chevron for nested items */}
            {hasChildren && (
              <AnimatedChevron
                isExpanded={isExpanded}
                size="sm"
                className={cn(
                  isHovered ? "text-blue-600" : "text-slate-500"
                )}
              />
            )}

            {/* Enhanced Sub-item Hover Indicator */}
            <HoverIndicator
              isVisible={isHovered}
              variant="left"
            />
          </button>
        </motion.div>

        {/* Nested children */}
        <AnimatePresence>
          {hasChildren && isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="ml-6 mt-1 space-y-1"
            >
              <div className="space-y-1">
                {item.children?.map((child, childIndex) => (
                  <motion.div
                    key={child.href}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: childIndex * 0.05 }}
                  >
                    <button
                      onClick={() => onNavigate(child.href)}
                      className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50"
                    >
                      <NavigationIcon
                        icon={child.icon}
                        isHovered={false}
                        isActive={false}
                        variant="default"
                        size="sm"
                      />
                      <span className="text-slate-900">{child.label}</span>
                      {child.description && (
                        <div className="text-xs text-slate-500 ml-2">
                          {child.description}
                        </div>
                      )}
                    </button>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};