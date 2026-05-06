import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { api } from '../../api/apiClient'

export default function VerifyEmailPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!token) { setStatus('error'); setMessage('Link xác thực không hợp lệ.'); return }

    api.get<{ message: string }>(`/auth/verify-email?token=${token}`)
      .then(data => { setStatus('success'); setMessage(data.message || 'Xác thực email thành công!') })
      .catch(err => { setStatus('error'); setMessage(err.message || 'Link đã hết hạn hoặc không hợp lệ.') })
  }, [token])

  return (
    <div className="flex min-h-screen bg-white font-sans items-center justify-center">
      <div className="text-center max-w-md px-6">
        <h1 className="cursor-pointer text-2xl font-black text-red-600 tracking-tighter mb-12"
          onClick={() => navigate('/')}>THEBASIC</h1>

        {status === 'loading' && (
          <div className="space-y-4">
            <div className="w-14 h-14 border-4 border-gray-200 border-t-black rounded-full animate-spin mx-auto" />
            <p className="text-gray-500 text-sm">Đang xác thực email...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <span className="text-green-600 text-3xl">✓</span>
            </div>
            <h2 className="text-2xl font-light uppercase tracking-widest">Xác thực thành công</h2>
            <p className="text-gray-500 text-sm">{message}</p>
            <button onClick={() => navigate('/auth')}
              className="w-full bg-black py-4 text-sm font-bold uppercase tracking-wider text-white hover:bg-gray-800 transition">
              Đăng nhập ngay
            </button>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <span className="text-red-600 text-3xl">✕</span>
            </div>
            <h2 className="text-2xl font-light uppercase tracking-widest">Xác thực thất bại</h2>
            <p className="text-gray-500 text-sm">{message}</p>
            <button onClick={() => navigate('/auth')}
              className="w-full bg-black py-4 text-sm font-bold uppercase tracking-wider text-white hover:bg-gray-800 transition">
              Quay lại đăng nhập
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
