import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/useAuthStore'
import { api } from '../api/apiClient'

interface UserProfile {
  id: number
  name: string
  email: string
  role: string
  isVerified: boolean
}

export default function ProfilePage() {
  const navigate = useNavigate()
  const { isAuthenticated, logout, user } = useAuthStore()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isAuthenticated) { navigate('/auth'); return }
    api.get<UserProfile>('/users/me')
      .then(data => { setProfile(data); setName(data.name) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      await api.put('/users/me', { name })
      setSuccess('Cập nhật thành công')
      setProfile(prev => prev ? { ...prev, name } : prev)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-400">Đang tải...</div>

  return (
    <div className="min-h-screen bg-white font-sans">
      <div className="max-w-lg mx-auto px-6 py-12">

        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <h1 className="text-2xl font-light uppercase tracking-widest">Tài khoản</h1>
          <button onClick={() => navigate('/')} className="text-xs text-gray-400 hover:text-black transition uppercase tracking-wider">
            ← Trang chủ
          </button>
        </div>

        {/* Avatar + tên */}
        <div className="flex items-center gap-4 mb-10 p-6 bg-gray-50">
          <div className="w-14 h-14 rounded-full bg-black flex items-center justify-center text-white text-xl font-bold">
            {profile?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-medium text-gray-900">{profile?.name}</p>
            <p className="text-sm text-gray-400">{profile?.email}</p>
            <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-sm uppercase tracking-wider mt-1 inline-block">
              {profile?.role === 'admin' ? 'Quản trị viên' : 'Khách hàng'}
            </span>
          </div>
        </div>

        {/* Form cập nhật */}
        <form onSubmit={handleSave} className="space-y-5 mb-8">
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-700">Thông tin cá nhân</h2>

          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-500">Họ và tên</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              className="w-full border border-gray-300 p-3 text-sm focus:border-black focus:outline-none transition"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-500">Email</label>
            <input
              type="email"
              value={profile?.email || ''}
              disabled
              className="w-full border border-gray-200 p-3 text-sm bg-gray-50 text-gray-400 cursor-not-allowed"
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}
          {success && <p className="text-green-600 text-sm">{success}</p>}

          <button type="submit" disabled={saving}
            className="w-full bg-black text-white py-3 text-sm font-bold uppercase tracking-wider hover:bg-gray-800 transition disabled:opacity-50">
            {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>
        </form>

        {/* Các liên kết */}
        <div className="space-y-2 border-t border-gray-100 pt-6">
          <button onClick={() => navigate('/orders')}
            className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition flex items-center justify-between">
            <span>Đơn hàng của tôi</span>
            <span className="text-gray-400">→</span>
          </button>
          <button onClick={() => navigate('/forgot-password')}
            className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition flex items-center justify-between">
            <span>Đổi mật khẩu</span>
            <span className="text-gray-400">→</span>
          </button>
          {user?.role === 'admin' && (
            <button onClick={() => navigate('/admin')}
              className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition flex items-center justify-between">
              <span>Trang quản trị</span>
              <span className="text-gray-400">→</span>
            </button>
          )}
          <button onClick={handleLogout}
            className="w-full text-left px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition flex items-center justify-between">
            <span>Đăng xuất</span>
            <span>→</span>
          </button>
        </div>
      </div>
    </div>
  )
}
