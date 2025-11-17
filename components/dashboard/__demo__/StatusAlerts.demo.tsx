'use client';

import { StatusAlerts } from '../StatusAlerts';
import { AcademicStatus, AttendanceStats } from '@/types/types';

/**
 * Demo page for StatusAlerts component
 * Shows different alert states
 */
export default function StatusAlertsDemo() {
  // Demo data - Disqualified student
  const disqualifiedStatus: AcademicStatus = {
    isDisqualified: true,
    needsCertification: false,
    disqualificationThreshold: 18,
    certificationThreshold: 12,
  };

  const disqualifiedStats: AttendanceStats = {
    totalDays: 50,
    presentDays: 30,
    absentDays: 20,
    sickDays: 0,
    leaveDays: 0,
    attendancePercentage: 60,
    pureAbsenceHours: 20,
    combinedAbsenceHours: 20,
  };

  // Demo data - Certification required
  const certificationStatus: AcademicStatus = {
    isDisqualified: false,
    needsCertification: true,
    disqualificationThreshold: 18,
    certificationThreshold: 12,
  };

  const certificationStats: AttendanceStats = {
    totalDays: 50,
    presentDays: 35,
    absentDays: 5,
    sickDays: 8,
    leaveDays: 2,
    attendancePercentage: 70,
    pureAbsenceHours: 5,
    combinedAbsenceHours: 15,
  };

  // Demo data - Both alerts
  const bothStatus: AcademicStatus = {
    isDisqualified: true,
    needsCertification: true,
    disqualificationThreshold: 18,
    certificationThreshold: 12,
  };

  const bothStats: AttendanceStats = {
    totalDays: 50,
    presentDays: 25,
    absentDays: 20,
    sickDays: 5,
    leaveDays: 0,
    attendancePercentage: 50,
    pureAbsenceHours: 20,
    combinedAbsenceHours: 25,
  };

  // Demo data - No alerts
  const goodStatus: AcademicStatus = {
    isDisqualified: false,
    needsCertification: false,
    disqualificationThreshold: 18,
    certificationThreshold: 12,
  };

  const goodStats: AttendanceStats = {
    totalDays: 50,
    presentDays: 45,
    absentDays: 3,
    sickDays: 2,
    leaveDays: 0,
    attendancePercentage: 90,
    pureAbsenceHours: 3,
    combinedAbsenceHours: 5,
  };

  const handleUploadClick = () => {
    alert('Upload button clicked! This would scroll to or open the upload section.');
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-4xl mx-auto space-y-12">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            StatusAlerts Component Demo
          </h1>
          <p className="text-slate-600">
            Demonstrating different alert states for the student dashboard
          </p>
        </div>

        {/* Disqualified Only */}
        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-900 mb-1">
              Disqualified Only (محروم)
            </h2>
            <p className="text-sm text-slate-600">
              Pure absence hours exceed threshold
            </p>
          </div>
          <StatusAlerts
            status={disqualifiedStatus}
            stats={disqualifiedStats}
            onUploadClick={handleUploadClick}
          />
        </section>

        {/* Certification Required Only */}
        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-900 mb-1">
              Certification Required Only (تصدیق طلب)
            </h2>
            <p className="text-sm text-slate-600">
              Combined absence hours exceed threshold
            </p>
          </div>
          <StatusAlerts
            status={certificationStatus}
            stats={certificationStats}
            onUploadClick={handleUploadClick}
          />
        </section>

        {/* Both Alerts */}
        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-900 mb-1">
              Both Alerts
            </h2>
            <p className="text-sm text-slate-600">
              Both thresholds exceeded
            </p>
          </div>
          <StatusAlerts
            status={bothStatus}
            stats={bothStats}
            onUploadClick={handleUploadClick}
          />
        </section>

        {/* No Alerts */}
        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-900 mb-1">
              No Alerts (Good Standing)
            </h2>
            <p className="text-sm text-slate-600">
              Student is in good standing - component returns null
            </p>
          </div>
          <div className="bg-white border-0 shadow-sm rounded-xl p-6">
            <StatusAlerts
              status={goodStatus}
              stats={goodStats}
              onUploadClick={handleUploadClick}
            />
            <p className="text-slate-600 text-center">
              {goodStatus.isDisqualified || goodStatus.needsCertification
                ? 'Alerts would appear here'
                : '✓ No alerts - component returns null'}
            </p>
          </div>
        </section>

        {/* Without Upload Handler */}
        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-900 mb-1">
              Without Upload Handler
            </h2>
            <p className="text-sm text-slate-600">
              Certification alert without onUploadClick prop (no button)
            </p>
          </div>
          <StatusAlerts
            status={certificationStatus}
            stats={certificationStats}
          />
        </section>
      </div>
    </div>
  );
}
