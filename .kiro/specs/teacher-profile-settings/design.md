# Design Document

## Overview

The Teacher Profile and Settings page will provide a comprehensive interface for teachers to view and manage their personal information, professional details, and account settings. The design follows the modern, gradient-based UI patterns established in the existing teacher dashboard, featuring smooth animations, responsive layouts, and an accessible user experience.

The page will be built using Next.js 14 with the App Router, React Server Components where appropriate, and client components for interactive elements. The design emphasizes a clean, modern aesthetic with subtle gradients (blue/purple theme), rounded corners, and smooth transitions - avoiding harsh black borders and maintaining visual consistency with the existing dashboard.

## Architecture

### Component Structure

```
app/teacher/dashboard/profile/
├── page.tsx                          # Main profile page (Server Component)
└── loading.tsx                       # Loading state

components/teacher/profile/
├── profile-header.tsx                # Profile header with avatar and basic info
├── profile-info-section.tsx          # Display personal information
├── profile-edit-dialog.tsx           # Modal for editing profile info
├── professional-info-section.tsx     # Display professional details
├── professional-edit-dialog.tsx      # Modal for editing professional info
├── contact-info-section.tsx          # Display contact information
├── contact-edit-dialog.tsx           # Modal for editing contact info
├── password-change-section.tsx       # Password change form
└── account-info-section.tsx          # Account metadata (created, updated dates)

lib/api/teacher-profile.ts            # API functions for profile operations
app/api/teacher/profile/route.ts      # API endpoint for profile updates
app/api/teacher/password/route.ts     # API endpoint for password changes
```

### Data Flow

1. **Page Load**: Server Component fetches teacher data from session and database
2. **Display**: Client components render profile information in sections
3. **Edit Actions**: User clicks edit button → Opens dialog with form
4. **Form Submission**: Client validates → Calls API route → Updates database → Refreshes UI
5. **Password Change**: Separate form → Validates current password → Updates with hashed password

## Components and Interfaces

### 1. Profile Page (page.tsx)

**Purpose**: Main entry point for the profile page

**Type**: Server Component (with client component sections)

**Props**: None (uses session data)

**Features**:
- Fetches teacher data from database using session ID
- Renders profile sections in a responsive grid layout
- Provides navigation back to dashboard
- Implements modern gradient background similar to dashboard

