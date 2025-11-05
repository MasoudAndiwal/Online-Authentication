# Fixed: Always Show 6 Period Columns

## Problem
The attendance table was only showing columns for periods that existed in the schedule. If a class had only 3 periods scheduled, it would only show 3 columns. The user wanted to always show 6 period columns regardless of the actual schedule.

## Solution Implemented

### 1. **Created standardPeriods Array**
```typescript
// Generate 6 standard periods for display (always show 6 columns)
const standardPeriods = React.useMemo(() => {
  const periods = [];
  const morningTimes = [
    { start: '08:30', end: '09:10' }, // Period 1
    { start: '09:10', end: '09:50' }, // Period 2
    { start: '09:50', end: '10:30' }, // Period 3
    { start: '10:45', end: '11:25' }, // Period 4
    { start: '11:25', end: '12:05' }, // Period 5
    { start: '12:05', end: '12:45' }, // Period 6
  ];

  for (let i = 1; i <= 6; i++) {
    // Find the actual schedule entry for this period
    const scheduleEntry = schedule.find(s => s.periodNumber === i);
    
    periods.push({
      periodNumber: i,
      startTime: scheduleEntry?.startTime || morningTimes[i - 1].start,
      endTime: scheduleEntry?.endTime || morningTimes[i - 1].end,
      teacherName: scheduleEntry?.teacherName || `Teacher ${Math.ceil(i / 2)}`, // Default teacher names
      subject: scheduleEntry?.subject || `Subject ${i}`,
    });
  }
  
  return periods;
}, [schedule]);
```

### 2. **Updated Table Header**
```typescript
// Before: Only showed columns for existing schedule periods
{schedule.map((period) => (
  <th key={period.periodNumber}>...</th>
))}

// After: Always shows 6 columns
{standardPeriods.map((period) => (
  <th key={period.periodNumber}>...</th>
))}
```

### 3. **Updated StudentAttendanceRow Component**
- Removed `schedule` prop dependency
- Now uses `standardPeriods` for rendering period columns
- Always renders 6 period columns with Present/Absent buttons

### 4. **Updated All Logic Functions**
- `handleStatusChange`: Now works with 6 periods
- `handleMarkAllPresent`: Marks all 6 periods as present
- `filteredStudents`: Filters based on 6 periods
- `isDaySickOrLeave`: Checks all 6 periods for sick/leave status

## How It Works Now

### **Scenario 1: One Teacher, 6 Periods**
- Database has 6 schedule entries with same teacher name
- UI shows: 6 columns with actual teacher name from database
- Example: "Ahmad Fahim" appears in all 6 column headers

### **Scenario 2: Six Teachers, One Period Each**
- Database has 6 schedule entries with different teacher names
- UI shows: 6 columns with respective teacher names
- Example: "Teacher 1", "Teacher 2", "Teacher 3", etc.

### **Scenario 3: Mixed Schedule (3 periods scheduled)**
- Database has only 3 schedule entries
- UI shows: 6 columns total
  - Periods 1-3: Show actual teacher names from database
  - Periods 4-6: Show default "Teacher 2", "Teacher 3" names
  - All periods have Present/Absent buttons

### **Scenario 4: No Schedule Data**
- Database has no schedule entries
- UI shows: 6 columns with default times and teacher names
- Example: "Teacher 1", "Teacher 1", "Teacher 2", "Teacher 2", "Teacher 3", "Teacher 3"

## Key Features

### ✅ **Always 6 Columns**
- Table always displays exactly 6 period columns
- Each column has Present/Absent buttons
- Works regardless of actual schedule data

### ✅ **Smart Teacher Name Display**
- Uses actual teacher names from database when available
- Falls back to default pattern: "Teacher 1", "Teacher 2", "Teacher 3"
- Maintains the 2-periods-per-teacher pattern for defaults

### ✅ **Flexible Time Display**
- Uses actual times from database when available
- Falls back to standard morning schedule times
- Maintains consistent time slots

### ✅ **Database Compatibility**
- Always saves 6 attendance records per student
- Each record has correct period_number (1-6)
- Works with any schedule configuration

## Example Output

### Table Header:
```
| # | NAME | DAY STATUS | 08:30-09:10 | 09:10-09:50 | 09:50-10:30 | 10:45-11:25 | 11:25-12:05 | 12:05-12:45 |
|   |      |            | Teacher 1   | Teacher 1   | Teacher 2   | Teacher 2   | Teacher 3   | Teacher 3   |
```

### Student Row:
```
| 1 | Ahmad | [Sick][Leave] | [Present][Absent] | [Present][Absent] | [Present][Absent] | [Present][Absent] | [Present][Absent] | [Present][Absent] |
```

## Files Modified
- ✅ `app/(office)/dashboard/(attendance)/mark-attendance/[classId]/page.tsx` - Complete 6-period display implementation

## Result
✅ **Fixed**: Table now always shows 6 period columns with Present/Absent buttons
✅ **Flexible**: Works with any schedule configuration (1 teacher × 6 periods, 6 teachers × 1 period, etc.)
✅ **Smart**: Uses actual teacher names when available, defaults when not
✅ **Consistent**: Always saves 6 attendance records per student to database

The attendance system now displays exactly 6 period columns as requested, regardless of the actual schedule configuration!