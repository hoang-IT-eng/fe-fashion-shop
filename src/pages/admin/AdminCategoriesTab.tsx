import React, { useEffect, useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { api } from '../../api/apiClient'
import { Category } from '../../types/category'
import { useToast } from '../../components/Toast'

export default function AdminCategoriesTab() {
  const { toast } = useToast()
  const [categories, setCategories] = useState<Category[]>([])
  const [name, setName] = useState('')
  const [imageUrl, setImageUrl] = useState('/images/enigma/grail-hoodie-shadow.jpg')

  const loadCategories = async () => {
    const res = await api.get<Category[]>('/categories/all')
    setCategories(Array.isArray(res) ? res : [])
  }

  useEffect(() => {
    void loadCategories()
  }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    try {
      await api.post('/categories', { name: name.trim(), imageUrl })
      setName('')
      await loadCategories()
      toast('Archive capsule created.', 'success')
    } catch (err: any) {
      toast(err?.message || 'Could not create capsule', 'error')
    }
  }

  const handleToggle = async (id: number) => {
    await api.patch(`/categories/${id}/toggle`, {})
    await loadCategories()
  }

  const handleDelete = async (id: number) => {
    await api.delete(`/categories/${id}`)
    await loadCategories()
    toast('Capsule removed.', 'info')
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="font-mono text-[10px] tracking-[0.28em] uppercase text-[#f9f9f9]">
          TAXONOMY &amp; CAPSULES
        </p>
        <h2 className="font-display text-2xl md:text-3xl text-[#f9f9f9]">
          Archive Categories ({categories.length})
        </h2>
      </div>

      <form
        onSubmit={handleCreate}
        className="p-5 bg-[#111111] border border-[#f9f9f9]/12 grid grid-cols-1 sm:grid-cols-3 gap-3"
      >
        <input
          type="text"
          required
          placeholder="Capsule Name (e.g. Artisanal Leather)"
          value={name}
          onChange={e => setName(e.target.value)}
          className="bg-[#0a0a0a] border border-[#f9f9f9]/15 px-3.5 py-2.5 text-xs text-[#f9f9f9]"
        />
        <input
          type="text"
          placeholder="Image URL"
          value={imageUrl}
          onChange={e => setImageUrl(e.target.value)}
          className="bg-[#0a0a0a] border border-[#f9f9f9]/15 px-3.5 py-2.5 font-mono text-xs text-[#f9f9f9]"
        />
        <button
          type="submit"
          className="bg-[#f9f9f9] text-[#0a0a0a] font-mono text-xs font-semibold uppercase tracking-widest flex items-center justify-center gap-1.5 py-2.5"
        >
          <Plus className="w-3.5 h-3.5" /> Add Capsule
        </button>
      </form>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map(cat => (
          <div
            key={cat.id}
            className="p-4 bg-[#111111] border border-[#f9f9f9]/12 flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3 min-w-0">
              {cat.imageUrl && (
                <img
                  src={cat.imageUrl}
                  alt={cat.name}
                  className="w-12 h-12 object-cover bg-[#0a0a0a] border border-[#f9f9f9]/10"
                />
              )}
              <div className="min-w-0">
                <p className="font-medium text-sm text-[#f9f9f9] truncate">{cat.name}</p>
                <button
                  type="button"
                  onClick={() => void handleToggle(cat.id)}
                  className={`font-mono text-[10px] uppercase ${
                    cat.isActive !== false ? 'text-emerald-300' : 'text-[#a3a3a3]'
                  }`}
                >
                  {cat.isActive !== false ? '● Visible' : '○ Hidden'}
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={() => void handleDelete(cat.id)}
              className="p-2 text-[#a3a3a3] hover:text-red-400"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
