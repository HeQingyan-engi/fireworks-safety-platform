export interface Order {
  id: number
  orderNo: string
  customerName: string
  customerPhone?: string
  storeId: number
  storeName?: string
  totalAmount: number
  status: OrderStatus
  pickupCode?: string
  signedSafety: boolean
  items: OrderItem[]
  createdAt: string
}

export interface OrderItem {
  id: number
  productId: number
  productName: string
  quantity: number
  price: number
}

export type OrderStatus = 'PENDING' | 'PAID' | 'READY' | 'PICKED_UP' | 'CANCELLED'

export interface CreateOrderRequest {
  storeId: number
  customerName: string
  customerPhone?: string
  items: { productId: number; quantity: number }[]
}
