'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import AdminShell from '@/components/admin/AdminShell'
import { adminApi, type UserRole } from '@/lib/api/admin'

const ROLES: { label: string; value?: UserRole }[] = [
  { label: 'All', value: undefined },
  { label: 'Customers', value: 'CUSTOMER' },
  { label: 'Vendors', value: 'VENDOR' },
  { label: 'Delivery', value: 'DELIVERY' },
]

export default function AdminUsersPage() {
  const [role, setRole] = useState<UserRole | undefined>()
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', role],
    queryFn: () => adminApi.listUsers(role),
  })

  const updateStatus = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      adminApi.updateUserStatus(id, active),
    onSuccess: () => {
      toast.success('User updated')
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(msg ?? 'Update failed')
    },
  })

  return (
    <AdminShell>
      <h1 className="text-2xl font-bold text-white mb-6">Users</h1>

      <div className="flex flex-wrap gap-2 mb-6">
        {ROLES.map(({ label, value }) => (
          <button
            key={label}
            type="button"
            onClick={() => setRole(value)}
            className={`px-3 py-1.5 rounded-lg text-xs border ${
              role === value ? 'bg-rose-600 text-white border-rose-600' : 'border-gray-700 text-gray-400'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <p className="text-gray-500 animate-pulse">Loading users...</p>
      ) : !data?.content.length ? (
        <p className="text-gray-500">No users found.</p>
      ) : (
        <div className="overflow-x-auto bg-gray-900 border border-gray-800 rounded-xl">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-800">
                <th className="p-4">Name</th>
                <th className="p-4">Email</th>
                <th className="p-4">Role</th>
                <th className="p-4">Status</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.content.map((user) => (
                <tr key={user.id} className="border-b border-gray-800/50 text-gray-300">
                  <td className="p-4">{user.name}</td>
                  <td className="p-4">{user.email}</td>
                  <td className="p-4">{user.role}</td>
                  <td className="p-4">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${user.active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                      {user.active ? 'Active' : 'Suspended'}
                    </span>
                  </td>
                  <td className="p-4">
                    {user.role !== 'ADMIN' && (
                      <button
                        type="button"
                        disabled={updateStatus.isPending}
                        onClick={() => updateStatus.mutate({ id: user.id, active: !user.active })}
                        className="text-xs text-rose-400 hover:text-rose-300 disabled:opacity-50"
                      >
                        {user.active ? 'Suspend' : 'Reinstate'}
                      </button>
                    )}
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
