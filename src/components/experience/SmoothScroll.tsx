import { useEffect } from 'react'
import Lenis from 'lenis'
import 'lenis/dist/lenis.css'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { afterIdle, motionDisabled, setLenis } from '../../lib/motion'

/**
 * App-wide Lenis smooth scrolling, driven by GSAP's ticker so Lenis and
 * ScrollTrigger share one clock (the documented integration):
 *   lenis.on('scroll', ScrollTrigger.update)
 *   gsap.ticker.add((t) => lenis.raf(t * 1000))
 *
 * Renders nothing. When motion is disabled (reduced motion / test / bot)
 * the native scroll behaviour is left completely untouched.
 */
export function SmoothScroll() {
  useEffect(() => {
    if (motionDisabled()) return

    // native scroll until the boot work is done; Lenis + the first full
    // ScrollTrigger measure happen in an idle slot, not the boot task
    return afterIdle(() => {
    gsap.registerPlugin(ScrollTrigger)

    const lenis = new Lenis({
      duration: 1.15,
      easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.4,
    })
    setLenis(lenis)

    lenis.on('scroll', ScrollTrigger.update)

    const tick = (time: number) => {
      lenis.raf(time * 1000)
    }
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)

    ScrollTrigger.refresh()

    return () => {
      gsap.ticker.remove(tick)
      lenis.destroy()
      setLenis(null)
    }
    }, 1200)
  }, [])

  return null
}
