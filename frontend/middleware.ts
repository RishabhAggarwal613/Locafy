import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const ROLE_ROUTES: Record<string, string[]> = {
  VENDOR: ['/vendor/dashboard', '/vendor/shop', '/vendor/products', '/vendor/reels', '/vendor/orders', '/vendor/history', '/vendor/finance'],
  DELIVERY: ['/delivery/dashboard', '/delivery/orders', '/delivery/history', '/delivery/finance'],
  ADMIN: ['/admin/dashboard', '/admin/users', '/admin/shops', '/admin/orders', '/admin/analytics'],
  CUSTOMER: ['/cart', '/checkout', '/orders', '/profile', '/reels'],
}

const AUTH_REDIRECTS: Record<string, string> = {
  '/vendor/dashboard': '/vendor/auth/login',
  '/delivery/dashboard': '/delivery/auth/login',
  '/admin/dashboard': '/admin/auth/login',
  '/cart': '/auth/login',
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Read auth token from cookie (set by backend on login)
  const token = request.cookies.get('locafy-token')?.value

  // Check protected vendor routes
  if (pathname.startsWith('/vendor/dashboard') ||
      pathname.startsWith('/vendor/shop') ||
      pathname.startsWith('/vendor/products') ||
      pathname.startsWith('/vendor/reels') && !pathname.includes('/vendor/reels/') ||
      pathname.startsWith('/vendor/orders') ||
      pathname.startsWith('/vendor/finance')) {
    if (!token) {
      return NextResponse.redirect(new URL('/vendor/auth/login', request.url))
    }
  }

  // Check protected delivery routes
  if (pathname.startsWith('/delivery/dashboard') ||
      pathname.startsWith('/delivery/orders') ||
      pathname.startsWith('/delivery/history') ||
      pathname.startsWith('/delivery/finance')) {
    if (!token) {
      return NextResponse.redirect(new URL('/delivery/auth/login', request.url))
    }
  }

  // Check protected admin routes
  if (pathname.startsWith('/admin/dashboard') ||
      pathname.startsWith('/admin/users') ||
      pathname.startsWith('/admin/shops') ||
      pathname.startsWith('/admin/orders') ||
      pathname.startsWith('/admin/analytics')) {
    if (!token) {
      return NextResponse.redirect(new URL('/admin/auth/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/vendor/:path*',
    '/delivery/:path*',
    '/admin/:path*',
    '/cart',
    '/checkout/:path*',
    '/orders/:path*',
    '/profile/:path*',
  ],
}
