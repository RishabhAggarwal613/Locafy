'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import AdminShell from '@/components/admin/AdminShell'
import { adminApi } from '@/lib/api/admin'

export default function AdminShopsPage() {
  const [filterPending, setFilterPending] = useState(false)
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin-shops', filterPending],
    queryFn: () => adminApi.listShops(filterPending),
  })

  const verifyShop = useMutation({
    mutationFn: ({ id, verified }: { id: string; verified: boolean }) =>
      adminApi.verifyShop(id, verified),
    onSuccess: () => {
      toast.success('Shop updated')
      queryClient.invalidateQueries({ queryKey: ['admin-shops'] })
      queryClient.invalidateQueries({ queryKey: ['admin-analytics'] })
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(msg ?? 'Update failed')
    },
  })

  const updateStatus = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      adminApi.updateShopStatus(id, active),
    onSuccess: () => {
      toast.success('Shop status updated')
      queryClient.invalidateQueries({ queryKey: ['admin-shops'] })
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(msg ?? 'Update failed')
    },
  })

  return (
    <AdminShell>
      <h1 className="text-2xl font-bold text-white mb-6">Shops</h1>

      <div className="flex gap-2 mb-6">
        <button type="button" onClick={() => setFilterPending(false)}
          className={`px-3 py-1.5 rounded-lg text-xs border ${!filterPending ? 'bg-rose-600 text-white border-rose-600' : 'border-gray-700 text-gray-400'}`}>
          All
        </button>
        <button type="button" onClick={() => setFilterPending(true)}
          className={`px-3 py-1.5 rounded-lg text-xs border ${filterPending ? 'bg-rose-600 text-white border-rose-600' : 'border-gray-700 text-gray-400'}`}>
          Pending verification
        </button>
      </div>

      {isLoading ? (
        <p className="text-gray-500 animate-pulse">Loading shops...</p>
      ) : !data?.content.length ? (
        <p className="text-gray-500">No shops found.</p>
      ) : (
        <div className="overflow-x-auto bg-gray-900 border border-gray-800 rounded-xl">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-800">
                <th className="p-4">Shop</th>
                <th className="p-4">City</th>
                <th className="p-4">Products</th>
                <th className="p-4">Verified</th>
                <th className="p-4">Active</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.content.map((shop) => (
                <tr key={shop.id} className="border-b border-gray-800/50 text-gray-300">
                  <td className="p-4 font-medium">{shop.name}</td>
                  <td className="p-4">{shop.city ?? '—'}</td>
                  <td className="p-4">{shop.productCount}</td>
                  <td className="p-4">{shop.verified ? 'Yes' : 'No'}</td>
                  <td className="p-4">{shop.active ? 'Yes' : 'No'}</td>
                  <td className="p-4 space-x-3">
                    {!shop.verified && (
                      <button type="button" onClick={() => verifyShop.mutate({ id: shop.id, verified: true })}
                        className="text-xs text-emerald-400 hover:text-emerald-300">Verify</button>
                    )}
                    {shop.verified && (
                      <button type="button" onClick={() => verifyShop.mutate({ id: shop.id, verified: false })}
                        className="text-xs text-amber-400 hover:text-amber-300">Unverify</button>
                    )}
                    <button type="button" onClick={() => updateStatus.mutate({ id: shop.id, active: !shop.active })}
                      className="text-xs text-rose-400 hover:text-rose-300">
                      {shop.active ? 'Suspend' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminShell>
  )
}
