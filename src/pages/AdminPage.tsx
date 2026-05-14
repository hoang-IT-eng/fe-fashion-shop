import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/useAuthStore'
import { LayoutDashboard, Package, Users, LogOut, ShoppingBag, Menu, X, Tag, ChevronRight } from 'lucide-react'
import AdminDashboardPage from './admin/AdminDashboardPage'
import AdminOrdersPage from './admin/AdminOrdersPage'
import AdminUsersPage from './admin/AdminUsersPage'
import AdminProductsTab from './admin/AdminProductsTab'
import AdminCategoriesTab from './admin/AdminCategoriesTab'

type Tab = 'dashboard' | 'products' | 'orders' | 'users' | 'categories'

const NAV: { key: Tab; label: string; icon: React.ElementType }[] = [
  { key: 'dashboard',  label: 'Tổng quan',  icon: LayoutDashboard },
  { key: 'products',   label: 'Sản phẩm',   icon: Package },
  { key: 'categories', label: 'Danh mục',   icon: Tag },
  { key: 'orders',     label: 'Đơn hàng',   icon: ShoppingBag },
  { key: 'users',      label: 'Khách hàng', icon: Users },
]

export default function AdminPage() {
  const navigate = useNavigate()
  const { logout, user } = useAuthStore()
  const [tab, setTab] = useState<Tab>('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (!user || user.role !== 'admin') navigate('/auth')
  }, [])

  const handleLogout = () => { logout(); navigate('/') }

  const handleTabChange = (key: Tab) => {
    setTab(key)
    setSidebarOpen(false)
  }

  const renderContent = () => {
    switch (tab) {
      case 'dashboard':  return <AdminDashboardPage />
      case 'products':   return <AdminProductsTab />
      case 'categories': return <AdminCategoriesTab />
      case 'orders':     return <AdminOrdersPage />
      case 'users':      return <AdminUsersPage />
    }
  }

  const currentLabel = NAV.find(n => n.key === tab)?.label || ''

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-gray-950">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-white/10 flex-shrink-0">
        <span className="text-lg font-extralight tracking-[0.2em] text-white uppercase">
          The<span className="font-bold">Basic</span>
        </span>
        <span className="ml-2 text-[10px] font-medium text-gray-500 bg-white/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
          Admin
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
        <p className="px-3 mb-3 text-[10px] font-bold uppercase tracking-[0.15em] text-gray-600">
          Menu
        </p>
        {NAV.map(({ key, label, icon: Icon }) => {
          const active = tab === key
          return (
            <button
              key={key}
              onClick={() => handleTabChange(key)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg transition-all duration-200 group
                ${active
                  ? 'bg-white text-gray-900 font-semibold shadow-lg shadow-white/5'
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
            >
              <Icon className={`w-[18px] h-[18px] transition-colors ${active ? 'text-gray-900' : 'text-gray-500 group-hover:text-gray-300'}`} />
              {label}
              {active && <ChevronRight className="w-4 h-4 ml-auto text-gray-400" />}
            </button>
          )
        })}
      </nav>

      {/* User info */}
      <div className="p-4 border-t border-white/10 flex-shrink-0">
        <div className="flex items-center gap-3 mb-4 px-1">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center text-sm font-bold text-white flex-shrink-0 ring-2 ring-white/10">
            {(user?.name?.[0] || user?.email?.[0] || 'A').toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-white truncate">{user?.name || user?.email}</p>
            <p className="text-[11px] text-gray-500">Quản trị viên</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-red-400 hover:bg-white/5 rounded-lg py-2 transition-all duration-200"
        >
          <LogOut className="w-4 h-4" /> Đăng xuất
        </button>
      </div>
    </div>
  )

  return (
    <div className="flex min-h-screen bg-gray-100 font-sans">
      {/* Sidebar desktop */}
      <aside className="w-[260px] flex-col hidden lg:flex fixed inset-y-0 left-0 z-30">
        <SidebarContent />
      </aside>

      {/* Sidebar mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-[260px] flex flex-col z-50 shadow-2xl">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-[260px]">
        {/* Top bar */}
        <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-xl border-b border-gray-200/60">
          <div className="flex items-center justify-between px-4 lg:px-8 h-16">
            <div className="flex items-center gap-4">
              <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-gray-100 transition">
                <Menu className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-lg font-bold text-gray-900">{currentLabel}</h1>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 text-sm text-gray-500">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                Online
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8 overflow-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  )
}
