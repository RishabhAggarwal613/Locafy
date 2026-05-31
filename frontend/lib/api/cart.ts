import apiClient from './client'

export interface CartItem {
  productId: string
  productName: string
  productImage?: string
  unitPrice: number
  quantity: number
  totalPrice: number
}

export interface CartResponse {
  shopId?: string
  shopName?: string
  items: CartItem[]
  subtotal: number
  itemCount: number
}

export const cartApi = {
  get: () => apiClient.get<CartResponse>('/api/cart').then((r) => r.data),

  addItem: (productId: string, quantity = 1) =>
    apiClient.post<CartResponse>('/api/cart/items', { productId, quantity }).then((r) => r.data),

  updateItem: (productId: string, quantity: number) =>
    apiClient.put<CartResponse>(`/api/cart/items/${productId}`, { quantity }).then((r) => r.data),

  removeItem: (productId: string) =>
    apiClient.delete<CartResponse>(`/api/cart/items/${productId}`).then((r) => r.data),

  clear: () => apiClient.delete('/api/cart').then((r) => r.data),
}
