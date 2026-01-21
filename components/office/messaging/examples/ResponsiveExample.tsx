/**
 * Responsive Design Example
 * 
 * This file demonstrates how to use the responsive messaging components.
 * It can be used as a reference or starting point for implementation.
 */

'use client';

import React from 'react';
import { MessagingLayout } from '../layout/MessagingLayout';
import { ResponsiveMessagingContainer } from '../layout/ResponsiveMessagingContainer';
import { MessagingProvider } from '@/hooks/office/messaging/use-messaging-context';

/**
 * Example 1: Basic Responsive Container
 * 
 * The simplest way to use the responsive messaging system.
 * The container automatically handles layout switching based on screen size.
 */
export function BasicResponsiveExample() {
  return (
    <MessagingProvider>
      <MessagingLayout language="en" direction="ltr">
        <ResponsiveMessagingContainer />
      </MessagingLayout>
    </MessagingProvider>
  );
}

/**
 * Example 2: With Custom Language
 * 
 * Shows how to use the responsive container with RTL languages.
 */
export function RTLResponsiveExample() {
  return (
    <MessagingProvider>
      <MessagingLayout language="fa" direction="rtl">
        <ResponsiveMessagingContainer />
      </MessagingLayout>
    </MessagingProvider>
  );
}

/**
 * Example 3: Responsive Typography
 * 
 * Demonstrates the responsive typography system.
 */
import { 
  ResponsiveText, 
  Heading1, 
  Heading2, 
  BodyText, 
  SmallText 
} from '../shared/ResponsiveText';

export function TypographyExample() {
  return (
    <div className="p-6 space-y-4">
      <Heading1>Main Heading (scales: 30px → 36px)</Heading1>
      <Heading2>Section Heading (scales: 24px → 30px)</Heading2>
      <BodyText>
        This is body text that scales from 14px on mobile to 16px on tablet/desktop.
        It maintains optimal readability across all device sizes.
      </BodyText>
      <SmallText>
        Small text for captions and metadata (scales: 13px → 14px)
      </SmallText>
      
      {/* Custom scale and weight */}
      <ResponsiveText scale="xl" weight="semibold">
        Custom responsive text with XL scale and semibold weight
      </ResponsiveText>
    </div>
  );
}

/**
 * Example 4: Touch-Optimized Buttons
 * 
 * Shows how to use touch-optimized buttons for tablet/mobile.
 */
import { TouchOptimizedButton } from '../shared/TouchOptimizedButton';
import { Archive, Pin, Star } from 'lucide-react';

export function TouchButtonExample() {
  return (
    <div className="p-6 flex gap-4">
      <TouchOptimizedButton
        icon={Archive}
        label="Archive"
        onClick={() => console.log('Archive')}
        variant="primary"
        size="medium"
      />
      
      <TouchOptimizedButton
        icon={Pin}
        label="Pin"
        onClick={() => console.log('Pin')}
        variant="secondary"
        size="medium"
        isActive={true}
      />
      
      <TouchOptimizedButton
        icon={Star}
        label="Star"
        onClick={() => console.log('Star')}
        variant="ghost"
        size="large"
      />
    </div>
  );
}

/**
 * Example 5: Context Menu (Desktop)
 * 
 * Demonstrates right-click context menu for desktop.
 */
import { ContextMenu, useContextMenu, ContextMenuItem } from '../shared/ContextMenu';
import { Trash2, Forward } from 'lucide-react';

export function ContextMenuExample() {
  const { isOpen, position, handleContextMenu, close } = useContextMenu();
  
  const menuItems: ContextMenuItem[] = [
    {
      id: 'pin',
      label: 'Pin Conversation',
      icon: Pin,
      onClick: () => console.log('Pin'),
      shortcut: 'Ctrl+Shift+P',
    },
    {
      id: 'archive',
      label: 'Archive',
      icon: Archive,
      onClick: () => console.log('Archive'),
    },
    {
      id: 'separator-1',
      label: '',
      onClick: () => {},
    },
    {
      id: 'forward',
      label: 'Forward',
      icon: Forward,
      onClick: () => console.log('Forward'),
    },
    {
      id: 'delete',
      label: 'Delete',
      icon: Trash2,
      onClick: () => console.log('Delete'),
      danger: true,
    },
  ];
  
  return (
    <div className="p-6">
      <div
        onContextMenu={handleContextMenu}
        className="p-8 bg-gray-100 rounded-lg cursor-pointer"
      >
        Right-click here to open context menu
      </div>
      
      <ContextMenu
        isOpen={isOpen}
        position={position}
        items={menuItems}
        onClose={close}
      />
    </div>
  );
}

