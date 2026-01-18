"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  X, 
  FileText, 
  Image as ImageIcon,
  AlertCircle,
  MessageCircle,
  Search,
  FileUp,
  AlertOctagon,
  FileSpreadsheet,
  Presentation,
  Sparkles,
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Send3D, Attachment3D } from "@/components/ui/message-3d-icons";

interface TeacherComposeMessageProps {
  recipientName?: string;
  recipientType?: "student" | "office";
  onSend: (message: MessageData) => void;
  onCancel?: () => void;
  isLoading?: boolean;
  compact?: boolean;
}

interface MessageData {
  content: string;
  category: string;
  attachments: File[];
  isUrgent?: boolean;
}

interface AttachmentPreview {
  file: File;
  preview?: string;
}

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB for teachers
const MAX_MESSAGE_LENGTH = 2000;

// Pre-defined message templates for teachers
const MESSAGE_TEMPLATES = [
  {
    id: "attendance_reminder",
    name: "Attendance Reminder",
    category: "attendance_inquiry",
    content: "Dear student,\n\nI noticed your attendance has been irregular recently. Please ensure you attend all scheduled classes. If you're facing any issues, feel free to discuss them with me.\n\nBest regards"
  },
  {
    id: "medical_cert",
    name: "Medical Certificate Request",
    category: "documentation",
    content: "Dear student,\n\nPlease submit your medical certificate for the days you were absent. This is required for your attendance records.\n\nThank you"
  },
  {
    id: "below_threshold",
    name: "Below Attendance Threshold",
    category: "urgent",
    content: "Dear student,\n\nYour attendance has fallen below the required threshold. This may affect your academic standing. Please meet me during office hours to discuss this matter.\n\nUrgent attention required."
  },
  {
    id: "good_attendance",
    name: "Good Attendance Appreciation",
    category: "general",
    content: "Dear student,\n\nI wanted to commend you on your excellent attendance record. Keep up the good work!\n\nBest wishes"
  },
  {
    id: "assignment_reminder",
    name: "Assignment Reminder",
    category: "general",
    content: "Dear student,\n\nThis is a reminder about the upcoming assignment deadline. Please ensure you submit your work on time.\n\nThank you"
  },
  {
    id: "meeting_request",
    name: "Meeting Request",
    category: "general",
    content: "Dear student,\n\nI would like to schedule a meeting with you to discuss your academic progress. Please let me know your available time slots.\n\nBest regards"
  },
  {
    id: "exam_preparation",
    name: "Exam Preparation",
    category: "general",
    content: "Dear student,\n\nThe upcoming exam is approaching. Please review the course materials and don't hesitate to ask if you have any questions.\n\nGood luck with your preparation!"
  },
  {
    id: "class_cancelled",
    name: "Class Cancellation",
    category: "urgent",
    content: "Dear student,\n\nPlease note that today's class has been cancelled due to unforeseen circumstances. The class will be rescheduled, and I will inform you of the new date.\n\nApologies for the inconvenience."
  },
];

