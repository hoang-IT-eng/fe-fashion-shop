import React from 'react'
import { useNavigate } from 'react-router-dom'

export default function NotFoundPage() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen bg-white font-sans flex flex-col items-center justify-center text-center px-6">
      <h1 className="text-[120px] font-extralight text-gray-100 leading-none select-none">404</h1>
      <h2 className="text-2xl font-light uppercase tracking-widest text-gray-900 -mt-4 mb-4">
        Trang không tồn tại
      </h2>
      <p className="text-sm text-gray-400 mb-10 max-w-sm">
        Trang bạn đang tìm kiếm có thể đã bị xóa, đổi tên hoặc tạm thời không khả dụng.
      </p>
      <div className="flex gap-4">
        <button onClick={() => navigate(-1)}
          className="border border-gray-300 px-8 py-3 text-sm font-bold uppercase tracking-wider hover:border-black transition">
          Quay lại
        </button>
        <button onClick={() => navigate('/')}
          className="bg-black text-white px-8 py-3 text-sm font-bold uppercase tracking-wider hover:bg-gray-800 transition">
          Về trang chủ
        </button>
      </div>
    </div>
  )
}
