import React, { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Clock, Gavel, X } from 'lucide-react'
import { api } from '../../../api/apiClient'
import type { AuctionLot } from '../../../types/enigma'
import { formatCountdown, formatVnd, secondsUntil } from '../../../lib/format'
import { subscribeAuctionFeed, type FeedStatus } from '../../../lib/auctionSocket'
import { ResponsiveImage } from '../../media/ResponsiveImage'
import { useSoundStore } from '../../../store/useSoundStore'
import { useToast } from '../../Toast'

/** Bids inside this window extend the lot (mirrors the backend's ANTI_SNIPE_THRESHOLD_MS). */
export const ANTI_SNIPE_WINDOW_S = 60
export const ANTI_SNIPE_EXTENSION_S = 120

/** Ticks on its own so the page does not re-render every second. */
function Countdown({ endsAt, className = '' }: { endsAt: string; className?: string }) {
  const [left, setLeft] = useState(() => secondsUntil(endsAt))
  useEffect(() => {
    setLeft(secondsUntil(endsAt))
    const id = window.setInterval(() => setLeft(secondsUntil(endsAt)), 1000)
    return () => window.clearInterval(id)
  }, [endsAt])
  const hot = left > 0 && left < ANTI_SNIPE_WINDOW_S
  return (
    <span className={`${className} ${hot ? 'text-ember-soft' : ''}`} data-hot={hot || undefined}>
      {left > 0 ? formatCountdown(left) : 'Closed'}
    </span>
  )
}

function useLotClosed(endsAt: string) {
  const [closed, setClosed] = useState(() => secondsUntil(endsAt) <= 0)
  useEffect(() => {
    setClosed(secondsUntil(endsAt) <= 0)
    const left = secondsUntil(endsAt)
    if (left <= 0) return
    const id = window.setTimeout(() => setClosed(true), left * 1000 + 50)
    return () => window.clearTimeout(id)
  }, [endsAt])
  return closed
}

const STATUS_COPY: Record<FeedStatus, string> = {
  live: 'Live feed connected',
  connecting: 'Connecting to the floor…',
  offline: 'Live feed offline — clocks run locally',
}

function LotCard({
  lot,
  flash,
  onBid,
}: {
  lot: AuctionLot
  flash: boolean
  onBid: (lot: AuctionLot) => void
}) {
  const closed = useLotClosed(lot.endsAt) || lot.status !== 'live'
  const lastBids = (lot.bids || []).slice(0, 3)
  return (
    <article className="relative flex flex-col" data-lot={lot.id}>
      <div className="relative aspect-[16/11] overflow-hidden bg-ink-raised">
        {lot.imageUrl && (
          <ResponsiveImage
            sizes="(min-width: 1024px) 33vw, 100vw"
            src={lot.imageUrl}
            alt={lot.title}
            className={`film-grade h-full w-full object-cover transition duration-700 ${closed ? 'grayscale-[0.6] brightness-75' : ''}`}
          />
        )}
        <div className="absolute left-3 top-3 border border-bone/40 bg-ink/90 px-2.5 py-1 font-sans text-[10px] font-medium uppercase tracking-[0.16em] text-bone">
          {closed ? 'Bidding closed · awaiting settlement' : 'Live lot'}
        </div>
        {lot.antiSnipeCount > 0 && (
          <div className="absolute right-3 top-3 border border-ember/60 bg-ink/90 px-2.5 py-1 font-sans text-[10px] font-medium uppercase tracking-[0.16em] text-ember-soft">
            Extended ×{lot.antiSnipeCount}
          </div>
        )}
        {/* the visible +120s: flashes over the lot when the floor extends it */}
        <div
          aria-hidden={!flash}
          className={`pointer-events-none absolute inset-0 flex items-center justify-center bg-ink/55 transition-opacity duration-500 ${flash ? 'opacity-100' : 'opacity-0'}`}
        >
          <span className="font-display text-6xl italic text-ember-soft drop-shadow-[0_0_24px_rgba(200,134,74,0.6)]">
            +{ANTI_SNIPE_EXTENSION_S}s
          </span>
        </div>
        <div className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 border border-bone/20 bg-ink/90 px-3 py-1.5 font-sans text-xs tabular-nums text-bone">
          <Clock aria-hidden="true" className="h-3.5 w-3.5" />
          <Countdown endsAt={lot.endsAt} />
        </div>
      </div>

      <div className="flex flex-1 flex-col justify-between gap-5 pt-5">
        <div>
          <h3 className="mb-1.5 font-display text-2xl leading-snug text-bone">{lot.title}</h3>
          <p className="text-xs text-bone-muted">{lot.subtitle}</p>
        </div>
        <div className="space-y-4 border-t border-bone/10 pt-4">
          <div className="flex items-end justify-between">
            <div>
              <span className="block font-sans text-[10px] font-medium uppercase tracking-[0.16em] text-bone-muted">
                {closed ? 'Final bid' : 'Current bid'} ({lot.bidCount} bids)
              </span>
              <span className="font-sans text-lg font-semibold tabular-nums text-bone">
                {formatVnd(lot.currentBid)}
              </span>
            </div>
            <div className="text-right">
              <span className="block font-sans text-[10px] font-medium uppercase tracking-[0.16em] text-bone-muted">
                Reserve
              </span>
              <span className="font-sans text-sm tabular-nums text-bone">
                {lot.reserveMet ? 'Met' : 'Not yet met'}
              </span>
            </div>
          </div>
          {lastBids.length > 0 && (
            <ol aria-label={`Latest bids on ${lot.title}`} className="space-y-1.5 font-sans text-[11px] tabular-nums text-bone-muted">
              {lastBids.map(b => (
                <li key={b.id} className="flex items-center justify-between gap-3">
                  <span className="truncate">{b.bidderAlias}</span>
                  <span className="flex items-center gap-2 text-bone">
                    {b.triggeredExtension && (
                      <span className="border border-ember/50 px-1.5 text-[10px] text-ember-soft">+{ANTI_SNIPE_EXTENSION_S}s</span>
                    )}
                    {formatVnd(b.amount)}
                  </span>
                </li>
              ))}
            </ol>
          )}
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              disabled={closed}
              onClick={() => onBid(lot)}
              className="inline-flex items-center justify-center gap-1.5 bg-bone py-2.5 font-sans text-xs font-semibold uppercase tracking-[0.14em] text-ink transition hover:bg-bone-dim disabled:cursor-not-allowed disabled:bg-bone/20 disabled:text-bone/60"
            >
              <Gavel aria-hidden="true" className="h-3.5 w-3.5" /> {closed ? 'Closed' : 'Place bid'}
            </button>
            <Link
              to="/auctions"
              className="border border-bone/20 py-2.5 text-center font-sans text-[11px] font-medium uppercase tracking-[0.16em] text-bone transition hover:border-bone"
            >
              Bid log
            </Link>
          </div>
        </div>
      </div>
    </article>
  )
}

