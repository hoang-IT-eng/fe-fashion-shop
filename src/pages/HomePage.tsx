import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/useAuthStore'
import { useCartStore } from '../store/useCartStore'
import { api } from '../api/apiClient'
import { Product, ProductsResponse } from '../types/product'
import ProductCard from '../components/ProductCard'
import Footer from '../components/Footer'

const HERO_BG_URL =
  'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&w=2400&q=80'

const LOOKBOOK_URL =
  'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1600&q=80'

function ProductSkeleton() {
  return (
    <div className="w-[72vw] flex-shrink-0 snap-start md:w-[22vw]">
      <div className="mb-4 aspect-[3/4] w-full animate-pulse bg-sand" />
      <div className="mx-auto h-3 w-2/3 animate-pulse bg-sand" />
    </div>
  )
}

export default function HomePage() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()
  const { fetchCart } = useCartStore()
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const railRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    api
      .get<ProductsResponse>('/products?limit=10')
      .then(res => setProducts(res.data))
      .catch(() => {})
      .finally(() => setIsLoading(false))
    if (isAuthenticated) fetchCart()
  }, [isAuthenticated])

  const arrivals = products.slice(0, 5)
  const essentials = products.slice(0, 8)

  return (
    <div className="min-h-screen overflow-x-hidden bg-paper text-ink">
      <main>
        {/* Hero — one composition, brand first, full-bleed */}
        <section className="relative flex min-h-[88vh] items-end overflow-hidden md:items-center">
          <img
            src={HERO_BG_URL}
            alt=""
            className="absolute inset-0 h-full w-full object-cover animate-tb-kenburns"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/75 via-ink/35 to-ink/20" />

          <div className="relative z-10 w-full px-6 pb-16 pt-28 text-white md:px-14 md:pb-24 md:pt-20">
            <p className="animate-tb-rise tb-eyebrow mb-5 text-white/70">Season S/S 26</p>
            <h1 className="animate-tb-rise-delay font-display text-5xl font-medium uppercase leading-[0.95] tracking-[0.18em] md:text-7xl lg:text-8xl">
              The<span className="font-semibold">Basic</span>
            </h1>
            <p className="animate-tb-rise-delay-2 mt-5 max-w-md text-sm font-light leading-relaxed tracking-wide text-white/85 md:text-base">
              Essentials tối giản — chất liệu sạch, form chuẩn, mặc mỗi ngày.
            </p>
            <div className="animate-tb-rise-delay-2 mt-10 flex flex-wrap gap-3">
              <button type="button" className="tb-btn-light" onClick={() => navigate('/products?category=nam')}>
                Đồ nam
              </button>
              <button type="button" className="tb-btn-ghost text-white" onClick={() => navigate('/products?category=nu')}>
                Đồ nữ
              </button>
            </div>
          </div>
        </section>

        {/* New arrivals rail */}
        <section className="border-b border-line bg-paper py-20 md:py-28">
          <div className="mb-10 flex items-end justify-between px-6 md:px-14">
            <div>
              <p className="tb-eyebrow mb-3">Just in</p>
              <h2 className="font-display text-3xl font-medium tracking-[0.12em] uppercase md:text-4xl">
                New Arrivals
              </h2>
            </div>
            <button
              type="button"
              onClick={() => navigate('/products')}
              className="hidden text-[11px] font-semibold uppercase tracking-[0.22em] underline-offset-4 hover:underline md:inline"
            >
              Xem tất cả
            </button>
          </div>

          <div
            ref={railRef}
            className="flex snap-x snap-mandatory gap-6 overflow-x-auto px-6 pb-4 hide-scrollbar md:gap-8 md:px-14"
          >
            {isLoading
              ? [...Array(5)].map((_, i) => <ProductSkeleton key={i} />)
              : arrivals.length > 0
                ? arrivals.map(p => (
                    <ProductCard key={p.id} product={p} className="w-[72vw] flex-shrink-0 snap-start md:w-[22vw]" />
                  ))
                : [...Array(5)].map((_, i) => <ProductSkeleton key={i} />)}
          </div>
        </section>

        {/* Editorial lookbook band */}
        <section className="relative grid min-h-[70vh] md:grid-cols-2">
          <div className="relative min-h-[50vh] overflow-hidden md:min-h-full">
            <img
              src={LOOKBOOK_URL}
              alt="TheBasic lookbook"
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1.2s] hover:scale-105"
            />
          </div>
          <div className="flex flex-col justify-center bg-ink px-8 py-16 text-white md:px-16">
            <p className="tb-eyebrow mb-4 text-white/50">Essentials Edit</p>
            <h2 className="font-display text-4xl font-medium leading-tight tracking-[0.08em] uppercase md:text-5xl">
              Ít món hơn.
              <br />
              Mặc lâu hơn.
            </h2>
            <p className="mt-6 max-w-sm text-sm font-light leading-relaxed text-white/70">
              Bộ sưu tập essentials được chọn lọc để bạn mặc xuyên mùa — không ồn ào, chỉ đủ đẹp.
            </p>
            <button
              type="button"
              className="tb-btn-light mt-10 w-fit"
              onClick={() => navigate('/products')}
            >
              Khám phá collection
            </button>
          </div>
        </section>

        {/* Essentials grid */}
        <section className="bg-paper py-20 md:py-28">
          <div className="tb-container">
            <div className="mb-12 max-w-xl">
              <p className="tb-eyebrow mb-3">Wardrobe</p>
              <h2 className="font-display text-3xl font-medium tracking-[0.12em] uppercase md:text-4xl">
                Essentials Collection
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4 md:gap-x-6 md:gap-y-14">
              {isLoading
                ? [...Array(8)].map((_, i) => (
                    <div key={i}>
                      <div className="mb-4 aspect-[3/4] animate-pulse bg-sand" />
                      <div className="mx-auto h-3 w-1/2 animate-pulse bg-sand" />
                    </div>
                  ))
                : essentials.map(p => <ProductCard key={`e-${p.id}`} product={p} />)}
            </div>

            <div className="mt-14 flex justify-center">
              <button type="button" className="tb-btn-primary" onClick={() => navigate('/products')}>
                Xem cửa hàng
              </button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
