import { create } from "zustand"
import { supabase } from "@/lib/supabase"
import type { Product } from "@/lib/types"
import { mockApi } from "@/lib/mock-data" // or import { mockProducts } from "@/lib/mock-data"

export interface BrowsingHistoryItem {
  id: string
  user_id: string
  product_id: string
  viewed_at: string
  view_count: number
  product: Product | null
}

interface BrowsingHistoryState {
  history: BrowsingHistoryItem[]
  loading: boolean
  error: string | null
  fetchBrowsingHistory: (userId: string) => Promise<void>
  removeFromHistory: (id: string) => Promise<void>
  clearHistory: (userId: string) => Promise<void>
  addToHistory: (userId: string, product: Product) => Promise<void>
}

export const useBrowsingHistoryStore = create<BrowsingHistoryState>((set, get) => ({
  history: [],
  loading: false,
  error: null,

  fetchBrowsingHistory: async (userId) => {
    set({ loading: true, error: null })
    const { data, error } = await supabase
      .from("browsing_history")
      .select()
      .eq("user_id", userId)
      .order("viewed_at", { ascending: false })
    if (error) {
      set({ error: error.message, loading: false })
      return
    }

    // If using mockApi:
    const products = await mockApi.getProducts()
    // If using mockProducts array:
    // const products = mockProducts

    // Attach product details to each history item
    const historyWithProducts = (data || []).map((item) => ({
      ...item,
      product: products.find((p) => p.asin === item.product_id) || null,
    }))

    set({ history: historyWithProducts, loading: false })
  },

  removeFromHistory: async (id) => {
    set({ loading: true })
    await supabase.from("browsing_history").delete().eq("id", id)
    set({ history: get().history.filter(h => h.id !== id), loading: false })
  },

  clearHistory: async (userId) => {
    set({ loading: true })
    await supabase.from("browsing_history").delete().eq("user_id", userId)
    set({ history: [], loading: false })
  },

  addToHistory: async (userId, product) => {

    if (!userId || !product?.asin) return;

    set({ loading: true })
    // Upsert: if exists, increment view_count and update viewed_at; else insert new
    const { data: existing, error: fetchError } = await supabase
      .from("browsing_history")
      .select("id, view_count")
      .eq("user_id", userId)
      .eq("product_id", product.asin)
      .single();

      //console.log("here is the fetched error",fetchError)
    if (fetchError && fetchError.code !== "PGRST116") {
      set({ loading: false, error: fetchError.message })
      return;
    }
    if (existing) {
      //Update view_count and viewed_at
      await supabase
        .from("browsing_history")
        .update({
          view_count: (existing.view_count || 0) + 1,
          viewed_at: new Date().toISOString(),
        })
        .eq("id", existing.id);
   } else {
      // Insert new
      const { error: insertError, data: insertData } = await supabase.from("browsing_history").insert({
        user_id: userId,
        product_id: product.asin,
        product_title: product.title,
        product_image_url: product.image_url,
        product_category: product.categories?.[0],
        viewed_at: new Date().toISOString(),
        view_count: 1,
      });
       if(insertError) throw insertError
   }
    // Optionally refresh history
    await get().fetchBrowsingHistory(userId);
    set({ loading: false })
  },
})) 