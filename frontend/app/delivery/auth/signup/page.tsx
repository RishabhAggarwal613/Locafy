import { redirect } from 'next/navigation'

export default function DeliverySignupRedirect() {
  redirect('/delivery/auth?mode=signup')
}
