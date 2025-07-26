import { create } from "zustand"
import { supabase } from "@/lib/supabase"
import type { Store } from "@/lib/types"

export interface StoreFollow {
  id: string
  user_id: string
  store_id: string
  followed_at: string
}

interface FollowStoreState {
  stores: Store[]
  loading: boolean
  error: string | null
  fetchFollowedStores: (userId: string) => Promise<void>
  unfollowStore: (userId: string, storeId: string) => Promise<void>
}

export const useFollowStore = create<FollowStoreState>((set, get) => ({
  stores: [],
  loading: false,
  error: null,
  fetchFollowedStores: async (userId) => {
    set({ loading: true })
    // Join follows and stores
    const { data, error } = await supabase
      .from("followers")
      .select("store:store_id(*)")
      .eq("user_id", userId)
      .order("followed_at", { ascending: false })
    if (error) {
      set({ error: error.message, loading: false })
      return
    }
    // data is [{ store: { ...store fields } }, ...]
    set({ stores: data.map((row: any) => row.store), loading: false, error: null })
  },
  unfollowStore: async (userId, storeId) => {
    set({ loading: true })
    const { error } = await supabase
      .from("store_follows")
      .delete()
      .eq("user_id", userId)
      .eq("store_id", storeId)
    if (error) {
      set({ error: error.message, loading: false })
      throw error
    }
    // Remove from local state
    set({ stores: get().stores.filter((s) => s.id !== storeId), loading: false, error: null })
  },
})) 