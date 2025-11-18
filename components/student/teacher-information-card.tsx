'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { User, Mail, Clock, MapPin, MessageCircle } from 'lucide-react'

interface TeacherInformationCardProps {
  teacherName: string
  teacherTitle?: string
  email: string
  officeHours: string
  officeLocation: string
  avatar?: string
  onContactTeacher: () => void
}

/**
 * Teacher Information Card Component
 * Displays teacher avatar with green ring
 * Shows teacher name, title, and contact email
 * Adds office hours and location
 * Implements "Contact Teacher" button (opens messaging)
 * Validates: Requirements 5.4
 */
export function TeacherInformationCard({
  teacherName,
  teacherTitle,
  email,
  officeHours,
  officeLocation,
  avatar,
  onContactTeacher
}: TeacherInformationCardProps) {
  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    const parts = name.split(' ')
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    }
    return name.substring(0, 2).toUpperCase()
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <Card className="rounded-2xl shadow-xl bg-white/80 backdrop-blur-xl border-0">
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-800 flex items-center gap-2">
            <User className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-600" />
            Teacher Information
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-5 lg:p-6 space-y-6">
          {/* Teacher Profile Section */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
            {/* Avatar with Green Ring */}
            <div className="relative">
              <div className="p-1 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full">
                <Avatar className="h-20 w-20 sm:h-24 sm:w-24 lg:h-28 lg:w-28 border-4 border-white">
                  <AvatarImage src={avatar} alt={teacherName} />
                  <AvatarFallback className="bg-gradient-to-br from-emerald-100 to-emerald-200 text-emerald-700 text-xl sm:text-2xl font-bold">
                    {getInitials(teacherName)}
                  </AvatarFallback>
                </Avatar>
              </div>
              {/* Online Status Indicator (optional) */}
              <div className="absolute bottom-1 right-1 h-4 w-4 sm:h-5 sm:w-5 bg-green-500 border-2 border-white rounded-full" />
            </div>

            {/* Teacher Details */}
            <div className="flex-1 text-center sm:text-left space-y-2">
              <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-800">
                {teacherName}
              </h3>
              {teacherTitle && (
                <p className="text-sm sm:text-base text-emerald-600 font-medium">
                  {teacherTitle}
                </p>
              )}
              <div className="flex items-center justify-center sm:justify-start gap-2 text-sm sm:text-base text-slate-600">
                <Mail className="h-4 w-4 text-emerald-600" />
                <a
                  href={`mailto:${email}`}
                  className="hover:text-emerald-600 transition-colors underline"
                >
                  {email}
                </a>
              </div>
            </div>
          </div>

          {/* Office Information */}
          <div className="space-y-3">
            {/* Office Hours */}
            <InfoRow
              icon={<Clock className="h-4 w-4 sm:h-5 sm:w-5" />}
              label="Office Hours"
              value={officeHours}
            />

            {/* Office Location */}
            <InfoRow
              icon={<MapPin className="h-4 w-4 sm:h-5 sm:w-5" />}
              label="Office Location"
              value={officeLocation}
            />
          </div>

          {/* Contact Teacher Button */}
          <div className="pt-2">
            <Button
              onClick={onContactTeacher}
              className="w-full min-h-[44px] bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white shadow-xl shadow-emerald-500/25 border-0 text-sm sm:text-base font-semibold rounded-xl transition-all duration-300 hover:scale-[1.02]"
            >
              <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              Contact Teacher
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

interface InfoRowProps {
  icon: React.ReactNode
  label: string
  value: string
}

function InfoRow({ icon, label, value }: InfoRowProps) {
  return (
    <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-lg p-3 sm:p-4 border border-emerald-200/50">
      <div className="flex items-start gap-3">
        <div className="text-emerald-600 mt-0.5">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs sm:text-sm text-slate-600 font-medium mb-1">
            {label}
          </p>
          <p className="text-sm sm:text-base font-semibold text-slate-800 break-words">
            {value}
          </p>
        </div>
      </div>
    </div>
  )
}
