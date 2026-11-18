import React, { useEffect, useState } from 'react'

const SESSION_KEY = 'enigma_preloader_seen'

function shouldBypassPreloader(): boolean {
  if (typeof window === 'undefined') return true
  if (import.meta.env.MODE === 'test') return true
  if (typeof navigator !== 'undefined' && navigator.webdriver) return true
  if (
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ) {
    return true
  }
  try {
    if (window.sessionStorage.getItem(SESSION_KEY) === '1') return true
  } catch {
    return true
  }
  return false
}

/**
 * Film-leader intro: black screen, a Playfair italic percentage counter
 * over a thin progress hairline, then the curtain lifts.
 * Trigger logic and total timing are unchanged from the original
 * preloader (1250ms count + 360ms exit, once per session).
 */
export function CinematicPreloader() {
  const [visible, setVisible] = useState<boolean>(() => !shouldBypassPreloader())
  const [progress, setProgress] = useState(0)
  const [fading, setFading] = useState(false)

  useEffect(() => {
    if (!visible) return

    try {
      window.sessionStorage.setItem(SESSION_KEY, '1')
    } catch {
      // ignore
    }

    const start = performance.now()
    const duration = 1250
    let rafId = 0

    const tick = (now: number) => {
      const ratio = Math.min(1, (now - start) / duration)
      setProgress(Math.round(ratio * 100))

      if (ratio < 1) {
        rafId = window.requestAnimationFrame(tick)
      } else {
        setFading(true)
        window.setTimeout(() => setVisible(false), 360)
      }
    }

    rafId = window.requestAnimationFrame(tick)

    return () => {
      window.cancelAnimationFrame(rafId)
    }
  }, [visible])

  if (!visible) return null

  return (
    <div
      id="enigma-preloader"
      aria-hidden="true"
      className={`fixed inset-0 z-[120] bg-[#0a0a0a] text-[#f9f9f9] transition-transform duration-300 ease-[cubic-bezier(0.76,0,0.24,1)] ${
        fading ? '-translate-y-full' : 'translate-y-0'
      }`}
    >
      {/* Film-leader corner marks */}
      <span className="absolute left-5 top-5 font-sans text-[10px] font-medium uppercase tracking-[0.28em] text-[#a3a3a3] md:left-8 md:top-7">
        Enigma Cult
      </span>
      <span className="absolute right-5 top-5 font-sans text-[10px] font-medium uppercase tracking-[0.28em] text-[#a3a3a3] md:right-8 md:top-7">
        Reel N°01
      </span>
      <span className="absolute bottom-5 left-5 font-sans text-[10px] font-medium uppercase tracking-[0.28em] text-[#a3a3a3] md:bottom-7 md:left-8">
        Feature Presentation
      </span>
      <span className="absolute bottom-5 right-5 font-sans text-[10px] font-medium uppercase tracking-[0.28em] text-[#a3a3a3] tabular-nums md:bottom-7 md:right-8">
        AW · 2026
      </span>

      <div className="flex h-full flex-col items-center justify-center gap-7 px-6 text-center">
        <p className="font-sans text-[10px] font-medium uppercase tracking-[0.34em] text-[#a3a3a3]">
          Enigma · Feature Presentation
        </p>
        <p className="font-display text-[clamp(4.5rem,14vw,8.5rem)] italic leading-none text-[#f9f9f9] tabular-nums">
          {progress}
          <span className="text-[0.42em] not-italic text-[#a3a3a3]">%</span>
        </p>
        <div className="h-px w-56 overflow-hidden bg-[#232323] md:w-72">
          <div
            className="h-full bg-[#f9f9f9] transition-all duration-75"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="font-sans text-[10px] font-medium uppercase tracking-[0.3em] text-[#a3a3a3]">
          Loading the Archive
        </p>
      </div>
    </div>
  )
}
