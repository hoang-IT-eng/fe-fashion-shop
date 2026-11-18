import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Heart, Eye } from 'lucide-react'
import { Product } from '../types/product'
import { formatVnd } from '../lib/format'
import { useWishlistStore } from '../store/useWishlistStore'
import { useToast } from './Toast'

interface Props {
  product: Product
  onQuickView?: (product: Product) => void
}

const RELEASE_BADGES: Record<string, string> = {
  grail: 'GRAIL ALLOCATION',
  reborn: 'REBORN 1-OF-12',
  archive: 'VAULT ARCHIVE',
  drop: 'LIMITED DROP',
}

export default function ProductCard({ product, onQuickView }: Props) {
  const navigate = useNavigate()
  const wished = useWishlistStore(s => s.ids.includes(product.id))
  const toggleWishlist = useWishlistStore(s => s.toggle)
  const { toast } = useToast()

  const handleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation()
    const added = toggleWishlist(product.id)
    toast(
      added ? `Saved "${product.name}" to Collector Wishlist.` : 'Removed from Collector Wishlist.',
      'info'
    )
  }

  const handleQuickView = (e: React.MouseEvent) => {
    e.stopPropagation()
    onQuickView?.(product)
  }

  return (
    <article
      onClick={() => navigate(`/products/${product.id}`)}
      className="group cursor-pointer flex flex-col"
    >
      <div className="relative aspect-[4/5] bg-[#0a0a0a] overflow-hidden">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center font-mono text-xs text-[#a3a3a3]">
            VAULT IMAGE
          </div>
        )}

        {/* Release Badge */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          <span className="px-2.5 py-1 bg-[#f9f9f9] font-sans text-[10px] font-semibold tracking-[0.14em] uppercase text-[#0a0a0a]">
            {RELEASE_BADGES[product.releaseType || 'drop'] || 'ARCHIVE'}
          </span>
          {product.stock === 0 && (
            <span className="px-2.5 py-1 bg-red-950/90 border border-red-500/40 font-sans text-[10px] font-medium tracking-[0.16em] uppercase text-red-200">
              VAULT EXHAUSTED
            </span>
          )}
        </div>

        {/* Wishlist Toggle */}
        <button
          type="button"
          onClick={handleWishlist}
          aria-label={`Toggle wishlist for ${product.name}`}
          className={`absolute top-3 right-3 w-9 h-9 flex items-center justify-center border backdrop-blur-sm transition ${
            wished
              ? 'bg-[#f9f9f9] border-[#f9f9f9] text-[#0a0a0a]'
              : 'bg-[#0a0a0a]/80 border-[#f9f9f9]/20 text-[#f9f9f9] hover:border-[#f9f9f9]'
          }`}
        >
          <Heart className={`w-4 h-4 ${wished ? 'fill-current' : ''}`} />
        </button>

        {/* Quick View Action Bar */}
        {onQuickView && (
          <button
            type="button"
            onClick={handleQuickView}
            className="absolute inset-x-3 bottom-3 py-2.5 bg-[#0a0a0a]/92 border border-[#f9f9f9]/50 text-[#f9f9f9] font-sans text-[11px] font-medium uppercase tracking-[0.16em] opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all flex items-center justify-center gap-2 hover:bg-[#f9f9f9] hover:text-[#0a0a0a]"
          >
            <Eye className="w-3.5 h-3.5" />
            Quick Inspect
          </button>
        )}
      </div>

      <div className="pt-4 flex-1 flex flex-col justify-between gap-3">
        <div>
          <div className="flex items-center justify-between gap-2 font-sans text-[10px] font-medium tracking-[0.16em] uppercase text-[#a3a3a3] mb-1">
            <span className="truncate">{product.brand || product.category || 'ENIGMA'}</span>
            {product.stock > 0 && product.stock <= 5 && (
              <span className="text-[#f9f9f9] tabular-nums">{product.stock} LEFT</span>
            )}
          </div>
          <h3 className="font-sans text-base font-medium leading-snug text-[#f9f9f9] line-clamp-2">
            {product.name}
          </h3>
        </div>

        <div className="flex items-center justify-between">
          <span className="font-sans text-sm font-semibold text-[#f9f9f9] tabular-nums">
            {formatVnd(product.price)}
          </span>
          <span className="font-sans text-[10px] text-[#a3a3a3] uppercase tracking-[0.14em]">
            {(product.sizes || []).slice(0, 3).join(' · ')}
          </span>
        </div>
      </div>
    </article>
  )
}
