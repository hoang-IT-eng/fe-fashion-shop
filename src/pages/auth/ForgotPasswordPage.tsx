import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../api/apiClient'

export default function ForgotPasswordPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')
    try {
      const data = await api.post<{ message: string }>('/auth/forgot-password', { email })
      setSuccess(data.message || 'Email đặt lại mật khẩu đã được gửi. Vui lòng kiểm tra hộp thư.')
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

        <h2 className="mb-3 text-3xl font-light uppercase tracking-widest text-gray-900">Quên mật khẩu</h2>
        <p className="text-sm text-gray-500 mb-8">Nhập email của bạn, chúng tôi sẽ gửi link đặt lại mật khẩu.</p>

        {success ? (
          <div className="space-y-6">
            <div className="rounded bg-green-50 border border-green-200 px-4 py-4 text-sm text-green-700">
              {success}
            </div>
            <button onClick={() => navigate('/auth')}
              className="w-full bg-black py-4 text-sm font-bold uppercase tracking-wider text-white hover:bg-gray-800 transition">
              Quay lại đăng nhập
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-500">Địa chỉ Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full border border-gray-300 p-3 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black transition"
              />
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <button type="submit" disabled={loading}
              className="w-full bg-black py-4 text-sm font-bold uppercase tracking-wider text-white hover:bg-gray-800 transition disabled:opacity-50">
              {loading ? 'Đang gửi...' : 'Gửi link đặt lại mật khẩu'}
            </button>

            <button type="button" onClick={() => navigate('/auth')}
              className="w-full text-sm text-gray-500 hover:text-black transition underline">
              Quay lại đăng nhập
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
