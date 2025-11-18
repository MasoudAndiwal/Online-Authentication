'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  FileText,
  MessageCircle,
  Upload,
  Info
} from 'lucide-react'

export type AcademicStatus = 'good-standing' | 'warning' | 'mahroom' | 'tasdiq'

interface AcademicStandingAlertsProps {
  status: AcademicStatus
  attendanceRate: number
  remainingAbsences: number
  mahroomThreshold?: number
  tasdiqThreshold?: number
  onContactTeacher?: () => void
  onUploadDocumentation?: () => void
  onViewPolicy?: () => void
  className?: string
}

interface AlertConfig {
  type: 'info' | 'warning' | 'critical'
  title: string
  message: string
  icon: React.ReactNode
  bgGradient: string
  borderColor: string
  iconColor: string
  titleColor: string
  textColor: string
  badgeColor: string
  actionRequired: boolean
  actions?: Array<{
    label: string
    icon: React.ReactNode
    onClick?: () => void
    variant: 'default' | 'outline' | 'secondary'
    className?: string
  }>
  pulse?: boolean
}

/**
 * Academic Standing Alerts Component
 * 
 * Displays academic standing alerts based on attendance status:
 * - Good Standing: Green theme with positive reinforcement
 * - Warning: Yellow theme with remaining absences info
 * - محروم (Disqualified): Red theme with critical alert and pulsing animation
 * - تصدیق طلب (Certification Required): Orange theme with documentation upload action
 * 
 * Features:
 * - Four distinct alert types with appropriate styling
 * - Pulsing animations for critical alerts
 * - Action buttons for each alert type
 * - Fully responsive design (mobile, tablet, desktop)
 * - Touch-friendly buttons (44px minimum on mobile)
 * - Clear English explanations with Arabic terms
 */
