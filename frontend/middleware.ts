import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('locafy-token')?.value

  const protectedPrefixes: { prefix: string; authPath: string }[] = [
    { prefix: '/vendor/dashboard', authPath: '/vendor/auth' },
    { prefix: '/vendor/shop', authPath: '/vendor/auth' },
    { prefix: '/vendor/products', authPath: '/vendor/auth' },
    { prefix: '/vendor/reels', authPath: '/vendor/auth' },
    { prefix: '/vendor/orders', authPath: '/vendor/auth' },
    { prefix: '/vendor/history', authPath: '/vendor/auth' },
    { prefix: '/vendor/finance', authPath: '/vendor/auth' },
    { prefix: '/delivery/dashboard', authPath: '/delivery/auth' },
    { prefix: '/delivery/orders', authPath: '/delivery/auth' },
    { prefix: '/delivery/history', authPath: '/delivery/auth' },
    { prefix: '/delivery/finance', authPath: '/delivery/auth' },
    { prefix: '/admin/dashboard', authPath: '/admin/auth' },
    { prefix: '/admin/users', authPath: '/admin/auth' },
    { prefix: '/admin/shops', authPath: '/admin/auth' },
    { prefix: '/admin/orders', authPath: '/admin/auth' },
    { prefix: '/admin/analytics', authPath: '/admin/auth' },
    { prefix: '/admin/categories', authPath: '/admin/auth' },
    { prefix: '/admin/settings', authPath: '/admin/auth' },
    { prefix: '/admin/products', authPath: '/admin/auth' },
    { prefix: '/customer/cart', authPath: '/customer/auth' },
    { prefix: '/customer/checkout', authPath: '/customer/auth' },
    { prefix: '/customer/orders', authPath: '/customer/auth' },
    { prefix: '/customer/profile', authPath: '/customer/auth' },
  ]

  for (const { prefix, authPath } of protectedPrefixes) {
    if (pathname.startsWith(prefix) && !pathname.startsWith(`${authPath}`)) {
      if (!token) {
        return NextResponse.redirect(new URL(authPath, request.url))
      }
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/vendor/:path*',
    '/delivery/:path*',
    '/admin/:path*',
    '/customer/cart',
    '/customer/checkout/:path*',
    '/customer/orders/:path*',
    '/customer/profile/:path*',
  ],
}
