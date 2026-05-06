import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Search, User, ShoppingCart, Menu, X } from 'lucide-react'
import { useAuthStore } from '../store/useAuthStore'
import { useCartStore } from '../store/useCartStore'
import { useCategoryStore } from '../store/useCategoryStore'

export default function Header() {
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated, user } = useAuthStore()
  const { items } = useCartStore()
  const { categories, fetch: fetchCategories } = useCategoryStore()
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchVal, setSearchVal] = useState('')

  const cartCount = items.reduce((s, i) => s + i.quantity, 0)

  useEffect(() => {
    fetchCategories()
  }, [])

  // Fallback nếu API chưa có data
  const NAV = categories.length > 0
    ? [{ label: 'Tất cả', path: '/products' }, ...categories.map(c => ({ label: c.name, path: `/products?category=${c.slug}` }))]
    : [
        { label: 'Bộ sưu tập', path: '/products' },
        { label: 'Đồ Nam', path: '/products?category=nam' },
        { label: 'Đồ Nữ', path: '/products?category=nu' },
        { label: 'Phụ kiện', path: '/products?category=phu-kien' },
      ]

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchVal.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchVal.trim())}`)
      setSearchOpen(false)
      setSearchVal('')
    }
  }

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm">
      {/* Thanh thông báo */}
      <div className="bg-[#f5f5f5] py-2 text-center border-b border-gray-100">
        <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-gray-600">
          Miễn phí vận chuyển cho đơn hàng từ 2.000.000đ
        </p>
      </div>

      <div className="flex items-center justify-between px-6 md:px-12 py-4">
        {/* Left nav — desktop */}
        <nav className="hidden md:flex gap-8 items-center flex-1">
          {NAV.map(item => (
            <a key={item.label} href={item.path}
              className="text-xs font-semibold uppercase tracking-widest text-gray-700 hover:text-black transition">
              {item.label}
            </a>
          ))}
        </nav>

        {/* Mobile menu button */}
        <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        {/* Logo */}
        <div className="flex items-center justify-center cursor-pointer flex-1" onClick={() => navigate('/')}>
          <h1 className="text-2xl font-extralight tracking-[0.35em] uppercase text-gray-950">
            The<span className="font-semibold">Basic</span>
          </h1>
        </div>

        {/* Right icons */}
        <div className="flex items-center gap-5 text-gray-700 flex-1 justify-end">
          <button onClick={() => setSearchOpen(!searchOpen)} className="hover:text-black transition">
            <Search className="h-4 w-4" />
          </button>
          <button onClick={() => navigate(isAuthenticated ? '/profile' : '/auth')} className="hover:text-black transition">
            <User className="h-4 w-4" />
          </button>
          <button onClick={() => navigate('/cart')} className="relative hover:text-black transition">
            <ShoppingCart className="h-4 w-4" />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-black text-[9px] font-bold text-white">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Search bar dropdown */}
      {searchOpen && (
        <div className="border-t border-gray-100 px-6 py-3 bg-white">
          <form onSubmit={handleSearch} className="flex gap-2 max-w-lg mx-auto">
            <input autoFocus type="text" value={searchVal} onChange={e => setSearchVal(e.target.value)}
              placeholder="Tìm kiếm sản phẩm..."
              className="flex-1 border border-gray-300 px-4 py-2 text-sm focus:border-black focus:outline-none" />
            <button type="submit" className="bg-black text-white px-4 py-2 text-sm font-bold hover:bg-gray-800 transition">
              Tìm
            </button>
          </form>
        </div>
      )}

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-6 py-4 space-y-3">
          {NAV.map(item => (
            <a key={item.label} href={item.path}
              onClick={() => setMenuOpen(false)}
              className="block text-sm font-semibold uppercase tracking-widest text-gray-700 hover:text-black py-2">
              {item.label}
            </a>
          ))}
          <div className="border-t border-gray-100 pt-3 space-y-2">
            <button onClick={() => { navigate(isAuthenticated ? '/profile' : '/auth'); setMenuOpen(false) }}
              className="block text-sm text-gray-600 hover:text-black py-1">
              {isAuthenticated ? `Tài khoản (${user?.name || user?.email})` : 'Đăng nhập'}
            </button>
            <button onClick={() => { navigate('/orders'); setMenuOpen(false) }}
              className="block text-sm text-gray-600 hover:text-black py-1">
              Đơn hàng của tôi
            </button>
          </div>
        </div>
      )}
    </header>
  )
}
