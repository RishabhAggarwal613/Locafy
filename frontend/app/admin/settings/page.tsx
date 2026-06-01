'use client'

import { useEffect, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import AdminShell from '@/components/admin/AdminShell'
import { adminApi, type PlatformSettings } from '@/lib/api/admin'

export default function AdminSettingsPage() {
  const queryClient = useQueryClient()
  const [form, setForm] = useState<Partial<PlatformSettings>>({})

  const { data, isLoading } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: () => adminApi.getSettings(),
  })

  useEffect(() => {
    if (data) setForm(data)
  }, [data])

  const save = useMutation({
    mutationFn: () => adminApi.updateSettings(form),
    onSuccess: () => {
      toast.success('Settings saved')
      queryClient.invalidateQueries({ queryKey: ['admin-settings'] })
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(msg ?? 'Save failed')
    },
  })

  const field = (key: keyof PlatformSettings, label: string, type: 'number' | 'text' | 'checkbox' = 'number') => (
    <label key={key} className="block">
      <span className="text-sm text-gray-400">{label}</span>
      {type === 'checkbox' ? (
        <input
          type="checkbox"
          checked={Boolean(form[key])}
          onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.checked }))}
          className="mt-2 block"
        />
      ) : (
        <input
          type={type}
          value={String(form[key] ?? '')}
          onChange={(e) => setForm((f) => ({
            ...f,
            [key]: type === 'number' ? Number(e.target.value) : e.target.value,
          }))}
          className="mt-1 w-full px-3 py-2 rounded-lg bg-gray-950 border border-gray-700 text-white text-sm"
        />
      )}
    </label>
  )

  return (
    <AdminShell>
      <h1 className="text-2xl font-bold text-white mb-6">Platform Settings</h1>

      {isLoading ? (
        <p className="text-gray-500 animate-pulse">Loading...</p>
      ) : (
        <div className="max-w-lg space-y-4 bg-gray-900 border border-gray-800 rounded-xl p-6">
          {field('platformFeePercent', 'Platform fee (%)')}
          {field('deliveryFeeBase', 'Delivery fee base (₹)')}
          {field('deliveryFeePerKm', 'Delivery fee per km (₹)')}
          {field('maxDeliveryRadiusKm', 'Max delivery radius (km)')}
          {field('maintenanceMode', 'Maintenance mode', 'checkbox')}
          {field('announcementBanner', 'Announcement banner', 'text')}
          <button type="button" onClick={() => save.mutate()} disabled={save.isPending}
            className="px-5 py-2.5 rounded-lg bg-rose-600 text-white text-sm font-medium hover:bg-rose-700 disabled:opacity-50">
            Save settings
          </button>
        </div>
      )}
    </AdminShell>
  )
}
