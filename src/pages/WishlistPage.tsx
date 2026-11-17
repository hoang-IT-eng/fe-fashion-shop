import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Trash2 } from 'lucide-react'
import { api } from '../api/apiClient'
import { Product } from '../types/product'
import { useWishlistStore } from '../store/useWishlistStore'
import ProductCard from '../components/ProductCard'
import { QuickViewModal } from '../components/QuickViewModal'
import Breadcrumb from '../components/Breadcrumb'
import EmptyState from '../components/EmptyState'

export default function WishlistPage() {
  const navigate = useNavigate()
  const { ids, clear } = useWishlistStore()
  const [products, setProducts] = useState<Product[]>([])
  const [quickView, setQuickView] = useState<Product | null>(null)

  useEffect(() => {
    void api.get<{ data: Product[] }>('/products?limit=60').then(res => {
      const list = Array.isArray(res?.data) ? res.data : []
      setProducts(list.filter(p => ids.includes(p.id)))
    })
  }, [ids])

  return (
    <div className="min-h-screen bg-[#070709] text-[#ece5d8] py-10 md:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Breadcrumb items={[{ label: 'Archive', path: '/' }, { label: 'Collector Wishlist' }]} />

        <div className="flex flex-wrap items-end justify-between gap-4 pb-8 border-b border-[#ece5d8]/10 mb-10">
          <div>
            <p className="font-mono text-xs tracking-[0.3em] uppercase text-[#cfa156] mb-2">
              PRIVATE VAULT WATCHLIST
            </p>
            <h1 className="font-display text-4xl md:text-5xl text-[#ece5d8]">
              Saved Archive Grails ({products.length})
            </h1>
          </div>
          {products.length > 0 && (
            <button
              type="button"
              onClick={clear}
              className="inline-flex items-center gap-2 px-4 py-2 border border-[#ece5d8]/20 font-mono text-xs uppercase tracking-widest text-[#9a948a] hover:text-red-300 hover:border-red-400/50 transition"
            >
              <Trash2 className="w-3.5 h-3.5" /> Clear Watchlist
            </button>
          )}
        </div>

        {products.length === 0 ? (
          <EmptyState
            title="No Saved Grails Yet"
            description="Bookmark numbered Reborn customs, calfskin high-tops, or horology relics to monitor stock levels."
            actionLabel="Explore Curated Drops"
            onAction={() => navigate('/products')}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map(p => (
              <ProductCard key={p.id} product={p} onQuickView={item => setQuickView(item)} />
            ))}
          </div>
        )}
      </div>

      <QuickViewModal product={quickView} onClose={() => setQuickView(null)} />
    </div>
  )
}
