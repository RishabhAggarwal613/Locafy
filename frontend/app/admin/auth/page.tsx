import RoleAuthPanel from '@/components/shared/auth/RoleAuthPanel'
import { ROLE_AUTH_CONFIG } from '@/lib/auth/roleAuthConfig'

export default function AdminAuthPage() {
  return (
    <RoleAuthPanel
      config={ROLE_AUTH_CONFIG.ADMIN}
      marketingHref="/admin"
      initialMode="login"
    />
  )
}
