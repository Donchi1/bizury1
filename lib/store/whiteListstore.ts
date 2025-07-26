
/* -------------------------------------------------------------------------- */
/*                            WISHLIST - ZUSTAND                              */

import { create } from "zustand"
import { persist } from "zustand/middleware"
import { Product } from "../types"

/* -------------------------------------------------------------------------- */
interface WishlistItem {
    id: string
    product_id: string
    user_id: string
    created_at: string
    product: Product
  }
  
  interface WishlistState {
    items: WishlistItem[]
    addToWishlist: (product: Product) => void
    removeFromWishlist: (productId: string) => void
    isInWishlist: (productId: string) => boolean
    clearWishlist: () => void
    getWishlistCount: () => number
  }
  
  export const useWishlistStore = create<WishlistState>()(
    persist(
      (set, get) => ({
        items: [],
        addToWishlist: (product) => {
          const existing = get().items.find((i) => i.product_id === product.asin)
          if (!existing) {
            const newItem: WishlistItem = {
              id: `wishlist-${Date.now()}`,
              product_id: product.asin || `product-${Date.now()}`,
              user_id: "",
              created_at: new Date().toISOString(),
              product,
            }
            set({ items: [...get().items, newItem] })
          }
        },
        removeFromWishlist: (productId) => {
          set({ items: get().items.filter((i) => i.product_id !== productId) })
        },
        isInWishlist: (productId) => {
          return get().items.some((i) => i.product_id === productId)
        },
        clearWishlist: () => set({ items: [] }),
        getWishlistCount: () => get().items.length,
      }),
      { name: "wishlist-storage" },
    ),
  )