"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Search, Loader2, UserPlus, Users, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAvailableRecipients } from "@/hooks/use-student-messages";

interface Recipient {
  id: string;
  type: "student" | "office";
  name: string;
  avatar?: string;
}

interface TeacherNewConversationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectRecipient: (recipient: Recipient) => void;
}

export function TeacherNewConversationDialog({
  open,
  onOpenChange,
  onSelectRecipient,
}: TeacherNewConversationDialogProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"students" | "office">("students");
  const { data: recipients = [], isLoading } = useAvailableRecipients();

  const students = recipients.filter(r => r.type === "student");
  const officeStaff = recipients.filter(r => r.type === "office");

  const filteredStudents = students.filter((r) =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredOffice = officeStaff.filter((r) =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleSelect = (recipient: Recipient) => {
    onSelectRecipient(recipient);
    onOpenChange(false);
    setSearchQuery("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden rounded-2xl">
        <DialogHeader className="p-5 pb-3 bg-gradient-to-r from-blue-50 to-white">
          <DialogTitle className="flex items-center gap-3 text-blue-800">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
              <UserPlus className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="block">New Conversation</span>
              <span className="text-xs font-normal text-slate-500">Select a recipient to message</span>
            </div>
          </DialogTitle>
        </DialogHeader>

        {/* Search */}
        <div className="px-5 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search recipients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11 rounded-xl bg-slate-50 border-0 focus-visible:ring-2 focus-visible:ring-blue-500"
            />
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="px-5">
          <div className="grid w-full grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
            <Button
              variant="ghost"
              onClick={() => setActiveTab("students")}
              className={cn(
                "rounded-lg transition-all",
                activeTab === "students"
                  ? "bg-white shadow-sm text-blue-700"
                  : "text-slate-600 hover:text-slate-800"
              )}
            >
              <Users className="h-4 w-4 mr-2" />
              Students ({students.length})
            </Button>
            <Button
              variant="ghost"
              onClick={() => setActiveTab("office")}
              className={cn(
                "rounded-lg transition-all",
                activeTab === "office"
                  ? "bg-white shadow-sm text-purple-700"
                  : "text-slate-600 hover:text-slate-800"
              )}
            >
              <Building2 className="h-4 w-4 mr-2" />
              Office ({officeStaff.length})
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="px-5 mt-4 pb-5">
          <div className="h-[300px] overflow-y-auto scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {activeTab === "students" ? (
              isLoading ? (
                <div className="flex flex-col items-center justify-center h-full py-8">
                  <Loader2 className="h-8 w-8 text-blue-600 animate-spin mb-3" />
                  <p className="text-sm text-slate-500">Loading students...</p>
                </div>
              ) : filteredStudents.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full py-8">
                  <Users className="h-12 w-12 text-slate-300 mb-3" />
                  <p className="text-sm text-slate-500 text-center">
                    {searchQuery ? "No students found" : "No students available"}
                  </p>
                </div>
              ) : (
                <div className="space-y-2 pb-4">
                  <AnimatePresence>
                    {filteredStudents.map((recipient, index) => (
                      <motion.div
                        key={recipient.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Button
                          variant="ghost"
                          onClick={() => handleSelect(recipient)}
                          className={cn(
                            "w-full justify-start h-auto p-3 rounded-xl",
                            "hover:bg-blue-50 hover:shadow-sm",
                            "transition-all duration-200",
                            "group"
                          )}
                        >
                          <div className="flex items-center gap-3 w-full">
                            <Avatar className="h-11 w-11 ring-2 ring-blue-100 ring-offset-2 group-hover:ring-blue-200 transition-all">
                              <AvatarImage src={recipient.avatar} />
                              <AvatarFallback className="bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700 text-sm font-bold">
                                {getInitials(recipient.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 text-left">
                              <p className="font-semibold text-slate-800 group-hover:text-blue-700 transition-colors">
                                {recipient.name}
                              </p>
                              <p className="text-xs text-slate-500">Student</p>
                            </div>
                            <motion.div
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                              whileHover={{ scale: 1.1 }}
                            >
                              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md">
                                <UserPlus className="h-4 w-4 text-white" />
                              </div>
                            </motion.div>
                          </div>
                        </Button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )
            ) : (
              isLoading ? (
                <div className="flex flex-col items-center justify-center h-full py-8">
                  <Loader2 className="h-8 w-8 text-purple-600 animate-spin mb-3" />
                  <p className="text-sm text-slate-500">Loading office staff...</p>
                </div>
              ) : filteredOffice.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full py-8">
                  <Building2 className="h-12 w-12 text-slate-300 mb-3" />
                  <p className="text-sm text-slate-500 text-center">
                    {searchQuery ? "No office staff found" : "No office staff available"}
                  </p>
                </div>
              ) : (
                <div className="space-y-2 pb-4">
                  <AnimatePresence>
                    {filteredOffice.map((recipient, index) => (
                      <motion.div
                        key={recipient.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Button
                          variant="ghost"
                          onClick={() => handleSelect(recipient)}
                          className={cn(
                            "w-full justify-start h-auto p-3 rounded-xl",
                            "hover:bg-purple-50 hover:shadow-sm",
                            "transition-all duration-200",
                            "group"
                          )}
                        >
                          <div className="flex items-center gap-3 w-full">
                            <Avatar className="h-11 w-11 ring-2 ring-purple-100 ring-offset-2 group-hover:ring-purple-200 transition-all">
                              <AvatarImage src={recipient.avatar} />
                              <AvatarFallback className="bg-gradient-to-br from-purple-100 to-purple-200 text-purple-700 text-sm font-bold">
                                {getInitials(recipient.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 text-left">
                              <p className="font-semibold text-slate-800 group-hover:text-purple-700 transition-colors">
                                {recipient.name}
                              </p>
                              <p className="text-xs text-slate-500">Office Staff</p>
                            </div>
                            <motion.div
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                              whileHover={{ scale: 1.1 }}
                            >
                              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-md">
                                <UserPlus className="h-4 w-4 text-white" />
                              </div>
                            </motion.div>
                          </div>
                        </Button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
