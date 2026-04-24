import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCartStore } from '../store/useCartStore'
import { useAuthStore } from '../store/useAuthStore'
import { api } from '../api/apiClient'

export default function CheckoutPage() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()
  const { items, total, clear } = useCartStore()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) { navigate('/auth'); return }
    if (items.length === 0) navigate('/cart')
  }, [])

  const handleOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await api.post('/orders', {
        items: items.map(i => ({ productId: i.productId, name: i.name, price: i.price, quantity: i.quantity })),
        total: total(),
        paymentMethod: 'cod',
      })
      clear()
      setSuccess(true)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (success) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white font-sans">
      <div className="text-center max-w-md px-6">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-green-600 text-2xl">✓</span>
        </div>
        <h1 className="text-2xl font-light uppercase tracking-widest mb-3">Đặt hàng thành công</h1>
        <p className="text-gray-500 text-sm mb-8">Cảm ơn bạn đã mua hàng. Chúng tôi sẽ liên hệ xác nhận đơn hàng sớm nhất.</p>
        <button onClick={() => navigate('/')} className="bg-black text-white px-8 py-3 text-sm font-bold uppercase tracking-wider hover:bg-gray-800 transition">
          Về trang chủ
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-white font-sans">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-2xl font-light uppercase tracking-widest mb-10">Thanh toán</h1>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Form thông tin */}
          <form onSubmit={handleOrder} className="flex-1 space-y-5">
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-700">Thông tin giao hàng</h2>

            {[
              { label: 'Họ và tên', name: 'name', type: 'text' },
              { label: 'Số điện thoại', name: 'phone', type: 'tel' },
              { label: 'Địa chỉ', name: 'address', type: 'text' },
            ].map(({ label, name, type }) => (
              <div key={name}>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-500">{label}</label>
                <input type={type} required
                  className="w-full border border-gray-300 p-3 text-sm focus:border-black focus:outline-none transition" />
              </div>
            ))}

            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-500">Ghi chú</label>
              <textarea rows={3} className="w-full border border-gray-300 p-3 text-sm focus:border-black focus:outline-none transition" />
            </div>

            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-500">Phương thức thanh toán</label>
              <div className="border border-black p-3 flex items-center gap-3">
                <input type="radio" defaultChecked readOnly />
                <span className="text-sm">Thanh toán khi nhận hàng (COD)</span>
              </div>
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <button type="submit" disabled={loading}
              className="w-full bg-black text-white py-4 text-sm font-bold uppercase tracking-wider hover:bg-gray-800 transition disabled:opacity-50">
              {loading ? 'Đang xử lý...' : 'Đặt hàng'}
            </button>
          </form>

          {/* Tóm tắt đơn hàng */}
          <div className="lg:w-72">
            <div className="border border-gray-200 p-6">
              <h2 className="text-sm font-bold uppercase tracking-wider mb-4">Đơn hàng ({items.length} sản phẩm)</h2>
              <div className="space-y-3 mb-4">
                {items.map(item => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-gray-600">{item.name} × {item.quantity}</span>
                    <span>{(item.price * item.quantity).toLocaleString('vi-VN')} đ</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-200 pt-4 flex justify-between font-bold">
                <span>Tổng cộng</span>
                <span>{total().toLocaleString('vi-VN')} đ</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
