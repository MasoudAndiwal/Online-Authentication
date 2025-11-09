# Teacher Dashboard Accessibility Guide

## Overview

The Teacher Dashboard has been enhanced with comprehensive accessibility features to ensure WCAG 2.1 AA compliance. This guide documents all accessibility features and how to use them.

## Keyboard Navigation

### Skip Links

The dashboard includes skip links that appear when you press Tab:
- **Skip to main content** - Jumps to the main dashboard content
- **Skip to metrics** - Jumps to the metrics cards section
- **Skip to quick actions** - Jumps to the quick actions panel
- **Skip to my classes** - Jumps to the class grid

### Class Grid Navigation

The class grid supports full keyboard navigation:

#### Arrow Keys
- **Right Arrow** - Move to next class card
- **Left Arrow** - Move to previous class card
- **Down Arrow** - Move down one row
- **Up Arrow** - Move up one row

#### Additional Keys
- **Home** - Jump to first card in current row
- **End** - Jump to last card in current row
- **Page Down** - Move down 3 rows
- **Page Up** - Move up 3 rows
- **Enter/Space** - Open selected class details

### Button Navigation

All interactive elements are keyboard accessible:
- **Tab** - Move to next interactive element
- **Shift + Tab** - Move to previous interactive element
- **Enter/Space** - Activate button or link

## Screen Reader Support

### ARIA Labels

All components include proper ARIA labels:

#### Metric Cards
- Each metric card announces its title, value, and trend
- Example: "Total Students: 247, +12 vs last month"

#### Class Cards
- Each class card announces comprehensive information
- Example: "Computer Science 101 class card. 28 students enrolled. Attendance rate: 94.2%. Next session: Today 10:00 AM"

#### Buttons
- All buttons have descriptive labels
- Example: "Quick action: Mark attendance for your classes"

### Live Regions

Dynamic content changes are announced to screen readers:
- Loading states: "Loading classes"
- Completion: "8 classes loaded"
- Navigation: "Opening attendance marking interface"
- Actions: "Navigating to class details"

## Focus Management

### Visual Focus Indicators

All interactive elements have clear focus indicators:
- Orange ring with 4px width
- High contrast for visibility
- Consistent across all components

### Focus Trap

Modals and dialogs trap focus within them:
- Tab cycles through modal elements only
- Escape key closes modal and restores focus
- Focus returns to trigger element on close

## Semantic HTML

### Proper Structure

The dashboard uses semantic HTML elements:
- `<main>` for main content area
- `<nav>` for navigation elements
- `<article>` for class cards and metric cards
- `<section>` for grouped content
- `<button>` for interactive actions

### Heading Hierarchy

Proper heading levels are maintained:
- H1: Page title (Teacher Dashboard)
- H2: Section titles (My Classes, Quick Actions)
- H3: Card titles (Class names)

## Color and Contrast

### WCAG AA Compliance

All text meets WCAG AA contrast requirements:
- Normal text: 4.5:1 minimum
- Large text: 3:1 minimum
- Interactive elements: 3:1 minimum

### Color Independence

Information is not conveyed by color alone:
- Icons accompany color-coded elements
- Text labels describe status
- Patterns and shapes provide additional cues

## Reduced Motion

### Respects User Preferences

The dashboard respects `prefers-reduced-motion`:
- Animations are disabled when user prefers reduced motion
- Transitions are instant instead of animated
- Count-up animations are replaced with static values

### Implementation

```typescript
import { prefersReducedMotion } from '@/lib/utils/accessibility';

const shouldAnimate = !prefersReducedMotion();
```

## Testing Accessibility

### Keyboard Testing

1. Press Tab to navigate through all interactive elements
2. Verify focus indicators are visible
3. Test all keyboard shortcuts
4. Ensure no keyboard traps exist

### Screen Reader Testing

Recommended screen readers:
- **NVDA** (Windows) - Free
- **JAWS** (Windows) - Commercial
- **VoiceOver** (macOS/iOS) - Built-in
- **TalkBack** (Android) - Built-in

### Automated Testing

Run accessibility tests:
```bash
npm run test:a11y
```

## Common Patterns

### Accessible Button

```tsx
<Button
  onClick={handleAction}
  aria-label="Descriptive action label"
>
  <Icon aria-hidden="true" />
  Button Text
</Button>
```

### Accessible Card

```tsx
<Card
  role="article"
  aria-label="Card description with key information"
  tabIndex={0}
  onKeyDown={handleKeyDown}
>
  {/* Card content */}
</Card>
```

### Accessible Grid

```tsx
<div
  role="list"
  aria-label="Grid description"
  onKeyDown={handleGridNavigation}
>
  {items.map((item, index) => (
    <div
      key={item.id}
      role="listitem"
      ref={setItemRef(index)}
      tabIndex={focusedIndex === index ? 0 : -1}
    >
      {/* Item content */}
    </div>
  ))}
</div>
```

## Utilities and Hooks

### useKeyboardNavigation

Provides keyboard navigation for grids and lists:

```typescript
const {
  focusedIndex,
  setItemRef,
  handleKeyDown,
} = useKeyboardNavigation({
  totalItems: items.length,
  columns: 4,
  enabled: true,
  onSelect: (index) => handleSelect(items[index]),
});
```

### useScreenReaderAnnouncements

Announces dynamic content to screen readers:

```typescript
const { announce } = useScreenReaderAnnouncements();

// Polite announcement (doesn't interrupt)
announce('Classes loaded successfully');

// Assertive announcement (interrupts current speech)
announce('Error loading data', 'assertive');
```

### useFocusTrap

Manages focus within modals and dialogs:

```typescript
const containerRef = useFocusTrap({
  enabled: isOpen,
  restoreFocus: true,
});

return (
  <div ref={containerRef}>
    {/* Modal content */}
  </div>
);
```

## Best Practices

### Do's

✅ Always provide descriptive ARIA labels
✅ Use semantic HTML elements
✅ Ensure keyboard accessibility
✅ Test with screen readers
✅ Maintain proper heading hierarchy
✅ Provide skip links
✅ Announce dynamic content changes
✅ Respect user motion preferences

### Don'ts

❌ Don't use `div` for buttons
❌ Don't rely on color alone
❌ Don't create keyboard traps
❌ Don't use placeholder as label
❌ Don't hide focus indicators
❌ Don't use auto-playing content
❌ Don't use time-based interactions
❌ Don't ignore screen reader testing

## Resources

### WCAG Guidelines
- [WCAG 2.1 Quick Reference](https://www.w3.org/WAI/WCAG21/quickref/)
- [WebAIM WCAG Checklist](https://webaim.org/standards/wcag/checklist)

### Testing Tools
- [axe DevTools](https://www.deque.com/axe/devtools/)
- [WAVE Browser Extension](https://wave.webaim.org/extension/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)

### Learning Resources
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
- [A11y Project](https://www.a11yproject.com/)
- [WebAIM](https://webaim.org/)

## Support

For accessibility issues or questions:
1. Check this guide first
2. Review the WCAG guidelines
3. Test with assistive technologies
4. Contact the development team

## Changelog

### Version 1.0.0 (Current)
- ✅ WCAG 2.1 AA compliance
- ✅ Full keyboard navigation
- ✅ Screen reader support
- ✅ Focus management
- ✅ Skip links
- ✅ ARIA labels and live regions
- ✅ Semantic HTML
- ✅ Reduced motion support
