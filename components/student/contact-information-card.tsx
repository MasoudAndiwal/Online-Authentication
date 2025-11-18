'use client'

import { Mail, Phone, Clock, MapPin, MessageSquare, FileText, HelpCircle, AlertTriangle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface ContactInfo {
  officeEmail: string
  officePhone: string
  officeHours: string
  officeLocation: string
  emergencyContact?: string
}

interface QuickLink {
  id: string
  label: string
  icon: 'message' | 'document' | 'help' | 'emergency'
  action: () => void
  variant?: 'default' | 'emergency'
}

interface ContactInformationCardProps {
  contactInfo?: ContactInfo
  quickLinks?: QuickLink[]
  onSendMessage?: () => void
}

const defaultContactInfo: ContactInfo = {
  officeEmail: 'attendance@university.edu',
  officePhone: '+93 (0) 20 123 4567',
  officeHours: 'Saturday - Thursday: 8:00 AM - 4:00 PM',
  officeLocation: 'Administration Building, Room 201',
  emergencyContact: '+93 (0) 20 999 8888',
}

const iconMap = {
  message: MessageSquare,
  document: FileText,
  help: HelpCircle,
  emergency: AlertTriangle,
}

export function ContactInformationCard({
  contactInfo = defaultContactInfo,
  quickLinks,
  onSendMessage,
}: ContactInformationCardProps) {
  const defaultQuickLinks: QuickLink[] = [
    {
      id: 'send-message',
      label: 'Send Message to Office',
      icon: 'message',
      action: () => onSendMessage?.(),
      variant: 'default',
    },
    {
      id: 'submit-docs',
      label: 'Submit Documentation',
      icon: 'document',
      action: () => onSendMessage?.(),
      variant: 'default',
    },
    {
      id: 'view-faqs',
      label: 'View FAQs',
      icon: 'help',
      action: () => {
        const faqSection = document.getElementById('faq-section')
        faqSection?.scrollIntoView({ behavior: 'smooth' })
      },
      variant: 'default',
    },
  ]

  const links = quickLinks || defaultQuickLinks

  return (
    <Card className="rounded-xl sm:rounded-2xl shadow-sm bg-white border-0">
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900">
          Contact Information
        </CardTitle>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Get in touch with the attendance office
        </p>
      </CardHeader>

      <CardContent className="p-4 sm:p-6 pt-0 space-y-4 sm:space-y-6">
        {/* Contact Details */}
        <div className="space-y-3 sm:space-y-4">
          {/* Email */}
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100 flex items-center justify-center flex-shrink-0">
              <Mail className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-slate-500 mb-1">
                Email Address
              </p>
              <a
                href={`mailto:${contactInfo.officeEmail}`}
                className="text-sm sm:text-base text-emerald-600 hover:text-emerald-700 font-medium break-all"
              >
                {contactInfo.officeEmail}
              </a>
            </div>
          </div>

          {/* Phone */}
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100 flex items-center justify-center flex-shrink-0">
              <Phone className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-slate-500 mb-1">
                Phone Number
              </p>
              <a
                href={`tel:${contactInfo.officePhone}`}
                className="text-sm sm:text-base text-slate-900 hover:text-emerald-600 font-medium"
              >
                {contactInfo.officePhone}
              </a>
            </div>
          </div>

          {/* Office Hours */}
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100 flex items-center justify-center flex-shrink-0">
              <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-slate-500 mb-1">
                Office Hours
              </p>
              <p className="text-sm sm:text-base text-slate-900">
                {contactInfo.officeHours}
              </p>
            </div>
          </div>

          {/* Location */}
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100 flex items-center justify-center flex-shrink-0">
              <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-slate-500 mb-1">
                Office Location
              </p>
              <p className="text-sm sm:text-base text-slate-900">
                {contactInfo.officeLocation}
              </p>
            </div>
          </div>

          {/* Emergency Contact */}
          {contactInfo.emergencyContact && (
            <div className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl bg-gradient-to-br from-red-50 to-orange-50 border border-red-100">
              <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-red-500/25">
                <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-red-700 mb-1">
                  Emergency Contact
                </p>
                <a
                  href={`tel:${contactInfo.emergencyContact}`}
                  className="text-sm sm:text-base text-red-900 hover:text-red-700 font-semibold"
                >
                  {contactInfo.emergencyContact}
                </a>
                <p className="text-xs text-red-600 mt-1">
                  For urgent attendance-related matters only
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Quick Links */}
        <div className="pt-4 sm:pt-6 border-t border-slate-100">
          <h3 className="text-sm sm:text-base font-semibold text-slate-900 mb-3 sm:mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
            {links.map((link) => {
              const Icon = iconMap[link.icon]
              const isEmergency = link.variant === 'emergency'

              return (
                <Button
                  key={link.id}
                  onClick={link.action}
                  variant="outline"
                  className={cn(
                    'justify-start h-auto py-3 px-4 rounded-xl touch-manipulation min-h-[44px] text-left',
                    isEmergency
                      ? 'bg-gradient-to-r from-red-50 to-orange-50 hover:from-red-100 hover:to-orange-100 border-red-200 text-red-700 hover:text-red-800'
                      : 'bg-white hover:bg-emerald-50 border-slate-200 text-slate-700 hover:text-emerald-700 hover:border-emerald-500'
                  )}
                >
                  <Icon
                    className={cn(
                      'h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3 flex-shrink-0',
                      isEmergency ? 'text-red-600' : 'text-emerald-600'
                    )}
                  />
                  <span className="text-xs sm:text-sm font-medium">
                    {link.label}
                  </span>
                </Button>
              )
            })}
          </div>
        </div>

        {/* Additional Info */}
        <div className="pt-4 sm:pt-6 border-t border-slate-100">
          <div className="p-3 sm:p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100/50">
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              <span className="font-semibold text-emerald-700">Note:</span> For
              attendance-related inquiries, please use the messaging system for
              faster response. Email and phone support are available during
              office hours.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
