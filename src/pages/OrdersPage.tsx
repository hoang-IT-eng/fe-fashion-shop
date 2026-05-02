import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/useAuthStore'
import { api } from '../api/apiClient'
import { Order, OrderStatus } from '../types/order'

const STATUS_LABEL: Record<OrderStatus, { label: string; color: string }> = {
  pending:   { label: 'Chờ xác nhận', color: 'bg-yellow-100 text-yellow-700' },
  confirmed: { label: 'Đã xác nhận',  color: 'bg-blue-100 text-blue-700' },
  shipping:  { label: 'Đang giao',    color: 'bg-purple-100 text-purple-700' },
  delivered: { label: 'Đã giao',      color: 'bg-green-100 text-green-700' },
  cancelled: { label: 'Đã hủy',       color: 'bg-red-100 text-red-700' },
}

export default function OrdersPage() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated) { navigate('/auth'); return }
    api.get<Order[]>('/orders/my')
      .then(setOrders)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-400">Đang tải...</div>

  return (
    <div className="min-h-screen bg-white font-sans">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-2xl font-light uppercase tracking-widest mb-10">Đơn hàng của tôi</h1>

        {orders.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-gray-400 mb-6">Bạn chưa có đơn hàng nào</p>
            <button onClick={() => navigate('/')} className="bg-black text-white px-8 py-3 text-sm font-bold uppercase tracking-wider hover:bg-gray-800 transition">
              Mua sắm ngay
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => {
              const s = STATUS_LABEL[order.status]
              return (
                <div key={order.id} className="border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="font-medium text-gray-900">Đơn #{order.id}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{new Date(order.createdAt).toLocaleDateString('vi-VN')}</p>
                    </div>
                    <span className={`px-3 py-1 text-xs font-bold rounded-sm ${s.color}`}>{s.label}</span>
                  </div>
                  <div className="space-y-1 mb-4">
                    {order.items.map((item, i) => (
                      <div key={i} className="flex justify-between text-sm text-gray-600">
                        <span>{item.name} × {item.quantity}</span>
                        <span>{(item.price * item.quantity).toLocaleString('vi-VN')} đ</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between font-bold border-t border-gray-100 pt-3 text-sm">
                    <span>Tổng cộng</span>
                    <span>{order.total.toLocaleString('vi-VN')} đ</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
