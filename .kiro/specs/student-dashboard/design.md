# Student Dashboard Design Document

## Overview

The Student Dashboard is a modern, visually stunning React-based web application that provides students with a personalized view of their attendance records and academic status. The design emphasizes smooth animations, gradient backgrounds, borderless cards with shadows, and an engaging user experience that matches the quality of the existing login page. The interface is built using Next.js 14 with App Router, TypeScript, Tailwind CSS, and Framer Motion for animations.

### Design Principles

1. **Sophisticated Color Schema**: Use a cohesive color palette with strategic gradient accents, not overwhelming gradients everywhere
2. **Borderless with Shadows**: All cards use `border-0` with subtle shadow-based depth for modern, clean look
3. **Smooth Micro Animations**: Subtle, purposeful animations that enhance UX without being distracting
4. **Fully Responsive**: Mobile-first approach with seamless adaptation across all screen sizes
5. **Proper Icon Treatment**: Icons sized appropriately (20-24px standard) with optional gradient containers only where it makes sense
6. **Thoughtful Hover States**: Smooth transitions on interactive elements without excessive effects

### What We DON'T Do

❌ **NO Shadcn default outline buttons** - They look generic and don't fit our design
❌ **NO borders on cards** - Always use `border-0` with shadows for depth
❌ **NO plain borders anywhere** - Use shadows and background colors for separation
❌ **NO unsized or improperly sized icons** - Always specify width/height
❌ **NO missing hover effects** - Every interactive element needs smooth transitions
❌ **NO excessive gradients** - Use strategically, not everywhere

## Architecture

### Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom gradient utilities
- **Animation**: Framer Motion
- **UI Components**: Custom components (NO Shadcn default variants)
- **State Management**: React Server Components + Client Components with hooks
- **Data Fetching**: Server Actions and API Routes
- **Authentication**: NextAuth.js with JWT tokens
- **File Upload**: React Dropzone with client-side validation

### Project Structure

```
src/
├── app/
│   ├── dashboard/
│   │   ├── page.tsx                 # Main dashboard page (Server Component)
│   │   ├── loading.tsx              # Loading skeleton
│   │   └── error.tsx                # Error boundary
│   ├── api/
│   │   ├── attendance/
│   │   │   └── route.ts             # Attendance data API
│   │   └── upload/
│   │       └── route.ts             # File upload API
│   └── layout.tsx
├── components/
│   ├── dashboard/
│   │   ├── WelcomeSection.tsx       # Personalized greeting
│   │   ├── StatsCards.tsx           # Metric cards grid
│   │   ├── StatusAlerts.tsx         # Warning banners
│   │   ├── WeeklyCalendar.tsx       # Calendar view
│   │   ├── ProgressChart.tsx        # Circular progress ring
│   │   ├── RecentActivity.tsx       # Timeline list
│   │   └── CertificateUpload.tsx    # File upload interface
│   ├── ui/
│   │   ├── Button.tsx               # Custom button (NO outline variant)
│   │   ├── Card.tsx                 # Borderless card with shadows
│   │   ├── IconContainer.tsx        # Gradient icon wrapper
│   │   ├── ProgressRing.tsx         # Animated circular progress
│   │   └── Skeleton.tsx             # Loading skeletons
│   └── animations/
│       ├── FadeIn.tsx               # Fade entrance animation
│       ├── StaggerChildren.tsx      # Staggered list animation
│       └── CountUp.tsx              # Number count-up animation
├── lib/
│   ├── types.ts                     # TypeScript interfaces
│   ├── api.ts                       # API client functions
│   ├── utils.ts                     # Utility functions
│   └── constants.ts                 # Color schemes and thresholds
└── hooks/
    ├── useAttendance.ts             # Attendance data hook
    └── useFileUpload.ts             # File upload hook
```

## Components and Interfaces

### 1. Core Data Types

