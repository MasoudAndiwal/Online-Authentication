# Mark Attendance Page - Requirements Document

## Introduction

The Mark Attendance page is a focused, class-based attendance tracking interface for the University Attendance System. This feature allows Office administrators and Teachers to mark student attendance for specific classes with an intuitive, modern UI that matches the existing design system. The page follows the established design patterns from the All Classes, Students, and Teachers pages, using the orange/amber color scheme for consistency.

## Glossary

- **Class**: A group of students enrolled together (e.g., "Class A", "Class B")
- **Session**: Time period for classes - either MORNING or AFTERNOON
- **Attendance Status**: Student's presence state - Present, Absent, Sick, or Leave
- **Mark Attendance**: The action of recording student attendance for a specific date and class

## Requirements

### Requirement 1: Class Selection Interface

**User Story:** As an Office administrator or Teacher, I want to select a class to mark attendance, so that I can efficiently record attendance for the correct group of students.

#### Acceptance Criteria

1. WHEN accessing the Mark Attendance page THEN the system SHALL display a class selection interface with all available classes
2. WHEN viewing the class list THEN the system SHALL show class cards with name, session (Morning/Afternoon), major, semester, and student count
3. WHEN filtering classes THEN the system SHALL provide search by class name and filter by session (All/Morning/Afternoon)
4. WHEN a class card is displayed THEN the system SHALL use gradient backgrounds matching the All Classes page design (orange-to-amber gradient)
5. WHEN hovering over a class card THEN the system SHALL provide smooth hover effects with scale transformation and shadow elevation
6. WHEN clicking a class card THEN the system SHALL navigate to the attendance marking interface for that specific class
7. WHEN no classes exist THEN the system SHALL display an empty state with a message to create classes first
8. WHEN loading classes THEN the system SHALL show skeleton loading states with shimmer effects

### Requirement 2: Date Selection and Navigation

**User Story:** As an Office administrator or Teacher, I want to select the date for attendance marking, so that I can record attendance for the correct day.

#### Acceptance Criteria

1. WHEN entering the attendance marking interface THEN the system SHALL default to today's date
2. WHEN viewing the date selector THEN the system SHALL display the current selected date prominently with day name and formatted date
3. WHEN changing the date THEN the system SHALL provide a date picker with calendar interface
4. WHEN selecting a date THEN the system SHALL update the attendance grid to show data for that date
5. WHEN navigating dates THEN the system SHALL provide Previous Day and Next Day navigation buttons
6. WHEN the selected date is today THEN the system SHALL disable the Next Day button
7. WHEN displaying the date THEN the system SHALL use clear typography with the format "Day, Month DD, YYYY" (e.g., "Wednesday, October 29, 2025")

### Requirement 3: Student Attendance Grid Interface

**User Story:** As an Office administrator or Teacher, I want to view all students in the selected class with their attendance status, so that I can efficiently mark attendance for each student.

#### Acceptance Criteria

