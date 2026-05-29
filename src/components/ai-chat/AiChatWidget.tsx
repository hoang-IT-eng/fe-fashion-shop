import React, { useEffect, useRef, useState } from 'react'
import { MessageCircle, X, Send, RotateCcw, Sparkles, Wifi, WifiOff } from 'lucide-react'
import { useAiChat } from '../../hooks/useAiChat'
import type { AiChatFilters } from '../../types/ai-chat'
import ProductRecommendationCards from './ProductRecommendationCards'

function FilterChips({ filters }: { filters?: AiChatFilters }) {
  if (!filters) return null

  const chips: string[] = []
  if (filters.category) chips.push(`🏷️ ${filters.category}`)
  if (filters.color) chips.push(`🎨 ${filters.color}`)
  if (filters.style) chips.push(`✨ ${filters.style}`)
  if (filters.keywords?.length) chips.push(...filters.keywords.map(k => `#${k}`))
  if (filters.minPrice != null || filters.maxPrice != null) {
    const min = filters.minPrice != null ? `${filters.minPrice.toLocaleString('vi-VN')}` : '0'
    const max = filters.maxPrice != null ? `${filters.maxPrice.toLocaleString('vi-VN')}` : '∞'
    chips.push(`💰 ${min}–${max} đ`)
  }

  if (chips.length === 0) return null

  return (
    <div className="flex flex-wrap gap-1.5 mt-2">
      {chips.map(c => (
        <span
          key={c}
          className="text-[10px] px-2 py-0.5 rounded-full bg-purple-50 text-purple-600 border border-purple-100 font-medium"
        >
          {c}
        </span>
      ))}
    </div>
  )
}

function TypingDots() {
  return (
    <div className="flex items-end gap-3">
      {/* Avatar */}
      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-sm">
        <Sparkles size={12} className="text-white" />
      </div>
      <div className="bg-white border border-gray-100 shadow-sm rounded-2xl rounded-bl-sm px-4 py-3">
        <span className="flex gap-1 items-center h-4">
          <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce [animation-delay:0ms]" />
          <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce [animation-delay:150ms]" />
          <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce [animation-delay:300ms]" />
        </span>
      </div>
    </div>
  )
}

