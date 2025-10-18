/* eslint-disable @next/next/no-img-element */
"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { ChevronRight, LogOut, User, UserPlus, Users, GraduationCap } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarMenuBadge,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  DropdownNavigationItem, 
  EnhancedNavigationItem 
} from "@/components/navigation/DropdownNavigationItem";

// Types for the AppSidebar component
export interface NavigationItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  children?: NavigationItem[];
}

export interface UserProfile {
  name: string;
  email: string;
  role: "OFFICE" | "TEACHER" | "STUDENT";
  avatar?: string;
}

export interface AppSidebarProps {
  user?: UserProfile;
  onLogout?: () => void;
  onNavigate?: (href: string) => void;
}

// Modern Clean Icons matching the existing implementation
const ModernCleanIcons = {
  dashboard: ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" className={cn("w-5 h-5", className)}>
      <rect
        x="3"
        y="3"
        width="7"
        height="7"
        rx="2"
        fill="currentColor"
        opacity="0.8"
      />
      <rect
        x="14"
        y="3"
        width="7"
        height="7"
        rx="2"
        fill="currentColor"
        opacity="0.6"
      />
      <rect
        x="3"
        y="14"
        width="7"
        height="7"
        rx="2"
        fill="currentColor"
        opacity="0.6"
      />
      <rect
        x="14"
        y="14"
        width="7"
        height="7"
        rx="2"
        fill="currentColor"
        opacity="0.8"
      />
    </svg>
  ),

  users: ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" className={cn("w-5 h-5", className)}>
      <circle
        cx="9"
        cy="7"
        r="4"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
      />
      <path
        d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
      />
      <circle
        cx="16"
        cy="11"
        r="3"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
      />
      <path
        d="M22 21v-2a4 4 0 0 0-3-3.87"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
      />
    </svg>
  ),

  project: ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" className={cn("w-5 h-5", className)}>
      <path
        d="M12 2L2 7l10 5 10-5-10-5z"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
      />
      <path
        d="M2 17l10 5 10-5"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
      />
      <path
        d="M2 12l10 5 10-5"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
      />
    </svg>
  ),

  calendar: ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" className={cn("w-5 h-5", className)}>
      <rect
        x="3"
        y="4"
        width="18"
        height="18"
        rx="2"
        ry="2"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
      />
      <line
        x1="16"
        y1="2"
        x2="16"
        y2="6"
        stroke="currentColor"
        strokeWidth="2"
      />
      <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2" />
      <line
        x1="3"
        y1="10"
        x2="21"
        y2="10"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  ),

  schedule: ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" className={cn("w-5 h-5", className)}>
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
      />
      <polyline
        points="12,6 12,12 16,14"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
      />
    </svg>
  ),

  company: ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" className={cn("w-5 h-5", className)}>
      <path d="M3 21h18" stroke="currentColor" strokeWidth="2" />
      <path
        d="M5 21V7l8-4v18"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
      />
      <path
        d="M19 21V11l-6-4"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
      />
    </svg>
  ),

  attendance: ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" className={cn("w-5 h-5", className)}>
      <path
        d="M9 11l3 3L22 4"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
      />
      <path
        d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
      />
    </svg>
  ),

  reports: ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" className={cn("w-5 h-5", className)}>
      <line
        x1="18"
        y1="20"
        x2="18"
        y2="10"
        stroke="currentColor"
        strokeWidth="2"
      />
      <line
        x1="12"
        y1="20"
        x2="12"
        y2="4"
        stroke="currentColor"
        strokeWidth="2"
      />
      <line
        x1="6"
        y1="20"
        x2="6"
        y2="14"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  ),

  settings: ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" className={cn("w-5 h-5", className)}>
      <circle
        cx="12"
        cy="12"
        r="3"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
      />
      <path
        d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
      />
    </svg>
  ),

  help: ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" className={cn("w-5 h-5", className)}>
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
      />
      <path
        d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
      />
      <circle cx="12" cy="17" r="1" fill="currentColor" />
    </svg>
  ),
};

