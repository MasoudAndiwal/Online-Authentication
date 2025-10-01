"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  Search,
  User,
  LogOut,
  Settings,
  HelpCircle,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "warning" | "success" | "error";
  timestamp: Date;
  read: boolean;
}

interface UserProfile {
  name: string;
  email: string;
  role: "OFFICE" | "TEACHER" | "STUDENT";
  avatar?: string;
}

interface DashboardHeaderProps {
  title?: string;
  subtitle?: string;
  user?: UserProfile;
  notifications?: Notification[];
  onMenuClick?: () => void;
  onLogout?: () => void;
  onSearch?: (query: string) => void;
  isMobile?: boolean;
  className?: string;
}

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

export function DashboardHeader({
  title,
  subtitle,
  user,
  notifications = [],
  onMenuClick,
  onLogout,
  onSearch,
  isMobile = false,
  className,
}: DashboardHeaderProps) {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [showUserMenu, setShowUserMenu] = React.useState(false);
  const [searchFocused, setSearchFocused] = React.useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch && searchQuery.trim()) {
      onSearch(searchQuery.trim());
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
      className={cn(
        "flex items-center justify-between px-6 lg:px-8 py-6 bg-white/90 backdrop-blur-xl border-b-0 shadow-sm",
        className
      )}
    >
      {/* Left section - Mobile Menu + Title */}
      <div className="flex items-center space-x-6">
        {/* Mobile menu button */}
        {isMobile && onMenuClick && (
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              variant="ghost"
              size="icon"
              onClick={onMenuClick}
              className="lg:hidden h-12 w-12 rounded-2xl hover:bg-slate-100/80 transition-all duration-300 border-0"
            >
              <Menu className="h-6 w-6 text-slate-600" />
            </Button>
          </motion.div>
        )}

        {/* Title and subtitle */}
        <div className="hidden sm:block">
          {title && (
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="text-2xl font-bold text-slate-900 tracking-tight"
            >
              {title}
            </motion.h1>
          )}
          {subtitle && (
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="text-sm text-slate-600 mt-0.5 font-medium"
            >
              {subtitle}
            </motion.p>
          )}
        </div>
      </div>

      {/* Center section - Modern Search Bar */}
      <motion.form
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        onSubmit={handleSearch}
        className="hidden md:flex items-center flex-1 max-w-md mx-8"
      >
        <div className={cn(
          'relative group transition-all duration-300 w-full',
          searchFocused && 'scale-105'
        )}>
          {/* Search Icon */}
          <motion.div
            animate={{ 
              scale: searchFocused ? 1.1 : 1,
              color: searchFocused ? '#3b82f6' : '#94a3b8'
            }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10"
          >
            <Search className="h-5 w-5" />
          </motion.div>
          
          {/* Search Input */}
          <Input
            type="text"
            placeholder="Search students, classes, reports..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            className={cn(
              'pl-12 pr-6 py-4 w-full bg-white/80 backdrop-blur-sm border-0',
              'rounded-2xl shadow-lg transition-all duration-300',
              'focus:bg-white focus:shadow-xl focus:ring-4 focus:ring-blue-500/10',
              'hover:bg-white/90 hover:shadow-xl',
              'placeholder:text-slate-400 text-slate-700 font-medium text-base'
            )}
          />
          
          {/* Search Glow Effect */}
          <div className={cn(
            'absolute inset-0 rounded-2xl transition-all duration-300 pointer-events-none',
            searchFocused && 'shadow-2xl shadow-blue-500/20 ring-1 ring-blue-500/20'
          )} />
        </div>
      </motion.form>

      {/* Right section - User Menu */}
      <div className="flex items-center space-x-4">
        {/* User menu */}
        {user && (
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowUserMenu(!showUserMenu)}
              className={cn(
                'flex items-center space-x-4 px-4 py-3 rounded-2xl transition-all duration-300',
                'hover:bg-white/80 hover:shadow-lg border-0 bg-white/60 backdrop-blur-sm',
                'focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:ring-offset-2'
              )}
            >
              {/* User Avatar with 3D Effect */}
              <motion.div
                whileHover={{ scale: 1.05, rotateY: 5 }}
                className="relative"
              >
                <div className={cn(
                  'h-12 w-12 rounded-2xl flex items-center justify-center text-white font-bold shadow-xl relative overflow-hidden',
                  roleColors[user.role].bg,
                  'shadow-purple-500/25'
                )}>
                  {/* Shine Effect */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent transform -skew-x-12 translate-x-full group-hover:translate-x-[-200%] transition-transform duration-1000" />
                  
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="h-12 w-12 rounded-2xl object-cover relative z-10"
                    />
                  ) : (
                    <span className="relative z-10 text-base">
                      {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </span>
                  )}
                </div>
              </motion.div>

              {/* User Info */}
              <div className="hidden sm:block text-left">
                <p className="text-base font-bold text-slate-900 leading-tight">
                  {user.name}
                </p>
                <Badge 
                  variant="outline" 
                  className={cn(
                    'text-xs font-semibold border-0 mt-1 px-3 py-1 rounded-xl',
                    roleColors[user.role].badge
                  )}
                >
                  {user.role.toLowerCase()}
                </Badge>
              </div>

              {/* Chevron */}
              <motion.div
                animate={{ rotate: showUserMenu ? 180 : 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              >
                <ChevronDown className="h-5 w-5 text-slate-500" />
              </motion.div>
            </motion.button>

            {/* Ultra Modern User Dropdown Menu - 100% Opacity */}
            <AnimatePresence>
              {showUserMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ 
                    type: 'spring', 
                    stiffness: 400, 
                    damping: 25,
                    staggerChildren: 0.05
                  }}
                  className={cn(
                    'absolute right-0 top-full mt-3 w-80 bg-white rounded-3xl',
                    'shadow-2xl border-0 z-50 overflow-hidden backdrop-blur-xl'
                  )}
                >
                  {/* User Info Header */}
                  <motion.div 
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-6 bg-gradient-to-r from-slate-50 to-blue-50/30 border-b border-slate-100"
                  >
                    <div className="flex items-center space-x-4">
                      <div className={cn(
                        'h-16 w-16 rounded-2xl flex items-center justify-center text-white font-bold shadow-xl',
                        roleColors[user.role].bg
                      )}>
                        {user.avatar ? (
                          <img 
                            src={user.avatar} 
                            alt={user.name}
                            className="h-16 w-16 rounded-2xl object-cover"
                          />
                        ) : (
                          <span className="text-xl">
                            {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="text-lg font-bold text-slate-900">{user.name}</p>
                        <p className="text-sm text-slate-600 mb-2">{user.email}</p>
                        <Badge 
                          variant="outline" 
                          className={cn('text-xs font-semibold border-0', roleColors[user.role].badge)}
                        >
                          {user.role.toLowerCase()}
                        </Badge>
                      </div>
                    </div>
                  </motion.div>

                  {/* Menu Items */}
                  <div className="p-3">
                    {[
                      { icon: User, label: 'My Profile', desc: 'View and edit profile' },
                      { icon: Settings, label: 'Settings', desc: 'Preferences and configuration' },
                      { icon: HelpCircle, label: 'Help & Support', desc: 'Get help and documentation' }
                    ].map((item, index) => (
                      <motion.div
                        key={item.label}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Button
                          variant="ghost"
                          size="sm"
                          className={cn(
                            'w-full justify-start h-auto p-4 rounded-2xl transition-all duration-200 mb-1',
                            'hover:bg-slate-100/80 hover:scale-[1.02] text-slate-700 hover:text-slate-900 border-0'
                          )}
                        >
                          <div className="flex items-center space-x-4 w-full">
                            <div className="p-2 bg-slate-100 rounded-xl">
                              <item.icon className="h-5 w-5 text-slate-600" />
                            </div>
                            <div className="text-left flex-1">
                              <p className="font-semibold text-sm">{item.label}</p>
                              <p className="text-xs text-slate-500">{item.desc}</p>
                            </div>
                          </div>
                        </Button>
                      </motion.div>
                    ))}
                  </div>

                  {/* Logout Section */}
                  {onLogout && (
                    <motion.div 
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="p-3 border-t border-slate-100 bg-slate-50/50"
                    >
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          onLogout()
                          setShowUserMenu(false)
                        }}
                        className={cn(
                          'w-full justify-start h-auto p-4 rounded-2xl transition-all duration-200',
                          'text-red-600 hover:text-red-700 hover:bg-red-50/80 hover:scale-[1.02] border-0'
                        )}
                      >
                        <div className="flex items-center space-x-4 w-full">
                          <div className="p-2 bg-red-100 rounded-xl">
                            <LogOut className="h-5 w-5 text-red-600" />
                          </div>
                          <div className="text-left flex-1">
                            <p className="font-semibold text-sm">Sign Out</p>
                            <p className="text-xs text-red-500">Logout from your account</p>
                          </div>
                        </div>
                      </Button>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </motion.div>
  );
}
