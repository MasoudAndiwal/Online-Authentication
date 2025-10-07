# Employment Type Field - Visual Guide

## Location in Form

### Add Teacher Page - Step 3 (Academic Details)

```
┌─────────────────────────────────────────────────────────┐
│                   Academic Details                      │
│                                                         │
│  ┌─────────────────────────────────────────────────┐  │
│  │ Qualification *                                  │  │
│  │ [Master's in Computer Science              ]    │  │
│  └─────────────────────────────────────────────────┘  │
│                                                         │
│  ┌─────────────────────────────────────────────────┐  │
│  │ Experience *                                     │  │
│  │ [5 years                                   ]    │  │
│  └─────────────────────────────────────────────────┘  │
│                                                         │
│  ┌─────────────────────────────────────────────────┐  │
│  │ Specialization *                                 │  │
│  │ [Software Engineering                      ]    │  │
│  └─────────────────────────────────────────────────┘  │
│                                                         │
│  ─────────────────────────────────────────────────────  │
│                                                         │
│                  Teaching Assignments                   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐  │
│  │ Departments *                                    │  │
│  │ [Computer Science] [×]                          │  │
│  └─────────────────────────────────────────────────┘  │
│                                                         │
│  ┌──────────────────────┐  ┌──────────────────────┐  │
│  │ Subjects *           │  │ Classes *            │  │
│  │ [Programming] [×]    │  │ [Section A] [×]      │  │
│  │ [Data Structures][×] │  │ [Morning Batch] [×]  │  │
│  └──────────────────────┘  └──────────────────────┘  │
│                                                         │
│  ┌─────────────────────────────────────────────────┐  │
│  │ Employment Type *                                │  │
│  │ ┌─────────────────────────────────────────────┐ │  │
│  │ │ Select employment type              [▼]    │ │  │ ← NEW FIELD
│  │ └─────────────────────────────────────────────┘ │  │
│  └─────────────────────────────────────────────────┘  │
│                                                         │
│  [Previous]                              [Next Step]   │
└─────────────────────────────────────────────────────────┘
```

## Field States

### 1. Default State (Empty)
```
┌─────────────────────────────────────────┐
│ Employment Type *                       │
│ ┌─────────────────────────────────────┐ │
│ │ Select employment type          [▼] │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

### 2. Dropdown Open
```
┌─────────────────────────────────────────┐
│ Employment Type *                       │
│ ┌─────────────────────────────────────┐ │
│ │ Select employment type          [▲] │ │
│ ├─────────────────────────────────────┤ │
│ │ Full Time (Permanent)               │ │ ← Hover: Light gray bg
│ │ Part Time (Credit-Based)            │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

### 3. Selected State
```
┌─────────────────────────────────────────┐
│ Employment Type *                       │
│ ┌─────────────────────────────────────┐ │
│ │ Full Time (Permanent)           [▼] │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

### 4. Focus State
```
┌─────────────────────────────────────────┐
│ Employment Type *                       │
│ ┌─────────────────────────────────────┐ │
│ │ Select employment type          [▼] │ │ ← Orange border + ring
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

### 5. Error State
```
┌─────────────────────────────────────────┐
│ Employment Type *                       │
│ ┌─────────────────────────────────────┐ │
│ │ Select employment type          [▼] │ │ ← Red border
│ └─────────────────────────────────────┘ │
│ ⚠ Employment type is required           │ ← Red text
└─────────────────────────────────────────┘
```

## Color Specifications

### Default State
- **Border**: `#e2e8f0` (slate-200)
- **Background**: `#ffffff` (white)
- **Text**: `#0f172a` (slate-900)
- **Placeholder**: `#94a3b8` (slate-400)

### Focus State
- **Border**: `#f97316` (orange-500)
- **Ring**: `#fed7aa` (orange-100), 2px
- **Background**: `#ffffff` (white)

### Error State
- **Border**: `#ef4444` (red-500)
- **Background**: `#ffffff` (white)
- **Error Text**: `#ef4444` (red-500)
- **Error Icon**: `#ef4444` (red-500)

### Hover State (Dropdown Options)
- **Background**: `#f1f5f9` (slate-100)
- **Text**: `#0f172a` (slate-900)

## Spacing & Dimensions

### Field Container
- **Margin Top**: 24px (`mt-6`)
- **Spacing**: 8px between label and input (`space-y-2`)

### Select Element
- **Height**: 48px (`h-12`)
- **Width**: 100% (`w-full`)
- **Padding Horizontal**: 12px (`px-3`)
- **Border Width**: 1px
- **Border Radius**: 8px (`rounded-lg`)

### Label
- **Font Size**: 14px (`text-sm`)
- **Font Weight**: 600 (`font-semibold`)
- **Color**: `#334155` (slate-700)
- **Margin Bottom**: 8px (from space-y-2)

### Error Message
- **Font Size**: 14px (`text-sm`)
- **Margin Top**: 8px (from space-y-2)
- **Icon Size**: 16px (`h-4 w-4`)
- **Gap**: 4px (`gap-1`)