// Enhanced user management navigation with animations
const getUserManagementNavigation = (): EnhancedNavigationItem => ({
  label: "User Management",
  href: "/user-management",
  icon: Users,
  isDropdown: true,
  description: "Manage teachers and students",
  hoverEffects: {
    scale: 1.02,
    glow: true,
    shadowElevation: 8,
    iconRotation: 5,
  },
  children: [
    {
      label: "Add User",
      href: "#",
      icon: UserPlus,
      description: "Create new accounts",
      animationDelay: 0,
      children: [
        {
          label: "Add Teacher",
          href: "/dashboard/users/add-teacher",
          icon: GraduationCap,
          description: "Create teacher account",
          animationDelay: 100,
        },
        {
          label: "Add Student", 
          href: "/dashboard/users/add-student",
          icon: User,
          description: "Create student account",
          animationDelay: 150,
        }
      ]
    },
    {
      label: "All Users",
      href: "#",
      icon: Users,
      description: "View and manage users",
      animationDelay: 50,
      children: [
        {
          label: "Teacher List",
          href: "/dashboard/users/teachers",
          icon: GraduationCap,
          description: "View all teachers",
          animationDelay: 200,
        },
        {
          label: "Student List",
          href: "/dashboard/users/students", 
          icon: User,
          description: "View all students",
          animationDelay: 250,
        }
      ]
    }
  ]
});

