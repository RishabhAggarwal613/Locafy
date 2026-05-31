import Link from 'next/link'
import type { ShopListItem } from '@/types'

export default function ShopCard({ shop }: { shop: ShopListItem }) {
  return (
    <Link
      href={`/customer/shops/${shop.id}`}
      className="block bg-white border border-gray-100 rounded-xl overflow-hidden hover:shadow-md transition-shadow"
    >
      <div className="h-32 bg-gray-100 relative">
        {shop.coverImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={shop.coverImageUrl} alt={shop.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-3xl bg-indigo-50">🏪</div>
        )}
        <span className={`absolute top-2 right-2 text-xs px-2 py-0.5 rounded-full ${
          shop.isOpen ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200 text-gray-600'
        }`}>
          {shop.isOpen ? 'Open' : 'Closed'}
        </span>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 truncate">{shop.name}</h3>
        <div className="flex flex-wrap gap-1 mt-2">
          {shop.categories?.slice(0, 2).map((c) => (
            <span key={c} className="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">{c}</span>
          ))}
        </div>
        <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
          <span>⭐ {shop.rating?.toFixed(1) ?? '0.0'} ({shop.reviewCount ?? 0})</span>
          {shop.distanceKm != null && <span>{shop.distanceKm} km</span>}
        </div>
        {shop.deliveryAvailable && (
          <span className="inline-block mt-2 text-[10px] text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">Delivery</span>
        )}
      </div>
    </Link>
  )
}
