import React, { Suspense, lazy, useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import {
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
import { useSoundStore } from '../store/useSoundStore'
import { useToast } from '../components/Toast'

if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
  gsap.registerPlugin(ScrollTrigger)
}

const HeroMonolithScene = lazy(
  () => import('../components/experience/HeroMonolithScene')
)

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
    <div className="bg-[#070709] text-[#ece5d8]">
      {/* 1. HERO — CHIAROSCURO SKY + 3D MONOLITH + EDITORIAL TYPOGRAPHY */}
      <section className="relative min-h-[88vh] flex items-center overflow-hidden border-b border-[#ece5d8]/10">
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-40 bg-cover bg-center"
          style={{ backgroundImage: 'url(/images/enigma/chiaroscuro-sky.jpg)' }}
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-b from-[#070709]/60 via-[#070709]/70 to-[#070709]"
        />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 w-full grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7 space-y-7">
            <p className="font-mono text-xs tracking-[0.34em] uppercase text-[#cfa156]">
              ENIGMA CULT ARCHIVE · AUTUMN / WINTER 2026
            </p>
            <h1
              className="font-display text-[#ece5d8] leading-[0.98] tracking-tight"
              style={{ fontSize: 'clamp(2.85rem, 6.2vw, 5.6rem)' }}
            >
              Authenticated Grails, Nocturnal Auctions &amp; Reborn Customs.
            </h1>
            <p className="text-base md:text-lg text-[#9a948a] max-w-xl leading-relaxed">
              Every garment, timepiece, and 1-of-1 horsehide reconstruction enters our vault
              cryptographically sealed. Acquire drops outright, bid under 60-second anti-snipe
              protection, or decode your 8-step Taste Codex.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                id="hero-explore-drops-cta"
                to="/products"
                className="px-8 py-4 bg-[#cfa156] text-[#070709] font-mono text-xs font-semibold uppercase tracking-[0.24em] hover:bg-[#dec37b] transition inline-flex items-center gap-2.5"
              >
                Explore Archive Drops <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                id="hero-decode-style-cta"
                to="/mystery-boxes"
                className="px-7 py-4 border border-[#ece5d8]/25 text-[#ece5d8] font-mono text-xs uppercase tracking-[0.24em] hover:border-[#cfa156] hover:text-[#cfa156] transition inline-flex items-center gap-2"
              >
                <Compass className="w-4 h-4 text-[#cfa156]" />
                Decode Your Style
              </Link>
            </div>

            {/* Architectural Telemetry Bar */}
            <div className="pt-8 border-t border-[#ece5d8]/10 grid grid-cols-3 gap-6 max-w-lg">
              <div>
                <p className="font-mono text-xl md:text-2xl text-[#ece5d8] font-semibold tabular-nums">
                  100%
                </p>
                <p className="font-mono text-[10px] tracking-[0.22em] text-[#9a948a] uppercase mt-1">
                  NFC Provenance
                </p>
              </div>
              <div>
                <p className="font-mono text-xl md:text-2xl text-[#cfa156] font-semibold tabular-nums">
                  +120s
                </p>
                <p className="font-mono text-[10px] tracking-[0.22em] text-[#9a948a] uppercase mt-1">
                  Anti-Snipe Clock
                </p>
              </div>
              <div>
                <p className="font-mono text-xl md:text-2xl text-[#ece5d8] font-semibold tabular-nums">
                  1-of-12
                </p>
                <p className="font-mono text-[10px] tracking-[0.22em] text-[#9a948a] uppercase mt-1">
                  Reborn Editions
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 h-[360px] md:h-[480px]">
            <Suspense
              fallback={
                <div className="w-full h-full flex items-center justify-center font-mono text-xs text-[#9a948a]">
                  CALIBRATING MONOLITH...
                </div>
              }
            >
              <HeroMonolithScene />
            </Suspense>
          </div>
        </div>
      </section>

      {/* 2. GSAP SCROLL MANIFESTO */}
      <section
        ref={manifestoRef}
        className="py-24 md:py-32 border-b border-[#ece5d8]/10 bg-[#0b0b0f]"
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <p className="font-mono text-xs tracking-[0.34em] uppercase text-[#cfa156]">
            HOUSE MANIFESTO · CHAPTER I
          </p>
          <h2
            className="manifesto-line font-display text-[#ece5d8] leading-[1.08]"
            style={{ fontSize: 'clamp(2.1rem, 4.5vw, 4rem)' }}
          >
            “This isn’t fashion — it’s initiation.”
          </h2>
          <p
            className="manifesto-line font-display italic text-[#9a948a] leading-[1.18]"
            style={{ fontSize: 'clamp(1.6rem, 3.2vw, 2.75rem)' }}
          >
            Rarity Is Philosophy. Every stitch carries provenance; every auction rejects bots;
            every scar in horsehide outlives seasonal hype.
          </p>
          <div className="manifesto-line pt-4 flex flex-wrap items-center gap-8 font-mono text-xs uppercase tracking-[0.24em] text-[#9a948a]">
            <span className="inline-flex items-center gap-2 text-[#ece5d8]">
              <ShieldCheck className="w-4 h-4 text-[#cfa156]" />
              PHYSICAL MULTI-STAGE VERIFICATION
            </span>
            <span>NO ALGORITHMIC DROP BOTS</span>
            <span>DIRECT COLLECTOR CONCIERGE</span>
          </div>
        </div>
      </section>

      {/* 3. CURATED GRAIL DROPS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-24">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
          <div>
            <p className="font-mono text-xs tracking-[0.3em] uppercase text-[#cfa156] mb-2">
              VAULT ALLOCATION · 01
            </p>
            <h2 className="font-display text-3xl md:text-5xl text-[#ece5d8]">
              Curated Grail Drops
            </h2>
          </div>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.24em] text-[#ece5d8] hover:text-[#cfa156] transition"
          >
            Inspect Full Archive ({products.length}) <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.slice(0, 8).map(product => (
            <ProductCard
              key={product.id}
              product={product}
              onQuickView={p => setQuickViewProduct(p)}
            />
          ))}
        </div>
      </section>

      {/* 4. LIVE TRENDING GRAIL AUCTIONS */}
      <section className="border-y border-[#ece5d8]/10 bg-[#0b0b0f] py-20 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
            <div>
              <p className="font-mono text-xs tracking-[0.3em] uppercase text-[#cfa156] mb-2">
                LIVE BIDDING ROOM · ANTI-SNIPE PROTECTED
              </p>
              <h2 className="font-display text-3xl md:text-5xl text-[#ece5d8]">
                Trending Grail Auctions
              </h2>
            </div>
            <Link
              to="/auctions"
              className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.24em] text-[#cfa156] hover:text-[#ece5d8] transition"
            >
              Enter Full Auction Floor <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {auctions.slice(0, 3).map(lot => {
              const underMinute = lot.remainingSeconds > 0 && lot.remainingSeconds < 60
              return (
                <article
                  key={lot.id}
                  onMouseEnter={playTick}
                  className="bg-[#111115] border border-[#ece5d8]/12 hover:border-[#cfa156]/60 transition flex flex-col"
                >
                  <div className="relative aspect-[16/11] bg-[#070709] overflow-hidden">
                    {lot.imageUrl && (
                      <img
                        src={lot.imageUrl}
                        alt={lot.title}
                        className="w-full h-full object-cover"
                      />
                    )}
                    <div className="absolute top-3 left-3 px-2.5 py-1 bg-[#070709]/90 border border-[#cfa156]/50 font-mono text-[10px] tracking-[0.2em] uppercase text-[#cfa156]">
                      {underMinute ? 'ANTI-SNIPE WINDOW (<60S)' : 'LIVE LOT'}
                    </div>
                    <div className="absolute bottom-3 right-3 px-3 py-1.5 bg-[#070709]/90 border border-[#ece5d8]/20 font-mono text-xs text-[#ece5d8] tabular-nums inline-flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#cfa156]" />
                      {formatCountdown(lot.remainingSeconds)}
                    </div>
                  </div>

                  <div className="p-6 flex-1 flex flex-col justify-between gap-5">
                    <div>
                      <h3 className="font-display text-2xl text-[#ece5d8] leading-snug mb-1.5">
                        {lot.title}
                      </h3>
                      <p className="text-xs text-[#9a948a]">{lot.subtitle}</p>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-[#ece5d8]/10">
                      <div className="flex items-end justify-between">
                        <div>
                          <span className="block font-mono text-[10px] uppercase tracking-widest text-[#9a948a]">
                            Current Bid ({lot.bidCount} bids)
                          </span>
                          <span className="font-mono text-lg font-semibold text-[#cfa156] tabular-nums">
                            {formatVnd(lot.currentBid)}
                          </span>
                        </div>
                        <span className="font-mono text-[10px] uppercase tracking-widest text-[#9a948a] tabular-nums">
                          Next: {formatVnd(lot.nextMinimumBid)}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2.5">
                        <button
                          type="button"
                          onClick={() => openQuickBid(lot)}
                          className="py-2.5 bg-[#cfa156] text-[#070709] font-mono text-xs font-semibold uppercase tracking-widest hover:bg-[#dec37b] transition inline-flex items-center justify-center gap-1.5"
                        >
                          <Gavel className="w-3.5 h-3.5" /> Quick Bid
                        </button>
                        <Link
                          to="/auctions"
                          className="py-2.5 border border-[#ece5d8]/20 text-center font-mono text-xs uppercase tracking-widest text-[#ece5d8] hover:border-[#cfa156] transition"
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

      {/* 5. MYSTERY BOXES & TASTE CODEX SHOWCASE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center mb-12">
          <div className="lg:col-span-7">
            <p className="font-mono text-xs tracking-[0.3em] uppercase text-[#cfa156] mb-2">
              8-STEP AI STYLE CALIBRATION
            </p>
            <h2 className="font-display text-3xl md:text-5xl text-[#ece5d8] mb-4">
              Sealed Mystery Vaults Matched to Your Taste Codex
            </h2>
            <p className="text-sm md:text-base text-[#9a948a] max-w-2xl leading-relaxed">
              Answer eight questions across silhouette, chromatic register, fabric weight, and
              era lineage. Our engine computes your Taste Codex archetype and unlocks sealed chests
              with guaranteed value floors up to 24,500,000₫.
            </p>
          </div>
          <div className="lg:col-span-5 flex lg:justify-end">
            <Link
              to="/mystery-boxes"
              className="px-7 py-4 bg-[#cfa156] text-[#070709] font-mono text-xs font-semibold uppercase tracking-[0.24em] hover:bg-[#dec37b] transition inline-flex items-center gap-2"
            >
              Start 8-Step Style Quiz <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {boxes.map((box, idx) => (
            <div
              key={box.id}
              className="bg-[#111115] border border-[#ece5d8]/12 p-6 flex flex-col justify-between gap-6"
            >
              <div>
                <div className="flex items-center justify-between font-mono text-[10px] tracking-[0.24em] uppercase text-[#cfa156] mb-3">
                  <span>TIER 0{idx + 1}</span>
                  <span className="tabular-nums">{box.itemCount} ARCHIVE PIECES</span>
                </div>
                <img
                  src={box.imageUrl || '/images/enigma/mystery-chest.jpg'}
                  alt={box.name}
                  className="w-full h-48 object-cover mb-5 border border-[#ece5d8]/10"
                />
                <h3 className="font-display text-2xl text-[#ece5d8] mb-1">{box.name}</h3>
                <p className="text-xs text-[#9a948a] leading-relaxed mb-4">{box.description}</p>
              </div>

              <div className="pt-4 border-t border-[#ece5d8]/10 space-y-3">
                <div className="flex items-baseline justify-between font-mono">
                  <span className="text-lg font-semibold text-[#ece5d8] tabular-nums">
                    {formatVnd(box.price)}
                  </span>
                  <span className="text-[11px] text-[#cfa156] tabular-nums">
                    Floor: {formatVnd(box.guaranteedMinValue)}
                  </span>
                </div>
                <Link
                  to="/mystery-boxes"
                  className="block w-full text-center py-3 border border-[#cfa156]/60 text-[#cfa156] hover:bg-[#cfa156] hover:text-[#070709] font-mono text-xs uppercase tracking-[0.22em] transition"
                >
                  Unseal &amp; Match Tier
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. INTERACTIVE "FIND IT AT MY PRICE" CONCIERGE SOURCING BUILDER */}
      <section className="border-y border-[#ece5d8]/10 bg-[#111115] py-20 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-5">
            <p className="font-mono text-xs tracking-[0.3em] uppercase text-[#cfa156] inline-flex items-center gap-2">
              <Crosshair className="w-4 h-4" /> PRIVATE SOURCING DESK
            </p>
            <h2 className="font-display text-3xl md:text-5xl text-[#ece5d8]">
              Find It At My Price.
            </h2>
            <p className="text-sm md:text-base text-[#9a948a] leading-relaxed">
              Hunting an elusive archive runway sample, Tokyo-exclusive sneaker, or discontinued
              chronograph? Name your exact piece, size, and target offer. Our Antwerp, Osaka, and
              Saigon buyers locate, authenticate, and counter or accept directly.
            </p>
            <div className="pt-2">
              <Link
                to="/concierge"
                className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.22em] text-[#cfa156] hover:text-[#ece5d8]"
              >
                Inspect Active Sourcing Ledger <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <form
            onSubmit={handleConciergeSubmit}
            className="lg:col-span-6 bg-[#070709] border border-[#ece5d8]/15 p-6 md:p-8 space-y-5"
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block font-mono text-[10px] uppercase tracking-widest text-[#9a948a] mb-1.5">
                  Desired Archive Piece
                </label>
                <input
                  type="text"
                  required
                  value={sourcingItem}
                  onChange={e => setSourcingItem(e.target.value)}
                  className="w-full bg-[#111115] border border-[#ece5d8]/15 px-3.5 py-2.5 text-sm text-[#ece5d8] focus:outline-none focus:border-[#cfa156]"
                />
              </div>
              <div>
                <label className="block font-mono text-[10px] uppercase tracking-widest text-[#9a948a] mb-1.5">
                  Size Spec
                </label>
                <input
                  type="text"
                  required
                  value={sourcingSize}
                  onChange={e => setSourcingSize(e.target.value)}
                  className="w-full bg-[#111115] border border-[#ece5d8]/15 px-3.5 py-2.5 text-sm font-mono text-[#ece5d8] focus:outline-none focus:border-[#cfa156]"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-mono text-xs mb-2">
                <span className="text-[#9a948a] uppercase tracking-widest">Your Target Offer</span>
                <span className="text-[#cfa156] font-semibold tabular-nums">
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
                className="w-full accent-[#cfa156]"
              />
              <div className="flex justify-between font-mono text-[10px] text-[#9a948a] mt-1 tabular-nums">
                <span>Est. Global Secondary: {formatVnd(Math.round(sourcingPrice * 1.14))}</span>
                <span>Concierge Fee Included</span>
              </div>
            </div>

            <div>
              <label className="block font-mono text-[10px] uppercase tracking-widest text-[#9a948a] mb-1.5">
                Collector Dispatch Email
              </label>
              <input
                type="email"
                placeholder="collector@enigma.cult"
                value={sourcingEmail}
                onChange={e => setSourcingEmail(e.target.value)}
                className="w-full bg-[#111115] border border-[#ece5d8]/15 px-3.5 py-2.5 text-sm text-[#ece5d8] placeholder-[#9a948a]/60 focus:outline-none focus:border-[#cfa156]"
              />
            </div>

            <button
              type="submit"
              disabled={submittingConcierge}
              className="w-full py-3.5 bg-[#cfa156] text-[#070709] font-mono text-xs font-semibold uppercase tracking-[0.24em] hover:bg-[#dec37b] transition"
            >
              {submittingConcierge ? 'TRANSMITTING DOSSIER...' : 'TRANSMIT TARGET OFFER'}
            </button>
          </form>
        </div>
      </section>

      {/* 7. LATEST FROM REBORN EDITORIAL JOURNAL */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-24">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
          <div>
            <p className="font-mono text-xs tracking-[0.3em] uppercase text-[#cfa156] mb-2">
              REBORN ATELIER CHRONICLES
            </p>
            <h2 className="font-display text-3xl md:text-5xl text-[#ece5d8]">
              Latest from Reborn
            </h2>
          </div>
          <Link
            to="/journal"
            className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.24em] text-[#ece5d8] hover:text-[#cfa156]"
          >
            Read All Dossiers <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {REBORN_JOURNAL_STORIES.map(story => (
            <Link
              key={story.slug}
              to={`/journal?story=${story.slug}`}
              className="group bg-[#111115] border border-[#ece5d8]/10 hover:border-[#cfa156]/50 transition flex flex-col overflow-hidden"
            >
              <div className="aspect-[16/10] bg-[#070709] overflow-hidden">
                <img
                  src={story.imageUrl}
                  alt={story.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </div>
              <div className="p-6 flex-1 flex flex-col justify-between gap-4">
                <div>
                  <p className="font-mono text-[10px] tracking-[0.24em] uppercase text-[#cfa156] mb-2">
                    {story.kicker}
                  </p>
                  <h3 className="font-display text-2xl text-[#ece5d8] group-hover:text-[#cfa156] transition leading-snug mb-2">
                    {story.title}
                  </h3>
                  <p className="text-xs text-[#9a948a] leading-relaxed line-clamp-3">
                    {story.excerpt}
                  </p>
                </div>
                <div className="pt-3 border-t border-[#ece5d8]/10 flex items-center justify-between font-mono text-[10px] text-[#9a948a] uppercase tracking-widest">
                  <span>{story.author}</span>
                  <span>{story.readTime}</span>
                </div>
              </div>
            </Link>
          ))}
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
            className="w-full max-w-md bg-[#111115] border border-[#cfa156]/50 p-6 md:p-8 space-y-5 text-[#ece5d8]"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-mono text-[10px] tracking-[0.26em] uppercase text-[#cfa156]">
                  SEAT-HOLD BID CONFIRMATION
                </p>
                <h3 className="font-display text-2xl mt-1">{quickBidLot.title}</h3>
              </div>
              <button
                type="button"
                onClick={() => setQuickBidLot(null)}
                className="text-[#9a948a] hover:text-[#ece5d8]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 bg-[#070709] border border-[#ece5d8]/10 flex justify-between font-mono text-xs tabular-nums">
              <span className="text-[#9a948a]">MINIMUM VALID BID</span>
              <span className="text-[#cfa156] font-semibold">
                {formatVnd(quickBidLot.nextMinimumBid)}
              </span>
            </div>

            <div>
              <label className="block font-mono text-[10px] uppercase tracking-widest text-[#9a948a] mb-2">
                Your Bid Amount (VND)
              </label>
              <input
                type="number"
                required
                min={quickBidLot.nextMinimumBid}
                step={quickBidLot.minIncrement}
                value={bidAmount}
                onChange={e => setBidAmount(e.target.value)}
                className="w-full bg-[#070709] border border-[#ece5d8]/20 px-4 py-3 font-mono text-base text-[#ece5d8] tabular-nums focus:outline-none focus:border-[#cfa156]"
              />
            </div>

            <p className="font-mono text-[10px] text-[#9a948a] leading-relaxed">
              Anti-Snipe Protocol: Bids placed inside the final 60 seconds automatically extend lot
              closing by +120s.
            </p>

            <button
              type="submit"
              disabled={placingBid}
              className="w-full py-3.5 bg-[#cfa156] text-[#070709] font-mono text-xs font-semibold uppercase tracking-[0.24em] hover:bg-[#dec37b] transition"
            >
              {placingBid ? 'SEALING BID...' : 'CONFIRM BINDING BID'}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