// Enhanced navigation configuration with dropdown support
const getNavigationItems = (role: UserProfile["role"]): NavigationItem[] => {
  const baseItems: NavigationItem[] = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: ModernCleanIcons.dashboard,
    },
  ];

  if (role === "OFFICE") {
    return [
      ...baseItems,
      {
        label: "User Management",
        href: "/user-management",
        icon: ModernCleanIcons.users,
        children: [
          {
            label: "All Users",
            href: "/user-management/all-users",
            icon: ModernCleanIcons.users,
          },
          {
            label: "Add User",
            href: "/user-management/add-user",
            icon: ModernCleanIcons.users,
            children: [
              {
                label: "Add Teacher",
                href: "/user-management/add-user?type=teacher",
                icon: ModernCleanIcons.users,
              },
              {
                label: "Add Student",
                href: "/user-management/add-user?type=student",
                icon: ModernCleanIcons.users,
              },
            ],
          },
          {
            label: "Roles & Permissions",
            href: "/user-management/roles",
            icon: ModernCleanIcons.settings,
          },
        ],
      },
      {
        label: "Classes & Schedule",
        href: "/classes",
        icon: ModernCleanIcons.project,
        children: [
          {
            label: "All Classes",
            href: "/dashboard/all-classes",
            icon: ModernCleanIcons.project,
          },
          {
            label: "Schedule Builder",
            href: "/dashboard/schedule",
            icon: ModernCleanIcons.calendar,
          },
          {
            label: "Class Management",
            href: "/classes/management",
            icon: ModernCleanIcons.company,
          },
        ],
      },
      {
        label: "Attendance",
        href: "/attendance",
        icon: ModernCleanIcons.attendance,
        children: [
          {
            label: "Overview",
            href: "/attendance/overview",
            icon: ModernCleanIcons.dashboard,
          },
          {
            label: "Mark Attendance",
            href: "/attendance/mark",
            icon: ModernCleanIcons.attendance,
          },
          {
            label: "Attendance History",
            href: "/attendance/history",
            icon: ModernCleanIcons.schedule,
          },
        ],
      },
      {
        label: "Reports & Analytics",
        href: "/reports",
        icon: ModernCleanIcons.reports,
        children: [
          {
            label: "Weekly Reports",
            href: "/reports/weekly",
            icon: ModernCleanIcons.reports,
          },
          {
            label: "Student Status",
            href: "/reports/student-status",
            icon: ModernCleanIcons.users,
          },
          {
            label: "Export Data",
            href: "/reports/export",
            icon: ModernCleanIcons.reports,
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
        icon: ModernCleanIcons.project,
      },
      {
        label: "Attendance",
        href: "/attendance",
        icon: ModernCleanIcons.attendance,
        children: [
          {
            label: "Mark Attendance",
            href: "/attendance/mark",
            icon: ModernCleanIcons.attendance,
          },
          {
            label: "Attendance History",
            href: "/attendance/history",
            icon: ModernCleanIcons.schedule,
          },
        ],
      },
      {
        label: "Reports",
        href: "/reports",
        icon: ModernCleanIcons.reports,
      },
    ];
  }

  // Student navigation
  return [
    ...baseItems,
    {
      label: "My Attendance",
      href: "/attendance",
      icon: ModernCleanIcons.attendance,
    },
    {
      label: "My Progress",
      href: "/progress",
      icon: ModernCleanIcons.reports,
    },
  ];
};

export function AppSidebar({ user, onLogout, onNavigate }: AppSidebarProps) {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = React.useState<string[]>([]);
  const [hoveredItem, setHoveredItem] = React.useState<string | null>(null);
  
  const navigationItems = user ? getNavigationItems(user.role) : [];
  const userManagementNav = user?.role === "OFFICE" ? getUserManagementNavigation() : null;

  const toggleExpanded = (href: string) => {
    setExpandedItems((prev) =>
      prev.includes(href)
        ? prev.filter((item) => item !== href)
        : [...prev, href]
    );
  };

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + "/");
  };

  const isExpanded = (href: string) => {
    return (
      expandedItems.includes(href) ||
      navigationItems
        .find((item) => item.href === href)
        ?.children?.some((child) => isActive(child.href)) ||
      false
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
    <Sidebar variant="inset" className="bg-gradient-to-b from-slate-50 to-white">
      <SidebarHeader>
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="flex items-center gap-2"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <svg viewBox="0 0 24 24" className="h-4 w-4">
              <path
                d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3z"
                fill="currentColor"
              />
            </svg>
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">University</span>
            <span className="truncate text-xs text-muted-foreground">AttendanceHub</span>
          </div>
        </motion.div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarMenu>
          {/* Dashboard item */}
          <NavigationMenuItem
            item={{
              label: "Dashboard",
              href: "/dashboard",
              icon: ModernCleanIcons.dashboard,
            }}
            isActive={isActive("/dashboard")}
            isExpanded={false}
            onToggle={() => {}}
            onNavigate={handleNavigation}
          />

          {/* Enhanced User Management Dropdown for OFFICE role */}
          {userManagementNav && (
            <DropdownNavigationItem
              item={userManagementNav}
              isExpanded={expandedItems.includes("user-management")}
              isHovered={hoveredItem === "user-management"}
              onToggle={() => toggleExpanded("user-management")}
              onHover={(isHovered) => setHoveredItem(isHovered ? "user-management" : null)}
              onNavigate={handleNavigation}
            />
          )}

          {/* Other navigation items (excluding user management for OFFICE) */}
          {navigationItems
            .filter(item => item.label !== "User Management")
            .map((item) => (
              <NavigationMenuItem
                key={item.href}
                item={item}
                isActive={isActive(item.href)}
                isExpanded={isExpanded(item.href)}
                onToggle={() => toggleExpanded(item.href)}
                onNavigate={handleNavigation}
              />
            ))}
        </SidebarMenu>
        
        {/* Settings Section */}
        <SidebarMenu>
          <NavigationMenuItem
            item={{
              label: "Settings",
              href: "/settings",
              icon: ModernCleanIcons.settings,
            }}
            isActive={isActive("/settings")}
            isExpanded={false}
            onToggle={() => {}}
            onNavigate={handleNavigation}
          />
          <NavigationMenuItem
            item={{
              label: "Help",
              href: "/help",
              icon: ModernCleanIcons.help,
            }}
            isActive={isActive("/help")}
            isExpanded={false}
            onToggle={() => {}}
            onNavigate={handleNavigation}
          />
        </SidebarMenu>
      </SidebarContent>
      
      <SidebarFooter>
        {user && (
          <UserProfileSection user={user} onLogout={onLogout} />
        )}
      </SidebarFooter>
    </Sidebar>
  );
}

