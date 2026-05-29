# Search & Discovery

Locafy's search is powered by **MongoDB Atlas Search** (Lucene-based) combined with **geospatial queries** and a custom scoring model that ranks results by distance, rating, and activity.

---

## Search Types

| Type | What It Finds | Endpoint |
|------|--------------|----------|
| Unified | Products + shops mixed | `GET /api/search?type=ALL` |
| Products | Products from nearby shops | `GET /api/search?type=PRODUCT` |
| Shops | Shop names, categories | `GET /api/search?type=SHOP` |
| Category Browse | All shops/products in a category | `GET /api/search?category=food` |
| Autocomplete | Real-time suggestions as you type | `GET /api/search/autocomplete?q=...` |

---

## Atlas Search Index Configuration

Two Atlas Search indexes are maintained:

### Index 1: `products_search`

Applied to the `products` collection:

```json
{
  "mappings": {
    "dynamic": false,
    "fields": {
      "name": [
        { "type": "string", "analyzer": "lucene.standard" },
        { "type": "autocomplete", "tokenization": "edgeGram", "minGrams": 2, "maxGrams": 10 }
      ],
      "description": { "type": "string", "analyzer": "lucene.standard" },
      "category": { "type": "string", "analyzer": "lucene.keyword" },
      "tags": { "type": "string", "analyzer": "lucene.standard" },
      "isAvailable": { "type": "boolean" },
      "price": { "type": "number" }
    }
  }
}
```

### Index 2: `shops_search`

Applied to the `shops` collection:

```json
{
  "mappings": {
    "dynamic": false,
    "fields": {
      "name": [
        { "type": "string", "analyzer": "lucene.standard" },
        { "type": "autocomplete", "tokenization": "edgeGram", "minGrams": 2, "maxGrams": 15 }
      ],
      "description": { "type": "string", "analyzer": "lucene.standard" },
      "categories": { "type": "string", "analyzer": "lucene.keyword" },
      "tags": { "type": "string", "analyzer": "lucene.standard" },
      "isActive": { "type": "boolean" },
      "isVerified": { "type": "boolean" }
    }
  }
}
```

---

## Search Algorithm

### Stage 1: Atlas Search (Text Matching)

The text query is run as a **compound** Atlas Search query:

```json
{
  "$search": {
    "index": "products_search",
    "compound": {
      "must": [
        {
          "text": {
            "query": "<user query>",
            "path": ["name", "description", "tags"],
            "fuzzy": { "maxEdits": 1, "prefixLength": 3 }
          }
        }
      ],
      "filter": [
        { "equals": { "path": "isAvailable", "value": true } }
      ]
    }
  }
}
```

**Fuzzy matching** with `maxEdits: 1` handles typos (e.g. "aple" → "apple", "chiken" → "chicken").

### Stage 2: Geospatial Filter

After text matching, results are filtered by proximity using a `$geoNear` aggregation stage (or combined with `$search` via the `geoWithin` filter in Atlas Search):

```json
{
  "$geoNear": {
    "near": { "type": "Point", "coordinates": [<lng>, <lat>] },
    "distanceField": "distanceMetres",
    "maxDistance": <radius * 1000>,
    "spherical": true,
    "query": { "isActive": true }
  }
}
```

### Stage 3: Distance Confirmation (Top 20)

For the top 20 shop results, **Google Maps Distance Matrix API** is called to get accurate road distance (as opposed to straight-line). The final sort uses road distance.

### Stage 4: Composite Scoring

Shops are ranked by a composite score:

```
score = (1 / roadDistanceKm) * 0.5
      + (rating / 5)         * 0.3
      + (activeListings / maxListings) * 0.1
      + (recencyBoost)       * 0.1
```

Where `recencyBoost` is 1.0 if the shop had activity in the last 7 days, 0.5 otherwise.

---

## Filter Options

| Filter | Type | Implementation |
|--------|------|---------------|
| Distance radius | Number (km) | `$geoNear maxDistance` |
| Category | String[] | Atlas Search `filter.equals` on `categories` |
| Price range | Number range | Atlas Search `range` filter on `price` |
| Min rating | Float | MongoDB `$match { rating: { $gte: n } }` |
| Open now | Boolean | Computed field `isOpen` in `$match` |
| Delivery available | Boolean | `deliveryAvailable: true` in `$match` |

All filters are applied as a single aggregation pipeline — no N+1 queries.

---

## Autocomplete

The autocomplete endpoint returns suggestions in under 100ms:

```
GET /api/search/autocomplete?q=chick&lat=12.97&lng=77.59

Response:
{
  "suggestions": [
    { "text": "Chicken Biryani", "type": "PRODUCT", "shopName": "Spice Garden" },
    { "text": "Chicken Shop", "type": "SHOP" },
    { "text": "Chicken & Grills", "type": "SHOP" }
  ]
}
```

**Implementation:** Atlas Search `autocomplete` operator using edge-gram tokenization. Results are cached in Redis for 60 seconds per (prefix, location) pair.

---

## Caching Strategy

| Cache Key | TTL | Contents |
|-----------|-----|----------|
| `search:<query>:<lat>:<lng>:<radius>:<filters_hash>` | 5 min | Paginated search results |
| `shops:locality:<localityId>` | 10 min | Top 100 shops for a locality |
| `autocomplete:<prefix>:<lat>:<lng>` | 60 s | Autocomplete suggestions |
| `categories:all` | 24 h | Full category tree |

Cache is invalidated when:
- A shop updates their profile
- A product is added/removed
- A shop's `isActive` status changes

---

## Frontend Implementation

### Search Page (`/search`)

```tsx
// Infinite query with TanStack Query
const { data, fetchNextPage, hasNextPage } = useInfiniteQuery({
  queryKey: ['search', query, filters, { lat, lng }],
  queryFn: ({ pageParam = 0 }) =>
    searchApi.search({ q: query, ...filters, lat, lng, page: pageParam }),
  getNextPageParam: (lastPage) => lastPage.hasMore ? lastPage.nextPage : undefined,
})
```

### Autocomplete

```tsx
// Debounced autocomplete
const { data: suggestions } = useQuery({
  queryKey: ['autocomplete', debouncedQuery, { lat, lng }],
  queryFn: () => searchApi.autocomplete({ q: debouncedQuery, lat, lng }),
  enabled: debouncedQuery.length >= 2,
  staleTime: 60_000,
})
```

---

## Distance Display

All distances shown to users are **road distances** (from Google Maps Distance Matrix), not straight-line. Road distances are only fetched for the top results displayed on screen. Subsequent pages use straight-line estimates until the user scrolls.

Examples of distance display:
- < 1 km: "0.8 km away"
- 1–5 km: "2.3 km away"
- > 5 km: "8 km away" (shown but de-ranked)
