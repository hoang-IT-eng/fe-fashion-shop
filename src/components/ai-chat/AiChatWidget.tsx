import React, { useState, useRef, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  X,
  Send,
  ShoppingBag,
  Clock,
  ArrowUpRight,
  CheckCircle2,
  Compass,
  RotateCcw,
  AlertCircle,
  Sparkles,
} from 'lucide-react'
import { api } from '../../api/apiClient'
import { AiChatResponsePayload, GenerativeUiBlock } from '../../types/enigma'
import { formatCountdown, formatVnd } from '../../lib/format'
import { useCartStore } from '../../store/useCartStore'
import { useToast } from '../Toast'
import { NocturneMark } from '../brand/NocturneMark'

const SESSION_STORAGE_KEY = 'nocturne_chat_session_id'

// Scrub any legacy client-side key from earlier sessions so no secret ever sits in localStorage
try {
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem('ENIGMA_GEMINI_API_KEY')
  }
} catch {
  // ignore
}

function readStoredSessionId(): string | undefined {
  try {
    if (typeof window === 'undefined') return undefined
    const raw = window.sessionStorage.getItem(SESSION_STORAGE_KEY)
    return raw && raw.trim() ? raw.trim() : undefined
  } catch {
    return undefined
  }
}

function persistSessionId(id?: string): void {
  try {
    if (typeof window === 'undefined') return
    if (id) {
      window.sessionStorage.setItem(SESSION_STORAGE_KEY, id)
    } else {
      window.sessionStorage.removeItem(SESSION_STORAGE_KEY)
    }
  } catch {
    // ignore
  }
}

function isSafeInternalPath(url?: string): url is string {
  return typeof url === 'string' && url.startsWith('/') && !url.startsWith('//')
}

/**
 * Safely renders **bold**, *italic*, and line breaks using React elements
 * without ever touching dangerouslySetInnerHTML.
 */
function renderInlineMarkdown(line: string, keyPrefix: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = []
  const pattern = /(\*\*[^*]+\*\*|\*[^*]+\*)/g
  let lastIndex = 0
  let match: RegExpExecArray | null
  let tokenIdx = 0

  while ((match = pattern.exec(line)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(line.slice(lastIndex, match.index))
    }
    const token = match[0]
    if (token.startsWith('**') && token.endsWith('**')) {
      nodes.push(
        <strong key={`${keyPrefix}-b-${tokenIdx++}`} className="font-semibold text-bone">
          {token.slice(2, -2)}
        </strong>
      )
    } else if (token.startsWith('*') && token.endsWith('*')) {
      nodes.push(
        <em key={`${keyPrefix}-i-${tokenIdx++}`} className="italic text-bone/90">
          {token.slice(1, -1)}
        </em>
      )
    }
    lastIndex = pattern.lastIndex
  }

  if (lastIndex < line.length) {
    nodes.push(line.slice(lastIndex))
  }
  return nodes
}

function renderFormattedText(text: string): React.ReactNode {
  const lines = text.split('\n')
  return lines.map((line, idx) => (
    <React.Fragment key={idx}>
      {renderInlineMarkdown(line, `l${idx}`)}
      {idx < lines.length - 1 && <br />}
    </React.Fragment>
  ))
}

interface ChatEntry {
  id: string
  role: 'user' | 'assistant'
  text: string
  engine?: string
  toolsInvoked?: string[]
  uiBlocks?: GenerativeUiBlock[]
  isError?: boolean
  retryQuery?: string
}

const WELCOME_ENTRY: ChatEntry = {
  id: 'welcome',
  role: 'assistant',
  text: 'Welcome to the **NOCTURNE Grail Stylist**. Ask me to curate archival pieces with inline size reservation, compare grails side-by-side, inspect live anti-snipe auctions, or verify privilege codes like **NOCTURNE15**.',
}

const QUICK_PROMPTS = [
  'Recommend archival outerwear & sneakers',
  'Compare Bomber vs Overcoat',
  'Show live Grail Auctions',
  'Validate code NOCTURNE15',
  'Reveal my Mystery Vault Codex',
]

