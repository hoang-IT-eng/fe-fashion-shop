export interface Product {
  id: number
  name: string
  description: string
  price: string
  stock: number
  category: string
  imageUrl: string
  sizes: string[] | null
  colors: string[] | null
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
  price: number | ''
  stock: number | ''
  category: string
  description: string
  imageUrl: string
  sizes: string
  colors: string
  isActive: boolean
}
