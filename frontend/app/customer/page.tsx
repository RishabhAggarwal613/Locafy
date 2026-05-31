import type { Metadata } from 'next'
import Link from 'next/link'
import OfficialNavbar from '@/components/official/OfficialNavbar'
import OfficialFooter from '@/components/official/OfficialFooter'
import { AnimatedSection } from '@/components/official/AnimatedSection'

export const metadata: Metadata = {
  title: 'Locafy for Customers — Everything Near You',
  description:
    'Discover nearby shops, browse product reels, and order with delivery or pickup. Hyperlocal shopping in your neighbourhood.',
  openGraph: {
    title: 'Locafy for Customers — Everything Near You',
    description: 'Hyperlocal shopping experience — shops, reels, and delivery in your locality.',
  },
}

const FEATURES = [
  {
    icon: '📍',
    title: 'Locality Switching',
    desc: 'Set your locality once and see only what matters to you. Switch anytime — home, work, or anywhere.',
    color: 'indigo',
  },
  {
    icon: '🎬',
    title: 'Product Reels Feed',
    desc: 'Infinite-scroll video feed of products from local vendors. Like, save, and order directly from any reel.',
    color: 'pink',
  },
  {
    icon: '🔍',
    title: 'Advanced Search',
    desc: 'Search by product name, category, shop name, price range, or distance. Fuzzy matching and autocomplete included.',
    color: 'violet',
  },
  {
    icon: '🛒',
    title: 'Smart Cart & Checkout',
    desc: 'Choose pickup or delivery at checkout. Pay with UPI, cards, or Cash on Delivery via Razorpay.',
    color: 'emerald',
  },
  {
    icon: '🗺️',
    title: 'Live Order Tracking',
    desc: 'Watch your delivery partner\'s GPS location in real-time on a map as your order makes its way to you.',
    color: 'sky',
  },
  {
    icon: '📦',
    title: 'Order History',
    desc: 'Full order history with status timeline. Reorder in one tap. Pickup booking reminders.',
    color: 'amber',
  },
]

const STEPS = [
  {
    step: '01',
    title: 'Set your locality',
    desc: 'Search your area or drop a pin. Locafy remembers your location for next time.',
    icon: '📍',
  },
  {
    step: '02',
    title: 'Explore shops & reels',
    desc: 'Browse shop cards sorted by distance, or swipe through product reels from local vendors.',
    icon: '🎬',
  },
  {
    step: '03',
    title: 'Add to cart',
    desc: 'Tap any product to view details, check availability, and add to your cart.',
    icon: '🛒',
  },
  {
    step: '04',
    title: 'Choose pickup or delivery',
    desc: 'Order ahead for pickup or get it delivered. Pick your payment method.',
    icon: '🛵',
  },
]

export default function CustomerMarketingPage() {
  return (
    <div className="bg-white">
      <OfficialNavbar />

      {/* ─── HERO ─── */}
      <section className="relative pt-24 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden bg-gradient-to-br from-indigo-950 via-indigo-900 to-gray-900 min-h-[90vh] flex items-center">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_top_right,_#818cf8,_transparent_50%),radial-gradient(ellipse_at_bottom_left,_#a78bfa,_transparent_50%)]" />

        {/* Floating phone mockup */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-64 lg:w-96 opacity-20 lg:opacity-30 pointer-events-none select-none text-[120px] lg:text-[180px] leading-none pr-8">
          📱
        </div>

        <div className="relative z-10 max-w-7xl mx-auto w-full">
          <AnimatedSection delay={0}>
            <div className="inline-flex items-center gap-2 bg-indigo-500/20 text-indigo-300 text-sm px-3 py-1.5 rounded-full mb-6 border border-indigo-500/30">
              🛍️ For Customers
            </div>
          </AnimatedSection>
          <AnimatedSection delay={0.1}>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white leading-tight mb-6 max-w-2xl">
              Everything near you,{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-violet-300">
                at your fingertips
              </span>
            </h1>
          </AnimatedSection>
          <AnimatedSection delay={0.2}>
            <p className="text-xl text-indigo-200 max-w-xl mb-10 leading-relaxed">
              Discover local shops, browse product reels from vendors in your area, and
              order with delivery or pickup — without leaving your neighbourhood.
            </p>
          </AnimatedSection>
          <AnimatedSection delay={0.3}>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/customer/explore"
                className="inline-flex items-center justify-center gap-2 bg-indigo-500 hover:bg-indigo-400 text-white font-bold px-8 py-4 rounded-xl text-lg transition-colors shadow-lg shadow-indigo-900/40"
              >
                Explore Nearby Shops →
              </Link>
              <Link
                href="/customer/auth?mode=signup"
                className="inline-flex items-center justify-center gap-2 border border-indigo-400/50 text-indigo-200 hover:border-indigo-300 font-medium px-8 py-4 rounded-xl text-lg transition-colors"
              >
                Get Started
              </Link>
              <Link
                href="/customer/auth"
                className="inline-flex items-center justify-center border border-indigo-400/30 text-indigo-300/80 hover:border-indigo-300 font-medium px-8 py-4 rounded-xl text-lg transition-colors"
              >
                Sign In
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-black text-gray-900 mb-4">
              Shopping, <span className="text-indigo-600">reimagined</span> for your locality
            </h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">
              Everything you need to discover and buy from local shops — in one beautiful app.
            </p>
          </AnimatedSection>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
              <AnimatedSection key={f.title} delay={i * 0.08}>
                <div className="group p-6 rounded-2xl border border-gray-100 hover:border-indigo-100 hover:bg-indigo-50/30 transition-all h-full">
                  <div className="text-3xl mb-4">{f.icon}</div>
                  <h3 className="font-bold text-gray-900 mb-2">{f.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section className="py-24 bg-gray-50 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection className="text-center mb-16">
            <h2 className="text-4xl font-black text-gray-900 mb-4">How the customer app works</h2>
            <p className="text-gray-500 text-lg">From setup to delivery in 4 easy steps.</p>
          </AnimatedSection>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEPS.map((s, i) => (
              <AnimatedSection key={s.step} delay={i * 0.1}>
                <div className="relative bg-white rounded-2xl p-6 border border-gray-100 shadow-sm h-full">
                  {i < STEPS.length - 1 && (
                    <div className="hidden lg:block absolute top-10 -right-3 w-6 h-0.5 bg-indigo-200 z-10" />
                  )}
                  <div className="text-3xl mb-4">{s.icon}</div>
                  <div className="text-xs font-bold text-indigo-400 tracking-widest mb-2">STEP {s.step}</div>
                  <h3 className="font-bold text-gray-900 mb-2">{s.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="py-20 bg-indigo-600 px-4 sm:px-6 lg:px-8">
        <AnimatedSection className="max-w-2xl mx-auto text-center">
          <h2 className="text-4xl font-black text-white mb-4">Start shopping locally today</h2>
          <p className="text-indigo-200 mb-8 text-lg">Free to join. No minimum order. Local shops, fast delivery.</p>
          <Link
            href="/customer/explore"
            className="inline-flex items-center gap-2 bg-white text-indigo-600 font-bold px-8 py-4 rounded-xl text-lg hover:bg-indigo-50 transition-colors"
          >
            Explore Nearby Shops →
          </Link>
        </AnimatedSection>
      </section>

      <OfficialFooter />
    </div>
  )
}
