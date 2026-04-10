import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/useAuthStore'

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [loading, setLoading] = useState(false)

  const { login, register } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccessMsg('')
    setLoading(true)

    try {
      if (isLogin) {
        await login(email, password)
        const user = useAuthStore.getState().user
        navigate(user?.role === 'admin' ? '/admin' : '/')
      } else {
        const msg = await register(name, email, password)
        setSuccessMsg(msg)
        setIsLogin(true)
      }
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
          <h1
            className="cursor-pointer text-2xl font-black text-red-600 tracking-tighter"
            onClick={() => navigate('/')}
          >
            THEBASIC
          </h1>
        </div>

        <h2 className="mb-8 text-3xl font-light uppercase tracking-widest text-gray-900">
          {isLogin ? 'Đăng nhập' : 'Tạo tài khoản'}
        </h2>

        {error && (
          <div className="mb-4 rounded bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}
        {successMsg && (
          <div className="mb-4 rounded bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-600">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {!isLogin && (
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-500">
                Họ và tên
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-gray-300 p-3 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black transition"
                required
              />
            </div>
          )}
          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-500">
              Địa chỉ Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 p-3 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black transition"
              required
            />
          </div>
          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-500">
              Mật khẩu
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 p-3 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black transition"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="mt-4 w-full bg-black py-4 text-sm font-bold uppercase tracking-wider text-white hover:bg-gray-800 transition disabled:opacity-50"
          >
            {loading ? 'Đang xử lý...' : isLogin ? 'Đăng nhập' : 'Đăng ký'}
          </button>
        </form>

        <div className="mt-8 border-t border-gray-200 pt-8 text-center">
          <p className="text-sm text-gray-600">
            {isLogin ? 'Bạn chưa có tài khoản?' : 'Đã có tài khoản?'}
          </p>
          <button
            onClick={() => { setIsLogin(!isLogin); setError(''); setSuccessMsg('') }}
            className="mt-2 text-sm font-bold uppercase tracking-wider text-black underline hover:text-gray-600"
          >
            {isLogin ? 'Tạo tài khoản ngay' : 'Đăng nhập tại đây'}
          </button>
        </div>
      </div>

      <div className="hidden w-1/2 bg-gray-100 md:block">
        <img
          src="https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&w=1000&q=80"
          alt="Fashion Lookbook"
          className="h-full w-full object-cover"
        />
      </div>
    </div>
  )
}
