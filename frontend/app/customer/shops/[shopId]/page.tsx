'use client'

import { useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import CustomerShell from '@/components/customer/CustomerShell'
import ProductCard from '@/components/customer/ProductCard'
import { shopsApi } from '@/lib/api/shops'
import { productsApi } from '@/lib/api/products'
import { useLocationStore } from '@/store/locationStore'
import type { ProductSearchItem } from '@/lib/api/search'

export default function ShopDetailPage() {
  const { shopId } = useParams<{ shopId: string }>()
  const { lat, lng } = useLocationStore()

  const { data: shop, isLoading } = useQuery({
    queryKey: ['shop', shopId],
    queryFn: () => shopsApi.getById(shopId),
  })

  const { data: products } = useQuery({
    queryKey: ['shop-products', shopId],
    queryFn: () => productsApi.listByShop(shopId, 0, 50),
    enabled: !!shopId,
  })

  useEffect(() => {
    if (shop && lat != null && lng != null && shop.location?.coordinates) {
      // distance could be computed client-side later
    }
  }, [shop, lat, lng])

  if (isLoading || !shop) {
    return (
      <CustomerShell>
        <p className="text-gray-400 animate-pulse">Loading shop...</p>
      </CustomerShell>
    )
  }

  const productItems: ProductSearchItem[] = (products?.content ?? []).map((p) => ({
    id: p.id,
    shopId: p.shopId,
    shopName: shop.name,
    name: p.name,
    description: p.description,
    price: p.price,
    discountedPrice: p.discountedPrice,
    images: p.images,
    category: p.category,
    stock: p.stock,
    isAvailable: p.isAvailable,
    unit: p.unit,
    rating: p.rating,
  }))

  return (
    <CustomerShell>
      <div className="mb-8">
        <div className="h-48 md:h-64 rounded-2xl overflow-hidden bg-gray-100 mb-4 relative">
          {shop.coverImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={shop.coverImageUrl} alt={shop.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center text-5xl">🏪</div>
          )}
        </div>

        <div className="flex flex-col md:flex-row md:items-start gap-4">
          {shop.logoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={shop.logoUrl} alt="" className="w-16 h-16 rounded-xl border border-gray-100 object-cover -mt-10 ml-4 relative z-10 bg-white" />
          )}
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold text-gray-900">{shop.name}</h1>
              <span className={`text-xs px-2 py-0.5 rounded-full ${shop.isOpen ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200 text-gray-600'}`}>
                {shop.isOpen ? 'Open now' : 'Closed'}
              </span>
              {shop.isVerified && <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">Verified</span>}
            </div>
            <p className="text-gray-500 text-sm mb-2">⭐ {shop.rating?.toFixed(1)} · {shop.reviewCount} reviews</p>
            {shop.description && <p className="text-gray-600 text-sm mb-3">{shop.description}</p>}
            <p className="text-sm text-gray-500">
              📍 {shop.address?.line1}, {shop.address?.city} {shop.address?.pincode}
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              {shop.categories?.map((c) => (
                <span key={c} className="text-xs px-2 py-0.5 bg-gray-100 rounded-full">{c}</span>
              ))}
            </div>
            <div className="flex gap-4 mt-4 text-xs text-gray-500">
              {shop.pickupAvailable && <span>✓ Pickup</span>}
              {shop.deliveryAvailable && <span>✓ Delivery{shop.minOrderAmount ? ` · Min ₹${shop.minOrderAmount}` : ''}</span>}
            </div>
          </div>
        </div>
      </div>

      <section>
        <h2 className="text-lg font-bold text-gray-900 mb-4">Products</h2>
        {productItems.length === 0 ? (
          <p className="text-gray-500">No products listed yet.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {productItems.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>

      <div className="mt-8">
        <Link href="/customer/explore" className="text-sm text-indigo-600 hover:underline">← Back to explore</Link>
      </div>
    </CustomerShell>
  )
}
