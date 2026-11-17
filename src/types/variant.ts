export interface ProductVariant {
  id: number
  productId: number
  size: string
  color: string
  stock: number
  priceOverride?: number | null
  sku: string | null
}

export type Variant = ProductVariant
