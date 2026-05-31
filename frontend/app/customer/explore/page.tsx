'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import CustomerShell from '@/components/customer/CustomerShell'
import ShopCard from '@/components/customer/ShopCard'
import ProductCard from '@/components/customer/ProductCard'
import LocationSwitcher from '@/components/customer/LocationSwitcher'
import { useLocationStore } from '@/store/locationStore'
import { shopsApi } from '@/lib/api/shops'
import { productsApi } from '@/lib/api/products'
import { categoriesApi } from '@/lib/api/categories'

export default function CustomerExplorePage() {
  const { localityName, lat, lng, radius, setLocation } = useLocationStore()

  useEffect(() => {
    if (lat == null || lng == null) {
      setLocation('Delhi', 28.6139, 77.2090)
    }
  }, [lat, lng, setLocation])

  const coords = { lat: lat ?? 28.6139, lng: lng ?? 77.2090, radius }

  const { data: shops, isLoading: shopsLoading } = useQuery({
    queryKey: ['shops', coords],
    queryFn: () => shopsApi.listNearby({ ...coords, size: 12 }),
    enabled: lat != null && lng != null,
  })

  const { data: recent } = useQuery({
    queryKey: ['products-recent', coords],
    queryFn: () => productsApi.recent(coords.lat, coords.lng, coords.radius, 10),
    enabled: lat != null && lng != null,
  })

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.list(),
  })

  return (
    <CustomerShell>
      <section className="mb-10">
        <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-2xl p-8 text-white">
          <p className="text-indigo-200 text-sm mb-2">
            Showing results near: <strong>{localityName || 'your location'}</strong>
          </p>
          <h1 className="text-3xl font-bold mb-3">Discover shops around you</h1>
          <p className="text-indigo-100 mb-6 max-w-lg">Browse nearby vendors, explore products, and order for pickup or delivery.</p>
          <div className="flex flex-wrap gap-3 items-center">
            <Link href="/customer/search" className="px-5 py-2.5 bg-white text-indigo-700 rounded-lg font-medium text-sm hover:bg-indigo-50">
              Search shops & products
            </Link>
            <LocationSwitcher />
            <Link href="/customer/auth" className="px-5 py-2.5 border border-white/30 rounded-lg text-sm hover:bg-white/10">
              Sign in to order
            </Link>
          </div>
        </div>
      </section>

      {categories && categories.length > 0 && (
        <section className="mb-10">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Categories</h2>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/customer/search?category=${encodeURIComponent(cat.name)}`}
                className="flex flex-col items-center p-3 bg-white border border-gray-100 rounded-xl hover:border-indigo-200 hover:shadow-sm transition-all text-center"
              >
                <span className="text-2xl mb-1">{cat.icon}</span>
                <span className="text-xs text-gray-700 font-medium">{cat.name}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {recent && recent.length > 0 && (
        <section className="mb-10">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Latest nearby products</h2>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {recent.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">Nearby shops</h2>
          <Link href="/customer/map" className="text-sm text-indigo-600 hover:underline">View on map →</Link>
        </div>
        {shopsLoading ? (
          <p className="text-gray-400 animate-pulse">Finding shops near you...</p>
        ) : shops?.content.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-xl p-10 text-center">
            <p className="text-gray-500 mb-2">No shops found within {radius} km.</p>
            <p className="text-sm text-gray-400">Try increasing your search radius or set a vendor shop nearby.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {shops?.content.map((shop) => (
              <ShopCard key={shop.id} shop={shop} />
            ))}
          </div>
        )}
      </section>
    </CustomerShell>
  )
}