## Typography

### Label
- **Font Family**: Inter (system font stack)
- **Font Size**: 14px
- **Font Weight**: 600 (Semibold)
- **Line Height**: 20px
- **Letter Spacing**: Normal

### Select Text
- **Font Family**: Inter (system font stack)
- **Font Size**: 14px
- **Font Weight**: 400 (Regular)
- **Line Height**: 20px

### Error Message
- **Font Family**: Inter (system font stack)
- **Font Size**: 14px
- **Font Weight**: 400 (Regular)
- **Line Height**: 20px
- **Color**: Red-500

## Responsive Behavior

### Desktop (≥1024px)
```
┌─────────────────────────────────────────────────────────┐
│  ┌──────────────────────┐  ┌──────────────────────┐    │
│  │ Subjects *           │  │ Classes *            │    │
│  └──────────────────────┘  └──────────────────────┘    │
│                                                         │
│  ┌─────────────────────────────────────────────────┐  │
│  │ Employment Type *                                │  │
│  │ [Select employment type                    ▼]   │  │
│  └─────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### Tablet (768px - 1023px)
```
┌─────────────────────────────────────────┐
│  ┌─────────────────────────────────┐   │
│  │ Subjects *                      │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ Classes *                       │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ Employment Type *               │   │
│  │ [Select employment type    ▼]  │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

### Mobile (<768px)
```
┌─────────────────────────┐
│  ┌───────────────────┐  │
│  │ Subjects *        │  │
│  └───────────────────┘  │
│                         │
│  ┌───────────────────┐  │
│  │ Classes *         │  │
│  └───────────────────┘  │
│                         │
│  ┌───────────────────┐  │
│  │ Employment Type * │  │
│  │ [Select type  ▼] │  │
│  └───────────────────┘  │
└─────────────────────────┘
```

## Interaction Flow

### User Journey
1. User navigates to Step 3 (Academic Details)
2. User fills Qualification, Experience, Specialization
3. User selects Departments, Subjects, Classes
4. User sees Employment Type field
5. User clicks dropdown
6. Dropdown opens with 2 options
7. User selects an option
8. Dropdown closes, value displayed
9. User proceeds to next step

### Validation Flow
1. User tries to submit without selecting
2. Form validation runs
3. Error appears below field
4. Field border turns red
5. User clicks dropdown
6. User selects an option
7. Error disappears
8. Border returns to normal
9. Form can be submitted

## Keyboard Navigation

### Tab Order
1. Tab to field → Focus on select
2. Space/Enter → Open dropdown
3. Arrow Up/Down → Navigate options
4. Enter → Select option
5. Escape → Close dropdown
6. Tab → Move to next field

### Keyboard Shortcuts
- **Tab**: Focus field
- **Space/Enter**: Open dropdown
- **↑/↓**: Navigate options
- **Enter**: Select option
- **Escape**: Close dropdown
- **Home**: First option
- **End**: Last option

## Accessibility Features

### ARIA Attributes
- `aria-required="true"` on select
- `aria-invalid="true"` when error
- `aria-describedby` links to error message
- Proper label association with `htmlFor`

### Screen Reader Announcements
- "Employment Type, required, combobox"
- "Select employment type" (placeholder)
- "Full Time (Permanent), option 1 of 2"
- "Part Time (Credit-Based), option 2 of 2"
- "Employment type is required" (error)

### Focus Indicators
- Clear orange ring on focus
- High contrast border
- Visible in all browsers
- Meets WCAG 2.1 AA standards

## Touch Targets

### Mobile Optimization
- **Minimum Height**: 48px (meets WCAG guidelines)
- **Tap Area**: Full width of field
- **Spacing**: Adequate space between fields
- **Dropdown Options**: 48px height each

## Animation & Transitions

### Transitions
- **Property**: All
- **Duration**: 300ms
- **Easing**: Ease-in-out
- **Applies To**: Border, ring, background

### Dropdown Animation
- **Open**: Fade in + slide down
- **Close**: Fade out + slide up
- **Duration**: 200ms
- **Easing**: Ease-out

## Browser-Specific Notes

### Chrome/Edge
- Native select styling
- Smooth animations
- Full feature support

### Firefox
- Native select styling
- Smooth animations
- Full feature support

### Safari
- Native select styling
- iOS: Native picker on mobile
- Full feature support

### Mobile Browsers
- iOS: Native picker wheel
- Android: Native dropdown
- Touch-optimized
- Full feature support

## Design Consistency

### Matches Existing Fields
✅ Same height (48px)
✅ Same border radius (8px)
✅ Same padding (12px)
✅ Same focus ring (orange)
✅ Same error styling (red)
✅ Same typography
✅ Same spacing

### Teacher Theme
✅ Orange focus color (not green)
✅ Consistent with other teacher forms
✅ Matches step 3 styling
✅ Follows existing patterns
