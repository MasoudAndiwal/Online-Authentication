/**
 * BroadcastDialog Component
 * 
 * Multi-step wizard for sending broadcast messages to groups of students or teachers.
 * Features recipient selection, message composition, and confirmation before sending.
 */

'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Users, Send, ChevronRight, ChevronLeft, AlertCircle } from 'lucide-react';
import { useMessaging } from '@/hooks/office/messaging/use-messaging-context';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  BroadcastCriteria,
  MessageCategory,
  PriorityLevel,
  SendBroadcastRequest,
} from '@/types/office/messaging';

// ============================================================================
// Types
// ============================================================================

interface BroadcastDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

type WizardStep = 'recipients' | 'compose' | 'confirm';

interface BroadcastFormData {
  criteria: BroadcastCriteria;
  content: string;
  category: MessageCategory;
  priority: PriorityLevel;
  attachments: File[];
}

// ============================================================================
// Component
// ============================================================================

export function BroadcastDialog({ isOpen, onClose }: BroadcastDialogProps) {
  const { sendBroadcast, isLoading } = useMessaging();
  
  // Wizard state
  const [currentStep, setCurrentStep] = useState<WizardStep>('recipients');
  const [formData, setFormData] = useState<BroadcastFormData>({
    criteria: { type: 'all_students' },
    content: '',
    category: 'announcement',
    priority: 'normal',
    attachments: [],
  });

  // Data from API
  const [classes, setClasses] = useState<Array<{ id: string; name: string; session: string; displayName: string }>>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  const [recipientCount, setRecipientCount] = useState(0);
  const [loadingCount, setLoadingCount] = useState(false);

  const fetchClasses = async () => {
    try {
      const response = await fetch('/api/classes/list');
      if (response.ok) {
        const data = await response.json();
        setClasses(data.classes || []);
      }
    } catch (error) {
      console.error('Failed to fetch classes:', error);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await fetch('/api/departments/list');
      if (response.ok) {
        const data = await response.json();
        setDepartments(data.departments || []);
      }
    } catch (error) {
      console.error('Failed to fetch departments:', error);
    }
  };

  const fetchRecipientCount = useCallback(async () => {
    setLoadingCount(true);
    try {
      const response = await fetch('/api/messages/broadcast/recipients-count', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData.criteria),
      });
      
      if (response.ok) {
        const data = await response.json();
        setRecipientCount(data.count || 0);
      }
    } catch (error) {
      console.error('Failed to fetch recipient count:', error);
      setRecipientCount(0);
    } finally {
      setLoadingCount(false);
    }
  }, [formData.criteria]);

  // Fetch classes and departments on mount
  useEffect(() => {
    if (isOpen) {
      fetchClasses();
      fetchDepartments();
      fetchRecipientCount();
    }
  }, [isOpen, fetchRecipientCount]);

  // Fetch recipient count when criteria changes
  useEffect(() => {
    if (isOpen) {
      fetchRecipientCount();
    }
  }, [formData.criteria, isOpen, fetchRecipientCount]);

  // ============================================================================
  // Handlers
  // ============================================================================

  const handleNext = useCallback(() => {
    if (currentStep === 'recipients') {
      setCurrentStep('compose');
    } else if (currentStep === 'compose') {
      setCurrentStep('confirm');
    }
  }, [currentStep]);

  const handleBack = useCallback(() => {
    if (currentStep === 'compose') {
      setCurrentStep('recipients');
    } else if (currentStep === 'confirm') {
      setCurrentStep('compose');
    }
  }, [currentStep]);

  const handleSend = useCallback(async () => {
    try {
      const request: SendBroadcastRequest = {
        criteria: formData.criteria,
        content: formData.content,
        category: formData.category,
        priority: formData.priority,
        attachments: formData.attachments,
      };

      await sendBroadcast(request);
      
      // Reset and close
      setFormData({
        criteria: { type: 'all_students' },
        content: '',
        category: 'announcement',
        priority: 'normal',
        attachments: [],
      });
      setCurrentStep('recipients');
      onClose();
    } catch (error) {
      console.error('Failed to send broadcast:', error);
    }
  }, [formData, sendBroadcast, onClose]);

  const handleClose = useCallback(() => {
    setCurrentStep('recipients');
    onClose();
  }, [onClose]);

  // Validation
  const canProceed = useMemo(() => {
    if (currentStep === 'recipients') {
      if (formData.criteria.type === 'specific_class') {
        return !!formData.criteria.className && !!formData.criteria.session;
      }
      if (formData.criteria.type === 'specific_department') {
        return !!formData.criteria.department;
      }
      return true;
    }
    if (currentStep === 'compose') {
      return formData.content.trim().length > 0;
    }
    return true;
  }, [currentStep, formData]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={handleClose}
        />

        {/* Dialog */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 shadow-md shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Broadcast Message</h2>
                <p className="text-sm text-gray-500">Send message to multiple recipients</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="w-8 h-8 rounded-xl bg-gradient-to-r from-gray-400 to-gray-500 text-white hover:from-gray-500 hover:to-gray-600 flex items-center justify-center transition-all shadow-sm hover:shadow-md border-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Progress Indicator */}
          <div className="px-6 py-4 bg-gray-50 shrink-0">
            <div className="flex items-center justify-between max-w-md mx-auto">
              {(['recipients', 'compose', 'confirm'] as WizardStep[]).map((step, index) => (
                <React.Fragment key={step}>
                  <div className="flex flex-col items-center gap-2">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center border-0 ${
                        currentStep === step
                          ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg'
                          : index < ['recipients', 'compose', 'confirm'].indexOf(currentStep)
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 text-gray-500'
                      }`}
                    >
                      {index + 1}
                    </div>
                    <span className={`text-xs font-medium ${
                      currentStep === step ? 'text-blue-600' : 'text-gray-500'
                    }`}>
                      {step === 'recipients' ? 'Recipients' : step === 'compose' ? 'Compose' : 'Confirm'}
                    </span>
                  </div>
                  {index < 2 && (
                    <div className={`flex-1 h-0.5 mx-2 ${
                      index < ['recipients', 'compose', 'confirm'].indexOf(currentStep)
                        ? 'bg-blue-500'
                        : 'bg-gray-200'
                    }`} />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Content - Scrollable */}
          <div className="flex-1 overflow-y-auto scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <div className="p-6">
              <AnimatePresence mode="wait">
                {currentStep === 'recipients' && (
                  <RecipientSelection
                    key="recipients"
                    criteria={formData.criteria}
                    onChange={(criteria) => setFormData(prev => ({ ...prev, criteria }))}
                    recipientCount={recipientCount}
                    classes={classes}
                    departments={departments}
                    loadingCount={loadingCount}
                  />
                )}
                {currentStep === 'compose' && (
                  <MessageComposition
                    key="compose"
                    content={formData.content}
                    category={formData.category}
                    priority={formData.priority}
                    attachments={formData.attachments}
                    onChange={(updates) => setFormData(prev => ({ ...prev, ...updates }))}
                  />
                )}
                {currentStep === 'confirm' && (
                  <ConfirmationStep
                    key="confirm"
                    formData={formData}
                    recipientCount={recipientCount}
                  />
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 shadow-md bg-gray-50 shrink-0">
            <button
              onClick={currentStep === 'recipients' ? handleClose : handleBack}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-gray-500 to-gray-600 text-white hover:from-gray-600 hover:to-gray-700 transition-all shadow-md hover:shadow-lg flex items-center gap-2 border-0"
            >
              <ChevronLeft className="w-4 h-4" />
              {currentStep === 'recipients' ? 'Cancel' : 'Back'}
            </button>

            {currentStep !== 'confirm' ? (
              <button
                onClick={handleNext}
                disabled={!canProceed}
                className="px-6 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-md border-0"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSend}
                disabled={isLoading}
                className="px-6 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-md border-0"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send Broadcast
                  </>
                )}
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}


// ============================================================================
// Recipient Selection Step
// ============================================================================

interface RecipientSelectionProps {
  criteria: BroadcastCriteria;
  onChange: (criteria: BroadcastCriteria) => void;
  recipientCount: number;
  classes: Array<{ id: string; name: string; session: string; displayName: string }>;
  departments: string[];
  loadingCount: boolean;
}

function RecipientSelection({ criteria, onChange, recipientCount, classes, departments, loadingCount }: RecipientSelectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Recipients</h3>
        <p className="text-sm text-gray-600 mb-6">
          Choose who should receive this broadcast message
        </p>
      </div>

      {/* Recipient Type Selection - No borders */}
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => onChange({ type: 'all_students' })}
          className={`p-4 rounded-xl transition-all shadow-md hover:shadow-lg border-0 ${
            criteria.type === 'all_students'
              ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
              : 'bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300'
          }`}
        >
          <div className="text-left">
            <div className={`font-semibold ${criteria.type === 'all_students' ? 'text-white' : 'text-gray-900'}`}>All Students</div>
            <div className={`text-sm mt-1 ${criteria.type === 'all_students' ? 'text-blue-100' : 'text-gray-500'}`}>Send to all students</div>
          </div>
        </button>

        <button
          onClick={() => onChange({ type: 'specific_class' })}
          className={`p-4 rounded-xl transition-all shadow-md hover:shadow-lg border-0 ${
            criteria.type === 'specific_class'
              ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
              : 'bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300'
          }`}
        >
          <div className="text-left">
            <div className={`font-semibold ${criteria.type === 'specific_class' ? 'text-white' : 'text-gray-900'}`}>Specific Class</div>
            <div className={`text-sm mt-1 ${criteria.type === 'specific_class' ? 'text-blue-100' : 'text-gray-500'}`}>Send to a specific class</div>
          </div>
        </button>

        <button
          onClick={() => onChange({ type: 'all_teachers' })}
          className={`p-4 rounded-xl transition-all shadow-md hover:shadow-lg border-0 ${
            criteria.type === 'all_teachers'
              ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
              : 'bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300'
          }`}
        >
          <div className="text-left">
            <div className={`font-semibold ${criteria.type === 'all_teachers' ? 'text-white' : 'text-gray-900'}`}>All Teachers</div>
            <div className={`text-sm mt-1 ${criteria.type === 'all_teachers' ? 'text-blue-100' : 'text-gray-500'}`}>Send to all teachers</div>
          </div>
        </button>

        <button
          onClick={() => onChange({ type: 'specific_department' })}
          className={`p-4 rounded-xl transition-all shadow-md hover:shadow-lg border-0 ${
            criteria.type === 'specific_department'
              ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
              : 'bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300'
          }`}
        >
          <div className="text-left">
            <div className={`font-semibold ${criteria.type === 'specific_department' ? 'text-white' : 'text-gray-900'}`}>Specific Department</div>
            <div className={`text-sm mt-1 ${criteria.type === 'specific_department' ? 'text-blue-100' : 'text-gray-500'}`}>Send to a department</div>
          </div>
        </button>
      </div>

      {/* Specific Class Selection - Using shadcn Select */}
      {criteria.type === 'specific_class' && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Class Name
            </label>
            <Select
              value={criteria.className || ''}
              onValueChange={(value) => {
                const selectedClass = classes.find(c => c.name === value);
                if (selectedClass) {
                  onChange({ ...criteria, className: selectedClass.name, session: selectedClass.session });
                }
              }}
            >
              <SelectTrigger className="w-full border-0 shadow-md bg-white">
                <SelectValue placeholder="Select a class" />
              </SelectTrigger>
              <SelectContent className="max-h-[300px] overflow-y-auto">
                {classes.length === 0 ? (
                  <SelectItem value="no-classes" disabled>No classes available</SelectItem>
                ) : (
                  classes.map((cls) => (
                    <SelectItem key={cls.id} value={cls.name}>
                      {cls.displayName}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
        </motion.div>
      )}

      {/* Specific Department Selection - Using shadcn Select */}
      {criteria.type === 'specific_department' && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
        >
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Department
          </label>
          <Select
            value={criteria.department || ''}
            onValueChange={(value) => onChange({ ...criteria, department: value })}
          >
            <SelectTrigger className="w-full border-0 shadow-md bg-white">
              <SelectValue placeholder="Select a department" />
            </SelectTrigger>
            <SelectContent className="max-h-[300px] overflow-y-auto">
              {departments.length === 0 ? (
                <SelectItem value="no-departments" disabled>No departments available</SelectItem>
              ) : (
                departments.map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {dept}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </motion.div>
      )}

      {/* Recipient Count - No border */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-purple-50 border-0 shadow-md"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-sm text-gray-600">Total Recipients</div>
              <div className="text-2xl font-bold text-gray-900">
                {loadingCount ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-lg">Loading...</span>
                  </div>
                ) : (
                  <>
                    {recipientCount}
                    <span className="text-sm font-normal text-gray-500 ml-2">
                      {criteria.type === 'all_students' && 'students'}
                      {criteria.type === 'specific_class' && 'students'}
                      {criteria.type === 'all_teachers' && 'teachers'}
                      {criteria.type === 'specific_department' && 'teachers'}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}


// ============================================================================
// Message Composition Step
// ============================================================================

interface MessageCompositionProps {
  content: string;
  category: MessageCategory;
  priority: PriorityLevel;
  attachments: File[];
  onChange: (updates: Partial<BroadcastFormData>) => void;
}

function MessageComposition({
  content,
  category,
  priority,
  attachments,
  onChange,
}: MessageCompositionProps) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      onChange({ attachments: Array.from(e.target.files) });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Compose Message</h3>
        <p className="text-sm text-gray-600 mb-6">
          Write your broadcast message and set its category and priority
        </p>
      </div>

      {/* Message Content */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Message Content
        </label>
        <textarea
          value={content}
          onChange={(e) => onChange({ content: e.target.value })}
          placeholder="Type your message here..."
          rows={8}
          className="w-full px-4 py-3 rounded-lg border-0 shadow-md focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none bg-white"
        />
        <div className="mt-2 text-sm text-gray-500">
          {content.length} characters
        </div>
      </div>

      {/* Category Selection - No borders */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Category
        </label>
        <div className="grid grid-cols-3 gap-3">
          {(['administrative', 'attendance_alert', 'schedule_change', 'announcement', 'general', 'urgent'] as MessageCategory[]).map((cat) => (
            <button
              key={cat}
              onClick={() => onChange({ category: cat })}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all shadow-sm hover:shadow-md border-0 ${
                category === cat
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                  : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:from-gray-200 hover:to-gray-300'
              }`}
            >
              {cat.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </button>
          ))}
        </div>
      </div>

      {/* Priority Selection - No borders */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Priority
        </label>
        <div className="grid grid-cols-3 gap-3">
          {(['normal', 'important', 'urgent'] as PriorityLevel[]).map((pri) => (
            <button
              key={pri}
              onClick={() => onChange({ priority: pri })}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all shadow-sm hover:shadow-md border-0 ${
                priority === pri
                  ? pri === 'urgent'
                    ? 'bg-gradient-to-r from-red-500 to-red-600 text-white'
                    : pri === 'important'
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white'
                    : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                  : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:from-gray-200 hover:to-gray-300'
              }`}
            >
              {pri.charAt(0).toUpperCase() + pri.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* File Attachments */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Attachments (Optional)
        </label>
        <input
          type="file"
          multiple
          onChange={handleFileChange}
          className="w-full px-4 py-2 rounded-lg border-0 shadow-md focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
        />
        {attachments.length > 0 && (
          <div className="mt-2 space-y-2">
            {attachments.map((file, index) => (
              <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                <span className="truncate">{file.name}</span>
                <span className="text-gray-400">({(file.size / 1024).toFixed(1)} KB)</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}


// ============================================================================
// Confirmation Step
// ============================================================================

interface ConfirmationStepProps {
  formData: BroadcastFormData;
  recipientCount: number;
}

function ConfirmationStep({ formData, recipientCount }: ConfirmationStepProps) {
  const getCriteriaDescription = () => {
    switch (formData.criteria.type) {
      case 'all_students':
        return 'All Students';
      case 'specific_class':
        return `${formData.criteria.className} - ${formData.criteria.session}`;
      case 'all_teachers':
        return 'All Teachers';
      case 'specific_department':
        return `${formData.criteria.department} Department`;
      default:
        return 'Unknown';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirm Broadcast</h3>
        <p className="text-sm text-gray-600 mb-6">
          Review your message before sending
        </p>
      </div>

      {/* Warning */}
      <div className="p-4 rounded-xl bg-amber-50 border-0 shadow-md flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-sm text-amber-800">
          <div className="font-semibold mb-1">Important</div>
          <div>
            This message will be sent to {recipientCount} recipient{recipientCount !== 1 ? 's' : ''}. 
            This action cannot be undone.
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="space-y-4">
        <div className="p-4 rounded-xl bg-gray-50 border-0 shadow-md">
          <div className="text-sm font-medium text-gray-700 mb-2">Recipients</div>
          <div className="text-gray-900">{getCriteriaDescription()}</div>
          <div className="text-sm text-gray-500 mt-1">{recipientCount} recipients</div>
        </div>

        <div className="p-4 rounded-xl bg-gray-50 border-0 shadow-md">
          <div className="text-sm font-medium text-gray-700 mb-2">Category & Priority</div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-medium">
              {formData.category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              formData.priority === 'urgent'
                ? 'bg-red-100 text-red-700'
                : formData.priority === 'important'
                ? 'bg-amber-100 text-amber-700'
                : 'bg-gray-100 text-gray-700'
            }`}>
              {formData.priority.charAt(0).toUpperCase() + formData.priority.slice(1)}
            </span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-gray-50 border-0 shadow-md">
          <div className="text-sm font-medium text-gray-700 mb-2">Message Content</div>
          <div className="text-gray-900 whitespace-pre-wrap">{formData.content}</div>
        </div>

        {formData.attachments.length > 0 && (
          <div className="p-4 rounded-xl bg-gray-50 border-0 shadow-md">
            <div className="text-sm font-medium text-gray-700 mb-2">Attachments</div>
            <div className="space-y-1">
              {formData.attachments.map((file, index) => (
                <div key={index} className="text-sm text-gray-600">
                  {file.name} ({(file.size / 1024).toFixed(1)} KB)
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
