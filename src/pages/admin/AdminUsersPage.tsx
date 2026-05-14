import React, { useEffect, useState } from 'react'
import { api } from '../../api/apiClient'
import { X, Search, Users, Shield, CheckCircle2, Clock } from 'lucide-react'
import { useToast } from '../../components/Toast'
import ConfirmDialog from '../../components/ConfirmDialog'

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
  const [confirmId, setConfirmId] = useState<number | null>(null)

  const { toast } = useToast()

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
      toast('Cập nhật thành công')
    } catch (err: any) {
      setSaveError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/users/${id}`)
      setUsers(prev => prev.filter(u => u.id !== id))
      toast('Đã xóa user')
    } catch (err: any) {
      toast(err.message, 'error')
    }
  }

  const filtered = users.filter(u =>
    !search
    || u.name?.toLowerCase().includes(search.toLowerCase())
    || u.email?.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return (
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => <div key={i} className="h-14 bg-white rounded-2xl animate-pulse border border-gray-100" />)}
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header + Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <span className="text-sm text-gray-400">{users.length} tài khoản</span>
        <div className="relative max-w-sm w-full sm:w-auto">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm theo tên hoặc email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:border-gray-900 focus:ring-1 focus:ring-gray-900 focus:outline-none transition"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-400">ID</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-400">Người dùng</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-400">Email</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-400">Vai trò</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-400">Xác thực</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-400 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <Users className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm text-gray-400">Không tìm thấy user nào</p>
                  </td>
                </tr>
              ) : filtered.map(u => (
                <tr key={u.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4 font-semibold text-gray-400">#{u.id}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ring-2 ring-white
                        ${u.role === 'admin'
                          ? 'bg-gradient-to-br from-gray-700 to-gray-900 text-white'
                          : 'bg-gradient-to-br from-gray-100 to-gray-200 text-gray-600'
                        }`}>
                        {(u.name?.[0] || u.email?.[0] || '?').toUpperCase()}
                      </div>
                      <span className="font-medium text-gray-900">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-500">{u.email}</td>
                  <td className="px-6 py-4">
                    {u.role === 'admin' ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-gray-900 text-white">
                        <Shield className="w-3 h-3" /> Admin
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-600 ring-1 ring-gray-200">
                        User
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {u.isVerified ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Đã xác thực
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-600">
                        <Clock className="w-3.5 h-3.5" /> Chưa xác thực
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEdit(u)} className="px-3 py-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-50 rounded-lg transition">Sửa</button>
                      {u.role !== 'admin' && (
                        <button onClick={() => setConfirmId(u.id)} className="px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg transition">Xóa</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Sửa thông tin</h2>
              <button onClick={() => setEditingUser(null)} className="p-2 hover:bg-gray-100 rounded-xl transition">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="p-6">
              <form onSubmit={handleSave} className="space-y-5">
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-400">Email</label>
                  <input type="text" value={editingUser.email} disabled
                    className="w-full border border-gray-200 p-3 text-sm bg-gray-50 text-gray-400 cursor-not-allowed rounded-xl" />
                </div>
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-400">Họ và tên</label>
                  <input type="text" value={editName} onChange={e => setEditName(e.target.value)} required
                    className="w-full border border-gray-200 p-3 text-sm rounded-xl focus:border-gray-900 focus:ring-1 focus:ring-gray-900 focus:outline-none transition" />
                </div>

                {saveError && <p className="text-red-500 text-sm bg-red-50 px-4 py-3 rounded-xl">{saveError}</p>}

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setEditingUser(null)}
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
        title="Xóa tài khoản"
        message="Bạn có chắc muốn xóa tài khoản này? Hành động này không thể hoàn tác."
        confirmLabel="Xóa"
        onConfirm={() => { if (confirmId) handleDelete(confirmId); setConfirmId(null) }}
        onCancel={() => setConfirmId(null)}
      />
    </div>
  )
}
