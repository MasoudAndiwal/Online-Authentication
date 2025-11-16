import { startOfMonth, endOfMonth, subMonths } from 'date-fns'
import { gregorianToSolar, getSolarMonthName, formatSolarDateForCalendar } from './solar-calendar'

export type DateRangeType = 'current-week' | 'last-week' | 'current-month' | 'last-month' | 'custom'

export interface DateRange {
  from: Date
  to: Date
  label: string
  description: string
}

// Afghanistan week: Saturday to Thursday (6 days)
function getAfghanWeekStart(date: Date): Date {
  const dayOfWeek = date.getDay()
  // Saturday = 6, Sunday = 0, Monday = 1, Tuesday = 2, Wednesday = 3, Thursday = 4, Friday = 5
  // We want to find the most recent Saturday
  let daysToSubtract: number
  
  if (dayOfWeek === 6) {
    // Already Saturday
    daysToSubtract = 0
  } else if (dayOfWeek === 0) {
    // Sunday - go back 1 day to Saturday
    daysToSubtract = 1
  } else {
    // Monday (1) to Friday (5) - go back to previous Saturday
    daysToSubtract = dayOfWeek + 1
  }
  
  const weekStart = new Date(date)
  weekStart.setDate(date.getDate() - daysToSubtract)
  weekStart.setHours(0, 0, 0, 0)
  return weekStart
}

function getAfghanWeekEnd(weekStart: Date): Date {
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekStart.getDate() + 5) // 6 days total (Sat-Thu)
  weekEnd.setHours(23, 59, 59, 999)
  return weekEnd
}

// Helper function to format Afghanistan Solar Hijri date range
function formatAfghanDateRange(from: Date, to: Date): string {
  const fromSolar = formatSolarDateForCalendar(from)
  const toSolar = formatSolarDateForCalendar(to)
  
  // If same month and year, show: "15 - 20 حمل 1403"
  if (fromSolar.solarMonth === toSolar.solarMonth && fromSolar.solarYear === toSolar.solarYear) {
    return `${fromSolar.solarDay} - ${toSolar.solarDay} ${fromSolar.monthName} ${fromSolar.solarYear}`
  }
  
  // If same year, show: "25 حمل - 5 ثور 1403"
  if (fromSolar.solarYear === toSolar.solarYear) {
    return `${fromSolar.solarDay} ${fromSolar.monthName} - ${toSolar.solarDay} ${toSolar.monthName} ${fromSolar.solarYear}`
  }
  
  // Different years, show: "25 حمل 1402 - 5 ثور 1403"
  return `${fromSolar.solarDay} ${fromSolar.monthName} ${fromSolar.solarYear} - ${toSolar.solarDay} ${toSolar.monthName} ${toSolar.solarYear}`
}

// Helper function to format single Afghanistan Solar Hijri month
function formatAfghanMonth(date: Date): string {
  const solar = gregorianToSolar(date)
  const monthName = getSolarMonthName(solar.month)
  return `${monthName} ${solar.year}`
}

export function getDateRange(type: DateRangeType, customFrom?: Date, customTo?: Date): DateRange {
  const today = new Date()
  
  switch (type) {
    case 'current-week': {
      const from = getAfghanWeekStart(today)
      const to = getAfghanWeekEnd(from)
      return {
        from,
        to,
        label: 'Current Week',
        description: formatAfghanDateRange(from, to)
      }
    }
    
    case 'last-week': {
      // Get last week by going back 7 days from current week start
      const currentWeekStart = getAfghanWeekStart(today)
      const lastWeekDate = new Date(currentWeekStart)
      lastWeekDate.setDate(currentWeekStart.getDate() - 7)
      
      const from = getAfghanWeekStart(lastWeekDate)
      const to = getAfghanWeekEnd(from)
      return {
        from,
        to,
        label: 'Last Week',
        description: formatAfghanDateRange(from, to)
      }
    }
    
    case 'current-month': {
      const from = startOfMonth(today)
      const to = endOfMonth(today)
      return {
        from,
        to,
        label: 'Current Month',
        description: formatAfghanMonth(from)
      }
    }
    
    case 'last-month': {
      const lastMonth = subMonths(today, 1)
      const from = startOfMonth(lastMonth)
      const to = endOfMonth(lastMonth)
      return {
        from,
        to,
        label: 'Last Month',
        description: formatAfghanMonth(from)
      }
    }
    
    case 'custom': {
      if (!customFrom || !customTo) {
        throw new Error('Custom date range requires both from and to dates')
      }
      return {
        from: customFrom,
        to: customTo,
        label: 'Custom Range',
        description: formatAfghanDateRange(customFrom, customTo)
      }
    }
    
    default:
      throw new Error(`Unknown date range type: ${type}`)
  }
}

export function validateDateRange(from: Date, to: Date): { isValid: boolean; error?: string } {
  if (from > to) {
    return { isValid: false, error: 'Start date must be before end date' }
  }
  
  const daysDiff = Math.ceil((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24))
  
  if (daysDiff > 365) {
    return { isValid: false, error: 'Date range cannot exceed 365 days' }
  }
  
  if (daysDiff < 0) {
    return { isValid: false, error: 'Invalid date range' }
  }
  
  return { isValid: true }
}

export function getWeekBoundaries(date: Date): { start: Date; end: Date; days: Date[] } {
  const start = getAfghanWeekStart(date)
  const end = getAfghanWeekEnd(start)
  
  const days: Date[] = []
  for (let i = 0; i < 6; i++) {
    const day = new Date(start)
    day.setDate(start.getDate() + i)
    days.push(day)
  }
  
  return { start, end, days }
}



// Get day names for Afghanistan week (Saturday to Thursday)
export function getAfghanWeekDays(): string[] {
  return ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday']
}

// Check if a date is within Afghanistan work week
export function isAfghanWorkDay(date: Date): boolean {
  const dayOfWeek = date.getDay()
  // Friday (5) is the only non-work day
  return dayOfWeek !== 5
}
