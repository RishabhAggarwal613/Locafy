# Maps & Navigation

Locafy uses **Mapbox GL JS** for all map-related features: shop discovery, delivery address selection, and delivery partner navigation.

---

## Use Cases

| Feature | User | Map Type |
|---------|------|----------|
| Shop discovery map | Customer | Static + interactive pins |
| Address selector | Customer checkout | Interactive pin drop |
| Delivery tracking | Customer (order page) | Live delivery pin |
| Turn-by-turn navigation | Delivery partner | Full navigation |
| Shop location pin | Shop profile page | Static shop pin |

---

## Shop Discovery Map

Shown as a toggle view on the Search page (alongside the card list).

**Features:**
- All nearby shops shown as custom map pins
- Pin colour coded by category
- Cluster pins when zoomed out
- Click pin → shows shop popup (name, rating, distance, "View Shop" button)
- Map auto-centres on user's current locality
- Sync with list view — scrolling the card list highlights the corresponding pin

**Implementation:**

```tsx
// components/customer/ShopMap.tsx
import Map, { Marker, Popup, NavigationControl } from 'react-map-gl'

<Map
  mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
  initialViewState={{ longitude: userLng, latitude: userLat, zoom: 13 }}
  style={{ width: '100%', height: '100%' }}
  mapStyle="mapbox://styles/mapbox/streets-v12"
>
  <NavigationControl />
  {shops.map(shop => (
    <Marker key={shop._id} longitude={shop.location.coordinates[0]} latitude={shop.location.coordinates[1]}>
      <ShopPin shop={shop} onClick={() => setSelectedShop(shop)} />
    </Marker>
  ))}
  {selectedShop && (
    <Popup longitude={...} latitude={...} onClose={() => setSelectedShop(null)}>
      <ShopPopup shop={selectedShop} />
    </Popup>
  )}
</Map>
```

---

## Address Selector (Delivery Checkout)

When the customer adds a delivery address, they can drop a pin on a Mapbox map to set the exact location:

1. Map shows current address (geocoded from text input)
2. Draggable pin — user moves it to exact doorstep
3. Reverse geocoding fills the address form fields automatically
4. Coordinates saved with address in MongoDB

**Reverse Geocoding:**

```typescript
const response = await fetch(
  `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${TOKEN}`
)
const { features } = await response.json()
const address = features[0].place_name
```

---

## Live Delivery Tracking (Customer)

When an order is OUT_FOR_DELIVERY, the customer sees a live map showing the delivery partner's real-time location.

**Architecture:**
```
Delivery partner's device
  → POST GPS coords to WebSocket /app/delivery/location every 5s
  → Spring Boot receives, stores in deliveryLocations collection
  → Spring Boot relays to /topic/delivery/:orderId
  → Customer's browser subscribed to /topic/delivery/:orderId
  → Map pin moves in real-time
```

**Frontend:**

```tsx
// components/customer/LiveTrackingMap.tsx
const client = useStompClient()

useEffect(() => {
  const subscription = client.subscribe(
    `/topic/delivery/${orderId}`,
    (message) => {
      const { lat, lng } = JSON.parse(message.body)
      setDeliveryCoords({ lat, lng })
    }
  )
  return () => subscription.unsubscribe()
}, [orderId])

// Map renders:
// - Customer's drop address (static)
// - Shop location (static)
// - Delivery partner's real-time pin (animated smooth move)
```

**Smooth pin animation:**

```tsx
// Animate pin move using Mapbox's easeTo
useEffect(() => {
  if (mapRef.current && deliveryCoords) {
    mapRef.current.easeTo({
      center: [deliveryCoords.lng, deliveryCoords.lat],
      duration: 1000, // 1s smooth pan
    })
  }
}, [deliveryCoords])
```

---

## Delivery Partner Navigation

The delivery partner navigation page is a full-screen Mapbox navigation experience.

**Libraries:**
- `mapbox-gl` for the map
- `@mapbox/mapbox-gl-directions` for routing and turn-by-turn guidance
- Web Geolocation API for real-time GPS

**Two-waypoint flow:**

```typescript
// Phase 1: Navigate to shop
const directions = new MapboxDirections({
  accessToken: MAPBOX_TOKEN,
  unit: 'metric',
  profile: 'mapbox/driving',
})
directions.setOrigin([currentLng, currentLat])
directions.setDestination([shopLng, shopLat])

// Phase 2: Navigate to customer (after pickup)
directions.setDestination([customerLng, customerLat])
```

**Navigation UI:**
- Top banner: next turn instruction + distance
- Route line on map
- Remaining distance and ETA
- "Picked Up" / "Delivered" action button

**GPS posting:**

```typescript
// Post GPS coords every 5 seconds while navigating
const watchId = navigator.geolocation.watchPosition((position) => {
  const { latitude, longitude, heading, speed } = position.coords
  stompClient.publish({
    destination: '/app/delivery/location',
    body: JSON.stringify({ orderId, lat: latitude, lng: longitude, heading, speed }),
  })
}, null, { enableHighAccuracy: true, maximumAge: 0 })

return () => navigator.geolocation.clearWatch(watchId)
```

---

## Mapbox Tokens & Configuration

- **Public token** (`NEXT_PUBLIC_MAPBOX_TOKEN`) — used in the browser for map rendering
- **Secret token** — only used server-side for Mapbox Directions API calls (server-side route calculation)

Map styles used:
- `mapbox://styles/mapbox/streets-v12` — customer discovery and shop pages
- `mapbox://styles/mapbox/navigation-night-v1` — delivery navigation (dark for night driving)

---

## Google Maps Distance Matrix (Backend)

While Mapbox handles all UI-facing maps, **Google Maps Distance Matrix API** is used server-side to get accurate road distances for shop ranking:

```java
// GoogleMapsService.java
DistanceMatrixApiRequest request = DistanceMatrixApi.newRequest(context)
    .origins(new LatLng(userLat, userLng))
    .destinations(shopLatLngs)
    .mode(TravelMode.DRIVING)
    .units(Unit.METRIC);

DistanceMatrix result = request.await();
// Parse result.rows[0].elements[i].distance.inMeters
```

Called only for the **top 20 shop results** to minimize API costs. All other results use straight-line distance from MongoDB `$geoNear`.
