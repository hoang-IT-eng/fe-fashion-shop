import React, { useEffect, useState } from 'react'
import { Eye, X } from 'lucide-react'
import { api } from '../../api/apiClient'
import { Order, OrderStatus } from '../../types/order'
import { formatVnd } from '../../lib/format'
import { useToast } from '../../components/Toast'

const STATUS_OPTIONS: OrderStatus[] = [
  'pending',
  'confirmed',
  'shipping',
  'delivered',
  'cancelled',
]

export default function AdminOrdersPage() {
  const { toast } = useToast()
  const [orders, setOrders] = useState<Order[]>([])
  const [filter, setFilter] = useState<string>('')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  const loadOrders = async () => {
    const res = await api.get<Order[]>('/orders')
    setOrders(Array.isArray(res) ? res : [])
  }

  useEffect(() => {
    void loadOrders()
  }, [])

  const handleStatusChange = async (orderId: number, status: OrderStatus) => {
    try {
      const updated = await api.patch<Order>(`/orders/${orderId}/status`, { status })
      setOrders(prev => prev.map(o => (o.id === orderId ? updated : o)))
      if (selectedOrder?.id === orderId) setSelectedOrder(updated)
      toast(`Order #${orderId} transitioned to ${status.toUpperCase()}.`, 'success')
    } catch (err: any) {
      toast(err?.message || 'Status update failed', 'error')
    }
  }

  const visible = filter ? orders.filter(o => o.status === filter) : orders

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="font-mono text-[10px] tracking-[0.28em] uppercase text-bone">
            PROVENANCE DISPATCH PIPELINE
          </p>
          <h2 className="font-display text-2xl md:text-3xl text-bone">
            Fulfillment Workflow ({visible.length})
          </h2>
        </div>

        <div className="flex flex-wrap gap-1.5 font-mono text-[11px]">
          <button
            type="button"
            onClick={() => setFilter('')}
            className={`px-3 py-1.5 border uppercase ${
              !filter ? 'border-bone text-bone' : 'border-bone/15 text-bone-muted'
            }`}
          >
            All ({orders.length})
          </button>
          {STATUS_OPTIONS.map(st => (
            <button
              key={st}
              type="button"
              onClick={() => setFilter(st)}
              className={`px-3 py-1.5 border uppercase ${
                filter === st
                  ? 'border-bone text-bone'
                  : 'border-bone/15 text-bone-muted'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-ink-raised border border-bone/12 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-bone/10 font-mono text-[10px] uppercase tracking-[0.22em] text-bone-muted">
              <th className="py-3.5 px-4">Order</th>
              <th className="py-3.5 px-4">Collector</th>
              <th className="py-3.5 px-4">Total</th>
              <th className="py-3.5 px-4">Payment</th>
              <th className="py-3.5 px-4">Workflow Stage</th>
              <th className="py-3.5 px-4 text-right">Dossier</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-bone/10 text-xs">
            {visible.map(o => (
              <tr key={o.id} className="hover:bg-umber-line/40 transition">
                <td className="py-3 px-4 font-mono text-bone tabular-nums">#{o.id}</td>
                <td className="py-3 px-4">
                  <p className="text-bone">{o.shippingName || `Collector #${o.userId}`}</p>
                  <p className="font-mono text-[10px] text-bone-muted">
                    {new Date(o.createdAt).toLocaleDateString()}
                  </p>
                </td>
                <td className="py-3 px-4 font-mono text-bone font-semibold tabular-nums">
                  {formatVnd(o.total)}
                </td>
                <td className="py-3 px-4 font-mono uppercase text-[11px] text-bone-muted">
                  {o.paymentMethod} · {o.paymentStatus || 'pending'}
                </td>
                <td className="py-3 px-4">
                  <select
                    value={o.status}
                    onChange={e => void handleStatusChange(o.id, e.target.value as OrderStatus)}
                    className="bg-ink border border-bone/20 px-2.5 py-1.5 font-mono text-xs uppercase text-bone"
                  >
                    {STATUS_OPTIONS.map(st => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="py-3 px-4 text-right">
                  <button
                    type="button"
                    onClick={() => setSelectedOrder(o)}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 border border-bone/15 hover:border-bone font-mono text-[10px] uppercase text-bone"
                  >
                    <Eye className="w-3 h-3" /> Inspect
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Order Detail Slide-Over */}
      {selectedOrder && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[110] flex justify-end bg-black/75 backdrop-blur-sm"
          onClick={() => setSelectedOrder(null)}
        >
          <div
            onClick={e => e.stopPropagation()}
            className="w-full max-w-md bg-ink-raised border-l border-bone/40 h-full overflow-y-auto p-6 md:p-8 space-y-6 text-bone"
          >
            <div className="flex items-center justify-between pb-4 border-b border-bone/10">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-widest text-bone">
                  FULFILLMENT SLIDE-OVER
                </p>
                <h3 className="font-display text-2xl">Order #{selectedOrder.id}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="text-bone-muted hover:text-bone"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="flex justify-between">
                <span className="text-bone-muted">RECIPIENT</span>
                <span>{selectedOrder.shippingName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-bone-muted">PHONE</span>
                <span>{selectedOrder.shippingPhone}</span>
              </div>
              <div>
                <span className="block text-bone-muted mb-1">DESTINATION</span>
                <span>{selectedOrder.shippingAddress}</span>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-bone/10">
              <h4 className="font-mono text-xs uppercase tracking-widest text-bone">
                Allocated Items
              </h4>
              {selectedOrder.items.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-ink border border-bone/10 flex justify-between text-xs"
                >
                  <div>
                    <p className="text-bone">{item.name}</p>
                    <p className="font-mono text-[10px] text-bone-muted">
                      ×{item.quantity} {item.size ? `· ${item.size}` : ''}
                    </p>
                  </div>
                  <span className="font-mono text-bone tabular-nums">
                    {formatVnd(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-bone/10 flex justify-between font-mono text-sm font-semibold">
              <span>SETTLEMENT TOTAL</span>
              <span className="text-bone tabular-nums">{formatVnd(selectedOrder.total)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
