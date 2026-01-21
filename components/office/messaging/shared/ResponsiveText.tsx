/**
 * ResponsiveText Component
 * 
 * Text component that automatically scales font size based on device size.
 * Ensures optimal readability across all screen sizes.
 * 
 * Requirements: 21.4
 */

'use client';

import React from 'react';
import { 
  TypographyScale, 
  fontWeights,
  typographyClasses,
  useResponsiveTypography 
} from '@/lib/design-system/responsive-typography';

interface ResponsiveTextProps {
  children: React.ReactNode;
  scale?: TypographyScale;
  weight?: keyof typeof fontWeights;
  className?: string;
  as?: 'p' | 'span' | 'div' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  style?: React.CSSProperties;
}

export function ResponsiveText({
  children,
  scale = 'base',
  weight = 'normal',
  className = '',
  as: Component = 'p',
  style = {},
}: ResponsiveTextProps) {
  const { getTypographyStyle } = useResponsiveTypography();

  const typographyStyle = getTypographyStyle(scale, weight);

  return (
    <Component
      className={`${typographyClasses[scale]} ${className}`}
      style={{
        ...typographyStyle,
        ...style,
      }}
    >
      {children}
    </Component>
  );
}

// Preset components for common text styles
export function Heading1({ children, className = '', ...props }: Omit<ResponsiveTextProps, 'scale' | 'as'>) {
  return (
    <ResponsiveText scale="4xl" weight="bold" as="h1" className={className} {...props}>
      {children}
    </ResponsiveText>
  );
}

export function Heading2({ children, className = '', ...props }: Omit<ResponsiveTextProps, 'scale' | 'as'>) {
  return (
    <ResponsiveText scale="3xl" weight="bold" as="h2" className={className} {...props}>
      {children}
    </ResponsiveText>
  );
}

export function Heading3({ children, className = '', ...props }: Omit<ResponsiveTextProps, 'scale' | 'as'>) {
  return (
    <ResponsiveText scale="2xl" weight="semibold" as="h3" className={className} {...props}>
      {children}
    </ResponsiveText>
  );
}

export function Heading4({ children, className = '', ...props }: Omit<ResponsiveTextProps, 'scale' | 'as'>) {
  return (
    <ResponsiveText scale="xl" weight="semibold" as="h4" className={className} {...props}>
      {children}
    </ResponsiveText>
  );
}

export function BodyText({ children, className = '', ...props }: Omit<ResponsiveTextProps, 'scale' | 'as'>) {
  return (
    <ResponsiveText scale="base" weight="normal" as="p" className={className} {...props}>
      {children}
    </ResponsiveText>
  );
}

export function SmallText({ children, className = '', ...props }: Omit<ResponsiveTextProps, 'scale' | 'as'>) {
  return (
    <ResponsiveText scale="sm" weight="normal" as="span" className={className} {...props}>
      {children}
    </ResponsiveText>
  );
}

export function Caption({ children, className = '', ...props }: Omit<ResponsiveTextProps, 'scale' | 'as'>) {
  return (
    <ResponsiveText scale="xs" weight="normal" as="span" className={className} {...props}>
      {children}
    </ResponsiveText>
  );
}
