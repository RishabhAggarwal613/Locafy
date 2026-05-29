import type { Metadata } from 'next'
import Link from 'next/link'
import OfficialNavbar from '@/components/official/OfficialNavbar'
import OfficialFooter from '@/components/official/OfficialFooter'
import { AnimatedSection } from '@/components/official/AnimatedSection'
import EarningsCalculator from '@/components/official/EarningsCalculator'

export const metadata: Metadata = {
  title: 'Locafy Delivery Partners — Earn on Your Schedule',
  description:
    'Deliver orders in your neighbourhood, earn daily, and work flexible hours. Join Locafy as a delivery partner.',
  openGraph: {
    title: 'Locafy Delivery Partners — Earn on Your Schedule',
    description: 'Flexible earnings delivering hyperlocal orders in your neighbourhood with GPS navigation.',
  },
}

const FEATURES = [
  {
    icon: '📍',
    title: 'Choose Your Zone',
    desc: 'Deliver only in areas you know well. Set your operating zone and get orders only from within it.',
    color: 'amber',
  },
  {
    icon: '📋',
    title: 'Browse Order Pool',
    desc: 'See available orders in your zone. Accept the ones that work for you — no pressure, full flexibility.',
    color: 'sky',
  },
  {
    icon: '🗺️',
    title: 'Turn-by-turn Navigation',
    desc: 'Mapbox-powered routing from shop to customer. Voice guidance, traffic updates, and optimised routes.',
    color: 'emerald',
  },
  {
    icon: '💸',
    title: 'Daily Withdrawals',
    desc: 'Your earnings are calculated daily. Withdraw anytime via UPI — straight to your bank account.',
    color: 'violet',
  },
  {
    icon: '📸',
    title: 'Photo Proof',
    desc: 'Snap a delivery confirmation photo for each completed order. Disputes resolved quickly.',
    color: 'pink',
  },
  {
    icon: '📊',
    title: 'Earnings Dashboard',
    desc: 'Track deliveries, earnings per day/week/month, and your performance ratings in one place.',
    color: 'indigo',
  },
]

const STEPS = [
  { step: '01', icon: '📝', title: 'Sign up & verify', desc: 'Create your profile, upload ID proof, and get verified within 24 hours.' },
  { step: '02', icon: '📍', title: 'Set your delivery zone', desc: 'Choose the localities you want to deliver in. Expand or shrink anytime.' },
  { step: '03', icon: '📋', title: 'Accept orders', desc: 'Browse the live order pool and accept orders that fit your schedule.' },
  { step: '04', icon: '💸', title: 'Deliver & earn', desc: 'Navigate to the shop, pick up, deliver to the customer, and earn instantly.' },
]

const PERKS = [
  { icon: '⏰', title: 'Flexible Hours', desc: 'Work whenever you want. Morning, evening, or weekends — you decide.' },
  { icon: '🛵', title: 'Use Your Vehicle', desc: 'Use your own bike or cycle. No special vehicle required.' },
  { icon: '📱', title: 'Simple App', desc: 'Everything in one app — orders, navigation, and earnings.' },
  { icon: '🏆', title: 'Performance Bonuses', desc: 'Top performers get weekly bonuses based on ratings and deliveries.' },
]

