import React, { useEffect, useState } from 'react'
import { api } from '../../api/apiClient'
import { X } from 'lucide-react'

interface User {
  id: number
  name: string
  email: string
  role: string
  isVerified: boolean
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [editName, setEditName] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  useEffect(() => {
    api.get<User[]>('/users')
      .then(setUsers)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const openEdit = (u: User) => {
    setEditingUser(u)
    setEditName(u.name)
    setSaveError('')
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingUser) return
    setSaving(true)
    setSaveError('')
    try {
      await api.put(`/users/${editingUser.id}`, { name: editName })
      setUsers(prev => prev.map(u => u.id === editingUser.id ? { ...u, name: editName } : u))
      setEditingUser(null)
    } catch (err: any) {
      setSaveError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Xóa user này?')) return
    try {
      await api.delete(`/users/${id}`)
      setUsers(prev => prev.filter(u => u.id !== id))
    } catch (err: any) {
      alert(err.message)
    }
  }

  const filtered = users.filter(u =>
    !search
    || u.name?.toLowerCase().includes(search.toLowerCase())
    || u.email?.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <div className="py-12 text-center text-gray-400">Đang tải...</div>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Quản lý khách hàng</h1>
        <span className="text-sm text-gray-400">{users.length} tài khoản</span>
      </div>

      {/* Search */}
      <div className="mb-6">
        <input type="text" placeholder="Tìm theo tên hoặc email..."
          value={search} onChange={e => setSearch(e.target.value)}
          className="border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none w-72" />
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 font-bold">ID</th>
              <th className="px-6 py-4 font-bold">Tên</th>
              <th className="px-6 py-4 font-bold">Email</th>
              <th className="px-6 py-4 font-bold">Role</th>
              <th className="px-6 py-4 font-bold">Xác thực</th>
              <th className="px-6 py-4 font-bold text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length === 0 ? (
              <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-400">Không tìm thấy user nào</td></tr>
            ) : filtered.map(u => (
              <tr key={u.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium">#{u.id}</td>
                <td className="px-6 py-4 font-medium text-gray-900">{u.name}</td>
                <td className="px-6 py-4 text-gray-500">{u.email}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs font-bold rounded-sm ${u.role === 'admin' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>
                    {u.role}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {u.isVerified
                    ? <span className="text-green-600 text-xs font-bold">✓ Đã xác thực</span>
                    : <span className="text-yellow-600 text-xs font-bold">Chưa xác thực</span>}
                </td>
                <td className="px-6 py-4 text-right space-x-3">
                  <button onClick={() => openEdit(u)} className="text-blue-600 font-medium hover:underline text-xs">Sửa</button>
                  {u.role !== 'admin' && (
                    <button onClick={() => handleDelete(u.id)} className="text-red-600 font-medium hover:underline text-xs">Xóa</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal sửa user */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white w-full max-w-sm rounded-lg shadow-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold">Sửa thông tin user</h2>
              <button onClick={() => setEditingUser(null)}><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-500">Email</label>
                <input type="text" value={editingUser.email} disabled
                  className="w-full border border-gray-200 p-2.5 text-sm bg-gray-50 text-gray-400 cursor-not-allowed" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-500">Họ và tên</label>
                <input type="text" value={editName} onChange={e => setEditName(e.target.value)} required
                  className="w-full border border-gray-300 p-2.5 text-sm focus:border-black focus:outline-none" />
              </div>

              {saveError && <p className="text-red-500 text-sm">{saveError}</p>}

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setEditingUser(null)}
                  className="flex-1 border border-gray-300 py-2.5 text-sm font-bold hover:bg-gray-50 transition">
                  Hủy
                </button>
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
