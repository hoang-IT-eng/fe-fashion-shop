export interface ProductVariant {
  id: number
  productId: number
  size: string
  color: string
  stock: number
  sku: string | null
}
