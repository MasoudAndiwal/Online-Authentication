'use client'

import * as React from 'react'
import { AcademicStandingSection } from '@/components/student/academic-standing-section'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

/**
 * Academic Alerts Demo Component
 * 
 * This component demonstrates all four alert types with different attendance scenarios:
 * 1. Good Standing (95% attendance)
 * 2. Warning (88% attendance)
 * 3. Tasdiq - Certification Required (80% attendance)
 * 4. Mahroom - Disqualified (70% attendance)
 * 
 * Used for testing responsive behavior across all screen sizes.
 */
export function AcademicAlertsDemo() {
  const [selectedScenario, setSelectedScenario] = React.useState<number>(0)

  const scenarios = [
    {
      name: 'Good Standing',
      data: {
        attendanceRate: 95,
        absentHours: 5,
        totalHours: 100,
        presentHours: 95,
        sickHours: 0,
        leaveHours: 0
      }
    },
    {
      name: 'Warning',
      data: {
        attendanceRate: 88,
        absentHours: 12,
        totalHours: 100,
        presentHours: 88,
        sickHours: 0,
        leaveHours: 0
      }
    },
    {
      name: 'Certification Required (تصدیق طلب)',
      data: {
        attendanceRate: 80,
        absentHours: 20,
        totalHours: 100,
        presentHours: 80,
        sickHours: 0,
        leaveHours: 0
      }
    },
    {
      name: 'Disqualified (محروم)',
      data: {
        attendanceRate: 70,
        absentHours: 30,
        totalHours: 100,
        presentHours: 70,
        sickHours: 0,
        leaveHours: 0
      }
    }
  ]

  const handleContactTeacher = () => {
    console.log('Contact Teacher clicked')
    alert('Opening messaging system...')
  }

  const handleUploadDocumentation = () => {
    console.log('Upload Documentation clicked')
    alert('Opening file upload dialog...')
  }

  const handleViewPolicy = () => {
    console.log('View Policy clicked')
    alert('Opening attendance policy...')
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Scenario Selector */}
      <Card className="rounded-2xl shadow-lg border-0 bg-white/80 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl lg:text-2xl">
            Academic Alert Scenarios
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {scenarios.map((scenario, index) => (
              <Button
                key={index}
                onClick={() => setSelectedScenario(index)}
                variant={selectedScenario === index ? 'default' : 'outline'}
                className="min-h-[44px] w-full text-sm sm:text-base"
              >
                {scenario.name}
              </Button>
            ))}
          </div>
          
          <div className="mt-4 p-4 bg-slate-50 rounded-xl">
            <p className="text-sm text-slate-600">
              <strong>Current Scenario:</strong> {scenarios[selectedScenario].name}
            </p>
            <p className="text-sm text-slate-600 mt-1">
              <strong>Attendance Rate:</strong> {scenarios[selectedScenario].data.attendanceRate}%
            </p>
            <p className="text-sm text-slate-600 mt-1">
              <strong>Absent Hours:</strong> {scenarios[selectedScenario].data.absentHours} / {scenarios[selectedScenario].data.totalHours}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Alert Display */}
      <AcademicStandingSection
        attendanceData={scenarios[selectedScenario].data}
        mahroomThreshold={75}
        tasdiqThreshold={85}
        onContactTeacher={handleContactTeacher}
        onUploadDocumentation={handleUploadDocumentation}
        onViewPolicy={handleViewPolicy}
      />

      {/* Responsive Testing Info */}
      <Card className="rounded-2xl shadow-lg border-0 bg-white/80 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">
            Responsive Testing Checklist
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex items-start gap-2">
              <span className="text-green-600">✓</span>
              <span>Mobile (375px): Single column layout, full-width buttons</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-600">✓</span>
              <span>Tablet (768px): Responsive padding and text sizes</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-600">✓</span>
              <span>Desktop (1024px+): Full layout with hover effects</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-600">✓</span>
              <span>Touch targets: All buttons minimum 44px height</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-600">✓</span>
              <span>Pulsing animation: Active on critical alerts (محروم, تصدیق طلب)</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-600">✓</span>
              <span>Responsive typography: Scales from text-sm to text-xl</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-600">✓</span>
              <span>Action buttons: Stack vertically on mobile, horizontal on desktop</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
