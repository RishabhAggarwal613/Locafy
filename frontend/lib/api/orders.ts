import apiClient from './client'
import type { FulfillmentType, Order, OrderStatus, PaymentMethod } from '@/types'

export interface DeliveryAddressInput {
  label?: string
  line1: string
  line2?: string
  city: string
  pincode: string
  latitude?: number
  longitude?: number
}

export interface PlaceOrderPayload {
  shopId: string
  items: { productId: string; quantity: number }[]
  fulfillmentType: FulfillmentType
  paymentMethod: PaymentMethod
  deliveryAddress?: DeliveryAddressInput
}

export interface PlaceOrderResponse {
  order: Order
  razorpayOrderId?: string
  razorpayKeyId?: string
  razorpayAmount?: number
}

export interface OrderPageResponse {
  content: Order[]
  totalElements: number
  page: number
  size: number
  hasMore: boolean
}

export const ordersApi = {
  place: (payload: PlaceOrderPayload) =>
    apiClient.post<PlaceOrderResponse>('/api/orders', payload).then((r) => r.data),

  list: (page = 0, size = 20) =>
    apiClient.get<OrderPageResponse>('/api/orders', { params: { page, size } }).then((r) => r.data),

  getById: (id: string) =>
    apiClient.get<Order>(`/api/orders/${id}`).then((r) => r.data),

  cancel: (id: string, reason?: string) =>
    apiClient.put<Order>(`/api/orders/${id}/cancel`, { reason }).then((r) => r.data),

  listVendor: (status?: OrderStatus, page = 0, size = 20) =>
    apiClient.get<OrderPageResponse>('/api/orders/vendor', { params: { status, page, size } }).then((r) => r.data),

  updateStatus: (id: string, status: OrderStatus, note?: string) =>
    apiClient.put<Order>(`/api/orders/${id}/status`, { status, note }).then((r) => r.data),
}
