# Academic Standing Alerts - Responsive Design Guide

## Overview

The Academic Standing Alert System is fully responsive and optimized for all screen sizes from mobile (375px) to large desktop (2560px+). This guide documents all responsive features and testing requirements.

## Components

### 1. AcademicStandingAlerts
Main alert card component with four distinct alert types.

### 2. AcademicStandingSection
Smart wrapper that calculates status and displays appropriate alert.

### 3. Academic Status Utilities
Helper functions for status calculation and messaging.

## Responsive Features

### Layout Adaptations

#### Mobile (375px - 767px)
- **Card Padding**: `p-4` (16px)
- **Icon Size**: `h-5 w-5` (20px)
- **Title Size**: `text-base` (16px)
- **Body Text**: `text-sm` (14px)
- **Button Layout**: `flex-col` (stacked vertically)
- **Button Width**: `w-full` (full width)
- **Gap**: `gap-2` (8px)

#### Tablet (768px - 1023px)
- **Card Padding**: `p-5` (20px)
- **Icon Size**: `h-6 w-6` (24px)
- **Title Size**: `text-lg` (18px)
- **Body Text**: `text-base` (16px)
- **Button Layout**: `flex-row` (horizontal)
- **Button Width**: `w-auto` (auto width)
- **Gap**: `gap-3` (12px)

#### Desktop (1024px+)
- **Card Padding**: `p-6` (24px)
- **Icon Size**: `h-7 w-7` (28px)
- **Title Size**: `text-xl` (20px)
- **Body Text**: `text-base` (16px)
- **Button Layout**: `flex-row` (horizontal)
- **Button Width**: `w-auto` (auto width)
- **Gap**: `gap-3` (12px)

### Touch Optimization

#### Touch Targets
All interactive elements meet WCAG 2.1 AA requirements:
- **Minimum Height**: `min-h-[44px]` (44px)
- **Touch Manipulation**: `touch-manipulation` class applied
- **Full Width on Mobile**: Buttons span full width for easy tapping

#### Touch-Friendly Spacing
- **Mobile Gap**: 8px between elements
- **Tablet Gap**: 12px between elements
- **Desktop Gap**: 12px between elements

### Typography Scaling

#### Responsive Text Classes
```tsx
// Title
text-base sm:text-lg lg:text-xl

// Body Text
text-sm sm:text-base

// Small Text (badges, labels)
text-xs sm:text-sm

// Large Numbers (statistics)
text-lg sm:text-xl lg:text-2xl
```

### Animation Features

#### Pulsing Animation (Critical Alerts)
- **Active On**: محروم (Mahroom) and تصدیق طلب (Tasdiq) statuses
- **Animation**: Scale from 1 to 1.1 and back
- **Duration**: 1.5 seconds
- **Repeat**: Infinite loop
- **Easing**: easeInOut

#### Entrance Animation
- **Initial State**: `opacity: 0, y: 20`
- **Animated State**: `opacity: 1, y: 0`
- **Duration**: 0.5 seconds
- **Delay**: None

### Color Coding

#### Good Standing (Green)
- Background: `bg-gradient-to-br from-green-50 to-green-100/50`
- Border: `border-green-200`
- Icon: `text-green-600`
- Title: `text-green-800`
- Text: `text-green-700`
- Badge: `bg-green-100 text-green-700`

#### Warning (Yellow)
- Background: `bg-gradient-to-br from-yellow-50 to-yellow-100/50`
- Border: `border-yellow-200`
- Icon: `text-yellow-600`
- Title: `text-yellow-800`
- Text: `text-yellow-700`
- Badge: `bg-yellow-100 text-yellow-700`

#### Mahroom - Disqualified (Red)
- Background: `bg-gradient-to-br from-red-50 to-red-100/50`
- Border: `border-red-200`
- Icon: `text-red-600`
- Title: `text-red-800`
- Text: `text-red-700`
- Badge: `bg-red-100 text-red-700`

#### Tasdiq - Certification Required (Orange)
- Background: `bg-gradient-to-br from-orange-50 to-orange-100/50`
- Border: `border-orange-200`
- Icon: `text-orange-600`
- Title: `text-orange-800`
- Text: `text-orange-700`
- Badge: `bg-orange-100 text-orange-700`

## Testing Checklist

### ✅ Mobile Testing (375px - 767px)
- [ ] Alert card displays with reduced padding (p-4)
- [ ] Icons are appropriately sized (h-5 w-5)
- [ ] Text is readable at smaller sizes
- [ ] Buttons stack vertically (flex-col)
- [ ] Buttons are full width (w-full)
- [ ] All buttons have 44px minimum height
- [ ] Touch targets are easy to tap
- [ ] Pulsing animation works on critical alerts
- [ ] Arabic term explanations are readable
- [ ] No horizontal scrolling occurs

### ✅ Tablet Testing (768px - 1023px)
- [ ] Alert card displays with medium padding (p-5)
- [ ] Icons scale up appropriately (h-6 w-6)
- [ ] Text sizes increase for better readability
- [ ] Buttons display horizontally (flex-row)
- [ ] Buttons have auto width
- [ ] Touch targets remain accessible
- [ ] Layout adapts smoothly from mobile
- [ ] All content is visible without scrolling

### ✅ Desktop Testing (1024px+)
- [ ] Alert card displays with full padding (p-6)
- [ ] Icons are largest size (h-7 w-7)
- [ ] Text is optimally sized for reading
- [ ] Buttons display horizontally with proper spacing
- [ ] Hover effects work on buttons
- [ ] Layout is spacious and comfortable
- [ ] All features are easily accessible

