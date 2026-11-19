import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  BarChart3,
  Package,
  Gavel,
  Crosshair,
  Tag,
  ShoppingCart,
  FolderTree,
  Users,
  Search,
  ArrowUpRight,
  Command,
  KeyRound,
} from 'lucide-react'
import { api } from '../api/apiClient'
import { ExecutiveDashboardStats } from '../types/enigma'
import { formatVnd } from '../lib/format'
import { useAuthStore } from '../store/useAuthStore'
import { NocturneMark } from '../components/brand/NocturneMark'
import AdminDashboardPage from './admin/AdminDashboardPage'
import AdminProductsTab from './admin/AdminProductsTab'
import AdminAuctionsTab from './admin/AdminAuctionsTab'
import AdminConciergeTab from './admin/AdminConciergeTab'
import AdminVouchersTab from './admin/AdminVouchersTab'
import AdminOrdersPage from './admin/AdminOrdersPage'
import AdminCategoriesTab from './admin/AdminCategoriesTab'
import AdminUsersPage from './admin/AdminUsersPage'

type AdminTabId =
  | 'analytics'
  | 'products'
  | 'auctions'
  | 'concierge'
  | 'vouchers'
  | 'orders'
  | 'categories'
  | 'users'

const ADMIN_TABS: { id: AdminTabId; label: string; shortcut: string; icon: React.FC<{ className?: string }> }[] = [
  { id: 'analytics', label: 'Executive Analytics', shortcut: 'G A', icon: BarChart3 },
  { id: 'products', label: 'Products & SKU Matrix', shortcut: 'G P', icon: Package },
  { id: 'auctions', label: 'Live Auctions Monitor', shortcut: 'G L', icon: Gavel },
  { id: 'concierge', label: 'Codex & Concierge Desk', shortcut: 'G C', icon: Crosshair },
  { id: 'vouchers', label: 'Vouchers & NOCTURNE15', shortcut: 'G V', icon: Tag },
  { id: 'orders', label: 'Orders Pipeline', shortcut: 'G O', icon: ShoppingCart },
  { id: 'categories', label: 'Archive Capsules', shortcut: 'G T', icon: FolderTree },
  { id: 'users', label: 'Collectors & Roles', shortcut: 'G U', icon: Users },
]

