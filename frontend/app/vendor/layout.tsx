import type { Metadata } from 'next'
import { Providers } from '@/components/shared/Providers'

export const metadata: Metadata = {
  title: { default: 'Locafy Vendor', template: '%s | Locafy Vendor' },
}

export default function VendorLayout({ children }: { children: React.ReactNode }) {
  return <Providers>{children}</Providers>
}
