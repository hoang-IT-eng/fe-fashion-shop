import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Trash2, Plus, Minus, Tag, ArrowRight, ShieldCheck } from 'lucide-react'
import { useCartStore } from '../store/useCartStore'
import { formatVnd } from '../lib/format'
import Breadcrumb from '../components/Breadcrumb'
import EmptyState from '../components/EmptyState'
import { useToast } from '../components/Toast'

export default function CartPage() {
  const navigate = useNavigate()
  const {
    items,
    fetchCart,
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

  useEffect(() => {
    void fetchCart()
  }, [fetchCart])

  const sub = subtotal()
  const disc = discountAmount()
  const final = finalTotal()

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!codeInput.trim()) return
    try {
      const res = await applyVoucherCode(codeInput)
      toast(res.message, 'success')
      setCodeInput('')
    } catch (err: any) {
      toast(err?.message || 'Invalid code', 'error')
    }
  }

  return (
    <div className="min-h-screen bg-ink text-bone py-10 md:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Breadcrumb items={[{ label: 'Archive', path: '/' }, { label: 'Vault Allocation Bag' }]} />

        <h1 className="font-display text-4xl md:text-5xl text-bone pb-8 border-b border-bone/10 mb-10">
          Vault Allocation Bag
        </h1>

        {items.length === 0 ? (
          <EmptyState
            title="Your Vault Bag Is Empty"
            description="Reserve authenticated archive pieces or decode your 8-step Mystery Chest allocation."
            actionLabel="Browse Drops"
            onAction={() => navigate('/products')}
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-8 space-y-4">
              {items.map(item => (
                <div
                  key={item.id}
                  className="p-4 sm:p-5 bg-ink-raised border border-bone/12 flex gap-5"
                >
                  <img
                    src={item.imageUrl || '/images/enigma/grail-sneaker-obsidian.jpg'}
                    alt={item.name}
                    className="w-24 h-32 object-cover bg-ink flex-shrink-0"
                  />
                  <div className="flex-1 flex flex-col justify-between">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h2 className="font-display text-2xl text-bone">{item.name}</h2>
                        <p className="font-mono text-xs text-bone-muted uppercase tracking-wider mt-1">
                          {item.size ? `Size: ${item.size}` : 'Vault Spec'}
                          {item.color ? ` · Finish: ${item.color}` : ''}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => void removeItem(item.id)}
                        className="text-bone-muted hover:text-red-400 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-bone/10">
                      <div className="inline-flex items-center border border-bone/20 bg-ink">
                        <button
                          type="button"
                          onClick={() =>
                            item.quantity > 1
                              ? void updateItem(item.id, item.quantity - 1)
                              : void removeItem(item.id)
                          }
                          className="px-3 py-2 text-bone-muted hover:text-bone"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-3.5 font-mono text-xs tabular-nums">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => void updateItem(item.id, item.quantity + 1)}
                          className="px-3 py-2 text-bone-muted hover:text-bone"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <span className="font-mono text-base font-semibold text-bone tabular-nums">
                        {formatVnd(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <aside className="lg:col-span-4">
              <div className="bg-ink-raised border border-bone/15 p-6 space-y-6 sticky top-28">
                <h2 className="font-display text-2xl text-bone">Valuation Summary</h2>

                {appliedVoucher ? (
                  <div className="p-3.5 bg-ink border border-bone/50 flex items-center justify-between font-mono text-xs">
                    <span className="inline-flex items-center gap-2 text-bone">
                      <Tag className="w-3.5 h-3.5" /> {appliedVoucher.code} ACTIVE
                    </span>
                    <button
                      type="button"
                      onClick={removeVoucher}
                      className="text-[10px] uppercase text-bone-muted hover:text-bone"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApply} className="flex gap-2">
                    <input
                      type="text"
                      value={codeInput}
                      onChange={e => setCodeInput(e.target.value)}
                      placeholder="Privilege code (NOCTURNE15)"
                      className="flex-1 bg-ink border border-bone/15 px-3 py-2.5 font-mono text-xs text-bone uppercase focus:outline-none focus:border-bone"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2.5 border border-bone text-bone font-mono text-xs uppercase tracking-widest hover:bg-bone hover:text-ink transition"
                    >
                      Apply
                    </button>
                  </form>
                )}

                <div className="space-y-2.5 font-mono text-xs border-y border-bone/10 py-4">
                  <div className="flex justify-between text-bone-muted">
                    <span>SUBTOTAL</span>
                    <span className="tabular-nums">{formatVnd(sub)}</span>
                  </div>
                  {disc > 0 && (
                    <div className="flex justify-between text-bone">
                      <span>PRIVILEGE CREDIT</span>
                      <span className="tabular-nums">-{formatVnd(disc)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-bone-muted">
                    <span>INSURED DISPATCH</span>
                    <span>CALCULATED NEXT</span>
                  </div>
                  <div className="flex justify-between text-base font-semibold text-bone pt-2 border-t border-bone/10">
                    <span>TOTAL</span>
                    <span className="tabular-nums">{formatVnd(final)}</span>
                  </div>
                </div>

                <button
                  id="cart-proceed-checkout-btn"
                  type="button"
                  onClick={() => navigate('/checkout')}
                  className="w-full py-4 bg-bone text-ink font-mono text-xs font-semibold uppercase tracking-[0.24em] hover:bg-bone-dim transition flex items-center justify-center gap-2"
                >
                  Proceed to Armored Checkout <ArrowRight className="w-4 h-4" />
                </button>

                <p className="flex items-center gap-2 font-mono text-[10px] text-bone-muted uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4 text-bone" />
                  NFC Provenance &amp; Tamper-Evident Vault Seal Included
                </p>
              </div>
            </aside>
          </div>
        )}
      </div>
    </div>
  )
}
