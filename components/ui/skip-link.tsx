/**
 * Skip Link Component for Keyboard Navigation
 * Allows keyboard users to skip to main content
 */

import * as React from 'react';
import { cn } from '@/lib/utils';

interface SkipLinkProps {
  href: string;
  children?: React.ReactNode;
  className?: string;
}

export function SkipLink({ 
  href, 
  children = 'Skip to main content',
  className 
}: SkipLinkProps) {
  return (
    <a
      href={href}
      className={cn(
        // Hidden by default
        'sr-only',
        // Visible when focused
        'focus:not-sr-only',
        'focus:absolute',
        'focus:top-4',
        'focus:left-4',
        'focus:z-[9999]',
        'focus:px-6',
        'focus:py-3',
        'focus:bg-orange-600',
        'focus:text-white',
        'focus:rounded-xl',
        'focus:shadow-2xl',
        'focus:shadow-orange-500/50',
        'focus:font-semibold',
        'focus:outline-none',
        'focus:ring-4',
        'focus:ring-orange-300',
        'focus:ring-offset-2',
        'transition-all',
        'duration-200',
        className
      )}
    >
      {children}
    </a>
  );
}

/**
 * Multiple skip links for complex layouts
 */
interface SkipLinksProps {
  links: Array<{
    href: string;
    label: string;
  }>;
  className?: string;
}

export function SkipLinks({ links, className }: SkipLinksProps) {
  return (
    <nav 
      aria-label="Skip navigation links"
      className={cn('sr-only focus-within:not-sr-only', className)}
    >
      <ul className="flex flex-col gap-2">
        {links.map((link) => (
          <li key={link.href}>
            <SkipLink href={link.href}>
              {link.label}
            </SkipLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
