'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import Link from 'next/link'
import DeliveryShell from '@/components/delivery/DeliveryShell'
import { deliveryApi } from '@/lib/api/delivery'
import { useDeliveryPoolAlerts } from '@/lib/hooks/useDeliveryTracking'

export default function DeliveryDashboardPage() {
  const queryClient = useQueryClient()

  const { data: dashboard, isLoading } = useQuery({
    queryKey: ['delivery-dashboard'],
    queryFn: () => deliveryApi.getDashboard(),
  })

  const { data: profile } = useQuery({
    queryKey: ['delivery-profile'],
    queryFn: () => deliveryApi.getProfile(),
  })

  useDeliveryPoolAlerts(() => {
    queryClient.invalidateQueries({ queryKey: ['delivery-dashboard'] })
    queryClient.invalidateQueries({ queryKey: ['delivery-available'] })
  })

  const toggleOnline = useMutation({
    mutationFn: (isOnline: boolean) => deliveryApi.updateProfile({ isOnline }),
    onSuccess: (data) => {
      toast.success(data.isOnline ? 'You are online' : 'You are offline')
      queryClient.invalidateQueries({ queryKey: ['delivery-dashboard'] })
      queryClient.invalidateQueries({ queryKey: ['delivery-profile'] })
    },
    onError: () => toast.error('Could not update status'),
  })

  const setZoneFromBrowser = useMutation({
    mutationFn: () =>
      new Promise<{ lat: number; lng: number }>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          (p) => resolve({ lat: p.coords.latitude, lng: p.coords.longitude }),
          () => reject(new Error('Location denied')),
        )
      }).then(({ lat, lng }) => deliveryApi.updateProfile({ zoneLatitude: lat, zoneLongitude: lng, zoneRadiusKm: 5 })),
    onSuccess: () => {
      toast.success('Delivery zone updated to your location')
      queryClient.invalidateQueries({ queryKey: ['delivery-profile'] })
    },
    onError: () => toast.error('Enable location to set your zone'),
  })

  const isOnline = profile?.isOnline ?? dashboard?.isOnline ?? false

  return (
    <DeliveryShell>
      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Accept deliveries in your zone and track earnings</p>
        </div>
        <button
          type="button"
          disabled={toggleOnline.isPending}
          onClick={() => toggleOnline.mutate(!isOnline)}
          className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
            isOnline ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          {isOnline ? '● Online' : '○ Go Online'}
        </button>
      </div>

      {isLoading ? (
        <p className="text-gray-400 animate-pulse">Loading...</p>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {[
            { label: "Today's deliveries", value: dashboard?.todayDeliveries ?? 0, color: 'bg-amber-50 text-amber-800' },
            { label: "Today's earnings", value: `₹${dashboard?.todayEarnings ?? 0}`, color: 'bg-green-50 text-green-800' },
            { label: 'Available nearby', value: dashboard?.availableInZone ?? 0, color: 'bg-blue-50 text-blue-800' },
            { label: 'Active deliveries', value: dashboard?.activeOrders ?? 0, color: 'bg-orange-50 text-orange-800' },
            { label: 'Total deliveries', value: dashboard?.totalDeliveries ?? 0, color: 'bg-gray-50 text-gray-800' },
            { label: 'Total earnings', value: `₹${dashboard?.totalEarnings ?? 0}`, color: 'bg-emerald-50 text-emerald-800' },
          ].map(({ label, value, color }) => (
            <div key={label} className={`${color} rounded-xl p-5`}>
              <p className="text-2xl font-bold">{value}</p>
              <p className="text-sm mt-1 opacity-70">{label}</p>
            </div>
          ))}
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-100 p-5 mb-6">
        <h2 className="font-semibold text-gray-900 mb-2">Delivery zone</h2>
        <p className="text-sm text-gray-500 mb-4">
          {profile?.zoneLatitude
            ? `Centre: ${profile.zoneLatitude.toFixed(4)}, ${profile.zoneLongitude?.toFixed(4)} · ${profile.zoneRadiusKm ?? 5} km radius`
            : 'Set your zone to see nearby orders'}
        </p>
        <button
          type="button"
          onClick={() => setZoneFromBrowser.mutate()}
          className="text-sm text-amber-600 hover:underline mr-4"
        >
          Use my current location
        </button>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link href="/delivery/orders" className="px-5 py-2.5 bg-amber-500 text-white rounded-xl text-sm font-medium hover:bg-amber-600">
          Browse order pool →
        </Link>
        {(dashboard?.activeOrders ?? 0) > 0 && (
          <Link href="/delivery/orders?tab=active" className="px-5 py-2.5 border border-amber-300 text-amber-700 rounded-xl text-sm font-medium hover:bg-amber-50">
            Active delivery →
          </Link>
        )}
      </div>
    </DeliveryShell>
  )
}
