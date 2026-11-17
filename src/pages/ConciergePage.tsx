import React, { useEffect, useState } from 'react'
import { Crosshair, ShieldCheck, Clock, CheckCircle2 } from 'lucide-react'
import { api } from '../api/apiClient'
import { ConciergeTicket } from '../types/enigma'
import { formatVnd } from '../lib/format'
import Breadcrumb from '../components/Breadcrumb'
import { useAuthStore } from '../store/useAuthStore'
import { useToast } from '../components/Toast'

export default function ConciergePage() {
  const { user } = useAuthStore()
  const { toast } = useToast()

  const [tickets, setTickets] = useState<ConciergeTicket[]>([])
  const [requesterName, setRequesterName] = useState(user?.name || '')
  const [requesterEmail, setRequesterEmail] = useState(user?.email || '')
  const [itemName, setItemName] = useState('')
  const [brand, setBrand] = useState('')
  const [size, setSize] = useState('EU 42')
  const [targetPrice, setTargetPrice] = useState(12500000)
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    void api.get<ConciergeTicket[]>('/concierge/my').then(res => {
      setTickets(Array.isArray(res) ? res : [])
    })
  }, [])

  const marketEstimate = Math.round(targetPrice * 1.14)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!itemName.trim()) return
    try {
      setSubmitting(true)
      const created = await api.post<ConciergeTicket>('/concierge', {
        requesterName: requesterName || user?.name || 'Inner Circle Collector',
        requesterEmail: requesterEmail || user?.email || 'collector@enigma.cult',
        itemName: itemName.trim(),
        brand: brand.trim() || undefined,
        size,
        targetPrice,
        notes: notes.trim() || undefined,
      })
      setTickets(prev => [created, ...prev])
      setItemName('')
      setBrand('')
      setNotes('')
      toast(`Sourcing Dossier #${created.id} transmitted to Antwerp & Tokyo desks.`, 'success')
    } catch (err: any) {
      toast(err?.message || 'Unable to submit concierge ticket', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#070709] text-[#ece5d8] py-10 md:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Breadcrumb
          items={[{ label: 'Archive', path: '/' }, { label: 'Find It At My Price' }]}
        />

        <div className="pb-10 border-b border-[#ece5d8]/10 mb-12">
          <p className="font-mono text-xs tracking-[0.32em] uppercase text-[#cfa156] mb-2 inline-flex items-center gap-2">
            <Crosshair className="w-4 h-4" /> GLOBAL BUYER NETWORK · TOKYO / ANTWERP / SAIGON
          </p>
          <h1 className="font-display text-4xl md:text-6xl text-[#ece5d8]">
            Find It At My Price
          </h1>
          <p className="text-sm md:text-base text-[#9a948a] max-w-2xl mt-3 leading-relaxed">
            Name your exact archive grail, runway sample, or deadstock sneaker and set the price you
            are willing to pay. Our sourcing curators negotiate directly with private vaults.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Sourcing Form */}
          <form
            onSubmit={handleSubmit}
            className="lg:col-span-6 bg-[#111115] border border-[#ece5d8]/15 p-6 md:p-8 space-y-5"
          >
            <h2 className="font-display text-2xl text-[#ece5d8]">Open a Sourcing Mandate</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-mono text-[10px] uppercase tracking-widest text-[#9a948a] mb-1.5">
                  Collector Name
                </label>
                <input
                  type="text"
                  required
                  value={requesterName}
                  onChange={e => setRequesterName(e.target.value)}
                  placeholder="Kaelen Vinh"
                  className="w-full bg-[#070709] border border-[#ece5d8]/15 px-3.5 py-2.5 text-xs text-[#ece5d8] focus:outline-none focus:border-[#cfa156]"
                />
              </div>
              <div>
                <label className="block font-mono text-[10px] uppercase tracking-widest text-[#9a948a] mb-1.5">
                  Dispatch Email
                </label>
                <input
                  type="email"
                  required
                  value={requesterEmail}
                  onChange={e => setRequesterEmail(e.target.value)}
                  placeholder="collector@enigma.cult"
                  className="w-full bg-[#070709] border border-[#ece5d8]/15 px-3.5 py-2.5 text-xs text-[#ece5d8] focus:outline-none focus:border-[#cfa156]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block font-mono text-[10px] uppercase tracking-widest text-[#9a948a] mb-1.5">
                  Exact Archive Item / Reference
                </label>
                <input
                  id="concierge-item-input"
                  type="text"
                  required
                  value={itemName}
                  onChange={e => setItemName(e.target.value)}
                  placeholder="e.g. Yohji Yamamoto Pour Homme AW02 Coat"
                  className="w-full bg-[#070709] border border-[#ece5d8]/15 px-3.5 py-2.5 text-xs text-[#ece5d8] focus:outline-none focus:border-[#cfa156]"
                />
              </div>
              <div>
                <label className="block font-mono text-[10px] uppercase tracking-widest text-[#9a948a] mb-1.5">
                  Size
                </label>
                <input
                  type="text"
                  required
                  value={size}
                  onChange={e => setSize(e.target.value)}
                  className="w-full bg-[#070709] border border-[#ece5d8]/15 px-3.5 py-2.5 font-mono text-xs text-[#ece5d8] focus:outline-none focus:border-[#cfa156]"
                />
              </div>
            </div>

            <div>
              <label className="block font-mono text-[10px] uppercase tracking-widest text-[#9a948a] mb-1.5">
                House / Designer (Optional)
              </label>
              <input
                type="text"
                value={brand}
                onChange={e => setBrand(e.target.value)}
                placeholder="Rick Owens / Maison Margiela / Undercover"
                className="w-full bg-[#070709] border border-[#ece5d8]/15 px-3.5 py-2.5 text-xs text-[#ece5d8] focus:outline-none focus:border-[#cfa156]"
              />
            </div>

            <div className="p-4 bg-[#070709] border border-[#ece5d8]/10 space-y-3">
              <div className="flex justify-between font-mono text-xs">
                <span className="text-[#9a948a] uppercase">Your Target Offer</span>
                <span className="text-[#cfa156] font-semibold tabular-nums">
                  {formatVnd(targetPrice)}
                </span>
              </div>
              <input
                type="range"
                min={2000000}
                max={60000000}
                step={500000}
                value={targetPrice}
                onChange={e => setTargetPrice(Number(e.target.value))}
                className="w-full accent-[#cfa156]"
              />
              <div className="flex justify-between font-mono text-[10px] text-[#9a948a] tabular-nums">
                <span>Live Secondary Benchmark: {formatVnd(marketEstimate)}</span>
                <span className="text-[#ece5d8]">Savings: ~12%</span>
              </div>
            </div>

            <div>
              <label className="block font-mono text-[10px] uppercase tracking-widest text-[#9a948a] mb-1.5">
                Condition &amp; Packaging Requirements
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Specify deadstock vs archival patina, original tags, wooden box..."
                className="w-full bg-[#070709] border border-[#ece5d8]/15 p-3 text-xs text-[#ece5d8] focus:outline-none focus:border-[#cfa156]"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 bg-[#cfa156] text-[#070709] font-mono text-xs font-semibold uppercase tracking-[0.24em] hover:bg-[#dec37b] transition"
            >
              {submitting ? 'DISPATCHING MANDATE...' : 'SUBMIT TARGET-PRICE MANDATE'}
            </button>
          </form>

          {/* Active Sourcing Ledger */}
          <div className="lg:col-span-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-2xl text-[#ece5d8]">
                Active Sourcing Mandates ({tickets.length})
              </h2>
              <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-[#cfa156]">
                <ShieldCheck className="w-3.5 h-3.5" /> Escrow Protected
              </span>
            </div>

            {tickets.map(ticket => (
              <article
                key={ticket.id}
                className="p-5 bg-[#111115] border border-[#ece5d8]/12 space-y-3"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="font-mono text-[10px] text-[#9a948a] uppercase tracking-widest">
                      MANDATE #{ticket.id} · SIZE {ticket.size}
                    </span>
                    <h3 className="font-display text-xl text-[#ece5d8] mt-0.5">
                      {ticket.itemName}
                    </h3>
                  </div>
                  <span className="px-2.5 py-1 bg-[#070709] border border-[#cfa156]/50 font-mono text-[10px] uppercase tracking-widest text-[#cfa156]">
                    {ticket.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 py-2.5 border-y border-[#ece5d8]/10 font-mono text-xs">
                  <div>
                    <span className="block text-[10px] text-[#9a948a] uppercase">Target Offer</span>
                    <span className="text-[#ece5d8] tabular-nums">
                      {formatVnd(ticket.targetPrice)}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-[#9a948a] uppercase">
                      {ticket.counterOfferPrice ? 'Curator Counter-Offer' : 'Market Benchmark'}
                    </span>
                    <span className="text-[#cfa156] font-semibold tabular-nums">
                      {formatVnd(ticket.counterOfferPrice || ticket.marketEstimate || ticket.targetPrice)}
                    </span>
                  </div>
                </div>

                {ticket.adminNotes && (
                  <p className="text-xs text-[#ece5d8]/85 bg-[#070709] p-3 border-l-2 border-[#cfa156]">
                    Curator Desk: {ticket.adminNotes}
                  </p>
                )}

                <div className="flex items-center justify-between font-mono text-[10px] text-[#9a948a]">
                  <span className="inline-flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {new Date(ticket.createdAt).toLocaleDateString()}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[#cfa156]">
                    <CheckCircle2 className="w-3 h-3" /> Authenticity Included
                  </span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