```typescript
// lib/types.ts

export interface Student {
  id: string;
  name: string;
  studentNumber: string;
  email: string;
}

export type AttendanceStatus = 'present' | 'absent' | 'sick' | 'leave';

export interface AttendanceRecord {
  id: string;
  date: string;
  dayOfWeek: string;
  status: AttendanceStatus;
  courseName: string;
  period: number;
  notes?: string;
}

export interface AttendanceStats {
  totalDays: number;
  presentDays: number;
  absentDays: number;
  sickDays: number;
  leaveDays: number;
  attendancePercentage: number;
  pureAbsenceHours: number;
  combinedAbsenceHours: number;
}

export interface AcademicStatus {
  isDisqualified: boolean;        // محروم
  needsCertification: boolean;    // تصدیق طلب
  disqualificationThreshold: number;
  certificationThreshold: number;
}

export interface WeekData {
  weekNumber: number;
  startDate: string;
  endDate: string;
  days: DayAttendance[];
}

export interface DayAttendance {
  date: string;
  dayName: string;
  status: AttendanceStatus | 'future';
  sessions: SessionAttendance[];
}

export interface SessionAttendance {
  period: number;
  courseName: string;
  status: AttendanceStatus;
}

export interface UploadedFile {
  id: string;
  fileName: string;
  fileSize: number;
  uploadDate: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
}
```

### 2. UI Component: Custom Button

```typescript
// components/ui/Button.tsx

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  loading?: boolean;
}

// Design Implementation:
// ✅ Primary: Solid blue background with white text
//    className="bg-blue-500 text-white border-0 shadow-md hover:bg-blue-600 hover:shadow-lg transition-all duration-200"
//
// ✅ Secondary: Solid violet background with white text
//    className="bg-violet-500 text-white border-0 shadow-md hover:bg-violet-600 hover:shadow-lg transition-all duration-200"
//
// ✅ Ghost: Transparent with colored text, subtle hover background
//    className="bg-transparent text-blue-600 border-0 hover:bg-blue-50 transition-all duration-200"
//
// ❌ NO outline variant - we don't use borders
// ✅ Always includes smooth hover transition
// ✅ Proper icon sizing: w-5 h-5 (20px) for md, w-4 h-4 (16px) for sm
```

### 3. UI Component: Card

```typescript
// components/ui/Card.tsx

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'flat';
  hover?: boolean;
  className?: string;
}

// Design Implementation:
// ✅ Default: White background with subtle shadow
//    className="bg-white border-0 shadow-sm rounded-xl p-6"
//
// ✅ Elevated: White background with more prominent shadow
//    className="bg-white border-0 shadow-md rounded-xl p-6"
//
// ✅ Flat: White background, no shadow (for nested cards)
//    className="bg-white border-0 rounded-xl p-6"
//
// ✅ Hover effect (when hover=true):
//    className="transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
//
// ❌ NEVER use border classes (except border-0 to reset)
// ✅ Always use shadows for depth
// ✅ Smooth micro animation on hover
// ✅ Responsive padding: p-4 md:p-6
```

### 4. UI Component: Icon (Properly Sized)

```typescript
// components/ui/Icon.tsx

interface IconProps {
  icon: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  withBackground?: boolean;
  backgroundColor?: string;
}

// Design Implementation:
// ✅ Standard sizes:
//    sm: w-4 h-4 (16px)
//    md: w-5 h-5 (20px) - default for most UI
//    lg: w-6 h-6 (24px)
//
// ✅ With background (optional, use sparingly):
//    className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center"
//    Icon inside: w-5 h-5 text-blue-600
//
// ✅ Hover effect (for interactive icons):
//    className="transition-transform duration-200 hover:scale-110"
//
// ❌ NO gradient containers everywhere - use solid colors
// ✅ Always specify exact width and height
// ✅ Use semantic colors from STATUS_COLORS or BRAND_COLORS
```

### 5. Dashboard Component: WelcomeSection

```typescript
// components/dashboard/WelcomeSection.tsx

interface WelcomeSectionProps {
  student: Student;
  currentTime: string;
}

// Design:
// - Full-width gradient background (purple to blue)
// - Animated greeting text with fade-in
// - Student name with gradient text effect
// - Current date/time display
// - Decorative animated shapes in background
```

### 6. Dashboard Component: StatsCards

```typescript
// components/dashboard/StatsCards.tsx

interface StatsCardsProps {
  stats: AttendanceStats;
}

// Design Implementation:
// ✅ Fully responsive grid:
//    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6"
//
// ✅ Each card structure:
//    - White background with colored accent
//    - className="bg-white border-0 shadow-sm rounded-xl p-6"
//    - Left border accent: border-l-4 border-{color}-500
//    - Icon: w-12 h-12 rounded-lg bg-{color}-100 with w-6 h-6 icon inside
//    - Number: Large, bold, with count-up animation
//    - Label: text-sm text-slate-600
//
// ✅ Status colors:
//    - Present: emerald (green)
//    - Absent: red
//    - Sick: amber (orange)
//    - Leave: cyan (blue)
//
// ✅ Smooth hover effect:
//    className="transition-all duration-300 hover:shadow-md hover:-translate-y-1"
//
// ✅ Staggered entrance animation:
//    Framer Motion with staggerChildren: 0.1
//
// ❌ NO gradient backgrounds on every card
// ❌ NO colored shadows (too much)
// ✅ Clean, professional look with subtle accents
```

