# Mark Attendance Page - Design Document

## Overview

The Mark Attendance page is a modern, class-based attendance tracking interface built with Next.js 15, React 19, TypeScript, and Tailwind CSS. The design follows the established patterns from the All Classes, Students, and Teachers pages, using the orange/amber color scheme for visual consistency. This is a frontend-only implementation that stores attendance data in React state, ready for backend integration in the future.

## Technology Stack

- **Frontend**: Next.js 15 with App Router, React 19, TypeScript
- **Styling**: Tailwind CSS v4 with custom design system
- **UI Components**: Shadcn/ui (Card, Button, Input, Badge, Dialog)
- **Icons**: Lucide React
- **Animations**: Framer Motion for complex animations, CSS transitions for simple effects
- **State Management**: React useState and useCallback hooks
- **Date Handling**: date-fns for date formatting and manipulation
- **Notifications**: Sonner for toast notifications
- **Form Handling**: React Hook Form (if needed for date picker)

## Page Structure

### Route Structure
```
app/(office)/dashboard/(attendance)/
├── mark-attendance/
│   ├── page.tsx                    # Class selection view
│   └── [classId]/
│       └── page.tsx                # Attendance marking view
```

### Component Hierarchy
```
MarkAttendancePage (Class Selection)
├── ModernDashboardLayout
│   └── PageContainer
│       ├── StatisticsCards (Total Classes, Morning, Afternoon)
│       ├── SearchAndFilterBar
│       │   ├── SearchInput
│       │   └── SessionFilter
│       └── ClassGrid
│           └── ClassCard[] (clickable, navigates to marking view)

MarkAttendanceClassPage (Attendance Marking)
├── ModernDashboardLayout
│   └── PageContainer
│       ├── ClassHeader (Class name, session, back button)
│       ├── DateSelector (date picker, prev/next buttons)
│       ├── StatisticsCards (Total, Present, Absent, Sick, Leave, Not Marked)
│       ├── BulkActions (Mark All Present button)
│       ├── SearchAndFilterBar
│       │   ├── SearchInput
│       │   └── StatusFilter
│       └── StudentAttendanceGrid
│           └── StudentAttendanceCard[]
│               ├── StudentInfo (avatar, name, ID)
│               └── StatusSelector (Present/Absent/Sick/Leave buttons)
```

## Data Models

### Frontend Data Structures

```typescript
// Class data (from API)
interface Class {
  id: string;
  name: string;
  session: "MORNING" | "AFTERNOON";
  major: string;
  semester: number;
  studentCount: number;
}

// Student data (from API)
interface Student {
  id: string;
  firstName: string;
  lastName: string;
  studentId: string;
  classSection: string;
  programs: string;
  semester: string;
  status: "ACTIVE" | "SICK";
}

// Attendance status enum
type AttendanceStatus = "PRESENT" | "ABSENT" | "SICK" | "LEAVE" | "NOT_MARKED";

// Attendance record (frontend state)
interface AttendanceRecord {
  studentId: string;
  status: AttendanceStatus;
  markedAt: Date;
}

// Attendance state for a specific class and date
interface AttendanceState {
  classId: string;
  date: Date;
  records: Map<string, AttendanceRecord>; // studentId -> AttendanceRecord
}

// Display student with attendance
interface StudentWithAttendance {
  id: string;
  studentId: string;
  name: string;
  status: AttendanceStatus;
}
```

## Visual Design System

### Color Palette

Following the All Classes page design:

