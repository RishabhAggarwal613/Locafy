import apiClient from './client'
import type { Order, OrderStatus } from '@/types'

export type UserRole = 'CUSTOMER' | 'VENDOR' | 'DELIVERY' | 'ADMIN'

export interface AdminAnalytics {
  totalCustomers: number
  totalVendors: number
  totalDeliveryPartners: number
  totalAdmins: number
  activeShops: number
  shopsPendingVerification: number
  ordersToday: number
  gmvToday: number
  gmvThisMonth: number
  deliveryPartnersOnline: number
  flaggedProducts: number
  pendingShops: {
    id: string
    name: string
    ownerId: string
    city?: string
    createdAt?: string
  }[]
}

export interface AdminUser {
  id: string
  name: string
  email: string
  phone?: string
  role: UserRole
  active: boolean
  verified: boolean
  city?: string
  createdAt?: string
}

export interface AdminUserPage {
  content: AdminUser[]
  totalElements: number
  page: number
  size: number
  hasMore: boolean
}

export interface AdminShop {
  id: string
  name: string
  ownerId: string
  city?: string
  categories: string[]
  verified: boolean
  active: boolean
  productCount: number
  createdAt?: string
}

export interface AdminShopPage {
  content: AdminShop[]
  totalElements: number
  page: number
  size: number
  hasMore: boolean
}

export interface AdminOrderPage {
  content: Order[]
  totalElements: number
  page: number
  size: number
  hasMore: boolean
}

export interface AdminCategory {
  id: string
  name: string
  slug: string
  icon?: string
  parentCategory?: string
  type?: string
  displayOrder?: number
  isActive?: boolean
}

export interface PlatformSettings {
  platformFeePercent: number
  deliveryFeeBase: number
  deliveryFeePerKm: number
  maxDeliveryRadiusKm: number
  maintenanceMode: boolean
  announcementBanner?: string
}

export interface AdminProduct {
  id: string
  name: string
  shopId: string
  category?: string
  price?: number
  available: boolean
  flagged: boolean
  flagReason?: string
  flagCount?: number
}

export interface AdminProductPage {
  content: AdminProduct[]
  totalElements: number
  page: number
  size: number
  hasMore: boolean
}

export const adminApi = {
  getAnalytics: () =>
    apiClient.get<AdminAnalytics>('/api/admin/analytics').then((r) => r.data),

  listUsers: (role?: UserRole, page = 0, size = 20) =>
    apiClient.get<AdminUserPage>('/api/admin/users', { params: { role, page, size } }).then((r) => r.data),

  updateUserStatus: (id: string, active: boolean, reason?: string) =>
    apiClient.put<AdminUser>(`/api/admin/users/${id}/status`, { active, reason }).then((r) => r.data),

  listShops: (pendingOnly?: boolean, page = 0, size = 20) =>
    apiClient.get<AdminShopPage>('/api/admin/shops', { params: { pendingOnly, page, size } }).then((r) => r.data),

  verifyShop: (id: string, verified: boolean, reason?: string) =>
    apiClient.put<AdminShop>(`/api/admin/shops/${id}/verify`, { verified, reason }).then((r) => r.data),

  updateShopStatus: (id: string, active: boolean, reason?: string) =>
    apiClient.put<AdminShop>(`/api/admin/shops/${id}/status`, { active, reason }).then((r) => r.data),

  listOrders: (status?: OrderStatus, page = 0, size = 20) =>
    apiClient.get<AdminOrderPage>('/api/admin/orders', { params: { status, page, size } }).then((r) => r.data),

  overrideOrderStatus: (id: string, status: OrderStatus, note?: string) =>
    apiClient.put<Order>(`/api/admin/orders/${id}/status`, { status, note }).then((r) => r.data),

  refundOrder: (id: string, reason?: string) =>
    apiClient.post<Order>(`/api/admin/orders/${id}/refund`, { reason }).then((r) => r.data),

  listCategories: () =>
    apiClient.get<{ categories: AdminCategory[] }>('/api/admin/categories').then((r) => r.data.categories),

  createCategory: (payload: { name: string; icon?: string; displayOrder?: number }) =>
    apiClient.post<AdminCategory>('/api/admin/categories', payload).then((r) => r.data),

  updateCategory: (id: string, payload: Partial<AdminCategory>) =>
    apiClient.put<AdminCategory>(`/api/admin/categories/${id}`, payload).then((r) => r.data),

  getSettings: () =>
    apiClient.get<PlatformSettings>('/api/admin/settings').then((r) => r.data),

  updateSettings: (payload: Partial<PlatformSettings>) =>
    apiClient.put<PlatformSettings>('/api/admin/settings', payload).then((r) => r.data),

  listFlaggedProducts: (page = 0, size = 20) =>
    apiClient.get<AdminProductPage>('/api/admin/products/flagged', { params: { page, size } }).then((r) => r.data),

  hideProduct: (id: string) =>
    apiClient.put<AdminProduct>(`/api/admin/products/${id}/hide`).then((r) => r.data),

  dismissProductFlag: (id: string) =>
    apiClient.put<AdminProduct>(`/api/admin/products/${id}/dismiss-flag`).then((r) => r.data),
}
