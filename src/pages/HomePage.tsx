import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Clock,
  Gavel,
  ShieldCheck,
  Compass,
  Crosshair,
  X,
} from 'lucide-react'
import { api } from '../api/apiClient'
import { Product } from '../types/product'
import { AuctionLot, ConciergeTicket, MysteryBoxTier } from '../types/enigma'
import { REBORN_JOURNAL_STORIES } from '../api/enigmaDemoData'
import { formatCountdown, formatVnd, secondsUntil } from '../lib/format'
import ProductCard from '../components/ProductCard'
import { QuickViewModal } from '../components/QuickViewModal'
import { HeroScene, heroState } from '../components/experience/HeroMonolithScene'
import { useRevealScope } from '../components/experience/useReveal'
import { getLenis, motionDisabled } from '../lib/motion'
import { useSoundStore } from '../store/useSoundStore'
import { useToast } from '../components/Toast'

if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
  gsap.registerPlugin(ScrollTrigger)
}

/**
 * Split a headline's text into per-word mask spans at runtime (the JSX
 * keeps the plain text node, so no-JS / test / reduced-motion renders
 * read exactly as authored). Returns the inner word elements.
 */
function splitHeadlineWords(el: HTMLElement): HTMLElement[] {
  const process = (node: Node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const frag = document.createDocumentFragment()
      const parts = (node.textContent || '').split(/(\s+)/)
      for (const part of parts) {
        if (!part) continue
        if (/^\s+$/.test(part)) {
          frag.appendChild(document.createTextNode(' '))
        } else {
          const mask = document.createElement('span')
          mask.className = 'hero-mask'
          const inner = document.createElement('span')
          inner.className = 'hero-word'
          inner.textContent = part
          mask.appendChild(inner)
          frag.appendChild(mask)
        }
      }
      node.parentNode?.replaceChild(frag, node)
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      Array.from(node.childNodes).forEach(process)
    }
  }
  Array.from(el.childNodes).forEach(process)
  return Array.from(el.querySelectorAll<HTMLElement>('.hero-word'))
}

function SectionNumeral({ value, className = '' }: { value: string; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`pointer-events-none select-none absolute font-display italic leading-none text-[#f9f9f9]/[0.05] text-[8.5rem] md:text-[12rem] ${className}`}
    >
      {value}
    </span>
  )
}

