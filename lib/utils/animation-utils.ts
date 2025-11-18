/**
 * Animation Utilities
 * Provides optimized animation helpers with hardware acceleration
 * and reduced motion support
 */

/**
 * Check if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * Get animation duration based on user preferences
 * Returns 0 if reduced motion is preferred
 */
export function getAnimationDuration(duration: number): number {
  return prefersReducedMotion() ? 0 : duration
}

/**
 * Hardware-accelerated transform classes
 * Uses transform3d for better performance
 */
export const hardwareAccelerated = {
  // Translate animations
  translateY: (value: string) => ({
    transform: `translate3d(0, ${value}, 0)`,
    willChange: 'transform',
  }),
  translateX: (value: string) => ({
    transform: `translate3d(${value}, 0, 0)`,
    willChange: 'transform',
  }),
  translate: (x: string, y: string) => ({
    transform: `translate3d(${x}, ${y}, 0)`,
    willChange: 'transform',
  }),

  // Scale animations
  scale: (value: number) => ({
    transform: `scale3d(${value}, ${value}, 1)`,
    willChange: 'transform',
  }),

  // Rotate animations
  rotate: (degrees: number) => ({
    transform: `rotate3d(0, 0, 1, ${degrees}deg)`,
    willChange: 'transform',
  }),

  // Combined transforms
  scaleAndTranslate: (scale: number, x: string, y: string) => ({
    transform: `translate3d(${x}, ${y}, 0) scale3d(${scale}, ${scale}, 1)`,
    willChange: 'transform',
  }),
}

/**
 * Optimized transition classes
 * Respects reduced motion preferences
 */
export function getTransitionClass(
  property: string = 'all',
  duration: string = '300ms',
  easing: string = 'ease-in-out'
): string {
  if (prefersReducedMotion()) {
    return 'transition-none'
  }
  return `transition-${property} duration-${duration} ${easing}`
}

/**
 * Animation timing functions optimized for 60fps
 */
export const timingFunctions = {
  // Smooth ease functions
  easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
  easeIn: 'cubic-bezier(0.4, 0, 1, 1)',

  // Spring-like animations
  spring: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  bounce: 'cubic-bezier(0.68, -0.6, 0.32, 1.6)',

  // Sharp animations
  sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',

  // Smooth animations
  smooth: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
}

/**
 * Stagger animation delays for lists
 */
export function getStaggerDelay(index: number, baseDelay: number = 50): string {
  if (prefersReducedMotion()) return '0ms'
  return `${index * baseDelay}ms`
}

/**
 * Hover effect classes with mobile detection
 */
export function getHoverClass(
  hoverClass: string,
  disableOnMobile: boolean = true
): string {
  if (disableOnMobile && typeof window !== 'undefined') {
    // Check if device supports hover
    const hasHover = window.matchMedia('(hover: hover)').matches
    return hasHover ? hoverClass : ''
  }
  return hoverClass
}

/**
 * Performance-optimized animation classes
 */
export const optimizedAnimations = {
  // Fade animations
  fadeIn: prefersReducedMotion()
    ? 'opacity-100'
    : 'animate-fade-in opacity-0',
  fadeOut: prefersReducedMotion()
    ? 'opacity-0'
    : 'animate-fade-out opacity-100',

  // Slide animations
  slideInUp: prefersReducedMotion()
    ? ''
    : 'animate-slide-in-up transform translate-y-4 opacity-0',
  slideInDown: prefersReducedMotion()
    ? ''
    : 'animate-slide-in-down transform -translate-y-4 opacity-0',
  slideInLeft: prefersReducedMotion()
    ? ''
    : 'animate-slide-in-left transform -translate-x-4 opacity-0',
  slideInRight: prefersReducedMotion()
    ? ''
    : 'animate-slide-in-right transform translate-x-4 opacity-0',

  // Scale animations
  scaleIn: prefersReducedMotion()
    ? ''
    : 'animate-scale-in transform scale-95 opacity-0',
  scaleOut: prefersReducedMotion()
    ? ''
    : 'animate-scale-out transform scale-105 opacity-100',

  // Pulse animations
  pulse: prefersReducedMotion() ? '' : 'animate-pulse',
  spin: prefersReducedMotion() ? '' : 'animate-spin',
  bounce: prefersReducedMotion() ? '' : 'animate-bounce',
}

/**
 * Create optimized keyframe animation
 */
export function createKeyframeAnimation(
  name: string,
  keyframes: Record<string, Record<string, string>>
): string {
  if (prefersReducedMotion()) return ''

  const keyframeString = Object.entries(keyframes)
    .map(([key, styles]) => {
      const styleString = Object.entries(styles)
        .map(([prop, value]) => `${prop}: ${value};`)
        .join(' ')
      return `${key} { ${styleString} }`
    })
    .join(' ')

  return `@keyframes ${name} { ${keyframeString} }`
}

/**
 * Intersection Observer animation trigger
 */
export function createIntersectionAnimation(
  element: Element,
  animationClass: string,
  options: IntersectionObserverInit = {}
): () => void {
  if (prefersReducedMotion()) {
    element.classList.add(animationClass)
    return () => {}
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add(animationClass)
        observer.unobserve(entry.target)
      }
    })
  }, options)

  observer.observe(element)

  return () => observer.disconnect()
}

/**
 * Throttle animation frame for performance
 */
export function throttleAnimationFrame<T extends (...args: any[]) => void>(
  callback: T
): (...args: Parameters<T>) => void {
  let rafId: number | null = null

  return (...args: Parameters<T>) => {
    if (rafId !== null) return

    rafId = requestAnimationFrame(() => {
      callback(...args)
      rafId = null
    })
  }
}

/**
 * Debounce for scroll/resize events
 */
export function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

/**
 * Check if device supports hover
 */
export function supportsHover(): boolean {
  if (typeof window === 'undefined') return true
  return window.matchMedia('(hover: hover)').matches
}

/**
 * Check if device is mobile
 */
export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  )
}

/**
 * Get optimal animation duration based on device
 */
export function getOptimalDuration(baseDuration: number): number {
  if (prefersReducedMotion()) return 0
  if (isMobileDevice()) return baseDuration * 0.8 // Slightly faster on mobile
  return baseDuration
}

/**
 * CSS class builder for animations
 */
export function buildAnimationClass(options: {
  base?: string
  hover?: string
  active?: string
  focus?: string
  disabled?: string
  disableHoverOnMobile?: boolean
}): string {
  const {
    base = '',
    hover = '',
    active = '',
    focus = '',
    disabled = '',
    disableHoverOnMobile = true,
  } = options

  const classes = [base]

  if (hover && (!disableHoverOnMobile || supportsHover())) {
    classes.push(hover)
  }

  if (active) classes.push(active)
  if (focus) classes.push(focus)
  if (disabled) classes.push(disabled)

  return classes.filter(Boolean).join(' ')
}
