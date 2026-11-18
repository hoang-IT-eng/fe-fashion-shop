import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { X, Trash2, Plus, Minus, Tag, ArrowRight, ShoppingBag } from 'lucide-react'
import { useCartStore } from '../store/useCartStore'
import { formatVnd } from '../lib/format'
import { useToast } from './Toast'

export function CartDrawer() {
  const navigate = useNavigate()
  const {
    items,
    drawerOpen,
    closeDrawer,
    updateItem,
    removeItem,
    appliedVoucher,
    applyVoucherCode,
    removeVoucher,
    subtotal,
    discountAmount,
    finalTotal,
  } = useCartStore()
  const { toast } = useToast()

  const [codeInput, setCodeInput] = useState('')
  const [validating, setValidating] = useState(false)

  if (!drawerOpen) return null

  const sub = subtotal()
  const disc = discountAmount()
  const final = finalTotal()

  const handleApplyCode = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!codeInput.trim()) return
    try {
      setValidating(true)
      const res = await applyVoucherCode(codeInput)
      toast(res.message, 'success')
      setCodeInput('')
    } catch (err: any) {
      toast(err?.message || 'Invalid privilege code', 'error')
    } finally {
      setValidating(false)
    }
  }

  return (
    <div
      id="enigma-cart-drawer"
      role="dialog"
      aria-modal="true"
      aria-label="Vault Allocation Bag"
      className="fixed inset-0 z-[100] flex justify-end bg-black/75 backdrop-blur-sm"
      onClick={closeDrawer}
    >
      <div
        onClick={e => e.stopPropagation()}
        className="w-full max-w-md bg-[#111111] border-l border-[#f9f9f9]/15 h-full flex flex-col text-[#f9f9f9] shadow-2xl"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#f9f9f9]/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="w-4 h-4 text-[#f9f9f9]" />
            <h2 className="font-display text-xl tracking-wide">Vault Allocation Bag</h2>
            <span className="font-mono text-xs text-[#a3a3a3] tabular-nums">
              ({items.reduce((s, i) => s + i.quantity, 0)})
            </span>
          </div>
          <button
            id="close-cart-drawer-btn"
            type="button"
            onClick={closeDrawer}
            aria-label="Close Vault Bag"
            className="p-1.5 text-[#a3a3a3] hover:text-[#f9f9f9] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-12">
              <p className="font-display text-2xl text-[#f9f9f9] mb-2">Your Vault Bag Is Empty</p>
              <p className="text-xs text-[#a3a3a3] max-w-xs mb-6 leading-relaxed">
                Explore numbered archive drops, matched Mystery Chests, or live Grail Auctions.
              </p>
              <button
                type="button"
                onClick={() => {
                  closeDrawer()
                  navigate('/products')
                }}
                className="px-6 py-3 bg-[#f9f9f9] text-[#0a0a0a] font-mono text-xs font-semibold uppercase tracking-[0.22em]"
              >
                Explore Archive Drops
              </button>
            </div>
          ) : (
            items.map(item => (
              <div
                key={item.id}
                className="flex gap-4 p-3 bg-[#111111] border border-[#f9f9f9]/10"
              >
                <img
                  src={item.imageUrl || '/images/enigma/grail-sneaker-obsidian.jpg'}
                  alt={item.name}
                  className="w-20 h-24 object-cover bg-[#0a0a0a] flex-shrink-0"
                />
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-medium text-[#f9f9f9] line-clamp-2">
                        {item.name}
                      </h3>
                      <button
                        type="button"
                        onClick={() => void removeItem(item.id)}
                        aria-label={`Remove ${item.name}`}
                        className="text-[#a3a3a3] hover:text-red-400 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="font-mono text-[10px] text-[#a3a3a3] uppercase tracking-wider mt-1">
                      {item.size ? `Size ${item.size}` : 'Vault Spec'}
                      {item.color ? ` · ${item.color}` : ''}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div className="inline-flex items-center border border-[#f9f9f9]/15">
                      <button
                        type="button"
                        onClick={() =>
                          item.quantity > 1
                            ? void updateItem(item.id, item.quantity - 1)
                            : void removeItem(item.id)
                        }
                        className="px-2 py-1 text-[#a3a3a3] hover:text-[#f9f9f9]"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-2.5 font-mono text-xs tabular-nums">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => void updateItem(item.id, item.quantity + 1)}
                        className="px-2 py-1 text-[#a3a3a3] hover:text-[#f9f9f9]"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <span className="font-mono text-xs font-semibold text-[#f9f9f9] tabular-nums">
                      {formatVnd(item.price * item.quantity)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer & Privilege Code */}
        {items.length > 0 && (
          <div className="p-6 border-t border-[#f9f9f9]/10 bg-[#111111] space-y-4">
            {appliedVoucher ? (
              <div className="flex items-center justify-between px-3.5 py-2.5 border border-[#f9f9f9]/50 bg-[#0a0a0a] text-xs font-mono">
                <div className="flex items-center gap-2 text-[#f9f9f9]">
                  <Tag className="w-3.5 h-3.5" />
                  <span>{appliedVoucher.code} ACTIVE</span>
                </div>
                <button
                  type="button"
                  onClick={removeVoucher}
                  className="text-[10px] uppercase tracking-widest text-[#a3a3a3] hover:text-[#f9f9f9]"
                >
                  Remove
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCode} className="flex gap-2">
                <input
                  id="drawer-voucher-input"
                  type="text"
                  value={codeInput}
                  onChange={e => setCodeInput(e.target.value)}
                  placeholder="Privilege Code (e.g. ENIGMA15)"
                  className="flex-1 bg-[#0a0a0a] border border-[#f9f9f9]/15 px-3 py-2 font-mono text-xs text-[#f9f9f9] placeholder-[#a3a3a3] uppercase focus:outline-none focus:border-[#f9f9f9]"
                />
                <button
                  type="submit"
                  disabled={validating}
                  className="px-4 py-2 border border-[#f9f9f9] text-[#f9f9f9] font-mono text-xs uppercase tracking-wider hover:bg-[#f9f9f9] hover:text-[#0a0a0a] transition"
                >
                  Apply
                </button>
              </form>
            )}

            <div className="space-y-1.5 text-xs font-mono">
              <div className="flex justify-between text-[#a3a3a3]">
                <span>SUBTOTAL</span>
                <span className="tabular-nums">{formatVnd(sub)}</span>
              </div>
              {disc > 0 && (
                <div className="flex justify-between text-[#f9f9f9]">
                  <span>PRIVILEGE ({appliedVoucher?.code})</span>
                  <span className="tabular-nums">-{formatVnd(disc)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-semibold text-[#f9f9f9] pt-2 border-t border-[#f9f9f9]/10">
                <span>ESTIMATED TOTAL</span>
                <span className="tabular-nums">{formatVnd(final)}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => {
                  closeDrawer()
                  navigate('/cart')
                }}
                className="py-3 border border-[#f9f9f9]/20 font-mono text-xs uppercase tracking-widest text-[#f9f9f9] hover:border-[#f9f9f9]/50 transition"
              >
                Full Bag
              </button>
              <button
                id="drawer-checkout-btn"
                type="button"
                onClick={() => {
                  closeDrawer()
                  navigate('/checkout')
                }}
                className="py-3 bg-[#f9f9f9] text-[#0a0a0a] font-mono text-xs font-semibold uppercase tracking-widest hover:bg-[#d9d9d9] transition inline-flex items-center justify-center gap-1.5"
              >
                Checkout <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
