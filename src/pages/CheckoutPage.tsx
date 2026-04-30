import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCartStore } from '../store/useCartStore'
import { useAuthStore } from '../store/useAuthStore'
import { api } from '../api/apiClient'

type PaymentMethod = 'cod' | 'vnpay'

export default function CheckoutPage() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()
  const { items, total, clear } = useCartStore()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod')

  // Form fields dùng đúng tên backend yêu cầu
  const [shippingName, setShippingName] = useState('')
  const [shippingPhone, setShippingPhone] = useState('')
  const [shippingAddress, setShippingAddress] = useState('')
  const [note, setNote] = useState('')

  useEffect(() => {
    if (!isAuthenticated) { navigate('/auth'); return }
    if (items.length === 0) navigate('/cart')
  }, [])

  const handleOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      if (paymentMethod === 'vnpay') {
        // Gọi API tạo đơn với vnpay, backend trả về paymentUrl
        const res = await api.post<{ paymentUrl?: string; orderId?: number }>('/orders', {
          items: items.map(i => ({ productId: i.productId, name: i.name, price: i.price, quantity: i.quantity })),
          total: total(),
          paymentMethod: 'vnpay',
          shippingName,
          shippingPhone,
          shippingAddress,
          note,
        })
        if (res.paymentUrl) {
          // Redirect sang trang thanh toán VNPay
          window.location.href = res.paymentUrl
        } else {
          clear()
          setSuccess(true)
        }
      } else {
        await api.post('/orders', {
          items: items.map(i => ({ productId: i.productId, name: i.name, price: i.price, quantity: i.quantity })),
          total: total(),
          paymentMethod: 'cod',
          shippingName,
          shippingPhone,
          shippingAddress,
          note,
        })
        clear()
        setSuccess(true)
      }
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

            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-500">Họ và tên *</label>
              <input type="text" required value={shippingName} onChange={e => setShippingName(e.target.value)}
                className="w-full border border-gray-300 p-3 text-sm focus:border-black focus:outline-none transition" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-500">Số điện thoại *</label>
              <input type="tel" required value={shippingPhone} onChange={e => setShippingPhone(e.target.value)}
                className="w-full border border-gray-300 p-3 text-sm focus:border-black focus:outline-none transition" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-500">Địa chỉ giao hàng *</label>
              <input type="text" required value={shippingAddress} onChange={e => setShippingAddress(e.target.value)}
                className="w-full border border-gray-300 p-3 text-sm focus:border-black focus:outline-none transition" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-500">Ghi chú</label>
              <textarea rows={3} value={note} onChange={e => setNote(e.target.value)}
                className="w-full border border-gray-300 p-3 text-sm focus:border-black focus:outline-none transition" />
            </div>

            {/* Phương thức thanh toán */}
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-500">Phương thức thanh toán</label>
              <div className="space-y-2">
                <label className={`flex items-center gap-3 p-3 border cursor-pointer transition ${paymentMethod === 'cod' ? 'border-black' : 'border-gray-300 hover:border-gray-400'}`}>
                  <input type="radio" name="payment" value="cod" checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')} />
                  <div>
                    <p className="text-sm font-medium">Thanh toán khi nhận hàng (COD)</p>
                    <p className="text-xs text-gray-400">Trả tiền mặt khi nhận hàng</p>
                  </div>
                </label>
                <label className={`flex items-center gap-3 p-3 border cursor-pointer transition ${paymentMethod === 'vnpay' ? 'border-black' : 'border-gray-300 hover:border-gray-400'}`}>
                  <input type="radio" name="payment" value="vnpay" checked={paymentMethod === 'vnpay'}
                    onChange={() => setPaymentMethod('vnpay')} />
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="text-sm font-medium">VNPay</p>
                      <p className="text-xs text-gray-400">Thanh toán qua cổng VNPay (ATM, Visa, QR)</p>
                    </div>
                    <span className="ml-auto text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">VNPay</span>
                  </div>
                </label>
              </div>
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <button type="submit" disabled={loading}
              className="w-full bg-black text-white py-4 text-sm font-bold uppercase tracking-wider hover:bg-gray-800 transition disabled:opacity-50">
              {loading ? 'Đang xử lý...' : paymentMethod === 'vnpay' ? 'Thanh toán qua VNPay' : 'Đặt hàng'}
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
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-500">Tạm tính</span>
                <span>{total().toLocaleString('vi-VN')} đ</span>
              </div>
              <div className="flex justify-between text-sm mb-4">
                <span className="text-gray-500">Vận chuyển</span>
                <span className="text-green-600">Miễn phí</span>
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
