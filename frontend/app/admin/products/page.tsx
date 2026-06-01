'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import AdminShell from '@/components/admin/AdminShell'
import { adminApi } from '@/lib/api/admin'

export default function AdminProductsPage() {
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin-flagged-products'],
    queryFn: () => adminApi.listFlaggedProducts(),
  })

  const hide = useMutation({
    mutationFn: (id: string) => adminApi.hideProduct(id),
    onSuccess: () => {
      toast.success('Product hidden')
      queryClient.invalidateQueries({ queryKey: ['admin-flagged-products'] })
    },
  })

  const dismiss = useMutation({
    mutationFn: (id: string) => adminApi.dismissProductFlag(id),
    onSuccess: () => {
      toast.success('Flag dismissed')
      queryClient.invalidateQueries({ queryKey: ['admin-flagged-products'] })
    },
  })

  return (
    <AdminShell>
      <h1 className="text-2xl font-bold text-white mb-2">Product Moderation</h1>
      <p className="text-gray-500 mb-6">Flagged products awaiting review.</p>

      {isLoading ? (
        <p className="text-gray-500 animate-pulse">Loading...</p>
      ) : !data?.content.length ? (
        <p className="text-gray-500">No flagged products.</p>
      ) : (
        <div className="space-y-4">
          {data.content.map((product) => (
            <div key={product.id} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <p className="font-semibold text-white">{product.name}</p>
              <p className="text-sm text-gray-500 mt-1">Shop: {product.shopId} · {product.flagReason ?? 'Flagged'}</p>
              <div className="flex gap-3 mt-3">
                <button type="button" onClick={() => hide.mutate(product.id)}
                  className="text-xs px-3 py-1.5 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10">
                  Hide product
                </button>
                <button type="button" onClick={() => dismiss.mutate(product.id)}
                  className="text-xs px-3 py-1.5 rounded-lg border border-gray-700 text-gray-400 hover:text-white">
                  Dismiss flag
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminShell>
  )
}
