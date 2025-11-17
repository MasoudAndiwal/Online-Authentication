# StatusAlerts Component

## Overview

The `StatusAlerts` component displays warning banners for students based on their academic status. It shows alerts for disqualification (محروم) and certification requirements (تصدیق طلب) with animated icons, progress bars, and call-to-action buttons.

## Features

- **Disqualification Alert (محروم)**: Red gradient background with animated warning icon (shake effect)
- **Certification Required Alert (تصدیق طلب)**: Amber gradient background with animated document icon (pulse effect)
- **Progress Bars**: Animated progress bars showing hours vs threshold
- **Borderless Design**: Uses shadows instead of borders for modern look
- **Accessibility**: Proper ARIA labels and semantic HTML
- **Responsive**: Works on all screen sizes

## Usage

```tsx
import { StatusAlerts } from '@/components/dashboard/StatusAlerts';

function Dashboard() {
  const status = {
    isDisqualified: false,
    needsCertification: true,
    disqualificationThreshold: 18,
    certificationThreshold: 12,
  };

  const stats = {
    pureAbsenceHours: 10,
    combinedAbsenceHours: 15,
    // ... other stats
  };

  const handleUploadClick = () => {
    // Scroll to upload section or open upload dialog
    document.getElementById('certificate-upload')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <StatusAlerts 
      status={status} 
      stats={stats} 
      onUploadClick={handleUploadClick}
    />
  );
}
```

## Props

### StatusAlertsProps

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `status` | `AcademicStatus` | Yes | Academic status object containing alert flags and thresholds |
| `stats` | `AttendanceStats` | Yes | Attendance statistics including absence hours |
| `onUploadClick` | `() => void` | No | Callback function when upload button is clicked |

### AcademicStatus Interface

```typescript
interface AcademicStatus {
  isDisqualified: boolean;        // محروم - student is disqualified
  needsCertification: boolean;    // تصدیق طلب - certification required
  disqualificationThreshold: number;  // Hours threshold for disqualification
  certificationThreshold: number;     // Hours threshold for certification
}
```

### AttendanceStats Interface

```typescript
interface AttendanceStats {
  pureAbsenceHours: number;      // Hours of pure absence (counts toward محروم)
  combinedAbsenceHours: number;  // Combined absence hours (counts toward تصدیق طلب)
  // ... other stats
}
```

## Design Specifications

### Disqualification Alert (محروم)

- **Background**: Red gradient (`from-red-500 to-red-600`)
- **Shadow**: Red colored shadow (`shadow-red-500/30`)
- **Icon**: Warning triangle with shake animation
- **Animation**: Rotates ±5 degrees every 2.5 seconds
- **Progress Bar**: White bar on white/20 background
- **Text**: White text with bold heading

### Certification Alert (تصدیق طلب)

- **Background**: Amber gradient (`from-amber-500 to-amber-600`)
- **Shadow**: Amber colored shadow (`shadow-amber-500/30`)
- **Icon**: Document icon with pulse animation
- **Animation**: Scales from 1 to 1.1 continuously
- **Progress Bar**: White bar on white/20 background
- **Button**: White background with amber text
- **Text**: White text with bold heading

## Animations

### Entrance Animation
- Fade in with slight upward movement (y: -10 to 0)
- Duration: 400ms with easeOut timing
- Certification alert has 100ms delay

### Icon Animations

**Shake Effect (Disqualification)**:
```typescript
animate={{
  rotate: [0, -5, 5, -5, 5, 0],
}}
transition={{
  duration: 0.5,
  repeat: Infinity,
  repeatDelay: 2,
}}
```

**Pulse Effect (Certification)**:
```typescript
animate={{
  scale: [1, 1.1, 1],
}}
transition={{
  duration: 2,
  repeat: Infinity,
}}
```

### Progress Bar Animation
- Animates from 0 to percentage width
- Duration: 1 second with easeOut timing
- Certification bar has 300ms delay

## Accessibility

- Uses `role="alert"` for semantic meaning
- Disqualification alert uses `aria-live="assertive"` for immediate announcement
- Certification alert uses `aria-live="polite"` for non-intrusive announcement
- Proper color contrast (white text on colored backgrounds)
- Keyboard accessible button for upload action

## Conditional Rendering

The component automatically hides if no alerts are needed:

```typescript
if (!status.isDisqualified && !status.needsCertification) {
  return null;
}
```

## Integration Example

```tsx
// In your dashboard page
import { StatusAlerts } from '@/components/dashboard/StatusAlerts';

export default function DashboardPage() {
  // Fetch data from API
  const { status, stats } = useAttendance();

  return (
    <div className="space-y-6">
      {/* Status alerts at the top */}
      <StatusAlerts 
        status={status} 
        stats={stats}
        onUploadClick={() => {
          // Navigate to upload section
          const uploadSection = document.getElementById('certificate-upload');
          uploadSection?.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* Other dashboard components */}
      <StatsCards stats={stats} />
      {/* ... */}
    </div>
  );
}
```

## Requirements Satisfied

- ✅ 2.1: Disqualification alert with animated warning icon and progress bar
- ✅ 2.2: Certification alert with document upload call-to-action
- ✅ 2.3: Gradient backgrounds with colored shadows and borderless design
- ✅ 2.4: Animated progress bars from zero to current value
- ✅ 2.5: Continuous pulse/shake animations on alert icons

## Notes

- Component returns `null` if no alerts are needed (clean conditional rendering)
- Uses Framer Motion for smooth animations
- Follows the design system with borderless cards and shadows
- Progress bars are capped at 100% even if hours exceed threshold
- Upload button only renders if `onUploadClick` callback is provided
