import React, { useEffect, useState } from 'react'
import { api } from '../../api/apiClient'
import { ShoppingBag, Users, Package, TrendingUp } from 'lucide-react'

interface Stats {
  totalRevenue: number
  totalOrders: number
  totalProducts: number
  totalUsers: number
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get<Stats>('/dashboard/stats')
      .then(setStats)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const cards = [
    { label: 'Doanh thu', value: stats ? `${stats.totalRevenue?.toLocaleString('vi-VN')} đ` : '—', icon: TrendingUp, color: 'bg-green-50 text-green-600' },
    { label: 'Đơn hàng', value: stats?.totalOrders ?? '—', icon: ShoppingBag, color: 'bg-blue-50 text-blue-600' },
    { label: 'Sản phẩm', value: stats?.totalProducts ?? '—', icon: Package, color: 'bg-purple-50 text-purple-600' },
    { label: 'Khách hàng', value: stats?.totalUsers ?? '—', icon: Users, color: 'bg-orange-50 text-orange-600' },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Tổng quan</h1>
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-gray-100 rounded-lg animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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
    </div>
  )
}
