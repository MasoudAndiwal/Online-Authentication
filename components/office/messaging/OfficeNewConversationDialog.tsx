"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, GraduationCap, User, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface OfficeNewConversationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectRecipient: (recipient: {
    id: string;
    type: "student" | "teacher";
    name: string;
  }) => void;
}

interface Student {
  id: string;
  studentId: string;
  name: string;
  email: string;
  type: "student";
}

interface Teacher {
  id: string;
  teacherId: string;
  name: string;
  email: string;
  department: string;
  type: "teacher";
}

type User = Student | Teacher;

export function OfficeNewConversationDialog({
  open,
  onOpenChange,
  onSelectRecipient,
}: OfficeNewConversationDialogProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<"all" | "student" | "teacher">("all");
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch users from the database when dialog opens
  useEffect(() => {
    if (open) {
      fetchUsers();
    }
  }, [open]);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      // Fetch students and teachers in parallel
      const [studentsRes, teachersRes] = await Promise.all([
        fetch("/api/students/list"),
        fetch("/api/teachers/list"),
      ]);

      const studentsData = await studentsRes.json();
      const teachersData = await teachersRes.json();

      const allUsers: User[] = [
        ...(studentsData.students || []),
        ...(teachersData.teachers || []),
      ];

      setUsers(allUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.type === "student" && user.studentId.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (user.type === "teacher" && user.teacherId.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = selectedType === "all" || user.type === selectedType;
    return matchesSearch && matchesType;
  });

  const handleSelect = (user: User) => {
    onSelectRecipient({
      id: user.id,
      type: user.type,
      name: user.name,
    });
    setSearchQuery("");
    setSelectedType("all");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
            New Conversation
          </DialogTitle>
          <DialogDescription>
            Search for a student or teacher to start a conversation
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Search by name or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10 rounded-xl border-0 shadow-sm focus-visible:ring-2 focus-visible:ring-blue-500 bg-slate-50"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 border-0"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2">
            <Button
              variant={selectedType === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedType("all")}
              className={cn(
                "rounded-xl",
                selectedType === "all"
                  ? "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                  : ""
              )}
            >
              All
            </Button>
            <Button
              variant={selectedType === "student" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedType("student")}
              className={cn(
                "rounded-xl",
                selectedType === "student"
                  ? "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                  : ""
              )}
            >
              <GraduationCap className="h-4 w-4 mr-2" />
              Students
            </Button>
            <Button
              variant={selectedType === "teacher" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedType("teacher")}
              className={cn(
                "rounded-xl",
                selectedType === "teacher"
                  ? "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                  : ""
              )}
            >
              <User className="h-4 w-4 mr-2" />
              Teachers
            </Button>
          </div>

          {/* Results List - Hide scrollbar */}
          <div className="flex-1 overflow-y-auto rounded-xl scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-full p-8">
                <Loader2 className="h-8 w-8 text-blue-500 animate-spin mb-4" />
                <p className="text-sm text-slate-500">Loading users...</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center mb-4">
                  <Search className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-700 mb-2">
                  No results found
                </h3>
                <p className="text-sm text-slate-500">
                  Try adjusting your search or filters
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-200 border border-slate-100 rounded-xl overflow-hidden">
                {filteredUsers.map((user, index) => (
                  <motion.button
                    key={user.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleSelect(user)}
                    className="w-full p-4 text-left hover:bg-slate-50 transition-colors border-0"
                  >
                    <div className="flex items-center gap-3">
                      {/* Avatar */}
                      <div
                        className={cn(
                          "w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold shadow-md",
                          user.type === "teacher"
                            ? "bg-gradient-to-br from-green-400 to-green-600"
                            : "bg-gradient-to-br from-blue-400 to-blue-600"
                        )}
                      >
                        {user.type === "teacher" ? (
                          <User className="h-6 w-6" />
                        ) : (
                          <GraduationCap className="h-6 w-6" />
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-slate-800 truncate">
                          {user.name}
                        </h4>
                        <p className="text-sm text-slate-600">
                          {user.type === "student"
                            ? `Student ID: ${user.studentId}`
                            : user.department}
                        </p>
                      </div>

                      {/* Badge */}
                      <Badge
                        variant="secondary"
                        className={cn(
                          "capitalize",
                          user.type === "teacher"
                            ? "bg-green-100 text-green-700"
                            : "bg-blue-100 text-blue-700"
                        )}
                      >
                        {user.type}
                      </Badge>
                    </div>
                  </motion.button>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
