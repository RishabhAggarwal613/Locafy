'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useQuery, useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import CustomerShell from '@/components/customer/CustomerShell'
import { cartApi } from '@/lib/api/cart'
import { ordersApi } from '@/lib/api/orders'
import { paymentsApi } from '@/lib/api/payments'
import { openRazorpayCheckout } from '@/lib/razorpay'
import { useAuthStore } from '@/store/authStore'
import { useLocationStore } from '@/store/locationStore'
import type { FulfillmentType, PaymentMethod } from '@/types'

export default function CheckoutPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const { localityName, lat, lng } = useLocationStore()
  const [fulfillmentType, setFulfillmentType] = useState<FulfillmentType>('PICKUP')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('COD')
  const [address, setAddress] = useState({
    line1: '',
    city: localityName || 'Delhi',
    pincode: '',
  })
  const [placing, setPlacing] = useState(false)

  const { data: cart, isLoading } = useQuery({
    queryKey: ['cart'],
    queryFn: () => cartApi.get(),
    enabled: !!user,
  })

  const placeOrder = useMutation({
    mutationFn: ordersApi.place,
  })

  const handlePlaceOrder = async () => {
    if (!cart?.shopId || !cart.items.length) {
      toast.error('Cart is empty')
      return
    }
    if (fulfillmentType === 'DELIVERY' && (!address.line1 || !address.pincode)) {
      toast.error('Please enter delivery address')
      return
    }

    setPlacing(true)
    try {
      const result = await placeOrder.mutateAsync({
        shopId: cart.shopId,
        items: cart.items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        fulfillmentType,
        paymentMethod,
        deliveryAddress: fulfillmentType === 'DELIVERY' ? {
          line1: address.line1,
          city: address.city,
          pincode: address.pincode,
          latitude: lat ?? undefined,
          longitude: lng ?? undefined,
        } : undefined,
      })

      if (paymentMethod === 'RAZORPAY' && result.razorpayOrderId && result.razorpayKeyId) {
        await openRazorpayCheckout({
          keyId: result.razorpayKeyId,
          orderId: result.razorpayOrderId,
          amount: result.razorpayAmount ?? Math.round(result.order.total * 100),
          orderNumber: result.order.orderNumber,
          userName: user?.name,
          userEmail: user?.email,
          userPhone: user?.phone,
          onSuccess: async (response) => {
            try {
              await paymentsApi.verify({
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              })
              toast.success('Payment successful!')
              router.push(`/customer/orders/${result.order.id}`)
            } catch {
              toast.error('Payment verification failed. Check your orders.')
              router.push(`/customer/orders/${result.order.id}`)
            }
          },
          onDismiss: () => {
            toast('Payment cancelled. Order saved as pending payment.', { icon: 'ℹ️' })
            router.push(`/customer/orders/${result.order.id}`)
          },
        })
      } else {
        toast.success('Order placed successfully!')
        router.push(`/customer/orders/${result.order.id}`)
      }
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(msg ?? 'Failed to place order')
    } finally {
      setPlacing(false)
    }
  }

  if (!user) {
    return (
      <CustomerShell>
        <div className="text-center py-16">
          <p className="text-gray-500 mb-4">Sign in to checkout</p>
          <Link href="/customer/auth" className="text-indigo-600 hover:underline">Sign in →</Link>
        </div>
      </CustomerShell>
    )
  }

  return (
    <CustomerShell>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Checkout</h1>

      {isLoading ? (
        <p className="text-gray-400 animate-pulse">Loading...</p>
      ) : !cart?.items?.length ? (
        <div className="text-center py-16">
          <p className="text-gray-500 mb-4">Your cart is empty</p>
          <Link href="/customer/explore" className="text-indigo-600 hover:underline">Browse shops →</Link>
        </div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <section className="bg-white rounded-xl border border-gray-100 p-5">
              <h2 className="font-semibold text-gray-900 mb-3">Fulfillment</h2>
              <div className="flex gap-3">
                {(['PICKUP', 'DELIVERY'] as FulfillmentType[]).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setFulfillmentType(t)}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-medium border ${
                      fulfillmentType === t ? 'bg-indigo-600 text-white border-indigo-600' : 'border-gray-200'
                    }`}
                  >
                    {t === 'PICKUP' ? 'Pickup' : 'Delivery (+₹30)'}
                  </button>
                ))}
              </div>
            </section>

            {fulfillmentType === 'DELIVERY' && (
              <section className="bg-white rounded-xl border border-gray-100 p-5 space-y-3">
                <h2 className="font-semibold text-gray-900">Delivery address</h2>
                <input value={address.line1} onChange={(e) => setAddress({ ...address, line1: e.target.value })} placeholder="Address line" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
                <div className="grid grid-cols-2 gap-3">
                  <input value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })} placeholder="City" className="border border-gray-200 rounded-lg px-3 py-2 text-sm" />
                  <input value={address.pincode} onChange={(e) => setAddress({ ...address, pincode: e.target.value })} placeholder="Pincode" className="border border-gray-200 rounded-lg px-3 py-2 text-sm" />
                </div>
              </section>
            )}

            <section className="bg-white rounded-xl border border-gray-100 p-5">
              <h2 className="font-semibold text-gray-900 mb-3">Payment method</h2>
              <div className="flex gap-3">
                {(['COD', 'RAZORPAY'] as PaymentMethod[]).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setPaymentMethod(m)}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-medium border ${
                      paymentMethod === m ? 'bg-indigo-600 text-white border-indigo-600' : 'border-gray-200'
                    }`}
                  >
                    {m === 'COD' ? 'Cash on Delivery' : 'Pay Online'}
                  </button>
                ))}
              </div>
            </section>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-6 h-fit">
            <h2 className="font-semibold text-gray-900 mb-4">Order from {cart.shopName}</h2>
            {cart.items.map((item) => (
              <div key={item.productId} className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">{item.productName} × {item.quantity}</span>
                <span>₹{item.totalPrice}</span>
              </div>
            ))}
            <div className="border-t border-gray-100 mt-4 pt-4 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span>₹{cart.subtotal}</span></div>
              {fulfillmentType === 'DELIVERY' && <div className="flex justify-between"><span className="text-gray-500">Delivery fee</span><span>₹30</span></div>}
              <div className="flex justify-between font-bold text-base pt-2 border-t border-gray-100">
                <span>Estimated total</span>
                <span>₹{cart.subtotal + (fulfillmentType === 'DELIVERY' ? 30 : 0) + Math.round(cart.subtotal * 0.1)}</span>
              </div>
              <p className="text-xs text-gray-400">Includes ~10% platform fee (calculated at checkout)</p>
            </div>
            <button
              type="button"
              onClick={handlePlaceOrder}
              disabled={placing}
              className="w-full mt-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-50"
            >
              {placing ? 'Placing order...' : 'Place Order'}
            </button>
          </div>
        </div>
      )}
    </CustomerShell>
  )
}
