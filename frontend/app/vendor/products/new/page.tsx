'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import VendorShell from '@/components/vendor/VendorShell'
import { productsApi } from '@/lib/api/products'
import { PRODUCT_UNITS, SHOP_CATEGORIES } from '@/lib/constants/vendor'

const schema = z.object({
  name: z.string().min(2, 'Name required'),
  description: z.string().optional(),
  price: z.coerce.number().min(0.01, 'Price required'),
  discountedPrice: z.coerce.number().min(0).optional(),
  category: z.string().min(1, 'Category required'),
  stock: z.coerce.number().min(0),
  unit: z.string(),
  sku: z.string().optional(),
  isAvailable: z.boolean(),
})

type FormValues = z.infer<typeof schema>

export default function NewProductPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema) as Resolver<FormValues>,
    defaultValues: { stock: 0, unit: 'piece', isAvailable: true },
  })

  const onSubmit = async (values: FormValues) => {
    setSaving(true)
    try {
      const product = await productsApi.create({
        ...values,
        discountedPrice: values.discountedPrice || undefined,
        sku: values.sku || undefined,
      })
      toast.success('Product created')
      router.push(`/vendor/products/${product.id}`)
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(msg ?? 'Failed to create product')
    } finally {
      setSaving(false)
    }
  }

  return (
    <VendorShell>
      <div className="max-w-2xl">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Add Product</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="bg-white border border-gray-100 rounded-2xl p-6 space-y-4">
          <Field label="Product Name" error={errors.name?.message}>
            <input {...register('name')} className="input" />
          </Field>
          <Field label="Description" error={errors.description?.message}>
            <textarea {...register('description')} rows={3} className="input" />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Price (₹)" error={errors.price?.message}>
              <input {...register('price')} type="number" step="0.01" className="input" />
            </Field>
            <Field label="Discounted Price (₹)" error={errors.discountedPrice?.message}>
              <input {...register('discountedPrice')} type="number" step="0.01" className="input" />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Category" error={errors.category?.message}>
              <select {...register('category')} className="input">
                <option value="">Select...</option>
                {SHOP_CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </Field>
            <Field label="Unit" error={errors.unit?.message}>
              <select {...register('unit')} className="input">
                {PRODUCT_UNITS.map((u) => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Stock" error={errors.stock?.message}>
              <input {...register('stock')} type="number" className="input" />
            </Field>
            <Field label="SKU (optional)" error={errors.sku?.message}>
              <input {...register('sku')} className="input" />
            </Field>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" {...register('isAvailable')} className="rounded" />
            Available for sale
          </label>
          <button type="submit" disabled={saving} className="w-full bg-emerald-600 text-white py-2.5 rounded-lg font-medium hover:bg-emerald-700 disabled:opacity-50">
            {saving ? 'Creating...' : 'Create Product'}
          </button>
        </form>
      </div>
      <style jsx global>{`
        .input { width: 100%; border: 1px solid #e5e7eb; border-radius: 0.5rem; padding: 0.5rem 0.75rem; font-size: 0.875rem; }
      `}</style>
    </VendorShell>
  )
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {children}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  )
}
