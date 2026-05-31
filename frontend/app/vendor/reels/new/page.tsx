'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import VendorShell from '@/components/vendor/VendorShell'
import { vendorApi } from '@/lib/api/shops'
import { reelsApi } from '@/lib/api/reels'
import type { Product } from '@/types'

export default function VendorNewReelPage() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [video, setVideo] = useState<File | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [productId, setProductId] = useState('')
  const [publish, setPublish] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    vendorApi.getMyProducts(0, 100)
      .then((res) => setProducts(res.content))
      .catch(() => toast.error('Failed to load products'))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!video) {
      toast.error('Select a video file')
      return
    }
    setUploading(true)
    setProgress(10)
    try {
      setProgress(40)
      await reelsApi.upload({
        video,
        title: title || undefined,
        description: description || undefined,
        productId: productId || undefined,
        publish,
      })
      setProgress(100)
      toast.success(publish ? 'Reel uploaded and published!' : 'Reel saved as draft')
      router.push('/vendor/reels')
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(msg || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <VendorShell>
      <div className="max-w-xl">
        <Link href="/vendor/reels" className="text-sm text-gray-500 hover:text-emerald-600 mb-4 inline-block">
          ← Back to reels
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Upload reel</h1>
        <p className="text-sm text-gray-500 mb-6">MP4 or MOV, max 60 seconds recommended, up to 100MB</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Video</label>
            <input
              type="file"
              accept="video/mp4,video/quicktime,video/*"
              onChange={(e) => setVideo(e.target.files?.[0] ?? null)}
              className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-emerald-50 file:text-emerald-700"
            />
            {video && (
              <p className="text-xs text-gray-500 mt-1">{video.name} ({(video.size / 1024 / 1024).toFixed(1)} MB)</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title (optional)</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
              placeholder="Fresh biryani special"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Caption</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
              placeholder="Describe your product… #local #fresh"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tag product (optional)</label>
            <select
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white"
            >
              <option value="">No product tag</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>{p.name} — ₹{p.discountedPrice ?? p.price}</option>
              ))}
            </select>
          </div>

          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={publish}
              onChange={(e) => setPublish(e.target.checked)}
              className="rounded border-gray-300 text-emerald-600"
            />
            Publish immediately after upload
          </label>

          {uploading && (
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 transition-all" style={{ width: `${progress}%` }} />
            </div>
          )}

          <button
            type="submit"
            disabled={uploading || !video}
            className="w-full bg-emerald-600 text-white py-2.5 rounded-lg font-medium hover:bg-emerald-700 disabled:opacity-50"
          >
            {uploading ? 'Uploading…' : 'Upload reel'}
          </button>
        </form>
      </div>
    </VendorShell>
  )
}
