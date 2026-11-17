import { Variant } from './variant'

export interface Product {
  id: number
  name: string
  brand?: string | null
  releaseType?: 'grail' | 'reborn' | 'archive' | 'drop' | string | null
  condition?: string | null
  authenticityCode?: string | null
  description: string
  price: number
  stock: number
  category: string
  imageUrl: string
  sizes: string[] | null
  colors: string[] | null
  variants?: Variant[]
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface ProductsResponse {
  data: Product[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface ProductForm {
  name: string
  brand: string
  releaseType: string
  condition: string
  authenticityCode: string
  price: number | ''
  stock: number | ''
  category: string
  description: string
  imageUrl: string
  sizes: string
  colors: string
  isActive: boolean
}
