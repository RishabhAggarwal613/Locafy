'use client'

import { useEffect, useRef, useState } from 'react'
import { useInView } from 'framer-motion'

function useCountUp(target: number, duration = 2000, startOnView = false) {
  const [count, setCount] = useState(0)
  const [started, setStarted] = useState(!startOnView)

  useEffect(() => {
    if (!started) return
    const start = performance.now()
    const step = (now: number) => {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.floor(eased * target))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [started, target, duration])

  return { count, start: () => setStarted(true) }
}

interface StatCardProps {
  value: number
  suffix?: string
  label: string
  description: string
}

function StatCard({ value, suffix = '', label, description }: StatCardProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })
  const { count, start } = useCountUp(value, 2200, true)

  useEffect(() => {
    if (isInView) start()
  }, [isInView]) // eslint-disable-line

  return (
    <div ref={ref} className="text-center">
      <div className="text-5xl sm:text-6xl font-black text-white mb-2 tabular-nums">
        {count.toLocaleString('en-IN')}{suffix}
      </div>
      <div className="text-lg font-semibold text-indigo-200 mb-1">{label}</div>
      <div className="text-sm text-indigo-300/70">{description}</div>
    </div>
  )
}

export default function StatsSection() {
  const stats = [
    { value: 2500, suffix: '+', label: 'Local Shops', description: 'Listed across 40+ cities' },
    { value: 120, suffix: 'K+', label: 'Happy Customers', description: 'Orders completed successfully' },
    { value: 85, suffix: '+', label: 'Localities', description: 'Neighbourhoods covered' },
    { value: 98, suffix: '%', label: 'Satisfaction', description: 'Average customer rating' },
  ]

  return (
    <section className="py-24 bg-indigo-600 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(99,102,241,0.3),_transparent)] pointer-events-none" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-0 lg:divide-x lg:divide-indigo-500">
          {stats.map(stat => (
            <StatCard key={stat.label} {...stat} />
          ))}
        </div>
      </div>
    </section>
  )
}
