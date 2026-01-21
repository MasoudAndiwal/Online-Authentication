"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Paperclip, X, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface OfficeComposeMessageProps {
  recipientName: string;
  recipientType: string;
  onSend: (data: {
    content: string;
    category: string;
    attachments: File[];
    isUrgent?: boolean;
  }) => void;
  isLoading?: boolean;
  compact?: boolean;
}

const categories = [
  { value: "general", label: "General" },
  { value: "administrative", label: "Administrative" },
  { value: "attendance_alert", label: "Attendance Alert" },
  { value: "schedule_change", label: "Schedule Change" },
  { value: "announcement", label: "Announcement" },
  { value: "urgent", label: "Urgent" },
];

export function OfficeComposeMessage({
  recipientName,
  recipientType,
  onSend,
  isLoading = false,
  compact = false,
}: OfficeComposeMessageProps) {
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("general");
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isUrgent, setIsUrgent] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    if (!content.trim() && attachments.length === 0) return;

    onSend({
      content: content.trim(),
      category,
      attachments,
      isUrgent,
    });

    // Reset form
    setContent("");
    setCategory("general");
    setAttachments([]);
    setIsUrgent(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachments((prev) => [...prev, ...files]);
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  };

  return (
    <div className={cn("bg-white", compact ? "p-3" : "p-4")}>
      {/* Toolbar */}
      {!compact && (
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-3 py-1.5 text-sm rounded-xl bg-gradient-to-r from-slate-100 to-slate-200 hover:from-slate-200 hover:to-slate-300 border-0 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {categories.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isUrgent}
              onChange={(e) => setIsUrgent(e.target.checked)}
              className="w-4 h-4 text-red-600 border-0 rounded focus:ring-red-500"
            />
            <span className="text-sm font-medium text-slate-700">Mark as Urgent</span>
          </label>

          <div className="flex-1" />

          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-0 shadow-md rounded-xl"
          >
            <Paperclip className="h-4 w-4 mr-2" />
            Attach
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={handleFileSelect}
            accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
          />
        </div>
      )}

      {/* Attachments Preview */}
      <AnimatePresence>
        {attachments.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-3 flex flex-wrap gap-2"
          >
            {attachments.map((file, index) => (
              <div
                key={index}
                className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-slate-100 to-slate-200 rounded-xl shadow-sm border-0"
              >
                <Paperclip className="h-4 w-4 text-slate-600" />
                <span className="text-sm text-slate-700">{file.name}</span>
                <span className="text-xs text-slate-500">{formatFileSize(file.size)}</span>
                <button
                  onClick={() => removeAttachment(index)}
                  className="ml-2 p-1 bg-gradient-to-r from-red-400 to-red-500 text-white hover:from-red-500 hover:to-red-600 rounded-lg transition-all border-0"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Urgent Warning */}
      <AnimatePresence>
        {isUrgent && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-3 flex items-center gap-2 px-3 py-2 bg-red-50 rounded-lg border-0"
          >
            <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
            <span className="text-sm text-red-700">
              This message will be marked as urgent and prioritized
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input Area */}
      <div className="relative">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={`Message ${recipientName}...`}
          className="min-h-[80px] pr-12 resize-none rounded-xl border-0 shadow-sm focus-visible:ring-2 focus-visible:ring-blue-500 bg-slate-50"
          disabled={isLoading}
        />
        <Button
          onClick={handleSend}
          disabled={(!content.trim() && attachments.length === 0) || isLoading}
          className={cn(
            "absolute bottom-2 right-2 h-8 w-8 p-0 rounded-lg border-0",
            "bg-gradient-to-r from-blue-500 to-blue-600",
            "hover:from-blue-600 hover:to-blue-700",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "transition-all hover:scale-105 shadow-md"
          )}
        >
          {isLoading ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <Send className="h-4 w-4" />
            </motion.div>
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Keyboard Shortcut Hint - Using shadcn kbd component style */}
      <p className="mt-2 text-xs text-slate-400 flex items-center gap-1">
        Press{" "}
        <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-slate-200 bg-slate-100 px-1.5 font-mono text-[10px] font-medium text-slate-600 opacity-100">
          <span className="text-xs">Ctrl</span>
        </kbd>{" "}
        +{" "}
        <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-slate-200 bg-slate-100 px-1.5 font-mono text-[10px] font-medium text-slate-600 opacity-100">
          <span className="text-xs">↵</span>
        </kbd>{" "}
        to send
      </p>
    </div>
  );
}
