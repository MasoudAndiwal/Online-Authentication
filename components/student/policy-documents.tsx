'use client'

import { useState } from 'react'
import { ChevronDown, FileText, AlertCircle, ClipboardCheck, Scale } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export interface Policy {
  id: string
  title: string
  content: string
  lastUpdated: Date
  icon?: 'file' | 'alert' | 'clipboard' | 'scale'
}

interface PolicyDocumentsProps {
  policies?: Policy[]
}

const defaultPolicies: Policy[] = [
  {
    id: 'attendance-policy',
    title: 'Attendance Policy',
    icon: 'file',
    lastUpdated: new Date(),
    content: `University Attendance Policy

All students are required to maintain regular attendance in their enrolled courses. Attendance is tracked for each class session and contributes to your academic standing.

Key Points:
• Attendance is mandatory for all scheduled class sessions
• Students must attend at least 75% of total class hours
• Absences are categorized as: Present, Absent, Sick, or Leave
• Medical certificates must be submitted for sick leave within 3 days
• Unexcused absences may result in academic penalties

Attendance Tracking:
• Each class session is recorded individually
• Students can view their attendance records in real-time
• Weekly and monthly attendance summaries are available
• Notifications are sent when approaching warning thresholds

Responsibilities:
• Students must inform instructors of planned absences in advance
• Medical documentation must be submitted for illness-related absences
• Students should regularly check their attendance status
• Contact your instructor immediately if you notice any discrepancies`,
  },
  {
    id: 'mahroom-disqualified',
    title: 'محروم (Disqualified) Status',
    icon: 'alert',
    lastUpdated: new Date(),
    content: `Understanding Disqualified (محروم) Status

The term "محروم" (Mahroom) means "Disqualified" and represents a critical academic status that affects your exam eligibility.

What is محروم Status?
When a student's absences exceed the maximum allowable limit (typically 25% of total class hours), they are automatically placed in محروم status. This means the student is disqualified from taking the final examination for that course.

Calculation:
• Maximum allowed absences: 25% of total class hours
• Example: For a 40-hour course, maximum absences = 10 hours
• Exceeding this limit triggers محروم status

Consequences:
• You are NOT eligible to take the final exam
• You will receive a failing grade for the course
• You must re-enroll in the course in a future semester
• This status cannot be reversed once triggered

Prevention:
• Monitor your attendance regularly through the dashboard
• Pay attention to warning notifications
• Contact your instructor if you anticipate extended absences
• Submit medical certificates promptly for illness-related absences

Important Note:
محروم status is automatically calculated by the system based on your attendance records. Once you reach this threshold, immediate action is required to understand your options for the next semester.`,
  },
  {
    id: 'tasdiq-certification',
    title: 'تصدیق طلب (Certification Required) Status',
    icon: 'clipboard',
    lastUpdated: new Date(),
    content: `Understanding Certification Required (تصدیق طلب) Status

The term "تصدیق طلب" (Tasdiq Talab) means "Certification Required" and indicates that you need to submit medical documentation to maintain your exam eligibility.

What is تصدیق طلب Status?
When a student's absences reach a certain threshold (typically between 15-25% of total class hours), they enter تصدیق طلب status. This means medical certificates are required to justify the absences and maintain exam eligibility.

Calculation:
• Triggered when absences reach 15-25% of total class hours
• Example: For a 40-hour course, triggered at 6-10 hours of absence
• You must submit medical certificates to avoid محروم status

Required Documentation:
• Official medical certificates from recognized healthcare providers
• Certificates must be dated within the absence period
• Documents must be submitted within 3 days of returning to class
• Certificates should clearly state the medical condition and recommended rest period

Submission Process:
1. Obtain official medical certificate from your healthcare provider
2. Use the messaging system to contact your instructor or office
3. Attach scanned copies of medical certificates
4. Select "Documentation Submission" as the message category
5. Wait for confirmation of receipt and review

Consequences of Not Submitting:
• Absences remain unexcused
• You may progress to محروم status
• Risk of exam disqualification
• Potential failing grade for the course

Important Notes:
• Submit documentation as soon as possible
• Keep original certificates for your records
• Follow up if you don't receive confirmation within 48 hours
• Contact the office if you have questions about acceptable documentation`,
  },
  {
    id: 'student-rights',
    title: 'Student Rights and Responsibilities',
    icon: 'scale',
    lastUpdated: new Date(),
    content: `Student Rights and Responsibilities

As a student in the University Attendance System, you have specific rights and responsibilities regarding attendance tracking and academic standing.

Your Rights:
• Access to Real-Time Data: View your attendance records at any time
• Transparency: Clear visibility into how attendance affects your academic standing
• Notification: Receive timely alerts about approaching thresholds
• Appeal Process: Request review of attendance records if discrepancies exist
• Privacy: Your attendance data is confidential and secure
• Communication: Direct messaging with instructors and office staff
• Documentation: Submit medical certificates and supporting documentation

Your Responsibilities:
• Regular Attendance: Attend all scheduled class sessions
• Timely Notification: Inform instructors of planned absences in advance
• Documentation Submission: Submit medical certificates within required timeframes
• Record Verification: Regularly check attendance records for accuracy
• Threshold Monitoring: Stay aware of your attendance status and warnings
• Prompt Action: Respond quickly to alerts and notifications
• Honest Communication: Provide accurate information regarding absences

Dispute Resolution:
If you believe there is an error in your attendance records:
1. Review the specific session details in your attendance history
2. Gather any supporting evidence (emails, medical certificates, etc.)
3. Contact your instructor through the messaging system
4. Clearly explain the discrepancy with specific dates and details
5. Allow 48-72 hours for review and response
6. If unresolved, escalate to the office administration

Academic Integrity:
• Do not attempt to manipulate attendance records
• Submit only genuine medical certificates
• Provide truthful information about absences
• Respect the attendance policy and its enforcement

Support Resources:
• Help & Support section for FAQs and guidance
• Direct messaging with instructors and office staff
• Office hours for in-person consultations
• Technical support for system-related issues

Remember: Maintaining good attendance is your responsibility and directly impacts your academic success. Use the tools provided to stay informed and take proactive action when needed.`,
  },
]

