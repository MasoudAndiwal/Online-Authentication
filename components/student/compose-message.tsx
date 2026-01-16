"use client";

import React, { useState, useRef } from "react";
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
  Paperclip, 
  Send, 
  X, 
  FileText, 
  Image as ImageIcon,
  AlertCircle,
  MessageCircle,
  Search,
  FileUp,
  AlertOctagon,
  FileSpreadsheet,
  Presentation
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ComposeMessageProps {
  recipientName?: string;
  onSend: (message: MessageData) => void;
  onCancel?: () => void;
  isLoading?: boolean;
  userType?: "student" | "teacher" | "office";
}

interface MessageData {
  content: string;
  category: string;
  attachments: File[];
}

interface AttachmentPreview {
  file: File;
  preview?: string;
}

// Student allowed file types
const STUDENT_ALLOWED_TYPES = [
  "text/plain",
  "image/jpeg",
  "image/jpg",
  "image/png",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
];

const STUDENT_MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
const TEACHER_OFFICE_MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
const MAX_MESSAGE_LENGTH = 2000;

/**
 * ComposeMessage Component
 * 
 * Interface for composing and sending messages with role-based file restrictions:
 * - Students: text, images (jpg, png), pdf, word, excel, powerpoint (max 20MB)
 * - Teachers/Office: any file type (max 100MB)
 */