```typescript
const colors = {
  // Primary (from All Classes)
  primary: {
    orange: "#EA580C",    // orange-600
    amber: "#D97706",     // amber-600
  },
  
  // Statistics Cards Gradients
  statistics: {
    total: "from-orange-50 via-orange-100 to-amber-50",
    present: "from-green-50 via-green-100 to-emerald-50",
    absent: "from-red-50 via-red-100 to-rose-50",
    sick: "from-amber-50 via-amber-100 to-yellow-50",
    leave: "from-cyan-50 via-cyan-100 to-blue-50",
    notMarked: "from-slate-50 via-slate-100 to-gray-50",
  },
  
  // Attendance Status Colors
  status: {
    present: "#10B981",   // emerald-500
    absent: "#EF4444",    // red-500
    sick: "#F59E0B",      // amber-500
    leave: "#06B6D4",     // cyan-500
    notMarked: "#CBD5E1", // slate-300
  },
  
  // Button Gradients
  buttons: {
    primary: "from-orange-600 to-amber-600",
    success: "from-green-600 to-emerald-600",
    danger: "from-red-600 to-rose-600",
  },
};
```

### Typography

```typescript
const typography = {
  pageTitle: "text-3xl font-bold text-slate-900",
  pageSubtitle: "text-slate-600",
  cardTitle: "text-2xl font-bold text-slate-900",
  statLabel: "text-sm font-semibold uppercase tracking-wide",
  statValue: "text-4xl font-bold",
  studentName: "text-lg font-semibold text-slate-900",
  studentId: "text-sm text-slate-500",
  badgeText: "text-xs font-medium",
};
```

### Spacing and Layout

```typescript
const spacing = {
  pageContainer: "p-6 md:p-8",
  cardPadding: "p-6",
  cardGap: "gap-6",
  gridGap: "gap-4 md:gap-6",
  sectionMargin: "mb-6 md:mb-8",
};

const layout = {
  statisticsGrid: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6",
  classGrid: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",
  studentGrid: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4",
};
```

## Component Designs

### 1. Class Selection View

#### Statistics Cards
```tsx
<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
  {/* Total Classes */}
  <Card className="rounded-2xl shadow-lg border-orange-200 bg-gradient-to-br from-orange-50 via-orange-100 to-amber-50">
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-orange-600 mb-2 uppercase tracking-wide">
            Total Classes
          </p>
          <p className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
            {totalClasses}
          </p>
        </div>
        <div className="p-3.5 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl shadow-lg">
          <GraduationCap className="h-7 w-7 text-white" />
        </div>
      </div>
    </CardContent>
  </Card>
  
  {/* Similar cards for Morning Classes and Afternoon Classes */}
</div>
```

#### Class Card
```tsx
<Card className="rounded-2xl shadow-lg border-orange-200 hover:shadow-xl transition-all duration-200 cursor-pointer group">
  <CardContent className="p-6">
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-200">
          <GraduationCap className="h-6 w-6 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-slate-900">{className}</h3>
          <p className="text-sm text-slate-600">{major} • Semester {semester}</p>
        </div>
      </div>
      <Badge className={sessionBadgeClass}>
        {session === "MORNING" ? <Sun className="h-3 w-3 mr-1" /> : <Moon className="h-3 w-3 mr-1" />}
        {session}
      </Badge>
    </div>
    
    <div className="flex items-center justify-between text-sm">
      <div className="flex items-center gap-2 text-slate-600">
        <Users className="h-4 w-4" />
        <span>{studentCount} Students</span>
      </div>
      <Button variant="ghost" size="sm" className="text-orange-600 hover:text-orange-700">
        Mark Attendance →
      </Button>
    </div>
  </CardContent>
</Card>
```

### 2. Attendance Marking View

#### Date Selector
```tsx
<Card className="rounded-2xl shadow-md border-slate-200 mb-6">
  <CardContent className="p-6">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePreviousDay}
          className="border-slate-300 hover:bg-slate-50"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>
        
        <div className="flex items-center gap-3">
          <Calendar className="h-5 w-5 text-orange-600" />
          <div>
            <p className="text-sm text-slate-600">Marking attendance for</p>
            <p className="text-lg font-bold text-slate-900">
              {format(selectedDate, "EEEE, MMMM dd, yyyy")}
            </p>
          </div>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleNextDay}
          disabled={isToday}
          className="border-slate-300 hover:bg-slate-50"
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      
      <Button
        variant="outline"
        onClick={() => setShowDatePicker(true)}
        className="border-orange-300 text-orange-600 hover:bg-orange-50"
      >
        <CalendarIcon className="h-4 w-4 mr-2" />
        Change Date
      </Button>
    </div>
  </CardContent>
</Card>
```

