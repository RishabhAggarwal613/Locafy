import type { Metadata } from 'next'
import Link from 'next/link'
import OfficialNavbar from '@/components/official/OfficialNavbar'
import OfficialFooter from '@/components/official/OfficialFooter'
import { AnimatedSection } from '@/components/official/AnimatedSection'

export const metadata: Metadata = {
  title: 'Locafy Admin — Full Platform Control',
  description:
    'Manage the Locafy platform: users, shops, orders, and analytics. Complete operational control from one dashboard.',
  openGraph: {
    title: 'Locafy Admin — Full Platform Control',
    description: 'Complete admin dashboard for managing the Locafy hyperlocal platform.',
  },
}

const FEATURES = [
  {
    icon: '👥',
    title: 'User Management',
    desc: 'View, search, verify, suspend, or reactivate customers, vendors, and delivery partners.',
    color: 'rose',
  },
  {
    icon: '🏪',
    title: 'Shop Verification',
    desc: 'Review new shop applications, verify legitimacy, and approve or reject listings with notes.',
    color: 'indigo',
  },
  {
    icon: '📋',
    title: 'Order Oversight',
    desc: 'Full view of all platform orders. Intervene in disputes, override statuses, and trigger refunds.',
    color: 'amber',
  },
  {
    icon: '📊',
    title: 'Analytics & GMV',
    desc: 'Platform-wide GMV, order volume, active users, new registrations, and locality heatmaps.',
    color: 'emerald',
  },
  {
    icon: '📦',
    title: 'Product Moderation',
    desc: 'Review flagged products, remove inappropriate content, and enforce category standards.',
    color: 'violet',
  },
  {
    icon: '⚙️',
    title: 'Platform Settings',
    desc: 'Configure delivery fee percentages, vendor commission rates, and platform-level toggles.',
    color: 'sky',
  },
]

const MODULES = [
  { icon: '📊', label: 'Dashboard' },
  { icon: '👥', label: 'Customers' },
  { icon: '🏪', label: 'Vendors' },
  { icon: '🛵', label: 'Delivery' },
  { icon: '📋', label: 'Orders' },
  { icon: '📦', label: 'Products' },
  { icon: '🏷️', label: 'Categories' },
  { icon: '💰', label: 'Finance' },
  { icon: '📣', label: 'Reports' },
  { icon: '⚙️', label: 'Settings' },
]

export default function AdminMarketingPage() {
  return (
    <div className="bg-white">
      <OfficialNavbar />

      {/* ─── HERO ─── */}
      <section className="relative pt-24 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden bg-gradient-to-br from-gray-950 via-rose-950 to-gray-900 min-h-[85vh] flex items-center">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_top_right,_#fb7185,_transparent_50%),radial-gradient(ellipse_at_bottom_left,_#e11d48,_transparent_50%)]" />

        <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-10 lg:opacity-20 pointer-events-none">
          <div className="grid grid-cols-5 gap-3">
            {MODULES.map(({ icon, label }) => (
              <div key={label} className="w-14 h-14 bg-white/10 rounded-xl flex flex-col items-center justify-center gap-1">
                <span className="text-2xl">{icon}</span>
                <span className="text-white text-[8px] font-medium">{label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto w-full">
          <AnimatedSection delay={0}>
            <div className="inline-flex items-center gap-2 bg-rose-500/20 text-rose-300 text-sm px-3 py-1.5 rounded-full mb-6 border border-rose-500/30">
              ⚙️ For Administrators
            </div>
          </AnimatedSection>
          <AnimatedSection delay={0.1}>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white leading-tight mb-6 max-w-2xl">
              Full{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-300 to-pink-300">
                platform control
              </span>
            </h1>
          </AnimatedSection>
          <AnimatedSection delay={0.2}>
            <p className="text-xl text-rose-100 max-w-xl mb-10 leading-relaxed">
              A comprehensive operations dashboard to manage every aspect of the Locafy platform —
              users, shops, orders, content, and analytics.
            </p>
          </AnimatedSection>
          <AnimatedSection delay={0.3}>
            <Link
              href="/admin/auth/login"
              className="inline-flex items-center justify-center gap-2 bg-rose-500 hover:bg-rose-400 text-white font-bold px-8 py-4 rounded-xl text-lg transition-colors shadow-lg shadow-rose-900/40"
            >
              Admin Portal →
            </Link>
          </AnimatedSection>
          <AnimatedSection delay={0.4}>
            <p className="mt-4 text-sm text-rose-300/70">
              Admin access is by invitation only. Contact platform operations to request access.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* ─── MODULE GRID ─── */}
      <section className="py-16 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center mb-8">
            <p className="text-sm font-semibold text-gray-500 tracking-widest uppercase">Platform Modules</p>
          </AnimatedSection>
          <AnimatedSection>
            <div className="flex flex-wrap justify-center gap-3">
              {MODULES.map(({ icon, label }) => (
                <div
                  key={label}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-xl border border-gray-100 text-sm font-medium text-gray-700"
                >
                  <span>{icon}</span>
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-black text-gray-900 mb-4">
              Manage every part of <span className="text-rose-600">Locafy</span>
            </h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">
              Built for operations teams who need complete visibility and control over the platform.
            </p>
          </AnimatedSection>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
              <AnimatedSection key={f.title} delay={i * 0.08}>
                <div className="p-6 rounded-2xl border border-gray-100 hover:border-rose-100 hover:bg-rose-50/20 transition-all h-full">
                  <div className="text-3xl mb-4">{f.icon}</div>
                  <h3 className="font-bold text-gray-900 mb-2">{f.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ─── AUDIT & SECURITY ─── */}
      <section className="py-20 bg-gray-50 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <AnimatedSection className="text-center mb-12">
            <h2 className="text-3xl font-black text-gray-900 mb-4">Built with security in mind</h2>
          </AnimatedSection>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { icon: '🔒', title: 'Role-based Access', desc: 'Admin accounts are created by invitation only, with no self-registration possible.' },
              { icon: '📜', title: 'Audit Logging', desc: 'Every admin action — user suspend, shop verify, order override — is logged with timestamp and actor.' },
              { icon: '🛡️', title: 'JWT + 2FA', desc: 'Admin sessions use short-lived JWTs. Two-factor authentication is mandatory for all admin accounts.' },
            ].map((item, i) => (
              <AnimatedSection key={item.title} delay={i * 0.1}>
                <div className="bg-white rounded-2xl p-6 border border-gray-100 text-center">
                  <div className="text-3xl mb-3">{item.icon}</div>
                  <div className="font-bold text-gray-900 mb-2">{item.title}</div>
                  <div className="text-sm text-gray-500">{item.desc}</div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="py-20 bg-gray-900 px-4 sm:px-6 lg:px-8">
        <AnimatedSection className="max-w-2xl mx-auto text-center">
          <h2 className="text-4xl font-black text-white mb-4">Access the Admin Portal</h2>
          <p className="text-gray-400 mb-8 text-lg">
            Admin access is restricted. If you are a platform operator, sign in below.
          </p>
          <Link
            href="/admin/auth/login"
            className="inline-flex items-center gap-2 bg-rose-500 text-white font-bold px-8 py-4 rounded-xl text-lg hover:bg-rose-400 transition-colors"
          >
            Go to Admin Portal →
          </Link>
        </AnimatedSection>
      </section>

      <OfficialFooter />
    </div>
  )
}
