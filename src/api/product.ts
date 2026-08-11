import api from './request'
import type { Product, Category, ProductQuery } from '@/types/product'

export function getProducts(params?: ProductQuery) {
  return api
    .get<{ data: Product[]; total: number; page: number; limit: number }>('/products', { params })
    .then((res) => res.data)
}

export function getProductById(id: number) {
  return api.get<Product>(`/products/${id}`).then((res) => res.data)
}

export function createProduct(data: Partial<Product>) {
  return api.post<Product>('/products', data).then((res) => res.data)
}

export function updateProduct(id: number, data: Partial<Product>) {
  return api.put<Product>(`/products/${id}`, data).then((res) => res.data)
}

export function deleteProduct(id: number) {
  return api.delete(`/products/${id}`).then((res) => res.data)
}

export function getCategories() {
  return api.get<Category[]>('/products/categories').then((res) => res.data)
}
