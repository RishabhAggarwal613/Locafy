import type { UserRole } from '@/store/authStore'

export type AuthMode = 'login' | 'signup'

export interface RoleAuthConfig {
  role: UserRole
  appLabel: string
  badge: string
  headline: string
  description: string
  features: string[]
  icon: string
  stats?: { value: string; label: string }[]
  footnote?: string
  accent: {
    /** Full Tailwind gradient stops for hero panel */
    gradient: string
    /** Optional radial glow overlay */
    glow?: string
    button: string
    buttonHover: string
    ring: string
    inputFocus: string
    text: string
    tabActive: string
    badge: string
  }
  redirectAfterLogin: string
  redirectAfterSignup: string
  showGoogle: boolean
  allowSignup: boolean
  dark?: boolean
  loginEmailPlaceholder: string
}

export const ROLE_AUTH_CONFIG: Record<UserRole, RoleAuthConfig> = {
  CUSTOMER: {
    role: 'CUSTOMER',
    appLabel: 'Customer App',
    badge: '🛍️ For Customers',
    headline: 'Shop hyperlocal, effortlessly',
    description:
      'Discover nearby shops, browse products, and order for pickup or delivery — all within your neighbourhood.',
    features: ['Browse shops near you', 'Search products & categories', 'Track orders in real time'],
    icon: '🛍️',
    accent: {
      gradient: 'from-indigo-950 via-indigo-900 to-gray-900',
      glow: 'bg-[radial-gradient(ellipse_at_top_right,_#818cf8,_transparent_50%),radial-gradient(ellipse_at_bottom_left,_#a78bfa,_transparent_50%)]',
      button: 'bg-indigo-600',
      buttonHover: 'hover:bg-indigo-700',
      ring: 'focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100',
      inputFocus: 'focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100',
      text: 'text-indigo-600',
      tabActive: 'bg-indigo-600 text-white',
      badge: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    },
    redirectAfterLogin: '/customer/explore',
    redirectAfterSignup: '/customer/explore',
    showGoogle: true,
    allowSignup: true,
    loginEmailPlaceholder: 'you@example.com',
  },
  VENDOR: {
    role: 'VENDOR',
    appLabel: 'Vendor App',
    badge: '🏪 For Vendors',
    headline: 'Reach customers in your locality',
    description:
      'List your shop, post product reels, and manage orders from one dashboard. Join local vendors already growing on Locafy.',
    features: [
      'Create shop profile & upload products',
      'Get real-time order alerts',
      'Track sales & earnings daily',
    ],
    stats: [
      { value: '0%', label: 'commission — first 3 months' },
      { value: '↑40%', label: 'avg. sales growth' },
      { value: '5 km', label: 'hyperlocal reach' },
    ],
    icon: '🏪',
    accent: {
      gradient: 'from-emerald-950 via-emerald-900 to-gray-900',
      glow: 'bg-[radial-gradient(ellipse_at_top_right,_#6ee7b7,_transparent_50%),radial-gradient(ellipse_at_bottom_left,_#34d399,_transparent_50%)]',
      button: 'bg-emerald-600',
      buttonHover: 'hover:bg-emerald-700',
      ring: 'focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100',
      inputFocus: 'focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100',
      text: 'text-emerald-600',
      tabActive: 'bg-emerald-600 text-white',
      badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    },
    redirectAfterLogin: '/vendor/dashboard',
    redirectAfterSignup: '/vendor/shop',
    showGoogle: true,
    allowSignup: true,
    loginEmailPlaceholder: 'shop@example.com',
  },
  DELIVERY: {
    role: 'DELIVERY',
    appLabel: 'Delivery Partner App',
    badge: '🛵 For Delivery Partners',
    headline: 'Earn on your schedule',
    description:
      'Deliver hyperlocal orders in your zone, work flexible hours, and get paid daily. No targets — just you and your neighbourhood.',
    features: [
      'Accept orders in your chosen zone',
      'Turn-by-turn navigation to customers',
      'Track earnings & withdraw via UPI',
    ],
    stats: [
      { value: '₹18K+', label: 'avg. monthly earnings' },
      { value: '5K+', label: 'active partners' },
      { value: '4.8★', label: 'avg. partner rating' },
    ],
    icon: '🛵',
    accent: {
      gradient: 'from-amber-950 via-amber-900 to-gray-900',
      glow: 'bg-[radial-gradient(ellipse_at_top_right,_#fcd34d,_transparent_50%),radial-gradient(ellipse_at_bottom_left,_#f59e0b,_transparent_50%)]',
      button: 'bg-amber-500',
      buttonHover: 'hover:bg-amber-600',
      ring: 'focus:border-amber-400 focus:ring-2 focus:ring-amber-100',
      inputFocus: 'focus:border-amber-400 focus:ring-2 focus:ring-amber-100',
      text: 'text-amber-600',
      tabActive: 'bg-amber-500 text-white',
      badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    },
    redirectAfterLogin: '/delivery/dashboard',
    redirectAfterSignup: '/delivery/dashboard',
    showGoogle: true,
    allowSignup: true,
    loginEmailPlaceholder: 'partner@example.com',
  },
  ADMIN: {
    role: 'ADMIN',
    appLabel: 'Admin Console',
    badge: '⚙️ For Administrators',
    headline: 'Full platform control',
    description:
      'Manage users, shops, orders, and platform settings from a single operations dashboard. Restricted to authorised personnel.',
    features: [
      'User & shop moderation',
      'Order oversight & dispute handling',
      'Platform analytics & GMV tracking',
    ],
    footnote: 'Admin access is by invitation only. Contact platform operations to request access.',
    icon: '🛡️',
    accent: {
      gradient: 'from-gray-950 via-rose-950 to-gray-900',
      glow: 'bg-[radial-gradient(ellipse_at_top_right,_#fb7185,_transparent_50%),radial-gradient(ellipse_at_bottom_left,_#e11d48,_transparent_50%)]',
      button: 'bg-rose-600',
      buttonHover: 'hover:bg-rose-700',
      ring: 'focus:border-rose-500 focus:ring-2 focus:ring-rose-900',
      inputFocus: 'focus:border-rose-500 focus:ring-2 focus:ring-rose-900',
      text: 'text-rose-500',
      tabActive: 'bg-rose-600 text-white',
      badge: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    },
    redirectAfterLogin: '/admin/dashboard',
    redirectAfterSignup: '/admin/dashboard',
    showGoogle: false,
    allowSignup: false,
    dark: true,
    loginEmailPlaceholder: 'admin@locafy.in',
  },
}

export function authPathForRole(role: UserRole): string {
  const paths: Record<UserRole, string> = {
    CUSTOMER: '/customer/auth',
    VENDOR: '/vendor/auth',
    DELIVERY: '/delivery/auth',
    ADMIN: '/admin/auth',
  }
  return paths[role]
}
