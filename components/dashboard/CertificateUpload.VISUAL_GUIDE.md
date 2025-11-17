# CertificateUpload Component - Visual Guide

## Component Structure

```
┌─────────────────────────────────────────────────────────────┐
│                    CertificateUpload                        │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │              Upload Zone (Dashed Border)              │ │
│  │                                                       │ │
│  │         ┌─────────────┐                              │ │
│  │         │   Upload    │  64x64 icon container        │ │
│  │         │    Icon     │  (slate-200 / blue-100)      │ │
│  │         └─────────────┘                              │ │
│  │                                                       │ │
│  │    Drop your file here or click to browse           │ │
│  │    Supported formats: PDF, JPG, PNG (Max 5MB)       │ │
│  │                                                       │ │
│  │    ┌─────────────────────────────────────────┐      │ │
│  │    │ Progress Bar (when uploading)           │      │ │
│  │    │ ████████████░░░░░░░░░░░░░░░░░░░░ 45%   │      │ │
│  │    └─────────────────────────────────────────┘      │ │
│  │                                                       │ │
│  │    ⚠️ Error message (if validation fails)           │ │
│  │                                                       │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  Uploaded Certificates                                      │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ File Card 1 (shadow-md, borderless)                  │ │
│  │                                                       │ │
│  │  ┌────┐  medical-certificate.pdf    [Approved]      │ │
│  │  │ 📄 │  512 KB • Jan 15, 2024       👁️  🗑️        │ │
│  │  └────┘                                              │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ File Card 2 (shadow-md, borderless)                  │ │
│  │                                                       │ │
│  │  ┌────┐  sick-leave-document.jpg    [Pending]       │ │
│  │  │ 🖼️ │  2.5 MB • Jan 20, 2024       👁️  🗑️        │ │
│  │  └────┘                                              │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ File Card 3 (shadow-md, borderless)                  │ │
│  │                                                       │ │
│  │  ┌────┐  hospital-report.pdf        [Rejected]      │ │
│  │  │ 📄 │  768 KB • Jan 25, 2024       👁️  🗑️        │ │
│  │  └────┘                                              │ │
│  │  ─────────────────────────────────────────────────   │ │
│  │  ⚠️ Rejection reason: Document is not clear...      │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## States

### 1. Default State
```
┌─────────────────────────────────────┐
│  Upload Zone                        │
│  • Border: 2px dashed slate-300     │
│  • Background: slate-50             │
│  • Icon: slate-600                  │
│  • Cursor: pointer                  │
└─────────────────────────────────────┘
```

### 2. Hover/Drag State
```
┌─────────────────────────────────────┐
│  Upload Zone (Active)               │
│  • Border: 2px dashed blue-400      │
│  • Background: gradient blue-violet │
│  • Icon: blue-600, scaled 1.1x      │
│  • Cursor: pointer                  │
└─────────────────────────────────────┘
```

### 3. Uploading State
```
┌─────────────────────────────────────┐
│  Upload Zone (Uploading)            │
│  • Border: 2px dashed blue-400      │
│  • Background: blue-50              │
│  • Text: "Uploading..."             │
│  • Progress bar visible             │
│  • Cursor: not-allowed              │
└─────────────────────────────────────┘
```

### 4. Error State
```
┌─────────────────────────────────────┐
│  Upload Zone                        │
│  • Normal appearance                │
│  • Error message below:             │
│    ┌───────────────────────────┐   │
│    │ ❌ File size exceeds 5MB  │   │
│    │    (red-50 bg, red-600)   │   │
│    └───────────────────────────┘   │
└─────────────────────────────────────┘
```

## File Card States

### Approved
```
┌─────────────────────────────────────────────┐
│  ┌────┐  filename.pdf                      │
│  │ 📄 │  512 KB • Jan 15, 2024             │
│  └────┘                                     │
│         [✓ Approved]  👁️  🗑️              │
│         emerald-100 bg                      │
└─────────────────────────────────────────────┘
```

### Pending
```
┌─────────────────────────────────────────────┐
│  ┌────┐  filename.pdf                      │
│  │ 📄 │  512 KB • Jan 15, 2024             │
│  └────┘                                     │
│         [⏳ Pending]  👁️  🗑️              │
│         amber-100 bg                        │
└─────────────────────────────────────────────┘
```

### Rejected
```
┌─────────────────────────────────────────────┐
│  ┌────┐  filename.pdf                      │
│  │ 📄 │  512 KB • Jan 15, 2024             │
│  └────┘                                     │
│         [✗ Rejected]  👁️  🗑️              │
│         red-100 bg                          │
│  ───────────────────────────────────────    │
│  ⚠️ Rejection reason: Document unclear     │
└─────────────────────────────────────────────┘
```

## Animations

### Upload Zone Icon
```
Default → Drag
  scale: 1 → 1.1
  duration: 0.2s
  background: slate-200 → blue-100
  icon color: slate-600 → blue-600
