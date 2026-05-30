import apiClient from './client'
import type { PageResponse, Product } from '@/types'

export interface CreateProductPayload {
  name: string
  description?: string
  price: number
  discountedPrice?: number
  category: string
  subCategory?: string
  tags?: string[]
  stock: number
  unit?: string
  weight?: number
  sku?: string
  isAvailable?: boolean
}

export type UpdateProductPayload = Partial<CreateProductPayload>

export const productsApi = {
  getById: (id: string) =>
    apiClient.get<Product>(`/api/products/${id}`).then((r) => r.data),

  listByShop: (shopId: string, page = 0, size = 20) =>
    apiClient.get<PageResponse<Product>>(`/api/shops/${shopId}/products`, { params: { page, size } }).then((r) => r.data),

  create: (payload: CreateProductPayload) =>
    apiClient.post<Product>('/api/products', payload).then((r) => r.data),

  update: (id: string, payload: UpdateProductPayload) =>
    apiClient.put<Product>(`/api/products/${id}`, payload).then((r) => r.data),

  delete: (id: string) =>
    apiClient.delete(`/api/products/${id}`).then((r) => r.data),

  updateStock: (id: string, stock: number, isAvailable?: boolean) =>
    apiClient.patch<Product>(`/api/products/${id}/stock`, { stock, isAvailable }).then((r) => r.data),

  uploadImage: (id: string, file: File) => {
    const form = new FormData()
    form.append('file', file)
    return apiClient.post<Product>(`/api/products/${id}/images`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data)
  },

  removeImage: (id: string, index: number) =>
    apiClient.delete<Product>(`/api/products/${id}/images/${index}`).then((r) => r.data),

  bulkImport: (file: File) => {
    const form = new FormData()
    form.append('file', file)
    return apiClient.post<Product[]>('/api/products/bulk', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data)
  },
}
