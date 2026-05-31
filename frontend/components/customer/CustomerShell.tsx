'use client'

import CustomerNavbar from './CustomerNavbar'

export default function CustomerShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <CustomerNavbar />
      <main className="max-w-6xl mx-auto px-4 py-6">{children}</main>
    </div>
  )
}
