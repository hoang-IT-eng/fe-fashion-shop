import React, { useEffect, useState } from 'react'
import { api } from '../../api/apiClient'
import { Category } from '../../types/category'
import { X } from 'lucide-react'
import { useToast } from '../../components/Toast'
import { useCategoryStore } from '../../store/useCategoryStore'

export default function AdminCategoriesTab() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Category | null>(null)
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')
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

  // Tự động tạo slug từ tên
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
      refetchStore() // cập nhật store dùng chung
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
    if (!confirm('Xóa danh mục này?')) return
    try {
      await api.delete(`/categories/${id}`)
      setCategories(prev => prev.filter(c => c.id !== id))
      toast('Đã xóa danh mục')
      refetchStore()
    } catch (err: any) {
      toast(err.message, 'error')
    }
  }

  if (loading) return <div className="py-12 text-center text-gray-400">Đang tải...</div>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Quản lý danh mục</h1>
        <button onClick={openCreate} className="bg-black text-white px-4 py-2 text-sm font-bold hover:bg-gray-800 transition">
          + Thêm danh mục
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 font-bold">ID</th>
              <th className="px-6 py-4 font-bold">Tên danh mục</th>
              <th className="px-6 py-4 font-bold">Slug</th>
              <th className="px-6 py-4 font-bold">Trạng thái</th>
              <th className="px-6 py-4 font-bold text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {categories.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-400">Chưa có danh mục nào</td></tr>
            ) : categories.map(c => (
              <tr key={c.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium">#{c.id}</td>
                <td className="px-6 py-4 font-medium text-gray-900">{c.name}</td>
                <td className="px-6 py-4 text-gray-400 font-mono text-xs">{c.slug}</td>
                <td className="px-6 py-4">
                  <button onClick={() => handleToggle(c)}
                    className={`px-2 py-1 text-xs font-bold rounded-sm transition ${c.isActive !== false ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                    {c.isActive !== false ? 'Đang hiện' : 'Đang ẩn'}
                  </button>
                </td>
                <td className="px-6 py-4 text-right space-x-3">
                  <button onClick={() => openEdit(c)} className="text-blue-600 font-medium hover:underline text-xs">Sửa</button>
                  <button onClick={() => handleDelete(c.id)} className="text-red-600 font-medium hover:underline text-xs">Xóa</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal thêm/sửa */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white w-full max-w-sm rounded-lg shadow-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold">{editing ? 'Sửa danh mục' : 'Thêm danh mục'}</h2>
              <button onClick={() => setShowModal(false)}><X className="w-5 h-5" /></button>
            </div>
            {formError && <p className="text-red-500 text-sm mb-4">{formError}</p>}
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-500">Tên danh mục *</label>
                <input type="text" value={name} onChange={e => handleNameChange(e.target.value)} required
                  className="w-full border border-gray-300 p-2.5 text-sm focus:border-black focus:outline-none" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-500">Slug *</label>
                <input type="text" value={slug} onChange={e => setSlug(e.target.value)} required
                  className="w-full border border-gray-300 p-2.5 text-sm focus:border-black focus:outline-none font-mono" />
                <p className="text-xs text-gray-400 mt-1">Dùng để lọc sản phẩm, ví dụ: do-nam</p>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 border border-gray-300 py-2.5 text-sm font-bold hover:bg-gray-50 transition">Hủy</button>
                <button type="submit" disabled={saving}
                  className="flex-1 bg-black text-white py-2.5 text-sm font-bold hover:bg-gray-800 transition disabled:opacity-50">
                  {saving ? 'Đang lưu...' : 'Lưu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
