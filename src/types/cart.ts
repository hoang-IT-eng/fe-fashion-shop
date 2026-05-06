export interface CartItem {
  id: number
  productId: number
  name: string
  price: number
  quantity: number
  imageUrl?: string  // chỉ dùng ở FE để hiển thị, không gửi lên BE
}

export interface Cart {
  items: CartItem[]
  total: number
}
