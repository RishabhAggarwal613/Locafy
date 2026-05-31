'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import CustomerShell from '@/components/customer/CustomerShell'
import { reelsApi } from '@/lib/api/reels'

export default function CustomerProfilePage() {
  const [tab, setTab] = useState<'saved'>('saved')

  const { data, isLoading } = useQuery({
    queryKey: ['reels-saved'],
    queryFn: () => reelsApi.getSaved(0, 30),
  })

  return (
    <CustomerShell>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
        <p className="text-sm text-gray-500 mt-1">Your saved reels and preferences</p>
      </div>

      <div className="flex gap-2 border-b border-gray-100 mb-6">
        <button
          type="button"
          onClick={() => setTab('saved')}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
            tab === 'saved'
              ? 'border-indigo-600 text-indigo-700'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Saved reels
        </button>
      </div>

      {tab === 'saved' && (
        <>
          {isLoading && <p className="text-gray-500 text-sm">Loading saved reels…</p>}
          {!isLoading && (data?.content.length ?? 0) === 0 && (
            <div className="text-center py-12 text-gray-500">
              <p className="mb-2">No saved reels yet.</p>
              <Link href="/customer/reels" className="text-indigo-600 text-sm font-medium hover:underline">
                Browse reels →
              </Link>
            </div>
          )}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {data?.content.map((reel) => (
              <Link
                key={reel.id}
                href={`/customer/reels?reel=${reel.id}`}
                className="group relative aspect-[9/16] rounded-xl overflow-hidden bg-gray-100"
              >
                {reel.thumbnailUrl ? (
                  <img src={reel.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-3xl">🎬</div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                <div className="absolute bottom-2 left-2 right-2">
                  <p className="text-white text-xs font-medium truncate drop-shadow">{reel.shopName}</p>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </CustomerShell>
  )
}
