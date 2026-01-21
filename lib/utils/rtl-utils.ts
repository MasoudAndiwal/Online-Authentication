/**
 * RTL/LTR Layout Utilities
 * 
 * Utility functions and classes for handling RTL/LTR layout adjustments.
 * Provides direction-specific styling, icon handling, and layout helpers.
 * 
 * Requirements: 25.2, 25.3, 25.6, 25.8, 25.10
 */

import type { TextDirection } from '@/types/office/messaging';

// ============================================================================
// Direction-Specific Padding and Margins
// ============================================================================

/**
 * Get direction-specific padding
 * Automatically flips left/right padding based on text direction
 */
export function getDirectionalPadding(
  direction: TextDirection,
  start: string,
  end: string,
  top?: string,
  bottom?: string
): string {
  const vertical = top && bottom ? `${top} ` : '';
  
  if (direction === 'rtl') {
    return `${vertical}${end} ${start}`.trim();
  }
  return `${vertical}${start} ${end}`.trim();
}

/**
 * Get direction-specific margin
 * Automatically flips left/right margin based on text direction
 */
export function getDirectionalMargin(
  direction: TextDirection,
  start: string,
  end: string,
  top?: string,
  bottom?: string
): string {
  const vertical = top && bottom ? `${top} ` : '';
  
  if (direction === 'rtl') {
    return `${vertical}${end} ${start}`.trim();
  }
  return `${vertical}${start} ${end}`.trim();
}

/**
 * Get padding-start (left in LTR, right in RTL)
 */
export function getPaddingStart(direction: TextDirection, value: string): Record<string, string> {
  return direction === 'rtl' 
    ? { paddingRight: value }
    : { paddingLeft: value };
}

/**
 * Get padding-end (right in LTR, left in RTL)
 */
export function getPaddingEnd(direction: TextDirection, value: string): Record<string, string> {
  return direction === 'rtl'
    ? { paddingLeft: value }
    : { paddingRight: value };
}

/**
 * Get margin-start (left in LTR, right in RTL)
 */
export function getMarginStart(direction: TextDirection, value: string): Record<string, string> {
  return direction === 'rtl'
    ? { marginRight: value }
    : { marginLeft: value };
}

/**
 * Get margin-end (right in LTR, left in RTL)
 */
export function getMarginEnd(direction: TextDirection, value: string): Record<string, string> {
  return direction === 'rtl'
    ? { marginLeft: value }
    : { marginRight: value };
}

// ============================================================================
// Text Alignment
// ============================================================================

/**
 * Get text alignment based on direction
 */
export function getTextAlign(direction: TextDirection): 'left' | 'right' {
  return direction === 'rtl' ? 'right' : 'left';
}

/**
 * Get opposite text alignment
 */
export function getOppositeTextAlign(direction: TextDirection): 'left' | 'right' {
  return direction === 'rtl' ? 'left' : 'right';
}

// ============================================================================
// Flex Direction
// ============================================================================

/**
 * Get flex direction for RTL/LTR
 * Flips row to row-reverse for RTL
 */
export function getFlexDirection(
  direction: TextDirection,
  baseDirection: 'row' | 'column' = 'row'
): 'row' | 'row-reverse' | 'column' | 'column-reverse' {
  if (baseDirection === 'column') {
    return 'column';
  }
  return direction === 'rtl' ? 'row-reverse' : 'row';
}

// ============================================================================
// Icon Handling
// ============================================================================

/**
 * Icons that should NOT flip in RTL
 * These icons are universally recognized and should maintain their orientation
 */
const NO_FLIP_ICONS = [
  'search',
  'close',
  'x',
  'check',
  'checkmark',
  'plus',
  'add',
  'minus',
  'remove',
  'settings',
  'gear',
  'user',
  'users',
  'bell',
  'notification',
  'calendar',
  'clock',
  'time',
  'phone',
  'email',
  'mail',
  'attachment',
  'paperclip',
  'download',
  'upload',
  'star',
  'heart',
  'thumbs-up',
  'thumbs-down',
];

/**
 * Icons that SHOULD flip in RTL
 * These icons have directional meaning
 */
const FLIP_ICONS = [
  'arrow-left',
  'arrow-right',
  'chevron-left',
  'chevron-right',
  'caret-left',
  'caret-right',
  'angle-left',
  'angle-right',
  'back',
  'forward',
  'next',
  'previous',
  'undo',
  'redo',
  'reply',
  'share',
  'send',
  'enter',
  'exit',
  'logout',
  'login',
];

/**
 * Check if an icon should flip in RTL
 */
export function shouldFlipIcon(iconName: string): boolean {
  const normalizedName = iconName.toLowerCase().trim();
  
  // Check if explicitly in no-flip list
  if (NO_FLIP_ICONS.includes(normalizedName)) {
    return false;
  }
  
  // Check if explicitly in flip list
  if (FLIP_ICONS.includes(normalizedName)) {
    return true;
  }
  
  // Default: flip if contains directional keywords
  const directionalKeywords = ['left', 'right', 'arrow', 'chevron', 'caret', 'angle'];
  return directionalKeywords.some(keyword => normalizedName.includes(keyword));
}

/**
 * Get icon transform for RTL
 */
export function getIconTransform(direction: TextDirection, iconName: string): string {
  if (direction === 'rtl' && shouldFlipIcon(iconName)) {
    return 'scaleX(-1)';
  }
  return 'none';
}

/**
 * Get icon style for RTL
 */