#### Statistics Cards (Attendance Summary)
```tsx
<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
  {/* Total Students */}
  <Card className="rounded-xl shadow-md border-slate-200 bg-gradient-to-br from-orange-50 to-orange-100/50">
    <CardContent className="p-4">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-orange-600 rounded-lg">
          <Users className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="text-xs font-medium text-orange-600">Total</p>
          <p className="text-2xl font-bold text-orange-700">{totalStudents}</p>
        </div>
      </div>
    </CardContent>
  </Card>
  
  {/* Present */}
  <Card className="rounded-xl shadow-md border-slate-200 bg-gradient-to-br from-green-50 to-green-100/50">
    <CardContent className="p-4">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-green-600 rounded-lg">
          <CheckCircle className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="text-xs font-medium text-green-600">Present</p>
          <p className="text-2xl font-bold text-green-700">{presentCount}</p>
        </div>
      </div>
    </CardContent>
  </Card>
  
  {/* Similar cards for Absent, Sick, Leave, Not Marked */}
</div>
```

#### Student Attendance Card
```tsx
<Card className="rounded-xl shadow-md border-slate-200 hover:shadow-lg transition-all duration-200">
  <CardContent className="p-4">
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 bg-gradient-to-br from-orange-500 to-amber-500 rounded-full flex items-center justify-center">
          <User className="h-5 w-5 text-white" />
        </div>
        <div>
          <h4 className="font-semibold text-slate-900">{studentName}</h4>
          <p className="text-xs text-slate-500">{studentId}</p>
        </div>
      </div>
      
      <Badge className={getStatusBadgeClass(status)}>
        {getStatusIcon(status)}
        {status}
      </Badge>
    </div>
    
    <div className="grid grid-cols-2 gap-2">
      <Button
        size="sm"
        onClick={() => handleStatusChange("PRESENT")}
        className={cn(
          "h-10 rounded-lg transition-all duration-200",
          status === "PRESENT"
            ? "bg-green-600 text-white hover:bg-green-700"
            : "bg-green-50 text-green-700 hover:bg-green-100 border border-green-200"
        )}
      >
        <CheckCircle className="h-4 w-4 mr-1" />
        Present
      </Button>
      
      <Button
        size="sm"
        onClick={() => handleStatusChange("ABSENT")}
        className={cn(
          "h-10 rounded-lg transition-all duration-200",
          status === "ABSENT"
            ? "bg-red-600 text-white hover:bg-red-700"
            : "bg-red-50 text-red-700 hover:bg-red-100 border border-red-200"
        )}
      >
        <XCircle className="h-4 w-4 mr-1" />
        Absent
      </Button>
      
      <Button
        size="sm"
        onClick={() => handleStatusChange("SICK")}
        className={cn(
          "h-10 rounded-lg transition-all duration-200",
          status === "SICK"
            ? "bg-amber-600 text-white hover:bg-amber-700"
            : "bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200"
        )}
      >
        <Heart className="h-4 w-4 mr-1" />
        Sick
      </Button>
      
      <Button
        size="sm"
        onClick={() => handleStatusChange("LEAVE")}
        className={cn(
          "h-10 rounded-lg transition-all duration-200",
          status === "LEAVE"
            ? "bg-cyan-600 text-white hover:bg-cyan-700"
            : "bg-cyan-50 text-cyan-700 hover:bg-cyan-100 border border-cyan-200"
        )}
      >
        <Calendar className="h-4 w-4 mr-1" />
        Leave
      </Button>
    </div>
  </CardContent>
</Card>
```

