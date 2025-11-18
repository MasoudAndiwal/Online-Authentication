'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Shield, 
  AlertTriangle, 
  XCircle, 
  FileText, 
  ChevronDown,
  ChevronUp,
  CheckCircle
} from 'lucide-react'

interface AttendancePolicyCardProps {
  maxAbsences: number
  mahroomThreshold: number
  tasdiqThreshold: number
}

/**
 * Attendance Policy Card Component
 * Displays attendance rules in clear English
 * Shows visual representation of thresholds
 * Explains محروم (Disqualified) in English
 * Explains تصدیق طلب (Certification Required) in English
 * Creates FAQ accordion for common questions
 * Validates: Requirements 5.2, 9.1, 9.2, 9.3, 9.4, 15.4, 15.6
 */
export function AttendancePolicyCard({
  maxAbsences,
  mahroomThreshold,
  tasdiqThreshold
}: AttendancePolicyCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Card className="rounded-2xl shadow-xl bg-white/80 backdrop-blur-xl border-0">
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-600" />
            Attendance Policy
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-5 lg:p-6 space-y-6">
          {/* Policy Overview */}
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-xl p-4 sm:p-5 border border-emerald-200/50">
            <h3 className="text-base sm:text-lg font-bold text-emerald-700 mb-3 flex items-center gap-2">
              <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5" />
              Attendance Requirements
            </h3>
            <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
              Students must maintain regular attendance to remain eligible for final examinations. 
              The university has established clear thresholds to ensure academic engagement and success.
            </p>
          </div>

          {/* Threshold Visual Representation */}
          <div className="space-y-4">
            <h4 className="text-base sm:text-lg font-semibold text-slate-800">
              Attendance Thresholds
            </h4>

            {/* Good Standing */}
            <ThresholdItem
              icon={<CheckCircle className="h-5 w-5" />}
              title="Good Standing"
              description="Attendance rate above 85%"
              color="green"
              percentage={85}
            />

            {/* Warning Zone */}
            <ThresholdItem
              icon={<AlertTriangle className="h-5 w-5" />}
              title="Warning Zone"
              description={`Attendance rate between ${tasdiqThreshold}% and 85%`}
              color="yellow"
              percentage={tasdiqThreshold}
            />

            {/* Certification Required (تصدیق طلب) */}
            <ThresholdItem
              icon={<FileText className="h-5 w-5" />}
              title="Certification Required (تصدیق طلب)"
              description={`Attendance rate between ${mahroomThreshold}% and ${tasdiqThreshold}%`}
              color="orange"
              percentage={mahroomThreshold}
              details="Students in this zone must submit medical certificates or valid documentation to restore exam eligibility. All absences must be justified with proper documentation."
            />

            {/* Disqualified (محروم) */}
            <ThresholdItem
              icon={<XCircle className="h-5 w-5" />}
              title="Disqualified (محروم)"
              description={`Attendance rate below ${mahroomThreshold}%`}
              color="red"
              percentage={0}
              details="Students who fall below this threshold are not eligible to take final examinations. This status indicates excessive absences that prevent adequate course participation."
            />
          </div>

          {/* FAQ Section */}
          <div className="space-y-3">
            <h4 className="text-base sm:text-lg font-semibold text-slate-800">
              Frequently Asked Questions
            </h4>
            
            <FAQAccordion
              question="What does محروم (Disqualified) mean?"
              answer={`محروم (Disqualified) means you have exceeded the maximum allowed absences and are not eligible to take final examinations. This occurs when your attendance rate falls below ${mahroomThreshold}%. To avoid this status, you must maintain regular attendance and minimize absences.`}
            />

            <FAQAccordion
              question="What does تصدیق طلب (Certification Required) mean?"
              answer={`تصدیق طلب (Certification Required) means you need to submit medical certificates or other valid documentation to justify your absences and restore your exam eligibility. This status applies when your attendance rate is between ${mahroomThreshold}% and ${tasdiqThreshold}%. You must provide proper documentation for all absences to the administration office.`}
            />

            <FAQAccordion
              question="How can I avoid being disqualified?"
              answer="To maintain good standing, attend all scheduled classes regularly. If you must be absent due to illness or emergency, obtain proper documentation (medical certificate, official letter) and submit it to the administration office as soon as possible. Keep track of your attendance rate through this dashboard."
            />

            <FAQAccordion
              question="What documentation is accepted for absences?"
              answer="Accepted documentation includes: medical certificates from licensed healthcare providers, official letters for family emergencies, court summons, or other official documents. All documentation must be submitted to the administration office within a reasonable timeframe."
            />

            <FAQAccordion
              question="Can I appeal a disqualification?"
              answer="Yes, you can appeal a disqualification by contacting the administration office with valid documentation and explanation for your absences. Appeals are reviewed on a case-by-case basis. Use the messaging system to contact your teacher or the office for guidance."
            />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

interface ThresholdItemProps {
  icon: React.ReactNode
  title: string
  description: string
  color: 'green' | 'yellow' | 'orange' | 'red'
  percentage: number
  details?: string
}

function ThresholdItem({ icon, title, description, color, percentage, details }: ThresholdItemProps) {
  const [isExpanded, setIsExpanded] = React.useState(false)

  const colorClasses = {
    green: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-700',
      iconBg: 'bg-green-500'
    },
    yellow: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      text: 'text-yellow-700',
      iconBg: 'bg-yellow-500'
    },
    orange: {
      bg: 'bg-orange-50',
      border: 'border-orange-200',
      text: 'text-orange-700',
      iconBg: 'bg-orange-500'
    },
    red: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-700',
      iconBg: 'bg-red-500'
    }
  }

  const colors = colorClasses[color]

  return (
    <div className={`${colors.bg} ${colors.border} border rounded-lg p-3 sm:p-4`}>
      <div className="flex items-start gap-3">
        <div className={`${colors.iconBg} p-2 rounded-lg text-white flex-shrink-0`}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <h5 className={`text-sm sm:text-base font-bold ${colors.text} mb-1`}>
            {title}
          </h5>
          <p className="text-xs sm:text-sm text-slate-600 mb-2">
            {description}
          </p>
          
          {details && (
            <>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className={`flex items-center gap-1 text-xs sm:text-sm ${colors.text} font-medium hover:underline`}
              >
                {isExpanded ? (
                  <>
                    <ChevronUp className="h-3 w-3 sm:h-4 sm:w-4" />
                    Show less
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4" />
                    Learn more
                  </>
                )}
              </button>
              
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mt-3 pt-3 border-t border-slate-200"
                >
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                    {details}
                  </p>
                </motion.div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

interface FAQAccordionProps {
  question: string
  answer: string
}

function FAQAccordion({ question, answer }: FAQAccordionProps) {
  const [isOpen, setIsOpen] = React.useState(false)

  return (
    <div className="bg-white/60 backdrop-blur-sm rounded-lg border border-slate-200/50 overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 sm:px-5 sm:py-4 flex items-center justify-between gap-3 hover:bg-emerald-50/50 transition-colors text-left"
      >
        <span className="text-sm sm:text-base font-semibold text-slate-800">
          {question}
        </span>
        {isOpen ? (
          <ChevronUp className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600 flex-shrink-0" />
        ) : (
          <ChevronDown className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600 flex-shrink-0" />
        )}
      </button>
      
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="px-4 pb-3 sm:px-5 sm:pb-4 border-t border-slate-200/50"
        >
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed pt-3">
            {answer}
          </p>
        </motion.div>
      )}
    </div>
  )
}