export function ComposeMessage({
  recipientName,
  onSend,
  onCancel,
  isLoading = false,
  userType = "student",
}: ComposeMessageProps) {
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("general");
  const [attachments, setAttachments] = useState<AttachmentPreview[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const maxFileSize = userType === "student" ? STUDENT_MAX_FILE_SIZE : TEACHER_OFFICE_MAX_FILE_SIZE;

  const validateFile = (file: File): { valid: boolean; error?: string } => {
    // Check file type for students
    if (userType === "student" && !STUDENT_ALLOWED_TYPES.includes(file.type)) {
      return {
        valid: false,
        error: `نوع فایل "${file.name}" مجاز نیست. شاگردان فقط می‌توانند فایل‌های متنی، تصویر، PDF، Word، Excel و PowerPoint ارسال کنند.`
      };
    }

    // Check file size
    if (file.size > maxFileSize) {
      return {
        valid: false,
        error: `حجم فایل "${file.name}" بیش از حد مجاز است. حداکثر ${maxFileSize / 1024 / 1024}MB`
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
        setError(validation.error || "خطا در بارگذاری فایل");
        return;
      }

      // Create preview for images
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

  const handleSend = () => {
    if (!content.trim()) {
      setError("لطفاً پیام خود را وارد کنید");
      return;
    }

    if (content.length > MAX_MESSAGE_LENGTH) {
      setError(`پیام بیش از حد طولانی است. حداکثر ${MAX_MESSAGE_LENGTH} کاراکتر`);
      return;
    }

    onSend({
      content: content.trim(),
      category,
      attachments: attachments.map((a) => a.file),
    });

    // Reset form
    setContent("");
    setCategory("general");
    setAttachments([]);
    setError(null);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith("image/")) return <ImageIcon className="h-6 w-6 text-blue-600" />;
    if (fileType.includes("pdf")) return <FileText className="h-6 w-6 text-red-600" />;
    if (fileType.includes("word") || fileType.includes("document")) return <FileText className="h-6 w-6 text-blue-700" />;
    if (fileType.includes("excel") || fileType.includes("spreadsheet")) return <FileSpreadsheet className="h-6 w-6 text-green-600" />;
    if (fileType.includes("powerpoint") || fileType.includes("presentation")) return <Presentation className="h-6 w-6 text-orange-600" />;
    return <FileText className="h-6 w-6 text-slate-600" />;
  };

  const remainingChars = MAX_MESSAGE_LENGTH - content.length;
  const isNearLimit = remainingChars < 100;

  // Get accepted file types for input
  const acceptedTypes = userType === "student" 
    ? ".txt,.jpg,.jpeg,.png,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
    : "*";

  return (
    <div className="p-4 border-t-0 bg-white/50 shadow-sm">
      <div className="space-y-3">
        {/* Recipient Info */}
        {recipientName && (
          <div className="text-sm text-slate-600">
            به: <span className="font-semibold text-slate-800">{recipientName}</span>
          </div>
        )}

        {/* Category Selector */}
        <div className="space-y-1.5">
          <Label htmlFor="category" className="text-sm font-medium text-slate-700">
            دسته‌بندی پیام
          </Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger 
              id="category"
              className="w-full bg-white border-0 shadow-sm focus:ring-2 focus:ring-emerald-200"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="general">
                <div className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4" />
                  <span>سوال عمومی</span>
                </div>
              </SelectItem>
              <SelectItem value="attendance_inquiry">
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4" />
                  <span>استعلام حاضری</span>
                </div>
              </SelectItem>
              <SelectItem value="documentation">
                <div className="flex items-center gap-2">
                  <FileUp className="h-4 w-4" />
                  <span>ارسال مدارک</span>
                </div>
              </SelectItem>
              <SelectItem value="urgent">
                <div className="flex items-center gap-2">
                  <AlertOctagon className="h-4 w-4" />
                  <span>موضوع فوری</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Message Text Area */}
        <div className="space-y-1.5">
          <Label htmlFor="message" className="text-sm font-medium text-slate-700">
            متن پیام
          </Label>
          <Textarea
            id="message"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="پیام خود را اینجا بنویسید..."
            className={cn(
              "min-h-[120px] resize-none",
              "bg-white border-0 shadow-sm",
              "focus:ring-2 focus:ring-emerald-200",
              "transition-all duration-200"
            )}
            disabled={isLoading}
            dir="rtl"
          />
          
          {/* Character Count */}
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500">
              {attachments.length > 0 && `${attachments.length} فایل پیوست شده`}
            </span>
            <span className={cn(
              "font-medium",
              isNearLimit ? "text-orange-600" : "text-slate-500"
            )}>
              {remainingChars} کاراکتر باقی‌مانده
            </span>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border-0 shadow-sm" dir="rtl">
            <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Attachment Previews */}
        {attachments.length > 0 && (
          <div className="space-y-2">
            {attachments.map((attachment, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 border-0 shadow-sm"
              >
                {/* File Icon/Preview */}
                <div className="flex-shrink-0">
                  {attachment.preview ? (
                    <img
                      src={attachment.preview}
                      alt={attachment.file.name}
                      className="h-12 w-12 object-cover rounded"
                    />
                  ) : (
                    <div className="h-12 w-12 bg-slate-200 rounded flex items-center justify-center">
                      {getFileIcon(attachment.file.type)}
                    </div>
                  )}
                </div>

                {/* File Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">
                    {attachment.file.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {formatFileSize(attachment.file.size)}
                  </p>
                </div>

                {/* Remove Button */}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => removeAttachment(index)}
                  className="h-8 w-8 p-0 text-slate-500 hover:text-red-600 hover:bg-red-50"
                  disabled={isLoading}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* File Upload Area */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "border-0 rounded-lg p-4 text-center transition-all duration-200 shadow-sm",
            isDragging
              ? "bg-emerald-100 shadow-md"
              : "bg-slate-50 hover:bg-emerald-50/50"
          )}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={acceptedTypes}
            onChange={(e) => handleFileSelect(e.target.files)}
            className="hidden"
            disabled={isLoading}
          />
          
          <div className="flex flex-col items-center gap-2">
            <Paperclip className="h-6 w-6 text-slate-400" />
            <div>
              <Button
                type="button"
                variant="link"
                onClick={() => fileInputRef.current?.click()}
                className="text-emerald-600 hover:text-emerald-700 p-0 h-auto font-semibold"
                disabled={isLoading}
              >
                کلیک کنید
              </Button>
              <span className="text-sm text-slate-500"> یا فایل را بکشید و رها کنید</span>
            </div>
            <p className="text-xs text-slate-400">
              {userType === "student" 
                ? `متن، تصویر، PDF، Word، Excel، PowerPoint (حداکثر ${STUDENT_MAX_FILE_SIZE / 1024 / 1024}MB)`
                : `همه انواع فایل (حداکثر ${TEACHER_OFFICE_MAX_FILE_SIZE / 1024 / 1024}MB)`
              }
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button
            onClick={handleSend}
            disabled={!content.trim() || isLoading}
            className={cn(
              "flex-1 min-h-[44px]",
              "bg-gradient-to-r from-emerald-600 to-emerald-700",
              "hover:from-emerald-700 hover:to-emerald-800",
              "text-white font-semibold",
              "shadow-lg shadow-emerald-500/25",
              "border-0",
              "transition-all duration-200",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            <Send className="h-4 w-4 mr-2" />
            {isLoading ? "در حال ارسال..." : "ارسال پیام"}
          </Button>

          {onCancel && (
            <Button
              onClick={onCancel}
              variant="outline"
              disabled={isLoading}
              className="min-h-[44px] border-0 bg-slate-100 hover:bg-slate-200 shadow-sm"
            >
              انصراف
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
