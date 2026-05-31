import { redirect } from 'next/navigation'

export default function VendorSignupRedirect() {
  redirect('/vendor/auth?mode=signup')
}