#### Bulk Actions Bar
```tsx
<Card className="rounded-2xl shadow-md border-slate-200 mb-6">
  <CardContent className="p-4">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Zap className="h-5 w-5 text-orange-600" />
        <span className="font-semibold text-slate-900">Quick Actions</span>
      </div>
      
      <div className="flex items-center gap-3">
        <Button
          onClick={handleMarkAllPresent}
          className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <CheckCircle className="h-4 w-4 mr-2" />
          Mark All Present
        </Button>
        
        <Button
          variant="outline"
          onClick={handleResetAll}
          className="border-slate-300 text-slate-700 hover:bg-slate-50"
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset All
        </Button>
      </div>
    </div>
  </CardContent>
</Card>
```

## State Management

### React State Structure

```typescript
// Class selection page
const [classes, setClasses] = useState<Class[]>([]);
const [searchQuery, setSearchQuery] = useState("");
const [sessionFilter, setSessionFilter] = useState<"ALL" | "MORNING" | "AFTERNOON">("ALL");
const [loading, setLoading] = useState(true);

// Attendance marking page
const [students, setStudents] = useState<Student[]>([]);
const [selectedDate, setSelectedDate] = useState(new Date());
const [attendanceRecords, setAttendanceRecords] = useState<Map<string, AttendanceRecord>>(new Map());
const [searchQuery, setSearchQuery] = useState("");
const [statusFilter, setStatusFilter] = useState<AttendanceStatus | "ALL">("ALL");
const [loading, setLoading] = useState(true);
```

### State Update Functions

```typescript
// Mark individual student attendance
const handleStatusChange = useCallback((studentId: string, status: AttendanceStatus) => {
  setAttendanceRecords(prev => {
    const newRecords = new Map(prev);
    newRecords.set(studentId, {
      studentId,
      status,
      markedAt: new Date(),
    });
    return newRecords;
  });
  
  // Show success toast
  toast.success("Attendance marked", {
    description: `Status updated to ${status}`,
    className: "bg-green-50 border-green-200 text-green-900",
  });
}, []);

// Mark all students as present
const handleMarkAllPresent = useCallback(() => {
  const newRecords = new Map<string, AttendanceRecord>();
  students.forEach(student => {
    newRecords.set(student.id, {
      studentId: student.id,
      status: "PRESENT",
      markedAt: new Date(),
    });
  });
  setAttendanceRecords(newRecords);
  
  toast.success("All students marked present", {
    description: `${students.length} students marked as present`,
    className: "bg-green-50 border-green-200 text-green-900",
  });
}, [students]);

// Reset all attendance
const handleResetAll = useCallback(() => {
  setAttendanceRecords(new Map());
  toast.info("Attendance reset", {
    description: "All attendance records cleared",
  });
}, []);
```

## Animation Patterns

### Page Load Animations

```typescript
// Staggered fade-in for cards
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: index * 0.05,
      duration: 0.3,
    },
  }),
};

// Usage
<motion.div
  custom={index}
  initial="hidden"
  animate="visible"
  variants={cardVariants}
>
  <StudentAttendanceCard />
</motion.div>
```

### Status Change Animation

```typescript
// Smooth color transition on status change
const statusButtonClass = cn(
  "transition-all duration-300 ease-in-out",
  "hover:scale-105 active:scale-95",
  isSelected && "ring-2 ring-offset-2"
);
```

### Statistics Counter Animation

```typescript
// Animated number counting
import { useSpring, animated } from '@react-spring/web';

const AnimatedNumber = ({ value }: { value: number }) => {
  const props = useSpring({
    from: { number: 0 },
    to: { number: value },
    config: { duration: 500 },
  });
  
  return <animated.span>{props.number.to(n => n.toFixed(0))}</animated.span>;
};
```

## Responsive Design

### Breakpoints

```typescript
const breakpoints = {
  mobile: "< 768px",    // Single column
  tablet: "768px - 1024px",  // Two columns
  desktop: "> 1024px",  // Three columns
};
```

### Responsive Grid Classes

```typescript
// Class grid
"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"

// Statistics grid
"grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"

// Student grid
"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
```

## Empty States

### No Classes Available

