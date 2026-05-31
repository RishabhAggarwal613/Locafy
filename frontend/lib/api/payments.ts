import apiClient from './client'

export interface CreatePaymentResponse {
  razorpayOrderId: string
  keyId: string
  amount: number
  currency: string
  orderNumber: string
}

export interface VerifyPaymentPayload {
  razorpayOrderId: string
  razorpayPaymentId: string
  razorpaySignature: string
}

export interface VerifyPaymentResponse {
  verified: boolean
  orderId: string
  paymentStatus: string
}

export const paymentsApi = {
  create: (orderId: string) =>
    apiClient.post<CreatePaymentResponse>('/api/payments/create', { orderId }).then((r) => r.data),

  verify: (payload: VerifyPaymentPayload) =>
    apiClient.post<VerifyPaymentResponse>('/api/payments/verify', payload).then((r) => r.data),
}