export function AcademicStandingAlerts({
  status,
  attendanceRate,
  remainingAbsences,
  mahroomThreshold = 75,
  tasdiqThreshold = 85,
  onContactTeacher,
  onUploadDocumentation,
  onViewPolicy,
  className = ''
}: AcademicStandingAlertsProps) {
  
  const getAlertConfig = (): AlertConfig => {
    switch (status) {
      case 'good-standing':
        return {
          type: 'info',
          title: '✅ Excellent: Good Standing',
          message: `Outstanding! Your attendance rate is ${attendanceRate.toFixed(1)}%. You're in good standing and eligible for all exams. Keep up the great work!`,
          icon: <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7" />,
          bgGradient: 'bg-gradient-to-br from-green-50 to-green-100/50',
          borderColor: 'border-green-200',
          iconColor: 'text-green-600',
          titleColor: 'text-green-800',
          textColor: 'text-green-700',
          badgeColor: 'bg-green-100 text-green-700',
          actionRequired: false,
          actions: [
            {
              label: 'View Policy',
              icon: <Info className="h-4 w-4" />,
              onClick: onViewPolicy,
              variant: 'outline',
              className: 'border-green-300 text-green-700 hover:bg-green-50'
            }
          ],
          pulse: false
        }

      case 'warning':
        return {
          type: 'warning',
          title: '⚠️ Caution: Watch Your Absences',
          message: `Your attendance rate is ${attendanceRate.toFixed(1)}%. You have ${remainingAbsences} absence(s) remaining before reaching the warning threshold. Please maintain good attendance to avoid complications.`,
          icon: <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7" />,
          bgGradient: 'bg-gradient-to-br from-yellow-50 to-yellow-100/50',
          borderColor: 'border-yellow-200',
          iconColor: 'text-yellow-600',
          titleColor: 'text-yellow-800',
          textColor: 'text-yellow-700',
          badgeColor: 'bg-yellow-100 text-yellow-700',
          actionRequired: true,
          actions: [
            {
              label: 'Contact Teacher',
              icon: <MessageCircle className="h-4 w-4" />,
              onClick: onContactTeacher,
              variant: 'default',
              className: 'bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 text-white border-0 shadow-lg shadow-yellow-500/25'
            },
            {
              label: 'View Policy',
              icon: <FileText className="h-4 w-4" />,
              onClick: onViewPolicy,
              variant: 'outline',
              className: 'border-yellow-300 text-yellow-700 hover:bg-yellow-50'
            }
          ],
          pulse: false
        }

      case 'mahroom':
        return {
          type: 'critical',
          title: '🚫 Critical: Disqualified (محروم)',
          message: `Your attendance rate is ${attendanceRate.toFixed(1)}%, which is below the required ${mahroomThreshold}%. You have exceeded the maximum allowed absences and are not eligible for final exams. Please contact your teacher or office immediately to discuss your options.`,
          icon: <XCircle className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7" />,
          bgGradient: 'bg-gradient-to-br from-red-50 to-red-100/50',
          borderColor: 'border-red-200',
          iconColor: 'text-red-600',
          titleColor: 'text-red-800',
          textColor: 'text-red-700',
          badgeColor: 'bg-red-100 text-red-700',
          actionRequired: true,
          actions: [
            {
              label: 'Contact Teacher',
              icon: <MessageCircle className="h-4 w-4" />,
              onClick: onContactTeacher,
              variant: 'default',
              className: 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white border-0 shadow-lg shadow-red-500/25'
            },
            {
              label: 'Contact Office',
              icon: <MessageCircle className="h-4 w-4" />,
              onClick: onContactTeacher, // Can be separate office contact handler
              variant: 'outline',
              className: 'border-red-300 text-red-700 hover:bg-red-50'
            }
          ],
          pulse: true
        }

      case 'tasdiq':
        return {
          type: 'critical',
          title: '📋 Critical: Certification Required (تصدیق طلب)',
          message: `Your attendance rate is ${attendanceRate.toFixed(1)}%, which is below ${tasdiqThreshold}%. You need to submit medical certificates or official documentation to restore your exam eligibility. Upload your documentation as soon as possible.`,
          icon: <FileText className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7" />,
          bgGradient: 'bg-gradient-to-br from-orange-50 to-orange-100/50',
          borderColor: 'border-orange-200',
          iconColor: 'text-orange-600',
          titleColor: 'text-orange-800',
          textColor: 'text-orange-700',
          badgeColor: 'bg-orange-100 text-orange-700',
          actionRequired: true,
          actions: [
            {
              label: 'Upload Documentation',
              icon: <Upload className="h-4 w-4" />,
              onClick: onUploadDocumentation,
              variant: 'default',
              className: 'bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white border-0 shadow-lg shadow-orange-500/25'
            },
            {
              label: 'Contact Teacher',
              icon: <MessageCircle className="h-4 w-4" />,
              onClick: onContactTeacher,
              variant: 'outline',
              className: 'border-orange-300 text-orange-700 hover:bg-orange-50'
            }
          ],
          pulse: true
        }

      default:
        return getAlertConfig() // Fallback to good-standing
    }
  }

  const alertConfig = getAlertConfig()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={className}
    >
      <Card 
        className={`
          rounded-2xl shadow-xl border-2 
          ${alertConfig.bgGradient} 
          ${alertConfig.borderColor}
        `}
      >
        <CardContent className="p-4 sm:p-5 lg:p-6">
          {/* Header with Icon and Title */}
          <div className="flex items-start gap-3 sm:gap-4 mb-4">
            <motion.div
              className={alertConfig.iconColor}
              animate={alertConfig.pulse ? { scale: [1, 1.1, 1] } : {}}
              transition={{ 
                duration: 1.5, 
                repeat: alertConfig.pulse ? Infinity : 0,
                ease: "easeInOut"
              }}
            >
              {alertConfig.icon}
            </motion.div>
            
            <div className="flex-1">
              <h3 className={`
                text-base sm:text-lg lg:text-xl 
                font-bold 
                ${alertConfig.titleColor} 
                mb-2
              `}>
                {alertConfig.title}
              </h3>
              
              <p className={`
                text-sm sm:text-base 
                ${alertConfig.textColor} 
                leading-relaxed
              `}>
                {alertConfig.message}
              </p>
            </div>
          </div>

          {/* Status Badge */}
          {alertConfig.actionRequired && (
            <div className={`
              ${alertConfig.badgeColor} 
              rounded-xl 
              p-3 sm:p-4 
              mb-4
            `}>
              <p className="text-xs sm:text-sm font-medium">
                ⚡ Action Required: {
                  status === 'mahroom' 
                    ? 'Contact your teacher or office immediately'
                    : status === 'tasdiq'
                    ? 'Submit medical certificates to restore eligibility'
                    : 'Monitor your attendance closely'
                }
              </p>
            </div>
          )}

          {/* Remaining Absences Info (for non-critical statuses) */}
          {(status === 'good-standing' || status === 'warning') && (
            <div className={`
              ${alertConfig.badgeColor} 
              rounded-xl 
              p-3 sm:p-4 
              mb-4
            `}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs sm:text-sm font-medium mb-1">
                    Remaining Absences
                  </div>
                  <div className="text-lg sm:text-xl lg:text-2xl font-bold">
                    {remainingAbsences}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs sm:text-sm font-medium mb-1">
                    Current Rate
                  </div>
                  <div className="text-lg sm:text-xl lg:text-2xl font-bold">
                    {attendanceRate.toFixed(1)}%
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {alertConfig.actions && alertConfig.actions.length > 0 && (
            <div className="
              flex flex-col sm:flex-row 
              gap-2 sm:gap-3 
              mt-4 sm:mt-6
            ">
              {alertConfig.actions.map((action, index) => (
                <Button
                  key={index}
                  onClick={action.onClick}
                  variant={action.variant}
                  className={`
                    min-h-[44px] 
                    w-full sm:w-auto 
                    text-sm sm:text-base
                    touch-manipulation
                    ${action.className || ''}
                  `}
                >
                  {action.icon}
                  {action.label}
                </Button>
              ))}
            </div>
          )}

          {/* Explanation for Arabic Terms */}
          {(status === 'mahroom' || status === 'tasdiq') && (
            <div className={`
              mt-4 sm:mt-6 
              p-3 sm:p-4 
              ${alertConfig.badgeColor} 
              rounded-xl
              border-l-4
              ${status === 'mahroom' ? 'border-red-500' : 'border-orange-500'}
            `}>
              <p className="text-xs sm:text-sm font-semibold mb-2">
                {status === 'mahroom' ? 'What does محروم (Mahroom) mean?' : 'What does تصدیق طلب (Tasdiq Talab) mean?'}
              </p>
              <p className="text-xs sm:text-sm">
                {status === 'mahroom' 
                  ? 'محروم (Mahroom) means "Disqualified" in English. This status indicates that you have exceeded the maximum allowed absences and are not eligible to take final exams for this course.'
                  : 'تصدیق طلب (Tasdiq Talab) means "Certification Required" in English. This status indicates that you need to submit official medical certificates or documentation to justify your absences and restore your exam eligibility.'
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
