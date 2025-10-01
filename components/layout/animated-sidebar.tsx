"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  Users,
  Calendar,
  BarChart3,
  Settings,
  BookOpen,
  ClipboardList,
  FileText,
  UserPlus,
  Shield,
  Clock,
  TrendingUp,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavigationItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  active?: boolean;
  badge?: string | number;
  children?: NavigationItem[];
}

interface UserProfile {
  name: string;
  email: string;
  role: "OFFICE" | "TEACHER" | "STUDENT";
  avatar?: string;
}

interface AnimatedSidebarProps {
  user?: UserProfile;
  currentPath?: string;
  onLogout?: () => void;
  onNavigate?: (href: string) => void;
  className?: string;
}

// Role-based navigation menus
const getNavigationItems = (role: string): NavigationItem[] => {
  const baseItems: NavigationItem[] = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: Home,
    },
  ];

  if (role === "OFFICE") {
    return [
      ...baseItems,
      {
        label: "User Management",
        href: "/user-management",
        icon: Users,
        children: [
          {
            label: "All Users",
            href: "/user-management/all-users",
            icon: Users,
          },
          {
            label: "Add User",
            href: "/user-management/add-user",
            icon: UserPlus,
          },
          {
            label: "Roles & Permissions",
            href: "/user-management/roles",
            icon: Shield,
          },
        ],
      },
      {
        label: "Classes & Schedule",
        href: "/classes",
        icon: Calendar,
        children: [
          {
            label: "All Classes",
            href: "/classes/all-classes",
            icon: BookOpen,
          },
          {
            label: "Schedule Builder",
            href: "/classes/schedule-builder",
            icon: Calendar,
          },
          {
            label: "Class Management",
            href: "/classes/management",
            icon: Settings,
          },
        ],
      },
      {
        label: "Attendance",
        href: "/attendance",
        icon: ClipboardList,
        children: [
          { label: "Overview", href: "/attendance/overview", icon: BarChart3 },
          {
            label: "Mark Attendance",
            href: "/attendance/mark",
            icon: ClipboardList,
          },
          {
            label: "Attendance History",
            href: "/attendance/history",
            icon: Clock,
          },
        ],
      },
      {
        label: "Reports & Analytics",
        href: "/reports",
        icon: TrendingUp,
        children: [
          { label: "Weekly Reports", href: "/reports/weekly", icon: FileText },
          {
            label: "Student Status",
            href: "/reports/student-status",
            icon: Users,
          },
          { label: "Export Data", href: "/reports/export", icon: TrendingUp },
        ],
      },
      {
        label: "System Settings",
        href: "/settings",
        icon: Settings,
        children: [
          {
            label: "General Settings",
            href: "/settings/general",
            icon: Settings,
          },
          {
            label: "Academic Calendar",
            href: "/settings/calendar",
            icon: Calendar,
          },
          {
            label: "Attendance Rules",
            href: "/settings/attendance-rules",
            icon: ClipboardList,
          },
        ],
      },
    ];
  }

  if (role === "TEACHER") {
    return [
      ...baseItems,
      {
        label: "My Classes",
        href: "/classes",
        icon: BookOpen,
      },
      {
        label: "Attendance",
        href: "/attendance",
        icon: ClipboardList,
        children: [
          {
            label: "Mark Attendance",
            href: "/attendance/mark",
            icon: ClipboardList,
          },
          {
            label: "Attendance History",
            href: "/attendance/history",
            icon: Clock,
          },
        ],
      },
      {
        label: "Reports",
        href: "/reports",
        icon: FileText,
      },
    ];
  }

  // Student navigation
  return [
    ...baseItems,
    {
      label: "My Attendance",
      href: "/attendance",
      icon: ClipboardList,
    },
    {
      label: "My Progress",
      href: "/progress",
      icon: TrendingUp,
    },
  ];
};

export function AnimatedSidebar({
  user,
  currentPath = "/dashboard",
  onLogout,
  onNavigate,
  className,
}: AnimatedSidebarProps) {
  const [expandedItems, setExpandedItems] = React.useState<string[]>([]);
  const navigationItems = user ? getNavigationItems(user.role) : [];

  const toggleExpanded = (href: string) => {
    setExpandedItems((prev) =>
      prev.includes(href)
        ? prev.filter((item) => item !== href)
        : [...prev, href]
    );
  };

  const isActive = (href: string) => {
    return currentPath === href || currentPath.startsWith(href + "/");
  };

  const isExpanded = (href: string) => {
    return (
      expandedItems.includes(href) ||
      navigationItems
        .find((item) => item.href === href)
        ?.children?.some((child) => isActive(child.href))
    );
  };

  const handleNavigation = (href: string) => {
    if (onNavigate) {
      onNavigate(href);
    } else {
      window.location.href = href;
    }
  };

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Logo/Brand */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="p-6 border-b border-white/20"
      >
        <div className="flex items-center space-x-3">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="h-10 w-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg"
          >
            <BookOpen className="h-6 w-6 text-white" />
          </motion.div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">University</h1>
            <p className="text-sm text-blue-600 font-semibold">AttendanceHub</p>
          </div>
        </div>
      </motion.div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navigationItems.map((item, index) => (
          <motion.div
            key={item.href}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1, duration: 0.3 }}
          >
            <NavigationItem
              item={item}
              isActive={isActive(item.href)}
              isExpanded={isExpanded(item.href)}
              onToggle={() => toggleExpanded(item.href)}
              onNavigate={handleNavigation}
              level={0}
            />
          </motion.div>
        ))}
      </nav>
    </div>
  );
}

interface NavigationItemProps {
  item: NavigationItem;
  isActive: boolean;
  isExpanded: boolean;
  onToggle: () => void;
  onNavigate: (href: string) => void;
  level: number;
}

function NavigationItem({
  item,
  isActive,
  isExpanded,
  onToggle,
  onNavigate,
  level,
}: NavigationItemProps) {
  const Icon = item.icon;
  const hasChildren = item.children && item.children.length > 0;

  return (
    <div>
      <motion.button
        whileHover={{ scale: 1.02, x: 4 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => {
          if (hasChildren) {
            onToggle();
          } else {
            onNavigate(item.href);
          }
        }}
        className={cn(
          "w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300",
          "hover:bg-blue-50/80 hover:text-blue-700",
          isActive && "bg-blue-600 text-white shadow-md",
          !isActive && "text-slate-700",
          level > 0 && "ml-6 text-xs py-2 px-3"
        )}
      >
        <Icon className={cn("h-5 w-5 flex-shrink-0", level > 0 && "h-4 w-4")} />
        <span className="flex-1 text-left">{item.label}</span>

        {item.badge && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className={cn(
              "px-2 py-1 text-xs rounded-full font-semibold",
              isActive ? "bg-white/20 text-white" : "bg-blue-100 text-blue-700"
            )}
          >
            {item.badge}
          </motion.span>
        )}

        {hasChildren && (
          <motion.div
            animate={{ rotate: isExpanded ? 90 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronRight className="h-4 w-4" />
          </motion.div>
        )}
      </motion.button>

      {/* Children */}
      <AnimatePresence>
        {hasChildren && isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-1 space-y-1 ml-2"
          >
            {item.children?.map((child, index) => (
              <motion.div
                key={child.href}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05, duration: 0.2 }}
              >
                <NavigationItem
                  item={child}
                  isActive={child.href === window.location.pathname}
                  isExpanded={false}
                  onToggle={() => {}}
                  onNavigate={onNavigate}
                  level={level + 1}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