export default function HomePage() {
  const navigate = useNavigate()
  const { playTick, playChime } = useSoundStore()
  const { toast } = useToast()

  const [products, setProducts] = useState<Product[]>([])
  const [auctions, setAuctions] = useState<AuctionLot[]>([])
  const [boxes, setBoxes] = useState<MysteryBoxTier[]>([])
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null)
  const [quickBidLot, setQuickBidLot] = useState<AuctionLot | null>(null)
  const [bidAmount, setBidAmount] = useState('')
  const [placingBid, setPlacingBid] = useState(false)

  // Inline "Find It At My Price" Concierge Builder state
  const [sourcingItem, setSourcingItem] = useState('Rick Owens Dunks Archive 2008')
  const [sourcingSize, setSourcingSize] = useState('EU 42')
  const [sourcingPrice, setSourcingPrice] = useState(14500000)
  const [sourcingEmail, setSourcingEmail] = useState('')
  const [submittingConcierge, setSubmittingConcierge] = useState(false)

  const manifestoRef = useRef<HTMLElement | null>(null)

  /* ---------------- hero intro gating ---------------- */
  const [staticHero] = useState(() => motionDisabled())
  const [canvasReady, setCanvasReady] = useState(false)
  const [sceneFailed, setSceneFailed] = useState(false)
  const [preloaderDone, setPreloaderDone] = useState(false)
  const [forceReveal, setForceReveal] = useState(false)
  const useScene = !staticHero && !sceneFailed
  const heroRevealed =
    forceReveal || (preloaderDone && (!useScene || canvasReady))

  const heroRef = useRef<HTMLElement | null>(null)
  const headlineRef = useRef<HTMLHeadingElement | null>(null)
  const topBarRef = useRef<HTMLDivElement | null>(null)
  const bottomBarRef = useRef<HTMLDivElement | null>(null)
  const heroTlRef = useRef<gsap.core.Timeline | null>(null)
  const splitDoneRef = useRef(false)

  const journalRef = useRef<HTMLElement | null>(null)
  const journalTrackRef = useRef<HTMLDivElement | null>(null)

  const dataReady = products.length > 0 || auctions.length > 0 || boxes.length > 0
  const pageRef = useRevealScope<HTMLDivElement>(dataReady)

  /* The interface reveals only once the CinematicPreloader has left the
     DOM (it unmounts itself) — watch for its removal, with a time cap. */
  useEffect(() => {
    if (typeof document === 'undefined' || !document.getElementById('enigma-preloader')) {
      setPreloaderDone(true)
      return
    }
    const observer = new MutationObserver(() => {
      if (!document.getElementById('enigma-preloader')) {
        setPreloaderDone(true)
        observer.disconnect()
      }
    })
    observer.observe(document.body, { childList: true, subtree: true })
    const cap = window.setTimeout(() => setPreloaderDone(true), 3200)
    return () => {
      observer.disconnect()
      window.clearTimeout(cap)
    }
  }, [])

  /* Safety net: never leave the hero interface hidden. */
  useEffect(() => {
    const t = window.setTimeout(() => setForceReveal(true), 4000)
    return () => window.clearTimeout(t)
  }, [])

  /* Build the (paused) hero intro timeline: letterbox bars retract,
     headline words rise line by line, interface fades settle in.
     Initial states are set here — never in CSS — so any failure path
     leaves the hero fully visible. */
  useLayoutEffect(() => {
    if (!useScene) return
    const hero = heroRef.current
    const h1 = headlineRef.current
    if (!hero || !h1) return

    const ctx = gsap.context(() => {
      if (!splitDoneRef.current) {
        splitHeadlineWords(h1)
        splitDoneRef.current = true
      }
      const words = Array.from(h1.querySelectorAll<HTMLElement>('.hero-word'))

      const lines: HTMLElement[][] = []
      let lastTop: number | null = null
      words.forEach(w => {
        const top = w.offsetTop
        if (lastTop === null || Math.abs(top - lastTop) > 2) {
          lines.push([])
          lastTop = top
        }
        lines[lines.length - 1].push(w)
      })

      const fades = hero.querySelectorAll('.hero-fade')
      const bars = [topBarRef.current, bottomBarRef.current].filter(
        Boolean
      ) as HTMLElement[]

      gsap.set(bars, { scaleY: 1 })
      gsap.set(words, { yPercent: 118 })
      gsap.set(fades, { opacity: 0, y: 18 })

      const tl = gsap.timeline({ paused: true })
      tl.to(bars, { scaleY: 0, duration: 0.95, ease: 'power4.inOut' }, 0)
      lines.forEach((line, li) => {
        line.forEach((w, wi) => {
          tl.to(
            w,
            { yPercent: 0, duration: 1.15, ease: 'power4.out' },
            0.3 + li * 0.14 + wi * 0.035
          )
        })
      })
      tl.to(
        fades,
        { opacity: 1, y: 0, duration: 0.85, ease: 'power3.out', stagger: 0.07 },
        0.75
      )
      heroTlRef.current = tl
    }, hero)

    return () => {
      ctx.revert()
      heroTlRef.current = null
    }
  }, [useScene])

  useEffect(() => {
    if (heroRevealed) heroTlRef.current?.play()
  }, [heroRevealed])

  const scrollToManifesto = () => {
    const target = manifestoRef.current
    if (!target) return
    const lenis = getLenis()
    if (lenis) {
      lenis.scrollTo(target, { duration: 1.6 })
    } else {
      target.scrollIntoView({ behavior: motionDisabled() ? 'auto' : 'smooth' })
    }
  }

  useEffect(() => {
    void Promise.all([
      api.get<{ data: Product[] }>('/products?limit=8'),
      api.get<AuctionLot[]>('/auctions'),
      api.get<MysteryBoxTier[]>('/mystery-boxes'),
    ]).then(([prodRes, aucRes, boxRes]) => {
      setProducts(Array.isArray(prodRes?.data) ? prodRes.data : [])
      setAuctions(Array.isArray(aucRes) ? aucRes : [])
      setBoxes(Array.isArray(boxRes) ? boxRes : [])
    })
  }, [])

  // Live 1s countdown ticker for auction lots
  useEffect(() => {
    const id = window.setInterval(() => {
      setAuctions(prev =>
        prev.map(lot => ({
          ...lot,
          remainingSeconds: secondsUntil(lot.endsAt),
        }))
      )
    }, 1000)
    return () => window.clearInterval(id)
  }, [])

  // GSAP + ScrollTrigger Pinned/Scrubbed Mini-Manifesto narrative
  useEffect(() => {
    if (
      import.meta.env.MODE === 'test' ||
      (typeof navigator !== 'undefined' && navigator.webdriver) ||
      (typeof window.matchMedia === 'function' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches)
    ) {
      return
    }
    const section = manifestoRef.current
    if (!section) return

    const ctx = gsap.context(() => {
      const lines = section.querySelectorAll('.manifesto-line')
      gsap.fromTo(
        lines,
        { opacity: 0.18, y: 28 },
        {
          opacity: 1,
          y: 0,
          stagger: 0.2,
          duration: 0.9,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 75%',
            end: 'bottom 45%',
            scrub: 0.6,
          },
        }
      )
    }, section)

    return () => ctx.revert()
  }, [])

  /* Journal: horizontal-scroll gallery pinned to vertical scroll,
     desktop only. Below lg the track keeps its natural grid/stack. */
  useEffect(() => {
    if (motionDisabled()) return
    const section = journalRef.current
    const track = journalTrackRef.current
    if (!section || !track) return

    const mm = gsap.matchMedia()
    mm.add('(min-width: 1024px)', () => {
      const cards = Array.from(track.children) as HTMLElement[]
      gsap.set(track, {
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'nowrap',
        width: 'max-content',
      })
      gsap.set(cards, { width: '30rem', flexShrink: 0 })
      const getAmount = () => {
        const parent = track.parentElement
        if (!parent) return Math.max(0, track.scrollWidth - section.clientWidth)
        const cs = window.getComputedStyle(parent)
        const pads =
          parseFloat(cs.paddingLeft || '0') + parseFloat(cs.paddingRight || '0')
        return Math.max(0, track.scrollWidth - parent.clientWidth + pads)
      }
      const tween = gsap.to(track, {
        x: () => -getAmount(),
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: () => `+=${getAmount()}`,
          pin: true,
          scrub: 1,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      })
      return () => {
        tween.scrollTrigger?.kill()
        tween.kill()
        gsap.set(track, { clearProps: 'all' })
        gsap.set(cards, { clearProps: 'all' })
      }
    })

    return () => mm.revert()
  }, [])

  const openQuickBid = (lot: AuctionLot) => {
    setQuickBidLot(lot)
    setBidAmount(String(lot.nextMinimumBid))
  }

  const submitQuickBid = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!quickBidLot) return
    try {
      setPlacingBid(true)
      const res = await api.post<{ lot: AuctionLot; extended: boolean }>(
        `/auctions/${quickBidLot.id}/bids`,
        { amount: Number(bidAmount) }
      )
      playChime()
      setAuctions(prev => prev.map(l => (l.id === res.lot.id ? res.lot : l)))
      setQuickBidLot(null)
      toast(
        res.extended
          ? 'Bid Confirmed! Anti-Snipe protocol extended lot clock by +120s.'
          : 'Bid Confirmed! You hold the leading position.',
        'success'
      )
    } catch (err: any) {
      toast(err?.message || 'Bid rejected', 'error')
    } finally {
      setPlacingBid(false)
    }
  }

  const handleConciergeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setSubmittingConcierge(true)
      const ticket = await api.post<ConciergeTicket>('/concierge', {
        itemName: sourcingItem,
        size: sourcingSize,
        targetPrice: Number(sourcingPrice),
        requesterEmail: sourcingEmail || 'collector@enigma.cult',
      })
      playChime()
      toast(
        `Sourcing Dossier #${ticket.id} opened at target ${formatVnd(ticket.targetPrice)}.`,
        'success'
      )
      navigate('/concierge')
    } catch (err: any) {
      toast(err?.message || 'Could not submit sourcing request', 'error')
    } finally {
      setSubmittingConcierge(false)
    }
  }

  return (
    <div ref={pageRef} className="bg-[#0a0a0a] text-[#f9f9f9]">
      {/* 1. HERO — THREE.JS NIGHT GALLERY + RESTRAINED INTERFACE LAYER */}
      <section ref={heroRef} className="relative overflow-hidden bg-[#0a0a0a]">
        {useScene ? (
          <HeroScene
            onReady={() => setCanvasReady(true)}
            onFallback={() => setSceneFailed(true)}
          />
        ) : (
          <div className="absolute inset-0" aria-hidden="true">
            <img
              src="/images/enigma/grail-sneaker-obsidian.jpg"
              alt=""
              className="film-grade h-full w-full object-cover"
            />
          </div>
        )}

        {/* Legibility shade + vignette over the scene */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-[#0a0a0a]/60" />
        <div className="vignette pointer-events-none absolute inset-0" />

        {/* Letterbox bars — GSAP scales them open for the reveal; their
            resting (no-JS / fallback) state is fully retracted */}
        <div
          ref={topBarRef}
          aria-hidden="true"
          className="absolute inset-x-0 top-0 z-30 h-[8vh] origin-top scale-y-0 bg-black"
        />
        <div
          ref={bottomBarRef}
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 z-30 h-[8vh] origin-bottom scale-y-0 bg-black"
        />

        {/* Film-credit corner labels */}
        <span className="hero-fade pointer-events-none absolute left-5 top-5 z-20 font-sans text-[10px] font-medium uppercase tracking-[0.28em] text-[#f9f9f9]/70 md:left-8 md:top-7">
          Enigma — Cult Archive
        </span>
        <span className="hero-fade pointer-events-none absolute right-5 top-5 z-20 font-sans text-[10px] font-medium uppercase tracking-[0.28em] text-[#f9f9f9]/70 md:right-8 md:top-7">
          Autumn / Winter 2026
        </span>
        <span className="hero-fade pointer-events-none absolute bottom-5 left-5 z-20 font-sans text-[10px] font-medium uppercase tracking-[0.28em] text-[#f9f9f9]/70 md:bottom-7 md:left-8">
          Reel N°01 — The Vault Issue
        </span>
        <span className="hero-fade pointer-events-none absolute bottom-5 right-5 z-20 font-sans text-[10px] font-medium uppercase tracking-[0.28em] text-[#f9f9f9]/70 md:bottom-7 md:right-8">
          Saigon · Antwerp · Osaka
        </span>

        {/* Interface layer */}
        <div className="pointer-events-none relative z-10 flex min-h-[100svh] flex-col items-center justify-center px-6 py-24 text-center">
          <p className="hero-fade mb-7 font-sans text-[11px] font-medium uppercase tracking-[0.3em] text-[#f9f9f9]/75">
            The Vault Issue — N°01
          </p>
          <h1
            ref={headlineRef}
            className="relative max-w-6xl font-display leading-[0.98] tracking-tight text-[#f9f9f9]"
            style={{ fontSize: 'clamp(3rem, 8vw, 7.25rem)' }}
          >
            Authenticated Grails, Nocturnal Auctions &amp; <em>Reborn Customs.</em>
          </h1>
          <p className="hero-fade mt-8 max-w-xl text-base leading-relaxed text-[#f9f9f9]/70 md:text-lg">
            Every garment, timepiece, and 1-of-1 horsehide reconstruction enters our
            vault cryptographically sealed.
          </p>
          <button
            type="button"
            aria-label="Scroll down to the manifesto"
            onClick={scrollToManifesto}
            onPointerEnter={() => {
              heroState.hoverTarget = 1
            }}
            onPointerLeave={() => {
              heroState.hoverTarget = 0
            }}
            onFocus={() => {
              heroState.hoverTarget = 1
            }}
            onBlur={() => {
              heroState.hoverTarget = 0
            }}
            className="hero-fade pointer-events-auto mt-12 flex h-16 w-16 items-center justify-center rounded-full border border-[#f9f9f9]/40 bg-[#0a0a0a]/20 text-[#f9f9f9] backdrop-blur-sm transition-colors duration-300 hover:border-[#f9f9f9]"
          >
            <ArrowDown className="h-5 w-5" />
          </button>
        </div>
      </section>

      {/* 2. GSAP SCROLL MANIFESTO */}
      <section
        ref={manifestoRef}
        id="manifesto"
        className="relative overflow-hidden py-24 md:py-32 border-b border-[#f9f9f9]/10"
      >
        <span
          aria-hidden="true"
          className="pointer-events-none select-none absolute right-2 top-6 font-display italic leading-none text-[#f9f9f9]/[0.04] text-[11rem] md:right-14 md:text-[16rem]"
        >
          I
        </span>
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <p className="font-sans text-[11px] font-medium tracking-[0.18em] uppercase text-[#a3a3a3]">
            HOUSE MANIFESTO · CHAPTER I
          </p>
          <h2
            className="manifesto-line font-display text-[#f9f9f9] leading-[1.08]"
            style={{ fontSize: 'clamp(2.1rem, 4.5vw, 4rem)' }}
          >
            “This isn’t fashion — it’s initiation.”
          </h2>
          <p
            className="manifesto-line font-display italic text-[#a3a3a3] leading-[1.18]"
            style={{ fontSize: 'clamp(1.6rem, 3.2vw, 2.75rem)' }}
          >
            Rarity Is Philosophy. Every stitch carries provenance; every auction rejects bots;
            every scar in horsehide outlives seasonal hype.
          </p>
          <div className="manifesto-line pt-4 flex flex-wrap items-center gap-8 font-sans text-[11px] font-medium uppercase tracking-[0.16em] text-[#a3a3a3]">
            <span className="inline-flex items-center gap-2 text-[#f9f9f9]">
              <ShieldCheck className="w-4 h-4 text-[#f9f9f9]" />
              PHYSICAL MULTI-STAGE VERIFICATION
            </span>
            <span>NO ALGORITHMIC DROP BOTS</span>
            <span>DIRECT COLLECTOR CONCIERGE</span>
          </div>
        </div>
      </section>

      {/* 3. CURATED GRAIL DROPS */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-24">
        <div className="relative flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
          <SectionNumeral value="01" className="-top-16 right-0 md:-top-24" />
          <div data-reveal className="relative">
            <p className="font-sans text-[11px] font-medium tracking-[0.18em] uppercase text-[#a3a3a3] mb-2">
              VAULT ALLOCATION · 01
            </p>
            <h2 className="font-display text-3xl md:text-5xl text-[#f9f9f9]">
              Curated Grail Drops
            </h2>
          </div>
          <Link
            to="/products"
            className="relative inline-flex items-center gap-2 font-sans text-[11px] font-medium uppercase tracking-[0.16em] text-[#f9f9f9] hover:text-[#f9f9f9] transition"
          >
            Inspect Full Archive ({products.length}) <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        <div data-reveal className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.slice(0, 8).map(product => (
            <ProductCard
              key={product.id}
              product={product}
              onQuickView={p => setQuickViewProduct(p)}
            />
          ))}
        </div>
      </section>

      {/* 3.5 FULL-BLEED PARALLAX BAND */}
      <section className="relative border-y border-[#f9f9f9]/10">
        <div className="relative h-[54vh] md:h-[66vh] overflow-hidden" data-parallax="12">
          <img
            src="/images/enigma/reborn-atelier.jpg"
            alt="Inside the Reborn atelier"
            className="film-grade absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-[#0a0a0a]/50" />
          <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center">
            <p
              data-reveal
              className="mb-5 font-sans text-[11px] font-medium uppercase tracking-[0.3em] text-[#f9f9f9]/75"
            >
              The Reborn Atelier
            </p>
            <p
              data-reveal
              className="max-w-3xl font-display text-[#f9f9f9] leading-[1.1]"
              style={{ fontSize: 'clamp(1.9rem, 4.2vw, 3.6rem)' }}
            >
              “Every stitch carries <em>provenance</em>.”
            </p>
          </div>
        </div>
      </section>

      {/* 4. LIVE TRENDING GRAIL AUCTIONS */}
      <section className="relative border-b border-[#f9f9f9]/10 py-20 md:py-24">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionNumeral value="02" className="-top-6 right-4 md:right-8" />
          <div
            data-reveal
            className="relative flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12"
          >
            <div>
              <p className="font-sans text-[11px] font-medium tracking-[0.18em] uppercase text-[#a3a3a3] mb-2">
                LIVE BIDDING ROOM · ANTI-SNIPE PROTECTED
              </p>
              <h2 className="font-display text-3xl md:text-5xl text-[#f9f9f9]">
                Trending Grail Auctions
              </h2>
            </div>
            <Link
              to="/auctions"
              className="inline-flex items-center gap-2 font-sans text-[11px] font-medium uppercase tracking-[0.16em] text-[#f9f9f9] hover:text-[#f9f9f9] transition"
            >
              Enter Full Auction Floor <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div data-reveal className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {auctions.slice(0, 3).map(lot => {
              const underMinute = lot.remainingSeconds > 0 && lot.remainingSeconds < 60
              return (
                <article
                  key={lot.id}
                  onMouseEnter={playTick}
                  className="flex flex-col"
                >
                  <div className="relative aspect-[16/11] bg-[#0a0a0a] overflow-hidden">
                    {lot.imageUrl && (
                      <img
                        src={lot.imageUrl}
                        alt={lot.title}
                        className="film-grade w-full h-full object-cover"
                      />
                    )}
                    <div className="absolute top-3 left-3 px-2.5 py-1 bg-[#0a0a0a]/90 border border-[#f9f9f9]/50 font-sans text-[10px] font-medium tracking-[0.16em] uppercase text-[#f9f9f9]">
                      {underMinute ? 'ANTI-SNIPE WINDOW (<60S)' : 'LIVE LOT'}
                    </div>
                    <div className="absolute bottom-3 right-3 px-3 py-1.5 bg-[#0a0a0a]/90 border border-[#f9f9f9]/20 font-sans text-xs text-[#f9f9f9] tabular-nums inline-flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#f9f9f9]" />
                      {formatCountdown(lot.remainingSeconds)}
                    </div>
                  </div>

                  <div className="pt-5 flex-1 flex flex-col justify-between gap-5">
                    <div>
                      <h3 className="font-display text-2xl text-[#f9f9f9] leading-snug mb-1.5">
                        {lot.title}
                      </h3>
                      <p className="text-xs text-[#a3a3a3]">{lot.subtitle}</p>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-[#f9f9f9]/10">
                      <div className="flex items-end justify-between">
                        <div>
                          <span className="block font-sans text-[10px] font-medium uppercase tracking-[0.16em] text-[#a3a3a3]">
                            Current Bid ({lot.bidCount} bids)
                          </span>
                          <span className="font-sans text-lg font-semibold text-[#f9f9f9] tabular-nums">
                            {formatVnd(lot.currentBid)}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="block font-sans text-[10px] font-medium uppercase tracking-[0.16em] text-[#a3a3a3]">
                            Time Left
                          </span>
                          <span className="font-sans text-lg font-semibold text-[#f9f9f9] tabular-nums">
                            {formatCountdown(lot.remainingSeconds)}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2.5">
                        <button
                          type="button"
                          onClick={() => openQuickBid(lot)}
                          className="py-2.5 bg-[#f9f9f9] text-[#0a0a0a] font-sans text-xs font-semibold uppercase tracking-[0.14em] hover:bg-[#d9d9d9] transition inline-flex items-center justify-center gap-1.5"
                        >
                          <Gavel className="w-3.5 h-3.5" /> Quick Bid
                        </button>
                        <Link
                          to="/auctions"
                          className="py-2.5 border border-[#f9f9f9]/20 text-center font-sans text-[11px] font-medium uppercase tracking-[0.16em] text-[#f9f9f9] hover:border-[#f9f9f9] transition"
                        >
                          Bid Log
                        </Link>
                      </div>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        </div>
      </section>

      {/* 5. MYSTERY BOXES & TASTE CODEX SHOWCASE — ASYMMETRIC OFFSET */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center mb-12">
          <div className="lg:col-span-5">
            <div
              className="relative aspect-[3/4] overflow-hidden bg-[#111111]"
              data-reveal-img
            >
              <img
                src="/images/enigma/grail-leather-bomber.jpg"
                alt="Horsehide leather bomber from the Enigma archive"
                className="film-grade absolute inset-0 h-full w-full object-cover"
              />
            </div>
          </div>
          <div
            data-reveal
            className="relative lg:col-span-7 lg:-ml-24 lg:mt-40 lg:bg-[#0a0a0a] lg:p-10 lg:border lg:border-[#f9f9f9]/10"
          >
            <SectionNumeral value="03" className="-top-20 right-2 hidden lg:block" />
            <p className="relative font-sans text-[11px] font-medium tracking-[0.18em] uppercase text-[#a3a3a3] mb-2">
              8-STEP AI STYLE CALIBRATION
            </p>
            <h2 className="relative font-display text-3xl md:text-5xl text-[#f9f9f9] mb-4">
              Sealed Mystery Vaults Matched to Your Taste Codex
            </h2>
            <p className="relative text-sm md:text-base text-[#a3a3a3] max-w-2xl leading-relaxed mb-7">
              Answer eight questions across silhouette, chromatic register, fabric weight, and
              era lineage. Our engine computes your Taste Codex archetype and unlocks sealed chests
              with guaranteed value floors up to 24,500,000₫.
            </p>
            <Link
              to="/mystery-boxes"
              className="relative px-7 py-4 bg-[#f9f9f9] text-[#0a0a0a] font-sans text-xs font-semibold uppercase tracking-[0.14em] hover:bg-[#d9d9d9] transition inline-flex items-center gap-2"
            >
              Start 8-Step Style Quiz <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        <div data-reveal className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {boxes.map((box, idx) => (
            <div
              key={box.id}
              className="border-t border-[#f9f9f9]/12 pt-6 flex flex-col justify-between gap-6"
            >
              <div>
                <div className="flex items-center justify-between font-sans text-[10px] font-medium tracking-[0.16em] uppercase text-[#f9f9f9] mb-3">
                  <span>TIER 0{idx + 1}</span>
                  <span className="tabular-nums">{box.itemCount} ARCHIVE PIECES</span>
                </div>
                <img
                  src={box.imageUrl || '/images/enigma/mystery-chest.jpg'}
                  alt={box.name}
                  className="film-grade w-full h-48 object-cover mb-5"
                />
                <h3 className="font-display text-2xl text-[#f9f9f9] mb-1">{box.name}</h3>
                <p className="text-xs text-[#a3a3a3] leading-relaxed mb-4">{box.description}</p>
              </div>

              <div className="pt-4 border-t border-[#f9f9f9]/10 space-y-3">
                <div className="flex items-baseline justify-between font-sans">
                  <span className="text-lg font-semibold text-[#f9f9f9] tabular-nums">
                    {formatVnd(box.price)}
                  </span>
                  <span className="text-[11px] text-[#f9f9f9] tabular-nums">
                    Floor: {formatVnd(box.guaranteedMinValue)}
                  </span>
                </div>
                <Link
                  to="/mystery-boxes"
                  className="block w-full text-center py-3 border border-[#f9f9f9]/60 text-[#f9f9f9] hover:bg-[#f9f9f9] hover:text-[#0a0a0a] font-sans text-[11px] font-medium uppercase tracking-[0.16em] transition"
                >
                  Unseal &amp; Match Tier
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. INTERACTIVE "FIND IT AT MY PRICE" CONCIERGE SOURCING BUILDER */}
      <section className="relative border-y border-[#f9f9f9]/10 py-20 md:py-24">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <SectionNumeral value="04" className="-top-10 right-4 md:right-8" />
          <div data-reveal className="relative lg:col-span-6 space-y-5">
            <p className="font-sans text-[11px] font-medium tracking-[0.18em] uppercase text-[#a3a3a3] inline-flex items-center gap-2">
              <Crosshair className="w-4 h-4" /> PRIVATE SOURCING DESK
            </p>
            <h2 className="font-display text-3xl md:text-5xl text-[#f9f9f9]">
              Find It At My Price.
            </h2>
            <p className="text-sm md:text-base text-[#a3a3a3] leading-relaxed">
              Hunting an elusive archive runway sample, Tokyo-exclusive sneaker, or discontinued
              chronograph? Name your exact piece, size, and target offer. Our Antwerp, Osaka, and
              Saigon buyers locate, authenticate, and counter or accept directly.
            </p>
            <div className="pt-2">
              <Link
                to="/concierge"
                className="inline-flex items-center gap-2 font-sans text-[11px] font-medium uppercase tracking-[0.16em] text-[#f9f9f9] hover:text-[#f9f9f9]"
              >
                Inspect Active Sourcing Ledger <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <form
            data-reveal
            onSubmit={handleConciergeSubmit}
            className="relative lg:col-span-6 bg-[#0a0a0a] border border-[#f9f9f9]/15 p-6 md:p-8 space-y-5"
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block font-sans text-[10px] font-medium uppercase tracking-[0.16em] text-[#a3a3a3] mb-1.5">
                  Desired Archive Piece
                </label>
                <input
                  type="text"
                  required
                  value={sourcingItem}
                  onChange={e => setSourcingItem(e.target.value)}
                  className="w-full bg-[#111111] border border-[#f9f9f9]/15 px-3.5 py-2.5 text-sm text-[#f9f9f9] focus:outline-none focus:border-[#f9f9f9]"
                />
              </div>
              <div>
                <label className="block font-sans text-[10px] font-medium uppercase tracking-[0.16em] text-[#a3a3a3] mb-1.5">
                  Size Spec
                </label>
                <input
                  type="text"
                  required
                  value={sourcingSize}
                  onChange={e => setSourcingSize(e.target.value)}
                  className="w-full bg-[#111111] border border-[#f9f9f9]/15 px-3.5 py-2.5 text-sm font-sans text-[#f9f9f9] focus:outline-none focus:border-[#f9f9f9]"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-sans text-xs mb-2">
                <span className="text-[#a3a3a3] uppercase tracking-widest">Your Target Offer</span>
                <span className="text-[#f9f9f9] font-semibold tabular-nums">
                  {formatVnd(sourcingPrice)}
                </span>
              </div>
              <input
                type="range"
                min={2500000}
                max={45000000}
                step={500000}
                value={sourcingPrice}
                onChange={e => setSourcingPrice(Number(e.target.value))}
                className="w-full accent-[#f9f9f9]"
              />
              <div className="flex justify-between font-sans text-[10px] text-[#a3a3a3] mt-1 tabular-nums">
                <span>Est. Global Secondary: {formatVnd(Math.round(sourcingPrice * 1.14))}</span>
                <span>Concierge Fee Included</span>
              </div>
            </div>

            <div>
              <label className="block font-sans text-[10px] font-medium uppercase tracking-[0.16em] text-[#a3a3a3] mb-1.5">
                Collector Dispatch Email
              </label>
              <input
                type="email"
                placeholder="collector@enigma.cult"
                value={sourcingEmail}
                onChange={e => setSourcingEmail(e.target.value)}
                className="w-full bg-[#111111] border border-[#f9f9f9]/15 px-3.5 py-2.5 text-sm text-[#f9f9f9] placeholder-[#a3a3a3]/60 focus:outline-none focus:border-[#f9f9f9]"
              />
            </div>

            <button
              type="submit"
              disabled={submittingConcierge}
              className="w-full py-3.5 bg-[#f9f9f9] text-[#0a0a0a] font-sans text-xs font-semibold uppercase tracking-[0.14em] hover:bg-[#d9d9d9] transition"
            >
              {submittingConcierge ? 'TRANSMITTING DOSSIER...' : 'TRANSMIT TARGET OFFER'}
            </button>
          </form>
        </div>
      </section>

      {/* 7. LATEST FROM REBORN EDITORIAL JOURNAL — HORIZONTAL GALLERY ON DESKTOP */}
      <section ref={journalRef} className="relative py-20 md:py-24 overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionNumeral value="05" className="-top-16 right-0 md:-top-20" />
          <div
            data-reveal
            className="relative flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12"
          >
            <div>
              <p className="font-sans text-[11px] font-medium tracking-[0.18em] uppercase text-[#a3a3a3] mb-2">
                REBORN ATELIER CHRONICLES
              </p>
              <h2 className="font-display text-3xl md:text-5xl text-[#f9f9f9]">
                Latest from Reborn
              </h2>
            </div>
            <Link
              to="/journal"
              className="inline-flex items-center gap-2 font-sans text-[11px] font-medium uppercase tracking-[0.16em] text-[#f9f9f9] hover:text-[#f9f9f9]"
            >
              Read All Dossiers <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>

          <div
            ref={journalTrackRef}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {REBORN_JOURNAL_STORIES.map(story => (
              <Link
                key={story.slug}
                to={`/journal?story=${story.slug}`}
                className="group flex flex-col overflow-hidden"
              >
                <div className="aspect-[16/10] bg-[#0a0a0a] overflow-hidden">
                  <img
                    src={story.imageUrl}
                    alt={story.title}
                    className="film-grade w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                </div>
                <div className="pt-5 flex-1 flex flex-col justify-between gap-4">
                  <div>
                    <p className="font-sans text-[10px] font-medium tracking-[0.16em] uppercase text-[#a3a3a3] mb-2">
                      {story.kicker}
                    </p>
                    <h3 className="font-display text-2xl text-[#f9f9f9] leading-snug mb-2">
                      {story.title}
                    </h3>
                    <p className="text-xs text-[#a3a3a3] leading-relaxed line-clamp-3">
                      {story.excerpt}
                    </p>
                  </div>
                  <div className="pt-3 border-t border-[#f9f9f9]/10 flex items-center justify-between font-sans text-[10px] text-[#a3a3a3] uppercase tracking-widest">
                    <span>{story.author}</span>
                    <span>{story.readTime}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* QUICK VIEW MODAL */}
      <QuickViewModal product={quickViewProduct} onClose={() => setQuickViewProduct(null)} />

      {/* QUICK BID MODAL */}
      {quickBidLot && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
          onClick={() => setQuickBidLot(null)}
        >
          <form
            onClick={e => e.stopPropagation()}
            onSubmit={submitQuickBid}
            className="w-full max-w-md bg-[#111111] border border-[#f9f9f9]/50 p-6 md:p-8 space-y-5 text-[#f9f9f9]"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-sans text-[10px] font-medium tracking-[0.16em] uppercase text-[#f9f9f9]">
                  SEAT-HOLD BID CONFIRMATION
                </p>
                <h3 className="font-display text-2xl mt-1">{quickBidLot.title}</h3>
              </div>
              <button
                type="button"
                onClick={() => setQuickBidLot(null)}
                className="text-[#a3a3a3] hover:text-[#f9f9f9]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 bg-[#0a0a0a] border border-[#f9f9f9]/10 flex justify-between font-sans text-xs tabular-nums">
              <span className="text-[#a3a3a3]">MINIMUM VALID BID</span>
              <span className="text-[#f9f9f9] font-semibold">
                {formatVnd(quickBidLot.nextMinimumBid)}
              </span>
            </div>

            <div>
              <label className="block font-sans text-[10px] font-medium uppercase tracking-[0.16em] text-[#a3a3a3] mb-2">
                Your Bid Amount (VND)
              </label>
              <input
                type="number"
                required
                min={quickBidLot.nextMinimumBid}
                step={quickBidLot.minIncrement}
                value={bidAmount}
                onChange={e => setBidAmount(e.target.value)}
                className="w-full bg-[#0a0a0a] border border-[#f9f9f9]/20 px-4 py-3 font-sans text-base text-[#f9f9f9] tabular-nums focus:outline-none focus:border-[#f9f9f9]"
              />
            </div>

            <p className="font-sans text-[10px] text-[#a3a3a3] leading-relaxed">
              Anti-Snipe Protocol: Bids placed inside the final 60 seconds automatically extend lot
              closing by +120s.
            </p>

            <button
              type="submit"
              disabled={placingBid}
              className="w-full py-3.5 bg-[#f9f9f9] text-[#0a0a0a] font-sans text-xs font-semibold uppercase tracking-[0.14em] hover:bg-[#d9d9d9] transition"
            >
              {placingBid ? 'SEALING BID...' : 'CONFIRM BINDING BID'}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
