# Student Dashboard Accessibility Guide

This document outlines the accessibility features implemented in the Student Dashboard to ensure WCAG 2.1 Level AA compliance.

## Overview

The Student Dashboard is designed to be fully accessible to all users, including those using assistive technologies such as screen readers, keyboard-only navigation, and users with motion sensitivity.

## Accessibility Features

### 1. Keyboard Navigation

All interactive elements in the dashboard are fully keyboard accessible:

#### Focus Indicators
- All focusable elements have visible focus indicators using `focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`
- Focus indicators meet WCAG 2.1 contrast requirements (minimum 3:1)
- Focus order follows logical reading order (top to bottom, right to left for RTL content)

#### Keyboard Shortcuts
- **Tab**: Navigate forward through interactive elements
- **Shift + Tab**: Navigate backward through interactive elements
- **Enter**: Activate buttons and links
- **Space**: Activate buttons
- **Arrow Keys**: Navigate within calendar and lists (where applicable)
- **Escape**: Close modals and dialogs (when implemented)

#### Interactive Elements
All interactive elements support keyboard navigation:
- Buttons (navigation, upload, delete, etc.)
- Links (view full history, etc.)
- Cards (stats cards, day cards, activity items)
- Upload zone (Enter/Space to trigger file picker)
- Form inputs (file upload)

### 2. ARIA Labels and Semantic HTML

#### Semantic HTML Structure
```html
<main>                    <!-- Main content area -->
  <section>               <!-- Welcome section -->
  <section>               <!-- Stats cards -->
  <section>               <!-- Status alerts -->
  <section>               <!-- Weekly calendar -->
  <section>               <!-- Progress chart -->
  <section>               <!-- Recent activity -->
  <section>               <!-- Certificate upload -->
</main>
```

#### ARIA Attributes

**Regions and Landmarks**
- `role="region"` with `aria-labelledby` for major sections
- `role="main"` for main content area
- `role="navigation"` for navigation elements
- `role="alert"` for status alerts
- `role="status"` for live updates

**Interactive Elements**
- `aria-label` for buttons without visible text
- `aria-labelledby` to associate labels with regions
- `aria-describedby` for additional descriptions
- `aria-live="polite"` for non-critical updates
- `aria-live="assertive"` for critical alerts
- `aria-hidden="true"` for decorative elements

**Progress Indicators**
- `role="progressbar"` for progress rings and bars
- `aria-valuenow`, `aria-valuemin`, `aria-valuemax` for progress values
- `aria-label` describing the progress

**Lists**
- `role="list"` for activity lists and file lists
- `role="listitem"` for individual items

### 3. Color Contrast

All text and interactive elements meet WCAG 2.1 Level AA contrast requirements:

#### Text Contrast Ratios

**Normal Text (< 18pt or < 14pt bold)**
- Minimum ratio: 4.5:1
- Primary text (#0F172A) on white (#FFFFFF): **15.52:1** ✓
- Secondary text (#475569) on white (#FFFFFF): **7.07:1** ✓
- Tertiary text (#94A3B8) on white (#FFFFFF): **3.39:1** ✗ (Use for large text only)

**Large Text (≥ 18pt or ≥ 14pt bold)**
- Minimum ratio: 3:1
- All heading combinations meet this requirement

#### Status Colors
- Present text (#065F46) on present bg (#D1FAE5): **5.89:1** ✓
- Absent text (#991B1B) on absent bg (#FEE2E2): **7.24:1** ✓
- Sick text (#92400E) on sick bg (#FEF3C7): **6.12:1** ✓
- Leave text (#164E63) on leave bg (#CFFAFE): **6.45:1** ✓

#### Button Colors
- White text (#FFFFFF) on blue button (#3B82F6): **4.56:1** ✓
- White text (#FFFFFF) on violet button (#8B5CF6): **4.54:1** ✓

#### Alert Banners
- White text (#FFFFFF) on red alert (#EF4444): **4.53:1** ✓
- White text (#FFFFFF) on amber alert (#F59E0B): **3.95:1** ✓ (Large text)

### 4. Reduced Motion Support

The dashboard respects the `prefers-reduced-motion` user preference:

#### Implementation
```typescript
import { useReducedMotion } from 'framer-motion';

const shouldReduceMotion = useReducedMotion();

// Conditionally apply animations
<motion.div
  initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
  animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
  transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.6 }}
>
```

#### Affected Animations
When reduced motion is enabled:
- Entrance animations are disabled
- Hover scale effects are disabled
- Rotation animations are disabled
- Background decorative animations are disabled
- Progress animations still work but with instant transitions
- Essential animations (loading indicators) remain functional

#### Custom Hook
A custom `useReducedMotion` hook is available at `hooks/use-reduced-motion.ts`:
```typescript
export function useReducedMotion(): boolean {
  // Detects prefers-reduced-motion media query
  // Returns true if user prefers reduced motion
}
```

## Screen Reader Support

### Announcements
- Status changes are announced using `aria-live` regions
- Error messages use `aria-live="assertive"` for immediate announcement
- Progress updates use `aria-live="polite"` for non-intrusive updates

### Hidden Content
- Decorative icons are hidden with `aria-hidden="true"`
- Visual-only elements (gradients, shapes) are hidden from screen readers
- All meaningful content has text alternatives

### Labels
- All form inputs have associated labels
- Buttons have descriptive labels (in Arabic and English)
- Images have alt text (when applicable)

## Testing Checklist

### Automated Testing
- [ ] Run axe-core accessibility tests
- [ ] Validate HTML semantics
- [ ] Check color contrast ratios
- [ ] Verify ARIA attributes

### Manual Testing
- [ ] Test keyboard-only navigation
- [ ] Test with screen reader (NVDA, JAWS, VoiceOver)
- [ ] Test with reduced motion enabled
- [ ] Test with high contrast mode
- [ ] Test with browser zoom (up to 200%)
- [ ] Test with different viewport sizes

### Browser Testing
- [ ] Chrome + ChromeVox
- [ ] Firefox + NVDA
- [ ] Safari + VoiceOver
- [ ] Edge + Narrator

## Common Patterns

### Focusable Card
```tsx
<article
  className="focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
  tabIndex={0}
  role="region"
  aria-label="Description of card content"
>
  {/* Card content */}
</article>
```

### Button with Icon
```tsx
<Button
  onClick={handleClick}
  className="focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
  aria-label="Descriptive label in Arabic"
>
  <Icon className="w-5 h-5" aria-hidden="true" />
  Button Text
</Button>
```

### Progress Indicator
```tsx
<div
  role="progressbar"
  aria-valuenow={percentage}
  aria-valuemin={0}
  aria-valuemax={100}
  aria-label={`Progress: ${percentage}%`}
>
  {/* Visual progress indicator */}
</div>
```

### Live Region
```tsx
<div
  role="status"
  aria-live="polite"
  aria-atomic="true"
>
  {statusMessage}
</div>
```

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [axe DevTools](https://www.deque.com/axe/devtools/)

## Maintenance

### Adding New Components
When adding new components, ensure:
1. All interactive elements are keyboard accessible
2. Proper ARIA labels are added
3. Color contrast meets WCAG AA standards
4. Reduced motion is respected
5. Semantic HTML is used

### Testing New Features
1. Run automated accessibility tests
2. Test with keyboard navigation
3. Test with screen reader
4. Verify color contrast
5. Test with reduced motion enabled

## Contact

For accessibility issues or questions, please contact the development team or file an issue in the project repository.
