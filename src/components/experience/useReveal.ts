import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { afterIdle, motionDisabled } from '../../lib/motion'

let pluginRegistered = false

function ensurePlugin() {
  if (!pluginRegistered && typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger)
    pluginRegistered = true
  }
}

/**
 * Cinematic reveal system, driven by data attributes inside the scope:
 *
 *   data-reveal          — element rises 40px + fades in on scroll entry
 *   data-reveal-img      — wrapper's clip-path opens from the bottom
 *                          (inset(100%) -> inset(0)) while its <img>
 *                          settles from scale 1.28 -> 1
 *   data-parallax="10"   — the wrapper's <img> drifts yPercent -10 -> 10
 *                          scrubbed across the wrapper's viewport pass
 *
 * All initial states are applied with gsap.set/fromTo INSIDE the effect —
 * never in CSS — so if GSAP fails to load, or motion is disabled, the
 * content simply sits fully visible in its natural layout.
 *
 * Returns a ref to attach to the scope element. Runs once on mount;
 * a ScrollTrigger.refresh() is issued when async page data reports ready
 * (pass a changing `refreshKey`, e.g. a boolean that flips when fetches
 * land) so trigger positions track the grown layout.
 */
export function useRevealScope<T extends HTMLElement = HTMLDivElement>(
  refreshKey?: unknown
) {
  const ref = useRef<T | null>(null)
  const firstRun = useRef(true)

  useEffect(() => {
    if (motionDisabled()) return
    const scope = ref.current
    if (!scope) return
    ensurePlugin()

    return afterIdle(() => {
    const ctx = gsap.context(() => {
      scope.querySelectorAll<HTMLElement>('[data-reveal]').forEach(el => {
        gsap.fromTo(
          el,
          { y: 44, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 1.05,
            ease: 'power3.out',
            delay: parseFloat(el.dataset.reveal || '0') || 0,
            scrollTrigger: { trigger: el, start: 'top 88%' },
          }
        )
      })

      scope.querySelectorAll<HTMLElement>('[data-reveal-img]').forEach(el => {
        const img = el.querySelector('img')
        const tl = gsap.timeline({
          scrollTrigger: { trigger: el, start: 'top 86%' },
        })
        tl.fromTo(
          el,
          { clipPath: 'inset(100% 0% 0% 0%)' },
          {
            clipPath: 'inset(0% 0% 0% 0%)',
            duration: 1.25,
            ease: 'power4.inOut',
          },
          0
        )
        if (img) {
          tl.fromTo(
            img,
            { scale: 1.28 },
            { scale: 1, duration: 1.25, ease: 'power4.inOut' },
            0
          )
        }
      })

      scope.querySelectorAll<HTMLElement>('[data-parallax]').forEach(el => {
        const img = el.querySelector('img')
        if (!img) return
        const speed = parseFloat(el.dataset.parallax || '10') || 10
        gsap.set(img, { scale: 1.18 })
        gsap.fromTo(
          img,
          { yPercent: -speed },
          {
            yPercent: speed,
            ease: 'none',
            scrollTrigger: {
              trigger: el,
              start: 'top bottom',
              end: 'bottom top',
              scrub: true,
            },
          }
        )
      })
    }, scope)

    const onLoad = () => ScrollTrigger.refresh()
    window.addEventListener('load', onLoad)

    return () => {
      window.removeEventListener('load', onLoad)
      ctx.revert()
    }
    })
  }, [])

  /* Layout above the fold grows when API data lands — recalculate only. */
  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false
      return
    }
    if (motionDisabled()) return
    ensurePlugin()
    // a full refresh re-measures every trigger: keep it off the critical path
    const ric = (window as any).requestIdleCallback as ((cb: () => void, o?: { timeout: number }) => number) | undefined
    if (ric) {
      const id = ric(() => ScrollTrigger.refresh(), { timeout: 1500 })
      return () => (window as any).cancelIdleCallback?.(id)
    }
    const id = window.setTimeout(() => ScrollTrigger.refresh(), 60)
    return () => window.clearTimeout(id)
  }, [refreshKey])

  return ref
}