```tsx
<Card className="rounded-2xl shadow-md border-slate-200">
  <CardContent className="p-12 text-center">
    <div className="p-4 bg-gradient-to-br from-orange-100 to-amber-100 w-fit mx-auto rounded-2xl mb-4">
      <BookOpen className="h-16 w-16 text-orange-600" />
    </div>
    <h3 className="text-2xl font-bold text-slate-900 mb-2">
      No Classes Available
    </h3>
    <p className="text-slate-600 mb-6 max-w-md mx-auto">
      Create classes first to start marking attendance
    </p>
    <Button
      onClick={() => router.push("/dashboard/all-classes")}
      className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700"
    >
      <Plus className="h-5 w-5 mr-2" />
      Go to All Classes
    </Button>
  </CardContent>
</Card>
```

### No Students Enrolled

```tsx
<Card className="rounded-2xl shadow-md border-slate-200">
  <CardContent className="p-12 text-center">
    <div className="p-4 bg-gradient-to-br from-blue-100 to-cyan-100 w-fit mx-auto rounded-2xl mb-4">
      <Users className="h-16 w-16 text-blue-600" />
    </div>
    <h3 className="text-2xl font-bold text-slate-900 mb-2">
      No Students Enrolled
    </h3>
    <p className="text-slate-600 mb-6 max-w-md mx-auto">
      Add students to this class to mark attendance
    </p>
    <Button
      onClick={() => router.push("/dashboard/students")}
      className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
    >
      <Plus className="h-5 w-5 mr-2" />
      Go to Students
    </Button>
  </CardContent>
</Card>
```

## Future Backend Integration Points

### API Endpoints (to be implemented)

```typescript
// Fetch classes
GET /api/classes
Response: Class[]

// Fetch students for a class
GET /api/classes/[classId]/students
Response: Student[]

// Fetch attendance for a class and date
GET /api/attendance?classId={id}&date={date}
Response: AttendanceRecord[]

// Save attendance (bulk)
POST /api/attendance
Body: {
  classId: string;
  date: string;
  records: AttendanceRecord[];
}
Response: { success: boolean; message: string }

// Update single attendance
PUT /api/attendance/[recordId]
Body: { status: AttendanceStatus }
Response: AttendanceRecord
```

### Integration Strategy

1. Replace mock data fetching with API calls
2. Add loading states during API requests
3. Implement error handling for failed requests
4. Add optimistic updates for better UX
5. Implement auto-save functionality
6. Add conflict resolution for concurrent edits

## Performance Considerations

### Optimization Strategies

1. **Lazy Loading**: Load student data only when needed
2. **Memoization**: Use `useMemo` for filtered/computed data
3. **Debouncing**: Debounce search input to reduce re-renders
4. **Virtual Scrolling**: Implement for classes with 100+ students
5. **Code Splitting**: Lazy load date picker and dialogs
6. **Image Optimization**: Use Next.js Image component for avatars

### Example Memoization

```typescript
const filteredStudents = useMemo(() => {
  return students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || 
      (attendanceRecords.get(student.id)?.status || "NOT_MARKED") === statusFilter;
    return matchesSearch && matchesStatus;
  });
}, [students, searchQuery, statusFilter, attendanceRecords]);
```

## Accessibility

### ARIA Labels and Roles

```tsx
<Button
  aria-label={`Mark ${studentName} as present`}
  role="button"
  onClick={() => handleStatusChange("PRESENT")}
>
  Present
</Button>

<div role="status" aria-live="polite">
  {presentCount} students marked present
</div>
```

### Keyboard Navigation

- Tab through all interactive elements
- Enter/Space to activate buttons
- Arrow keys for date navigation
- Escape to close dialogs

### Focus Management

```typescript
// Focus first student card on page load
useEffect(() => {
  const firstCard = document.querySelector('[data-student-card]');
  if (firstCard instanceof HTMLElement) {
    firstCard.focus();
  }
}, []);
```

## Testing Strategy

### Unit Tests

- Test status change logic
- Test bulk actions
- Test filtering and search
- Test date navigation

### Integration Tests

- Test class selection flow
- Test attendance marking flow
- Test navigation between views

### E2E Tests

- Test complete attendance marking workflow
- Test responsive behavior
- Test error states
