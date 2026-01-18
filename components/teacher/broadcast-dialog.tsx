"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {Select,SelectContent,SelectItem,SelectTrigger,SelectValue, } from "@/components/ui/select";
import { Users, Send, AlertCircle, Loader2, Paperclip, X,FileText,Image as ImageIcon,FileSpreadsheet,Presentation } from "lucide-react";
import { cn } from "@/lib/utils";
import { Attachment3D } from "@/components/ui/message-3d-icons";

interface BroadcastDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSend: (data: BroadcastData) => void;
  teacherId: string;
}

interface BroadcastData {
  classId: string;
  className: string;
  content: string;
  category: string;
  attachments?: File[];
}

interface AttachmentPreview {
  file: File;
  preview?: string;
}

interface ClassData {
  id: string;
  name: string;
  session: string;
  studentCount: number;
}

const MAX_MESSAGE_LENGTH = 2000;
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB for teachers

export function BroadcastDialog({
  open,
  onOpenChange,
  onSend,
  teacherId,
}: BroadcastDialogProps) {
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [selectedClass, setSelectedClass] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("general");
  const [attachments, setAttachments] = useState<AttachmentPreview[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch classes from API when dialog opens
  useEffect(() => {
    if (open && classes.length === 0) {
      fetchClasses();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, classes.length]);

  const fetchClasses = async () => {
    setLoadingClasses(true);
    try {
      // Fetch only classes that this teacher teaches
      const response = await fetch(`/api/teachers/${teacherId}/classes`);
      if (!response.ok) {
        throw new Error('Failed to fetch classes');
      }
      const data = await response.json();
      setClasses(data);
    } catch (err) {
      console.error('Error fetching classes:', err);
      setError('Failed to load classes. Please try again.');
    } finally {
      setLoadingClasses(false);
    }
  };

  const selectedClassData = classes.find(c => c.id === selectedClass);

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

  const handleSend = async () => {
    if (!selectedClass) {
      setError("Please select a class");
      return;
    }

    // Check if selected class has students
    if (selectedClassData && selectedClassData.studentCount === 0) {
      setError("Cannot send broadcast to a class with no students. Please select a class that has enrolled students.");
      return;
    }

    if (!content.trim()) {
      setError("Please enter a message");
      return;
    }

    if (content.length > MAX_MESSAGE_LENGTH) {
      setError(`Message too long. Maximum ${MAX_MESSAGE_LENGTH} characters`);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await onSend({
        classId: selectedClass,
        className: selectedClassData?.name || "",
        content: content.trim(),
        category,
        attachments: attachments.map(a => a.file),
      });

      // Reset form on success
      setSelectedClass("");
      setContent("");
      setCategory("general");
      setAttachments([]);
      
      // Close dialog - parent component will show success message
      onOpenChange(false);
    } catch (err) {
      // Show error in dialog
      setError(err instanceof Error ? err.message : "Failed to send broadcast");
      setIsLoading(false);
    }
  };

  const remainingChars = MAX_MESSAGE_LENGTH - content.length;
  const isNearLimit = remainingChars < 100;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden rounded-2xl max-h-[90vh] flex flex-col">
        <DialogHeader className="p-6 pb-4 bg-gradient-to-r from-orange-50 to-red-50 flex-shrink-0">
          <DialogTitle className="flex items-center gap-3 text-orange-800">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <span className="block text-lg">Broadcast to Class</span>
              <span className="text-xs font-normal text-slate-500">Send message to all students in a class</span>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="p-6 space-y-4 overflow-y-auto flex-1 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {/* Class Selection */}
          <div className="space-y-2">
            <Label htmlFor="class" className="text-sm font-medium text-slate-700">
              Select Class
            </Label>
            <Select value={selectedClass} onValueChange={setSelectedClass} disabled={loadingClasses}>
              <SelectTrigger 
                id="class"
                className="w-full bg-white rounded-xl shadow-sm focus:ring-2 focus:ring-orange-200 transition-all"
              >
                <SelectValue placeholder={loadingClasses ? "Loading classes..." : "Choose a class..."} />
              </SelectTrigger>
              <SelectContent className="rounded-xl max-h-[300px] overflow-y-auto scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                {loadingClasses ? (
                  <div className="flex items-center justify-center p-4">
                    <Loader2 className="h-5 w-5 animate-spin text-orange-500" />
                    <span className="ml-2 text-sm text-slate-500">Loading...</span>
                  </div>
                ) : classes.length === 0 ? (
                  <div className="p-4 text-center text-sm text-slate-500">
                    No classes assigned to you
                  </div>
                ) : (
                  classes.map((cls) => (
                    <SelectItem 
                      key={cls.id} 
                      value={cls.id} 
                      className="rounded-lg"
                      disabled={cls.studentCount === 0}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className={cn(
                          "font-medium",
                          cls.studentCount === 0 && "text-slate-400"
                        )}>
                          {cls.name}
                        </span>
                        <span className={cn(
                          "text-xs ml-4",
                          cls.studentCount === 0 ? "text-red-400" : "text-slate-500"
                        )}>
                          {cls.studentCount} students • {cls.session}
                        </span>
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {selectedClassData && (
              <motion.p 
                className={cn(
                  "text-xs flex items-center gap-1",
                  selectedClassData.studentCount === 0 ? "text-red-500" : "text-slate-500"
                )}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {selectedClassData.studentCount === 0 ? (
                  <>
                    <AlertCircle className="h-3 w-3" />
                    This class has no students. You cannot send a broadcast to an empty class.
                  </>
                ) : (
                  <>
                    <Users className="h-3 w-3" />
                    This message will be sent to {selectedClassData.studentCount} students
                  </>
                )}
              </motion.p>
            )}
          </div>

          {/* Category Selection */}
          <div className="space-y-2">
            <Label htmlFor="category" className="text-sm font-medium text-slate-700">
              Message Category
            </Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger 
                id="category"
                className="w-full bg-white rounded-xl shadow-sm focus:ring-2 focus:ring-orange-200 transition-all"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="general" className="rounded-lg">
                  General Information
                </SelectItem>
                <SelectItem value="urgent" className="rounded-lg">
                  Urgent Notice
                </SelectItem>
                <SelectItem value="attendance_inquiry" className="rounded-lg">
                  Attendance Related
                </SelectItem>
                <SelectItem value="documentation" className="rounded-lg">
                  Documentation
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Message Content */}
          <div className="space-y-2">
            <Label htmlFor="broadcast-message" className="text-sm font-medium text-slate-700">
              Message
            </Label>
            <Textarea
              id="broadcast-message"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Type your broadcast message here..."
              className="resize-none rounded-xl bg-white shadow-sm focus:ring-2 focus:ring-orange-200 transition-all min-h-[120px]"
              disabled={isLoading}
            />
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-500">
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
                "text-xs font-medium transition-colors",
                isNearLimit ? "text-orange-500" : "text-slate-400"
              )}>
                {remainingChars} characters remaining
              </span>
            </div>
          </div>

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
                    className="flex items-center gap-3 p-3 rounded-xl bg-white shadow-sm border border-slate-100"
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

          {/* File Upload Area */}
          <motion.div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={cn(
              "rounded-xl p-4 text-center transition-all duration-300 cursor-pointer border-2 border-dashed",
              isDragging
                ? "bg-gradient-to-br from-orange-100 to-orange-50 border-orange-300 scale-[1.02]"
                : "bg-gradient-to-br from-slate-50 to-white hover:from-orange-50 hover:to-white border-slate-200 hover:border-orange-200"
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
                <Paperclip className="h-6 w-6 text-orange-500" />
              </motion.div>
              <div>
                <span className="text-orange-600 font-semibold text-sm">Attach files</span>
                <span className="text-xs text-slate-500"> (optional)</span>
              </div>
              <p className="text-xs text-slate-400">
                Click or drag files here • All types allowed • Max 100MB per file
              </p>
            </div>
          </motion.div>

          {/* Error Message */}
          {error && (
            <motion.div 
              className="flex items-start gap-2 p-3 rounded-xl bg-red-50 shadow-sm"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </motion.div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              className="flex-1 rounded-xl bg-slate-100 hover:bg-slate-200 shadow-sm"
            >
              Cancel
            </Button>
            <motion.div className="flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                onClick={handleSend}
                disabled={
                  !selectedClass || 
                  !content.trim() || 
                  isLoading ||
                  (selectedClassData && selectedClassData.studentCount === 0)
                }
                className={cn(
                  "w-full rounded-xl",
                  "flex items-center justify-center gap-2",
                  "bg-gradient-to-r from-orange-500 to-orange-600",
                  "hover:from-orange-600 hover:to-orange-700",
                  "text-white font-semibold",
                  "shadow-lg shadow-orange-500/30",
                  "transition-all duration-300",
                  "disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                )}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    <span>Send Broadcast</span>
                  </>
                )}
              </Button>
            </motion.div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
