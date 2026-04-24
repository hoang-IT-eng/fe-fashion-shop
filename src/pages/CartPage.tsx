import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Trash2 } from 'lucide-react'
import { useCartStore } from '../store/useCartStore'
import { useAuthStore } from '../store/useAuthStore'

export default function CartPage() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()
  const { items, loading, fetchCart, updateItem, removeItem, total } = useCartStore()

  useEffect(() => {
    if (!isAuthenticated) { navigate('/auth'); return }
    fetchCart()
  }, [])

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-400">Đang tải...</div>

  return (
    <div className="min-h-screen bg-white font-sans">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-2xl font-light uppercase tracking-widest mb-10">Giỏ hàng</h1>

        {items.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-gray-400 mb-6">Giỏ hàng của bạn đang trống</p>
            <button onClick={() => navigate('/')} className="bg-black text-white px-8 py-3 text-sm font-bold uppercase tracking-wider hover:bg-gray-800 transition">
              Tiếp tục mua sắm
            </button>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-12">
            {/* Danh sách sản phẩm */}
            <div className="flex-1 divide-y divide-gray-100">
              {items.map(item => (
                <div key={item.id} className="flex gap-4 py-6">
                  <div className="w-20 h-24 bg-gray-100 flex-shrink-0">
                    {item.imageUrl && <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{item.name}</p>
                    <p className="text-sm text-gray-500 mt-1">{item.price.toLocaleString('vi-VN')} đ</p>
                    <div className="flex items-center gap-3 mt-3">
                      <button onClick={() => item.quantity > 1 && updateItem(item.id, item.quantity - 1)}
                        className="w-7 h-7 border border-gray-300 flex items-center justify-center text-sm hover:border-black transition">−</button>
                      <span className="text-sm w-6 text-center">{item.quantity}</span>
                      <button onClick={() => updateItem(item.id, item.quantity + 1)}
                        className="w-7 h-7 border border-gray-300 flex items-center justify-center text-sm hover:border-black transition">+</button>
                    </div>
                  </div>
                  <div className="flex flex-col items-end justify-between">
                    <button onClick={() => removeItem(item.id)} className="text-gray-400 hover:text-red-500 transition">
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <p className="font-medium">{(item.price * item.quantity).toLocaleString('vi-VN')} đ</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Tổng tiền */}
            <div className="lg:w-72">
              <div className="border border-gray-200 p-6">
                <h2 className="text-sm font-bold uppercase tracking-wider mb-4">Tóm tắt đơn hàng</h2>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-500">Tạm tính</span>
                  <span>{total().toLocaleString('vi-VN')} đ</span>
                </div>
                <div className="flex justify-between text-sm mb-6">
                  <span className="text-gray-500">Vận chuyển</span>
                  <span className="text-green-600">Miễn phí</span>
                </div>
                <div className="flex justify-between font-bold border-t border-gray-200 pt-4 mb-6">
                  <span>Tổng cộng</span>
                  <span>{total().toLocaleString('vi-VN')} đ</span>
                </div>
                <button onClick={() => navigate('/checkout')}
                  className="w-full bg-black text-white py-4 text-sm font-bold uppercase tracking-wider hover:bg-gray-800 transition">
                  Thanh toán
                </button>
                <button onClick={() => navigate('/')}
                  className="w-full mt-3 border border-gray-300 py-3 text-sm font-medium hover:border-black transition">
                  Tiếp tục mua sắm
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
