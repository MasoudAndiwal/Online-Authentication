'use client'

import * as React from 'react'
import { Card, CardContent } from '@/components/ui/card'

/**
 * Skeleton Loading Component for Dashboard Metrics
 * Displays animated skeleton placeholders while data is loading
 */
export function DashboardMetricsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
      {[1, 2, 3, 4].map((index) => (
        <Card key={index} className="rounded-2xl shadow-sm bg-white border-0">
          <CardContent className="p-4 sm:p-5 lg:p-6">
            <div className="animate-pulse">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 sm:h-11 sm:w-11 bg-gradient-to-br from-emerald-200 to-emerald-300 rounded-xl animate-shimmer" />
                  <div>
                    <div className="h-4 w-24 sm:w-32 bg-gradient-to-r from-slate-200 to-slate-300 rounded mb-2 animate-shimmer" />
                    <div className="h-3 w-16 sm:w-24 bg-gradient-to-r from-slate-200 to-slate-300 rounded animate-shimmer" />
                  </div>
                </div>
              </div>
              <div className="h-8 w-20 bg-gradient-to-r from-slate-200 to-slate-300 rounded animate-shimmer" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
