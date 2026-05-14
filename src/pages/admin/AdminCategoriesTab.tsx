import React, { useEffect, useState } from 'react'
import { api } from '../../api/apiClient'
import { Category } from '../../types/category'
import { X, Plus, Tag } from 'lucide-react'
import { useToast } from '../../components/Toast'
import { useCategoryStore } from '../../store/useCategoryStore'
import ConfirmDialog from '../../components/ConfirmDialog'

export default function AdminCategoriesTab() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Category | null>(null)
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')
  const [confirmId, setConfirmId] = useState<number | null>(null)
  const { toast } = useToast()
  const { fetch: refetchStore } = useCategoryStore()

  useEffect(() => { fetchAll() }, [])

  const fetchAll = async () => {
    try {
      setLoading(true)
      const data = await api.get<Category[]>('/categories')
      setCategories(Array.isArray(data) ? data : [])
    } catch { setCategories([]) }
    finally { setLoading(false) }
  }

  const openCreate = () => {
    setEditing(null); setName(''); setSlug(''); setFormError(''); setShowModal(true)
  }

  const openEdit = (c: Category) => {
    setEditing(c); setName(c.name); setSlug(c.slug); setFormError(''); setShowModal(true)
  }

  const handleNameChange = (val: string) => {
    setName(val)
    if (!editing) {
      setSlug(val.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd').replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-'))
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true); setFormError('')
    try {
      if (editing) {
        await api.put(`/categories/${editing.id}`, { name, slug })
        toast('Cập nhật danh mục thành công')
      } else {
        await api.post('/categories', { name, slug })
        toast('Thêm danh mục thành công')
      }
      setShowModal(false)
      await fetchAll()
      refetchStore()
    } catch (err: any) {
      setFormError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleToggle = async (c: Category) => {
    try {
      await api.patch(`/categories/${c.id}/toggle`, {})
      setCategories(prev => prev.map(x => x.id === c.id ? { ...x, isActive: !x.isActive } : x))
      toast(`Đã ${c.isActive ? 'ẩn' : 'hiện'} danh mục "${c.name}"`)
      refetchStore()
    } catch (err: any) {
      toast(err.message, 'error')
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/categories/${id}`)
      setCategories(prev => prev.filter(c => c.id !== id))
      toast('Đã xóa danh mục')
      refetchStore()
    } catch (err: any) {
      toast(err.message, 'error')
    }
  }

  if (loading) return (
    <div className="space-y-3">
      {[...Array(4)].map((_, i) => <div key={i} className="h-14 bg-white rounded-2xl animate-pulse border border-gray-100" />)}
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-400">{categories.length} danh mục</span>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 bg-gray-900 text-white px-5 py-2.5 text-sm font-semibold rounded-xl hover:bg-gray-800 transition-all shadow-lg shadow-gray-900/20"
        >
          <Plus className="w-4 h-4" /> Thêm danh mục
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-400">ID</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-400">Tên danh mục</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-400">Slug</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-400">Trạng thái</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-400 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {categories.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center">
                    <Tag className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm text-gray-400">Chưa có danh mục nào</p>
                  </td>
                </tr>
              ) : categories.map(c => (
                <tr key={c.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4 font-semibold text-gray-400">#{c.id}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                        <Tag className="w-3.5 h-3.5 text-gray-500" />
                      </div>
                      <span className="font-medium text-gray-900">{c.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <code className="px-2.5 py-1 bg-gray-100 text-gray-500 text-xs font-mono rounded-lg">{c.slug}</code>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleToggle(c)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full ring-1 transition-all
                        ${c.isActive !== false
                          ? 'bg-emerald-50 text-emerald-700 ring-emerald-200 hover:bg-emerald-100'
                          : 'bg-gray-50 text-gray-500 ring-gray-200 hover:bg-gray-100'
                        }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${c.isActive !== false ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                      {c.isActive !== false ? 'Đang hiện' : 'Đang ẩn'}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEdit(c)} className="px-3 py-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-50 rounded-lg transition">Sửa</button>
                      <button onClick={() => setConfirmId(c.id)} className="px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg transition">Xóa</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">{editing ? 'Sửa danh mục' : 'Thêm danh mục'}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-xl transition">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div className="p-6">
              {formError && <p className="text-red-500 text-sm bg-red-50 px-4 py-3 rounded-xl mb-4">{formError}</p>}
              <form onSubmit={handleSave} className="space-y-5">
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-400">Tên danh mục *</label>
                  <input type="text" value={name} onChange={e => handleNameChange(e.target.value)} required
                    className="w-full border border-gray-200 p-3 text-sm rounded-xl focus:border-gray-900 focus:ring-1 focus:ring-gray-900 focus:outline-none transition" />
                </div>
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-400">Slug *</label>
                  <input type="text" value={slug} onChange={e => setSlug(e.target.value)} required
                    className="w-full border border-gray-200 p-3 text-sm rounded-xl focus:border-gray-900 focus:ring-1 focus:ring-gray-900 focus:outline-none transition font-mono" />
                  <p className="text-xs text-gray-400 mt-2">Dùng để lọc sản phẩm, ví dụ: do-nam</p>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowModal(false)}
                    className="flex-1 border border-gray-200 py-3 text-sm font-semibold rounded-xl hover:bg-gray-50 transition">
                    Hủy
                  </button>
                  <button type="submit" disabled={saving}
                    className="flex-1 bg-gray-900 text-white py-3 text-sm font-semibold rounded-xl hover:bg-gray-800 transition disabled:opacity-50 shadow-lg shadow-gray-900/20">
                    {saving ? 'Đang lưu...' : 'Lưu'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={confirmId !== null}
        title="Xóa danh mục"
        message="Bạn có chắc muốn xóa danh mục này?"
        confirmLabel="Xóa"
        onConfirm={() => { if (confirmId) handleDelete(confirmId); setConfirmId(null) }}
        onCancel={() => setConfirmId(null)}
      />
    </div>
  )
}
