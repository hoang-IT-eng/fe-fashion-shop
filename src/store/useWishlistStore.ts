import { create } from 'zustand'

const WISHLIST_KEY = 'enigma_wishlist_ids'

function readIds(): number[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(WISHLIST_KEY)
    return raw ? (JSON.parse(raw) as number[]) : []
  } catch {
    return []
  }
}

function saveIds(ids: number[]): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(WISHLIST_KEY, JSON.stringify(ids))
  } catch {
    // ignore
  }
}

interface WishlistState {
  ids: number[]
  toggle: (productId: number) => boolean
  has: (productId: number) => boolean
  clear: () => void
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
  ids: readIds(),

  toggle: (productId: number) => {
    const current = get().ids
    const exists = current.includes(productId)
    const next = exists ? current.filter(id => id !== productId) : [productId, ...current]
    saveIds(next)
    set({ ids: next })
    return !exists
  },

  has: (productId: number) => get().ids.includes(productId),

  clear: () => {
    saveIds([])
    set({ ids: [] })
  },
}))
