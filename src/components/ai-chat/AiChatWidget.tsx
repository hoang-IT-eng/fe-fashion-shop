import React, { useState, useRef, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  MessageSquare,
  X,
  Send,
  ShoppingBag,
  Clock,
  ArrowUpRight,
  CheckCircle2,
  Compass,
  KeyRound,
} from 'lucide-react'
import { api } from '../../api/apiClient'
import { AiChatResponsePayload, GenerativeUiBlock } from '../../types/enigma'
import { formatCountdown, formatVnd } from '../../lib/format'
import { useCartStore } from '../../store/useCartStore'
import { useToast } from '../Toast'
import { EnigmaCrest } from '../EnigmaCrest'

const ENIGMA_KEY_STORAGE = 'ENIGMA_GEMINI_API_KEY'

async function maybeSynthesizeClientGemini(
  apiKey: string,
  userMessage: string,
  fallbackText: string,
  uiBlocks?: GenerativeUiBlock[]
): Promise<string | null> {
  const key = apiKey.trim()
  if (!key) return null
  const encKey = encodeURIComponent(key)
  const vertexUrl = `https://aiplatform.googleapis.com/v1/publishers/google/models/gemini-2.5-flash:generateContent?key=${encKey}`
  const studioUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encKey}`
  const endpoints = key.startsWith('AQ.') ? [vertexUrl, studioUrl] : [studioUrl, vertexUrl]
  const body = JSON.stringify({
    contents: [
      {
        role: 'user',
        parts: [
          {
            text: `You are ENIGMA — an avant-garde luxury streetwear & grail auction stylist. Reply in the user's language (Vietnamese or English) in 1-2 crisp editorial sentences grounded in: ${JSON.stringify({ fallbackText, blockKinds: (uiBlocks || []).map(b => b.kind) })}.\nUser message: ${userMessage}`,
          },
        ],
      },
    ],
    generationConfig: { temperature: 0.25, maxOutputTokens: 240 },
  })

  for (const url of endpoints) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
      })
      if (!res.ok) continue
      const json = await res.json()
      const text = json?.candidates?.[0]?.content?.parts?.[0]?.text?.trim()
      if (text) return text
    } catch {
      // try fallback endpoint
    }
  }
  return null
}

interface ChatEntry {
  id: string
  role: 'user' | 'assistant'
  text: string
  engine?: string
  toolsInvoked?: string[]
  uiBlocks?: GenerativeUiBlock[]
}

const QUICK_PROMPTS = [
  'Recommend archival outerwear & sneakers',
  'Compare Bomber vs Overcoat',
  'Show live Grail Auctions',
  'Track order #1002',
  'Decode my Mystery Vault Codex',
]

