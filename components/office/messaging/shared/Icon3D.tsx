/**
 * 3D Professional Icon Component
 * 
 * Professional 3D icon system for the messaging interface
 * Requirements: 22.3
 * 
 * Features:
 * - 3D-styled professional icons
 * - No emojis
 * - Consistent styling across all icons
 * - Support for message types, user avatars, and actions
 * - Animated variants
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  MessageSquare,
  AlertCircle,
  Calendar,
  Megaphone,
  FileText,
  AlertTriangle,
  User,
  GraduationCap,
  Briefcase,
  Check,
  Star,
  ThumbsUp,
  HelpCircle,
  Bell,
  Send,
  Clock,
  CheckCheck,
  XCircle,
  Pin,
  Archive,
  Trash2,
  Forward,
  Reply,
  MoreHorizontal,
  Search,
  Filter,
  Settings,
  LogOut,
  type LucideIcon,
} from 'lucide-react';

// ============================================================================
// Types
// ============================================================================

export type IconType =
  // Message categories
  | 'general'
  | 'administrative'
  | 'attendance_alert'
  | 'schedule_change'
  | 'announcement'
  | 'urgent'
  // User roles
  | 'student'
  | 'teacher'
  | 'office'
  // Reactions
  | 'acknowledge'
  | 'important'
  | 'agree'
  | 'question'
  | 'alert'
  // Message status
  | 'sent'
  | 'delivered'
  | 'read'
  | 'failed'
  | 'sending'
  // Actions
  | 'pin'
  | 'archive'
  | 'delete'
  | 'forward'
  | 'reply'
  | 'more'
  | 'search'
  | 'filter'
  | 'settings'
  | 'logout';

type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface Icon3DProps {
  type: IconType;
  size?: IconSize;
  className?: string;
  animated?: boolean;
  color?: string;
}

// ============================================================================
// Icon Mapping
// ============================================================================

const iconMap: Record<IconType, LucideIcon> = {
  // Message categories
  general: MessageSquare,
  administrative: FileText,
  attendance_alert: AlertCircle,
  schedule_change: Calendar,
  announcement: Megaphone,
  urgent: AlertTriangle,
  
  // User roles
  student: GraduationCap,
  teacher: Briefcase,
  office: User,
  
  // Reactions
  acknowledge: Check,
  important: Star,
  agree: ThumbsUp,
  question: HelpCircle,
  alert: Bell,
  
  // Message status
  sent: Send,
  delivered: CheckCheck,
  read: CheckCheck,
  failed: XCircle,
  sending: Clock,
  
  // Actions
  pin: Pin,
  archive: Archive,
  delete: Trash2,
  forward: Forward,
  reply: Reply,
  more: MoreHorizontal,
  search: Search,
  filter: Filter,
  settings: Settings,
  logout: LogOut,
};

// ============================================================================
// Size Mapping
// ============================================================================

const sizeMap: Record<IconSize, number> = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
};

// ============================================================================
// Color Mapping
// ============================================================================

const defaultColors: Partial<Record<IconType, string>> = {
  // Message categories
  general: '#2196F3',
  administrative: '#9C27B0',
  attendance_alert: '#FF9800',
  schedule_change: '#4CAF50',
  announcement: '#2196F3',
  urgent: '#F44336',
  
  // User roles
  student: '#2196F3',
  teacher: '#4CAF50',
  office: '#9C27B0',
  
  // Reactions
  acknowledge: '#4CAF50',
  important: '#FF9800',
  agree: '#2196F3',
  question: '#9E9E9E',
  alert: '#F44336',
  
  // Message status
  sent: '#90CAF9',
  delivered: '#64B5F6',
  read: '#2196F3',
  failed: '#F44336',
  sending: '#9E9E9E',
};

// ============================================================================
// Component
// ============================================================================

export const Icon3D: React.FC<Icon3DProps> = ({
  type,
  size = 'md',
  className = '',
  animated = false,
  color,
}) => {
  const IconComponent = iconMap[type];
  const iconSize = sizeMap[size];
  const iconColor = color || defaultColors[type] || '#2196F3';

  if (!IconComponent) {
    console.warn(`Icon type "${type}" not found`);
    return null;
  }

  const iconStyle = {
    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1)) drop-shadow(0 1px 2px rgba(0,0,0,0.06))',
  };

  if (animated) {
    return (
      <motion.div
        className={`inline-flex items-center justify-center ${className}`}
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.9 }}
        transition={{ duration: 0.2 }}
      >
        <IconComponent
          size={iconSize}
          color={iconColor}
          style={iconStyle}
          strokeWidth={2.5}
        />
      </motion.div>
    );
  }

  return (
    <div className={`inline-flex items-center justify-center ${className}`}>
      <IconComponent
        size={iconSize}
        color={iconColor}
        style={iconStyle}
        strokeWidth={2.5}
      />
    </div>
  );
};

// ============================================================================
// Specialized Icon Components
// ============================================================================

/**
 * CategoryIcon - Icon for message categories
 */
