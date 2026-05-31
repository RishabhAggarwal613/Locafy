'use client'

import { useEffect } from 'react'
import dynamic from 'next/dynamic'
import { useQuery } from '@tanstack/react-query'
import CustomerShell from '@/components/customer/CustomerShell'
import { useLocationStore } from '@/store/locationStore'
import { shopsApi } from '@/lib/api/shops'

const ShopMap = dynamic(() => import('@/components/customer/ShopMap'), { ssr: false })

export default function CustomerMapPage() {
  const { lat, lng, radius, setLocation, localityName } = useLocationStore()

  useEffect(() => {
    if (lat == null || lng == null) setLocation('Delhi', 28.6139, 77.2090)
  }, [lat, lng, setLocation])

  const coords = { lat: lat ?? 28.6139, lng: lng ?? 77.2090, radius }

  const { data: shops, isLoading } = useQuery({
    queryKey: ['shops-map', coords],
    queryFn: () => shopsApi.listNearby({ ...coords, size: 50 }),
    enabled: lat != null && lng != null,
  })

  return (
    <CustomerShell>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Shop map</h1>
      <p className="text-gray-500 text-sm mb-6">Discover shops near {localityName || 'you'} within {radius} km</p>

      {isLoading ? (
        <p className="text-gray-400 animate-pulse">Loading map...</p>
      ) : (
        <ShopMap shops={shops?.content ?? []} lat={coords.lat} lng={coords.lng} />
      )}
    </CustomerShell>
  )
}
