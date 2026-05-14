import { create } from 'zustand'
import { api } from '../api/apiClient'
import { CartItem } from '../types/cart'

interface AddItemPayload {
  productId: number
  variantId?: number
  name: string
  price: number
  quantity: number
  size?: string
  color?: string
}

interface CartState {
  items: CartItem[]
  loading: boolean
  fetchCart: () => Promise<void>
  addItem: (item: AddItemPayload) => Promise<void>
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
      const data = await api.get<any>('/cart')
      const raw = Array.isArray(data) ? data
        : Array.isArray(data?.items) ? data.items
        : Array.isArray(data?.data) ? data.data
        : []
      const items: CartItem[] = raw.map((i: any) => ({
        ...i,
        price: Number(i.price),
      }))
      set({ items })
    } catch {
      set({ items: [] })
    } finally {
      set({ loading: false })
    }
  },

  addItem: async (item) => {
    const body: Record<string, unknown> = {
      productId: item.productId,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
    }
    // Chỉ gửi variant fields nếu có
    if (item.variantId) body.variantId = item.variantId
    if (item.size) body.size = item.size
    if (item.color) body.color = item.color

    await api.post('/cart', body)
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
