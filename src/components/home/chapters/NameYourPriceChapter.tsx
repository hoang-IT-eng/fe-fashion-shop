import React, { useId, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import { api } from '../../../api/apiClient'
import type { ConciergeTicket } from '../../../types/enigma'
import { formatVnd } from '../../../lib/format'
import { useSoundStore } from '../../../store/useSoundStore'
import { useToast } from '../../Toast'
import { useNavigate } from 'react-router-dom'

const MIN = 2_500_000
const MAX = 45_000_000
const STEP = 500_000

const digits = (s: string) => Number(s.replace(/[^\d]/g, '')) || 0

/**
 * Chapter V — "Name your price": a POST /concierge sourcing request
 * (itemName, size, targetPrice, optional email). The desk answers by
 * accepting, countering or sourcing — the statuses the backend exposes.
 */
export function NameYourPriceChapter() {
  const id = useId()
  const navigate = useNavigate()
  const { playChime } = useSoundStore()
  const { toast } = useToast()
  const [item, setItem] = useState('')
  const [size, setSize] = useState('')
  const [price, setPrice] = useState(14_500_000)
  const [priceText, setPriceText] = useState(formatVnd(14_500_000).replace('₫', ''))
  const [email, setEmail] = useState('')
  const [sending, setSending] = useState(false)

  const setFromNumber = (n: number) => {
    setPrice(n)
    setPriceText(n ? formatVnd(n).replace('₫', '') : '')
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (price < 100_000) {
      toast('Name a target price first.', 'error')
      return
    }
    try {
      setSending(true)
      const ticket = await api.post<ConciergeTicket>('/concierge', {
        itemName: item.trim(),
        size: size.trim(),
        targetPrice: price,
        ...(email.trim() ? { requesterEmail: email.trim() } : {}),
      })
      playChime()
      toast(`Request #${ticket.id} sent at ${formatVnd(ticket.targetPrice)}. Track it on the concierge page.`, 'success')
      navigate('/concierge')
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : 'Could not send the request', 'error')
    } finally {
      setSending(false)
    }
  }

  const field = 'w-full border border-bone/15 bg-ink px-4 py-3 text-sm text-bone placeholder-bone-muted/70 focus:border-ember focus:outline-none'
  const label = 'mb-2 block font-sans text-[10px] font-medium uppercase tracking-[0.18em] text-bone-muted'

  return (
    <section aria-labelledby="nyp-title" className="relative border-b border-bone/10 py-20 md:py-28">
      <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-start gap-12 px-4 sm:px-6 lg:grid-cols-12 lg:px-8">
        <div data-reveal className="space-y-6 lg:col-span-5 lg:pt-6">
          <p className="font-sans text-[11px] font-medium uppercase tracking-[0.3em] text-ember-soft">
            Chapter V — The sourcing desk
          </p>
          <h2 id="nyp-title" className="font-display text-5xl leading-[0.98] text-bone md:text-7xl">
            Name your <em>price</em>.
          </h2>
          <p className="max-w-md text-sm leading-relaxed text-bone-muted md:text-base">
            Can&apos;t find it in the vault? Describe the piece, your size and the price you&apos;d pay. The desk reviews every
            request and answers by accepting it, sending a counter-offer, or marking it sourced.
          </p>
          <Link
            to="/concierge"
            className="inline-flex items-center gap-2 font-sans text-[11px] font-medium uppercase tracking-[0.16em] text-bone"
          >
            See your requests <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
          </Link>
        </div>

        <form data-reveal onSubmit={submit} className="space-y-6 border border-bone/15 bg-ink-raised p-6 md:p-9 lg:col-span-7">
          <div>
            <label htmlFor={`${id}-price`} className={label}>
              Your price (VND)
            </label>
            <div className="flex items-baseline gap-3 border-b border-bone/25 pb-2 focus-within:border-ember">
              <input
                id={`${id}-price`}
                inputMode="numeric"
                autoComplete="off"
                required
                value={priceText}
                onChange={e => {
                  const n = digits(e.target.value)
                  setPrice(n)
                  setPriceText(e.target.value.replace(/[^\d.\s]/g, ''))
                }}
                onBlur={() => setFromNumber(price)}
                className="w-full bg-transparent font-display text-5xl tabular-nums text-bone focus:outline-none md:text-6xl"
              />
              <span aria-hidden="true" className="font-display text-4xl text-bone-muted">
                ₫
              </span>
            </div>
            <label htmlFor={`${id}-range`} className="sr-only">
              Adjust your price
            </label>
            <input
              id={`${id}-range`}
              type="range"
              min={MIN}
              max={MAX}
              step={STEP}
              value={Math.min(MAX, Math.max(MIN, price))}
              onChange={e => setFromNumber(Number(e.target.value))}
              className="mt-5 w-full accent-[#c8864a]"
            />
            <div className="mt-1 flex justify-between font-sans text-[10px] tabular-nums text-bone-muted">
              <span>{formatVnd(MIN)}</span>
              <span>{formatVnd(MAX)}+</span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <label htmlFor={`${id}-item`} className={label}>
                The piece
              </label>
              <input
                id={`${id}-item`}
                required
                maxLength={255}
                placeholder="e.g. horsehide flight bomber, aged black"
                value={item}
                onChange={e => setItem(e.target.value)}
                className={field}
              />
            </div>
            <div>
              <label htmlFor={`${id}-size`} className={label}>
                Size
              </label>
              <input
                id={`${id}-size`}
                required
                maxLength={60}
                placeholder="e.g. EU 42 / M"
                value={size}
                onChange={e => setSize(e.target.value)}
                className={field}
              />
            </div>
          </div>

          <div>
            <label htmlFor={`${id}-email`} className={label}>
              Email for the reply <span className="normal-case tracking-normal">(optional)</span>
            </label>
            <input
              id={`${id}-email`}
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className={field}
            />
          </div>

          <button
            type="submit"
            disabled={sending}
            className="w-full bg-bone py-4 font-sans text-xs font-semibold uppercase tracking-[0.14em] text-ink transition hover:bg-bone-dim"
          >
            {sending ? 'Sending…' : `Send request at ${formatVnd(price)}`}
          </button>
        </form>
      </div>
    </section>
  )
}
