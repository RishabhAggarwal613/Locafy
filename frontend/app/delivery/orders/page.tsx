import { Suspense } from 'react'
import DeliveryShell from '@/components/delivery/DeliveryShell'
import DeliveryOrdersContent from './DeliveryOrdersContent'

export default function DeliveryOrdersPage() {
  return (
    <Suspense fallback={
      <DeliveryShell>
        <p className="text-gray-400 animate-pulse">Loading orders...</p>
      </DeliveryShell>
    }>
      <DeliveryOrdersContent />
    </Suspense>
  )
}
