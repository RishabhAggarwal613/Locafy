# Reels

Reels are short product showcase videos uploaded by vendors. The customer reels feed is a full-screen, vertically scrollable experience — similar to TikTok or Instagram Reels — but every video is a real product available for purchase nearby.

---

## Vendor — Uploading a Reel

### Upload Flow

1. Vendor navigates to Reel Studio in the vendor app (`/vendor/reels/new`)
2. Selects or drags a video file (MP4 / MOV, ≤ 60 seconds, ≤ 100MB)
3. Upload progress bar shows while file is sent to Spring Boot
4. Spring Boot uses Cloudinary Java SDK to upload the video

```java
// CloudinaryService.java
Map<String, Object> params = new HashMap<>();
params.put("resource_type", "video");
params.put("folder", "reels/" + vendorId);
params.put("eager", List.of(
    Map.of("streaming_profile", "hd", "format", "m3u8")
));
params.put("eager_async", true);
params.put("notification_url", "https://api.locafy.in/api/reels/cloudinary-notify");

Map result = cloudinary.uploader().upload(videoFile.getBytes(), params);
```

5. Cloudinary transcodes the video to **adaptive HLS** (multiple bitrates: 360p, 720p, 1080p)
6. A webhook from Cloudinary notifies Spring Boot when transcoding is complete
7. Spring Boot updates the reel document with the HLS master playlist URL and auto-generated thumbnail

### Reel Metadata Form

After upload, vendor fills in:
- **Title** (optional, shown as overlay)
- **Description / Caption** (shown as overlay, supports hashtags)
- **Product Tag** — select one product from their shop (links reel → product page)
- **Publish / Schedule / Draft**

---

## Customer — Watching Reels

### Feed Architecture

The reels feed uses **cursor-based infinite scroll**. When the user reaches the second-to-last reel, the next batch is pre-fetched.

```typescript
// Customer reels feed
const { data, fetchNextPage } = useInfiniteQuery({
  queryKey: ['reels', { lat, lng }],
  queryFn: ({ pageParam }) =>
    reelsApi.getFeed({ lat, lng, cursor: pageParam, size: 5 }),
  getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
})
```

### Geo-Ranked Feed Algorithm

The backend ranks reels using a composite formula:

```
reelScore = proximityScore * 0.4
           + engagementScore * 0.3
           + recencyScore * 0.2
           + videoQualityScore * 0.1

proximityScore  = 1 / (1 + distanceKm)
engagementScore = (likes + saves * 2 + views * 0.01) / 1000  [capped at 1.0]
recencyScore    = 1.0 if < 24h, 0.7 if < 7d, 0.3 if < 30d, 0.1 otherwise
videoQualityScore = 1.0 if HLS ready, 0 otherwise
```

Reels from shops outside the user's radius (default 10km) are excluded.

### Video Player

Each reel uses **HLS.js** for adaptive bitrate streaming:

```typescript
// components/customer/ReelCard.tsx
import Hls from 'hls.js'

useEffect(() => {
  if (Hls.isSupported() && videoRef.current) {
    const hls = new Hls({ autoStartLoad: true })
    hls.loadSource(reel.videoUrl) // Cloudinary HLS master URL
    hls.attachMedia(videoRef.current)
  }
}, [reel.videoUrl])
```

**Autoplay behaviour:**
- The reel currently in the viewport autoplays (muted by default)
- All other reels are paused
- Intersection Observer API detects which reel is in the viewport
- Audio unmutes on tap

---

## Controls & Interactions

| Action | UI | API Call |
|--------|----|---------|
| Like | Heart icon (animates on tap) | `POST /api/reels/:id/like` |
| Unlike | Tap liked heart | `POST /api/reels/:id/like` (toggle) |
| Save | Bookmark icon | `POST /api/reels/:id/save` |
| View Product | Product tag overlay, tap | Navigate to `/products/:productId` |
| View Shop | Shop avatar / name, tap | Navigate to `/shops/:shopId` |
| Share | Share icon | Web Share API |

**Optimistic Updates:** Like and save actions update the UI immediately before the API response, with rollback on error.

---

## Reel Overlay UI

```
┌──────────────────────────────────┐
│                                  │
│         [Video Playing]          │
│                                  │
│                        [♥ 1.2k]  │ ← Like
│                        [🔖 342]  │ ← Save
│                        [➦ Share] │ ← Share
│                                  │
│ [Shop Avatar] Spice Garden       │
│ Chicken Biryani — ₹180           │
│ [View Product →]  [Visit Shop →] │
└──────────────────────────────────┘
```

---

## Saved Reels

Customers can save reels to watch later:

```
GET /api/reels/saved
→ Returns customer's saved reels (paginated)
```

Saved reels are accessible via the Profile page under "Saved" tab.

---

## Performance Optimizations

| Optimization | Detail |
|-------------|--------|
| Lazy loading | Only the current and next 2 reels have the video src attached |
| Preloading | Next reel's HLS manifest is fetched when user is on the 2nd-to-last visible reel |
| Thumbnail first | Cloudinary thumbnail shown until HLS is ready |
| Connection-aware quality | HLS.js auto-selects bitrate based on connection speed |
| Feed cache | TanStack Query caches reel pages; staleTime: 5 minutes |
| Redis | Hot reel feed (top 50 local reels) cached in Redis per locality (TTL: 10 min) |
