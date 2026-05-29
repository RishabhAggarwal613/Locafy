import type { Metadata } from 'next'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import OfficialNavbar from '@/components/official/OfficialNavbar'
import OfficialFooter from '@/components/official/OfficialFooter'
import { AnimatedSection, AnimatedStagger } from '@/components/official/AnimatedSection'
import StatsSection from '@/components/official/StatsCounter'

const Hero3D = dynamic(() => import('@/components/official/Hero3D'), { ssr: false })

export const metadata: Metadata = {
  title: 'Locafy — Discover What\'s Right Around You',
  description:
    'Hyperlocal product discovery and ordering. Browse nearby shops, watch product reels, and order with delivery or pickup — all within your locality.',
  openGraph: {
    title: 'Locafy — Discover What\'s Right Around You',
    description: 'Hyperlocal product discovery and ordering platform.',
    type: 'website',
  },
}

const FEATURES = [
  {
    icon: '📍',
    title: 'Locality-based Discovery',
    desc: 'Set your locality and instantly see shops and products within your neighbourhood radius. Switch localities anytime.',
    color: 'indigo',
  },
  {
    icon: '🎬',
    title: 'Product Reels',
    desc: 'Short videos from local vendors. Swipe through products, like and save, then tap to order — all in seconds.',
    color: 'pink',
  },
  {
    icon: '🛵',
    title: 'Hyperlocal Delivery',
    desc: 'Live GPS tracking, door-to-door delivery from shops near you. Fresh and fast because it\'s just around the corner.',
    color: 'amber',
  },
  {
    icon: '🏪',
    title: 'Pickup Booking',
    desc: 'Order ahead and skip the queue. Reserve products at the shop and pick them up whenever you\'re ready.',
    color: 'emerald',
  },
  {
    icon: '🔍',
    title: 'Smart Search',
    desc: 'Search by product name, shop, category, or price. Fuzzy matching, autocomplete, and distance-sorted results.',
    color: 'sky',
  },
  {
    icon: '💳',
    title: 'Easy Payments',
    desc: 'Pay with UPI, cards, wallets via Razorpay, or choose Cash on Delivery. Instant order confirmation always.',
    color: 'violet',
  },
]

const HOW_IT_WORKS_CUSTOMER = [
  { step: 1, title: 'Set your locality', desc: 'Drop a pin or search your area to see what\'s nearby.' },
  { step: 2, title: 'Discover & browse', desc: 'Scroll reels, search products, explore shop pages.' },
  { step: 3, title: 'Order & track', desc: 'Add to cart, checkout, then watch live as your order heads to you.' },
]

const HOW_IT_WORKS_VENDOR = [
  { step: 1, title: 'List your shop', desc: 'Create a shop profile with location, photos, and hours.' },
  { step: 2, title: 'Upload products & reels', desc: 'Add your product catalogue and shoot short video reels.' },
  { step: 3, title: 'Manage & earn', desc: 'Accept orders, track fulfilment, and withdraw earnings daily.' },
]

const ROLES = [
  {
    role: 'Customer',
    href: '/customer',
    emoji: '🛍️',
    color: 'indigo',
    bg: 'bg-indigo-50',
    border: 'border-indigo-100',
    text: 'text-indigo-600',
    desc: 'Discover local shops, watch product reels, and order with delivery or pickup from your neighbourhood.',
    cta: 'Start Shopping',
  },
  {
    role: 'Vendor',
    href: '/vendor',
    emoji: '🏪',
    color: 'emerald',
    bg: 'bg-emerald-50',
    border: 'border-emerald-100',
    text: 'text-emerald-600',
    desc: 'List your shop, upload product reels, manage orders, and grow your local customer base.',
    cta: 'Start Selling',
  },
  {
    role: 'Delivery Partner',
    href: '/delivery',
    emoji: '🛵',
    color: 'amber',
    bg: 'bg-amber-50',
    border: 'border-amber-100',
    text: 'text-amber-600',
    desc: 'Earn by delivering orders in your zone with GPS navigation and flexible working hours.',
    cta: 'Start Earning',
  },
  {
    role: 'Admin',
    href: '/admin',
    emoji: '⚙️',
    color: 'rose',
    bg: 'bg-rose-50',
    border: 'border-rose-100',
    text: 'text-rose-600',
    desc: 'Full platform control — manage users, verify shops, oversee orders, and track analytics.',
    cta: 'Admin Portal',
  },
]

