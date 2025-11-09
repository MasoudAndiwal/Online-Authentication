"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProgressIndicator } from "@/components/ui/progress-indicator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  CheckCircle,
  XCircle,
  Heart,
  FileText,
  X,
  Users,
  AlertTriangle,
  Loader2,
  Clock,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import type { AttendanceStatus } from "@/types/attendance";

interface BulkActionsPanelProps {
  selectedStudents: string[];
  studentNames: Record<string, string>; // studentId -> name mapping
  onBulkStatusChange: (studentIds: string[], status: AttendanceStatus) => Promise<void>;
  onClearSelection: () => void;
  className?: string;
  isVisible?: boolean;
  isSaving?: boolean;
}

interface BulkActionConfig {
  status: AttendanceStatus;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  bgColor: string;
  textColor: string;
  hoverColor: string;
  description: string;
}

const bulkActionConfigs: BulkActionConfig[] = [
  {
    status: "PRESENT",
    label: "Mark All Present",
    icon: CheckCircle,
    bgColor: "bg-green-50",
    textColor: "text-green-700",
    hoverColor: "hover:bg-green-100",
    description: "Mark all selected students as present",
  },
  {
    status: "ABSENT",
    label: "Mark All Absent",
    icon: XCircle,
    bgColor: "bg-red-50",
    textColor: "text-red-700",
    hoverColor: "hover:bg-red-100",
    description: "Mark all selected students as absent",
  },
  {
    status: "SICK",
    label: "Mark All Sick",
    icon: Heart,
    bgColor: "bg-yellow-50",
    textColor: "text-yellow-700",
    hoverColor: "hover:bg-yellow-100",
    description: "Mark all selected students as sick",
  },
  {
    status: "LEAVE",
    label: "Mark All Leave",
    icon: FileText,
    bgColor: "bg-orange-50",
    textColor: "text-orange-700",
    hoverColor: "hover:bg-orange-100",
    description: "Mark all selected students as on leave",
  },
];

