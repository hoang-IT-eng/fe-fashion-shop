import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ShieldCheck,
  Ruler,
  Heart,
  ShoppingBag,
  Star,
  X,
  Check,
  Plus,
  Minus,
} from 'lucide-react'
import { api } from '../api/apiClient'
import { Product } from '../types/product'
import { ReviewItem } from '../types/enigma'
import { formatVnd } from '../lib/format'
import { useCartStore } from '../store/useCartStore'
import { useWishlistStore } from '../store/useWishlistStore'
import { useAuthStore } from '../store/useAuthStore'
import Breadcrumb from '../components/Breadcrumb'
import ProductCard from '../components/ProductCard'
import { useToast } from '../components/Toast'
import { ResponsiveImage } from '../components/media/ResponsiveImage'

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const addItem = useCartStore(s => s.addItem)
  const wished = useWishlistStore(s => s.ids.includes(Number(id)))
  const toggleWishlist = useWishlistStore(s => s.toggle)
  const { isAuthenticated } = useAuthStore()
  const { toast } = useToast()

  const [product, setProduct] = useState<Product | null>(null)
  const [related, setRelated] = useState<Product[]>([])
  const [reviews, setReviews] = useState<ReviewItem[]>([])
  const [loading, setLoading] = useState(true)

  const [selectedSize, setSelectedSize] = useState<string>('')
  const [selectedColor, setSelectedColor] = useState<string>('')
  const [quantity, setQuantity] = useState(1)
  const [adding, setAdding] = useState(false)

  // Interactive Size & Fit Calculator Modal State
  const [fitModalOpen, setFitModalOpen] = useState(false)
  const [heightCm, setHeightCm] = useState(175)
  const [weightKg, setWeightKg] = useState(68)
  const [footCm, setFootCm] = useState(26.5)
  const [fitPref, setFitPref] = useState<'tailored' | 'standard' | 'oversized'>('standard')

  // Review Form State
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    void Promise.all([
      api.get<Product>(`/products/${id}`),
      api.get<Product[]>(`/products/${id}/related`).catch(() => []),
      api.get<ReviewItem[]>(`/products/${id}/reviews`).catch(() => []),
    ])
      .then(([prod, rel, revs]) => {
        setProduct(prod)
        setSelectedSize(prod.sizes?.[0] || 'One Size')
        setSelectedColor(prod.colors?.[0] || 'Obsidian')
        setRelated(Array.isArray(rel) ? rel : [])
        setReviews(Array.isArray(revs) ? revs : [])
      })
      .catch(() => {
        navigate('/products')
      })
      .finally(() => setLoading(false))
  }, [id, navigate])

  const activeVariant = useMemo(() => {
    if (!product?.variants?.length) return undefined
    return (
      product.variants.find(
        v =>
          (!v.size || v.size === selectedSize) &&
          (!v.color || v.color === selectedColor)
      ) || product.variants.find(v => v.size === selectedSize)
    )
  }, [product, selectedSize, selectedColor])

  const unitPrice = activeVariant?.priceOverride || product?.price || 0
  const availableStock = activeVariant ? activeVariant.stock : product?.stock || 0

  // Compute recommended size based on product category + body specs
  const recommendedSize = useMemo(() => {
    if (!product) return 'M'
    const sizes = product.sizes || []
    if (sizes.includes('One Size')) return 'One Size'

    const isFootwear = sizes.some(s => ['40', '41', '42', '43', '44'].includes(s))
    if (isFootwear) {
      const adj = fitPref === 'oversized' ? 0.4 : fitPref === 'tailored' ? -0.2 : 0
      const target = footCm + adj
      if (target < 25.4) return '40'
      if (target < 26.1) return '41'
      if (target < 26.9) return '42'
      if (target < 27.6) return '43'
      return '44'
    }

    const isWaist = sizes.some(s => ['28', '30', '32', '34'].includes(s))
    if (isWaist) {
      const bmiIndex = weightKg / Math.pow(heightCm / 100, 2)
      const shift = fitPref === 'oversized' ? 1 : fitPref === 'tailored' ? -0.5 : 0
      const score = bmiIndex + shift
      if (score < 20.5) return '28'
      if (score < 22.8) return '30'
      if (score < 25.2) return '32'
      return '34'
    }

    // Apparel S / M / L / XL
    let idx = 1 // M
    if (heightCm < 168 && weightKg < 60) idx = 0
    else if (heightCm < 176 && weightKg < 72) idx = 1
    else if (heightCm < 183 && weightKg < 84) idx = 2
    else idx = 3

    if (fitPref === 'oversized') idx = Math.min(3, idx + 1)
    if (fitPref === 'tailored') idx = Math.max(0, idx - 1)
    const map = ['S', 'M', 'L', 'XL']
    const candidate = map[idx]
    return sizes.includes(candidate) ? candidate : sizes[0] || 'M'
  }, [product, heightCm, weightKg, footCm, fitPref])

  const ratingStats = useMemo(() => {
    const total = reviews.length
    const avg = total
      ? (reviews.reduce((s, r) => s + Number(r.rating), 0) / total).toFixed(1)
      : '5.0'
    const counts = [5, 4, 3, 2, 1].map(star => ({
      star,
      count: reviews.filter(r => Math.round(r.rating) === star).length,
    }))
    return { total, avg, counts }
  }, [reviews])

  const handleAddToCart = async () => {
    if (!product || availableStock <= 0) return
    try {
      setAdding(true)
      await addItem({
        productId: product.id,
        variantId: activeVariant?.id,
        name: product.name,
        price: unitPrice,
        quantity,
        size: selectedSize,
        color: selectedColor,
        imageUrl: product.imageUrl,
      })
      toast(`Reserved "${product.name}" (${selectedSize}) in Vault Bag.`, 'success')
    } catch (err: any) {
      toast(err?.message || 'Unable to reserve piece.', 'error')
    } finally {
      setAdding(false)
    }
  }

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!product || !comment.trim()) return
    try {
      setSubmittingReview(true)
      const created = await api.post<ReviewItem>(`/products/${product.id}/reviews`, {
        rating,
        comment: comment.trim(),
      })
      setReviews(prev => [created, ...prev])
      setComment('')
      toast('Provenance review recorded in the Archive.', 'success')
    } catch (err: any) {
      toast(err?.message || 'Sign in to record a verified review.', 'error')
    } finally {
      setSubmittingReview(false)
    }
  }

  if (loading || !product) {
    return (
      <div className="min-h-screen bg-ink flex items-center justify-center font-sans text-[11px] font-medium tracking-[0.18em] uppercase text-bone-muted">
        LOADING PROVENANCE DOSSIER...
      </div>
    )
  }

  const isFootwear = (product.sizes || []).some(s => ['40', '41', '42', '43', '44'].includes(s))

  return (
    <div className="min-h-screen bg-ink text-bone py-10 md:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Breadcrumb
          items={[
            { label: 'Archive', path: '/' },
            { label: 'Drops', path: '/products' },
            { label: product.name },
          ]}
        />

        {/* TOP PRODUCT DOSSIER */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 pb-20 border-b border-bone/10">
          {/* High-Res Gallery */}
          <div className="lg:col-span-7 space-y-4">
            <div className="relative aspect-[4/5] bg-ink-raised border border-bone/12 overflow-hidden">
              {product.imageUrl && (
                <ResponsiveImage
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  src={product.imageUrl}
                  alt={product.name}
                  className="film-grade w-full h-full object-cover"
                />
              )}
              <div className="absolute top-4 left-4 px-3 py-1.5 bg-ink/90 border border-bone/50 font-sans text-[10px] font-medium tracking-[0.16em] uppercase text-bone">
                {(product.releaseType || 'ARCHIVE').toUpperCase()} · {product.condition || 'DEADSTOCK'}
              </div>
            </div>
          </div>

          {/* Specification & SKU Matrix */}
          <div className="lg:col-span-5 space-y-7">
            <div>
              <p className="font-sans text-[11px] font-medium tracking-[0.18em] uppercase text-bone mb-2">
                {product.brand || 'NOCTURNE ATELIER'} · {product.authenticityCode || `NCT-2026-00${product.id}`}
              </p>
              <h1 className="font-display text-3xl md:text-5xl text-bone leading-tight mb-4">
                {product.name}
              </h1>
              <div className="flex items-baseline gap-4">
                <span className="font-sans text-2xl md:text-3xl font-semibold text-bone tabular-nums">
                  {formatVnd(unitPrice)}
                </span>
                <span className="font-mono text-xs text-bone-muted inline-flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 text-bone fill-current" />
                  {ratingStats.avg} ({ratingStats.total} verified)
                </span>
              </div>
            </div>

            <p className="text-sm text-bone-muted leading-relaxed border-y border-bone/10 py-5">
              {product.description}
            </p>

            {/* SKU Size Selector + Fit Calculator Trigger */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="font-sans text-[11px] font-medium uppercase tracking-[0.16em] text-bone">
                  Select Size{' '}
                  {activeVariant?.sku && (
                    <span className="text-bone-muted ml-2">({activeVariant.sku})</span>
                  )}
                </span>
                <button
                  id="open-size-calculator-btn"
                  type="button"
                  onClick={() => setFitModalOpen(true)}
                  className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-bone hover:underline"
                >
                  <Ruler className="w-3.5 h-3.5" />
                  Size &amp; Fit Calculator
                </button>
              </div>

              <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                {(product.sizes?.length ? product.sizes : ['One Size']).map(sz => {
                  const v = product.variants?.find(vr => vr.size === sz)
                  const out = v ? v.stock <= 0 : false
                  return (
                    <button
                      key={sz}
                      type="button"
                      disabled={out}
                      onClick={() => setSelectedSize(sz)}
                      className={`py-2.5 font-sans text-xs border transition tabular-nums ${
                        selectedSize === sz
                          ? 'border-bone bg-bone/15 text-bone font-semibold'
                          : out
                            ? 'border-bone/10 text-bone-muted/40 line-through'
                            : 'border-bone/15 text-bone hover:border-bone/45'
                      }`}
                    >
                      {sz}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Colorway Selector */}
            {(product.colors?.length || 0) > 0 && (
              <div>
                <span className="block font-sans text-[11px] font-medium uppercase tracking-[0.16em] text-bone mb-2.5">
                  Finish / Colorway: <span className="text-bone-muted">{selectedColor}</span>
                </span>
                <div className="flex flex-wrap gap-2">
                  {(product.colors || []).map(cl => (
                    <button
                      key={cl}
                      type="button"
                      onClick={() => setSelectedColor(cl)}
                      className={`px-3.5 py-2 font-sans text-xs border transition ${
                        selectedColor === cl
                          ? 'border-bone text-bone bg-bone/10'
                          : 'border-bone/15 text-bone-muted hover:text-bone'
                      }`}
                    >
                      {cl}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Live Stock + Quantity + Actions */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between font-mono text-xs">
                <span className="text-bone-muted uppercase tracking-widest">Vault Allocation</span>
                <span
                  className={`tabular-nums ${
                    availableStock > 0 ? 'text-bone' : 'text-red-400'
                  }`}
                >
                  {availableStock > 0
                    ? `${availableStock} AUTHENTICATED UNITS READY`
                    : 'VAULT EXHAUSTED'}
                </span>
              </div>

              <div className="flex gap-3">
                <div className="inline-flex items-center border border-bone/20 bg-ink-raised">
                  <button
                    type="button"
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="px-3.5 py-3.5 text-bone-muted hover:text-bone"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-4 font-mono text-sm tabular-nums">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity(q => Math.min(Math.max(1, availableStock), q + 1))}
                    className="px-3.5 py-3.5 text-bone-muted hover:text-bone"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  id="pdp-add-to-bag-btn"
                  type="button"
                  disabled={availableStock <= 0 || adding}
                  onClick={() => void handleAddToCart()}
                  className="flex-1 py-4 bg-bone text-ink font-sans text-xs font-semibold uppercase tracking-[0.14em] hover:bg-bone-dim disabled:opacity-40 transition flex items-center justify-center gap-2"
                >
                  <ShoppingBag className="w-4 h-4" />
                  {availableStock <= 0 ? 'Sold Out' : adding ? 'Reserving...' : 'Reserve in Vault Bag'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const added = toggleWishlist(product.id)
                    toast(added ? 'Saved to Collector Wishlist.' : 'Removed from Wishlist.', 'info')
                  }}
                  aria-label="Toggle Wishlist"
                  className={`px-4 border transition flex items-center justify-center ${
                    wished
                      ? 'border-bone bg-bone text-ink'
                      : 'border-bone/20 text-bone hover:border-bone'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${wished ? 'fill-current' : ''}`} />
                </button>
              </div>
            </div>

            {/* Authentication Guarantee Seal */}
            <div className="p-4 bg-ink-raised border border-bone/35 flex items-start gap-3.5">
              <ShieldCheck className="w-5 h-5 text-bone flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-sans text-[11px] font-medium uppercase tracking-[0.16em] text-bone">
                  NOCTURNE Multi-Stage Authentication Guarantee
                </p>
                <p className="text-xs text-bone-muted leading-relaxed">
                  Verified for textile weight, hardware metallurgy, stitch cadence, and cryptographic
                  NFC tag ({product.authenticityCode || `NCT-2026-00${product.id}`}) prior to armored dispatch.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* VERIFIED BUYER REVIEWS */}
        <section className="py-16 border-b border-bone/10 grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-4 space-y-6">
            <div>
              <p className="font-sans text-[11px] font-medium tracking-[0.18em] uppercase text-bone mb-2">
                PROVENANCE LEDGER
              </p>
              <h2 className="font-display text-3xl text-bone">
                Verified Collector Reviews
              </h2>
            </div>

            <div className="p-6 bg-ink-raised border border-bone/10 space-y-4">
              <div className="flex items-baseline gap-3">
                <span className="font-sans text-4xl font-semibold text-bone tabular-nums">
                  {ratingStats.avg}
                </span>
                <span className="font-mono text-xs text-bone-muted uppercase tracking-widest">
                  / 5.0 ({ratingStats.total} REVIEWS)
                </span>
              </div>
              <div className="space-y-2">
                {ratingStats.counts.map(row => {
                  const pct = ratingStats.total
                    ? Math.round((row.count / ratingStats.total) * 100)
                    : row.star === 5
                      ? 100
                      : 0
                  return (
                    <div key={row.star} className="flex items-center gap-3 font-mono text-xs">
                      <span className="w-8 text-bone-muted tabular-nums">{row.star}★</span>
                      <div className="flex-1 h-1.5 bg-ink overflow-hidden">
                        <div className="h-full bg-bone" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="w-8 text-right text-bone-muted tabular-nums">{row.count}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Write Review Form */}
            <form
              onSubmit={handleSubmitReview}
              className="p-6 bg-ink-raised border border-bone/10 space-y-4"
            >
              <h3 className="font-sans text-[11px] font-medium uppercase tracking-[0.16em] text-bone">
                Record Collector Note
              </h3>
              <div className="flex gap-1.5">
                {[1, 2, 3, 4, 5].map(st => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setRating(st)}
                    className={`p-1.5 border ${
                      st <= rating
                        ? 'border-bone text-bone'
                        : 'border-bone/15 text-bone-muted'
                    }`}
                  >
                    <Star className="w-3.5 h-3.5 fill-current" />
                  </button>
                ))}
              </div>
              <textarea
                rows={3}
                required
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder={
                  isAuthenticated
                    ? 'Document fit, leather grain, or packaging provenance...'
                    : 'Share your collector note...'
                }
                className="w-full bg-ink border border-bone/15 p-3 text-xs text-bone placeholder-bone-muted focus:outline-none focus:border-bone"
              />
              <button
                type="submit"
                disabled={submittingReview}
                className="w-full py-2.5 bg-bone text-ink font-sans text-xs font-semibold uppercase tracking-[0.14em]"
              >
                {submittingReview ? 'Submitting...' : 'Publish Provenance Note'}
              </button>
            </form>
          </div>

          <div className="lg:col-span-8 space-y-4">
            {reviews.length === 0 ? (
              <div className="p-10 bg-ink-raised border border-bone/10 text-center text-sm text-bone-muted">
                No collector notes logged yet for this drop. Be the first to document fit &amp; finish.
              </div>
            ) : (
              reviews.map(rev => (
                <article
                  key={rev.id}
                  className="p-6 bg-ink-raised border border-bone/10 space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-sm text-bone">
                        {rev.userName || `Collector #${rev.userId}`}
                      </span>
                      <span className="px-2 py-0.5 bg-bone/15 border border-bone/40 font-mono text-[9px] uppercase tracking-widest text-bone">
                        Verified Collector
                      </span>
                    </div>
                    <span className="font-mono text-xs text-bone">
                      {'★'.repeat(rev.rating)}
                    </span>
                  </div>
                  <p className="text-sm text-bone-muted leading-relaxed">{rev.comment}</p>
                </article>
              ))
            )}
          </div>
        </section>

        {/* RELATED GRAILS */}
        {related.length > 0 && (
          <section className="pt-16">
            <p className="font-sans text-[11px] font-medium tracking-[0.18em] uppercase text-bone mb-2">
              COMPLEMENTARY ROTATION
            </p>
            <h2 className="font-display text-3xl md:text-4xl text-bone mb-8">
              Related Archive Grails
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {related.map(rp => (
                <ProductCard key={rp.id} product={rp} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* INTERACTIVE SIZE & FIT CALCULATOR MODAL */}
      {fitModalOpen && (
        <div
          id="size-fit-calculator-modal"
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[115] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
          onClick={() => setFitModalOpen(false)}
        >
          <div
            onClick={e => e.stopPropagation()}
            className="w-full max-w-lg bg-ink-raised border border-bone/50 p-6 md:p-8 space-y-6 text-bone"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="font-mono text-[10px] tracking-[0.28em] uppercase text-bone">
                  ATELIER PROPORTION ENGINE
                </p>
                <h2 className="font-display text-2xl md:text-3xl mt-1">
                  Interactive Size &amp; Fit Calculator
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setFitModalOpen(false)}
                className="text-bone-muted hover:text-bone"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {isFootwear ? (
              <div>
                <div className="flex justify-between font-mono text-xs mb-2">
                  <span className="text-bone-muted uppercase">Foot Length (cm)</span>
                  <span className="text-bone tabular-nums">{footCm.toFixed(1)} cm</span>
                </div>
                <input
                  type="range"
                  min={24.0}
                  max={29.0}
                  step={0.2}
                  value={footCm}
                  onChange={e => setFootCm(Number(e.target.value))}
                  className="w-full accent-bone"
                />
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between font-mono text-xs mb-1.5">
                    <span className="text-bone-muted uppercase">Height</span>
                    <span className="text-bone tabular-nums">{heightCm} cm</span>
                  </div>
                  <input
                    type="range"
                    min={155}
                    max={198}
                    value={heightCm}
                    onChange={e => setHeightCm(Number(e.target.value))}
                    className="w-full accent-bone"
                  />
                </div>
                <div>
                  <div className="flex justify-between font-mono text-xs mb-1.5">
                    <span className="text-bone-muted uppercase">Weight</span>
                    <span className="text-bone tabular-nums">{weightKg} kg</span>
                  </div>
                  <input
                    type="range"
                    min={45}
                    max={110}
                    value={weightKg}
                    onChange={e => setWeightKg(Number(e.target.value))}
                    className="w-full accent-bone"
                  />
                </div>
              </div>
            )}

            <div>
              <span className="block font-sans text-[10px] font-medium uppercase tracking-[0.16em] text-bone-muted mb-2">
                Desired Silhouette Drape
              </span>
              <div className="grid grid-cols-3 gap-2">
                {(['tailored', 'standard', 'oversized'] as const).map(pref => (
                  <button
                    key={pref}
                    type="button"
                    onClick={() => setFitPref(pref)}
                    className={`py-2.5 font-mono text-xs uppercase border ${
                      fitPref === pref
                        ? 'border-bone bg-bone/15 text-bone'
                        : 'border-bone/15 text-bone-muted'
                    }`}
                  >
                    {pref}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 bg-ink border border-bone/40 flex items-center justify-between">
              <div>
                <span className="block font-sans text-[10px] font-medium uppercase tracking-[0.16em] text-bone-muted">
                  Recommended Atelier Spec
                </span>
                <span className="font-display text-3xl text-bone">Size {recommendedSize}</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedSize(recommendedSize)
                  setFitModalOpen(false)
                  toast(`Applied recommended Size ${recommendedSize}.`, 'success')
                }}
                className="px-5 py-3 bg-bone text-ink font-sans text-xs font-semibold uppercase tracking-[0.14em] inline-flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" /> Apply Size
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
