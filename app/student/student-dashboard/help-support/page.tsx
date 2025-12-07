'use client'

import { useState, Suspense, lazy } from 'react'
import { useRouter } from 'next/navigation'
import { HelpCircle, BookOpen, Phone, Loader2 } from 'lucide-react'
import { StudentGuard } from '@/components/auth/role-guard'
import { ModernDashboardLayout, PageContainer } from '@/components/layout/modern-dashboard-layout'
import { useCurrentUser } from '@/hooks/use-current-user'
import { handleLogout } from '@/lib/auth/logout'
import { NotificationBell } from '@/components/student/notification-bell'
import { type FAQ } from '@/components/student/faq-accordion'
import { Card, CardContent } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'

// Lazy load heavy components for better performance
const FAQAccordion = lazy(() => import('@/components/student/faq-accordion').then(mod => ({ default: mod.FAQAccordion })))
const PolicyDocuments = lazy(() => import('@/components/student/policy-documents').then(mod => ({ default: mod.PolicyDocuments })))
const ContactInformationCard = lazy(() => import('@/components/student/contact-information-card').then(mod => ({ default: mod.ContactInformationCard })))

// Sample FAQ data
const sampleFAQs: FAQ[] = [
  {
    id: 'faq-1',
    question: 'How is my attendance calculated?',
    answer: `Your attendance is calculated based on the number of class sessions you attend versus the total number of sessions held.

The formula is: (Present Sessions / Total Sessions) × 100 = Attendance Rate

For example:
• Total class sessions: 40
• Sessions attended: 36
• Attendance rate: (36/40) × 100 = 90%

Your attendance rate is updated in real-time as instructors mark attendance for each session.`,
    category: 'Attendance',
  },
  {
    id: 'faq-2',
    question: 'What happens if I reach محروم (Disqualified) status?',
    answer: `محروم (Mahroom) means "Disqualified" and is a critical status that affects your exam eligibility.

When you reach محروم status:
• You are NOT eligible to take the final exam
• You will receive a failing grade for the course
• You must re-enroll in the course in a future semester
• This status cannot be reversed once triggered

محروم status is triggered when your absences exceed 25% of total class hours. The system automatically calculates this and will send you warnings as you approach this threshold.

Prevention is key: Monitor your attendance regularly and contact your instructor if you anticipate extended absences.`,
    category: 'Policies',
  },
  {
    id: 'faq-3',
    question: 'How do I submit medical certificates?',
    answer: `To submit medical certificates for sick leave:

1. Go to the Messages section in the sidebar
2. Click "New Message" or "Send Message to Office"
3. Select "Documentation Submission" as the category
4. Write a brief explanation of your absence
5. Attach your medical certificate (PDF, JPG, or PNG format)
6. Click "Send"

Important requirements:
• Certificates must be from recognized healthcare providers
• Submit within 3 days of returning to class
• Certificates should clearly state the medical condition and rest period
• Keep original certificates for your records

You will receive a confirmation message once your documentation has been reviewed.`,
    category: 'Policies',
  },
  {
    id: 'faq-4',
    question: 'What is تصدیق طلب (Certification Required) status?',
    answer: `تصدیق طلب (Tasdiq Talab) means "Certification Required" and indicates you need to submit medical documentation.

This status is triggered when your absences reach 15-25% of total class hours. It's a warning that you're approaching the محروم threshold and need to provide medical justification for your absences.

What to do:
• Submit medical certificates for any illness-related absences
• Use the messaging system to send documentation to your instructor
• Follow up if you don't receive confirmation within 48 hours
• Continue monitoring your attendance status

If you don't submit required documentation, you may progress to محروم status and lose exam eligibility.`,
    category: 'Policies',
  },
  {
    id: 'faq-5',
    question: 'Can I view my attendance history?',
    answer: `Yes! You can view your complete attendance history:

1. Click "My Attendance" in the sidebar
2. Scroll to the "Attendance History" section
3. Use filters to view specific date ranges or status types
4. Click on any record to see detailed information

Your attendance history shows:
• Date and session number
• Status (Present, Absent, Sick, Leave)
• Who marked the attendance and when
• Any notes or comments from instructors

You can also export your attendance history as PDF or CSV for your records.`,
    category: 'Attendance',
  },
  {
    id: 'faq-6',
    question: 'How do I contact my teacher?',
    answer: `You can contact your teacher through the messaging system:

1. Click "Messages" in the sidebar
2. Click "New Message" or find your teacher in the conversation list
3. Select the appropriate category (Attendance Inquiry, General, etc.)
4. Type your message and attach any files if needed
5. Click "Send"

You can also:
• View teacher contact information in the "Class Information" section
• Check office hours and location
• Use the "Contact Teacher" button on your dashboard

Teachers typically respond within 24-48 hours during the academic week.`,
    category: 'General',
  },
  {
    id: 'faq-7',
    question: 'Why is my attendance showing as Absent when I was present?',
    answer: `If you believe there's an error in your attendance record:

1. Check the specific session details in your attendance history
2. Verify the date and time of the session
3. Gather any supporting evidence (emails, photos, etc.)
4. Contact your instructor through the messaging system
5. Clearly explain the discrepancy with specific details

Common reasons for discrepancies:
• Late arrival (may be marked absent if you arrived after roll call)
• Early departure (may be marked absent if you left before the end)
• Technical issues during attendance marking
• Confusion with another student's record

Your instructor will review your case and make corrections if necessary. Allow 48-72 hours for a response.`,
    category: 'Attendance',
  },
  {
    id: 'faq-8',
    question: 'Can I edit or delete my attendance records?',
    answer: `No, students cannot edit or delete attendance records. This is a security feature to maintain data integrity.

Attendance records are:
• Marked by instructors or authorized staff only
• Permanently recorded in the system
• Protected from unauthorized modifications
• Part of your official academic record

If you believe there's an error in your attendance record, you must contact your instructor to request a review. Only instructors and authorized staff can make corrections to attendance records.

This read-only access ensures the accuracy and reliability of attendance data for all students.`,
    category: 'Technical',
  },
  {
    id: 'faq-9',
    question: 'How often is my attendance data updated?',
    answer: `Your attendance data is updated in real-time:

• Attendance is marked immediately after each class session
• Your dashboard reflects changes within seconds
• Notifications are sent as soon as attendance is recorded
• Statistics and percentages are recalculated automatically

You can refresh your browser to see the latest data, but the system automatically updates in the background.

If you notice a delay of more than 24 hours after a class session, contact your instructor to ensure attendance was properly recorded.`,
    category: 'Technical',
  },
  {
    id: 'faq-10',
    question: 'What should I do if I need to miss multiple classes?',
    answer: `If you anticipate missing multiple classes:

1. Contact your instructor as soon as possible
2. Explain the reason for your anticipated absences
3. Provide any supporting documentation (medical, family emergency, etc.)
4. Ask about makeup work or alternative arrangements
5. Monitor your attendance status regularly

Important considerations:
• Planned absences should be communicated in advance
• Medical absences require certificates within 3 days of return
• Extended absences may trigger تصدیق طلب or محروم status
• Stay in communication with your instructor throughout

Remember: Even with valid reasons, excessive absences can affect your exam eligibility. Plan accordingly and seek guidance from your instructor.`,
    category: 'General',
  },
  {
    id: 'faq-11',
    question: 'How do I export my attendance records?',
    answer: `To export your attendance records:

1. Go to "My Attendance" in the sidebar
2. Scroll to the "Attendance History" section
3. Use filters to select the date range you want to export
4. Click the "Export to PDF" or "Export to CSV" button
5. Your file will download automatically

Export formats:
• PDF: Formatted report suitable for printing or sharing
• CSV: Spreadsheet format for data analysis in Excel or Google Sheets

Exported records include:
• Date and session information
• Attendance status for each session
• Summary statistics
• Date range covered

You can export your records at any time for your personal records or to share with advisors.`,
    category: 'Technical',
  },
  {
    id: 'faq-12',
    question: 'What are the different attendance status types?',
    answer: `There are four main attendance status types:

1. Present (Green ✓)
   • You attended the class session
   • Counted as positive attendance
   • Contributes to your attendance rate

2. Absent (Red ✗)
   • You did not attend the class session
   • Counted as negative attendance
   • Reduces your attendance rate and counts toward thresholds

3. Sick (Yellow 🤒)
   • You were absent due to illness
   • Requires medical certificate for justification
   • May be excused if proper documentation is submitted

4. Leave (Blue 📅)
   • You were absent with approved leave
   • Requires prior approval or documentation
   • May be excused depending on circumstances

Your overall attendance rate is calculated based on Present vs. Total sessions. Sick and Leave absences still count toward your total absences unless properly documented and approved.`,
    category: 'Attendance',
  },
]

