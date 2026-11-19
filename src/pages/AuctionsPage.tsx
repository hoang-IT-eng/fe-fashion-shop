import React, { useEffect, useState } from 'react'
import { Gavel, Clock, ShieldAlert, History, CheckCircle2, X } from 'lucide-react'
import { api } from '../api/apiClient'
import { AuctionLot } from '../types/enigma'
import { formatCountdown, formatVnd, secondsUntil } from '../lib/format'
import Breadcrumb from '../components/Breadcrumb'
import { useSoundStore } from '../store/useSoundStore'
import { useToast } from '../components/Toast'
import { subscribeAuctionFeed, type FeedStatus } from '../lib/auctionSocket'

export default function AuctionsPage() {
  const { playTick, playChime } = useSoundStore()
  const { toast } = useToast()

  const [lots, setLots] = useState<AuctionLot[]>([])
  const [selectedLotId, setSelectedLotId] = useState<number | null>(null)
  const [confirmBidLot, setConfirmBidLot] = useState<AuctionLot | null>(null)
  const [bidAmount, setBidAmount] = useState('')
  const [bidderAlias, setBidderAlias] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    void api.get<AuctionLot[]>('/auctions').then(data => {
      const arr = Array.isArray(data) ? data : []
      setLots(arr)
      if (arr.length > 0) setSelectedLotId(arr[0].id)
    })
  }, [])

  useEffect(() => {
    const timer = window.setInterval(() => {
      setLots(prev =>
        prev.map(l => ({
          ...l,
          remainingSeconds: secondsUntil(l.endsAt),
        }))
      )
    }, 1000)
    return () => window.clearInterval(timer)
  }, [])

  // live floor over Socket.IO: bids and +120s anti-snipe extensions from other collectors
  const [feed, setFeed] = useState<FeedStatus>('connecting')
  const [extendedFlash, setExtendedFlash] = useState<string>('')
  const lotKey = lots.map(l => l.id).join(',')
  useEffect(() => {
    if (!lotKey) return
    let flashTimer = 0
    const off = subscribeAuctionFeed(
      {
        onStatus: setFeed,
        onBid: e =>
          setLots(prev =>
            prev.map(l =>
              l.id === e.auctionId
                ? {
                    ...l,
                    currentBid: e.currentBid,
                    bidCount: e.bidCount,
                    endsAt: e.endsAt,
                    reserveMet: e.reserveMet,
                    remainingSeconds: secondsUntil(e.endsAt),
                    nextMinimumBid: e.currentBid + l.minIncrement,
                    bids: [{ ...e.bid, auctionId: e.auctionId }, ...(l.bids || [])],
                  }
                : l
            )
          ),
        onExtended: e => {
          setLots(prev =>
            prev.map(l =>
              l.id === e.auctionId
                ? { ...l, endsAt: e.endsAt, antiSnipeCount: e.antiSnipeCount, remainingSeconds: secondsUntil(e.endsAt) }
                : l
            )
          )
          setExtendedFlash(`Lot ${String(e.auctionId).padStart(2, '0')} extended +${e.extendedBySeconds}s`)
          window.clearTimeout(flashTimer)
          flashTimer = window.setTimeout(() => setExtendedFlash(''), 4000)
        },
      },
      lotKey.split(',').map(Number)
    )
    return () => {
      off()
      window.clearTimeout(flashTimer)
    }
  }, [lotKey])

  const activeLot = lots.find(l => l.id === selectedLotId) || lots[0] || null

  const openBidModal = (lot: AuctionLot, customAmount?: number) => {
    setConfirmBidLot(lot)
    setBidAmount(String(customAmount || lot.nextMinimumBid))
  }

  const handleConfirmBid = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!confirmBidLot) return
    try {
      setSubmitting(true)
      const res = await api.post<{ lot: AuctionLot; extended?: boolean; antiSnipeExtended?: boolean }>(
        `/auctions/${confirmBidLot.id}/bids`,
        {
          amount: Number(bidAmount),
          ...(bidderAlias.trim() ? { bidderAlias: bidderAlias.trim().toUpperCase() } : {}),
        }
      )
      playChime()
      setLots(prev => prev.map(l => (l.id === res.lot.id ? res.lot : l)))
      setSelectedLotId(res.lot.id)
      setConfirmBidLot(null)
      toast(
        (res.antiSnipeExtended ?? res.extended)
          ? 'ANTI-SNIPE TRIGGERED! Bid accepted & closing clock extended by +120s.'
          : 'Binding Bid Accepted! Your alias leads the Grail Lot.',
        'success'
      )
    } catch (err: any) {
      toast(err?.message || 'Bid rejected by Vault Desk', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-ink text-bone py-10 md:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Breadcrumb items={[{ label: 'Archive', path: '/' }, { label: 'Live Grail Auctions' }]} />
        <div className="mt-4 flex flex-wrap items-center gap-4 font-sans text-[11px] uppercase tracking-[0.16em] text-bone-muted" role="status">
          <span className="inline-flex items-center gap-2">
            <span aria-hidden="true" className={`h-2 w-2 rounded-full ${feed === 'live' ? 'animate-pulse bg-ember' : 'bg-bone/30'}`} />
            {feed === 'live' ? 'Live feed connected' : feed === 'connecting' ? 'Connecting to the floor…' : 'Live feed offline'}
          </span>
          {extendedFlash && <span className="border border-ember/60 px-2 py-0.5 text-ember-soft">{extendedFlash}</span>}
        </div>

        {/* Header + Anti-Snipe Rule Banner */}
        <div className="pb-10 border-b border-bone/10 mb-10 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div>
            <p className="font-sans text-[11px] font-medium tracking-[0.18em] uppercase text-bone-muted mb-2">
              REAL-TIME COLLECTOR FLOOR · OPEN-BOOK LEDGER
            </p>
            <h1 className="font-display text-4xl md:text-6xl text-bone">
              Live Grail Auctions
            </h1>
          </div>

          <div className="p-4 bg-ink-raised border border-bone/40 max-w-md flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-bone flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-sans text-[11px] font-medium uppercase tracking-[0.16em] text-bone">
                60-Second Anti-Snipe Protocol
              </p>
              <p className="text-xs text-bone-muted leading-relaxed mt-0.5">
                Any valid bid placed with &lt;60s remaining automatically extends the lot timer by{' '}
                <strong className="text-bone">+120 seconds</strong> to eliminate sniper bots.
              </p>
            </div>
          </div>
        </div>

        {/* Lot Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-7 space-y-6">
            {lots.map(lot => {
              const under60 = lot.remainingSeconds > 0 && lot.remainingSeconds < 60
              const isSelected = activeLot?.id === lot.id
              return (
                <article
                  key={lot.id}
                  onMouseEnter={playTick}
                  onClick={() => setSelectedLotId(lot.id)}
                  className={`cursor-pointer border transition grid grid-cols-1 sm:grid-cols-12 overflow-hidden ${
                    isSelected
                      ? 'border-bone'
                      : 'border-bone/12 hover:border-bone/35'
                  }`}
                >
                  <div className="sm:col-span-5 relative aspect-[4/3] sm:aspect-auto bg-ink">
                    {lot.imageUrl && (
                      <img
                        src={lot.imageUrl}
                        alt={lot.title}
                        className="w-full h-full object-cover"
                      />
                    )}
                    <span
                      className={`absolute top-3 left-3 px-2.5 py-1 font-sans text-[10px] font-medium uppercase tracking-[0.16em] border ${
                        under60
                          ? 'bg-bone text-ink border-bone font-semibold'
                          : 'bg-ink/90 text-bone border-bone/40'
                      }`}
                    >
                      {under60 ? 'ANTI-SNIPE ACTIVE (<60S)' : lot.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="sm:col-span-7 p-6 flex flex-col justify-between gap-4">
                    <div>
                      <h2 className="font-display text-2xl text-bone leading-snug mb-1">
                        {lot.title}
                      </h2>
                      <p className="text-xs text-bone-muted">{lot.subtitle}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 py-3 border-y border-bone/10 font-sans">
                      <div>
                        <span className="block text-[10px] uppercase tracking-widest text-bone-muted">
                          Current Bid ({lot.bidCount})
                        </span>
                        <span className="text-lg font-semibold text-bone tabular-nums">
                          {formatVnd(lot.currentBid)}
                        </span>
                      </div>
                      <div>
                        <span className="block text-[10px] uppercase tracking-widest text-bone-muted">
                          Time Left
                        </span>
                        <span className="text-lg font-semibold text-bone tabular-nums inline-flex items-center gap-1.5">
                          <Clock className="w-4 h-4 text-bone" />
                          {formatCountdown(lot.remainingSeconds)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-3">
                      <span className="font-sans text-[10px] font-medium uppercase tracking-[0.16em] text-bone-muted">
                        {lot.reserveMet ? '✓ RESERVE MET' : 'RESERVE PENDING'}
                        {lot.antiSnipeCount > 0 ? ` · +${lot.antiSnipeCount} EXTENSIONS` : ''}
                      </span>
                      <button
                        type="button"
                        disabled={lot.status !== 'live' || lot.remainingSeconds <= 0}
                        onClick={e => {
                          e.stopPropagation()
                          openBidModal(lot)
                        }}
                        className="px-5 py-2.5 bg-bone text-ink font-sans text-xs font-semibold uppercase tracking-[0.14em] hover:bg-bone-dim disabled:opacity-40 transition inline-flex items-center gap-1.5"
                      >
                        <Gavel className="w-3.5 h-3.5" />
                        Bid {formatVnd(lot.nextMinimumBid)}
                      </button>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>

          {/* Live Bid Ledger Inspector */}
          <aside className="lg:col-span-5">
            {activeLot && (
              <div className="sticky top-28 bg-ink-raised border border-bone/15 p-6 md:p-7 space-y-6">
                <div>
                  <p className="font-sans text-[10px] font-medium tracking-[0.16em] uppercase text-bone mb-1">
                    LIVE LOT DOSSIER &amp; BID FEED
                  </p>
                  <h2 className="font-display text-2xl text-bone">{activeLot.title}</h2>
                </div>

                <div className="grid grid-cols-3 gap-2 bg-ink p-3.5 border border-bone/10 font-sans text-xs">
                  <div>
                    <span className="block text-[9px] text-bone-muted uppercase">Start</span>
                    <span className="tabular-nums">{formatVnd(activeLot.startingBid)}</span>
                  </div>
                  <div>
                    <span className="block text-[9px] text-bone-muted uppercase">Increment</span>
                    <span className="tabular-nums">+{formatVnd(activeLot.minIncrement)}</span>
                  </div>
                  <div>
                    <span className="block text-[9px] text-bone-muted uppercase">Next Min</span>
                    <span className="text-bone tabular-nums">
                      {formatVnd(activeLot.nextMinimumBid)}
                    </span>
                  </div>
                </div>

                {/* Quick Step Bid Buttons */}
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => openBidModal(activeLot, activeLot.nextMinimumBid)}
                    className="py-3 bg-bone text-ink font-sans text-xs font-semibold uppercase tracking-[0.14em] hover:bg-bone-dim transition tabular-nums"
                  >
                    Min: {formatVnd(activeLot.nextMinimumBid)}
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      openBidModal(
                        activeLot,
                        activeLot.nextMinimumBid + activeLot.minIncrement * 2
                      )
                    }
                    className="py-3 border border-bone text-bone font-sans text-xs font-medium uppercase tracking-[0.14em] hover:bg-bone/15 transition tabular-nums"
                  >
                    Power: {formatVnd(activeLot.nextMinimumBid + activeLot.minIncrement * 2)}
                  </button>
                </div>

                {/* Bid History Feed */}
                <div>
                  <div className="flex items-center gap-2 font-sans text-[11px] font-medium uppercase tracking-[0.16em] text-bone mb-3">
                    <History className="w-3.5 h-3.5 text-bone" />
                    Verified Bid History ({activeLot.bids?.length || 0})
                  </div>
                  <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                    {(activeLot.bids || []).map((bid, idx) => (
                      <div
                        key={bid.id}
                        className={`p-3 border flex items-center justify-between font-mono text-xs ${
                          idx === 0
                            ? 'bg-ink border-bone/50 text-bone'
                            : 'bg-ink/60 border-bone/10 text-bone-muted'
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{bid.bidderAlias}</span>
                            {idx === 0 && (
                              <span className="text-[9px] px-1.5 py-0.5 bg-bone text-ink font-bold">
                                LEADING
                              </span>
                            )}
                            {bid.triggeredExtension && (
                              <span className="text-[9px] px-1.5 py-0.5 border border-bone/60 text-bone">
                                +120S SNIPE GUARD
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-bone-muted">
                            {new Date(bid.createdAt).toLocaleTimeString()}
                          </span>
                        </div>
                        <span className="font-semibold text-bone tabular-nums">
                          {formatVnd(bid.amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>

      {/* SEAT-HOLD BID CONFIRMATION MODAL */}
      {confirmBidLot && (
        <div
          id="auction-seat-hold-modal"
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[115] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
          onClick={() => setConfirmBidLot(null)}
        >
          <form
            onClick={e => e.stopPropagation()}
            onSubmit={handleConfirmBid}
            className="w-full max-w-md bg-ink-raised border border-bone/60 p-6 md:p-8 space-y-5 text-bone"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="font-sans text-[10px] font-medium tracking-[0.16em] uppercase text-bone">
                  SEAT-HOLD AUTHORIZATION
                </p>
                <h2 className="font-display text-2xl mt-1">{confirmBidLot.title}</h2>
              </div>
              <button
                type="button"
                onClick={() => setConfirmBidLot(null)}
                className="text-bone-muted hover:text-bone"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block font-sans text-[10px] font-medium uppercase tracking-[0.16em] text-bone-muted mb-1.5">
                Collector Floor Alias (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. SAIGON_VAULT_07"
                value={bidderAlias}
                onChange={e => setBidderAlias(e.target.value)}
                className="w-full bg-ink border border-bone/15 px-3.5 py-2.5 font-mono text-xs text-bone uppercase focus:outline-none focus:border-bone"
              />
            </div>

            <div>
              <label className="block font-sans text-[10px] font-medium uppercase tracking-[0.16em] text-bone-muted mb-1.5">
                Binding Bid Amount (Min {formatVnd(confirmBidLot.nextMinimumBid)})
              </label>
              <input
                type="number"
                required
                min={confirmBidLot.nextMinimumBid}
                step={confirmBidLot.minIncrement}
                value={bidAmount}
                onChange={e => setBidAmount(e.target.value)}
                className="w-full bg-ink border border-bone/50 px-4 py-3 font-mono text-lg text-bone font-semibold tabular-nums focus:outline-none"
              />
            </div>

            <div className="flex items-start gap-2.5 text-xs text-bone-muted bg-ink p-3 border border-bone/10">
              <CheckCircle2 className="w-4 h-4 text-bone flex-shrink-0 mt-0.5" />
              <span>
                Seat-hold verified. Winning lots include complimentary NFC provenance certification
                and insured vault courier.
              </span>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 bg-bone text-ink font-sans text-xs font-semibold uppercase tracking-[0.14em] hover:bg-bone-dim transition"
            >
              {submitting ? 'EXECUTING BID...' : 'SEAL BINDING BID'}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
