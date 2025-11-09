/**
 * Touch Gestures Hook
 * Provides touch-optimized interactions and gesture support for mobile devices
 */

import * as React from 'react';

export interface TouchGestureOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onTap?: () => void;
  onLongPress?: () => void;
  swipeThreshold?: number;
  longPressDelay?: number;
  enabled?: boolean;
}

export interface TouchGestureHandlers {
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchMove: (e: React.TouchEvent) => void;
  onTouchEnd: (e: React.TouchEvent) => void;
  onTouchCancel: (e: React.TouchEvent) => void;
}

interface TouchState {
  startX: number;
  startY: number;
  startTime: number;
  currentX: number;
  currentY: number;
  isSwiping: boolean;
}

export function useTouchGestures(options: TouchGestureOptions): TouchGestureHandlers {
  const {
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    onTap,
    onLongPress,
    swipeThreshold = 50,
    longPressDelay = 500,
    enabled = true,
  } = options;

  const touchState = React.useRef<TouchState>({
    startX: 0,
    startY: 0,
    startTime: 0,
    currentX: 0,
    currentY: 0,
    isSwiping: false,
  });

  const longPressTimer = React.useRef<NodeJS.Timeout | null>(null);

  const handleTouchStart = React.useCallback(
    (e: React.TouchEvent) => {
      if (!enabled) return;

      const touch = e.touches[0];
      touchState.current = {
        startX: touch.clientX,
        startY: touch.clientY,
        startTime: Date.now(),
        currentX: touch.clientX,
        currentY: touch.clientY,
        isSwiping: false,
      };

      // Start long press timer
      if (onLongPress) {
        longPressTimer.current = setTimeout(() => {
          if (!touchState.current.isSwiping) {
            onLongPress();
          }
        }, longPressDelay);
      }
    },
    [enabled, onLongPress, longPressDelay]
  );

  const handleTouchMove = React.useCallback(
    (e: React.TouchEvent) => {
      if (!enabled) return;

      const touch = e.touches[0];
      touchState.current.currentX = touch.clientX;
      touchState.current.currentY = touch.clientY;

      const deltaX = Math.abs(touch.clientX - touchState.current.startX);
      const deltaY = Math.abs(touch.clientY - touchState.current.startY);

      // If moved more than 10px, consider it a swipe (not a tap)
      if (deltaX > 10 || deltaY > 10) {
        touchState.current.isSwiping = true;
        
        // Clear long press timer
        if (longPressTimer.current) {
          clearTimeout(longPressTimer.current);
          longPressTimer.current = null;
        }
      }
    },
    [enabled]
  );

  const handleTouchEnd = React.useCallback(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (e: React.TouchEvent) => {
      if (!enabled) return;

      // Clear long press timer
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
        longPressTimer.current = null;
      }

      const deltaX = touchState.current.currentX - touchState.current.startX;
      const deltaY = touchState.current.currentY - touchState.current.startY;
      const deltaTime = Date.now() - touchState.current.startTime;

      // Check for tap (quick touch with minimal movement)
      if (!touchState.current.isSwiping && deltaTime < 300 && onTap) {
        onTap();
        return;
      }

      // Check for swipe gestures
      if (touchState.current.isSwiping) {
        const absDeltaX = Math.abs(deltaX);
        const absDeltaY = Math.abs(deltaY);

        // Horizontal swipe
        if (absDeltaX > absDeltaY && absDeltaX > swipeThreshold) {
          if (deltaX > 0 && onSwipeRight) {
            onSwipeRight();
          } else if (deltaX < 0 && onSwipeLeft) {
            onSwipeLeft();
          }
        }
        // Vertical swipe
        else if (absDeltaY > absDeltaX && absDeltaY > swipeThreshold) {
          if (deltaY > 0 && onSwipeDown) {
            onSwipeDown();
          } else if (deltaY < 0 && onSwipeUp) {
            onSwipeUp();
          }
        }
      }

      // Reset state
      touchState.current = {
        startX: 0,
        startY: 0,
        startTime: 0,
        currentX: 0,
        currentY: 0,
        isSwiping: false,
      };
    },
    [enabled, onTap, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, swipeThreshold]
  );

  const handleTouchCancel = React.useCallback(() => {
    // Clear long press timer
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }

    // Reset state
    touchState.current = {
      startX: 0,
      startY: 0,
      startTime: 0,
      currentX: 0,
      currentY: 0,
      isSwiping: false,
    };
  }, []);

  return {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
    onTouchCancel: handleTouchCancel,
  };
}

/**
 * Hook to detect if device supports touch
 */
export function useIsTouchDevice(): boolean {
  const [isTouch, setIsTouch] = React.useState(false);

  React.useEffect(() => {
    const checkTouch = () => {
      setIsTouch(
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        // @ts-expect-error - msMaxTouchPoints is not in TypeScript types
        navigator.msMaxTouchPoints > 0
      );
    };

    checkTouch();
  }, []);

  return isTouch;
}

/**
 * Hook for haptic feedback on supported devices
 */
export function useHapticFeedback() {
  const vibrate = React.useCallback((pattern: number | number[] = 10) => {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  }, []);

  const lightTap = React.useCallback(() => vibrate(10), [vibrate]);
  const mediumTap = React.useCallback(() => vibrate(20), [vibrate]);
  const heavyTap = React.useCallback(() => vibrate(30), [vibrate]);
  const success = React.useCallback(() => vibrate([10, 50, 10]), [vibrate]);
  const error = React.useCallback(() => vibrate([20, 100, 20]), [vibrate]);

  return {
    vibrate,
    lightTap,
    mediumTap,
    heavyTap,
    success,
    error,
  };
}
