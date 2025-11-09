# Notification Center Visual Guide

## Component Overview

This guide provides a visual reference for the Notification Center implementation.

## 1. Notification Trigger Button

```
┌─────────────────┐
│  🔔  [Badge: 5] │  ← Unread count badge
└─────────────────┘
     ↑
  Bell icon with
  orange ring when
  unread exists
```

**Features:**
- Bell icon in slate-700
- Red badge with unread count (shows "99+" for counts over 99)
- Orange ring effect when unread notifications exist
- Smooth scale animation when badge appears
- Hover effect: Background changes to orange-50

## 2. Notification Panel (Slide-out)

```
┌────────────────────────────────────────┐
│  🔔 Notifications                  ✕   │ ← Header
│  5 unread notifications                │
│  ┌──────────────────────────────────┐  │
│  │ [Mark all read] [⚙️ Settings]   │  │ ← Actions
│  └──────────────────────────────────┘  │
├────────────────────────────────────────┤
│                                        │
│  ┌──────────────────────────────────┐ │
│  │ ● [⚠️] Student at Risk           │ │ ← Unread
│  │   Ahmad Hassan is approaching... │ │   indicator
│  │   [Ahmad Hassan] [CS-101] [محروم]│ │
│  │   🕐 30m ago              [✓] [🗑]│ │
│  └──────────────────────────────────┘ │
│                                        │
│  ┌──────────────────────────────────┐ │
│  │   [📅] Schedule Change           │ │ ← Read
│  │   Your CS-201 class schedule...  │ │   (no bar)
│  │   [CS-201]                       │ │
│  │   🕐 2h ago                  [🗑] │ │
│  └──────────────────────────────────┘ │
│                                        │
│  ┌──────────────────────────────────┐ │
│  │   [ℹ️] System Update             │ │
│  │   A new feature has been added...│ │
│  │   🕐 5h ago                  [🗑] │ │
│  └──────────────────────────────────┘ │
│                                        │
└────────────────────────────────────────┘
```

**Panel Features:**
- Width: Full width on mobile, max 28rem on desktop
- Background: Gradient from slate-50 to white
- Border: None (border-0)
- Animation: Slides in from right with backdrop blur

**Notification Card Features:**
- Unread: White background with left orange bar
- Read: Semi-transparent white background
- Hover: Shadow elevation increases
- Icons: Type-specific colored backgrounds
- Actions: Mark as read (✓) and delete (🗑) buttons
- Metadata: Badges for student name, class, risk type
- Timestamp: Relative time with clock icon

## 3. Empty State

```
┌────────────────────────────────────────┐
│  🔔 Notifications                  ✕   │
│  All caught up                         │
├────────────────────────────────────────┤
│                                        │
│              ┌──────────┐              │
│              │    🔔    │              │
│              │  Orange  │              │
│              │ Gradient │              │
│              └──────────┘              │
│                                        │
│         No notifications               │
│                                        │
│    You're all caught up! We'll        │
│    notify you when there's            │
│    something new.                     │
│                                        │
└────────────────────────────────────────┘
```

## 4. Notification Settings Panel

```
┌────────────────────────────────────────┐
│  🔔 Notification Settings          ✕   │
│  Customize how you receive             │
│  notifications                         │
├────────────────────────────────────────┤
│                                        │
│  ┌──────────────────────────────────┐ │
│  │ 🔔 Notification Types            │ │
│  │ Choose which types...            │ │
│  │                                  │ │
│  │ Student Risk Alerts [Important]  │ │
│  │ Get notified when...      [ON] ◯ │ │
│  │                                  │ │
│  │ System Updates                   │ │
│  │ Receive notifications...  [ON] ◯ │ │
│  │                                  │ │
│  │ Schedule Changes                 │ │
│  │ Get alerts when...        [ON] ◯ │ │
│  └──────────────────────────────────┘ │
│                                        │
│  ┌──────────────────────────────────┐ │
│  │ 💬 Delivery Methods              │ │
│  │ Choose how you want...           │ │
│  │                                  │ │
│  │ In-App Notifications             │ │
│  │ Show notifications...     [ON] ◯ │ │
│  │                                  │ │
│  │ Email Notifications              │ │
│  │ Send notifications...    [OFF] ◯ │ │
│  └──────────────────────────────────┘ │
│                                        │
│  ┌──────────────────────────────────┐ │
│  │ 📧 Digest Summary                │ │
│  │ Receive periodic summaries...    │ │
│  │                                  │ │
│  │ Enable Digest             [ON] ◯ │ │
│  │                                  │ │
│  │ ┌────────────────────────────┐   │ │
│  │ │ Frequency                  │   │ │
│  │ │ [Daily] [Weekly] [Never]   │   │ │
│  │ │                            │   │ │
│  │ │ Delivery Time              │   │ │
│  │ │ 🕐 08:00                   │   │ │
│  │ └────────────────────────────┘   │ │
│  └──────────────────────────────────┘ │
│                                        │
│  ┌──────────────────────────────────┐ │
│  │ ⚠️ Risk Thresholds               │ │
│  │ Configure when to receive...     │ │
│  │                                  │ │
│  │ محروم Status Alert [Critical]    │ │
│  │ Notify when...            [ON] ◯ │ │
│  │                                  │ │
│  │ تصدیق طلب Status Alert           │ │
│  │ Notify when...            [ON] ◯ │ │
│  │                                  │ │
│  │ Absence Count Alert              │ │
│  │ Notify after...           [ON] ◯ │ │
│  │                                  │ │
│  │ ┌────────────────────────────┐   │ │
│  │ │ Absence Threshold          │   │ │
│  │ │ ━━━━━━━━━━━━━━━━━━━━━━━━  │   │ │
│  │ │                        [3] │   │ │
│  │ └────────────────────────────┘   │ │
│  └──────────────────────────────────┘ │
│                                        │
│  ┌──────────────────────────────────┐ │
│  │ 🕐 Quiet Hours                   │ │
│  │ Pause notifications during...    │ │
│  │                                  │ │
│  │ Enable Quiet Hours       [OFF] ◯ │ │
│  └──────────────────────────────────┘ │
│                                        │
├────────────────────────────────────────┤
│  [Cancel]  [Save Changes]              │ ← Footer
└────────────────────────────────────────┘   (appears when
                                             changes made)
```

