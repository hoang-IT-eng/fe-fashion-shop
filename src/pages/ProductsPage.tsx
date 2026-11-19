import React, { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, SlidersHorizontal, RotateCcw } from 'lucide-react'
import { api } from '../api/apiClient'
import { Product } from '../types/product'
import { useCategoryStore } from '../store/useCategoryStore'
import ProductCard from '../components/ProductCard'
import { QuickViewModal } from '../components/QuickViewModal'
import Breadcrumb from '../components/Breadcrumb'
import EmptyState from '../components/EmptyState'
import { formatVnd } from '../lib/format'

const RELEASE_TYPES = [
  { value: '', label: 'All Releases' },
  { value: 'grail', label: 'Grail Allocation' },
  { value: 'reborn', label: 'Afterlife 1-of-12' },
  { value: 'archive', label: 'Vault Archive' },
  { value: 'drop', label: 'Limited Drop' },
]

const ALL_SIZES = ['S', 'M', 'L', 'XL', '28', '30', '32', '34', '40', '41', '42', '43', '44', 'One Size']

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { categories, fetch: fetchCategories } = useCategoryStore()

  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [quickView, setQuickView] = useState<Product | null>(null)

  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [category, setCategory] = useState(searchParams.get('category') || '')
  const [brand, setBrand] = useState('')
  const [releaseType, setReleaseType] = useState(searchParams.get('releaseType') || '')
  const [size, setSize] = useState('')
  const [maxPrice, setMaxPrice] = useState(30000000)
  const [sort, setSort] = useState('newest')

  useEffect(() => {
    void fetchCategories()
    setLoading(true)
    void api
      .get<{ data: Product[] }>('/products?limit=60')
      .then(res => setAllProducts(Array.isArray(res?.data) ? res.data : []))
      .finally(() => setLoading(false))
  }, [fetchCategories])

  useEffect(() => {
    const q = searchParams.get('search')
    const cat = searchParams.get('category')
    if (q !== null) setSearch(q)
    if (cat !== null) setCategory(cat)
  }, [searchParams])

  const brands = useMemo(() => {
    const set = new Set<string>()
    for (const p of allProducts) {
      if (p.brand) set.add(p.brand)
    }
    return Array.from(set)
  }, [allProducts])

  const filtered = useMemo(() => {
    let list = [...allProducts]
    const q = search.trim().toLowerCase()
    if (q) {
      list = list.filter(p =>
        [p.name, p.brand, p.category, p.description, p.authenticityCode]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
          .includes(q)
      )
    }
    if (category) {
      list = list.filter(p => (p.category || '').toLowerCase() === category.toLowerCase())
    }
    if (brand) {
      list = list.filter(p => p.brand === brand)
    }
    if (releaseType) {
      list = list.filter(p => p.releaseType === releaseType)
    }
    if (size) {
      list = list.filter(p => (p.sizes || []).includes(size))
    }
    list = list.filter(p => Number(p.price) <= maxPrice)

    if (sort === 'price_asc') list.sort((a, b) => Number(a.price) - Number(b.price))
    else if (sort === 'price_desc') list.sort((a, b) => Number(b.price) - Number(a.price))
    else if (sort === 'name_asc') list.sort((a, b) => a.name.localeCompare(b.name))
    else list.sort((a, b) => b.id - a.id)

    return list
  }, [allProducts, search, category, brand, releaseType, size, maxPrice, sort])

  const resetFilters = () => {
    setSearch('')
    setCategory('')
    setBrand('')
    setReleaseType('')
    setSize('')
    setMaxPrice(30000000)
    setSort('newest')
    setSearchParams({})
  }

  return (
    <div className="min-h-screen bg-ink text-bone py-10 md:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Breadcrumb items={[{ label: 'Archive', path: '/' }, { label: 'Curated Drops' }]} />

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-bone/10 mb-10">
          <div>
            <p className="font-mono text-xs tracking-[0.3em] uppercase text-bone mb-2">
              AUTHENTICATED ARCHIVE INDEX
            </p>
            <h1 className="font-display text-4xl md:text-5xl text-bone">
              Curated Drops &amp; Grails
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-bone-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="catalog-search-input"
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Filter by title, SKU, leather..."
                className="bg-ink-raised border border-bone/15 pl-10 pr-4 py-2.5 text-xs text-bone placeholder-bone-muted w-64 focus:outline-none focus:border-bone"
              />
            </div>

            <select
              id="catalog-sort-select"
              value={sort}
              onChange={e => setSort(e.target.value)}
              className="bg-ink-raised border border-bone/15 px-3.5 py-2.5 font-mono text-xs text-bone uppercase tracking-wider focus:outline-none focus:border-bone"
            >
              <option value="newest">Sort: Latest Vault Entry</option>
              <option value="price_asc">Price: Low → High</option>
              <option value="price_desc">Price: High → Low</option>
              <option value="name_asc">Alphabetical A–Z</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Precision Filter Rail */}
          <aside className="lg:col-span-3 space-y-7">
            <div className="flex items-center justify-between pb-3 border-b border-bone/10">
              <span className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.22em] text-bone">
                <SlidersHorizontal className="w-3.5 h-3.5 text-bone" />
                Specifications
              </span>
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-widest text-bone-muted hover:text-bone"
              >
                <RotateCcw className="w-3 h-3" /> Reset
              </button>
            </div>

            {/* Release Type */}
            <div>
              <h2 className="font-mono text-[10px] uppercase tracking-[0.26em] text-bone mb-3">
                Allocation Tier
              </h2>
              <div className="space-y-1.5">
                {RELEASE_TYPES.map(rt => (
                  <button
                    key={rt.value}
                    type="button"
                    onClick={() => setReleaseType(rt.value)}
                    className={`w-full text-left px-3 py-2 font-mono text-xs transition border ${
                      releaseType === rt.value
                        ? 'border-bone bg-bone/10 text-bone'
                        : 'border-transparent text-bone-muted hover:text-bone'
                    }`}
                  >
                    {rt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Category */}
            <div>
              <h2 className="font-mono text-[10px] uppercase tracking-[0.26em] text-bone mb-3">
                Category
              </h2>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => setCategory('')}
                  className={`px-3 py-1.5 font-mono text-[11px] border ${
                    !category
                      ? 'border-bone text-bone'
                      : 'border-bone/15 text-bone-muted'
                  }`}
                >
                  All
                </button>
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.name)}
                    className={`px-3 py-1.5 font-mono text-[11px] border ${
                      category.toLowerCase() === cat.name.toLowerCase()
                        ? 'border-bone text-bone'
                        : 'border-bone/15 text-bone-muted hover:text-bone'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Brand */}
            {brands.length > 0 && (
              <div>
                <h2 className="font-mono text-[10px] uppercase tracking-[0.26em] text-bone mb-3">
                  Atelier / Brand
                </h2>
                <select
                  value={brand}
                  onChange={e => setBrand(e.target.value)}
                  className="w-full bg-ink-raised border border-bone/15 px-3 py-2 font-mono text-xs text-bone"
                >
                  <option value="">All Houses</option>
                  {brands.map(b => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Size */}
            <div>
              <h2 className="font-mono text-[10px] uppercase tracking-[0.26em] text-bone mb-3">
                Size Matrix
              </h2>
              <div className="flex flex-wrap gap-1.5">
                {ALL_SIZES.map(sz => (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => setSize(size === sz ? '' : sz)}
                    className={`px-2.5 py-1 font-mono text-[11px] border ${
                      size === sz
                        ? 'border-bone bg-bone/15 text-bone'
                        : 'border-bone/15 text-bone-muted hover:text-bone'
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Ceiling */}
            <div>
              <div className="flex justify-between font-mono text-[10px] uppercase tracking-widest mb-2">
                <span className="text-bone">Price Ceiling</span>
                <span className="text-bone tabular-nums">{formatVnd(maxPrice)}</span>
              </div>
              <input
                type="range"
                min={2000000}
                max={30000000}
                step={500000}
                value={maxPrice}
                onChange={e => setMaxPrice(Number(e.target.value))}
                className="w-full accent-bone"
              />
            </div>
          </aside>

          {/* Product Grid */}
          <div className="lg:col-span-9">
            <div className="mb-5 font-mono text-xs text-bone-muted uppercase tracking-widest tabular-nums">
              SHOWING {filtered.length} AUTHENTICATED ARCHIVE PIECES
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div
                    key={i}
                    className="aspect-[4/5] bg-ink-raised border border-bone/10 animate-pulse"
                  />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <EmptyState
                title="No Archive Pieces Match Your Filter"
                description="Broaden your specification filters or submit a custom Name Your Price request to our Concierge Desk."
                actionLabel="Reset Filters"
                onAction={resetFilters}
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map(p => (
                  <ProductCard key={p.id} product={p} onQuickView={item => setQuickView(item)} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <QuickViewModal product={quickView} onClose={() => setQuickView(null)} />
    </div>
  )
}
