'use client'

import { useRef } from 'react'

interface ImageUploadProps {
  label: string
  currentUrl?: string
  onUpload: (file: File) => Promise<void>
  disabled?: boolean
}

export default function ImageUpload({ label, currentUrl, onUpload, disabled }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    await onUpload(file)
    e.target.value = ''
  }

  return (
    <div>
      <p className="text-sm font-medium text-gray-700 mb-2">{label}</p>
      <div
        className="relative border-2 border-dashed border-gray-200 rounded-xl overflow-hidden bg-gray-50 hover:border-emerald-300 transition-colors cursor-pointer"
        onClick={() => !disabled && inputRef.current?.click()}
      >
        {currentUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={currentUrl} alt={label} className="w-full h-40 object-cover" />
        ) : (
          <div className="h-40 flex flex-col items-center justify-center text-gray-400 text-sm">
            <span className="text-2xl mb-2">📷</span>
            Click to upload
          </div>
        )}
        {!disabled && (
          <div className="absolute inset-0 bg-black/0 hover:bg-black/10 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
            <span className="bg-white/90 text-xs font-medium px-3 py-1 rounded-full">Change</span>
          </div>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        disabled={disabled}
        onChange={handleChange}
      />
    </div>
  )
}
