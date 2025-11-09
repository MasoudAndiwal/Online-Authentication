'use client'

import * as React from 'react'
import { ClassReportsDashboard } from './class-reports-dashboard'

/**
 * Test component to verify the Class Reports Dashboard functionality
 * This can be used for testing the reports integration
 */
export function ClassReportsTest() {
  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Class Reports Dashboard Test
          </h1>
          <p className="text-slate-600">
            Testing the class-specific reports functionality with mock class ID.
          </p>
        </div>
        
        <ClassReportsDashboard classId="test-class-123" />
      </div>
    </div>
  )
}

export default ClassReportsTest