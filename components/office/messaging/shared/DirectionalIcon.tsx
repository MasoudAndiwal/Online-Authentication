/**
 * DirectionalIcon Component
 * 
 * Wrapper component for icons that automatically handles RTL/LTR flipping.
 * Icons with directional meaning (arrows, chevrons) are flipped in RTL,
 * while universal icons (search, close, check) maintain their orientation.
 * 
 * Requirements: 25.6
 */

'use client';

import React from 'react';
import { useLanguage } from '@/hooks/office/messaging/use-language';
import { shouldFlipIcon, getIconTransform } from '@/lib/utils/rtl-utils';

// ============================================================================
// Component Props
// ============================================================================

interface DirectionalIconProps {
  /**
   * The icon component to render (from lucide-react or custom)
   */
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  
  /**
   * Icon name for determining flip behavior
   * Examples: 'arrow-left', 'search', 'chevron-right'
   */
  iconName: string;
  
  /**
   * Additional CSS classes
   */
  className?: string;
  
  /**
   * Force flip behavior (overrides automatic detection)
   */
  forceFlip?: boolean;
  
  /**
   * Force no-flip behavior (overrides automatic detection)
   */
  forceNoFlip?: boolean;
  
  /**
   * Additional props to pass to the icon component
   */
  [key: string]: unknown;
}

// ============================================================================
// Component Implementation
// ============================================================================

/**
 * DirectionalIcon Component
 * 
 * Automatically flips icons in RTL mode based on their semantic meaning.
 * 
 * @example
 * // Arrow that flips in RTL
 * <DirectionalIcon icon={ArrowLeft} iconName="arrow-left" className="w-4 h-4" />
 * 
 * @example
 * // Search icon that doesn't flip
 * <DirectionalIcon icon={Search} iconName="search" className="w-4 h-4" />
 * 
 * @example
 * // Force flip behavior
 * <DirectionalIcon icon={Send} iconName="send" forceFlip className="w-4 h-4" />
 */
export function DirectionalIcon({
  icon: Icon,
  iconName,
  className = '',
  forceFlip = false,
  forceNoFlip = false,
  ...props
}: DirectionalIconProps) {
  const { direction } = useLanguage();

  // Determine if icon should flip
  let shouldFlip = shouldFlipIcon(iconName);
  
  if (forceFlip) {
    shouldFlip = true;
  } else if (forceNoFlip) {
    shouldFlip = false;
  }

  // Get transform style
  const transform = direction === 'rtl' && shouldFlip ? 'scaleX(-1)' : 'none';

  return (
    <Icon
      {...props}
      className={className}
      style={{
        transform,
        ...props.style,
      }}
    />
  );
}

// ============================================================================
// Convenience Exports
// ============================================================================

/**
 * Create a directional icon component with pre-configured icon name
 */
export function createDirectionalIcon(
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>,
  iconName: string
) {
  return function DirectionalIconWrapper(props: Omit<DirectionalIconProps, 'icon' | 'iconName'>) {
    return <DirectionalIcon icon={icon} iconName={iconName} {...props} />;
  };
}

export default DirectionalIcon;
