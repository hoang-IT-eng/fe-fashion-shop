import React, { useEffect, useState } from 'react'
import { Plus, Tag, Trash2, KeyRound } from 'lucide-react'
import { api } from '../../api/apiClient'
import { VoucherItem } from '../../types/enigma'
import { formatVnd } from '../../lib/format'
import { useToast } from '../../components/Toast'

export default function AdminVouchersTab() {
  const { toast } = useToast()
  const [vouchers, setVouchers] = useState<VoucherItem[]>([])
  const [code, setCode] = useState('')
  const [description, setDescription] = useState('')
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage')
  const [discountValue, setDiscountValue] = useState(15)
  const [minOrderAmount, setMinOrderAmount] = useState(0)

  const loadVouchers = async () => {
    const res = await api.get<VoucherItem[]>('/vouchers')
    setVouchers(Array.isArray(res) ? res : [])
  }

  useEffect(() => {
    void loadVouchers()
  }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!code.trim()) return
    try {
      await api.post('/vouchers', {
        code: code.trim().toUpperCase(),
        description: description || `${discountValue}% Vault Privilege`,
        discountType,
        discountValue: Number(discountValue),
        minOrderAmount: Number(minOrderAmount),
      })
      setCode('')
      setDescription('')
      await loadVouchers()
      toast('Privilege voucher created.', 'success')
    } catch (err: any) {
      toast(err?.message || 'Failed to create voucher', 'error')
    }
  }

  const handleToggle = async (v: VoucherItem) => {
    await api.put(`/vouchers/${v.id}`, { isActive: !v.isActive })
    await loadVouchers()
  }

  const handleDelete = async (id: number) => {
    await api.delete(`/vouchers/${id}`)
    await loadVouchers()
    toast('Voucher removed.', 'info')
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="font-mono text-[10px] tracking-[0.28em] uppercase text-[#f9f9f9]">
          INITIATION REWARDS &amp; PROMOTIONS
        </p>
        <h2 className="font-display text-2xl md:text-3xl text-[#f9f9f9]">
          Vault Privilege Codes ({vouchers.length})
        </h2>
      </div>

      {/* Create Form */}
      <form
        onSubmit={handleCreate}
        className="p-5 bg-[#111111] border border-[#f9f9f9]/12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3"
      >
        <input
          type="text"
          required
          placeholder="CODE (e.g. ARCHIVE20)"
          value={code}
          onChange={e => setCode(e.target.value)}
          className="bg-[#0a0a0a] border border-[#f9f9f9]/15 px-3 py-2 font-mono text-xs text-[#f9f9f9] uppercase"
        />
        <input
          type="text"
          placeholder="Description"
          value={description}
          onChange={e => setDescription(e.target.value)}
          className="lg:col-span-2 bg-[#0a0a0a] border border-[#f9f9f9]/15 px-3 py-2 text-xs text-[#f9f9f9]"
        />
        <select
          value={discountType}
          onChange={e => setDiscountType(e.target.value as any)}
          className="bg-[#0a0a0a] border border-[#f9f9f9]/15 px-3 py-2 font-mono text-xs text-[#f9f9f9]"
        >
          <option value="percentage">Percentage (%)</option>
          <option value="fixed">Fixed VND</option>
        </select>
        <input
          type="number"
          required
          placeholder="Value"
          value={discountValue}
          onChange={e => setDiscountValue(Number(e.target.value))}
          className="bg-[#0a0a0a] border border-[#f9f9f9]/15 px-3 py-2 font-mono text-xs text-[#f9f9f9] tabular-nums"
        />
        <button
          type="submit"
          className="bg-[#f9f9f9] text-[#0a0a0a] font-mono text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-1.5 py-2"
        >
          <Plus className="w-3.5 h-3.5" /> Mint Code
        </button>
      </form>

      {/* Voucher Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {vouchers.map(v => (
          <div
            key={v.id}
            className={`p-5 bg-[#111111] border space-y-3 ${
              v.isSecretInitiation ? 'border-[#f9f9f9]' : 'border-[#f9f9f9]/12'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 font-mono text-base font-semibold text-[#f9f9f9]">
                {v.isSecretInitiation ? (
                  <KeyRound className="w-4 h-4" />
                ) : (
                  <Tag className="w-4 h-4" />
                )}
                {v.code}
              </span>
              <button
                type="button"
                onClick={() => void handleToggle(v)}
                className={`px-2 py-0.5 font-mono text-[10px] uppercase border ${
                  v.isActive
                    ? 'border-emerald-400/40 text-emerald-300'
                    : 'border-[#f9f9f9]/15 text-[#a3a3a3]'
                }`}
              >
                {v.isActive ? 'Active' : 'Paused'}
              </button>
            </div>

            <p className="text-xs text-[#a3a3a3] leading-relaxed">{v.description}</p>

            <div className="pt-2 border-t border-[#f9f9f9]/10 flex items-center justify-between font-mono text-[11px] text-[#f9f9f9] tabular-nums">
              <span>
                {v.discountType === 'percentage'
                  ? `${v.discountValue}% OFF`
                  : `${formatVnd(v.discountValue)} OFF`}
              </span>
              <span className="text-[#a3a3a3]">
                Used: {v.usedCount}/{v.usageLimit}
              </span>
              {!v.isSecretInitiation && (
                <button
                  type="button"
                  onClick={() => void handleDelete(v.id)}
                  className="text-[#a3a3a3] hover:text-red-400"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
