'use client'

import { useState } from 'react'
import { Search, ChevronDown, ThumbsUp, ThumbsDown } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface FAQ {
  id: string
  question: string
  answer: string
  category: 'Attendance' | 'Policies' | 'Technical' | 'General'
}

interface FAQAccordionProps {
  faqs: FAQ[]
  onFeedback?: (faqId: string, helpful: boolean) => void
}

export function FAQAccordion({ faqs, onFeedback }: FAQAccordionProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeId, setActiveId] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [feedbackGiven, setFeedbackGiven] = useState<Record<string, boolean>>({})

  const categories = ['All', 'Attendance', 'Policies', 'Technical', 'General']

  // Filter FAQs based on search query and category
  const filteredFAQs = faqs.filter((faq) => {
    const matchesSearch =
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory =
      selectedCategory === 'All' || faq.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleToggle = (id: string) => {
    setActiveId(activeId === id ? null : id)
  }

  const handleFeedback = (faqId: string, helpful: boolean) => {
    setFeedbackGiven((prev) => ({ ...prev, [faqId]: true }))
    onFeedback?.(faqId, helpful)
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-slate-400" />
        <Input
          type="text"
          placeholder="Search frequently asked questions..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 sm:pl-12 h-11 sm:h-12 text-sm sm:text-base rounded-xl border-0 shadow-sm focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory(category)}
            className={cn(
              'rounded-full text-xs sm:text-sm min-h-[36px] sm:min-h-[40px] px-3 sm:px-4 touch-manipulation',
              selectedCategory === category
                ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white border-0 shadow-lg shadow-emerald-500/25'
                : 'bg-white hover:bg-emerald-50 text-slate-700 border-0 shadow-sm hover:shadow-md'
            )}
          >
            {category}
          </Button>
        ))}
      </div>

      {/* FAQ List */}
      <div className="space-y-3 sm:space-y-4">
        {filteredFAQs.length === 0 ? (
          <Card className="rounded-xl sm:rounded-2xl shadow-sm bg-white border-0">
            <CardContent className="p-6 sm:p-8 text-center">
              <p className="text-slate-500 text-sm sm:text-base">
                No FAQs found matching your search.
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredFAQs.map((faq) => (
            <Card
              key={faq.id}
              className={cn(
                'rounded-xl sm:rounded-2xl shadow-sm bg-white border-0 transition-all duration-300',
                activeId === faq.id
                  ? 'ring-2 ring-emerald-500 shadow-lg shadow-emerald-500/10'
                  : 'hover:shadow-md'
              )}
            >
              <CardContent className="p-0">
                {/* Question Header */}
                <button
                  onClick={() => handleToggle(faq.id)}
                  className="w-full text-left p-4 sm:p-6 flex items-start justify-between gap-3 sm:gap-4 touch-manipulation min-h-[44px]"
                >
                  <div className="flex-1">
                    <span className="inline-block px-2 py-1 rounded-md bg-emerald-50 text-emerald-700 text-xs font-medium mb-2">
                      {faq.category}
                    </span>
                    <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-slate-900">
                      {faq.question}
                    </h3>
                  </div>
                  <ChevronDown
                    className={cn(
                      'h-5 w-5 sm:h-6 sm:w-6 text-emerald-600 transition-transform duration-300 flex-shrink-0',
                      activeId === faq.id && 'rotate-180'
                    )}
                  />
                </button>

                {/* Answer Content */}
                <div
                  className={cn(
                    'overflow-hidden transition-all duration-300',
                    activeId === faq.id ? 'max-h-[1000px]' : 'max-h-0'
                  )}
                >
                  <div className="px-4 sm:px-6 pb-4 sm:pb-6 pt-0">
                    <div className="border-t border-slate-100 pt-4">
                      <p className="text-slate-600 text-sm sm:text-base leading-relaxed whitespace-pre-line">
                        {faq.answer}
                      </p>

                      {/* Feedback Buttons */}
                      <div className="mt-4 sm:mt-6 pt-4 border-t border-slate-100">
                        {feedbackGiven[faq.id] ? (
                          <p className="text-emerald-600 text-xs sm:text-sm font-medium">
                            Thank you for your feedback!
                          </p>
                        ) : (
                          <div className="flex items-center gap-3 sm:gap-4">
                            <span className="text-slate-600 text-xs sm:text-sm">
                              Was this helpful?
                            </span>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleFeedback(faq.id, true)}
                                className="rounded-lg min-h-[36px] sm:min-h-[40px] px-3 sm:px-4 touch-manipulation hover:bg-emerald-50 hover:text-emerald-700 border-0 shadow-sm hover:shadow-md"
                              >
                                <ThumbsUp className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                                <span className="text-xs sm:text-sm">Yes</span>
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleFeedback(faq.id, false)}
                                className="rounded-lg min-h-[36px] sm:min-h-[40px] px-3 sm:px-4 touch-manipulation hover:bg-red-50 hover:text-red-700 border-0 shadow-sm hover:shadow-md"
                              >
                                <ThumbsDown className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                                <span className="text-xs sm:text-sm">No</span>
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
