'use client';

import { AlertTriangle, FileText, Upload } from 'lucide-react';
import { motion } from 'framer-motion';
import { AcademicStatus, AttendanceStats } from '@/types/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface StatusAlertsProps {
  status: AcademicStatus;
  stats: AttendanceStats;
  onUploadClick?: () => void;
}

/**
 * StatusAlerts component displays warning banners for academic status
 * Features:
 * - Disqualification alert (محروم) with red gradient background
 * - Certification required alert (تصدیق طلب) with amber gradient background
 * - Animated warning icons with shake/pulse effects
 * - Progress bars showing hours vs threshold
 * - Borderless design with colored shadows
 * - Call-to-action button for certification upload
 */
export function StatusAlerts({ status, stats, onUploadClick }: StatusAlertsProps) {
  // Don't render if no alerts are needed
  if (!status.isDisqualified && !status.needsCertification) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Disqualification Alert (محروم) */}
      {status.isDisqualified && (
        <DisqualificationAlert
          pureAbsenceHours={stats.pureAbsenceHours}
          threshold={status.disqualificationThreshold}
        />
      )}

      {/* Certification Required Alert (تصدیق طلب) */}
      {status.needsCertification && (
        <CertificationAlert
          combinedAbsenceHours={stats.combinedAbsenceHours}
          threshold={status.certificationThreshold}
          onUploadClick={onUploadClick}
        />
      )}
    </div>
  );
}

interface DisqualificationAlertProps {
  pureAbsenceHours: number;
  threshold: number;
}

/**
 * Disqualification Alert (محروم)
 * Red gradient background with animated warning icon
 */
function DisqualificationAlert({
  pureAbsenceHours,
  threshold,
}: DisqualificationAlertProps) {
  const percentage = Math.min((pureAbsenceHours / threshold) * 100, 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className={cn(
        // Borderless with shadow
        'border-0 shadow-lg rounded-2xl p-6',
        // Red gradient background
        'bg-gradient-to-r from-red-500 to-red-600',
        // Colored shadow
        'shadow-red-500/30',
        // Text color
        'text-white'
      )}
      role="alert"
      aria-live="assertive"
    >
      <div className="flex items-start gap-4">
        {/* Animated warning icon with shake effect */}
        <motion.div
          animate={{
            rotate: [0, -5, 5, -5, 5, 0],
          }}
          transition={{
            duration: 0.5,
            repeat: Infinity,
            repeatDelay: 2,
            ease: 'easeInOut',
          }}
          className="flex-shrink-0"
        >
          <div className="w-12 h-12 rounded-lg bg-white/20 flex items-center justify-center backdrop-blur-sm">
            <AlertTriangle className="w-6 h-6 text-white" />
          </div>
        </motion.div>

        {/* Content */}
        <div className="flex-1 space-y-3">
          {/* Warning text */}
          <div>
            <h3 className="text-lg font-bold mb-1">
              محروم - Disqualified from Final Exam
            </h3>
            <p className="text-sm text-white/90">
              Your pure absence hours ({pureAbsenceHours}) have exceeded the threshold ({threshold} hours).
              You are not eligible to register for the final exam.
            </p>
          </div>

          {/* Progress bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-white/80">
              <span>Absence Hours</span>
              <span className="font-semibold">
                {pureAbsenceHours} / {threshold}
              </span>
            </div>
            <div className="h-2 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="h-full bg-white rounded-full"
              />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

interface CertificationAlertProps {
  combinedAbsenceHours: number;
  threshold: number;
  onUploadClick?: () => void;
}

/**
 * Certification Required Alert (تصدیق طلب)
 * Amber gradient background with animated document icon
 */
function CertificationAlert({
  combinedAbsenceHours,
  threshold,
  onUploadClick,
}: CertificationAlertProps) {
  const percentage = Math.min((combinedAbsenceHours / threshold) * 100, 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut', delay: 0.1 }}
      className={cn(
        // Borderless with shadow
        'border-0 shadow-lg rounded-2xl p-6',
        // Amber gradient background
        'bg-gradient-to-r from-amber-500 to-amber-600',
        // Colored shadow
        'shadow-amber-500/30',
        // Text color
        'text-white'
      )}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start gap-4">
        {/* Animated document icon with pulse effect */}
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="flex-shrink-0"
        >
          <div className="w-12 h-12 rounded-lg bg-white/20 flex items-center justify-center backdrop-blur-sm">
            <FileText className="w-6 h-6 text-white" />
          </div>
        </motion.div>

        {/* Content */}
        <div className="flex-1 space-y-3">
          {/* Warning text */}
          <div>
            <h3 className="text-lg font-bold mb-1">
              تصدیق طلب - Medical Certification Required
            </h3>
            <p className="text-sm text-white/90">
              Your combined absence hours ({combinedAbsenceHours}) have exceeded the threshold ({threshold} hours).
              Please upload medical certificates to maintain exam eligibility.
            </p>
          </div>

          {/* Progress bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-white/80">
              <span>Combined Absence Hours</span>
              <span className="font-semibold">
                {combinedAbsenceHours} / {threshold}
              </span>
            </div>
            <div className="h-2 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
                className="h-full bg-white rounded-full"
              />
            </div>
          </div>

          {/* Call-to-action button */}
          {onUploadClick && (
            <Button
              onClick={onUploadClick}
              className={cn(
                // Custom styling for this context
                'bg-white text-amber-600 border-0 shadow-md',
                'hover:bg-white/90 hover:shadow-lg',
                'transition-all duration-200',
                'font-semibold'
              )}
              size="sm"
            >
              <Upload className="w-4 h-4" />
              Upload Medical Certificate
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
