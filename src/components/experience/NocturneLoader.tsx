import { useEffect, useState } from 'react'
import { NocturneWordmark } from '../brand/NocturneMark'
import { motionDisabled } from '../../lib/motion'
import {
  cloud,
  cloudsSupported,
  loadCloudWorld,
  veilOut,
  veilSnap,
} from './cloud/cloudState'

const SESSION_KEY = 'nocturne_loader_seen'
/** Total budget: hold + part ≤ 1.2s. */
const HOLD_MS = 620
const TOTAL_MS = 1180

function shouldShow(): boolean {
  if (typeof window === 'undefined' || motionDisabled()) return false
  try {
    return window.sessionStorage.getItem(SESSION_KEY) !== '1'
  } catch {
    return false
  }
}

/**
 * First-visit loader (once per session, ≤1.2s). The wordmark rises over a
 * closed veil of painted cloud; then the clouds part from the centre to
 * reveal the page underneath. When the live cloud world is ready in time
 * the veil is the real WebGL veil; otherwise the painted DOM layer fades.
 */
export function NocturneLoader() {
  const [visible, setVisible] = useState(shouldShow)
  const [phase, setPhase] = useState<'hold' | 'part'>('hold')
  const [live, setLive] = useState(false)
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!visible) return
    try {
      window.sessionStorage.setItem(SESSION_KEY, '1')
    } catch {
      /* ignore */
    }
    let liveNow = false
    if (cloudsSupported()) {
      veilSnap(1)
      void loadCloudWorld().then(w => {
        if (w && cloud.overlay) {
          liveNow = true
          setLive(true)
        }
      })
    }
    const start = performance.now()
    let raf = 0
    const tick = (now: number) => {
      const r = Math.min(1, (now - start) / HOLD_MS)
      setCount(Math.round(r * 100))
      if (r < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    const tPart = window.setTimeout(() => {
      setPhase('part')
      veilOut(liveNow ? 1.85 : 50)
    }, HOLD_MS)
    const tEnd = window.setTimeout(() => {
      veilOut(50)
      setVisible(false)
    }, TOTAL_MS)
    return () => {
      cancelAnimationFrame(raf)
      window.clearTimeout(tPart)
      window.clearTimeout(tEnd)
    }
  }, [visible])

  if (!visible) return null
  const parting = phase === 'part'

  return (
    <div
      id="nocturne-loader"
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[120] text-bone"
    >
      {/* Painted DOM veil (used until / unless the WebGL veil is live) */}
      <div
        className={`loader-veil absolute inset-0 transition-[opacity,transform] ease-[cubic-bezier(0.7,0,0.2,1)] ${
          live ? 'opacity-0 duration-300' : parting ? 'scale-110 opacity-0 duration-500' : 'opacity-100'
        }`}
      />
      <div
        className={`relative flex h-full flex-col items-center justify-center gap-6 px-6 transition-all duration-300 ${
          parting ? '-translate-y-3 opacity-0' : 'opacity-100'
        }`}
      >
        <NocturneWordmark className="loader-mark h-7 w-auto text-bone md:h-10" />
        <div className="flex items-center gap-4 font-mono text-[10px] uppercase tracking-[0.34em] text-bone/70">
          <span>Descending</span>
          <span className="h-px w-16 overflow-hidden bg-bone/20">
            <span className="block h-full bg-ember" style={{ width: `${count}%` }} />
          </span>
          <span className="tabular-nums">{String(count).padStart(3, '0')}</span>
        </div>
      </div>
    </div>
  )
}
