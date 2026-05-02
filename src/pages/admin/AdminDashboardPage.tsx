import React, { useEffect, useState } from 'react'
import { api } from '../../api/apiClient'
import { ShoppingBag, Users, Package, TrendingUp } from 'lucide-react'
import { Order, OrderStatus } from '../../types/order'

interface Stats {
  totalRevenue: number
  totalOrders: number
  totalProducts: number
  totalUsers: number
}

const STATUS_LABEL: Record<OrderStatus, { label: string; color: string }> = {
  pending:   { label: 'Chờ xác nhận', color: 'bg-yellow-100 text-yellow-700' },
  confirmed: { label: 'Đã xác nhận',  color: 'bg-blue-100 text-blue-700' },
  shipping:  { label: 'Đang giao',    color: 'bg-purple-100 text-purple-700' },
  delivered: { label: 'Đã giao',      color: 'bg-green-100 text-green-700' },
  cancelled: { label: 'Đã hủy',       color: 'bg-red-100 text-red-700' },
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get<Stats>('/dashboard/stats'),
      api.get<Order[]>('/orders'),
    ]).then(([s, o]) => {
      setStats(s)
      // Lấy 5 đơn hàng gần nhất
      setOrders([...o].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5))
    }).catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const cards = [
    { label: 'Doanh thu', value: stats ? `${stats.totalRevenue?.toLocaleString('vi-VN')} đ` : '—', icon: TrendingUp, color: 'bg-green-50 text-green-600' },
    { label: 'Đơn hàng',  value: stats?.totalOrders  ?? '—', icon: ShoppingBag, color: 'bg-blue-50 text-blue-600' },
    { label: 'Sản phẩm',  value: stats?.totalProducts ?? '—', icon: Package,    color: 'bg-purple-50 text-purple-600' },
    { label: 'Khách hàng',value: stats?.totalUsers    ?? '—', icon: Users,      color: 'bg-orange-50 text-orange-600' },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Tổng quan</h1>

      {/* Stats cards */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-gray-100 rounded-lg animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {cards.map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-white border border-gray-200 rounded-lg p-6">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-4 ${color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              <p className="text-sm text-gray-500 mt-1">{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Đơn hàng gần đây */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-700">Đơn hàng gần đây</h2>
          <span className="text-xs text-gray-400">5 đơn mới nhất</span>
        </div>
        {loading ? (
          <div className="p-6 space-y-3">
            {[...Array(5)].map((_, i) => <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />)}
          </div>
        ) : orders.length === 0 ? (
          <p className="px-6 py-8 text-center text-gray-400 text-sm">Chưa có đơn hàng nào</p>
        ) : (
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500 border-b border-gray-100">
              <tr>
                <th className="px-6 py-3 font-bold">ID</th>
                <th className="px-6 py-3 font-bold">Khách hàng</th>
                <th className="px-6 py-3 font-bold">Tổng tiền</th>
                <th className="px-6 py-3 font-bold">Ngày đặt</th>
                <th className="px-6 py-3 font-bold">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {orders.map(o => {
                const s = STATUS_LABEL[o.status]
                return (
                  <tr key={o.id} className="hover:bg-gray-50">
                    <td className="px-6 py-3 font-medium">#{o.id}</td>
                    <td className="px-6 py-3">{o.shippingName || '—'}</td>
                    <td className="px-6 py-3 font-medium">{o.total?.toLocaleString('vi-VN')} đ</td>
                    <td className="px-6 py-3 text-xs text-gray-400">{new Date(o.createdAt).toLocaleDateString('vi-VN')}</td>
                    <td className="px-6 py-3">
                      <span className={`px-2 py-1 text-xs font-bold rounded-sm ${s?.color}`}>{s?.label}</span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
