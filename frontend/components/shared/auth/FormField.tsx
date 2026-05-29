'use client'

import { type InputHTMLAttributes, forwardRef } from 'react'

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
}

export const FormField = forwardRef<HTMLInputElement, Props>(
  ({ label, error, ...props }, ref) => {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}
        </label>
        <input
          ref={ref}
          className={`w-full px-3.5 py-2.5 text-sm border rounded-xl outline-none transition-colors
            ${error
              ? 'border-red-300 focus:border-red-400 bg-red-50'
              : 'border-gray-200 focus:border-indigo-400 bg-white'
            }`}
          {...props}
        />
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      </div>
    )
  }
)
FormField.displayName = 'FormField'
