'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import { Button } from '@/components/ui/button'
import { User, MessageCircle, Calendar, Clock } from 'lucide-react'

interface Teacher {
  id: string
  name: string
  title?: string
  avatar?: string
  sessions: {
    day: string
    time: string
    type: string
  }[]
}

interface TeacherInformationCardProps {
  teachers: Teacher[]
  onContactTeacher: (teacherId: string) => void
}

/**
 * Teacher Information Card Component
 * Displays all teachers with their schedules in a table format
 * Shows teacher avatar, name, title, and schedule
 * Implements "Contact" button for each teacher
 * Validates: Requirements 5.4
 */
export function TeacherInformationCard({
  teachers,
  onContactTeacher
}: TeacherInformationCardProps) {
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
        <CardContent className="p-4 sm:p-5 lg:p-6">
          {/* Teachers Table */}
          <div className="space-y-4">
            {teachers.map((teacher, index) => (
              <motion.div
                key={teacher.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-xl p-4 sm:p-5 border-0 shadow-sm"
              >
                {/* Teacher Header */}
                <div className="flex flex-col sm:flex-row items-start gap-4">
                  {/* Teacher Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg sm:text-xl font-bold text-slate-800 mb-1">
                      {teacher.name}
                    </h3>
                    {teacher.title && (
                      <p className="text-sm sm:text-base text-emerald-600 font-medium mb-3">
                        {teacher.title}
                      </p>
                    )}

                    {/* Schedule Sessions */}
                    <div className="space-y-2">
                      {teacher.sessions.map((session, idx) => (
                        <div
                          key={idx}
                          className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm"
                        >
                          <div className="flex items-center gap-1.5 bg-white/60 px-2 sm:px-3 py-1 rounded-lg shadow-sm">
                            <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-emerald-600" />
                            <span className="font-semibold text-slate-700">{session.day}</span>
                          </div>
                          <div className="flex items-center gap-1.5 bg-white/60 px-2 sm:px-3 py-1 rounded-lg shadow-sm">
                            <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-emerald-600" />
                            <span className="text-slate-600">{session.time}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Contact Button */}
                  <div className="w-full sm:w-auto flex-shrink-0">
                    <Button
                      onClick={() => onContactTeacher(teacher.id)}
                      className="w-full sm:w-auto min-h-[40px] bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white shadow-lg shadow-emerald-500/25 border-0 text-sm font-semibold rounded-lg transition-all duration-300 hover:scale-[1.02] px-4 sm:px-6"
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Contact
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}


