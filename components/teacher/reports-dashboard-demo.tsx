'use client'

import * as React from 'react'
import { ReportsDashboard } from './reports-dashboard'

/**
 * Demo component to showcase the Reports Dashboard functionality
 * This can be used for testing and demonstration purposes
 */
export function ReportsDashboardDemo() {
  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Teacher Reports Dashboard Demo
          </h1>
          <p className="text-slate-600">
            Comprehensive reports and analytics for teacher dashboard with advanced filtering and export capabilities.
          </p>
        </div>
        
        <ReportsDashboard />
      </div>
    </div>
  )
}

export default ReportsDashboardDemo