import Link from 'next/link'
import type { ProductSearchItem } from '@/lib/api/search'

export default function ProductCard({ product }: { product: ProductSearchItem }) {
  const price = product.discountedPrice ?? product.price
  return (
    <Link
      href={`/customer/products/${product.id}`}
      className="block bg-white border border-gray-100 rounded-xl overflow-hidden hover:shadow-md transition-shadow min-w-[160px]"
    >
      <div className="h-28 bg-gray-100">
        {product.images?.[0] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>
        )}
      </div>
      <div className="p-3">
        <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
        <p className="text-xs text-gray-400 truncate mt-0.5">{product.shopName}</p>
        <p className="text-sm font-bold text-indigo-600 mt-1">₹{price}</p>
      </div>
    </Link>
  )
}
