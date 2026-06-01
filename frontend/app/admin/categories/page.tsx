'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import AdminShell from '@/components/admin/AdminShell'
import { adminApi } from '@/lib/api/admin'

export default function AdminCategoriesPage() {
  const [name, setName] = useState('')
  const [icon, setIcon] = useState('')
  const queryClient = useQueryClient()

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: () => adminApi.listCategories(),
  })

  const createCategory = useMutation({
    mutationFn: () => adminApi.createCategory({ name, icon: icon || undefined }),
    onSuccess: () => {
      toast.success('Category created')
      setName('')
      setIcon('')
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] })
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(msg ?? 'Create failed')
    },
  })

  const toggleActive = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      adminApi.updateCategory(id, { isActive }),
    onSuccess: () => {
      toast.success('Category updated')
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] })
    },
  })

  return (
    <AdminShell>
      <h1 className="text-2xl font-bold text-white mb-6">Categories</h1>

      <form
        className="flex flex-wrap gap-3 mb-8 p-4 bg-gray-900 border border-gray-800 rounded-xl"
        onSubmit={(e) => {
          e.preventDefault()
          if (name.trim()) createCategory.mutate()
        }}
      >
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Category name"
          className="flex-1 min-w-[160px] px-3 py-2 rounded-lg bg-gray-950 border border-gray-700 text-white text-sm"
        />
        <input
          value={icon}
          onChange={(e) => setIcon(e.target.value)}
          placeholder="Icon (emoji)"
          className="w-24 px-3 py-2 rounded-lg bg-gray-950 border border-gray-700 text-white text-sm"
        />
        <button type="submit" disabled={createCategory.isPending || !name.trim()}
          className="px-4 py-2 rounded-lg bg-rose-600 text-white text-sm font-medium hover:bg-rose-700 disabled:opacity-50">
          Add category
        </button>
      </form>

      {isLoading ? (
        <p className="text-gray-500 animate-pulse">Loading...</p>
      ) : (
        <div className="overflow-x-auto bg-gray-900 border border-gray-800 rounded-xl">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-800">
                <th className="p-4">Icon</th>
                <th className="p-4">Name</th>
                <th className="p-4">Slug</th>
                <th className="p-4">Active</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat.id} className="border-b border-gray-800/50 text-gray-300">
                  <td className="p-4">{cat.icon ?? '—'}</td>
                  <td className="p-4">{cat.name}</td>
                  <td className="p-4 text-gray-500">{cat.slug}</td>
                  <td className="p-4">{cat.isActive !== false ? 'Yes' : 'No'}</td>
                  <td className="p-4">
                    <button type="button"
                      onClick={() => toggleActive.mutate({ id: cat.id, isActive: cat.isActive === false })}
                      className="text-xs text-rose-400 hover:text-rose-300">
                      {cat.isActive !== false ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminShell>
  )
}
