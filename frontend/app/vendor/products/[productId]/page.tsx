'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import VendorShell from '@/components/vendor/VendorShell'
import ImageUpload from '@/components/vendor/ImageUpload'
import { productsApi } from '@/lib/api/products'
import { PRODUCT_UNITS, SHOP_CATEGORIES } from '@/lib/constants/vendor'
import type { Product } from '@/types'

const schema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  price: z.coerce.number().min(0.01),
  discountedPrice: z.coerce.number().min(0).optional(),
  category: z.string().min(1),
  stock: z.coerce.number().min(0),
  unit: z.string(),
  sku: z.string().optional(),
  isAvailable: z.boolean(),
})

type FormValues = z.infer<typeof schema>

export default function EditProductPage() {
  const { productId } = useParams<{ productId: string }>()
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema) as Resolver<FormValues>,
  })

  useEffect(() => {
    productsApi.getById(productId)
      .then((data) => {
        setProduct(data)
        reset({
          name: data.name,
          description: data.description ?? '',
          price: data.price,
          discountedPrice: data.discountedPrice ?? undefined,
          category: data.category,
          stock: data.stock,
          unit: data.unit,
          sku: data.sku ?? '',
          isAvailable: data.isAvailable,
        })
      })
      .catch(() => toast.error('Product not found'))
      .finally(() => setLoading(false))
  }, [productId, reset])

  const onSubmit = async (values: FormValues) => {
    setSaving(true)
    try {
      const updated = await productsApi.update(productId, {
        ...values,
        discountedPrice: values.discountedPrice || undefined,
        sku: values.sku || undefined,
      })
      setProduct(updated)
      toast.success('Product updated')
    } catch {
      toast.error('Failed to update product')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <VendorShell>
        <div className="text-gray-400 animate-pulse">Loading product...</div>
      </VendorShell>
    )
  }

  if (!product) {
    return (
      <VendorShell>
        <p className="text-gray-500">Product not found.</p>
      </VendorShell>
    )
  }

  return (
    <VendorShell>
      <div className="max-w-2xl">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Product</h1>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {product.images.map((url, i) => (
            <div key={url} className="relative group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="w-full h-24 object-cover rounded-lg border border-gray-100" />
              <button
                type="button"
                onClick={async () => {
                  const updated = await productsApi.removeImage(productId, i)
                  setProduct(updated)
                  toast.success('Image removed')
                }}
                className="absolute top-1 right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full opacity-0 group-hover:opacity-100"
              >
                ×
              </button>
            </div>
          ))}
          {product.images.length < 8 && (
            <ImageUpload
              label=""
              onUpload={async (file) => {
                const updated = await productsApi.uploadImage(productId, file)
                setProduct(updated)
                toast.success('Image uploaded')
              }}
            />
          )}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="bg-white border border-gray-100 rounded-2xl p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
            <input {...register('name')} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea {...register('description')} rows={3} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
              <input {...register('price')} type="number" step="0.01" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Discounted (₹)</label>
              <input {...register('discountedPrice')} type="number" step="0.01" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select {...register('category')} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm">
                {SHOP_CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
              <select {...register('unit')} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm">
                {PRODUCT_UNITS.map((u) => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
              <input {...register('stock')} type="number" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
              <input {...register('sku')} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" {...register('isAvailable')} className="rounded" />
            Available for sale
          </label>
          <div className="flex gap-3">
            <button type="submit" disabled={saving} className="flex-1 bg-emerald-600 text-white py-2.5 rounded-lg font-medium hover:bg-emerald-700 disabled:opacity-50">
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button type="button" onClick={() => router.push('/vendor/products')} className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm hover:bg-gray-50">
              Back
            </button>
          </div>
        </form>
      </div>
    </VendorShell>
  )
}
