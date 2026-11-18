import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { CheckCircle2, ShieldCheck, XCircle } from 'lucide-react'
import { api } from '../api/apiClient'
import { Order } from '../types/order'
import { formatVnd } from '../lib/format'
import Breadcrumb from '../components/Breadcrumb'
import { useToast } from '../components/Toast'

const FIVE_STAGES = [
  { key: 'placed', label: '01 · Order Sealed' },
  { key: 'pending', label: '02 · Vault Reserved' },
  { key: 'confirmed', label: '03 · NFC Authenticated' },
  { key: 'shipping', label: '04 · Armored Transit' },
  { key: 'delivered', label: '05 · Collector Signed' },
]

function stageIndexForStatus(status: string): number {
  if (status === 'pending') return 1
  if (status === 'confirmed') return 2
  if (status === 'shipping') return 3
  if (status === 'delivered') return 4
  return -1
}

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()

  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    void api
      .get<Order>(`/orders/${id}`)
      .then(setOrder)
      .catch(() => navigate('/orders'))
      .finally(() => setLoading(false))
  }, [id, navigate])

  const handleCancel = async () => {
    if (!order) return
    try {
      const updated = await api.delete<Order>(`/orders/${order.id}/cancel`)
      setOrder(updated)
      toast(`Order #${order.id} cancelled.`, 'info')
    } catch (err: any) {
      toast(err?.message || 'Unable to cancel order', 'error')
    }
  }

  if (loading || !order) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center font-mono text-xs text-[#a3a3a3]">
        LOADING PROVENANCE DOSSIER...
      </div>
    )
  }

  const activeStage = stageIndexForStatus(order.status)

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#f9f9f9] py-10 md:py-14">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <Breadcrumb
          items={[
            { label: 'Archive', path: '/' },
            { label: 'Orders', path: '/orders' },
            { label: `Order #${order.id}` },
          ]}
        />

        <div className="flex flex-wrap items-end justify-between gap-4 pb-8 border-b border-[#f9f9f9]/10 mb-10">
          <div>
            <p className="font-mono text-xs tracking-[0.3em] uppercase text-[#f9f9f9] mb-2">
              PROVENANCE DISPATCH CERTIFICATE
            </p>
            <h1 className="font-display text-4xl md:text-5xl text-[#f9f9f9]">
              Order #{order.id}
            </h1>
          </div>
          <div className="font-mono text-xs text-[#a3a3a3]">
            {new Date(order.createdAt).toLocaleString()}
          </div>
        </div>

        {/* 5-Stage Visual Provenance Stepper */}
        <section className="p-6 md:p-8 bg-[#111111] border border-[#f9f9f9]/15 mb-8">
          {order.status === 'cancelled' ? (
            <div className="flex items-center gap-3 text-red-300 font-mono text-sm">
              <XCircle className="w-5 h-5" />
              <span>THIS ALLOCATION HAS BEEN CANCELLED AND RETURNED TO THE VAULT.</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
              {FIVE_STAGES.map((stage, idx) => {
                const done = idx <= activeStage
                const current = idx === activeStage
                return (
                  <div
                    key={stage.key}
                    className={`p-3.5 border transition ${
                      current
                        ? 'border-[#f9f9f9] bg-[#0a0a0a]'
                        : done
                          ? 'border-[#f9f9f9]/40 bg-[#0a0a0a]/60'
                          : 'border-[#f9f9f9]/10 bg-[#0a0a0a]/30 opacity-50'
                    }`}
                  >
                    <CheckCircle2
                      className={`w-4 h-4 mb-2 ${done ? 'text-[#f9f9f9]' : 'text-[#a3a3a3]'}`}
                    />
                    <p className="font-mono text-[11px] uppercase tracking-wider text-[#f9f9f9]">
                      {stage.label}
                    </p>
                  </div>
                )
              })}
            </div>
          )}
        </section>

        {/* Manifest + Recipient */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 bg-[#111111] border border-[#f9f9f9]/12 p-6 space-y-4">
            <h2 className="font-display text-2xl">Authenticated Items</h2>
            {order.items.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between gap-4 py-3 border-b border-[#f9f9f9]/10 last:border-0"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={item.imageUrl || '/images/enigma/grail-sneaker-obsidian.jpg'}
                    alt={item.name}
                    className="w-16 h-20 object-cover bg-[#0a0a0a]"
                  />
                  <div>
                    <p className="font-medium text-sm text-[#f9f9f9]">{item.name}</p>
                    <p className="font-mono text-xs text-[#a3a3a3] mt-0.5">
                      Qty {item.quantity} {item.size ? `· Size ${item.size}` : ''}
                      {item.color ? ` · ${item.color}` : ''}
                    </p>
                  </div>
                </div>
                <span className="font-mono text-sm font-semibold text-[#f9f9f9] tabular-nums">
                  {formatVnd(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          <div className="lg:col-span-5 space-y-6">
            <div className="bg-[#111111] border border-[#f9f9f9]/12 p-6 space-y-3 font-mono text-xs">
              <h2 className="font-display text-2xl text-[#f9f9f9] font-normal mb-2">
                Settlement &amp; Dispatch
              </h2>
              <div className="flex justify-between text-[#a3a3a3]">
                <span>RECIPIENT</span>
                <span className="text-[#f9f9f9]">{order.shippingName || 'Collector'}</span>
              </div>
              <div className="flex justify-between text-[#a3a3a3]">
                <span>PHONE</span>
                <span className="text-[#f9f9f9]">{order.shippingPhone || '—'}</span>
              </div>
              <div className="pt-1 text-[#a3a3a3]">
                <span className="block mb-1">DISPATCH DESTINATION</span>
                <span className="text-[#f9f9f9]">{order.shippingAddress || 'Vault Pickup'}</span>
              </div>
              <div className="pt-3 border-t border-[#f9f9f9]/10 flex justify-between text-[#a3a3a3]">
                <span>PAYMENT</span>
                <span className="text-[#f9f9f9] uppercase">
                  {order.paymentMethod} ({order.paymentStatus || 'pending'})
                </span>
              </div>
              {order.voucherCode && (
                <div className="flex justify-between text-[#f9f9f9]">
                  <span>PRIVILEGE ({order.voucherCode})</span>
                  <span className="tabular-nums">-{formatVnd(order.discountAmount || 0)}</span>
                </div>
              )}
              <div className="pt-3 border-t border-[#f9f9f9]/10 flex justify-between text-base font-semibold text-[#f9f9f9]">
                <span>TOTAL SETTLED</span>
                <span className="tabular-nums">{formatVnd(order.total)}</span>
              </div>
            </div>

            {order.status === 'pending' && (
              <button
                type="button"
                onClick={() => void handleCancel()}
                className="w-full py-3 border border-red-500/50 text-red-300 font-mono text-xs uppercase tracking-widest hover:bg-red-950/40 transition"
              >
                Cancel Pending Reservation
              </button>
            )}

            <div className="p-4 bg-[#111111] border border-[#f9f9f9]/35 flex items-center gap-3 font-mono text-[11px] text-[#a3a3a3]">
              <ShieldCheck className="w-5 h-5 text-[#f9f9f9] flex-shrink-0" />
              <span>NFC Cryptographic Provenance Tag Bound to Order #{order.id}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
