/**
 * Academic Standing Alerts - Integration Examples
 * 
 * This file contains practical examples of how to integrate the Academic Standing Alert System
 * into different parts of the student dashboard.
 */

import { AcademicStandingSection, AcademicStandingAlerts } from '@/components/student'
import type { AttendanceData } from '@/lib/utils/academic-status'

// ============================================================================
// Example 1: Basic Integration with Auto-Calculation
// ============================================================================

export function Example1_BasicIntegration() {
  const attendanceData: AttendanceData = {
    attendanceRate: 88.5,
    absentHours: 12,
    totalHours: 100,
    presentHours: 88,
    sickHours: 0,
    leaveHours: 0
  }

  return (
    <AcademicStandingSection
      attendanceData={attendanceData}
      onContactTeacher={() => console.log('Contact teacher')}
      onUploadDocumentation={() => console.log('Upload docs')}
      onViewPolicy={() => console.log('View policy')}
    />
  )
}

// ============================================================================
// Example 2: Integration with Next.js Router
// ============================================================================

export function Example2_WithRouter() {
  // In a real component, you would use: const router = useRouter()
  
  const attendanceData: AttendanceData = {
    attendanceRate: 92.5,
    absentHours: 8,
    totalHours: 100,
    presentHours: 92,
    sickHours: 0,
    leaveHours: 0
  }

  const handleContactTeacher = () => {
    // router.push('/student/student-dashboard/messages?recipient=teacher')
    console.log('Navigate to messages')
  }

  const handleUploadDocumentation = () => {
    // router.push('/student/upload-documentation')
    console.log('Navigate to upload')
  }

  const handleViewPolicy = () => {
    // router.push('/student/help#attendance-policy')
    console.log('Navigate to policy')
  }

  return (
    <AcademicStandingSection
      attendanceData={attendanceData}
      onContactTeacher={handleContactTeacher}
      onUploadDocumentation={handleUploadDocumentation}
      onViewPolicy={handleViewPolicy}
    />
  )
}

// ============================================================================
// Example 3: Integration with API Data
// ============================================================================

export function Example3_WithAPIData() {
  // In a real component, you would fetch data like this:
  // const { data: attendanceData, isLoading } = useQuery({
  //   queryKey: ['student-attendance'],
  //   queryFn: fetchStudentAttendance
  // })

  // Mock data for example
  const attendanceData: AttendanceData = {
    attendanceRate: 78.5,
    absentHours: 22,
    totalHours: 100,
    presentHours: 78,
    sickHours: 0,
    leaveHours: 0
  }

  // if (isLoading) return <Skeleton />

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Your Academic Standing</h2>
      
      <AcademicStandingSection
        attendanceData={attendanceData}
        mahroomThreshold={75}
        tasdiqThreshold={85}
        onContactTeacher={() => console.log('Contact teacher')}
        onUploadDocumentation={() => console.log('Upload docs')}
        onViewPolicy={() => console.log('View policy')}
      />
    </div>
  )
}

// ============================================================================
// Example 4: Manual Status Control
// ============================================================================

export function Example4_ManualStatus() {
  // Sometimes you might want to manually control the status
  // instead of auto-calculation
  
  return (
    <AcademicStandingAlerts
      status="mahroom"
      attendanceRate={70}
      remainingAbsences={0}
      mahroomThreshold={75}
      tasdiqThreshold={85}
      onContactTeacher={() => console.log('Contact teacher')}
    />
  )
}

// ============================================================================
// Example 5: Dashboard Page Integration
// ============================================================================

