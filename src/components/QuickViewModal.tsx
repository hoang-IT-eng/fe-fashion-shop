import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { X, ShieldCheck, ShoppingBag, ArrowUpRight } from 'lucide-react'
import { Product } from '../types/product'
import { formatVnd } from '../lib/format'
import { useCartStore } from '../store/useCartStore'
import { useToast } from './Toast'
import { ResponsiveImage } from './media/ResponsiveImage'

interface QuickViewModalProps {
  product: Product | null
  onClose: () => void
}

export function QuickViewModal({ product, onClose }: QuickViewModalProps) {
  const addItem = useCartStore(s => s.addItem)
  const { toast } = useToast()

  const sizes = product?.sizes?.length ? product.sizes : ['One Size']
  const colors = product?.colors?.length ? product.colors : ['Obsidian']

  const [selectedSize, setSelectedSize] = useState<string>(sizes[0])
  const [selectedColor, setSelectedColor] = useState<string>(colors[0])
  const [adding, setAdding] = useState(false)

  if (!product) return null

  const activeSize = sizes.includes(selectedSize) ? selectedSize : sizes[0]
  const activeColor = colors.includes(selectedColor) ? selectedColor : colors[0]

  const matchedVariant = product.variants?.find(
    v =>
      (!v.size || v.size === activeSize) &&
      (!v.color || v.color === activeColor)
  )
  const availableStock = matchedVariant ? matchedVariant.stock : product.stock

  const handleAdd = async () => {
    if (availableStock <= 0) return
    try {
      setAdding(true)
      await addItem({
        productId: product.id,
        variantId: matchedVariant?.id,
        name: product.name,
        price: matchedVariant?.priceOverride || product.price,
        quantity: 1,
        size: activeSize,
        color: activeColor,
        imageUrl: product.imageUrl,
      })
      toast(`Reserved "${product.name}" (${activeSize}) in Vault Bag.`, 'success')
      onClose()
    } catch (err: any) {
      toast(err?.message || 'Could not add item to bag.', 'error')
    } finally {
      setAdding(false)
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Quick inspect ${product.name}`}
      className="fixed inset-0 z-[105] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        className="relative w-full max-w-3xl bg-ink-raised border border-bone/15 grid grid-cols-1 md:grid-cols-2 overflow-hidden shadow-2xl"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close Quick Inspect"
          className="absolute top-4 right-4 z-10 w-9 h-9 bg-ink/80 border border-bone/20 flex items-center justify-center text-bone hover:border-bone"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="aspect-[4/5] bg-ink">
          {product.imageUrl && (
            <ResponsiveImage
                  sizes="(min-width: 768px) 40vw, 100vw"
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          )}
        </div>

        <div className="p-6 md:p-8 flex flex-col justify-between gap-6 text-bone">
          <div>
            <p className="font-mono text-[10px] tracking-[0.26em] uppercase text-bone mb-2">
              {product.brand || 'NOCTURNE ATELIER'} · {product.authenticityCode || `NCT-00${product.id}`}
            </p>
            <h2 className="font-display text-2xl md:text-3xl leading-tight mb-3">{product.name}</h2>
            <p className="font-mono text-xl text-bone font-semibold tabular-nums mb-4">
              {formatVnd(matchedVariant?.priceOverride || product.price)}
            </p>
            <p className="text-xs text-bone-muted leading-relaxed line-clamp-3 mb-5">
              {product.description}
            </p>

            {/* Size Selector */}
            <div className="mb-4">
              <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-widest text-bone-muted mb-2">
                <span>Select Size</span>
                <span className="text-bone tabular-nums">{availableStock} IN VAULT</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {sizes.map(sz => (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => setSelectedSize(sz)}
                    className={`px-3.5 py-2 font-mono text-xs border transition ${
                      activeSize === sz
                        ? 'border-bone bg-bone/15 text-bone'
                        : 'border-bone/15 text-bone hover:border-bone/40'
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Selector */}
            {colors.length > 1 && (
              <div>
                <span className="block font-mono text-[10px] uppercase tracking-widest text-bone-muted mb-2">
                  Finish / Colorway
                </span>
                <div className="flex flex-wrap gap-2">
                  {colors.map(cl => (
                    <button
                      key={cl}
                      type="button"
                      onClick={() => setSelectedColor(cl)}
                      className={`px-3 py-1.5 font-mono text-[11px] border transition ${
                        activeColor === cl
                          ? 'border-bone text-bone'
                          : 'border-bone/15 text-bone-muted'
                      }`}
                    >
                      {cl}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-3 pt-4 border-t border-bone/10">
            <button
              type="button"
              disabled={availableStock <= 0 || adding}
              onClick={handleAdd}
              className="w-full py-3.5 bg-bone text-ink font-mono text-xs font-semibold uppercase tracking-[0.24em] hover:bg-bone-dim disabled:opacity-40 transition flex items-center justify-center gap-2"
            >
              <ShoppingBag className="w-4 h-4" />
              {availableStock <= 0 ? 'Vault Exhausted' : adding ? 'Reserving...' : 'Reserve in Vault Bag'}
            </button>

            <div className="flex items-center justify-between text-xs font-mono">
              <span className="inline-flex items-center gap-1.5 text-bone-muted">
                <ShieldCheck className="w-3.5 h-3.5 text-bone" />
                NFC Provenance Verified
              </span>
              <Link
                to={`/products/${product.id}`}
                onClick={onClose}
                className="inline-flex items-center gap-1 text-bone hover:text-bone uppercase tracking-wider"
              >
                Full Dossier <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
