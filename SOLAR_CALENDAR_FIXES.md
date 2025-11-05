# Solar Calendar Date Picker Fixes

## Issue Description
The date picker in the mark-attendance page was showing Gregorian years (2025) instead of Solar Hijri years (1403). The user requested to fix this to properly display Persian Solar calendar dates.

## Changes Made

### 1. Enhanced Solar Calendar Utilities (`lib/utils/solar-calendar.ts`)

**Added new functions:**
- `solarToGregorian()` - Convert Solar Hijri dates back to Gregorian
- `getCurrentSolarDate()` - Get current date in Solar Hijri format
- `isSolarToday()` - Check if a date is today using Solar calendar
- `formatSolarDateForCalendar()` - Format dates specifically for calendar display

**Purpose:** These functions provide comprehensive Solar calendar support for the application.

### 2. Updated Calendar Component (`components/ui/calendar.tsx`)

**Enhanced formatters:**
```typescript
formatters={{
  formatMonthDropdown: (date) => {
    const solar = gregorianToSolar(date);
    return afghanMonths[solar.month - 1];
  },
  formatMonthCaption: (date) => {
    const solar = gregorianToSolar(date);
    return `${afghanMonths[solar.month - 1]} ${solar.year}`;
  },
  formatYearDropdown: (date) => {
    const solar = gregorianToSolar(date);
    return solar.year.toString();
  },
  formatCaption: (date) => {
    const solar = gregorianToSolar(date);
    return `${afghanMonths[solar.month - 1]} ${solar.year}`;
  },
}}
```

**Result:** Calendar now displays Solar Hijri years (1403) instead of Gregorian years (2025).

### 3. Updated Mark Attendance Page (`app/(office)/dashboard/(attendance)/mark-attendance/[classId]/page.tsx`)

**Changed imports:**
```typescript
// Before
import { addDays, subDays, isToday as checkIsToday, getDay } from "date-fns";
import { formatSolarDate } from "@/lib/utils/solar-calendar";

// After
import { addDays, subDays, getDay } from "date-fns";
import { formatSolarDate, isSolarToday } from "@/lib/utils/solar-calendar";
```

**Updated handlers:**
```typescript
// Before
const handleNextDay = () => {
  if (!checkIsToday(selectedDate)) setSelectedDate((prev) => addDays(prev, 1));
};
const isToday = checkIsToday(selectedDate);

// After
const handleNextDay = () => {
  if (!isSolarToday(selectedDate)) setSelectedDate((prev) => addDays(prev, 1));
};
const isToday = isSolarToday(selectedDate);
```

**Purpose:** Ensures the "Next" button is properly disabled when viewing today's date in Solar calendar context.

## How It Works Now

### Date Display
- **Before:** "Wednesday, January 1, 2025" (Gregorian)
- **After:** "چهارشنبه، ۱۱ جدی ۱۴۰۳" (Solar Hijri)

### Calendar Picker
- **Before:** Shows "January 2025" in header
- **After:** Shows "جدی ۱۴۰۳" in header

### Navigation
- **Before:** "Next" button disabled based on Gregorian today
- **After:** "Next" button disabled based on Solar today

### Date Selection Toast
- **Before:** "Viewing attendance for Wednesday, January 1, 2025"
- **After:** "Viewing attendance for چهارشنبه، ۱۱ جدی ۱۴۰۳"

## Solar Calendar Conversion Examples

| Gregorian Date | Solar Hijri Date | Description |
|---------------|------------------|-------------|
| January 1, 2025 | ۱۱ جدی ۱۴۰۳ | Mid-winter |
| March 21, 2025 | ۱ حمل ۱۴۰۴ | New Year (Nowruz) |
| December 31, 2024 | ۱۰ جدی ۱۴۰۳ | End of Gregorian year |

## Testing

### Manual Testing Steps:
1. Navigate to mark-attendance page for any class
2. Click "Change Date" button
3. Verify calendar shows Solar Hijri year (۱۴۰۳) in header
4. Select any date and verify toast shows Solar date format
5. Check that "Next" button is properly disabled for today's Solar date

### Browser Console Test:
Run the provided test script (`scripts/test-solar-calendar.js`) in browser console to verify conversion accuracy.

## Files Modified
- ✅ `lib/utils/solar-calendar.ts` - Enhanced with new utility functions
- ✅ `components/ui/calendar.tsx` - Updated formatters for Solar display
- ✅ `app/(office)/dashboard/(attendance)/mark-attendance/[classId]/page.tsx` - Updated date handling

## Files Created
- ✅ `scripts/test-solar-calendar.js` - Test script for verification
- ✅ `SOLAR_CALENDAR_FIXES.md` - This documentation

## Result
✅ **Fixed:** Date picker now correctly displays Solar Hijri year ۱۴۰۳ instead of Gregorian year 2025
✅ **Fixed:** All date displays use proper Persian Solar calendar format
✅ **Fixed:** Navigation buttons work correctly with Solar calendar logic
✅ **Fixed:** Date selection and display is consistent throughout the application

The attendance marking system now properly uses the Persian Solar calendar (سال هجری شمسی ۱۴۰۳) as requested.