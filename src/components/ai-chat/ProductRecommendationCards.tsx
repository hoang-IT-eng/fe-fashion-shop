import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShoppingBag, Eye } from 'lucide-react'
import { useAuthStore } from '../../store/useAuthStore'
import { useCartStore } from '../../store/useCartStore'
import type { Product } from '../../types/product'

interface Props {
  products: Product[]
}

export default function ProductRecommendationCards({ products }: Props) {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()
  const { addItem } = useCartStore()
  const [addingId, setAddingId] = useState<number | null>(null)
  const [addedId, setAddedId] = useState<number | null>(null)

  const handleAdd = async (e: React.MouseEvent, p: Product) => {
    e.stopPropagation()
    if (!isAuthenticated) {
      navigate('/auth')
      return
    }
    setAddingId(p.id)
    try {
      await addItem({
        productId: p.id,
        name: p.name,
        price: Number(p.price),
        quantity: 1,
      })
      setAddedId(p.id)
      setTimeout(() => setAddedId(null), 1500)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Không thể thêm vào giỏ'
      alert(message)
    } finally {
      setAddingId(null)
    }
  }

  return (
    <div className="mt-3 -mx-1 flex gap-2.5 overflow-x-auto pb-1 hide-scrollbar">
      {products.map(p => (
        <div
          key={p.id}
          className="w-[130px] flex-shrink-0 cursor-pointer group"
          onClick={() => navigate(`/products/${p.id}`)}
        >
          {/* Image */}
          <div className="aspect-[3/4] bg-gray-100 overflow-hidden relative rounded-xl mb-2 shadow-sm">
            {p.imageUrl ? (
              <img
                src={p.imageUrl}
                alt={p.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                <ShoppingBag size={24} className="text-gray-300" />
              </div>
            )}

            {/* Overlay actions */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-200 rounded-xl" />

            {/* Buttons */}
            <div className="absolute bottom-0 left-0 right-0 flex gap-1 p-1.5 translate-y-full group-hover:translate-y-0 transition-transform duration-200">
              <button
                type="button"
                onClick={e => { e.stopPropagation(); navigate(`/products/${p.id}`) }}
                className="flex-1 bg-white/90 backdrop-blur text-gray-700 py-1.5 rounded-lg text-[10px] font-semibold flex items-center justify-center gap-1 hover:bg-white transition-colors"
              >
                <Eye size={10} />
                Xem
              </button>
              <button
                type="button"
                onClick={e => handleAdd(e, p)}
                disabled={addingId === p.id || p.stock === 0}
                className={`flex-1 py-1.5 rounded-lg text-[10px] font-semibold flex items-center justify-center gap-1 transition-all ${
                  addedId === p.id
                    ? 'bg-emerald-500 text-white'
                    : p.stock === 0
                    ? 'bg-gray-400 text-white cursor-not-allowed'
                    : 'bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:from-violet-700 hover:to-purple-700'
                } disabled:opacity-70`}
              >
                <ShoppingBag size={10} />
                {addingId === p.id ? '...' : addedId === p.id ? '✓' : p.stock === 0 ? 'Hết' : 'Thêm'}
              </button>
            </div>

            {/* Out of stock badge */}
            {p.stock === 0 && (
              <div className="absolute top-1.5 left-1.5 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                Hết hàng
              </div>
            )}
          </div>

          {/* Info */}
          <p className="text-[11px] font-semibold text-gray-800 truncate leading-tight px-0.5">{p.name}</p>
          <p className="text-[11px] text-purple-600 font-bold mt-0.5 px-0.5">
            {Number(p.price).toLocaleString('vi-VN')}đ
          </p>
        </div>
      ))}
    </div>
  )
}
