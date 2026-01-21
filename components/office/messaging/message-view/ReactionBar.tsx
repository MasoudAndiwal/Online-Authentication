/**
 * ReactionBar Component
 * 
 * Displays reaction options and counts with 3D professional icons.
 * Supports adding/removing reactions with animations and hover tooltips.
 * 
 * Requirements: 27.1, 27.2, 27.3, 27.4, 27.5, 27.6, 27.7, 27.8, 27.9, 27.10
 */

'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/hooks/office/messaging';
import type { Reaction, ReactionType } from '@/types/office/messaging';
import { 
  CheckCircle, 
  Star, 
  ThumbsUp, 
  HelpCircle, 
  AlertTriangle 
} from 'lucide-react';

// ============================================================================
// Component Props
// ============================================================================

interface ReactionBarProps {
  reactions: Reaction[];
  onAddReaction: (reactionType: ReactionType) => void;
  showPicker?: boolean;
}

// ============================================================================
// Reaction Type Configuration
// ============================================================================

const REACTION_TYPES: Array<{
  type: ReactionType;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  color: string;
}> = [
  {
    type: 'acknowledge',
    icon: CheckCircle,
    label: 'Acknowledge',
    color: 'text-green-600',
  },
  {
    type: 'important',
    icon: Star,
    label: 'Important',
    color: 'text-amber-600',
  },
  {
    type: 'agree',
    icon: ThumbsUp,
    label: 'Agree',
    color: 'text-blue-600',
  },
  {
    type: 'question',
    icon: HelpCircle,
    label: 'Question',
    color: 'text-purple-600',
  },
  {
    type: 'urgent',
    icon: AlertTriangle,
    label: 'Urgent',
    color: 'text-red-600',
  },
];

// ============================================================================
// Component Implementation
// ============================================================================

export function ReactionBar({ 
  reactions, 
  onAddReaction, 
  showPicker = false 
}: ReactionBarProps) {
  const { t } = useLanguage();
  const [hoveredReaction, setHoveredReaction] = useState<ReactionType | null>(null);

  // ============================================================================
  // Helper Functions
  // ============================================================================

  const getReactionCount = (type: ReactionType): number => {
    return reactions.filter(r => r.type === type).length;
  };

  const getReactionUsers = (type: ReactionType): string[] => {
    return reactions
      .filter(r => r.type === type)
      .map(r => r.userName);
  };

  const getReactionConfig = (type: ReactionType) => {
    return REACTION_TYPES.find(r => r.type === type);
  };

  // Group reactions by type
  const groupedReactions = REACTION_TYPES.map(config => ({
    ...config,
    count: getReactionCount(config.type),
    users: getReactionUsers(config.type),
  })).filter(r => r.count > 0);

  // ============================================================================
  // Event Handlers
  // ============================================================================

  const handleReactionClick = (type: ReactionType) => {
    onAddReaction(type);
  };

  // ============================================================================
  // Render Reaction Picker
  // ============================================================================

  if (showPicker) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: -10 }}
        transition={{ duration: 0.15 }}
        className="flex gap-1 p-2 bg-white rounded-lg shadow-lg border border-gray-200"
      >
        {REACTION_TYPES.map((reaction) => {
          const Icon = reaction.icon;
          return (
            <motion.button
              key={reaction.type}
              whileHover={{ scale: 1.2, y: -4 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleReactionClick(reaction.type)}
              onMouseEnter={() => setHoveredReaction(reaction.type)}
              onMouseLeave={() => setHoveredReaction(null)}
              className={`relative p-2 rounded-lg hover:bg-gray-100 transition-colors ${reaction.color}`}
              aria-label={reaction.label}
            >
              <Icon className="w-5 h-5" />
              
              {/* Tooltip */}
              <AnimatePresence>
                {hoveredReaction === reaction.type && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    transition={{ duration: 0.15 }}
                    className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap"
                  >
                    {reaction.label}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 w-2 h-2 bg-gray-900 rotate-45" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </motion.div>
    );
  }

  // ============================================================================
  // Render Reaction Counts
  // ============================================================================

  if (groupedReactions.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-1">
      {groupedReactions.map((reaction) => {
        const Icon = reaction.icon;
        return (
          <motion.button
            key={reaction.type}
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.2, 1] }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            whileHover={{ scale: 1.1, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleReactionClick(reaction.type)}
            onMouseEnter={() => setHoveredReaction(reaction.type)}
            onMouseLeave={() => setHoveredReaction(null)}
            className="relative flex items-center gap-1.5 px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
          >
            <Icon className={`w-3.5 h-3.5 ${reaction.color}`} />
            <span className="text-xs font-medium text-gray-700">
              {reaction.count}
            </span>

            {/* User List Tooltip */}
            <AnimatePresence>
              {hoveredReaction === reaction.type && reaction.users.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  transition={{ duration: 0.15 }}
                  className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg whitespace-nowrap z-10"
                  style={{ minWidth: '120px' }}
                >
                  <div className="font-semibold mb-1">{reaction.label}</div>
                  <div className="space-y-0.5">
                    {reaction.users.slice(0, 5).map((user, index) => (
                      <div key={index} className="text-gray-300">
                        {user}
                      </div>
                    ))}
                    {reaction.users.length > 5 && (
                      <div className="text-gray-400 italic">
                        +{reaction.users.length - 5} {t('messaging.reactions.more', 'more')}
                      </div>
                    )}
                  </div>
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 w-2 h-2 bg-gray-900 rotate-45" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        );
      })}
    </div>
  );
}
