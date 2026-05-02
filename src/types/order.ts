export type OrderStatus = 'pending' | 'confirmed' | 'shipping' | 'delivered' | 'cancelled'

export interface OrderItem {
  productId: number
  name: string
  price: number
  quantity: number
}

export interface Order {
  id: number
  items: OrderItem[]
  total: number
  paymentMethod: string
  status: OrderStatus
  shippingName?: string
  shippingPhone?: string
  shippingAddress?: string
  note?: string
  createdAt: string
}
