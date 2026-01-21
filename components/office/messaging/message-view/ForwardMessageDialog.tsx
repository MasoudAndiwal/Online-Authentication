/**
 * ForwardMessageDialog Component
 * 
 * Dialog for forwarding messages to other conversations.
 * Features recipient selection, original message preview, and optional additional context.
 * 
 * Requirements: 17.1, 17.2, 17.3, 17.4, 17.5
 */

'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Forward, 
  Search, 
  User, 
  GraduationCap, 
  Users,
  Check,
  AlertCircle,
  FileText,
  Image as ImageIcon,
  File as FileIcon
} from 'lucide-react';
import { useMessaging } from '@/hooks/office/messaging/use-messaging-context';
import { useLanguage } from '@/hooks/office/messaging';
import type {
  Message,
  UserRole,
} from '@/types/office/messaging';
import { formatDistanceToNow } from 'date-fns';

// ============================================================================
// Types
// ============================================================================

interface ForwardMessageDialogProps {
  isOpen: boolean;
  onClose: () => void;
  message: Message;
}

interface RecipientOption {
  id: string;
  name: string;
  role: UserRole;
  avatar?: string;
  conversationId?: string;
}

// ============================================================================
// Component
// ============================================================================

export function ForwardMessageDialog({ 
  isOpen, 
  onClose, 
  message 
}: ForwardMessageDialogProps) {
  const { forwardMessage, conversations, isLoading } = useMessaging();
  const { t, direction } = useLanguage();
  
  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRecipient, setSelectedRecipient] = useState<RecipientOption | null>(null);
  const [additionalContext, setAdditionalContext] = useState('');
  const [step, setStep] = useState<'select' | 'confirm'>('select');

  // ============================================================================
  // Recipient Options
  // ============================================================================

  const recipientOptions = useMemo<RecipientOption[]>(() => {
    // Convert conversations to recipient options
    return conversations.map(conv => ({
      id: conv.recipientId,
      name: conv.recipientName,
      role: conv.recipientRole,
      avatar: conv.recipientAvatar,
      conversationId: conv.id,
    }));
  }, [conversations]);

  // Filter recipients based on search query
  const filteredRecipients = useMemo(() => {
    if (!searchQuery.trim()) {
      return recipientOptions;
    }

    const query = searchQuery.toLowerCase();
    return recipientOptions.filter(recipient =>
      recipient.name.toLowerCase().includes(query) ||
      recipient.role.toLowerCase().includes(query)
    );
  }, [recipientOptions, searchQuery]);

  // ============================================================================
  // Handlers
  // ============================================================================

  const handleSelectRecipient = useCallback((recipient: RecipientOption) => {
    setSelectedRecipient(recipient);
    setStep('confirm');
  }, []);

  const handleBack = useCallback(() => {
    setStep('select');
  }, []);

  const handleForward = useCallback(async () => {
    if (!selectedRecipient) return;

    try {
      await forwardMessage({
        messageId: message.id,
        recipientId: selectedRecipient.id,
        recipientRole: selectedRecipient.role,
        additionalContext: additionalContext.trim() || undefined,
      });

      // Close dialog and reset state
      onClose();
      setSelectedRecipient(null);
      setAdditionalContext('');
      setStep('select');
    } catch (error) {
      console.error('Failed to forward message:', error);
      // Error is handled by context
    }
  }, [selectedRecipient, message.id, additionalContext, forwardMessage, onClose]);

  const handleClose = useCallback(() => {
    onClose();
    setSelectedRecipient(null);
    setAdditionalContext('');
    setSearchQuery('');
    setStep('select');
  }, [onClose]);

  // ============================================================================
  // Render Helpers
  // ============================================================================

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'student':
        return <GraduationCap className="w-4 h-4" />;
      case 'teacher':
        return <User className="w-4 h-4" />;
      default:
        return <Users className="w-4 h-4" />;
    }
  };

  const getRoleLabel = (role: UserRole) => {
    return t(`role.${role}`);
  };

  const getAttachmentIcon = (type: string) => {
    if (type.startsWith('image/')) {
      return <ImageIcon className="w-4 h-4" />;
    } else if (type === 'application/pdf') {
      return <FileText className="w-4 h-4" />;
    } else {
      return <FileIcon className="w-4 h-4" />;
    }
  };

  // ============================================================================
  // Render
  // ============================================================================

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={handleClose}
        />

        {/* Dialog */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className={`relative w-full max-w-2xl max-h-[90vh] bg-white rounded-2xl shadow-xl overflow-hidden ${
            direction === 'rtl' ? 'text-right' : 'text-left'
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Forward className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {t('forward.title')}
                </h2>
                <p className="text-sm text-gray-500">
                  {step === 'select' ? t('forward.selectRecipient') : t('forward.confirmForward')}
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label={t('common.close')}
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
            {step === 'select' ? (
              <>
                {/* Search Bar */}
                <div className="mb-4">
                  <div className="relative">
                    <Search className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 ${
                      direction === 'rtl' ? 'right-3' : 'left-3'
                    }`} />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={t('forward.searchPlaceholder')}
                      className={`w-full ${
                        direction === 'rtl' ? 'pr-10 pl-4' : 'pl-10 pr-4'
                      } py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    />
                  </div>
                </div>

                {/* Recipient List */}
                <div className="space-y-2">
                  {filteredRecipients.length === 0 ? (
                    <div className="text-center py-8">
                      <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-500">{t('forward.noRecipients')}</p>
                    </div>
                  ) : (
                    filteredRecipients.map((recipient) => (
                      <button
                        key={recipient.id}
                        onClick={() => handleSelectRecipient(recipient)}
                        className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 rounded-lg transition-colors text-left"
                      >
                        <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                          {recipient.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">
                            {recipient.name}
                          </p>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            {getRoleIcon(recipient.role)}
                            <span>{getRoleLabel(recipient.role)}</span>
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </>
            ) : (
              <>
                {/* Selected Recipient */}
                <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">{t('forward.forwardingTo')}</p>
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {selectedRecipient?.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{selectedRecipient?.name}</p>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        {selectedRecipient && getRoleIcon(selectedRecipient.role)}
                        <span>{selectedRecipient && getRoleLabel(selectedRecipient.role)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Original Message Preview */}
                <div className="mb-6">
                  <p className="text-sm font-medium text-gray-700 mb-2">{t('forward.originalMessage')}</p>
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-2 mb-2 text-sm text-gray-600">
                      <span className="font-medium">{message.senderName}</span>
                      <span>•</span>
                      <span>{formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}</span>
                    </div>
                    <p className="text-gray-900 whitespace-pre-wrap">{message.content}</p>
                    
                    {/* Attachments */}
                    {message.attachments && message.attachments.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {message.attachments.map((attachment) => (
                          <div
                            key={attachment.id}
                            className="flex items-center gap-2 p-2 bg-white rounded border border-gray-200"
                          >
                            {getAttachmentIcon(attachment.type)}
                            <span className="text-sm text-gray-700 truncate">{attachment.name}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Additional Context */}
                <div>
                  <label htmlFor="additional-context" className="block text-sm font-medium text-gray-700 mb-2">
                    {t('forward.additionalContext')} <span className="text-gray-400">({t('common.optional')})</span>
                  </label>
                  <textarea
                    id="additional-context"
                    value={additionalContext}
                    onChange={(e) => setAdditionalContext(e.target.value)}
                    placeholder={t('forward.contextPlaceholder')}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div className={`flex items-center gap-3 p-6 border-t border-gray-200 ${
            direction === 'rtl' ? 'flex-row-reverse' : ''
          }`}>
            {step === 'confirm' && (
              <button
                onClick={handleBack}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {t('common.back')}
              </button>
            )}
            <button
              onClick={handleClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {t('common.cancel')}
            </button>
            {step === 'confirm' && (
              <button
                onClick={handleForward}
                disabled={isLoading}
                className="ml-auto px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>{t('common.sending')}</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>{t('forward.send')}</span>
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