export default function AdminPage() {
  const { isAuthenticated, user, login } = useAuthStore()
  const [activeTab, setActiveTab] = useState<AdminTabId>('analytics')
  const [kpi, setKpi] = useState<ExecutiveDashboardStats | null>(null)
  const [cmdOpen, setCmdOpen] = useState(false)
  const [cmdQuery, setCmdQuery] = useState('')

  useEffect(() => {
    void api.get<ExecutiveDashboardStats>('/dashboard/executive').then(setKpi).catch(() => {})
  }, [activeTab])

  // Cmd/Ctrl+K Quick Filter Command Palette
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setCmdOpen(v => !v)
      } else if (e.key === 'Escape') {
        setCmdOpen(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // Allow instant 1-click Curator authorization if someone visits /admin directly without signing in
  if (!isAuthenticated || user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-ink text-bone flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-ink-raised border border-bone/50 p-8 text-center space-y-6">
          <NocturneMark className="w-12 h-12 mx-auto" />
          <div>
            <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-bone">
              RESTRICTED CURATOR CONSOLE
            </p>
            <h1 className="font-display text-3xl mt-1">Executive Grail Desk</h1>
            <p className="text-xs text-bone-muted mt-2 leading-relaxed">
              Curator clearance is required to access GMV telemetry, SKU matrices, live auction
              controls, and sourcing mandates.
            </p>
          </div>
          <button
            id="instant-admin-unlock-btn"
            type="button"
            onClick={() => void login('admin@fashionshop.com', 'Admin@123')}
            className="w-full py-3.5 bg-bone text-ink font-mono text-xs font-semibold uppercase tracking-[0.22em] hover:bg-bone-dim transition inline-flex items-center justify-center gap-2"
          >
            <KeyRound className="w-4 h-4" /> Authenticate Demo Curator (Admin@123)
          </button>
          <Link
            to="/"
            className="inline-block font-mono text-xs uppercase tracking-widest text-bone-muted hover:text-bone"
          >
            ← Return to Storefront
          </Link>
        </div>
      </div>
    )
  }

  const filteredCommands = ADMIN_TABS.filter(t =>
    t.label.toLowerCase().includes(cmdQuery.trim().toLowerCase())
  )

  return (
    <div className="min-h-screen bg-ink text-bone flex flex-col lg:flex-row">
      {/* Left High-Density Studio Sidebar */}
      <aside className="lg:w-64 bg-ink-raised border-b lg:border-b-0 lg:border-r border-bone/10 flex flex-col justify-between flex-shrink-0">
        <div>
          <div className="p-5 border-b border-bone/10 flex items-center justify-between">
            <NocturneMark className="w-7 h-7" showWordmark subtitle="GRAIL DESK" />
          </div>

          <div className="p-3">
            <button
              id="admin-cmdk-btn"
              type="button"
              onClick={() => setCmdOpen(true)}
              className="w-full px-3 py-2 bg-ink-raised border border-bone/15 hover:border-bone/60 flex items-center justify-between font-mono text-xs text-bone-muted transition"
            >
              <span className="inline-flex items-center gap-2">
                <Search className="w-3.5 h-3.5 text-bone" /> Quick Jump...
              </span>
              <span className="px-1.5 py-0.5 bg-ink border border-bone/15 text-[10px]">
                ⌘K
              </span>
            </button>
          </div>

          <nav aria-label="Admin sections" className="px-3 pb-4 space-y-1">
            {ADMIN_TABS.map(tab => {
              const Icon = tab.icon
              const active = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 font-mono text-xs transition border-l-2 ${
                    active
                      ? 'border-bone bg-ink-raised text-bone'
                      : 'border-transparent text-bone-muted hover:text-bone hover:bg-ink-raised/50'
                  }`}
                >
                  <span className="inline-flex items-center gap-2.5 truncate">
                    <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="truncate">{tab.label}</span>
                  </span>
                </button>
              )
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-bone/10 space-y-2">
          <div className="font-mono text-[10px] text-bone-muted truncate">
            CURATOR: <span className="text-bone">{user.name}</span>
          </div>
          <Link
            to="/"
            className="w-full py-2 px-3 border border-bone/15 hover:border-bone font-mono text-[10px] uppercase tracking-widest text-bone flex items-center justify-between"
          >
            <span>Live Storefront</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-bone" />
          </Link>
        </div>
      </aside>

      {/* Main Executive Workspace */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top Tabular-Nums KPI Strip */}
        <header className="bg-ink-raised border-b border-bone/10 px-6 py-4">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <h1 className="font-display text-2xl md:text-3xl text-bone">
              NOCTURNE Executive Commerce &amp; Grail Desk
            </h1>
            <span className="font-mono text-[10px] tracking-[0.24em] uppercase text-bone">
              STUDIO TELEMETRY · LIVE SYNC
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 font-mono">
            <div className="p-3 bg-ink-raised border border-bone/10">
              <span className="block text-[9px] uppercase tracking-widest text-bone-muted">
                GROSS GMV
              </span>
              <span className="text-sm md:text-base font-semibold text-bone tabular-nums">
                {formatVnd(kpi?.totalRevenue || 0)}
              </span>
            </div>
            <div className="p-3 bg-ink-raised border border-bone/10">
              <span className="block text-[9px] uppercase tracking-widest text-bone-muted">
                AVG ORDER VALUE
              </span>
              <span className="text-sm md:text-base font-semibold text-bone tabular-nums">
                {formatVnd(kpi?.averageOrderValue || 0)}
              </span>
            </div>
            <div className="p-3 bg-ink-raised border border-bone/10">
              <span className="block text-[9px] uppercase tracking-widest text-bone-muted">
                LIVE GRAIL LOTS
              </span>
              <span className="text-sm md:text-base font-semibold text-bone tabular-nums">
                {kpi?.auctionHeat.liveCount ?? 3} ACTIVE
              </span>
            </div>
            <div className="p-3 bg-ink-raised border border-bone/10">
              <span className="block text-[9px] uppercase tracking-widest text-bone-muted">
                CONCIERGE QUEUE
              </span>
              <span className="text-sm md:text-base font-semibold text-bone tabular-nums">
                {kpi?.pendingConciergeCount ?? 2} OPEN
              </span>
            </div>
            <div className="p-3 bg-ink-raised border border-bone/10 col-span-2 sm:col-span-1">
              <span className="block text-[9px] uppercase tracking-widest text-bone-muted">
                LOW-STOCK SKUS
              </span>
              <span className="text-sm md:text-base font-semibold text-bone tabular-nums">
                {kpi?.lowStockSkus.length ?? 0} ALERTS
              </span>
            </div>
          </div>
        </header>

        {/* Active Desk View */}
        <div className="p-6 md:p-8 flex-1">
          {activeTab === 'analytics' && <AdminDashboardPage />}
          {activeTab === 'products' && <AdminProductsTab />}
          {activeTab === 'auctions' && <AdminAuctionsTab />}
          {activeTab === 'concierge' && <AdminConciergeTab />}
          {activeTab === 'vouchers' && <AdminVouchersTab />}
          {activeTab === 'orders' && <AdminOrdersPage />}
          {activeTab === 'categories' && <AdminCategoriesTab />}
          {activeTab === 'users' && <AdminUsersPage />}
        </div>
      </div>

      {/* Cmd/Ctrl+K Command Palette Modal */}
      {cmdOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[125] flex items-start justify-center pt-24 p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setCmdOpen(false)}
        >
          <div
            onClick={e => e.stopPropagation()}
            className="w-full max-w-lg bg-ink-raised border border-bone/60 shadow-2xl overflow-hidden"
          >
            <div className="p-3.5 border-b border-bone/10 flex items-center gap-3">
              <Command className="w-4 h-4 text-bone" />
              <input
                type="text"
                autoFocus
                value={cmdQuery}
                onChange={e => setCmdQuery(e.target.value)}
                placeholder="Jump to Analytics, SKU Matrix, Auctions, Concierge, Vouchers..."
                className="flex-1 bg-transparent font-mono text-xs text-bone placeholder-bone-muted focus:outline-none"
              />
            </div>
            <div className="divide-y divide-bone/10 max-h-72 overflow-y-auto">
              {filteredCommands.map(cmd => {
                const Icon = cmd.icon
                return (
                  <button
                    key={cmd.id}
                    type="button"
                    onClick={() => {
                      setActiveTab(cmd.id)
                      setCmdOpen(false)
                      setCmdQuery('')
                    }}
                    className="w-full px-4 py-3 flex items-center justify-between hover:bg-umber-line font-mono text-xs text-bone"
                  >
                    <span className="inline-flex items-center gap-2.5">
                      <Icon className="w-3.5 h-3.5 text-bone" />
                      {cmd.label}
                    </span>
                    <span className="text-[10px] text-bone-muted">{cmd.shortcut}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
