import React, { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import gsap from 'gsap'

export function CloudCurtainTransition() {
  const location = useLocation()
  const curtainRef = useRef<HTMLDivElement | null>(null)
  const firstRender = useRef(true)

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })

    if (firstRender.current) {
      firstRender.current = false
      return
    }
    if (
      import.meta.env.MODE === 'test' ||
      (typeof navigator !== 'undefined' && navigator.webdriver) ||
      (typeof window.matchMedia === 'function' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches)
    ) {
      return
    }

    const el = curtainRef.current
    if (!el) return

    gsap.killTweensOf(el)
    gsap.fromTo(
      el,
      { autoAlpha: 0.78, scale: 1.04 },
      {
        autoAlpha: 0,
        scale: 1,
        duration: 0.55,
        ease: 'power2.out',
      }
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
          'radial-gradient(circle at 50% 35%, rgba(28,29,36,0.92), rgba(7,7,9,0.98)), url(/images/enigma/chiaroscuro-sky.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
      className="fixed inset-0 z-[95] pointer-events-none"
    />
  )
}
