import React, { useEffect, useState } from 'react'
import { X, Plus, Trash2 } from 'lucide-react'
import { api } from '../../api/apiClient'
import { Product } from '../../types/product'
import { ProductVariant } from '../../types/variant'
import { formatVnd } from '../../lib/format'
import { useToast } from '../../components/Toast'

interface Props {
  product: Product | null
  onClose: () => void
  onUpdated?: () => void
}

export default function AdminVariantsModal({ product, onClose, onUpdated }: Props) {
  const { toast } = useToast()
  const [variants, setVariants] = useState<ProductVariant[]>([])
  const [size, setSize] = useState('M')
  const [color, setColor] = useState('Obsidian')
  const [stock, setStock] = useState(5)
  const [sku, setSku] = useState('')

  useEffect(() => {
    if (!product) return
    void api.get<ProductVariant[]>(`/products/${product.id}/variants`).then(res => {
      setVariants(Array.isArray(res) ? res : [])
    })
  }, [product])

  if (!product) return null

  const handleAddVariant = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const created = await api.post<ProductVariant>(`/products/${product.id}/variants`, {
        size,
        color,
        stock: Number(stock),
        sku: sku.trim() || undefined,
      })
      setVariants(prev => [...prev, created])
      setSku('')
      onUpdated?.()
      toast(`Added SKU variant ${created.sku || size}.`, 'success')
    } catch (err: any) {
      toast(err?.message || 'Could not add variant', 'error')
    }
  }

  const handleStockChange = async (variantId: number, nextStock: number) => {
    try {
      const updated = await api.put<ProductVariant>(
        `/products/${product.id}/variants/${variantId}`,
        { stock: Math.max(0, nextStock) }
      )
      setVariants(prev => prev.map(v => (v.id === variantId ? updated : v)))
      onUpdated?.()
    } catch (err: any) {
      toast(err?.message || 'Stock update failed', 'error')
    }
  }

  const handleDelete = async (variantId: number) => {
    try {
      await api.delete(`/products/${product.id}/variants/${variantId}`)
      setVariants(prev => prev.filter(v => v.id !== variantId))
      onUpdated?.()
      toast('SKU variant removed.', 'info')
    } catch (err: any) {
      toast(err?.message || 'Remove failed', 'error')
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[115] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        className="w-full max-w-2xl bg-ink-raised border border-bone/50 p-6 md:p-8 space-y-6 text-bone"
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="font-mono text-[10px] tracking-[0.26em] uppercase text-bone">
              SKU VARIANT MATRIX MANAGER
            </p>
            <h3 className="font-display text-2xl mt-1">{product.name}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-bone-muted hover:text-bone"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Multi-variant Grid */}
        <div className="max-h-64 overflow-y-auto border border-bone/10 divide-y divide-bone/10 bg-ink">
          {variants.length === 0 ? (
            <div className="p-6 text-center font-mono text-xs text-bone-muted">
              NO VARIANTS CONFIGURED YET
            </div>
          ) : (
            variants.map(v => (
              <div
                key={v.id}
                className="px-4 py-3 flex items-center justify-between gap-4 font-mono text-xs"
              >
                <div className="min-w-0">
                  <span className="text-bone">{v.sku || `SKU-${v.id}`}</span>
                  <span className="text-bone ml-3">
                    Size {v.size || 'OS'} · {v.color || 'Obsidian'}
                  </span>
                  <span className="text-bone-muted ml-3 tabular-nums">
                    {formatVnd(v.priceOverride || product.price)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={0}
                    value={v.stock}
                    onChange={e => void handleStockChange(v.id, Number(e.target.value))}
                    className="w-20 bg-ink-raised border border-bone/20 px-2.5 py-1 text-right tabular-nums text-bone"
                  />
                  <button
                    type="button"
                    onClick={() => void handleDelete(v.id)}
                    className="p-1.5 text-bone-muted hover:text-red-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Add Variant Row */}
        <form onSubmit={handleAddVariant} className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          <input
            type="text"
            required
            placeholder="Size (e.g. 42)"
            value={size}
            onChange={e => setSize(e.target.value)}
            className="bg-ink border border-bone/15 px-3 py-2 font-mono text-xs text-bone"
          />
          <input
            type="text"
            required
            placeholder="Colorway"
            value={color}
            onChange={e => setColor(e.target.value)}
            className="bg-ink border border-bone/15 px-3 py-2 font-mono text-xs text-bone"
          />
          <input
            type="number"
            min={0}
            required
            placeholder="Stock"
            value={stock}
            onChange={e => setStock(Number(e.target.value))}
            className="bg-ink border border-bone/15 px-3 py-2 font-mono text-xs text-bone tabular-nums"
          />
          <input
            type="text"
            placeholder="SKU Code"
            value={sku}
            onChange={e => setSku(e.target.value)}
            className="bg-ink border border-bone/15 px-3 py-2 font-mono text-xs text-bone"
          />
          <button
            type="submit"
            className="bg-bone text-ink font-mono text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-1 py-2"
          >
            <Plus className="w-3.5 h-3.5" /> Add SKU
          </button>
        </form>
      </div>
    </div>
  )
}
