"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  Bell,
  User,
  LogOut,
  Home,
  Users,
  Calendar,
  BarChart3,
  Settings,
  GraduationCap,
  UserCheck,
  ClipboardList,
  BookOpen,
  Shield,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface OfficeDashboardLayoutProps {
  children: React.ReactNode;
  user?: {
    name: string;
    email: string;
    role: "ADMIN" | "OFFICE";
    avatar?: string;
  };
  currentPage?: string;
}

interface NavigationItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  subItems?: Array<{
    label: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
  }>;
}

const navigationItems: NavigationItem[] = [
  {
    label: "Dashboard",
    href: "/office/dashboard",
    icon: Home,
  },
  {
    label: "User Management",
    href: "/office/users",
    icon: Users,
    subItems: [
      { label: "All Users", href: "/office/users", icon: Users },
      { label: "Add User", href: "/office/users/add", icon: User },
      {
        label: "Roles & Permissions",
        href: "/office/users/roles",
        icon: Shield,
      },
    ],
  },
  {
    label: "Classes & Schedule",
    href: "/office/classes",
    icon: Calendar,
    subItems: [
      { label: "All Classes", href: "/office/classes", icon: BookOpen },
      {
        label: "Schedule Builder",
        href: "/office/classes/schedule",
        icon: Calendar,
      },
      {
        label: "Class Management",
        href: "/office/classes/manage",
        icon: ClipboardList,
      },
    ],
  },
  {
    label: "Attendance",
    href: "/office/attendance",
    icon: UserCheck,
    subItems: [
      { label: "Overview", href: "/office/attendance", icon: UserCheck },
      {
        label: "Mark Attendance",
        href: "/office/attendance/mark",
        icon: ClipboardList,
      },
      {
        label: "Attendance History",
        href: "/office/attendance/history",
        icon: BarChart3,
      },
    ],
  },
  {
    label: "Reports & Analytics",
    href: "/office/reports",
    icon: BarChart3,
    badge: "New",
    subItems: [
      {
        label: "Weekly Reports",
        href: "/office/reports/weekly",
        icon: BarChart3,
      },
      {
        label: "Student Status",
        href: "/office/reports/students",
        icon: Users,
      },
      {
        label: "Export Data",
        href: "/office/reports/export",
        icon: ClipboardList,
      },
    ],
  },
  {
    label: "System Settings",
    href: "/office/settings",
    icon: Settings,
    subItems: [
      { label: "General Settings", href: "/office/settings", icon: Settings },
      {
        label: "Academic Calendar",
        href: "/office/settings/calendar",
        icon: Calendar,
      },
      {
        label: "Attendance Rules",
        href: "/office/settings/rules",
        icon: ClipboardList,
      },
    ],
  },
];

