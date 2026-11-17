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
  ShieldCheck,
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
    <header className="sticky top-0 z-50 bg-[#070709]/92 backdrop-blur-md border-b border-[#ece5d8]/10 text-[#ece5d8]">
      {/* Subtle archival provenance top bar */}
      <div className="border-b border-[#ece5d8]/[0.06] bg-[#0b0b0f] px-4 py-1.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between font-mono text-[10px] tracking-[0.26em] uppercase text-[#9a948a]">
          <span className="inline-flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-[#cfa156]" />
            NFC AUTHENTICATED STREETWEAR · GRAIL AUCTIONS · 1-OF-1 REBORN ATELIER
          </span>
          <span className="hidden md:inline text-[#ece5d8]/60">
            ANTI-SNIPE +120S ACTIVE · WORLDWIDE VAULT DISPATCH
          </span>
        </div>
      </div>

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
                className={`font-mono text-xs uppercase tracking-[0.22em] transition py-1 border-b ${
                  active
                    ? 'text-[#cfa156] border-[#cfa156]'
                    : 'text-[#ece5d8]/80 border-transparent hover:text-[#ece5d8]'
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
            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 border font-mono text-[10px] uppercase tracking-[0.2em] transition ${
              soundEnabled
                ? 'border-[#cfa156] text-[#cfa156] bg-[#cfa156]/10'
                : 'border-[#ece5d8]/15 text-[#9a948a] hover:text-[#ece5d8] hover:border-[#ece5d8]/35'
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
            className="p-2 text-[#ece5d8]/80 hover:text-[#cfa156] transition"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Wishlist */}
          <Link
            id="header-wishlist-link"
            to="/wishlist"
            aria-label="Saved Grails Wishlist"
            className="relative p-2 text-[#ece5d8]/80 hover:text-[#cfa156] transition"
          >
            <Heart className="w-4 h-4" />
            {wishlistCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 bg-[#1c1d24] border border-[#cfa156]/50 text-[#cfa156] font-mono text-[10px] flex items-center justify-center tabular-nums">
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
            className="relative p-2 text-[#ece5d8]/80 hover:text-[#cfa156] transition"
          >
            <ShoppingBag className="w-4 h-4" />
            {bagCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 bg-[#cfa156] text-[#070709] font-mono font-semibold text-[10px] flex items-center justify-center tabular-nums">
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
                className="inline-flex items-center gap-2 px-2.5 py-1.5 border border-[#ece5d8]/15 hover:border-[#cfa156]/60 text-xs font-mono uppercase tracking-wider text-[#ece5d8] transition"
              >
                <User className="w-3.5 h-3.5 text-[#cfa156]" />
                <span className="hidden md:inline max-w-[96px] truncate">
                  {user.name.split(' ')[0]}
                </span>
              </button>
              {userMenuOpen && (
                <div
                  onMouseLeave={() => setUserMenuOpen(false)}
                  className="absolute right-0 mt-2 w-56 bg-[#111115] border border-[#ece5d8]/15 shadow-2xl py-2 z-50"
                >
                  <div className="px-4 py-2 border-b border-[#ece5d8]/10">
                    <p className="text-xs font-medium text-[#ece5d8] truncate">{user.name}</p>
                    <p className="font-mono text-[10px] text-[#9a948a] truncate">{user.email}</p>
                  </div>
                  {user.role === 'admin' && (
                    <Link
                      to="/admin"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 font-mono text-xs uppercase tracking-wider text-[#cfa156] hover:bg-[#1c1d24]"
                    >
                      <LayoutDashboard className="w-3.5 h-3.5" />
                      Grail Admin Desk
                    </Link>
                  )}
                  <Link
                    to="/orders"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 font-mono text-xs uppercase tracking-wider text-[#ece5d8] hover:bg-[#1c1d24]"
                  >
                    <Package className="w-3.5 h-3.5 text-[#9a948a]" />
                    Orders &amp; Provenance
                  </Link>
                  <Link
                    to="/profile"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 font-mono text-xs uppercase tracking-wider text-[#ece5d8] hover:bg-[#1c1d24]"
                  >
                    <User className="w-3.5 h-3.5 text-[#9a948a]" />
                    Collector Dossier
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      logout()
                      setUserMenuOpen(false)
                      navigate('/')
                    }}
                    className="w-full text-left flex items-center gap-2.5 px-4 py-2.5 font-mono text-xs uppercase tracking-wider text-red-300 hover:bg-[#1c1d24]"
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
              className="hidden sm:inline-flex items-center px-3.5 py-1.5 border border-[#cfa156]/60 text-[#cfa156] hover:bg-[#cfa156] hover:text-[#070709] font-mono text-[11px] uppercase tracking-[0.22em] transition"
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
            className="lg:hidden p-2 text-[#ece5d8]"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Expandable Search Bar */}
      {searchOpen && (
        <form
          onSubmit={handleSearchSubmit}
          className="border-t border-[#ece5d8]/10 bg-[#111115] px-4 py-3"
        >
          <div className="max-w-3xl mx-auto flex items-center gap-3">
            <Search className="w-4 h-4 text-[#cfa156]" />
            <input
              id="header-search-input"
              type="text"
              autoFocus
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search archive SKU, horsehide bomber, Kuroki denim, titanium..."
              className="flex-1 bg-transparent text-sm text-[#ece5d8] placeholder-[#9a948a] focus:outline-none"
            />
            <button
              type="submit"
              className="px-4 py-1.5 bg-[#cfa156] text-[#070709] font-mono text-[11px] font-semibold uppercase tracking-widest"
            >
              Decode
            </button>
          </div>
        </form>
      )}

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-[#ece5d8]/10 bg-[#070709] px-6 py-6 space-y-4">
          {NAV_ITEMS.map(item => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className="block font-mono text-xs uppercase tracking-[0.24em] text-[#ece5d8] hover:text-[#cfa156] py-1.5"
            >
              {item.label}
            </Link>
          ))}
          <div className="pt-4 border-t border-[#ece5d8]/10 flex items-center gap-3">
            {!isAuthenticated ? (
              <Link
                to="/auth"
                onClick={() => setMobileOpen(false)}
                className="w-full text-center py-2.5 bg-[#cfa156] text-[#070709] font-mono text-xs font-semibold uppercase tracking-widest"
              >
                Sign In / Initiate
              </Link>
            ) : (
              <Link
                to={user?.role === 'admin' ? '/admin' : '/orders'}
                onClick={() => setMobileOpen(false)}
                className="w-full text-center py-2.5 border border-[#cfa156] text-[#cfa156] font-mono text-xs uppercase tracking-widest"
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
