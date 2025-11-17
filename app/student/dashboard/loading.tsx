export default function DashboardLoading() {
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="px-4 sm:px-6 lg:px-8 py-6 md:py-8 lg:py-10 max-w-7xl mx-auto">
        <div className="space-y-4 md:space-y-6 lg:space-y-8">
          {/* Welcome Section Skeleton */}
          <div className="relative overflow-hidden bg-gradient-to-br from-purple-500 via-blue-500 to-blue-600 border-0 shadow-lg rounded-2xl p-6 md:p-8 lg:p-10">
            <div className="space-y-4">
              <div className="h-8 w-48 bg-white/20 rounded-lg animate-pulse" />
              <div className="h-10 w-64 bg-white/20 rounded-lg animate-pulse" />
              <div className="flex gap-4 mt-4">
                <div className="h-6 w-32 bg-white/20 rounded-lg animate-pulse" />
                <div className="h-6 w-40 bg-white/20 rounded-lg animate-pulse" />
              </div>
            </div>
          </div>

          {/* Stats Cards Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-white border-0 shadow-sm rounded-xl p-6"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-3 flex-1">
                    <div className="h-8 w-16 bg-slate-200 rounded-lg animate-pulse" />
                    <div className="h-5 w-24 bg-slate-200 rounded-lg animate-pulse" />
                  </div>
                  <div className="w-12 h-12 bg-slate-200 rounded-lg animate-pulse" />
                </div>
              </div>
            ))}
          </div>

          {/* Status Alert Skeleton */}
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 border-0 shadow-lg rounded-2xl p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-lg animate-pulse" />
              <div className="flex-1 space-y-3">
                <div className="h-6 w-48 bg-white/20 rounded-lg animate-pulse" />
                <div className="h-4 w-full bg-white/20 rounded-lg animate-pulse" />
                <div className="h-2 w-full bg-white/20 rounded-full animate-pulse" />
              </div>
            </div>
          </div>

          {/* Weekly Calendar Skeleton */}
          <div className="bg-white border-0 shadow-sm rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="h-7 w-48 bg-slate-200 rounded-lg animate-pulse" />
              <div className="flex gap-2">
                <div className="w-10 h-10 bg-slate-200 rounded-lg animate-pulse" />
                <div className="w-10 h-10 bg-slate-200 rounded-lg animate-pulse" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
              {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                <div
                  key={i}
                  className="bg-slate-100 border-0 shadow-sm rounded-xl p-4 space-y-3"
                >
                  <div className="h-5 w-20 bg-slate-200 rounded animate-pulse" />
                  <div className="h-4 w-16 bg-slate-200 rounded animate-pulse" />
                  <div className="flex gap-1 mt-2">
                    <div className="w-2 h-2 bg-slate-200 rounded-full animate-pulse" />
                    <div className="w-2 h-2 bg-slate-200 rounded-full animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Two-column layout skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            {/* Progress Chart Skeleton */}
            <div className="bg-white border-0 shadow-sm rounded-xl p-6">
              <div className="h-6 w-40 bg-slate-200 rounded-lg animate-pulse mb-6" />
              <div className="flex flex-col items-center">
                <div className="w-48 h-48 bg-slate-200 rounded-full animate-pulse mb-6" />
                <div className="w-full space-y-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="space-y-2">
                      <div className="h-4 w-24 bg-slate-200 rounded animate-pulse" />
                      <div className="h-2 w-full bg-slate-200 rounded-full animate-pulse" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Activity Skeleton */}
            <div className="bg-white border-0 shadow-sm rounded-xl p-6">
              <div className="h-6 w-40 bg-slate-200 rounded-lg animate-pulse mb-6" />
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-200 rounded-lg animate-pulse" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-32 bg-slate-200 rounded animate-pulse" />
                      <div className="h-3 w-24 bg-slate-200 rounded animate-pulse" />
                    </div>
                    <div className="w-16 h-6 bg-slate-200 rounded-full animate-pulse" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
