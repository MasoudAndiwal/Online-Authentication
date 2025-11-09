/**
 * Custom hook for screen reader announcements
 */

import { useEffect, useRef, useCallback } from 'react';
import { announceToScreenReader, createLiveRegion } from '@/lib/utils/accessibility';

interface UseScreenReaderAnnouncementsOptions {
  priority?: 'polite' | 'assertive';
}

export function useScreenReaderAnnouncements({
  priority = 'polite',
}: UseScreenReaderAnnouncementsOptions = {}) {
  const liveRegionRef = useRef<ReturnType<typeof createLiveRegion> | null>(null);

  useEffect(() => {
    // Create live region on mount
    liveRegionRef.current = createLiveRegion(priority);

    return () => {
      // Cleanup on unmount
      liveRegionRef.current?.destroy();
    };
  }, [priority]);

  const announce = useCallback((message: string, urgency?: 'polite' | 'assertive') => {
    if (urgency && urgency !== priority) {
      // Use one-off announcement for different priority
      announceToScreenReader(message, urgency);
    } else {
      // Use persistent live region
      liveRegionRef.current?.announce(message);
    }
  }, [priority]);

  return { announce };
}
