# Class Information Components Usage Guide

## Overview
The class information section consists of three main components that display comprehensive class details, teacher information, and attendance policies.

## Components

### 1. ClassOverviewCard
Displays class details including name, code, semester, credits, and weekly schedule.

### 2. TeacherInformationCard
Shows teacher profile with avatar, contact information, and office hours.

### 3. AttendancePolicyCard
Explains attendance rules, thresholds, and FAQs about محروم and تصدیق طلب statuses.

### 4. ClassInformationSection
Main component that combines all three cards with responsive layout.

## Usage Example

See `/app/student/class-info/page.tsx` for a complete implementation example.

## Responsive Design
- Mobile (< 768px): Single column, stacked vertically
- Tablet (768px - 1023px): Two columns for teacher and policy cards
- Desktop (>= 1024px): Multi-column layout with full features

## Requirements Validated
- 5.1: Class name, code, semester, year, credits display
- 5.2: Attendance policy explanation
- 5.3: Weekly schedule grid
- 5.4: Teacher information and contact
- 7.1: Fully responsive design
- 9.1-9.4: Policy explanations and FAQs
- 15.4, 15.6: English interface with Arabic term translations