### 7. Dashboard Component: StatusAlerts

```typescript
// components/dashboard/StatusAlerts.tsx

interface StatusAlertsProps {
  status: AcademicStatus;
  stats: AttendanceStats;
}

// Design:
// - Disqualification Alert (محروم):
//   - Red gradient background with red shadow
//   - Animated warning icon with shake effect
//   - Progress bar showing hours vs threshold
//   - Bold warning text
// - Certification Alert (تصدیق طلب):
//   - Amber gradient background with amber shadow
//   - Animated document icon with pulse
//   - Call-to-action button to upload section
//   - Progress bar with certification status
// - Both: borderless, shadow-lg, rounded-2xl
```

### 8. Dashboard Component: WeeklyCalendar

```typescript
// components/dashboard/WeeklyCalendar.tsx

interface WeeklyCalendarProps {
  weekData: WeekData;
  onWeekChange: (direction: 'prev' | 'next') => void;
}

// Design:
// - Header: Week range with navigation buttons
// - Grid: 7 columns on desktop, 2 on mobile
// - Day Cards:
//   - Borderless with shadow-md
//   - Gradient background based on status:
//     - Present: green gradient
//     - Absent: red gradient
//     - Sick: amber gradient
//     - Leave: cyan gradient
//     - Future: slate gradient
//   - Day name and date
//   - Session indicators (colored dots)
//   - Hover: scale-105 + shadow-lg
// - Staggered entrance (100ms delay per card)
// - Navigation buttons: gradient with icons
```

### 9. Dashboard Component: ProgressChart

```typescript
// components/dashboard/ProgressChart.tsx

interface ProgressChartProps {
  stats: AttendanceStats;
}

// Design:
// - Circular Progress Ring:
//   - SVG-based with gradient stroke
//   - Animated from 0 to percentage (1.5s)
//   - Center: Large percentage with gradient text
//   - Size: 200px diameter
// - Breakdown Bars:
//   - Horizontal bars for each status
//   - Gradient fills matching status colors
//   - Animated width transition (300ms delay after ring)
//   - Labels with icons in gradient containers
// - Container: borderless card with shadow-lg
```

### 10. Dashboard Component: RecentActivity

```typescript
// components/dashboard/RecentActivity.tsx

interface RecentActivityProps {
  records: AttendanceRecord[];
}

// Design:
// - List of recent 10 records
// - Each item:
//   - Borderless with hover background transition
//   - Status icon in gradient container (32px)
//   - Course name and date
//   - Status badge with colored background
//   - Hover: bg-slate-50 + icon rotate-12
// - Staggered entrance (100ms delay)
// - "View Full History" button:
//   - Gradient background
//   - Shadow-md with colored shadow
//   - Hover: scale-105
```

### 11. Dashboard Component: CertificateUpload

```typescript
// components/dashboard/CertificateUpload.tsx

interface CertificateUploadProps {
  files: UploadedFile[];
  onUpload: (file: File) => Promise<void>;
  onDelete: (fileId: string) => Promise<void>;
}

// Design:
// - Drag-and-drop zone:
//   - Dashed border (only exception to borderless rule)
//   - Gradient background on hover
//   - Upload icon in gradient container
//   - File type and size limits displayed
// - File list:
//   - Each file: borderless card with shadow-md
//   - File icon, name, size, date
//   - Status badge (pending/approved/rejected)
//   - Preview and delete buttons with hover effects
// - Upload progress: animated progress bar
```

## Data Models

### API Response Structures

```typescript
// GET /api/attendance
export interface AttendanceResponse {
  student: Student;
  stats: AttendanceStats;
  status: AcademicStatus;
  weekData: WeekData;
  recentRecords: AttendanceRecord[];
  uploadedFiles: UploadedFile[];
}

// POST /api/upload
export interface UploadRequest {
  file: File;
  studentId: string;
}

export interface UploadResponse {
  success: boolean;
  file?: UploadedFile;
  error?: string;
}
```

