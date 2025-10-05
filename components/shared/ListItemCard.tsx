'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { Edit, Trash2, Eye, MoreHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

// Color scheme type
export type ColorScheme = 'orange' | 'green'

// Color configurations
const colorSchemes = {
  orange: {
    primary: {
      50: 'orange-50',
      100: 'orange-100',
      500: 'orange-500',
      600: 'orange-600',
      700: 'orange-700'
    },
    gradients: {
      primary: 'from-orange-500 to-orange-600',
      light: 'from-orange-400 to-orange-500'
    },
    focus: {
      border: 'focus:border-orange-500',
      ring: 'focus:ring-orange-100'
    },
    hover: 'hover:bg-orange-50',
    text: 'text-orange-600',
    bg: 'bg-orange-100'
  },
  green: {
    primary: {
      50: 'green-50',
      100: 'green-100',
      500: 'green-500',
      600: 'green-600',
      700: 'green-700'
    },
    gradients: {
      primary: 'from-green-500 to-green-600',
      light: 'from-green-400 to-green-500'
    },
    focus: {
      border: 'focus:border-green-500',
      ring: 'focus:ring-green-100'
    },
    hover: 'hover:bg-green-50',
    text: 'text-green-600',
    bg: 'bg-green-100'
  }
}

// Base item interface
export interface BaseListItem {
  id: string
  name: string
  email: string
  phone: string
  status: 'Active' | 'On Leave' | 'Inactive'
  avatar?: string
}

// Teacher specific interface
export interface TeacherListItem extends BaseListItem {
  department: string
  qualification: string
  experience: string
  classes: number
}

// Student specific interface
export interface StudentListItem extends BaseListItem {
  program: string
  year: string
  semester: string
  gpa: string
  attendance: string
}

// Action handlers interface
export interface ListItemActions {
  onEdit: (id: string) => void
  onDelete: (id: string) => void
  onView?: (id: string) => void
}

// Props interface
interface ListItemCardProps {
  item: TeacherListItem | StudentListItem
  colorScheme: ColorScheme
  actions: ListItemActions
  className?: string
  showAvatar?: boolean
  compact?: boolean
}

// Helper function to check if item is teacher
function isTeacher(item: TeacherListItem | StudentListItem): item is TeacherListItem {
  return 'department' in item
}

// Status badge component
function StatusBadge({ status, colorScheme }: { status: string; colorScheme: ColorScheme }) {
  const colors = colorSchemes[colorScheme]
  
  const statusColors = {
    Active: `bg-${colors.primary[100]} text-${colors.primary[700]} border-${colors.primary[100]}`,
    'On Leave': 'bg-amber-100 text-amber-700 border-amber-200',
    Inactive: 'bg-slate-100 text-slate-700 border-slate-200'
  }

  return (
    <span className={cn(
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
      statusColors[status as keyof typeof statusColors] || statusColors.Inactive
    )}>
      {status}
    </span>
  )
}

// Action buttons component
function ActionButtons({ 
  item, 
  actions, 
  colorScheme 
}: { 
  item: TeacherListItem | StudentListItem
  actions: ListItemActions
  colorScheme: ColorScheme 
}) {
  const colors = colorSchemes[colorScheme]

  return (
    <div className="flex items-center gap-1">
      {actions.onView && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => actions.onView!(item.id)}
          className={cn(
            'h-8 w-8 p-0 hover:bg-slate-100',
            colors.hover
          )}
          aria-label={`View ${item.name}`}
        >
          <Eye className="h-4 w-4" />
        </Button>
      )}
      
      <Button
        variant="ghost"
        size="sm"
        onClick={() => actions.onEdit(item.id)}
        className={cn(
          'h-8 w-8 p-0 hover:bg-slate-100',
          colors.hover
        )}
        aria-label={`Edit ${item.name}`}
      >
        <Edit className="h-4 w-4" />
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={() => actions.onDelete(item.id)}
        className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
        aria-label={`Delete ${item.name}`}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  )
}

// Avatar component
function Avatar({ name, avatar, colorScheme }: { name: string; avatar?: string; colorScheme: ColorScheme }) {
  const colors = colorSchemes[colorScheme]
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

  if (avatar) {
    return (
      <img
        src={avatar}
        alt={name}
        className="h-10 w-10 rounded-full object-cover"
      />
    )
  }

  return (
    <div className={cn(
      'h-10 w-10 rounded-full flex items-center justify-center text-white font-semibold text-sm',
      `bg-gradient-to-br ${colors.gradients.primary}`
    )}>
      {initials}
    </div>
  )
}

// Main ListItemCard component
export function ListItemCard({
  item,
  colorScheme,
  actions,
  className,
  showAvatar = true,
  compact = false
}: ListItemCardProps) {
  const colors = colorSchemes[colorScheme]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300',
        'p-4 sm:p-6',
        className
      )}
      role="article"
      aria-label={`${isTeacher(item) ? 'Teacher' : 'Student'} information for ${item.name}`}
    >
      {/* Header Section */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {showAvatar && (
            <Avatar name={item.name} avatar={item.avatar} colorScheme={colorScheme} />
          )}
          
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-slate-900 truncate text-sm sm:text-base">
              {item.name}
            </h3>
            <p className="text-slate-600 text-xs sm:text-sm truncate">
              {item.email}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <StatusBadge status={item.status} colorScheme={colorScheme} />
          <ActionButtons item={item} actions={actions} colorScheme={colorScheme} />
        </div>
      </div>

      {/* Content Section */}
      <div className="space-y-3">
        {/* Basic Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-slate-500 font-medium">Phone:</span>
            <span className="ml-2 text-slate-900">{item.phone}</span>
          </div>
          
          {isTeacher(item) ? (
            <>
              <div>
                <span className="text-slate-500 font-medium">Department:</span>
                <span className="ml-2 text-slate-900">{item.department}</span>
              </div>
              {!compact && (
                <>
                  <div>
                    <span className="text-slate-500 font-medium">Qualification:</span>
                    <span className="ml-2 text-slate-900">{item.qualification}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-medium">Experience:</span>
                    <span className="ml-2 text-slate-900">{item.experience}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-medium">Classes:</span>
                    <span className="ml-2 text-slate-900">{item.classes}</span>
                  </div>
                </>
              )}
            </>
          ) : (
            <>
              <div>
                <span className="text-slate-500 font-medium">Program:</span>
                <span className="ml-2 text-slate-900">{item.program}</span>
              </div>
              {!compact && (
                <>
                  <div>
                    <span className="text-slate-500 font-medium">Year:</span>
                    <span className="ml-2 text-slate-900">{item.year}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-medium">Semester:</span>
                    <span className="ml-2 text-slate-900">{item.semester}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-medium">GPA:</span>
                    <span className="ml-2 text-slate-900">{item.gpa}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-medium">Attendance:</span>
                    <span className={cn(
                      'ml-2 font-medium',
                      parseFloat(item.attendance) >= 80 ? 'text-green-600' :
                      parseFloat(item.attendance) >= 60 ? 'text-amber-600' : 'text-red-600'
                    )}>
                      {item.attendance}%
                    </span>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default ListItemCard