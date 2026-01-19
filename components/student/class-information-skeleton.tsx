"use client";

import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Class Information Skeleton Component
 * Displays smooth skeleton loading for the class information page
 * Matches the layout of ClassInformationSection
 */
export function ClassInformationSkeleton() {
  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Page Header Skeleton */}
      <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-2xl p-6 sm:p-8">
        <Skeleton className="h-8 sm:h-10 w-48 sm:w-64 mb-3 bg-emerald-200/50" />
        <Skeleton className="h-4 w-full max-w-2xl bg-emerald-200/30" />
      </div>

      {/* Class Overview Card Skeleton */}
      <Card className="rounded-2xl shadow-xl bg-white/80 backdrop-blur-xl">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3 mb-2">
            <Skeleton className="h-12 w-12 rounded-xl" />
            <div className="flex-1">
              <Skeleton className="h-6 w-40 mb-2" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Class Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-5 w-32" />
              </div>
            ))}
          </div>

          {/* Schedule Table Skeleton */}
          <div className="space-y-3">
            <Skeleton className="h-6 w-32" />
            <div className="space-y-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex gap-4 p-3 rounded-lg bg-slate-50">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-5 w-16" />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Teacher Info and Policy Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        {/* Teacher Information Card Skeleton */}
        <Card className="rounded-2xl shadow-xl bg-white/80 backdrop-blur-xl">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-12 w-12 rounded-xl" />
              <div className="flex-1">
                <Skeleton className="h-6 w-40 mb-2" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-slate-50">
                <Skeleton className="h-14 w-14 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Attendance Policy Card Skeleton */}
        <Card className="rounded-2xl shadow-xl bg-white/80 backdrop-blur-xl">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-12 w-12 rounded-xl" />
              <div className="flex-1">
                <Skeleton className="h-6 w-40 mb-2" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-4 rounded-xl bg-slate-50 space-y-2">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Help Note Skeleton */}
      <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 shadow-sm rounded-xl p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <Skeleton className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        </div>
      </div>
    </div>
  );
}
