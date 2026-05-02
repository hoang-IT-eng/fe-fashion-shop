import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/useAuthStore'
import { LayoutDashboard, Package, Users, LogOut, ShoppingBag, Menu, X } from 'lucide-react'
import AdminDashboardPage from './admin/AdminDashboardPage'
import AdminOrdersPage from './admin/AdminOrdersPage'
import AdminUsersPage from './admin/AdminUsersPage'
import AdminProductsTab from './admin/AdminProductsTab'

type Tab = 'dashboard' | 'products' | 'orders' | 'users'

const NAV: { key: Tab; label: string; icon: React.ElementType }[] = [
  { key: 'dashboard', label: 'Tổng quan',  icon: LayoutDashboard },
  { key: 'products',  label: 'Sản phẩm',   icon: Package },
  { key: 'orders',    label: 'Đơn hàng',   icon: ShoppingBag },
  { key: 'users',     label: 'Khách hàng', icon: Users },
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
    setSidebarOpen(false) // đóng sidebar trên mobile khi chọn tab
  }

  const renderContent = () => {
    switch (tab) {
      case 'dashboard': return <AdminDashboardPage />
      case 'products':  return <AdminProductsTab />
      case 'orders':    return <AdminOrdersPage />
      case 'users':     return <AdminUsersPage />
    }
  }

  const SidebarContent = () => (
    <>
      <div className="h-16 flex items-center px-6 border-b border-gray-200 flex-shrink-0">
        <span className="text-lg font-black text-red-600 tracking-tighter">THEBASIC ADMIN</span>
      </div>
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {NAV.map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => handleTabChange(key)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-md transition ${tab === key ? 'font-bold text-red-600 bg-red-50' : 'font-medium text-gray-600 hover:bg-gray-50'}`}>
            <Icon className="w-5 h-5" /> {label}
          </button>
        ))}
      </nav>
      <div className="p-4 border-t border-gray-200 flex-shrink-0">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-600 flex-shrink-0">A</div>
          <div className="text-xs min-w-0">
            <p className="font-bold text-gray-900 truncate">{user?.name || user?.email}</p>
            <p className="text-gray-500">Quản trị viên</p>
          </div>
        </div>
        <button onClick={handleLogout} className="w-full flex items-center gap-2 text-sm text-gray-600 hover:text-red-600 transition">
          <LogOut className="w-4 h-4" /> Đăng xuất
        </button>
      </div>
    </>
  )

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">

      {/* Sidebar desktop */}
      <aside className="w-64 bg-white border-r border-gray-200 flex-col hidden md:flex">
        <SidebarContent />
      </aside>

      {/* Sidebar mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-white flex flex-col z-50">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile topbar */}
        <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
          <button onClick={() => setSidebarOpen(true)}>
            <Menu className="w-5 h-5 text-gray-700" />
          </button>
          <span className="text-sm font-black text-red-600 tracking-tighter">THEBASIC ADMIN</span>
          <button onClick={handleLogout}>
            <LogOut className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <main className="flex-1 p-4 md:p-8 overflow-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  )
}
