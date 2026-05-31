'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import VendorShell from '@/components/vendor/VendorShell'
import { vendorApi } from '@/lib/api/shops'
import { reelsApi } from '@/lib/api/reels'
import type { Reel } from '@/types'

export default function VendorReelsPage() {
  const [reels, setReels] = useState<Reel[]>([])
  const [loading, setLoading] = useState(true)
  const [hasShop, setHasShop] = useState(true)

  useEffect(() => {
    Promise.all([vendorApi.getDashboard(), reelsApi.getMine(0, 50)])
      .then(([dashboard, res]) => {
        setHasShop(dashboard.hasShop)
        setReels(res.content)
      })
      .catch((err) => {
        if (err?.response?.status === 404) setHasShop(false)
        else toast.error('Failed to load reels')
      })
      .finally(() => setLoading(false))
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this reel?')) return
    try {
      await reelsApi.delete(id)
      setReels((prev) => prev.filter((r) => r.id !== id))
      toast.success('Reel deleted')
    } catch {
      toast.error('Failed to delete reel')
    }
  }

  const handlePublish = async (reel: Reel) => {
    try {
      const updated = await reelsApi.update(reel.id, { isPublished: true })
      setReels((prev) => prev.map((r) => (r.id === reel.id ? updated : r)))
      toast.success('Reel published')
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(msg || 'Failed to publish reel')
    }
  }

  if (!hasShop && !loading) {
    return (
      <VendorShell>
        <div className="max-w-lg">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Reel Studio</h1>
          <p className="text-gray-600 mb-4">Set up your shop before uploading product reels.</p>
          <Link href="/vendor/shop" className="text-emerald-600 font-medium hover:underline">
            Create shop →
          </Link>
        </div>
      </VendorShell>
    )
  }

  return (
    <VendorShell>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reel Studio</h1>
          <p className="text-sm text-gray-500 mt-1">Short product videos for local customers</p>
        </div>
        <Link
          href="/vendor/reels/new"
          className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700"
        >
          + Upload reel
        </Link>
      </div>

      {loading && <p className="text-gray-500 text-sm">Loading reels…</p>}

      {!loading && reels.length === 0 && (
        <div className="text-center py-16 border border-dashed border-gray-200 rounded-xl">
          <p className="text-gray-500 mb-3">No reels yet.</p>
          <Link href="/vendor/reels/new" className="text-emerald-600 font-medium hover:underline">
            Upload your first reel →
          </Link>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {reels.map((reel) => (
          <div key={reel.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="aspect-[9/16] bg-gray-100 relative">
              {reel.thumbnailUrl ? (
                <img src={reel.thumbnailUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-4xl">🎬</div>
              )}
              <span className={`absolute top-2 left-2 text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full ${
                reel.isPublished ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
              }`}>
                {reel.isPublished ? 'Published' : 'Draft'}
              </span>
              {reel.processingStatus === 'PROCESSING' && (
                <span className="absolute top-2 right-2 text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                  Processing
                </span>
              )}
            </div>
            <div className="p-3">
              <p className="font-medium text-sm truncate">{reel.title || reel.description || 'Untitled reel'}</p>
              <p className="text-xs text-gray-500 mt-1">
                ♥ {reel.likes} · 🔖 {reel.saves} · 👁 {reel.views}
              </p>
              <div className="flex gap-2 mt-3">
                {!reel.isPublished && (
                  <button
                    type="button"
                    onClick={() => handlePublish(reel)}
                    className="text-xs bg-emerald-50 text-emerald-700 px-2 py-1 rounded-lg hover:bg-emerald-100"
                  >
                    Publish
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleDelete(reel.id)}
                  className="text-xs text-red-500 hover:underline"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </VendorShell>
  )
}
