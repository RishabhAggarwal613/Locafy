import apiClient from './client'
import type { PageResponse, Product, Shop, ShopPageResponse } from '@/types'

export interface CreateShopPayload {
  name: string
  description?: string
  phone?: string
  email?: string
  categories: string[]
  address: {
    line1: string
    line2?: string
    city: string
    state: string
    pincode: string
  }
  latitude: number
  longitude: number
  deliveryAvailable?: boolean
  pickupAvailable?: boolean
  minOrderAmount?: number
  deliveryRadius?: number
}

export type UpdateShopPayload = Partial<Omit<CreateShopPayload, 'categories'>> & {
  categories?: string[]
  isActive?: boolean
}

export const shopsApi = {
  listNearby: (params: {
    lat: number
    lng: number
    radius?: number
    category?: string
    q?: string
    open?: boolean
    delivery?: boolean
    page?: number
    size?: number
  }) => apiClient.get<ShopPageResponse>('/api/shops', { params }).then((r) => r.data),

  getById: (id: string) =>
    apiClient.get<Shop>(`/api/shops/${id}`).then((r) => r.data),

  create: (payload: CreateShopPayload) =>
    apiClient.post<Shop>('/api/shops', payload).then((r) => r.data),

  update: (id: string, payload: UpdateShopPayload) =>
    apiClient.put<Shop>(`/api/shops/${id}`, payload).then((r) => r.data),

  uploadCover: (id: string, file: File) => {
    const form = new FormData()
    form.append('file', file)
    return apiClient.post<Shop>(`/api/shops/${id}/cover`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data)
  },

  uploadLogo: (id: string, file: File) => {
    const form = new FormData()
    form.append('file', file)
    return apiClient.post<Shop>(`/api/shops/${id}/logo`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data)
  },
}

export const vendorApi = {
  getDashboard: () =>
    apiClient.get<VendorDashboard>('/api/vendors/dashboard').then((r) => r.data),

  getMyShop: () =>
    apiClient.get<Shop>('/api/vendors/me/shop').then((r) => r.data),

  getMyProducts: (page = 0, size = 20) =>
    apiClient.get<PageResponse<Product>>('/api/vendors/me/products', { params: { page, size } }).then((r) => r.data),
}

export interface VendorDashboard {
  hasShop: boolean
  shopId?: string
  shopName?: string
  totalProducts: number
  activeProducts: number
  pendingOrders: number
  todayOrders: number
  todayRevenue: number
}
