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
  Presentation
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Send3D, Attachment3D } from "@/components/ui/message-3d-icons";

interface ComposeMessageProps {
  recipientName?: string;
  onSend: (message: MessageData) => void;
  onCancel?: () => void;
  isLoading?: boolean;
  userType?: "student" | "teacher" | "office";
  compact?: boolean; // Hide recipient info and category for existing conversations
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

const STUDENT_MAX_FILE_SIZE = 20 * 1024 * 1024;
const TEACHER_OFFICE_MAX_FILE_SIZE = 100 * 1024 * 1024;
const MAX_MESSAGE_LENGTH = 2000;

/**
 * ComposeMessage Component
 * 
 * Beautiful message composer with animations and role-based file restrictions
 */
export function ComposeMessage({
  recipientName,
  onSend,
  onCancel,
  isLoading = false,
  userType = "student",
  compact = false,
}: ComposeMessageProps) {
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("general");
  const [attachments, setAttachments] = useState<AttachmentPreview[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const maxFileSize = userType === "student" ? STUDENT_MAX_FILE_SIZE : TEACHER_OFFICE_MAX_FILE_SIZE;

  const validateFile = (file: File): { valid: boolean; error?: string } => {
    if (userType === "student" && !STUDENT_ALLOWED_TYPES.includes(file.type)) {
      return {
        valid: false,
        error: `File type not allowed. Students can only send text, images, PDF, Word, Excel, and PowerPoint files.`
      };
    }

    if (file.size > maxFileSize) {
      return {
        valid: false,
        error: `File "${file.name}" exceeds the ${maxFileSize / 1024 / 1024}MB limit`
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
    });

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
    if (fileType.startsWith("image/")) return <ImageIcon className="h-5 w-5 text-blue-500" />;
    if (fileType.includes("pdf")) return <FileText className="h-5 w-5 text-red-500" />;
    if (fileType.includes("word") || fileType.includes("document")) return <FileText className="h-5 w-5 text-blue-600" />;
    if (fileType.includes("excel") || fileType.includes("spreadsheet")) return <FileSpreadsheet className="h-5 w-5 text-green-500" />;
    if (fileType.includes("powerpoint") || fileType.includes("presentation")) return <Presentation className="h-5 w-5 text-orange-500" />;
    return <FileText className="h-5 w-5 text-slate-500" />;
  };

  const remainingChars = MAX_MESSAGE_LENGTH - content.length;
  const isNearLimit = remainingChars < 100;

  const acceptedTypes = userType === "student" 
    ? ".txt,.jpg,.jpeg,.png,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
    : "*";

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
            <span className="font-semibold text-slate-800 bg-emerald-50 px-2 py-0.5 rounded-lg">
              {recipientName}
            </span>
          </motion.div>
        )}

        {/* Category Selector - hide in compact mode */}
        {!compact && (
          <div className="space-y-2">
            <Label htmlFor="category" className="text-sm font-medium text-slate-700">
              Category
            </Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger 
                id="category"
                className="w-full bg-white rounded-xl shadow-sm focus:ring-2 focus:ring-emerald-200 transition-all"
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
              "focus:ring-2 focus:ring-emerald-200",
              "transition-all duration-300",
              compact ? "min-h-[60px]" : "min-h-[100px]"
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
                ? "bg-gradient-to-br from-emerald-100 to-emerald-50 shadow-md scale-[1.02]"
                : "bg-gradient-to-br from-slate-50 to-white hover:from-emerald-50 hover:to-white shadow-sm"
            )}
            whileHover={{ scale: 1.01 }}
            onClick={() => fileInputRef.current?.click()}
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
              <motion.div
                animate={{ y: isDragging ? -5 : 0 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Attachment3D size="lg" />
              </motion.div>
              <div>
                <span className="text-emerald-600 font-semibold">Click to upload</span>
                <span className="text-sm text-slate-500"> or drag and drop</span>
              </div>
              <p className="text-xs text-slate-400">
                {userType === "student" 
                  ? `Text, images, PDF, Word, Excel, PowerPoint (max ${STUDENT_MAX_FILE_SIZE / 1024 / 1024}MB)`
                  : `All file types (max ${TEACHER_OFFICE_MAX_FILE_SIZE / 1024 / 1024}MB)`
                }
              </p>
            </div>
          </motion.div>
        ) : (
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={acceptedTypes}
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
                className="h-11 w-11 p-0 rounded-xl bg-slate-100 hover:bg-emerald-100 text-slate-600 hover:text-emerald-600 [&_svg]:size-5"
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
                "bg-gradient-to-r from-emerald-500 to-emerald-600",
                "hover:from-emerald-600 hover:to-emerald-700",
                "text-white font-semibold",
                "shadow-lg shadow-emerald-500/30",
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
