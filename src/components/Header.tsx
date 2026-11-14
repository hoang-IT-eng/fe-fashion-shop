import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, User, ShoppingBag, Menu, X } from 'lucide-react'
import { useAuthStore } from '../store/useAuthStore'
import { useCartStore } from '../store/useCartStore'
import { useCategoryStore } from '../store/useCategoryStore'

export default function Header() {
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuthStore()
  const { items } = useCartStore()
  const { categories, fetch: fetchCategories } = useCategoryStore()
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchVal, setSearchVal] = useState('')
  const [scrolled, setScrolled] = useState(false)

  const cartCount = items.reduce((s, i) => s + i.quantity, 0)

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

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
      setMenuOpen(false)
    }
  }

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled ? 'border-b border-line bg-paper/95 backdrop-blur-md' : 'border-b border-transparent bg-paper'
      }`}
    >
      <div className="bg-ink py-2 text-center">
        <p className="text-[10px] font-medium uppercase tracking-[0.28em] text-white/85">
          Miễn phí vận chuyển cho đơn hàng từ 2.000.000đ
        </p>
      </div>

      <div className="tb-container flex items-center justify-between py-4 md:py-5">
        <nav className="hidden flex-1 items-center gap-7 md:flex">
          {NAV.map(item => (
            <button
              key={item.label}
              type="button"
              onClick={() => navigate(item.path)}
              className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ink/70 transition hover:text-ink"
            >
              {item.label}
            </button>
          ))}
        </nav>

        <button type="button" className="md:hidden" aria-label="Menu" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        <button
          type="button"
          className="flex flex-1 items-center justify-center"
          onClick={() => navigate('/')}
        >
          <span className="font-display text-2xl font-medium uppercase tracking-[0.32em] text-ink md:text-[1.65rem]">
            The<span className="font-semibold">Basic</span>
          </span>
        </button>

        <div className="flex flex-1 items-center justify-end gap-4 text-ink/80 md:gap-5">
          <button type="button" aria-label="Search" onClick={() => setSearchOpen(!searchOpen)} className="transition hover:text-ink">
            <Search className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Account"
            onClick={() => navigate(isAuthenticated ? '/profile' : '/auth')}
            className="transition hover:text-ink"
          >
            <User className="h-4 w-4" />
          </button>
          <button type="button" aria-label="Cart" onClick={() => navigate('/cart')} className="relative transition hover:text-ink">
            <ShoppingBag className="h-4 w-4" />
            {cartCount > 0 && (
              <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center bg-ink px-1 text-[9px] font-bold text-white">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {searchOpen && (
        <div className="animate-tb-rise border-t border-line bg-paper px-5 py-4 md:px-10">
          <form onSubmit={handleSearch} className="mx-auto flex max-w-xl gap-2">
            <input
              autoFocus
              type="text"
              value={searchVal}
              onChange={e => setSearchVal(e.target.value)}
              placeholder="Tìm kiếm sản phẩm..."
              className="flex-1 border border-line bg-white px-4 py-3 text-sm outline-none focus:border-ink"
            />
            <button type="submit" className="tb-btn-primary px-6">
              Tìm
            </button>
          </form>
        </div>
      )}

      {menuOpen && (
        <div className="animate-tb-rise border-t border-line bg-paper px-5 py-5 md:hidden">
          <div className="space-y-1">
            {NAV.map(item => (
              <button
                key={item.label}
                type="button"
                onClick={() => {
                  navigate(item.path)
                  setMenuOpen(false)
                }}
                className="block w-full py-3 text-left text-sm font-semibold uppercase tracking-[0.18em] text-ink/80"
              >
                {item.label}
              </button>
            ))}
          </div>
          <div className="mt-4 space-y-2 border-t border-line pt-4 text-sm text-muted">
            <button
              type="button"
              className="block"
              onClick={() => {
                navigate(isAuthenticated ? '/profile' : '/auth')
                setMenuOpen(false)
              }}
            >
              {isAuthenticated ? `Tài khoản (${user?.name || user?.email})` : 'Đăng nhập'}
            </button>
            <button
              type="button"
              className="block"
              onClick={() => {
                navigate('/orders')
                setMenuOpen(false)
              }}
            >
              Đơn hàng của tôi
            </button>
          </div>
        </div>
      )}
    </header>
  )
}
