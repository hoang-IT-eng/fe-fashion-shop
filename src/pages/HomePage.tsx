import React, { useEffect, useRef, useState } from 'react'
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
    <div className="bg-[#0a0a0a] text-[#f9f9f9]">
      {/* 1. HERO — EDITORIAL TYPOGRAPHY + 3-IMAGE COLLAGE */}
      <section className="relative border-b border-[#f9f9f9]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12 lg:pt-24 lg:pb-16">
          <p className="font-sans text-[11px] font-medium tracking-[0.18em] uppercase text-[#a3a3a3] mb-6">
            ENIGMA CULT ARCHIVE · AUTUMN / WINTER 2026
          </p>
          <h1
            className="font-display text-[#f9f9f9] leading-[0.98] tracking-tight max-w-5xl"
            style={{ fontSize: 'clamp(2.9rem, 7vw, 6.6rem)' }}
          >
            Authenticated Grails, Nocturnal Auctions &amp; <em>Reborn Customs.</em>
          </h1>
          <p className="text-base md:text-lg text-[#a3a3a3] max-w-xl leading-relaxed mt-7">
            Every garment, timepiece, and 1-of-1 horsehide reconstruction enters our vault
            cryptographically sealed. Acquire drops outright, bid under 60-second anti-snipe
            protection, or decode your 8-step Taste Codex.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-9">
            <Link
              id="hero-explore-drops-cta"
              to="/products"
              className="px-8 py-4 bg-[#f9f9f9] text-[#0a0a0a] font-sans text-xs font-semibold uppercase tracking-[0.14em] hover:bg-[#d9d9d9] transition inline-flex items-center gap-2.5"
            >
              Explore Archive Drops <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              id="hero-decode-style-cta"
              to="/mystery-boxes"
              className="px-7 py-4 border border-[#f9f9f9]/25 text-[#f9f9f9] font-sans text-[11px] font-medium uppercase tracking-[0.16em] hover:border-[#f9f9f9] transition inline-flex items-center gap-2"
            >
              <Compass className="w-4 h-4 text-[#f9f9f9]" />
              Decode Your Style
            </Link>
          </div>
        </div>

        {/* Editorial collage — large left frame, stacked right frames */}
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pb-16 lg:pb-24 grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-7 aspect-[4/3] overflow-hidden bg-[#111111]">
            <img
              src="/images/enigma/grail-sneaker-obsidian.jpg"
              alt="Obsidian grail sneaker from the Enigma archive"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="md:col-span-5 grid grid-rows-2 gap-4">
            <div className="relative overflow-hidden bg-[#111111] min-h-[180px]">
              <img
                src="/images/enigma/grail-leather-bomber.jpg"
                alt="Horsehide leather bomber from the Enigma archive"
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
            <div className="relative overflow-hidden bg-[#111111] min-h-[180px]">
              <img
                src="/images/enigma/grail-trench-monolith.jpg"
                alt="Monolith trench from the Reborn archive"
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 2. GSAP SCROLL MANIFESTO */}
      <section
        ref={manifestoRef}
        className="py-24 md:py-32 border-b border-[#f9f9f9]/10"
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
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
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-24">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
          <div>
            <p className="font-sans text-[11px] font-medium tracking-[0.18em] uppercase text-[#a3a3a3] mb-2">
              VAULT ALLOCATION · 01
            </p>
            <h2 className="font-display text-3xl md:text-5xl text-[#f9f9f9]">
              Curated Grail Drops
            </h2>
          </div>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 font-sans text-[11px] font-medium uppercase tracking-[0.16em] text-[#f9f9f9] hover:text-[#f9f9f9] transition"
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
      <section className="border-y border-[#f9f9f9]/10 py-20 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                        className="w-full h-full object-cover"
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

      {/* 5. MYSTERY BOXES & TASTE CODEX SHOWCASE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center mb-12">
          <div className="lg:col-span-7">
            <p className="font-sans text-[11px] font-medium tracking-[0.18em] uppercase text-[#a3a3a3] mb-2">
              8-STEP AI STYLE CALIBRATION
            </p>
            <h2 className="font-display text-3xl md:text-5xl text-[#f9f9f9] mb-4">
              Sealed Mystery Vaults Matched to Your Taste Codex
            </h2>
            <p className="text-sm md:text-base text-[#a3a3a3] max-w-2xl leading-relaxed">
              Answer eight questions across silhouette, chromatic register, fabric weight, and
              era lineage. Our engine computes your Taste Codex archetype and unlocks sealed chests
              with guaranteed value floors up to 24,500,000₫.
            </p>
          </div>
          <div className="lg:col-span-5 flex lg:justify-end">
            <Link
              to="/mystery-boxes"
              className="px-7 py-4 bg-[#f9f9f9] text-[#0a0a0a] font-sans text-xs font-semibold uppercase tracking-[0.14em] hover:bg-[#d9d9d9] transition inline-flex items-center gap-2"
            >
              Start 8-Step Style Quiz <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                  className="w-full h-48 object-cover mb-5"
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
      <section className="border-y border-[#f9f9f9]/10 py-20 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-5">
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
            onSubmit={handleConciergeSubmit}
            className="lg:col-span-6 bg-[#0a0a0a] border border-[#f9f9f9]/15 p-6 md:p-8 space-y-5"
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

      {/* 7. LATEST FROM REBORN EDITORIAL JOURNAL */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-24">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
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
