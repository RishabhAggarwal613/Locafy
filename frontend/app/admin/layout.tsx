import type { Metadata } from 'next'
import { Providers } from '@/components/shared/Providers'

export const metadata: Metadata = {
  title: { default: 'Locafy Admin', template: '%s | Admin' },
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <Providers>{children}</Providers>
}
