import { create } from 'zustand'
import { api } from '../api/apiClient'
import { Cart, CartItem } from '../types/cart'

interface CartState {
  items: CartItem[]
  loading: boolean
  fetchCart: () => Promise<void>
  addItem: (item: Omit<CartItem, 'id'>) => Promise<void>
  updateItem: (itemId: number, quantity: number) => Promise<void>
  removeItem: (itemId: number) => Promise<void>
  clear: () => void
  total: () => number
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  loading: false,

  fetchCart: async () => {
    try {
      set({ loading: true })
      const data = await api.get<Cart>('/cart')
      set({ items: data.items || [] })
    } catch {
      set({ items: [] })
    } finally {
      set({ loading: false })
    }
  },

  addItem: async (item) => {
    await api.post('/cart', item)
    await get().fetchCart()
  },

  updateItem: async (itemId, quantity) => {
    await api.put(`/cart/${itemId}`, { quantity })
    await get().fetchCart()
  },

  removeItem: async (itemId) => {
    await api.delete(`/cart/${itemId}`)
    set(state => ({ items: state.items.filter(i => i.id !== itemId) }))
  },

  clear: () => set({ items: [] }),

  total: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
}))
