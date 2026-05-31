import apiClient from './client'
import type { ShopListItem } from '@/types'

export type SearchType = 'ALL' | 'SHOP' | 'PRODUCT'

export interface ProductSearchItem {
  id: string
  shopId: string
  shopName: string
  name: string
  description?: string
  price: number
  discountedPrice?: number
  images: string[]
  category: string
  stock: number
  isAvailable: boolean
  unit: string
  rating: number
  distanceKm?: number
}

export interface SearchResponse {
  shops: ShopListItem[]
  products: ProductSearchItem[]
  totalShops: number
  totalProducts: number
}

export interface AutocompleteItem {
  type: 'SHOP' | 'PRODUCT'
  id: string
  label: string
  subtitle: string
}

export interface SearchParams {
  q?: string
  type?: SearchType
  lat: number
  lng: number
  radius?: number
  category?: string
  minPrice?: number
  maxPrice?: number
  minRating?: number
  openNow?: boolean
  delivery?: boolean
  page?: number
  size?: number
}

export const searchApi = {
  search: (params: SearchParams) =>
    apiClient.get<SearchResponse>('/api/search', { params }).then((r) => r.data),

  autocomplete: (q: string, lat: number, lng: number, radius = 5) =>
    apiClient.get<AutocompleteItem[]>('/api/search/autocomplete', {
      params: { q, lat, lng, radius },
    }).then((r) => r.data),
}
