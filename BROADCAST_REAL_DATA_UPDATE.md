# Broadcast Message - Real Data Integration

## ✅ COMPLETED: Real Classes and Departments Integration

The Broadcast Message dialog now fetches **real data** from the database instead of using mock/hardcoded values.

---

## Changes Made

### 1. **New API Endpoints Created** ✅

#### `/api/classes/list` (GET)
**Purpose**: Fetch all available classes from the database

**Features**:
- Returns all classes with their names and sessions
- Formats as `{name} - {session}` for display
- Requires authentication (teachers/office only)
- Sorted alphabetically by class name

**Response**:
```json
{
  "classes": [
    {
      "id": "uuid",
      "name": "CS-301-A",
      "session": "MORNING",
      "displayName": "CS-301-A - MORNING"
    }
  ]
}
```

#### `/api/departments/list` (GET)
**Purpose**: Fetch all unique departments from teachers table

**Features**:
- Returns unique department names
- Filters out null/empty values
- Requires authentication (teachers/office only)
- Sorted alphabetically

**Response**:
```json
{
  "departments": [
    "Computer Science",
    "Mathematics",
    "Physics"
  ]
}
```

#### `/api/messages/broadcast/recipients-count` (POST)
**Purpose**: Get the count of recipients based on broadcast criteria

**Features**:
- Calculates real recipient count from database
- Supports all broadcast types:
  - `all_students`: Count all students
  - `specific_class`: Count students in specific class
  - `all_teachers`: Count all teachers
  - `specific_department`: Count teachers in specific department
- Real-time count updates

**Request**:
```json
{
  "type": "specific_class",
  "className": "CS-301-A",
  "session": "MORNING"
}
```

**Response**:
```json
{
  "count": 30
}
```

---

### 2. **BroadcastDialog Component Updated** ✅

#### New State Management
```typescript
// Real data from API
const [classes, setClasses] = useState<Array<{...}>>([]);
const [departments, setDepartments] = useState<string[]>([]);
const [recipientCount, setRecipientCount] = useState(0);
const [loadingCount, setLoadingCount] = useState(false);
```

#### Data Fetching Functions
- `fetchClasses()`: Loads real classes from `/api/classes/list`
- `fetchDepartments()`: Loads real departments from `/api/departments/list`
- `fetchRecipientCount()`: Gets real recipient count from `/api/messages/broadcast/recipients-count`

#### Auto-Refresh Logic
```typescript
// Fetch data when dialog opens
useEffect(() => {
  if (isOpen) {
    fetchClasses();
    fetchDepartments();
    fetchRecipientCount();
  }
}, [isOpen]);

// Update count when criteria changes
useEffect(() => {
  if (isOpen) {
    fetchRecipientCount();
  }
}, [formData.criteria, isOpen, fetchRecipientCount]);
```

---

### 3. **RecipientSelection Component Updated** ✅

#### New Props
```typescript
interface RecipientSelectionProps {
  criteria: BroadcastCriteria;
  onChange: (criteria: BroadcastCriteria) => void;
  recipientCount: number;
  classes: Array<{ id: string; name: string; session: string; displayName: string }>;
  departments: string[];
  loadingCount: boolean;
}
```

#### Dynamic Class Selection
**Before** (Hardcoded):
```tsx
<SelectItem value="CS101">CS101 - Introduction to Programming</SelectItem>
<SelectItem value="CS201">CS201 - Data Structures</SelectItem>
```

**After** (Dynamic):
```tsx
{classes.length === 0 ? (
  <SelectItem value="no-classes" disabled>No classes available</SelectItem>
) : (
  classes.map((cls) => (
    <SelectItem key={cls.id} value={cls.name}>
      {cls.displayName}
    </SelectItem>
  ))
)}
```

#### Dynamic Department Selection
**Before** (Hardcoded):
```tsx
<SelectItem value="Computer Science">Computer Science</SelectItem>
<SelectItem value="Mathematics">Mathematics</SelectItem>
```

**After** (Dynamic):
```tsx
{departments.length === 0 ? (
  <SelectItem value="no-departments" disabled>No departments available</SelectItem>
) : (
  departments.map((dept) => (
    <SelectItem key={dept} value={dept}>
      {dept}
    </SelectItem>
  ))
)}
```

#### Loading State for Recipient Count
```tsx
{loadingCount ? (
  <div className="flex items-center gap-2">
    <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
    <span className="text-lg">Loading...</span>
  </div>
) : (
  recipientCount
)}
```

---

## How It Works

### 1. **User Opens Broadcast Dialog**
- Dialog fetches all available classes from database
- Dialog fetches all available departments from database
- Dialog calculates initial recipient count (All Students by default)

### 2. **User Selects "Specific Class"**
- Dropdown shows real classes from database
- User selects a class (e.g., "CS-301-A - MORNING")
- System automatically:
  - Sets both `className` and `session` in criteria
  - Fetches new recipient count for that specific class
  - Shows loading spinner while counting
  - Displays real count (e.g., "30 recipients")

### 3. **User Selects "Specific Department"**
- Dropdown shows real departments from database
- User selects a department (e.g., "Computer Science")
- System automatically:
  - Fetches new recipient count for that department
  - Shows loading spinner while counting
  - Displays real count (e.g., "8 recipients")

### 4. **User Sends Broadcast**
- Backend uses the same criteria to determine recipients
- Sends individual messages to each recipient
- Tracks delivery statistics

---

## Backend Integration

### Database Tables Used
- ✅ `classes` - For class names and sessions
- ✅ `teachers` - For departments and teacher counts
- ✅ `students` - For student counts by class

### Existing Backend Functions
The broadcast backend already has the logic to:
- ✅ Get recipients based on criteria (`getBroadcastRecipients`)
- ✅ Send messages to all recipients
- ✅ Track delivery statistics

**No changes needed to existing backend** - it already works correctly!

---

## Testing Checklist

### API Endpoints
- [x] `/api/classes/list` returns real classes
- [x] `/api/departments/list` returns real departments
- [x] `/api/messages/broadcast/recipients-count` returns accurate counts
- [x] All endpoints require authentication
- [x] Students cannot access these endpoints

### UI Functionality
- [x] Classes dropdown shows real data
- [x] Departments dropdown shows real data
- [x] Recipient count updates automatically
- [x] Loading spinner shows while counting
- [x] Empty states show when no data available
- [x] Selected class includes both name and session

### Broadcast Sending
- [x] "All Students" sends to all students in database
- [x] "Specific Class" sends to students in selected class
- [x] "All Teachers" sends to all teachers in database
- [x] "Specific Department" sends to teachers in selected department

---

## Files Modified

1. **New API Routes**:
   - `app/api/classes/list/route.ts`
   - `app/api/departments/list/route.ts`
   - `app/api/messages/broadcast/recipients-count/route.ts`

2. **Updated Components**:
   - `components/office/messaging/broadcast/BroadcastDialog.tsx`

---

## Result

✅ **The Broadcast Message dialog now shows REAL classes and departments from your database!**

- No more hardcoded "CS101" or "Computer Science"
- Real-time recipient counts
- Accurate data matching your actual database
- Seamless integration with existing backend

The issue where it was showing wrong classes and departments is now **FIXED** because it's pulling data directly from your database tables instead of using mock data.
