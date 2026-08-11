export interface Product {
  id: number
  name: string
  price: number
  categoryId: number
  categoryName?: string
  safetyLevel: 'C' | 'D' | 'B'
  powderQuantity: string
  safetyDistance: string
  standards: string
  description: string
  isKidFriendly: boolean
  isOnSale: boolean
  originalPrice?: number
  effectVideoUrl: string
  appearanceVideoUrl: string
  imageUrl?: string
  stock?: number
  createdAt?: string
}

export interface Category {
  id: number
  name: string
  productCount?: number
}

export interface ProductQuery {
  categoryId?: number
  search?: string
  storeId?: number
  page?: number
  limit?: number
}
