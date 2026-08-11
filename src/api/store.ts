import api from './request'
import type { Store } from '@/types/store'

export function getStores() {
  return api.get<Store[]>('/stores').then((res) => res.data)
}

export function getStoreById(id: number) {
  return api.get<Store>(`/stores/${id}`).then((res) => res.data)
}

export function getStoreStatus(id: number) {
  return api.get<Store & { unresolvedAlerts: number }>(`/stores/${id}/status`).then((res) => res.data)
}
