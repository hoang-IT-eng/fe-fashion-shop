import { useEffect, useRef, useState } from 'react'
import { NocturneWordmark } from '../brand/NocturneMark'
import { HeroPoster } from '../media/ResponsiveImage'
import { motionDisabled } from '../../lib/motion'
import { getCloudWorld, veilOut, veilSnap } from './cloud/cloudState'

const SESSION_KEY = 'nocturne_loader_seen'
/** Total budget: hold + part ≤ 1.2s. */
const HOLD_MS = 600
const PART_MS = 520

function shouldShow(): boolean {
  if (typeof window === 'undefined' || motionDisabled()) return false
  try {
    return window.sessionStorage.getItem(SESSION_KEY) !== '1'
  } catch {
    return false
  }
}

/**
 * First-visit loader (once per session, ≤1.2s): the wordmark rises over a
 * closed veil of the same painted clouds, then the clouds part from the
 * centre outward — the same parting shape the WebGL veil uses for the menu
 * and page transitions. On a first visit the WebGL world is deliberately not
 * loaded yet (it arms on first interaction, keeping LCP/TBT clean), so the
 * veil is painted from the hero artwork that is already preloaded; if the
 * world is already live (e.g. a later session in the same tab), the real
 * cloud veil is used.
 */
export function NocturneLoader() {
  const [visible, setVisible] = useState(shouldShow)
  const [phase, setPhase] = useState<'hold' | 'part'>('hold')
  const veilRef = useRef<HTMLDivElement | null>(null)
  const countRef = useRef<HTMLSpanElement | null>(null)
  const barRef = useRef<HTMLSpanElement | null>(null)
  const live = useRef(false)

  // The static boot veil in index.html has done its job once React paints.
  useEffect(() => {
    const boot = document.getElementById('boot')
    if (boot) requestAnimationFrame(() => boot.remove())
  }, [])

  useEffect(() => {
    if (!visible) return
    try {
      window.sessionStorage.setItem(SESSION_KEY, '1')
    } catch {
      /* ignore */
    }
    if (getCloudWorld()) {
      live.current = true
      veilSnap(1)
    }
    const start = performance.now()
    let raf = 0
    const tick = (now: number) => {
      const t = now - start
      const c = Math.round(Math.min(1, t / HOLD_MS) * 100)
      if (countRef.current) countRef.current.textContent = String(c).padStart(3, '0')
      if (barRef.current) barRef.current.style.width = `${c}%`
      const el = veilRef.current
      if (el && t > HOLD_MS) {
        // part from the centre: an expanding soft hole in the painted veil
        const k = Math.min(1, (t - HOLD_MS) / PART_MS)
        const e = 1 - Math.pow(1 - k, 3)
        const r = e * 135
        const mask = `radial-gradient(ellipse 120% 95% at 50% 58%, transparent ${r}%, #000 ${r + 22}%)`
        el.style.maskImage = mask
        el.style.webkitMaskImage = mask
        el.style.transform = `scale(${1 + e * 0.12})`
      }
      if (t < HOLD_MS + PART_MS) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    const tPart = window.setTimeout(() => {
      setPhase('part')
      if (live.current) veilOut(1.9)
    }, HOLD_MS)
    const tEnd = window.setTimeout(() => setVisible(false), HOLD_MS + PART_MS + 40)
    return () => {
      cancelAnimationFrame(raf)
      window.clearTimeout(tPart)
      window.clearTimeout(tEnd)
    }
  }, [visible])

  if (!visible) return null
  const parting = phase === 'part'

  return (
    <div id="nocturne-loader" aria-hidden="true" className="pointer-events-none fixed inset-0 z-[120] text-bone">
      {!live.current && (
        <div ref={veilRef} className="absolute inset-0 overflow-hidden bg-ink will-change-transform">
          <HeroPoster className="h-full w-full object-cover brightness-50" />
          <div className="loader-veil absolute inset-0" />
        </div>
      )}
      <div
        className={`relative flex h-full flex-col items-center justify-center gap-6 px-6 transition-all duration-300 ${
          parting ? '-translate-y-3 opacity-0' : 'opacity-100'
        }`}
      >
        <NocturneWordmark className="h-7 w-auto text-bone md:h-10" />
        <div className="flex items-center gap-4 font-mono text-[10px] uppercase tracking-[0.34em] text-bone/70">
          <span>Descending</span>
          <span className="h-px w-16 overflow-hidden bg-bone/20">
            <span ref={barRef} className="block h-full bg-ember" style={{ width: '0%' }} />
          </span>
          <span ref={countRef} className="tabular-nums">000</span>
        </div>
      </div>
    </div>
  )
}
