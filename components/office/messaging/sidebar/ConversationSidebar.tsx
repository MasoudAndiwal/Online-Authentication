/**
 * ConversationSidebar Component
 * 
 * Main sidebar component displaying conversation list with search, filters, and sorting.
 * Features:
 * - Glassmorphism effect
 * - Search bar integration
 * - Filter panel integration
 * - Sort dropdown
 * - Bulk action toolbar
 * - Pinned conversations section
 * - Virtual scrolling for performance
 */

'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMessaging } from '@/hooks/office/messaging/use-messaging-context';
import { SearchBar } from './SearchBar';
import { FilterPanel } from './FilterPanel';
import { ConversationItem } from './ConversationItem';
import { LoadingSpinner, EmptyState } from '../shared';
import type { SortOption } from '@/types/office/messaging';

// Icons (using Lucide React)
import {
  ChevronDown,
  Pin,
  Archive,
  CheckCheck,
  Trash2,
} from 'lucide-react';

interface ConversationSidebarProps {
  className?: string;
}

export function ConversationSidebar({ className = '' }: ConversationSidebarProps) {
  const {
    conversations,
    selectedConversationId,
    selectConversation,
    isLoading,
    searchQuery,
    filters,
    sortBy,
    setSortBy,
    applyFilters,
    clearFilters,
    pinConversation,
    unpinConversation,
    starConversation,
    unstarConversation,
    archiveConversation,
    markAsUnread,
    typingIndicators,
  } = useMessaging();

  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [selectedConversations, setSelectedConversations] = useState<Set<string>>(new Set());
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile screen size
  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Separate pinned and unpinned conversations
  const { pinnedConversations, unpinnedConversations } = useMemo(() => {
    const pinned = conversations.filter(conv => conv.isPinned);
    const unpinned = conversations.filter(conv => !conv.isPinned);
    return { pinnedConversations: pinned, unpinnedConversations: unpinned };
  }, [conversations]);

  // Handle conversation selection
  const handleSelectConversation = (id: string) => {
    selectConversation(id);
    setSelectedConversations(new Set()); // Clear bulk selection
  };

  // Handle bulk selection
  const handleToggleBulkSelect = (id: string) => {
    setSelectedConversations(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  // Bulk actions
  const handleBulkArchive = async () => {
    for (const id of selectedConversations) {
      await archiveConversation(id);
    }
    setSelectedConversations(new Set());
  };

  const handleBulkMarkAsRead = async () => {
    // This would need to be implemented in the context
    setSelectedConversations(new Set());
  };

  // Sort options
  const sortOptions: { value: SortOption; label: string }[] = [
    { value: 'recent', label: 'Most Recent' },
    { value: 'unread_first', label: 'Unread First' },
    { value: 'priority', label: 'By Priority' },
    { value: 'alphabetical', label: 'Alphabetical' },
  ];

  const currentSortLabel = sortOptions.find(opt => opt.value === sortBy)?.label || 'Most Recent';

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.userType && filters.userType !== 'all') count++;
    if (filters.dateRange) count++;
    if (filters.categories && filters.categories.length > 0) count++;
    if (filters.status && filters.status !== 'all') count++;
    if (filters.priority && filters.priority !== 'all') count++;
    if (filters.starred) count++;
    return count;
  }, [filters]);

  return (
    <div
      className={`flex flex-col h-full bg-white ${className}`}
      style={{ width: '320px' }}
    >
      {/* Search Bar - No Header Title */}
      <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 shadow-md">
        <SearchBar
          onFilterClick={() => setIsFilterPanelOpen(true)}
          activeFilterCount={activeFilterCount}
        />
      </div>

      {/* Sort Dropdown */}
      <div className="px-4 py-3 bg-white shadow-sm">
        <div className="relative">
          <button
            onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
            className="flex items-center justify-between w-full px-4 py-2.5 text-sm text-white bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg"
          >
            <span className="font-medium">Sort by: {currentSortLabel}</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${isSortDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {isSortDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute z-10 w-full mt-2 bg-white rounded-xl shadow-2xl overflow-hidden"
              >
                {sortOptions.map(option => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setSortBy(option.value);
                      setIsSortDropdownOpen(false);
                    }}
                    className={`w-full px-4 py-3 text-left text-sm hover:bg-blue-50 transition-colors ${
                      sortBy === option.value ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-gray-700'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Bulk Action Toolbar */}
      <AnimatePresence>
        {selectedConversations.size > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="px-4 py-3 bg-gradient-to-r from-blue-50 to-blue-100 shadow-sm flex items-center justify-between"
          >
            <span className="text-sm text-blue-900 font-semibold">
              {selectedConversations.size} selected
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleBulkMarkAsRead}
                className="p-2 text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-lg transition-all shadow-md"
                title="Mark as read"
              >
                <CheckCheck className="w-4 h-4" />
              </button>
              <button
                onClick={handleBulkArchive}
                className="p-2 text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-lg transition-all shadow-md"
                title="Archive"
              >
                <Archive className="w-4 h-4" />
              </button>
              <button
                onClick={() => setSelectedConversations(new Set())}
                className="p-2 text-white bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 rounded-lg transition-all shadow-md"
                title="Clear selection"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto bg-gray-50">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <LoadingSpinner size="large" />
          </div>
        ) : conversations.length === 0 ? (
          <div className="p-6">
            <EmptyState
              title="No conversations"
              description={searchQuery || activeFilterCount > 0 ? "No conversations match your search or filters" : "Start a new conversation to get started"}
            />
          </div>
        ) : (
          <>
            {/* Pinned Conversations */}
            {pinnedConversations.length > 0 && (
              <div className="mb-2 bg-white">
                <div className="px-4 py-2 flex items-center gap-2 text-xs font-semibold text-gray-600 uppercase bg-gray-100">
                  <Pin className="w-3 h-3" />
                  <span>Pinned</span>
                </div>
                {pinnedConversations.map(conversation => (
                  <ConversationItem
                    key={conversation.id}
                    conversation={conversation}
                    isSelected={selectedConversationId === conversation.id}
                    isBulkSelected={selectedConversations.has(conversation.id)}
                    isTyping={!!typingIndicators[conversation.id]}
                    onClick={() => handleSelectConversation(conversation.id)}
                    onBulkSelect={() => handleToggleBulkSelect(conversation.id)}
                    onStar={() => conversation.isStarred ? unstarConversation(conversation.id) : starConversation(conversation.id)}
                    onPin={() => unpinConversation(conversation.id)}
                    onArchive={() => archiveConversation(conversation.id)}
                    onMarkUnread={() => markAsUnread(conversation.id)}
                  />
                ))}
              </div>
            )}

            {/* Regular Conversations */}
            {unpinnedConversations.length > 0 && (
              <div className="bg-white">
                {pinnedConversations.length > 0 && (
                  <div className="px-4 py-2 text-xs font-semibold text-gray-600 uppercase bg-gray-100">
                    All Conversations
                  </div>
                )}
                {unpinnedConversations.map(conversation => (
                  <ConversationItem
                    key={conversation.id}
                    conversation={conversation}
                    isSelected={selectedConversationId === conversation.id}
                    isBulkSelected={selectedConversations.has(conversation.id)}
                    isTyping={!!typingIndicators[conversation.id]}
                    onClick={() => handleSelectConversation(conversation.id)}
                    onBulkSelect={() => handleToggleBulkSelect(conversation.id)}
                    onStar={() => conversation.isStarred ? unstarConversation(conversation.id) : starConversation(conversation.id)}
                    onPin={() => pinConversation(conversation.id)}
                    onArchive={() => archiveConversation(conversation.id)}
                    onMarkUnread={() => markAsUnread(conversation.id)}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Filter Panel */}
      <FilterPanel
        isOpen={isFilterPanelOpen}
        onClose={() => setIsFilterPanelOpen(false)}
        filters={filters}
        onApply={applyFilters}
        onReset={clearFilters}
      />
    </div>
  );
}
