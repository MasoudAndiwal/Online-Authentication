'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import {
  prefersReducedMotion,
  supportsHover,
  isMobileDevice,
  getOptimalDuration,
} from '@/lib/utils/animation-utils'

/**
 * Optimized Animation Hook
 * Provides animation utilities with performance optimization
 * and accessibility support
 */

export function useOptimizedAnimation() {
  const [reducedMotion, setReducedMotion] = useState(false)
  const [hasHover, setHasHover] = useState(true)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // Check user preferences
    setReducedMotion(prefersReducedMotion())
    setHasHover(supportsHover())
    setIsMobile(isMobileDevice())

    // Listen for changes in motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const handleChange = (e: MediaQueryListEvent) => {
      setReducedMotion(e.matches)
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  const shouldAnimate = !reducedMotion
  const shouldHover = hasHover && !isMobile

  const getDuration = useCallback(
    (baseDuration: number) => getOptimalDuration(baseDuration),
    []
  )

  return {
    shouldAnimate,
    shouldHover,
    reducedMotion,
    hasHover,
    isMobile,
    getDuration,
  }
}

/**
 * Intersection Animation Hook
 * Triggers animations when element enters viewport
 */

interface UseIntersectionAnimationOptions {
  threshold?: number
  rootMargin?: string
  triggerOnce?: boolean
  animationClass?: string
}

export function useIntersectionAnimation(
  options: UseIntersectionAnimationOptions = {}
) {
  const {
    threshold = 0.1,
    rootMargin = '50px',
    triggerOnce = true,
    animationClass = 'animate-fade-in',
  } = options

  const [isVisible, setIsVisible] = useState(false)
  const [ref, setRef] = useState<Element | null>(null)
  const { shouldAnimate } = useOptimizedAnimation()

  useEffect(() => {
    if (!ref || !shouldAnimate) {
      setIsVisible(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          entry.target.classList.add(animationClass)

          if (triggerOnce) {
            observer.disconnect()
          }
        } else if (!triggerOnce) {
          setIsVisible(false)
          entry.target.classList.remove(animationClass)
        }
      },
      { threshold, rootMargin }
    )

    observer.observe(ref)

    return () => observer.disconnect()
  }, [ref, threshold, rootMargin, triggerOnce, animationClass, shouldAnimate])

  return { isVisible, ref: setRef }
}

/**
 * Staggered List Animation Hook
 * Animates list items with staggered delays
 */

interface UseStaggeredListOptions {
  itemCount: number
  staggerDelay?: number
  initialDelay?: number
  animationClass?: string
}

export function useStaggeredList(options: UseStaggeredListOptions) {
  const {
    itemCount,
    staggerDelay = 50,
    initialDelay = 0,
    animationClass = 'animate-fade-in-stagger',
  } = options

  const [visibleItems, setVisibleItems] = useState<Set<number>>(new Set())
  const { shouldAnimate, getDuration } = useOptimizedAnimation()

  useEffect(() => {
    if (!shouldAnimate) {
      // Show all items immediately if animations are disabled
      setVisibleItems(new Set(Array.from({ length: itemCount }, (_, i) => i)))
      return
    }

    const timers: NodeJS.Timeout[] = []

    for (let i = 0; i < itemCount; i++) {
      const delay = getDuration(initialDelay + i * staggerDelay)
      const timer = setTimeout(() => {
        setVisibleItems((prev) => new Set([...prev, i]))
      }, delay)
      timers.push(timer)
    }

    return () => {
      timers.forEach(clearTimeout)
    }
  }, [itemCount, staggerDelay, initialDelay, shouldAnimate, getDuration])

  const getItemProps = useCallback(
    (index: number) => ({
      className: visibleItems.has(index) ? animationClass : 'opacity-0',
      'data-index': index,
    }),
    [visibleItems, animationClass]
  )

  return { getItemProps, allVisible: visibleItems.size === itemCount }
}

/**
 * Hover Animation Hook
 * Provides hover state with mobile detection
 */

export function useHoverAnimation() {
  const [isHovered, setIsHovered] = useState(false)
  const { shouldHover } = useOptimizedAnimation()

  const hoverProps = shouldHover
    ? {
        onMouseEnter: () => setIsHovered(true),
        onMouseLeave: () => setIsHovered(false),
      }
    : {}

  return { isHovered: shouldHover && isHovered, hoverProps }
}

/**
 * Animation Frame Hook
 * Throttles updates to animation frames for performance
 */

export function useAnimationFrame(callback: (deltaTime: number) => void) {
  const requestRef = useRef<number>()
  const previousTimeRef = useRef<number>()
  const { shouldAnimate } = useOptimizedAnimation()

  const animate = useCallback(
    (time: number) => {
      if (previousTimeRef.current !== undefined) {
        const deltaTime = time - previousTimeRef.current
        callback(deltaTime)
      }
      previousTimeRef.current = time
      requestRef.current = requestAnimationFrame(animate)
    },
    [callback]
  )

  useEffect(() => {
    if (!shouldAnimate) return

    requestRef.current = requestAnimationFrame(animate)
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current)
      }
    }
  }, [animate, shouldAnimate])
}

/**
 * Scroll Animation Hook
 * Triggers animations based on scroll position
 */

interface UseScrollAnimationOptions {
  threshold?: number
  animationClass?: string
}

export function useScrollAnimation(options: UseScrollAnimationOptions = {}) {
  const { threshold = 100, animationClass = 'animate-slide-in-up' } = options

  const [isScrolled, setIsScrolled] = useState(false)
  const { shouldAnimate } = useOptimizedAnimation()

  useEffect(() => {
    if (!shouldAnimate) {
      setIsScrolled(true)
      return
    }

    const handleScroll = () => {
      const scrolled = window.scrollY > threshold
      setIsScrolled(scrolled)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll() // Check initial state

    return () => window.removeEventListener('scroll', handleScroll)
  }, [threshold, shouldAnimate])

  return {
    isScrolled,
    className: isScrolled ? animationClass : 'opacity-0',
  }
}

/**
 * Count Up Animation Hook
 * Animates numbers counting up
 */

interface UseCountUpOptions {
  end: number
  duration?: number
  start?: number
  decimals?: number
}

export function useCountUp(options: UseCountUpOptions) {
  const { end, duration = 2000, start = 0, decimals = 0 } = options

  const [count, setCount] = useState(start)
  const { shouldAnimate, getDuration } = useOptimizedAnimation()

  useEffect(() => {
    if (!shouldAnimate) {
      setCount(end)
      return
    }

    const animDuration = getDuration(duration)
    const startTime = Date.now()
    const range = end - start

    const updateCount = () => {
      const now = Date.now()
      const progress = Math.min((now - startTime) / animDuration, 1)

      // Easing function (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3)
      const current = start + range * easeOut

      setCount(Number(current.toFixed(decimals)))

      if (progress < 1) {
        requestAnimationFrame(updateCount)
      }
    }

    requestAnimationFrame(updateCount)
  }, [end, start, duration, decimals, shouldAnimate, getDuration])

  return count
}
