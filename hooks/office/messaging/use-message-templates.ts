/**
 * useMessageTemplates Hook
 * 
 * Custom hook for managing message templates with variable substitution.
 * Loads templates and provides functionality to insert them with personalization.
 * 
 * Requirements: 4.1, 4.2, 4.3, 4.4, 4.5
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { officeMessagingService } from '@/lib/services/office/messaging/messaging-service';
import type { MessageTemplate } from '@/types/office/messaging';

// ============================================================================
// Hook Interface
// ============================================================================

interface UseMessageTemplatesReturn {
  templates: MessageTemplate[];
  isLoading: boolean;
  error: string | null;
  insertTemplate: (templateId: string, variables: Record<string, string>) => string;
  getTemplate: (templateId: string) => MessageTemplate | undefined;
  refreshTemplates: () => Promise<void>;
}

// ============================================================================
// Hook Implementation
// ============================================================================

/**
 * Hook for managing message templates
 * 
 * @returns Templates, loading state, and template operations
 */
export function useMessageTemplates(): UseMessageTemplatesReturn {
  // State
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ============================================================================
  // Load Templates
  // ============================================================================

  /**
   * Load templates from the service
   */
  const loadTemplates = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const loadedTemplates = await officeMessagingService.getTemplates();
      setTemplates(loadedTemplates);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load templates';
      setError(errorMessage);
      console.error('Error loading templates:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Refresh templates
   */
  const refreshTemplates = useCallback(async () => {
    await loadTemplates();
  }, [loadTemplates]);

  /**
   * Load templates on mount
   */
  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  // ============================================================================
  // Template Operations
  // ============================================================================

  /**
   * Get a specific template by ID
   */
  const getTemplate = useCallback((templateId: string): MessageTemplate | undefined => {
    return templates.find(t => t.id === templateId);
  }, [templates]);

  /**
   * Insert a template with variable substitution
   * 
   * @param templateId - The ID of the template to insert
   * @param variables - Object containing variable values for substitution
   * @returns The template content with variables replaced
   * 
   * Example:
   * Template: "Hello {{recipientName}}, your attendance is {{percentage}}%"
   * Variables: { recipientName: "John", percentage: "85" }
   * Result: "Hello John, your attendance is 85%"
   */
  const insertTemplate = useCallback((
    templateId: string,
    variables: Record<string, string>
  ): string => {
    const template = getTemplate(templateId);

    if (!template) {
      console.error(`Template with ID ${templateId} not found`);
      return '';
    }

    let content = template.content;

    // Replace all variables in the template
    // Variables are in the format {{variableName}}
    template.variables.forEach(variable => {
      const value = variables[variable];
      if (value !== undefined) {
        // Replace all occurrences of {{variableName}} with the value
        const regex = new RegExp(`{{${variable}}}`, 'g');
        content = content.replace(regex, value);
      } else {
        console.warn(`Variable "${variable}" not provided for template "${template.name}"`);
      }
    });

    // Check for any remaining unreplaced variables
    const unreplacedVariables = content.match(/{{([^}]+)}}/g);
    if (unreplacedVariables) {
      console.warn('Some variables were not replaced:', unreplacedVariables);
    }

    return content;
  }, [getTemplate]);

  // ============================================================================
  // Return hook interface
  // ============================================================================

  return {
    templates,
    isLoading,
    error,
    insertTemplate,
    getTemplate,
    refreshTemplates,
  };
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Extract variables from template content
 * Finds all {{variableName}} patterns in the content
 */
export function extractVariables(content: string): string[] {
  const regex = /{{([^}]+)}}/g;
  const variables: string[] = [];
  let match;

  while ((match = regex.exec(content)) !== null) {
    variables.push(match[1]);
  }

  return [...new Set(variables)]; // Remove duplicates
}

/**
 * Validate that all required variables are provided
 */
export function validateVariables(
  template: MessageTemplate,
  variables: Record<string, string>
): { valid: boolean; missing: string[] } {
  const missing = template.variables.filter(v => !variables[v]);

  return {
    valid: missing.length === 0,
    missing,
  };
}

/**
 * Get common template variables with default values
 */
export function getCommonVariables(
  recipientName?: string,
  currentDate?: Date
): Record<string, string> {
  const date = currentDate || new Date();

  return {
    recipientName: recipientName || '[Recipient Name]',
    date: date.toLocaleDateString(),
    time: date.toLocaleTimeString(),
    day: date.toLocaleDateString('en-US', { weekday: 'long' }),
    month: date.toLocaleDateString('en-US', { month: 'long' }),
    year: date.getFullYear().toString(),
  };
}

/**
 * Preview template with sample data
 */
export function previewTemplate(template: MessageTemplate): string {
  const sampleVariables: Record<string, string> = {
    recipientName: 'John Doe',
    date: new Date().toLocaleDateString(),
    time: new Date().toLocaleTimeString(),
    className: 'Computer Science 101',
    attendancePercentage: '85',
    missedClasses: '3',
    totalClasses: '20',
    subject: 'Mathematics',
    department: 'Engineering',
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
  };

  let preview = template.content;

  template.variables.forEach(variable => {
    const value = sampleVariables[variable] || `[${variable}]`;
    const regex = new RegExp(`{{${variable}}}`, 'g');
    preview = preview.replace(regex, value);
  });

  return preview;
}