export default function DeliveryMarketingPage() {
  return (
    <div className="bg-white">
      <OfficialNavbar />

      {/* ─── HERO ─── */}
      <section className="relative pt-24 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden bg-gradient-to-br from-amber-950 via-amber-900 to-gray-900 min-h-[90vh] flex items-center">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_top_right,_#fcd34d,_transparent_50%),radial-gradient(ellipse_at_bottom_left,_#f59e0b,_transparent_50%)]" />

        <div className="absolute right-0 top-1/2 -translate-y-1/2 opacity-10 lg:opacity-20 pointer-events-none text-[150px] lg:text-[220px] leading-none pr-8">
          🛵
        </div>

        <div className="relative z-10 max-w-7xl mx-auto w-full">
          <AnimatedSection delay={0}>
            <div className="inline-flex items-center gap-2 bg-amber-500/20 text-amber-300 text-sm px-3 py-1.5 rounded-full mb-6 border border-amber-500/30">
              🛵 For Delivery Partners
            </div>
          </AnimatedSection>
          <AnimatedSection delay={0.1}>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white leading-tight mb-6 max-w-2xl">
              Earn on your schedule,{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-yellow-300">
                in your neighbourhood
              </span>
            </h1>
          </AnimatedSection>
          <AnimatedSection delay={0.2}>
            <p className="text-xl text-amber-100 max-w-xl mb-10 leading-relaxed">
              Deliver hyperlocal orders in your zone, work flexible hours, and earn daily.
              No targets, no pressure — just you, your bike, and your neighbourhood.
            </p>
          </AnimatedSection>
          <AnimatedSection delay={0.3}>
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Link
                href="/delivery/auth/signup"
                className="inline-flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-white font-bold px-8 py-4 rounded-xl text-lg transition-colors shadow-lg shadow-amber-900/40"
              >
                Become a Delivery Partner →
              </Link>
              <Link
                href="/delivery/auth/login"
                className="inline-flex items-center justify-center border border-amber-400/50 text-amber-200 hover:border-amber-300 font-medium px-8 py-4 rounded-xl text-lg transition-colors"
              >
                Sign In
              </Link>
            </div>
          </AnimatedSection>
          <AnimatedSection delay={0.4}>
            <div className="flex items-center gap-8">
              {[
                { n: '₹18K+', label: 'avg. monthly earnings' },
                { n: '5K+', label: 'active partners' },
                { n: '4.8★', label: 'avg. partner rating' },
              ].map(({ n, label }) => (
                <div key={label}>
                  <div className="text-2xl font-black text-white">{n}</div>
                  <div className="text-xs text-amber-300">{label}</div>
                </div>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ─── PERKS ─── */}
      <section className="py-16 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {PERKS.map((p, i) => (
              <AnimatedSection key={p.title} delay={i * 0.1} className="text-center">
                <div className="text-4xl mb-3">{p.icon}</div>
                <div className="font-bold text-gray-900 mb-1">{p.title}</div>
                <div className="text-sm text-gray-500">{p.desc}</div>
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
              Built for <span className="text-amber-500">delivery partners</span>
            </h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">
              Everything you need to deliver efficiently and earn more.
            </p>
          </AnimatedSection>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
              <AnimatedSection key={f.title} delay={i * 0.08}>
                <div className="p-6 rounded-2xl border border-gray-100 hover:border-amber-100 hover:bg-amber-50/20 transition-all h-full">
                  <div className="text-3xl mb-4">{f.icon}</div>
                  <h3 className="font-bold text-gray-900 mb-2">{f.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ─── EARNINGS CALCULATOR ─── */}
      <section className="py-24 bg-gray-50 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection className="text-center mb-12">
            <h2 className="text-4xl font-black text-gray-900 mb-4">How much can you earn?</h2>
            <p className="text-gray-500 text-lg">Use our calculator to estimate your monthly income.</p>
          </AnimatedSection>
          <AnimatedSection delay={0.15}>
            <EarningsCalculator />
          </AnimatedSection>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection className="text-center mb-16">
            <h2 className="text-4xl font-black text-gray-900 mb-4">Get started in 4 steps</h2>
          </AnimatedSection>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEPS.map((s, i) => (
              <AnimatedSection key={s.step} delay={i * 0.1}>
                <div className="bg-amber-50 rounded-2xl p-6 border border-amber-100 h-full">
                  <div className="text-3xl mb-4">{s.icon}</div>
                  <div className="text-xs font-bold text-amber-500 tracking-widest mb-2">STEP {s.step}</div>
                  <h3 className="font-bold text-gray-900 mb-2">{s.title}</h3>
                  <p className="text-sm text-gray-500">{s.desc}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="py-20 bg-amber-500 px-4 sm:px-6 lg:px-8">
        <AnimatedSection className="max-w-2xl mx-auto text-center">
          <h2 className="text-4xl font-black text-white mb-4">Join as Delivery Partner</h2>
          <p className="text-amber-100 mb-8 text-lg">Earn ₹15,000–₹30,000/month. Flexible hours. Daily payout.</p>
          <Link
            href="/delivery/auth/signup"
            className="inline-flex items-center gap-2 bg-white text-amber-600 font-bold px-8 py-4 rounded-xl text-lg hover:bg-amber-50 transition-colors"
          >
            Join as Delivery Partner →
          </Link>
        </AnimatedSection>
      </section>

      <OfficialFooter />
    </div>
  )
}