export function AuctionsChapter() {
  const { playChime } = useSoundStore()
  const { toast } = useToast()
  const [lots, setLots] = useState<AuctionLot[]>([])
  const [status, setStatus] = useState<FeedStatus>('connecting')
  const [flashId, setFlashId] = useState<number | null>(null)
  const [ticker, setTicker] = useState<string>('')
  const [bidLot, setBidLot] = useState<AuctionLot | null>(null)
  const [amount, setAmount] = useState('')
  const [placing, setPlacing] = useState(false)
  const flashTimer = useRef(0)

  useEffect(() => {
    let alive = true
    void api
      .get<AuctionLot[]>('/auctions')
      .then(res => alive && setLots(Array.isArray(res) ? res : []))
      .catch(() => alive && setLots([]))
    return () => {
      alive = false
    }
  }, [])

  const lotKey = lots.map(l => l.id).join(',')
  useEffect(() => {
    if (!lotKey) return
    const flash = (id: number) => {
      setFlashId(id)
      window.clearTimeout(flashTimer.current)
      flashTimer.current = window.setTimeout(() => setFlashId(null), 2400)
    }
    const off = subscribeAuctionFeed(
      {
        onStatus: setStatus,
        onBid: e => {
          setLots(prev =>
            prev.map(l =>
              l.id === e.auctionId
                ? {
                    ...l,
                    currentBid: e.currentBid,
                    bidCount: e.bidCount,
                    endsAt: e.endsAt,
                    reserveMet: e.reserveMet,
                    bids: [{ ...e.bid, auctionId: e.auctionId }, ...(l.bids || [])],
                  }
                : l
            )
          )
          setTicker(`${e.bid.bidderAlias} bid ${formatVnd(e.bid.amount)} on lot ${String(e.auctionId).padStart(2, '0')}`)
        },
        onExtended: e => {
          setLots(prev =>
            prev.map(l => (l.id === e.auctionId ? { ...l, endsAt: e.endsAt, antiSnipeCount: e.antiSnipeCount } : l))
          )
          setTicker(`Anti-snipe: lot ${String(e.auctionId).padStart(2, '0')} gained +${e.extendedBySeconds}s`)
          flash(e.auctionId)
        },
      },
      lotKey.split(',').map(Number)
    )
    return () => {
      off()
      window.clearTimeout(flashTimer.current)
    }
  }, [lotKey])

  const openBid = (lot: AuctionLot) => {
    setBidLot(lot)
    setAmount(String(lot.nextMinimumBid || lot.currentBid + lot.minIncrement))
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!bidLot) return
    try {
      setPlacing(true)
      const res = await api.post<{ lot: AuctionLot; extended?: boolean; antiSnipeExtended?: boolean }>(
        `/auctions/${bidLot.id}/bids`,
        { amount: Number(amount) }
      )
      playChime()
      const extended = Boolean(res.antiSnipeExtended ?? res.extended)
      setLots(prev => prev.map(l => (l.id === res.lot.id ? { ...l, ...res.lot } : l)))
      if (extended) {
        setFlashId(res.lot.id)
        window.setTimeout(() => setFlashId(null), 2400)
      }
      setBidLot(null)
      toast(
        extended
          ? `Bid placed inside the last minute — the lot clock gained +${ANTI_SNIPE_EXTENSION_S}s.`
          : 'Bid placed. You hold the lead.',
        'success'
      )
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : 'Bid rejected', 'error')
    } finally {
      setPlacing(false)
    }
  }

  return (
    <section aria-labelledby="auctions-title" className="relative border-b border-bone/10 py-20 md:py-28">
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div data-reveal className="mb-12 grid gap-6 md:grid-cols-12 md:items-end">
          <div className="md:col-span-7">
            <p className="mb-3 font-sans text-[11px] font-medium uppercase tracking-[0.3em] text-ember-soft">
              Chapter III — The floor
            </p>
            <h2 id="auctions-title" className="font-display text-4xl leading-[1.02] text-bone md:text-6xl">
              Live auctions, <em>no sniping</em>.
            </h2>
          </div>
          <div className="space-y-4 md:col-span-5">
            <p className="text-sm leading-relaxed text-bone-muted">
              Bids stream in over the live feed. Any bid in the final {ANTI_SNIPE_WINDOW_S} seconds adds{' '}
              <strong className="font-semibold text-ember-soft">+{ANTI_SNIPE_EXTENSION_S}s</strong> to that lot&apos;s clock,
              so everyone gets a fair last word.
            </p>
            <p className="flex items-center gap-2.5 font-sans text-[11px] uppercase tracking-[0.16em] text-bone-muted" role="status">
              <span
                aria-hidden="true"
                className={`h-2 w-2 rounded-full ${status === 'live' ? 'animate-pulse bg-ember' : status === 'connecting' ? 'bg-bone/40' : 'bg-bone/20'}`}
              />
              {STATUS_COPY[status]}
            </p>
            <p aria-live="polite" className="min-h-[1.25rem] font-sans text-xs text-bone">
              {ticker}
            </p>
          </div>
        </div>

        <div data-reveal className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {lots.slice(0, 3).map(lot => (
            <LotCard key={lot.id} lot={lot} flash={flashId === lot.id} onBid={openBid} />
          ))}
        </div>
        <div className="mt-12 flex justify-center">
          <Link
            to="/auctions"
            className="inline-flex items-center gap-2 font-sans text-[11px] font-medium uppercase tracking-[0.16em] text-bone"
          >
            Enter the auction floor <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {bidLot && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="quick-bid-title"
          className="fixed inset-0 z-[110] flex items-center justify-center bg-black/85 p-4 backdrop-blur-md"
          onClick={() => setBidLot(null)}
          onKeyDown={e => e.key === 'Escape' && setBidLot(null)}
        >
          <form
            onSubmit={submit}
            onClick={e => e.stopPropagation()}
            className="w-full max-w-md space-y-5 border border-bone/15 bg-ink-raised p-6 md:p-8"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="mb-1 font-sans text-[10px] font-medium uppercase tracking-[0.16em] text-bone-muted">
                  Place a bid
                </p>
                <h3 id="quick-bid-title" className="font-display text-2xl leading-snug text-bone">
                  {bidLot.title}
                </h3>
              </div>
              <button type="button" aria-label="Close" onClick={() => setBidLot(null)} className="p-1 text-bone-muted hover:text-bone">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex justify-between border border-bone/10 bg-ink p-3.5 font-sans text-xs tabular-nums">
              <span className="text-bone-muted">Minimum valid bid</span>
              <span className="font-semibold text-bone">{formatVnd(bidLot.nextMinimumBid)}</span>
            </div>
            <div>
              <label
                htmlFor="quick-bid-amount"
                className="mb-2 block font-sans text-[10px] font-medium uppercase tracking-[0.16em] text-bone-muted"
              >
                Your bid (VND)
              </label>
              <input
                id="quick-bid-amount"
                type="number"
                required
                autoFocus
                min={bidLot.nextMinimumBid}
                step={bidLot.minIncrement}
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className="w-full border border-bone/20 bg-ink px-4 py-3 font-sans text-base tabular-nums text-bone focus:border-bone focus:outline-none"
              />
            </div>
            <p className="font-sans text-[11px] leading-relaxed text-bone-muted">
              Bids in the final {ANTI_SNIPE_WINDOW_S} seconds extend the lot by +{ANTI_SNIPE_EXTENSION_S}s.
            </p>
            <button
              type="submit"
              disabled={placing}
              className="w-full bg-bone py-3.5 font-sans text-xs font-semibold uppercase tracking-[0.14em] text-ink transition hover:bg-bone-dim"
            >
              {placing ? 'Placing bid…' : 'Confirm binding bid'}
            </button>
          </form>
        </div>
      )}
    </section>
  )
}
