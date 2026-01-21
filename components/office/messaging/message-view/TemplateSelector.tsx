/**
 * TemplateSelector Component
 * 
 * Comprehensive template selector with:
 * - Display template library (at least 10 templates)
 * - Show template preview on hover
 * - Support template variable substitution (recipient name, date, etc.)
 * - Allow editing template content before sending
 * 
 * Requirements: 4.1, 4.2, 4.3, 4.4, 4.5
 */

'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  Search, 
  X, 
  Edit3, 
  Check,
  ChevronRight,
  Tag,
  Clock,
  TrendingUp
} from 'lucide-react';
import { useMessageTemplates, previewTemplate } from '@/hooks/office/messaging/use-message-templates';
import type { MessageTemplate, MessageCategory } from '@/types/office/messaging';
import { glassmorphism } from '@/lib/design-system/office-messaging';

// ============================================================================
// Component Props
// ============================================================================

interface TemplateSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (content: string, category: MessageCategory) => void;
  recipientName?: string;
  currentDate?: Date;
}

// ============================================================================
// Category Icons
// ============================================================================

const CATEGORY_ICONS: Record<MessageCategory, string> = {
  general: '💬',
  administrative: '📋',
  attendance_alert: '⚠️',
  schedule_change: '📅',
  announcement: '📢',
  urgent: '🚨',
};

const CATEGORY_COLORS: Record<MessageCategory, string> = {
  general: 'bg-gray-100 text-gray-700',
  administrative: 'bg-blue-100 text-blue-700',
  attendance_alert: 'bg-amber-100 text-amber-700',
  schedule_change: 'bg-purple-100 text-purple-700',
  announcement: 'bg-green-100 text-green-700',
  urgent: 'bg-red-100 text-red-700',
};

