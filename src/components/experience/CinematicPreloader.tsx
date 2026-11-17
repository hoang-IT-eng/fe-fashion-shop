import React, { useEffect, useRef, useState } from 'react'
import { EnigmaCrest } from '../EnigmaCrest'

const SCRAMBLE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/·'
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

export function CinematicPreloader() {
  const [visible, setVisible] = useState<boolean>(() => !shouldBypassPreloader())
  const [progress, setProgress] = useState(0)
  const [headline, setHeadline] = useState('DECODING...')
  const [fading, setFading] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    if (!visible) return

    try {
      window.sessionStorage.setItem(SESSION_KEY, '1')
    } catch {
      // ignore
    }

    const canvas = canvasRef.current
    let rafId = 0
    if (canvas) {
      const ctx = canvas.getContext('2d')
      if (ctx) {
        const w = (canvas.width = window.innerWidth)
        const h = (canvas.height = window.innerHeight)
        const clouds = Array.from({ length: 24 }, (_, i) => ({
          x: (w * (i % 6)) / 5 + (Math.random() - 0.5) * 140,
          y: (h * Math.floor(i / 6)) / 3 + (Math.random() - 0.5) * 120,
          r: 140 + Math.random() * 180,
          vx: (Math.random() - 0.5) * 0.45,
          vy: (Math.random() - 0.5) * 0.3,
        }))

        const render = () => {
          ctx.fillStyle = '#070709'
          ctx.fillRect(0, 0, w, h)
          for (const c of clouds) {
            c.x += c.vx + (w / 2 - c.x) * 0.002
            c.y += c.vy + (h / 2 - c.y) * 0.002
            const grad = ctx.createRadialGradient(c.x, c.y, 10, c.x, c.y, c.r)
            grad.addColorStop(0, 'rgba(28, 29, 36, 0.42)')
            grad.addColorStop(0.6, 'rgba(17, 17, 21, 0.18)')
            grad.addColorStop(1, 'rgba(7, 7, 9, 0)')
            ctx.fillStyle = grad
            ctx.beginPath()
            ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2)
            ctx.fill()
          }
          rafId = window.requestAnimationFrame(render)
        }
        render()
      }
    }

    const targetPhrase = 'DECODE YOUR STYLE'
    const start = performance.now()
    const duration = 1250

    const tick = (now: number) => {
      const ratio = Math.min(1, (now - start) / duration)
      const pct = Math.round(ratio * 100)
      setProgress(pct)

      if (ratio < 0.35) {
        setHeadline('DECODING...')
      } else {
        const revealRatio = (ratio - 0.35) / 0.65
        const lockedCount = Math.floor(revealRatio * targetPhrase.length)
        const scrambled = targetPhrase
          .split('')
          .map((ch, idx) => {
            if (ch === ' ') return ' '
            if (idx < lockedCount) return ch
            return SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)]
          })
          .join('')
        setHeadline(scrambled)
      }

      if (ratio < 1) {
        rafId = window.requestAnimationFrame(tick)
      } else {
        setHeadline(targetPhrase)
        setFading(true)
        window.setTimeout(() => setVisible(false), 360)
      }
    }

    const timerId = window.requestAnimationFrame(tick)

    return () => {
      window.cancelAnimationFrame(rafId)
      window.cancelAnimationFrame(timerId)
    }
  }, [visible])

  if (!visible) return null

  return (
    <div
      id="enigma-preloader"
      aria-hidden="true"
      className={`fixed inset-0 z-[120] flex flex-col items-center justify-center bg-[#070709] transition-opacity duration-300 ${
        fading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-90" />
      <div className="relative z-10 flex flex-col items-center gap-6 px-6 text-center">
        <EnigmaCrest className="w-12 h-12" />
        <p className="font-mono text-xs md:text-sm tracking-[0.36em] text-[#ece5d8] uppercase">
          {headline}
        </p>
        <div className="w-56 h-[1px] bg-[#1c1d24] overflow-hidden">
          <div
            className="h-full bg-[#cfa156] transition-all duration-75"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex items-center gap-4 font-mono text-[11px] tracking-[0.28em] text-[#9a948a] tabular-nums">
          <span>ENIGMA VAULT SEAL</span>
          <span className="text-[#cfa156]">{String(progress).padStart(2, '0')} / 100</span>
        </div>
      </div>
    </div>
  )
}