1. WHEN viewing the attendance grid THEN the system SHALL display all students enrolled in the selected class
2. WHEN displaying each student THEN the system SHALL show student name, student ID, and current attendance status
3. WHEN showing student information THEN the system SHALL use card-based layout with avatar icons matching the Students page design
4. WHEN displaying attendance status THEN the system SHALL use color-coded status badges:
   - 🟢 Present: Green (emerald-500 #10B981)
   - 🔴 Absent: Red (red-500 #EF4444)
   - 🟡 Sick: Yellow/Amber (amber-500 #F59E0B)
   - 🔵 Leave: Blue/Cyan (cyan-500 #06B6D4)
   - ⚪ Not Marked: Gray (slate-300 #CBD5E1)
5. WHEN no attendance is marked THEN the system SHALL default all students to "Not Marked" status
6. WHEN loading student data THEN the system SHALL show skeleton loading states
7. WHEN no students are enrolled THEN the system SHALL display an empty state message

### Requirement 4: Attendance Status Marking

**User Story:** As an Office administrator or Teacher, I want to mark individual student attendance with different statuses, so that I can accurately record each student's presence.

#### Acceptance Criteria

1. WHEN clicking on a student's status badge THEN the system SHALL open a status selection dropdown or modal
2. WHEN selecting a status THEN the system SHALL provide four options: Present, Absent, Sick, Leave
3. WHEN changing status THEN the system SHALL update the badge color and icon immediately with smooth animation
4. WHEN marking status THEN the system SHALL use animated transitions (scale, fade, color change)
5. WHEN a status is selected THEN the system SHALL show visual confirmation with a brief success animation
6. WHEN hovering over status options THEN the system SHALL provide hover effects with scale and shadow
7. WHEN status buttons are displayed THEN the system SHALL use large, touch-friendly buttons (minimum 44px height)
8. WHEN marking attendance THEN the system SHALL store changes in local state (frontend only, no backend calls yet)

### Requirement 5: Bulk Actions and Quick Marking

**User Story:** As an Office administrator or Teacher, I want to mark attendance for multiple students at once, so that I can save time when most students have the same status.

#### Acceptance Criteria

1. WHEN viewing the attendance grid THEN the system SHALL provide a "Mark All Present" button at the top
2. WHEN clicking "Mark All Present" THEN the system SHALL set all students to Present status with animated confirmation
3. WHEN bulk marking THEN the system SHALL animate status changes in sequence with staggered delays for visual feedback
4. WHEN using bulk actions THEN the system SHALL provide a confirmation dialog before applying changes
5. WHEN bulk action is confirmed THEN the system SHALL show a toast notification with success message
6. WHEN individual statuses are already marked THEN the system SHALL provide an "Override All" option in the confirmation dialog

### Requirement 6: Summary Statistics Display

**User Story:** As an Office administrator or Teacher, I want to see attendance statistics for the selected class and date, so that I can quickly understand the attendance situation.

#### Acceptance Criteria

1. WHEN viewing the attendance page THEN the system SHALL display summary statistics at the top
2. WHEN showing statistics THEN the system SHALL include:
   - Total Students (with Users icon, green gradient)
   - Present Count (with CheckCircle icon, emerald gradient)
   - Absent Count (with XCircle icon, red gradient)
   - Sick Count (with Heart icon, amber gradient)
   - Leave Count (with Calendar icon, cyan gradient)
   - Not Marked Count (with AlertCircle icon, slate gradient)
3. WHEN attendance status changes THEN the system SHALL update statistics in real-time with animated count transitions
4. WHEN displaying statistics THEN the system SHALL use the same card design as All Classes page with gradient backgrounds
5. WHEN statistics are zero THEN the system SHALL still display the card with "0" value

### Requirement 7: Search and Filter Functionality

**User Story:** As an Office administrator or Teacher, I want to search and filter students in the attendance grid, so that I can quickly find specific students.

#### Acceptance Criteria

1. WHEN viewing the attendance grid THEN the system SHALL provide a search input at the top
2. WHEN typing in search THEN the system SHALL filter students by name or student ID in real-time
3. WHEN filtering THEN the system SHALL provide a status filter dropdown (All, Present, Absent, Sick, Leave, Not Marked)
4. WHEN filters are applied THEN the system SHALL update the grid immediately with smooth animations
5. WHEN search/filter results in no matches THEN the system SHALL display "No students found" message
6. WHEN clearing filters THEN the system SHALL restore the full student list

### Requirement 8: Responsive Design and Mobile Optimization

**User Story:** As an Office administrator or Teacher, I want the attendance page to work perfectly on all devices, so that I can mark attendance from my phone or tablet.

#### Acceptance Criteria

1. WHEN accessing on mobile THEN the system SHALL display a single-column layout for student cards
2. WHEN accessing on tablet THEN the system SHALL display a two-column grid layout
3. WHEN accessing on desktop THEN the system SHALL display a three-column grid layout
4. WHEN using touch devices THEN the system SHALL provide touch-optimized buttons (minimum 44px)
5. WHEN on mobile THEN the system SHALL stack statistics cards vertically
6. WHEN on mobile THEN the system SHALL provide a collapsible filter section to save space
7. WHEN rotating device THEN the system SHALL adapt layout smoothly with CSS transitions

### Requirement 9: Visual Design and Animations

**User Story:** As an Office administrator or Teacher, I want a beautiful, modern interface with smooth animations, so that marking attendance is a delightful experience.

#### Acceptance Criteria

1. WHEN viewing the page THEN the system SHALL use the orange/amber color scheme matching All Classes page
2. WHEN elements load THEN the system SHALL use staggered fade-in animations
3. WHEN hovering over interactive elements THEN the system SHALL provide scale (1.02x) and shadow elevation effects
4. WHEN clicking buttons THEN the system SHALL provide tactile feedback with scale-down animation
5. WHEN status changes THEN the system SHALL use smooth color transitions (300ms duration)
6. WHEN displaying cards THEN the system SHALL use rounded corners (rounded-2xl), shadows, and gradient backgrounds
7. WHEN showing icons THEN the system SHALL use Lucide React icons with consistent sizing
8. WHEN displaying badges THEN the system SHALL use pill-shaped badges with icon + text
9. WHEN loading THEN the system SHALL use skeleton screens with shimmer wave animation
10. WHEN showing success/error THEN the system SHALL use toast notifications with slide-in animations

### Requirement 10: Navigation and Layout Structure

**User Story:** As an Office administrator or Teacher, I want clear navigation and consistent layout, so that I can easily move between attendance marking and other pages.

#### Acceptance Criteria

1. WHEN viewing the page THEN the system SHALL use ModernDashboardLayout component for consistency
2. WHEN in class selection view THEN the system SHALL show "Mark Attendance" as the page title
3. WHEN in attendance marking view THEN the system SHALL show "Mark Attendance - [Class Name]" as the page title
4. WHEN marking attendance THEN the system SHALL provide a "Back to Classes" button to return to class selection
5. WHEN navigating THEN the system SHALL use Next.js router for smooth page transitions
6. WHEN the page loads THEN the system SHALL show the current path in the sidebar as active
7. WHEN using breadcrumbs THEN the system SHALL show: Dashboard > Attendance > Mark Attendance

### Requirement 11: Empty States and Error Handling

**User Story:** As an Office administrator or Teacher, I want clear feedback when there are no classes or students, so that I understand what action to take.

#### Acceptance Criteria

1. WHEN no classes exist THEN the system SHALL display an empty state with:
   - Large icon (BookOpen or GraduationCap)
   - Heading: "No Classes Available"
   - Message: "Create classes first to start marking attendance"
   - Button: "Go to All Classes" (navigates to /dashboard/all-classes)
2. WHEN a class has no students THEN the system SHALL display an empty state with:
   - Large icon (Users)
   - Heading: "No Students Enrolled"
   - Message: "Add students to this class to mark attendance"
   - Button: "Go to Students" (navigates to /dashboard/students)
3. WHEN loading fails THEN the system SHALL display an error state with:
   - Large icon (AlertCircle)
   - Heading: "Failed to Load Data"
   - Message: Error description
   - Button: "Try Again" (retries the fetch)
4. WHEN displaying empty states THEN the system SHALL use centered layout with gradient background cards

### Requirement 12: Data Persistence (Frontend Only)

**User Story:** As an Office administrator or Teacher, I want my attendance markings to be saved locally while I work, so that I don't lose data if I navigate away temporarily.

#### Acceptance Criteria

1. WHEN marking attendance THEN the system SHALL store changes in React state
2. WHEN navigating between dates THEN the system SHALL maintain marked attendance in state
3. WHEN refreshing the page THEN the system SHALL reset to default state (no persistence across page reloads yet)
4. WHEN marking attendance THEN the system SHALL show visual confirmation that changes are saved locally
5. WHEN displaying saved status THEN the system SHALL show a "Changes saved locally" indicator
6. WHEN backend is implemented later THEN the system SHALL be ready to integrate API calls for persistence

## Design Patterns to Follow

### Color Scheme (from All Classes page)
- Primary: Orange-600 (#EA580C) to Amber-600 (#D97706) gradients
- Statistics Cards: Orange, Amber, Indigo, Green gradients
- Status Colors: Green (Present), Red (Absent), Amber (Sick), Cyan (Leave), Slate (Not Marked)

### Component Patterns
- Use `ModernDashboardLayout` for page wrapper
- Use `Card` and `CardContent` from shadcn/ui
- Use `Button` with gradient backgrounds and hover effects
- Use `Input` with icon prefixes for search
- Use `CustomSelect` for dropdowns
- Use `Badge` for status indicators
- Use Lucide React icons throughout

### Animation Patterns
- Fade-in on mount: `animate-in fade-in duration-500`
- Slide-in with stagger: `animate-in slide-in-from-bottom-4 duration-500` with `animationDelay`
- Hover scale: `hover:scale-102 transition-all duration-200`
- Loading: Skeleton screens with shimmer effect
- Toast notifications: Sonner with slide-in animations

### Layout Patterns
- Responsive grid: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`
- Statistics cards: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6`
- Card styling: `rounded-2xl shadow-lg border-slate-200`
- Spacing: Consistent padding (p-6) and margins (mb-6, mb-8)
