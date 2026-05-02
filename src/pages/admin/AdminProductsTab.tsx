import React, { useState, useEffect, useRef } from 'react'
import { api } from '../../api/apiClient'
import { Product, ProductsResponse, ProductForm } from '../../types/product'
import { X, ImagePlus } from 'lucide-react'

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
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { fetchProducts() }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const res = await api.get<ProductsResponse>('/products?limit=50')
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
      setShowModal(false); fetchProducts()
    } catch (err: any) {
      setFormError(err.message); setUploading(false)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Xác nhận xóa sản phẩm này?')) return
    try {
      await api.delete(`/products/${id}`)
      setProducts(prev => prev.filter(p => p.id !== id))
    } catch (err: any) { alert(err.message) }
  }

  return (
    <div>
      <header className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Quản lý sản phẩm</h1>
        <button onClick={openCreate} className="bg-black text-white px-4 py-2 text-sm font-bold hover:bg-gray-800 transition">
          + Thêm sản phẩm mới
        </button>
      </header>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 font-bold">ID</th>
              <th className="px-6 py-4 font-bold">Hình ảnh</th>
              <th className="px-6 py-4 font-bold">Tên sản phẩm</th>
              <th className="px-6 py-4 font-bold">Giá bán</th>
              <th className="px-6 py-4 font-bold">Trạng thái</th>
              <th className="px-6 py-4 font-bold text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-400">Đang tải...</td></tr>
            ) : products.length === 0 ? (
              <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-400">Chưa có sản phẩm nào</td></tr>
            ) : products.map(p => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium">#{p.id}</td>
                <td className="px-6 py-4">
                  {p.imageUrl ? <img src={p.imageUrl} alt={p.name} className="w-10 h-10 object-cover rounded bg-gray-100" />
                    : <div className="w-10 h-10 bg-gray-100 rounded" />}
                </td>
                <td className="px-6 py-4 font-medium text-gray-900">{p.name}</td>
                <td className="px-6 py-4">{Number(p.price).toLocaleString('vi-VN')} đ</td>
                <td className="px-6 py-4">
                  {p.stock > 5 ? <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-sm">Còn hàng</span>
                    : p.stock > 0 ? <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-bold rounded-sm">Sắp hết</span>
                    : <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-sm">Hết hàng</span>}
                </td>
                <td className="px-6 py-4 text-right space-x-3">
                  <button onClick={() => openEdit(p)} className="text-blue-600 font-medium hover:underline">Sửa</button>
                  <button onClick={() => handleDelete(p.id)} className="text-red-600 font-medium hover:underline">Xóa</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white w-full max-w-lg rounded-lg shadow-xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold">{editingProduct ? 'Sửa sản phẩm' : 'Thêm sản phẩm mới'}</h2>
              <button onClick={() => setShowModal(false)}><X className="w-5 h-5" /></button>
            </div>
            {formError && <p className="text-red-500 text-sm mb-4">{formError}</p>}
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-500">Hình ảnh</label>
                <div onClick={() => fileInputRef.current?.click()}
                  className="relative w-full h-40 border-2 border-dashed border-gray-300 rounded flex items-center justify-center cursor-pointer hover:border-black transition overflow-hidden">
                  {imagePreview ? <img src={imagePreview} alt="preview" className="w-full h-full object-cover" />
                    : <div className="flex flex-col items-center gap-2 text-gray-400"><ImagePlus className="w-8 h-8" /><span className="text-xs">Nhấn để chọn ảnh</span></div>}
                  {uploading && <div className="absolute inset-0 bg-black/40 flex items-center justify-center"><span className="text-white text-sm">Đang upload...</span></div>}
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                {imagePreview && <button type="button" onClick={() => { setImageFile(null); setImagePreview(''); setForm(p => ({ ...p, imageUrl: '' })) }} className="mt-1 text-xs text-red-500 hover:underline">Xóa ảnh</button>}
              </div>
              {[
                { label: 'Tên sản phẩm *', key: 'name', type: 'text', required: true },
                { label: 'Giá (VNĐ) *', key: 'price', type: 'number', required: true },
                { label: 'Tồn kho', key: 'stock', type: 'number' },
                { label: 'Danh mục', key: 'category', type: 'text' },
                { label: 'Sizes (cách nhau bằng dấu phẩy)', key: 'sizes', type: 'text' },
                { label: 'Màu sắc (cách nhau bằng dấu phẩy)', key: 'colors', type: 'text' },
              ].map(({ label, key, type, required }) => (
                <div key={key}>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-500">{label}</label>
                  <input type={type} value={form[key as keyof ProductForm] as string}
                    onChange={e => setForm(prev => ({ ...prev, [key]: e.target.value }))}
                    required={required} className="w-full border border-gray-300 p-2.5 text-sm focus:border-black focus:outline-none" />
                </div>
              ))}
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-500">Mô tả</label>
                <textarea value={form.description} onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
                  rows={3} className="w-full border border-gray-300 p-2.5 text-sm focus:border-black focus:outline-none" />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="isActive" checked={form.isActive} onChange={e => setForm(prev => ({ ...prev, isActive: e.target.checked }))} />
                <label htmlFor="isActive" className="text-sm text-gray-700">Đang bán</label>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 border border-gray-300 py-2.5 text-sm font-bold hover:bg-gray-50 transition">Hủy</button>
                <button type="submit" disabled={saving || uploading} className="flex-1 bg-black text-white py-2.5 text-sm font-bold hover:bg-gray-800 transition disabled:opacity-50">
                  {uploading ? 'Đang upload...' : saving ? 'Đang lưu...' : 'Lưu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