export function TeacherComposeMessage({
  recipientName,
  recipientType = "student",
  onSend,
  onCancel,
  isLoading = false,
  compact = false,
}: TeacherComposeMessageProps) {
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("general");
  const [isUrgent, setIsUrgent] = useState(false);
  const [attachments, setAttachments] = useState<AttachmentPreview[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): { valid: boolean; error?: string } => {
    if (file.size > MAX_FILE_SIZE) {
      return {
        valid: false,
        error: `File "${file.name}" exceeds the ${MAX_FILE_SIZE / 1024 / 1024}MB limit`
      };
    }
    return { valid: true };
  };

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    const newAttachments: AttachmentPreview[] = [];
    
    for (const file of Array.from(files)) {
      const validation = validateFile(file);
      if (!validation.valid) {
        setError(validation.error || "Error uploading file");
        return;
      }

      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setAttachments((prev) => [...prev, {
            file,
            preview: e.target?.result as string,
          }]);
        };
        reader.readAsDataURL(file);
      } else {
        newAttachments.push({ file });
      }
    }

    if (newAttachments.length > 0) {
      setAttachments((prev) => [...prev, ...newAttachments]);
    }
    setError(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
    setError(null);
  };

  const handleTemplateSelect = (template: typeof MESSAGE_TEMPLATES[0]) => {
    setContent(template.content);
    setCategory(template.category);
    setShowTemplates(false);
  };

  const handleSend = () => {
    if (!content.trim()) {
      setError("Please enter a message");
      return;
    }

    if (content.length > MAX_MESSAGE_LENGTH) {
      setError(`Message too long. Maximum ${MAX_MESSAGE_LENGTH} characters`);
      return;
    }

    onSend({
      content: content.trim(),
      category,
      attachments: attachments.map((a) => a.file),
      isUrgent,
    });

    setContent("");
    setCategory("general");
    setIsUrgent(false);
    setAttachments([]);
    setError(null);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith("image/")) return <ImageIcon className="h-5 w-5 text-blue-500" />;
    if (fileType.includes("pdf")) return <FileText className="h-5 w-5 text-red-500" />;
    if (fileType.includes("word") || fileType.includes("document")) return <FileText className="h-5 w-5 text-blue-600" />;
    if (fileType.includes("excel") || fileType.includes("spreadsheet")) return <FileSpreadsheet className="h-5 w-5 text-green-500" />;
    if (fileType.includes("powerpoint") || fileType.includes("presentation")) return <Presentation className="h-5 w-5 text-orange-500" />;
    return <FileText className="h-5 w-5 text-slate-500" />;
  };

  const remainingChars = MAX_MESSAGE_LENGTH - content.length;
  const isNearLimit = remainingChars < 100;

  return (
    <motion.div 
      className={cn(
        "p-4 bg-gradient-to-t from-white to-slate-50/50",
        compact && "border-t border-slate-100"
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className={cn("space-y-4", compact && "space-y-3")}>
        {/* Recipient Info - hide in compact mode */}
        {recipientName && !compact && (
          <motion.div 
            className="text-sm text-slate-600 flex items-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <span className="text-slate-400">To:</span>
            <span className="font-semibold text-slate-800 bg-blue-50 px-2 py-0.5 rounded-lg">
              {recipientName}
            </span>
            {recipientType === "office" && (
              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                Office Staff
              </span>
            )}
          </motion.div>
        )}

        {/* Template Selector and Category - hide in compact mode */}
        {!compact && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="template" className="text-sm font-medium text-slate-700">
                Quick Templates
              </Label>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowTemplates(!showTemplates)}
                className="w-full justify-start rounded-xl bg-white shadow-sm hover:shadow-md transition-all"
              >
                <Sparkles className="h-4 w-4 mr-2 text-blue-500" />
                <span className="text-sm">Use Template</span>
              </Button>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category" className="text-sm font-medium text-slate-700">
                Category
              </Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger 
                  id="category"
                  className="w-full bg-white rounded-xl shadow-sm focus:ring-2 focus:ring-blue-200 transition-all"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="general" className="rounded-lg">
                    <div className="flex items-center gap-2">
                      <MessageCircle className="h-4 w-4 text-slate-500" />
                      <span>General</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="attendance_inquiry" className="rounded-lg">
                    <div className="flex items-center gap-2">
                      <Search className="h-4 w-4 text-blue-500" />
                      <span>Attendance Inquiry</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="documentation" className="rounded-lg">
                    <div className="flex items-center gap-2">
                      <FileUp className="h-4 w-4 text-purple-500" />
                      <span>Documentation</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="urgent" className="rounded-lg">
                    <div className="flex items-center gap-2">
                      <AlertOctagon className="h-4 w-4 text-red-500" />
                      <span>Urgent</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Template Dropdown */}
        <AnimatePresence>
          {showTemplates && !compact && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="p-3 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl space-y-2 max-h-60 overflow-y-auto scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                {MESSAGE_TEMPLATES.map((template) => (
                  <motion.button
                    key={template.id}
                    onClick={() => handleTemplateSelect(template)}
                    className="w-full text-left p-3 rounded-lg bg-white hover:bg-blue-50 transition-all shadow-sm hover:shadow-md"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Sparkles className="h-4 w-4 text-blue-500" />
                      <span className="font-medium text-sm text-slate-800">{template.name}</span>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-2">{template.content}</p>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Urgent Toggle */}
        {!compact && (
          <motion.div 
            className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-orange-50 to-red-50"
            whileHover={{ scale: 1.01 }}
          >
            <input
              type="checkbox"
              id="urgent"
              checked={isUrgent}
              onChange={(e) => setIsUrgent(e.target.checked)}
              className="h-4 w-4 rounded border-orange-300 text-orange-600 focus:ring-orange-500"
            />
            <Label htmlFor="urgent" className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-700">
              <Zap className="h-4 w-4 text-orange-500" />
              Mark as Urgent
            </Label>
          </motion.div>
        )}

        {/* Message Text Area */}
        <div className={cn("space-y-2", compact && "space-y-1")}>
          {!compact && (
            <Label htmlFor="message" className="text-sm font-medium text-slate-700">
              Message
            </Label>
          )}
          <Textarea
            id="message"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Type your message here..."
            className={cn(
              "resize-none rounded-xl",
              "bg-white shadow-sm",
              "focus:ring-2 focus:ring-blue-200",
              "transition-all duration-300",
              compact ? "min-h-[60px]" : "min-h-[120px]"
            )}
            disabled={isLoading}
          />
          
          {/* Character Count */}
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500">
              {attachments.length > 0 && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-1"
                >
                  <Attachment3D size="sm" animated={false} />
                  {attachments.length} file(s) attached
                </motion.span>
              )}
            </span>
            <span className={cn(
              "font-medium transition-colors",
              isNearLimit ? "text-orange-500" : "text-slate-400"
            )}>
              {remainingChars} characters remaining
            </span>
          </div>
        </div>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div 
              className="flex items-start gap-2 p-3 rounded-xl bg-red-50 shadow-sm"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Attachment Previews */}
        <AnimatePresence>
          {attachments.length > 0 && (
            <motion.div 
              className="space-y-2"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              {attachments.map((attachment, index) => (
                <motion.div
                  key={index}
                  className="flex items-center gap-3 p-3 rounded-xl bg-white shadow-sm"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  whileHover={{ scale: 1.01 }}
                >
                  <div className="shrink-0">
                    {attachment.preview ? (
                      <img
                        src={attachment.preview}
                        alt={attachment.file.name}
                        className="h-12 w-12 object-cover rounded-lg shadow-sm"
                      />
                    ) : (
                      <div className="h-12 w-12 bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg flex items-center justify-center">
                        {getFileIcon(attachment.file.type)}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">
                      {attachment.file.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {formatFileSize(attachment.file.size)}
                    </p>
                  </div>

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeAttachment(index)}
                    className="h-8 w-8 p-0 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
                    disabled={isLoading}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* File Upload Area - simplified in compact mode */}
        {!compact ? (
          <motion.div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={cn(
              "rounded-xl p-4 text-center transition-all duration-300 cursor-pointer",
              isDragging
                ? "bg-gradient-to-br from-blue-100 to-blue-50 shadow-md scale-[1.02]"
                : "bg-gradient-to-br from-slate-50 to-white hover:from-blue-50 hover:to-white shadow-sm"
            )}
            whileHover={{ scale: 1.01 }}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={(e) => handleFileSelect(e.target.files)}
              className="hidden"
              disabled={isLoading}
            />
            
            <div className="flex flex-col items-center gap-2">
              <motion.div
                animate={{ y: isDragging ? -5 : 0 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Attachment3D size="lg" />
              </motion.div>
              <div>
                <span className="text-blue-600 font-semibold">Click to upload</span>
                <span className="text-sm text-slate-500"> or drag and drop</span>
              </div>
              <p className="text-xs text-slate-400">
                All file types allowed (max {MAX_FILE_SIZE / 1024 / 1024}MB)
              </p>
            </div>
          </motion.div>
        ) : (
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={(e) => handleFileSelect(e.target.files)}
            className="hidden"
            disabled={isLoading}
          />
        )}

        {/* Action Buttons */}
        <div className={cn("flex gap-3", compact ? "pt-1" : "pt-2")}>
          {compact && (
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                type="button"
                variant="ghost"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                className="h-11 w-11 p-0 rounded-xl bg-slate-100 hover:bg-blue-100 text-slate-600 hover:text-blue-600 [&_svg]:size-5"
              >
                <Attachment3D size="md" animated={false} />
              </Button>
            </motion.div>
          )}
          <motion.div className="flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              onClick={handleSend}
              disabled={!content.trim() || isLoading}
              className={cn(
                "w-full rounded-xl",
                "flex items-center justify-center gap-2",
                "bg-gradient-to-r from-blue-500 to-blue-600",
                "hover:from-blue-600 hover:to-blue-700",
                "text-white font-semibold",
                "shadow-lg shadow-blue-500/30",
                "transition-all duration-300",
                "disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none",
                compact ? "min-h-[44px]" : "min-h-[48px]",
                "[&_svg]:size-5"
              )}
            >
              <Send3D size="md" animated={false} />
              <span>{isLoading ? "Sending..." : "Send"}</span>
            </Button>
          </motion.div>

          {onCancel && (
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                onClick={onCancel}
                variant="outline"
                disabled={isLoading}
                className="min-h-[48px] px-6 rounded-xl bg-slate-100 hover:bg-slate-200 shadow-sm"
              >
                Cancel
              </Button>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
