/**
 * FilterPanel Component
 * 
 * Slide-in panel with advanced filtering options.
 * Features:
 * - Glassmorphism background with backdrop blur
 * - Filter options for user type, date range, category, status, priority, starred
 * - Date range picker
 * - Apply and reset buttons
 * - Active filter count badge
 * - RTL/LTR slide direction support
 */

'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/hooks/office/messaging/use-language';
import type { SearchFilters, MessageCategory, PriorityLevel } from '@/types/office/messaging';
import { getSlideInitialPosition, getPositionEnd, getPositionStart } from '@/lib/utils/rtl-utils';
import {
  X,
  Users,
  Calendar,
  Tag,
  CheckCircle,
  AlertCircle,
  Star,
  User,
  GraduationCap,
} from 'lucide-react';

interface FilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
  filters: SearchFilters;
  onApply: (filters: SearchFilters) => void;
  onReset: () => void;
}

export function FilterPanel({ isOpen, onClose, filters, onApply, onReset }: FilterPanelProps) {
  const { direction } = useLanguage();
  const [localFilters, setLocalFilters] = useState<SearchFilters>(filters);

  // Update local filters when prop changes
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleApply = () => {
    onApply(localFilters);
    onClose();
  };

  const handleReset = () => {
    setLocalFilters({});
    onReset();
    onClose();
  };

  const handleUserTypeChange = (type: 'student' | 'teacher' | 'all') => {
    setLocalFilters(prev => ({ ...prev, userType: type }));
  };

  const handleCategoryToggle = (category: MessageCategory) => {
    setLocalFilters(prev => {
      const categories = prev.categories || [];
      const newCategories = categories.includes(category)
        ? categories.filter(c => c !== category)
        : [...categories, category];
      return { ...prev, categories: newCategories.length > 0 ? newCategories : undefined };
    });
  };

  const handleStatusChange = (status: 'all' | 'unread' | 'read' | 'resolved' | 'archived') => {
    setLocalFilters(prev => ({ ...prev, status }));
  };

  const handlePriorityChange = (priority: PriorityLevel | 'all') => {
    setLocalFilters(prev => ({ ...prev, priority }));
  };

  const handleStarredToggle = () => {
    setLocalFilters(prev => ({ ...prev, starred: !prev.starred }));
  };

  const handleDateRangeChange = (type: 'today' | 'week' | 'month' | 'custom') => {
    const now = new Date();
    let start: Date;
    let end: Date = now;

    switch (type) {
      case 'today':
        start = new Date(now.setHours(0, 0, 0, 0));
        break;
      case 'week':
        start = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'month':
        start = new Date(now.setMonth(now.getMonth() - 1));
        break;
      default:
        return;
    }

    setLocalFilters(prev => ({ ...prev, dateRange: { start, end } }));
  };

  const categories: { value: MessageCategory; label: string; icon: React.ReactNode }[] = [
    { value: 'administrative', label: 'Administrative', icon: <Tag className="w-4 h-4" /> },
    { value: 'attendance_alert', label: 'Attendance Alert', icon: <AlertCircle className="w-4 h-4" /> },
    { value: 'schedule_change', label: 'Schedule Change', icon: <Calendar className="w-4 h-4" /> },
    { value: 'announcement', label: 'Announcement', icon: <Users className="w-4 h-4" /> },
    { value: 'general', label: 'General', icon: <Tag className="w-4 h-4" /> },
    { value: 'urgent', label: 'Urgent', icon: <AlertCircle className="w-4 h-4" /> },
  ];

  const slideDirection = getSlideInitialPosition(direction, 320);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
          />

          {/* Panel */}
          <motion.div
            initial={{ x: slideDirection }}
            animate={{ x: 0 }}
            exit={{ x: slideDirection }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed top-0 h-full w-80 bg-white/90 backdrop-blur-lg shadow-2xl z-50 flex flex-col"
            style={getPositionEnd(direction, '0')}
          >
            {/* Header */}
            <div className="p-4 shadow-md flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
              <button
                onClick={onClose}
                className="p-1.5 bg-gradient-to-r from-gray-400 to-gray-500 text-white hover:from-gray-500 hover:to-gray-600 rounded-xl transition-all shadow-sm hover:shadow-md"
                aria-label="Close filters"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filter Options */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {/* User Type */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">User Type</label>
                <div className="space-y-2">
                  {[
                    { value: 'all' as const, label: 'All Users', icon: <Users className="w-4 h-4" /> },
                    { value: 'student' as const, label: 'Students', icon: <GraduationCap className="w-4 h-4" /> },
                    { value: 'teacher' as const, label: 'Teachers', icon: <User className="w-4 h-4" /> },
                  ].map(option => (
                    <button
                      key={option.value}
                      onClick={() => handleUserTypeChange(option.value)}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all shadow-sm hover:shadow-md ${
                        (localFilters.userType || 'all') === option.value
                          ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium'
                          : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:from-gray-200 hover:to-gray-300'
                      }`}
                    >
                      {option.icon}
                      <span>{option.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Date Range */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Date Range</label>
                <div className="space-y-2">
                  {[
                    { value: 'today' as const, label: 'Today' },
                    { value: 'week' as const, label: 'This Week' },
                    { value: 'month' as const, label: 'This Month' },
                  ].map(option => (
                    <button
                      key={option.value}
                      onClick={() => handleDateRangeChange(option.value)}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all shadow-sm hover:shadow-md ${
                        localFilters.dateRange ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium' : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:from-gray-200 hover:to-gray-300'
                      }`}
                    >
                      <Calendar className="w-4 h-4" />
                      <span>{option.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                <div className="space-y-2">
                  {categories.map(category => (
                    <label
                      key={category.value}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={(localFilters.categories || []).includes(category.value)}
                        onChange={() => handleCategoryToggle(category.value)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      {category.icon}
                      <span className="text-gray-700">{category.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                <div className="space-y-2">
                  {[
                    { value: 'all' as const, label: 'All' },
                    { value: 'unread' as const, label: 'Unread' },
                    { value: 'read' as const, label: 'Read' },
                    { value: 'resolved' as const, label: 'Resolved' },
                    { value: 'archived' as const, label: 'Archived' },
                  ].map(option => (
                    <button
                      key={option.value}
                      onClick={() => handleStatusChange(option.value)}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all shadow-sm hover:shadow-md ${
                        (localFilters.status || 'all') === option.value
                          ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium'
                          : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:from-gray-200 hover:to-gray-300'
                      }`}
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>{option.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Priority */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Priority</label>
                <div className="space-y-2">
                  {[
                    { value: 'all' as const, label: 'All' },
                    { value: 'normal' as const, label: 'Normal' },
                    { value: 'important' as const, label: 'Important' },
                    { value: 'urgent' as const, label: 'Urgent' },
                  ].map(option => (
                    <button
                      key={option.value}
                      onClick={() => handlePriorityChange(option.value)}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all shadow-sm hover:shadow-md ${
                        (localFilters.priority || 'all') === option.value
                          ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium'
                          : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:from-gray-200 hover:to-gray-300'
                      }`}
                    >
                      <AlertCircle className="w-4 h-4" />
                      <span>{option.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Starred */}
              <div>
                <label className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="checkbox"
                    checked={localFilters.starred || false}
                    onChange={handleStarredToggle}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <Star className="w-4 h-4 text-gray-700" />
                  <span className="text-gray-700 font-medium">Starred Only</span>
                </label>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="p-4 shadow-md flex gap-2">
              <button
                onClick={handleReset}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-gray-500 to-gray-600 rounded-xl hover:from-gray-600 hover:to-gray-700 shadow-md hover:shadow-lg transition-all"
              >
                Reset
              </button>
              <button
                onClick={handleApply}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl hover:from-blue-600 hover:to-blue-700 shadow-md hover:shadow-lg transition-all"
              >
                Apply Filters
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