export function Example5_DashboardPage() {
  const attendanceData: AttendanceData = {
    attendanceRate: 95,
    absentHours: 5,
    totalHours: 100,
    presentHours: 95,
    sickHours: 0,
    leaveHours: 0
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Welcome Banner */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h1 className="text-3xl font-bold">Welcome back, Ahmed!</h1>
          <p className="text-slate-600 mt-2">Here's your attendance overview</p>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Metric cards would go here */}
        </div>

        {/* Academic Standing Alert */}
        <AcademicStandingSection
          attendanceData={attendanceData}
          onContactTeacher={() => console.log('Contact teacher')}
          onUploadDocumentation={() => console.log('Upload docs')}
          onViewPolicy={() => console.log('View policy')}
        />

        {/* Weekly Calendar */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          {/* Calendar component would go here */}
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// Example 6: Custom Thresholds
// ============================================================================

export function Example6_CustomThresholds() {
  const attendanceData: AttendanceData = {
    attendanceRate: 82,
    absentHours: 18,
    totalHours: 100,
    presentHours: 82,
    sickHours: 0,
    leaveHours: 0
  }

  // Custom thresholds for a specific course
  return (
    <AcademicStandingSection
      attendanceData={attendanceData}
      mahroomThreshold={70}  // Lower threshold for this course
      tasdiqThreshold={80}   // Lower threshold for this course
      onContactTeacher={() => console.log('Contact teacher')}
      onUploadDocumentation={() => console.log('Upload docs')}
      onViewPolicy={() => console.log('View policy')}
    />
  )
}

// ============================================================================
// Example 7: With Loading State
// ============================================================================

export function Example7_WithLoadingState() {
  const isLoading = false // In real app: from useQuery or useState
  
  const attendanceData: AttendanceData = {
    attendanceRate: 88,
    absentHours: 12,
    totalHours: 100,
    presentHours: 88,
    sickHours: 0,
    leaveHours: 0
  }

  if (isLoading) {
    return (
      <div className="rounded-2xl shadow-xl border-2 bg-gradient-to-br from-slate-50 to-slate-100/50 border-slate-200 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-slate-200 rounded w-1/3"></div>
          <div className="h-4 bg-slate-200 rounded w-2/3"></div>
          <div className="h-10 bg-slate-200 rounded w-1/4"></div>
        </div>
      </div>
    )
  }

  return (
    <AcademicStandingSection
      attendanceData={attendanceData}
      onContactTeacher={() => console.log('Contact teacher')}
      onUploadDocumentation={() => console.log('Upload docs')}
      onViewPolicy={() => console.log('View policy')}
    />
  )
}

// ============================================================================
// Example 8: All Four Scenarios Side by Side
// ============================================================================

export function Example8_AllScenarios() {
  const scenarios = [
    {
      name: 'Good Standing',
      data: { attendanceRate: 95, absentHours: 5, totalHours: 100, presentHours: 95, sickHours: 0, leaveHours: 0 }
    },
    {
      name: 'Warning',
      data: { attendanceRate: 88, absentHours: 12, totalHours: 100, presentHours: 88, sickHours: 0, leaveHours: 0 }
    },
    {
      name: 'Tasdiq',
      data: { attendanceRate: 80, absentHours: 20, totalHours: 100, presentHours: 80, sickHours: 0, leaveHours: 0 }
    },
    {
      name: 'Mahroom',
      data: { attendanceRate: 70, absentHours: 30, totalHours: 100, presentHours: 70, sickHours: 0, leaveHours: 0 }
    }
  ]

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
      {scenarios.map((scenario, index) => (
        <div key={index}>
          <h3 className="text-lg font-semibold mb-3">{scenario.name}</h3>
          <AcademicStandingSection
            attendanceData={scenario.data}
            onContactTeacher={() => console.log(`Contact teacher - ${scenario.name}`)}
            onUploadDocumentation={() => console.log(`Upload docs - ${scenario.name}`)}
            onViewPolicy={() => console.log(`View policy - ${scenario.name}`)}
          />
        </div>
      ))}
    </div>
  )
}

// ============================================================================
// Example 9: Responsive Container
// ============================================================================

export function Example9_ResponsiveContainer() {
  const attendanceData: AttendanceData = {
    attendanceRate: 88,
    absentHours: 12,
    totalHours: 100,
    presentHours: 88,
    sickHours: 0,
    leaveHours: 0
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="max-w-4xl mx-auto">
        <AcademicStandingSection
          attendanceData={attendanceData}
          onContactTeacher={() => console.log('Contact teacher')}
          onUploadDocumentation={() => console.log('Upload docs')}
          onViewPolicy={() => console.log('View policy')}
          className="mb-6"
        />
      </div>
    </div>
  )
}

// ============================================================================
// Example 10: With Error Handling
// ============================================================================

export function Example10_WithErrorHandling() {
  const hasError = false // In real app: from error state
  const attendanceData: AttendanceData = {
    attendanceRate: 88,
    absentHours: 12,
    totalHours: 100,
    presentHours: 88,
    sickHours: 0,
    leaveHours: 0
  }

  if (hasError) {
    return (
      <div className="rounded-2xl shadow-xl border-2 bg-gradient-to-br from-red-50 to-red-100/50 border-red-200 p-6">
        <p className="text-red-700">
          Unable to load attendance data. Please try again later.
        </p>
      </div>
    )
  }

  return (
    <AcademicStandingSection
      attendanceData={attendanceData}
      onContactTeacher={() => console.log('Contact teacher')}
      onUploadDocumentation={() => console.log('Upload docs')}
      onViewPolicy={() => console.log('View policy')}
    />
  )
}