export function AiChatWidget() {
  const location = useLocation()
  const navigate = useNavigate()
  const addItem = useCartStore(s => s.addItem)
  const { toast } = useToast()

  const [open, setOpen] = useState(false)
  const [keyOpen, setKeyOpen] = useState(false)
  const [keyDraft, setKeyDraft] = useState(() => {
    try {
      return window.localStorage.getItem(ENIGMA_KEY_STORAGE) || ''
    } catch {
      return ''
    }
  })
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [sessionId] = useState(() => `enigma-stylist-${Date.now()}`)
  const [selectedSizes, setSelectedSizes] = useState<Record<number, string>>({})
  const [entries, setEntries] = useState<ChatEntry[]>([
    {
      id: 'welcome',
      role: 'assistant',
      text: 'Welcome to the ENIGMA Grail Stylist (Hybrid RAG + Tool Router). Ask me to curate archival pieces with inline size reservation, compare grails side-by-side, inspect live anti-snipe auctions, or track provenance dispatch.',
    },
  ])

  const bottomRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [entries, open])

  if (location.pathname.startsWith('/admin')) {
    return null
  }

  const sendQuery = async (messageText: string) => {
    const trimmed = messageText.trim()
    if (!trimmed || sending) return

    const userMsg: ChatEntry = {
      id: `u-${Date.now()}`,
      role: 'user',
      text: trimmed,
    }
    setEntries(prev => [...prev, userMsg])
    setInput('')
    setSending(true)

    try {
      const res = await api.post<AiChatResponsePayload>('/ai-chat/message', {
        message: trimmed,
        sessionId,
      })
      let finalMessage = res.message
      let finalEngine = res.engine
      if (res.engine !== 'gemini-tools' && keyDraft.trim()) {
        const enriched = await maybeSynthesizeClientGemini(
          keyDraft,
          trimmed,
          res.message,
          res.uiBlocks
        )
        if (enriched) {
          finalMessage = enriched
          finalEngine = 'gemini-2.5-flash'
        }
      }
      setEntries(prev => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: 'assistant',
          text: finalMessage,
          engine: finalEngine,
          toolsInvoked: res.toolsInvoked,
          uiBlocks: res.uiBlocks,
        },
      ])
    } catch (err: any) {
      setEntries(prev => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          text: err?.message || 'Vault Stylist temporarily unreachable.',
        },
      ])
    } finally {
      setSending(false)
    }
  }

  const handleQuickAdd = async (p: Extract<GenerativeUiBlock, { kind: 'product_cards' }>['products'][number]) => {
    const chosenSize = selectedSizes[p.id] || p.sizes?.[0] || 'One Size'
    const variant = p.variants?.find(v => v.size === chosenSize)
    await addItem(
      {
        productId: p.id,
        variantId: variant?.id,
        name: p.name,
        price: p.price,
        quantity: 1,
        size: chosenSize,
        color: p.colors?.[0] || 'Obsidian',
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
          className="fixed bottom-6 right-6 z-[90] flex items-center gap-3 px-4 py-3 bg-[#111115] border border-[#cfa156]/60 text-[#ece5d8] shadow-2xl hover:bg-[#1c1d24] transition"
        >
          <EnigmaCrest className="w-5 h-5" />
          <span className="font-mono text-xs uppercase tracking-[0.22em]">Grail Stylist</span>
          <MessageSquare className="w-3.5 h-3.5 text-[#cfa156]" />
        </button>
      )}

      {open && (
        <section
          id="enigma-ai-stylist-panel"
          aria-label="ENIGMA Generative UI Grail Stylist"
          className="fixed bottom-4 right-4 z-[105] w-[calc(100vw-2rem)] sm:w-[440px] h-[620px] max-h-[85vh] bg-[#0b0b0f] border border-[#cfa156]/45 shadow-2xl flex flex-col text-[#ece5d8]"
        >
          {/* Header */}
          <div className="px-4 py-3.5 bg-[#111115] border-b border-[#ece5d8]/10 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <EnigmaCrest className="w-6 h-6" />
              <div>
                <h2 className="font-display text-base tracking-wide text-[#ece5d8]">
                  ENIGMA Grail Stylist
                </h2>
                <p className="font-mono text-[9px] tracking-[0.24em] uppercase text-[#cfa156]">
                  HYBRID RAG · TOOL ROUTER · GENERATIVE UI
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setKeyOpen(v => !v)}
                aria-label="Configure Gemini API Key"
                title="Configure Optional Gemini API Key (AQ.* / AIza*)"
                className="p-1 text-[#9a948a] hover:text-[#cfa156]"
              >
                <KeyRound className="w-4 h-4" />
              </button>
              <button
                id="close-ai-stylist-btn"
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close Grail Stylist"
                className="p-1 text-[#9a948a] hover:text-[#ece5d8]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {keyOpen && (
            <div className="px-3 py-2 bg-[#070709] border-b border-[#ece5d8]/10 flex items-center gap-2">
              <input
                type="password"
                value={keyDraft}
                onChange={e => setKeyDraft(e.target.value)}
                placeholder="AQ.... or AIzaSy..."
                className="flex-1 bg-[#111115] border border-[#ece5d8]/15 px-2.5 py-1 text-xs text-[#ece5d8] focus:outline-none focus:border-[#cfa156]"
              />
              <button
                type="button"
                onClick={() => {
                  try {
                    window.localStorage.setItem(ENIGMA_KEY_STORAGE, keyDraft.trim())
                  } catch {
                    // ignore
                  }
                  setKeyOpen(false)
                  toast('Saved Gemini API key locally.', 'success')
                }}
                className="px-2.5 py-1 bg-[#cfa156] text-[#070709] font-mono text-[10px] uppercase tracking-wider"
              >
                Save
              </button>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {entries.map(entry => (
              <div
                key={entry.id}
                className={`flex flex-col gap-2 ${
                  entry.role === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                <div
                  className={`max-w-[90%] px-3.5 py-2.5 text-xs leading-relaxed ${
                    entry.role === 'user'
                      ? 'bg-[#cfa156] text-[#070709] font-medium'
                      : 'bg-[#111115] border border-[#ece5d8]/10 text-[#ece5d8]'
                  }`}
                >
                  {entry.text}
                </div>

                {entry.toolsInvoked && entry.toolsInvoked.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {entry.toolsInvoked.map(tool => (
                      <span
                        key={tool}
                        className="px-2 py-0.5 bg-[#1c1d24] border border-[#ece5d8]/10 font-mono text-[9px] uppercase tracking-wider text-[#9a948a]"
                      >
                        tool:{tool}
                      </span>
                    ))}
                  </div>
                )}

                {/* Generative UI Blocks */}
                {entry.uiBlocks?.map((block, bIdx) => {
                  if (block.kind === 'product_cards') {
                    return (
                      <div key={bIdx} className="w-full space-y-2.5">
                        <p className="font-mono text-[10px] tracking-[0.22em] text-[#cfa156] uppercase">
                          {block.title}
                        </p>
                        {block.products.map(p => {
                          const activeSz = selectedSizes[p.id] || p.sizes?.[0] || 'One Size'
                          return (
                            <div
                              key={p.id}
                              className="p-2.5 bg-[#111115] border border-[#ece5d8]/12 flex gap-3"
                            >
                              {p.imageUrl && (
                                <img
                                  src={p.imageUrl}
                                  alt={p.name}
                                  onClick={() => navigate(`/products/${p.id}`)}
                                  className="w-16 h-20 object-cover bg-[#070709] cursor-pointer flex-shrink-0"
                                />
                              )}
                              <div className="flex-1 min-w-0">
                                <button
                                  type="button"
                                  onClick={() => navigate(`/products/${p.id}`)}
                                  className="text-left text-xs font-medium text-[#ece5d8] hover:text-[#cfa156] line-clamp-1"
                                >
                                  {p.name}
                                </button>
                                <p className="font-mono text-[11px] text-[#cfa156] tabular-nums mt-0.5">
                                  {formatVnd(p.price)}
                                </p>
                                <div className="flex flex-wrap gap-1 my-1.5">
                                  {(p.sizes?.length ? p.sizes : ['One Size']).slice(0, 4).map(sz => (
                                    <button
                                      key={sz}
                                      type="button"
                                      onClick={() =>
                                        setSelectedSizes(prev => ({ ...prev, [p.id]: sz }))
                                      }
                                      className={`px-1.5 py-0.5 font-mono text-[10px] border ${
                                        activeSz === sz
                                          ? 'border-[#cfa156] text-[#cfa156]'
                                          : 'border-[#ece5d8]/15 text-[#9a948a]'
                                      }`}
                                    >
                                      {sz}
                                    </button>
                                  ))}
                                </div>
                                <button
                                  type="button"
                                  onClick={() => void handleQuickAdd(p)}
                                  className="w-full py-1.5 bg-[#cfa156] text-[#070709] font-mono text-[10px] font-semibold uppercase tracking-widest flex items-center justify-center gap-1"
                                >
                                  <ShoppingBag className="w-3 h-3" /> Add ({activeSz})
                                </button>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )
                  }

                  if (block.kind === 'comparison_table') {
                    return (
                      <div
                        key={bIdx}
                        className="w-full bg-[#111115] border border-[#ece5d8]/15 p-3 space-y-2"
                      >
                        <p className="font-mono text-[10px] tracking-[0.2em] text-[#cfa156] uppercase">
                          {block.title}
                        </p>
                        <div className="grid grid-cols-2 gap-2 text-[11px]">
                          {block.columns.map(col => (
                            <div
                              key={col.id}
                              className="p-2 bg-[#070709] border border-[#ece5d8]/10 space-y-1"
                            >
                              <p className="font-medium text-[#ece5d8] line-clamp-2">{col.name}</p>
                              <p className="font-mono text-[#cfa156] tabular-nums">
                                {formatVnd(col.price)}
                              </p>
                              <p className="font-mono text-[10px] text-[#9a948a]">
                                {col.releaseType} · {col.condition}
                              </p>
                              <p className="font-mono text-[10px] text-[#9a948a]">
                                Sizes: {col.sizes}
                              </p>
                            </div>
                          ))}
                        </div>
                        <p className="text-[11px] text-[#9a948a] italic pt-1">{block.verdict}</p>
                      </div>
                    )
                  }

                  if (block.kind === 'auction_card') {
                    return (
                      <div key={bIdx} className="w-full space-y-2">
                        <p className="font-mono text-[10px] tracking-[0.2em] text-[#cfa156] uppercase">
                          {block.title}
                        </p>
                        {block.lots.map(lot => (
                          <div
                            key={lot.id}
                            className="p-3 bg-[#111115] border border-[#cfa156]/35 space-y-2"
                          >
                            <p className="text-xs font-medium text-[#ece5d8]">{lot.title}</p>
                            <div className="flex items-center justify-between font-mono text-[11px] tabular-nums">
                              <span className="text-[#cfa156]">
                                Bid: {formatVnd(lot.currentBid)}
                              </span>
                              <span className="inline-flex items-center gap-1 text-[#ece5d8]">
                                <Clock className="w-3 h-3 text-[#cfa156]" />
                                {formatCountdown(lot.remainingSeconds)}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setOpen(false)
                                navigate('/auctions')
                              }}
                              className="w-full py-1.5 border border-[#cfa156] text-[#cfa156] font-mono text-[10px] uppercase tracking-widest hover:bg-[#cfa156] hover:text-[#070709] transition"
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
                        className="w-full p-3 bg-[#111115] border border-[#ece5d8]/15 space-y-2.5"
                      >
                        <div className="flex items-center justify-between font-mono text-[10px]">
                          <span className="text-[#cfa156] uppercase">{block.title}</span>
                          <span className="tabular-nums text-[#ece5d8]">
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
                                  st.completed ? 'text-[#cfa156]' : 'text-[#9a948a]/30'
                                }`}
                              />
                              <span
                                className={
                                  st.completed ? 'text-[#ece5d8]' : 'text-[#9a948a]/60'
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
                          className="inline-flex items-center gap-1 font-mono text-[10px] text-[#cfa156] uppercase tracking-widest"
                        >
                          Inspect Full Dossier <ArrowUpRight className="w-3 h-3" />
                        </button>
                      </div>
                    )
                  }

                  if (block.kind === 'taste_codex_prompt') {
                    return (
                      <div
                        key={bIdx}
                        className="w-full p-3.5 bg-[#111115] border border-[#cfa156]/45 space-y-2"
                      >
                        <div className="flex items-center gap-2 text-[#cfa156] font-mono text-[10px] uppercase tracking-widest">
                          <Compass className="w-3.5 h-3.5" />
                          <span>{block.title}</span>
                        </div>
                        <p className="text-xs text-[#9a948a] leading-relaxed">{block.subtitle}</p>
                        <button
                          type="button"
                          onClick={() => {
                            setOpen(false)
                            navigate(block.ctaUrl)
                          }}
                          className="w-full py-2 bg-[#cfa156] text-[#070709] font-mono text-[10px] font-semibold uppercase tracking-widest"
                        >
                          Open 8-Step Style Decoder
                        </button>
                      </div>
                    )
                  }

                  return null
                })}
              </div>
            ))}
            {sending && (
              <div className="font-mono text-[10px] tracking-[0.24em] text-[#9a948a] uppercase">
                QUERYING ARCHIVE INDEX...
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick Prompt Strip */}
          <div className="px-3 py-2 border-t border-[#ece5d8]/10 bg-[#070709] flex gap-1.5 overflow-x-auto">
            {QUICK_PROMPTS.map(prompt => (
              <button
                key={prompt}
                type="button"
                onClick={() => void sendQuery(prompt)}
                className="flex-shrink-0 px-2.5 py-1 border border-[#ece5d8]/15 hover:border-[#cfa156] font-mono text-[10px] text-[#9a948a] hover:text-[#ece5d8] whitespace-nowrap transition"
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
            className="p-3 bg-[#111115] border-t border-[#ece5d8]/10 flex gap-2"
          >
            <input
              id="ai-stylist-input"
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask for grails, compare items, live auctions, order #..."
              className="flex-1 bg-[#070709] border border-[#ece5d8]/15 px-3 py-2 text-xs text-[#ece5d8] placeholder-[#9a948a] focus:outline-none focus:border-[#cfa156]"
            />
            <button
              type="submit"
              disabled={sending}
              aria-label="Send message to Grail Stylist"
              className="px-3.5 py-2 bg-[#cfa156] text-[#070709] hover:bg-[#dec37b] disabled:opacity-40 transition"
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