export function getIconStyle(direction: TextDirection, iconName: string): React.CSSProperties {
  return {
    transform: getIconTransform(direction, iconName),
  };
}

// ============================================================================
// Message Bubble Alignment
// ============================================================================

/**
 * Get message bubble alignment styles
 * Sent messages align to end, received messages align to start
 */
export function getMessageBubbleAlignment(
  direction: TextDirection,
  isSent: boolean
): React.CSSProperties {
  if (isSent) {
    // Sent messages: align to end (right in LTR, left in RTL)
    return direction === 'rtl'
      ? { marginRight: 'auto', marginLeft: '0' }
      : { marginLeft: 'auto', marginRight: '0' };
  } else {
    // Received messages: align to start (left in LTR, right in RTL)
    return direction === 'rtl'
      ? { marginLeft: 'auto', marginRight: '0' }
      : { marginRight: 'auto', marginLeft: '0' };
  }
}

/**
 * Get message bubble border radius
 * Adjusts the "tail" corner based on direction and sender
 */
export function getMessageBubbleBorderRadius(
  direction: TextDirection,
  isSent: boolean
): React.CSSProperties {
  const baseRadius = '1rem';
  const tailRadius = '0.25rem';
  
  if (isSent) {
    // Sent messages: tail on end side
    return direction === 'rtl'
      ? {
          borderTopLeftRadius: baseRadius,
          borderTopRightRadius: baseRadius,
          borderBottomRightRadius: baseRadius,
          borderBottomLeftRadius: tailRadius,
        }
      : {
          borderTopLeftRadius: baseRadius,
          borderTopRightRadius: baseRadius,
          borderBottomLeftRadius: baseRadius,
          borderBottomRightRadius: tailRadius,
        };
  } else {
    // Received messages: tail on start side
    return direction === 'rtl'
      ? {
          borderTopLeftRadius: baseRadius,
          borderTopRightRadius: baseRadius,
          borderBottomLeftRadius: baseRadius,
          borderBottomRightRadius: tailRadius,
        }
      : {
          borderTopLeftRadius: baseRadius,
          borderTopRightRadius: baseRadius,
          borderBottomRightRadius: baseRadius,
          borderBottomLeftRadius: tailRadius,
        };
  }
}

// ============================================================================
// Position Utilities
// ============================================================================

/**
 * Get position for start side (left in LTR, right in RTL)
 */
export function getPositionStart(direction: TextDirection, value: string): Record<string, string> {
  return direction === 'rtl'
    ? { right: value }
    : { left: value };
}

/**
 * Get position for end side (right in LTR, left in RTL)
 */
export function getPositionEnd(direction: TextDirection, value: string): Record<string, string> {
  return direction === 'rtl'
    ? { left: value }
    : { right: value };
}

// ============================================================================
// Transform Utilities
// ============================================================================

/**
 * Get translateX value for direction
 * Flips the sign for RTL
 */
export function getTranslateX(direction: TextDirection, value: number): string {
  const adjustedValue = direction === 'rtl' ? -value : value;
  return `translateX(${adjustedValue}px)`;
}

// ============================================================================
// Slide Direction
// ============================================================================

/**
 * Get slide-in direction for panels
 * Panels slide from end side (right in LTR, left in RTL)
 */
export function getSlideDirection(direction: TextDirection): 'left' | 'right' {
  return direction === 'rtl' ? 'left' : 'right';
}

/**
 * Get initial slide position for animations
 */
export function getSlideInitialPosition(direction: TextDirection, distance: number = 300): number {
  return direction === 'rtl' ? -distance : distance;
}

// ============================================================================
// Tailwind CSS Classes
// ============================================================================

/**
 * Get Tailwind direction-specific classes
 */
export function getDirectionalClasses(direction: TextDirection): {
  textAlign: string;
  paddingStart: string;
  paddingEnd: string;
  marginStart: string;
  marginEnd: string;
  borderStart: string;
  borderEnd: string;
} {
  if (direction === 'rtl') {
    return {
      textAlign: 'text-right',
      paddingStart: 'pr',
      paddingEnd: 'pl',
      marginStart: 'mr',
      marginEnd: 'ml',
      borderStart: 'border-r',
      borderEnd: 'border-l',
    };
  }
  
  return {
    textAlign: 'text-left',
    paddingStart: 'pl',
    paddingEnd: 'pr',
    marginStart: 'ml',
    marginEnd: 'mr',
    borderStart: 'border-l',
    borderEnd: 'border-r',
  };
}

// ============================================================================
// Component Wrapper
// ============================================================================

/**
 * Get container styles that respect text direction
 */
export function getDirectionalContainerStyles(direction: TextDirection): React.CSSProperties {
  return {
    direction,
    textAlign: getTextAlign(direction),
  };
}

// ============================================================================
// Export all utilities
// ============================================================================

export const rtlUtils = {
  getDirectionalPadding,
  getDirectionalMargin,
  getPaddingStart,
  getPaddingEnd,
  getMarginStart,
  getMarginEnd,
  getTextAlign,
  getOppositeTextAlign,
  getFlexDirection,
  shouldFlipIcon,
  getIconTransform,
  getIconStyle,
  getMessageBubbleAlignment,
  getMessageBubbleBorderRadius,
  getPositionStart,
  getPositionEnd,
  getTranslateX,
  getSlideDirection,
  getSlideInitialPosition,
  getDirectionalClasses,
  getDirectionalContainerStyles,
};
