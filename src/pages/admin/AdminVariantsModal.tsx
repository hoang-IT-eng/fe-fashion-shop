import React, { useEffect, useState } from 'react'
import { X } from 'lucide-react'
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

  // Form thêm/sửa
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white w-full max-w-2xl rounded-lg shadow-xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div>
            <h2 className="text-lg font-bold">Quản lý biến thể</h2>
            <p className="text-xs text-gray-400 mt-0.5">{productName}</p>
          </div>
          <button onClick={onClose}><X className="w-5 h-5" /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Form thêm/sửa */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-700 mb-4">
              {editingId ? 'Sửa biến thể' : 'Thêm biến thể mới'}
            </h3>
            {formError && <p className="text-red-500 text-sm mb-3">{formError}</p>}
            <form onSubmit={handleSave} className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-500">Size *</label>
                <input type="text" value={form.size} onChange={e => setForm(p => ({ ...p, size: e.target.value }))}
                  required placeholder="S, M, L, XL..."
                  className="w-full border border-gray-300 p-2.5 text-sm focus:border-black focus:outline-none" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-500">Màu sắc *</label>
                <input type="text" value={form.color} onChange={e => setForm(p => ({ ...p, color: e.target.value }))}
                  required placeholder="trắng, đen, xanh..."
                  className="w-full border border-gray-300 p-2.5 text-sm focus:border-black focus:outline-none" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-500">Tồn kho *</label>
                <input type="number" min="0" value={form.stock} onChange={e => setForm(p => ({ ...p, stock: e.target.value }))}
                  required
                  className="w-full border border-gray-300 p-2.5 text-sm focus:border-black focus:outline-none" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-500">SKU</label>
                <input type="text" value={form.sku} onChange={e => setForm(p => ({ ...p, sku: e.target.value }))}
                  placeholder="Tùy chọn"
                  className="w-full border border-gray-300 p-2.5 text-sm focus:border-black focus:outline-none" />
              </div>
              <div className="col-span-2 flex gap-3">
                {editingId && (
                  <button type="button" onClick={() => { setEditingId(null); setForm({ size: '', color: '', stock: '', sku: '' }) }}
                    className="flex-1 border border-gray-300 py-2 text-sm font-bold hover:bg-gray-50 transition">
                    Hủy
                  </button>
                )}
                <button type="submit" disabled={saving}
                  className="flex-1 bg-black text-white py-2 text-sm font-bold hover:bg-gray-800 transition disabled:opacity-50">
                  {saving ? 'Đang lưu...' : editingId ? 'Cập nhật' : '+ Thêm biến thể'}
                </button>
              </div>
            </form>
          </div>

          {/* Danh sách variants */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-700 mb-3">
              Danh sách biến thể ({variants.length})
            </h3>
            {loading ? (
              <p className="text-gray-400 text-sm text-center py-4">Đang tải...</p>
            ) : variants.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-4">Chưa có biến thể nào</p>
            ) : (
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full text-sm text-gray-600">
                  <thead className="bg-gray-50 text-xs uppercase text-gray-500 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left font-bold">Size</th>
                      <th className="px-4 py-3 text-left font-bold">Màu</th>
                      <th className="px-4 py-3 text-left font-bold">Tồn kho</th>
                      <th className="px-4 py-3 text-left font-bold">SKU</th>
                      <th className="px-4 py-3 text-right font-bold">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {variants.map(v => (
                      <tr key={v.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium">{v.size}</td>
                        <td className="px-4 py-3">{v.color}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 text-xs font-bold rounded-sm ${
                            v.stock > 5 ? 'bg-green-100 text-green-700'
                            : v.stock > 0 ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-red-100 text-red-700'
                          }`}>
                            {v.stock > 0 ? v.stock : 'Hết'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-400 font-mono text-xs">{v.sku || '—'}</td>
                        <td className="px-4 py-3 text-right space-x-3">
                          <button onClick={() => openEdit(v)} className="text-blue-600 font-medium hover:underline text-xs">Sửa</button>
                          <button onClick={() => setConfirmId(v.id)} className="text-red-600 font-medium hover:underline text-xs">Xóa</button>
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
