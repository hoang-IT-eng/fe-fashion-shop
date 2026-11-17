import React, { useEffect, useState } from 'react'
import { Plus, Clock, Gavel, CheckCircle2, Trash2 } from 'lucide-react'
import { api } from '../../api/apiClient'
import { AuctionLot } from '../../types/enigma'
import { formatCountdown, formatVnd, secondsUntil } from '../../lib/format'
import { useToast } from '../../components/Toast'

export default function AdminAuctionsTab() {
  const { toast } = useToast()
  const [lots, setLots] = useState<AuctionLot[]>([])
  const [selectedLot, setSelectedLot] = useState<AuctionLot | null>(null)
  const [showCreate, setShowCreate] = useState(false)

  const [title, setTitle] = useState('')
  const [subtitle, setSubtitle] = useState('Authenticated 1-of-1 Vault Sample')
  const [startingBid, setStartingBid] = useState(8000000)
  const [minIncrement, setMinIncrement] = useState(250000)
  const [durationMinutes, setDurationMinutes] = useState(60)
  const [imageUrl, setImageUrl] = useState('/images/enigma/grail-chronograph-relic.jpg')

  const loadLots = async () => {
    const res = await api.get<AuctionLot[]>('/auctions')
    const arr = Array.isArray(res) ? res : []
    setLots(arr)
    if (!selectedLot && arr.length > 0) setSelectedLot(arr[0])
  }

  useEffect(() => {
    void loadLots()
  }, [])

  useEffect(() => {
    const id = window.setInterval(() => {
      setLots(prev =>
        prev.map(l => ({ ...l, remainingSeconds: secondsUntil(l.endsAt) }))
      )
    }, 1000)
    return () => window.clearInterval(id)
  }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const created = await api.post<AuctionLot>('/auctions', {
        title,
        subtitle,
        startingBid: Number(startingBid),
        minIncrement: Number(minIncrement),
        durationMinutes: Number(durationMinutes),
        imageUrl,
      })
      setLots(prev => [created, ...prev])
      setSelectedLot(created)
      setShowCreate(false)
      setTitle('')
      toast(`Opened Grail Lot "${created.title}".`, 'success')
    } catch (err: any) {
      toast(err?.message || 'Could not create lot', 'error')
    }
  }

  const handleExtend = async (id: number, seconds: number) => {
    const updated = await api.patch<AuctionLot>(`/auctions/${id}/extend`, { seconds })
    setLots(prev => prev.map(l => (l.id === id ? updated : l)))
    if (selectedLot?.id === id) setSelectedLot(updated)
    toast(`Extended Lot #${id} by +${seconds}s.`, 'success')
  }

  const handleSettle = async (id: number) => {
    const updated = await api.patch<AuctionLot>(`/auctions/${id}/settle`, {})
    setLots(prev => prev.map(l => (l.id === id ? updated : l)))
    if (selectedLot?.id === id) setSelectedLot(updated)
    toast(`Settled Grail Lot #${id}.`, 'info')
  }

  const handleDelete = async (id: number) => {
    await api.delete(`/auctions/${id}`)
    setLots(prev => prev.filter(l => l.id !== id))
    if (selectedLot?.id === id) setSelectedLot(null)
    toast('Auction lot deleted.', 'info')
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="font-mono text-[10px] tracking-[0.28em] uppercase text-[#cfa156]">
            LIVE AUCTION FLOOR CONTROL
          </p>
          <h2 className="font-display text-2xl md:text-3xl text-[#ece5d8]">
            Grail Lots &amp; Anti-Snipe Monitor ({lots.length})
          </h2>
        </div>
        <button
          type="button"
          onClick={() => setShowCreate(v => !v)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#cfa156] text-[#070709] font-mono text-xs font-semibold uppercase tracking-[0.2em]"
        >
          <Plus className="w-4 h-4" /> Launch Grail Lot
        </button>
      </div>

      {showCreate && (
        <form
          onSubmit={handleCreate}
          className="p-6 bg-[#111115] border border-[#cfa156]/40 grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <input
            type="text"
            required
            placeholder="Lot Title (e.g. LOT 04 · Reborn Sample)"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="md:col-span-2 bg-[#070709] border border-[#ece5d8]/15 px-3.5 py-2.5 text-xs text-[#ece5d8]"
          />
          <input
            type="text"
            placeholder="Image URL"
            value={imageUrl}
            onChange={e => setImageUrl(e.target.value)}
            className="bg-[#070709] border border-[#ece5d8]/15 px-3.5 py-2.5 font-mono text-xs text-[#ece5d8]"
          />
          <input
            type="number"
            required
            placeholder="Starting Bid"
            value={startingBid}
            onChange={e => setStartingBid(Number(e.target.value))}
            className="bg-[#070709] border border-[#ece5d8]/15 px-3.5 py-2.5 font-mono text-xs text-[#ece5d8] tabular-nums"
          />
          <input
            type="number"
            required
            placeholder="Min Increment"
            value={minIncrement}
            onChange={e => setMinIncrement(Number(e.target.value))}
            className="bg-[#070709] border border-[#ece5d8]/15 px-3.5 py-2.5 font-mono text-xs text-[#ece5d8] tabular-nums"
          />
          <div className="flex gap-2">
            <input
              type="number"
              min={1}
              required
              placeholder="Mins"
              value={durationMinutes}
              onChange={e => setDurationMinutes(Number(e.target.value))}
              className="w-24 bg-[#070709] border border-[#ece5d8]/15 px-3 py-2.5 font-mono text-xs text-[#ece5d8] tabular-nums"
            />
            <button
              type="submit"
              className="flex-1 bg-[#cfa156] text-[#070709] font-mono text-xs font-semibold uppercase tracking-wider"
            >
              Open Lot
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 space-y-3">
          {lots.map(lot => (
            <div
              key={lot.id}
              onClick={() => setSelectedLot(lot)}
              className={`cursor-pointer p-4 bg-[#111115] border transition flex flex-wrap items-center justify-between gap-4 ${
                selectedLot?.id === lot.id ? 'border-[#cfa156]' : 'border-[#ece5d8]/12'
              }`}
            >
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2 font-mono text-[10px] uppercase">
                  <span className="px-2 py-0.5 bg-[#070709] border border-[#cfa156]/40 text-[#cfa156]">
                    {lot.status}
                  </span>
                  <span className="text-[#9a948a] tabular-nums">
                    {lot.bidCount} bids · +{lot.antiSnipeCount || 0} snipe guards
                  </span>
                </div>
                <h3 className="font-medium text-sm text-[#ece5d8] truncate">{lot.title}</h3>
                <p className="font-mono text-xs text-[#cfa156] tabular-nums">
                  Current: {formatVnd(lot.currentBid)} ·{' '}
                  <Clock className="w-3 h-3 inline text-[#9a948a]" />{' '}
                  {formatCountdown(lot.remainingSeconds)}
                </p>
              </div>

              <div className="flex items-center gap-2 font-mono text-[10px]">
                <button
                  type="button"
                  onClick={e => {
                    e.stopPropagation()
                    void handleExtend(lot.id, 120)
                  }}
                  className="px-2.5 py-1.5 border border-[#ece5d8]/20 hover:border-[#cfa156] text-[#ece5d8] uppercase"
                >
                  +120s
                </button>
                {lot.status === 'live' && (
                  <button
                    type="button"
                    onClick={e => {
                      e.stopPropagation()
                      void handleSettle(lot.id)
                    }}
                    className="px-2.5 py-1.5 bg-[#cfa156] text-[#070709] font-semibold uppercase inline-flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-3 h-3" /> Settle
                  </button>
                )}
                <button
                  type="button"
                  onClick={e => {
                    e.stopPropagation()
                    void handleDelete(lot.id)
                  }}
                  className="p-1.5 text-[#9a948a] hover:text-red-400"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Bid Log Inspector */}
        <div className="lg:col-span-5 bg-[#111115] border border-[#ece5d8]/12 p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Gavel className="w-4 h-4 text-[#cfa156]" />
            <h3 className="font-display text-xl text-[#ece5d8]">
              {selectedLot ? `Bid Audit Log · Lot #${selectedLot.id}` : 'Select a Lot'}
            </h3>
          </div>

          <div className="space-y-2 max-h-80 overflow-y-auto">
            {(selectedLot?.bids || []).length === 0 ? (
              <p className="font-mono text-xs text-[#9a948a]">NO BIDS RECORDED YET</p>
            ) : (
              selectedLot?.bids.map(b => (
                <div
                  key={b.id}
                  className="p-3 bg-[#070709] border border-[#ece5d8]/10 flex items-center justify-between font-mono text-xs"
                >
                  <div>
                    <span className="text-[#ece5d8] font-semibold">{b.bidderAlias}</span>
                    {b.triggeredExtension && (
                      <span className="ml-2 text-[9px] text-[#cfa156] border border-[#cfa156]/50 px-1.5 py-0.5">
                        +120S EXTENDED
                      </span>
                    )}
                    <span className="block text-[10px] text-[#9a948a]">
                      {new Date(b.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                  <span className="text-[#cfa156] tabular-nums">{formatVnd(b.amount)}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
