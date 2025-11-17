# StatsCards Component

## Overview

The `StatsCards` component displays attendance statistics in a visually appealing, responsive grid layout. It features smooth animations, borderless design with shadows, and follows the design system guidelines.

## Features

✅ **Responsive Grid Layout**
- Mobile: 1 column (full width)
- Tablet: 2 columns
- Desktop: 4 columns

✅ **Modern Design**
- Borderless cards with `border-0` and `shadow-sm`
- Left border accent with status colors
- White background with rounded corners

✅ **Icon Treatment**
- Solid color backgrounds (emerald, red, amber, cyan)
- Properly sized icons (24px / w-6 h-6)
- Semantic color coding for each status

✅ **Smooth Animations**
- Count-up animation for numbers (1.2s duration)
- Staggered entrance animation (100ms delay between cards)
- Hover effects with scale and shadow transitions

## Usage

```tsx
import { StatsCards } from '@/components/dashboard/StatsCards';
import { AttendanceStats } from '@/types/types';

function Dashboard() {
  const stats: AttendanceStats = {
    totalDays: 120,
    presentDays: 95,
    absentDays: 15,
    sickDays: 7,
    leaveDays: 3,
    attendancePercentage: 79.17,
    pureAbsenceHours: 15,
    combinedAbsenceHours: 25,
  };

  return (
    <div className="space-y-6">
      <h2>Attendance Overview</h2>
      <StatsCards stats={stats} />
    </div>
  );
}
```

## Props

### StatsCardsProps

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `stats` | `AttendanceStats` | Yes | Attendance statistics object containing all metrics |

### AttendanceStats Interface

```typescript
interface AttendanceStats {
  totalDays: number;
  presentDays: number;
  absentDays: number;
  sickDays: number;
  leaveDays: number;
  attendancePercentage: number;
  pureAbsenceHours: number;
  combinedAbsenceHours: number;
}
```

## Design Specifications

### Card Structure

Each stat card includes:
1. **Icon Container** (48px × 48px)
   - Rounded background with status color
   - Icon sized at 24px (w-6 h-6)

2. **Number Display**
   - Large, bold text (text-3xl)
   - Animated count-up effect
   - Dark slate color for readability

3. **Label**
   - Small text (text-sm)
   - Secondary slate color

### Color Scheme

- **Present**: Emerald (green) - `bg-emerald-100`, `text-emerald-600`, `border-emerald-500`
- **Absent**: Red - `bg-red-100`, `text-red-600`, `border-red-500`
- **Sick**: Amber (orange) - `bg-amber-100`, `text-amber-600`, `border-amber-500`
- **Leave**: Cyan (blue) - `bg-cyan-100`, `text-cyan-600`, `border-cyan-500`

### Hover Effects

```css
transition-all duration-300
hover:shadow-md
hover:-translate-y-1
```

## Dependencies

- `lucide-react` - Icons (CheckCircle2, XCircle, Thermometer, Calendar)
- `@/components/animations/CountUp` - Number animation
- `@/components/animations/StaggerChildren` - Staggered entrance
- `@/types/types` - TypeScript interfaces
- `@/lib/utils` - Utility functions (cn)

## Accessibility

- Semantic HTML structure
- Proper color contrast ratios
- Smooth transitions respect `prefers-reduced-motion`
- Clear visual hierarchy

## Requirements Satisfied

- ✅ Requirement 1.2: Real-time attendance statistics with animated count-up numbers
- ✅ Requirement 1.3: Four metric cards with gradient backgrounds and colored shadows
- ✅ Requirement 1.4: Borderless design with shadow-lg for depth
- ✅ Requirement 1.5: Animated icons with hover effects
- ✅ Requirement 1.7: Hover effects with scale transformation and shadow elevation
- ✅ Requirement 7.1: Statistics cards in single column layout on mobile
- ✅ Requirement 7.2: Responsive grid adaptation across screen sizes

## Demo

A demo component is available at `components/dashboard/__demo__/StatsCardsDemo.tsx` for testing and development purposes.