const TESTIMONIALS = [
  {
    name: 'Ananya Krishnan',
    locality: 'Koramangala, Bengaluru',
    avatar: 'AK',
    color: 'indigo',
    rating: 5,
    text: 'I found my neighbourhood kirana on Locafy and now I order weekly. The reels feature is genuinely addictive — I discovered so many local products I never knew existed.',
    role: 'Customer',
  },
  {
    name: 'Rajesh Patil',
    locality: 'Baner, Pune',
    avatar: 'RP',
    color: 'emerald',
    rating: 5,
    text: 'My shop was only known to people who passed by. After listing on Locafy, orders from 5 km away started coming in. My sales went up 40% in the first month.',
    role: 'Vendor',
  },
  {
    name: 'Pradeep Singh',
    locality: 'Lajpat Nagar, Delhi',
    avatar: 'PS',
    color: 'amber',
    rating: 5,
    text: 'I do 15 deliveries a day and earn around ₹18,000 a month. The navigation is smooth, the zones are small, and I get paid on time. Best side hustle in my area.',
    role: 'Delivery Partner',
  },
]

export default function HomePage() {
  return (
    <div className="bg-white">
      <OfficialNavbar />

      {/* ─── HERO ─── */}
      <section className="relative min-h-screen flex items-center overflow-hidden bg-gray-950">
        {/* 3D canvas fills the right half */}
        <div className="absolute inset-0 opacity-70">
          <Hero3D />
        </div>

        {/* Dark gradient overlay on left */}
        <div className="absolute inset-0 bg-gradient-to-r from-gray-950 via-gray-950/80 to-transparent pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
          <AnimatedSection delay={0}>
            <div className="inline-flex items-center gap-2 bg-indigo-500/20 text-indigo-300 text-sm px-3 py-1.5 rounded-full mb-6 border border-indigo-500/30">
              <span className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse" />
              Hyperlocal · Neighbourhood-first · Made in India
            </div>
          </AnimatedSection>

          <AnimatedSection delay={0.1}>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white leading-[1.1] mb-6 max-w-2xl">
              Discover what&apos;s{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">
                right around you
              </span>
            </h1>
          </AnimatedSection>

          <AnimatedSection delay={0.2}>
            <p className="text-xl text-gray-400 max-w-xl mb-10 leading-relaxed">
              Browse nearby shops, watch product reels from local vendors, and order with
              delivery or pickup — all within your immediate locality.
            </p>
          </AnimatedSection>

          <AnimatedSection delay={0.3}>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/customer/auth/signup"
                className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-8 py-4 rounded-xl text-lg transition-colors shadow-lg shadow-indigo-900/30"
              >
                Find Shops Near Me
                <span>→</span>
              </Link>
              <Link
                href="/vendor/auth/signup"
                className="inline-flex items-center justify-center gap-2 border border-gray-600 text-gray-300 hover:border-indigo-500 hover:text-indigo-300 font-medium px-8 py-4 rounded-xl text-lg transition-colors"
              >
                List Your Shop
              </Link>
            </div>
          </AnimatedSection>

          <AnimatedSection delay={0.5}>
            <div className="flex items-center gap-6 mt-12">
              {[
                { n: '2500+', label: 'shops listed' },
                { n: '120K+', label: 'happy customers' },
                { n: '85+', label: 'localities' },
              ].map(({ n, label }) => (
                <div key={label} className="text-center">
                  <div className="text-2xl font-black text-white">{n}</div>
                  <div className="text-xs text-gray-500">{label}</div>
                </div>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section id="features" className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-600 text-sm px-3 py-1 rounded-full mb-4 font-medium">
              Platform Features
            </div>
            <h2 className="text-4xl sm:text-5xl font-black text-gray-900 mb-4">
              Everything you need,<br />
              <span className="text-indigo-600">right in your locality</span>
            </h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">
              Locafy connects neighbourhood shops with local customers through a modern,
              mobile-first platform.
            </p>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
              <AnimatedSection key={f.title} delay={i * 0.08}>
                <div className="group p-6 rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all bg-white h-full">
                  <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center mb-4 text-2xl group-hover:scale-110 transition-transform">
                    {f.icon}
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">{f.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section id="how-it-works" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-600 text-sm px-3 py-1 rounded-full mb-4 font-medium">
              How It Works
            </div>
            <h2 className="text-4xl sm:text-5xl font-black text-gray-900 mb-4">Simple for everyone</h2>
            <p className="text-gray-500 text-lg">Get started in minutes, whether you&apos;re shopping or selling.</p>
          </AnimatedSection>

          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            {/* Customer Steps */}
            <AnimatedSection delay={0.1} direction="left">
              <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
                <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 text-xs font-semibold px-3 py-1 rounded-full mb-6">
                  🛍️ FOR CUSTOMERS
                </div>
                <div className="space-y-6">
                  {HOW_IT_WORKS_CUSTOMER.map(({ step, title, desc }) => (
                    <div key={step} className="flex gap-4">
                      <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm flex-shrink-0 mt-0.5">
                        {step}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 mb-1">{title}</div>
                        <div className="text-sm text-gray-500">{desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <Link
                  href="/customer"
                  className="inline-flex items-center gap-1 mt-6 text-indigo-600 font-semibold text-sm hover:underline"
                >
                  Learn about customer features →
                </Link>
              </div>
            </AnimatedSection>

            {/* Vendor Steps */}
            <AnimatedSection delay={0.2} direction="right">
              <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
                <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 text-xs font-semibold px-3 py-1 rounded-full mb-6">
                  🏪 FOR VENDORS
                </div>
                <div className="space-y-6">
                  {HOW_IT_WORKS_VENDOR.map(({ step, title, desc }) => (
                    <div key={step} className="flex gap-4">
                      <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm flex-shrink-0 mt-0.5">
                        {step}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 mb-1">{title}</div>
                        <div className="text-sm text-gray-500">{desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <Link
                  href="/vendor"
                  className="inline-flex items-center gap-1 mt-6 text-emerald-600 font-semibold text-sm hover:underline"
                >
                  Learn about vendor features →
                </Link>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* ─── ROLES ─── */}
      <section id="roles" className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-600 text-sm px-3 py-1 rounded-full mb-4 font-medium">
              Built for Everyone
            </div>
            <h2 className="text-4xl sm:text-5xl font-black text-gray-900 mb-4">
              Your role in the neighbourhood
            </h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">
              Whether you shop, sell, deliver, or operate — Locafy has a dedicated experience built for you.
            </p>
          </AnimatedSection>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {ROLES.map((r, i) => (
              <AnimatedSection key={r.role} delay={i * 0.1}>
                <div className={`group rounded-2xl p-6 border ${r.border} ${r.bg} hover:shadow-md transition-all h-full flex flex-col`}>
                  <div className="text-4xl mb-4">{r.emoji}</div>
                  <h3 className="font-bold text-gray-900 text-lg mb-2">{r.role}</h3>
                  <p className="text-sm text-gray-600 mb-5 flex-1">{r.desc}</p>
                  <Link
                    href={r.href}
                    className={`inline-flex items-center gap-1 ${r.text} font-semibold text-sm group-hover:underline`}
                  >
                    {r.cta} →
                  </Link>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ─── STATS ─── */}
      <StatsSection />

      {/* ─── TESTIMONIALS ─── */}
      <section id="testimonials" className="py-24 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-600 text-sm px-3 py-1 rounded-full mb-4 font-medium">
              Testimonials
            </div>
            <h2 className="text-4xl sm:text-5xl font-black text-gray-900 mb-4">
              Loved by local communities
            </h2>
            <p className="text-gray-500 text-lg">Real stories from customers, vendors, and delivery partners.</p>
          </AnimatedSection>

          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <AnimatedSection key={t.name} delay={i * 0.12}>
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm h-full flex flex-col">
                  <div className="flex mb-1">
                    {Array.from({ length: t.rating }).map((_, j) => (
                      <span key={j} className="text-amber-400 text-lg">★</span>
                    ))}
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed flex-1 mb-5">&ldquo;{t.text}&rdquo;</p>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full bg-${t.color}-100 flex items-center justify-center font-bold text-${t.color}-700 text-sm`}>
                      {t.avatar}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 text-sm">{t.name}</div>
                      <div className="text-xs text-gray-400">{t.locality} · {t.role}</div>
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA BANNER ─── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-indigo-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(139,92,246,0.4),_transparent)] pointer-events-none" />
        <AnimatedSection className="max-w-3xl mx-auto text-center relative z-10">
          <h2 className="text-4xl sm:text-5xl font-black text-white mb-4">
            Ready to explore your neighbourhood?
          </h2>
          <p className="text-indigo-200 text-lg mb-8">
            Join thousands of customers and vendors already on Locafy.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/customer/auth/signup"
              className="bg-white text-indigo-600 font-bold px-8 py-4 rounded-xl text-lg hover:bg-indigo-50 transition-colors"
            >
              Get Started Free
            </Link>
            <Link
              href="/vendor/auth/signup"
              className="border border-indigo-400 text-white font-medium px-8 py-4 rounded-xl text-lg hover:bg-indigo-500 transition-colors"
            >
              List Your Shop
            </Link>
          </div>
        </AnimatedSection>
      </section>

      <OfficialFooter />
    </div>
  )
}
