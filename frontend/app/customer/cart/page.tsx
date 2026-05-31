'use client'

import Link from 'next/link'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import CustomerShell from '@/components/customer/CustomerShell'
import { cartApi } from '@/lib/api/cart'
import { useAuthStore } from '@/store/authStore'

export default function CartPage() {
  const { user } = useAuthStore()
  const queryClient = useQueryClient()

  const { data: cart, isLoading } = useQuery({
    queryKey: ['cart'],
    queryFn: () => cartApi.get(),
    enabled: !!user,
  })

  const updateQty = useMutation({
    mutationFn: ({ productId, quantity }: { productId: string; quantity: number }) =>
      cartApi.updateItem(productId, quantity),
    onSuccess: (data) => queryClient.setQueryData(['cart'], data),
    onError: () => toast.error('Failed to update cart'),
  })

  const removeItem = useMutation({
    mutationFn: (productId: string) => cartApi.removeItem(productId),
    onSuccess: (data) => queryClient.setQueryData(['cart'], data),
    onError: () => toast.error('Failed to remove item'),
  })

  if (!user) {
    return (
      <CustomerShell>
        <div className="text-center py-16">
          <p className="text-gray-500 mb-4">Sign in to view your cart</p>
          <Link href="/customer/auth" className="text-indigo-600 hover:underline">Sign in →</Link>
        </div>
      </CustomerShell>
    )
  }

  return (
    <CustomerShell>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Your Cart</h1>
      {cart?.shopName && (
        <p className="text-sm text-gray-500 mb-6">From {cart.shopName}</p>
      )}

      {isLoading ? (
        <p className="text-gray-400 animate-pulse">Loading cart...</p>
      ) : !cart?.items?.length ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
          <p className="text-gray-500 mb-4">Your cart is empty</p>
          <Link href="/customer/explore" className="text-indigo-600 hover:underline">Explore shops →</Link>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-3">
            {cart.items.map((item) => (
              <div key={item.productId} className="bg-white rounded-xl border border-gray-100 p-4 flex gap-4">
                <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                  {item.productImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.productImage} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{item.productName}</p>
                  <p className="text-sm text-gray-500">₹{item.unitPrice} each</p>
                  <div className="flex items-center gap-2 mt-2">
                    <button type="button" onClick={() => updateQty.mutate({ productId: item.productId, quantity: item.quantity - 1 })} className="w-7 h-7 rounded border border-gray-200 text-sm">−</button>
                    <span className="text-sm w-6 text-center">{item.quantity}</span>
                    <button type="button" onClick={() => updateQty.mutate({ productId: item.productId, quantity: item.quantity + 1 })} className="w-7 h-7 rounded border border-gray-200 text-sm">+</button>
                    <button type="button" onClick={() => removeItem.mutate(item.productId)} className="ml-auto text-xs text-red-500 hover:underline">Remove</button>
                  </div>
                </div>
                <p className="font-semibold text-gray-900">₹{item.totalPrice}</p>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-6 h-fit">
            <h2 className="font-semibold text-gray-900 mb-4">Order summary</h2>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-500">Subtotal ({cart.itemCount} items)</span>
              <span>₹{cart.subtotal}</span>
            </div>
            <div className="border-t border-gray-100 my-3 pt-3 flex justify-between font-bold">
              <span>Subtotal</span>
              <span>₹{cart.subtotal}</span>
            </div>
            <Link
              href="/customer/checkout"
              className="block w-full text-center py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 mt-4"
            >
              Proceed to Checkout
            </Link>
          </div>
        </div>
      )}
    </CustomerShell>
  )
}
