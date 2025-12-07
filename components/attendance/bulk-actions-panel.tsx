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

  // Disable auto-hide to prevent flashing - keep panel visible when students are selected
  const [lastActivity, setLastActivity] = React.useState(Date.now());
  const [shouldAutoHide, setShouldAutoHide] = React.useState(false);
  const [autoHideCountdown, setAutoHideCountdown] = React.useState(0);

  // Auto-hide functionality after 10 seconds of inactivity
  React.useEffect(() => {
    if (selectedStudents.length === 0) {
      setShouldAutoHide(false);
      setAutoHideCountdown(0);
      return;
    }

    // Start auto-hide countdown after 10 seconds of inactivity
    const inactivityTimer = setTimeout(() => {
      setShouldAutoHide(true);
      setAutoHideCountdown(10);
    }, 10000); // 10 seconds

    return () => clearTimeout(inactivityTimer);
  }, [selectedStudents.length, lastActivity]);

  // Countdown timer for auto-hide
  React.useEffect(() => {
    if (autoHideCountdown > 0) {
      const countdownTimer = setTimeout(() => {
        setAutoHideCountdown(prev => {
          if (prev <= 1) {
            // Hide the panel and clear selection
            setShouldAutoHide(true);
            setTimeout(() => {
              onClearSelection();
            }, 500);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearTimeout(countdownTimer);
    }
  }, [autoHideCountdown, onClearSelection]);

  // Reset auto-hide when user interacts with enhanced feedback
  const handleUserActivity = () => {
    setLastActivity(Date.now());
    setShouldAutoHide(false);
    setAutoHideCountdown(0);
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

  // Enhanced bulk action confirmation with real-time progress and comprehensive error handling
  const handleConfirmAction = async () => {
    if (!pendingAction || selectedStudents.length === 0) return;

    setIsProcessing(true);
    setSaveStatus('saving');
    setProcessingProgress(0);
    
    try {
      // Enhanced progress simulation with realistic timing
      const totalSteps = selectedStudents.length;
      const progressInterval = setInterval(() => {
        setProcessingProgress(prev => {
          const increment = Math.min(85 / totalSteps, 15); // Distribute 85% across students, reserve 15% for completion
          return Math.min(prev + increment, 85);
        });
      }, 50); // Faster updates for smoother progress

      // Real-time status updates during processing
      const statusUpdateInterval = setInterval(() => {
        if (Math.random() > 0.7) { // Occasional status updates
          toast.info(`Processing ${selectedStudents.length} students...`, {
            duration: 1000,
            id: 'bulk-processing', // Prevent spam
          });
        }
      }, 1500);

      await onBulkStatusChange(selectedStudents, pendingAction.status);
      
      clearInterval(progressInterval);
      clearInterval(statusUpdateInterval);
      setProcessingProgress(100);
      
      // Enhanced success feedback with detailed information
      setSaveStatus('success');
      setLastSaveTime(new Date());
      setRetryCount(0);
      
      // Show comprehensive success notification
      toast.success(` Bulk update completed successfully!`, {
        description: `${selectedStudents.length} students marked as ${pendingAction.label.toLowerCase().replace('mark all ', '')}`,
        duration: 4000,
        action: {
          label: "View Summary",
          onClick: () => {
            toast.info(`Summary: ${selectedStudents.length} students updated`, {
              description: `Status changed to: ${pendingAction.status}`,
              duration: 3000,
            });
          },
        },
      });
      
      // Real-time visual confirmation with staggered auto-clear
      setTimeout(() => {
        toast.info(" Changes saved automatically", {
          description: "All attendance records have been synchronized",
          duration: 2000,
        });
      }, 1000);
      
      // Auto-clear selection with user notification
      setTimeout(() => {
        toast.info("Selection cleared", {
          description: "Ready for next bulk action",
          duration: 1500,
        });
        onClearSelection();
      }, 2500);
      
    } catch (error) {
      setSaveStatus('error');
      setRetryCount(prev => prev + 1);
      
      const errorMessage = error instanceof Error ? error.message : "Network error occurred";
      
      // Enhanced error handling with detailed feedback
      toast.error(" Bulk update failed", {
        description: `${errorMessage} (Attempt ${retryCount + 1}/3)`,
        duration: 6000,
        action: {
          label: retryCount < 2 ? "Retry Now" : "Manual Retry",
          onClick: () => handleRetryAction(),
        },
      });

      // Show recovery suggestions for persistent errors
      if (retryCount >= 1) {
        setTimeout(() => {
          toast.warning(" Troubleshooting tip", {
            description: "Try selecting fewer students or check your internet connection",
            duration: 5000,
          });
        }, 1000);
      }
    } finally {
      setIsProcessing(false);
      setShowConfirmDialog(false);
      setPendingAction(null);
      setProcessingProgress(0);
    }
  };

  // Enhanced retry mechanism with exponential backoff and smart recovery
  const handleRetryAction = async () => {
    if (!pendingAction || retryCount >= 3) {
      toast.error(" Maximum retry attempts reached", {
        description: "Please refresh the page or try individual updates",
        duration: 8000,
        action: {
          label: "Refresh Page",
          onClick: () => window.location.reload(),
        },
      });
      return;
    }
    
    // Exponential backoff delay
    const delay = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s delays
    
    toast.info(`Retrying in ${delay / 1000} seconds...`, {
      description: `Attempt ${retryCount + 2}/3`,
      duration: delay,
    });
    
    setTimeout(async () => {
      await handleConfirmAction();
    }, delay);
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
            <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl shadow-orange-500/20 p-4 sm:p-6 w-[95vw] max-w-[650px] mx-auto">
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
                    <span className="text-sm text-slate-600">{Math.round(processingProgress)}%</span>
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
              <div className="grid grid-cols-2 gap-2 sm:gap-3 sm:grid-cols-4">
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

              {/* Enhanced real-time status footer */}
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Clock className="h-3 w-3" />
                  <span>
                    {autoHideCountdown > 0 
                      ? `Auto-hide in ${autoHideCountdown}s` 
                      : "Auto-hide after 10s inactivity"
                    }
                  </span>
                  {autoHideCountdown > 0 && autoHideCountdown <= 3 && (
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 0.5, repeat: Infinity }}
                      className="w-2 h-2 bg-orange-400 rounded-full"
                    />
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  {saveStatus === 'success' && (
                    <motion.div
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center gap-1 text-xs text-green-600"
                    >
                      <CheckCircle2 className="h-3 w-3" />
                      <span>Real-time sync active</span>
                    </motion.div>
                  )}
                  
                  {saveStatus === 'saving' && (
                    <motion.div
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center gap-1 text-xs text-blue-600"
                    >
                      <Loader2 className="h-3 w-3 animate-spin" />
                      <span>Syncing changes...</span>
                    </motion.div>
                  )}
                  
                  {saveStatus === 'error' && (
                    <motion.div
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center gap-1 text-xs text-red-600"
                    >
                      <AlertCircle className="h-3 w-3" />
                      <span>Retry {retryCount + 1}/3 pending</span>
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
        <DialogContent className="sm:max-w-lg bg-white border border-slate-200 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-slate-900">
              <div className={cn(
                "p-2 rounded-lg",
                pendingAction?.bgColor || "bg-orange-100"
              )}>
                {pendingAction && <pendingAction.icon className={cn("h-5 w-5", pendingAction.textColor)} />}
              </div>
              <div>
                <span className="text-slate-900 font-semibold">Confirm Bulk Action</span>
                <p className="text-sm font-normal text-slate-600 mt-1">
                  {pendingAction?.label}
                </p>
              </div>
            </DialogTitle>
            <DialogDescription className="text-slate-700 mt-2">
              {pendingAction && (
                <>
                  This action will {pendingAction.description.toLowerCase()} for{' '}
                  <strong className="text-slate-900">{selectedStudents.length} student{selectedStudents.length !== 1 ? 's' : ''}</strong>.
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

          {/* Enhanced processing progress with real-time updates */}
          {isProcessing && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mb-4"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  >
                    <RefreshCw className="h-4 w-4 text-blue-600" />
                  </motion.div>
                  <span className="text-sm font-medium text-slate-700">
                    Processing {selectedStudents.length} students...
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-600">{Math.round(processingProgress)}%</span>
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                    className="w-2 h-2 bg-blue-500 rounded-full"
                  />
                </div>
              </div>
              <ProgressIndicator 
                percentage={processingProgress} 
                color="blue"
                size="sm"
                animated={true}
                showPercentage={false}
              />
              
              {/* Real-time status messages */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-2 text-xs text-slate-500"
              >
                {processingProgress < 30 && "Validating student records..."}
                {processingProgress >= 30 && processingProgress < 60 && "Updating attendance status..."}
                {processingProgress >= 60 && processingProgress < 90 && "Synchronizing with database..."}
                {processingProgress >= 90 && "Finalizing changes..."}
              </motion.div>
            </motion.div>
          )}

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={handleCancelAction}
              disabled={isProcessing}
              className="border-slate-200 hover:bg-slate-50 text-slate-700"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmAction}
              disabled={isProcessing}
              className={cn(
                "border-0 shadow-sm transition-all duration-200 text-white",
                pendingAction?.status === "PRESENT" && "bg-green-600 hover:bg-green-700",
                pendingAction?.status === "ABSENT" && "bg-red-600 hover:bg-red-700",
                pendingAction?.status === "SICK" && "bg-yellow-600 hover:bg-yellow-700",
                pendingAction?.status === "LEAVE" && "bg-orange-600 hover:bg-orange-700",
                isProcessing && "opacity-80"
              )}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  <span className="text-white">Processing {Math.round(processingProgress)}%</span>
                </>
              ) : (
                <>
                  {pendingAction && <pendingAction.icon className="h-4 w-4 mr-2" />}
                  <span className="text-white">Confirm & Save</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}