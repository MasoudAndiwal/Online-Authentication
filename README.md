# 🎓 University AttendanceHub

> **Modern Attendance Management System for Universities**  
> A comprehensive, real-time attendance tracking platform designed for educational institutions with role-based access for Office Staff, Teachers, and Students.

![Next.js](https://img.shields.io/badge/Next.js-15.5.7-black?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React-19.1.0-blue?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=flat-square&logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green?style=flat-square&logo=supabase)
![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Environment Variables](#-environment-variables)
- [Database Setup](#-database-setup)
- [Running the Project](#-running-the-project)
- [Project Structure](#-project-structure)
- [User Roles](#-user-roles)
- [API Endpoints](#-api-endpoints)
- [Testing](#-testing)
- [Screenshots](#-screenshots)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌟 Overview

**University AttendanceHub** is a next-generation attendance management system built with modern web technologies. It streamlines the entire attendance workflow from marking to reporting, with intelligent automation and real-time synchronization.

### Key Highlights

- ✅ **Real-time Attendance Tracking** - Mark and view attendance instantly
- 📊 **Advanced Analytics** - Comprehensive reports and trend analysis
- 🔐 **Role-Based Access Control** - Secure permissions for Office, Teachers, and Students
- 📱 **Mobile-First Design** - Responsive interface with touch gestures
- 🎨 **Modern UI/UX** - Beautiful animations with Framer Motion
- 🔄 **Offline Support** - Work seamlessly even without internet
- 📧 **Real-time Messaging** - Communication between teachers and students
- 🔔 **Smart Notifications** - Alerts for attendance thresholds and updates

---

## ✨ Features

### 🏢 Office Management Dashboard
- **User Management** - Create and manage students, teachers, and office staff
- **Class Administration** - Set up classes, schedules, and academic calendars
- **Comprehensive Reporting** - Generate attendance reports with export to Excel/PDF
- **System Configuration** - Manage attendance policies and thresholds
- **Audit Logging** - Track all system activities for compliance
- **Real-time Statistics** - Monitor attendance rates and system health

### 👨‍🏫 Teacher Portal
- **One-Click Attendance** - Mark attendance for entire classes quickly
- **Bulk Operations** - Mark all present/absent with smart defaults
- **Student Roster** - View complete student lists with photos
- **Progress Tracking** - Monitor individual student attendance trends
- **Risk Alerts** - Identify students at risk of failing attendance requirements
- **Class Reports** - Generate detailed attendance reports per class
- **Mobile Optimized** - Mark attendance on-the-go with touch interface
- **Messaging System** - Communicate with students directly

### 🎓 Student Portal
- **Personal Dashboard** - View attendance metrics with visual progress bars
- **Attendance History** - Complete record with calendar view
- **Weekly Calendar** - See attendance status for each day
- **Trend Analysis** - Charts showing attendance patterns over time
- **Threshold Warnings** - Alerts when approaching minimum attendance (Mahroom/Tasdiq)
- **Class Comparison** - Compare personal attendance with class average
- **Goal Tracking** - Set and monitor attendance improvement goals
- **Notifications** - Real-time alerts for attendance updates
- **Teacher Communication** - Message teachers about absences

---

## 🛠 Tech Stack

### Frontend
- **Framework**: [Next.js 15.5.7](https://nextjs.org/) (App Router)
- **UI Library**: [React 19.1.0](https://react.dev/)
- **Language**: [TypeScript 5.x](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **UI Components**: [Radix UI](https://www.radix-ui.com/) + [shadcn/ui](https://ui.shadcn.com/)
- **Animations**: [Framer Motion 12](https://www.framer.com/motion/)
- **3D Graphics**: [Three.js](https://threejs.org/) + [@react-three/fiber](https://docs.pmnd.rs/react-three-fiber)
- **State Management**: [Zustand 5](https://zustand-demo.pmnd.rs/)
- **Data Fetching**: [TanStack Query 5](https://tanstack.com/query/latest)
- **Forms**: [React Hook Form 7](https://react-hook-form.com/) + [Zod 4](https://zod.dev/)

### Backend
- **Database**: [Supabase](https://supabase.com/) (PostgreSQL)
- **Authentication**: Supabase Auth with bcrypt password hashing
- **Real-time**: Supabase Realtime subscriptions
- **File Storage**: Supabase Storage
- **Caching**: [Redis (ioredis)](https://github.com/redis/ioredis)
- **Email**: [Nodemailer 7](https://nodemailer.com/)
- **Scheduling**: [node-cron 4](https://github.com/node-cron/node-cron)

### Development & Testing
- **Testing**: [Vitest 4](https://vitest.dev/) + [Testing Library](https://testing-library.com/)
- **Property-Based Testing**: [fast-check 4](https://fast-check.dev/)
- **Linting**: [ESLint 9](https://eslint.org/)
- **Monitoring**: [Sentry](https://sentry.io/)
- **Package Manager**: npm

---

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 20.x or higher ([Download](https://nodejs.org/))
- **npm** 10.x or higher (comes with Node.js)
- **Git** ([Download](https://git-scm.com/))
- **Supabase Account** ([Sign up](https://supabase.com/))
- **Redis** (optional, for caching) ([Download](https://redis.io/download))

---

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/university-attendance.git
cd university-attendance
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

See [Environment Variables](#-environment-variables) section for details.

### 4. Set Up Database

Follow the [Database Setup](#-database-setup) section to initialize your Supabase database.

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔐 Environment Variables

Create a `.env` file with the following variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Database Connection (optional - for direct PostgreSQL access)
DATABASE_URL=your_postgres_connection_string

# Redis Configuration (optional - for caching)
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=your_redis_password

# Email Configuration (for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_email_password
SMTP_FROM=noreply@youruniversity.edu

# Sentry (optional - for error monitoring)
SENTRY_DSN=your_sentry_dsn
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

### Getting Supabase Credentials

1. Go to [Supabase Dashboard](https://app.supabase.com/)
2. Create a new project or select existing one
3. Go to **Settings** → **API**
4. Copy the **Project URL** and **anon/public key**
5. Copy the **service_role key** (keep this secret!)

---

## 🗄 Database Setup

### Option 1: Using Supabase Dashboard (Recommended)

1. **Create Tables**: Run the migration scripts in order:
   ```bash
   # Navigate to SQL Editor in Supabase Dashboard
   # Run each file in database/migrations/ folder in order:
   - 00_RUN_ALL_MIGRATIONS_FIXED.sql (runs all migrations)
   ```

2. **Verify Tables**: Check that all 22 tables are created:
   - students, teachers, office_staff
   - classes, schedule_entries
   - attendance_records, medical_certificates
   - conversations, messages
   - notifications, system_messages
   - audit_logs, and more

### Option 2: Using Supabase CLI

```bash
# Install Supabase CLI
npm install -g supabase

# Link to your project
npx supabase link --project-ref your-project-ref

# Run migrations
npx supabase db push
```

### Database Schema Overview

The system uses **22 tables** organized into these categories:

#### User Management
- `students` - Student records with enrollment details
- `teachers` - Teacher profiles and assignments
- `office_staff` - Administrative staff accounts

#### Academic Structure
- `classes` - Class definitions (name, code, semester)
- `schedule_entries` - Class schedules (day, period, room)
- `departments` - Academic departments

#### Attendance System
- `attendance_records` - Daily attendance entries
- `medical_certificates` - Sick leave documentation

#### Communication
- `conversations` - Message threads
- `messages` - Individual messages
- `notifications` - System notifications
- `system_messages` - Broadcast messages

#### System
- `audit_logs` - Activity tracking
- `password_reset_tokens` - Password recovery

---

## 🏃 Running the Project

### Development Mode

```bash
npm run dev
```

Runs the app in development mode at [http://localhost:3000](http://localhost:3000)

### Production Build

```bash
# Build the application
npm run build

# Start production server
npm start
```

### Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui

# Generate coverage report
npm run test:coverage
```

### Linting

```bash
npm run lint
```

---

## 📁 Project Structure

```
university-attendance/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Authentication pages
│   │   ├── login/                # Login page
│   │   └── forgot-password/      # Password reset
│   ├── (office)/                 # Office staff routes
│   │   └── dashboard/            # Office dashboard
│   ├── student/                  # Student routes
│   │   ├── student-dashboard/    # Student dashboard
│   │   └── profile/              # Student profile
│   ├── teacher/                  # Teacher routes
│   │   ├── dashboard/            # Teacher dashboard
│   │   └── profile/              # Teacher profile
│   ├── api/                      # API routes
│   │   ├── auth/                 # Authentication endpoints
│   │   ├── attendance/           # Attendance operations
│   │   ├── classes/              # Class management
│   │   ├── messages/             # Messaging system
│   │   ├── students/             # Student operations
│   │   ├── teachers/             # Teacher operations
│   │   └── reports/              # Report generation
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Landing page
│   └── globals.css               # Global styles
│
├── components/                   # React components
│   ├── attendance/               # Attendance components
│   ├── auth/                     # Authentication components
│   ├── classes/                  # Class management components
│   ├── messaging/                # Messaging components
│   ├── navigation/               # Navigation components
│   ├── office/                   # Office-specific components
│   ├── student/                  # Student-specific components
│   ├── teacher/                  # Teacher-specific components
│   ├── shared/                   # Shared components
│   └── ui/                       # UI primitives (shadcn/ui)
│
├── hooks/                        # Custom React hooks
│   ├── use-auth.ts               # Authentication hook
│   ├── use-attendance.ts         # Attendance operations
│   ├── use-student-dashboard.ts  # Student dashboard data
│   ├── use-teacher-notifications.ts
│   └── use-offline-mode.tsx      # Offline support
│
├── lib/                          # Utility libraries
│   ├── api/                      # API client functions
│   ├── auth/                     # Authentication utilities
│   ├── database/                 # Database operations
│   ├── services/                 # Business logic services
│   ├── utils/                    # Helper functions
│   ├── validations/              # Zod schemas
│   └── supabase.ts               # Supabase client
│
├── database/                     # Database files
│   └── migrations/               # SQL migration scripts
│
├── types/                        # TypeScript type definitions
│   ├── attendance.ts             # Attendance types
│   ├── messaging/                # Messaging types
│   └── types.ts                  # General types
│
├── public/                       # Static assets
│   ├── reports/                  # Generated reports
│   └── template/                 # Document templates
│
├── scripts/                      # Utility scripts
│   ├── create-test-users-all.js  # Create test users
│   └── test-*.ts                 # Testing scripts
│
├── .env                          # Environment variables
├── .gitignore                    # Git ignore rules
├── next.config.ts                # Next.js configuration
├── tailwind.config.ts            # Tailwind CSS configuration
├── tsconfig.json                 # TypeScript configuration
├── vitest.config.ts              # Vitest configuration
├── package.json                  # Dependencies
└── README.md                     # This file
```

---

## 👥 User Roles

### 🏢 Office Staff (OFFICE)
**Permissions**: Full system access

- Create/edit/delete users (students, teachers, office staff)
- Manage classes and schedules
- View all attendance records
- Generate system-wide reports
- Configure attendance policies
- Access audit logs
- Send broadcast messages

**Default Login**: 
- Email: `office@university.edu`
- Password: (set during setup)

### 👨‍🏫 Teacher (TEACHER)
**Permissions**: Class-level access

- Mark attendance for assigned classes
- View student rosters
- Generate class reports
- View student attendance history
- Send messages to students
- Receive attendance alerts

**Default Login**:
- Email: `teacher@university.edu`
- Password: (set during setup)

### 🎓 Student (STUDENT)
**Permissions**: Personal data only

- View personal attendance records
- See attendance percentage
- View weekly/monthly summaries
- Track attendance goals
- Message teachers
- Receive notifications

**Default Login**:
- Email: `student@university.edu`
- Password: (set during setup)

---

## 🔌 API Endpoints

### Authentication
```
POST   /api/auth/login           # User login
POST   /api/auth/logout          # User logout
POST   /api/auth/forgot-password # Password reset request
POST   /api/auth/reset-password  # Reset password with token
GET    /api/auth/session         # Get current session
```

### Attendance
```
GET    /api/attendance           # Get attendance records
POST   /api/attendance           # Mark attendance
PUT    /api/attendance/:id       # Update attendance record
DELETE /api/attendance/:id       # Delete attendance record
POST   /api/attendance/bulk      # Bulk mark attendance
GET    /api/attendance/stats     # Get attendance statistics
```

### Classes
```
GET    /api/classes              # List all classes
POST   /api/classes              # Create new class
GET    /api/classes/:id          # Get class details
PUT    /api/classes/:id          # Update class
DELETE /api/classes/:id          # Delete class
GET    /api/classes/:id/students # Get class students
GET    /api/classes/:id/schedule # Get class schedule
```

### Students
```
GET    /api/students             # List all students
POST   /api/students             # Create new student
GET    /api/students/:id         # Get student details
PUT    /api/students/:id         # Update student
DELETE /api/students/:id         # Delete student
GET    /api/students/:id/attendance # Get student attendance
```

### Teachers
```
GET    /api/teachers             # List all teachers
POST   /api/teachers             # Create new teacher
GET    /api/teachers/:id         # Get teacher details
PUT    /api/teachers/:id         # Update teacher
DELETE /api/teachers/:id         # Delete teacher
GET    /api/teachers/:id/classes # Get teacher classes
```

### Reports
```
GET    /api/reports/attendance   # Generate attendance report
GET    /api/reports/class/:id    # Generate class report
GET    /api/reports/student/:id  # Generate student report
POST   /api/reports/export       # Export report (Excel/PDF)
```

### Messages
```
GET    /api/messages             # Get user messages
POST   /api/messages             # Send new message
GET    /api/messages/:id         # Get message details
PUT    /api/messages/:id/read    # Mark message as read
DELETE /api/messages/:id         # Delete message
```

### Dashboard
```
GET    /api/dashboard/stats      # Get dashboard statistics
GET    /api/dashboard/activity   # Get recent activity
```

---

## 🧪 Testing

The project uses **Vitest** for unit and integration testing, with **fast-check** for property-based testing.

### Running Tests

```bash
# Run all tests once
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui

# Generate coverage report
npm run test:coverage
```

### Test Structure

```
__tests__/
├── unit/                    # Unit tests
│   ├── components/          # Component tests
│   ├── hooks/               # Hook tests
│   └── utils/               # Utility function tests
├── integration/             # Integration tests
│   ├── api/                 # API endpoint tests
│   └── database/            # Database operation tests
└── e2e/                     # End-to-end tests (future)
```

### Writing Tests

Example test file:

```typescript
import { describe, it, expect } from 'vitest';
import { calculateAttendanceRate } from '@/lib/utils/attendance';

describe('calculateAttendanceRate', () => {
  it('should calculate correct percentage', () => {
    const result = calculateAttendanceRate(18, 20);
    expect(result).toBe(90);
  });

  it('should handle zero total classes', () => {
    const result = calculateAttendanceRate(0, 0);
    expect(result).toBe(0);
  });
});
```

---

## 📸 Screenshots

> **Note**: Add screenshots of your application here to showcase the UI

### Landing Page
![Landing Page](./docs/screenshots/landing-page.png)
*Modern landing page with animated hero section and feature cards*

### Office Dashboard
![Office Dashboard](./docs/screenshots/office-dashboard.png)
*Comprehensive admin dashboard with real-time statistics*

### Teacher Portal
![Teacher Portal](./docs/screenshots/teacher-dashboard.png)
*Teacher interface for marking attendance and viewing class rosters*

### Student Dashboard
![Student Dashboard](./docs/screenshots/student-dashboard.png)
*Student view with attendance metrics and progress tracking*

### Attendance Marking
![Attendance Marking](./docs/screenshots/attendance-marking.png)
*One-click attendance marking with color-coded status*

### Reports
![Reports](./docs/screenshots/reports.png)
*Detailed attendance reports with export functionality*

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit your changes**
   ```bash
   git commit -m 'Add some amazing feature'
   ```
4. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open a Pull Request**

### Coding Standards

- Follow TypeScript best practices
- Use ESLint configuration provided
- Write tests for new features
- Update documentation as needed
- Use conventional commit messages

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React Framework
- [Supabase](https://supabase.com/) - Open Source Firebase Alternative
- [shadcn/ui](https://ui.shadcn.com/) - Beautiful UI Components
- [Framer Motion](https://www.framer.com/motion/) - Animation Library
- [Tailwind CSS](https://tailwindcss.com/) - Utility-First CSS Framework

---

## 📞 Support

For support, email support@attendancehub.edu or open an issue on GitHub.

---

## 🗺 Roadmap

- [ ] Mobile app (React Native)
- [ ] Biometric attendance (fingerprint/face recognition)
- [ ] AI-powered attendance predictions
- [ ] Integration with university ERP systems
- [ ] Multi-language support
- [ ] Dark mode
- [ ] Advanced analytics dashboard
- [ ] Parent portal
- [ ] SMS notifications
- [ ] QR code attendance

---

<div align="center">

**Made with ❤️ for Universities**

[Website](https://attendancehub.edu) • [Documentation](https://docs.attendancehub.edu) • [Report Bug](https://github.com/yourusername/university-attendance/issues) • [Request Feature](https://github.com/yourusername/university-attendance/issues)

</div>
