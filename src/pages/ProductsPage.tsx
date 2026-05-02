import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useCartStore } from '../store/useCartStore'
import { useAuthStore } from '../store/useAuthStore'
import { useCategoryStore } from '../store/useCategoryStore'
import { api } from '../api/apiClient'
import { Product, ProductsResponse } from '../types/product'

export default function ProductsPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { isAuthenticated } = useAuthStore()
  const { addItem } = useCartStore()
  const { categories, fetch: fetchCategories } = useCategoryStore()

  const [products, setProducts] = useState<Product[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [addingId, setAddingId] = useState<number | null>(null)

  const category = searchParams.get('category') || ''
  const search = searchParams.get('search') || ''
  const page = Number(searchParams.get('page') || 1)

  useEffect(() => { fetchCategories() }, [])

  const CATEGORIES = [
    { label: 'Tất cả', value: '' },
    ...categories.map(c => ({ label: c.name, value: c.slug })),
  ]

  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams()
    if (category) params.set('category', category)
    if (search) params.set('search', search)
    params.set('page', String(page))
    params.set('limit', '12')

    api.get<ProductsResponse>(`/products?${params}`)
      .then(res => { setProducts(res.data); setTotal(res.total) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [category, search, page])

  const handleAddToCart = async (p: Product) => {
    if (!isAuthenticated) { navigate('/auth'); return }
    setAddingId(p.id)
    try {
      await addItem({ productId: p.id, name: p.name, price: Number(p.price), quantity: 1 })
    } catch (err: any) {
      alert(err.message)
    } finally {
      setAddingId(null)
    }
  }

  const totalPages = Math.ceil(total / 12)

  return (
    <div className="min-h-screen bg-white font-sans">
      <div className="max-w-7xl mx-auto px-6 py-12">

        {/* Header + Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <h1 className="text-2xl font-light uppercase tracking-widest">Sản phẩm</h1>
          <input
            type="text"
            placeholder="Tìm kiếm..."
            defaultValue={search}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                setSearchParams(p => { p.set('search', (e.target as HTMLInputElement).value); p.set('page', '1'); return p })
              }
            }}
            className="border border-gray-300 px-4 py-2 text-sm w-full md:w-64 focus:border-black focus:outline-none"
          />
        </div>

        {/* Category filter */}
        <div className="flex gap-2 mb-8 flex-wrap">
          {CATEGORIES.map(c => (
            <button key={c.value}
              onClick={() => setSearchParams(p => { p.set('category', c.value); p.set('page', '1'); return p })}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border transition ${category === c.value ? 'bg-black text-white border-black' : 'border-gray-300 text-gray-600 hover:border-black'}`}>
              {c.label}
            </button>
          ))}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[3/4] bg-gray-100 mb-3" />
                <div className="h-3 bg-gray-100 rounded mb-2 w-3/4" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-24 text-gray-400">Không tìm thấy sản phẩm nào</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map(p => (
              <div key={p.id} className="group cursor-pointer">
                <div className="aspect-[3/4] bg-gray-100 overflow-hidden mb-3 relative"
                  onClick={() => navigate(`/products/${p.id}`)}>
                  {p.imageUrl
                    ? <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    : <div className="w-full h-full bg-gray-100" />}
                  <button
                    onClick={e => { e.stopPropagation(); handleAddToCart(p) }}
                    disabled={addingId === p.id || p.stock === 0}
                    className="absolute bottom-0 left-0 right-0 bg-black text-white py-2.5 text-xs font-bold uppercase tracking-wider opacity-0 group-hover:opacity-100 transition disabled:opacity-50">
                    {addingId === p.id ? 'Đang thêm...' : p.stock === 0 ? 'Hết hàng' : 'Thêm vào giỏ'}
                  </button>
                </div>
                <p className="text-sm font-medium text-gray-900 truncate">{p.name}</p>
                <p className="text-sm text-gray-500 mt-0.5">{Number(p.price).toLocaleString('vi-VN')} đ</p>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-12">
            {[...Array(totalPages)].map((_, i) => (
              <button key={i}
                onClick={() => setSearchParams(p => { p.set('page', String(i + 1)); return p })}
                className={`w-9 h-9 text-sm border transition ${page === i + 1 ? 'bg-black text-white border-black' : 'border-gray-300 hover:border-black'}`}>
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