type ProductCardItem = Extract<GenerativeUiBlock, { kind: 'product_cards' }>['products'][number]

export function AiChatWidget() {
  const location = useLocation()
  const navigate = useNavigate()
  const addItem = useCartStore(s => s.addItem)
  const { toast } = useToast()

  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [sessionId, setSessionId] = useState<string | undefined>(() => readStoredSessionId())
  const [selectedSizes, setSelectedSizes] = useState<Record<number, string>>({})
  const [entries, setEntries] = useState<ChatEntry[]>([WELCOME_ENTRY])

  const bottomRef = useRef<HTMLDivElement | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [entries, sending, open])

  useEffect(() => {
    if (open) {
      const timer = window.setTimeout(() => inputRef.current?.focus(), 180)
      return () => window.clearTimeout(timer)
    }
  }, [open])

  if (location.pathname.startsWith('/admin')) {
    return null
  }

  const resetConversation = () => {
    if (sending) return
    setSessionId(undefined)
    persistSessionId(undefined)
    setSelectedSizes({})
    setEntries([WELCOME_ENTRY])
  }

  const sendQuery = async (messageText: string, options?: { isRetry?: boolean }) => {
    const trimmed = messageText.trim()
    if (!trimmed || sending) return

    if (!options?.isRetry) {
      const userMsg: ChatEntry = {
        id: `u-${Date.now()}`,
        role: 'user',
        text: trimmed,
      }
      setEntries(prev => [...prev, userMsg])
      setInput('')
    } else {
      // Remove trailing error bubble before retrying
      setEntries(prev => prev.filter(e => !e.isError || e.retryQuery !== trimmed))
    }

    setSending(true)

    try {
      const payload: { message: string; sessionId?: string } = { message: trimmed }
      if (sessionId) {
        payload.sessionId = sessionId
      }
      const res = await api.post<AiChatResponsePayload>('/ai-chat/message', payload)
      if (res.sessionId && res.sessionId !== sessionId) {
        setSessionId(res.sessionId)
        persistSessionId(res.sessionId)
      }
      setEntries(prev => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: 'assistant',
          text: res.message,
          engine: res.engine,
          toolsInvoked: res.toolsInvoked,
          uiBlocks: res.uiBlocks,
        },
      ])
    } catch (err: unknown) {
      const message =
        err instanceof Error && err.message
          ? err.message
          : 'Vault Stylist is temporarily unreachable. Please try again.'
      setEntries(prev => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          text: message,
          isError: true,
          retryQuery: trimmed,
        },
      ])
    } finally {
      setSending(false)
    }
  }

  const resolveActiveSize = (p: ProductCardItem): string => {
    if (selectedSizes[p.id]) return selectedSizes[p.id]
    const firstInStock = p.variants?.find(v => v.stock > 0 && v.size)?.size
    return firstInStock || p.sizes?.[0] || 'One Size'
  }

  const getVariantForSize = (p: ProductCardItem, size: string) =>
    p.variants?.find(v => v.size === size)

  const handleQuickAdd = async (p: ProductCardItem) => {
    const chosenSize = resolveActiveSize(p)
    const variant = getVariantForSize(p, chosenSize)
    const availableStock = variant ? variant.stock : p.stock
    if (availableStock <= 0) {
      toast(`"${p.name}" (${chosenSize}) is currently out of stock.`, 'error')
      return
    }

    await addItem(
      {
        productId: p.id,
        variantId: variant?.id,
        name: p.name,
        price: p.price,
        quantity: 1,
        size: chosenSize,
        color: variant?.color || p.colors?.[0] || 'Obsidian',
        imageUrl: p.imageUrl || undefined,
      },
      false
    )
    toast(`Added "${p.name}" (${chosenSize}) directly from Grail Stylist.`, 'success')
  }

  return (
    <>
      {!open && (
        <button
          id="enigma-ai-stylist-trigger"
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open NOCTURNE Grail Stylist"
          className="group fixed bottom-6 right-6 z-[90] flex items-center gap-3 px-4 py-3 bg-ink-raised/90 backdrop-blur-md border border-bone/25 hover:border-ember/70 text-bone shadow-[0_16px_48px_rgba(0,0,0,0.65)] hover:-translate-y-0.5 transition-all duration-300"
        >
          <span className="relative flex items-center justify-center">
            <NocturneMark className="w-5 h-5 text-bone group-hover:text-ember transition-colors" />
            <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-ember shadow-[0_0_8px_rgba(200,134,74,0.9)]" />
          </span>
          <div className="flex flex-col items-start leading-none">
            <span className="font-mono text-[10px] uppercase tracking-[0.26em] text-bone">
              Grail Stylist
            </span>
            <span className="font-mono text-[8px] uppercase tracking-[0.2em] text-bone-muted mt-1">
              Archive Concierge
            </span>
          </div>
          <Sparkles className="w-3.5 h-3.5 text-ember/85 group-hover:text-ember transition-colors" />
        </button>
      )}

      {open && (
        <section
          id="enigma-ai-stylist-panel"
          aria-label="NOCTURNE Generative UI Grail Stylist"
          className="nocturne-chat-drawer fixed bottom-4 right-4 z-[105] w-[calc(100vw-2rem)] sm:w-[448px] h-[640px] max-h-[86vh] bg-ink/95 backdrop-blur-xl border border-bone/20 shadow-[0_24px_80px_rgba(0,0,0,0.85)] flex flex-col text-bone overflow-hidden"
        >
          {/* Subtle ember hairline top accent */}
          <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-ember/60 to-transparent" />

          {/* Header */}
          <div className="px-4 py-3.5 bg-ink-raised/85 border-b border-bone/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 border border-bone/15 bg-ink flex items-center justify-center">
                <NocturneMark className="w-4 h-4 text-bone" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-display text-lg leading-none tracking-wide text-bone">
                    NOCTURNE Stylist
                  </h2>
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 border border-ember/35 bg-ember/10 font-mono text-[8px] uppercase tracking-[0.2em] text-ember-soft">
                    <span className="w-1 h-1 rounded-full bg-ember" />
                    Live
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={resetConversation}
                disabled={sending}
                title="Start fresh conversation"
                aria-label="Reset conversation"
                className="p-1.5 text-bone-muted hover:text-bone hover:bg-bone/5 transition disabled:opacity-40"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                id="close-ai-stylist-btn"
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close Grail Stylist"
                className="p-1.5 text-bone-muted hover:text-bone hover:bg-bone/5 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
            {entries.map(entry => (
              <div
                key={entry.id}
                className={`flex flex-col gap-2 ${
                  entry.role === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                {entry.isError ? (
                  <div className="w-full p-3 bg-crimson/10 border border-crimson/35 text-bone space-y-2.5">
                    <div className="flex items-start gap-2 text-xs leading-relaxed">
                      <AlertCircle className="w-4 h-4 text-crimson flex-shrink-0 mt-0.5" />
                      <span className="text-bone/90">{entry.text}</span>
                    </div>
                    {entry.retryQuery && (
                      <button
                        type="button"
                        onClick={() => void sendQuery(entry.retryQuery!, { isRetry: true })}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 border border-bone/25 hover:border-bone font-mono text-[10px] uppercase tracking-[0.2em] text-bone hover:bg-bone hover:text-ink transition"
                      >
                        <RotateCcw className="w-3 h-3" />
                        Retry
                      </button>
                    )}
                  </div>
                ) : (
                  <div
                    className={`max-w-[90%] px-3.5 py-2.5 text-xs leading-relaxed ${
                      entry.role === 'user'
                        ? 'bg-bone text-ink font-medium shadow-sm'
                        : 'bg-ink-raised/90 border border-bone/12 text-bone/95'
                    }`}
                  >
                    {entry.role === 'assistant' ? renderFormattedText(entry.text) : entry.text}
                  </div>
                )}

                {entry.toolsInvoked && entry.toolsInvoked.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {entry.toolsInvoked.map(tool => (
                      <span
                        key={tool}
                        className="px-2 py-0.5 bg-ink-raised border border-bone/10 font-mono text-[8.5px] uppercase tracking-[0.16em] text-bone-muted"
                      >
                        {tool.replace(/_/g, ' ')}
                      </span>
                    ))}
                  </div>
                )}

                {/* Generative UI Blocks */}
                {entry.uiBlocks?.map((block, bIdx) => {
                  if (block.kind === 'product_cards') {
                    return (
                      <div key={bIdx} className="w-full space-y-2.5 pt-0.5">
                        <p className="font-mono text-[9.5px] tracking-[0.24em] text-ember-soft uppercase">
                          {block.title}
                        </p>
                        {block.products.map(p => {
                          const activeSz = resolveActiveSize(p)
                          const activeVariant = getVariantForSize(p, activeSz)
                          const activeStock = activeVariant ? activeVariant.stock : p.stock
                          const isOutOfStock = activeStock <= 0
                          const isLowStock = activeStock > 0 && activeStock <= 3
                          const sizeList = p.sizes?.length ? p.sizes : ['One Size']

                          return (
                            <div
                              key={p.id}
                              className="p-3 bg-ink-raised/95 border border-bone/15 hover:border-bone/30 transition-colors flex gap-3"
                            >
                              {p.imageUrl && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setOpen(false)
                                    navigate(`/products/${p.id}`)
                                  }}
                                  className="relative w-16 h-20 bg-ink border border-bone/10 flex-shrink-0 overflow-hidden group/img"
                                >
                                  <img
                                    src={p.imageUrl}
                                    alt={p.name}
                                    className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-300"
                                  />
                                </button>
                              )}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setOpen(false)
                                      navigate(`/products/${p.id}`)
                                    }}
                                    className="text-left text-xs font-medium text-bone hover:text-ember-soft transition-colors line-clamp-1"
                                  >
                                    {p.name}
                                  </button>
                                  <span
                                    className={`flex-shrink-0 px-1.5 py-0.5 font-mono text-[8.5px] uppercase tracking-wider border ${
                                      isOutOfStock
                                        ? 'border-crimson/40 bg-crimson/10 text-crimson'
                                        : isLowStock
                                          ? 'border-ember/45 bg-ember/10 text-ember-soft'
                                          : 'border-bone/15 bg-ink text-bone-muted'
                                    }`}
                                  >
                                    {isOutOfStock
                                      ? 'Sold Out'
                                      : isLowStock
                                        ? `Low · ${activeStock}`
                                        : 'In Stock'}
                                  </span>
                                </div>

                                <div className="flex items-center justify-between mt-0.5">
                                  <p className="font-mono text-[11px] text-bone tabular-nums">
                                    {formatVnd(p.price)}
                                  </p>
                                  {(activeVariant?.color || p.colors?.[0]) && (
                                    <span className="font-mono text-[9px] text-bone-muted truncate max-w-[110px]">
                                      {activeVariant?.color || p.colors?.[0]}
                                    </span>
                                  )}
                                </div>

                                <div className="flex flex-wrap gap-1 my-2">
                                  {sizeList.slice(0, 5).map(sz => {
                                    const vForSz = getVariantForSize(p, sz)
                                    const szOut = vForSz ? vForSz.stock <= 0 : p.stock <= 0
                                    const isActive = activeSz === sz
                                    return (
                                      <button
                                        key={sz}
                                        type="button"
                                        onClick={() =>
                                          setSelectedSizes(prev => ({ ...prev, [p.id]: sz }))
                                        }
                                        className={`px-2 py-0.5 font-mono text-[10px] border transition ${
                                          isActive
                                            ? 'border-bone bg-bone text-ink font-semibold'
                                            : szOut
                                              ? 'border-bone/10 text-bone-muted/40 line-through'
                                              : 'border-bone/15 text-bone-muted hover:border-bone/50 hover:text-bone'
                                        }`}
                                      >
                                        {sz}
                                      </button>
                                    )
                                  })}
                                </div>

                                <button
                                  type="button"
                                  disabled={isOutOfStock}
                                  onClick={() => void handleQuickAdd(p)}
                                  className="w-full py-1.5 bg-bone text-ink hover:bg-bone-dim disabled:bg-ink disabled:text-bone-muted/50 disabled:border disabled:border-bone/10 disabled:cursor-not-allowed font-mono text-[10px] font-semibold uppercase tracking-[0.2em] flex items-center justify-center gap-1.5 transition"
                                >
                                  <ShoppingBag className="w-3 h-3" />
                                  {isOutOfStock ? `Sold Out (${activeSz})` : `Add to Bag (${activeSz})`}
                                </button>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )
                  }

                  if (block.kind === 'comparison_table') {
                    const colCount = Math.min(3, Math.max(1, block.columns.length))
                    const gridClass =
                      colCount >= 3
                        ? 'grid-cols-1 sm:grid-cols-3'
                        : colCount === 2
                          ? 'grid-cols-2'
                          : 'grid-cols-1'
                    return (
                      <div
                        key={bIdx}
                        className="w-full bg-ink-raised/95 border border-bone/15 p-3 space-y-2.5"
                      >
                        <p className="font-mono text-[9.5px] tracking-[0.22em] text-ember-soft uppercase">
                          {block.title}
                        </p>
                        <div className={`grid ${gridClass} gap-2 text-[11px]`}>
                          {block.columns.slice(0, 3).map(col => (
                            <div
                              key={col.id}
                              className="p-2.5 bg-ink border border-bone/10 space-y-1 flex flex-col justify-between"
                            >
                              <div className="space-y-1">
                                <p className="font-medium text-bone line-clamp-2 leading-snug">
                                  {col.name}
                                </p>
                                <p className="font-mono text-bone tabular-nums text-[11px]">
                                  {formatVnd(col.price)}
                                </p>
                              </div>
                              <div className="pt-1.5 border-t border-bone/10 space-y-0.5">
                                <p className="font-mono text-[9.5px] text-bone-muted">
                                  {col.releaseType} · {col.condition}
                                </p>
                                <p className="font-mono text-[9.5px] text-bone-muted">
                                  Sizes: {col.sizes}
                                </p>
                                <p className="font-mono text-[9.5px] text-bone-muted">
                                  Stock: {col.stock}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                        <p className="text-[11px] text-bone-muted italic pt-1 border-t border-bone/10">
                          {block.verdict}
                        </p>
                      </div>
                    )
                  }

                  if (block.kind === 'auction_card') {
                    return (
                      <div key={bIdx} className="w-full space-y-2">
                        <p className="font-mono text-[9.5px] tracking-[0.22em] text-ember-soft uppercase">
                          {block.title}
                        </p>
                        {block.lots.map(lot => (
                          <div
                            key={lot.id}
                            className="p-3 bg-ink-raised/95 border border-ember/30 space-y-2"
                          >
                            <p className="text-xs font-medium text-bone">{lot.title}</p>
                            <div className="flex items-center justify-between font-mono text-[11px] tabular-nums">
                              <span className="text-bone">
                                Bid: {formatVnd(lot.currentBid)}
                              </span>
                              <span className="inline-flex items-center gap-1 text-ember-soft">
                                <Clock className="w-3 h-3" />
                                {formatCountdown(lot.remainingSeconds)}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setOpen(false)
                                navigate('/auctions')
                              }}
                              className="w-full py-1.5 border border-bone/40 text-bone font-mono text-[10px] uppercase tracking-[0.2em] hover:bg-bone hover:text-ink transition"
                            >
                              Enter Bidding Room
                            </button>
                          </div>
                        ))}
                      </div>
                    )
                  }

                  if (block.kind === 'order_stepper') {
                    return (
                      <div
                        key={bIdx}
                        className="w-full p-3 bg-ink-raised/95 border border-bone/15 space-y-2.5"
                      >
                        <div className="flex items-center justify-between font-mono text-[10px]">
                          <span className="text-ember-soft uppercase tracking-[0.18em]">
                            {block.title}
                          </span>
                          <span className="tabular-nums text-bone">
                            {formatVnd(block.order.total)}
                          </span>
                        </div>
                        <div className="space-y-1.5">
                          {block.order.stages.map(st => (
                            <div
                              key={st.key}
                              className="flex items-center gap-2 font-mono text-[11px]"
                            >
                              <CheckCircle2
                                className={`w-3.5 h-3.5 ${
                                  st.completed ? 'text-ember-soft' : 'text-bone-muted/25'
                                }`}
                              />
                              <span
                                className={
                                  st.completed ? 'text-bone' : 'text-bone-muted/55'
                                }
                              >
                                {st.label}
                              </span>
                            </div>
                          ))}
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setOpen(false)
                            navigate(`/orders/${block.order.id}`)
                          }}
                          className="inline-flex items-center gap-1 font-mono text-[10px] text-bone hover:text-ember-soft uppercase tracking-[0.2em] transition-colors"
                        >
                          Inspect Full Dossier <ArrowUpRight className="w-3 h-3" />
                        </button>
                      </div>
                    )
                  }

                  if (block.kind === 'taste_codex_prompt') {
                    const safeTarget = isSafeInternalPath(block.ctaUrl)
                      ? block.ctaUrl
                      : '/mystery-boxes'
                    return (
                      <div
                        key={bIdx}
                        className="w-full p-3.5 bg-ink-raised/95 border border-ember/35 space-y-2.5"
                      >
                        <div className="flex items-center gap-2 text-ember-soft font-mono text-[10px] uppercase tracking-[0.22em]">
                          <Compass className="w-3.5 h-3.5" />
                          <span>{block.title}</span>
                        </div>
                        <p className="text-xs text-bone-muted leading-relaxed">{block.subtitle}</p>
                        <button
                          type="button"
                          onClick={() => {
                            setOpen(false)
                            navigate(safeTarget)
                          }}
                          className="w-full py-2 bg-bone text-ink hover:bg-bone-dim font-mono text-[10px] font-semibold uppercase tracking-[0.22em] transition"
                        >
                          Open 8-Step Style Reading
                        </button>
                      </div>
                    )
                  }

                  return null
                })}
              </div>
            ))}

            {sending && (
              <div className="flex items-start">
                <div className="inline-flex items-center gap-2.5 px-3.5 py-2.5 bg-ink-raised/90 border border-bone/12">
                  <div className="flex items-center gap-1" aria-hidden="true">
                    <span className="nocturne-typing-dot w-1.5 h-1.5 rounded-full bg-ember" />
                    <span className="nocturne-typing-dot w-1.5 h-1.5 rounded-full bg-ember" />
                    <span className="nocturne-typing-dot w-1.5 h-1.5 rounded-full bg-ember" />
                  </div>
                  <span className="font-mono text-[9.5px] tracking-[0.22em] text-bone-muted uppercase">
                    Consulting Vault
                  </span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick Prompt Strip */}
          <div className="px-3 py-2 border-t border-bone/10 bg-ink-deep/80 flex gap-1.5 overflow-x-auto hide-scrollbar">
            {QUICK_PROMPTS.map(prompt => (
              <button
                key={prompt}
                type="button"
                disabled={sending}
                onClick={() => void sendQuery(prompt)}
                className="flex-shrink-0 px-2.5 py-1 bg-ink-raised/80 border border-bone/15 hover:border-ember/60 font-mono text-[9.5px] tracking-wide text-bone-muted hover:text-bone whitespace-nowrap transition disabled:opacity-40"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input */}
          <form
            onSubmit={e => {
              e.preventDefault()
              void sendQuery(input)
            }}
            className="p-3 bg-ink-raised/95 border-t border-bone/10 flex gap-2"
          >
            <input
              ref={inputRef}
              id="ai-stylist-input"
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask for grails, compare pieces, live auctions..."
              className="flex-1 bg-ink border border-bone/15 px-3 py-2 text-xs text-bone placeholder:text-bone-muted/60 focus:outline-none focus:border-ember/70 transition-colors"
            />
            <button
              type="submit"
              disabled={sending || !input.trim()}
              aria-label="Send message to Grail Stylist"
              className="px-3.5 py-2 bg-bone text-ink hover:bg-bone-dim disabled:opacity-35 transition"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </section>
      )}
    </>
  )
}

export default AiChatWidget
