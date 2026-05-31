'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import ReelCard from './ReelCard'
import { reelsApi } from '@/lib/api/reels'
import { useLocationStore } from '@/store/locationStore'
import { useAuthStore } from '@/store/authStore'
import type { Reel } from '@/types'

export default function ReelFeed() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const { lat, lng, setLocation } = useLocationStore()
  const { user } = useAuthStore()
  const queryClient = useQueryClient()

  useEffect(() => {
    if (lat == null || lng == null) {
      setLocation('Delhi', 28.6139, 77.2090)
    }
  }, [lat, lng, setLocation])

  const coords = { lat: lat ?? 28.6139, lng: lng ?? 77.2090 }

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError } = useInfiniteQuery({
    queryKey: ['reels', coords],
    queryFn: ({ pageParam }) =>
      reelsApi.getFeed({ ...coords, cursor: pageParam as string | undefined, size: 5 }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => (last.hasMore ? last.nextCursor ?? undefined : undefined),
    enabled: lat != null && lng != null,
    staleTime: 5 * 60 * 1000,
  })

  const reels: Reel[] = data?.pages.flatMap((p) => p.content) ?? []

  useEffect(() => {
    const root = containerRef.current
    if (!root) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = Number(entry.target.getAttribute('data-index'))
            if (!Number.isNaN(idx)) setActiveIndex(idx)
          }
        })
      },
      { root, threshold: 0.6 }
    )

    root.querySelectorAll('[data-index]').forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [reels.length])

  useEffect(() => {
    if (reels.length > 0 && activeIndex >= reels.length - 2 && hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }, [activeIndex, reels.length, hasNextPage, isFetchingNextPage, fetchNextPage])

  const patchReel = useCallback((id: string, patch: Partial<Reel>) => {
    queryClient.setQueryData(['reels', coords], (old: typeof data) => {
      if (!old) return old
      return {
        ...old,
        pages: old.pages.map((page) => ({
          ...page,
          content: page.content.map((r) => (r.id === id ? { ...r, ...patch } : r)),
        })),
      }
    })
  }, [queryClient, coords])

  const likeMutation = useMutation({
    mutationFn: (id: string) => reelsApi.toggleLike(id),
    onMutate: async (id) => {
      const reel = reels.find((r) => r.id === id)
      if (!reel) return
      patchReel(id, {
        isLiked: !reel.isLiked,
        likes: reel.isLiked ? reel.likes - 1 : reel.likes + 1,
      })
    },
    onError: (_err, id) => {
      const reel = reels.find((r) => r.id === id)
      if (reel) patchReel(id, { isLiked: reel.isLiked, likes: reel.likes })
      toast.error('Sign in to like reels')
    },
  })

  const saveMutation = useMutation({
    mutationFn: (id: string) => reelsApi.toggleSave(id),
    onMutate: async (id) => {
      const reel = reels.find((r) => r.id === id)
      if (!reel) return
      patchReel(id, {
        isSaved: !reel.isSaved,
        saves: reel.isSaved ? reel.saves - 1 : reel.saves + 1,
      })
    },
    onError: (_err, id) => {
      const reel = reels.find((r) => r.id === id)
      if (reel) patchReel(id, { isSaved: reel.isSaved, saves: reel.saves })
      toast.error('Sign in to save reels')
    },
  })

  const handleLike = (id: string) => {
    if (!user) {
      toast.error('Sign in to like reels')
      return
    }
    likeMutation.mutate(id)
  }

  const handleSave = (id: string) => {
    if (!user) {
      toast.error('Sign in to save reels')
      return
    }
    saveMutation.mutate(id)
  }

  return (
    <div className="relative h-[100dvh] bg-black">
      <header className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-4 py-3 bg-gradient-to-b from-black/60 to-transparent">
        <Link href="/customer/explore" className="text-white text-sm font-medium">
          ← Explore
        </Link>
        <span className="text-white font-bold">Reels</span>
        <Link href="/customer/profile" className="text-white text-sm">
          Saved
        </Link>
      </header>

      {isLoading && (
        <div className="h-full flex items-center justify-center text-white/70">Loading reels…</div>
      )}

      {isError && (
        <div className="h-full flex flex-col items-center justify-center text-white/70 gap-2 px-6 text-center">
          <p>Could not load reels.</p>
          <Link href="/customer/explore" className="text-indigo-400 text-sm">Back to explore</Link>
        </div>
      )}

      {!isLoading && !isError && reels.length === 0 && (
        <div className="h-full flex flex-col items-center justify-center text-white/70 gap-2 px-6 text-center">
          <p>No reels nearby yet.</p>
          <p className="text-sm">Check back when local vendors post product videos.</p>
        </div>
      )}

      <div
        ref={containerRef}
        className="h-full overflow-y-auto snap-y snap-mandatory scroll-smooth"
      >
        {reels.map((reel, index) => (
          <div key={reel.id} data-index={index}>
            <ReelCard
              reel={reel}
              active={index === activeIndex}
              onLike={() => handleLike(reel.id)}
              onSave={() => handleSave(reel.id)}
              liking={likeMutation.isPending}
              saving={saveMutation.isPending}
            />
          </div>
        ))}
        {isFetchingNextPage && (
          <div className="h-20 flex items-center justify-center text-white/50 text-sm">Loading more…</div>
        )}
      </div>
    </div>
  )
}