```

### Progress Bar
```
Initial → Complete
  width: 0% → 100%
  duration: varies (based on upload)
  easing: ease-out
  gradient: blue-500 → violet-500
```

### File List Items
```
Enter Animation:
  opacity: 0 → 1
  y: 10px → 0
  duration: 0.3s
  stagger: 50ms per item

Exit Animation:
  opacity: 1 → 0
  x: 0 → -20px
  duration: 0.3s
```

### Hover Effects
```
File Card:
  shadow: shadow-md → shadow-lg
  duration: 0.3s

Action Buttons:
  scale: 1 → 1.1
  duration: 0.2s
```

## Color Palette

### Upload Zone
- **Default Border**: `#CBD5E1` (slate-300)
- **Active Border**: `#60A5FA` (blue-400)
- **Default Background**: `#F8FAFC` (slate-50)
- **Active Background**: Gradient from `#EFF6FF` (blue-50) to `#F5F3FF` (violet-50)
- **Icon Container**: `#E2E8F0` (slate-200) / `#DBEAFE` (blue-100)
- **Icon Color**: `#475569` (slate-600) / `#2563EB` (blue-600)

### Status Badges
- **Pending**: 
  - Background: `#FEF3C7` (amber-100)
  - Text: `#B45309` (amber-700)
- **Approved**: 
  - Background: `#D1FAE5` (emerald-100)
  - Text: `#047857` (emerald-700)
- **Rejected**: 
  - Background: `#FEE2E2` (red-100)
  - Text: `#B91C1C` (red-700)

### Progress Bar
- **Background**: `#E2E8F0` (slate-200)
- **Fill**: Gradient from `#3B82F6` (blue-500) to `#8B5CF6` (violet-500)

## Spacing & Sizing

### Upload Zone
- **Padding**: `2rem` (p-8)
- **Border Radius**: `1rem` (rounded-2xl)
- **Icon Container**: `64px × 64px` (w-16 h-16)
- **Icon Size**: `32px × 32px` (w-8 h-8)

### File Cards
- **Padding**: `1rem` (p-4)
- **Border Radius**: `0.75rem` (rounded-xl)
- **Icon Container**: `48px × 48px` (w-12 h-12)
- **Icon Size**: `24px × 24px` (w-6 h-6)
- **Gap between elements**: `1rem` (gap-4)

### Status Badges
- **Padding**: `0.375rem 0.75rem` (px-3 py-1.5)
- **Border Radius**: `0.5rem` (rounded-lg)
- **Icon Size**: `14px × 14px` (w-3.5 h-3.5)
- **Font Size**: `0.75rem` (text-xs)

### Action Buttons
- **Size**: `32px × 32px` (icon-sm)
- **Icon Size**: `16px × 16px` (w-4 h-4)
- **Gap between buttons**: `0.5rem` (gap-2)

## Responsive Behavior

### Mobile (< 640px)
- Upload zone: Full width
- File cards: Full width, stacked
- Text sizes: Slightly smaller
- Touch targets: Minimum 44px

### Tablet (640px - 1024px)
- Upload zone: Full width
- File cards: Full width, stacked
- Comfortable spacing

### Desktop (> 1024px)
- Upload zone: Max width constrained
- File cards: Full width within container
- Optimal spacing and sizing

## Accessibility Features

### Keyboard Navigation
```
Tab → Focus upload zone
Enter/Space → Open file picker
Tab → Navigate to file cards
Tab → Navigate to action buttons
Enter/Space → Activate buttons
```

### Screen Reader Announcements
- "Upload medical certificate, button"
- "File: [filename], [size], uploaded [date]"
- "Status: [Pending/Approved/Rejected]"
- "Preview file, button"
- "Delete file, button"

### Focus Indicators
- Visible focus ring on all interactive elements
- High contrast focus indicators
- Keyboard navigation clearly visible

## File Type Icons

### PDF Files
```
┌────┐
│ 📄 │  FileText icon
└────┘  blue-600 color
```

### Image Files (JPG, PNG)
```
┌────┐
│ 🖼️ │  Image icon
└────┘  blue-600 color
```

## Validation Messages

### File Type Error
```
❌ Invalid file type. Please upload PDF, JPG, or PNG files only.
```

### File Size Error
```
❌ File size exceeds 5MB limit. Please upload a smaller file.
```

### Upload Error
```
❌ Failed to upload file. Please try again.
```

### Delete Error
```
❌ Failed to delete file. Please try again.
```

---

This visual guide provides a complete overview of the CertificateUpload component's appearance, behavior, and interactions.
