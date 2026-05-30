'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import VendorShell from '@/components/vendor/VendorShell'
import { vendorApi } from '@/lib/api/shops'
import { productsApi } from '@/lib/api/products'
import { BULK_CSV_TEMPLATE } from '@/lib/constants/vendor'
import type { Product } from '@/types'

export default function VendorProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [hasShop, setHasShop] = useState(true)

  const load = () => {
    setLoading(true)
    vendorApi.getMyProducts(0, 50)
      .then((res) => setProducts(res.content))
      .catch((err) => {
        if (err?.response?.status === 404) setHasShop(false)
        else toast.error('Failed to load products')
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    Promise.all([
      vendorApi.getDashboard(),
      vendorApi.getMyProducts(0, 50),
    ])
      .then(([dashboard, res]) => {
        setHasShop(dashboard.hasShop)
        setProducts(res.content)
      })
      .catch(() => toast.error('Failed to load products'))
      .finally(() => setLoading(false))
  }, [])

  const toggleStock = async (product: Product) => {
    try {
      const updated = await productsApi.updateStock(
        product.id,
        product.stock,
        !product.isAvailable
      )
      setProducts((prev) => prev.map((p) => (p.id === product.id ? updated : p)))
    } catch {
      toast.error('Failed to update availability')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product?')) return
    try {
      await productsApi.delete(id)
      setProducts((prev) => prev.filter((p) => p.id !== id))
      toast.success('Product deleted')
    } catch {
      toast.error('Failed to delete product')
    }
  }

  const handleBulkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const created = await productsApi.bulkImport(file)
      toast.success(`${created.length} products imported`)
      load()
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(msg ?? 'Bulk import failed')
    }
    e.target.value = ''
  }

  const downloadTemplate = () => {
    const blob = new Blob([BULK_CSV_TEMPLATE], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'locafy-products-template.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <VendorShell>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-500 text-sm">Manage your shop catalog</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={downloadTemplate} className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">
            CSV Template
          </button>
          <label className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
            Bulk Upload
            <input type="file" accept=".csv" className="hidden" onChange={handleBulkUpload} />
          </label>
          <Link href="/vendor/products/new" className="px-4 py-2 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">
            + Add Product
          </Link>
        </div>
      </div>

      {!hasShop && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
          <p className="text-amber-800 mb-3">Create your shop before adding products.</p>
          <Link href="/vendor/shop" className="text-emerald-600 font-medium hover:underline">Go to Shop Profile →</Link>
        </div>
      )}

      {loading ? (
        <div className="text-gray-400 animate-pulse">Loading products...</div>
      ) : products.length === 0 && hasShop ? (
        <div className="bg-white border border-gray-100 rounded-xl p-12 text-center">
          <p className="text-gray-500 mb-4">No products yet.</p>
          <Link href="/vendor/products/new" className="text-emerald-600 font-medium hover:underline">Add your first product →</Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product) => (
            <div key={product.id} className="bg-white border border-gray-100 rounded-xl overflow-hidden">
              <div className="h-36 bg-gray-100 relative">
                {product.images[0] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-3xl">📦</div>
                )}
                <span className={`absolute top-2 right-2 text-xs px-2 py-0.5 rounded-full ${
                  product.isAvailable ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200 text-gray-600'
                }`}>
                  {product.isAvailable ? 'In stock' : 'Out of stock'}
                </span>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 truncate">{product.name}</h3>
                <p className="text-emerald-600 font-bold mt-1">₹{product.price}</p>
                <p className="text-xs text-gray-400 mt-1">Stock: {product.stock} · {product.category}</p>
                <div className="flex gap-2 mt-4">
                  <Link href={`/vendor/products/${product.id}`} className="flex-1 text-center text-xs py-2 border border-gray-200 rounded-lg hover:bg-gray-50">
                    Edit
                  </Link>
                  <button type="button" onClick={() => toggleStock(product)} className="flex-1 text-xs py-2 border border-gray-200 rounded-lg hover:bg-gray-50">
                    Toggle stock
                  </button>
                  <button type="button" onClick={() => handleDelete(product.id)} className="text-xs py-2 px-3 text-red-500 border border-red-100 rounded-lg hover:bg-red-50">
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </VendorShell>
  )
}