**Layout**:
```
┌─────────────────────────────────────────┐
│  ← Back to Dashboard                    │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │   Profile Header                  │ │
│  │   (Avatar, Name, Role, Status)    │ │
│  └───────────────────────────────────┘ │
│                                         │
│  ┌──────────────┐  ┌──────────────┐   │
│  │  Personal    │  │ Professional │   │
│  │  Info        │  │ Info         │   │
│  └──────────────┘  └──────────────┘   │
│                                         │
│  ┌──────────────┐  ┌──────────────┐   │
│  │  Contact     │  │ Password     │   │
│  │  Info        │  │ Change       │   │
│  └──────────────┘  └──────────────┘   │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │   Account Information             │ │
│  └───────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

### 2. Profile Header Component

**Purpose**: Display teacher's primary information with avatar

**Type**: Client Component

**Props**:
```typescript
interface ProfileHeaderProps {
  teacher: {
    firstName: string;
    lastName: string;
    fatherName: string;
    teacherId: string;
    status: TeacherStatus;
    username: string;
  };
}
```

**Features**:
- Large avatar with initials fallback
- Full name display with proper formatting
- Teacher ID badge
- Status indicator (Active/Inactive) with color coding
- Gradient background (blue/purple theme)
- Animated entrance with framer-motion

**Styling**:
- Rounded-3xl container with gradient background
- Shadow-2xl for depth
- Responsive padding (p-6 on mobile, p-12 on desktop)
- Avatar: 80px on mobile, 120px on desktop

### 3. Profile Info Section Component

**Purpose**: Display personal information in a card layout

**Type**: Client Component

**Props**:
```typescript
interface ProfileInfoSectionProps {
  teacher: {
    firstName: string;
    lastName: string;
    fatherName: string;
    grandFatherName: string;
    dateOfBirth: Date | null;
    address: string;
  };
  onEdit: () => void;
}
```

**Features**:
- Card-based layout with modern styling
- Read-only display of personal information
- Edit button in header
- Responsive grid for information fields
- Icons for each field type

**Information Displayed**:
- First Name
- Last Name
- Father's Name
- Grandfather's Name
- Date of Birth (formatted)
- Address

**Styling**:
- Rounded-2xl card with subtle border
- Shadow-lg for elevation
- Gradient background (blue-50 to purple-100/50)
- Hover effect on edit button

### 4. Professional Info Section Component

**Purpose**: Display professional qualifications and assignments

**Type**: Client Component

**Props**:
```typescript
interface ProfessionalInfoSectionProps {
  teacher: {
    departments: string[];
    qualification: string;
    experience: string;
    specialization: string;
    subjects: string[];
    classes: string[];
  };
  onEdit: () => void;
}
```

**Features**:
- Card-based layout matching personal info section
- Badge display for departments, subjects, and classes
- Edit button for professional details
- Responsive layout

**Information Displayed**:
- Departments (as badges)
- Qualification
- Years of Experience
- Specialization
- Subjects (as badges)
- Assigned Classes (as badges)

**Styling**:
- Consistent with profile info section
- Badges with emerald/blue color scheme
- Rounded-xl badges with subtle shadows

### 5. Contact Info Section Component

**Purpose**: Display and edit contact information

**Type**: Client Component

**Props**:
```typescript
interface ContactInfoSectionProps {
  teacher: {
    phone: string;
    secondaryPhone: string | null;
    address: string;
  };
  onEdit: () => void;
}
```

**Features**:
- Card-based layout
- Phone number formatting
- Edit button
- Icons for phone and address

**Information Displayed**:
- Primary Phone
- Secondary Phone (if available)
- Address

**Styling**:
- Consistent card styling
- Phone icon with blue color
- Address icon with purple color

### 6. Password Change Section Component

**Purpose**: Allow teachers to change their password securely

**Type**: Client Component

**Props**: None (self-contained)

**Features**:
- Form with three fields: current password, new password, confirm password
- Real-time validation
- Password strength indicator
- Show/hide password toggle
- Submit button with loading state
- Success/error toast notifications

**Validation Rules**:
- Current password: Required
- New password: Minimum 8 characters, required
- Confirm password: Must match new password

**Form Fields**:
```typescript
interface PasswordChangeForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}
```

**Styling**:
- Card layout with form elements
- Input fields with rounded-xl borders
- Gradient submit button (blue-600 to blue-700)
- Error messages in red-600
- Success messages in green-600

### 7. Edit Dialogs

**Purpose**: Modal dialogs for editing different sections

**Type**: Client Component

**Common Features**:
- Modal overlay with backdrop blur
- Form with validation
- Cancel and Save buttons
- Loading state during submission
- Error handling with toast notifications

**Profile Edit Dialog**:
```typescript
interface ProfileEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  teacher: {
    firstName: string;
    lastName: string;
    fatherName: string;
    grandFatherName: string;
    dateOfBirth: Date | null;
    address: string;
  };
  onSave: (data: ProfileUpdateData) => Promise<void>;
}
```

**Professional Edit Dialog**:
```typescript
interface ProfessionalEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  teacher: {
    qualification: string;
    experience: string;
    specialization: string;
  };
  onSave: (data: ProfessionalUpdateData) => Promise<void>;
}
```

**Contact Edit Dialog**:
```typescript
interface ContactEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  teacher: {
    phone: string;
    secondaryPhone: string | null;
    address: string;
  };
  onSave: (data: ContactUpdateData) => Promise<void>;
}
```

**Styling**:
- Rounded-3xl modal container
- White background with shadow-2xl
- Gradient header (blue theme)
- Form inputs with rounded-xl borders
- Button group at bottom (Cancel: outline, Save: gradient)

### 8. Account Info Section Component

**Purpose**: Display account metadata

**Type**: Client Component

**Props**:
```typescript
interface AccountInfoSectionProps {
  teacher: {
    createdAt: Date;
    updatedAt: Date;
    username: string;
    teacherId: string;
  };
}
```

**Features**:
- Read-only display
- Formatted dates (relative and absolute)
- No edit functionality

**Information Displayed**:
- Username
- Teacher ID
- Account Created (e.g., "Created 6 months ago on Jan 15, 2024")
- Last Updated (e.g., "Last updated 2 days ago")

**Styling**:
- Subtle card with muted colors
- Smaller text size
- Clock icon for timestamps

## Data Models

### Teacher Profile Data

```typescript
interface TeacherProfile {
  id: string;
  firstName: string;
  lastName: string;
  fatherName: string;
  grandFatherName: string;
  teacherId: string;
  dateOfBirth: Date | null;
  phone: string;
  secondaryPhone: string | null;
  address: string;
  departments: string[];
  qualification: string;
  experience: string;
  specialization: string;
  subjects: string[];
  classes: string[];
  username: string;
  status: TeacherStatus;
  createdAt: Date;
  updatedAt: Date;
}
```

### Update Request Types

```typescript
interface ProfileUpdateRequest {
  firstName?: string;
  lastName?: string;
  fatherName?: string;
  grandFatherName?: string;
  dateOfBirth?: Date | null;
  address?: string;
}

