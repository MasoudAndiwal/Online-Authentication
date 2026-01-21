/**
 * ExportDialog Component
 * 
 * Dialog for exporting conversation history to PDF or CSV format.
 * Provides format selection and triggers download of exported data.
 * 
 * Requirements: 18.5
 */

'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/hooks/office/messaging';
import type { Conversation, Message } from '@/types/office/messaging';
import { 
  X, 
  Download, 
  FileText, 
  Table,
  Loader2,
  CheckCircle
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';

// ============================================================================
// Component Props
// ============================================================================

interface ExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  conversation: Conversation;
  messages: Message[];
}

type ExportFormat = 'pdf' | 'csv';

// ============================================================================
// Component Implementation
// ============================================================================

export function ExportDialog({
  isOpen,
  onClose,
  conversation,
  messages,
}: ExportDialogProps) {
  const { t, direction } = useLanguage();
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('pdf');
  const [isExporting, setIsExporting] = useState(false);
  const [exportComplete, setExportComplete] = useState(false);

  // ============================================================================
  // Export to PDF
  // ============================================================================

  const exportToPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const lineHeight = 7;
    let yPosition = margin;

    // Helper function to add new page if needed
    const checkPageBreak = (requiredSpace: number) => {
      if (yPosition + requiredSpace > pageHeight - margin) {
        doc.addPage();
        yPosition = margin;
        return true;
      }
      return false;
    };

    // Helper function to wrap text
    const wrapText = (text: string, maxWidth: number): string[] => {
      const words = text.split(' ');
      const lines: string[] = [];
      let currentLine = '';

      words.forEach(word => {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        const textWidth = doc.getTextWidth(testLine);
        
        if (textWidth > maxWidth) {
          if (currentLine) {
            lines.push(currentLine);
            currentLine = word;
          } else {
            lines.push(word);
          }
        } else {
          currentLine = testLine;
        }
      });

      if (currentLine) {
        lines.push(currentLine);
      }

      return lines;
    };

    // Title
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Conversation History', margin, yPosition);
    yPosition += lineHeight * 2;

    // Conversation details
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Recipient: ${conversation.recipientName}`, margin, yPosition);
    yPosition += lineHeight;
    doc.text(`Role: ${conversation.recipientRole}`, margin, yPosition);
    yPosition += lineHeight;
    doc.text(`Exported: ${format(new Date(), 'PPpp')}`, margin, yPosition);
    yPosition += lineHeight * 2;

    // Separator line
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += lineHeight;

    // Messages
    doc.setFontSize(10);
    messages.forEach((message) => {
      checkPageBreak(lineHeight * 5);

      // Message header
      doc.setFont('helvetica', 'bold');
      const timestamp = format(new Date(message.timestamp), 'PPp');
      doc.text(`${message.senderName} - ${timestamp}`, margin, yPosition);
      yPosition += lineHeight;

      // Message metadata
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      doc.text(`Category: ${message.category} | Priority: ${message.priority}`, margin, yPosition);
      yPosition += lineHeight;

      // Message content
      doc.setTextColor(0, 0, 0);
      const contentLines = wrapText(message.content, pageWidth - (margin * 2));
      contentLines.forEach(line => {
        checkPageBreak(lineHeight);
        doc.text(line, margin, yPosition);
        yPosition += lineHeight;
      });

      // Attachments
      if (message.attachments && message.attachments.length > 0) {
        checkPageBreak(lineHeight * 2);
        doc.setTextColor(100, 100, 100);
        doc.text(`Attachments: ${message.attachments.map(a => a.name).join(', ')}`, margin, yPosition);
        yPosition += lineHeight;
      }

      // Reactions
      if (message.reactions && message.reactions.length > 0) {
        checkPageBreak(lineHeight);
        const reactionSummary = message.reactions
          .reduce((acc, r) => {
            acc[r.type] = (acc[r.type] || 0) + 1;
            return acc;
          }, {} as Record<string, number>);
        const reactionText = Object.entries(reactionSummary)
          .map(([type, count]) => `${type}: ${count}`)
          .join(', ');
        doc.text(`Reactions: ${reactionText}`, margin, yPosition);
        yPosition += lineHeight;
      }

      // Separator between messages
      yPosition += lineHeight / 2;
      checkPageBreak(lineHeight);
      doc.setDrawColor(230, 230, 230);
      doc.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += lineHeight;
    });

    // Save the PDF
    const filename = `conversation_${conversation.recipientName.replace(/\s+/g, '_')}_${format(new Date(), 'yyyy-MM-dd')}.pdf`;
    doc.save(filename);
  };

  // ============================================================================
  // Export to CSV
  // ============================================================================

  const exportToCSV = () => {
    // Prepare data for CSV
    const csvData = messages.map(message => ({
      'Timestamp': format(new Date(message.timestamp), 'yyyy-MM-dd HH:mm:ss'),
      'Sender': message.senderName,
      'Role': message.senderRole,
      'Content': message.content,
      'Category': message.category,
      'Priority': message.priority,
      'Status': message.status,
      'Attachments': message.attachments?.map(a => a.name).join('; ') || '',
      'Reactions': message.reactions?.map(r => `${r.type} (${r.userName})`).join('; ') || '',
      'Is Pinned': message.isPinned ? 'Yes' : 'No',
      'Read At': message.readAt ? format(new Date(message.readAt), 'yyyy-MM-dd HH:mm:ss') : '',
    }));

    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(csvData);

    // Set column widths
    const columnWidths = [
      { wch: 20 }, // Timestamp
      { wch: 20 }, // Sender
      { wch: 10 }, // Role
      { wch: 50 }, // Content
      { wch: 15 }, // Category
      { wch: 10 }, // Priority
      { wch: 10 }, // Status
      { wch: 30 }, // Attachments
      { wch: 30 }, // Reactions
      { wch: 10 }, // Is Pinned
      { wch: 20 }, // Read At
    ];
    worksheet['!cols'] = columnWidths;

    // Create workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Conversation');

    // Add metadata sheet
    const metadata = [
      ['Conversation Export'],
      [''],
      ['Recipient', conversation.recipientName],
      ['Role', conversation.recipientRole],
      ['Total Messages', messages.length],
      ['Exported', format(new Date(), 'yyyy-MM-dd HH:mm:ss')],
    ];
    const metadataSheet = XLSX.utils.aoa_to_sheet(metadata);
    XLSX.utils.book_append_sheet(workbook, metadataSheet, 'Info');

    // Save the file
    const filename = `conversation_${conversation.recipientName.replace(/\s+/g, '_')}_${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
    XLSX.writeFile(workbook, filename);
  };

  // ============================================================================
  // Handle Export
  // ============================================================================

  const handleExport = async () => {
    setIsExporting(true);
    setExportComplete(false);

    try {
      // Simulate a small delay for better UX
      await new Promise(resolve => setTimeout(resolve, 500));

      if (selectedFormat === 'pdf') {
        exportToPDF();
      } else {
        exportToCSV();
      }

      setExportComplete(true);

      // Auto-close after success
      setTimeout(() => {
        onClose();
        setExportComplete(false);
      }, 1500);
    } catch (error) {
      console.error('Export failed:', error);
      alert(t('messaging.export.error'));
    } finally {
      setIsExporting(false);
    }
  };

  // ============================================================================
  // Render Component
  // ============================================================================

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center" dir={direction}>
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Dialog */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="relative w-full max-w-md mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden"
          style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-6 py-4 shadow-md bg-gradient-to-r from-blue-50 to-white">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                {t('messaging.export.title')}
              </h2>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="p-2 rounded-xl bg-gradient-to-r from-gray-400 to-gray-500 text-white hover:from-gray-500 hover:to-gray-600 transition-all shadow-sm hover:shadow-md border-0"
                aria-label={t('common.close')}
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-6 space-y-6">
            {/* Conversation Info */}
            <div className="p-4 rounded-xl bg-blue-50 border-0 shadow-md">
              <p className="text-sm text-gray-700 mb-1">
                <span className="font-medium">{t('messaging.export.recipient')}:</span>{' '}
                {conversation.recipientName}
              </p>
              <p className="text-sm text-gray-700 mb-1">
                <span className="font-medium">{t('messaging.export.role')}:</span>{' '}
                {conversation.recipientRole}
              </p>
              <p className="text-sm text-gray-700">
                <span className="font-medium">{t('messaging.export.messages')}:</span>{' '}
                {messages.length}
              </p>
            </div>

            {/* Format Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                {t('messaging.export.format')}
              </label>
              <div className="grid grid-cols-2 gap-3">
                {/* PDF Option */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedFormat('pdf')}
                  className={`p-4 rounded-xl border-0 shadow-md hover:shadow-lg transition-all ${
                    selectedFormat === 'pdf'
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                      : 'bg-gradient-to-r from-gray-50 to-gray-100 hover:from-blue-50 hover:to-blue-100'
                  }`}
                >
                  <FileText className={`w-8 h-8 mx-auto mb-2 ${
                    selectedFormat === 'pdf' ? 'text-white' : 'text-gray-400'
                  }`} />
                  <p className={`text-sm font-medium ${
                    selectedFormat === 'pdf' ? 'text-white' : 'text-gray-700'
                  }`}>
                    PDF
                  </p>
                  <p className={`text-xs mt-1 ${
                    selectedFormat === 'pdf' ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {t('messaging.export.pdfDesc')}
                  </p>
                </motion.button>

                {/* CSV Option */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedFormat('csv')}
                  className={`p-4 rounded-xl border-0 shadow-md hover:shadow-lg transition-all ${
                    selectedFormat === 'csv'
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                      : 'bg-gradient-to-r from-gray-50 to-gray-100 hover:from-blue-50 hover:to-blue-100'
                  }`}
                >
                  <Table className={`w-8 h-8 mx-auto mb-2 ${
                    selectedFormat === 'csv' ? 'text-white' : 'text-gray-400'
                  }`} />
                  <p className={`text-sm font-medium ${
                    selectedFormat === 'csv' ? 'text-white' : 'text-gray-700'
                  }`}>
                    Excel
                  </p>
                  <p className={`text-xs mt-1 ${
                    selectedFormat === 'csv' ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {t('messaging.export.csvDesc')}
                  </p>
                </motion.button>
              </div>
            </div>

            {/* Export Success Message */}
            <AnimatePresence>
              {exportComplete && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-center gap-2 p-3 rounded-xl bg-green-50 border-0 shadow-md"
                >
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <p className="text-sm text-green-800">
                    {t('messaging.export.success')}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 shadow-md bg-gray-50 flex items-center justify-end gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onClose}
              disabled={isExporting}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-gray-500 to-gray-600 text-white hover:from-gray-600 hover:to-gray-700 transition-all shadow-md hover:shadow-lg border-0 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t('common.cancel')}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleExport}
              disabled={isExporting || exportComplete}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-md border-0"
            >
              {isExporting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t('messaging.export.exporting')}
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  {t('messaging.export.export')}
                </>
              )}
            </motion.button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
