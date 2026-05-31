'use client'

import Map, { Marker, Source, Layer } from 'react-map-gl/mapbox'
import 'mapbox-gl/dist/mapbox-gl.css'

interface Props {
  shopLat?: number
  shopLng?: number
  customerLat?: number
  customerLng?: number
  partnerLat?: number
  partnerLng?: number
  height?: number
}

export default function DeliveryRouteMap({
  shopLat, shopLng, customerLat, customerLng, partnerLat, partnerLng, height = 360,
}: Props) {
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN

  const points: { lat: number; lng: number; label: string; color: string }[] = []
  if (shopLat != null && shopLng != null) points.push({ lat: shopLat, lng: shopLng, label: 'Shop', color: '#10b981' })
  if (customerLat != null && customerLng != null) points.push({ lat: customerLat, lng: customerLng, label: 'Customer', color: '#6366f1' })
  if (partnerLat != null && partnerLng != null) points.push({ lat: partnerLat, lng: partnerLng, label: 'You', color: '#f59e0b' })

  const center = points[0] ?? { lat: 28.6139, lng: 77.2090 }

  if (!token) {
    return (
      <div className="rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-center text-sm text-gray-500" style={{ height }}>
        Set NEXT_PUBLIC_MAPBOX_TOKEN for map navigation
      </div>
    )
  }

  return (
    <div className="rounded-xl overflow-hidden border border-gray-200" style={{ height }}>
      <Map
        mapboxAccessToken={token}
        initialViewState={{ latitude: center.lat, longitude: center.lng, zoom: 13 }}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        style={{ width: '100%', height: '100%' }}
      >
        {shopLat != null && shopLng != null && customerLat != null && customerLng != null && (
          <Source
            id="route-line"
            type="geojson"
            data={{
              type: 'Feature',
              properties: {},
              geometry: {
                type: 'LineString',
                coordinates: [
                  [shopLng, shopLat],
                  ...(partnerLng != null && partnerLat != null ? [[partnerLng, partnerLat]] : []),
                  [customerLng, customerLat],
                ],
              },
            }}
          >
            <Layer id="route" type="line" paint={{ 'line-color': '#f59e0b', 'line-width': 3, 'line-dasharray': [2, 2] }} />
          </Source>
        )}
        {points.map((p) => (
          <Marker key={p.label} latitude={p.lat} longitude={p.lng} anchor="bottom">
            <div className="text-xs font-medium px-2 py-1 rounded shadow border bg-white" style={{ borderColor: p.color, color: p.color }}>
              {p.label}
            </div>
          </Marker>
        ))}
      </Map>
    </div>
  )
}
