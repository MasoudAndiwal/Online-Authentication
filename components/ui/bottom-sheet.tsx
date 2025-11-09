/**
 * Bottom Sheet Component
 * Mobile-optimized modal that slides up from the bottom
 */

'use client';

import * as React from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useHapticFeedback } from '@/lib/hooks/use-touch-gestures';

export interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  description?: string;
  snapPoints?: number[]; // Percentage heights [50, 100]
  defaultSnapPoint?: number;
  showHandle?: boolean;
  closeOnBackdropClick?: boolean;
  className?: string;
}

export function BottomSheet({
  isOpen,
  onClose,
  children,
  title,
  description,
  snapPoints = [50, 100],
  defaultSnapPoint = 0,
  showHandle = true,
  closeOnBackdropClick = true,
  className,
}: BottomSheetProps) {
  const [currentSnapPoint, setCurrentSnapPoint] = React.useState(defaultSnapPoint);
  const { lightTap } = useHapticFeedback();
  const sheetRef = React.useRef<HTMLDivElement>(null);

  const snapPointHeight = snapPoints[currentSnapPoint];

  const handleDragEnd = (_event: unknown, info: PanInfo) => {
    const threshold = 100;
    
    // If dragged down significantly, close
    if (info.offset.y > threshold) {
      lightTap();
      onClose();
      return;
    }

    // Snap to next point based on drag direction
    if (info.offset.y < -threshold && currentSnapPoint < snapPoints.length - 1) {
      setCurrentSnapPoint(currentSnapPoint + 1);
      lightTap();
    } else if (info.offset.y > threshold && currentSnapPoint > 0) {
      setCurrentSnapPoint(currentSnapPoint - 1);
      lightTap();
    }
  };

  const handleBackdropClick = () => {
    if (closeOnBackdropClick) {
      lightTap();
      onClose();
    }
  };

  // Reset snap point when closed
  React.useEffect(() => {
    if (!isOpen) {
      setCurrentSnapPoint(defaultSnapPoint);
    }
  }, [isOpen, defaultSnapPoint]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={handleBackdropClick}
            aria-hidden="true"
          />

          {/* Bottom Sheet */}
          <motion.div
            ref={sheetRef}
            initial={{ y: '100%' }}
            animate={{ y: `${100 - snapPointHeight}%` }}
            exit={{ y: '100%' }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 30,
            }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            className={cn(
              'fixed bottom-0 left-0 right-0 z-50',
              'bg-white rounded-t-3xl shadow-2xl',
              'max-h-[95vh] overflow-hidden',
              className
            )}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? 'bottom-sheet-title' : undefined}
            aria-describedby={description ? 'bottom-sheet-description' : undefined}
          >
            {/* Drag Handle */}
            {showHandle && (
              <div className="flex justify-center pt-4 pb-2 cursor-grab active:cursor-grabbing">
                <div className="w-12 h-1.5 bg-slate-300 rounded-full" aria-hidden="true" />
              </div>
            )}

            {/* Header */}
            {(title || description) && (
              <div className="px-6 py-4 border-b border-slate-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {title && (
                      <h2
                        id="bottom-sheet-title"
                        className="text-xl font-bold text-slate-900"
                      >
                        {title}
                      </h2>
                    )}
                    {description && (
                      <p
                        id="bottom-sheet-description"
                        className="text-sm text-slate-600 mt-1"
                      >
                        {description}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      lightTap();
                      onClose();
                    }}
                    className="ml-4 p-2 rounded-xl hover:bg-slate-100 transition-colors"
                    aria-label="Close bottom sheet"
                  >
                    <X className="h-5 w-5 text-slate-600" />
                  </button>
                </div>
              </div>
            )}

            {/* Content */}
            <div className="overflow-y-auto max-h-[calc(95vh-8rem)] overscroll-contain">
              <div className="px-6 py-4">{children}</div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/**
 * Bottom Sheet Trigger Button
 */
export interface BottomSheetTriggerProps {
  children: React.ReactNode;
  onClick: () => void;
  className?: string;
}

export function BottomSheetTrigger({
  children,
  onClick,
  className,
}: BottomSheetTriggerProps) {
  const { lightTap } = useHapticFeedback();

  return (
    <button
      onClick={() => {
        lightTap();
        onClick();
      }}
      className={cn(
        'inline-flex items-center justify-center',
        'min-h-[44px] min-w-[44px]', // Touch target size
        'touch-manipulation', // Optimize for touch
        className
      )}
    >
      {children}
    </button>
  );
}
