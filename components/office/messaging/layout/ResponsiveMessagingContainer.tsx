/**
 * ResponsiveMessagingContainer Component
 * 
 * Responsive container that adapts layout based on screen size:
 * - Mobile (< 768px): Single column with toggle between list and view
 * - Tablet (768px - 1024px): Two columns with collapsible sidebar
 * - Desktop (> 1024px): Fixed two-column layout
 * 
 * Requirements: 21.1, 21.2, 21.3, 21.5
 */

'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMessaging } from '@/hooks/office/messaging/use-messaging-context';
import { ConversationSidebar } from '../sidebar/ConversationSidebar';
import { MessageView } from '../message-view/MessageView';
import { MobileBottomNav } from './MobileBottomNav';
import { FloatingActionButton } from './FloatingActionButton';
import { Menu, X, ArrowLeft } from 'lucide-react';

// ============================================================================
// Types
// ============================================================================

type ViewMode = 'list' | 'conversation';
type ScreenSize = 'mobile' | 'tablet' | 'desktop';

// ============================================================================
// Hooks
// ============================================================================

function useScreenSize(): ScreenSize {
  const [screenSize, setScreenSize] = useState<ScreenSize>('desktop');

  useEffect(() => {
    const updateScreenSize = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setScreenSize('mobile');
      } else if (width < 1024) {
        setScreenSize('tablet');
      } else {
        setScreenSize('desktop');
      }
    };

    updateScreenSize();
    window.addEventListener('resize', updateScreenSize);
    return () => window.removeEventListener('resize', updateScreenSize);
  }, []);

  return screenSize;
}

// ============================================================================
// Component
// ============================================================================

export function ResponsiveMessagingContainer() {
  const screenSize = useScreenSize();
  const { selectedConversationId, selectConversation } = useMessaging();
  
  // Mobile: Toggle between list and conversation view
  const [mobileView, setMobileView] = useState<ViewMode>('list');
  
  // Tablet: Sidebar collapse state
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Update mobile view when conversation is selected
  useEffect(() => {
    if (screenSize === 'mobile' && selectedConversationId) {
      setMobileView('conversation');
    }
  }, [selectedConversationId, screenSize]);

  // Handle back button on mobile
  const handleMobileBack = () => {
    setMobileView('list');
    selectConversation(null);
  };

  // Handle new conversation
  const handleNewConversation = () => {
    // This would open a dialog to select recipient
    console.log('Open new conversation dialog');
  };

  // ============================================================================
  // Mobile Layout (< 768px)
  // ============================================================================

  if (screenSize === 'mobile') {
    return (
      <div className="h-screen flex flex-col bg-white">
        {/* Mobile Header */}
        <div className="h-14 flex items-center justify-between px-4 border-b border-gray-200 bg-white shadow-sm">
          {mobileView === 'conversation' ? (
            <>
              <button
                onClick={handleMobileBack}
                className="p-2 -ml-2 rounded-lg hover:bg-gray-100 transition-colors"
                style={{ minWidth: '44px', minHeight: '44px' }}
                aria-label="Back to conversations"
              >
                <ArrowLeft className="w-6 h-6 text-gray-700" />
              </button>
              <h1 className="text-lg font-semibold text-gray-900">Message</h1>
              <div style={{ width: '44px' }} /> {/* Spacer for centering */}
            </>
          ) : (
            <>
              <h1 className="text-lg font-semibold text-gray-900">Messages</h1>
              <div style={{ width: '44px' }} /> {/* Spacer */}
            </>
          )}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden relative">
          <AnimatePresence mode="wait">
            {mobileView === 'list' ? (
              <motion.div
                key="list"
                initial={{ x: -300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -300, opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="h-full"
              >
                <ConversationSidebar className="w-full h-full border-r-0" />
              </motion.div>
            ) : (
              <motion.div
                key="conversation"
                initial={{ x: 300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 300, opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="h-full"
              >
                <MessageView conversationId={selectedConversationId} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Mobile Bottom Navigation */}
        {mobileView === 'list' && (
          <MobileBottomNav />
        )}

        {/* Floating Action Button */}
        {mobileView === 'list' && (
          <FloatingActionButton onClick={handleNewConversation} />
        )}
      </div>
    );
  }

  // ============================================================================
  // Tablet Layout (768px - 1024px)
  // ============================================================================

  if (screenSize === 'tablet') {
    return (
      <div className="h-screen flex bg-white">
        {/* Sidebar Toggle Button */}
        <AnimatePresence>
          {isSidebarCollapsed && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarCollapsed(false)}
              className="fixed top-4 left-4 z-50 p-3 rounded-lg bg-white shadow-lg hover:shadow-xl transition-shadow"
              style={{ minWidth: '48px', minHeight: '48px' }}
              aria-label="Open sidebar"
            >
              <Menu className="w-6 h-6 text-gray-700" />
            </motion.button>
          )}
        </AnimatePresence>

        {/* Sidebar */}
        <AnimatePresence>
          {!isSidebarCollapsed && (
            <motion.div
              initial={{ x: -280, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -280, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="relative"
              style={{ width: '280px' }}
            >
              {/* Close Button */}
              <button
                onClick={() => setIsSidebarCollapsed(true)}
                className="absolute top-4 right-4 z-10 p-2 rounded-lg bg-white/80 hover:bg-white shadow-sm"
                style={{ minWidth: '44px', minHeight: '44px' }}
                aria-label="Close sidebar"
              >
                <X className="w-5 h-5 text-gray-700" />
              </button>
              
              <ConversationSidebar className="h-full" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden">
          <MessageView conversationId={selectedConversationId} />
        </div>

        {/* Swipe Overlay for Touch Gestures */}
        <div
          className="fixed inset-0 pointer-events-none"
          onTouchStart={(e) => {
            const touch = e.touches[0];
            const startX = touch.clientX;
            
            const handleTouchMove = (moveEvent: TouchEvent) => {
              const moveTouch = moveEvent.touches[0];
              const deltaX = moveTouch.clientX - startX;
              
              // Swipe right to open sidebar
              if (deltaX > 50 && isSidebarCollapsed) {
                setIsSidebarCollapsed(false);
                document.removeEventListener('touchmove', handleTouchMove);
              }
              // Swipe left to close sidebar
              else if (deltaX < -50 && !isSidebarCollapsed) {
                setIsSidebarCollapsed(true);
                document.removeEventListener('touchmove', handleTouchMove);
              }
            };
            
            document.addEventListener('touchmove', handleTouchMove);
            document.addEventListener('touchend', () => {
              document.removeEventListener('touchmove', handleTouchMove);
            }, { once: true });
          }}
        />
      </div>
    );
  }

  // ============================================================================
  // Desktop Layout (>= 1024px)
  // ============================================================================

  return (
    <div className="h-screen flex bg-white">
      {/* Sidebar - Always Visible */}
      <div style={{ width: '320px', flexShrink: 0 }}>
        <ConversationSidebar className="h-full" />
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <MessageView conversationId={selectedConversationId} />
      </div>
    </div>
  );
}
