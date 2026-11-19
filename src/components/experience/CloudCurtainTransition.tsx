import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import gsap from 'gsap'
import { motionDisabled, scrollToTop } from '../../lib/motion'
import { cloud, getCloudWorld, veilIn, veilOut, veilSnap } from './cloud/cloudState'

/**
 * Page transitions through the cloud world.
 * Live: clicking an internal link rolls the painted veil in (~170ms) while the
 * route (often a lazy chunk) loads; once the new page has rendered the clouds
 * part from the centre. Back/forward navigations start already clouded.
 * Fallback (no WebGL / before the world has loaded): a painted CSS curtain.
 * Reduced motion / tests: instant.
 */
export function CloudCurtainTransition() {
  const location = useLocation()
  const curtainRef = useRef<HTMLDivElement | null>(null)
  const firstRender = useRef(true)
  const clickedAt = useRef(0)

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
      const a = (e.target as Element | null)?.closest?.('a[href]') as HTMLAnchorElement | null
      if (!a || (a.target && a.target !== '_self') || a.hasAttribute('download')) return
      let url: URL
      try {
        url = new URL(a.href)
      } catch {
        return
      }
      if (url.origin !== window.location.origin || url.pathname === window.location.pathname) return
      if (!getCloudWorld() || cloud.overlay || motionDisabled()) return
      veilIn(6)
      clickedAt.current = performance.now()
    }
    document.addEventListener('click', onClick, true)
    return () => document.removeEventListener('click', onClick, true)
  }, [])

  useEffect(() => {
    scrollToTop()

    if (firstRender.current) {
      firstRender.current = false
      return
    }
    if (motionDisabled()) return

    if (getCloudWorld()) {
      const since = performance.now() - clickedAt.current
      if (since < 2000) {
        clickedAt.current = 0
        const t = window.setTimeout(() => veilOut(1.5), Math.max(0, 200 - since))
        return () => window.clearTimeout(t)
      }
      if (cloud.overlay) return // the menu veil parts when the menu closes
      veilSnap(0.9)
      const t = window.setTimeout(() => veilOut(1.6), 60)
      return () => window.clearTimeout(t)
    }

    const el = curtainRef.current
    if (!el) return
    gsap.killTweensOf(el)
    gsap.fromTo(
      el,
      { autoAlpha: 0.85, scale: 1.04 },
      { autoAlpha: 0, scale: 1, duration: 0.6, ease: 'power2.out' }
    )
  }, [location.pathname])

  return (
    <div
      ref={curtainRef}
      aria-hidden="true"
      style={{
        opacity: 0,
        visibility: 'hidden',
        backgroundImage:
          'radial-gradient(ellipse at 50% 70%, rgba(200,134,74,0.28), rgba(11,9,8,0.96) 62%), url(/images/enigma/chiaroscuro-sky.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
      className="fixed inset-0 z-[95] pointer-events-none"
    />
  )
}
