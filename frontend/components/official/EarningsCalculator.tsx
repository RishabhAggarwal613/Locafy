'use client'

import { useState } from 'react'

export default function EarningsCalculator() {
  const [deliveries, setDeliveries] = useState(10)
  const perDelivery = 45
  const workingDays = 26
  const monthly = deliveries * perDelivery * workingDays

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm max-w-lg mx-auto">
      <h3 className="font-bold text-gray-900 text-lg mb-1">Earnings Calculator</h3>
      <p className="text-sm text-gray-500 mb-6">Estimate your monthly income as a delivery partner</p>

      <div className="mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-600 font-medium">Deliveries per day</span>
          <span className="font-bold text-indigo-600 text-lg">{deliveries}</span>
        </div>
        <input
          type="range"
          min={1}
          max={30}
          value={deliveries}
          onChange={e => setDeliveries(Number(e.target.value))}
          className="w-full accent-indigo-600 h-2 rounded-full cursor-pointer"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>1/day</span>
          <span>30/day</span>
        </div>
      </div>

      <div className="bg-indigo-50 rounded-xl p-4 mb-4">
        <div className="flex justify-between items-baseline mb-1">
          <span className="text-sm text-gray-600">Estimated monthly earnings</span>
          <span className="text-3xl font-black text-indigo-600">
            ₹{monthly.toLocaleString('en-IN')}
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span>{deliveries} deliveries × ₹{perDelivery} × {workingDays} days</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Per delivery', value: `₹${perDelivery}` },
          { label: 'Working days', value: `${workingDays}/month` },
          { label: 'Daily income', value: `₹${(deliveries * perDelivery).toLocaleString('en-IN')}` },
          { label: 'Annual income', value: `₹${(monthly * 12).toLocaleString('en-IN')}` },
        ].map(({ label, value }) => (
          <div key={label} className="bg-gray-50 rounded-lg p-3">
            <div className="text-xs text-gray-500 mb-0.5">{label}</div>
            <div className="font-bold text-gray-900 text-sm">{value}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
