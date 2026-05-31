import apiClient from './client'
import type { Order, OrderStatus } from '@/types'

export interface DeliveryProfile {
  userId: string
  isOnline: boolean
  zoneLatitude?: number
  zoneLongitude?: number
  zoneRadiusKm?: number
  vehicleType?: string
}

export interface DeliveryDashboard {
  todayDeliveries: number
  todayEarnings: number
  totalDeliveries: number
  totalEarnings: number
  activeOrders: number
  availableInZone: number
  isOnline: boolean
}

export interface DeliveryOrder {
  order: Order
  shopLatitude?: number
  shopLongitude?: number
  shopAddressLine?: string
  customerLatitude?: number
  customerLongitude?: number
  partnerEarning?: number
}

export interface DeliveryOrderPage {
  content: DeliveryOrder[]
  totalElements: number
  page: number
  size: number
  hasMore: boolean
}

export interface DeliveryLocation {
  orderId: string
  partnerId: string
  latitude: number
  longitude: number
  updatedAt?: string
}

export const deliveryApi = {
  getProfile: () =>
    apiClient.get<DeliveryProfile>('/api/delivery/profile').then((r) => r.data),

  updateProfile: (payload: Partial<DeliveryProfile> & { isOnline?: boolean }) =>
    apiClient.put<DeliveryProfile>('/api/delivery/profile', {
      isOnline: payload.isOnline,
      zoneLatitude: payload.zoneLatitude,
      zoneLongitude: payload.zoneLongitude,
      zoneRadiusKm: payload.zoneRadiusKm,
      vehicleType: payload.vehicleType,
    }).then((r) => r.data),

  getDashboard: () =>
    apiClient.get<DeliveryDashboard>('/api/delivery/dashboard').then((r) => r.data),

  listAvailable: (page = 0, size = 20) =>
    apiClient.get<DeliveryOrderPage>('/api/delivery/orders/available', { params: { page, size } }).then((r) => r.data),

  listActive: (page = 0, size = 20) =>
    apiClient.get<DeliveryOrderPage>('/api/delivery/orders/active', { params: { page, size } }).then((r) => r.data),

  listHistory: (page = 0, size = 20) =>
    apiClient.get<DeliveryOrderPage>('/api/delivery/orders/history', { params: { page, size } }).then((r) => r.data),

  getOrder: (id: string) =>
    apiClient.get<DeliveryOrder>(`/api/delivery/orders/${id}`).then((r) => r.data),

  acceptOrder: (id: string) =>
    apiClient.post<DeliveryOrder>(`/api/delivery/orders/${id}/accept`).then((r) => r.data),

  updateStatus: (id: string, status: OrderStatus, note?: string) =>
    apiClient.put<DeliveryOrder>(`/api/delivery/orders/${id}/status`, { status, note }).then((r) => r.data),

  postLocation: (id: string, latitude: number, longitude: number) =>
    apiClient.post<DeliveryLocation>(`/api/delivery/orders/${id}/location`, { latitude, longitude }).then((r) => r.data),

  getOrderLocation: (orderId: string) =>
    apiClient.get<DeliveryLocation>(`/api/orders/${orderId}/location`).then((r) => r.data),
}
