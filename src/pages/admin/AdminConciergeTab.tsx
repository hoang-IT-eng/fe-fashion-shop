import React, { useEffect, useState } from 'react'
import { Compass, Crosshair, Check, MessageSquare } from 'lucide-react'
import { api } from '../../api/apiClient'
import { ConciergeStatus, ConciergeTicket, TasteCodexResult } from '../../types/enigma'
import { formatVnd } from '../../lib/format'
import { useToast } from '../../components/Toast'

interface StoredProfile {
  id: number
  requesterLabel?: string
  codex?: TasteCodexResult
  archetype?: string
  matchedTierSlug?: string
  updatedAt?: string
}

export default function AdminConciergeTab() {
  const { toast } = useToast()
  const [tickets, setTickets] = useState<ConciergeTicket[]>([])
  const [profiles, setProfiles] = useState<StoredProfile[]>([])
  const [counterInputs, setCounterInputs] = useState<Record<number, string>>({})
  const [noteInputs, setNoteInputs] = useState<Record<number, string>>({})

  useEffect(() => {
    void Promise.all([
      api.get<ConciergeTicket[]>('/concierge'),
      api.get<StoredProfile[]>('/mystery-boxes/profiles').catch(() => []),
    ]).then(([tRes, pRes]) => {
      setTickets(Array.isArray(tRes) ? tRes : [])
      setProfiles(Array.isArray(pRes) ? pRes : [])
    })
  }, [])

  const updateTicket = async (
    ticket: ConciergeTicket,
    status: ConciergeStatus,
    withCounter = false
  ) => {
    try {
      const counterOfferPrice = withCounter
        ? Number(counterInputs[ticket.id] || Math.round(ticket.targetPrice * 1.08))
        : undefined
      const adminNotes = noteInputs[ticket.id] || ticket.adminNotes || undefined
      const updated = await api.patch<ConciergeTicket>(`/concierge/${ticket.id}/review`, {
        status,
        ...(counterOfferPrice ? { counterOfferPrice } : {}),
        ...(adminNotes ? { adminNotes } : {}),
      })
      setTickets(prev => prev.map(t => (t.id === ticket.id ? updated : t)))
      toast(`Mandate #${ticket.id} marked as ${status.toUpperCase()}.`, 'success')
    } catch (err: any) {
      toast(err?.message || 'Review update failed', 'error')
    }
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Concierge "Find It At My Price" Tickets */}
        <section className="xl:col-span-8 space-y-4">
          <div>
            <p className="font-mono text-[10px] tracking-[0.28em] uppercase text-[#cfa156] inline-flex items-center gap-1.5">
              <Crosshair className="w-3.5 h-3.5" /> PRIVATE SOURCING DESK
            </p>
            <h2 className="font-display text-2xl md:text-3xl text-[#ece5d8]">
              “Find It At My Price” Mandates ({tickets.length})
            </h2>
          </div>

          {tickets.map(t => (
            <article
              key={t.id}
              className="p-5 bg-[#111115] border border-[#ece5d8]/12 space-y-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <span className="font-mono text-[10px] text-[#9a948a] uppercase tracking-widest">
                    MANDATE #{t.id} · {t.requesterName} ({t.requesterEmail})
                  </span>
                  <h3 className="font-display text-xl text-[#ece5d8] mt-0.5">
                    {t.itemName} · <span className="text-[#cfa156]">Size {t.size}</span>
                  </h3>
                </div>
                <span className="px-2.5 py-1 bg-[#070709] border border-[#cfa156]/50 font-mono text-[10px] uppercase tracking-widest text-[#cfa156]">
                  {t.status}
                </span>
              </div>

              <div className="flex flex-wrap gap-6 font-mono text-xs">
                <div>
                  <span className="text-[#9a948a]">TARGET OFFER: </span>
                  <span className="text-[#ece5d8] font-semibold tabular-nums">
                    {formatVnd(t.targetPrice)}
                  </span>
                </div>
                {t.counterOfferPrice && (
                  <div>
                    <span className="text-[#9a948a]">COUNTERED AT: </span>
                    <span className="text-[#cfa156] font-semibold tabular-nums">
                      {formatVnd(t.counterOfferPrice)}
                    </span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <input
                  type="number"
                  placeholder={`Counter VND (e.g. ${Math.round(t.targetPrice * 1.08)})`}
                  value={counterInputs[t.id] || ''}
                  onChange={e =>
                    setCounterInputs(prev => ({ ...prev, [t.id]: e.target.value }))
                  }
                  className="bg-[#070709] border border-[#ece5d8]/15 px-3 py-2 font-mono text-xs text-[#ece5d8] tabular-nums"
                />
                <input
                  type="text"
                  placeholder="Curator sourcing note (Osaka/Antwerp vault)..."
                  value={noteInputs[t.id] ?? t.adminNotes ?? ''}
                  onChange={e =>
                    setNoteInputs(prev => ({ ...prev, [t.id]: e.target.value }))
                  }
                  className="sm:col-span-2 bg-[#070709] border border-[#ece5d8]/15 px-3 py-2 text-xs text-[#ece5d8]"
                />
              </div>

              <div className="flex flex-wrap gap-2 font-mono text-[10px]">
                <button
                  type="button"
                  onClick={() => void updateTicket(t, 'accepted')}
                  className="px-3 py-1.5 bg-[#cfa156] text-[#070709] font-semibold uppercase tracking-wider inline-flex items-center gap-1"
                >
                  <Check className="w-3 h-3" /> Accept Target
                </button>
                <button
                  type="button"
                  onClick={() => void updateTicket(t, 'countered', true)}
                  className="px-3 py-1.5 border border-[#cfa156] text-[#cfa156] uppercase tracking-wider inline-flex items-center gap-1"
                >
                  <MessageSquare className="w-3 h-3" /> Send Counter-Offer
                </button>
                <button
                  type="button"
                  onClick={() => void updateTicket(t, 'sourced')}
                  className="px-3 py-1.5 border border-emerald-400/40 text-emerald-300 uppercase tracking-wider"
                >
                  Mark Sourced
                </button>
                <button
                  type="button"
                  onClick={() => void updateTicket(t, 'declined')}
                  className="px-3 py-1.5 border border-red-400/40 text-red-300 uppercase tracking-wider"
                >
                  Decline
                </button>
              </div>
            </article>
          ))}
        </section>

        {/* Decoded Customer Taste Codex Profiles */}
        <section className="xl:col-span-4 space-y-4">
          <div>
            <p className="font-mono text-[10px] tracking-[0.28em] uppercase text-[#cfa156] inline-flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5" /> 8-STEP QUIZ TELEMETRY
            </p>
            <h2 className="font-display text-2xl text-[#ece5d8]">
              Collector Taste Codex Profiles
            </h2>
          </div>

          <div className="space-y-3">
            {profiles.map(prof => {
              const archetype = prof.codex?.archetype || prof.archetype || 'Shadow Archive'
              const tier =
                prof.codex?.matchedTierSlug || prof.matchedTierSlug || 'inner-circle-chest'
              return (
                <div
                  key={prof.id}
                  className="p-4 bg-[#111115] border border-[#ece5d8]/12 space-y-2"
                >
                  <div className="flex items-center justify-between font-mono text-[10px]">
                    <span className="text-[#ece5d8] uppercase">
                      {prof.requesterLabel || `Collector #${prof.id}`}
                    </span>
                    <span className="text-[#cfa156] uppercase">{tier}</span>
                  </div>
                  <h3 className="font-display text-xl text-[#cfa156]">{archetype}</h3>
                  {prof.codex?.motto && (
                    <p className="text-xs text-[#9a948a] italic">“{prof.codex.motto}”</p>
                  )}
                </div>
              )
            })}
          </div>
        </section>
      </div>
    </div>
  )
}
