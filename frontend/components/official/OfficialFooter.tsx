import Link from 'next/link'
import LocafyLogo from '@/components/shared/LocafyLogo'

const LINKS = {
  Platform: [
    { label: 'Customer App', href: '/customer' },
    { label: 'Vendor Portal', href: '/vendor' },
    { label: 'Delivery Partner', href: '/delivery' },
    { label: 'Admin Panel', href: '/admin' },
  ],
  Company: [
    { label: 'About Locafy', href: '/' },
    { label: 'How It Works', href: '/#how-it-works' },
    { label: 'Features', href: '/#features' },
    { label: 'Testimonials', href: '/#testimonials' },
  ],
  Legal: [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Refund Policy', href: '/refunds' },
  ],
}

export default function OfficialFooter() {
  return (
    <footer className="bg-gray-950 text-gray-400 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <LocafyLogo href="/" labelClassName="text-white text-xl" className="mb-4" />
            <p className="text-sm leading-relaxed max-w-xs text-gray-500">
              Hyperlocal product discovery and ordering — connecting neighbourhoods,
              one shop at a time.
            </p>
            <div className="flex gap-3 mt-5">
              {['twitter', 'instagram', 'linkedin'].map(platform => (
                <a
                  key={platform}
                  href={`https://${platform}.com`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg bg-gray-800 hover:bg-indigo-600 flex items-center justify-center transition-colors"
                  aria-label={platform}
                >
                  <span className="text-xs capitalize text-gray-400">{platform[0].toUpperCase()}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Link Columns */}
          {Object.entries(LINKS).map(([heading, links]) => (
            <div key={heading}>
              <h4 className="text-white font-semibold text-sm mb-4">{heading}</h4>
              <ul className="space-y-2.5">
                {links.map(({ label, href }) => (
                  <li key={href}>
                    <Link href={href} className="text-sm hover:text-white transition-colors">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-600">© 2026 Locafy Technologies Pvt. Ltd. All rights reserved.</p>
          <p className="text-xs text-gray-600">Made with ♥ for local communities across India</p>
        </div>
      </div>
    </footer>
  )
}
