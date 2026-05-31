'use client'

import { useMemo } from 'react'
import Map, { Marker } from 'react-map-gl/mapbox'
import 'mapbox-gl/dist/mapbox-gl.css'
import type { ShopListItem } from '@/types'
import Link from 'next/link'

interface Props {
  shops: ShopListItem[]
  lat: number
  lng: number
}

export default function ShopMap({ shops, lat, lng }: Props) {
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN

  const viewState = useMemo(() => ({
    latitude: lat,
    longitude: lng,
    zoom: 13,
  }), [lat, lng])

  if (!token) {
    return (
      <div className="h-[420px] bg-gray-100 rounded-xl flex flex-col items-center justify-center text-center p-6">
        <p className="text-gray-600 mb-2">Map requires Mapbox token</p>
        <p className="text-sm text-gray-400">Set NEXT_PUBLIC_MAPBOX_TOKEN in frontend/.env.local</p>
        <div className="mt-6 grid gap-2 w-full max-w-md">
          {shops.map((shop) => (
            <Link key={shop.id} href={`/customer/shops/${shop.id}`} className="text-sm text-indigo-600 hover:underline">
              {shop.name} · {shop.distanceKm} km
            </Link>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="h-[420px] rounded-xl overflow-hidden border border-gray-200">
      <Map
        mapboxAccessToken={token}
        initialViewState={viewState}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        style={{ width: '100%', height: '100%' }}
      >
        <Marker latitude={lat} longitude={lng} color="#6366f1" />
        {shops.map((shop) => {
          const coords = shop.location?.coordinates
          if (!coords) return null
          return (
            <Marker key={shop.id} latitude={coords[1]} longitude={coords[0]} anchor="bottom">
              <Link href={`/customer/shops/${shop.id}`} className="bg-white px-2 py-1 rounded shadow text-xs font-medium border border-indigo-200 hover:bg-indigo-50">
                {shop.name}
              </Link>
            </Marker>
          )
        })}
      </Map>
    </div>
  )
}