export default function AiChatWidget() {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const listRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const { connected, connecting, loading, error, messages, sendMessage, clearSession } =
    useAiChat(open)

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [open])

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' })
    }
  }, [messages, loading])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || loading) return
    sendMessage(input)
    setInput('')
  }

  const statusColor = connecting ? 'bg-yellow-400' : connected ? 'bg-emerald-400' : 'bg-red-400'
  const statusText = connecting ? 'Đang kết nối...' : connected ? 'Trực tuyến' : 'Mất kết nối'

  return (
    <>
      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .chat-slide-up {
          animation: chatSlideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes chatSlideUp {
          from { opacity: 0; transform: translateY(16px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .msg-in {
          animation: msgIn 0.2s ease-out;
        }
        @keyframes msgIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Backdrop mobile */}
      {open && (
        <div
          className="fixed inset-0 z-[60] bg-black/30 backdrop-blur-[2px] md:hidden"
          onClick={() => setOpen(false)}
          aria-hidden
        />
      )}

      <div className="fixed bottom-5 right-5 z-[70] flex flex-col items-end gap-3">
        {open && (
          <div
            className="chat-slide-up w-[calc(100vw-2.5rem)] sm:w-[400px] h-[min(580px,calc(100vh-6rem))] bg-white rounded-2xl shadow-2xl flex flex-col pointer-events-auto overflow-hidden border border-gray-100"
            role="dialog"
            aria-label="Trợ lý mua sắm AI"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <header className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 text-white flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur flex items-center justify-center shadow-inner">
                  <Sparkles size={18} className="text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold leading-tight">Trợ lý mua sắm AI</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${statusColor} shadow-sm`} />
                    <p className="text-[10px] text-white/70 leading-none">{statusText}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={clearSession}
                  className="p-2 hover:bg-white/15 rounded-xl transition-colors"
                  title="Cuộc trò chuyện mới"
                  aria-label="Cuộc trò chuyện mới"
                >
                  <RotateCcw size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="p-2 hover:bg-white/15 rounded-xl transition-colors"
                  aria-label="Đóng"
                >
                  <X size={17} />
                </button>
              </div>
            </header>

            {/* Messages */}
            <div
              ref={listRef}
              className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-gradient-to-b from-slate-50 to-white hide-scrollbar"
            >
              {messages.length === 0 && !loading && (
                <div className="flex flex-col items-center justify-center h-full gap-4 py-8 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center">
                    <Sparkles size={28} className="text-purple-500" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-1">Xin chào! 👋</p>
                    <p className="text-xs text-gray-400 leading-relaxed max-w-[240px]">
                      Mô tả phong cách hoặc sản phẩm bạn muốn — ví dụ:{' '}
                      <span className="text-purple-500 font-medium">
                        &quot;áo phông trắng đơn giản dưới 500k&quot;
                      </span>
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {['Áo phông basic', 'Quần jeans nam', 'Váy dự tiệc', 'Outfit đi làm'].map(s => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => { sendMessage(s); }}
                        className="text-[11px] px-3 py-1.5 rounded-full border border-purple-200 text-purple-600 hover:bg-purple-50 transition-colors font-medium"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map(msg => (
                <div
                  key={msg.id}
                  className={`msg-in flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {/* AI avatar */}
                  {msg.role === 'assistant' && (
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-sm mb-0.5">
                      <Sparkles size={12} className="text-white" />
                    </div>
                  )}

                  <div
                    className={`max-w-[82%] ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-br from-violet-600 to-purple-600 text-white rounded-2xl rounded-br-sm shadow-md shadow-purple-200'
                        : 'bg-white border border-gray-100 text-gray-800 rounded-2xl rounded-bl-sm shadow-sm'
                    } px-3.5 py-2.5 text-sm leading-relaxed`}
                  >
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                    {msg.role === 'assistant' && (
                      <>
                        <FilterChips filters={msg.filters} />
                        {msg.products && msg.products.length > 0 && (
                          <ProductRecommendationCards products={msg.products} />
                        )}
                      </>
                    )}
                    {/* Timestamp */}
                    <p className={`text-[9px] mt-1.5 ${msg.role === 'user' ? 'text-white/50 text-right' : 'text-gray-300'}`}>
                      {new Date(msg.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>

                  {/* User avatar */}
                  {msg.role === 'user' && (
                    <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 mb-0.5 text-xs font-bold text-gray-500">
                      U
                    </div>
                  )}
                </div>
              ))}

              {loading && <TypingDots />}
            </div>

            {/* Error bar */}
            {error && (
              <div className="flex items-center gap-2 px-4 py-2 text-xs text-red-600 bg-red-50 border-t border-red-100 flex-shrink-0">
                <WifiOff size={12} />
                <span>{error}</span>
              </div>
            )}

            {/* Input */}
            <form
              onSubmit={handleSubmit}
              className="flex items-center gap-2 p-3 border-t border-gray-100 bg-white flex-shrink-0"
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Nhập tin nhắn..."
                disabled={loading}
                className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:border-purple-400 focus:ring-2 focus:ring-purple-100 focus:outline-none disabled:opacity-50 transition-all placeholder:text-gray-400"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-purple-600 text-white flex items-center justify-center disabled:opacity-40 hover:from-violet-700 hover:to-purple-700 transition-all shadow-md shadow-purple-200 flex-shrink-0"
                aria-label="Gửi"
              >
                <Send size={16} />
              </button>
            </form>
          </div>
        )}

        {/* FAB button */}
        <button
          type="button"
          onClick={() => setOpen(v => !v)}
          className="w-14 h-14 rounded-full bg-gradient-to-br from-violet-600 to-purple-600 text-white shadow-lg shadow-purple-300 flex items-center justify-center hover:from-violet-700 hover:to-purple-700 transition-all pointer-events-auto hover:scale-105 active:scale-95"
          aria-label={open ? 'Đóng trợ lý mua sắm' : 'Mở trợ lý mua sắm'}
        >
          <div className={`transition-transform duration-200 ${open ? 'rotate-90' : 'rotate-0'}`}>
            {open ? <X size={22} /> : <MessageCircle size={22} />}
          </div>
          {/* Pulse ring khi đóng */}
          {!open && (
            <span className="absolute w-14 h-14 rounded-full bg-purple-400 opacity-30 animate-ping" />
          )}
        </button>
      </div>
    </>
  )
}
