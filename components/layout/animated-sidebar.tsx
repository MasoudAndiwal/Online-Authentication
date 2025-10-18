/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @next/next/no-img-element */
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
  GraduationCap,
  User,
  LogOut,
  MoreHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
        href: "/dashboard/teachers",
        icon: Users,
        children: [
          {
            label: "Add User",
            href: "/dashboard/add-teacher",
            icon: UserPlus,
            children: [
              {
                label: "Add Teacher",
                href: "/dashboard/add-teacher",
                icon: GraduationCap,
              },
              {
                label: "Add Student",
                href: "/dashboard/add-student",
                icon: User,
              },
            ],
          },
          {
            label: "All Users",
            href: "/dashboard/teachers",
            icon: Users,
            children: [
              {
                label: "Teacher List",
                href: "/dashboard/teachers",
                icon: GraduationCap,
              },
              {
                label: "Student List",
                href: "/dashboard/students",
                icon: User,
              },
            ],
          },
          {
            label: "Roles & Permissions",
            href: "/dashboard/roles",
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
            href: "/dashboard/all-classes",
            icon: BookOpen,
          },
          {
            label: "Schedule Builder",
            href: "/dashboard/schedule",
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

const roleColors = {
  OFFICE: {
    bg: "bg-gradient-to-r from-purple-500 to-purple-600",
    badge: "bg-purple-100 text-purple-700 border-purple-200",
    text: "text-purple-600",
  },
  TEACHER: {
    bg: "bg-gradient-to-r from-orange-500 to-orange-600",
    badge: "bg-orange-100 text-orange-700 border-orange-200",
    text: "text-orange-600",
  },
  STUDENT: {
    bg: "bg-gradient-to-r from-emerald-500 to-emerald-600",
    badge: "bg-emerald-100 text-emerald-700 border-emerald-200",
    text: "text-emerald-600",
  },
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

  // Add global styles for dropdown positioning
  React.useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      @media (max-width: 768px) {
        [data-radix-popper-content-wrapper] {
          z-index: 99999 !important;
        }
        
        .sidebar-dropdown-content {
          position: fixed !important;
          z-index: 99999 !important;
          max-height: calc(100vh - 100px) !important;
          overflow-y: auto !important;
        }
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const toggleExpanded = (href: string) => {
    setExpandedItems((prev) =>
      prev.includes(href)
        ? prev.filter((item) => item !== href)
        : [...prev, href]
    );
  };

  const isActive = (href: string, item?: NavigationItem) => {
    // Check for exact match
    if (currentPath === href) {
      return true;
    }
    
    // If item has children, check if any child is active
    if (item?.children && item.children.length > 0) {
      return item.children.some(child => 
        currentPath === child.href || 
        (child.children && child.children.some(subChild => currentPath === subChild.href))
      );
    }
    
    return false;
  };

  const isExpanded = (href: string) => {
    return (
      expandedItems.includes(href) ||
      (navigationItems
        .find((item) => item.href === href)
        ?.children?.some((child) => isActive(child.href)) ??
        false)
    );
  };

  const handleNavigation = (href: string) => {
    if (onNavigate) {
      onNavigate(href);
    } else {
      // Fallback to window navigation if no onNavigate prop provided
      try {
        window.location.href = href;
      } catch (error) {
        console.error("Navigation failed:", error);
      }
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
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto overflow-x-hidden scrollbar-hide">
        {navigationItems.map((item, index) => (
          <motion.div
            key={item.href}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1, duration: 0.3 }}
          >
            <NavigationItem
              item={item}
              isActive={isActive(item.href, item)}
              isExpanded={isExpanded(item.href)}
              onToggle={() => toggleExpanded(item.href)}
              onNavigate={handleNavigation}
              level={0}
              currentPath={currentPath}
            />
          </motion.div>
        ))}
      </nav>

      {/* Clean Modern User Info Section */}
      {user && <UserProfileDropdown user={user} onLogout={onLogout} />}
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
  currentPath?: string;
}

function NavigationItem({
  item,
  isActive,
  isExpanded,
  onToggle,
  onNavigate,
  level,
  currentPath,
}: NavigationItemProps) {
  const Icon = item.icon;
  const hasChildren = item.children && item.children.length > 0;
  const [childExpandedItems, setChildExpandedItems] = React.useState<string[]>(
    []
  );

  const toggleChildExpanded = (href: string) => {
    setChildExpandedItems((prev) =>
      prev.includes(href)
        ? prev.filter((item) => item !== href)
        : [...prev, href]
    );
  };

  const isChildExpanded = (href: string) => {
    return childExpandedItems.includes(href);
  };

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
                  isActive={child.href === currentPath}
                  isExpanded={isChildExpanded(child.href)}
                  onToggle={() => toggleChildExpanded(child.href)}
                  onNavigate={onNavigate}
                  level={level + 1}
                  currentPath={currentPath}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Clean Modern User Profile Dropdown Component
interface UserProfileDropdownProps {
  user: UserProfile;
  onLogout?: () => void;
}

function UserProfileDropdown({ user, onLogout }: UserProfileDropdownProps) {
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.3 }}
      className="p-3 relative border-b border-slate-200"
      style={{ zIndex: 9999 }}
    >
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="w-full h-auto p-3 justify-start hover:bg-slate-50/80 transition-all duration-300 rounded-xl border-0"
          >
            <div className="flex items-center space-x-3 w-full">
              {/* Avatar - Hidden on mobile devices */}
              {!isMobile && (
                <div className="h-8 w-8 rounded-lg bg-slate-200 flex items-center justify-center text-slate-600 text-sm font-medium">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="h-8 w-8 rounded-lg object-cover"
                    />
                  ) : (
                    user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()
                  )}
                </div>
              )}

              {/* User info */}
              <div className="flex-1 min-w-0 text-left">
                <p className="text-sm font-medium text-slate-900 truncate">
                  {user.name}
                </p>
                <p className="text-xs text-slate-500 truncate">
                  {user.role.toLowerCase()}
                </p>
              </div>

              {/* Dropdown indicator */}
              <MoreHorizontal className="h-4 w-4 text-slate-400" />
            </div>
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          className="w-48 rounded-lg shadow-xl border bg-white"
          side="top"
          align="center"
          sideOffset={8}
          avoidCollisions={true}
          collisionPadding={16}
        >
          <DropdownMenuItem className="p-3 cursor-pointer hover:bg-slate-50">
            <User className="h-4 w-4 mr-3 text-slate-600" />
            <span className="text-sm font-medium text-slate-900">Profile</span>
          </DropdownMenuItem>

          <DropdownMenuItem className="p-3 cursor-pointer hover:bg-slate-50">
            <Settings className="h-4 w-4 mr-3 text-slate-600" />
            <span className="text-sm font-medium text-slate-900">Settings</span>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {onLogout && (
            <DropdownMenuItem
              className="p-3 cursor-pointer text-red-600 hover:bg-red-50 focus:text-red-700 focus:bg-red-50"
              onClick={onLogout}
            >
              <LogOut className="h-4 w-4 mr-3" />
              <span className="text-sm font-medium">Logout</span>
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </motion.div>
  );
}
