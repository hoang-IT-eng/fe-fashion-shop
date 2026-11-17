export type OrderStatus = 'pending' | 'confirmed' | 'shipping' | 'delivered' | 'cancelled'

export interface OrderItem {
  productId: number
  variantId?: number
  name: string
  price: number
  quantity: number
  size?: string
  color?: string
  imageUrl?: string
}

export interface Order {
  id: number
  userId?: number
  items: OrderItem[]
  total: number
  voucherCode?: string | null
  discountAmount?: number
  paymentMethod: string
  paymentStatus?: string
  status: OrderStatus
  shippingName?: string
  shippingPhone?: string
  shippingAddress?: string
  note?: string
  createdAt: string
}
