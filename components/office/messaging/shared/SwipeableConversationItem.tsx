/**
 * SwipeableConversationItem Component
 * 
 * Wrapper for ConversationItem that adds swipe gestures for quick actions.
 * Swipe left: Archive
 * Swipe right: Pin/Unpin
 * 
 * Requirements: 21.1, 21.5
 */

'use client';

import React, { useState, useRef } from 'react';
import { motion, PanInfo, useMotionValue, useTransform } from 'framer-motion';
import { Archive, Pin, Trash2 } from 'lucide-react';

interface SwipeableConversationItemProps {
  children: React.ReactNode;
  onArchive?: () => void;
  onPin?: () => void;
  onDelete?: () => void;
  isPinned?: boolean;
}

export function SwipeableConversationItem({
  children,
  onArchive,
  onPin,
  onDelete,
  isPinned = false,
}: SwipeableConversationItemProps) {
  const [isRevealed, setIsRevealed] = useState(false);
  const x = useMotionValue(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Transform for background opacity
  const leftBgOpacity = useTransform(x, [0, 80], [0, 1]);
  const rightBgOpacity = useTransform(x, [-80, 0], [1, 0]);

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 80;
    
    if (info.offset.x > threshold) {
      // Swipe right - Pin/Unpin
      onPin?.();
      x.set(0);
    } else if (info.offset.x < -threshold) {
      // Swipe left - Archive
      onArchive?.();
      x.set(0);
    } else {
      // Return to center
      x.set(0);
    }
  };

  return (
    <div 
      ref={containerRef}
      className="relative overflow-hidden"
      style={{ touchAction: 'pan-y' }}
    >
      {/* Left Action (Pin/Unpin) */}
      <motion.div
        className="absolute inset-y-0 left-0 flex items-center justify-start px-6"
        style={{
          opacity: leftBgOpacity,
          background: isPinned 
            ? 'linear-gradient(90deg, #FFA726 0%, #FF9800 100%)'
            : 'linear-gradient(90deg, #42A5F5 0%, #2196F3 100%)',
        }}
      >
        <Pin className="w-6 h-6 text-white" />
      </motion.div>

      {/* Right Action (Archive) */}
      <motion.div
        className="absolute inset-y-0 right-0 flex items-center justify-end px-6"
        style={{
          opacity: rightBgOpacity,
          background: 'linear-gradient(90deg, #EF5350 0%, #F44336 100%)',
        }}
      >
        <Archive className="w-6 h-6 text-white" />
      </motion.div>

      {/* Draggable Content */}
      <motion.div
        drag="x"
        dragConstraints={{ left: -120, right: 120 }}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
        style={{ x }}
        className="relative bg-white"
      >
        {children}
      </motion.div>
    </div>
  );
}
