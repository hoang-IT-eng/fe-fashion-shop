import React, { useState, useEffect, useRef } from 'react'
import { api } from '../../api/apiClient'
import { Product, ProductsResponse, ProductForm } from '../../types/product'
import { X, ImagePlus, Search, Package, Plus, Filter } from 'lucide-react'
import { useToast } from '../../components/Toast'
import { useCategoryStore } from '../../store/useCategoryStore'
import ConfirmDialog from '../../components/ConfirmDialog'
import AdminVariantsModal from './AdminVariantsModal'

const EMPTY_FORM: ProductForm = {
  name: '', price: '', stock: '', category: '',
  description: '', imageUrl: '', sizes: '', colors: '', isActive: true,
}

export default function AdminProductsTab() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [form, setForm] = useState<ProductForm>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState('')
  const [uploading, setUploading] = useState(false)
  const [confirmId, setConfirmId] = useState<number | null>(null)
  const [search, setSearch] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [variantsProduct, setVariantsProduct] = useState<Product | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { toast } = useToast()
  const { categories, fetch: fetchCategories } = useCategoryStore()

  useEffect(() => { fetchProducts(); fetchCategories() }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const res = await api.get<ProductsResponse>('/products?limit=100')
      setProducts(res.data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const openCreate = () => {
    setEditingProduct(null); setForm(EMPTY_FORM)
    setImageFile(null); setImagePreview(''); setFormError(''); setShowModal(true)
  }

  const openEdit = (p: Product) => {
    setEditingProduct(p)
    setForm({ name: p.name, price: parseFloat(p.price), stock: p.stock, category: p.category,
      description: p.description || '', imageUrl: p.imageUrl || '',
      sizes: p.sizes?.join(', ') || '', colors: p.colors?.join(', ') || '', isActive: p.isActive })
    setImageFile(null); setImagePreview(p.imageUrl || ''); setFormError(''); setShowModal(true)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setFormError('')
    try {
      let imageUrl = form.imageUrl
      if (imageFile) {
        setUploading(true)
        const res = await api.upload(imageFile)
        imageUrl = res.url
        setUploading(false)
      }
      const body = { ...form, imageUrl, price: Number(form.price), stock: Number(form.stock),
        sizes: form.sizes ? form.sizes.split(',').map(s => s.trim()).filter(Boolean) : [],
        colors: form.colors ? form.colors.split(',').map(s => s.trim()).filter(Boolean) : [] }
      if (editingProduct) await api.put(`/products/${editingProduct.id}`, body)
      else await api.post('/products', body)
      setShowModal(false)
      fetchProducts()
      toast(editingProduct ? 'Cập nhật sản phẩm thành công' : 'Thêm sản phẩm thành công')
    } catch (err: any) {
      setFormError(err.message); setUploading(false)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/products/${id}`)
      setProducts(prev => prev.filter(p => p.id !== id))
      toast('Đã xóa sản phẩm')
    } catch (err: any) { toast(err.message, 'error') }
  }

  const filtered = products.filter(p => {
    const matchSearch = !search
      || p.name.toLowerCase().includes(search.toLowerCase())
      || String(p.id).includes(search)
    const matchCategory = !filterCategory || p.category === filterCategory
    return matchSearch && matchCategory
  })

  return (
    <div className="space-y-6">
      {/* Header + Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-400">{filtered.length}/{products.length} sản phẩm</span>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 bg-gray-900 text-white px-5 py-2.5 text-sm font-semibold rounded-xl hover:bg-gray-800 transition-all shadow-lg shadow-gray-900/20"
        >
          <Plus className="w-4 h-4" /> Thêm sản phẩm
        </button>
      </div>

      {error && <p className="text-red-500 text-sm bg-red-50 px-4 py-3 rounded-xl">{error}</p>}

      {/* Search + Filter */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm theo tên hoặc ID..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:border-gray-900 focus:ring-1 focus:ring-gray-900 focus:outline-none transition"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <select
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
            className="pl-10 pr-8 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:border-gray-900 focus:ring-1 focus:ring-gray-900 focus:outline-none transition appearance-none cursor-pointer"
          >
            <option value="">Tất cả danh mục</option>
            {categories.map(c => (
              <option key={c.id} value={c.slug}>{c.name}</option>
            ))}
          </select>
        </div>
        {(search || filterCategory) && (
          <button onClick={() => { setSearch(''); setFilterCategory('') }}
            className="text-xs text-gray-400 hover:text-gray-900 transition px-3 py-2.5 rounded-xl hover:bg-gray-100">
            Xóa bộ lọc
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-400">ID</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-400">Sản phẩm</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-400">Danh mục</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-400">Giá bán</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-400">Trạng thái</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-400 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-16 text-center text-gray-400">Đang tải...</td></tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <Package className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm text-gray-400">
                      {(search || filterCategory) ? 'Không tìm thấy sản phẩm nào' : 'Chưa có sản phẩm nào'}
                    </p>
                  </td>
                </tr>
              ) : filtered.map(p => (
                <tr key={p.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4 font-semibold text-gray-400">#{p.id}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {p.imageUrl
                        ? <img src={p.imageUrl} alt={p.name} className="w-10 h-10 object-cover rounded-lg bg-gray-100 flex-shrink-0" />
                        : <div className="w-10 h-10 bg-gray-100 rounded-lg flex-shrink-0" />}
                      <span className="font-medium text-gray-900">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {p.category
                      ? <span className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-lg">{p.category}</span>
                      : <span className="text-gray-400">—</span>}
                  </td>
                  <td className="px-6 py-4 font-semibold text-gray-900">{Number(p.price).toLocaleString('vi-VN')} đ</td>
                  <td className="px-6 py-4">
                    {p.stock > 5
                      ? <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full ring-1 ring-emerald-200"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />Còn hàng</span>
                      : p.stock > 0
                      ? <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-700 text-xs font-semibold rounded-full ring-1 ring-amber-200"><span className="w-1.5 h-1.5 rounded-full bg-amber-500" />Sắp hết</span>
                      : <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-50 text-red-700 text-xs font-semibold rounded-full ring-1 ring-red-200"><span className="w-1.5 h-1.5 rounded-full bg-red-500" />Hết hàng</span>}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEdit(p)} className="px-3 py-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-50 rounded-lg transition">Sửa</button>
                      <button onClick={() => setVariantsProduct(p)} className="px-3 py-1.5 text-xs font-semibold text-violet-600 hover:bg-violet-50 rounded-lg transition">Biến thể</button>
                      <button onClick={() => setConfirmId(p.id)} className="px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg transition">Xóa</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white flex items-center justify-between px-6 py-5 border-b border-gray-100 z-10">
              <h2 className="text-lg font-bold text-gray-900">{editingProduct ? 'Sửa sản phẩm' : 'Thêm sản phẩm mới'}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-xl transition">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="p-6">
              {formError && <p className="text-red-500 text-sm bg-red-50 px-4 py-3 rounded-xl mb-4">{formError}</p>}
              <form onSubmit={handleSave} className="space-y-5">
                {/* Image upload */}
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-400">Hình ảnh</label>
                  <div onClick={() => fileInputRef.current?.click()}
                    className="relative w-full h-44 border-2 border-dashed border-gray-200 rounded-2xl flex items-center justify-center cursor-pointer hover:border-gray-400 transition overflow-hidden group">
                    {imagePreview
                      ? <img src={imagePreview} alt="preview" className="w-full h-full object-cover group-hover:opacity-90 transition" />
                      : <div className="flex flex-col items-center gap-2 text-gray-400"><ImagePlus className="w-8 h-8" /><span className="text-xs">Nhấn để chọn ảnh</span></div>}
                    {uploading && <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-2xl"><span className="text-white text-sm font-medium">Đang upload...</span></div>}
                  </div>
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                  {imagePreview && (
                    <button type="button" onClick={() => { setImageFile(null); setImagePreview(''); setForm(p => ({ ...p, imageUrl: '' })) }}
                      className="mt-2 text-xs text-red-500 hover:text-red-700 transition">
                      Xóa ảnh
                    </button>
                  )}
                </div>

                {[
                  { label: 'Tên sản phẩm *', key: 'name', type: 'text', required: true },
                  { label: 'Giá (VNĐ) *', key: 'price', type: 'number', required: true },
                  { label: 'Tồn kho', key: 'stock', type: 'number' },
                  { label: 'Sizes (cách nhau bằng dấu phẩy)', key: 'sizes', type: 'text' },
                  { label: 'Màu sắc (cách nhau bằng dấu phẩy)', key: 'colors', type: 'text' },
                ].map(({ label, key, type, required }) => (
                  <div key={key}>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-400">{label}</label>
                    <input type={type} value={form[key as keyof ProductForm] as string}
                      onChange={e => setForm(prev => ({ ...prev, [key]: e.target.value }))}
                      required={required}
                      className="w-full border border-gray-200 p-3 text-sm rounded-xl focus:border-gray-900 focus:ring-1 focus:ring-gray-900 focus:outline-none transition" />
                  </div>
                ))}

                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-400">Danh mục</label>
                  <select value={form.category} onChange={e => setForm(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full border border-gray-200 p-3 text-sm rounded-xl focus:border-gray-900 focus:ring-1 focus:ring-gray-900 focus:outline-none transition appearance-none cursor-pointer">
                    <option value="">-- Chọn danh mục --</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.slug}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-400">Mô tả</label>
                  <textarea value={form.description} onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
                    rows={3} className="w-full border border-gray-200 p-3 text-sm rounded-xl focus:border-gray-900 focus:ring-1 focus:ring-gray-900 focus:outline-none transition resize-none" />
                </div>

                <div className="flex items-center gap-3">
                  <input type="checkbox" id="isActive" checked={form.isActive} onChange={e => setForm(prev => ({ ...prev, isActive: e.target.checked }))}
                    className="w-4 h-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900" />
                  <label htmlFor="isActive" className="text-sm text-gray-700">Đang bán</label>
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowModal(false)}
                    className="flex-1 border border-gray-200 py-3 text-sm font-semibold rounded-xl hover:bg-gray-50 transition">
                    Hủy
                  </button>
                  <button type="submit" disabled={saving || uploading}
                    className="flex-1 bg-gray-900 text-white py-3 text-sm font-semibold rounded-xl hover:bg-gray-800 transition disabled:opacity-50 shadow-lg shadow-gray-900/20">
                    {uploading ? 'Đang upload...' : saving ? 'Đang lưu...' : 'Lưu'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={confirmId !== null}
        title="Xóa sản phẩm"
        message="Bạn có chắc muốn xóa sản phẩm này? Hành động này không thể hoàn tác."
        confirmLabel="Xóa"
        onConfirm={() => { if (confirmId) handleDelete(confirmId); setConfirmId(null) }}
        onCancel={() => setConfirmId(null)}
      />

      {variantsProduct && (
        <AdminVariantsModal
          productId={variantsProduct.id}
          productName={variantsProduct.name}
          onClose={() => setVariantsProduct(null)}
        />
      )}
    </div>
  )
}
