import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(email);
    navigate(email.includes('admin') ? '/admin' : '/');
  };

  return (
    <div className="flex min-h-screen bg-white font-sans">
      {/* Cột trái: Form */}
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
        
        <form onSubmit={handleSubmit} className="space-y-6">
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
              className="w-full border border-gray-300 p-3 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black transition"
              required
            />
          </div>
          <button
            type="submit"
            className="mt-4 w-full bg-black py-4 text-sm font-bold uppercase tracking-wider text-white hover:bg-gray-800 transition"
          >
            {isLogin ? 'Đăng nhập' : 'Đăng ký'}
          </button>
        </form>

        <div className="mt-8 border-t border-gray-200 pt-8 text-center">
          <p className="text-sm text-gray-600">
            {isLogin ? 'Bạn chưa có tài khoản?' : 'Đã có tài khoản?'}
          </p>
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="mt-2 text-sm font-bold uppercase tracking-wider text-black underline hover:text-gray-600"
          >
            {isLogin ? 'Tạo tài khoản ngay' : 'Đăng nhập tại đây'}
          </button>
        </div>
      </div>

      {/* Cột phải: Lookbook Image (Ẩn trên mobile) */}
      <div className="hidden w-1/2 bg-gray-100 md:block">
        <img 
          src="https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&w=1000&q=80" 
          alt="Fashion Lookbook" 
          className="h-full w-full object-cover"
        />
      </div>
    </div>
  );
}