export interface CartItem {
  id: number
  productId: number
  name: string
  price: number
  quantity: number
  imageUrl?: string
}

export interface Cart {
  items: CartItem[]
  total: number
}
