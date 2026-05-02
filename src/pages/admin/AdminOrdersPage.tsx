import React, { useEffect, useState } from 'react'
import { api } from '../../api/apiClient'
import { Order, OrderStatus } from '../../types/order'
import { X } from 'lucide-react'
import { useToast } from '../../components/Toast'

const STATUS_OPTIONS: { value: OrderStatus | ''; label: string; color: string }[] = [
  { value: '',          label: 'Tất cả',       color: 'bg-gray-100 text-gray-600' },
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
  const [filterStatus, setFilterStatus] = useState<OrderStatus | ''>('')
  const [search, setSearch] = useState('')
  const [detail, setDetail] = useState<Order | null>(null)
  const { toast } = useToast()

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
      if (detail?.id === id) setDetail(prev => prev ? { ...prev, status } : prev)
      toast('Cập nhật trạng thái thành công')
    } catch (err: any) {
      toast(err.message, 'error')
    } finally {
      setUpdating(null)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Hủy đơn hàng này?')) return
    try {
      await api.delete(`/orders/${id}`)
      setOrders(prev => prev.filter(o => o.id !== id))
      if (detail?.id === id) setDetail(null)
      toast('Đã hủy đơn hàng')
    } catch (err: any) {
      toast(err.message, 'error')
    }
  }

  const filtered = orders.filter(o => {
    const matchStatus = !filterStatus || o.status === filterStatus
    const matchSearch = !search || String(o.id).includes(search)
      || o.shippingName?.toLowerCase().includes(search.toLowerCase())
      || o.shippingPhone?.includes(search)
    return matchStatus && matchSearch
  })

  if (loading) return <div className="py-12 text-center text-gray-400">Đang tải...</div>

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Quản lý đơn hàng</h1>

      {/* Filter + Search */}
      <div className="flex flex-wrap gap-3 mb-6">
        <input
          type="text"
          placeholder="Tìm theo ID, tên, SĐT..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none w-56"
        />
        <div className="flex gap-2 flex-wrap">
          {STATUS_OPTIONS.map(s => (
            <button key={s.value} onClick={() => setFilterStatus(s.value as OrderStatus | '')}
              className={`px-3 py-1.5 text-xs font-bold rounded-sm transition ${filterStatus === s.value ? 'bg-black text-white' : `${s.color} hover:opacity-80`}`}>
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-600 min-w-[700px]">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500 border-b border-gray-200">
            <tr>
              <th className="px-4 py-4 font-bold">ID</th>
              <th className="px-4 py-4 font-bold">Khách hàng</th>
              <th className="px-4 py-4 font-bold">Sản phẩm</th>
              <th className="px-4 py-4 font-bold">Tổng tiền</th>
              <th className="px-4 py-4 font-bold">Ngày đặt</th>
              <th className="px-4 py-4 font-bold">Trạng thái</th>
              <th className="px-4 py-4 font-bold text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length === 0 ? (
              <tr><td colSpan={7} className="px-6 py-8 text-center text-gray-400">Không có đơn hàng nào</td></tr>
            ) : filtered.map(order => {
              const s = STATUS_OPTIONS.find(x => x.value === order.status)
              return (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4 font-medium">#{order.id}</td>
                  <td className="px-4 py-4">
                    <p className="font-medium text-gray-900">{order.shippingName || '—'}</p>
                    <p className="text-xs text-gray-400">{order.shippingPhone || ''}</p>
                  </td>
                  <td className="px-4 py-4 text-xs text-gray-500 max-w-[180px] truncate">
                    {order.items?.map(i => `${i.name} ×${i.quantity}`).join(', ')}
                  </td>
                  <td className="px-4 py-4 font-medium">{order.total?.toLocaleString('vi-VN')} đ</td>
                  <td className="px-4 py-4 text-xs">{new Date(order.createdAt).toLocaleDateString('vi-VN')}</td>
                  <td className="px-4 py-4">
                    <select value={order.status} disabled={updating === order.id}
                      onChange={e => handleStatusChange(order.id, e.target.value as OrderStatus)}
                      className={`text-xs font-bold px-2 py-1 rounded-sm border-0 cursor-pointer ${s?.color}`}>
                      {STATUS_OPTIONS.filter(x => x.value).map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-4 text-right space-x-3">
                    <button onClick={() => setDetail(order)} className="text-blue-600 font-medium hover:underline text-xs">Chi tiết</button>
                    <button onClick={() => handleDelete(order.id)} className="text-red-600 font-medium hover:underline text-xs">Hủy</button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Modal chi tiết đơn hàng */}
      {detail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white w-full max-w-lg rounded-lg shadow-xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold">Chi tiết đơn #{detail.id}</h2>
              <button onClick={() => setDetail(null)}><X className="w-5 h-5" /></button>
            </div>

            {/* Thông tin giao hàng */}
            <div className="mb-5">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">Thông tin giao hàng</p>
              <div className="bg-gray-50 rounded p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Người nhận</span>
                  <span className="font-medium">{detail.shippingName || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Số điện thoại</span>
                  <span className="font-medium">{detail.shippingPhone || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Địa chỉ</span>
                  <span className="font-medium text-right max-w-[60%]">{detail.shippingAddress || '—'}</span>
                </div>
                {detail.note && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Ghi chú</span>
                    <span className="font-medium text-right max-w-[60%]">{detail.note}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Sản phẩm */}
            <div className="mb-5">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">Sản phẩm</p>
              <div className="space-y-2">
                {detail.items?.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-gray-700">{item.name} × {item.quantity}</span>
                    <span className="font-medium">{(item.price * item.quantity).toLocaleString('vi-VN')} đ</span>
                  </div>
                ))}
                <div className="flex justify-between font-bold border-t border-gray-100 pt-2 mt-2">
                  <span>Tổng cộng</span>
                  <span>{detail.total?.toLocaleString('vi-VN')} đ</span>
                </div>
              </div>
            </div>

            {/* Cập nhật trạng thái */}
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Cập nhật trạng thái</p>
              <select value={detail.status} disabled={updating === detail.id}
                onChange={e => handleStatusChange(detail.id, e.target.value as OrderStatus)}
                className="w-full border border-gray-300 p-2.5 text-sm focus:border-black focus:outline-none">
                {STATUS_OPTIONS.filter(x => x.value).map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
