"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Menu, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
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

export interface DashboardHeaderProps {
  title?: string;
  subtitle?: string;
  user?: UserProfile;
  notifications?: Notification[];
  onMenuClick?: () => void;
  onLogout?: () => void;
  onSearch?: (query: string) => void;
  isMobile?: boolean;
  className?: string;
  hideSearch?: boolean;
  notificationTrigger?: React.ReactNode;
}

export function DashboardHeader({
  title,
  subtitle,
  onMenuClick,
  onSearch,
  className,
  hideSearch = false,
  notificationTrigger,
}: DashboardHeaderProps) {
  const [searchQuery, setSearchQuery] = React.useState("");
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
        "flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4 sm:py-6 bg-white/90 backdrop-blur-xl border-b-0 shadow-sm",
        className
      )}
    >
      {/* Mobile Layout */}
      <div className="flex items-center justify-between w-full md:hidden">
        {/* Title on mobile */}
        <div className="flex-1 min-w-0">
          {title && (
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight truncate"
            >
              {title}
            </motion.h1>
          )}
          {subtitle && (
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="text-xs sm:text-sm text-slate-600 mt-0.5 font-medium truncate"
            >
              {subtitle}
            </motion.p>
          )}
        </div>

        {/* Notification trigger and hamburger menu */}
        <div className="flex items-center gap-2 ml-4">
          {notificationTrigger && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              {notificationTrigger}
            </motion.div>
          )}
          
          {/* Mobile hamburger menu button - RIGHT SIDE with LARGER SIZE */}
          {onMenuClick && (
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant="ghost"
                size="icon"
                onClick={onMenuClick}
                className="h-14 w-14 rounded-2xl hover:bg-slate-100/80 transition-all duration-300 border-0 shadow-sm"
              >
                <Menu className="h-7 w-7 text-slate-600" />
              </Button>
            </motion.div>
          )}
        </div>
      </div>

      {/* Tablet Layout (iPad) */}
      <div className="hidden md:flex lg:hidden items-center justify-between w-full">
        {/* Title on left */}
        <div className="flex-shrink-0">
          {title && (
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="text-xl font-bold text-slate-900 tracking-tight"
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

        {/* Search bar in center - conditionally rendered */}
        {!hideSearch && (
          <motion.form
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            onSubmit={handleSearch}
            className="flex items-center flex-1 max-w-md mx-8"
          >
            <div className={cn(
              'relative group transition-all duration-300 w-full',
              searchFocused && 'scale-105'
            )}>
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
              
              <div className={cn(
                'absolute inset-0 rounded-2xl transition-all duration-300 pointer-events-none',
                searchFocused && 'shadow-2xl shadow-blue-500/20 ring-1 ring-blue-500/20'
              )} />
            </div>
          </motion.form>
        )}

        {/* Notification trigger and hamburger menu on right */}
        <div className="flex items-center gap-3">
          {notificationTrigger && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              {notificationTrigger}
            </motion.div>
          )}
          
          {onMenuClick && (
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant="ghost"
                size="icon"
                onClick={onMenuClick}
                className="h-12 w-12 rounded-2xl hover:bg-slate-100/80 transition-all duration-300 border-0"
              >
                <Menu className="h-6 w-6 text-slate-600" />
              </Button>
            </motion.div>
          )}
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:flex items-center justify-between w-full">
        {/* Title on left */}
        <div className="flex-shrink-0">
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

        {/* Search bar in center - conditionally rendered */}
        {!hideSearch && (
          <motion.form
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            onSubmit={handleSearch}
            className="flex items-center flex-1 max-w-md mx-8"
          >
            <div className={cn(
              'relative group transition-all duration-300 w-full',
              searchFocused && 'scale-105'
            )}>
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
              
              <div className={cn(
                'absolute inset-0 rounded-2xl transition-all duration-300 pointer-events-none',
                searchFocused && 'shadow-2xl shadow-blue-500/20 ring-1 ring-blue-500/20'
              )} />
            </div>
          </motion.form>
        )}

        {/* Notification trigger on right */}
        <div className="flex-shrink-0">
          {notificationTrigger && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              {notificationTrigger}
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}