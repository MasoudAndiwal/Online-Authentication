# Student Dashboard Components

This directory contains all React components for the student dashboard feature.

## Component Structure

### Main Dashboard Components
- `WelcomeSection.tsx` - Personalized greeting with gradient background
- `StatsCards.tsx` - Attendance statistics cards grid
- `StatusAlerts.tsx` - Warning banners for academic status
- `WeeklyCalendar.tsx` - Weekly attendance calendar view
- `ProgressChart.tsx` - Circular progress ring and breakdown
- `RecentActivity.tsx` - Recent attendance records timeline
- `CertificateUpload.tsx` - Medical certificate upload interface

## Design Principles

All components follow these design rules:
- ✅ Borderless cards with shadow-based depth
- ✅ Smooth micro animations and transitions
- ✅ Proper icon sizing (w-4 h-4, w-5 h-5, w-6 h-6)
- ✅ Strategic use of gradients (not everywhere)
- ✅ Fully responsive mobile-first design
- ❌ NO outline buttons or bordered cards
- ❌ NO unsized icons
- ❌ NO missing hover effects

## Usage

Components will be imported and used in `app/dashboard/page.tsx`.