// ============================================================================
// Component
// ============================================================================

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  isOpen,
  onClose,
  onSelectTemplate,
  recipientName,
  currentDate,
}) => {
  // Hooks
  const { templates, isLoading, error, insertTemplate } = useMessageTemplates();
  
  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<MessageCategory | 'all'>('all');
  const [hoveredTemplateId, setHoveredTemplateId] = useState<string | null>(null);
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  const [editedContent, setEditedContent] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'usage' | 'recent'>('usage');
  
  // ============================================================================
  // Filtering and Sorting
  // ============================================================================
  
  /**
   * Filter templates by search query and category
   */
  const filteredTemplates = useMemo(() => {
    let filtered = templates;
    
    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(t => t.category === selectedCategory);
    }
    
    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(t => 
        t.name.toLowerCase().includes(query) ||
        t.content.toLowerCase().includes(query)
      );
    }
    
    // Sort templates
    const sorted = [...filtered];
    switch (sortBy) {
      case 'name':
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'usage':
        sorted.sort((a, b) => b.usageCount - a.usageCount);
        break;
      case 'recent':
        // For now, sort by usage as we don't have lastUsed timestamp
        sorted.sort((a, b) => b.usageCount - a.usageCount);
        break;
    }
    
    return sorted;
  }, [templates, searchQuery, selectedCategory, sortBy]);
  
  /**
   * Get unique categories from templates
   */
  const availableCategories = useMemo(() => {
    const categories = new Set(templates.map(t => t.category));
    return Array.from(categories);
  }, [templates]);
  
  // ============================================================================
  // Handlers
  // ============================================================================
  
  /**
   * Handle template selection
   */
  const handleSelectTemplate = useCallback((template: MessageTemplate) => {
    // Prepare variables for substitution
    const variables: Record<string, string> = {
      recipientName: recipientName || '[Recipient Name]',
      date: (currentDate || new Date()).toLocaleDateString(),
      time: (currentDate || new Date()).toLocaleTimeString(),
      day: (currentDate || new Date()).toLocaleDateString('en-US', { weekday: 'long' }),
      month: (currentDate || new Date()).toLocaleDateString('en-US', { month: 'long' }),
      year: (currentDate || new Date()).getFullYear().toString(),
    };
    
    // Insert template with variable substitution
    const content = insertTemplate(template.id, variables);
    
    // Pass content and category to parent
    onSelectTemplate(content, template.category);
    
    // Close selector
    onClose();
  }, [insertTemplate, recipientName, currentDate, onSelectTemplate, onClose]);
  
  /**
   * Handle edit template
   */
  const handleEditTemplate = useCallback((template: MessageTemplate) => {
    setEditingTemplateId(template.id);
    
    // Prepare variables for preview
    const variables: Record<string, string> = {
      recipientName: recipientName || '[Recipient Name]',
      date: (currentDate || new Date()).toLocaleDateString(),
      time: (currentDate || new Date()).toLocaleTimeString(),
      day: (currentDate || new Date()).toLocaleDateString('en-US', { weekday: 'long' }),
      month: (currentDate || new Date()).toLocaleDateString('en-US', { month: 'long' }),
      year: (currentDate || new Date()).getFullYear().toString(),
    };
    
    const content = insertTemplate(template.id, variables);
    setEditedContent(content);
  }, [insertTemplate, recipientName, currentDate]);
  
  /**
   * Handle save edited template
   */
  const handleSaveEdit = useCallback((template: MessageTemplate) => {
    onSelectTemplate(editedContent, template.category);
    setEditingTemplateId(null);
    setEditedContent('');
    onClose();
  }, [editedContent, onSelectTemplate, onClose]);
  
  /**
   * Handle cancel edit
   */
  const handleCancelEdit = useCallback(() => {
    setEditingTemplateId(null);
    setEditedContent('');
  }, []);
  
  /**
   * Get template preview
   */
  const getTemplatePreview = useCallback((template: MessageTemplate): string => {
    return previewTemplate(template);
  }, []);
  
  // ============================================================================
  // Render
  // ============================================================================
  
  if (!isOpen) return null;
  
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ type: 'spring', duration: 0.3 }}
          className="relative w-full max-w-4xl max-h-[80vh] m-4 rounded-2xl shadow-2xl overflow-hidden"
          style={{
            background: glassmorphism.light.background,
            backdropFilter: glassmorphism.light.backdropFilter,
            WebkitBackdropFilter: glassmorphism.light.WebkitBackdropFilter,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200/50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Message Templates</h2>
                <p className="text-sm text-gray-500">
                  {filteredTemplates.length} template{filteredTemplates.length !== 1 ? 's' : ''} available
                </p>
              </div>
            </div>
            
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          
          {/* Search and Filters */}
          <div className="p-6 border-b border-gray-200/50 space-y-4">
            {/* Search bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search templates..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded transition-colors"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              )}
            </div>
            
            {/* Category filters and sort */}
            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  selectedCategory === 'all'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              
              {availableCategories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    selectedCategory === category
                      ? CATEGORY_COLORS[category]
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span className="mr-1">{CATEGORY_ICONS[category]}</span>
                  {category.replace('_', ' ')}
                </button>
              ))}
              
              <div className="flex-1" />
              
              {/* Sort dropdown */}
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-gray-400" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'name' | 'usage' | 'recent')}
                  className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg bg-white hover:bg-gray-50 transition-colors"
                >
                  <option value="usage">Most Used</option>
                  <option value="name">Name</option>
                  <option value="recent">Recent</option>
                </select>
              </div>
            </div>
          </div>
          
          {/* Template List */}
          <div className="p-6 overflow-y-auto max-h-[calc(80vh-280px)]">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"
                />
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-600">{error}</p>
              </div>
            ) : filteredTemplates.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No templates found</p>
              </div>
            ) : (
              <div className="grid gap-3">
                {filteredTemplates.map(template => (
                  <motion.div
                    key={template.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative group"
                    onMouseEnter={() => setHoveredTemplateId(template.id)}
                    onMouseLeave={() => setHoveredTemplateId(null)}
                  >
                    {editingTemplateId === template.id ? (
                      // Edit mode
                      <div className="p-4 bg-white rounded-lg border-2 border-blue-500 shadow-lg">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-semibold text-gray-900">{template.name}</h3>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleSaveEdit(template)}
                              className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all"
                              title="Use this template"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                              title="Cancel"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <textarea
                          value={editedContent}
                          onChange={(e) => setEditedContent(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[120px]"
                          placeholder="Edit template content..."
                        />
                        <p className="mt-2 text-xs text-gray-500">
                          Edit the template content before sending
                        </p>
                      </div>
                    ) : (
                      // View mode
                      <div className="p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-gray-900">{template.name}</h3>
                              <span className={`px-2 py-0.5 rounded text-xs font-medium ${CATEGORY_COLORS[template.category]}`}>
                                {CATEGORY_ICONS[template.category]} {template.category.replace('_', ' ')}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 line-clamp-2">
                              {hoveredTemplateId === template.id 
                                ? getTemplatePreview(template)
                                : template.content
                              }
                            </p>
                          </div>
                          
                          <div className="flex items-center gap-1 ml-4">
                            <button
                              onClick={() => handleEditTemplate(template)}
                              className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors opacity-0 group-hover:opacity-100"
                              title="Edit before sending"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleSelectTemplate(template)}
                              className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all"
                              title="Use this template"
                            >
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        
                        {/* Template metadata */}
                        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-100">
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Clock className="w-3 h-3" />
                            Used {template.usageCount} times
                          </div>
                          {template.variables.length > 0 && (
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <Tag className="w-3 h-3" />
                              {template.variables.length} variable{template.variables.length !== 1 ? 's' : ''}
                            </div>
                          )}
                        </div>
                        
                        {/* Preview tooltip on hover */}
                        <AnimatePresence>
                          {hoveredTemplateId === template.id && (
                            <motion.div
                              initial={{ opacity: 0, y: 5 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 5 }}
                              className="absolute left-0 right-0 top-full mt-2 p-3 bg-gray-900 text-white text-sm rounded-lg shadow-xl z-10"
                            >
                              <p className="font-medium mb-1">Preview with sample data:</p>
                              <p className="text-gray-300">{getTemplatePreview(template)}</p>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
