import React, { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { api } from '../../api/apiClient'

export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''

  const [newPassword, setNewPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword !== confirm) { setError('Mật khẩu xác nhận không khớp'); return }
    setLoading(true)
    setError('')
    try {
      await api.post('/auth/reset-password', { token, newPassword })
      setSuccess(true)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-white font-sans">
      <div className="flex w-full flex-col justify-center px-8 md:w-1/2 md:px-24">
        <div className="mb-12">
          <h1 className="cursor-pointer text-2xl font-black text-red-600 tracking-tighter" onClick={() => navigate('/')}>
            THEBASIC
          </h1>
        </div>

        <h2 className="mb-8 text-3xl font-light uppercase tracking-widest text-gray-900">Đặt lại mật khẩu</h2>

        {!token ? (
          <div className="text-red-500 text-sm">Link không hợp lệ. Vui lòng yêu cầu lại.</div>
        ) : success ? (
          <div className="space-y-6">
            <div className="rounded bg-green-50 border border-green-200 px-4 py-4 text-sm text-green-700">
              Mật khẩu đã được đặt lại thành công!
            </div>
            <button onClick={() => navigate('/auth')}
              className="w-full bg-black py-4 text-sm font-bold uppercase tracking-wider text-white hover:bg-gray-800 transition">
              Đăng nhập ngay
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-500">Mật khẩu mới</label>
              <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required minLength={6}
                className="w-full border border-gray-300 p-3 text-sm focus:border-black focus:outline-none transition" />
            </div>
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-500">Xác nhận mật khẩu</label>
              <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} required
                className="w-full border border-gray-300 p-3 text-sm focus:border-black focus:outline-none transition" />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button type="submit" disabled={loading}
              className="w-full bg-black py-4 text-sm font-bold uppercase tracking-wider text-white hover:bg-gray-800 transition disabled:opacity-50">
              {loading ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
            </button>
          </form>
        )}
      </div>
      <div className="hidden w-1/2 bg-gray-100 md:block">
        <img src="https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&w=1000&q=80"
          alt="" className="h-full w-full object-cover" />
      </div>
    </div>
  )
}
