'use client'

import { useState } from 'react'
import { useLocationStore } from '@/store/locationStore'
import toast from 'react-hot-toast'

const RADIUS_OPTIONS = [1, 3, 5, 10]

interface Props {
  compact?: boolean
}

export default function LocationSwitcher({ compact }: Props) {
  const { localityName, lat, lng, radius, setLocation, setRadius } = useLocationStore()
  const [open, setOpen] = useState(false)
  const [nameInput, setNameInput] = useState(localityName || 'My Location')
  const [latInput, setLatInput] = useState(lat?.toString() ?? '28.6139')
  const [lngInput, setLngInput] = useState(lng?.toString() ?? '77.2090')

  const detectLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation not supported')
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatInput(String(pos.coords.latitude))
        setLngInput(String(pos.coords.longitude))
        toast.success('Location detected')
      },
      () => toast.error('Could not detect location')
    )
  }

  const apply = () => {
    const parsedLat = parseFloat(latInput)
    const parsedLng = parseFloat(lngInput)
    if (Number.isNaN(parsedLat) || Number.isNaN(parsedLng)) {
      toast.error('Invalid coordinates')
      return
    }
    setLocation(nameInput.trim() || 'My Location', parsedLat, parsedLng)
    setOpen(false)
    toast.success('Location updated')
  }

  const label = localityName || (lat ? 'Location set' : 'Set location')

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`flex items-center gap-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors ${
          compact ? 'px-2.5 py-1.5 text-xs' : 'px-3 py-2 text-sm'
        }`}
      >
        <span>📍</span>
        <span className="max-w-[120px] truncate font-medium">{label}</span>
        <span className="text-gray-400">· {radius}km</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" onClick={() => setOpen(false)}>
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-gray-900 mb-4">Choose your locality</h2>

            <label className="block text-sm font-medium text-gray-700 mb-1">Locality name</label>
            <input
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mb-3"
              placeholder="e.g. Koramangala"
            />

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="text-xs text-gray-500">Latitude</label>
                <input value={latInput} onChange={(e) => setLatInput(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-xs text-gray-500">Longitude</label>
                <input value={lngInput} onChange={(e) => setLngInput(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
              </div>
            </div>

            <button type="button" onClick={detectLocation} className="text-sm text-indigo-600 hover:underline mb-4">
              Use my current GPS location
            </button>

            <p className="text-sm font-medium text-gray-700 mb-2">Search radius</p>
            <div className="flex gap-2 mb-6">
              {RADIUS_OPTIONS.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRadius(r)}
                  className={`px-3 py-1.5 rounded-lg text-sm border ${
                    radius === r ? 'bg-indigo-600 text-white border-indigo-600' : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {r} km
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              <button type="button" onClick={() => setOpen(false)} className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm">
                Cancel
              </button>
              <button type="button" onClick={apply} className="flex-1 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
