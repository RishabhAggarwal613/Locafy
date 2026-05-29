import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface LocationState {
  localityName: string
  lat: number | null
  lng: number | null
  radius: number
  setLocation: (name: string, lat: number, lng: number) => void
  setRadius: (radius: number) => void
  clearLocation: () => void
}

export const useLocationStore = create<LocationState>()(
  persist(
    (set) => ({
      localityName: '',
      lat: null,
      lng: null,
      radius: 5,
      setLocation: (localityName, lat, lng) => set({ localityName, lat, lng }),
      setRadius: (radius) => set({ radius }),
      clearLocation: () => set({ localityName: '', lat: null, lng: null }),
    }),
    { name: 'locafy-location' }
  )
)
