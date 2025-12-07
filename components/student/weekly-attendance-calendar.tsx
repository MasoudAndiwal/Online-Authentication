"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar, Check, X, Thermometer, CalendarDays, Clock, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DayAttendance, AttendanceStatus } from "@/types/types";

interface WeeklyAttendanceCalendarProps {
  weekData: DayAttendance[];
  currentWeek: number;
  onWeekChange: (week: number) => void;
  className?: string;
}

/**
 * Weekly Attendance Calendar Component
 * Displays Saturday to Thursday (5 days) in a grid layout with color-coded status badges
 * Features week navigation, current day highlighting, and expandable session details
 * Requirements: 2.1, 2.2, 2.5, 15.3
 */
export function WeeklyAttendanceCalendar({
  weekData,
  currentWeek,
  onWeekChange,
  className,
}: WeeklyAttendanceCalendarProps) {
  const [expandedDay, setExpandedDay] = useState<string | null>(null);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right' | null>(null);

  const handlePreviousWeek = () => {
    setSlideDirection('right');
    setTimeout(() => {
      onWeekChange(currentWeek - 1);
      setSlideDirection(null);
    }, 150);
  };

  const handleNextWeek = () => {
    setSlideDirection('left');
    setTimeout(() => {
      onWeekChange(currentWeek + 1);
      setSlideDirection(null);
    }, 150);
  };

  const toggleDayExpansion = (date: string) => {
    setExpandedDay(expandedDay === date ? null : date);
  };

  const isToday = (dateString: string) => {
    const today = new Date();
    const date = new Date(dateString);
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const getStatusColor = (status: AttendanceStatus | "future" | "no-class") => {
    switch (status) {
      case "present":
        return {
          bg: "bg-green-50",
          text: "text-green-700",
          icon: <Check className="h-5 w-5" />,
          label: "Present",
        };
      case "absent":
        return {
          bg: "bg-red-50",
          text: "text-red-700",
          icon: <X className="h-5 w-5" />,
          label: "Absent",
        };
      case "sick":
        return {
          bg: "bg-yellow-50",
          text: "text-yellow-700",
          icon: <Thermometer className="h-5 w-5" />,
          label: "Sick",
        };
      case "leave":
        return {
          bg: "bg-blue-50",
          text: "text-blue-700",
          icon: <CalendarDays className="h-5 w-5" />,
          label: "Leave",
        };
      case "future":
        return {
          bg: "bg-slate-50",
          text: "text-slate-500",
          icon: <Clock className="h-5 w-5" />,
          label: "Upcoming",
        };
      default:
        return {
          bg: "bg-slate-50",
          text: "text-slate-400",
          icon: <Minus className="h-5 w-5" />,
          label: "No Class",
        };
    }
  };

  return (
    <Card
      className={cn(
        "rounded-2xl shadow-xl bg-white/80 backdrop-blur-xl border-0 overflow-visible",
        className
      )}
    >
      <CardHeader className="p-4 sm:p-5 lg:p-6">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-600" />
            Weekly Attendance
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreviousWeek}
              className="min-h-[44px] min-w-[44px] p-0 rounded-lg border-0 bg-emerald-50 hover:bg-emerald-100 transition-colors active:scale-95 touch-manipulation"
              aria-label="Previous week"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <span className="text-sm sm:text-base font-medium text-slate-600 min-w-[80px] sm:min-w-[100px] text-center">
              {currentWeek === 0 ? "This Week" : currentWeek > 0 ? `+${currentWeek} Week${currentWeek > 1 ? 's' : ''}` : `${currentWeek} Week${currentWeek < -1 ? 's' : ''}`}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextWeek}
              className="min-h-[44px] min-w-[44px] p-0 rounded-lg border-0 bg-emerald-50 hover:bg-emerald-100 transition-colors active:scale-95 touch-manipulation"
              aria-label="Next week"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-5 lg:p-6 pt-0 overflow-visible">
        {/* Mobile: Horizontal scroll */}
        <div className="md:hidden overflow-x-auto overflow-y-visible -mx-4 px-4 pb-4 scrollbar-hide">
          <div 
            className={cn(
              "flex gap-3 min-w-max transition-transform duration-300 ease-in-out",
              slideDirection === 'left' && "translate-x-[-20px] opacity-80",
              slideDirection === 'right' && "translate-x-[20px] opacity-80"
            )}
          >
            {weekData.map((day) => {
              const statusColors = getStatusColor(day.status);
              const today = isToday(day.date);
              const isExpanded = expandedDay === day.date;

              return (
                <div
                  key={day.date}
                  className={cn(
                    "flex-shrink-0 w-[160px] rounded-xl border-0 shadow-md transition-all duration-300",
                    statusColors.bg,
                    today && "ring-2 ring-emerald-500 ring-offset-2 animate-pulse",
                    "cursor-pointer active:scale-95 touch-manipulation",
                    "min-h-[120px]"
                  )}
                  onClick={() => toggleDayExpansion(day.date)}
                >
                  <div className="p-4">
                    <div className="text-center mb-2">
                      <div className={cn("text-xs font-semibold uppercase", statusColors.text)}>
                        {day.dayName}
                      </div>
                      <div className="text-lg font-bold text-slate-800 mt-1">
                        {new Date(day.date).getDate()}
                      </div>
                    </div>
                    <div
                      className={cn(
                        "flex items-center justify-center gap-2 py-2 px-3 rounded-lg",
                        statusColors.bg,
                        "border-0 shadow-sm",
                        statusColors.text
                      )}
                    >
                      {statusColors.icon}
                      <span className={cn("text-xs font-medium", statusColors.text)}>
                        {statusColors.label}
                      </span>
                    </div>
                    {day.sessions.length > 0 && (
                      <div className="text-center mt-2 text-xs text-slate-500">
                        {day.sessions.length} session{day.sessions.length !== 1 ? "s" : ""}
                      </div>
                    )}
                  </div>

                  {/* Expanded session details for mobile */}
                  {isExpanded && day.sessions.length > 0 && (
                    <div className="border-t-0 p-3 space-y-2 bg-white/50 animate-in slide-in-from-top duration-300">
                      {day.sessions.map((session, idx) => {
                        const sessionColors = getStatusColor(session.status);
                        return (
                          <div
                            key={idx}
                            className={cn(
                              "p-2 rounded-lg text-xs shadow-sm",
                              sessionColors.bg,
                              "border-0"
                            )}
                          >
                            <div className="font-semibold text-slate-700">
                              Period {session.period}
                              {session.time && (
                                <span className="ml-2 font-normal text-slate-500">
                                  {session.time}
                                </span>
                              )}
                            </div>
                            <div className="text-slate-600 truncate">{session.courseName}</div>
                            <div className={cn("font-medium mt-1 flex items-center gap-1", sessionColors.text)}>
                              {statusColors.icon} {sessionColors.label}
                            </div>
                            {session.markedBy && (
                              <div className="text-slate-500 mt-1 text-[10px]">
                                Marked by {session.markedBy}
                                {session.markedAt && (
                                  <span className="ml-1">
                                    at {new Date(session.markedAt).toLocaleTimeString([], { 
                                      hour: '2-digit', 
                                      minute: '2-digit' 
                                    })}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Tablet & Desktop: Full grid */}
        <div 
          className={cn(
            "hidden md:grid md:grid-cols-5 gap-4 lg:gap-6 transition-all duration-300 ease-in-out",
            slideDirection === 'left' && "translate-x-[-20px] opacity-80",
            slideDirection === 'right' && "translate-x-[20px] opacity-80"
          )}
        >
          {weekData.map((day) => {
            const statusColors = getStatusColor(day.status);
            const today = isToday(day.date);
            const isExpanded = expandedDay === day.date;

            return (
              <div
                key={day.date}
                className={cn(
                  "rounded-xl border-0 shadow-md transition-all duration-300",
                  statusColors.bg,
                  today && "ring-2 ring-emerald-500 ring-offset-2 animate-pulse",
                  "cursor-pointer hover:scale-[1.02] hover:shadow-xl"
                )}
                onClick={() => toggleDayExpansion(day.date)}
              >
                <div className="p-4 lg:p-5">
                  <div className="text-center mb-3">
                    <div className={cn("text-xs font-semibold uppercase tracking-wide", statusColors.text)}>
                      {day.dayName}
                    </div>
                    <div className="text-2xl lg:text-3xl font-bold text-slate-800 mt-1">
                      {new Date(day.date).getDate()}
                    </div>
                  </div>
                  <div
                    className={cn(
                      "flex items-center justify-center gap-2 py-2 px-3 rounded-lg",
                      statusColors.bg,
                      "border-0 shadow-sm",
                      statusColors.text
                    )}
                  >
                    {statusColors.icon}
                    <span className={cn("text-sm font-medium", statusColors.text)}>
                      {statusColors.label}
                    </span>
                  </div>
                  {day.sessions.length > 0 && (
                    <div className="text-center mt-3 text-sm text-slate-500">
                      {day.sessions.length} session{day.sessions.length !== 1 ? "s" : ""}
                    </div>
                  )}
                </div>

                {/* Expanded session details for desktop */}
                {isExpanded && day.sessions.length > 0 && (
                  <div className="border-t-0 p-4 space-y-2 bg-white/50 animate-in slide-in-from-top duration-300">
                    {day.sessions.map((session, idx) => {
                      const sessionColors = getStatusColor(session.status);
                      return (
                        <div
                          key={idx}
                          className={cn(
                            "p-3 rounded-lg text-sm shadow-sm",
                            sessionColors.bg,
                            "border-0"
                          )}
                        >
                          <div className="font-semibold text-slate-700">
                            Period {session.period}
                            {session.time && (
                              <span className="ml-2 font-normal text-slate-500">
                                {session.time}
                              </span>
                            )}
                          </div>
                          <div className="text-slate-600 truncate">{session.courseName}</div>
                          <div className={cn("font-medium mt-1 flex items-center gap-1", sessionColors.text)}>
                            {sessionColors.icon} {sessionColors.label}
                          </div>
                          {session.markedBy && (
                            <div className="text-slate-500 mt-2 text-xs">
                              Marked by {session.markedBy}
                              {session.markedAt && (
                                <span className="ml-1">
                                  at {new Date(session.markedAt).toLocaleTimeString([], { 
                                    hour: '2-digit', 
                                    minute: '2-digit' 
                                  })}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