interface ProfessionalUpdateRequest {
  qualification?: string;
  experience?: string;
  specialization?: string;
}

interface ContactUpdateRequest {
  phone?: string;
  secondaryPhone?: string | null;
  address?: string;
}

interface PasswordChangeRequest {
  currentPassword: string;
  newPassword: string;
}
```

### API Response Types

```typescript
interface ProfileUpdateResponse {
  success: boolean;
  message: string;
  data?: TeacherProfile;
}

interface PasswordChangeResponse {
  success: boolean;
  message: string;
}
```

## Error Handling

### Client-Side Validation

1. **Form Validation**:
   - Required fields: firstName, lastName, phone, currentPassword, newPassword
   - Phone format: Validate using regex pattern
   - Password strength: Minimum 8 characters
   - Password match: Confirm password must match new password

2. **Error Display**:
   - Inline error messages below form fields
   - Red text color (text-red-600)
   - Error icon for visual indication

### Server-Side Error Handling

1. **Authentication Errors**:
   - Unauthorized access: Redirect to login
   - Invalid session: Clear session and redirect

2. **Validation Errors**:
   - Return 400 status with error message
   - Display toast notification with error details

3. **Database Errors**:
   - Return 500 status with generic error message
   - Log detailed error for debugging
   - Display user-friendly toast notification

4. **Password Errors**:
   - Incorrect current password: Return specific error message
   - Password update failure: Return generic error message

### Error Messages

```typescript
const ERROR_MESSAGES = {
  UNAUTHORIZED: 'You must be logged in to access this page',
  INVALID_SESSION: 'Your session has expired. Please log in again',
  INVALID_PHONE: 'Please enter a valid phone number',
  PASSWORD_TOO_SHORT: 'Password must be at least 8 characters',
  PASSWORD_MISMATCH: 'Passwords do not match',
  INCORRECT_PASSWORD: 'Current password is incorrect',
  UPDATE_FAILED: 'Failed to update profile. Please try again',
  PASSWORD_UPDATE_FAILED: 'Failed to update password. Please try again',
  NETWORK_ERROR: 'Network error. Please check your connection',
};
```

## Testing Strategy

### Unit Tests

1. **Component Tests**:
   - Profile header renders correctly with teacher data
   - Edit dialogs open and close properly
   - Form validation works as expected
   - Password strength indicator updates correctly

2. **Validation Tests**:
   - Phone number validation accepts valid formats
   - Phone number validation rejects invalid formats
   - Password validation enforces minimum length
   - Password confirmation validation works correctly

3. **API Function Tests**:
   - Profile update function calls correct endpoint
   - Password change function sends correct data
   - Error handling works for failed requests

### Integration Tests

1. **Profile Update Flow**:
   - User clicks edit button
   - Dialog opens with current data
   - User modifies fields
   - User clicks save
   - API is called with correct data
   - UI updates with new data
   - Success toast is displayed

2. **Password Change Flow**:
   - User enters current password
   - User enters new password
   - User confirms new password
   - User clicks save
   - API validates current password
   - API updates password with hash
   - Success toast is displayed
   - Form is reset

3. **Error Handling Flow**:
   - User enters invalid data
   - Validation errors are displayed
   - User corrects data
   - Validation errors clear
   - Submission succeeds

### Accessibility Tests

1. **Keyboard Navigation**:
   - All interactive elements are keyboard accessible
   - Tab order is logical
   - Focus indicators are visible
   - Dialogs trap focus appropriately

2. **Screen Reader**:
   - All form fields have proper labels
   - Error messages are announced
   - Success messages are announced
   - Status changes are announced

3. **ARIA Attributes**:
   - Dialogs have proper ARIA roles
   - Form fields have aria-invalid when errors exist
   - Buttons have descriptive aria-labels
   - Status badges have appropriate ARIA attributes

### Manual Testing Checklist

- [ ] Profile page loads correctly
- [ ] All teacher information displays accurately
- [ ] Edit buttons open correct dialogs
- [ ] Forms validate input correctly
- [ ] Profile updates save successfully
- [ ] Password change works correctly
- [ ] Error messages display appropriately
- [ ] Success notifications appear
- [ ] Page is responsive on mobile
- [ ] Page is responsive on tablet
- [ ] Page is responsive on desktop
- [ ] Keyboard navigation works
- [ ] Screen reader announces content
- [ ] Back button navigates to dashboard
- [ ] Loading states display correctly
- [ ] Network errors are handled gracefully

## UI/UX Specifications

### Color Scheme

Following the existing dashboard theme:

- **Primary Gradient**: Blue (from-blue-600 to-blue-700)
- **Secondary Gradient**: Purple (from-purple-600 to-purple-700)
- **Success**: Emerald (emerald-600)
- **Warning**: Orange (orange-600)
- **Error**: Red (red-600)
- **Background**: Gradient (from-blue-50 to-purple-100/50)
- **Card Background**: White with backdrop-blur-xl
- **Text Primary**: Slate-900
- **Text Secondary**: Slate-600
- **Text Muted**: Slate-400

### Typography

- **Page Title**: text-3xl lg:text-5xl font-bold
- **Section Title**: text-xl lg:text-2xl font-bold
- **Card Title**: text-lg font-semibold
- **Body Text**: text-sm lg:text-base
- **Label Text**: text-xs font-semibold uppercase tracking-wide
- **Muted Text**: text-xs text-slate-600

### Spacing

- **Page Padding**: p-6 lg:p-12
- **Card Padding**: p-6
- **Section Gap**: gap-6 lg:gap-8
- **Grid Gap**: gap-4 lg:gap-6
- **Element Gap**: gap-2 lg:gap-3

### Border Radius

- **Page Container**: rounded-3xl
- **Cards**: rounded-2xl
- **Buttons**: rounded-xl
- **Inputs**: rounded-xl
- **Badges**: rounded-lg
- **Avatar**: rounded-full

### Shadows

- **Cards**: shadow-lg lg:shadow-2xl
- **Buttons**: shadow-xl
- **Dialogs**: shadow-2xl
- **Hover Effects**: hover:shadow-xl

### Animations

Using framer-motion for smooth animations:

- **Page Load**: Fade in with slide up (y: 20 → 0)
- **Card Entrance**: Staggered fade in with delays
- **Button Hover**: Scale 1.02 with spring animation
- **Button Tap**: Scale 0.98
- **Dialog Open**: Fade in with scale (0.95 → 1)
- **Dialog Close**: Fade out with scale (1 → 0.95)

### Responsive Breakpoints

- **Mobile**: < 768px (single column layout)
- **Tablet**: 768px - 1024px (two column layout)
- **Desktop**: > 1024px (two column layout with larger spacing)

### Touch Targets

All interactive elements have minimum 44px touch targets for mobile accessibility.

## API Endpoints

### GET /api/teacher/profile

**Purpose**: Fetch teacher profile data

**Authentication**: Required (session-based)

**Response**:
```typescript
{
  success: boolean;
  data: TeacherProfile;
}
```

**Error Responses**:
- 401: Unauthorized
- 404: Teacher not found
- 500: Server error

### PUT /api/teacher/profile

**Purpose**: Update teacher profile information

**Authentication**: Required (session-based)

**Request Body**:
```typescript
{
  firstName?: string;
  lastName?: string;
  fatherName?: string;
  grandFatherName?: string;
  dateOfBirth?: string;
  phone?: string;
  secondaryPhone?: string;
  address?: string;
  qualification?: string;
  experience?: string;
  specialization?: string;
}
```

**Response**:
```typescript
{
  success: boolean;
  message: string;
  data: TeacherProfile;
}
```

**Error Responses**:
- 400: Validation error
- 401: Unauthorized
- 500: Server error

### POST /api/teacher/password

**Purpose**: Change teacher password

**Authentication**: Required (session-based)

**Request Body**:
```typescript
{
  currentPassword: string;
  newPassword: string;
}
```

**Response**:
```typescript
{
  success: boolean;
  message: string;
}
```

**Error Responses**:
- 400: Validation error or incorrect current password
- 401: Unauthorized
- 500: Server error

## Security Considerations

1. **Authentication**:
   - All API endpoints require valid session
   - Session validation on every request
   - Automatic redirect to login if unauthorized

2. **Password Handling**:
   - Current password verification before update
   - Password hashing using bcrypt
   - Minimum password length enforcement
   - No password display in UI (masked input)

3. **Data Validation**:
   - Server-side validation for all inputs
   - SQL injection prevention (using Supabase client)
   - XSS prevention (React auto-escaping)

4. **Authorization**:
   - Teachers can only update their own profile
   - Session ID used to identify teacher
   - No ability to modify other teachers' data

5. **Rate Limiting**:
   - Consider implementing rate limiting for password changes
   - Prevent brute force attacks on password verification

## Performance Considerations

1. **Server Components**:
   - Use Server Components for initial data fetching
   - Reduce client-side JavaScript bundle

2. **Code Splitting**:
   - Lazy load edit dialogs
   - Load only when user clicks edit button

3. **Optimistic Updates**:
   - Update UI immediately on form submission
   - Revert if API call fails

4. **Caching**:
   - Cache teacher profile data in React Query
   - Invalidate cache on successful updates

5. **Image Optimization**:
   - Use Next.js Image component for avatars
   - Implement lazy loading for images

6. **Bundle Size**:
   - Use tree-shaking for unused code
   - Minimize dependencies
   - Use dynamic imports for heavy components

## Accessibility Features

1. **Semantic HTML**:
   - Proper heading hierarchy (h1, h2, h3)
   - Form labels associated with inputs
   - Button elements for interactive actions

2. **ARIA Attributes**:
   - aria-label for icon buttons
   - aria-invalid for form errors
   - aria-describedby for error messages
   - role="dialog" for modals

3. **Keyboard Navigation**:
   - Tab order follows visual flow
   - Enter key submits forms
   - Escape key closes dialogs
   - Focus trap in modals

4. **Screen Reader Support**:
   - Descriptive labels for all inputs
   - Error announcements
   - Success announcements
   - Status updates announced

5. **Visual Indicators**:
   - Focus rings on interactive elements
   - Error states with color and icon
   - Success states with color and icon
   - Loading states with spinner

6. **Color Contrast**:
   - WCAG AA compliance for text
   - Sufficient contrast for all UI elements
   - Not relying solely on color for information

## Mobile Responsiveness

1. **Layout Adaptations**:
   - Single column on mobile (< 768px)
   - Two columns on tablet and desktop (≥ 768px)
   - Stacked buttons on mobile
   - Side-by-side buttons on desktop

2. **Touch Optimization**:
   - Minimum 44px touch targets
   - Adequate spacing between interactive elements
   - Swipe gestures for dialogs (optional)

3. **Typography Scaling**:
   - Smaller font sizes on mobile
   - Larger font sizes on desktop
   - Responsive line heights

4. **Image Scaling**:
   - Smaller avatar on mobile (80px)
   - Larger avatar on desktop (120px)
   - Responsive image loading

5. **Form Optimization**:
   - Appropriate input types for mobile keyboards
   - Autocomplete attributes for better UX
   - Minimal required fields

## Implementation Notes

1. **Technology Stack**:
   - Next.js 14 with App Router
   - React 18 with Server Components
   - TypeScript for type safety
   - Tailwind CSS for styling
   - Framer Motion for animations
   - React Hook Form for form management
   - Zod for validation
   - Sonner for toast notifications

2. **State Management**:
   - React Query for server state
   - React useState for local UI state
   - No global state management needed

3. **Form Handling**:
   - React Hook Form for form state
   - Zod schemas for validation
   - Controlled inputs for better UX

4. **API Integration**:
   - Fetch API for HTTP requests
   - Error handling with try-catch
   - Loading states during requests

5. **Styling Approach**:
   - Tailwind utility classes
   - Custom components for reusability
   - Consistent design tokens
   - No inline styles

6. **Code Organization**:
   - Separate components for each section
   - Shared types in types directory
   - API functions in lib/api
   - Reusable hooks in lib/hooks