### Database Schema (Reference)

```sql
-- Students table
CREATE TABLE students (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  student_number VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Attendance records table
CREATE TABLE attendance_records (
  id UUID PRIMARY KEY,
  student_id UUID REFERENCES students(id),
  date DATE NOT NULL,
  course_name VARCHAR(255) NOT NULL,
  period INTEGER NOT NULL,
  status VARCHAR(20) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Medical certificates table
CREATE TABLE medical_certificates (
  id UUID PRIMARY KEY,
  student_id UUID REFERENCES students(id),
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_size INTEGER NOT NULL,
  upload_date TIMESTAMP DEFAULT NOW(),
  status VARCHAR(20) DEFAULT 'pending',
  rejection_reason TEXT,
  reviewed_at TIMESTAMP,
  reviewed_by UUID
);
```

## Error Handling

### Error States

1. **Authentication Error**
   - Redirect to login page
   - Display "Session expired" message
   - Clear local storage

2. **Authorization Error**
   - Show permission denied card
   - Display "You don't have access to this data"
   - Provide contact support button

3. **Network Error**
   - Show error card with retry button
   - Display "Unable to load data"
   - Implement exponential backoff for retries

4. **Data Not Found**
   - Show empty state card
   - Display "No attendance records yet"
   - Provide helpful message

5. **File Upload Error**
   - Show inline error message
   - Display specific error (file too large, invalid type)
   - Allow user to try again

### Error Component Design

```typescript
// components/ui/ErrorState.tsx

interface ErrorStateProps {
  title: string;
  message: string;
  onRetry?: () => void;
}

// Design:
// - Borderless card with shadow-lg
// - Error icon in red gradient container
// - Clear error message
// - Retry button with gradient background
// - Hover effects on button
```

## Testing Strategy

### Unit Tests

1. **Component Tests**
   - Test each dashboard component renders correctly
   - Verify props are handled properly
   - Test conditional rendering based on data
   - Verify accessibility attributes

2. **Hook Tests**
   - Test useAttendance data fetching
   - Test useFileUpload file validation
   - Verify error handling in hooks
   - Test loading states

3. **Utility Tests**
   - Test date formatting functions
   - Test percentage calculations
   - Test status determination logic
   - Test file validation functions

### Integration Tests

1. **Dashboard Flow**
   - Test complete dashboard rendering with mock data
   - Verify all components receive correct props
   - Test navigation between weeks
   - Test file upload flow

2. **API Integration**
   - Test API route handlers
   - Verify authentication middleware
   - Test error responses
   - Test file upload endpoint

### E2E Tests

1. **User Flows**
   - Login and view dashboard
   - Navigate weekly calendar
   - Upload medical certificate
   - View recent activity

2. **Responsive Design**
   - Test mobile layout
   - Test tablet layout
   - Test desktop layout
   - Test touch interactions

### Accessibility Tests

1. **Automated Tests**
   - Run axe-core on all pages
   - Verify ARIA labels
   - Test keyboard navigation
   - Check color contrast ratios

2. **Manual Tests**
   - Test with screen reader
   - Test keyboard-only navigation
   - Test with reduced motion preference
   - Test with high contrast mode

## Smooth Micro Animations

### Entrance Animations (Subtle)

```typescript
// Fade In - smooth and subtle
const fadeIn = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: "easeOut" }
};

// Stagger Children - creates flow
const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.08  // Subtle 80ms delay
    }
  }
};

// Slide In - for cards and panels
const slideIn = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.4, ease: "easeOut" }
};
```

### Hover Effects (Smooth Transitions)

```typescript
// Card Hover - subtle lift
className="transition-all duration-300 ease-out hover:shadow-lg hover:-translate-y-1"

// Button Hover - gentle feedback
className="transition-all duration-200 ease-out hover:shadow-md hover:brightness-110"

// Icon Hover - minimal scale
className="transition-transform duration-200 ease-out hover:scale-110"

// Link Hover - color transition
className="transition-colors duration-200 ease-out hover:text-blue-600"
```

### Progress Animations (Smooth)

