'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import LocafyLogo from '@/components/shared/LocafyLogo'

const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Customer', href: '/customer' },
  { label: 'Vendor', href: '/vendor' },
  { label: 'Delivery', href: '/delivery' },
  { label: 'Admin', href: '/admin' },
]

export default function OfficialNavbar() {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  const onDarkHero = !scrolled

  return (
    <header
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-md shadow-sm'
          : 'bg-gray-950/30 backdrop-blur-sm'
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <LocafyLogo
          href="/"
          size="md"
          labelClassName={`text-xl transition-colors ${onDarkHero ? 'text-white' : 'text-gray-900'}`}
        />

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map(({ label, href }) => {
            const isActive = pathname === href || (href !== '/' && pathname.startsWith(href))
            return (
              <Link
                key={href}
                href={href}
                className={`relative px-3 py-2 text-sm font-semibold rounded-lg transition-colors ${
                  isActive
                    ? onDarkHero ? 'text-white' : 'text-indigo-600'
                    : onDarkHero
                      ? 'text-white/90 hover:text-white hover:bg-white/10'
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {label}
                {isActive && (
                  <motion.span
                    layoutId="nav-underline"
                    className={`absolute bottom-0 left-3 right-3 h-0.5 rounded-full ${
                      onDarkHero ? 'bg-white' : 'bg-indigo-600'
                    }`}
                  />
                )}
              </Link>
            )
          })}
        </div>

        {/* CTA + Hamburger */}
        <div className="flex items-center gap-3">
          <Link
            href="/customer/auth"
            className={`hidden md:inline-flex items-center gap-1 text-sm font-semibold px-4 py-2 rounded-lg transition-colors shadow-sm ${
              onDarkHero
                ? 'bg-white text-indigo-700 hover:bg-indigo-50'
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
            }`}
          >
            Get Started
          </Link>
          <button
            onClick={() => setMenuOpen(v => !v)}
            className={`md:hidden p-2 rounded-lg transition-colors ${
              onDarkHero
                ? 'text-white hover:bg-white/10'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
            aria-label="Toggle menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="md:hidden bg-white border-b border-gray-100 px-4 pb-4 shadow-lg"
          >
            <div className="flex flex-col gap-1 pt-2">
              {NAV_LINKS.map(({ label, href }) => {
                const isActive = pathname === href || (href !== '/' && pathname.startsWith(href))
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-indigo-50 text-indigo-600'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {label}
                  </Link>
                )
              })}
              <Link
                href="/customer/auth"
                className="mt-2 bg-indigo-600 text-white text-sm font-semibold px-4 py-2.5 rounded-lg text-center hover:bg-indigo-700 transition-colors"
              >
                Get Started
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
