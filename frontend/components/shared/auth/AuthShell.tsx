import Link from 'next/link'
import type { RoleAuthConfig } from '@/lib/auth/roleAuthConfig'
import LocafyLogo from '@/components/shared/LocafyLogo'

interface Props {
  config: RoleAuthConfig
  marketingHref: string
  children: React.ReactNode
}

function IntroContent({ config, marketingHref, compact }: { config: RoleAuthConfig; marketingHref: string; compact?: boolean }) {
  const { accent } = config

  return (
    <>
      <div className={`inline-flex items-center gap-2 text-sm px-3 py-1.5 rounded-full mb-4 border ${accent.badge}`}>
        {config.badge}
      </div>

      <h1 className={`font-black text-white leading-tight mb-4 ${compact ? 'text-2xl sm:text-3xl' : 'text-3xl xl:text-4xl'}`}>
        {config.headline}
      </h1>

      <p className={`text-white/80 leading-relaxed ${compact ? 'text-sm mb-5' : 'text-base mb-8'}`}>
        {config.description}
      </p>

      <ul className={`space-y-2.5 ${compact ? 'mb-5' : 'mb-8'}`}>
        {config.features.map((feature) => (
          <li key={feature} className="flex items-start gap-3 text-sm text-white/90">
            <span className="mt-0.5 w-5 h-5 rounded-full bg-white/15 flex items-center justify-center text-[10px] flex-shrink-0">
              ✓
            </span>
            {feature}
          </li>
        ))}
      </ul>

      {config.stats && config.stats.length > 0 && (
        <div className={`flex flex-wrap gap-6 ${compact ? 'mb-5' : 'mb-8'}`}>
          {config.stats.map(({ value, label }) => (
            <div key={label}>
              <div className="text-xl font-black text-white">{value}</div>
              <div className="text-xs text-white/60 max-w-[8rem]">{label}</div>
            </div>
          ))}
        </div>
      )}

      {config.footnote && (
        <p className={`text-sm text-white/50 ${compact ? 'mb-4' : 'mb-6'}`}>{config.footnote}</p>
      )}

      <Link
        href={marketingHref}
        className="inline-flex text-sm text-white/70 hover:text-white underline-offset-2 hover:underline transition-colors"
      >
        ← Learn more about {config.appLabel.toLowerCase()}
      </Link>
    </>
  )
}

export default function AuthShell({ config, marketingHref, children }: Props) {
  const isDark = config.dark
  const { accent } = config

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-950' : 'bg-gray-50'}`}>
      <div className="min-h-screen lg:grid lg:grid-cols-2">
        {/* Intro panel — desktop */}
        <div
          className={`relative hidden lg:flex flex-col justify-between p-10 xl:p-12 text-white bg-gradient-to-br ${accent.gradient} overflow-hidden`}
        >
          {accent.glow && <div className={`absolute inset-0 opacity-20 pointer-events-none ${accent.glow}`} />}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 opacity-10 pointer-events-none text-[180px] leading-none pr-6 select-none">
            {config.icon}
          </div>

          <div className="relative z-10">
            <LocafyLogo href="/" labelClassName="text-lg text-white" />
          </div>

          <div className="relative z-10 max-w-lg">
            <IntroContent config={config} marketingHref={marketingHref} />
          </div>

          <div className="relative z-10 text-xs text-white/40">{config.appLabel}</div>
        </div>

        {/* Form panel */}
        <div className="flex flex-col min-h-screen">
          {/* Mobile / tablet intro */}
          <div className={`lg:hidden relative overflow-hidden bg-gradient-to-br ${accent.gradient} text-white`}>
            {accent.glow && <div className={`absolute inset-0 opacity-20 pointer-events-none ${accent.glow}`} />}
            <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-10 text-7xl pointer-events-none select-none">
              {config.icon}
            </div>
            <div className="relative z-10 px-4 sm:px-6 py-8">
              <LocafyLogo href="/" size="sm" labelClassName="text-white font-bold" className="mb-4" />
              <IntroContent config={config} marketingHref={marketingHref} compact />
            </div>
          </div>

          <div
            className={`flex-1 flex items-center justify-center px-4 py-8 sm:px-8 ${
              isDark ? 'bg-gray-950' : 'bg-gray-50 lg:bg-white'
            }`}
          >
            <div className="w-full max-w-md">{children}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