### ✅ Cross-Device Testing
- [ ] Test on iPhone SE (375px)
- [ ] Test on iPhone 12/13/14 (390px)
- [ ] Test on iPad (768px)
- [ ] Test on iPad Pro (1024px)
- [ ] Test on Desktop (1440px)
- [ ] Test on 4K (2560px)
- [ ] Test landscape and portrait orientations
- [ ] Test with browser zoom at 200%

### ✅ Accessibility Testing
- [ ] All buttons are keyboard accessible
- [ ] Focus indicators are visible
- [ ] Screen reader announces alert type
- [ ] Color contrast meets WCAG 2.1 AA (4.5:1)
- [ ] Information not conveyed by color alone
- [ ] Touch targets meet 44px minimum
- [ ] Text scales without breaking layout

### ✅ Animation Testing
- [ ] Pulsing animation works on mahroom status
- [ ] Pulsing animation works on tasdiq status
- [ ] No animation on good-standing status
- [ ] No animation on warning status
- [ ] Entrance animation is smooth
- [ ] Animations respect prefers-reduced-motion

### ✅ Content Testing
- [ ] All four alert types display correctly
- [ ] Attendance rates show with 1 decimal place
- [ ] Remaining absences calculate correctly
- [ ] Arabic terms display properly (محروم, تصدیق طلب)
- [ ] English explanations are clear
- [ ] Action buttons have correct labels
- [ ] Action buttons trigger correct handlers

## Usage Examples

### Basic Usage
```tsx
import { AcademicStandingAlerts } from '@/components/student'

<AcademicStandingAlerts
  status="good-standing"
  attendanceRate={95}
  remainingAbsences={20}
  onViewPolicy={() => router.push('/student/help')}
/>
```

### With Smart Calculation
```tsx
import { AcademicStandingSection } from '@/components/student'

<AcademicStandingSection
  attendanceData={{
    attendanceRate: 88.5,
    absentHours: 12,
    totalHours: 100,
    presentHours: 88,
    sickHours: 0,
    leaveHours: 0
  }}
  onContactTeacher={() => router.push('/student/messages')}
  onUploadDocumentation={() => router.push('/student/upload')}
  onViewPolicy={() => router.push('/student/help')}
/>
```

### All Four Scenarios

#### Good Standing (95% attendance)
```tsx
<AcademicStandingAlerts
  status="good-standing"
  attendanceRate={95}
  remainingAbsences={20}
/>
```

#### Warning (88% attendance)
```tsx
<AcademicStandingAlerts
  status="warning"
  attendanceRate={88}
  remainingAbsences={12}
  onContactTeacher={handleContactTeacher}
/>
```

#### Tasdiq - Certification Required (80% attendance)
```tsx
<AcademicStandingAlerts
  status="tasdiq"
  attendanceRate={80}
  remainingAbsences={5}
  onContactTeacher={handleContactTeacher}
  onUploadDocumentation={handleUploadDocumentation}
/>
```

#### Mahroom - Disqualified (70% attendance)
```tsx
<AcademicStandingAlerts
  status="mahroom"
  attendanceRate={70}
  remainingAbsences={0}
  onContactTeacher={handleContactTeacher}
/>
```

## Integration with Student Dashboard

The Academic Standing Alert System integrates seamlessly with the student dashboard:

1. **Dashboard Page**: Display alert prominently after metrics cards
2. **Attendance Page**: Show alert at top of attendance history
3. **Progress Page**: Include alert in progress tracking section

### Recommended Placement
```tsx
<div className="space-y-6">
  {/* Metrics Cards */}
  <DashboardMetrics {...metricsData} />
  
  {/* Academic Standing Alert */}
  <AcademicStandingSection
    attendanceData={attendanceData}
    onContactTeacher={() => router.push('/student/messages')}
    onUploadDocumentation={() => router.push('/student/upload')}
    onViewPolicy={() => router.push('/student/help')}
  />
  
  {/* Weekly Calendar */}
  <WeeklyAttendanceCalendar {...calendarData} />
</div>
```

## Performance Considerations

### Optimization Features
- **Memoization**: Status calculation is memoized with `React.useMemo`
- **Conditional Rendering**: Only renders necessary elements based on status
- **Hardware Acceleration**: Animations use transform for GPU acceleration
- **Lazy Loading**: Can be code-split if needed

### Bundle Size
- **Component Size**: ~8KB (minified)
- **Dependencies**: framer-motion, lucide-react (already in project)
- **No Additional Dependencies**: Uses existing UI components

## Maintenance Notes

### Adding New Alert Types
To add a new alert type:
1. Add type to `AcademicStatus` union in `academic-standing-alerts.tsx`
2. Add case to `getAlertConfig()` function
3. Update `calculateAcademicStatus()` in `lib/utils/academic-status.ts`
4. Update documentation

### Customizing Thresholds
Default thresholds can be customized:
- **Mahroom Threshold**: Default 75% (can be changed via props)
- **Tasdiq Threshold**: Default 85% (can be changed via props)

### Styling Customization
All colors and styles use Tailwind classes and can be customized:
- Modify gradient backgrounds
- Adjust border colors
- Change text colors
- Update badge styles

## Support

For questions or issues with the Academic Standing Alert System:
1. Check this documentation first
2. Review the design document at `.kiro/specs/student-dashboard/design.md`
3. Check the requirements at `.kiro/specs/student-dashboard/requirements.md`
4. Contact the development team

## Version History

- **v1.0.0** (Current): Initial implementation with four alert types, full responsive design, and touch optimization
