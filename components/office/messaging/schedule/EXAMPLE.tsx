/**
 * Example Usage of Schedule Components
 * 
 * This file demonstrates how to use the ScheduleMessageDialog and ScheduledMessagesList
 * components in a real application.
 * 
 * NOTE: This is an example file for documentation purposes.
 * It is not meant to be imported or used directly in the application.
 */

'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Clock, Plus } from 'lucide-react';
import { ScheduleMessageDialog, ScheduledMessagesList } from './index';
import { officeMessagingService } from '@/lib/services/office/messaging/messaging-service';
import type { 
  ScheduledMessage, 
  MessageDraft,
  ScheduleMessageRequest,
} from '@/types/office/messaging';

/**
 * Example: Schedule Management Page
 * 
 * This component shows how to integrate both scheduling components
 * into a complete scheduling management interface.
 */
export function ScheduleManagementExample() {
  // State
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [scheduledMessages, setScheduledMessages] = useState<ScheduledMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentDraft, setCurrentDraft] = useState<MessageDraft | null>(null);
  const [currentConversationId, setCurrentConversationId] = useState<string>('');
  const [currentRecipientId, setCurrentRecipientId] = useState<string>('');

  // Load scheduled messages on mount
  useEffect(() => {
    loadScheduledMessages();
  }, []);

  // Load scheduled messages from service
  const loadScheduledMessages = useCallback(async () => {
    setIsLoading(true);
    try {
      const messages = await officeMessagingService.getScheduledMessages();
      setScheduledMessages(messages);
    } catch (error) {
      console.error('Failed to load scheduled messages:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Handle scheduling a new message
  const handleSchedule = useCallback(async (request: ScheduleMessageRequest) => {
    try {
      await officeMessagingService.scheduleMessage(request);
      await loadScheduledMessages();
      setShowScheduleDialog(false);
    } catch (error) {
      console.error('Failed to schedule message:', error);
      throw error; // Re-throw to let dialog handle the error
    }
  }, [loadScheduledMessages]);

  // Handle canceling a scheduled message
  const handleCancel = useCallback(async (messageId: string) => {
    try {
      await officeMessagingService.cancelScheduledMessage(messageId);
      await loadScheduledMessages();
    } catch (error) {
      console.error('Failed to cancel scheduled message:', error);
      throw error;
    }
  }, [loadScheduledMessages]);

  // Handle editing a scheduled message (optional feature)
  const handleEdit = useCallback((message: ScheduledMessage) => {
    // Set the draft and open the dialog
    setCurrentDraft(message.draft);
    setCurrentConversationId(message.conversationId);
    setCurrentRecipientId(message.recipientId);
    setShowScheduleDialog(true);
    
    // Note: You would also need to cancel the old scheduled message
    // after the new one is scheduled
  }, []);

  // Open schedule dialog with new message
  const openScheduleDialog = useCallback((
    conversationId: string,
    recipientId: string,
    draft: MessageDraft
  ) => {
    setCurrentConversationId(conversationId);
    setCurrentRecipientId(recipientId);
    setCurrentDraft(draft);
    setShowScheduleDialog(true);
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Scheduled Messages</h1>
              <p className="text-sm text-gray-500">Manage your scheduled messages</p>
            </div>
          </div>
          
          <button
            onClick={() => openScheduleDialog(
              'example-conversation-id',
              'example-recipient-id',
              {
                content: 'This is an example message',
                category: 'announcement',
                priority: 'normal',
                attachments: [],
              }
            )}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium hover:shadow-lg transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Schedule New Message
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
            <div className="text-sm text-blue-600 mb-1">Total Scheduled</div>
            <div className="text-2xl font-bold text-blue-900">
              {scheduledMessages.filter(m => m.status === 'pending').length}
            </div>
          </div>
          <div className="p-4 rounded-xl bg-green-50 border border-green-200">
            <div className="text-sm text-green-600 mb-1">Sent</div>
            <div className="text-2xl font-bold text-green-900">
              {scheduledMessages.filter(m => m.status === 'sent').length}
            </div>
          </div>
          <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
            <div className="text-sm text-gray-600 mb-1">Cancelled</div>
            <div className="text-2xl font-bold text-gray-900">
              {scheduledMessages.filter(m => m.status === 'cancelled').length}
            </div>
          </div>
        </div>
      </div>

      {/* Scheduled Messages List */}
      <ScheduledMessagesList
        scheduledMessages={scheduledMessages}
        onEdit={handleEdit}
        onCancel={handleCancel}
        onRefresh={loadScheduledMessages}
        isLoading={isLoading}
      />

      {/* Schedule Dialog */}
      {currentDraft && (
        <ScheduleMessageDialog
          isOpen={showScheduleDialog}
          onClose={() => setShowScheduleDialog(false)}
          onSchedule={handleSchedule}
          conversationId={currentConversationId}
          recipientId={currentRecipientId}
          draft={currentDraft}
        />
      )}
    </div>
  );
}

/**
 * Example: Inline Scheduling in Compose Area
 * 
 * This shows how to integrate the schedule dialog into a message compose area.
 */
export function ComposeWithScheduleExample() {
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [messageContent, setMessageContent] = useState('');
  const [category, setCategory] = useState<'announcement' | 'general'>('general');
  const [priority, setPriority] = useState<'normal' | 'important' | 'urgent'>('normal');

  const handleSchedule = useCallback(async (request: ScheduleMessageRequest) => {
    try {
      await officeMessagingService.scheduleMessage(request);
      // Clear the compose area
      setMessageContent('');
      setShowScheduleDialog(false);
      alert('Message scheduled successfully!');
    } catch (error) {
      console.error('Failed to schedule message:', error);
      throw error;
    }
  }, []);

  const openScheduleDialog = useCallback(() => {
    if (!messageContent.trim()) {
      alert('Please enter a message first');
      return;
    }
    setShowScheduleDialog(true);
  }, [messageContent]);

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="p-6 rounded-2xl bg-white shadow-lg border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Compose Message</h2>
        
        {/* Message Input */}
        <textarea
          value={messageContent}
          onChange={(e) => setMessageContent(e.target.value)}
          placeholder="Type your message..."
          rows={6}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none mb-4"
        />

        {/* Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
              className="px-3 py-2 rounded-lg border border-gray-300 text-sm"
            >
              <option value="general">General</option>
              <option value="announcement">Announcement</option>
            </select>
            
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as any)}
              className="px-3 py-2 rounded-lg border border-gray-300 text-sm"
            >
              <option value="normal">Normal</option>
              <option value="important">Important</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={openScheduleDialog}
              className="px-4 py-2 rounded-lg border-2 border-blue-500 text-blue-600 font-medium hover:bg-blue-50 transition-colors flex items-center gap-2"
            >
              <Clock className="w-4 h-4" />
              Schedule
            </button>
            
            <button
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium hover:shadow-lg transition-all"
            >
              Send Now
            </button>
          </div>
        </div>
      </div>

      {/* Schedule Dialog */}
      <ScheduleMessageDialog
        isOpen={showScheduleDialog}
        onClose={() => setShowScheduleDialog(false)}
        onSchedule={handleSchedule}
        conversationId="example-conversation-id"
        recipientId="example-recipient-id"
        draft={{
          content: messageContent,
          category,
          priority,
          attachments: [],
        }}
      />
    </div>
  );
}

/**
 * Example: Simple Schedule Button
 * 
 * Minimal example showing just the schedule button and dialog.
 */
export function SimpleScheduleExample() {
  const [showDialog, setShowDialog] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowDialog(true)}
        className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600"
      >
        Schedule Message
      </button>

      <ScheduleMessageDialog
        isOpen={showDialog}
        onClose={() => setShowDialog(false)}
        onSchedule={async (request) => {
          await officeMessagingService.scheduleMessage(request);
          setShowDialog(false);
        }}
        conversationId="conv-123"
        recipientId="user-456"
        draft={{
          content: "Hello! This is a scheduled message.",
          category: "general",
          priority: "normal",
          attachments: [],
        }}
      />
    </>
  );
}
