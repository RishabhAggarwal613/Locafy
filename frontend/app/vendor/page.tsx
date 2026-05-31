import type { Metadata } from 'next'
import Link from 'next/link'
import OfficialNavbar from '@/components/official/OfficialNavbar'
import OfficialFooter from '@/components/official/OfficialFooter'
import { AnimatedSection } from '@/components/official/AnimatedSection'

export const metadata: Metadata = {
  title: 'Locafy for Vendors — Reach Your Neighbourhood',
  description:
    'List your shop, upload product reels, manage orders, and grow your local customer base on Locafy. Zero commission for the first 3 months.',
  openGraph: {
    title: 'Locafy for Vendors — Reach Your Neighbourhood',
    description: 'Grow your local shop with product reels, order management, and a built-in customer base.',
  },
}

const FEATURES = [
  {
    icon: '🏪',
    title: 'Shop Profile',
    desc: 'Set up your shop with photos, logo, description, opening hours, and pin your exact location on the map.',
    color: 'emerald',
  },
  {
    icon: '📦',
    title: 'Product Manager',
    desc: 'Full product CRUD with up to 8 photos each. Bulk CSV import to onboard your existing catalogue in minutes.',
    color: 'sky',
  },
  {
    icon: '🎬',
    title: 'Reel Studio',
    desc: 'Upload short product videos. Locafy auto-transcodes to HLS. Tag products directly in the video.',
    color: 'pink',
  },
  {
    icon: '📋',
    title: 'Order Management',
    desc: 'Real-time new order alerts. Accept, prepare, and mark orders as ready. Full order status timeline.',
    color: 'amber',
  },
  {
    icon: '💰',
    title: 'Finance Dashboard',
    desc: 'Daily, weekly, and monthly earnings. GST summary. Payout history. All in one clean dashboard.',
    color: 'violet',
  },
  {
    icon: '📊',
    title: 'Analytics',
    desc: 'See which products are trending, top-selling items, customer reviews, and locality-level reach.',
    color: 'rose',
  },
]

const BENEFITS = [
  {
    value: '0%',
    label: 'Commission — First 3 months',
    desc: 'List and sell with zero platform fee during your onboarding period.',
  },
  {
    value: '↑40%',
    label: 'Average sales growth',
    desc: 'Vendors report a 40% increase in orders in the first month.',
  },
  {
    value: '5km',
    label: 'Hyper-targeted reach',
    desc: 'Your products are shown to customers already near your shop.',
  },
]

const STEPS = [
  { step: '01', icon: '🏪', title: 'Create your shop', desc: 'Add your shop name, photos, location, and category in under 5 minutes.' },
  { step: '02', icon: '📦', title: 'Upload products', desc: 'Add products with photos, price, and stock. Import from CSV for large catalogues.' },
  { step: '03', icon: '🎬', title: 'Post your first reel', desc: 'Record a short product video. Your reel appears on feeds of nearby customers.' },
  { step: '04', icon: '💸', title: 'Receive & fulfil orders', desc: 'Get notified instantly. Accept, prepare, and mark orders ready. Earn daily.' },
]

export default function VendorMarketingPage() {
  return (
    <div className="bg-white">
      <OfficialNavbar />

      {/* ─── HERO ─── */}
      <section className="relative pt-24 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden bg-gradient-to-br from-emerald-950 via-emerald-900 to-gray-900 min-h-[90vh] flex items-center">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_top_right,_#6ee7b7,_transparent_50%),radial-gradient(ellipse_at_bottom_left,_#34d399,_transparent_50%)]" />

        <div className="absolute right-0 top-1/2 -translate-y-1/2 opacity-10 lg:opacity-20 pointer-events-none text-[150px] lg:text-[220px] leading-none pr-8">
          🏪
        </div>

        <div className="relative z-10 max-w-7xl mx-auto w-full">
          <AnimatedSection delay={0}>
            <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 text-sm px-3 py-1.5 rounded-full mb-6 border border-emerald-500/30">
              🏪 For Vendors
            </div>
          </AnimatedSection>
          <AnimatedSection delay={0.1}>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white leading-tight mb-6 max-w-2xl">
              Reach customers in your locality —{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-teal-300">
                for free
              </span>
            </h1>
          </AnimatedSection>
          <AnimatedSection delay={0.2}>
            <p className="text-xl text-emerald-100 max-w-xl mb-10 leading-relaxed">
              List your shop, post product reels, and manage orders from a single dashboard.
              Join thousands of local vendors already growing on Locafy.
            </p>
          </AnimatedSection>
          <AnimatedSection delay={0.3}>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/vendor/auth?mode=signup"
                className="inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white font-bold px-8 py-4 rounded-xl text-lg transition-colors shadow-lg shadow-emerald-900/40"
              >
                Join as a Vendor →
              </Link>
              <Link
                href="/vendor/auth"
                className="inline-flex items-center justify-center border border-emerald-400/50 text-emerald-200 hover:border-emerald-300 font-medium px-8 py-4 rounded-xl text-lg transition-colors"
              >
                Sign In
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ─── BENEFITS ─── */}
      <section className="py-16 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-3 gap-8">
            {BENEFITS.map((b, i) => (
              <AnimatedSection key={b.label} delay={i * 0.1} className="text-center">
                <div className="text-4xl font-black text-emerald-600 mb-2">{b.value}</div>
                <div className="font-semibold text-gray-900 mb-1">{b.label}</div>
                <div className="text-sm text-gray-500">{b.desc}</div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-black text-gray-900 mb-4">
              Everything you need to <span className="text-emerald-600">sell locally</span>
            </h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">
              A complete toolkit for local shop owners — from listing to earning.
            </p>
          </AnimatedSection>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
              <AnimatedSection key={f.title} delay={i * 0.08}>
                <div className="p-6 rounded-2xl border border-gray-100 hover:border-emerald-100 hover:bg-emerald-50/30 transition-all h-full">
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
            <h2 className="text-4xl font-black text-gray-900 mb-4">Start selling in under 10 minutes</h2>
          </AnimatedSection>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEPS.map((s, i) => (
              <AnimatedSection key={s.step} delay={i * 0.1}>
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm h-full">
                  <div className="text-3xl mb-4">{s.icon}</div>
                  <div className="text-xs font-bold text-emerald-500 tracking-widest mb-2">STEP {s.step}</div>
                  <h3 className="font-bold text-gray-900 mb-2">{s.title}</h3>
                  <p className="text-sm text-gray-500">{s.desc}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="py-20 bg-emerald-600 px-4 sm:px-6 lg:px-8">
        <AnimatedSection className="max-w-2xl mx-auto text-center">
          <h2 className="text-4xl font-black text-white mb-4">Start Selling on Locafy</h2>
          <p className="text-emerald-100 mb-8 text-lg">Free for 3 months. No credit card needed. Cancel anytime.</p>
          <Link
            href="/vendor/auth?mode=signup"
            className="inline-flex items-center gap-2 bg-white text-emerald-600 font-bold px-8 py-4 rounded-xl text-lg hover:bg-emerald-50 transition-colors"
          >
            Start Selling on Locafy →
          </Link>
        </AnimatedSection>
      </section>

      <OfficialFooter />
    </div>
  )
}
