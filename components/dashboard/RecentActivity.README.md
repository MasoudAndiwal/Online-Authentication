# RecentActivity Component

A modern, animated component that displays the 10 most recent attendance records with smooth staggered entrance animations and interactive hover effects.

## Features

- ✅ Displays up to 10 most recent attendance records
- ✅ Borderless design with shadow-based depth
- ✅ Status icons in solid color containers (32px)
- ✅ Staggered entrance animation (100ms delay between items)
- ✅ Smooth hover effects (background transition + icon rotation)
- ✅ Gradient "View Full History" button with shadow
- ✅ Empty state handling
- ✅ Fully responsive design
- ✅ Accessible with ARIA labels

## Design Specifications

### Visual Design
- **Card**: White background, border-0, shadow-sm, rounded-xl
- **Icon Container**: 32px (w-8 h-8), solid color backgrounds
- **Status Colors**:
  - Present: Emerald (green)
  - Absent: Red
  - Sick: Amber (orange)
  - Leave: Cyan (blue)
- **Hover Effects**: 
  - Background: bg-slate-50
  - Icon: rotate-12 transform
- **Button**: Gradient background (blue to violet), shadow-md

### Animations
- **Entrance**: Staggered animation with 100ms delay per item
- **Hover**: Smooth transitions on background and icon rotation
- **Button**: Arrow slides right on hover

## Usage

```tsx
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { AttendanceRecord } from '@/types/types';

function Dashboard() {
  const records: AttendanceRecord[] = [
    {
      id: '1',
      date: '2024-11-15',
      dayOfWeek: 'Friday',
      status: 'present',
      courseName: 'Advanced Mathematics',
      period: 1,
    },
    // ... more records
  ];

  const handleViewFullHistory = () => {
    // Navigate to full history page
    router.push('/attendance/history');
  };

  return (
    <RecentActivity
      records={records}
      onViewFullHistory={handleViewFullHistory}
    />
  );
}
```

## Props

### RecentActivityProps

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `records` | `AttendanceRecord[]` | Yes | - | Array of attendance records (component displays first 10) |
| `onViewFullHistory` | `() => void` | No | - | Callback when "View Full History" button is clicked |

### AttendanceRecord Type

```typescript
interface AttendanceRecord {
  id: string;
  date: string;              // ISO date string
  dayOfWeek: string;         // e.g., "Monday"
  status: AttendanceStatus;  // 'present' | 'absent' | 'sick' | 'leave'
  courseName: string;
  period: number;
  notes?: string;
}
```

## Examples

### Basic Usage
```tsx
<RecentActivity records={attendanceRecords} />
```

### With Full History Handler
```tsx
<RecentActivity
  records={attendanceRecords}
  onViewFullHistory={() => router.push('/history')}
/>
```

### Empty State
```tsx
<RecentActivity records={[]} />
```

## Status Configuration

Each status has specific styling:

| Status | Icon | Background | Badge Color |
|--------|------|------------|-------------|
| Present | CheckCircle2 | Emerald-100 | Emerald-800 |
| Absent | XCircle | Red-100 | Red-800 |
| Sick | AlertCircle | Amber-100 | Amber-800 |
| Leave | FileText | Cyan-100 | Cyan-800 |

## Accessibility

- **ARIA Labels**: Each activity item has descriptive aria-label
- **Semantic HTML**: Uses article role for activity items
- **Keyboard Navigation**: All interactive elements are keyboard accessible
- **Focus Indicators**: Visible focus states on button
- **Screen Reader**: Proper text alternatives for icons

## Responsive Design

- **Mobile**: Full width with adequate touch targets
- **Tablet**: Optimized spacing and padding
- **Desktop**: Maximum width with comfortable reading layout

### Breakpoints
- `sm`: 640px - Adjusted text sizes
- `md`: 768px - Increased padding
- `lg`: 1024px - Full desktop layout

## Animation Details

### Staggered Entrance
- Uses Framer Motion's StaggerChildren component
- 100ms delay between each item
- Smooth fade-in with subtle y-offset

### Hover Effects
- Background: Transitions to slate-50 in 200ms
- Icon: Rotates 12 degrees in 200ms
- Button Arrow: Translates right on hover

## Performance

- **Lazy Loading**: Component can be lazy loaded with React.lazy()
- **Memoization**: Consider wrapping with React.memo for large lists
- **Optimized Animations**: Uses GPU-accelerated transforms

## Integration with Dashboard

```tsx
// app/dashboard/page.tsx
import { RecentActivity } from '@/components/dashboard';

export default async function DashboardPage() {
  const data = await fetchAttendanceData();
  
  return (
    <div className="space-y-6">
      {/* Other dashboard components */}
      <RecentActivity
        records={data.recentRecords}
        onViewFullHistory={() => router.push('/attendance/history')}
      />
    </div>
  );
}
```

## Design System Compliance

✅ **Borderless Design**: Uses border-0 with shadows for depth  
✅ **Proper Icon Sizing**: All icons are explicitly sized (w-5 h-5, w-8 h-8)  
✅ **Smooth Transitions**: All interactive elements have duration-200 transitions  
✅ **Status Colors**: Uses semantic colors from design system  
✅ **Gradient Accents**: Strategic use on CTA button only  
✅ **Hover Effects**: Subtle scale and color transitions  

## Requirements Fulfilled

- ✅ **5.1**: Displays 10 most recent attendance records in reverse chronological order
- ✅ **5.2**: Staggered entrance animations with 100ms delay between items
- ✅ **5.3**: Status-specific icons with gradient backgrounds and colored badges
- ✅ **5.4**: Background color transition and icon rotation on hover
- ✅ **5.5**: "View Full History" button with gradient background and shadow effects

## Related Components

- `StaggerChildren` - Animation wrapper for staggered entrance
- `Button` - UI button component
- `WeeklyCalendar` - Calendar view of attendance
- `StatsCards` - Attendance statistics cards

## Notes

- Component automatically limits display to 10 most recent records
- Empty state is shown when no records are provided
- Date formatting uses browser's locale settings
- All animations respect prefers-reduced-motion preference
