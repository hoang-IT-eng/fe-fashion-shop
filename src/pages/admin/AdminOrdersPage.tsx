import React, { useEffect, useState } from 'react'
import { api } from '../../api/apiClient'
import { Order, OrderStatus } from '../../types/order'

const STATUS_OPTIONS: { value: OrderStatus; label: string; color: string }[] = [
  { value: 'pending',   label: 'Chờ xác nhận', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'confirmed', label: 'Đã xác nhận',  color: 'bg-blue-100 text-blue-700' },
  { value: 'shipping',  label: 'Đang giao',    color: 'bg-purple-100 text-purple-700' },
  { value: 'delivered', label: 'Đã giao',      color: 'bg-green-100 text-green-700' },
  { value: 'cancelled', label: 'Đã hủy',       color: 'bg-red-100 text-red-700' },
]

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<number | null>(null)

  useEffect(() => {
    api.get<Order[]>('/orders')
      .then(setOrders)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleStatusChange = async (id: number, status: OrderStatus) => {
    setUpdating(id)
    try {
      await api.patch(`/orders/${id}/status`, { status })
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o))
    } catch (err: any) {
      alert(err.message)
    } finally {
      setUpdating(null)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Hủy đơn hàng này?')) return
    try {
      await api.delete(`/orders/${id}`)
      setOrders(prev => prev.filter(o => o.id !== id))
    } catch (err: any) {
      alert(err.message)
    }
  }

  if (loading) return <div className="py-12 text-center text-gray-400">Đang tải...</div>

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Quản lý đơn hàng</h1>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 font-bold">ID</th>
              <th className="px-6 py-4 font-bold">Sản phẩm</th>
              <th className="px-6 py-4 font-bold">Tổng tiền</th>
              <th className="px-6 py-4 font-bold">Ngày đặt</th>
              <th className="px-6 py-4 font-bold">Trạng thái</th>
              <th className="px-6 py-4 font-bold text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {orders.length === 0 ? (
              <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-400">Chưa có đơn hàng nào</td></tr>
            ) : orders.map(order => {
              const s = STATUS_OPTIONS.find(x => x.value === order.status)
              return (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium">#{order.id}</td>
                  <td className="px-6 py-4 text-xs text-gray-500 max-w-[200px]">
                    {order.items?.map(i => `${i.name} ×${i.quantity}`).join(', ')}
                  </td>
                  <td className="px-6 py-4">{order.total?.toLocaleString('vi-VN')} đ</td>
                  <td className="px-6 py-4">{new Date(order.createdAt).toLocaleDateString('vi-VN')}</td>
                  <td className="px-6 py-4">
                    <select
                      value={order.status}
                      disabled={updating === order.id}
                      onChange={e => handleStatusChange(order.id, e.target.value as OrderStatus)}
                      className={`text-xs font-bold px-2 py-1 rounded-sm border-0 cursor-pointer ${s?.color}`}
                    >
                      {STATUS_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => handleDelete(order.id)} className="text-red-600 font-medium hover:underline text-xs">
                      Hủy đơn
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
