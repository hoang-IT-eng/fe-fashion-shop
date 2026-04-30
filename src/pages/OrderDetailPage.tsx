import React, { useEffect, useState } from 'react'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/useAuthStore'
import { useCartStore } from '../store/useCartStore'
import { api } from '../api/apiClient'
import { Order, OrderStatus } from '../types/order'

const STATUS_LABEL: Record<OrderStatus, { label: string; color: string }> = {
  pending:   { label: 'Chờ xác nhận', color: 'bg-yellow-100 text-yellow-700' },
  confirmed: { label: 'Đã xác nhận',  color: 'bg-blue-100 text-blue-700' },
  shipping:  { label: 'Đang giao',    color: 'bg-purple-100 text-purple-700' },
  delivered: { label: 'Đã giao',      color: 'bg-green-100 text-green-700' },
  cancelled: { label: 'Đã hủy',       color: 'bg-red-100 text-red-700' },
}

export default function OrderDetailPage() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()
  const { clear } = useCartStore()

  const payment = searchParams.get('payment') // 'success' | 'failed' | null
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated) { navigate('/auth'); return }

    // Nếu thanh toán thành công thì clear giỏ hàng
    if (payment === 'success') clear()

    api.get<Order>(`/orders/${id}`)
      .then(setOrder)
      .catch(() => navigate('/orders'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center text-gray-400">Đang tải...</div>
  )

  if (!order) return null

  const s = STATUS_LABEL[order.status]

  return (
    <div className="min-h-screen bg-white font-sans">
      <div className="max-w-2xl mx-auto px-6 py-12">

        {/* Kết quả thanh toán VNPay */}
        {payment === 'success' && (
          <div className="mb-8 rounded-lg bg-green-50 border border-green-200 p-6 text-center">
            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-green-600 text-2xl">✓</span>
            </div>
            <h2 className="text-lg font-bold text-green-700 mb-1">Thanh toán thành công!</h2>
            <p className="text-sm text-green-600">Đơn hàng của bạn đã được xác nhận và đang được xử lý.</p>
          </div>
        )}

        {payment === 'failed' && (
          <div className="mb-8 rounded-lg bg-red-50 border border-red-200 p-6 text-center">
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-red-600 text-2xl">✕</span>
            </div>
            <h2 className="text-lg font-bold text-red-700 mb-1">Thanh toán thất bại</h2>
            <p className="text-sm text-red-600 mb-4">Giao dịch không thành công. Vui lòng thử lại hoặc chọn phương thức khác.</p>
            <button onClick={() => navigate('/cart')}
              className="bg-black text-white px-6 py-2.5 text-sm font-bold uppercase tracking-wider hover:bg-gray-800 transition">
              Quay lại giỏ hàng
            </button>
          </div>
        )}

        {/* Chi tiết đơn hàng */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-light uppercase tracking-widest">Đơn hàng #{order.id}</h1>
          <span className={`px-3 py-1 text-xs font-bold rounded-sm ${s.color}`}>{s.label}</span>
        </div>

        <div className="border border-gray-200 rounded-lg overflow-hidden mb-6">
          <div className="bg-gray-50 px-6 py-3 text-xs font-bold uppercase tracking-wider text-gray-500">
            Sản phẩm
          </div>
          <div className="divide-y divide-gray-100">
            {order.items?.map((item, i) => (
              <div key={i} className="flex justify-between px-6 py-4 text-sm">
                <span className="text-gray-700">{item.name} × {item.quantity}</span>
                <span className="font-medium">{(item.price * item.quantity).toLocaleString('vi-VN')} đ</span>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-200 px-6 py-4 flex justify-between font-bold">
            <span>Tổng cộng</span>
            <span>{order.total?.toLocaleString('vi-VN')} đ</span>
          </div>
        </div>

        <div className="text-sm text-gray-500 mb-8">
          <p>Ngày đặt: {new Date(order.createdAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
          <p className="mt-1">Phương thức: {order.paymentMethod === 'vnpay' ? 'VNPay' : 'Thanh toán khi nhận hàng (COD)'}</p>
        </div>

        <div className="flex gap-3">
          <button onClick={() => navigate('/orders')}
            className="flex-1 border border-gray-300 py-3 text-sm font-bold hover:border-black transition">
            Xem tất cả đơn hàng
          </button>
          <button onClick={() => navigate('/')}
            className="flex-1 bg-black text-white py-3 text-sm font-bold hover:bg-gray-800 transition">
            Tiếp tục mua sắm
          </button>
        </div>
      </div>
    </div>
  )
}
