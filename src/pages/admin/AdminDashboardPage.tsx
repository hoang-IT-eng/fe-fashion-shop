import React, { useEffect, useState } from 'react'
import { api } from '../../api/apiClient'
import { ShoppingBag, Users, Package, TrendingUp, ArrowUpRight, Clock } from 'lucide-react'
import { Order, OrderStatus } from '../../types/order'

interface Stats {
  totalRevenue: number
  totalOrders: number
  totalProducts: number
  totalUsers: number
}

const STATUS_LABEL: Record<OrderStatus, { label: string; color: string; dot: string }> = {
  pending:   { label: 'Chờ xác nhận', color: 'bg-amber-50 text-amber-700 ring-amber-200', dot: 'bg-amber-500' },
  confirmed: { label: 'Đã xác nhận',  color: 'bg-blue-50 text-blue-700 ring-blue-200', dot: 'bg-blue-500' },
  shipping:  { label: 'Đang giao',    color: 'bg-violet-50 text-violet-700 ring-violet-200', dot: 'bg-violet-500' },
  delivered: { label: 'Đã giao',      color: 'bg-emerald-50 text-emerald-700 ring-emerald-200', dot: 'bg-emerald-500' },
  cancelled: { label: 'Đã hủy',       color: 'bg-red-50 text-red-700 ring-red-200', dot: 'bg-red-500' },
}

const STAT_CARDS = [
  { key: 'totalRevenue',  label: 'Doanh thu',  icon: TrendingUp, gradient: 'from-emerald-500 to-emerald-600', bg: 'bg-emerald-50' },
  { key: 'totalOrders',   label: 'Đơn hàng',   icon: ShoppingBag, gradient: 'from-blue-500 to-blue-600', bg: 'bg-blue-50' },
  { key: 'totalProducts', label: 'Sản phẩm',   icon: Package,     gradient: 'from-violet-500 to-violet-600', bg: 'bg-violet-50' },
  { key: 'totalUsers',    label: 'Khách hàng',  icon: Users,       gradient: 'from-amber-500 to-amber-600', bg: 'bg-amber-50' },
] as const

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get<Stats>('/dashboard/stats'),
      api.get<Order[]>('/dashboard/latest-orders'),
    ]).then(([s, o]) => {
      setStats(s)
      setOrders(o)
    }).catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const formatValue = (key: string, value: number) => {
    if (key === 'totalRevenue') return `${value?.toLocaleString('vi-VN')} đ`
    return value?.toLocaleString('vi-VN') ?? '0'
  }

  return (
    <div className="space-y-8">
      {/* Stats cards */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-white rounded-2xl animate-pulse border border-gray-100" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          {STAT_CARDS.map(({ key, label, icon: Icon, gradient, bg }) => (
            <div
              key={key}
              className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg hover:shadow-gray-200/50 transition-all duration-300 group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg shadow-${gradient.split('-')[1]}-500/25`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div className={`p-1.5 rounded-lg ${bg} opacity-0 group-hover:opacity-100 transition-opacity`}>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900 mb-1">
                {formatValue(key, stats?.[key as keyof Stats] ?? 0)}
              </p>
              <p className="text-sm text-gray-500">{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Recent orders */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gray-900 flex items-center justify-center">
              <Clock className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900">Đơn hàng gần đây</h2>
              <p className="text-xs text-gray-400 mt-0.5">Đơn mới nhất từ hệ thống</p>
            </div>
          </div>
        </div>
        {loading ? (
          <div className="p-6 space-y-3">
            {[...Array(3)].map((_, i) => <div key={i} className="h-12 bg-gray-50 rounded-xl animate-pulse" />)}
          </div>
        ) : orders.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <ShoppingBag className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-400">Chưa có đơn hàng nào</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-gray-400">Mã đơn</th>
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-gray-400">Khách hàng</th>
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-gray-400">Tổng tiền</th>
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-gray-400">Ngày đặt</th>
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-gray-400">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {orders.map(o => {
                  const s = STATUS_LABEL[o.status]
                  return (
                    <tr key={o.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-semibold text-gray-900">#{o.id}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">
                            {(o.shippingName?.[0] || '?').toUpperCase()}
                          </div>
                          <span className="text-gray-700">{o.shippingName || '—'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-semibold text-gray-900">{o.total?.toLocaleString('vi-VN')} đ</td>
                      <td className="px-6 py-4 text-gray-400 text-xs">{new Date(o.createdAt).toLocaleDateString('vi-VN')}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full ring-1 ${s?.color}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${s?.dot}`} />
                          {s?.label}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
