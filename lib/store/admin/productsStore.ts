import { create } from "zustand"
import { supabase } from "@/lib/supabase"
import { Product, Store } from "@/lib/types"


export interface ProductWithStore extends Product {
    store: Store
    created_at: string
    updated_at: string
}
  


interface ProductsStore {
  products: ProductWithStore[]
  isLoading: boolean
  error: string | null
  fetchProducts: () => Promise<ProductWithStore[]>
  getProductById: (id: string) => Product | undefined
  createProduct: (product: Omit<ProductWithStore, 'id' | 'created_at' | 'updated_at'>) => Promise<void>
  updateProduct: (id: string, updates: Partial<Omit<Product, 'id' | 'created_at'>>) => Promise<void>
  deleteProduct: (id: string) => Promise<void>
  bulkUpdateStatus: (ids: string[], { availability}: { availability: Product["availability"]}) => Promise<void>
}

export const useAdminProductsStore = create<ProductsStore>((set, get) => ({
  products: [],
  isLoading: false,
  error: null,

  fetchProducts: async () => {
    set({ isLoading: true, error: null })
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*, store:stores(*)')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      set({ products: data as ProductWithStore[] || [] })
      return data as ProductWithStore[] || []
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch products'
      set({ error: message })
      throw error
    } finally {
      set({ isLoading: false })
    }
  },

  getProductById: (id) => {
    return get().products.find((p) => p.id === id)
  },

  createProduct: async (product) => {
    set({ isLoading: true, error: null })
    try {
      const newProduct = {
        ...product,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      const {  error } = await supabase
        .from('products')
        .insert(newProduct)

      if (error) throw error
      
      await get().fetchProducts()
      set({ isLoading: false })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create product'
      set({ error: message })
      throw error
    } finally {
      set({ isLoading: false })
    }
  },

  updateProduct: async (id, updates) => {
    set({ isLoading: true, error: null })
    try {
      // If stock is being updated, update status accordingly


      const { data, error } = await supabase
        .from('products')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      set((state) => ({
        products: state.products.map((p) => (p.id === id ? { ...p, ...data } : p))
      }))
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update product'
      set({ error: message })
      throw error
    } finally {
      set({ isLoading: false })
    }
  },

  deleteProduct: async (id) => {
    set({ isLoading: true, error: null })
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id)

      if (error) throw error

      set((state) => ({
        products: state.products.filter((p) => p.id !== id)
      }))
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete product'
      set({ error: message })
      throw error
    } finally {
      set({ isLoading: false })
    }
  },

  bulkUpdateStatus: async (ids, updates) => {
    set({ isLoading: true, error: null })
    try {
      const { error } = await supabase
        .from('products')
        .update({...updates , updated_at: new Date().toISOString() })
        .in('id', ids)

      if (error) throw error

      set((state) => ({
        products: state.products.map((p) =>
          ids.includes(p.id!) ? { ...p, ...updates } : p
        )
      }))
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update products status'
      set({ error: message })
      throw error
    } finally {
      set({ isLoading: false })
    }
  },
}))

// Helper function to get filtered products
export const getFilteredProducts = (
    products: ProductWithStore[], 
    filters: { search?: string; category?: string; status?: string }
  ) => {
    return products.filter((product) => {
      // Search filter - skip if no search term or if search term is in title/description
      const matchesSearch = !filters.search || 
        product.title?.toLowerCase().includes(filters.search.toLowerCase().trim()) ||
        product.description?.toLowerCase().includes(filters.search.toLowerCase().trim());
      
      // Category filter - skip if no category filter or if category is "all"
      const matchesCategory = !filters.category || 
        filters.category.toLowerCase() === 'all' ||
        (product.categories?.[0]?.toLowerCase().trim() === filters.category.toLowerCase().trim());
      
      // Status filter - skip if no status filter or if status is "all"
      const matchesStatus = !filters.status || 
        filters.status.toLowerCase() === 'all' ||
        (product.availability?.toLowerCase().trim() === filters.status.toLowerCase().trim());
      
      return matchesSearch && matchesStatus && matchesCategory;
    });
  }