/**
 * Example 6: Swipeable Items (Mobile)
 * 
 * Shows how to add swipe gestures to conversation items.
 */
import { SwipeableConversationItem } from '../shared/SwipeableConversationItem';

export function SwipeableExample() {
  return (
    <div className="p-6">
      <SwipeableConversationItem
        onPin={() => console.log('Pin')}
        onArchive={() => console.log('Archive')}
        isPinned={false}
      >
        <div className="p-4 bg-white rounded-lg shadow">
          <h3 className="font-semibold">John Doe</h3>
          <p className="text-sm text-gray-600">Last message preview...</p>
          <p className="text-xs text-gray-400 mt-1">Swipe left to archive, right to pin</p>
        </div>
      </SwipeableConversationItem>
    </div>
  );
}

/**
 * Example 7: Hover Card (Desktop)
 * 
 * Demonstrates hover effects for desktop interactions.
 */
import { HoverCard, HoverEffects } from '../shared/HoverCard';

export function HoverCardExample() {
  return (
    <div className="p-6 space-y-4">
      <HoverCard
        onClick={() => console.log('Clicked')}
        {...HoverEffects.subtle}
      >
        <div className="p-4 bg-white rounded-lg shadow">
          <h3 className="font-semibold">Subtle Hover Effect</h3>
          <p className="text-sm text-gray-600">Minimal scale and no elevation</p>
        </div>
      </HoverCard>
      
      <HoverCard
        onClick={() => console.log('Clicked')}
        {...HoverEffects.moderate}
      >
        <div className="p-4 bg-white rounded-lg shadow">
          <h3 className="font-semibold">Moderate Hover Effect</h3>
          <p className="text-sm text-gray-600">Medium scale with elevation</p>
        </div>
      </HoverCard>
      
      <HoverCard
        onClick={() => console.log('Clicked')}
        isSelected={true}
        {...HoverEffects.pronounced}
      >
        <div className="p-4 bg-white rounded-lg shadow">
          <h3 className="font-semibold">Pronounced Hover Effect (Selected)</h3>
          <p className="text-sm text-gray-600">Large scale with elevation</p>
        </div>
      </HoverCard>
    </div>
  );
}

/**
 * Example 8: Using the Typography Hook
 * 
 * Shows how to use the responsive typography hook for custom styling.
 */
import { useResponsiveTypography } from '@/lib/design-system/responsive-typography';

export function TypographyHookExample() {
  const { deviceSize, getFontSize, getTypographyStyle } = useResponsiveTypography();
  
  const headingStyle = getTypographyStyle('2xl', 'bold');
  const bodyStyle = getTypographyStyle('base', 'normal');
  
  return (
    <div className="p-6 space-y-4">
      <div className="p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-600">
          Current device size: <strong>{deviceSize}</strong>
        </p>
      </div>
      
      <h2 style={headingStyle}>
        Dynamic Heading (Font size: {getFontSize('2xl')})
      </h2>
      
      <p style={bodyStyle}>
        This text uses the typography hook to get responsive styles.
        The font size automatically adjusts based on the device size.
      </p>
    </div>
  );
}

/**
 * Example 9: Complete Integration
 * 
 * Shows a complete example with all responsive features.
 */
export function CompleteResponsiveExample() {
  return (
    <MessagingProvider>
      <MessagingLayout language="en" direction="ltr">
        <ResponsiveMessagingContainer />
      </MessagingLayout>
    </MessagingProvider>
  );
}

// Export all examples
export default {
  BasicResponsiveExample,
  RTLResponsiveExample,
  TypographyExample,
  TouchButtonExample,
  ContextMenuExample,
  SwipeableExample,
  HoverCardExample,
  TypographyHookExample,
  CompleteResponsiveExample,
};
