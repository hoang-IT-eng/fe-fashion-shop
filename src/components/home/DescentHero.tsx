import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ArrowDown, ArrowRight } from 'lucide-react'
import type { Product } from '../../types/product'
import { formatVnd } from '../../lib/format'
import { HeroPoster, ResponsiveImage } from '../media/ResponsiveImage'
import { CloudHost, useCloudLive } from '../experience/cloud/CloudHost'
import { cloud, cloudsSupported } from '../experience/cloud/cloudState'
import { afterIdle, getLenis, motionDisabled } from '../../lib/motion'

if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
  gsap.registerPlugin(ScrollTrigger)
}

const clamp01 = (v: number) => Math.min(1, Math.max(0, v))
const range = (a: number, b: number, v: number) => {
  const t = clamp01((v - a) / (b - a))
  return t * t * (3 - 2 * t)
}

/** Scroll windows (fractions of the descent). The title is fully gone
 *  before the first product starts to surface — they can never overlap. */
export const DESCENT = {
  titleOut: [0.05, 0.28] as const,
  revealIn: [0.55, 0.85] as const,
}

const NUMERALS = ['I', 'II', 'III']

/** Three products with distinct imagery, centre piece first in the array order [left, centre, right]. */
export function pickTriptych(products: Product[]): Product[] {
  const seen = new Set<string>()
  const distinct: Product[] = []
  for (const p of products) {
    if (!p.imageUrl || seen.has(p.imageUrl)) continue
    seen.add(p.imageUrl)
    distinct.push(p)
    if (distinct.length === 3) break
  }
  for (const p of products) {
    if (distinct.length >= 3) break
    if (!distinct.includes(p)) distinct.push(p)
  }
  return distinct
}

function splitWords(el: HTMLElement) {
  if (el.dataset.split) return
  el.dataset.split = '1'
  const walk = (node: Node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const frag = document.createDocumentFragment()
      for (const part of (node.textContent || '').split(/(\s+)/)) {
        if (!part) continue
        if (/^\s+$/.test(part)) {
          frag.appendChild(document.createTextNode(' '))
          continue
        }
        const mask = document.createElement('span')
        mask.className = 'hero-mask'
        const inner = document.createElement('span')
        inner.className = 'hero-word'
        inner.textContent = part
        mask.appendChild(inner)
        frag.appendChild(mask)
      }
      node.parentNode?.replaceChild(frag, node)
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      Array.from(node.childNodes).forEach(walk)
    }
  }
  Array.from(el.childNodes).forEach(walk)
}

interface DescentHeroProps {
  products: Product[]
  /** True once the first-visit loader has left (or was skipped). */
  introReady: boolean
  onScrollPast?: () => void
}

/**
 * Hero = "The Descent". A tall scroll section with a sticky stage: the
 * camera sinks through the painted cloud deck (WebGL, shared cloud world),
 * the title lifts away first, and only then do three pieces surface in a
 * triptych beneath the clouds.
 *
 * Without live clouds (reduced motion, no WebGL, low-end, automation) the
 * same content renders as a calm static poster + a normal triptych section.
 */