## 5. Notification Type Colors

### Student Risk (Red Theme)
```
┌──────────────────────────────────┐
│ [⚠️] Student at Risk             │
│ bg-red-50, text-red-700          │
└──────────────────────────────────┘
```

### System Update (Blue Theme)
```
┌──────────────────────────────────┐
│ [ℹ️] System Update               │
│ bg-blue-50, text-blue-700        │
└──────────────────────────────────┘
```

### Schedule Change (Orange Theme)
```
┌──────────────────────────────────┐
│ [📅] Schedule Change             │
│ bg-orange-50, text-orange-700    │
└──────────────────────────────────┘
```

## 6. Interactive States

### Notification Card Hover
```
Before:                    After:
┌──────────────────┐      ┌──────────────────┐
│ [⚠️] Title       │  →   │ [⚠️] Title   [🗑]│
│ Message...       │      │ Message...       │
│ 🕐 30m ago       │      │ 🕐 30m ago       │
└──────────────────┘      └──────────────────┘
                          Delete button appears
                          Shadow increases
```

### Mark as Read Animation
```
Step 1: Unread          Step 2: Fading         Step 3: Read
┌──────────────┐        ┌──────────────┐       ┌──────────────┐
│● [⚠️] Title  │   →    │  [⚠️] Title  │  →    │  [⚠️] Title  │
│  Message...  │        │  Message...  │       │  Message...  │
└──────────────┘        └──────────────┘       └──────────────┘
Orange bar              Fading out             No bar
Solid white bg          Opacity 0.7            Semi-transparent
```

### Delete Animation
```
Step 1: Normal          Step 2: Sliding        Step 3: Removed
┌──────────────┐        ┌──────────────┐       
│ [⚠️] Title   │   →    │ [⚠️] Title   │  →    (Removed)
│ Message...   │        │ Message...   │       
└──────────────┘        └──────────────┘       
                        Slides right →
                        Fades out
```

## 7. Responsive Behavior

### Desktop (> 640px)
- Panel width: 28rem (448px)
- Full height slide-out from right
- Hover effects enabled
- All features visible

### Mobile (< 640px)
- Panel width: 100% (with padding)
- Full height slide-out from right
- Touch-optimized interactions
- Larger touch targets
- Simplified layout

## 8. Color Palette

### Orange Theme (Teacher Portal)
- Primary: `orange-600` (#ea580c)
- Light: `orange-50` (#fff7ed)
- Medium: `orange-100` (#ffedd5)
- Dark: `orange-700` (#c2410c)
- Gradient: `from-orange-50 to-orange-100/50`

### Status Colors
- Success/Present: `green-600`
- Warning/Risk: `red-600`
- Info: `blue-600`
- Neutral: `slate-600`

### Background Colors
- Panel: `from-slate-50 to-white`
- Card (unread): `white`
- Card (read): `white/60`
- Hover: `orange-50/30`

## 9. Typography

### Headings
- Panel Title: `text-xl font-bold text-slate-900`
- Section Title: `text-lg font-semibold text-slate-900`
- Card Title: `text-sm font-semibold text-slate-900`

### Body Text
- Description: `text-sm text-slate-600`
- Message: `text-sm text-slate-600`
- Timestamp: `text-xs text-slate-500`

### Badges
- Badge Text: `text-xs font-semibold`
- Badge Colors: Type-specific (orange, blue, red)

## 10. Spacing

### Panel
- Padding: `p-6` (24px)
- Gap between sections: `space-y-6` (24px)

### Cards
- Padding: `p-4` (16px)
- Gap between cards: `space-y-3` (12px)
- Internal gap: `gap-4` (16px)

### Buttons
- Padding: `px-4 py-2` (16px, 8px)
- Gap: `gap-2` (8px)
- Border radius: `rounded-xl` (12px)

## 11. Shadows

### Cards
- Default: `shadow-sm`
- Hover: `shadow-md`
- Active: `shadow-lg`

### Buttons
- Default: `shadow-sm`
- Primary: `shadow-lg shadow-orange-500/25`

### Icons
- Icon container: `shadow-lg shadow-{color}-500/25`

## 12. Animations

### Timing
- Fast: 300ms (delete, mark as read)
- Medium: 500ms (panel slide, fade)
- Slow: 1000ms (loading spinner)

### Easing
- Default: `ease-in-out`
- Slide: `ease-in-out`
- Fade: `linear`

### Effects
- Slide-in: `slide-in-from-right`
- Fade: `fade-in-0` / `fade-out-0`
- Scale: `scale-0` to `scale-1`
- Rotate: `rotate-360` (loading)

## Conclusion

This visual guide provides a comprehensive reference for the Notification Center UI. All components follow the established design system with consistent spacing, colors, and animations. The interface is fully responsive and accessible, providing an excellent user experience across all devices.
