import type { Metadata } from 'next'
import { Providers } from '@/components/shared/Providers'

export const metadata: Metadata = {
  title: { default: 'Locafy Delivery', template: '%s | Locafy Delivery' },
}

export default function DeliveryLayout({ children }: { children: React.ReactNode }) {
  return <Providers>{children}</Providers>
}
