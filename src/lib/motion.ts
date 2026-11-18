import type Lenis from 'lenis'

/**
 * Shared motion guards + the app-wide Lenis singleton.
 *
 * Every cinematic effect in the app must funnel through `motionDisabled()`
 * so test runs, automation, and reduced-motion users always get a fully
 * static, fully visible page.
 */

export function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

export function isTestOrBot(): boolean {
  if (import.meta.env.MODE === 'test') return true
  return typeof navigator !== 'undefined' && Boolean(navigator.webdriver)
}

export function motionDisabled(): boolean {
  return prefersReducedMotion() || isTestOrBot()
}

export function hasFinePointer(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(pointer: fine)').matches
  )
}

/* ------------------------------------------------------------------ */
/* Lenis singleton (set by <SmoothScroll /> once mounted)              */
/* ------------------------------------------------------------------ */

let lenisInstance: Lenis | null = null

export function setLenis(instance: Lenis | null) {
  lenisInstance = instance
}

export function getLenis(): Lenis | null {
  return lenisInstance
}

/** Instantly return to the top of the page, via Lenis when it is live. */
export function scrollToTop() {
  if (lenisInstance) {
    lenisInstance.scrollTo(0, { immediate: true })
    return
  }
  if (typeof window !== 'undefined') {
    window.scrollTo({ top: 0, behavior: 'auto' })
  }
}
