import { create } from 'zustand'
import { api } from '../api/apiClient'
import { Category } from '../types/category'

interface CategoryState {
  categories: Category[]
  loading: boolean
  fetch: () => Promise<void>
}

export const useCategoryStore = create<CategoryState>((set) => ({
  categories: [],
  loading: false,

  fetch: async () => {
    try {
      set({ loading: true })
      const data = await api.get<Category[]>('/categories')
      // Chỉ hiển thị category đang active
      const active = Array.isArray(data) ? data.filter(c => c.isActive !== false) : []
      set({ categories: active })
    } catch {
      set({ categories: [] })
    } finally {
      set({ loading: false })
    }
  },
}))
