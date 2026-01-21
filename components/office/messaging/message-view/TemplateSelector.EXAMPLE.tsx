/**
 * TemplateSelector Usage Example
 * 
 * This file demonstrates how to use the TemplateSelector component
 * in your application.
 */

'use client';

import React, { useState } from 'react';
import { TemplateSelector } from './TemplateSelector';
import type { MessageCategory } from '@/types/office/messaging';

/**
 * Example 1: Basic Usage
 * 
 * Simple integration with a button to open the template selector
 */
export function BasicExample() {
  const [showTemplates, setShowTemplates] = useState(false);
  const [messageContent, setMessageContent] = useState('');
  const [messageCategory, setMessageCategory] = useState<MessageCategory>('general');

  const handleSelectTemplate = (content: string, category: MessageCategory) => {
    setMessageContent(content);
    setMessageCategory(category);
    console.log('Template selected:', { content, category });
  };

  return (
    <div className="p-4">
      <button
        onClick={() => setShowTemplates(true)}
        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
      >
        Select Template
      </button>

      {messageContent && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm font-medium text-gray-700 mb-2">
            Selected Template ({messageCategory}):
          </p>
          <p className="text-gray-900">{messageContent}</p>
        </div>
      )}

      <TemplateSelector
        isOpen={showTemplates}
        onClose={() => setShowTemplates(false)}
        onSelectTemplate={handleSelectTemplate}
      />
    </div>
  );
}

/**
 * Example 2: With Recipient Name
 * 
 * Pass recipient name for personalized variable substitution
 */
export function PersonalizedExample() {
  const [showTemplates, setShowTemplates] = useState(false);
  const [recipientName, setRecipientName] = useState('John Doe');
  const [messageContent, setMessageContent] = useState('');

  const handleSelectTemplate = (content: string, category: MessageCategory) => {
    setMessageContent(content);
  };

  return (
    <div className="p-4">
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Recipient Name:
        </label>
        <input
          type="text"
          value={recipientName}
          onChange={(e) => setRecipientName(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg"
          placeholder="Enter recipient name"
        />
      </div>

      <button
        onClick={() => setShowTemplates(true)}
        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
      >
        Select Template for {recipientName}
      </button>

      {messageContent && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm font-medium text-gray-700 mb-2">
            Personalized Message:
          </p>
          <p className="text-gray-900">{messageContent}</p>
        </div>
      )}

      <TemplateSelector
        isOpen={showTemplates}
        onClose={() => setShowTemplates(false)}
        onSelectTemplate={handleSelectTemplate}
        recipientName={recipientName}
        currentDate={new Date()}
      />
    </div>
  );
}

/**
 * Example 3: Integration with Form
 * 
 * Use template selector as part of a message composition form
 */
export function FormIntegrationExample() {
  const [showTemplates, setShowTemplates] = useState(false);
  const [formData, setFormData] = useState({
    recipient: '',
    category: 'general' as MessageCategory,
    priority: 'normal' as 'normal' | 'important' | 'urgent',
    content: '',
  });

  const handleSelectTemplate = (content: string, category: MessageCategory) => {
    setFormData(prev => ({
      ...prev,
      content,
      category,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Sending message:', formData);
    alert('Message sent!');
  };

  return (
    <div className="p-4 max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Recipient:
          </label>
          <input
            type="text"
            value={formData.recipient}
            onChange={(e) => setFormData(prev => ({ ...prev, recipient: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            placeholder="Enter recipient name"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category:
          </label>
          <select
            value={formData.category}
            onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as MessageCategory }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option value="general">General</option>
            <option value="administrative">Administrative</option>
            <option value="attendance_alert">Attendance Alert</option>
            <option value="schedule_change">Schedule Change</option>
            <option value="announcement">Announcement</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Message:
          </label>
          <div className="relative">
            <textarea
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none"
              rows={6}
              placeholder="Type your message or select a template..."
              required
            />
            <button
              type="button"
              onClick={() => setShowTemplates(true)}
              className="absolute top-2 right-2 px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Use Template
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Priority:
          </label>
          <select
            value={formData.priority}
            onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as any }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option value="normal">Normal</option>
            <option value="important">Important</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>

        <button
          type="submit"
          className="w-full px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700"
        >
          Send Message
        </button>
      </form>

      <TemplateSelector
        isOpen={showTemplates}
        onClose={() => setShowTemplates(false)}
        onSelectTemplate={handleSelectTemplate}
        recipientName={formData.recipient}
        currentDate={new Date()}
      />
    </div>
  );
}

/**
 * Example 4: Keyboard Shortcut Integration
 * 
 * Open template selector with keyboard shortcut (Ctrl/Cmd + T)
 */
export function KeyboardShortcutExample() {
  const [showTemplates, setShowTemplates] = useState(false);
  const [messageContent, setMessageContent] = useState('');

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 't') {
        e.preventDefault();
        setShowTemplates(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSelectTemplate = (content: string, category: MessageCategory) => {
    setMessageContent(content);
  };

  return (
    <div className="p-4">
      <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          Press <kbd className="px-2 py-1 bg-white border border-blue-300 rounded text-xs">Ctrl</kbd> + <kbd className="px-2 py-1 bg-white border border-blue-300 rounded text-xs">T</kbd> to open template selector
        </p>
      </div>

      <button
        onClick={() => setShowTemplates(true)}
        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
      >
        Select Template (or press Ctrl+T)
      </button>

      {messageContent && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm font-medium text-gray-700 mb-2">
            Selected Template:
          </p>
          <p className="text-gray-900">{messageContent}</p>
        </div>
      )}

      <TemplateSelector
        isOpen={showTemplates}
        onClose={() => setShowTemplates(false)}
        onSelectTemplate={handleSelectTemplate}
      />
    </div>
  );
}

/**
 * Example 5: Multiple Template Selectors
 * 
 * Use multiple template selectors in the same component
 */
export function MultipleSelectorsExample() {
  const [showTemplates1, setShowTemplates1] = useState(false);
  const [showTemplates2, setShowTemplates2] = useState(false);
  const [message1, setMessage1] = useState('');
  const [message2, setMessage2] = useState('');

  return (
    <div className="p-4 grid grid-cols-2 gap-4">
      <div className="p-4 border border-gray-200 rounded-lg">
        <h3 className="font-semibold mb-4">Message to Student</h3>
        <button
          onClick={() => setShowTemplates1(true)}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 mb-4"
        >
          Select Template
        </button>
        {message1 && (
          <div className="p-3 bg-gray-50 rounded text-sm">
            {message1}
          </div>
        )}
        <TemplateSelector
          isOpen={showTemplates1}
          onClose={() => setShowTemplates1(false)}
          onSelectTemplate={(content) => setMessage1(content)}
          recipientName="Student Name"
        />
      </div>

      <div className="p-4 border border-gray-200 rounded-lg">
        <h3 className="font-semibold mb-4">Message to Teacher</h3>
        <button
          onClick={() => setShowTemplates2(true)}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 mb-4"
        >
          Select Template
        </button>
        {message2 && (
          <div className="p-3 bg-gray-50 rounded text-sm">
            {message2}
          </div>
        )}
        <TemplateSelector
          isOpen={showTemplates2}
          onClose={() => setShowTemplates2(false)}
          onSelectTemplate={(content) => setMessage2(content)}
          recipientName="Teacher Name"
        />
      </div>
    </div>
  );
}
