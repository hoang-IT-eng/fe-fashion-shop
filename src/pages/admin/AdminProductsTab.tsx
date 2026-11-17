import React, { useEffect, useState } from 'react'
import { Plus, Edit3, Layers, Trash2, X } from 'lucide-react'
import { api } from '../../api/apiClient'
import { Product } from '../../types/product'
import { formatVnd } from '../../lib/format'
import AdminVariantsModal from './AdminVariantsModal'
import { useToast } from '../../components/Toast'

export default function AdminProductsTab() {
  const { toast } = useToast()
  const [products, setProducts] = useState<Product[]>([])
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)
  const [variantProduct, setVariantProduct] = useState<Product | null>(null)

  // Form fields
  const [name, setName] = useState('')
  const [brand, setBrand] = useState('ENIGMA ATELIER')
  const [releaseType, setReleaseType] = useState<'grail' | 'reborn' | 'archive' | 'drop'>('grail')
  const [condition, setCondition] = useState('Deadstock · Vault Sealed')
  const [category, setCategory] = useState('Outerwear')
  const [price, setPrice] = useState(9500000)
  const [stock, setStock] = useState(12)
  const [imageUrl, setImageUrl] = useState('/images/enigma/grail-leather-bomber.jpg')
  const [sizesText, setSizesText] = useState('S, M, L, XL')
  const [colorsText, setColorsText] = useState('Obsidian')
  const [description, setDescription] = useState('')

  const loadProducts = async () => {
    const res = await api.get<{ data: Product[] }>('/products?limit=60&includeInactive=true')
    setProducts(Array.isArray(res?.data) ? res.data : [])
  }

  useEffect(() => {
    void loadProducts()
  }, [])

  const openCreate = () => {
    setEditing(null)
    setName('')
    setBrand('ENIGMA ATELIER')
    setReleaseType('grail')
    setCondition('Deadstock · Vault Sealed')
    setCategory('Outerwear')
    setPrice(9500000)
    setStock(12)
    setImageUrl('/images/enigma/grail-leather-bomber.jpg')
    setSizesText('S, M, L, XL')
    setColorsText('Obsidian')
    setDescription('')
    setDrawerOpen(true)
  }

  const openEdit = (p: Product) => {
    setEditing(p)
    setName(p.name)
    setBrand(p.brand || 'ENIGMA ATELIER')
    setReleaseType(
      (p.releaseType as 'grail' | 'reborn' | 'archive' | 'drop') || 'drop'
    )
    setCondition(p.condition || 'Deadstock')
    setCategory(p.category || 'Outerwear')
    setPrice(Number(p.price))
    setStock(p.stock)
    setImageUrl(p.imageUrl || '/images/enigma/grail-leather-bomber.jpg')
    setSizesText((p.sizes || []).join(', '))
    setColorsText((p.colors || []).join(', '))
    setDescription(p.description || '')
    setDrawerOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    const payload = {
      name,
      brand,
      releaseType,
      condition,
      category,
      price: Number(price),
      stock: Number(stock),
      imageUrl,
      sizes: sizesText
        .split(',')
        .map(s => s.trim())
        .filter(Boolean),
      colors: colorsText
        .split(',')
        .map(s => s.trim())
        .filter(Boolean),
      description,
    }
    try {
      if (editing) {
        await api.put(`/products/${editing.id}`, payload)
        toast(`Updated "${name}".`, 'success')
      } else {
        await api.post('/products', payload)
        toast(`Cataloged "${name}" into ENIGMA Vault.`, 'success')
      }
      setDrawerOpen(false)
      await loadProducts()
    } catch (err: any) {
      toast(err?.message || 'Save failed', 'error')
    }
  }

  const handleDelete = async (p: Product) => {
    try {
      await api.delete(`/products/${p.id}`)
      toast(`Removed "${p.name}".`, 'info')
      await loadProducts()
    } catch (err: any) {
      toast(err?.message || 'Delete failed', 'error')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="font-mono text-[10px] tracking-[0.28em] uppercase text-[#cfa156]">
            ARCHIVE CATALOG &amp; SKU MATRIX
          </p>
          <h2 className="font-display text-2xl md:text-3xl text-[#ece5d8]">
            Authenticated Pieces ({products.length})
          </h2>
        </div>
        <button
          id="admin-new-product-btn"
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#cfa156] text-[#070709] font-mono text-xs font-semibold uppercase tracking-[0.2em]"
        >
          <Plus className="w-4 h-4" /> New Archive Piece
        </button>
      </div>

      {/* High-Density Product Table */}
      <div className="bg-[#111115] border border-[#ece5d8]/12 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#ece5d8]/10 font-mono text-[10px] uppercase tracking-[0.22em] text-[#9a948a]">
              <th className="py-3.5 px-4">Piece</th>
              <th className="py-3.5 px-4">Tier / House</th>
              <th className="py-3.5 px-4">Price</th>
              <th className="py-3.5 px-4">SKU Variants</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#ece5d8]/10 text-xs">
            {products.map(p => (
              <tr key={p.id} className="hover:bg-[#1c1d24]/40 transition">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={p.imageUrl || '/images/enigma/grail-sneaker-obsidian.jpg'}
                      alt={p.name}
                      className="w-11 h-14 object-cover bg-[#070709] border border-[#ece5d8]/10"
                    />
                    <div>
                      <p className="font-medium text-[#ece5d8]">{p.name}</p>
                      <p className="font-mono text-[10px] text-[#9a948a]">
                        {p.authenticityCode || `ENG-00${p.id}`} · {p.category}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4 font-mono">
                  <span className="px-2 py-0.5 bg-[#070709] border border-[#cfa156]/40 text-[#cfa156] text-[10px] uppercase">
                    {p.releaseType || 'drop'}
                  </span>
                  <span className="block text-[10px] text-[#9a948a] mt-1">{p.brand}</span>
                </td>
                <td className="py-3 px-4 font-mono text-[#ece5d8] tabular-nums">
                  {formatVnd(p.price)}
                </td>
                <td className="py-3 px-4 font-mono">
                  <button
                    type="button"
                    onClick={() => setVariantProduct(p)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#070709] border border-[#ece5d8]/15 hover:border-[#cfa156] text-[#ece5d8] tabular-nums"
                  >
                    <Layers className="w-3 h-3 text-[#cfa156]" />
                    {(p.variants || []).length} SKUs · {p.stock}u
                  </button>
                </td>
                <td className="py-3 px-4 text-right space-x-2">
                  <button
                    type="button"
                    onClick={() => openEdit(p)}
                    className="p-2 border border-[#ece5d8]/15 hover:border-[#cfa156] text-[#ece5d8]"
                    title="Edit Piece"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleDelete(p)}
                    className="p-2 border border-[#ece5d8]/15 hover:border-red-400 text-[#9a948a] hover:text-red-300"
                    title="Delete Piece"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Slide-Over Drawer Editor */}
      {drawerOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[110] flex justify-end bg-black/75 backdrop-blur-sm"
          onClick={() => setDrawerOpen(false)}
        >
          <form
            onClick={e => e.stopPropagation()}
            onSubmit={handleSave}
            className="w-full max-w-lg bg-[#111115] border-l border-[#cfa156]/40 h-full overflow-y-auto p-6 md:p-8 space-y-5 text-[#ece5d8]"
          >
            <div className="flex items-center justify-between pb-4 border-b border-[#ece5d8]/10">
              <h3 className="font-display text-2xl">
                {editing ? 'Edit Archive Dossier' : 'Catalog New Archive Piece'}
              </h3>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="text-[#9a948a] hover:text-[#ece5d8]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {imageUrl && (
              <img
                src={imageUrl}
                alt="Preview"
                className="w-full h-48 object-cover border border-[#ece5d8]/15 bg-[#070709]"
              />
            )}

            <div>
              <label className="block font-mono text-[10px] uppercase tracking-widest text-[#9a948a] mb-1">
                Title
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full bg-[#070709] border border-[#ece5d8]/15 px-3 py-2 text-xs text-[#ece5d8]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-mono text-[10px] uppercase tracking-widest text-[#9a948a] mb-1">
                  Atelier / Brand
                </label>
                <input
                  type="text"
                  value={brand}
                  onChange={e => setBrand(e.target.value)}
                  className="w-full bg-[#070709] border border-[#ece5d8]/15 px-3 py-2 text-xs text-[#ece5d8]"
                />
              </div>
              <div>
                <label className="block font-mono text-[10px] uppercase tracking-widest text-[#9a948a] mb-1">
                  Release Tier
                </label>
                <select
                  value={releaseType}
                  onChange={e => setReleaseType(e.target.value as any)}
                  className="w-full bg-[#070709] border border-[#ece5d8]/15 px-3 py-2 font-mono text-xs text-[#ece5d8]"
                >
                  <option value="grail">Grail Allocation</option>
                  <option value="reborn">Reborn 1-of-12</option>
                  <option value="archive">Vault Archive</option>
                  <option value="drop">Limited Drop</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-mono text-[10px] uppercase tracking-widest text-[#9a948a] mb-1">
                  Price (VND)
                </label>
                <input
                  type="number"
                  required
                  value={price}
                  onChange={e => setPrice(Number(e.target.value))}
                  className="w-full bg-[#070709] border border-[#ece5d8]/15 px-3 py-2 font-mono text-xs text-[#ece5d8] tabular-nums"
                />
              </div>
              <div>
                <label className="block font-mono text-[10px] uppercase tracking-widest text-[#9a948a] mb-1">
                  Category
                </label>
                <input
                  type="text"
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full bg-[#070709] border border-[#ece5d8]/15 px-3 py-2 text-xs text-[#ece5d8]"
                />
              </div>
            </div>

            <div>
              <label className="block font-mono text-[10px] uppercase tracking-widest text-[#9a948a] mb-1">
                Image URL
              </label>
              <input
                type="text"
                value={imageUrl}
                onChange={e => setImageUrl(e.target.value)}
                className="w-full bg-[#070709] border border-[#ece5d8]/15 px-3 py-2 font-mono text-xs text-[#ece5d8]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-mono text-[10px] uppercase tracking-widest text-[#9a948a] mb-1">
                  Sizes (comma-separated)
                </label>
                <input
                  type="text"
                  value={sizesText}
                  onChange={e => setSizesText(e.target.value)}
                  className="w-full bg-[#070709] border border-[#ece5d8]/15 px-3 py-2 font-mono text-xs text-[#ece5d8]"
                />
              </div>
              <div>
                <label className="block font-mono text-[10px] uppercase tracking-widest text-[#9a948a] mb-1">
                  Colorways
                </label>
                <input
                  type="text"
                  value={colorsText}
                  onChange={e => setColorsText(e.target.value)}
                  className="w-full bg-[#070709] border border-[#ece5d8]/15 px-3 py-2 font-mono text-xs text-[#ece5d8]"
                />
              </div>
            </div>

            <div>
              <label className="block font-mono text-[10px] uppercase tracking-widest text-[#9a948a] mb-1">
                Provenance Description
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full bg-[#070709] border border-[#ece5d8]/15 p-3 text-xs text-[#ece5d8]"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-[#cfa156] text-[#070709] font-mono text-xs font-semibold uppercase tracking-[0.22em]"
            >
              {editing ? 'Save Changes' : 'Publish Archive Piece'}
            </button>
          </form>
        </div>
      )}

      <AdminVariantsModal
        product={variantProduct}
        onClose={() => setVariantProduct(null)}
        onUpdated={() => void loadProducts()}
      />
    </div>
  )
}
