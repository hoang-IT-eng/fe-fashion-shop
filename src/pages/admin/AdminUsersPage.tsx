import React, { useEffect, useState } from 'react'
import { api } from '../../api/apiClient'

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

  useEffect(() => {
    api.get<User[]>('/users')
      .then(setUsers)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleDelete = async (id: number) => {
    if (!confirm('Xóa user này?')) return
    try {
      await api.delete(`/users/${id}`)
      setUsers(prev => prev.filter(u => u.id !== id))
    } catch (err: any) {
      alert(err.message)
    }
  }

  if (loading) return <div className="py-12 text-center text-gray-400">Đang tải...</div>

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Quản lý khách hàng</h1>
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
            {users.length === 0 ? (
              <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-400">Chưa có user nào</td></tr>
            ) : users.map(u => (
              <tr key={u.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium">#{u.id}</td>
                <td className="px-6 py-4 font-medium text-gray-900">{u.name}</td>
                <td className="px-6 py-4">{u.email}</td>
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
                <td className="px-6 py-4 text-right">
                  {u.role !== 'admin' && (
                    <button onClick={() => handleDelete(u.id)} className="text-red-600 font-medium hover:underline text-xs">
                      Xóa
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
