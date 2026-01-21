/**
 * ContextMenu Component
 * 
 * Right-click context menu for desktop interactions.
 * Provides quick access to common actions.
 * 
 * Requirements: 21.3
 */

'use client';

import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

export interface ContextMenuItem {
  id: string;
  label: string;
  icon?: LucideIcon;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
  shortcut?: string;
}

interface ContextMenuProps {
  isOpen: boolean;
  position: { x: number; y: number };
  items: ContextMenuItem[];
  onClose: () => void;
}

export function ContextMenu({ isOpen, position, items, onClose }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  // Adjust position to keep menu in viewport
  const adjustedPosition = React.useMemo(() => {
    if (!menuRef.current) return position;

    const menuRect = menuRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let x = position.x;
    let y = position.y;

    // Adjust horizontal position
    if (x + menuRect.width > viewportWidth) {
      x = viewportWidth - menuRect.width - 10;
    }

    // Adjust vertical position
    if (y + menuRect.height > viewportHeight) {
      y = viewportHeight - menuRect.height - 10;
    }

    return { x, y };
  }, [position]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50"
            style={{ background: 'transparent' }}
          />

          {/* Menu */}
          <motion.div
            ref={menuRef}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="fixed z-50 min-w-[200px] bg-white rounded-lg shadow-xl border border-gray-200 py-1 overflow-hidden"
            style={{
              left: `${adjustedPosition.x}px`,
              top: `${adjustedPosition.y}px`,
            }}
          >
            {items.map((item, index) => {
              const Icon = item.icon;
              
              return (
                <React.Fragment key={item.id}>
                  {index > 0 && items[index - 1].id.startsWith('separator') && (
                    <div className="h-px bg-gray-200 my-1" />
                  )}
                  
                  <motion.button
                    onClick={() => {
                      if (!item.disabled) {
                        item.onClick();
                        onClose();
                      }
                    }}
                    disabled={item.disabled}
                    className={`w-full flex items-center justify-between px-4 py-2 text-sm transition-colors ${
                      item.disabled
                        ? 'text-gray-400 cursor-not-allowed'
                        : item.danger
                        ? 'text-red-600 hover:bg-red-50'
                        : 'text-gray-700 hover:bg-blue-50'
                    }`}
                    whileHover={!item.disabled ? { x: 2 } : {}}
                    transition={{ duration: 0.1 }}
                  >
                    <div className="flex items-center gap-3">
                      {Icon && <Icon className="w-4 h-4" />}
                      <span>{item.label}</span>
                    </div>
                    
                    {item.shortcut && (
                      <span className="text-xs text-gray-400 ml-4">
                        {item.shortcut}
                      </span>
                    )}
                  </motion.button>
                </React.Fragment>
              );
            })}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Hook for managing context menu
export function useContextMenu() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [position, setPosition] = React.useState({ x: 0, y: 0 });

  const handleContextMenu = (event: React.MouseEvent) => {
    event.preventDefault();
    setPosition({ x: event.clientX, y: event.clientY });
    setIsOpen(true);
  };

  const close = () => setIsOpen(false);

  return {
    isOpen,
    position,
    handleContextMenu,
    close,
  };
}
