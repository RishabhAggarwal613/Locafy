'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import VendorShell from '@/components/vendor/VendorShell'
import ImageUpload from '@/components/vendor/ImageUpload'
import { shopsApi, vendorApi } from '@/lib/api/shops'
import { SHOP_CATEGORIES } from '@/lib/constants/vendor'
import type { Shop } from '@/types'

const schema = z.object({
  name: z.string().min(2, 'Shop name required'),
  description: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  categories: z.array(z.string()).min(1, 'Select at least one category'),
  line1: z.string().min(3, 'Address required'),
  city: z.string().min(2),
  state: z.string().min(2),
  pincode: z.string().regex(/^\d{6}$/, '6-digit pincode required'),
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  deliveryAvailable: z.boolean(),
  pickupAvailable: z.boolean(),
  minOrderAmount: z.coerce.number().min(0).optional(),
  deliveryRadius: z.coerce.number().min(0.5).max(20).optional(),
})

type FormValues = z.infer<typeof schema>

export default function VendorShopPage() {
  const [shop, setShop] = useState<Shop | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const isEdit = !!shop

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      categories: [],
      deliveryAvailable: true,
      pickupAvailable: true,
      deliveryRadius: 3,
      latitude: 28.6139,
      longitude: 77.2090,
    },
  })

  const selectedCategories = watch('categories')

  useEffect(() => {
    vendorApi.getMyShop()
      .then((data) => {
        setShop(data)
        setValue('name', data.name)
        setValue('description', data.description ?? '')
        setValue('phone', data.phone ?? '')
        setValue('email', '')
        setValue('categories', data.categories ?? [])
        setValue('line1', data.address?.line1 ?? '')
        setValue('city', data.address?.city ?? '')
        setValue('state', data.address?.state ?? '')
        setValue('pincode', data.address?.pincode ?? '')
        setValue('latitude', data.location?.coordinates[1] ?? 28.6139)
        setValue('longitude', data.location?.coordinates[0] ?? 77.2090)
        setValue('deliveryAvailable', data.deliveryAvailable)
        setValue('pickupAvailable', data.pickupAvailable)
        setValue('minOrderAmount', data.minOrderAmount ?? 0)
        setValue('deliveryRadius', data.deliveryRadius ?? 3)
      })
      .catch(() => setShop(null))
      .finally(() => setLoading(false))
  }, [setValue])

  const toggleCategory = (cat: string) => {
    const next = selectedCategories.includes(cat)
      ? selectedCategories.filter((c) => c !== cat)
      : [...selectedCategories, cat]
    setValue('categories', next, { shouldValidate: true })
  }

  const detectLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation not supported')
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setValue('latitude', pos.coords.latitude)
        setValue('longitude', pos.coords.longitude)
        toast.success('Location detected')
      },
      () => toast.error('Could not detect location')
    )
  }

  const onSubmit = async (values: FormValues) => {
    setSaving(true)
    try {
      const payload = {
        name: values.name,
        description: values.description,
        phone: values.phone,
        email: values.email || undefined,
        categories: values.categories,
        address: {
          line1: values.line1,
          city: values.city,
          state: values.state,
          pincode: values.pincode,
        },
        latitude: values.latitude,
        longitude: values.longitude,
        deliveryAvailable: values.deliveryAvailable,
        pickupAvailable: values.pickupAvailable,
        minOrderAmount: values.minOrderAmount,
        deliveryRadius: values.deliveryRadius,
      }

      const saved = isEdit && shop
        ? await shopsApi.update(shop.id, payload)
        : await shopsApi.create(payload)

      setShop(saved)
      toast.success(isEdit ? 'Shop updated' : 'Shop created!')
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(msg ?? 'Failed to save shop')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <VendorShell>
        <div className="animate-pulse text-gray-400">Loading shop profile...</div>
      </VendorShell>
    )
  }

  return (
    <VendorShell>
      <div className="max-w-3xl">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">
          {isEdit ? 'Shop Profile' : 'Create Your Shop'}
        </h1>
        <p className="text-gray-500 mb-8">
          {isEdit ? 'Update your shop details and location.' : 'Set up your shop to start listing products.'}
        </p>

        {shop && (
          <div className="grid md:grid-cols-2 gap-4 mb-8">
            <ImageUpload
              label="Cover Photo"
              currentUrl={shop.coverImageUrl}
              onUpload={async (file) => {
                const updated = await shopsApi.uploadCover(shop.id, file)
                setShop(updated)
                toast.success('Cover updated')
              }}
            />
            <ImageUpload
              label="Shop Logo"
              currentUrl={shop.logoUrl}
              onUpload={async (file) => {
                const updated = await shopsApi.uploadLogo(shop.id, file)
                setShop(updated)
                toast.success('Logo updated')
              }}
            />
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white rounded-2xl border border-gray-100 p-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Shop Name</label>
            <input {...register('name')} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea {...register('description')} rows={3} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Categories</label>
            <div className="flex flex-wrap gap-2">
              {SHOP_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => toggleCategory(cat)}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                    selectedCategories.includes(cat)
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-emerald-300'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            {errors.categories && <p className="text-red-500 text-xs mt-1">{errors.categories.message}</p>}
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input {...register('phone')} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input {...register('email')} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address Line</label>
            <input {...register('line1')} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
            {errors.line1 && <p className="text-red-500 text-xs mt-1">{errors.line1.message}</p>}
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <input {...register('city')} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
              <input {...register('state')} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
              <input {...register('pincode')} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
              {errors.pincode && <p className="text-red-500 text-xs mt-1">{errors.pincode.message}</p>}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">Shop Location (pin on map)</label>
              <button type="button" onClick={detectLocation} className="text-xs text-emerald-600 hover:underline">
                Use my location
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-500">Latitude</label>
                <input {...register('latitude')} type="number" step="any" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-xs text-gray-500">Longitude</label>
                <input {...register('longitude')} type="number" step="any" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-2">Customers discover your shop by distance from this point.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" {...register('deliveryAvailable')} className="rounded" />
              Delivery available
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" {...register('pickupAvailable')} className="rounded" />
              Pickup available
            </label>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min order (₹)</label>
              <input {...register('minOrderAmount')} type="number" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Delivery radius (km)</label>
              <input {...register('deliveryRadius')} type="number" step="0.5" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-emerald-600 text-white py-2.5 rounded-lg font-medium hover:bg-emerald-700 disabled:opacity-50 transition-colors"
          >
            {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Shop'}
          </button>
        </form>
      </div>
    </VendorShell>
  )
}
