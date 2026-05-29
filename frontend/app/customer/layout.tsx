import type { Metadata } from 'next'
import { Providers } from '@/components/shared/Providers'

export const metadata: Metadata = {
  title: { default: 'Locafy — Shop Local', template: '%s | Locafy' },
}

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  return <Providers>{children}</Providers>
}
