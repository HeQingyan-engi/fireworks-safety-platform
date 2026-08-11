import api from './request'
import type { Order, CreateOrderRequest } from '@/types/order'

export function createOrder(data: CreateOrderRequest) {
  return api.post<Order>('/orders', data).then((res) => res.data)
}

export function getOrders(params?: { storeId?: number; page?: number; limit?: number }) {
  return api
    .get<{ data: Order[]; total: number }>('/orders', { params })
    .then((res) => res.data)
}

export function getOrderById(id: number) {
  return api.get<Order>(`/orders/${id}`).then((res) => res.data)
}

export function updateOrderStatus(id: number, status: string) {
  return api.put(`/orders/${id}/status`, { status }).then((res) => res.data)
}

export function mockPay(id: number) {
  return api.post(`/orders/${id}/pay`).then((res) => res.data)
}

export function signSafety(id: number, signatureImage: string) {
  return api.post(`/orders/${id}/sign-safety`, { signatureImage }).then((res) => res.data)
}
