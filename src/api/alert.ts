import api from './request'
import type { Alert } from '@/types/alert'

export function getAlerts(params?: {
  type?: string; level?: string; status?: string; storeId?: number; page?: number; limit?: number
}) {
  return api
    .get<{ data: Alert[]; total: number }>('/alerts', { params })
    .then((res) => res.data)
}

export function getAlertById(id: number) {
  return api.get<Alert>(`/alerts/${id}`).then((res) => res.data)
}

export function updateAlertStatus(id: number, status: string) {
  return api.put(`/alerts/${id}/status`, { status }).then((res) => res.data)
}

export function uploadAlertProof(id: number, file: File) {
  const formData = new FormData()
  formData.append('image', file)
  return api.post(`/alerts/${id}/upload-proof`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then((res) => res.data)
}

export function getAlertStats() {
  return api.get('/alerts/stats').then((res) => res.data)
}
