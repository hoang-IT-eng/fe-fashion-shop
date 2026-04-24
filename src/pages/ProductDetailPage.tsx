import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Star } from 'lucide-react'
import { useCartStore } from '../store/useCartStore'
import { useAuthStore } from '../store/useAuthStore'
import { api } from '../api/apiClient'
import { Product } from '../types/product'

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

  const [product, setProduct] = useState<Product | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [avgRating, setAvgRating] = useState(0)
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)

  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [reviewError, setReviewError] = useState('')

  useEffect(() => {
    Promise.all([
      api.get<Product>(`/products/${id}`),
      api.get<ReviewsResponse>(`/products/${id}/reviews`),
    ]).then(([p, r]) => {
      setProduct(p)
      setReviews(r.reviews || [])
      setAvgRating(r.averageRating || 0)
    }).catch(() => navigate('/products'))
      .finally(() => setLoading(false))
  }, [id])

  const handleAddToCart = async () => {
    if (!isAuthenticated) { navigate('/auth'); return }
    if (!product) return
    setAdding(true)
    try {
      await addItem({ productId: product.id, name: product.name, price: Number(product.price), quantity: 1 })
      navigate('/cart')
    } catch (err: any) {
      alert(err.message)
    } finally {
      setAdding(false)
    }
  }

  const handleReview = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isAuthenticated) { navigate('/auth'); return }
    setSubmitting(true)
    setReviewError('')
    try {
      await api.post(`/products/${id}/reviews`, { rating, comment })
      const r = await api.get<ReviewsResponse>(`/products/${id}/reviews`)
      setReviews(r.reviews || [])
      setAvgRating(r.averageRating || 0)
      setComment('')
      setRating(5)
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

        {/* Product info */}
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

            <button onClick={handleAddToCart} disabled={adding || product.stock === 0}
              className="w-full bg-black text-white py-4 text-sm font-bold uppercase tracking-wider hover:bg-gray-800 transition disabled:opacity-50">
              {adding ? 'Đang thêm...' : product.stock === 0 ? 'Hết hàng' : 'Thêm vào giỏ hàng'}
            </button>
          </div>
        </div>

        {/* Reviews */}
        <div>
          <h2 className="text-lg font-light uppercase tracking-widest mb-8 border-b border-gray-100 pb-4">Đánh giá</h2>

          {/* Form gửi đánh giá */}
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

          {/* Danh sách đánh giá */}
          {reviews.length === 0 ? (
            <p className="text-gray-400 text-sm">Chưa có đánh giá nào.</p>
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
