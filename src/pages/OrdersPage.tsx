import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Package, ArrowUpRight } from 'lucide-react'
import { api } from '../api/apiClient'
import { Order } from '../types/order'
import { formatVnd } from '../lib/format'
import Breadcrumb from '../components/Breadcrumb'
import EmptyState from '../components/EmptyState'

const STATUS_STYLE: Record<string, string> = {
  pending: 'border-amber-400/50 text-amber-300',
  confirmed: 'border-bone text-bone',
  shipping: 'border-sky-400/50 text-sky-300',
  delivered: 'border-emerald-400/50 text-emerald-300',
  cancelled: 'border-red-400/50 text-red-300',
}

export default function OrdersPage() {
  const navigate = useNavigate()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    void api
      .get<Order[]>('/orders/my')
      .then(res => setOrders(Array.isArray(res) ? res : []))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-ink text-bone py-10 md:py-14">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <Breadcrumb items={[{ label: 'Archive', path: '/' }, { label: 'Provenance Orders' }]} />

        <div className="pb-8 border-b border-bone/10 mb-10">
          <p className="font-mono text-xs tracking-[0.3em] uppercase text-bone mb-2">
            DISPATCH TELEMETRY
          </p>
          <h1 className="font-display text-4xl md:text-5xl text-bone">
            Order Provenance Ledger
          </h1>
        </div>

        {loading ? (
          <div className="font-mono text-xs text-bone-muted">LOADING LEDGER...</div>
        ) : orders.length === 0 ? (
          <EmptyState
            title="No Provenance Dispatches Found"
            description="Completed drop acquisitions and mystery vault allocations appear here."
            actionLabel="Explore Drops"
            onAction={() => navigate('/products')}
          />
        ) : (
          <div className="space-y-4">
            {orders.map(order => (
              <Link
                key={order.id}
                to={`/orders/${order.id}`}
                className="block p-6 bg-ink-raised border border-bone/12 hover:border-bone/60 transition"
              >
                <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-bone/10">
                  <div className="flex items-center gap-3">
                    <Package className="w-4 h-4 text-bone" />
                    <span className="font-mono text-sm font-semibold text-bone tabular-nums">
                      ORDER #{order.id}
                    </span>
                    <span className="font-mono text-xs text-bone-muted">
                      · {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-3 py-1 bg-ink border font-mono text-[10px] uppercase tracking-widest ${
                        STATUS_STYLE[order.status] || 'border-bone/20 text-bone'
                      }`}
                    >
                      {order.status}
                    </span>
                    <span className="font-mono text-base font-semibold text-bone tabular-nums">
                      {formatVnd(order.total)}
                    </span>
                    <ArrowUpRight className="w-4 h-4 text-bone-muted" />
                  </div>
                </div>

                <div className="pt-4 flex flex-wrap items-center justify-between gap-4 text-xs text-bone-muted">
                  <span>
                    {order.items.map(i => `${i.name} (×${i.quantity})`).join(' · ')}
                  </span>
                  <span className="font-mono uppercase tracking-wider">
                    {order.paymentMethod.toUpperCase()} · {order.paymentStatus || 'VERIFIED'}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