export default function HelpSupportPage() {
  const router = useRouter()
  const { user, loading: userLoading } = useCurrentUser()
  const [unreadNotifications] = useState(0)
  const [faqFeedback, setFaqFeedback] = useState<Record<string, boolean>>({})
  const { toast } = useToast()

  const handleFaqFeedback = (faqId: string, helpful: boolean) => {
    setFaqFeedback((prev) => ({ ...prev, [faqId]: helpful }))
    console.log(`FAQ ${faqId} marked as ${helpful ? 'helpful' : 'not helpful'}`)
  }

  const handleSendMessage = () => {
    toast({
      title: "Coming Soon",
      description: "Messages feature is under development and will be available soon.",
    })
  }

  const handleNavigation = (href: string) => {
    router.push(href)
  }

  const onLogout = async () => {
    await handleLogout()
    router.push('/login')
  }

  const handleNotificationClick = () => {
    console.log('Notification bell clicked')
  }

  if (userLoading) {
    return (
      <StudentGuard>
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50/30 flex items-center justify-center">
          <Loader2 className="h-8 w-8 text-emerald-600 animate-spin" />
        </div>
      </StudentGuard>
    )
  }

  return (
    <StudentGuard>
      <ModernDashboardLayout
        user={user || undefined}
        title="Help & Support"
        subtitle="Find answers and get assistance"
        currentPath="/student/student-dashboard/help-support"
        onNavigate={handleNavigation}
        onLogout={onLogout}
        hideSearch={true}
        notificationTrigger={
          <NotificationBell
            unreadCount={unreadNotifications}
            onClick={handleNotificationClick}
          />
        }
      >
        <PageContainer>
          <div className="space-y-6 sm:space-y-8">
            {/* Quick Access Cards - Mobile/Tablet: Single column, Desktop: Three columns */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8 lg:mb-12">
          <Card className="rounded-xl sm:rounded-2xl shadow-sm bg-white border-0 hover:shadow-md transition-shadow">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-emerald-500/25">
                  <HelpCircle className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-semibold text-slate-900">
                    FAQs
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500">
                    Common questions
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-xl sm:rounded-2xl shadow-sm bg-white border-0 hover:shadow-md transition-shadow">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/25">
                  <BookOpen className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-semibold text-slate-900">
                    Policies
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500">
                    Rules & guidelines
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-xl sm:rounded-2xl shadow-sm bg-white border-0 hover:shadow-md transition-shadow">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-purple-500/25">
                  <Phone className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-semibold text-slate-900">
                    Contact
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500">
                    Get in touch
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
            </div>

            {/* Main Content Grid - Mobile: Single column, Tablet: Two columns, Desktop: Sidebar layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-12">
              {/* Main Content Area - Mobile/Tablet: Full width, Desktop: 2 columns */}
              <div className="lg:col-span-2 space-y-6 sm:space-y-8 lg:space-y-12">
                {/* FAQ Section */}
                <section id="faq-section">
              <div className="mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900 mb-2">
                  Frequently Asked Questions
                </h2>
                <p className="text-xs sm:text-sm text-slate-600">
                  Find answers to common questions about attendance and policies
                </p>
              </div>
              <Suspense fallback={
                <div className="rounded-2xl shadow-xl bg-white/80 backdrop-blur-xl border-0 p-6 flex items-center justify-center min-h-[300px]">
                  <div className="text-center">
                    <Loader2 className="h-8 w-8 text-emerald-600 animate-spin mx-auto mb-2" />
                    <p className="text-sm text-slate-500">Loading FAQs...</p>
                  </div>
                </div>
              }>
                <FAQAccordion faqs={sampleFAQs} onFeedback={handleFaqFeedback} />
              </Suspense>
                </section>

                {/* Policy Documents Section */}
                <section id="policies-section">
              <div className="mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900 mb-2">
                  Policy Documents
                </h2>
                <p className="text-xs sm:text-sm text-slate-600">
                  Read detailed information about attendance policies and procedures
                </p>
              </div>
              <Suspense fallback={
                <div className="rounded-2xl shadow-xl bg-white/80 backdrop-blur-xl border-0 p-6 flex items-center justify-center min-h-[300px]">
                  <div className="text-center">
                    <Loader2 className="h-8 w-8 text-emerald-600 animate-spin mx-auto mb-2" />
                    <p className="text-sm text-slate-500">Loading policies...</p>
                  </div>
                </div>
              }>
                <PolicyDocuments />
              </Suspense>
                </section>
              </div>

              {/* Sidebar - Mobile/Tablet: Below main content, Desktop: Right sidebar */}
              <div className="lg:col-span-1">
                <div className="sticky top-6 space-y-6">
              <Suspense fallback={
                <div className="rounded-2xl shadow-xl bg-white/80 backdrop-blur-xl border-0 p-6 animate-pulse">
                  <div className="h-8 w-32 bg-gradient-to-r from-slate-200 to-slate-300 rounded mb-4" />
                  <div className="space-y-3">
                    <div className="h-4 bg-gradient-to-r from-slate-100 to-slate-200 rounded" />
                    <div className="h-4 bg-gradient-to-r from-slate-100 to-slate-200 rounded" />
                    <div className="h-4 bg-gradient-to-r from-slate-100 to-slate-200 rounded" />
                  </div>
                </div>
              }>
                <ContactInformationCard onSendMessage={handleSendMessage} />
                  </Suspense>
                </div>
              </div>
            </div>
          </div>
        </PageContainer>
      </ModernDashboardLayout>
    </StudentGuard>
  )
}
