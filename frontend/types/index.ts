export type UserRole = 'CUSTOMER' | 'VENDOR' | 'DELIVERY' | 'ADMIN'
export type AuthProvider = 'EMAIL' | 'GOOGLE' | 'BOTH'
export type OrderStatus =
  | 'PLACED' | 'CONFIRMED' | 'PREPARING' | 'READY'
  | 'PICKED_UP' | 'OUT_FOR_DELIVERY' | 'DELIVERED'
  | 'CANCELLED' | 'REFUNDED'
export type FulfillmentType = 'DELIVERY' | 'PICKUP'
export type PaymentMethod = 'COD' | 'RAZORPAY'
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED'

export interface GeoPoint {
  type: 'Point'
  coordinates: [number, number] // [lng, lat]
}

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  phone?: string
  avatarUrl?: string
  isVerified: boolean
  isActive: boolean
  locality?: Locality
  savedAddresses?: SavedAddress[]
  createdAt: string
}

export interface Locality {
  name: string
  city: string
  state: string
  pincode: string
  coordinates?: GeoPoint
}

export interface SavedAddress {
  id: string
  label: string
  line1: string
  line2?: string
  city: string
  pincode: string
  coordinates?: GeoPoint
}

export interface Shop {
  id: string
  ownerId: string
  name: string
  slug: string
  description: string
  coverImageUrl?: string
  logoUrl?: string
  phone?: string
  categories: string[]
  address: ShopAddress
  location: GeoPoint
  rating: number
  reviewCount: number
  isOpen: boolean
  isActive: boolean
  isVerified: boolean
  deliveryAvailable: boolean
  pickupAvailable: boolean
  minOrderAmount?: number
  deliveryRadius?: number
  distance?: number
  distanceKm?: number
}

export interface ShopListItem extends Shop {
  distanceKm?: number
}

export interface ShopPageResponse {
  content: ShopListItem[]
  totalElements: number
  page: number
  size: number
  hasMore: boolean
}

export interface ShopAddress {
  line1: string
  city: string
  state: string
  pincode: string
}

export interface Product {
  id: string
  shopId: string
  name: string
  description: string
  price: number
  discountedPrice?: number
  images: string[]
  category: string
  stock: number
  isAvailable: boolean
  unit: string
  sku?: string
  rating: number
  reviewCount: number
}

export interface Order {
  id: string
  orderNumber: string
  customerId: string
  shopId: string
  shopName: string
  items: OrderItem[]
  subtotal: number
  deliveryFee: number
  platformFee?: number
  total: number
  fulfillmentType: FulfillmentType
  status: OrderStatus
  paymentMethod: PaymentMethod
  paymentStatus: PaymentStatus
  deliveryPartnerId?: string
  deliveryAddress?: {
    label?: string
    line1: string
    line2?: string
    city: string
    pincode: string
    latitude?: number
    longitude?: number
  }
  statusHistory: StatusHistoryEntry[]
  createdAt: string
}

export interface OrderItem {
  productId: string
  productName: string
  productImage: string
  quantity: number
  unitPrice: number
  totalPrice: number
}

export interface StatusHistoryEntry {
  status: OrderStatus
  timestamp: string
  note?: string
}

export interface Reel {
  id: string
  vendorId: string
  shopId: string
  shopName: string
  shopLogoUrl?: string
  productId?: string
  productName?: string
  productPrice?: number
  title?: string
  description?: string
  videoUrl: string
  thumbnailUrl: string
  duration: number
  likes: number
  saves: number
  views: number
  isLiked?: boolean
  isSaved?: boolean
  distance?: number
}

export interface ApiResponse<T> {
  data: T
  message?: string
}

export interface PageResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  page: number
  size: number
  hasMore: boolean
}
