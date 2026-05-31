import apiClient from './client'
import type { PageResponse, Reel } from '@/types'

export interface ReelFeedResponse {
  content: Reel[]
  nextCursor?: string | null
  hasMore: boolean
}

export const reelsApi = {
  getFeed: (params: { lat: number; lng: number; cursor?: string; size?: number }) =>
    apiClient.get<ReelFeedResponse>('/api/reels', { params }).then((r) => r.data),

  getById: (id: string) =>
    apiClient.get<Reel>(`/api/reels/${id}`).then((r) => r.data),

  getSaved: (page = 0, size = 20) =>
    apiClient.get<PageResponse<Reel>>('/api/reels/saved', { params: { page, size } }).then((r) => r.data),

  getMine: (page = 0, size = 20) =>
    apiClient.get<PageResponse<Reel>>('/api/reels/mine', { params: { page, size } }).then((r) => r.data),

  upload: (payload: {
    video: File
    title?: string
    description?: string
    productId?: string
    publish?: boolean
  }) => {
    const form = new FormData()
    form.append('video', payload.video)
    if (payload.title) form.append('title', payload.title)
    if (payload.description) form.append('description', payload.description)
    if (payload.productId) form.append('productId', payload.productId)
    form.append('publish', String(payload.publish ?? true))
    return apiClient.post<Reel>('/api/reels', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data)
  },

  update: (id: string, payload: {
    title?: string
    description?: string
    productId?: string | null
    isPublished?: boolean
  }) =>
    apiClient.put<Reel>(`/api/reels/${id}`, payload).then((r) => r.data),

  delete: (id: string) =>
    apiClient.delete(`/api/reels/${id}`).then((r) => r.data),

  toggleLike: (id: string) =>
    apiClient.post<{ active: boolean; count: number }>(`/api/reels/${id}/like`).then((r) => r.data),

  toggleSave: (id: string) =>
    apiClient.post<{ active: boolean; count: number }>(`/api/reels/${id}/save`).then((r) => r.data),
}