interface NavigationMenuItemProps {
  item: NavigationItem;
  isActive: boolean;
  isExpanded: boolean;
  onToggle: () => void;
  onNavigate: (href: string) => void;
}

function NavigationMenuItem({
  item,
  isActive,
  isExpanded,
  onToggle,
  onNavigate,
}: NavigationMenuItemProps) {
  const Icon = item.icon;
  const hasChildren = item.children && item.children.length > 0;

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        isActive={isActive}
        onClick={() => {
          if (hasChildren) {
            onToggle();
          } else {
            onNavigate(item.href);
          }
        }}
        tooltip={item.label}
      >
        <Icon />
        <span>{item.label}</span>
        {item.badge && (
          <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>
        )}
        {hasChildren && (
          <ChevronRight
            className={cn(
              "ml-auto transition-transform",
              isExpanded && "rotate-90"
            )}
          />
        )}
      </SidebarMenuButton>
      
      {hasChildren && isExpanded && (
        <SidebarMenuSub>
          {item.children?.map((child) => (
            <SidebarMenuSubItem key={child.href}>
              <SidebarMenuSubButton
                asChild
                isActive={isActive}
              >
                <a href={child.href} onClick={(e) => {
                  e.preventDefault();
                  onNavigate(child.href);
                }}>
                  <child.icon />
                  <span>{child.label}</span>
                  {child.badge && (
                    <SidebarMenuBadge>{child.badge}</SidebarMenuBadge>
                  )}
                </a>
              </SidebarMenuSubButton>
            </SidebarMenuSubItem>
          ))}
        </SidebarMenuSub>
      )}
    </SidebarMenuItem>
  );
}

interface UserProfileSectionProps {
  user: UserProfile;
  onLogout?: () => void;
}

function UserProfileSection({ user, onLogout }: UserProfileSectionProps) {
  // Role-based color schemes
  const getRoleColors = (role: UserProfile["role"]) => {
    switch (role) {
      case "OFFICE":
        return {
          bg: "bg-blue-600",
          text: "text-white",
          badge: "bg-blue-100 text-blue-700",
        };
      case "TEACHER":
        return {
          bg: "bg-green-600",
          text: "text-white",
          badge: "bg-green-100 text-green-700",
        };
      case "STUDENT":
        return {
          bg: "bg-purple-600",
          text: "text-white",
          badge: "bg-purple-100 text-purple-700",
        };
      default:
        return {
          bg: "bg-gray-600",
          text: "text-white",
          badge: "bg-gray-100 text-gray-700",
        };
    }
  };

  const colors = getRoleColors(user.role);

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className={cn(
                "flex aspect-square size-8 items-center justify-center rounded-lg",
                colors.bg,
                colors.text
              )}>
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="size-8 rounded-lg"
                  />
                ) : (
                  <span className="text-sm font-bold">
                    {user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)}
                  </span>
                )}
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{user.name}</span>
                <span className="truncate text-xs text-muted-foreground">
                  {user.role} • {user.email}
                </span>
              </div>
              <ChevronRight className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side="bottom"
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <div className={cn(
                  "flex aspect-square size-8 items-center justify-center rounded-lg",
                  colors.bg,
                  colors.text
                )}>
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="size-8 rounded-lg"
                    />
                  ) : (
                    <span className="text-sm font-bold">
                      {user.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)}
                    </span>
                  )}
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{user.name}</span>
                  <span className="truncate text-xs text-muted-foreground">
                    {user.email}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2">
              <div className={cn(
                "flex h-5 w-5 items-center justify-center rounded text-xs font-medium",
                colors.badge
              )}>
                {user.role.charAt(0)}
              </div>
              <span className="text-sm">{user.role}</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2">
              <User className="size-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="gap-2 text-red-600 focus:text-red-600"
              onClick={() => {
                if (onLogout) {
                  onLogout();
                }
              }}
            >
              <LogOut className="size-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}