export function OfficeDashboardLayout({
  children,
  user,
  currentPage = "/office/dashboard",
}: OfficeDashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [expandedItems, setExpandedItems] = React.useState<string[]>([]);
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) {
        setSidebarOpen(false);
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Auto-expand parent items if current page is a sub-item
  React.useEffect(() => {
    const parentItem = navigationItems.find((item) =>
      item.subItems?.some((subItem) => subItem.href === currentPage)
    );
    if (parentItem && !expandedItems.includes(parentItem.href)) {
      setExpandedItems((prev) => [...prev, parentItem.href]);
    }
  }, [currentPage, expandedItems]);

  const toggleExpanded = (href: string) => {
    setExpandedItems((prev) =>
      prev.includes(href)
        ? prev.filter((item) => item !== href)
        : [...prev, href]
    );
  };

  const isItemActive = (item: NavigationItem) => {
    if (item.href === currentPage) return true;
    return (
      item.subItems?.some((subItem) => subItem.href === currentPage) || false
    );
  };

  const isSubItemActive = (href: string) => href === currentPage;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-emerald-50/20 relative overflow-hidden">
      {/* Campus Hero Background - matching login page */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-transparent to-emerald-600/5"></div>
        <div className="absolute top-20 right-20 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-emerald-200/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-blue-100/10 to-emerald-100/10 rounded-full blur-3xl"></div>
      </div>
      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && isMobile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          x: isMobile ? (sidebarOpen ? 0 : "-100%") : 0,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={cn(
          "fixed left-0 top-0 z-50 h-full w-72 bg-white/80 backdrop-blur-sm border-r border-white/20 shadow-xl",
          "lg:relative lg:z-auto lg:translate-x-0"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo and Close Button */}
          <div className="flex items-center justify-between p-6 border-b border-white/20">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="flex items-center space-x-3"
            >
              <motion.div
                className="h-12 w-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg"
                whileHover={{ scale: 1.05, rotate: 5 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <GraduationCap className="h-7 w-7 text-white" />
              </motion.div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">
                  University
                  <span className="text-blue-600 ml-1">AttendanceHub</span>
                </h1>
                <p className="text-xs text-slate-500">Office Portal</p>
              </div>
            </motion.div>

            {isMobile && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden"
              >
                <X className="h-5 w-5" />
              </Button>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navigationItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = isItemActive(item);
              const isExpanded = expandedItems.includes(item.href);
              const hasSubItems = item.subItems && item.subItems.length > 0;

              return (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  {/* Main navigation item */}
                  <motion.div
                    whileHover={{ scale: 1.02, x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    className={cn(
                      "flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer group",
                      isActive
                        ? "bg-gradient-to-r from-blue-50 to-blue-100/50 text-blue-700 border border-blue-200 shadow-sm"
                        : "text-slate-600 hover:bg-white/60 hover:text-slate-900 hover:shadow-sm"
                    )}
                    onClick={() => {
                      if (hasSubItems) {
                        toggleExpanded(item.href);
                      } else {
                        window.location.href = item.href;
                      }
                    }}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon
                        className={cn(
                          "h-5 w-5 transition-colors",
                          isActive
                            ? "text-blue-600"
                            : "text-slate-500 group-hover:text-slate-700"
                        )}
                      />
                      <span className="flex-1">{item.label}</span>
                      {item.badge && (
                        <motion.span
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{
                            type: "spring",
                            stiffness: 500,
                            damping: 30,
                          }}
                          className="px-2 py-0.5 text-xs bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full font-medium shadow-sm"
                        >
                          {item.badge}
                        </motion.span>
                      )}
                    </div>

                    {hasSubItems && (
                      <motion.div
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronDown className="h-4 w-4 text-slate-400" />
                      </motion.div>
                    )}
                  </motion.div>

                  {/* Sub-navigation items */}
                  <AnimatePresence>
                    {hasSubItems && isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="ml-6 mt-1 space-y-1 border-l border-slate-200 pl-4"
                      >
                        {item.subItems!.map((subItem, subIndex) => {
                          const SubIcon = subItem.icon;
                          const isSubActive = isSubItemActive(subItem.href);

                          return (
                            <motion.a
                              key={subItem.href}
                              href={subItem.href}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: subIndex * 0.03 }}
                              className={cn(
                                "flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200",
                                isSubActive
                                  ? "bg-blue-100 text-blue-700 border border-blue-200"
                                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                              )}
                            >
                              <SubIcon className="h-4 w-4" />
                              <span>{subItem.label}</span>
                            </motion.a>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </nav>

          {/* User section */}
          {user && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 border-t border-slate-200 bg-slate-50"
            >
              <div className="flex items-center space-x-3 mb-3">
                <Avatar className="h-10 w-10 ring-2 ring-blue-100">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="bg-blue-100 text-blue-700 font-semibold">
                    {user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">
                    {user.name}
                  </p>
                  <div className="flex items-center space-x-2">
                    <Badge
                      variant="outline"
                      className="text-xs bg-purple-50 text-purple-700 border-purple-200"
                    >
                      {user.role}
                    </Badge>
                  </div>
                </div>
              </div>

              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-slate-600 hover:text-red-600 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </motion.div>
          )}
        </div>
      </motion.aside>

      {/* Main content */}
      <div
        className={cn("flex flex-col min-h-screen", !isMobile && "lg:ml-72")}
      >
        {/* Header */}
        <motion.header
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="sticky top-0 z-30 bg-white/80 backdrop-blur-sm border-b border-white/20 shadow-lg"
        >
          <div className="flex items-center justify-between px-4 lg:px-6 py-4">
            {/* Mobile menu button */}
            <div className="flex items-center space-x-4">
              {isMobile && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              )}

              {/* Page title */}
              <div>
                <h2 className="text-xl font-semibold text-slate-900">
                  {navigationItems.find(
                    (item) =>
                      item.href === currentPage ||
                      item.subItems?.some((sub) => sub.href === currentPage)
                  )?.label || "Dashboard"}
                </h2>
                <p className="text-sm text-slate-500">
                  Welcome back, {user?.name || "Administrator"}
                </p>
              </div>
            </div>

            {/* Header actions */}
            <div className="flex items-center space-x-3">
              {/* Notifications */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative hover:bg-blue-50 transition-colors duration-200"
                >
                  <Bell className="h-5 w-5" />
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    className="absolute -top-1 -right-1 h-5 w-5 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs rounded-full flex items-center justify-center font-medium shadow-sm"
                  >
                    3
                  </motion.span>
                </Button>
              </motion.div>

              {/* User avatar */}
              {user && (
                <Avatar className="h-8 w-8 ring-2 ring-slate-100">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="bg-blue-100 text-blue-700 text-sm font-semibold">
                    {user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          </div>
        </motion.header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="max-w-7xl mx-auto"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}

export default OfficeDashboardLayout;
