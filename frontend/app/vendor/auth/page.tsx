import RoleAuthPanel from '@/components/shared/auth/RoleAuthPanel'
import { ROLE_AUTH_CONFIG } from '@/lib/auth/roleAuthConfig'

interface Props {
  searchParams: { mode?: string }
}

export default function VendorAuthPage({ searchParams }: Props) {
  const initialMode = searchParams.mode === 'signup' ? 'signup' : 'login'
  return (
    <RoleAuthPanel
      config={ROLE_AUTH_CONFIG.VENDOR}
      marketingHref="/vendor"
      initialMode={initialMode}
    />
  )
}
