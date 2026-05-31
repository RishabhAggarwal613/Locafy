'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import CustomerShell from '@/components/customer/CustomerShell'
import ShopCard from '@/components/customer/ShopCard'
import ProductCard from '@/components/customer/ProductCard'
import { useLocationStore } from '@/store/locationStore'
import { searchApi, type SearchType } from '@/lib/api/search'

export default function CustomerSearchContent() {
  const searchParams = useSearchParams()
  const { lat, lng, radius, setLocation } = useLocationStore()
  const [query, setQuery] = useState(searchParams.get('q') ?? '')
  const [type, setType] = useState<SearchType>('ALL')
  const [category, setCategory] = useState(searchParams.get('category') ?? '')
  const [debouncedQ, setDebouncedQ] = useState(query)

  useEffect(() => {
    if (lat == null || lng == null) setLocation('Delhi', 28.6139, 77.2090)
  }, [lat, lng, setLocation])

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(query), 300)
    return () => clearTimeout(t)
  }, [query])

  const coords = { lat: lat ?? 28.6139, lng: lng ?? 77.2090, radius }

  const { data: results, isLoading } = useQuery({
    queryKey: ['search', debouncedQ, type, category, coords],
    queryFn: () => searchApi.search({
      q: debouncedQ || undefined,
      type,
      ...coords,
      category: category || undefined,
    }),
    enabled: lat != null && lng != null,
  })

  const { data: suggestions } = useQuery({
    queryKey: ['autocomplete', query, coords],
    queryFn: () => searchApi.autocomplete(query, coords.lat, coords.lng, coords.radius),
    enabled: query.length >= 2 && lat != null && lng != null,
  })

  return (
    <CustomerShell>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Search & Discover</h1>

      <div className="relative mb-6">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search shops, products, categories..."
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        {suggestions && suggestions.length > 0 && query.length >= 2 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-10 overflow-hidden">
            {suggestions.map((s) => (
              <Link
                key={`${s.type}-${s.id}`}
                href={s.type === 'SHOP' ? `/customer/shops/${s.id}` : `/customer/products/${s.id}`}
                className="block px-4 py-2.5 hover:bg-gray-50 border-b border-gray-50 last:border-0"
              >
                <span className="text-sm font-medium text-gray-900">{s.label}</span>
                <span className="text-xs text-gray-400 ml-2">{s.subtitle}</span>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {(['ALL', 'SHOP', 'PRODUCT'] as SearchType[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setType(t)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${
              type === t ? 'bg-indigo-600 text-white border-indigo-600' : 'border-gray-200 hover:bg-gray-50'
            }`}
          >
            {t === 'ALL' ? 'All' : t === 'SHOP' ? 'Shops' : 'Products'}
          </button>
        ))}
        {category && (
          <span className="px-3 py-1.5 rounded-lg text-xs bg-indigo-50 text-indigo-700 border border-indigo-100">
            {category} ×
            <button type="button" className="ml-1" onClick={() => setCategory('')}>clear</button>
          </span>
        )}
      </div>

      {isLoading ? (
        <p className="text-gray-400 animate-pulse">Searching...</p>
      ) : (
        <>
          {results?.shops && results.shops.length > 0 && (
            <section className="mb-8">
              <h2 className="font-semibold text-gray-900 mb-3">Shops ({results.totalShops})</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {results.shops.map((shop) => (
                  <ShopCard key={shop.id} shop={shop} />
                ))}
              </div>
            </section>
          )}
          {results?.products && results.products.length > 0 && (
            <section>
              <h2 className="font-semibold text-gray-900 mb-3">Products ({results.totalProducts})</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {results.products.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </section>
          )}
          {!results?.shops?.length && !results?.products?.length && (
            <div className="text-center py-16 text-gray-500">No results found. Try a different search or radius.</div>
          )}
        </>
      )}
    </CustomerShell>
  )
}