const iconMap = {
  file: FileText,
  alert: AlertCircle,
  clipboard: ClipboardCheck,
  scale: Scale,
}

export function PolicyDocuments({ policies = defaultPolicies }: PolicyDocumentsProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const handleToggle = (id: string) => {
    setExpandedId(expandedId === id ? null : id)
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      {policies.map((policy) => {
        const Icon = iconMap[policy.icon || 'file']
        const isExpanded = expandedId === policy.id

        return (
          <Card
            key={policy.id}
            className={cn(
              'rounded-xl sm:rounded-2xl shadow-sm bg-white border-0 transition-all duration-300',
              isExpanded
                ? 'ring-2 ring-emerald-500 shadow-lg shadow-emerald-500/10'
                : 'hover:shadow-md'
            )}
          >
            <CardHeader className="p-0">
              <button
                onClick={() => handleToggle(policy.id)}
                className="w-full text-left p-4 sm:p-6 flex items-center justify-between gap-3 sm:gap-4 touch-manipulation min-h-[44px]"
              >
                <div className="flex items-center gap-3 sm:gap-4 flex-1">
                  <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-emerald-500/25">
                    <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-sm sm:text-base lg:text-lg font-semibold text-slate-900 mb-1">
                      {policy.title}
                    </CardTitle>
                    <p className="text-xs sm:text-sm text-slate-500">
                      Last updated: {policy.lastUpdated.toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <ChevronDown
                  className={cn(
                    'h-5 w-5 sm:h-6 sm:w-6 text-emerald-600 transition-transform duration-300 flex-shrink-0',
                    isExpanded && 'rotate-180'
                  )}
                />
              </button>
            </CardHeader>

            <div
              className={cn(
                'overflow-hidden transition-all duration-300',
                isExpanded ? 'max-h-[2000px]' : 'max-h-0'
              )}
            >
              <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6 pt-0">
                <div className="border-t border-slate-100 pt-4 sm:pt-6">
                  <div className="prose prose-sm sm:prose-base max-w-none">
                    <div className="text-slate-600 text-sm sm:text-base leading-relaxed whitespace-pre-line">
                      {policy.content}
                    </div>
                  </div>
                </div>
              </CardContent>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
