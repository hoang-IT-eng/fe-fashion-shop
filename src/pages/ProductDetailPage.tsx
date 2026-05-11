import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Star } from 'lucide-react'
import { useCartStore } from '../store/useCartStore'
import { useAuthStore } from '../store/useAuthStore'
import { api } from '../api/apiClient'
import { Product } from '../types/product'
import { ProductVariant } from '../types/variant'
import Breadcrumb from '../components/Breadcrumb'
import { useToast } from '../components/Toast'

interface Review {
  id: number
  rating: number
  comment: string
  user: { name: string }
  createdAt: string
}

interface ReviewsResponse {
  reviews: Review[]
  averageRating: number
  total: number
}

export default function ProductDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()
  const { addItem } = useCartStore()
  const { toast } = useToast()

  const [product, setProduct] = useState<Product | null>(null)
  const [variants, setVariants] = useState<ProductVariant[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [avgRating, setAvgRating] = useState(0)
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)

  // Variant selection
  const [selectedSize, setSelectedSize] = useState('')
  const [selectedColor, setSelectedColor] = useState('')

  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [reviewError, setReviewError] = useState('')

  useEffect(() => {
    Promise.all([
      api.get<Product>(`/products/${id}`),
      api.get<ReviewsResponse>(`/products/${id}/reviews`),
      api.get<ProductVariant[]>(`/products/${id}/variants`).catch(() => []),
    ]).then(([p, r, v]) => {
      setProduct(p)
      setReviews(r.reviews || [])
      setAvgRating(r.averageRating || 0)
      setVariants(Array.isArray(v) ? v : [])
    }).catch(() => navigate('/products'))
      .finally(() => setLoading(false))
  }, [id])

  // Tìm variant tương ứng với size + màu đã chọn
  const selectedVariant = variants.find(
    v => v.size === selectedSize && v.color === selectedColor
  )

  // Lấy danh sách size unique từ variants
  const availableSizes = [...new Set(variants.map(v => v.size))]

  // Lấy màu available cho size đang chọn
  const availableColors = selectedSize
    ? variants.filter(v => v.size === selectedSize).map(v => v.color)
    : [...new Set(variants.map(v => v.color))]

  // Kiểm tra stock
  const hasVariants = variants.length > 0
  const currentStock = hasVariants
    ? (selectedVariant?.stock ?? null)
    : product?.stock ?? 0

  const isOutOfStock = hasVariants
    ? (selectedVariant ? selectedVariant.stock === 0 : false)
    : (product?.stock === 0)

  const canAddToCart = hasVariants
    ? (!!selectedVariant && selectedVariant.stock > 0)
    : (product?.stock ?? 0) > 0

  const handleAddToCart = async () => {
    if (!isAuthenticated) { navigate('/auth'); return }
    if (!product) return

    if (hasVariants) {
      if (!selectedSize) { toast('Vui lòng chọn size', 'error'); return }
      if (!selectedColor) { toast('Vui lòng chọn màu sắc', 'error'); return }
      if (!selectedVariant) { toast('Không tìm thấy biến thể này', 'error'); return }
      if (selectedVariant.stock === 0) { toast('Biến thể này đã hết hàng', 'error'); return }
    }

    setAdding(true)
    try {
      await addItem({
        productId: product.id,
        name: product.name,
        price: Number(product.price),
        quantity: 1,
        ...(hasVariants && selectedVariant ? {
          variantId: selectedVariant.id,
          size: selectedVariant.size,
          color: selectedVariant.color,
        } : {}),
      })
      toast('Đã thêm vào giỏ hàng')
    } catch (err: any) {
      toast(err.message, 'error')
    } finally {
      setAdding(false)
    }
  }

  const handleReview = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isAuthenticated) { navigate('/auth'); return }
    setSubmitting(true); setReviewError('')
    try {
      await api.post(`/products/${id}/reviews`, { rating, comment })
      const r = await api.get<ReviewsResponse>(`/products/${id}/reviews`)
      setReviews(r.reviews || [])
      setAvgRating(r.averageRating || 0)
      setComment(''); setRating(5)
      toast('Đã gửi đánh giá')
    } catch (err: any) {
      setReviewError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-400">Đang tải...</div>
  if (!product) return null

  return (
    <div className="min-h-screen bg-white font-sans">
      <div className="max-w-5xl mx-auto px-6 py-12">

        <Breadcrumb items={[
          { label: 'Trang chủ', path: '/' },
          { label: 'Sản phẩm', path: '/products' },
          ...(product.category ? [{ label: product.category, path: `/products?category=${product.category}` }] : []),
          { label: product.name },
        ]} />

        <div className="flex flex-col md:flex-row gap-12 mb-16">
          <div className="md:w-1/2 aspect-square bg-gray-100">
            {product.imageUrl && <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />}
          </div>
          <div className="md:w-1/2 flex flex-col justify-center">
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">{product.category}</p>
            <h1 className="text-2xl font-light text-gray-900 mb-3">{product.name}</h1>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex">
                {[1,2,3,4,5].map(s => <Star key={s} className={`w-4 h-4 ${s <= Math.round(avgRating) ? 'fill-black text-black' : 'text-gray-300'}`} />)}
              </div>
              <span className="text-xs text-gray-400">({reviews.length} đánh giá)</span>
            </div>
            <p className="text-2xl font-medium mb-4">{Number(product.price).toLocaleString('vi-VN')} đ</p>
            {product.description && <p className="text-sm text-gray-500 mb-6 leading-relaxed">{product.description}</p>}

            {/* Variant selection */}
            {hasVariants ? (
              <>
                {/* Chọn Size */}
                {availableSizes.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                      Size {selectedSize && <span className="text-black">— {selectedSize}</span>}
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      {availableSizes.map(s => {
                        const hasStock = variants.some(v => v.size === s && v.stock > 0)
                        return (
                          <button key={s} onClick={() => { setSelectedSize(s); setSelectedColor('') }}
                            disabled={!hasStock}
                            className={`px-3 py-1.5 text-sm border transition ${
                              selectedSize === s ? 'border-black bg-black text-white'
                              : hasStock ? 'border-gray-300 hover:border-black'
                              : 'border-gray-200 text-gray-300 cursor-not-allowed line-through'
                            }`}>
                            {s}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Chọn Màu */}
                {availableColors.length > 0 && (
                  <div className="mb-6">
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                      Màu sắc {selectedColor && <span className="text-black">— {selectedColor}</span>}
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      {availableColors.map(c => {
                        const variant = variants.find(v => v.size === selectedSize && v.color === c)
                        const hasStock = variant ? variant.stock > 0 : true
                        return (
                          <button key={c} onClick={() => setSelectedColor(c)}
                            disabled={!hasStock}
                            className={`px-3 py-1.5 text-sm border transition ${
                              selectedColor === c ? 'border-black bg-black text-white'
                              : hasStock ? 'border-gray-300 hover:border-black'
                              : 'border-gray-200 text-gray-300 cursor-not-allowed line-through'
                            }`}>
                            {c}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Hiển thị stock của variant đã chọn */}
                {selectedVariant && (
                  <p className={`text-xs mb-4 ${selectedVariant.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
                    {selectedVariant.stock > 0 ? `Còn ${selectedVariant.stock} sản phẩm` : 'Hết hàng'}
                  </p>
                )}
              </>
            ) : (
              <>
                {/* Fallback: hiển thị sizes/colors từ product nếu không có variants */}
                {product.sizes && product.sizes.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Size</p>
                    <div className="flex gap-2 flex-wrap">
                      {product.sizes.map(s => <span key={s} className="border border-gray-300 px-3 py-1 text-sm">{s}</span>)}
                    </div>
                  </div>
                )}
                {product.colors && product.colors.length > 0 && (
                  <div className="mb-6">
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Màu sắc</p>
                    <div className="flex gap-2 flex-wrap">
                      {product.colors.map(c => <span key={c} className="border border-gray-300 px-3 py-1 text-sm">{c}</span>)}
                    </div>
                  </div>
                )}
              </>
            )}

            <button onClick={handleAddToCart} disabled={adding || !canAddToCart}
              className="w-full bg-black text-white py-4 text-sm font-bold uppercase tracking-wider hover:bg-gray-800 transition disabled:opacity-50">
              {adding ? 'Đang thêm...'
                : isOutOfStock ? 'Hết hàng'
                : hasVariants && (!selectedSize || !selectedColor) ? 'Chọn size và màu'
                : 'Thêm vào giỏ hàng'}
            </button>
          </div>
        </div>

        {/* Reviews */}
        <div>
          <h2 className="text-lg font-light uppercase tracking-widest mb-8 border-b border-gray-100 pb-4">Đánh giá</h2>
          {isAuthenticated && (
            <form onSubmit={handleReview} className="mb-8 p-6 border border-gray-200">
              <p className="text-sm font-bold uppercase tracking-wider mb-4">Viết đánh giá</p>
              <div className="flex gap-1 mb-4">
                {[1,2,3,4,5].map(s => (
                  <button key={s} type="button" onClick={() => setRating(s)}>
                    <Star className={`w-5 h-5 ${s <= rating ? 'fill-black text-black' : 'text-gray-300'}`} />
                  </button>
                ))}
              </div>
              <textarea value={comment} onChange={e => setComment(e.target.value)} rows={3} placeholder="Nhận xét của bạn..."
                className="w-full border border-gray-300 p-3 text-sm focus:border-black focus:outline-none mb-3" />
              {reviewError && <p className="text-red-500 text-sm mb-3">{reviewError}</p>}
              <button type="submit" disabled={submitting}
                className="bg-black text-white px-6 py-2.5 text-sm font-bold uppercase tracking-wider hover:bg-gray-800 transition disabled:opacity-50">
                {submitting ? 'Đang gửi...' : 'Gửi đánh giá'}
              </button>
            </form>
          )}
          {reviews.length === 0 ? (
            <div className="text-center py-12">
              <span className="text-4xl mb-4 block">💬</span>
              <p className="text-gray-400 text-sm">Chưa có đánh giá nào. Hãy là người đầu tiên!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {reviews.map(r => (
                <div key={r.id} className="border-b border-gray-100 pb-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium text-sm">{r.user?.name || 'Ẩn danh'}</p>
                    <p className="text-xs text-gray-400">{new Date(r.createdAt).toLocaleDateString('vi-VN')}</p>
                  </div>
                  <div className="flex mb-2">
                    {[1,2,3,4,5].map(s => <Star key={s} className={`w-3.5 h-3.5 ${s <= r.rating ? 'fill-black text-black' : 'text-gray-300'}`} />)}
                  </div>
                  {r.comment && <p className="text-sm text-gray-600">{r.comment}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