interface CategoryIconProps {
  category: 'general' | 'administrative' | 'attendance_alert' | 'schedule_change' | 'announcement' | 'urgent';
  size?: IconSize;
  className?: string;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({ category, size, className }) => {
  return <Icon3D type={category} size={size} className={className} />;
};

/**
 * UserRoleIcon - Icon for user roles
 */
interface UserRoleIconProps {
  role: 'student' | 'teacher' | 'office';
  size?: IconSize;
  className?: string;
}

export const UserRoleIcon: React.FC<UserRoleIconProps> = ({ role, size, className }) => {
  return <Icon3D type={role} size={size} className={className} />;
};

/**
 * ReactionIcon - Icon for message reactions
 */
interface ReactionIconProps {
  reaction: 'acknowledge' | 'important' | 'agree' | 'question' | 'alert';
  size?: IconSize;
  className?: string;
  animated?: boolean;
}

export const ReactionIcon: React.FC<ReactionIconProps> = ({ reaction, size, className, animated }) => {
  return <Icon3D type={reaction} size={size} className={className} animated={animated} />;
};

/**
 * StatusIcon - Icon for message delivery status
 */
interface StatusIconProps {
  status: 'sent' | 'delivered' | 'read' | 'failed' | 'sending';
  size?: IconSize;
  className?: string;
}

export const StatusIcon: React.FC<StatusIconProps> = ({ status, size, className }) => {
  return <Icon3D type={status} size={size} className={className} />;
};

/**
 * ActionIcon - Icon for actions
 */
interface ActionIconProps {
  action: 'pin' | 'archive' | 'delete' | 'forward' | 'reply' | 'more' | 'search' | 'filter' | 'settings' | 'logout';
  size?: IconSize;
  className?: string;
  animated?: boolean;
}

export const ActionIcon: React.FC<ActionIconProps> = ({ action, size, className, animated }) => {
  return <Icon3D type={action} size={size} className={className} animated={animated} />;
};

// ============================================================================
// Avatar Component with 3D Effect
// ============================================================================

interface Avatar3DProps {
  role: 'student' | 'teacher' | 'office';
  name?: string;
  imageUrl?: string;
  size?: IconSize;
  className?: string;
}

export const Avatar3D: React.FC<Avatar3DProps> = ({
  role,
  name,
  imageUrl,
  size = 'md',
  className = '',
}) => {
  const avatarSize = sizeMap[size] * 2; // Avatars are larger than icons
  const roleColor = defaultColors[role] || '#2196F3';

  if (imageUrl) {
    return (
      <div
        className={`relative inline-flex items-center justify-center rounded-full overflow-hidden ${className}`}
        style={{
          width: avatarSize,
          height: avatarSize,
          boxShadow: '0 4px 6px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.06)',
        }}
      >
        <img src={imageUrl} alt={name || 'User'} className="w-full h-full object-cover" />
      </div>
    );
  }

  // Fallback to icon-based avatar
  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-full ${className}`}
      style={{
        width: avatarSize,
        height: avatarSize,
        backgroundColor: `${roleColor}20`,
        boxShadow: '0 4px 6px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.06)',
      }}
    >
      <Icon3D type={role} size={size} />
    </div>
  );
};

// ============================================================================
// Badge Component with 3D Effect
// ============================================================================

interface Badge3DProps {
  count: number;
  max?: number;
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge3D: React.FC<Badge3DProps> = ({
  count,
  max = 99,
  size = 'md',
  className = '',
}) => {
  const displayCount = count > max ? `${max}+` : count.toString();
  const badgeSize = size === 'sm' ? 'text-xs px-1.5 py-0.5' : 'text-sm px-2 py-1';

  return (
    <motion.div
      className={`inline-flex items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-red-600 text-white font-semibold ${badgeSize} ${className}`}
      style={{
        boxShadow: '0 2px 4px rgba(244,67,54,0.3), 0 1px 2px rgba(244,67,54,0.2)',
      }}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
    >
      {displayCount}
    </motion.div>
  );
};
