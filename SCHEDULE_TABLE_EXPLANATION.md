# Schedule Table - Complete Explanation

## How the Schedule Table Works

### Overview
The schedule table is a **weekly calendar grid** that displays class schedule entries. It shows:
- **7 columns**: One for each day of the week (Sunday to Saturday)
- **Multiple rows**: Time slots from 8:00 AM to 6:00 PM (30-minute intervals)
- **Colored boxes**: Schedule entries that appear at their scheduled time and day

### Data Flow

#### 1. Data Fetching
```typescript
// Fetches schedule entries from database
GET /api/schedule/class?classId={classId}

// Returns entries like:
{
  id: "uuid",
  subject: "Computer Programming",
  dayOfWeek: "monday",
  startTime: "15:30:00",
  endTime: "17:30:00",
  teacherName: "Dr. Ahmed"
}
```

#### 2. Data Mapping
The component converts database format to display format:
- `dayOfWeek` string → number (0=Sunday, 1=Monday, etc.)
- `startTime` "15:30:00" → matches with time slot "15:30"
- Calculates period number based on time

#### 3. Display Logic
For each time slot and day:
```typescript
// Find entries for this day
const dayEntries = filteredEntries.filter(entry => entry.dayOfWeek === dayIndex)

// Find entry that starts at this time
const timeEntry = dayEntries.find(entry => 
  entry.startTime.substring(0, 5) === time
)

// If found, display colored box
```

### Time Slot Matching

**Problem Solved**: Database returns times with seconds ("15:30:00") but time slots are without seconds ("15:30")

**Solution**: Compare only first 5 characters
```typescript
entry.startTime.substring(0, 5) === time
// "15:30:00".substring(0, 5) === "15:30" ✅
```

## Period Calculation System

### 6-Period System (3 Morning + 3 Afternoon)

#### Morning Session (8:30 AM - 12:45 PM)
- **Period 1**: 8:30 AM - 9:10 AM (40 minutes)
- **Period 2**: 9:10 AM - 9:50 AM (40 minutes)
- **Period 3**: 9:50 AM - 10:30 AM (40 minutes)
- **Break**: 10:30 AM - 10:45 AM (15 minutes)
- **Period 4**: 10:45 AM - 11:25 AM (40 minutes)
- **Period 5**: 11:25 AM - 12:05 PM (40 minutes)
- **Period 6**: 12:05 PM - 12:45 PM (40 minutes)

#### Afternoon Session (1:15 PM - 5:30 PM)
- **Period 1**: 1:15 PM - 1:55 PM (40 minutes)
- **Period 2**: 1:55 PM - 2:35 PM (40 minutes)
- **Period 3**: 2:35 PM - 3:15 PM (40 minutes)
- **Break**: 3:15 PM - 3:30 PM (15 minutes)
- **Period 4**: 3:30 PM - 4:10 PM (40 minutes) ← **Your 3:30 PM class**
- **Period 5**: 4:10 PM - 4:50 PM (40 minutes)
- **Period 6**: 4:50 PM - 5:30 PM (40 minutes)

### Period Calculation Logic

```typescript
const getPeriodNumber = (startTime: string): number => {
  const [hours, minutes] = startTime.split(':').map(Number);
  const totalMinutes = hours * 60 + minutes;
  
  // Example: 3:30 PM
  // hours = 15, minutes = 30
  // totalMinutes = 15 * 60 + 30 = 930
  
  // Check: if (totalMinutes >= 930 && totalMinutes < 970) return 4;
  // Result: Period 4 ✅
}
```

### Why 3:30 PM = Period 4 (Not Period 7)

**Before Fix**: Used simple hour-based calculation
```typescript
if (hours >= 15 && hours < 16) return 7; // WRONG!
```
This treated afternoon as continuation of morning (periods 5, 6, 7, 8)

**After Fix**: Separate morning and afternoon sessions
```typescript
// Afternoon starts fresh at Period 1
// 3:30 PM is the 4th period of afternoon session
if (totalMinutes >= 930 && totalMinutes < 970) return 4; // CORRECT!
```

## Design Updates

### Schedule Box Styling

**Old Design** (Bad):
- Gray background with border
- Dropdown menu with delete option
- Three-dot icon
- Plain text

**New Design** (Beautiful):
```css
className="absolute inset-1 rounded-lg p-2 
  bg-gradient-to-br from-blue-500 to-blue-600 
  shadow-md hover:shadow-lg 
  transition-all cursor-pointer"
```

**Features**:
- ✅ Beautiful blue gradient background
- ✅ No borders (clean look)
- ✅ White text for contrast
- ✅ Shadow effect for depth
- ✅ Hover effect (shadow increases)
- ✅ Smooth transitions
- ✅ No dropdown menu (simplified)
- ✅ No delete icon (cleaner)

### Box Content Display

```
┌─────────────────────────┐
│ Computer Programming    │ ← Subject (bold, white)
│ 3:30 PM - 5:30 PM      │ ← Time (white, 90% opacity)
│ Period 4               │ ← Period (white, 80% opacity)
└─────────────────────────┘
```

## Complete Flow Example

### Example: Computer Programming at 3:30 PM on Monday

1. **Database Entry**:
```json
{
  "subject": "Computer Programming",
  "dayOfWeek": "monday",
  "startTime": "15:30:00",
  "endTime": "17:30:00"
}
```

2. **Mapping**:
- dayOfWeek "monday" → 1 (Monday column)
- startTime "15:30:00" → matches time slot "15:30"

3. **Period Calculation**:
- 15:30 = 930 minutes
- Falls in range 930-970
- **Result: Period 4**

4. **Display**:
- Appears in Monday column
- At 15:30 (3:30 PM) row
- Blue gradient box
- Shows: "Computer Programming", "3:30 PM - 5:30 PM", "Period 4"

## Summary

The schedule table:
1. Fetches data from database
2. Maps day names to column numbers
3. Matches start times to time slot rows
4. Calculates correct period numbers (1-6 for each session)
5. Displays beautiful colored boxes at the right position
6. Shows subject, time, and period in each box

**Key Point**: Afternoon session periods restart at 1, so 3:30 PM is Period 4 of the afternoon session, not Period 7 overall!
