import apiClient from './client'

export interface Category {
  id: string
  name: string
  slug: string
  icon: string
  type: string
  displayOrder: number
}

export const categoriesApi = {
  list: () => apiClient.get<Category[]>('/api/categories').then((r) => r.data),
}
