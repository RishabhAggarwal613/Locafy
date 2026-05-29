# Mapbox Integration

Mapbox powers all map UI in Locafy: shop discovery, address selection, live delivery tracking, and turn-by-turn navigation.

---

## Setup

1. Create an account at [mapbox.com](https://mapbox.com)
2. Dashboard → Access Tokens → Create a token
3. For the public token: restrict to your domain (URL restriction)
4. For the secret token (server-side directions API): keep private

---

## npm Packages

```bash
npm install mapbox-gl react-map-gl @mapbox/mapbox-gl-directions
npm install -D @types/mapbox-gl
```

---

## Environment Variables

```env
# frontend
NEXT_PUBLIC_MAPBOX_TOKEN=pk.eyJ1IjoibG9jYWZ5...

# backend (server-side distance calculations)
MAPBOX_SECRET_TOKEN=sk.eyJ1IjoibG9jYWZ5...
```

---

## Shop Discovery Map

```tsx
// components/customer/ShopDiscoveryMap.tsx
'use client'
import Map, { Marker, Popup, NavigationControl, GeolocateControl } from 'react-map-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

export function ShopDiscoveryMap({ shops, userLocation }) {
  const [selectedShop, setSelectedShop] = useState(null)

  return (
    <Map
      mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
      initialViewState={{
        longitude: userLocation.lng,
        latitude: userLocation.lat,
        zoom: 14,
      }}
      style={{ width: '100%', height: '100%' }}
      mapStyle="mapbox://styles/mapbox/streets-v12"
    >
      <NavigationControl position="top-right" />
      <GeolocateControl
        positionOptions={{ enableHighAccuracy: true }}
        trackUserLocation
        onGeolocate={(e) => updateUserLocation(e.coords)}
      />

      {/* User location pulse */}
      <Marker longitude={userLocation.lng} latitude={userLocation.lat}>
        <div className="w-4 h-4 bg-blue-500 rounded-full ring-4 ring-blue-200 animate-pulse" />
      </Marker>

      {/* Shop pins */}
      {shops.map((shop) => (
        <Marker
          key={shop._id}
          longitude={shop.location.coordinates[0]}
          latitude={shop.location.coordinates[1]}
          onClick={(e) => { e.originalEvent.stopPropagation(); setSelectedShop(shop) }}
        >
          <ShopPin category={shop.categories[0]} />
        </Marker>
      ))}

      {/* Selected shop popup */}
      {selectedShop && (
        <Popup
          longitude={selectedShop.location.coordinates[0]}
          latitude={selectedShop.location.coordinates[1]}
          onClose={() => setSelectedShop(null)}
          closeOnClick={false}
          offset={25}
        >
          <ShopPopupCard shop={selectedShop} />
        </Popup>
      )}
    </Map>
  )
}
```

---

## Address Pin-Drop Selector

Used in checkout and profile address management:

```tsx
// components/customer/AddressPinDrop.tsx
import Map, { Marker } from 'react-map-gl'

export function AddressPinDrop({ value, onChange }) {
  const [coords, setCoords] = useState(value)

  const handleMapClick = async (e) => {
    const { lngLat } = e
    setCoords({ lat: lngLat.lat, lng: lngLat.lng })

    // Reverse geocode
    const res = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${lngLat.lng},${lngLat.lat}.json` +
      `?access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}`
    )
    const { features } = await res.json()
    onChange({ coords: lngLat, address: features[0]?.place_name })
  }

  return (
    <Map onClick={handleMapClick} ...>
      <Marker longitude={coords.lng} latitude={coords.lat} draggable onDragEnd={(e) => {
        const { lngLat } = e
        setCoords(lngLat)
        // also reverse geocode on drag end
      }}>
        <PinIcon />
      </Marker>
    </Map>
  )
}
```

---

## Live Delivery Tracking Map

```tsx
// components/customer/LiveTrackingMap.tsx
import Map, { Marker, Layer, Source } from 'react-map-gl'
import { useStompClient } from 'react-stomp-hooks'

export function LiveTrackingMap({ orderId, shopCoords, dropCoords }) {
  const [deliveryCoords, setDeliveryCoords] = useState(null)
  const mapRef = useRef(null)
  const client = useStompClient()

  useEffect(() => {
    const sub = client.subscribe(`/topic/delivery/${orderId}`, (msg) => {
      const { lat, lng } = JSON.parse(msg.body)
      setDeliveryCoords({ lat, lng })
      mapRef.current?.easeTo({ center: [lng, lat], duration: 1000 })
    })
    return () => sub.unsubscribe()
  }, [orderId])

  return (
    <Map ref={mapRef} ...>
      {/* Shop pin */}
      <Marker longitude={shopCoords.lng} latitude={shopCoords.lat}>
        <ShopMarker />
      </Marker>
      {/* Customer drop pin */}
      <Marker longitude={dropCoords.lng} latitude={dropCoords.lat}>
        <HomeMarker />
      </Marker>
      {/* Moving delivery pin */}
      {deliveryCoords && (
        <Marker longitude={deliveryCoords.lng} latitude={deliveryCoords.lat}>
          <DeliveryBikeMarker />
        </Marker>
      )}
    </Map>
  )
}
```

---

## Delivery Navigation (Turn-by-Turn)

```tsx
// components/delivery/NavigationMap.tsx
import mapboxgl from 'mapbox-gl'
import MapboxDirections from '@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions'
import '@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions.css'

useEffect(() => {
  const map = new mapboxgl.Map({
    container: mapContainerRef.current,
    style: 'mapbox://styles/mapbox/navigation-night-v1',
    center: [currentLng, currentLat],
    zoom: 15,
  })

  const directions = new MapboxDirections({
    accessToken: process.env.NEXT_PUBLIC_MAPBOX_TOKEN,
    unit: 'metric',
    profile: 'mapbox/driving',
    controls: { inputs: false, instructions: true },
  })

  map.addControl(directions, 'top-left')

  directions.setOrigin([currentLng, currentLat])
  directions.setDestination([destinationLng, destinationLat])

  // GPS watch
  const watchId = navigator.geolocation.watchPosition(({ coords }) => {
    directions.setOrigin([coords.longitude, coords.latitude])
    postLocationToWebSocket(coords)
  }, null, { enableHighAccuracy: true })

  return () => {
    navigator.geolocation.clearWatch(watchId)
    map.remove()
  }
}, [])
```

---

## Map Styles Used

| Context | Mapbox Style |
|---------|-------------|
| Customer discovery, shop pages | `mapbox://styles/mapbox/streets-v12` |
| Checkout address selector | `mapbox://styles/mapbox/streets-v12` |
| Customer live tracking | `mapbox://styles/mapbox/streets-v12` |
| Delivery navigation (day) | `mapbox://styles/mapbox/navigation-day-v1` |
| Delivery navigation (night) | `mapbox://styles/mapbox/navigation-night-v1` |

Time-of-day detection switches between day and night navigation styles automatically.
