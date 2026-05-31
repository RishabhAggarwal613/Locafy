'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Hls from 'hls.js'
import type { Reel } from '@/types'

interface ReelCardProps {
  reel: Reel
  active: boolean
  onLike: () => void
  onSave: () => void
  liking?: boolean
  saving?: boolean
}

function formatCount(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`
  return String(n)
}

export default function ReelCard({ reel, active, onLike, onSave, liking, saving }: ReelCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const hlsRef = useRef<Hls | null>(null)
  const [muted, setMuted] = useState(true)

  useEffect(() => {
    const video = videoRef.current
    if (!video || !reel.videoUrl) return

    if (hlsRef.current) {
      hlsRef.current.destroy()
      hlsRef.current = null
    }

    if (reel.videoUrl.includes('.m3u8') && Hls.isSupported()) {
      const hls = new Hls({ enableWorker: true })
      hls.loadSource(reel.videoUrl)
      hls.attachMedia(video)
      hlsRef.current = hls
    } else {
      video.src = reel.videoUrl
    }

    return () => {
      hlsRef.current?.destroy()
      hlsRef.current = null
    }
  }, [reel.videoUrl])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    if (active) {
      video.play().catch(() => {})
    } else {
      video.pause()
      video.currentTime = 0
    }
  }, [active])

  return (
    <section className="relative h-[100dvh] w-full snap-start snap-always bg-black flex items-center justify-center overflow-hidden">
      {!active && reel.thumbnailUrl && (
        <img
          src={reel.thumbnailUrl}
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-60"
        />
      )}

      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        loop
        playsInline
        muted={muted}
        poster={reel.thumbnailUrl}
        onClick={() => setMuted((m) => !m)}
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30 pointer-events-none" />

      <div className="absolute right-3 bottom-28 flex flex-col items-center gap-5 z-10">
        <button
          type="button"
          onClick={onLike}
          disabled={liking}
          className="flex flex-col items-center gap-1 text-white"
          aria-label={reel.isLiked ? 'Unlike' : 'Like'}
        >
          <span className={`text-2xl transition-transform ${reel.isLiked ? 'scale-110' : ''}`}>
            {reel.isLiked ? '❤️' : '🤍'}
          </span>
          <span className="text-xs font-medium">{formatCount(reel.likes)}</span>
        </button>
        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="flex flex-col items-center gap-1 text-white"
          aria-label={reel.isSaved ? 'Unsave' : 'Save'}
        >
          <span className="text-2xl">{reel.isSaved ? '🔖' : '📑'}</span>
          <span className="text-xs font-medium">{formatCount(reel.saves)}</span>
        </button>
        {typeof navigator !== 'undefined' && navigator.share && (
          <button
            type="button"
            onClick={() =>
              navigator.share({
                title: reel.title || reel.shopName,
                text: reel.description,
                url: `${window.location.origin}/customer/reels?reel=${reel.id}`,
              }).catch(() => {})
            }
            className="text-2xl text-white"
            aria-label="Share"
          >
            ➦
          </button>
        )}
      </div>

      <div className="absolute left-0 right-16 bottom-0 p-4 pb-8 z-10 text-white">
        <Link href={`/customer/shops/${reel.shopId}`} className="flex items-center gap-2 mb-2">
          {reel.shopLogoUrl ? (
            <img src={reel.shopLogoUrl} alt="" className="w-8 h-8 rounded-full object-cover border border-white/30" />
          ) : (
            <span className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm">🏪</span>
          )}
          <span className="font-semibold text-sm">{reel.shopName}</span>
          {reel.distanceKm != null && (
            <span className="text-xs text-white/70">{reel.distanceKm.toFixed(1)} km</span>
          )}
        </Link>

        {reel.title && <p className="font-medium text-sm mb-1">{reel.title}</p>}
        {reel.description && (
          <p className="text-sm text-white/90 line-clamp-2 mb-2">{reel.description}</p>
        )}

        {reel.productId && (
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <span className="text-sm">
              {reel.productName}
              {reel.productPrice != null && ` — ₹${reel.productPrice}`}
            </span>
            <Link
              href={`/customer/products/${reel.productId}`}
              className="text-xs bg-white text-black px-3 py-1 rounded-full font-medium"
            >
              View product
            </Link>
          </div>
        )}

        {muted && active && (
          <p className="text-[10px] text-white/60 mt-2">Tap video to unmute</p>
        )}
      </div>
    </section>
  )
}
