'use client'

import { useState, useEffect, useCallback } from 'react'

/**
 * Progressive Loading Hook
 * Implements progressive loading strategy for better perceived performance
 * Loads critical content first, then secondary content
 */

interface ProgressiveLoadingOptions {
  criticalDelay?: number
  secondaryDelay?: number
  tertiaryDelay?: number
}

interface ProgressiveLoadingState {
  criticalLoaded: boolean
  secondaryLoaded: boolean
  tertiaryLoaded: boolean
  allLoaded: boolean
}

export function useProgressiveLoading(options: ProgressiveLoadingOptions = {}) {
  const {
    criticalDelay = 0,
    secondaryDelay = 100,
    tertiaryDelay = 300,
  } = options

  const [state, setState] = useState<ProgressiveLoadingState>({
    criticalLoaded: false,
    secondaryLoaded: false,
    tertiaryLoaded: false,
    allLoaded: false,
  })

  useEffect(() => {
    // Load critical content immediately
    const criticalTimer = setTimeout(() => {
      setState((prev) => ({ ...prev, criticalLoaded: true }))
    }, criticalDelay)

    // Load secondary content after delay
    const secondaryTimer = setTimeout(() => {
      setState((prev) => ({ ...prev, secondaryLoaded: true }))
    }, secondaryDelay)

    // Load tertiary content after longer delay
    const tertiaryTimer = setTimeout(() => {
      setState((prev) => ({
        ...prev,
        tertiaryLoaded: true,
        allLoaded: true,
      }))
    }, tertiaryDelay)

    return () => {
      clearTimeout(criticalTimer)
      clearTimeout(secondaryTimer)
      clearTimeout(tertiaryTimer)
    }
  }, [criticalDelay, secondaryDelay, tertiaryDelay])

  const reset = useCallback(() => {
    setState({
      criticalLoaded: false,
      secondaryLoaded: false,
      tertiaryLoaded: false,
      allLoaded: false,
    })
  }, [])

  return { ...state, reset }
}

/**
 * Intersection Observer Hook for Lazy Loading
 * Loads content when it enters the viewport
 */

interface UseIntersectionObserverOptions {
  threshold?: number
  rootMargin?: string
  triggerOnce?: boolean
}

export function useIntersectionObserver(
  options: UseIntersectionObserverOptions = {}
) {
  const { threshold = 0.1, rootMargin = '50px', triggerOnce = true } = options

  const [isIntersecting, setIsIntersecting] = useState(false)
  const [node, setNode] = useState<Element | null>(null)

  useEffect(() => {
    if (!node) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isVisible = entry.isIntersecting

        if (isVisible) {
          setIsIntersecting(true)
          if (triggerOnce) {
            observer.disconnect()
          }
        } else if (!triggerOnce) {
          setIsIntersecting(false)
        }
      },
      { threshold, rootMargin }
    )

    observer.observe(node)

    return () => {
      observer.disconnect()
    }
  }, [node, threshold, rootMargin, triggerOnce])

  return { isIntersecting, ref: setNode }
}

/**
 * Preload Hook
 * Preloads resources in the background
 */

export function usePreload() {
  const preloadImage = useCallback((src: string) => {
    return new Promise<void>((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve()
      img.onerror = reject
      img.src = src
    })
  }, [])

  const preloadImages = useCallback(async (sources: string[]) => {
    try {
      await Promise.all(sources.map(preloadImage))
      return true
    } catch (error) {
      console.error('Failed to preload images:', error)
      return false
    }
  }, [preloadImage])

  const preloadComponent = useCallback(async (importFn: () => Promise<any>) => {
    try {
      await importFn()
      return true
    } catch (error) {
      console.error('Failed to preload component:', error)
      return false
    }
  }, [])

  return { preloadImage, preloadImages, preloadComponent }
}

/**
 * Staggered Animation Hook
 * Creates staggered animations for list items
 */

interface UseStaggeredAnimationOptions {
  itemCount: number
  staggerDelay?: number
  initialDelay?: number
}

export function useStaggeredAnimation(options: UseStaggeredAnimationOptions) {
  const { itemCount, staggerDelay = 50, initialDelay = 0 } = options

  const [visibleItems, setVisibleItems] = useState<Set<number>>(new Set())

  useEffect(() => {
    const timers: NodeJS.Timeout[] = []

    for (let i = 0; i < itemCount; i++) {
      const delay = initialDelay + i * staggerDelay
      const timer = setTimeout(() => {
        setVisibleItems((prev) => new Set([...prev, i]))
      }, delay)
      timers.push(timer)
    }

    return () => {
      timers.forEach(clearTimeout)
    }
  }, [itemCount, staggerDelay, initialDelay])

  const isVisible = useCallback(
    (index: number) => visibleItems.has(index),
    [visibleItems]
  )

  const reset = useCallback(() => {
    setVisibleItems(new Set())
  }, [])

  return { isVisible, reset, allVisible: visibleItems.size === itemCount }
}

/**
 * Debounced Loading Hook
 * Prevents loading flicker for fast operations
 */

export function useDebouncedLoading(isLoading: boolean, delay: number = 200) {
  const [debouncedLoading, setDebouncedLoading] = useState(false)

  useEffect(() => {
    if (isLoading) {
      // Show loading immediately
      setDebouncedLoading(true)
    } else {
      // Delay hiding loading to prevent flicker
      const timer = setTimeout(() => {
        setDebouncedLoading(false)
      }, delay)

      return () => clearTimeout(timer)
    }
  }, [isLoading, delay])

  return debouncedLoading
}