```typescript
// Count Up Numbers - smooth increment
<CountUp 
  end={value} 
  duration={1.2}
  easingFn={(t, b, c, d) => c * t / d + b}  // Linear easing
/>

// Progress Ring - smooth draw
<motion.circle
  strokeDashoffset={circumference - (percentage / 100) * circumference}
  initial={{ strokeDashoffset: circumference }}
  animate={{ strokeDashoffset: circumference - (percentage / 100) * circumference }}
  transition={{ duration: 1.2, ease: "easeInOut" }}
/>

// Progress Bar - smooth width transition
<motion.div
  initial={{ width: 0 }}
  animate={{ width: `${percentage}%` }}
  transition={{ duration: 0.8, ease: "easeOut" }}
/>

// Skeleton Loading - subtle shimmer
className="animate-pulse bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 bg-[length:200%_100%]"
```

### Loading States

```typescript
// Spinner - smooth rotation
className="animate-spin w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full"

// Pulse - subtle breathing effect
className="animate-pulse"

// Shimmer - smooth shine effect
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
```

## Styling Guidelines

### Color Schema

```typescript
// lib/constants.ts

// Primary brand colors - use consistently throughout
export const BRAND_COLORS = {
  primary: {
    main: '#3B82F6',      // blue-500
    light: '#60A5FA',     // blue-400
    dark: '#2563EB',      // blue-600
    bg: '#EFF6FF'         // blue-50
  },
  secondary: {
    main: '#8B5CF6',      // violet-500
    light: '#A78BFA',     // violet-400
    dark: '#7C3AED',      // violet-600
    bg: '#F5F3FF'         // violet-50
  }
};

// Status colors - semantic and accessible
export const STATUS_COLORS = {
  present: {
    main: '#10B981',      // emerald-500
    light: '#34D399',     // emerald-400
    bg: '#D1FAE5',        // emerald-100
    text: '#065F46',      // emerald-800
    shadow: 'shadow-emerald-500/20'
  },
  absent: {
    main: '#EF4444',      // red-500
    light: '#F87171',     // red-400
    bg: '#FEE2E2',        // red-100
    text: '#991B1B',      // red-800
    shadow: 'shadow-red-500/20'
  },
  sick: {
    main: '#F59E0B',      // amber-500
    light: '#FBBF24',     // amber-400
    bg: '#FEF3C7',        // amber-100
    text: '#92400E',      // amber-800
    shadow: 'shadow-amber-500/20'
  },
  leave: {
    main: '#06B6D4',      // cyan-500
    light: '#22D3EE',     // cyan-400
    bg: '#CFFAFE',        // cyan-100
    text: '#164E63',      // cyan-900
    shadow: 'shadow-cyan-500/20'
  }
};

// Neutral colors for backgrounds and text
export const NEUTRAL_COLORS = {
  background: '#F8FAFC',  // slate-50
  surface: '#FFFFFF',     // white
  border: '#E2E8F0',      // slate-200 (use sparingly, prefer shadows)
  text: {
    primary: '#0F172A',   // slate-900
    secondary: '#475569', // slate-600
    tertiary: '#94A3B8'   // slate-400
  }
};

// Use gradients sparingly - only for hero sections and key CTAs
export const GRADIENT_ACCENTS = {
  hero: 'bg-gradient-to-br from-blue-500 via-violet-500 to-purple-600',
  cta: 'bg-gradient-to-r from-blue-500 to-violet-500',
  subtle: 'bg-gradient-to-b from-white to-slate-50'
};
```

### Complete Responsive Design

