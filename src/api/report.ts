import api from './request'

export function getSalesReport(params?: { storeId?: number; startDate?: string; endDate?: string }) {
  return api.get('/reports/sales', { params }).then((res) => res.data)
}

export function getInventoryReport(params?: { storeId?: number }) {
  return api.get('/reports/inventory', { params }).then((res) => res.data)
}

export function getComplianceReport() {
  return api.get('/reports/compliance').then((res) => res.data)
}
