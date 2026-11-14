import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Product } from '../types/product'

type Props = {
  product: Product
  className?: string
}

export default function ProductCard({ product, className = '' }: Props) {
  const navigate = useNavigate()

  return (
    <article
      className={`group cursor-pointer ${className}`}
      onClick={() => navigate(`/products/${product.id}`)}
    >
      <div className="relative mb-4 aspect-[3/4] overflow-hidden bg-sand">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            loading="lazy"
          />
        ) : null}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-full bg-ink/90 py-3 text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-white transition-transform duration-300 group-hover:translate-y-0">
          Xem chi tiết
        </div>
      </div>
      <div className="space-y-1 text-center md:text-left">
        <p className="text-[11px] uppercase tracking-[0.18em] text-muted">{product.category}</p>
        <h3 className="text-sm font-medium text-ink">{product.name}</h3>
        <p className="text-sm font-semibold tracking-wide">
          {Number(product.price).toLocaleString('vi-VN')} đ
        </p>
      </div>
    </article>
  )
}