export function DescentHero({ products, introReady, onScrollPast }: DescentHeroProps) {
  const [descent] = useState(() => cloudsSupported())
  const worldLive = useCloudLive('hero')

  const sectionRef = useRef<HTMLElement | null>(null)
  const posterRef = useRef<HTMLDivElement | null>(null)
  const titleRef = useRef<HTMLDivElement | null>(null)
  const h1Ref = useRef<HTMLHeadingElement | null>(null)
  const scrimRef = useRef<HTMLDivElement | null>(null)
  const cueRef = useRef<HTMLButtonElement | null>(null)
  const altRef = useRef<HTMLSpanElement | null>(null)
  const revealRef = useRef<HTMLDivElement | null>(null)
  const introRef = useRef<gsap.core.Timeline | null>(null)

  const triptych = pickTriptych(products)

  /* Adopt the hero painting pre-rendered in index.html (#lcp-hero) instead of
     painting a second copy: the LCP element is on screen before the bundle
     runs and is never replaced. */
  const [adopted] = useState(() => typeof document !== 'undefined' && Boolean(document.getElementById('lcp-hero')))
  useLayoutEffect(() => {
    const holder = document.getElementById('lcp-hero')
    const pic = holder?.querySelector('picture')
    const target = posterRef.current
    if (pic && target && !target.contains(pic)) target.appendChild(pic)
    holder?.remove()
  }, [])

  /* scroll-scrubbed descent */
  useEffect(() => {
    if (!descent) return
    const section = sectionRef.current
    if (!section) return
    const frames = () =>
      Array.from(revealRef.current?.querySelectorAll<HTMLElement>('[data-frame]') || [])

    const apply = (p: number) => {
      cloud.hero = p
      const t = 1 - range(DESCENT.titleOut[0], DESCENT.titleOut[1], p)
      const title = titleRef.current
      if (title) {
        title.style.opacity = String(t)
        title.style.transform = `translate3d(0, ${-range(0, 0.34, p) * 16}vh, 0)`
        title.style.visibility = t < 0.01 ? 'hidden' : 'visible'
      }
      if (scrimRef.current) scrimRef.current.style.opacity = String(0.35 + 0.65 * t)
      if (cueRef.current) cueRef.current.style.opacity = String(1 - range(0, 0.06, p))
      if (altRef.current) altRef.current.textContent = String(Math.round(3400 * (1 - p))).padStart(4, '0')
      if (posterRef.current) {
        posterRef.current.style.transform = `scale(${1 + p * 0.35}) translate3d(0, ${p * -6}%, 0)`
      }
      const reveal = revealRef.current
      if (reveal) {
        const r = range(DESCENT.revealIn[0], DESCENT.revealIn[1], p)
        reveal.style.opacity = String(r > 0 ? 1 : 0)
        reveal.style.visibility = r > 0 ? 'visible' : 'hidden'
        reveal.inert = r < 0.6
        reveal.querySelectorAll<HTMLElement>('[data-copy]').forEach((el, i) => {
          // heading leads; the CTA row arrives last, after the frames
          const a = DESCENT.revealIn[0] + i * 0.2
          const c = range(a, a + 0.16, p)
          el.style.opacity = String(c)
          el.style.transform = `translate3d(0, ${(1 - c) * 28}px, 0)`
        })
        frames().forEach(el => {
          const i = Number(el.dataset.frame)
          const order = i === 1 ? 0 : i === 0 ? 1 : 2 // centre leads, wings follow
          const a = DESCENT.revealIn[0] + 0.04 + order * 0.05
          const f = range(a, a + 0.22, p)
          el.style.opacity = String(f)
          el.style.transform = `translate3d(0, ${(1 - f) * 90}px, 0) scale(${0.94 + 0.06 * f})`
          const img = el.querySelector<HTMLElement>('[data-frame-img]')
          if (img) img.style.clipPath = `inset(${(1 - f) * 100}% 0 0 0)`
        })
      }
    }

    // measured in an idle slot: the stage's initial inline styles already
    // match progress 0 (title shown, reveal hidden), so nothing is lost
    const off = afterIdle(() => {
      const st = ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: 'bottom bottom',
        onUpdate: self => apply(self.progress),
        onRefresh: self => apply(self.progress),
      })
      apply(st.progress || 0)
      return () => st.kill()
    }, 600)
    return () => {
      off()
      cloud.hero = 0
    }
  }, [descent])

  /* re-apply when products arrive (new frames in the DOM) */
  useEffect(() => {
    if (!descent) return
    const ric = (window as any).requestIdleCallback as ((cb: () => void, o?: { timeout: number }) => number) | undefined
    if (!ric) return
    const id = ric(() => ScrollTrigger.refresh(), { timeout: 1500 })
    return () => (window as any).cancelIdleCallback?.(id)
  }, [descent, triptych.length])

  /* title intro: words rise once the loader has gone */
  useLayoutEffect(() => {
    if (motionDisabled()) return
    const h1 = h1Ref.current
    const title = titleRef.current
    if (!h1 || !title) return
    // initial state via plain inline styles (no computed-style reads at boot);
    // the GSAP timeline is only built when the intro actually plays
    splitWords(h1)
    const words = Array.from(h1.querySelectorAll<HTMLElement>('.hero-word'))
    const fades = Array.from(title.querySelectorAll<HTMLElement>('.hero-fade'))
    words.forEach(w => (w.style.transform = 'translateY(118%)'))
    fades.forEach(f => {
      f.style.opacity = '0'
      f.style.transform = 'translateY(16px)'
    })
    let tl: gsap.core.Timeline | null = null
    const play = () => {
      if (tl) return
      // hand the inline pre-state over to GSAP (otherwise it would parse the
      // translateY(118%) as a px offset and keep it after the tween)
      words.forEach(w => (w.style.transform = ''))
      fades.forEach(f => (f.style.transform = ''))
      tl = gsap.timeline()
      tl.fromTo(words, { yPercent: 118 }, { yPercent: 0, duration: 1.1, ease: 'power4.out', stagger: 0.045 }, 0.05)
      tl.fromTo(fades, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', stagger: 0.08 }, 0.45)
    }
    introRef.current = { play } as unknown as gsap.core.Timeline
    const safety = window.setTimeout(play, 3500)
    return () => {
      window.clearTimeout(safety)
      tl?.kill()
      words.forEach(w => (w.style.transform = ''))
      fades.forEach(f => {
        f.style.opacity = ''
        f.style.transform = ''
      })
      introRef.current = null
    }
  }, [])

  useEffect(() => {
    if (introReady) introRef.current?.play()
  }, [introReady])

  const scrollOn = () => {
    const section = sectionRef.current
    if (!section) return
    const target = descent
      ? section.offsetTop + section.offsetHeight - window.innerHeight
      : section.offsetTop + section.offsetHeight
    const lenis = getLenis()
    if (lenis) lenis.scrollTo(target, { duration: 3.2 })
    else window.scrollTo({ top: target, behavior: motionDisabled() ? 'auto' : 'smooth' })
    onScrollPast?.()
  }

  const triptychBlock = (
    <div className="mx-auto flex h-full w-full max-w-6xl flex-col items-center justify-center px-3 pb-8 pt-20 md:px-8 md:pt-24">
      <div data-copy className="text-center">
        <p className="font-sans text-[11px] font-medium uppercase tracking-[0.3em] text-ember-soft">
          II — Below the clouds
        </p>
        <h2
          className="mt-3 font-display leading-[1.02] text-bone"
          style={{ fontSize: 'clamp(2.1rem, 4.6vw, 4.1rem)' }}
        >
          The vault, <em>opened.</em>
        </h2>
      </div>

      <div className="mt-7 flex w-full items-end justify-center gap-[2.5vw] md:mt-10 md:gap-[2.2vw]">
        {(triptych.length ? triptych : [null, null, null]).slice(0, 3).map((p, i) => {
          const centre = i === 1
          const width = centre ? 'w-[42vw] md:w-[min(20vw,33vh)]' : 'w-[24vw] md:w-[min(15vw,24vh)]'
          const offset = i === 0 ? 'mb-[6vh]' : i === 2 ? 'mb-[11vh]' : 'mb-0'
          const inner = (
            <>
              <div
                data-frame-img
                className="relative aspect-[3/4] overflow-hidden bg-ink-raised outline outline-1 outline-bone/15 outline-offset-[6px]"
              >
                {p && (
                  <ResponsiveImage
                    src={p.imageUrl}
                    alt={p.name}
                    sizes={centre ? '(min-width: 768px) 20vw, 42vw' : '(min-width: 768px) 14vw, 24vw'}
                    className="film-grade h-full w-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-[1.04]"
                  />
                )}
              </div>
              <div className={`mt-4 ${centre ? 'text-center' : 'hidden text-center md:block'}`}>
                <span className="block font-mono text-[10px] uppercase tracking-[0.3em] text-ember-soft">
                  {NUMERALS[i]}
                </span>
                {p && (
                  <>
                    <span className="mt-1 line-clamp-2 block font-display text-lg leading-tight text-bone md:text-xl">
                      {p.name}
                    </span>
                    <span className="mt-1 block font-mono text-[11px] tabular-nums text-bone-muted">
                      {formatVnd(p.price)}
                    </span>
                  </>
                )}
              </div>
            </>
          )
          return (
            <div key={p ? p.id : `slot-${i}`} data-frame={i} className={`${width} ${offset} shrink-0`}>
              {p ? (
                <Link to={`/products/${p.id}`} className="group block" data-cursor="View">
                  {inner}
                </Link>
              ) : (
                inner
              )}
            </div>
          )
        })}
      </div>

      <div data-copy className="mt-6 flex flex-wrap items-center justify-center gap-3 md:mt-8">
        <Link
          to="/products"
          className="inline-flex items-center gap-2 bg-bone px-6 py-3.5 font-sans text-xs font-semibold uppercase tracking-[0.14em] text-ink transition hover:bg-ember-soft"
        >
          Enter the archive <ArrowRight className="h-4 w-4" />
        </Link>
        <Link
          to="/auctions"
          className="inline-flex items-center gap-2 border border-bone/40 px-6 py-3.5 font-sans text-xs font-medium uppercase tracking-[0.14em] text-bone transition hover:border-bone"
        >
          Live auctions
        </Link>
      </div>
    </div>
  )

  return (
    <>
      <section
        ref={sectionRef}
        aria-label="NOCTURNE — the descent"
        className={`relative bg-ink ${descent ? 'h-[330vh]' : ''}`}
      >
        <div className={`${descent ? 'sticky top-0 h-[100svh]' : 'relative min-h-[100svh]'} overflow-hidden`}>
          {/* Static graded painting: LCP image, reduced-motion / no-WebGL view, and the
              backdrop until the live clouds take over. */}
          <div
            ref={posterRef}
            aria-hidden="true"
            className={`absolute inset-0 origin-center transition-opacity duration-1000 ${worldLive ? 'opacity-0' : 'opacity-100'}`}
          >
            {!adopted && <HeroPoster className="h-full w-full object-cover" />}
          </div>
          {descent && <CloudHost mode="hero" load="idle" className="absolute inset-0" />}

          <div ref={scrimRef} aria-hidden="true" className="hero-title-scrim pointer-events-none absolute inset-0" />
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-ink/80 to-transparent" />
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-ink to-transparent" />
          <div aria-hidden="true" className="vignette pointer-events-none absolute inset-0" />

          {/* Altimeter — the descent made legible (desktop) */}
          {descent && (
            <div
              aria-hidden="true"
              className="pointer-events-none absolute right-6 top-1/2 z-20 hidden -translate-y-1/2 flex-col items-center gap-3 md:flex"
            >
              <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-bone/60 [writing-mode:vertical-rl]">
                Altitude
              </span>
              <span className="h-24 w-px bg-gradient-to-b from-bone/0 via-bone/40 to-bone/0" />
              <span className="font-mono text-[11px] tabular-nums text-bone/80">
                <span ref={altRef}>3400</span> m
              </span>
            </div>
          )}

          {/* Title */}
          <div
            ref={titleRef}
            className="relative z-10 flex h-[100svh] flex-col items-center justify-center px-6 pt-16 text-center will-change-transform"
          >
            <p className="hero-fade mb-6 font-sans text-[11px] font-medium uppercase tracking-[0.3em] text-bone/75">
              The Vault Issue — N°01
            </p>
            <h1
              ref={h1Ref}
              className="max-w-6xl font-display leading-[0.98] tracking-tight text-bone"
              style={{ fontSize: 'clamp(2.9rem, 7.6vw, 7rem)' }}
            >
              Authenticated Grails, Nocturnal Auctions &amp; <em>Afterlife Customs.</em>
            </h1>
            <p className="hero-fade mt-7 max-w-xl text-base leading-relaxed text-bone/75 md:text-lg">
              Every piece is listed with its authenticity code, and live auctions add two minutes
              to the clock on any late bid — no last-second sniping.
            </p>
            <button
              ref={cueRef}
              type="button"
              onClick={scrollOn}
              aria-label="Descend to the vault"
              data-cursor="Descend"
              className="hero-fade mt-10 flex flex-col items-center gap-3 text-bone/80 transition hover:text-bone"
            >
              <span className="font-mono text-[10px] uppercase tracking-[0.34em]">Scroll to descend</span>
              <span className="flex h-14 w-14 items-center justify-center rounded-full border border-bone/40 bg-ink/20 backdrop-blur-sm">
                <ArrowDown className="h-5 w-5" />
              </span>
            </button>
          </div>

          {/* Products surface only beneath the clouds */}
          {descent && (
            <div
              ref={revealRef}
              className="absolute inset-0 z-10"
              style={{ opacity: 0, visibility: 'hidden' }}
            >
              {triptychBlock}
            </div>
          )}
        </div>
      </section>
      {!descent && <section aria-label="This week's pieces" className="relative bg-ink py-16">{triptychBlock}</section>}
    </>
  )
}
