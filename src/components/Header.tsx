import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  ShoppingBag,
  Heart,
  Volume2,
  VolumeX,
  User,
  Menu,
  X,
  Search,
  LayoutDashboard,
  LogOut,
  Package,
} from 'lucide-react'
import { EnigmaCrest } from './EnigmaCrest'
import { useAuthStore } from '../store/useAuthStore'
import { useCartStore } from '../store/useCartStore'
import { useWishlistStore } from '../store/useWishlistStore'
import { useSoundStore } from '../store/useSoundStore'

const NAV_ITEMS = [
  { label: 'Drops', path: '/products' },
  { label: 'Live Auctions', path: '/auctions' },
  { label: 'Mystery Vault', path: '/mystery-boxes' },
  { label: 'Concierge', path: '/concierge' },
  { label: 'Reborn Journal', path: '/journal' },
]

export default function Header() {
  const location = useLocation()
  const navigate = useNavigate()
  const { isAuthenticated, user, logout } = useAuthStore()
  const items = useCartStore(s => s.items)
  const openDrawer = useCartStore(s => s.openDrawer)
  const wishlistCount = useWishlistStore(s => s.ids.length)
  const { soundEnabled, toggleSound } = useSoundStore()

  const [mobileOpen, setMobileOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const bagCount = items.reduce((sum, i) => sum + i.quantity, 0)

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const q = searchQuery.trim()
    setSearchOpen(false)
    navigate(q ? `/products?search=${encodeURIComponent(q)}` : '/products')
  }

  // Hide storefront header inside executive /admin workspace for distraction-free density
  if (location.pathname.startsWith('/admin')) {
    return null
  }

  return (
    <header className="sticky top-0 z-50 bg-[#0a0a0a]/92 backdrop-blur-md border-b border-[#f9f9f9]/10 text-[#f9f9f9]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 md:h-20 flex items-center justify-between gap-4">
        {/* Brand Crest */}
        <Link
          id="header-brand-link"
          to="/"
          className="flex items-center gap-3 focus:outline-none"
        >
          <EnigmaCrest className="w-8 h-8 md:w-9 md:h-9" showWordmark subtitle="CULT ARCHIVE" />
        </Link>

        {/* Desktop Nav */}
        <nav aria-label="Main navigation" className="hidden lg:flex items-center gap-7">
          {NAV_ITEMS.map(item => {
            const active =
              location.pathname === item.path ||
              (item.path !== '/' && location.pathname.startsWith(item.path))
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`text-sm transition py-1 border-b ${
                  active
                    ? 'text-[#f9f9f9] border-[#f9f9f9]'
                    : 'text-[#f9f9f9]/65 border-transparent hover:text-[#f9f9f9]'
                }`}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Right Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Diegetic Web Audio Synthesizer Toggle */}
          <button
            id="header-sound-toggle"
            type="button"
            onClick={toggleSound}
            title="Toggle Diegetic Vault Atmosphere & Watch Escapement Audio"
            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 border font-sans text-[10px] font-medium uppercase tracking-[0.14em] transition ${
              soundEnabled
                ? 'border-[#f9f9f9] text-[#f9f9f9] bg-[#f9f9f9]/10'
                : 'border-[#f9f9f9]/15 text-[#a3a3a3] hover:text-[#f9f9f9] hover:border-[#f9f9f9]/35'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{soundEnabled ? 'Sound On' : 'Sound Off'}</span>
          </button>

          {/* Search Toggle */}
          <button
            id="header-search-toggle"
            type="button"
            onClick={() => setSearchOpen(v => !v)}
            aria-label="Search Archive"
            className="p-2 text-[#f9f9f9]/80 hover:text-[#f9f9f9] transition"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Wishlist */}
          <Link
            id="header-wishlist-link"
            to="/wishlist"
            aria-label="Saved Grails Wishlist"
            className="relative p-2 text-[#f9f9f9]/80 hover:text-[#f9f9f9] transition"
          >
            <Heart className="w-4 h-4" />
            {wishlistCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 bg-[#232323] border border-[#f9f9f9]/50 text-[#f9f9f9] font-sans text-[10px] font-medium flex items-center justify-center tabular-nums">
                {wishlistCount}
              </span>
            )}
          </Link>

          {/* Slide-Over Bag */}
          <button
            id="header-bag-button"
            type="button"
            onClick={openDrawer}
            aria-label="Open Vault Bag"
            className="relative p-2 text-[#f9f9f9]/80 hover:text-[#f9f9f9] transition"
          >
            <ShoppingBag className="w-4 h-4" />
            {bagCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 bg-[#f9f9f9] text-[#0a0a0a] font-sans font-semibold text-[10px] flex items-center justify-center tabular-nums">
                {bagCount}
              </span>
            )}
          </button>

          {/* Account / Admin */}
          {isAuthenticated && user ? (
            <div className="relative">
              <button
                id="header-user-menu-btn"
                type="button"
                onClick={() => setUserMenuOpen(v => !v)}
                className="inline-flex items-center gap-2 px-2.5 py-1.5 border border-[#f9f9f9]/15 hover:border-[#f9f9f9]/60 text-xs font-sans font-medium text-[#f9f9f9] transition"
              >
                <User className="w-3.5 h-3.5 text-[#f9f9f9]" />
                <span className="hidden md:inline max-w-[96px] truncate">
                  {user.name.split(' ')[0]}
                </span>
              </button>
              {userMenuOpen && (
                <div
                  onMouseLeave={() => setUserMenuOpen(false)}
                  className="absolute right-0 mt-2 w-56 bg-[#111111] border border-[#f9f9f9]/15 shadow-2xl py-2 z-50"
                >
                  <div className="px-4 py-2 border-b border-[#f9f9f9]/10">
                    <p className="text-xs font-medium text-[#f9f9f9] truncate">{user.name}</p>
                    <p className="text-[11px] text-[#a3a3a3] truncate">{user.email}</p>
                  </div>
                  {user.role === 'admin' && (
                    <Link
                      to="/admin"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 font-sans text-[13px] text-[#f9f9f9] hover:bg-[#232323]"
                    >
                      <LayoutDashboard className="w-3.5 h-3.5" />
                      Grail Admin Desk
                    </Link>
                  )}
                  <Link
                    to="/orders"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 font-sans text-[13px] text-[#f9f9f9] hover:bg-[#232323]"
                  >
                    <Package className="w-3.5 h-3.5 text-[#a3a3a3]" />
                    Orders &amp; Provenance
                  </Link>
                  <Link
                    to="/profile"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 font-sans text-[13px] text-[#f9f9f9] hover:bg-[#232323]"
                  >
                    <User className="w-3.5 h-3.5 text-[#a3a3a3]" />
                    Collector Dossier
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      logout()
                      setUserMenuOpen(false)
                      navigate('/')
                    }}
                    className="w-full text-left flex items-center gap-2.5 px-4 py-2.5 font-sans text-[13px] text-red-300 hover:bg-[#232323]"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              id="header-signin-link"
              to="/auth"
              className="hidden sm:inline-flex items-center px-3.5 py-1.5 border border-[#f9f9f9]/60 text-[#f9f9f9] hover:bg-[#f9f9f9] hover:text-[#0a0a0a] font-sans text-[11px] font-medium uppercase tracking-[0.14em] transition"
            >
              Initiate
            </Link>
          )}

          {/* Mobile Hamburger */}
          <button
            id="header-mobile-menu-btn"
            type="button"
            onClick={() => setMobileOpen(v => !v)}
            aria-label="Toggle Menu"
            className="lg:hidden p-2 text-[#f9f9f9]"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Expandable Search Bar */}
      {searchOpen && (
        <form
          onSubmit={handleSearchSubmit}
          className="border-t border-[#f9f9f9]/10 bg-[#111111] px-4 py-3"
        >
          <div className="max-w-3xl mx-auto flex items-center gap-3">
            <Search className="w-4 h-4 text-[#f9f9f9]" />
            <input
              id="header-search-input"
              type="text"
              autoFocus
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search archive SKU, horsehide bomber, Kuroki denim, titanium..."
              className="flex-1 bg-transparent text-sm text-[#f9f9f9] placeholder-[#a3a3a3] focus:outline-none"
            />
            <button
              type="submit"
              className="px-4 py-1.5 bg-[#f9f9f9] text-[#0a0a0a] font-sans text-[11px] font-semibold uppercase tracking-[0.14em]"
            >
              Decode
            </button>
          </div>
        </form>
      )}

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-[#f9f9f9]/10 bg-[#0a0a0a] px-6 py-6 space-y-4">
          {NAV_ITEMS.map(item => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className="block text-base text-[#f9f9f9]/85 hover:text-[#f9f9f9] py-1.5"
            >
              {item.label}
            </Link>
          ))}
          <div className="pt-4 border-t border-[#f9f9f9]/10 flex items-center gap-3">
            {!isAuthenticated ? (
              <Link
                to="/auth"
                onClick={() => setMobileOpen(false)}
                className="w-full text-center py-2.5 bg-[#f9f9f9] text-[#0a0a0a] font-sans text-xs font-semibold uppercase tracking-[0.14em]"
              >
                Sign In / Initiate
              </Link>
            ) : (
              <Link
                to={user?.role === 'admin' ? '/admin' : '/orders'}
                onClick={() => setMobileOpen(false)}
                className="w-full text-center py-2.5 border border-[#f9f9f9] text-[#f9f9f9] font-sans text-[11px] font-medium uppercase tracking-[0.16em]"
              >
                {user?.role === 'admin' ? 'Open Admin Grail Desk' : 'My Provenance Orders'}
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
