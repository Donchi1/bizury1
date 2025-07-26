/* -------------------------------------------------------------------------- */
/*                              CART - ZUSTAND                                */

import { create } from "zustand"
import { CartItem, Product } from "../types"
import { persist } from "zustand/middleware"
import { useAuthStore } from "./auth"

/* -------------------------------------------------------------------------- */
interface CartState {
    items: CartItem[]
    isOpen: boolean
    addItem: (product: Product, quantity?: number) => void
    removeItem: (itemId: string) => void
    updateQuantity: (itemId: string, quantity: number) => void
    clearCart: () => void
    setOpen: (open: boolean) => void
    getTotalItems: () => number
    getTotalPrice: () => number
  }
  
  export const useCartStore = create<CartState>()(
    persist(
      (set, get) => ({
        items: [],
        isOpen: false,
        addItem: (product, quantity = 1) => {
          const existing = get().items.find((i) => i.asin === product.asin)
  
          if (existing) {
            set({
              items: get().items.map((i) =>
                i.product_id === product.asin ? { ...i, quantity: i.quantity + quantity } : i,
              ),
            })
          } else {
            const newItem: CartItem = {
              id: `temp-${Date.now()}`,
              user_id: useAuthStore.getState().user?.id!,
              product_id: product.asin || `product-${Date.now()}`,
              asin: product.asin,
              quantity,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              product: product,
            }
            set({ items: [...get().items, newItem] })
          }
        },
        removeItem: (itemId) => set({ items: get().items.filter((i) => i.id !== itemId) }),
        updateQuantity: (itemId, quantity) => {
          if (quantity <= 0) {
            get().removeItem(itemId)
            return
          }
          set({
            items: get().items.map((i) => (i.id === itemId ? { ...i, quantity } : i)),
          })
        },
        clearCart: () => set({ items: [] }),
        setOpen: (open) => set({ isOpen: open }),
        getTotalItems: () => get().items.reduce((t, i) => t + i.quantity, 0),
        getTotalPrice: () =>
          get().items.reduce((t, i) => {
            const price = i.product?.final_price || i.product?.initial_price || 0
            return t + price * i.quantity
          }, 0),
      }),
      { name: "cart-storage" },
    ),
  )
  