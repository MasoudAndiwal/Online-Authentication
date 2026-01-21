'use client';

import React, { useEffect } from 'react';
import { Language, TextDirection } from '@/types/office/messaging';
import { useMessaging } from '@/hooks/office/messaging/use-messaging-context';

interface MessagingLayoutProps {
  language: Language;
  direction: TextDirection;
  children: React.ReactNode;
  className?: string;
}

/**
 * MessagingLayout Component
 * 
 * Main layout container for the office messaging system.
 * Handles responsive behavior and RTL/LTR direction switching.
 * Also handles navigation events from browser notifications.
 * 
 * Responsive Breakpoints:
 * - Mobile: < 768px (single column, toggle between inbox and conversation)
 * - Tablet: 768px - 1023px (two columns with collapsible sidebar)
 * - Desktop: >= 1024px (fixed two-column layout)
 * 
 * Requirements: 21.1, 21.2, 21.3, 25.2, 25.3, 25.10, 16.2 (notification click handling)
 */
export const MessagingLayout: React.FC<MessagingLayoutProps> = ({
  language,
  direction,
  children,
  className = '',
}) => {
  const { selectConversation } = useMessaging();

  // Apply direction and language to document root
  useEffect(() => {
    document.documentElement.dir = direction;
    document.documentElement.lang = language;
  }, [direction, language]);

  // Handle navigation events from browser notifications
  // Requirement 16.2: Handle notification click to open conversation
  useEffect(() => {
    const handleNavigateToConversation = (event: Event) => {
      const customEvent = event as CustomEvent<{ conversationId: string }>;
      const { conversationId } = customEvent.detail;
      
      if (conversationId) {
        console.log('Navigating to conversation from notification:', conversationId);
        selectConversation(conversationId);
      }
    };

    window.addEventListener('navigate-to-conversation', handleNavigateToConversation);

    return () => {
      window.removeEventListener('navigate-to-conversation', handleNavigateToConversation);
    };
  }, [selectConversation]);

  return (
    <div
      className={`messaging-layout ${className}`}
      dir={direction}
      lang={language}
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Main content wrapper */}
      <div
        className="messaging-layout__content"
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          maxWidth: '100%',
          margin: '0 auto',
          width: '100%',
        }}
      >
        {children}
      </div>

      <style jsx>{`
        /* Mobile Layout (< 768px) */
        @media (max-width: 767px) {
          .messaging-layout__content {
            flex-direction: column;
          }
        }

        /* Tablet Layout (768px - 1023px) */
        @media (min-width: 768px) and (max-width: 1023px) {
          .messaging-layout__content {
            flex-direction: row;
          }
        }

        /* Desktop Layout (>= 1024px) */
        @media (min-width: 1024px) {
          .messaging-layout__content {
            flex-direction: row;
            max-width: 1920px;
          }
        }

        /* RTL-specific adjustments */
        [dir='rtl'] .messaging-layout__content {
          direction: rtl;
        }

        [dir='ltr'] .messaging-layout__content {
          direction: ltr;
        }
      `}</style>
    </div>
  );
};

export default MessagingLayout;
