import { create } from 'zustand'
import { api } from '../api/apiClient'
import { CartItem } from '../types/cart'
import { VoucherValidation } from '../types/enigma'

export interface AddItemPayload {
  productId: number
  variantId?: number
  name: string
  price: number
  quantity: number
  size?: string
  color?: string
  imageUrl?: string
}

interface CartState {
  items: CartItem[]
  loading: boolean
  drawerOpen: boolean
  appliedVoucher: VoucherValidation | null
  openDrawer: () => void
  closeDrawer: () => void
  fetchCart: () => Promise<void>
  /** Push a guest bag into the signed-in cart after login, then reload it. */
  mergeGuestBag: () => Promise<void>
  addItem: (item: AddItemPayload, openBag?: boolean) => Promise<void>
  updateItem: (itemId: number, quantity: number) => Promise<void>
  removeItem: (itemId: number) => Promise<void>
  clear: () => void
  applyVoucherCode: (code: string) => Promise<VoucherValidation>
  removeVoucher: () => void
  subtotal: () => number
  discountAmount: () => number
  finalTotal: () => number
  total: () => number
}

const VOUCHER_STORAGE_KEY = 'enigma_active_voucher'
export const GUEST_BAG_STORAGE_KEY = 'nocturne_guest_bag_v1'

/** A visitor is "signed in" only when a session token is stored. */
function hasSession(): boolean {
  if (typeof window === 'undefined') return false
  try {
    return Boolean(window.localStorage.getItem('accessToken'))
  } catch {
    return false
  }
}

function loadGuestBag(): CartItem[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(GUEST_BAG_STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function saveGuestBag(items: CartItem[]): void {
  if (typeof window === 'undefined') return
  try {
    if (items.length) window.localStorage.setItem(GUEST_BAG_STORAGE_KEY, JSON.stringify(items))
    else window.localStorage.removeItem(GUEST_BAG_STORAGE_KEY)
  } catch {
    // storage full or blocked: the bag still lives in memory for this visit
  }
}

function sameLine(a: CartItem, b: AddItemPayload): boolean {
  return (
    a.productId === b.productId &&
    (a.variantId ?? null) === (b.variantId ?? null) &&
    (a.size ?? null) === (b.size ?? null) &&
    (a.color ?? null) === (b.color ?? null)
  )
}

function loadStoredVoucher(): VoucherValidation | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(VOUCHER_STORAGE_KEY)
    return raw ? (JSON.parse(raw) as VoucherValidation) : null
  } catch {
    return null
  }
}

function persistVoucher(v: VoucherValidation | null): void {
  if (typeof window === 'undefined') return
  try {
    if (v) window.localStorage.setItem(VOUCHER_STORAGE_KEY, JSON.stringify(v))
    else window.localStorage.removeItem(VOUCHER_STORAGE_KEY)
  } catch {
    // ignore
  }
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  loading: false,
  drawerOpen: false,
  appliedVoucher: loadStoredVoucher(),

  openDrawer: () => set({ drawerOpen: true }),
  closeDrawer: () => set({ drawerOpen: false }),

  fetchCart: async () => {
    if (!hasSession()) {
      set({ items: loadGuestBag(), loading: false })
      return
    }
    try {
      set({ loading: true })
      const data = await api.get<any>('/cart')
      const raw = Array.isArray(data)
        ? data
        : Array.isArray(data?.items)
          ? data.items
          : Array.isArray(data?.data)
            ? data.data
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

  mergeGuestBag: async () => {
    const guest = loadGuestBag()
    if (!hasSession()) return
    for (const line of guest) {
      try {
        await get().addItem(
          {
            productId: line.productId,
            variantId: line.variantId,
            name: line.name,
            price: line.price,
            quantity: line.quantity,
            size: line.size,
            color: line.color,
            imageUrl: line.imageUrl,
          },
          false,
        )
      } catch {
        // a line that can no longer be added (sold out, removed) is dropped
      }
    }
    saveGuestBag([])
    await get().fetchCart()
  },

  addItem: async (item, openBag = true) => {
    if (!hasSession()) {
      const current = loadGuestBag()
      const existing = current.find(ci => sameLine(ci, item))
      const next = existing
        ? current.map(ci => (ci === existing ? { ...ci, quantity: ci.quantity + item.quantity } : ci))
        : [...current, { ...item, id: Date.now() + Math.floor(Math.random() * 1000) }]
      saveGuestBag(next)
      set({ items: next })
      if (openBag) set({ drawerOpen: true })
      return
    }
    const body: Record<string, unknown> = {
      productId: item.productId,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
    }
    if (item.variantId) body.variantId = item.variantId
    if (item.size) body.size = item.size
    if (item.color) body.color = item.color
    if (item.imageUrl) body.imageUrl = item.imageUrl

    await api.post('/cart', body)
    await get().fetchCart()

    // Preserve client-side imageUrl if live API omits it
    if (item.imageUrl) {
      set(state => ({
        items: state.items.map(ci =>
          ci.productId === item.productId && !ci.imageUrl
            ? { ...ci, imageUrl: item.imageUrl }
            : ci
        ),
      }))
    }
    if (openBag) set({ drawerOpen: true })
  },

  updateItem: async (itemId, quantity) => {
    if (!hasSession()) {
      const next = loadGuestBag()
        .map(ci => (ci.id === itemId ? { ...ci, quantity } : ci))
        .filter(ci => ci.quantity > 0)
      saveGuestBag(next)
      set({ items: next })
      return
    }
    await api.put(`/cart/${itemId}`, { quantity })
    await get().fetchCart()
  },

  removeItem: async (itemId) => {
    if (!hasSession()) {
      const next = loadGuestBag().filter(ci => ci.id !== itemId)
      saveGuestBag(next)
      set({ items: next })
      return
    }
    await api.delete(`/cart/${itemId}`)
    set(state => ({ items: state.items.filter(i => i.id !== itemId) }))
  },

  clear: () => {
    if (hasSession()) void api.delete('/cart').catch(() => {})
    saveGuestBag([])
    persistVoucher(null)
    set({ items: [], appliedVoucher: null })
  },

  applyVoucherCode: async (code: string) => {
    const sub = get().subtotal()
    const validation = await api.post<VoucherValidation>('/vouchers/validate', {
      code: code.trim().toUpperCase(),
      orderAmount: sub > 0 ? sub : 5000000,
    })
    persistVoucher(validation)
    set({ appliedVoucher: validation })
    return validation
  },

  removeVoucher: () => {
    persistVoucher(null)
    set({ appliedVoucher: null })
  },

  subtotal: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),

  discountAmount: () => {
    const sub = get().subtotal()
    const v = get().appliedVoucher
    if (!v || sub <= 0) return 0
    let disc =
      v.discountType === 'percentage'
        ? Math.round((sub * v.discountValue) / 100)
        : Math.round(v.discountValue)
    if (['NOCTURNE15', 'ENIGMA15'].includes(v.code.toUpperCase())) {
      disc = Math.min(disc, 2500000)
    }
    return Math.min(disc, sub)
  },

  finalTotal: () => Math.max(0, get().subtotal() - get().discountAmount()),

  total: () => get().subtotal(),
}))
