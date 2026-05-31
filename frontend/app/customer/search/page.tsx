'use client'

import { Suspense } from 'react'
import CustomerSearchContent from './CustomerSearchContent'

export default function CustomerSearchPage() {
  return (
    <Suspense fallback={<div className="p-8 text-gray-400 animate-pulse">Loading search...</div>}>
      <CustomerSearchContent />
    </Suspense>
  )
}