```typescript
// Mobile-first approach - design for mobile, enhance for desktop

// Breakpoints
const breakpoints = {
  sm: '640px',   // Mobile landscape / Small tablet
  md: '768px',   // Tablet
  lg: '1024px',  // Desktop
  xl: '1280px',  // Large desktop
  '2xl': '1536px' // Extra large
};

// Responsive Grid Patterns
// ✅ Stats cards: 
//    Mobile: 1 column (full width)
//    Tablet: 2 columns
//    Desktop: 4 columns
//    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"

// ✅ Calendar: 
//    Mobile: 1 column (stacked days)
//    Tablet: 3-4 columns
//    Desktop: 7 columns (full week)
//    className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3"

// ✅ Two-column layout:
//    Mobile: Stacked (1 column)
//    Desktop: Side by side (2 columns)
//    className="grid grid-cols-1 lg:grid-cols-2 gap-6"

// Responsive Spacing
// ✅ Container padding:
//    className="px-4 sm:px-6 lg:px-8"

// ✅ Section spacing:
//    className="space-y-4 md:space-y-6 lg:space-y-8"

// ✅ Card padding:
//    className="p-4 md:p-6"

// Responsive Typography
// ✅ Headings scale with screen size:
//    h1: className="text-2xl sm:text-3xl lg:text-4xl font-bold"
//    h2: className="text-xl sm:text-2xl lg:text-3xl font-semibold"
//    h3: className="text-lg sm:text-xl lg:text-2xl font-semibold"
//    body: className="text-sm sm:text-base"

// Touch Targets (Mobile)
// ✅ Minimum 44x44px for all interactive elements:
//    className="min-h-[44px] min-w-[44px] sm:min-h-[40px] sm:min-w-[40px]"

// Responsive Images
// ✅ Use Next.js Image with responsive sizes:
//    <Image 
//      src="..." 
//      alt="..."
//      width={400}
//      height={300}
//      className="w-full h-auto"
//      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
//    />

// Hide/Show based on screen size
// ✅ Mobile only: className="block lg:hidden"
// ✅ Desktop only: className="hidden lg:block"
// ✅ Tablet and up: className="hidden md:block"
```

### Shadow System

```typescript
// All cards use shadows instead of borders
const shadows = {
  sm: 'shadow-sm',      // Subtle depth
  md: 'shadow-md',      // Standard cards
  lg: 'shadow-lg',      // Important cards
  xl: 'shadow-xl',      // Hover state
  colored: 'shadow-{color}-500/50' // Colored shadows for gradients
};

// NEVER use border classes except for upload zone dashed border
```

## Performance Optimization

### Code Splitting

```typescript
// Lazy load heavy components
const CertificateUpload = dynamic(() => import('@/components/dashboard/CertificateUpload'), {
  loading: () => <Skeleton className="h-64" />,
  ssr: false
});

const ProgressChart = dynamic(() => import('@/components/dashboard/ProgressChart'), {
  loading: () => <Skeleton className="h-80" />
});
```

### Image Optimization

```typescript
// Use Next.js Image component
import Image from 'next/image';

<Image
  src="/icons/attendance.svg"
  alt="Attendance"
  width={48}
  height={48}
  priority={false}
/>
```

### Animation Performance

```typescript
// Use transform and opacity for animations (GPU accelerated)
// Avoid animating: width, height, top, left, margin, padding

// Good
className="transition-transform duration-300 hover:scale-105"

// Bad
className="transition-all duration-300 hover:w-full"
```

## Security Considerations

### Authentication Flow

1. User logs in via NextAuth.js
2. JWT token stored in HTTP-only cookie
3. Token includes student ID and role
4. Every API request validates token
5. Student ID from token must match requested data

### File Upload Security

1. **Client-side validation**
   - File type: PDF, JPG, PNG only
   - File size: Maximum 5MB
   - File name sanitization

2. **Server-side validation**
   - Re-validate file type using magic numbers
   - Re-validate file size
   - Scan for malware (if available)
   - Generate unique file name
   - Store in secure location outside public directory

3. **Access control**
   - Only authenticated students can upload
   - Students can only view their own files
   - Admin approval required for certificate acceptance

### API Security

```typescript
// Middleware for authentication
export async function authMiddleware(req: Request) {
  const token = await getToken({ req });
  
  if (!token) {
    return new Response('Unauthorized', { status: 401 });
  }
  
  return token;
}

// Middleware for authorization
export async function authorizeStudent(req: Request, studentId: string) {
  const token = await authMiddleware(req);
  
  if (token.studentId !== studentId) {
    return new Response('Forbidden', { status: 403 });
  }
  
  return true;
}
```

## Accessibility Implementation

### Keyboard Navigation

```typescript
// All interactive elements must be keyboard accessible
<button
  className="..."
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleClick();
    }
  }}
  tabIndex={0}
>
  Click me
</button>

// Focus indicators
className="focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
```

### ARIA Labels

```typescript
// Status indicators
<div
  role="status"
  aria-label={`Attendance percentage: ${percentage}%`}
>
  {percentage}%
</div>

// Progress bars
<div
  role="progressbar"
  aria-valuenow={value}
  aria-valuemin={0}
  aria-valuemax={100}
  aria-label="Attendance progress"
>
  <div style={{ width: `${value}%` }} />
</div>

// Alerts
<div
  role="alert"
  aria-live="polite"
>
  You are approaching the absence threshold
</div>
```

