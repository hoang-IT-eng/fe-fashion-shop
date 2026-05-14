import React, { useEffect, useState } from 'react'
import { api } from '../../api/apiClient'
import { Order, OrderStatus } from '../../types/order'
import { X, Search, ShoppingBag, MapPin, Phone, User, StickyNote, ChevronDown } from 'lucide-react'
import { useToast } from '../../components/Toast'
import ConfirmDialog from '../../components/ConfirmDialog'

const STATUS_OPTIONS: { value: OrderStatus | ''; label: string; color: string; dot: string }[] = [
  { value: '',          label: 'Tất cả',       color: 'bg-gray-100 text-gray-600', dot: 'bg-gray-400' },
  { value: 'pending',   label: 'Chờ xác nhận', color: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200', dot: 'bg-amber-500' },
  { value: 'confirmed', label: 'Đã xác nhận',  color: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200', dot: 'bg-blue-500' },
  { value: 'shipping',  label: 'Đang giao',    color: 'bg-violet-50 text-violet-700 ring-1 ring-violet-200', dot: 'bg-violet-500' },
  { value: 'delivered', label: 'Đã giao',      color: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200', dot: 'bg-emerald-500' },
  { value: 'cancelled', label: 'Đã hủy',       color: 'bg-red-50 text-red-700 ring-1 ring-red-200', dot: 'bg-red-500' },
]

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<number | null>(null)
  const [filterStatus, setFilterStatus] = useState<OrderStatus | ''>('')
  const [search, setSearch] = useState('')
  const [detail, setDetail] = useState<Order | null>(null)
  const [confirmId, setConfirmId] = useState<number | null>(null)
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

  if (loading) return (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-white rounded-2xl animate-pulse border border-gray-100" />)}
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Filter + Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm theo ID, tên, SĐT..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:border-gray-900 focus:ring-1 focus:ring-gray-900 focus:outline-none transition"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {STATUS_OPTIONS.map(s => (
            <button
              key={s.value}
              onClick={() => setFilterStatus(s.value as OrderStatus | '')}
              className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl transition-all duration-200
                ${filterStatus === s.value
                  ? 'bg-gray-900 text-white shadow-lg shadow-gray-900/20'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
                }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${filterStatus === s.value ? 'bg-white' : s.dot}`} />
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm min-w-[750px]">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-400">Mã đơn</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-400">Khách hàng</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-400">Sản phẩm</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-400">Tổng tiền</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-400">Ngày đặt</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-400">Trạng thái</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-400 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center">
                    <ShoppingBag className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm text-gray-400">Không có đơn hàng nào</p>
                  </td>
                </tr>
              ) : filtered.map(order => {
                const s = STATUS_OPTIONS.find(x => x.value === order.status)
                return (
                  <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-gray-900">#{order.id}</td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{order.shippingName || '—'}</p>
                      {order.shippingPhone && (
                        <p className="text-xs text-gray-400 mt-0.5">{order.shippingPhone}</p>
                      )}
                    </td>
                    <td className="px-6 py-4 max-w-[200px]">
                      <div className="space-y-0.5 text-xs text-gray-500">
                        {order.items?.slice(0, 2).map((i, idx) => (
                          <div key={idx} className="truncate">
                            {i.name} ×{i.quantity}
                            {(i.size || i.color) && (
                              <span className="text-gray-400 ml-1">({[i.size, i.color].filter(Boolean).join('/')})</span>
                            )}
                          </div>
                        ))}
                        {(order.items?.length ?? 0) > 2 && (
                          <span className="text-gray-400">+{order.items!.length - 2} sản phẩm khác</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-900">{order.total?.toLocaleString('vi-VN')} đ</td>
                    <td className="px-6 py-4 text-xs text-gray-400">{new Date(order.createdAt).toLocaleDateString('vi-VN')}</td>
                    <td className="px-6 py-4">
                      <div className="relative">
                        <select
                          value={order.status}
                          disabled={updating === order.id}
                          onChange={e => handleStatusChange(order.id, e.target.value as OrderStatus)}
                          className={`appearance-none text-xs font-semibold pl-3 pr-7 py-1.5 rounded-full cursor-pointer border-0 focus:outline-none focus:ring-2 focus:ring-gray-900/10 ${s?.color}`}
                        >
                          {STATUS_OPTIONS.filter(x => x.value).map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none" />
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setDetail(order)}
                          className="px-3 py-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        >
                          Chi tiết
                        </button>
                        <button
                          onClick={() => setConfirmId(order.id)}
                          className="px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg transition"
                        >
                          Hủy
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail modal */}
      {detail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white flex items-center justify-between px-6 py-5 border-b border-gray-100 z-10">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Đơn hàng #{detail.id}</h2>
                <p className="text-xs text-gray-400 mt-0.5">{new Date(detail.createdAt).toLocaleDateString('vi-VN')}</p>
              </div>
              <button onClick={() => setDetail(null)} className="p-2 hover:bg-gray-100 rounded-xl transition">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Shipping info */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">Thông tin giao hàng</p>
                <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                  {[
                    { icon: User, label: 'Người nhận', value: detail.shippingName },
                    { icon: Phone, label: 'Số điện thoại', value: detail.shippingPhone },
                    { icon: MapPin, label: 'Địa chỉ', value: detail.shippingAddress },
                    ...(detail.note ? [{ icon: StickyNote, label: 'Ghi chú', value: detail.note }] : []),
                  ].map(({ icon: Icon, label, value }) => (
                    <div key={label} className="flex items-start gap-3 text-sm">
                      <Icon className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <span className="text-gray-400 text-xs">{label}</span>
                        <p className="font-medium text-gray-900">{value || '—'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Products */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">Sản phẩm</p>
                <div className="space-y-3">
                  {detail.items?.map((item, i) => (
                    <div key={i} className="flex justify-between items-start text-sm">
                      <div>
                        <p className="font-medium text-gray-900">{item.name} × {item.quantity}</p>
                        {(item.size || item.color) && (
                          <p className="text-xs text-gray-400 mt-0.5">
                            {[item.size && `Size: ${item.size}`, item.color && `Màu: ${item.color}`].filter(Boolean).join(' · ')}
                          </p>
                        )}
                      </div>
                      <span className="font-semibold text-gray-900 flex-shrink-0 ml-4">{(item.price * item.quantity).toLocaleString('vi-VN')} đ</span>
                    </div>
                  ))}
                  <div className="flex justify-between font-bold border-t border-gray-200 pt-3 mt-3 text-base">
                    <span>Tổng cộng</span>
                    <span className="text-gray-900">{detail.total?.toLocaleString('vi-VN')} đ</span>
                  </div>
                </div>
              </div>

              {/* Status update */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Cập nhật trạng thái</p>
                <select
                  value={detail.status}
                  disabled={updating === detail.id}
                  onChange={e => handleStatusChange(detail.id, e.target.value as OrderStatus)}
                  className="w-full border border-gray-200 p-3 text-sm rounded-xl focus:border-gray-900 focus:ring-1 focus:ring-gray-900 focus:outline-none transition"
                >
                  {STATUS_OPTIONS.filter(x => x.value).map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={confirmId !== null}
        title="Hủy đơn hàng"
        message="Bạn có chắc muốn hủy đơn hàng này? Hành động này không thể hoàn tác."
        confirmLabel="Hủy đơn"
        onConfirm={() => { if (confirmId) handleDelete(confirmId); setConfirmId(null) }}
        onCancel={() => setConfirmId(null)}
      />
    </div>
  )
}
