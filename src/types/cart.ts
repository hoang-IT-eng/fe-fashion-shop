export interface CartItem {
  id: number
  productId: number
  variantId?: number
  name: string
  price: number
  quantity: number
  size?: string
  color?: string
  imageUrl?: string  // chỉ dùng ở FE để hiển thị, không gửi lên BE
}

export interface Cart {
  items: CartItem[]
  total: number
}
