# Student List Page - Visual Guide

## Layout Structure

### Desktop View (≥1024px)
```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │ 👥 Total     │  │ ✓ Active     │  │ 💔 Sick      │        │
│  │    6         │  │    4         │  │    2         │        │
│  └──────────────┘  └──────────────┘  └──────────────┘        │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ 🔍 Search...  [Program ▼] [Class ▼] [Status ▼]          │ │
│  │                                                           │ │
│  │ Active filters: [Search: "x"] [×] [Program: CS] [×]     │ │
│  │                                                           │ │
│  │ [+ Add Student]                                          │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ 👤 Ahmad Hassan          CS-2024-001        [Active]     │ │
│  │ Computer Science | Fall 2024                             │ │
│  │ 📞 +1 (555) 111-2222                                     │ │
│  │                          [View] [Edit] [Delete]          │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ 👤 Sara Khan             CS-2024-002        [Active]     │ │
│  │ Computer Science | Fall 2024                             │ │
│  │ 📞 +1 (555) 222-3333                                     │ │
│  │                          [View] [Edit] [Delete]          │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Mobile View (<768px)
```
┌─────────────────────┐
│                     │
│  ┌───────────────┐  │
│  │ 👥 Total      │  │
│  │    6          │  │
│  └───────────────┘  │
│                     │
│  ┌───────────────┐  │
│  │ ✓ Active      │  │
│  │    4          │  │
│  └───────────────┘  │
│                     │
│  ┌───────────────┐  │
│  │ 💔 Sick       │  │
│  │    2          │  │
│  └───────────────┘  │
│                     │
│  ┌───────────────┐  │
│  │ 🔍 Search...  │  │
│  └───────────────┘  │
│                     │
│  ┌───────────────┐  │
│  │ Program ▼     │  │
│  └───────────────┘  │
│                     │
│  ┌───────────────┐  │
│  │ Class ▼       │  │
│  └───────────────┘  │
│                     │
│  ┌───────────────┐  │
│  │ Status ▼      │  │
│  └───────────────┘  │
│                     │
│  Active filters:    │
│  [Search: "x"] [×]  │
│                     │
│  ┌───────────────┐  │
│  │ + Add Student │  │
│  └───────────────┘  │
│                     │
│  ┌───────────────┐  │
│  │ 👤 Ahmad      │  │
│  │ CS-2024-001   │  │
│  │ [Active]      │  │
│  │               │  │
│  │ 🎓 CS         │  │
│  │ 📅 Fall 2024  │  │
│  │               │  │
│  │ [View] [Edit] │  │
│  │ [Delete]      │  │
│  └───────────────┘  │
│                     │
└─────────────────────┘
```

## Color Scheme

### Statistics Cards

#### Total Students (Green)
- Background: `from-green-50 to-green-100/50`
- Text: `text-green-600` (label), `text-green-700` (number)
- Icon Background: `bg-green-600`
- Icon: Users (white)

#### Active Students (Blue)
- Background: `from-blue-50 to-blue-100/50`
- Text: `text-blue-600` (label), `text-blue-700` (number)
- Icon Background: `bg-blue-600`
- Icon: UserCheck (white)

#### Sick Students (Red)
- Background: `from-red-50 to-red-100/50`
- Text: `text-red-600` (label), `text-red-700` (number)
- Icon Background: `bg-red-600`
- Icon: HeartPulse (white)

### Search & Filter Section
- Card Background: White
- Border: `border-slate-200/60`
- Shadow: `shadow-lg`
- Border Radius: `rounded-2xl`

### Search Input
- Height: 48px (`h-12`)
- Border: `border-slate-200`
- Focus Border: `border-green-500`
- Focus Ring: `ring-green-100`
- Border Radius: `rounded-xl`

### Filter Dropdowns
- Same styling as search input
- Filter icon: `text-slate-400`
- Positioned left with `pl-10`

### Active Filter Badges
- **Search**: `bg-green-100 text-green-800`
- **Program**: `bg-blue-100 text-blue-800`
- **Class**: `bg-purple-100 text-purple-800`
- **Status**: `bg-orange-100 text-orange-800`
- Border Radius: `rounded-full`
- Padding: `px-3 py-1`
- Font Size: `text-xs`

### Add Student Button
- Background: `bg-green-600`
- Hover: `bg-green-700`
- Text: White
- Shadow: `shadow-lg`
- Hover Shadow: `shadow-xl`
- Border Radius: `rounded-xl`
- Focus Ring: `ring-green-100`

### Student Cards
- Background: White
- Border: `border-slate-200`
- Border Radius: `rounded-xl`
- Hover: `shadow-md` (simple shadow, no animation)
- Padding: `p-6`

### Status Badges
- **Active**: `bg-green-100 text-green-800 border-green-200`
- **Sick**: `bg-red-100 text-red-800 border-red-200`
- Variant: `outline`

## Spacing

### Page Layout
- Stats Cards Gap: `gap-4`
- Section Margin Bottom: `mb-6`
- Card Padding: `p-6`

### Search & Filter Section
- Flex Gap: `gap-4`
- Active Filters Margin Top: `mt-4`
- Active Filters Padding Top: `pt-4`
- Add Button Margin Top: `mt-4`
- Add Button Padding Top: `pt-4`

### Student Cards
- Space Between Cards: `space-y-4`
- Card Padding: `p-6`

## Typography

### Statistics Cards
- Label: `text-sm font-medium`
- Number: `text-3xl font-bold`

### Search & Filter
- Placeholder: `text-sm`
- Active Filters Label: `text-sm font-medium`
- Badge Text: `text-xs font-medium`

### Student Cards
- Name: `text-lg font-semibold`
- ID: `text-sm text-slate-500`
- Details: `text-sm`

## Icons

### Statistics Cards
- Size: `h-6 w-6`
- Color: White
- Background: Colored circle (`p-3 rounded-xl`)

### Search & Filter
- Search Icon: `h-4 w-4 text-slate-400`
- Filter Icons: `h-4 w-4 text-slate-400`

### Student Cards
- Avatar Circle: `h-12 w-12`
- Info Icons: `h-4 w-4`
- Button Icons: `h-4 w-4`

## Interactions

### Hover States
- **Stats Cards**: No hover effect
- **Search Input**: Focus ring appears
- **Filter Dropdowns**: Focus ring appears
- **Student Cards**: Shadow increases slightly
- **Buttons**: Background darkens, shadow increases
- **Filter Badges**: × button darkens

### Focus States
- **Search Input**: Green border + ring
- **Filter Dropdowns**: Green border + ring
- **Buttons**: Ring appears
- **Links**: Outline appears

### Active States
- **Filter Badges**: Displayed when filter active
- **Selected Filter Option**: Check icon in dropdown

## Responsive Breakpoints

### Mobile (<768px)
- `grid-cols-1` for stats
- `flex-col` for filters
- `w-full` for buttons
- Stack all elements vertically

### Tablet (768px - 1023px)
- `md:grid-cols-3` for stats
- `sm:flex-row` for some elements
- `sm:w-48` for filters

### Desktop (≥1024px)
- `lg:flex-row` for search/filter row
- `lg:w-auto` for filter container
- Full horizontal layout

## Accessibility

### Keyboard Navigation
- Tab through all interactive elements
- Enter to activate buttons/dropdowns
- Arrow keys in dropdowns
- Escape to close dropdowns

### Screen Readers
- Proper labels on all inputs
- ARIA labels on icons
- Status announcements
- Filter state announcements

### Touch Targets
- Minimum 44px height for mobile
- Adequate spacing between elements
- Large enough buttons

## Performance

### No Animations
- Removed scale transforms
- Removed complex transitions
- Simple shadow transition only
- Better performance on mobile

### Efficient Filtering
- Memoized filter options
- Fast array operations
- No unnecessary re-renders

## Browser Support
✅ Chrome/Edge 90+
✅ Firefox 88+
✅ Safari 14+
✅ Mobile browsers
