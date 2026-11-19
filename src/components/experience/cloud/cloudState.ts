/**
 * NOCTURNE cloud world — shared state, capability gate and lazy loader.
 *
 * This module never imports three. The WebGL engine (./cloudWorld) is a
 * separate chunk that is only fetched when a cloud surface actually needs
 * it (hero, footer, loader, menu, page transition) and only on capable,
 * motion-allowed devices. Everything else falls back to the static,
 * graded painting.
 *
 * One canvas, one WebGL context: hosts register a DOM element + mode and
 * the engine re-parents its single canvas into whichever host is active
 * (overlay > the in-page host with the most visible area).
 */
import { motionDisabled } from '../../../lib/motion'

export type CloudMode = 'hero' | 'footer' | 'overlay'

/** Mutable frame inputs, read by the engine every frame (no re-renders). */
export const cloud = {
  /** Hero descent progress 0..1 (scroll-scrubbed). */
  hero: 0,
  /** Footer ascent progress 0..1. */
  footer: 0,
  /** Overlay veil target: 1 = fully clouded, 0 = parted. */
  cover: 0,
  /** Overlay host requested (loader / menu / transition). */
  overlay: false,
  /** Speed of the veil easing (per second). */
  coverSpeed: 3.2,
}

export interface CloudWorldApi {
  setHosts: (hosts: HostEntry[]) => void
  /** Current eased veil value, for DOM layers that sync to it. */
  veil: () => number
  dispose: () => void
}

export interface HostEntry {
  el: HTMLElement
  mode: CloudMode
}

/* ------------------------------------------------------------------ */
/* capability                                                          */
/* ------------------------------------------------------------------ */

let supportCache: boolean | null = null

function urlFlag(): string | null {
  try {
    return new URLSearchParams(window.location.search).get('clouds')
  } catch {
    return null
  }
}

/** True when the live WebGL cloud world may run on this device. */
export function cloudsSupported(): boolean {
  if (supportCache !== null) return supportCache
  if (typeof window === 'undefined') return (supportCache = false)
  const flag = urlFlag()
  if (flag === 'static') return (supportCache = false)
  if (motionDisabled()) return (supportCache = false)
  const nav = navigator as Navigator & {
    deviceMemory?: number
    connection?: { saveData?: boolean }
  }
  const lowEnd =
    (nav.hardwareConcurrency !== undefined && nav.hardwareConcurrency <= 2) ||
    (nav.deviceMemory !== undefined && nav.deviceMemory <= 2) ||
    Boolean(nav.connection?.saveData)
  if (lowEnd && flag !== 'live') return (supportCache = false)
  try {
    const c = document.createElement('canvas')
    const gl = c.getContext('webgl2') || c.getContext('webgl')
    if (!gl) return (supportCache = false)
    ;(gl as WebGLRenderingContext).getExtension('WEBGL_lose_context')?.loseContext()
  } catch {
    return (supportCache = false)
  }
  return (supportCache = true)
}

/** Test hook. */
export function __resetCloudSupport() {
  supportCache = null
}

/* ------------------------------------------------------------------ */
/* hosts                                                               */
/* ------------------------------------------------------------------ */

const hosts: HostEntry[] = []

export function registerCloudHost(el: HTMLElement, mode: CloudMode): () => void {
  const entry = { el, mode }
  hosts.push(entry)
  world?.setHosts([...hosts])
  return () => {
    const i = hosts.indexOf(entry)
    if (i >= 0) hosts.splice(i, 1)
    world?.setHosts([...hosts])
  }
}

/* ------------------------------------------------------------------ */
/* lazy engine                                                         */
/* ------------------------------------------------------------------ */

let world: CloudWorldApi | null = null
let pending: Promise<CloudWorldApi | null> | null = null
type Listener = (live: boolean) => void
const listeners = new Set<Listener>()
/** "live" = the canvas is attached to a host and has rendered a frame. */
const liveModes = new Set<CloudMode>()

export function getCloudWorld(): CloudWorldApi | null {
  return world
}

export function loadCloudWorld(): Promise<CloudWorldApi | null> {
  if (world) return Promise.resolve(world)
  if (pending) return pending
  if (!cloudsSupported()) return Promise.resolve(null)
  pending = import('./cloudWorld')
    .then(m => m.createCloudWorld())
    .then(w => {
      world = w
      w?.setHosts([...hosts])
      return w
    })
    .catch(err => {
      console.warn('[nocturne] cloud world unavailable, using painted fallback', err)
      supportCache = false
      return null
    })
  return pending
}

/** Load once the browser is idle after first paint (keeps LCP/TBT clean). */
export function loadCloudWorldWhenIdle(timeout = 1800): void {
  if (world || pending || !cloudsSupported()) return
  const go = () => {
    const ric = (window as any).requestIdleCallback as
      | ((cb: () => void, o?: { timeout: number }) => number)
      | undefined
    if (ric) ric(() => void loadCloudWorld(), { timeout })
    else window.setTimeout(() => void loadCloudWorld(), 200)
  }
  if (document.readyState === 'complete') go()
  else window.addEventListener('load', go, { once: true })
}

let armed = false
/**
 * Arm the world: it is fetched + compiled on the visitor's first real
 * interaction (pointer, touch, wheel, key, scroll) — the static painting is
 * already on screen, so nothing heavy competes with first paint / LCP.
 * `?clouds=eager` loads on idle instead (used for perf measurements).
 */
export function armCloudWorld(): void {
  if (armed || world || pending || !cloudsSupported()) return
  armed = true
  if (urlFlag() === 'eager') {
    loadCloudWorldWhenIdle()
    return
  }
  const events = ['pointermove', 'pointerdown', 'wheel', 'touchstart', 'keydown', 'scroll'] as const
  const go = () => {
    events.forEach(e => window.removeEventListener(e, go))
    void loadCloudWorld()
  }
  events.forEach(e => window.addEventListener(e, go, { passive: true }))
}

/** Engine → UI: a host's canvas became (in)visible/live. */
export function setModeLive(mode: CloudMode, live: boolean) {
  const had = liveModes.has(mode)
  if (live === had) return
  if (live) liveModes.add(mode)
  else liveModes.delete(mode)
  listeners.forEach(l => l(liveModes.size > 0))
}

export function isModeLive(mode: CloudMode): boolean {
  return liveModes.has(mode)
}

export function subscribeLive(l: Listener): () => void {
  listeners.add(l)
  return () => listeners.delete(l)
}

/* ------------------------------------------------------------------ */
/* veil helpers (loader / menu / transitions)                          */
/* ------------------------------------------------------------------ */

/** Roll the clouds in over the page. */
export function veilIn(speed = 2.6) {
  cloud.overlay = true
  cloud.coverSpeed = speed
  cloud.cover = 1
}

/** Part the clouds to reveal the page. */
export function veilOut(speed = 1.8) {
  cloud.coverSpeed = speed
  cloud.cover = 0
  cloud.overlay = false
}

/** Jump straight to a veil value (next frame). */
export function veilSnap(value: number) {
  cloud.overlay = true
  cloud.coverSpeed = 1e4
  cloud.cover = value
}
