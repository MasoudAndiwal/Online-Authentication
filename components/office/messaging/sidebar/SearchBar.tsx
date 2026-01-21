/**
 * SearchBar Component
 * 
 * Search input with debouncing, filter button, and keyboard shortcuts.
 * Features:
 * - Real-time search with 300ms debouncing
 * - Filter button to open FilterPanel
 * - Clear button when text entered
 * - Search history dropdown
 * - Keyboard shortcut support (Ctrl/Cmd + F)
 * - Glassmorphism styling
 */

'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMessaging } from '@/hooks/office/messaging/use-messaging-context';
import { Search, X, Filter, Clock } from 'lucide-react';

interface SearchBarProps {
  onFilterClick: () => void;
  activeFilterCount?: number;
  className?: string;
}

export function SearchBar({ onFilterClick, activeFilterCount = 0, className = '' }: SearchBarProps) {
  const { searchQuery, searchConversations } = useMessaging();
  const [localQuery, setLocalQuery] = useState(searchQuery);
  const [showHistory, setShowHistory] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load search history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('searchHistory');
    if (saved) {
      try {
        setSearchHistory(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load search history:', e);
      }
    }
  }, []);

  // Debounced search
  useEffect(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(() => {
      if (localQuery !== searchQuery) {
        searchConversations(localQuery);
        
        // Add to history if not empty and not already in history
        if (localQuery.trim() && !searchHistory.includes(localQuery.trim())) {
          const newHistory = [localQuery.trim(), ...searchHistory].slice(0, 10);
          setSearchHistory(newHistory);
          localStorage.setItem('searchHistory', JSON.stringify(newHistory));
        }
      }
    }, 300);

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [localQuery, searchQuery, searchConversations, searchHistory]);

  // Keyboard shortcut: Ctrl/Cmd + F
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalQuery(e.target.value);
  };

  const handleClear = () => {
    setLocalQuery('');
    searchConversations('');
    inputRef.current?.focus();
  };

  const handleHistorySelect = (query: string) => {
    setLocalQuery(query);
    setShowHistory(false);
    inputRef.current?.focus();
  };

  const handleClearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('searchHistory');
    setShowHistory(false);
  };

  return (
    <div className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          <Search className="w-4 h-4" />
        </div>
        
        <input
          ref={inputRef}
          type="text"
          value={localQuery}
          onChange={handleChange}
          onFocus={() => setShowHistory(searchHistory.length > 0)}
          onBlur={() => setTimeout(() => setShowHistory(false), 200)}
          placeholder="Search conversations..."
          className="w-full pl-10 pr-20 py-2.5 text-sm bg-white/80 backdrop-blur-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all shadow-sm hover:shadow-md"
          aria-label="Search conversations"
        />

        {/* Clear Button */}
        <AnimatePresence>
          {localQuery && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={handleClear}
              className="absolute right-12 top-1/2 -translate-y-1/2 p-1.5 text-white bg-gradient-to-r from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600 rounded-lg transition-all shadow-sm"
              aria-label="Clear search"
            >
              <X className="w-3 h-3" />
            </motion.button>
          )}
        </AnimatePresence>

        {/* Filter Button */}
        <button
          onClick={onFilterClick}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-lg transition-all shadow-md relative"
          aria-label="Open filters"
        >
          <Filter className="w-4 h-4" />
          {activeFilterCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs rounded-full flex items-center justify-center font-bold shadow-lg">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Search History Dropdown */}
      <AnimatePresence>
        {showHistory && searchHistory.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-20 w-full mt-2 bg-white rounded-xl shadow-2xl overflow-hidden"
          >
            <div className="px-4 py-2 bg-gradient-to-r from-blue-50 to-blue-100 flex items-center justify-between">
              <span className="text-xs font-bold text-blue-900 uppercase">Recent Searches</span>
              <button
                onClick={handleClearHistory}
                className="text-xs text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 px-3 py-1 rounded-lg font-semibold shadow-sm"
              >
                Clear
              </button>
            </div>
            <div className="max-h-48 overflow-y-auto">
              {searchHistory.map((query, index) => (
                <button
                  key={index}
                  onClick={() => handleHistorySelect(query)}
                  className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-blue-50 transition-colors flex items-center gap-2"
                >
                  <Clock className="w-3 h-3 text-gray-400" />
                  <span className="truncate">{query}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
