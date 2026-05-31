declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => { open: () => void }
  }
}

interface RazorpayOptions {
  key: string
  amount?: number
  currency?: string
  order_id: string
  name?: string
  description?: string
  prefill?: { name?: string; email?: string; contact?: string }
  handler: (response: RazorpaySuccessResponse) => void
  modal?: { ondismiss?: () => void }
}

interface RazorpaySuccessResponse {
  razorpay_order_id: string
  razorpay_payment_id: string
  razorpay_signature: string
}

export function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && window.Razorpay) {
      resolve(true)
      return
    }
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

export async function openRazorpayCheckout(options: {
  keyId: string
  orderId: string
  amount: number
  orderNumber: string
  userName?: string
  userEmail?: string
  userPhone?: string
  onSuccess: (response: RazorpaySuccessResponse) => void
  onDismiss?: () => void
}) {
  const loaded = await loadRazorpayScript()
  if (!loaded || !window.Razorpay) {
    throw new Error('Failed to load Razorpay checkout')
  }

  const rzp = new window.Razorpay({
    key: options.keyId,
    order_id: options.orderId,
    amount: options.amount,
    currency: 'INR',
    name: 'Locafy',
    description: `Order ${options.orderNumber}`,
    prefill: {
      name: options.userName,
      email: options.userEmail,
      contact: options.userPhone,
    },
    handler: options.onSuccess,
    modal: { ondismiss: options.onDismiss },
  })
  rzp.open()
}
