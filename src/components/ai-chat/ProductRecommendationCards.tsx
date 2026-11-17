import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShoppingBag, Eye } from 'lucide-react'
import { useCartStore } from '../../store/useCartStore'
import type { Product } from '../../types/product'
import { formatVnd } from '../../lib/format'

interface Props {
  products: Product[]
}

export default function ProductRecommendationCards({ products }: Props) {
  const navigate = useNavigate()
  const { addItem } = useCartStore()
  const [addingId, setAddingId] = useState<number | null>(null)
  const [addedId, setAddedId] = useState<number | null>(null)

  const handleAdd = async (e: React.MouseEvent, p: Product) => {
    e.stopPropagation()
    setAddingId(p.id)
    try {
      await addItem(
        {
          productId: p.id,
          name: p.name,
          price: Number(p.price),
          quantity: 1,
          size: p.sizes?.[0] || 'One Size',
          imageUrl: p.imageUrl,
        },
        false
      )
      setAddedId(p.id)
      setTimeout(() => setAddedId(null), 1500)
    } finally {
      setAddingId(null)
    }
  }

  return (
    <div className="mt-3 flex gap-2.5 overflow-x-auto pb-1">
      {products.map(p => (
        <div
          key={p.id}
          className="w-[140px] flex-shrink-0 cursor-pointer group bg-[#111115] border border-[#ece5d8]/15 p-2"
          onClick={() => navigate(`/products/${p.id}`)}
        >
          <div className="aspect-[3/4] bg-[#070709] overflow-hidden relative mb-2">
            {p.imageUrl ? (
              <img
                src={p.imageUrl}
                alt={p.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ShoppingBag size={20} className="text-[#9a948a]" />
              </div>
            )}
            <div className="absolute bottom-1 inset-x-1 flex gap-1">
              <button
                type="button"
                onClick={e => {
                  e.stopPropagation()
                  navigate(`/products/${p.id}`)
                }}
                className="flex-1 bg-[#070709]/90 border border-[#ece5d8]/20 text-[#ece5d8] py-1 text-[10px] font-mono flex items-center justify-center gap-1"
              >
                <Eye size={10} />
                View
              </button>
              <button
                type="button"
                onClick={e => void handleAdd(e, p)}
                disabled={addingId === p.id || p.stock === 0}
                className="flex-1 bg-[#cfa156] text-[#070709] py-1 text-[10px] font-mono font-semibold flex items-center justify-center gap-1 disabled:opacity-40"
              >
                <ShoppingBag size={10} />
                {addedId === p.id ? 'OK' : 'Add'}
              </button>
            </div>
          </div>
          <p className="text-[11px] font-medium text-[#ece5d8] truncate">{p.name}</p>
          <p className="text-[11px] font-mono text-[#cfa156] tabular-nums mt-0.5">
            {formatVnd(p.price)}
          </p>
        </div>
      ))}
    </div>
  )
}
