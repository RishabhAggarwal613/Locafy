import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartItem {
  productId: string
  productName: string
  productImage: string
  unitPrice: number
  quantity: number
}

interface CartState {
  shopId: string | null
  shopName: string | null
  items: CartItem[]
  addItem: (shopId: string, shopName: string, item: CartItem) => void
  updateQuantity: (productId: string, quantity: number) => void
  removeItem: (productId: string) => void
  clearCart: () => void
  total: () => number
  itemCount: () => number
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      shopId: null,
      shopName: null,
      items: [],

      addItem: (shopId, shopName, item) => {
        const state = get()
        // If adding from a different shop, clear cart first
        if (state.shopId && state.shopId !== shopId) {
          set({ shopId, shopName, items: [item] })
          return
        }
        const existing = state.items.find((i) => i.productId === item.productId)
        if (existing) {
          set({
            items: state.items.map((i) =>
              i.productId === item.productId
                ? { ...i, quantity: i.quantity + item.quantity }
                : i
            ),
          })
        } else {
          set({ shopId, shopName, items: [...state.items, item] })
        }
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId)
          return
        }
        set({ items: get().items.map((i) => (i.productId === productId ? { ...i, quantity } : i)) })
      },

      removeItem: (productId) => {
        const items = get().items.filter((i) => i.productId !== productId)
        set({ items, ...(items.length === 0 ? { shopId: null, shopName: null } : {}) })
      },

      clearCart: () => set({ items: [], shopId: null, shopName: null }),

      total: () => get().items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0),
      itemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    { name: 'locafy-cart' }
  )
)
