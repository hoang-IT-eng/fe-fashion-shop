import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/useAuthStore'
import { api } from '../api/apiClient'
import { Order, OrderStatus } from '../types/order'
import EmptyState from '../components/EmptyState'

const STATUS_LABEL: Record<OrderStatus, { label: string; color: string }> = {
  pending:   { label: 'Chờ xác nhận', color: 'bg-yellow-100 text-yellow-700' },
  confirmed: { label: 'Đã xác nhận',  color: 'bg-blue-100 text-blue-700' },
  shipping:  { label: 'Đang giao',    color: 'bg-purple-100 text-purple-700' },
  delivered: { label: 'Đã giao',      color: 'bg-green-100 text-green-700' },
  cancelled: { label: 'Đã hủy',       color: 'bg-red-100 text-red-700' },
}

const PAGE_SIZE = 5

export default function OrdersPage() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)

  useEffect(() => {
    if (!isAuthenticated) { navigate('/auth'); return }
    api.get<Order[]>('/orders/my')
      .then(data => setOrders(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-400">Đang tải...</div>

  const totalPages = Math.ceil(orders.length / PAGE_SIZE)
  const paginated = orders.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <div className="min-h-screen bg-white font-sans">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-2xl font-light uppercase tracking-widest mb-10">Đơn hàng của tôi</h1>

        {orders.length === 0 ? (
          <EmptyState
            icon="📦"
            title="Chưa có đơn hàng"
            description="Bạn chưa đặt đơn hàng nào. Hãy khám phá sản phẩm và mua sắm ngay!"
            actionLabel="Mua sắm ngay"
            onAction={() => navigate('/products')}
          />
        ) : (
          <>
            <div className="space-y-4 mb-8">
              {paginated.map(order => {
                const s = STATUS_LABEL[order.status]
                return (
                  <div key={order.id}
                    className="border border-gray-200 p-6 hover:border-gray-400 transition cursor-pointer"
                    onClick={() => navigate(`/orders/${order.id}`)}>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="font-medium text-gray-900">Đơn #{order.id}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{new Date(order.createdAt).toLocaleDateString('vi-VN')}</p>
                      </div>
                      <span className={`px-3 py-1 text-xs font-bold rounded-sm ${s.color}`}>{s.label}</span>
                    </div>
                    <div className="space-y-1 mb-4">
                      {order.items?.map((item, i) => (
                        <div key={i} className="flex justify-between text-sm text-gray-600">
                          <span>{item.name} × {item.quantity}</span>
                          <span>{(item.price * item.quantity).toLocaleString('vi-VN')} đ</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between font-bold border-t border-gray-100 pt-3 text-sm">
                      <span>Tổng cộng</span>
                      <span>{order.total?.toLocaleString('vi-VN')} đ</span>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="px-4 py-2 text-sm border border-gray-300 hover:border-black transition disabled:opacity-40">
                  ← Trước
                </button>
                {[...Array(totalPages)].map((_, i) => (
                  <button key={i} onClick={() => setPage(i + 1)}
                    className={`w-9 h-9 text-sm border transition ${page === i + 1 ? 'bg-black text-white border-black' : 'border-gray-300 hover:border-black'}`}>
                    {i + 1}
                  </button>
                ))}
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="px-4 py-2 text-sm border border-gray-300 hover:border-black transition disabled:opacity-40">
                  Sau →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
