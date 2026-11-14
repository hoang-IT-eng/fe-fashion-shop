import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useCategoryStore } from '../store/useCategoryStore'
import { api } from '../api/apiClient'
import { Product, ProductsResponse } from '../types/product'
import ProductCard from '../components/ProductCard'
import Footer from '../components/Footer'

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { categories, fetch: fetchCategories } = useCategoryStore()

  const [products, setProducts] = useState<Product[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  const category = searchParams.get('category') || ''
  const search = searchParams.get('search') || ''
  const page = Number(searchParams.get('page') || 1)

  useEffect(() => {
    fetchCategories()
  }, [])

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

    api
      .get<ProductsResponse>(`/products?${params}`)
      .then(res => {
        setProducts(res.data)
        setTotal(res.total)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [category, search, page])

  const totalPages = Math.ceil(total / 12)

  return (
    <div className="min-h-screen bg-paper">
      <div className="tb-container py-12 md:py-16">
        <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="tb-eyebrow mb-3">Shop</p>
            <h1 className="font-display text-4xl font-medium uppercase tracking-[0.14em] md:text-5xl">
              Sản phẩm
            </h1>
            <p className="mt-3 text-sm text-muted">{total} sản phẩm</p>
          </div>
          <input
            type="text"
            placeholder="Tìm kiếm..."
            defaultValue={search}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                setSearchParams(p => {
                  p.set('search', (e.target as HTMLInputElement).value)
                  p.set('page', '1')
                  return p
                })
              }
            }}
            className="w-full border border-line bg-white px-4 py-3 text-sm outline-none focus:border-ink md:w-72"
          />
        </div>

        <div className="mb-10 flex flex-wrap gap-2">
          {CATEGORIES.map(c => (
            <button
              key={c.value || 'all'}
              type="button"
              onClick={() =>
                setSearchParams(p => {
                  if (c.value) p.set('category', c.value)
                  else p.delete('category')
                  p.set('page', '1')
                  return p
                })
              }
              className={`border px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] transition ${
                category === c.value
                  ? 'border-ink bg-ink text-white'
                  : 'border-line text-muted hover:border-ink hover:text-ink'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4 md:gap-x-6">
            {[...Array(12)].map((_, i) => (
              <div key={i}>
                <div className="mb-4 aspect-[3/4] animate-pulse bg-sand" />
                <div className="mx-auto h-3 w-1/2 animate-pulse bg-sand" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="py-24 text-center text-muted">Không tìm thấy sản phẩm nào</div>
        ) : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4 md:gap-x-6 md:gap-y-14">
            {products.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-14 flex justify-center gap-2">
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() =>
                  setSearchParams(p => {
                    p.set('page', String(i + 1))
                    return p
                  })
                }
                className={`flex h-10 w-10 items-center justify-center border text-sm transition ${
                  page === i + 1 ? 'border-ink bg-ink text-white' : 'border-line hover:border-ink'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  )
}