### Reduced Motion

```typescript
// Respect user preference
const prefersReducedMotion = useReducedMotion();

<motion.div
  animate={prefersReducedMotion ? {} : { scale: 1.05 }}
  transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.3 }}
>
  Content
</motion.div>
```

## Mobile Considerations

### Touch Targets

```typescript
// Minimum 44x44px for touch targets
className="min-h-[44px] min-w-[44px]"

// Adequate spacing between interactive elements
className="space-y-4" // Minimum 16px vertical spacing
```

### Swipe Gestures

```typescript
// Use framer-motion for swipe detection
<motion.div
  drag="x"
  dragConstraints={{ left: 0, right: 0 }}
  onDragEnd={(e, { offset, velocity }) => {
    if (offset.x > 100) {
      handleSwipeRight();
    } else if (offset.x < -100) {
      handleSwipeLeft();
    }
  }}
>
  Calendar content
</motion.div>
```

### Responsive Typography

```typescript
// Scale text appropriately
const typography = {
  h1: 'text-3xl md:text-4xl lg:text-5xl',
  h2: 'text-2xl md:text-3xl lg:text-4xl',
  h3: 'text-xl md:text-2xl lg:text-3xl',
  body: 'text-base md:text-lg',
  small: 'text-sm md:text-base'
};
```

## Implementation Notes

### Critical Design Rules

#### What We DON'T Do ❌

1. ❌ **NO Shadcn default outline buttons**
   - They look generic and have borders
   - Use custom solid buttons instead

2. ❌ **NO borders on cards**
   - Never use border, border-2, etc.
   - Always use `border-0` to reset any default borders

3. ❌ **NO plain borders for separation**
   - Don't use border-t, border-b for dividers
   - Use shadows, background colors, or spacing instead

4. ❌ **NO unsized icons**
   - Never use icons without explicit w-{n} h-{n}
   - Don't use arbitrary sizes

5. ❌ **NO missing hover effects**
   - Every button, card, link needs transition
   - No instant state changes

6. ❌ **NO excessive gradients**
   - Don't put gradients on everything
   - Use strategically for accents only

#### What We DO ✅

1. ✅ **Use solid color buttons with shadows**
   ```tsx
   className="bg-blue-500 text-white border-0 shadow-md hover:bg-blue-600 hover:shadow-lg transition-all duration-200"
   ```

2. ✅ **Use border-0 with shadows on all cards**
   ```tsx
   className="bg-white border-0 shadow-sm rounded-xl hover:shadow-md transition-all duration-300"
   ```

3. ✅ **Use shadows and spacing for separation**
   ```tsx
   // Instead of border-t
   className="pt-4 mt-4 shadow-[0_-1px_0_0_rgb(226,232,240)]"
   // Or just use spacing
   className="mt-6"
   ```

4. ✅ **Always size icons properly**
   ```tsx
   // Standard UI icons
   <Icon className="w-5 h-5" />
   // Larger feature icons
   <Icon className="w-6 h-6" />
   // Icon in background container
   <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
     <Icon className="w-5 h-5 text-blue-600" />
   </div>
   ```

5. ✅ **Add smooth transitions to everything interactive**
   ```tsx
   // Cards
   className="transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
   // Buttons
   className="transition-all duration-200 hover:shadow-md"
   // Links
   className="transition-colors duration-200 hover:text-blue-600"
   // Icons
   className="transition-transform duration-200 hover:scale-110"
   ```

6. ✅ **Use good color schema with strategic accents**
   - Primary: Blue (#3B82F6)
   - Secondary: Violet (#8B5CF6)
   - Status colors: Emerald, Red, Amber, Cyan
   - Neutral: Slate shades for text and backgrounds
   - Gradients: Only for hero sections and key CTAs

7. ✅ **Ensure complete responsiveness**
   ```tsx
   // Mobile-first grid
   className="grid grid

### Development Workflow

1. Start with Server Components for initial render
2. Use Client Components for interactive elements
3. Implement skeleton loading states first
4. Add animations after functionality works
5. Test accessibility throughout development
6. Optimize performance before deployment

### Code Quality Standards

- TypeScript strict mode enabled
- ESLint with accessibility plugin
- Prettier for code formatting
- Husky for pre-commit hooks
- Jest for unit tests
- Playwright for E2E tests