export function BulkActionsPanel({
  selectedStudents,
  studentNames,
  onBulkStatusChange,
  onClearSelection,
  className,
  isVisible = true,
  isSaving = false,
}: BulkActionsPanelProps) {
  const [showConfirmDialog, setShowConfirmDialog] = React.useState(false);
  const [pendingAction, setPendingAction] = React.useState<BulkActionConfig | null>(null);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [processingProgress, setProcessingProgress] = React.useState(0);
  const [lastSaveTime, setLastSaveTime] = React.useState<Date | null>(null);
  const [saveStatus, setSaveStatus] = React.useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [retryCount, setRetryCount] = React.useState(0);

  // Auto-hide panel after 5 seconds of inactivity
  const [lastActivity, setLastActivity] = React.useState(Date.now());
  const [shouldAutoHide, setShouldAutoHide] = React.useState(false);

  React.useEffect(() => {
    if (selectedStudents.length === 0) {
      setShouldAutoHide(false);
      return;
    }

    const timer = setTimeout(() => {
      if (Date.now() - lastActivity >= 5000) {
        setShouldAutoHide(true);
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [selectedStudents.length, lastActivity]);

  // Reset auto-hide when user interacts
  const handleUserActivity = () => {
    setLastActivity(Date.now());
    setShouldAutoHide(false);
  };

  // Auto-save functionality with real-time updates
  React.useEffect(() => {
    if (saveStatus === 'success') {
      const timer = setTimeout(() => {
        setSaveStatus('idle');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [saveStatus]);

  // Handle bulk action click
  const handleBulkAction = (config: BulkActionConfig) => {
    handleUserActivity();
    setPendingAction(config);
    setShowConfirmDialog(true);
  };

  // Confirm bulk action with enhanced error handling and progress tracking
  const handleConfirmAction = async () => {
    if (!pendingAction || selectedStudents.length === 0) return;

    setIsProcessing(true);
    setSaveStatus('saving');
    setProcessingProgress(0);
    
    try {
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setProcessingProgress(prev => Math.min(prev + 10, 90));
      }, 100);

      await onBulkStatusChange(selectedStudents, pendingAction.status);
      
      clearInterval(progressInterval);
      setProcessingProgress(100);
      
      // Set success status and save time
      setSaveStatus('success');
      setLastSaveTime(new Date());
      setRetryCount(0);
      
      toast.success(`Successfully updated ${selectedStudents.length} students`, {
        description: `All selected students marked as ${pendingAction.label.toLowerCase().replace('mark all ', '')}`,
        duration: 3000,
        action: {
          label: "View Changes",
          onClick: () => {
            // Could scroll to updated students or show summary
            console.log("View changes clicked");
          },
        },
      });
      
      // Auto-clear selection after successful save
      setTimeout(() => {
        onClearSelection();
      }, 1500);
      
    } catch (error) {
      setSaveStatus('error');
      setRetryCount(prev => prev + 1);
      
      const errorMessage = error instanceof Error ? error.message : "Please try again";
      
      toast.error("Failed to update attendance", {
        description: errorMessage,
        duration: 5000,
        action: {
          label: "Retry",
          onClick: () => handleRetryAction(),
        },
      });
    } finally {
      setIsProcessing(false);
      setShowConfirmDialog(false);
      setPendingAction(null);
      setProcessingProgress(0);
    }
  };

  // Retry failed action
  const handleRetryAction = async () => {
    if (!pendingAction || retryCount >= 3) {
      toast.error("Maximum retry attempts reached", {
        description: "Please refresh the page and try again",
      });
      return;
    }
    
    await handleConfirmAction();
  };

  // Cancel action
  const handleCancelAction = () => {
    setShowConfirmDialog(false);
    setPendingAction(null);
  };

  // Don't render if no students selected
  if (selectedStudents.length === 0) {
    return null;
  }

  return (
    <>
      <AnimatePresence>
        {isVisible && !shouldAutoHide && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.8 }}
            transition={{ 
              type: "spring", 
              stiffness: 400, 
              damping: 25,
              opacity: { duration: 0.2 }
            }}
            className={cn(
              "fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50",
              className
            )}
            onMouseEnter={handleUserActivity}
            onMouseMove={handleUserActivity}
          >
            {/* Enhanced glass morphism container with real-time status */}
            <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl shadow-orange-500/20 border border-orange-100/50 p-6 min-w-[650px]">
              {/* Header with real-time status */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "p-2 rounded-xl transition-colors duration-200",
                    saveStatus === 'saving' && "bg-blue-100",
                    saveStatus === 'success' && "bg-green-100",
                    saveStatus === 'error' && "bg-red-100",
                    saveStatus === 'idle' && "bg-orange-100"
                  )}>
                    {saveStatus === 'saving' && <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />}
                    {saveStatus === 'success' && <CheckCircle2 className="h-5 w-5 text-green-600" />}
                    {saveStatus === 'error' && <AlertCircle className="h-5 w-5 text-red-600" />}
                    {saveStatus === 'idle' && <Users className="h-5 w-5 text-orange-600" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-slate-900">Bulk Actions</h3>
                      {saveStatus === 'success' && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="flex items-center gap-1 text-green-600"
                        >
                          <Zap className="h-4 w-4" />
                          <span className="text-xs font-medium">Auto-saved</span>
                        </motion.div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-slate-600">
                        {selectedStudents.length} student{selectedStudents.length !== 1 ? 's' : ''} selected
                      </p>
                      {lastSaveTime && (
                        <span className="text-xs text-slate-500">
                          • Last saved {lastSaveTime.toLocaleTimeString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge 
                    variant="secondary" 
                    className={cn(
                      "border-0 transition-colors duration-200",
                      saveStatus === 'success' && "bg-green-100 text-green-700",
                      saveStatus === 'error' && "bg-red-100 text-red-700",
                      saveStatus === 'saving' && "bg-blue-100 text-blue-700",
                      saveStatus === 'idle' && "bg-orange-100 text-orange-700"
                    )}
                  >
                    {selectedStudents.length}
                  </Badge>
                  {retryCount > 0 && (
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                      Retry {retryCount}/3
                    </Badge>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClearSelection}
                    className="h-8 w-8 p-0 hover:bg-orange-50 rounded-lg"
                    disabled={isSaving || isProcessing}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Progress bar for processing */}
              {isProcessing && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-700">Processing...</span>
                    <span className="text-sm text-slate-600">{processingProgress}%</span>
                  </div>
                  <ProgressIndicator 
                    percentage={processingProgress} 
                    color="blue"
                    size="sm"
                    animated={true}
                    showPercentage={false}
                  />
                </motion.div>
              )}

              {/* Action Buttons */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {bulkActionConfigs.map((config) => {
                  const Icon = config.icon;
                  
                  return (
                    <motion.div
                      key={config.status}
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        onClick={() => handleBulkAction(config)}
                        disabled={isSaving || isProcessing}
                        className={cn(
                          "w-full h-auto p-4 flex flex-col items-center gap-2 text-center transition-all duration-200 border-0 shadow-sm",
                          config.bgColor,
                          config.textColor,
                          config.hoverColor,
                          "hover:shadow-md"
                        )}
                      >
                        {isSaving || isProcessing ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                          <Icon className="h-5 w-5" />
                        )}
                        <span className="text-xs font-medium leading-tight">
                          {config.label}
                        </span>
                      </Button>
                    </motion.div>
                  );
                })}
              </div>

              {/* Enhanced status footer */}
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Clock className="h-3 w-3" />
                  <span>Auto-hide after 5s inactivity</span>
                </div>
                
                <div className="flex items-center gap-2">
                  {saveStatus === 'success' && (
                    <motion.div
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center gap-1 text-xs text-green-600"
                    >
                      <CheckCircle2 className="h-3 w-3" />
                      <span>Changes saved automatically</span>
                    </motion.div>
                  )}
                  
                  {saveStatus === 'error' && (
                    <motion.div
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center gap-1 text-xs text-red-600"
                    >
                      <AlertCircle className="h-3 w-3" />
                      <span>Save failed - will retry</span>
                    </motion.div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enhanced Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="sm:max-w-lg bg-white/95 backdrop-blur-xl border-0 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className={cn(
                "p-2 rounded-lg",
                pendingAction?.bgColor || "bg-orange-100"
              )}>
                {pendingAction && <pendingAction.icon className={cn("h-5 w-5", pendingAction.textColor)} />}
              </div>
              <div>
                <span>Confirm Bulk Action</span>
                <p className="text-sm font-normal text-slate-600 mt-1">
                  {pendingAction?.label}
                </p>
              </div>
            </DialogTitle>
            <DialogDescription className="text-slate-600">
              {pendingAction && (
                <>
                  This action will {pendingAction.description.toLowerCase()} for{' '}
                  <strong>{selectedStudents.length} student{selectedStudents.length !== 1 ? 's' : ''}</strong>.
                  Changes will be saved automatically and cannot be undone.
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          {/* Enhanced selected students preview */}
          <div className="max-h-40 overflow-y-auto bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-xl p-4 my-4 border border-slate-200/50">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-slate-700">Selected Students</p>
              <Badge variant="secondary" className="bg-orange-100 text-orange-700 border-0">
                {selectedStudents.length}
              </Badge>
            </div>
            <div className="space-y-2">
              {selectedStudents.slice(0, 6).map((studentId, index) => (
                <motion.div
                  key={studentId}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center gap-2 text-sm text-slate-600"
                >
                  <div className="w-2 h-2 bg-orange-400 rounded-full" />
                  <span>{studentNames[studentId] || `Student ${studentId}`}</span>
                </motion.div>
              ))}
              {selectedStudents.length > 6 && (
                <div className="flex items-center gap-2 text-sm text-slate-500 italic">
                  <div className="w-2 h-2 bg-slate-300 rounded-full" />
                  <span>... and {selectedStudents.length - 6} more students</span>
                </div>
              )}
            </div>
          </div>

          {/* Processing progress in dialog */}
          {isProcessing && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mb-4"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-700">
                  Updating attendance records...
                </span>
                <span className="text-sm text-slate-600">{processingProgress}%</span>
              </div>
              <ProgressIndicator 
                percentage={processingProgress} 
                color="blue"
                size="sm"
                animated={true}
                showPercentage={false}
              />
            </motion.div>
          )}

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={handleCancelAction}
              disabled={isProcessing}
              className="border-slate-200 hover:bg-slate-50"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmAction}
              disabled={isProcessing}
              className={cn(
                "border-0 shadow-sm transition-all duration-200",
                pendingAction?.bgColor,
                pendingAction?.textColor,
                pendingAction?.hoverColor,
                isProcessing && "opacity-80"
              )}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing {processingProgress}%
                </>
              ) : (
                <>
                  {pendingAction && <pendingAction.icon className="h-4 w-4 mr-2" />}
                  Confirm & Save
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}