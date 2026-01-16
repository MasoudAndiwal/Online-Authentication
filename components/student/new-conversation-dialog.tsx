"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Loader2, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Teacher3D } from "@/components/ui/message-3d-icons";
import { useAvailableRecipients } from "@/hooks/use-student-messages";

interface Recipient {
  id: string;
  type: "teacher" | "office";
  name: string;
  avatar?: string;
}

interface NewConversationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectRecipient: (recipient: Recipient) => void;
}

/**
 * NewConversationDialog Component
 * 
 * Beautiful dialog for selecting a teacher to start a new conversation
 */
export function NewConversationDialog({
  open,
  onOpenChange,
  onSelectRecipient,
}: NewConversationDialogProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const { data: recipients = [], isLoading } = useAvailableRecipients();

  const filteredRecipients = recipients.filter((r) =>
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
        <DialogHeader className="p-5 pb-3 bg-gradient-to-r from-emerald-50 to-white">
          <DialogTitle className="flex items-center gap-3 text-emerald-800">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg">
              <UserPlus className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="block">New Conversation</span>
              <span className="text-xs font-normal text-slate-500">Select a teacher to message</span>
            </div>
          </DialogTitle>
        </DialogHeader>

        {/* Search */}
        <div className="px-5 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search teachers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11 rounded-xl bg-slate-50 border-0 focus-visible:ring-2 focus-visible:ring-emerald-500"
            />
          </div>
        </div>

        {/* Recipients List */}
        <ScrollArea className="h-[300px] px-5 pb-5">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full py-8">
              <Loader2 className="h-8 w-8 text-emerald-600 animate-spin mb-3" />
              <p className="text-sm text-slate-500">Loading teachers...</p>
            </div>
          ) : filteredRecipients.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-8">
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Teacher3D size="xl" className="opacity-30 mb-4" />
              </motion.div>
              <p className="text-sm text-slate-500 text-center">
                {searchQuery ? "No teachers found" : "No teachers available"}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <AnimatePresence>
                {filteredRecipients.map((recipient, index) => (
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
                        "hover:bg-emerald-50 hover:shadow-sm",
                        "transition-all duration-200",
                        "group"
                      )}
                    >
                      <div className="flex items-center gap-3 w-full">
                        <Avatar className="h-11 w-11 ring-2 ring-emerald-100 ring-offset-2 group-hover:ring-emerald-200 transition-all">
                          <AvatarImage src={recipient.avatar} />
                          <AvatarFallback className="bg-gradient-to-br from-emerald-100 to-emerald-200 text-emerald-700 text-sm font-bold">
                            {getInitials(recipient.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 text-left">
                          <p className="font-semibold text-slate-800 group-hover:text-emerald-700 transition-colors">
                            {recipient.name}
                          </p>
                          <p className="text-xs text-slate-500 capitalize">
                            {recipient.type}
                          </p>
                        </div>
                        <motion.div
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                          whileHover={{ scale: 1.1 }}
                        >
                          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-md">
                            <UserPlus className="h-4 w-4 text-white" />
                          </div>
                        </motion.div>
                      </div>
                    </Button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
