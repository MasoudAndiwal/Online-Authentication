import { Suspense } from 'react';
import {
  WelcomeSection,
  StatsCards,
  StatusAlerts,
  WeeklyCalendar,
  ProgressChart,
  RecentActivity,
  CertificateUpload,
} from '@/components/dashboard';
import type {
  Student,
  AttendanceStats,
  AcademicStatus,
  WeekData,
  AttendanceRecord,
  UploadedFile,
} from '@/types/types';

// Mock data for demonstration - will be replaced with actual API calls
async function getDashboardData() {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 100));

  const student: Student = {
    id: '1',
    name: 'أحمد محمد',
    studentNumber: '2024001',
    email: 'ahmed@example.com',
  };

  const stats: AttendanceStats = {
    totalDays: 45,
    presentDays: 38,
    absentDays: 4,
    sickDays: 2,
    leaveDays: 1,
    attendancePercentage: 84.4,
    pureAbsenceHours: 12,
    combinedAbsenceHours: 21,
  };

  const status: AcademicStatus = {
    isDisqualified: false,
    needsCertification: true,
    disqualificationThreshold: 15,
    certificationThreshold: 20,
  };

  const weekData: WeekData = {
    weekNumber: 12,
    startDate: '2024-11-17',
    endDate: '2024-11-23',
    days: [
      {
        date: '2024-11-17',
        dayName: 'الأحد',
        status: 'present',
        sessions: [
          { period: 1, courseName: 'الرياضيات', status: 'present' },
          { period: 2, courseName: 'الفيزياء', status: 'present' },
        ],
      },
      {
        date: '2024-11-18',
        dayName: 'الإثنين',
        status: 'present',
        sessions: [
          { period: 1, courseName: 'الكيمياء', status: 'present' },
          { period: 2, courseName: 'الأحياء', status: 'present' },
        ],
      },
      {
        date: '2024-11-19',
        dayName: 'الثلاثاء',
        status: 'absent',
        sessions: [
          { period: 1, courseName: 'اللغة العربية', status: 'absent' },
          { period: 2, courseName: 'التاريخ', status: 'absent' },
        ],
      },
      {
        date: '2024-11-20',
        dayName: 'الأربعاء',
        status: 'sick',
        sessions: [
          { period: 1, courseName: 'الجغرافيا', status: 'sick' },
          { period: 2, courseName: 'الفلسفة', status: 'sick' },
        ],
      },
      {
        date: '2024-11-21',
        dayName: 'الخميس',
        status: 'present',
        sessions: [
          { period: 1, courseName: 'الرياضيات', status: 'present' },
          { period: 2, courseName: 'الفيزياء', status: 'present' },
        ],
      },
      {
        date: '2024-11-22',
        dayName: 'الجمعة',
        status: 'future',
        sessions: [],
      },
      {
        date: '2024-11-23',
        dayName: 'السبت',
        status: 'future',
        sessions: [],
      },
    ],
  };

  const recentRecords: AttendanceRecord[] = [
    {
      id: '1',
      date: '2024-11-17',
      dayOfWeek: 'الأحد',
      status: 'present',
      courseName: 'الرياضيات',
      period: 1,
    },
    {
      id: '2',
      date: '2024-11-17',
      dayOfWeek: 'الأحد',
      status: 'present',
      courseName: 'الفيزياء',
      period: 2,
    },
    {
      id: '3',
      date: '2024-11-16',
      dayOfWeek: 'السبت',
      status: 'absent',
      courseName: 'الكيمياء',
      period: 1,
    },
    {
      id: '4',
      date: '2024-11-16',
      dayOfWeek: 'السبت',
      status: 'present',
      courseName: 'الأحياء',
      period: 2,
    },
    {
      id: '5',
      date: '2024-11-15',
      dayOfWeek: 'الجمعة',
      status: 'sick',
      courseName: 'اللغة العربية',
      period: 1,
      notes: 'مرض',
    },
  ];

  const uploadedFiles: UploadedFile[] = [
    {
      id: '1',
      fileName: 'medical-certificate-nov.pdf',
      fileSize: 245678,
      uploadDate: '2024-11-15',
      status: 'pending',
    },
  ];

  return {
    student,
    stats,
    status,
    weekData,
    recentRecords,
    uploadedFiles,
  };
}

// Empty State Component
function EmptyState() {
  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-2xl mx-auto">
        <div className="bg-white border-0 shadow-lg rounded-2xl p-8 md:p-10 text-center">
          {/* Empty Icon */}
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-6">
            <svg
              className="w-10 h-10 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>

          {/* Empty Title */}
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">
            لا توجد سجلات حضور
          </h1>

          {/* Empty Message */}
          <p className="text-slate-600 mb-6 text-base sm:text-lg">
            لم يتم تسجيل أي حضور حتى الآن. سيتم عرض سجلات الحضور هنا عند توفرها.
          </p>

          {/* Action Button */}
          <a
            href="/"
            className="inline-block px-6 py-3 bg-blue-500 text-white border-0 shadow-md rounded-lg font-medium transition-all duration-200 hover:bg-blue-600 hover:shadow-lg hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            العودة للرئيسية
          </a>
        </div>
      </div>
    </main>
  );
}

export default async function DashboardPage() {
  const data = await getDashboardData();
  const currentTime = new Date().toLocaleDateString('ar-SA', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Check if there's no attendance data
  if (!data.stats || data.stats.totalDays === 0) {
    return <EmptyState />;
  }

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Responsive container with proper padding */}
      <div className="px-4 sm:px-6 lg:px-8 py-6 md:py-8 lg:py-10 max-w-7xl mx-auto">
        {/* Section spacing */}
        <div className="space-y-4 md:space-y-6 lg:space-y-8">
          {/* Welcome Section */}
          <WelcomeSection student={data.student} currentTime={currentTime} />

          {/* Stats Cards */}
          <StatsCards stats={data.stats} />

          {/* Status Alerts */}
          <StatusAlerts status={data.status} stats={data.stats} />

          {/* Weekly Calendar */}
          <WeeklyCalendar
            weekData={data.weekData}
            onWeekChange={(direction) => {
              console.log('Week change:', direction);
              // TODO: Implement week navigation
            }}
          />

          {/* Two-column layout for Progress Chart and Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            {/* Progress Chart */}
            <ProgressChart stats={data.stats} />

            {/* Recent Activity */}
            <RecentActivity records={data.recentRecords} />
          </div>

          {/* Certificate Upload - only show if certification is needed */}
          {data.status.needsCertification && (
            <CertificateUpload
              files={data.uploadedFiles}
              onUpload={async (file) => {
                console.log('Upload file:', file.name);
                // TODO: Implement file upload
              }}
              onDelete={async (fileId) => {
                console.log('Delete file:', fileId);
                // TODO: Implement file deletion
              }}
            />
          )}
        </div>
      </div>
    </main>
  );
}
