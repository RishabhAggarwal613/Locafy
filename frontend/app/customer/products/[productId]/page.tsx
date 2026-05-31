'use client'

import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import CustomerShell from '@/components/customer/CustomerShell'
import { productsApi } from '@/lib/api/products'
import { shopsApi } from '@/lib/api/shops'
import { cartApi } from '@/lib/api/cart'
import { useAuthStore } from '@/store/authStore'
import toast from 'react-hot-toast'

export default function ProductDetailPage() {
  const { productId } = useParams<{ productId: string }>()
  const router = useRouter()
  const queryClient = useQueryClient()
  const { user } = useAuthStore()

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', productId],
    queryFn: () => productsApi.getById(productId),
  })

  const { data: shop } = useQuery({
    queryKey: ['shop', product?.shopId],
    queryFn: () => shopsApi.getById(product!.shopId),
    enabled: !!product?.shopId,
  })

  const addToCart = useMutation({
    mutationFn: () => cartApi.addItem(productId, 1),
    onSuccess: (data) => {
      queryClient.setQueryData(['cart'], data)
      toast.success('Added to cart')
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(msg ?? 'Could not add to cart')
    },
  })

  const handleAddToCart = () => {
    if (!user) {
      router.push('/customer/auth')
      return
    }
    addToCart.mutate()
  }

  const handleBuyNow = () => {
    if (!user) {
      router.push('/customer/auth')
      return
    }
    addToCart.mutate(undefined, {
      onSuccess: () => router.push('/customer/checkout'),
    })
  }

  if (isLoading || !product) {
    return (
      <CustomerShell>
        <p className="text-gray-400 animate-pulse">Loading product...</p>
      </CustomerShell>
    )
  }

  const price = product.discountedPrice ?? product.price
  const hasDiscount = product.discountedPrice && product.discountedPrice < product.price

  return (
    <CustomerShell>
      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <div className="aspect-square bg-gray-100 rounded-2xl overflow-hidden mb-3">
            {product.images?.[0] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-6xl">📦</div>
            )}
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {product.images.map((url) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={url} src={url} alt="" className="w-16 h-16 rounded-lg object-cover border border-gray-100 shrink-0" />
              ))}
            </div>
          )}
        </div>

        <div>
          <p className="text-sm text-indigo-600 font-medium mb-1">{product.category}</p>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h1>
          {shop && (
            <Link href={`/customer/shops/${shop.id}`} className="text-sm text-gray-500 hover:text-indigo-600">
              Sold by {shop.name} →
            </Link>
          )}

          <div className="flex items-baseline gap-3 mt-4 mb-4">
            <span className="text-3xl font-bold text-gray-900">₹{price}</span>
            {hasDiscount && (
              <>
                <span className="text-lg text-gray-400 line-through">₹{product.price}</span>
                <span className="text-sm text-emerald-600 font-medium">Save ₹{(product.price - product.discountedPrice!).toFixed(0)}</span>
              </>
            )}
          </div>

          <p className={`text-sm mb-4 ${product.isAvailable ? 'text-emerald-600' : 'text-red-500'}`}>
            {product.isAvailable ? `In stock (${product.stock} ${product.unit})` : 'Out of stock'}
          </p>

          {product.description && (
            <p className="text-gray-600 text-sm mb-6 leading-relaxed">{product.description}</p>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={!product.isAvailable || addToCart.isPending}
              className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-50"
            >
              Add to Cart
            </button>
            <button
              type="button"
              onClick={handleBuyNow}
              disabled={!product.isAvailable || addToCart.isPending}
              className="flex-1 py-3 border border-indigo-600 text-indigo-600 rounded-xl font-medium hover:bg-indigo-50 disabled:opacity-50"
            >
              Buy Now
            </button>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <Link href={shop ? `/customer/shops/${shop.id}` : '/customer/explore'} className="text-sm text-indigo-600 hover:underline">
          ← Back to shop
        </Link>
      </div>
    </CustomerShell>
  )
}
