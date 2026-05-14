import React, { useEffect, useState } from 'react'
import { X, Plus } from 'lucide-react'
import { api } from '../../api/apiClient'
import { ProductVariant } from '../../types/variant'
import { useToast } from '../../components/Toast'
import ConfirmDialog from '../../components/ConfirmDialog'

interface Props {
  productId: number
  productName: string
  onClose: () => void
}

export default function AdminVariantsModal({ productId, productName, onClose }: Props) {
  const { toast } = useToast()
  const [variants, setVariants] = useState<ProductVariant[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [confirmId, setConfirmId] = useState<number | null>(null)

  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState({ size: '', color: '', stock: '', sku: '' })
  const [formError, setFormError] = useState('')

  useEffect(() => { fetchVariants() }, [])

  const fetchVariants = async () => {
    try {
      setLoading(true)
      const data = await api.get<ProductVariant[]>(`/products/${productId}/variants`)
      setVariants(Array.isArray(data) ? data : [])
    } catch { setVariants([]) }
    finally { setLoading(false) }
  }

  const openCreate = () => {
    setEditingId(null); setForm({ size: '', color: '', stock: '', sku: '' }); setFormError('')
  }

  const openEdit = (v: ProductVariant) => {
    setEditingId(v.id)
    setForm({ size: v.size, color: v.color, stock: String(v.stock), sku: v.sku || '' })
    setFormError('')
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setFormError('')
    try {
      const body = { size: form.size, color: form.color, stock: Number(form.stock), sku: form.sku || null }
      if (editingId) {
        await api.put(`/products/${productId}/variants/${editingId}`, body)
        toast('Cập nhật biến thể thành công')
      } else {
        await api.post(`/products/${productId}/variants`, body)
        toast('Thêm biến thể thành công')
      }
      setEditingId(null); setForm({ size: '', color: '', stock: '', sku: '' })
      fetchVariants()
    } catch (err: any) {
      setFormError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/products/${productId}/variants/${id}`)
      setVariants(prev => prev.filter(v => v.id !== id))
      toast('Đã xóa biến thể')
    } catch (err: any) {
      toast(err.message, 'error')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 flex-shrink-0">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Quản lý biến thể</h2>
            <p className="text-xs text-gray-400 mt-0.5">{productName}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Form */}
          <div className="bg-gray-50 rounded-2xl p-5">
            <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Plus className="w-4 h-4" />
              {editingId ? 'Sửa biến thể' : 'Thêm biến thể mới'}
            </h3>
            {formError && <p className="text-red-500 text-sm bg-red-50 px-4 py-3 rounded-xl mb-4">{formError}</p>}
            <form onSubmit={handleSave} className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-400">Size *</label>
                <input type="text" value={form.size} onChange={e => setForm(p => ({ ...p, size: e.target.value }))}
                  required placeholder="S, M, L, XL..."
                  className="w-full border border-gray-200 p-3 text-sm rounded-xl focus:border-gray-900 focus:ring-1 focus:ring-gray-900 focus:outline-none transition bg-white" />
              </div>
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-400">Màu sắc *</label>
                <input type="text" value={form.color} onChange={e => setForm(p => ({ ...p, color: e.target.value }))}
                  required placeholder="trắng, đen, xanh..."
                  className="w-full border border-gray-200 p-3 text-sm rounded-xl focus:border-gray-900 focus:ring-1 focus:ring-gray-900 focus:outline-none transition bg-white" />
              </div>
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-400">Tồn kho *</label>
                <input type="number" min="0" value={form.stock} onChange={e => setForm(p => ({ ...p, stock: e.target.value }))}
                  required
                  className="w-full border border-gray-200 p-3 text-sm rounded-xl focus:border-gray-900 focus:ring-1 focus:ring-gray-900 focus:outline-none transition bg-white" />
              </div>
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-400">SKU</label>
                <input type="text" value={form.sku} onChange={e => setForm(p => ({ ...p, sku: e.target.value }))}
                  placeholder="Tùy chọn"
                  className="w-full border border-gray-200 p-3 text-sm rounded-xl focus:border-gray-900 focus:ring-1 focus:ring-gray-900 focus:outline-none transition bg-white" />
              </div>
              <div className="col-span-2 flex gap-3 pt-1">
                {editingId && (
                  <button type="button" onClick={() => { setEditingId(null); setForm({ size: '', color: '', stock: '', sku: '' }) }}
                    className="flex-1 border border-gray-200 py-2.5 text-sm font-semibold rounded-xl hover:bg-white transition">
                    Hủy
                  </button>
                )}
                <button type="submit" disabled={saving}
                  className="flex-1 bg-gray-900 text-white py-2.5 text-sm font-semibold rounded-xl hover:bg-gray-800 transition disabled:opacity-50 shadow-lg shadow-gray-900/20">
                  {saving ? 'Đang lưu...' : editingId ? 'Cập nhật' : 'Thêm biến thể'}
                </button>
              </div>
            </form>
          </div>

          {/* Variant list */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 mb-3">
              Danh sách biến thể ({variants.length})
            </h3>
            {loading ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => <div key={i} className="h-12 bg-gray-50 rounded-xl animate-pulse" />)}
              </div>
            ) : variants.length === 0 ? (
              <div className="py-10 text-center bg-gray-50 rounded-2xl">
                <p className="text-sm text-gray-400">Chưa có biến thể nào</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Size</th>
                      <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Màu</th>
                      <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Tồn kho</th>
                      <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">SKU</th>
                      <th className="px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-gray-400">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {variants.map(v => (
                      <tr key={v.id} className="hover:bg-gray-50/50 transition-colors group">
                        <td className="px-5 py-3.5">
                          <span className="px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-lg">{v.size}</span>
                        </td>
                        <td className="px-5 py-3.5 text-gray-700">{v.color}</td>
                        <td className="px-5 py-3.5">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full ring-1
                            ${v.stock > 5 ? 'bg-emerald-50 text-emerald-700 ring-emerald-200'
                            : v.stock > 0 ? 'bg-amber-50 text-amber-700 ring-amber-200'
                            : 'bg-red-50 text-red-700 ring-red-200'}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${v.stock > 5 ? 'bg-emerald-500' : v.stock > 0 ? 'bg-amber-500' : 'bg-red-500'}`} />
                            {v.stock > 0 ? v.stock : 'Hết'}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <code className="text-xs text-gray-400 font-mono">{v.sku || '—'}</code>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => openEdit(v)} className="px-3 py-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-50 rounded-lg transition">Sửa</button>
                            <button onClick={() => setConfirmId(v.id)} className="px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg transition">Xóa</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmId !== null}
        title="Xóa biến thể"
        message="Bạn có chắc muốn xóa biến thể này?"
        confirmLabel="Xóa"
        onConfirm={() => { if (confirmId) handleDelete(confirmId); setConfirmId(null) }}
        onCancel={() => setConfirmId(null)}
      />
    </div>
  )
}
